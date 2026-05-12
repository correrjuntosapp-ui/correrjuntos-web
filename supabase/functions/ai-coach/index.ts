import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = (Deno.env.get('SERVICE_ROLE_KEY_NEW') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ── System prompt — Coach Jose v2 (mas humano, menos paper academico) ──
// [10 mayo 2026] Founder feedback: las respuestas anteriores eran densas
// y tecnicas ("Con un VO2max de 41.1 ml/kg/min estas en nivel intermedio
// solido. Tu tiempo estimado en 10K estaria entre 50-55 minutos..."). Un
// coach real responderia: "Vas para 50-52 minutos. El plan que tienes te
// lleva. Confio en ti.". Personalidad antes que datos.
const SYSTEM_PROMPT_ES = `Eres Coach Jose, entrenador de la app Correr Juntos. Hablas con runners como un colega que ha corrido contigo cien veces, no como un fisiologo en consulta. Tu mejor amigo si tu mejor amigo fuera un coach experimentado.

Tu personalidad
- Cercano, directo, motivador. Hablas de TU. Frases cortas. Sin parafrasear la pregunta.
- Confias en el runner. Le hablas con cariño pero sin paternalismo.
- Honesto: si va mal, lo dices. Si va bien, lo celebras.
- Sabes mucho pero no presumes. Datos solo cuando aportan, traducidos.
- Te puede salir un "vamos", "tio", "colega" puntualmente. Sin pasarse.

COMO RESPONDER (clave):
- 2 a 5 frases. Solo mas si pregunta abierta tipo "hazme un plan".
- Empieza con respuesta directa, no con repeticion ni con datos crudos.
- Numeros si, pero en lenguaje runner: "vas para 50-52 minutos" mejor que "tu VO2max de 41.1 ml/kg/min indica un tiempo estimado de 50-55 minutos".
- Cierra a veces con pregunta o accion concreta ("prueba esto el jueves", "como te has sentido?"). No siempre — alterna.
- Cuando uses ritmo: 5:20/km, no "un ritmo de 5:20 minutos por kilometro".
- NO uses emojis. NO uses markdown (** o # o -). NO listas con viñetas.
- NO digas "como tu coach" ni te presentes — el usuario ya sabe quien eres.

EJEMPLOS DEL ESTILO QUE QUIERO

Pregunta del runner: Cuanto tiempo puedo correr el 10K?
Respuesta MAL (la que no quiero): Con un VO2max de 41.1 ml/kg/min estas en un nivel intermedio solido. Tu tiempo estimado en 10K estaria entre 50-55 minutos, lo que significa un ritmo de 5:00-5:30 min/km. Si tienes buena economia de carrera y has entrenado especifico para 10K con tempo runs y umbrales, podrias estar mas cerca de los 50 minutos.
Respuesta BIEN: Vas para hacer 50-52 minutos. Si trabajas el ritmo de carrera (5:00/km) en los tempo del jueves, te plantas en 49. Sin volverte loco. Como te sientes en los rodajes ahora?

Pregunta del runner: Me he saltado dos sesiones esta semana, voy mal?
Respuesta MAL: La perdida de adaptaciones tras un periodo de inactividad de 3-7 dias es minima si la base aerobica esta consolidada. La sobrecarga psicologica de intentar recuperar volumen perdido suele ser contraproducente.
Respuesta BIEN: Tranquilo. Una semana floja no te baja del nivel. Lo peor seria intentar meter las dos sesiones a la fuerza ahora — eso si te lesiona. Sigues con el plan desde donde te toca y a por la siguiente. Ya esta.

Pregunta del runner: Que zapatillas para mi 10K?
Respuesta MAL: La eleccion de calzado depende de variables como pronacion, peso corporal, drop preferido, y kilometraje semanal. Para 10K en asfalto el rango de drop optimo es 6-10mm con amortiguacion media-alta...
Respuesta BIEN: Si vas serio (sub 45) y tienes presupuesto: una con placa de carbono tipo Nike Vaporfly o Adidas Adios Pro. Si vas a disfrutar: cualquier neutra de entreno comoda que ya hayas probado, error clasico es estrenar zapatillas el dia D. Cuanto pesas y cuanto haces a la semana ahora? Te afino mas.

Que dominas
- Entrenamiento: planificacion 5K/10K/21K/42K/trail, periodizacion, zonas Z1-Z5, intervalos, fartlek, tempo, tirada larga, descarga semanal cada 4 sem (-30% volumen), supercompensacion.
- Ritmos por zonas y umbrales (UA, UAn), VO2max, RPE 1-10. Pero TRADUCES.
- Nutricion deportiva: CHO 5-10g/kg en alto volumen, gel cada 30-45min en >90min, post 30-60min ratio 3:1, sodio 300-700mg/h, cafeina 3-6mg/kg.
- Carreras populares: world majors (Berlin, Boston, NYC, Londres, Chicago, Tokyo), Espana (Valencia rapida, Sevilla, Madrid, Barcelona), 21K (Behobia, Madrid, RnR), trails (UTMB, Zegama, Penyagolosa, Transgrancanaria), populares (San Silvestre Vallecana).
- Lesiones tipicas y prevencion. Para temas medicos serios, derivas a fisio/medico.
- Equipamiento: zapatillas (carbono solo en 5K+ a ritmo, drop bajo 0-4 vs alto 8-12), pulsometros, GPS.
- Recuperacion (sueño 7-9h, frio/calor, foam roller), biomecanica (cadencia 170-180), mental (motivacion, mala carrera, constancia).

Si pregunta fuera de running/triatlon/nutricion-deportiva/carreras: redirige amablemente sin sermon.
Si tienes datos del runner (ritmo medio, plan activo, runs recientes, RPE, VO2max): uselos pero DOSIFICA. No los listes todos a la vez.

Responde SIEMPRE en español.`;

const SYSTEM_PROMPT_EN = `You are Coach Jose, the trainer for the Correr Juntos running app. You talk to runners like a buddy who has run with them a hundred times — not like a sports physiologist in a clinic. The best friend you'd want, if your best friend were a serious coach.

Your personality
- Warm, direct, motivating. You use "you". Short sentences. No restating their question.
- You trust the runner. Friendly but never condescending.
- Honest: if it's going badly, you say so. If it's going well, you celebrate.
- You know a lot, but you don't show off. Numbers only when they help — translated.
- A casual "man", "buddy" can slip in. Don't overdo it.

HOW TO ANSWER (key)
- 2 to 5 sentences. More only if open-ended ("build me a plan").
- Lead with the answer. No restating, no raw data dump.
- Numbers yes, but in runner-speak: "you're on track for 50-52 min" beats "VO2max of 41.1 ml/kg/min suggests an estimated 10K time of 50-55 minutes".
- Sometimes close with a question or concrete action ("try this on Thursday", "how do those long runs feel?"). Mix it up.
- Pace shorthand: 5:20/km, not "a pace of 5:20 minutes per kilometer".
- NO emojis. NO markdown (** or # or -). NO bullet lists.
- Don't say "as your coach" or introduce yourself — they know.

STYLE EXAMPLES

Runner: How long can I run a 10K in?
BAD (avoid): With a VO2max of 41.1 ml/kg/min you're in a solid intermediate level. Your estimated 10K time would be between 50-55 minutes, which means a pace of 5:00-5:30 min/km. If you have good running economy...
GOOD: You're on track for 50-52 min. If you nail the goal-pace work (5:00/km) on the Thursday tempos, 49 is real. Don't go crazy. How are the easy runs feeling lately?

Runner: I skipped two sessions this week, am I screwed?
BAD: Loss of aerobic adaptations after 3-7 days of inactivity is minimal if your aerobic base is consolidated. The psychological overload of trying to recover lost volume...
GOOD: Relax. One off-week doesn't drop your level. The worst move is cramming both sessions back in now — that's how you get hurt. Pick up the plan where it leaves you this week and go. Done.

Runner: What shoes for my 10K?
BAD: Footwear choice depends on variables like pronation, body weight, preferred drop, and weekly mileage. For a 10K on asphalt, the optimal drop range is 6-10mm with medium-high cushioning...
GOOD: If you're going serious (sub 45) and have the budget: a carbon plate like Nike Vaporfly or Adidas Adios Pro. If you're going to enjoy it: any neutral trainer you already love — classic mistake is breaking in shoes on race day. What's your weight and weekly mileage? I'll dial it in.

What you know
- Training: 5K/10K/half/marathon/trail planning, periodization, zones Z1-Z5, intervals, fartlek, tempo, long run, deload week every 4 (-30% volume), supercompensation.
- Pace zones and thresholds (LT1, LT2), VO2max, RPE 1-10. But you TRANSLATE.
- Sports nutrition: CHO 5-10g/kg high volume, gel every 30-45min if >90min, post 30-60min 3:1 ratio, sodium 300-700mg/h, caffeine 3-6mg/kg.
- Popular races: world majors (Berlin, Boston, NYC, London, Chicago, Tokyo), halfs (Behobia, RnR), trails (UTMB, Zegama, Penyagolosa).
- Common injuries and prevention. For serious medical issues, refer to a physio/doctor.
- Gear: shoes (carbon plate from 5K race pace+, low drop 0-4 vs high 8-12), HR monitors, GPS.
- Recovery (sleep 7-9h, contrast bath, foam roller), biomechanics (cadence 170-180), mental (motivation, bad race, consistency).

For topics outside running/triathlon/sports-nutrition/races: redirect politely, no lecture.
If you have runner data (avg pace, active plan, recent runs, RPE, VO2max): USE it but DOSE it. Don't list it all at once.

ALWAYS respond in English.`;

function getSystemPrompt(lang: string) {
  return lang === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ES;
}

// Modelo: Claude Sonnet 4.5 para conversacion premium (mejor que Haiku para coach)
const MODEL_CHAT = 'claude-sonnet-4-5-20250929';
// Para post-run analysis y weekly summary, mantener Haiku (mas rapido y barato)
const MODEL_BATCH = 'claude-haiku-4-5-20251001';

async function callClaude(systemPrompt: string, userMessage: string, maxTokens = 300, model = MODEL_BATCH): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return {
    text: data.content?.[0]?.text || '',
    inputTokens: data.usage?.input_tokens || 0,
    outputTokens: data.usage?.output_tokens || 0,
  };
}

function fmtPace(secPerKm: number): string {
  if (!secPerKm || secPerKm <= 0) return '0:00';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function handlePostRunAnalysis(payload: any, userId: string, supabase: any) {
  const { runData, planWorkout, insights, vo2max, lang = 'es' } = payload;

  const { data: recentRuns } = await supabase
    .from('runs')
    .select('distance_km, duration_sec, rpe, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  const context: any = {
    run: {
      km: runData.distanceKm?.toFixed(2),
      duration_min: runData.durationSec ? (runData.durationSec / 60).toFixed(1) : null,
      pace: runData.paceAvg ? fmtPace(runData.paceAvg) : null,
      rpe: runData.rpe,
      splits: runData.splits?.slice(0, 5)?.map((s: any) => fmtPace(s.seconds || s)),
    },
  };

  if (planWorkout) {
    context.plan_target = {
      type: planWorkout.tipo,
      km: planWorkout.distancia_target_km,
      pace_target: planWorkout.ritmo_target ? fmtPace(planWorkout.ritmo_target * 60) : null,
      title: planWorkout.titulo,
    };
  }

  if (insights) {
    context.insights = {
      pace_consistency_cv: insights.paceCv,
      negative_split: insights.negativeSplit,
      plan_adherence_pct: insights.planAdherencePct,
    };
  }

  if (vo2max) context.vo2max = vo2max;

  if (recentRuns?.length) {
    context.recent = recentRuns.slice(1, 4).map((r: any) => ({
      km: r.distance_km?.toFixed(1),
      pace: r.duration_sec && r.distance_km ? fmtPace(r.duration_sec / r.distance_km) : null,
      rpe: r.rpe,
    }));
  }

  const userMessage = lang === 'en'
    ? `Analyze this run and give personalized feedback:\n${JSON.stringify(context)}`
    : `Analiza esta carrera y da feedback personalizado:\n${JSON.stringify(context)}`;

  const result = await callClaude(getSystemPrompt(lang), userMessage, 250, MODEL_BATCH);

  await supabase.from('coach_interactions').insert({
    user_id: userId,
    interaction_type: 'post_run',
    run_id: payload.runId || null,
    input_context: context,
    response_text: result.text,
    response_lang: lang,
    tokens_input: result.inputTokens,
    tokens_output: result.outputTokens,
  });

  return result.text;
}

async function handleChat(payload: any, userId: string, supabase: any) {
  const { message, lang = 'es' } = payload;

  const { data: profile } = await supabase
    .from('profiles')
    .select('es_premium, nivel, vo2max_latest')
    .eq('id', userId)
    .single();

  if (!profile?.es_premium) {
    throw new Error('PREMIUM_REQUIRED');
  }

  await supabase.from('coach_chat_messages').insert({
    user_id: userId,
    role: 'user',
    content: message,
  });

  const { data: chatHistory } = await supabase
    .from('coach_chat_messages')
    .select('role, content')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(8);

  const { data: recentRuns } = await supabase
    .from('runs')
    .select('distance_km, duration_sec, rpe, vo2max_estimate, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: activePlan } = await supabase
    .from('user_plans')
    .select('goal_key, semana_actual, progreso_pct, ritmo_base, estado')
    .eq('user_id', userId)
    .eq('estado', 'activo')
    .single();

  const context: any = {
    profile: { level: profile.nivel, vo2max: profile.vo2max_latest },
    recent_runs: recentRuns?.slice(0, 5).map((r: any) => ({
      km: r.distance_km?.toFixed(1),
      pace: r.duration_sec && r.distance_km ? fmtPace(r.duration_sec / r.distance_km) : null,
      rpe: r.rpe,
      days_ago: Math.round((Date.now() - new Date(r.created_at).getTime()) / 86400000),
    })),
  };

  if (activePlan) {
    context.plan = {
      goal: activePlan.goal_key,
      week: activePlan.semana_actual,
      progress_pct: activePlan.progreso_pct,
      base_pace: activePlan.ritmo_base ? fmtPace(activePlan.ritmo_base * 60) : null,
    };
  }

  const messages = (chatHistory || []).reverse().map((m: any) => ({
    role: m.role,
    content: m.content,
  }));

  const contextStr = JSON.stringify(context);
  const userMsg = lang === 'en'
    ? `Runner context: ${contextStr}\n\nQuestion: ${message}`
    : `Contexto del corredor: ${contextStr}\n\nPregunta: ${message}`;

  if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
    messages[messages.length - 1].content = userMsg;
  } else {
    messages.push({ role: 'user', content: userMsg });
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_CHAT,
      // [10 mayo 2026] Bajado de 600 a 350. Combinado con prompt v2 esto
      // fuerza brevedad — el modelo no lo agota porque el prompt pide 2-5
      // frases, pero deja margen si pregunta abierta tipo "hazme un plan".
      max_tokens: 350,
      system: getSystemPrompt(lang),
      messages,
    }),
  });

  if (!res.ok) throw new Error(`Anthropic error ${res.status}`);
  const data = await res.json();
  const responseText = data.content?.[0]?.text || '';

  await supabase.from('coach_chat_messages').insert({
    user_id: userId,
    role: 'assistant',
    content: responseText,
  });

  await supabase.from('coach_interactions').insert({
    user_id: userId,
    interaction_type: 'chat',
    input_context: context,
    response_text: responseText,
    response_lang: lang,
    tokens_input: data.usage?.input_tokens || 0,
    tokens_output: data.usage?.output_tokens || 0,
  });

  return responseText;
}

async function handleWeeklySummary(payload: any, userId: string, supabase: any) {
  const { lang = 'es' } = payload;

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: weekRuns } = await supabase
    .from('runs')
    .select('distance_km, duration_sec, rpe, vo2max_estimate, sport, created_at')
    .eq('user_id', userId)
    .gte('created_at', weekAgo)
    .order('created_at', { ascending: true });

  if (!weekRuns?.length) {
    return lang === 'en'
      ? 'No runs recorded this week. Even a short 15-minute jog counts. Try to get out there tomorrow!'
      : 'No has registrado carreras esta semana. Incluso un trote corto de 15 minutos cuenta. Intenta salir manana!';
  }

  const { data: activePlan } = await supabase
    .from('user_plans')
    .select('goal_key, semana_actual, progreso_pct, ritmo_base')
    .eq('user_id', userId)
    .eq('estado', 'activo')
    .single();

  const { data: weekWorkouts } = await supabase
    .from('user_workouts')
    .select('estado, tipo')
    .eq('user_id', userId)
    .gte('fecha', weekAgo.split('T')[0]);

  const totalKm = weekRuns.reduce((s: number, r: any) => s + (r.distance_km || 0), 0);
  const avgPace = weekRuns.reduce((s: number, r: any) => s + (r.duration_sec || 0), 0) / (totalKm || 1);
  const avgRpe = weekRuns.reduce((s: number, r: any) => s + (r.rpe || 0), 0) / weekRuns.length;

  const context = {
    week: {
      runs: weekRuns.length,
      total_km: totalKm.toFixed(1),
      avg_pace: fmtPace(avgPace),
      avg_rpe: avgRpe.toFixed(1),
    },
    plan: activePlan ? {
      goal: activePlan.goal_key,
      week: activePlan.semana_actual,
      progress: activePlan.progreso_pct,
    } : null,
    workouts: weekWorkouts ? {
      completed: weekWorkouts.filter((w: any) => w.estado === 'completado').length,
      skipped: weekWorkouts.filter((w: any) => w.estado === 'omitido').length,
      pending: weekWorkouts.filter((w: any) => w.estado === 'pendiente').length,
    } : null,
  };

  const userMessage = lang === 'en'
    ? `Give a weekly training summary and recommendations for next week:\n${JSON.stringify(context)}`
    : `Da un resumen semanal de entrenamiento y recomendaciones para la proxima semana:\n${JSON.stringify(context)}`;

  const result = await callClaude(getSystemPrompt(lang), userMessage, 350, MODEL_BATCH);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];

  await supabase.from('coach_weekly_summaries').upsert({
    user_id: userId,
    week_start: weekStartStr,
    summary_text: result.text,
    summary_data: context,
    lang,
  }, { onConflict: 'user_id,week_start' });

  await supabase.from('coach_interactions').insert({
    user_id: userId,
    interaction_type: 'weekly_summary',
    input_context: context,
    response_text: result.text,
    response_lang: lang,
    tokens_input: result.inputTokens,
    tokens_output: result.outputTokens,
  });

  return result.text;
}

async function handleSmartCheck(payload: any, userId: string, supabase: any) {
  const { lang = 'es' } = payload;

  const { data: profile } = await supabase
    .from('profiles')
    .select('es_premium')
    .eq('id', userId)
    .single();

  if (!profile?.es_premium) return null;

  const { data: recentRuns } = await supabase
    .from('runs')
    .select('rpe, distance_km, duration_sec, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!recentRuns?.length || recentRuns.length < 3) return null;

  const lastThreeRpe = recentRuns.slice(0, 3).map((r: any) => r.rpe).filter(Boolean);
  const avgRpe = lastThreeRpe.length ? lastThreeRpe.reduce((a: number, b: number) => a + b, 0) / lastThreeRpe.length : 0;

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const { data: missedWorkouts } = await supabase
    .from('user_workouts')
    .select('id')
    .eq('user_id', userId)
    .eq('estado', 'pendiente')
    .lt('fecha', weekAgo);

  const alerts: any[] = [];

  if (avgRpe > 7) {
    const title = lang === 'en' ? 'Overtraining risk detected' : 'Riesgo de sobreentrenamiento detectado';
    const context = { avg_rpe: avgRpe.toFixed(1), last_3_rpe: lastThreeRpe };
    const userMsg = lang === 'en'
      ? `The runner's last 3 RPE scores average ${avgRpe.toFixed(1)}/10. Give a brief warning about overtraining risk and suggest recovery.`
      : `Los ultimos 3 RPE del corredor promedian ${avgRpe.toFixed(1)}/10. Da un aviso breve sobre riesgo de sobreentrenamiento y sugiere recuperacion.`;

    const result = await callClaude(getSystemPrompt(lang), userMsg, 180, MODEL_BATCH);
    alerts.push({ alert_type: 'overtraining_risk', title, message: result.text, data: context });
  }

  if (missedWorkouts && missedWorkouts.length >= 2) {
    const title = lang === 'en' ? `${missedWorkouts.length} missed workouts` : `${missedWorkouts.length} entrenamientos sin completar`;
    const message = lang === 'en'
      ? `You have ${missedWorkouts.length} pending workouts from previous weeks. Consider reorganizing your plan or adjusting your training days.`
      : `Tienes ${missedWorkouts.length} entrenamientos pendientes de semanas anteriores. Considera reorganizar tu plan o ajustar tus dias de entrenamiento.`;
    alerts.push({ alert_type: 'missed_workouts', title, message, data: { count: missedWorkouts.length } });
  }

  for (const alert of alerts) {
    await supabase.from('coach_alerts').insert({ user_id: userId, ...alert });
  }

  return alerts;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error: 'Missing auth' }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await createClient(
      SUPABASE_URL,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    ).auth.getUser(token);

    if (authError || !user) return jsonResponse({ error: 'Invalid token' }, 401);

    const { action, payload } = await req.json();

    let result;
    switch (action) {
      case 'post_run_analysis':
        result = await handlePostRunAnalysis(payload, user.id, supabase);
        break;
      case 'chat':
        try {
          result = await handleChat(payload, user.id, supabase);
        } catch (e: any) {
          if (e.message === 'PREMIUM_REQUIRED') {
            return jsonResponse({ error: 'premium_required', message: 'Upgrade to Premium for AI Coach chat' }, 403);
          }
          throw e;
        }
        break;
      case 'weekly_summary':
        result = await handleWeeklySummary(payload, user.id, supabase);
        break;
      case 'smart_check':
        result = await handleSmartCheck(payload, user.id, supabase);
        break;
      default:
        return jsonResponse({ error: `Unknown action: ${action}` }, 400);
    }

    return jsonResponse({ success: true, data: result });
  } catch (err: any) {
    console.error('[ai-coach] Error:', err.message);
    return jsonResponse({ error: err.message }, 500);
  }
});
