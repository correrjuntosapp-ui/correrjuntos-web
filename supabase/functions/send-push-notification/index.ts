import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── CORS: restrict to known origins ──
const ALLOWED_ORIGINS = [
  'https://correrjuntos.com',
  'https://www.correrjuntos.com',
  'http://localhost:3000',
  'http://localhost:5173',
]

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

// ── Auth: verify caller is authenticated (JWT or service role) ──
async function verifyAuth(req: Request): Promise<{ authorized: boolean; userId?: string }> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { authorized: false }
  }

  const token = authHeader.replace('Bearer ', '')

  // Check if it's the service role key (server-to-server calls)
  const serviceRoleKey = (Deno.env.get('SERVICE_ROLE_KEY_NEW') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
  if (token === serviceRoleKey) {
    return { authorized: true, userId: 'service' }
  }

  // Otherwise verify as user JWT
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY') || (Deno.env.get('SERVICE_ROLE_KEY_NEW') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))!
  const supabase = createClient(supabaseUrl, supabaseAnon)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return { authorized: false }
  }

  return { authorized: true, userId: user.id }
}

/**
 * Envía notificaciones push a:
 * - App móvil (Expo Push Notifications) - tokens que empiezan con "ExponentPushToken"
 * - Web (Web Push Protocol) - endpoints de suscripción
 *
 * Tipos de notificación:
 * - nueva_quedada: Nueva quedada en la ciudad del usuario
 * - participante_se_une: Alguien se unió a tu quedada
 * - recordatorio_24h: Recordatorio 24h antes
 * - recordatorio_1h: Recordatorio 1h antes
 * - quedada_cancelada: Una quedada fue cancelada
 */

interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: {
    url?: string
    quedada_id?: string
    tipo?: string
  }
}

interface WebSubscription {
  endpoint: string
  p256dh: string
  auth: string
}

// Enviar notificación via Expo Push API (para app móvil)
async function sendExpoPush(pushToken: string, payload: PushPayload): Promise<boolean> {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: 'default',
        badge: 1,
      }),
    })

    const result = await response.json()

    if (!response.ok || result.data?.[0]?.status === 'error') {
      console.log(`Expo Push falló para ${pushToken.substring(0, 30)}...:`, result.data?.[0]?.message || response.status)
      return false
    }

    return true
  } catch (error) {
    console.error('Error enviando Expo Push:', error)
    return false
  }
}

// ── Web Push helpers (RFC 8291 + RFC 8292 VAPID) ──

function base64UrlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str + '='.repeat((4 - str.length % 4) % 4)
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const a of arrays) { result.set(a, offset); offset += a.length }
  return result
}

// VAPID JWT (RFC 8292) — signed with ES256 (P-256 + SHA-256)
async function createVapidJwt(endpoint: string, vapidPrivateKeyB64: string): Promise<{ authorization: string; cryptoKey: string }> {
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:info@correrjuntos.com'
  const vapidPublicKeyB64 = Deno.env.get('VAPID_PUBLIC_KEY')!

  const audience = new URL(endpoint).origin
  const now = Math.floor(Date.now() / 1000)

  // JWT header + claims
  const header = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const claims = base64UrlEncode(new TextEncoder().encode(JSON.stringify({
    aud: audience,
    exp: now + 43200, // 12 hours
    sub: vapidSubject,
  })))

  const unsignedToken = `${header}.${claims}`

  // Import VAPID private key (raw 32-byte P-256 scalar)
  const rawKey = base64UrlDecode(vapidPrivateKeyB64)
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', d: base64UrlEncode(rawKey), x: '', y: '' },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  ).catch(async () => {
    // Fallback: try importing the full public+private JWK
    // Derive x,y from the public key
    const pubBytes = base64UrlDecode(vapidPublicKeyB64)
    // Uncompressed P-256 public key is 65 bytes: 0x04 || x (32) || y (32)
    const x = base64UrlEncode(pubBytes.slice(1, 33))
    const y = base64UrlEncode(pubBytes.slice(33, 65))
    const d = base64UrlEncode(rawKey)
    return crypto.subtle.importKey(
      'jwk',
      { kty: 'EC', crv: 'P-256', x, y, d },
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    )
  })

  // Sign
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  )

  // Convert DER signature to raw r||s (64 bytes) for JWT
  const sigBytes = new Uint8Array(signature)
  let jwt: string
  if (sigBytes.length === 64) {
    jwt = `${unsignedToken}.${base64UrlEncode(sigBytes)}`
  } else {
    // Web Crypto returns IEEE P1363 (raw 64 bytes) on most platforms,
    // but just in case, handle it
    jwt = `${unsignedToken}.${base64UrlEncode(sigBytes)}`
  }

  return {
    authorization: `vapid t=${jwt}, k=${vapidPublicKeyB64}`,
    cryptoKey: `p256ecdsa=${vapidPublicKeyB64}`,
  }
}

// HKDF-SHA-256 (RFC 5869)
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ikm, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const prk = new Uint8Array(await crypto.subtle.sign('HMAC', key, salt.length > 0 ? salt : new Uint8Array(32)))

  // Actually RFC 5869: PRK = HMAC(salt, IKM), then expand
  const prkKey = await crypto.subtle.importKey('raw', salt.length > 0 ? salt : new Uint8Array(32), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const extractedPrk = new Uint8Array(await crypto.subtle.sign('HMAC', prkKey, ikm))

  const expandKey = await crypto.subtle.importKey('raw', extractedPrk, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const infoWithCounter = concat(info, new Uint8Array([1]))
  const okm = new Uint8Array(await crypto.subtle.sign('HMAC', expandKey, infoWithCounter))

  return okm.slice(0, length)
}

// Web Push payload encryption (RFC 8291 — aes128gcm)
async function encryptPayload(
  clientPublicKeyB64: string,
  clientAuthB64: string,
  payloadText: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const clientPublicKeyRaw = base64UrlDecode(clientPublicKeyB64)
  const clientAuth = base64UrlDecode(clientAuthB64)
  const payload = new TextEncoder().encode(payloadText)

  // Generate ephemeral ECDH key pair for this message
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  )

  // Export server public key (uncompressed 65 bytes)
  const serverPublicKeyRaw = new Uint8Array(await crypto.subtle.exportKey('raw', serverKeyPair.publicKey))

  // Import client public key
  const clientKey = await crypto.subtle.importKey(
    'raw',
    clientPublicKeyRaw,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  )

  // ECDH shared secret
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'ECDH', public: clientKey },
    serverKeyPair.privateKey,
    256
  ))

  // Generate 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // RFC 8291 key derivation
  const encoder = new TextEncoder()

  // IKM from auth secret: HKDF(auth, shared_secret, "WebPush: info" || 0x00 || client_pub || server_pub, 32)
  const keyInfoHeader = encoder.encode('WebPush: info\0')
  const keyInfo = concat(keyInfoHeader, clientPublicKeyRaw, serverPublicKeyRaw)
  const ikm = await hkdf(clientAuth, sharedSecret, keyInfo, 32)

  // Content encryption key: HKDF(salt, ikm, "Content-Encoding: aes128gcm" || 0x00, 16)
  const cekInfo = concat(encoder.encode('Content-Encoding: aes128gcm\0'))
  const contentEncryptionKey = await hkdf(salt, ikm, cekInfo, 16)

  // Nonce: HKDF(salt, ikm, "Content-Encoding: nonce" || 0x00, 12)
  const nonceInfo = concat(encoder.encode('Content-Encoding: nonce\0'))
  const nonce = await hkdf(salt, ikm, nonceInfo, 12)

  // Pad payload (add delimiter byte 0x02 for final record)
  const paddedPayload = concat(payload, new Uint8Array([2]))

  // AES-128-GCM encrypt
  const aesKey = await crypto.subtle.importKey('raw', contentEncryptionKey, { name: 'AES-GCM' }, false, ['encrypt'])
  const encrypted = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    aesKey,
    paddedPayload
  ))

  // Build aes128gcm header: salt (16) || rs (4, big-endian uint32) || idlen (1) || keyid (65)
  const rs = new DataView(new ArrayBuffer(4))
  rs.setUint32(0, 4096, false) // record size
  const header = concat(
    salt,
    new Uint8Array(rs.buffer),
    new Uint8Array([serverPublicKeyRaw.length]),
    serverPublicKeyRaw
  )

  return {
    ciphertext: concat(header, encrypted),
    salt,
    serverPublicKey: serverPublicKeyRaw,
  }
}

// Enviar notificación via Web Push (RFC 8030 + RFC 8291 + RFC 8292)
async function sendWebPush(subscription: WebSubscription, payload: PushPayload): Promise<boolean> {
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')

  if (!vapidPrivateKey || !vapidPublicKey) {
    console.error('Web Push: VAPID keys not configured (set VAPID_PRIVATE_KEY + VAPID_PUBLIC_KEY)')
    return false
  }

  try {
    // 1. Create VAPID authorization header
    const vapid = await createVapidJwt(subscription.endpoint, vapidPrivateKey)

    // 2. Encrypt payload
    const payloadText = JSON.stringify(payload)
    const { ciphertext } = await encryptPayload(
      subscription.p256dh,
      subscription.auth,
      payloadText
    )

    // 3. Send to push service
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': vapid.authorization,
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(ciphertext.length),
        'TTL': '86400',
        'Urgency': 'normal',
      },
      body: ciphertext,
    })

    if (response.status === 201 || response.status === 200) {
      return true
    }

    const body = await response.text().catch(() => '')
    console.log(`Web Push falló para ${subscription.endpoint}: ${response.status} ${body}`)

    // 410 Gone = subscription expired, should be cleaned up
    if (response.status === 410 || response.status === 404) {
      console.log('Subscription expired, should remove from DB')
    }

    return false
  } catch (error) {
    console.error('Error enviando Web Push:', error)
    return false
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // ── Auth check ──
  const auth = await verifyAuth(req)
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = (Deno.env.get('SERVICE_ROLE_KEY_NEW') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const body = await req.json()
    const {
      // Modo legacy (web)
      tipo,
      user_ids,
      quedada_id,
      titulo,
      cuerpo,
      exclude_user_id,
      // Modo directo (app móvil)
      targetUserId,
      title,
      body: notifBody,
      data
    } = body

    // Determinar si es modo directo (app) o modo broadcast (web)
    const isDirectMode = !!targetUserId

    if (isDirectMode) {
      // ===== MODO DIRECTO: Enviar a un usuario específico (desde la app) =====
      console.log(`Enviando notificación directa a usuario: ${targetUserId}`)

      // Obtener push token del usuario destino
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('push_token')
        .eq('id', targetUserId)
        .single()

      if (profileError || !profile?.push_token) {
        return new Response(
          JSON.stringify({ error: 'User has no push token registered' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const pushToken = profile.push_token

      // Verificar si es token de Expo (app) o web
      if (pushToken.startsWith('ExponentPushToken')) {
        const success = await sendExpoPush(pushToken, {
          title: title || 'CorrerJuntos',
          body: notifBody || 'Tienes una nueva notificación',
          data
        })

        return new Response(
          JSON.stringify({ success, type: 'expo' }),
          { status: success ? 200 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // Intentar como web push si hay suscripción
        const { data: webSub } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth')
          .eq('user_id', targetUserId)
          .single()

        if (webSub) {
          const success = await sendWebPush(webSub, {
            title: title || 'CorrerJuntos',
            body: notifBody || 'Tienes una nueva notificación',
            data
          })

          return new Response(
            JSON.stringify({ success, type: 'web' }),
            { status: success ? 200 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ error: 'No valid push subscription found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // ===== MODO BROADCAST: Enviar a múltiples usuarios (desde web/cron) =====
    console.log(`Enviando notificación tipo: ${tipo}`)

    // Obtener tokens de app móvil (profiles.push_token)
    let mobileQuery = supabase
      .from('profiles')
      .select('id, push_token')
      .not('push_token', 'is', null)

    if (user_ids && user_ids.length > 0) {
      mobileQuery = mobileQuery.in('id', user_ids)
    }
    if (exclude_user_id) {
      mobileQuery = mobileQuery.neq('id', exclude_user_id)
    }

    const { data: mobileUsers } = await mobileQuery

    // Obtener suscripciones web (push_subscriptions)
    let webQuery = supabase
      .from('push_subscriptions')
      .select('user_id, endpoint, p256dh, auth')

    if (user_ids && user_ids.length > 0) {
      webQuery = webQuery.in('user_id', user_ids)
    }
    if (exclude_user_id) {
      webQuery = webQuery.neq('user_id', exclude_user_id)
    }

    const { data: webSubscriptions } = await webQuery

    // Combinar todos los user_ids para verificar preferencias
    const allUserIds = [
      ...(mobileUsers?.map(u => u.id) || []),
      ...(webSubscriptions?.map(s => s.user_id) || [])
    ]
    const uniqueUserIds = [...new Set(allUserIds)]

    if (uniqueUserIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No hay suscripciones' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener preferencias de notificación
    const { data: prefs } = await supabase
      .from('notificacion_preferencias')
      .select('user_id, recordatorio_24h, recordatorio_1h, participante_se_une, nueva_quedada_ciudad, quedada_cancelada')
      .in('user_id', uniqueUserIds)

    const prefsMap = new Map(prefs?.map(p => [p.user_id, p]) || [])

    // Mapear tipo a columna de preferencias
    const tipoToPref: Record<string, string> = {
      'recordatorio_24h': 'recordatorio_24h',
      'recordatorio_1h': 'recordatorio_1h',
      'participante_se_une': 'participante_se_une',
      'nueva_quedada': 'nueva_quedada_ciudad',
      'quedada_cancelada': 'quedada_cancelada'
    }

    const prefKey = tipoToPref[tipo]

    // Función para verificar si el usuario tiene la preferencia activa
    const shouldNotify = (userId: string) => {
      if (!prefKey) return true
      const userPref = prefsMap.get(userId)
      return !userPref || userPref[prefKey] !== false
    }

    // Construir payload
    const payload: PushPayload = {
      title: titulo || 'CorrerJuntos',
      body: cuerpo || 'Tienes una nueva notificación',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      data: {
        url: quedada_id ? `/?quedada=${quedada_id}` : '/',
        quedada_id,
        tipo
      }
    }

    let sent = 0
    const results: { user_id: string; success: boolean; type: string }[] = []

    // Enviar a usuarios móviles (Expo Push)
    for (const user of mobileUsers || []) {
      if (!shouldNotify(user.id)) continue
      if (!user.push_token?.startsWith('ExponentPushToken')) continue

      const success = await sendExpoPush(user.push_token, payload)
      if (success) {
        sent++
        await supabase.from('notificaciones_enviadas').insert({
          user_id: user.id,
          tipo,
          titulo: payload.title,
          cuerpo: payload.body,
          quedada_id,
          canal: 'app'
        }).catch(() => {}) // Ignorar error si la tabla no existe
      }
      results.push({ user_id: user.id, success, type: 'expo' })
    }

    // Enviar a suscripciones web
    for (const sub of webSubscriptions || []) {
      if (!shouldNotify(sub.user_id)) continue

      const success = await sendWebPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload
      )
      if (success) {
        sent++
        await supabase.from('notificaciones_enviadas').insert({
          user_id: sub.user_id,
          tipo,
          titulo: payload.title,
          cuerpo: payload.body,
          quedada_id,
          canal: 'web'
        }).catch(() => {}) // Ignorar error si la tabla no existe
      }
      results.push({ user_id: sub.user_id, success, type: 'web' })
    }

    console.log(`Notificaciones enviadas: ${sent}/${results.length}`)

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        total: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en send-push-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
