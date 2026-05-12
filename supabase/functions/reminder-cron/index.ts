import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================
// REMINDER CRON — Edge Function
// Ejecutada cada hora por pg_cron
// Envia recordatorios push + email a participantes de quedadas:
// - 24h antes de la quedada
// - 1h antes de la quedada
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = (Deno.env.get('SERVICE_ROLE_KEY_NEW') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const pushUrl = `${supabaseUrl}/functions/v1/send-push-notification`
  const emailUrl = `${supabaseUrl}/functions/v1/send-email`

  const now = new Date()
  const results: { type: string; sent: number; errors: number }[] = []

  // ============================================================
  // 1. RECORDATORIOS 24H
  // Quedadas que empiezan entre 23h y 25h desde ahora
  // ============================================================
  console.log('--- Checking 24h reminders ---')
  let sent24 = 0, errors24 = 0

  try {
    const from24 = new Date(now.getTime() + 23 * 60 * 60 * 1000)
    const to24 = new Date(now.getTime() + 25 * 60 * 60 * 1000)

    // Buscar quedadas en esa ventana
    const { data: quedadas24 } = await supabase
      .from('quedadas')
      .select('id, titulo, ciudad, fecha, hora, creador_id')
      .gte('fecha', from24.toISOString().split('T')[0])
      .lte('fecha', to24.toISOString().split('T')[0])
      .limit(50)

    if (quedadas24 && quedadas24.length > 0) {
      for (const q of quedadas24) {
        // Combinar fecha + hora para verificar ventana exacta
        const quedadaDateTime = new Date(`${q.fecha}T${q.hora || '09:00'}:00`)
        const diffMs = quedadaDateTime.getTime() - now.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)

        if (diffHours < 23 || diffHours > 25) continue

        // Obtener participantes
        const { data: participantes } = await supabase
          .from('participantes')
          .select('user_id')
          .eq('quedada_id', q.id)

        if (!participantes || participantes.length === 0) continue

        const userIds = participantes.map(p => p.user_id)

        // Verificar que no se envio ya
        const { data: alreadySent } = await supabase
          .from('notificaciones_enviadas')
          .select('user_id')
          .in('user_id', userIds)
          .eq('tipo', 'recordatorio_24h')
          .eq('quedada_id', q.id)

        const sentSet = new Set(alreadySent?.map(e => e.user_id) || [])

        // Enviar push broadcast
        try {
          await fetch(pushUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              tipo: 'recordatorio_24h',
              user_ids: userIds.filter(id => !sentSet.has(id)),
              quedada_id: q.id,
              titulo: '⏰ Mañana tienes quedada!',
              cuerpo: `"${q.titulo}" en ${q.ciudad} — ${q.hora || ''}h`,
            })
          })
          sent24 += userIds.filter(id => !sentSet.has(id)).length
        } catch (e) {
          console.warn('Push 24h failed:', e)
          errors24++
        }

        // Enviar emails a participantes
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, nombre')
          .in('id', userIds.filter(id => !sentSet.has(id)))
          .not('email', 'is', null)

        if (profiles) {
          for (const p of profiles) {
            try {
              await fetch(emailUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({
                  type: 'reminder',
                  to_email: p.email,
                  to_name: p.nombre || p.email.split('@')[0],
                  lang: 'es',
                  data: {
                    user_id: p.id,
                    titulo: q.titulo,
                    ciudad: q.ciudad,
                    fecha: q.fecha,
                    hora: q.hora || '',
                    quedada_id: q.id,
                    tipo_recordatorio: '24h',
                  }
                })
              })
            } catch (e) {
              console.warn(`Email 24h failed for ${p.id}:`, e)
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Error in 24h reminders:', e)
    errors24++
  }

  results.push({ type: 'recordatorio_24h', sent: sent24, errors: errors24 })

  // ============================================================
  // 2. RECORDATORIOS 1H
  // Quedadas que empiezan entre 50min y 70min desde ahora
  // ============================================================
  console.log('--- Checking 1h reminders ---')
  let sent1 = 0, errors1 = 0

  try {
    const today = now.toISOString().split('T')[0]

    // Buscar quedadas de hoy
    const { data: quedadasHoy } = await supabase
      .from('quedadas')
      .select('id, titulo, ciudad, fecha, hora, creador_id')
      .eq('fecha', today)
      .limit(50)

    if (quedadasHoy && quedadasHoy.length > 0) {
      for (const q of quedadasHoy) {
        const quedadaDateTime = new Date(`${q.fecha}T${q.hora || '09:00'}:00`)
        const diffMs = quedadaDateTime.getTime() - now.getTime()
        const diffMinutes = diffMs / (1000 * 60)

        if (diffMinutes < 50 || diffMinutes > 70) continue

        // Obtener participantes
        const { data: participantes } = await supabase
          .from('participantes')
          .select('user_id')
          .eq('quedada_id', q.id)

        if (!participantes || participantes.length === 0) continue

        const userIds = participantes.map(p => p.user_id)

        // Verificar que no se envio ya
        const { data: alreadySent } = await supabase
          .from('notificaciones_enviadas')
          .select('user_id')
          .in('user_id', userIds)
          .eq('tipo', 'recordatorio_1h')
          .eq('quedada_id', q.id)

        const sentSet = new Set(alreadySent?.map(e => e.user_id) || [])

        // Enviar push broadcast
        try {
          await fetch(pushUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              tipo: 'recordatorio_1h',
              user_ids: userIds.filter(id => !sentSet.has(id)),
              quedada_id: q.id,
              titulo: '🏃 Tu quedada empieza en 1 hora!',
              cuerpo: `"${q.titulo}" en ${q.ciudad} — ${q.hora || ''}h. Preparate!`,
            })
          })
          sent1 += userIds.filter(id => !sentSet.has(id)).length
        } catch (e) {
          console.warn('Push 1h failed:', e)
          errors1++
        }
      }
    }
  } catch (e) {
    console.error('Error in 1h reminders:', e)
    errors1++
  }

  results.push({ type: 'recordatorio_1h', sent: sent1, errors: errors1 })

  console.log('Reminder results:', JSON.stringify(results))

  return new Response(
    JSON.stringify({ success: true, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
