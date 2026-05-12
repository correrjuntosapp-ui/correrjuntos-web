import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================
// EMAIL CRON — Edge Function
// Ejecutada por pg_cron para enviar emails automaticos:
// 1. Reactivacion: usuarios inactivos 7+ dias (diario)
// 2. Post-quedada: despues de asistir a una quedada (diario)
// 3. Digest semanal: resumen de quedadas proximas (lunes)
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
  const sendEmailUrl = `${supabaseUrl}/functions/v1/send-email`

  // Determinar que tipo de cron ejecutar
  let body: { type?: string } = {}
  try { body = await req.json() } catch { body = {} }
  const cronType = body.type || 'all'

  const results: { type: string; sent: number; errors: number }[] = []

  // ============================================================
  // 1. REACTIVATION: usuarios inactivos 7+ dias
  // ============================================================
  if (cronType === 'all' || cronType === 'reactivation') {
    console.log('--- Running reactivation emails ---')
    let sent = 0, errors = 0

    try {
      // Usuarios que no han iniciado sesion en 7+ dias
      // Y que no han recibido email de reactivacion en los ultimos 14 dias
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

      const { data: inactiveUsers } = await supabase
        .from('profiles')
        .select('id, email, nombre, ciudad, last_sign_in')
        .not('email', 'is', null)
        .lt('last_sign_in', sevenDaysAgo)
        .gt('last_sign_in', fourteenDaysAgo) // No enviar a usuarios muy antiguos
        .limit(50) // Respetar rate limit de Brevo (300/dia)

      if (inactiveUsers && inactiveUsers.length > 0) {
        // Filtrar usuarios que ya recibieron reactivation email recientemente
        const userIds = inactiveUsers.map(u => u.id)
        const { data: recentEmails } = await supabase
          .from('notificaciones_enviadas')
          .select('user_id')
          .in('user_id', userIds)
          .eq('tipo', 'reactivation')
          .gte('created_at', fourteenDaysAgo)

        const alreadySent = new Set(recentEmails?.map(e => e.user_id) || [])

        // Contar quedadas por ciudad para el mensaje
        for (const user of inactiveUsers) {
          if (alreadySent.has(user.id)) continue

          let quedadasCount = 0
          if (user.ciudad) {
            const { count } = await supabase
              .from('quedadas')
              .select('*', { count: 'exact', head: true })
              .eq('ciudad', user.ciudad)
              .gte('fecha', new Date().toISOString().split('T')[0])

            quedadasCount = count || 0
          }

          try {
            await fetch(sendEmailUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({
                type: 'reactivation',
                to_email: user.email,
                to_name: user.nombre || user.email.split('@')[0],
                lang: 'es',
                data: {
                  user_id: user.id,
                  ciudad: user.ciudad,
                  quedadas_count: quedadasCount,
                }
              })
            })
            sent++
          } catch (e) {
            console.warn(`Reactivation email failed for ${user.id}:`, e)
            errors++
          }
        }
      }
    } catch (e) {
      console.error('Error in reactivation cron:', e)
      errors++
    }

    console.log(`Reactivation: ${sent} sent, ${errors} errors`)
    results.push({ type: 'reactivation', sent, errors })
  }

  // ============================================================
  // 2. POST-QUEDADA: email despues de asistir
  // ============================================================
  if (cronType === 'all' || cronType === 'post_quedada') {
    console.log('--- Running post-quedada emails ---')
    let sent = 0, errors = 0

    try {
      // Quedadas que terminaron ayer (fecha = yesterday)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data: completedQuedadas } = await supabase
        .from('quedadas')
        .select('id, titulo, ciudad, fecha, hora')
        .eq('fecha', yesterday)
        .limit(20)

      if (completedQuedadas && completedQuedadas.length > 0) {
        for (const quedada of completedQuedadas) {
          // Obtener participantes
          const { data: participantes } = await supabase
            .from('participantes')
            .select('user_id')
            .eq('quedada_id', quedada.id)

          if (!participantes || participantes.length === 0) continue

          const participantIds = participantes.map(p => p.user_id)

          // Obtener perfiles de participantes
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, nombre')
            .in('id', participantIds)
            .not('email', 'is', null)

          if (!profiles) continue

          // Verificar que no se envio ya
          const { data: alreadySentEmails } = await supabase
            .from('notificaciones_enviadas')
            .select('user_id')
            .in('user_id', participantIds)
            .eq('tipo', 'post_quedada')
            .eq('quedada_id', quedada.id)

          const alreadySent = new Set(alreadySentEmails?.map(e => e.user_id) || [])

          for (const profile of profiles) {
            if (alreadySent.has(profile.id)) continue

            try {
              await fetch(sendEmailUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({
                  type: 'post_quedada',
                  to_email: profile.email,
                  to_name: profile.nombre || profile.email.split('@')[0],
                  lang: 'es',
                  data: {
                    user_id: profile.id,
                    titulo: quedada.titulo,
                    ciudad: quedada.ciudad,
                    participantes: participantes.length,
                    quedada_id: quedada.id,
                  }
                })
              })
              sent++
            } catch (e) {
              console.warn(`Post-quedada email failed for ${profile.id}:`, e)
              errors++
            }
          }
        }
      }
    } catch (e) {
      console.error('Error in post-quedada cron:', e)
      errors++
    }

    console.log(`Post-quedada: ${sent} sent, ${errors} errors`)
    results.push({ type: 'post_quedada', sent, errors })
  }

  // ============================================================
  // 3. WEEKLY DIGEST: resumen semanal (solo lunes)
  // ============================================================
  if (cronType === 'all' || cronType === 'weekly_digest') {
    console.log('--- Running weekly digest emails ---')
    let sent = 0, errors = 0

    try {
      // Solo ejecutar los lunes (o si se fuerza)
      const today = new Date()
      const isMonday = today.getUTCDay() === 1
      if (!isMonday && cronType !== 'weekly_digest') {
        console.log('Not Monday, skipping weekly digest')
        results.push({ type: 'weekly_digest', sent: 0, errors: 0 })
      } else {
        // Obtener quedadas de la proxima semana
        const startDate = new Date().toISOString().split('T')[0]
        const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        // Obtener ciudades con quedadas
        const { data: upcomingQuedadas } = await supabase
          .from('quedadas')
          .select('id, titulo, fecha, hora, ciudad, participantes_count')
          .gte('fecha', startDate)
          .lte('fecha', endDate)
          .order('fecha', { ascending: true })
          .limit(100)

        if (upcomingQuedadas && upcomingQuedadas.length > 0) {
          // Agrupar por ciudad
          const byCiudad: Record<string, typeof upcomingQuedadas> = {}
          for (const q of upcomingQuedadas) {
            if (!q.ciudad) continue
            if (!byCiudad[q.ciudad]) byCiudad[q.ciudad] = []
            byCiudad[q.ciudad].push(q)
          }

          // Para cada ciudad, enviar digest a usuarios de esa ciudad
          for (const [ciudad, quedadas] of Object.entries(byCiudad)) {
            const { data: usersInCity } = await supabase
              .from('profiles')
              .select('id, email, nombre')
              .eq('ciudad', ciudad)
              .not('email', 'is', null)
              .limit(100)

            if (!usersInCity || usersInCity.length === 0) continue

            // Verificar que no se envio esta semana
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            const userIds = usersInCity.map(u => u.id)
            const { data: recentDigests } = await supabase
              .from('notificaciones_enviadas')
              .select('user_id')
              .in('user_id', userIds)
              .eq('tipo', 'weekly_digest')
              .gte('created_at', weekAgo)

            const alreadySent = new Set(recentDigests?.map(e => e.user_id) || [])

            const quedadasData = quedadas.map(q => ({
              titulo: q.titulo,
              fecha: q.fecha,
              hora: q.hora || '',
              participantes: q.participantes_count || 0,
              id: q.id,
            }))

            for (const user of usersInCity) {
              if (alreadySent.has(user.id)) continue

              try {
                await fetch(sendEmailUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseKey}`,
                  },
                  body: JSON.stringify({
                    type: 'weekly_digest',
                    to_email: user.email,
                    to_name: user.nombre || user.email.split('@')[0],
                    lang: 'es',
                    data: {
                      user_id: user.id,
                      ciudad,
                      quedadas: quedadasData,
                    }
                  })
                })
                sent++
              } catch (e) {
                console.warn(`Weekly digest failed for ${user.id}:`, e)
                errors++
              }
            }
          }
        }

        console.log(`Weekly digest: ${sent} sent, ${errors} errors`)
        results.push({ type: 'weekly_digest', sent, errors })
      }
    } catch (e) {
      console.error('Error in weekly digest cron:', e)
      errors++
      results.push({ type: 'weekly_digest', sent: 0, errors })
    }
  }

  return new Response(
    JSON.stringify({ success: true, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
