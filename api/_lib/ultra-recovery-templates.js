// ============================================================
// Ultra Recovery Drip — 10-day email plan post-ultra
//
// Sequence designed by sport-science consensus + practical coaches:
//   D1-2: full rest, hydration, anti-inflammatory food
//   D3-4: gentle walk + sleep focus
//   D5-7: very easy short jogs (optional, RPE ≤4)
//   D8-9: gradual return to easy running
//   D10:  trampoline to Premium → next ultra plan
//
// Each email: ONE focus, 1-2 actions, never overwhelming. Day 10 is
// the conversion moment.
// ============================================================

// [10 may 2026] Visual style memorized from Brevo template #3
// "CJ DOI Confirmation". Founder feedback: emails de hoy no coincidían
// con el de bienvenida (dark mode + brand naranja). Ahora unificados:
// mismo background, misma card, mismo CTA pill.
const BRAND_ORANGE = '#f97316';
const BRAND_ORANGE_DARK = '#ea580c';
const BG_DARK = '#0b1220';
const CARD_BG = 'rgba(255,255,255,0.03)';
const CARD_BORDER = 'rgba(255,255,255,0.06)';
const TEXT_BODY = '#cbd5e1';
const TEXT_MUTED = '#64748b';
const TEXT_FOOTER = '#475569';
const FONT_STACK = "-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',sans-serif";

function shell(content, lang) {
  const unsubHref = `https://www.correrjuntos.com/unsubscribe?email={{contact.EMAIL}}&list=ultra-recovery`;
  const footerCopy = lang === 'en'
    ? `© 2026 CorrerJuntos - The runner community · <a href="${unsubHref}" style="color:${TEXT_FOOTER};text-decoration:underline">Unsubscribe</a>`
    : `© 2026 CorrerJuntos - La comunidad runner · <a href="${unsubHref}" style="color:${TEXT_FOOTER};text-decoration:underline">Darme de baja</a>`;

  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CorrerJuntos · Recovery</title></head><body style="margin:0;padding:0;background:${BG_DARK};font-family:${FONT_STACK}"><table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_DARK};padding:40px 20px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%"><tr><td style="text-align:center;padding:24px 0"><a href="https://www.correrjuntos.com" style="color:${BRAND_ORANGE};font-size:1.4rem;font-weight:900;text-decoration:none;letter-spacing:-0.5px">CORRERJUNTOS</a></td></tr><tr><td style="background:${CARD_BG};border:1px solid ${CARD_BORDER};border-radius:24px;padding:40px 32px">${content}</td></tr><tr><td style="text-align:center;padding:24px 0;font-size:0.8rem;color:${TEXT_FOOTER}">${footerCopy}</td></tr></table></td></tr></table></body></html>`;
}

function ctaButton(url, label) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td align="center"><a href="${url}" style="display:inline-block;background:linear-gradient(135deg,${BRAND_ORANGE},${BRAND_ORANGE_DARK});color:#ffffff;padding:14px 32px;border-radius:50px;font-weight:700;text-decoration:none;font-size:1rem">${label}</a></td></tr></table>`;
}

function dayBadge(n, total) {
  return `<div style="display:inline-block;padding:4px 12px;background:rgba(249,115,22,0.15);border:1px solid rgba(249,115,22,0.35);border-radius:50px;font-size:11px;font-weight:700;color:${BRAND_ORANGE};letter-spacing:0.6px;margin:0 0 18px 0;text-transform:uppercase">DÍA ${n} DE ${total}</div>`;
}

// ─── Helpers ────────────────────────────────────────────────
const h1 = (txt) => `<h1 style="color:${BRAND_ORANGE};font-size:1.8rem;font-weight:900;margin:0 0 16px 0;line-height:1.25;text-align:center">${txt}</h1>`;
const p  = (txt) => `<p style="color:${TEXT_BODY};font-size:1rem;line-height:1.7;margin:0 0 18px 0">${txt}</p>`;
const bullets = (items) => `<ul style="margin:0 0 18px 0;padding-left:20px;color:${TEXT_BODY};font-size:0.95rem;line-height:1.8">${items.map(i => `<li style="margin-bottom:6px">${i}</li>`).join('')}</ul>`;
const callout = (label, body, color = BRAND_ORANGE) => `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px 0"><tr><td style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.25);border-left:3px solid ${color};border-radius:10px;padding:16px 20px"><p style="margin:0 0 6px 0;font-size:11px;font-weight:700;color:${color};letter-spacing:0.6px;text-transform:uppercase">${label}</p><p style="margin:0;font-size:0.92rem;line-height:1.6;color:${TEXT_BODY}">${body}</p></td></tr></table>`;

// ─────────────────────────────────────────────────────────────
// DAYS ES (1-10)
// ─────────────────────────────────────────────────────────────

const day1Es = (name) => shell(`
  ${dayBadge(1, 10)}
  ${h1(`${name || 'Hola'}, hoy NO toca correr`)}
  ${p(`Lo más importante hoy: <strong>descansar de verdad</strong>. Tu cuerpo terminó una de las pruebas más exigentes que existen. Las próximas 24-48h definen cómo recuperas.`)}
  ${p(`Foco del día:`)}
  ${bullets([
    '<strong>Hidratación:</strong> 30-40 ml/kg de peso. Si pesas 70 kg → 2,1-2,8 L. Añade sales (electrolitos) en 1L.',
    '<strong>Comida:</strong> proteína (1,5-2 g/kg) + carbohidratos cada 3h. Tu glucógeno está en suelo.',
    '<strong>Sueño:</strong> 9-10h esta noche. La recuperación real ocurre durmiendo.',
    '<strong>Movimiento:</strong> caminar 10-15 min después de comer. Nada más.',
  ])}
  ${callout('TIP DEL COACH', 'Hoy va a doler todo. Es normal. Si hay dolor punzante en una zona concreta (no muscular general), apúntalo y vigila los próximos días.')}
  ${p(`Mañana en el email te toca el día 2. Sigue el plan, no te lo saltes — incluso descansar tiene técnica.`)}
`, 'es');

const day2Es = (name) => shell(`
  ${dayBadge(2, 10)}
  ${h1('Día 2: la inflamación gana el partido')}
  ${p(`Hoy probablemente te encuentras peor que ayer. <strong>Es normal y esperado</strong> — la inflamación post-ultra suele picar en h36-48. No es retroceso.`)}
  ${p(`Foco del día:`)}
  ${bullets([
    '<strong>Hidratación + sales:</strong> sigue. La orina debe estar clara/amarilla pálida.',
    '<strong>Antiinflamatorio natural:</strong> cúrcuma, jengibre, omega-3 (sardinas, salmón), cerezas/granada.',
    '<strong>Frío suave:</strong> 10 min agua fría en piernas (no hielo). Reduce inflamación residual.',
    '<strong>Cero AINE rutinario:</strong> ibuprofeno enmascara dolor pero retrasa adaptación. Solo si tu médico lo indica.',
  ])}
  ${callout('SEÑAL DE ALARMA', 'Si tu orina sale color cola/oscura, o tienes dolor muscular extremo + debilidad → urgencias. Posible rabdomiólisis tras ultra. No es habitual pero existe.', '#dc2626')}
  ${p(`Camina 20 min hoy a paso suave. Nada más. Mañana empezamos a movilizar.`)}
`, 'es');

const day3Es = (name) => shell(`
  ${dayBadge(3, 10)}
  ${h1('Día 3: caminar + estiramientos suaves')}
  ${p(`A día 3 ya empiezas a notar mejora. Las agujetas más fuertes deberían ir cediendo. Hoy <strong>sí toca movimiento ligero</strong>.`)}
  ${p(`Sesión del día (30 minutos total):`)}
  ${bullets([
    '<strong>Caminar 25 min</strong> a ritmo de paseo (no de marcha). Plano, sin desniveles fuertes.',
    '<strong>Estiramientos suaves 5 min</strong>: gemelos, isquios, cuádriceps, glúteos, lumbar. <em>Sin rebotes</em>, mantén 30s cada zona.',
    '<strong>Foam roller</strong> (si tienes): pasadas LENTAS por gemelos, cuádriceps, banda IT. 2 min cada zona.',
  ])}
  ${callout('OJO CON', 'Si una zona en concreto pincha al estirar, NO insistas. La recuperación pasa por respetar señales, no forzarlas.')}
  ${p(`Mañana toca reflexión: ¿qué aprendiste de la carrera?`)}
`, 'es');

const day4Es = (name) => shell(`
  ${dayBadge(4, 10)}
  ${h1('Día 4: tu carrera, en frío')}
  ${p(`Las primeras 72h fueron físicas. Hoy empezamos la parte mental: <strong>analiza la carrera</strong>.`)}
  ${p(`Coge papel o notas en el móvil y responde:`)}
  ${bullets([
    '¿Qué funcionó mejor de lo esperado?',
    '¿Qué se quebró antes de tiempo? (estómago, energía, mental, físico…)',
    '¿En qué km/zona la pasé peor? ¿Por qué?',
    '¿Qué nutrición/equipamiento NO repetiría?',
    '¿Cuál es el aprendizaje más importante para mi próxima ultra?',
  ])}
  ${callout('POR QUÉ ESTO IMPORTA', 'Los runners que registran lecciones por escrito mejoran 30-40 % más rápido que los que solo "lo guardan en la cabeza". El detalle se borra en 1 semana.')}
  ${p(`Físicamente: 30 min caminar + estiramientos otra vez. Sin presión.`)}
`, 'es');

const day5Es = (name) => shell(`
  ${dayBadge(5, 10)}
  ${h1('Día 5: primer rodaje cortito (opcional)')}
  ${p(`Si te encuentras al 80 % o mejor, hoy puedes hacer <strong>tu primer rodaje muy suave</strong>. Si todavía hay molestias musculares fuertes, sigue caminando otro día más — sin culpa.`)}
  ${p(`Sesión del día:`)}
  ${bullets([
    '<strong>Trote SUAVE 20-25 min</strong>. RPE 3-4/10. Si puedes hablar frases largas, perfecto.',
    'Plano. Sin pendientes ni terreno técnico.',
    '<strong>Si duele algo concreto al primer km, PARA</strong>. No es debilidad, es inteligencia.',
    'Estiramientos 5 min al terminar.',
  ])}
  ${callout('REGLA DE ORO', 'En recuperación post-ultra, "menos es más" siempre. Forzar 1 sesión te puede costar 2 semanas extra de inactividad por lesión. La paciencia es performance.')}
  ${p(`Si decides no salir hoy, no pasa nada. Caminar 30 min funciona igual.`)}
`, 'es');

const day6Es = (name) => shell(`
  ${dayBadge(6, 10)}
  ${h1('Día 6: descanso + sueño')}
  ${p(`Hoy <strong>NO corras</strong>. Aunque te apetezca. Tu cuerpo está en plena reparación de microfibras musculares y necesita un día sin estímulo.`)}
  ${p(`En su lugar, foco en sueño:`)}
  ${bullets([
    'Cena ligera y temprano (3h antes de dormir).',
    'Sin pantallas 30 min antes.',
    'Habitación fresca (18-20°C) y oscura.',
    'Magnesio (300-400 mg) si tienes molestias en piernas para dormir.',
    'Apunta tu hora de despertar y sensación. Quieres ir hacia "fresco al despertar".',
  ])}
  ${callout('DATO', 'En sueño profundo se libera la mayor parte de hormona de crecimiento (GH), responsable de la reparación muscular. Dormir 8h vs 6h post-ultra = 30 % más rápida recuperación medible en marcadores como CK.')}
`, 'es');

const day7Es = (name) => shell(`
  ${dayBadge(7, 10)}
  ${h1('Día 7: una semana después')}
  ${p(`Una semana exacta desde la carrera. Hoy puedes salir <strong>30-40 min de trote suave</strong> si te apetece. Pero quiero que primero te observes.`)}
  ${p(`Test rápido (de pie, descansado):`)}
  ${bullets([
    '<strong>Frecuencia cardíaca en reposo</strong>: ¿cerca de tu valor normal? Si está ≥10 lpm por encima, sigue cansado.',
    '<strong>Energía general</strong>: ¿la del 1 al 10? Solo sales si estás ≥6.',
    '<strong>Apetito</strong>: ¿normal? Si bajo, el cuerpo todavía pide reservas.',
    '<strong>Motivación</strong>: ¿real o forzada? La forzada lleva a sesiones malas.',
  ])}
  ${p(`Si todo OK, sal a trotar 30-40 min muy suave. Si algo no, caminar y mañana otra vez.`)}
  ${callout('UNA WEEK MARK', 'Esta es la primera evaluación honesta. La recuperación REAL puede tardar 2-3 semanas tras una ultra de 100+. No tengas prisa.')}
`, 'es');

const day8Es = (name) => shell(`
  ${dayBadge(8, 10)}
  ${h1('Día 8: vuelta gradual')}
  ${p(`Si día 7 fue bien, hoy puedes subir un poco. <strong>Trote suave 40-50 min</strong>. Sigue siendo recuperación, no entrenamiento.`)}
  ${p(`Sesión del día:`)}
  ${bullets([
    '40-50 min Z1-Z2 (RPE 3-4). Sin progresiones, sin sprints, sin tempo.',
    'Si puedes, terreno blando (tierra, hierba) — más amable con tendones.',
    'Hidratación + comida pre/post como cualquier sesión.',
    '5 min de movilidad articular al volver: tobillos, caderas, hombros.',
  ])}
  ${callout('MIRA', 'A día 8 muchos runners cometen el error clásico: "ya estoy bien" → meten una sesión fuerte → reincidencia. La regla: 2 semanas mínimo de Z1-Z2 después de cualquier ultra.')}
`, 'es');

const day9Es = (name) => shell(`
  ${dayBadge(9, 10)}
  ${h1('Día 9: rodaje + reflexión')}
  ${p(`Penúltimo día del plan. Hoy: <strong>40-60 min suaves</strong> + revisita lo que apuntaste el día 4.`)}
  ${p(`Vuelve a tus notas y pregunta:`)}
  ${bullets([
    '¿Lo que aprendí ya está claro?',
    '¿Qué cambiaría en mi próxima preparación? (volumen, intensidad, dieta, equipamiento)',
    '¿Qué carrera viene después? (siguiente ultra, o un objetivo intermedio tipo 21K-42K)',
    '¿Cuándo quiero estar listo y de qué?',
  ])}
  ${callout('SIGUIENTE NIVEL', 'La diferencia entre un runner que mejora y uno que se estanca: <em>el que mejora planifica el "siguiente reto" antes de que el actual se enfríe</em>. Mañana te ayudamos.')}
`, 'es');

const day10Es = (name) => shell(`
  ${dayBadge(10, 10)}
  ${h1('Día 10: lo has logrado · ¿la próxima?')}
  ${p(`${name || 'Crack'}, has terminado 10 días de recuperación estructurada. Tu cuerpo está reseteado. Ahora viene lo importante: <strong>¿cuál es tu próxima ultra?</strong>`)}
  ${p(`Si vas a por otra carrera grande (UTMB, Penyagolosa, Transgrancanaria, otra edición de Ronda…), tienes dos opciones:`)}
  ${bullets([
    '<strong>Improvisar</strong>: como muchos hicieron antes de su última ultra. Funcionó, pero pagaste el precio en zonas que ya conoces.',
    '<strong>Plan estructurado</strong>: 16-20 semanas adaptadas a tu fecha objetivo, ritmo real, días disponibles, y nivel actual.',
  ])}
  ${callout('CORRERJUNTOS PREMIUM', 'Plan adaptativo para tu próxima ultra · Coach IA que ajusta semana a semana · Tracking GPS · Comunidad runners cerca de ti · 14 días gratis, después 4,99 €/mes', BRAND_ORANGE)}
  ${ctaButton('https://www.correrjuntos.com/app', 'Empezar 14 días gratis →')}
  ${p(`Y si solo quieres mantenerte sin objetivo concreto, también nos vale. La app es gratis para todo el mundo.`)}
  ${p(`Lo que has hecho estos 10 días no lo hace casi nadie. <strong>Eso ya te diferencia.</strong>`)}
  ${p(`A correr.<br>— Abraham, fundador CorrerJuntos`)}
`, 'es');

// ─────────────────────────────────────────────────────────────
// DAYS EN — concise English versions
// ─────────────────────────────────────────────────────────────

const day1En = (name) => shell(`
  ${dayBadge(1, 10)}
  ${h1(`${name || 'Hi'}, today is NOT for running`)}
  ${p('Most important today: <strong>real rest</strong>. Your body just finished one of the toughest events out there. The next 24-48h define how you recover.')}
  ${p("Today's focus:")}
  ${bullets([
    '<strong>Hydration:</strong> 30-40 ml/kg of body weight. 70 kg → 2.1-2.8 L. Add electrolytes to 1L.',
    '<strong>Food:</strong> protein (1.5-2 g/kg) + carbs every 3h. Your glycogen is at zero.',
    '<strong>Sleep:</strong> 9-10h tonight. Real recovery happens sleeping.',
    '<strong>Movement:</strong> 10-15 min walk after meals. Nothing more.',
  ])}
  ${callout('COACH TIP', "Today everything will hurt. That's normal. If there's sharp pain in a specific spot (not general muscle), note it and watch the next days.")}
`, 'en');

const day2En = (name) => shell(`
  ${dayBadge(2, 10)}
  ${h1('Day 2: inflammation peaks')}
  ${p('Today you probably feel worse than yesterday. <strong>Normal and expected</strong> — post-ultra inflammation peaks at h36-48. Not a setback.')}
  ${p("Today's focus:")}
  ${bullets([
    '<strong>Hydration + electrolytes:</strong> keep going. Urine should be clear/pale yellow.',
    '<strong>Natural anti-inflammatory:</strong> turmeric, ginger, omega-3 (sardines, salmon), cherries.',
    '<strong>Cool water:</strong> 10 min on legs (not ice). Reduces residual inflammation.',
    '<strong>No routine NSAIDs:</strong> ibuprofen masks pain but delays adaptation. Doctor only.',
  ])}
  ${callout('WARNING SIGN', 'If urine is cola-colored/dark, or you have extreme muscle pain + weakness → ER. Possible rhabdomyolysis after ultra. Rare but real.', '#dc2626')}
  ${p('Walk 20 min today at easy pace. Nothing more.')}
`, 'en');

const day3En = (name) => shell(`
  ${dayBadge(3, 10)}
  ${h1('Day 3: walk + gentle stretches')}
  ${p('By day 3 you start feeling better. The worst soreness fades. Today <strong>gentle movement</strong>.')}
  ${p('Session (30 min total):')}
  ${bullets([
    '<strong>Walk 25 min</strong> at easy pace. Flat ground.',
    '<strong>Gentle stretches 5 min</strong>: calves, hamstrings, quads, glutes, lower back. <em>No bouncing</em>, hold 30s each.',
    '<strong>Foam roller</strong> if you have one: SLOW passes on calves, quads, IT band. 2 min each.',
  ])}
  ${callout('WATCH', "If a specific spot hurts when stretching, DON'T push. Recovery means respecting signals.")}
`, 'en');

const day4En = (name) => shell(`
  ${dayBadge(4, 10)}
  ${h1('Day 4: your race, in cold')}
  ${p('First 72h were physical. Today the mental part: <strong>analyze the race</strong>.')}
  ${p('Grab paper or phone notes:')}
  ${bullets([
    'What worked better than expected?',
    'What broke earlier than planned (stomach, energy, mental, physical)?',
    'Which km/section was hardest? Why?',
    'What nutrition/gear would NOT repeat?',
    'Most important lesson for my next ultra?',
  ])}
  ${callout('WHY THIS MATTERS', 'Runners who write down lessons improve 30-40 % faster than those who just "remember". Detail fades in 1 week.')}
`, 'en');

const day5En = (name) => shell(`
  ${dayBadge(5, 10)}
  ${h1('Day 5: first short jog (optional)')}
  ${p('If you feel 80 % or better, today you can do <strong>your first very easy jog</strong>. Still sore? Keep walking another day — no guilt.')}
  ${bullets([
    '<strong>EASY jog 20-25 min</strong>. RPE 3-4/10. Talk in full sentences.',
    'Flat. No hills, no technical terrain.',
    "<strong>If something specific hurts at km 1, STOP</strong>. Not weakness, intelligence.",
    'Stretches 5 min after.',
  ])}
  ${callout('GOLDEN RULE', 'Post-ultra, "less is more" always. One forced session can cost you 2 extra weeks of injury layoff. Patience IS performance.')}
`, 'en');

const day6En = (name) => shell(`
  ${dayBadge(6, 10)}
  ${h1('Day 6: rest + sleep')}
  ${p("Today <strong>don't run</strong>. Even if you want to. Your body is repairing micro-fibers and needs a day without stimulus.")}
  ${p('Focus on sleep:')}
  ${bullets([
    'Light dinner, early (3h before bed).',
    'No screens 30 min before.',
    'Cool room (18-20°C), dark.',
    'Magnesium (300-400 mg) if legs are restless.',
    'Track wake-up time and feeling. Aim for "fresh on waking".',
  ])}
  ${callout('FACT', 'Most growth hormone (GH) — responsible for muscle repair — is released in deep sleep. 8h vs 6h post-ultra = 30 % faster recovery measurable in CK markers.')}
`, 'en');

const day7En = (name) => shell(`
  ${dayBadge(7, 10)}
  ${h1('Day 7: one week in')}
  ${p('Exactly one week since the race. Today you can do <strong>30-40 min easy jog</strong> if you feel like it. But check yourself first.')}
  ${p('Quick test (standing, rested):')}
  ${bullets([
    '<strong>Resting heart rate</strong>: near your normal? If ≥10 bpm above, still tired.',
    '<strong>General energy</strong>: 1-10 scale? Only run if ≥6.',
    '<strong>Appetite</strong>: normal? If low, body still asking reserves.',
    '<strong>Motivation</strong>: real or forced? Forced leads to bad sessions.',
  ])}
  ${callout('ONE WEEK MARK', 'First honest assessment. REAL recovery may take 2-3 weeks after a 100+ ultra. No rush.')}
`, 'en');

const day8En = (name) => shell(`
  ${dayBadge(8, 10)}
  ${h1('Day 8: gradual return')}
  ${p('If day 7 went well, you can step up. <strong>Easy jog 40-50 min</strong>. Still recovery, not training.')}
  ${bullets([
    '40-50 min Z1-Z2 (RPE 3-4). No progressions, no sprints, no tempo.',
    'Soft terrain if possible (dirt, grass) — kinder to tendons.',
    'Hydration + food pre/post like any session.',
    '5 min joint mobility after: ankles, hips, shoulders.',
  ])}
  ${callout('LISTEN', "Day 8 is when many runners make the classic mistake: 'I'm fine' → hard session → relapse. Rule: 2 weeks minimum of Z1-Z2 after any ultra.")}
`, 'en');

const day9En = (name) => shell(`
  ${dayBadge(9, 10)}
  ${h1('Day 9: jog + reflection')}
  ${p('Second-to-last day. Today: <strong>40-60 min easy</strong> + revisit your day-4 notes.')}
  ${p('Back to your notes:')}
  ${bullets([
    'Are the lessons clear?',
    'What would I change in my next prep? (volume, intensity, diet, gear)',
    'What race comes next? (next ultra, or intermediate goal like half/marathon)',
    'When do I want to be ready, and for what?',
  ])}
  ${callout('NEXT LEVEL', 'The difference between a runner who improves and one who stagnates: <em>the one who improves plans the "next challenge" before the current one cools down</em>.')}
`, 'en');

const day10En = (name) => shell(`
  ${dayBadge(10, 10)}
  ${h1("Day 10: you made it · what's next?")}
  ${p(`${name || 'Crack'}, you finished 10 days of structured recovery. Body is reset. Now the important part: <strong>what's your next ultra?</strong>`)}
  ${p('If you target another big race (UTMB, Penyagolosa, Transgrancanaria, another Ronda edition…), two options:')}
  ${bullets([
    '<strong>Improvise</strong>: like many did before their last ultra. Worked, but you paid the price in spots you already know.',
    '<strong>Structured plan</strong>: 16-20 weeks adapted to your target date, real pace, available days, current level.',
  ])}
  ${callout('CORRERJUNTOS PREMIUM', 'Adaptive plan for your next ultra · AI Coach that adjusts week by week · GPS tracking · Runners community near you · 14 days free, then $4.99/mo', BRAND_ORANGE)}
  ${ctaButton('https://www.correrjuntos.com/app', 'Start 14-day free trial →')}
  ${p('And if you just want to keep going without a specific goal, that works too. The app is free for everyone.')}
  ${p("What you did these 10 days, almost no one does. <strong>That already sets you apart.</strong>")}
  ${p('Run on.<br>— Abraham, founder CorrerJuntos')}
`, 'en');

// ─── Public API ─────────────────────────────────────────────
const SUBJECTS = {
  es: {
    1: 'Día 1 · Hoy NO toca correr',
    2: 'Día 2 · La inflamación gana el partido',
    3: 'Día 3 · Caminar + estiramientos suaves',
    4: 'Día 4 · Tu carrera, en frío',
    5: 'Día 5 · Primer rodaje cortito',
    6: 'Día 6 · Descanso + sueño',
    7: 'Día 7 · Una semana después',
    8: 'Día 8 · Vuelta gradual',
    9: 'Día 9 · Rodaje + reflexión',
    10: 'Día 10 · Lo has logrado · ¿la próxima?',
  },
  en: {
    1: 'Day 1 · Today is NOT for running',
    2: 'Day 2 · Inflammation peaks',
    3: 'Day 3 · Walk + gentle stretches',
    4: 'Day 4 · Your race, in cold',
    5: 'Day 5 · First short jog',
    6: 'Day 6 · Rest + sleep',
    7: 'Day 7 · One week in',
    8: 'Day 8 · Gradual return',
    9: 'Day 9 · Jog + reflection',
    10: "Day 10 · You made it · what's next?",
  },
};

const TEMPLATES = {
  es: { 1: day1Es, 2: day2Es, 3: day3Es, 4: day4Es, 5: day5Es, 6: day6Es, 7: day7Es, 8: day8Es, 9: day9Es, 10: day10Es },
  en: { 1: day1En, 2: day2En, 3: day3En, 4: day4En, 5: day5En, 6: day6En, 7: day7En, 8: day8En, 9: day9En, 10: day10En },
};

function getEmailForDay(dayN, lang, name) {
  const safeLang = lang === 'en' ? 'en' : 'es';
  const fn = TEMPLATES[safeLang][dayN];
  if (!fn) return null;
  return {
    subject: SUBJECTS[safeLang][dayN],
    html: fn(name || ''),
  };
}

module.exports = { getEmailForDay };
