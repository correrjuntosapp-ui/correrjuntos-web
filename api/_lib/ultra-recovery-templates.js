// ============================================================
// Ultra Recovery Drip — 10-day email plan post-ultra
//
// [10 may 2026 v3] Visual extracted from Supabase Auth template
// "Confirm signup" (Meridian Motion editorial system). Replaces the
// previous Brevo DOI #3 approximation. Founder feedback:
//   "ese tono visual era el ibamos a seguir en los correos"
//
// Design system (memorized in CLAUDE.md):
//   • Background #0b1220 (dark navy)
//   • Body text #f6f1e8 (warm cream)
//   • Brand orange #f97316
//   • Inter (body) + JetBrains Mono (eyebrows / metadata)
//   • H1 weight 200 (ultra-thin) with <strong> weight 700 in orange
//   • Eyebrow with orange dot bullet + uppercase tracked
//   • Tagline divider with line + "CORRE ACOMPAÑADO"
//   • CTA solid orange with DARK text (premium feel, no gradient)
//   • Footer "Meridian Motion · correrjuntos.com" tracked mono micro
// ============================================================

const ORANGE = '#f97316';
const BG = '#0b1220';
const TEXT = '#f6f1e8';
const TEXT_72 = 'rgba(246,241,232,0.72)';
const TEXT_42 = 'rgba(246,241,232,0.42)';
const TEXT_28 = 'rgba(246,241,232,0.28)';
const BORDER_08 = 'rgba(246,241,232,0.08)';
const BORDER_12 = 'rgba(246,241,232,0.12)';
const FONT_BODY = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const FONT_MONO = "'JetBrains Mono',SFMono-Regular,Consolas,Menlo,monospace";

/**
 * Meridian Motion editorial shell.
 *
 * @param {Object} opts
 * @param {string} opts.eyebrow      — uppercase metadata, ej "Recuperación · Día 1"
 * @param {string} opts.tagline      — "CORRE ACOMPAÑADO" or variant
 * @param {string} opts.h1Pre        — first part of H1 (regular weight, cream)
 * @param {string} opts.h1Strong     — highlighted word (weight 700, orange)
 * @param {string} opts.h1Post       — trailing punctuation (default "."
 * @param {string} opts.body         — main body HTML (paragraphs, lists)
 * @param {string} [opts.ctaUrl]     — primary CTA (optional)
 * @param {string} [opts.ctaLabel]   — primary CTA label (default "Continuar →")
 * @param {string} [opts.preheader]  — hidden preview text in inbox
 * @param {string} [opts.lang]       — 'es' | 'en'
 */
function shell({ eyebrow, tagline, h1Pre, h1Strong, h1Post = '.', body, ctaUrl, ctaLabel = 'Continuar →', preheader = '', lang = 'es' }) {
  const taglineHtml = tagline
    ? `<tr><td style="padding:30px 44px 0 44px;">
         <div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:${ORANGE};font-weight:500;">
           <span style="display:inline-block;width:36px;height:1px;background:${ORANGE};vertical-align:middle;margin-right:12px;"></span>${tagline}
         </div>
       </td></tr>`
    : '';

  const ctaHtml = ctaUrl
    ? `<tr><td style="padding:36px 44px 0 44px;">
         <table role="presentation" cellpadding="0" cellspacing="0" border="0">
           <tr><td bgcolor="${ORANGE}" style="border-radius:10px;">
             <a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:16px 32px;font-family:${FONT_BODY};font-size:15px;font-weight:600;color:${BG};text-decoration:none;border-radius:10px;letter-spacing:0.01em;">${ctaLabel}</a>
           </td></tr>
         </table>
       </td></tr>`
    : '';

  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>CorrerJuntos</title></head><body style="margin:0;padding:0;background:${BG};font-family:${FONT_BODY};color:${TEXT};-webkit-font-smoothing:antialiased;">
<div style="display:none;font-size:1px;color:${BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:48px 16px;">
<tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:${BG};border:1px solid ${BORDER_08};border-radius:20px;overflow:hidden;">
    <tr><td style="padding:36px 44px 0 44px;"><span style="display:inline-block;width:10px;height:10px;background:${ORANGE};border-radius:999px;"></span></td></tr>
    <tr><td style="padding:14px 44px 0 44px;">
      <div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${TEXT_42};font-weight:500;">
        <span style="color:${ORANGE};">&bull;</span>&nbsp;&nbsp;${eyebrow}
      </div>
    </td></tr>
    ${taglineHtml}
    <tr><td style="padding:30px 44px 0 44px;">
      <h1 style="margin:0;font-family:${FONT_BODY};font-size:44px;line-height:0.96;letter-spacing:-0.035em;font-weight:200;color:${TEXT};">${h1Pre} <strong style="font-weight:700;color:${ORANGE};font-style:normal;">${h1Strong}</strong>${h1Post}</h1>
    </td></tr>
    <tr><td style="padding:28px 44px 0 44px;">${body}</td></tr>
    ${ctaHtml}
    <tr><td style="padding:30px 44px 34px 44px;">
      <div style="border-top:1px solid ${BORDER_12};padding-top:26px;">
        <div style="font-family:${FONT_BODY};font-size:26px;font-weight:800;letter-spacing:-0.03em;color:${TEXT};line-height:1;">Correr<em style="font-style:normal;color:${ORANGE};">Juntos</em></div>
        <div style="margin-top:8px;font-family:${FONT_MONO};font-size:11px;letter-spacing:0.08em;color:${ORANGE};"><a href="mailto:hola@correrjuntos.com" style="color:${ORANGE};text-decoration:none;">hola@correrjuntos.com</a></div>
      </div>
    </td></tr>
  </table>
  <div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${TEXT_28};margin-top:26px;font-weight:500;">
    Meridian Motion &middot; <a href="https://www.correrjuntos.com" style="color:${TEXT_42};text-decoration:none;">correrjuntos.com</a>
  </div>
</td></tr>
</table>
</body></html>`;
}

// ─── Body building blocks ──────────────────────────────────
const para = (txt) => `<p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${txt}</p>`;
const paraLast = (txt) => `<p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${txt}</p>`;
const lead = (txt) => `<p style="margin:0 0 22px 0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${txt}</p>`;
const list = (items) => `<ul style="margin:0 0 22px 0;padding-left:18px;font-size:14.5px;line-height:1.85;color:${TEXT_72};font-weight:400;">${items.map(i => `<li style="margin-bottom:6px;">${i}</li>`).join('')}</ul>`;
const callout = (label, body) => `<div style="margin:0 0 22px 0;padding:18px 20px;background:rgba(249,115,22,0.06);border:1px solid rgba(249,115,22,0.16);border-radius:10px;">
  <div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${ORANGE};font-weight:500;margin-bottom:8px;">${label}</div>
  <div style="font-size:14px;line-height:1.65;color:${TEXT_72};">${body}</div>
</div>`;
const warn = (label, body) => `<div style="margin:0 0 22px 0;padding:18px 20px;background:rgba(220,38,38,0.06);border:1px solid rgba(220,38,38,0.18);border-radius:10px;">
  <div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#f87171;font-weight:500;margin-bottom:8px;">${label}</div>
  <div style="font-size:14px;line-height:1.65;color:${TEXT_72};">${body}</div>
</div>`;
const strongCream = (txt) => `<strong style="color:${TEXT};font-weight:600;">${txt}</strong>`;

// Build subject + preheader pair
const SUBJECTS = {
  es: {
    1: 'Día 1 · Hoy NO toca correr',
    2: 'Día 2 · La inflamación gana el partido',
    3: 'Día 3 · Caminar + estiramientos',
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

// Common eyebrow + tagline for the drip
const eyebrowFor = (n, lang) => `${lang === 'en' ? 'Recovery' : 'Recuperación'} · Día ${String(n).padStart(2, '0')}`;
const TAGLINE = {
  es: 'CORRE ACOMPAÑADO',
  en: 'RUN TOGETHER',
};

// ─────────────────────────────────────────────────────────────
// DAYS ES (1-10)
// ─────────────────────────────────────────────────────────────

const day1Es = (name) => shell({
  eyebrow: eyebrowFor(1, 'es'),
  tagline: TAGLINE.es,
  h1Pre: `Hoy ${name ? name + ',' : ''} NO`,
  h1Strong: 'corres',
  h1Post: '.',
  preheader: 'Lo más importante hoy es no hacer nada. Bienvenido al Día 1.',
  body: lead(`Tu cuerpo terminó una de las pruebas más exigentes que existen. Las próximas 24-48h definen cómo recuperas.`)
       + para(`Foco del día — ${strongCream('descanso real')}:`)
       + list([
           `${strongCream('Hidratación:')} 30-40 ml/kg de peso. Si pesas 70 kg → 2,1-2,8 L. Añade sales (electrolitos) en 1L.`,
           `${strongCream('Comida:')} proteína (1,5-2 g/kg) + carbohidratos cada 3h. Tu glucógeno está en suelo.`,
           `${strongCream('Sueño:')} 9-10h esta noche. La recuperación real ocurre durmiendo.`,
           `${strongCream('Movimiento:')} caminar 10-15 min después de comer. Nada más.`,
         ])
       + callout('Tip del coach', `Hoy va a doler todo. Es normal. Si hay dolor punzante en una zona concreta (no muscular general), apúntalo y vigila los próximos días.`)
       + paraLast(`Mañana toca el Día 2. Sigue el plan, no te lo saltes — incluso descansar tiene técnica.`),
  lang: 'es',
});

const day2Es = (name) => shell({
  eyebrow: eyebrowFor(2, 'es'),
  tagline: TAGLINE.es,
  h1Pre: 'La inflamación',
  h1Strong: 'gana',
  h1Post: ' el partido.',
  preheader: 'Hoy probablemente te encuentras peor que ayer. Es normal.',
  body: lead(`Es normal y esperado — la inflamación post-ultra suele picar en h36-48. No es retroceso.`)
       + list([
           `${strongCream('Hidratación + sales:')} sigue. La orina debe estar clara/amarilla pálida.`,
           `${strongCream('Antiinflamatorio natural:')} cúrcuma, jengibre, omega-3, cerezas/granada.`,
           `${strongCream('Frío suave:')} 10 min agua fría en piernas (no hielo).`,
           `${strongCream('Cero AINE rutinario:')} ibuprofeno enmascara dolor pero retrasa adaptación.`,
         ])
       + warn('Señal de alarma', `Si tu orina sale color cola/oscura, o tienes dolor muscular extremo + debilidad → urgencias. Posible rabdomiólisis tras ultra.`)
       + paraLast(`Camina 20 min hoy a paso suave. Nada más.`),
  lang: 'es',
});

const day3Es = (name) => shell({
  eyebrow: eyebrowFor(3, 'es'),
  tagline: TAGLINE.es,
  h1Pre: 'Caminar y',
  h1Strong: 'estirar',
  h1Post: '.',
  preheader: 'A día 3 ya empiezas a notar mejora. Hoy sí toca movimiento ligero.',
  body: lead(`Las agujetas más fuertes deberían ir cediendo. Hoy ${strongCream('sí toca movimiento ligero')}.`)
       + para(`Sesión del día (30 minutos total):`)
       + list([
           `${strongCream('Caminar 25 min')} a ritmo de paseo. Plano, sin desniveles fuertes.`,
           `${strongCream('Estiramientos 5 min')} suaves: gemelos, isquios, cuádriceps, glúteos, lumbar. Sin rebotes, mantén 30s cada zona.`,
           `${strongCream('Foam roller')} (si tienes): pasadas LENTAS por gemelos, cuádriceps, banda IT. 2 min cada zona.`,
         ])
       + callout('Ojo con', `Si una zona en concreto pincha al estirar, NO insistas. La recuperación pasa por respetar señales, no forzarlas.`)
       + paraLast(`Mañana toca reflexión: ¿qué aprendiste de la carrera?`),
  lang: 'es',
});

const day4Es = (name) => shell({
  eyebrow: eyebrowFor(4, 'es'),
  tagline: TAGLINE.es,
  h1Pre: 'Tu carrera,',
  h1Strong: 'en frío',
  h1Post: '.',
  preheader: 'Las primeras 72h fueron físicas. Hoy empezamos la parte mental.',
  body: lead(`Coge papel o notas en el móvil y responde:`)
       + list([
           `¿Qué funcionó mejor de lo esperado?`,
           `¿Qué se quebró antes de tiempo? (estómago, energía, mental, físico…)`,
           `¿En qué km/zona la pasé peor? ¿Por qué?`,
           `¿Qué nutrición/equipamiento NO repetiría?`,
           `¿Cuál es el aprendizaje más importante para mi próxima ultra?`,
         ])
       + callout('Por qué esto importa', `Los runners que registran lecciones por escrito mejoran 30-40% más rápido que los que solo "lo guardan en la cabeza". El detalle se borra en 1 semana.`)
       + paraLast(`Físicamente: 30 min caminar + estiramientos otra vez. Sin presión.`),
  lang: 'es',
});

const day5Es = (name) => shell({
  eyebrow: eyebrowFor(5, 'es'),
  tagline: TAGLINE.es,
  h1Pre: 'Primer rodaje',
  h1Strong: 'cortito',
  h1Post: '.',
  preheader: 'Si te encuentras al 80% o mejor, hoy puedes salir.',
  body: lead(`Si todavía hay molestias musculares fuertes, sigue caminando otro día más — sin culpa.`)
       + list([
           `${strongCream('Trote SUAVE 20-25 min.')} RPE 3-4/10. Si puedes hablar frases largas, perfecto.`,
           `Plano. Sin pendientes ni terreno técnico.`,
           `${strongCream('Si duele algo concreto al primer km, PARA.')} No es debilidad, es inteligencia.`,
           `Estiramientos 5 min al terminar.`,
         ])
       + callout('Regla de oro', `En recuperación post-ultra, "menos es más" siempre. Forzar 1 sesión te puede costar 2 semanas extra de inactividad por lesión. La paciencia es performance.`)
       + paraLast(`Si decides no salir hoy, no pasa nada. Caminar 30 min funciona igual.`),
  lang: 'es',
});

const day6Es = (name) => shell({
  eyebrow: eyebrowFor(6, 'es'),
  tagline: TAGLINE.es,
  h1Pre: 'Hoy',
  h1Strong: 'no corres',
  h1Post: '.',
  preheader: 'Aunque te apetezca. Tu cuerpo está reparando microfibras.',
  body: lead(`En su lugar, foco en sueño:`)
       + list([
           `Cena ligera y temprano (3h antes de dormir).`,
           `Sin pantallas 30 min antes.`,
           `Habitación fresca (18-20°C) y oscura.`,
           `Magnesio (300-400 mg) si tienes molestias en piernas para dormir.`,
           `Apunta tu hora de despertar y sensación. Quieres ir hacia "fresco al despertar".`,
         ])
       + callout('Dato', `En sueño profundo se libera la mayor parte de hormona de crecimiento (GH), responsable de la reparación muscular. Dormir 8h vs 6h post-ultra = 30% más rápida recuperación medible en marcadores como CK.`),
  lang: 'es',
});

const day7Es = (name) => shell({
  eyebrow: eyebrowFor(7, 'es'),
  tagline: TAGLINE.es,
  h1Pre: 'Una semana',
  h1Strong: 'después',
  h1Post: '.',
  preheader: 'Test honesto antes de salir.',
  body: lead(`Hoy puedes salir 30-40 min de trote suave si te apetece. Pero quiero que primero te observes.`)
       + para(`Test rápido (de pie, descansado):`)
       + list([
           `${strongCream('Frecuencia cardíaca en reposo:')} ¿cerca de tu valor normal? Si está ≥10 lpm por encima, sigue cansado.`,
           `${strongCream('Energía general:')} ¿la del 1 al 10? Solo sales si estás ≥6.`,
           `${strongCream('Apetito:')} ¿normal? Si bajo, el cuerpo todavía pide reservas.`,
           `${strongCream('Motivación:')} ¿real o forzada? La forzada lleva a sesiones malas.`,
         ])
       + paraLast(`Si todo OK, sal a trotar 30-40 min muy suave. Si algo no, caminar y mañana otra vez.`)
       + callout('Una semana', `Esta es la primera evaluación honesta. La recuperación REAL puede tardar 2-3 semanas tras una ultra de 100+. No tengas prisa.`),
  lang: 'es',
});

const day8Es = (name) => shell({
  eyebrow: eyebrowFor(8, 'es'),
  tagline: TAGLINE.es,
  h1Pre: 'Vuelta',
  h1Strong: 'gradual',
  h1Post: '.',
  preheader: 'Si día 7 fue bien, hoy puedes subir un poco.',
  body: lead(`Trote suave 40-50 min. Sigue siendo recuperación, no entrenamiento.`)
       + list([
           `40-50 min Z1-Z2 (RPE 3-4). Sin progresiones, sin sprints, sin tempo.`,
           `Si puedes, terreno blando (tierra, hierba) — más amable con tendones.`,
           `Hidratación + comida pre/post como cualquier sesión.`,
           `5 min de movilidad articular al volver: tobillos, caderas, hombros.`,
         ])
       + callout('Mira', `A día 8 muchos runners cometen el error clásico: "ya estoy bien" → meten una sesión fuerte → reincidencia. La regla: 2 semanas mínimo de Z1-Z2 después de cualquier ultra.`),
  lang: 'es',
});

const day9Es = (name) => shell({
  eyebrow: eyebrowFor(9, 'es'),
  tagline: TAGLINE.es,
  h1Pre: 'Rodaje y',
  h1Strong: 'reflexión',
  h1Post: '.',
  preheader: 'Penúltimo día. Hoy: 40-60 min suaves + revisita lo que apuntaste.',
  body: lead(`Vuelve a tus notas del día 4 y pregunta:`)
       + list([
           `¿Lo que aprendí ya está claro?`,
           `¿Qué cambiaría en mi próxima preparación? (volumen, intensidad, dieta, equipamiento)`,
           `¿Qué carrera viene después? (siguiente ultra, o un objetivo intermedio tipo 21K-42K)`,
           `¿Cuándo quiero estar listo y de qué?`,
         ])
       + callout('Siguiente nivel', `La diferencia entre un runner que mejora y uno que se estanca: el que mejora planifica el "siguiente reto" antes de que el actual se enfríe. Mañana te ayudamos.`),
  lang: 'es',
});

const day10Es = (name) => shell({
  eyebrow: eyebrowFor(10, 'es'),
  tagline: TAGLINE.es,
  h1Pre: 'Lo has',
  h1Strong: 'logrado',
  h1Post: '.',
  preheader: 'Cuerpo reseteado. ¿Cuál es tu próxima ultra?',
  body: lead(`${name || 'Crack'}, has terminado 10 días de recuperación estructurada. Ahora viene lo importante: ¿cuál es tu próxima ultra?`)
       + para(`Si vas a por otra carrera grande (UTMB, Penyagolosa, Transgrancanaria, otra Ronda…), tienes dos opciones:`)
       + list([
           `${strongCream('Improvisar:')} como muchos hicieron antes de su última ultra. Funcionó, pero pagaste el precio en zonas que ya conoces.`,
           `${strongCream('Plan estructurado:')} 16-20 semanas adaptadas a tu fecha objetivo, ritmo real, días disponibles, y nivel actual.`,
         ])
       + callout('CorrerJuntos Premium', `Plan adaptativo para tu próxima ultra · Coach IA que ajusta semana a semana · Tracking GPS · Comunidad runners cerca de ti · 14 días gratis, después 4,99€/mes.`)
       + paraLast(`Lo que has hecho estos 10 días no lo hace casi nadie. ${strongCream('Eso ya te diferencia.')}`),
  ctaUrl: 'https://www.correrjuntos.com/app',
  ctaLabel: 'Empezar 14 días gratis  →',
  lang: 'es',
});

// ─────────────────────────────────────────────────────────────
// DAYS EN (1-10) — concise English versions
// ─────────────────────────────────────────────────────────────

const day1En = (name) => shell({
  eyebrow: eyebrowFor(1, 'en'),
  tagline: TAGLINE.en,
  h1Pre: `Today ${name ? name + ',' : ''} you don't`,
  h1Strong: 'run',
  h1Post: '.',
  preheader: 'Most important today: real rest. Welcome to Day 1.',
  body: lead(`Your body just finished one of the toughest events out there. The next 24-48h define how you recover.`)
       + para(`Today's focus — ${strongCream('real rest')}:`)
       + list([
           `${strongCream('Hydration:')} 30-40 ml/kg of body weight. 70 kg → 2.1-2.8 L. Add electrolytes to 1L.`,
           `${strongCream('Food:')} protein (1.5-2 g/kg) + carbs every 3h. Your glycogen is at zero.`,
           `${strongCream('Sleep:')} 9-10h tonight. Real recovery happens sleeping.`,
           `${strongCream('Movement:')} 10-15 min walk after meals. Nothing more.`,
         ])
       + callout('Coach tip', `Today everything will hurt. That's normal. If there's sharp pain in a specific spot, note it and watch the next days.`),
  lang: 'en',
});

const day2En = (name) => shell({
  eyebrow: eyebrowFor(2, 'en'),
  tagline: TAGLINE.en,
  h1Pre: 'Inflammation',
  h1Strong: 'peaks',
  h1Post: '.',
  preheader: 'You probably feel worse than yesterday. Normal and expected.',
  body: lead(`Post-ultra inflammation peaks at h36-48. Not a setback.`)
       + list([
           `${strongCream('Hydration + electrolytes:')} keep going. Urine should be clear/pale yellow.`,
           `${strongCream('Natural anti-inflammatory:')} turmeric, ginger, omega-3, cherries.`,
           `${strongCream('Cool water:')} 10 min on legs (not ice).`,
           `${strongCream('No routine NSAIDs:')} ibuprofen masks pain but delays adaptation.`,
         ])
       + warn('Warning sign', `If urine is cola-colored/dark, or you have extreme muscle pain + weakness → ER. Possible rhabdomyolysis.`)
       + paraLast(`Walk 20 min today at easy pace. Nothing more.`),
  lang: 'en',
});

const day3En = (name) => shell({
  eyebrow: eyebrowFor(3, 'en'),
  tagline: TAGLINE.en,
  h1Pre: 'Walk and',
  h1Strong: 'stretch',
  h1Post: '.',
  preheader: 'By day 3 you start feeling better. Gentle movement.',
  body: lead(`Session (30 min total):`)
       + list([
           `${strongCream('Walk 25 min')} at easy pace. Flat ground.`,
           `${strongCream('Gentle stretches 5 min:')} calves, hamstrings, quads, glutes, lower back. No bouncing, hold 30s each.`,
           `${strongCream('Foam roller')} if you have one: SLOW passes on calves, quads, IT band. 2 min each.`,
         ])
       + callout('Watch', `If a specific spot hurts when stretching, DON'T push. Recovery means respecting signals.`),
  lang: 'en',
});

const day4En = (name) => shell({
  eyebrow: eyebrowFor(4, 'en'),
  tagline: TAGLINE.en,
  h1Pre: 'Your race,',
  h1Strong: 'in cold',
  h1Post: '.',
  preheader: 'First 72h were physical. Today the mental part.',
  body: lead(`Grab paper or phone notes:`)
       + list([
           `What worked better than expected?`,
           `What broke earlier than planned (stomach, energy, mental, physical)?`,
           `Which km/section was hardest? Why?`,
           `What nutrition/gear would NOT repeat?`,
           `Most important lesson for my next ultra?`,
         ])
       + callout('Why this matters', `Runners who write down lessons improve 30-40% faster than those who just "remember". Detail fades in 1 week.`),
  lang: 'en',
});

const day5En = (name) => shell({
  eyebrow: eyebrowFor(5, 'en'),
  tagline: TAGLINE.en,
  h1Pre: 'First short',
  h1Strong: 'jog',
  h1Post: '.',
  preheader: 'If you feel 80% or better, you can do your first easy jog.',
  body: lead(`Still sore? Keep walking another day — no guilt.`)
       + list([
           `${strongCream('EASY jog 20-25 min.')} RPE 3-4/10. Talk in full sentences.`,
           `Flat. No hills, no technical terrain.`,
           `${strongCream('If something specific hurts at km 1, STOP.')} Not weakness, intelligence.`,
           `Stretches 5 min after.`,
         ])
       + callout('Golden rule', `Post-ultra, "less is more" always. One forced session can cost you 2 extra weeks of injury layoff.`),
  lang: 'en',
});

const day6En = (name) => shell({
  eyebrow: eyebrowFor(6, 'en'),
  tagline: TAGLINE.en,
  h1Pre: "Today don't",
  h1Strong: 'run',
  h1Post: '.',
  preheader: "Even if you want to. Body is repairing micro-fibers.",
  body: lead(`Focus on sleep:`)
       + list([
           `Light dinner, early (3h before bed).`,
           `No screens 30 min before.`,
           `Cool room (18-20°C), dark.`,
           `Magnesium (300-400 mg) if legs are restless.`,
           `Track wake-up time and feeling.`,
         ])
       + callout('Fact', `Most growth hormone is released in deep sleep. 8h vs 6h post-ultra = 30% faster recovery measurable in CK markers.`),
  lang: 'en',
});

const day7En = (name) => shell({
  eyebrow: eyebrowFor(7, 'en'),
  tagline: TAGLINE.en,
  h1Pre: 'One week',
  h1Strong: 'in',
  h1Post: '.',
  preheader: 'Honest test before going out.',
  body: lead(`Quick test (standing, rested):`)
       + list([
           `${strongCream('Resting heart rate:')} near your normal? If ≥10 bpm above, still tired.`,
           `${strongCream('General energy:')} 1-10 scale? Only run if ≥6.`,
           `${strongCream('Appetite:')} normal? If low, body still asking reserves.`,
           `${strongCream('Motivation:')} real or forced? Forced leads to bad sessions.`,
         ])
       + callout('One week mark', `REAL recovery may take 2-3 weeks after a 100+ ultra. No rush.`),
  lang: 'en',
});

const day8En = (name) => shell({
  eyebrow: eyebrowFor(8, 'en'),
  tagline: TAGLINE.en,
  h1Pre: 'Gradual',
  h1Strong: 'return',
  h1Post: '.',
  preheader: 'If day 7 went well, you can step up.',
  body: lead(`Easy jog 40-50 min. Still recovery, not training.`)
       + list([
           `40-50 min Z1-Z2 (RPE 3-4). No progressions, no sprints, no tempo.`,
           `Soft terrain if possible (dirt, grass) — kinder to tendons.`,
           `Hydration + food pre/post like any session.`,
           `5 min joint mobility after: ankles, hips, shoulders.`,
         ])
       + callout('Listen', `Day 8 is when many runners make the classic mistake: 'I'm fine' → hard session → relapse. Rule: 2 weeks minimum of Z1-Z2 after any ultra.`),
  lang: 'en',
});

const day9En = (name) => shell({
  eyebrow: eyebrowFor(9, 'en'),
  tagline: TAGLINE.en,
  h1Pre: 'Jog and',
  h1Strong: 'reflect',
  h1Post: '.',
  preheader: 'Second-to-last day. Revisit your day-4 notes.',
  body: lead(`Back to your notes:`)
       + list([
           `Are the lessons clear?`,
           `What would I change in my next prep? (volume, intensity, diet, gear)`,
           `What race comes next?`,
           `When do I want to be ready, and for what?`,
         ])
       + callout('Next level', `The runner who improves plans the "next challenge" before the current one cools down.`),
  lang: 'en',
});

const day10En = (name) => shell({
  eyebrow: eyebrowFor(10, 'en'),
  tagline: TAGLINE.en,
  h1Pre: "You made",
  h1Strong: 'it',
  h1Post: '.',
  preheader: "Body is reset. What's your next ultra?",
  body: lead(`${name || 'Crack'}, you finished 10 days of structured recovery. Now the important part.`)
       + para(`If you target another big race, two options:`)
       + list([
           `${strongCream('Improvise:')} like many did before their last ultra. Worked, but you paid the price.`,
           `${strongCream('Structured plan:')} 16-20 weeks adapted to your target date, real pace, available days.`,
         ])
       + callout('CorrerJuntos Premium', `Adaptive plan for your next ultra · AI Coach · GPS tracking · Runners community · 14 days free, then $4.99/mo.`)
       + paraLast(`What you did these 10 days, almost no one does. ${strongCream('That sets you apart.')}`),
  ctaUrl: 'https://www.correrjuntos.com/app',
  ctaLabel: 'Start 14-day free trial  →',
  lang: 'en',
});

// ─── Public API ─────────────────────────────────────────────
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

export { getEmailForDay };
