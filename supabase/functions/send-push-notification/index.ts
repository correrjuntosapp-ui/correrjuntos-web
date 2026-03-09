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
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (token === serviceRoleKey) {
    return { authorized: true, userId: 'service' }
  }

  // Otherwise verify as user JWT
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
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

// Enviar notificación via Web Push (para navegadores)
async function sendWebPush(subscription: WebSubscription, payload: PushPayload): Promise<boolean> {
  try {
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
        'Urgency': 'normal',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.log(`Web Push falló para ${subscription.endpoint}: ${response.status}`)
      return false
    }

    return true
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
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
