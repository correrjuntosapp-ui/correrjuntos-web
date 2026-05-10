// ============================================================
// Trial Lifecycle Email Templates — ES + EN
// 5 emails over 14 days: 1, 3, 7, 11, 14
//
// [10 may 2026 v3] Visual: Meridian Motion editorial system
// extracted from Supabase Auth "Confirm signup" template.
// See ultra-recovery-templates.js for full design tokens.
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

const para = (txt) => `<p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${txt}</p>`;
const paraLast = (txt) => `<p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${txt}</p>`;
const lead = (txt) => `<p style="margin:0 0 22px 0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${txt}</p>`;
const list = (items) => `<ul style="margin:0 0 22px 0;padding-left:18px;font-size:14.5px;line-height:1.85;color:${TEXT_72};font-weight:400;">${items.map(i => `<li style="margin-bottom:6px;">${i}</li>`).join('')}</ul>`;
const callout = (label, body) => `<div style="margin:0 0 22px 0;padding:18px 20px;background:rgba(249,115,22,0.06);border:1px solid rgba(249,115,22,0.16);border-radius:10px;">
  <div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${ORANGE};font-weight:500;margin-bottom:8px;">${label}</div>
  <div style="font-size:14px;line-height:1.65;color:${TEXT_72};">${body}</div>
</div>`;
const strongCream = (txt) => `<strong style="color:${TEXT};font-weight:600;">${txt}</strong>`;

const eyebrowFor = (n, lang) => `${lang === 'en' ? 'Trial' : 'Trial'} · Día ${String(n).padStart(2, '0')}`;
const TAGLINE = { es: 'CORRE ACOMPAÑADO', en: 'RUN TOGETHER' };

// ─── Day 1 — How was your first run? ─────────────────────────
const day1Es = (name) => shell({
  eyebrow: eyebrowFor(1, 'es'),
  tagline: TAGLINE.es,
  h1Pre: '¿Qué tal tu primera',
  h1Strong: 'salida',
  h1Post: '?',
  preheader: 'Empezar es la parte más difícil. Hoy es el día.',
  body: lead(`${name ? name + ', e' : 'E'}mpezar es la parte más difícil. Si ayer saliste a correr — perfecto. Si no — hoy es el día.`)
       + para(`Tu trial Premium sigue activo. Tienes acceso a:`)
       + list([
           `Plan personalizado para tu próxima carrera`,
           `Coach AI que ajusta el plan según tu ritmo real`,
           `Matching ilimitado con runners de tu zona`,
         ])
       + paraLast(`Si tienes dudas, responde a este email. Lo lee Abraham, el fundador.`),
  ctaUrl: 'https://www.correrjuntos.com/app',
  ctaLabel: 'Abrir la app  →',
  lang: 'es',
});

const day1En = (name) => shell({
  eyebrow: eyebrowFor(1, 'en'),
  tagline: TAGLINE.en,
  h1Pre: 'How was your first',
  h1Strong: 'run',
  h1Post: '?',
  preheader: 'Starting is the hardest part. Today is the day.',
  body: lead(`${name ? name + ', s' : 'S'}tarting is the hardest part. If you ran yesterday — perfect. If not — today's the day.`)
       + para(`Your Premium trial is still active:`)
       + list([
           `Personalized plan for your next race`,
           `AI Coach that adjusts to your real pace`,
           `Unlimited matching with runners near you`,
         ])
       + paraLast(`Questions? Reply to this email. Abraham (the founder) reads them.`),
  ctaUrl: 'https://www.correrjuntos.com/app',
  ctaLabel: 'Open the app  →',
  lang: 'en',
});

// ─── Day 3 — Strava connect ──────────────────────────────────
const day3Es = (name) => shell({
  eyebrow: eyebrowFor(3, 'es'),
  tagline: TAGLINE.es,
  h1Pre: 'Conecta',
  h1Strong: 'Strava',
  h1Post: ' en 1 click.',
  preheader: 'Olvídate del doble registro.',
  body: lead(`Si ya usas Strava — es 1 clic. Tus carreras de CorrerJuntos pasan automáticamente a Strava, y al revés.`)
       + para(`Para activarlo:`)
       + list([
           `Abre la app → Perfil`,
           `"Integraciones" → Strava → Conectar`,
           `Listo. La próxima carrera se sincroniza sola.`,
         ])
       + paraLast(`¿Usas otro reloj (Garmin, COROS, Apple Watch)? Estamos integrándolos. Si quieres priorizar el tuyo, respóndeme.`),
  ctaUrl: 'https://www.correrjuntos.com/app',
  ctaLabel: 'Conectar Strava  →',
  lang: 'es',
});

const day3En = (name) => shell({
  eyebrow: eyebrowFor(3, 'en'),
  tagline: TAGLINE.en,
  h1Pre: 'Connect',
  h1Strong: 'Strava',
  h1Post: ' in 1 click.',
  preheader: 'No more double-logging.',
  body: lead(`If you already use Strava — it's 1 click. Your CorrerJuntos runs sync automatically.`)
       + para(`To enable:`)
       + list([
           `Open app → Profile`,
           `"Integrations" → Strava → Connect`,
           `Done. Your next run syncs automatically.`,
         ])
       + paraLast(`Use a different watch? We're integrating Garmin, COROS, Apple. Reply to prioritize yours.`),
  ctaUrl: 'https://www.correrjuntos.com/app',
  ctaLabel: 'Connect Strava  →',
  lang: 'en',
});

// ─── Day 7 — Week summary ────────────────────────────────────
const day7Es = (name) => shell({
  eyebrow: eyebrowFor(7, 'es'),
  tagline: TAGLINE.es,
  h1Pre: 'Tu semana en',
  h1Strong: 'datos',
  h1Post: '.',
  preheader: 'Una semana entrenando con plan personalizado.',
  body: lead(`Esto es lo que estás construyendo. Abre la app y mira tu dashboard:`)
       + list([
           `${strongCream('Total km y tiempo')} de tus carreras`,
           `${strongCream('Ritmo medio')} y mejor 1 km`,
           `${strongCream('Próxima sesión')} del plan adaptada a tu progreso`,
         ])
       + callout('Recordatorio', `Tu trial termina en 7 días. Después: 4,99 €/mes. Cancela cuando quieras.`),
  ctaUrl: 'https://www.correrjuntos.com/app',
  ctaLabel: 'Ver mi semana  →',
  lang: 'es',
});

const day7En = (name) => shell({
  eyebrow: eyebrowFor(7, 'en'),
  tagline: TAGLINE.en,
  h1Pre: 'Your week in',
  h1Strong: 'data',
  h1Post: '.',
  preheader: 'One week into your personalized plan.',
  body: lead(`Open the app and check your dashboard. You'll see:`)
       + list([
           `${strongCream('Total km and time')} across your runs`,
           `${strongCream('Average pace')} and fastest km`,
           `${strongCream('Next session')} in your plan, adapted to your progress`,
         ])
       + callout('Reminder', `Your trial ends in 7 days. After that: $4.99/mo. Cancel anytime.`),
  ctaUrl: 'https://www.correrjuntos.com/app',
  ctaLabel: 'See my week  →',
  lang: 'en',
});

// ─── Day 11 — Trial ends in 3 days ───────────────────────────
const day11Es = (name) => shell({
  eyebrow: eyebrowFor(11, 'es'),
  tagline: TAGLINE.es,
  h1Pre: 'Tu trial termina el',
  h1Strong: 'domingo',
  h1Post: '.',
  preheader: 'En 3 días termina tu prueba gratuita.',
  body: lead(`${name ? name + ', e' : 'E'}n 3 días termina tu prueba gratuita. Si decides seguir, tu plan continúa sin interrupción. Si no, vuelves al modo gratuito.`)
       + para(strongCream(`Lo que pierdes si no continúas:`))
       + list([
           `Plan personalizado para tu carrera (4-18 semanas)`,
           `Coach AI que ajusta el plan a tu ritmo`,
           `Matching ilimitado con runners cercanos`,
           `Stats avanzados: VO2max, zonas FC, predicción de ritmo`,
         ])
       + callout('Ahorra 40% con plan anual', `29,99€/año (≈ 2,50€/mes) vs 4,99€/mes. Si vas a usarlo durante varios meses, el anual sale mucho más barato.`)
       + paraLast(`Si quieres cancelar — adelante, sin presión. App Store/Google Play en 2 toques.`),
  ctaUrl: 'https://www.correrjuntos.com/app',
  ctaLabel: 'Gestionar suscripción  →',
  lang: 'es',
});

const day11En = (name) => shell({
  eyebrow: eyebrowFor(11, 'en'),
  tagline: TAGLINE.en,
  h1Pre: 'Your trial ends',
  h1Strong: 'Sunday',
  h1Post: '.',
  preheader: 'In 3 days your free trial ends.',
  body: lead(`${name ? name + ', i' : 'I'}n 3 days your free trial ends. If you keep Premium, your plan continues uninterrupted.`)
       + para(strongCream(`What you lose if you don't continue:`))
       + list([
           `Personalized race plan (4-18 weeks)`,
           `AI Coach that adjusts to your pace`,
           `Unlimited matching with nearby runners`,
           `Advanced stats: VO2max, HR zones, pace predictions`,
         ])
       + callout('Save 40% with annual plan', `$29.99/year (≈ $2.50/mo) vs $4.99/mo.`)
       + paraLast(`Want to cancel — go ahead, no pressure. App Store/Google Play, 2 taps.`),
  ctaUrl: 'https://www.correrjuntos.com/app',
  ctaLabel: 'Manage subscription  →',
  lang: 'en',
});

// ─── Day 14 — Trial ended ────────────────────────────────────
const day14Es = (name) => shell({
  eyebrow: eyebrowFor(14, 'es'),
  tagline: TAGLINE.es,
  h1Pre: 'Sigues entrenando, la app',
  h1Strong: 'sigue',
  h1Post: ' contigo.',
  preheader: 'Tu trial Premium ha terminado. Pero tu progreso no.',
  body: lead(`${name ? name + ', t' : 'T'}u trial Premium ha terminado. Pero tu progreso no — todas tus carreras siguen guardadas, tu nivel sigue ahí, y la versión gratuita es 100% usable.`)
       + paraLast(`Si en algún momento quieres recuperar el plan personalizado y el matching ilimitado, está disponible cuando tú decidas — sin reset, sin perder progreso.`)
       + callout('Una pregunta', `¿Qué te haría volver a Premium? Responde a este mail con cualquier feedback — me ayuda a mejorar la app. — Abraham, fundador`),
  ctaUrl: 'https://www.correrjuntos.com/app',
  ctaLabel: 'Sigo corriendo  →',
  lang: 'es',
});

const day14En = (name) => shell({
  eyebrow: eyebrowFor(14, 'en'),
  tagline: TAGLINE.en,
  h1Pre: 'You keep running, the app',
  h1Strong: 'stays',
  h1Post: ' with you.',
  preheader: "Your Premium trial has ended. But your progress hasn't.",
  body: lead(`${name ? name + ', y' : 'Y'}our Premium trial has ended. But your progress hasn't — all your runs are saved, your level is intact.`)
       + paraLast(`Whenever you want the personalized plan and unlimited matching back, it's there — no reset, no progress loss.`)
       + callout('One question', `What would bring you back to Premium? Reply with any feedback — it helps me improve. — Abraham, founder`),
  ctaUrl: 'https://www.correrjuntos.com/app',
  ctaLabel: 'Keep running  →',
  lang: 'en',
});

// ─── Public API ──────────────────────────────────────────────
const SUBJECTS = {
  es: {
    1: '¿Qué tal tu primera salida?',
    3: 'Conecta Strava en 1 click',
    7: 'Tu primera semana en datos',
    11: 'Tu trial termina el domingo',
    14: 'Tu trial ha terminado — pero tu progreso no',
  },
  en: {
    1: 'How was your first run?',
    3: 'Connect Strava in 1 click',
    7: 'Your first week in data',
    11: 'Your trial ends Sunday',
    14: "Trial ended — but your progress didn't",
  },
};

const TEMPLATES = {
  es: { 1: day1Es, 3: day3Es, 7: day7Es, 11: day11Es, 14: day14Es },
  en: { 1: day1En, 3: day3En, 7: day7En, 11: day11En, 14: day14En },
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
