import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/**
 * Notifica a usuarios cercanos cuando se crea una nueva quedada.
 * Solo notifica a usuarios de la app móvil (no web, para incentivar descargas).
 *
 * Requisitos:
 * - La tabla profiles debe tener columnas: lat, lng, push_token
 * - El radio por defecto es 25km
 */

// Fórmula de Haversine para calcular distancia entre coordenadas
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distancia en km
}

// Enviar notificación via Expo Push API
async function sendExpoPush(pushToken: string, title: string, body: string, data: Record<string, unknown>): Promise<boolean> {
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
        title,
        body,
        data,
        sound: 'default',
        badge: 1,
      }),
    })

    const result = await response.json()

    if (!response.ok || result.data?.[0]?.status === 'error') {
      console.log(`Expo Push falló:`, result.data?.[0]?.message || response.status)
      return false
    }

    return true
  } catch (error) {
    console.error('Error enviando Expo Push:', error)
    return false
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const body = await req.json()
    const {
      quedada_id,
      quedada_titulo,
      quedada_ciudad,
      quedada_lat,
      quedada_lng,
      creador_id,
      radio_km = 25, // Radio por defecto 25km
    } = body

    if (!quedada_id || !quedada_lat || !quedada_lng || !creador_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: quedada_id, quedada_lat, quedada_lng, creador_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Buscando usuarios cerca de la quedada "${quedada_titulo}" en ${quedada_ciudad}`)
    console.log(`Coordenadas: ${quedada_lat}, ${quedada_lng}, Radio: ${radio_km}km`)

    // Obtener todos los usuarios con push_token de Expo y ubicación guardada
    // Incluir preferencias de alerta para radio personalizado
    // Excluir al creador de la quedada
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, push_token, lat, lng, nombre, alert_new_quedadas, alert_radius_km')
      .not('push_token', 'is', null)
      .like('push_token', 'ExponentPushToken%') // Solo tokens de app móvil
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .neq('id', creador_id)

    if (usersError) {
      console.error('Error obteniendo usuarios:', usersError)
      return new Response(
        JSON.stringify({ error: usersError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!users || users.length === 0) {
      console.log('No hay usuarios con ubicación y push token registrados')
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No hay usuarios cercanos para notificar' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Filtrar usuarios dentro del radio
    // Si el usuario tiene alert_new_quedadas activado, usar su radio personalizado
    // Si no, usar el radio por defecto del request
    const nearbyUsers = users.filter(user => {
      const userRadius = user.alert_new_quedadas ? (user.alert_radius_km || 25) : radio_km
      const distance = calculateDistance(
        quedada_lat,
        quedada_lng,
        user.lat,
        user.lng
      )
      return distance <= userRadius
    })

    console.log(`Encontrados ${nearbyUsers.length} usuarios dentro de ${radio_km}km`)

    if (nearbyUsers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No hay usuarios dentro del radio especificado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enviar notificaciones
    let sent = 0
    const results: { user_id: string; success: boolean; distance: number }[] = []

    for (const user of nearbyUsers) {
      const distance = calculateDistance(quedada_lat, quedada_lng, user.lat, user.lng)
      const distanceText = distance < 1
        ? `a ${Math.round(distance * 1000)}m de ti`
        : `a ${distance.toFixed(1)}km de ti`

      const success = await sendExpoPush(
        user.push_token,
        '📍 Nueva quedada cerca de ti',
        `"${quedada_titulo}" en ${quedada_ciudad} (${distanceText})`,
        {
          type: 'nearby_quedada',
          quedada_id,
        }
      )

      if (success) {
        sent++
        // Guardar registro de notificación enviada
        await supabase.from('notificaciones_enviadas').insert({
          user_id: user.id,
          tipo: 'nueva_quedada_cercana',
          titulo: '📍 Nueva quedada cerca de ti',
          cuerpo: `"${quedada_titulo}" en ${quedada_ciudad} (${distanceText})`,
          quedada_id,
          canal: 'app'
        }).catch(() => {}) // Ignorar si la tabla no existe
      }

      results.push({ user_id: user.id, success, distance: Math.round(distance * 10) / 10 })
    }

    console.log(`Push enviados: ${sent}/${nearbyUsers.length}`)

    // ---- CANAL EMAIL: enviar a usuarios cercanos con alert_new_quedadas ----
    let emailsSent = 0
    try {
      // Query usuarios con email y ubicación que quieran alertas (independiente de push_token)
      const { data: emailUsers } = await supabase
        .from('profiles')
        .select('id, email, lat, lng, nombre, alert_new_quedadas, alert_radius_km')
        .eq('alert_new_quedadas', true)
        .not('email', 'is', null)
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .neq('id', creador_id)

      if (emailUsers && emailUsers.length > 0) {
        const supabaseFnUrl = Deno.env.get('SUPABASE_URL')! + '/functions/v1/send-email'

        for (const eu of emailUsers) {
          const dist = calculateDistance(quedada_lat, quedada_lng, eu.lat, eu.lng)
          const userRadius = eu.alert_radius_km || 25
          if (dist > userRadius) continue

          const distText = dist < 1
            ? `${Math.round(dist * 1000)}m`
            : `${dist.toFixed(1)}km`

          try {
            await fetch(supabaseFnUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({
                type: 'nearby_quedada',
                to_email: eu.email,
                to_name: eu.nombre || eu.email.split('@')[0],
                lang: 'es',
                data: {
                  titulo: quedada_titulo,
                  ciudad: quedada_ciudad,
                  fecha: body.fecha || '',
                  hora: body.hora || '',
                  distancia: distText,
                  quedada_id,
                  user_id: eu.id,
                }
              })
            })
            emailsSent++
          } catch (e) {
            console.warn(`Email falló para ${eu.id}:`, e)
          }
        }
      }
    } catch (e) {
      console.warn('Error enviando emails:', e)
    }

    console.log(`Total: ${sent} push + ${emailsSent} emails enviados`)

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        emails_sent: emailsSent,
        total: nearbyUsers.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en notify-nearby-users:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
