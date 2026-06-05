import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================
// LIFECYCLE PUSH — Edge Function
// Envía push notifications de activación a usuarios registrados
// que no están entrenando activamente.
//
// 3 etapas:
//   1. lifecycle_no_plan   — registrado ≥1d y ≤14d, SIN plan activo
//   2. lifecycle_no_workout — tiene plan activo pero 0 workouts completados
//                            y el plan tiene ≥2 días de antigüedad
//   3. lifecycle_dormant   — tuvo actividad pero lleva ≥7d y ≤30d sin completar
//                            ningún workout
//
// Parámetros de query:
//   ?mode=dry_run   → devuelve counts por etapa sin enviar nada (diagnóstico)
//   ?test=email     → envía SOLO al usuario con ese email, ignora dedup
//
// SEGURIDAD: el envío masivo a todos los usuarios está DESACTIVADO.
// Para activarlo, el founder debe confirmar explícitamente.
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface LifecycleCandidate {
  user_id: string
  push_token: string
  etapa: 'lifecycle_no_plan' | 'lifecycle_no_workout' | 'lifecycle_dormant'
  titulo: string
  cuerpo: string
}

// ─── Templates de mensaje ────────────────────────────────────────────────────

const TEMPLATES = {
  lifecycle_no_plan: {
    titulo: '🏃 Tu plan 0→5K te espera',
    cuerpo: 'Empezar a correr es más fácil con un plan. El tuyo está listo, gratis. ¿Lo arrancamos hoy?',
  },
  lifecycle_no_workout: {
    titulo: '👟 Tu primer entreno son 30 min',
    cuerpo: 'Caminar/correr suave. Hoy es buen día para empezar. Coach José te guía.',
  },
  lifecycle_dormant: {
    titulo: 'Te echamos de menos 🧡',
    cuerpo: 'Tu plan sigue aquí esperándote. Un entreno y vuelves al ritmo.',
  },
}

// ─── Helper: llamar a send-push-notification con service role ────────────────

async function sendPushToUser(
  supabaseUrl: string,
  serviceKey: string,
  userId: string,
  titulo: string,
  cuerpo: string
): Promise<boolean> {
  try {
    const r = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        tipo: 'lifecycle',
        user_ids: [userId],
        titulo,
        cuerpo,
      }),
    })

    if (!r.ok) {
      const body = await r.text()
      console.warn(`send-push-notification failed for ${userId}: ${r.status} ${body}`)
      return false
    }

    const result = await r.json()
    return result.sent > 0
  } catch (err) {
    console.error(`Error calling send-push-notification for ${userId}:`, err)
    return false
  }
}

// ─── Función principal ────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // ── Lectura de config interna ────────────────────────────────────────────
  // Sin auth guard propio (igual que reminder-cron).
  // La función está desplegada sin --no-verify-jwt en producción,
  // así que solo es accesible con service role key.
  // Para el cron diario (pg_cron o Vercel cron), llamar con:
  //   Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}
  const serviceKey = (Deno.env.get('SERVICE_ROLE_KEY_NEW') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))!
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!

  // ── Parámetros de control ────────────────────────────────────────────────
  const url = new URL(req.url)
  const dryRun = url.searchParams.get('mode') === 'dry_run'
  const testEmail = url.searchParams.get('test') // ej: guetto2012@gmail.com

  // ⚠️  KILL SWITCH: el envío masivo está desactivado hasta confirmación del founder.
  //     Solo se permiten:
  //       a) dry_run (sin envíos)
  //       b) test=<email> (1 push al email indicado)
  const massiveSendEnabled = false // cambiar a true cuando founder confirme

  if (!dryRun && !testEmail && !massiveSendEnabled) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Envío masivo desactivado. Usa ?mode=dry_run para ver counts o ?test=email para prueba puntual.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  const now = new Date()

  try {
    // ====================================================================
    // ETAPA 1: lifecycle_no_plan
    // Registrado hace ≥1 día y ≤14 días, SIN ningún plan (active o paused)
    // Requiere push_token no nulo
    // ====================================================================
    console.log('--- Calculando etapa 1: lifecycle_no_plan ---')

    const cutoff1Day = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    const cutoff14Day = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()

    // Usuarios registrados entre 1 y 14 días atrás con push_token
    const { data: candidatesNoPlan, error: errNoPlan } = await supabase
      .from('profiles')
      .select('id, push_token')
      .not('push_token', 'is', null)
      .gte('created_at', cutoff14Day)
      .lte('created_at', cutoff1Day)

    if (errNoPlan) {
      console.error('Error fetching lifecycle_no_plan candidates:', errNoPlan.message)
    }

    // De esos, filtrar los que YA tienen un plan activo/pausado
    const candidateIdsNoPlan = candidatesNoPlan?.map(u => u.id) || []
    let usersWithNoPlan: typeof candidatesNoPlan = []

    if (candidateIdsNoPlan.length > 0) {
      const { data: withPlan } = await supabase
        .from('user_plans')
        .select('user_id')
        .in('user_id', candidateIdsNoPlan)
        .in('estado', ['active', 'paused'])

      const withPlanSet = new Set(withPlan?.map(p => p.user_id) || [])
      usersWithNoPlan = (candidatesNoPlan || []).filter(u => !withPlanSet.has(u.id))
    }

    // Filtrar los que ya recibieron este tipo de push (dedup)
    let finalNoPlan: LifecycleCandidate[] = []
    if (usersWithNoPlan.length > 0) {
      const noPlanIds = usersWithNoPlan.map(u => u.id)
      const { data: alreadySent } = await supabase
        .from('notificaciones_enviadas')
        .select('user_id')
        .in('user_id', noPlanIds)
        .eq('tipo', 'lifecycle_no_plan')

      const sentSet = new Set(alreadySent?.map(e => e.user_id) || [])
      finalNoPlan = usersWithNoPlan
        .filter(u => !sentSet.has(u.id) && u.push_token)
        .map(u => ({
          user_id: u.id,
          push_token: u.push_token!,
          etapa: 'lifecycle_no_plan' as const,
          ...TEMPLATES.lifecycle_no_plan,
        }))
    }

    console.log(`lifecycle_no_plan: ${candidateIdsNoPlan.length} candidatos → ${usersWithNoPlan.length} sin plan → ${finalNoPlan.length} pendientes envío`)

    // ====================================================================
    // ETAPA 2: lifecycle_no_workout
    // Tiene plan activo/pausado creado hace ≥2 días, pero 0 workouts completados
    // ====================================================================
    console.log('--- Calculando etapa 2: lifecycle_no_workout ---')

    const cutoff2Day = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()

    // Planes activos creados hace ≥2 días
    const { data: oldEnoughPlans, error: errPlans } = await supabase
      .from('user_plans')
      .select('user_id, id, created_at')
      .in('estado', ['active', 'paused'])
      .lte('created_at', cutoff2Day)

    if (errPlans) {
      console.error('Error fetching plans for lifecycle_no_workout:', errPlans.message)
    }

    const planUserIds = [...new Set(oldEnoughPlans?.map(p => p.user_id) || [])]
    let usersWithNoWorkout: { id: string; push_token: string }[] = []

    if (planUserIds.length > 0) {
      // Obtener push_tokens de esos users
      const { data: planUsersProfiles } = await supabase
        .from('profiles')
        .select('id, push_token')
        .in('id', planUserIds)
        .not('push_token', 'is', null)

      if (planUsersProfiles && planUsersProfiles.length > 0) {
        const profileIds = planUsersProfiles.map(u => u.id)

        // Filtrar los que tienen al menos 1 workout completado
        const { data: completedWorkouts } = await supabase
          .from('user_workouts')
          .select('user_id')
          .in('user_id', profileIds)
          .eq('estado', 'completed')

        const hasCompletedSet = new Set(completedWorkouts?.map(w => w.user_id) || [])
        usersWithNoWorkout = (planUsersProfiles || [])
          .filter(u => !hasCompletedSet.has(u.id) && u.push_token)
          .map(u => ({ id: u.id, push_token: u.push_token! }))
      }
    }

    // Dedup: filtrar los que ya recibieron lifecycle_no_workout
    let finalNoWorkout: LifecycleCandidate[] = []
    if (usersWithNoWorkout.length > 0) {
      const noWorkoutIds = usersWithNoWorkout.map(u => u.id)
      const { data: alreadySentW } = await supabase
        .from('notificaciones_enviadas')
        .select('user_id')
        .in('user_id', noWorkoutIds)
        .eq('tipo', 'lifecycle_no_workout')

      const sentSetW = new Set(alreadySentW?.map(e => e.user_id) || [])

      // También excluir los que ya están en finalNoPlan (máx 1 push por ejecución)
      const alreadyScheduledIds = new Set(finalNoPlan.map(u => u.user_id))

      finalNoWorkout = usersWithNoWorkout
        .filter(u => !sentSetW.has(u.id) && !alreadyScheduledIds.has(u.id))
        .map(u => ({
          user_id: u.id,
          push_token: u.push_token,
          etapa: 'lifecycle_no_workout' as const,
          ...TEMPLATES.lifecycle_no_workout,
        }))
    }

    console.log(`lifecycle_no_workout: ${planUserIds.length} con plan → ${usersWithNoWorkout.length} sin workout → ${finalNoWorkout.length} pendientes envío`)

    // ====================================================================
    // ETAPA 3: lifecycle_dormant
    // Tuvo actividad (≥1 workout completado), pero lleva ≥7 días y ≤30 días
    // sin completar ningún workout
    // ====================================================================
    console.log('--- Calculando etapa 3: lifecycle_dormant ---')

    const cutoff7Day = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const cutoff30Day = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Usuarios que completaron su último workout entre 7 y 30 días atrás
    // Usamos una query para obtener el max(completed_at) por user_id
    // y filtramos los que caen en esa ventana
    const { data: recentlyCompleted, error: errDormant } = await supabase
      .from('user_workouts')
      .select('user_id, completed_at')
      .eq('estado', 'completed')
      .not('completed_at', 'is', null)

    if (errDormant) {
      console.error('Error fetching workouts for lifecycle_dormant:', errDormant.message)
    }

    // Calcular max(completed_at) por user_id en JS (Supabase REST no permite GROUP BY directo)
    const lastWorkoutByUser: Record<string, string> = {}
    for (const w of recentlyCompleted || []) {
      if (!lastWorkoutByUser[w.user_id] || w.completed_at! > lastWorkoutByUser[w.user_id]) {
        lastWorkoutByUser[w.user_id] = w.completed_at!
      }
    }

    // Filtrar los que su último workout fue entre 7 y 30 días atrás
    const dormantUserIds = Object.entries(lastWorkoutByUser)
      .filter(([, lastAt]) => lastAt < cutoff7Day && lastAt > cutoff30Day)
      .map(([uid]) => uid)

    let finalDormant: LifecycleCandidate[] = []
    if (dormantUserIds.length > 0) {
      // Obtener push_tokens
      const { data: dormantProfiles } = await supabase
        .from('profiles')
        .select('id, push_token')
        .in('id', dormantUserIds)
        .not('push_token', 'is', null)

      if (dormantProfiles && dormantProfiles.length > 0) {
        const dormantWithToken = dormantProfiles.filter(u => u.push_token)

        // Dedup: filtrar los que ya recibieron lifecycle_dormant
        const { data: alreadySentD } = await supabase
          .from('notificaciones_enviadas')
          .select('user_id')
          .in('user_id', dormantWithToken.map(u => u.id))
          .eq('tipo', 'lifecycle_dormant')

        const sentSetD = new Set(alreadySentD?.map(e => e.user_id) || [])

        // Excluir los que ya están en etapas anteriores de esta ejecución
        const alreadyScheduledIds = new Set([
          ...finalNoPlan.map(u => u.user_id),
          ...finalNoWorkout.map(u => u.user_id),
        ])

        finalDormant = dormantWithToken
          .filter(u => !sentSetD.has(u.id) && !alreadyScheduledIds.has(u.id))
          .map(u => ({
            user_id: u.id,
            push_token: u.push_token!,
            etapa: 'lifecycle_dormant' as const,
            ...TEMPLATES.lifecycle_dormant,
          }))
      }
    }

    console.log(`lifecycle_dormant: ${dormantUserIds.length} candidatos → ${finalDormant.length} pendientes envío`)

    // ====================================================================
    // RESUMEN DE COUNTS (siempre se devuelve)
    // ====================================================================
    const counts = {
      lifecycle_no_plan: finalNoPlan.length,
      lifecycle_no_workout: finalNoWorkout.length,
      lifecycle_dormant: finalDormant.length,
      total: finalNoPlan.length + finalNoWorkout.length + finalDormant.length,
    }

    // ── DRY RUN: devolver counts sin enviar nada ──────────────────────────
    if (dryRun) {
      return new Response(
        JSON.stringify({
          ok: true,
          mode: 'dry_run',
          message: 'Simulación — no se ha enviado ningún push',
          counts,
          // Info adicional de diagnóstico
          debug: {
            total_profiles: candidateIdsNoPlan.length + planUserIds.length,
            dormant_users_identified: dormantUserIds.length,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── TEST MODE: enviar solo al usuario del founder ─────────────────────
    if (testEmail) {
      console.log(`--- TEST MODE: buscando usuario con email ${testEmail} ---`)

      // Buscar el user_id por email via RPC que accede a auth.users
      // (admin.listUsers requiere permisos especiales que no siempre funcionan con sb_secret_)
      // Usamos el acceso directo via Supabase postgres con service role
      const { data: emailRows, error: emailErr } = await supabase
        .rpc('find_user_id_by_email', { email_input: testEmail })

      let testUserId: string | null = null

      if (!emailErr && emailRows) {
        testUserId = emailRows as string
      }

      // Si la RPC no existe, intentar via admin API como fallback
      if (!testUserId) {
        const { data: pageData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
        const found = pageData?.users?.find((u: { email?: string }) => u.email === testEmail)
        if (found) testUserId = found.id
      }

      if (!testUserId) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: `No se encontró usuario con email: ${testEmail}. Asegúrate de que el email existe en auth.users.`,
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const testUser = { id: testUserId }

      // Obtener push_token del usuario
      const { data: testProfile } = await supabase
        .from('profiles')
        .select('id, push_token')
        .eq('id', testUser.id)
        .single()

      if (!testProfile?.push_token) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: `El usuario ${testEmail} no tiene push_token registrado. ¿Ha abierto la app recientemente?`,
            user_id: testUser.id,
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Determinar qué etapa le correspondería (para el test usamos la más relevante)
      // Por defecto en test mandamos lifecycle_no_plan para que el founder vea el primer mensaje
      // Pero si tiene plan, mandamos lifecycle_dormant para que vea ese mensaje
      let testEtapa: keyof typeof TEMPLATES = 'lifecycle_no_plan'
      const { data: founderPlan } = await supabase
        .from('user_plans')
        .select('id, estado')
        .eq('user_id', testUser.id)
        .in('estado', ['active', 'paused'])
        .limit(1)
        .maybeSingle()

      if (founderPlan) {
        // Tiene plan → mostrar el push de dormant para que lo vea
        testEtapa = 'lifecycle_dormant'
      }

      const testTemplate = TEMPLATES[testEtapa]

      console.log(`Enviando push de TEST a ${testEmail} (user: ${testUser.id}), etapa: ${testEtapa}`)

      const success = await sendPushToUser(
        supabaseUrl,
        serviceKey,
        testUser.id,
        `[TEST] ${testTemplate.titulo}`,
        testTemplate.cuerpo
      )

      // En modo test NO registramos en notificaciones_enviadas para no afectar dedup real
      return new Response(
        JSON.stringify({
          ok: true,
          mode: 'test',
          test_email: testEmail,
          user_id: testUser.id,
          push_token_prefix: testProfile.push_token.substring(0, 25) + '...',
          etapa_usada: testEtapa,
          titulo_enviado: `[TEST] ${testTemplate.titulo}`,
          cuerpo_enviado: testTemplate.cuerpo,
          push_success: success,
          message: success
            ? 'Push de prueba enviado correctamente. Revisa tu móvil.'
            : 'El envío no retornó éxito — el token puede estar desactualizado o la app cerrada.',
          counts_referencia: counts,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── ENVÍO MASIVO (desactivado por kill switch) ────────────────────────
    // Este bloque solo se ejecuta cuando massiveSendEnabled = true
    // Por ahora el kill switch lo impide arriba.
    const allCandidates = [...finalNoPlan, ...finalNoWorkout, ...finalDormant]
    let totalSent = 0
    const sendResults: { user_id: string; etapa: string; success: boolean }[] = []

    for (const candidate of allCandidates) {
      const success = await sendPushToUser(
        supabaseUrl,
        serviceKey,
        candidate.user_id,
        candidate.titulo,
        candidate.cuerpo
      )

      if (success) {
        // Registrar en notificaciones_enviadas para dedup
        await supabase.from('notificaciones_enviadas').insert({
          user_id: candidate.user_id,
          tipo: candidate.etapa,
          titulo: candidate.titulo,
          cuerpo: candidate.cuerpo,
          canal: 'app',
          estado: 'enviado',
        }).catch(e => console.warn('Error guardando notificacion_enviada:', e))

        totalSent++
      }

      sendResults.push({ user_id: candidate.user_id, etapa: candidate.etapa, success })
    }

    return new Response(
      JSON.stringify({
        ok: true,
        mode: 'production',
        counts,
        sent: totalSent,
        results: sendResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Error en lifecycle-push:', err)
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
