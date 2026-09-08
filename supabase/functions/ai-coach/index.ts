import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { AI_DATA_PROVENANCE_VERSION, firstPartyRunFacts, aiConversationHistory, declaresRestrictedActivityData } from './_provenance.ts';
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

// [3 jun 2026] Freemium: no-premium pueden chatear FREE_DAILY_LIMIT mensajes
// al día (reset UTC 00:00). Premium = ilimitado. Objetivo: dejar CATAR el
// value (José/Ana) antes de pedir premium → palanca de conversión.
const FREE_DAILY_LIMIT = 5;

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
  return (lang === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ES) + '\nF183 SAFETY CONTRACT (takes priority over illustrative examples): You are a virtual training assistant, not a licensed clinician. Use only supplied eligible facts; unknown is unknown. Never predict race times from absent/uncertain VO2max, diagnose injury/overtraining, assert technique from logs, or prescribe supplements. Refer nutrition questions to Ana. Do not claim a plan has changed. Motivate without guilt. Explain one evidenced success and a practical next step; ask about sensations when missing. Examples are tone only, never evidence about this user.';
}

// Modelo: Claude Sonnet 4.5 para conversacion premium (mejor que Haiku para coach)
const MODEL_CHAT = 'claude-sonnet-4-6';
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
  const lang = payload?.lang === 'en' ? 'en' : 'es';
  // Client metrics/insights can be copied or relabelled Strava data. Resolve
  // the saved activity by authenticated owner before constructing any context.
  if (typeof payload?.runId !== 'string' || !payload.runId.trim()) {
    throw new Error('CANONICAL_RUN_REQUIRED');
  }
  const { data: run, error } = await supabase.from('runs')
    .select('id,source,strava_activity_id,deporte,distancia_km,duracion_segundos,rpe,created_at')
    .eq('id', payload.runId).eq('user_id', userId).maybeSingle();
  if (error) throw new Error('RUN_CONTEXT_UNAVAILABLE');
  const facts = firstPartyRunFacts(run);
  if (!facts) throw new Error('ACTIVITY_PROVENANCE_NOT_ELIGIBLE');
  const { data: rows, error: recentError } = await supabase.from('runs')
    .select('id,source,strava_activity_id,deporte,distancia_km,duracion_segundos,rpe,created_at')
    .eq('user_id', userId).eq('source', 'app').is('strava_activity_id', null)
    .order('created_at', { ascending: false }).limit(10);
  const recent = (rows ?? []).map((row: any) => firstPartyRunFacts(row))
    .filter((row: any) => row && row.id !== facts.id && row.sport === facts.sport).slice(0, 4);
  const context = {
    provenance: AI_DATA_PROVENANCE_VERSION, run: facts, recent,
    data_gaps: ['technique_not_observed', 'plan_target_lineage_unverified',
      ...(recentError ? ['recent_runs_unavailable'] : [])],
  };
  const userMessage = lang === 'en'
    ? `Explain this independently recorded session: one evidenced success, one limitation and one practical next step. Ask about sensations when missing. Never infer technique, injury or fitness from absent data.\n${JSON.stringify(context)}`
    : `Explica esta sesión registrada de forma independiente: un acierto sustentado, una limitación y un siguiente paso práctico. Pregunta por sensaciones si faltan. No deduzcas técnica, lesión ni estado de forma sin datos.\n${JSON.stringify(context)}`;
  const result = await callClaude(getSystemPrompt(lang), userMessage, 350, MODEL_BATCH);
  await supabase.from('coach_interactions').insert({
    user_id: userId, interaction_type: 'post_run', run_id: payload.runId,
    input_context: context, response_text: result.text, response_lang: lang,
    tokens_input: result.inputTokens, tokens_output: result.outputTokens,
  });
  return result.text;
}

async function handleChat(payload: any, userId: string, supabase: any) {
  const lang = payload?.lang === 'en' ? 'en' : 'es';
  const message = payload?.message;
  if (typeof message !== 'string' || !message.trim() || message.length > 8000) throw new Error('INVALID_MESSAGE');
  if (declaresRestrictedActivityData(message)) return lang === 'en'
    ? 'I cannot analyze or send Strava data to AI. You can view imported activities in Activities; I can help with general training questions or independently recorded sessions.'
    : 'No puedo analizar ni enviar datos de Strava a una IA. Puedes consultar las importaciones en Actividades; sí puedo ayudarte con dudas generales o sesiones registradas de forma independiente.';
  const { data: profile, error: profileError } = await supabase.from('profiles')
    .select('es_premium,nivel').eq('id', userId).single();
  if (profileError) throw new Error('PROFILE_UNAVAILABLE');
  if (!profile?.es_premium) {
    const startOfDay = new Date(); startOfDay.setUTCHours(0, 0, 0, 0);
    const { count, error: quotaError } = await supabase.from('coach_chat_messages')
      .select('id', { count: 'exact', head: true }).eq('user_id', userId)
      .eq('role', 'user').gte('created_at', startOfDay.toISOString());
    if (quotaError) throw new Error('QUOTA_UNAVAILABLE');
    if ((count ?? 0) >= FREE_DAILY_LIMIT) throw new Error('DAILY_LIMIT_REACHED');
  }
  await supabase.from('coach_chat_messages').insert({ user_id: userId, role: 'user', content: message });
  const { data: rows, error: runsError } = await supabase.from('runs')
    .select('id,source,strava_activity_id,deporte,distancia_km,duracion_segundos,rpe,created_at')
    .eq('user_id', userId).eq('source', 'app').is('strava_activity_id', null)
    .order('created_at', { ascending: false }).limit(5);
  const { data: plans, error: planError } = await supabase.from('user_plans')
    .select('objetivo,estado,race_nombre,fecha_carrera')
    .eq('user_id', userId).in('estado', ['active', 'paused'])
    .order('updated_at', { ascending: false }).limit(1);
  const plan = plans?.[0];
  const context = {
    provenance: AI_DATA_PROVENANCE_VERSION,
    profile: { level: profile?.nivel ?? null },
    recent_runs: (rows ?? []).map((row: any) => firstPartyRunFacts(row)).filter(Boolean),
    goal: plan ? { objective: plan.objetivo, race_name: plan.race_nombre, race_date: plan.fecha_carrera } : null,
    data_gaps: ['chat_history_lineage_unverified', 'fitness_aggregates_lineage_unverified',
      ...(runsError ? ['recent_runs_unavailable'] : []), ...(planError ? ['plan_unavailable'] : [])],
  };
  // Never reload legacy proactives/replies: their ancestors are unverified.
  // History remains stored/displayed; new conversation lineage needs its own schema.
  const messages: { role: 'user' | 'assistant'; content: string }[] = aiConversationHistory(null);
  messages.push({ role: 'user', content:
    `${lang === 'en' ? 'Independent runner context' : 'Contexto independiente del corredor'}: ${JSON.stringify(context)}\n\n${message}` });
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL_CHAT, max_tokens: 450, system: getSystemPrompt(lang), messages }),
  });
  if (!res.ok) throw new Error(`Anthropic error ${res.status}`);
  const data = await res.json();
  const responseText = data.content?.[0]?.text || '';
  await supabase.from('coach_chat_messages').insert({ user_id: userId, role: 'assistant', content: responseText });
  await supabase.from('coach_interactions').insert({
    user_id: userId, interaction_type: 'chat', input_context: context, response_text: responseText,
    response_lang: lang, tokens_input: data.usage?.input_tokens || 0, tokens_output: data.usage?.output_tokens || 0,
  });
  return responseText;
}

async function handleWeeklySummary(payload: any, userId: string, supabase: any) {
  const lang = payload?.lang === 'en' ? 'en' : 'es';
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: rows, error } = await supabase.from('runs')
    .select('id,source,strava_activity_id,deporte,distancia_km,duracion_segundos,rpe,created_at')
    .eq('user_id', userId).eq('source', 'app').is('strava_activity_id', null)
    .gte('created_at', weekAgo).order('created_at', { ascending: true });
  if (error) throw new Error('WEEK_CONTEXT_UNAVAILABLE');
  const facts = (rows ?? []).map((row: any) => firstPartyRunFacts(row)).filter(Boolean);
  if (!facts.length) return lang === 'en'
    ? 'No independently recorded sessions are available for this analysis. Imported activities remain in Activities.'
    : 'No hay sesiones registradas de forma independiente disponibles para este análisis. Tus actividades importadas siguen en Actividades.';
  const sports: Record<string, { sessions: number; observed_km: number | null; observed_minutes: number | null; missing_distance: number; missing_duration: number; effort: number[] }> = {};
  for (const run of facts) {
    const key = String(run.sport ?? 'unknown');
    const group = sports[key] ?? { sessions: 0, observed_km: null, observed_minutes: null, missing_distance: 0, missing_duration: 0, effort: [] };
    group.sessions += 1;
    if (typeof run.distance_km === 'number') group.observed_km = (group.observed_km ?? 0) + run.distance_km;
    else group.missing_distance += 1;
    if (typeof run.duration_seconds === 'number') group.observed_minutes = (group.observed_minutes ?? 0) + run.duration_seconds / 60;
    else group.missing_duration += 1;
    if (typeof run.rpe === 'number') group.effort.push(run.rpe);
    sports[key] = group;
  }
  const context = { provenance: AI_DATA_PROVENANCE_VERSION, window: 'last_7_days', sports };
  const result = await callClaude(getSystemPrompt(lang),
    `${lang === 'en' ? 'Summarize only the included sessions, separately by sport; this may be an incomplete week.' : 'Resume solo las sesiones incluidas y separa cada deporte; puede ser una semana incompleta.'}\n${JSON.stringify(context)}`,
    350, MODEL_BATCH);
  const weekStart = new Date();
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];
  await supabase.from('coach_weekly_summaries').upsert({
    user_id: userId, week_start: weekStartStr, summary_text: result.text, summary_data: context, lang,
  }, { onConflict: 'user_id,week_start' });
  await supabase.from('coach_interactions').insert({
    user_id: userId, interaction_type: 'weekly_summary', input_context: context,
    response_text: result.text, response_lang: lang, tokens_input: result.inputTokens,
    tokens_output: result.outputTokens,
  });
  return result.text;
}

async function handleSmartCheck(payload: any, userId: string, supabase: any) {
  const lang = payload?.lang === 'en' ? 'en' : 'es';
  const { data: profile } = await supabase.from('profiles').select('es_premium')
    .eq('id', userId).single();
  if (!profile?.es_premium) return null;
  const { data: rows, error } = await supabase.from('runs')
    .select('id,source,strava_activity_id,deporte,distancia_km,duracion_segundos,rpe,created_at')
    .eq('user_id', userId).eq('source', 'app').is('strava_activity_id', null)
    .order('created_at', { ascending: false }).limit(5);
  if (error) throw new Error('EFFORT_CONTEXT_UNAVAILABLE');
  const eligible = (rows ?? []).map((row: any) => firstPartyRunFacts(row)).filter(Boolean);
  const efforts = eligible.slice(0, 3).map((row: any) => row.rpe).filter((v: any) => typeof v === 'number');
  if (efforts.length < 3) return [];
  const average = efforts.reduce((a: number, b: number) => a + b, 0) / efforts.length;
  if (average <= 7) return [];
  const context = { provenance: AI_DATA_PROVENANCE_VERSION, observed_rpe: efforts, avg_rpe: average };
  const result = await callClaude(getSystemPrompt(lang),
    `${lang === 'en' ? 'The recorded effort is high. Ask about recovery and suggest a cautious next step; do not diagnose overtraining or injury.' : 'El esfuerzo registrado es alto. Pregunta por recuperación y sugiere un siguiente paso prudente; no diagnostiques sobreentrenamiento ni lesión.'}\n${JSON.stringify(context)}`,
    180, MODEL_BATCH);
  const alert = { alert_type: 'overtraining_risk',
    title: lang === 'en' ? 'How are you recovering?' : '¿Cómo te estás recuperando?',
    message: result.text, data: context };
  await supabase.from('coach_alerts').insert({ user_id: userId, ...alert });
  return [alert];
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
          if (e.message === 'DAILY_LIMIT_REACHED') {
            return jsonResponse({ error: 'daily_limit_reached', limit: FREE_DAILY_LIMIT }, 200);
          }
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
