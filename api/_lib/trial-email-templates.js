// ============================================================
// Trial Lifecycle Email Templates — ES + EN
// 5 emails over 14 days: 1, 3, 7, 11, 14
//
// Style: minimalist + brand orange #f97316 + clear single CTA.
// All HTML inlined (no external CSS, image fetches OK from
// correrjuntos.com domain only).
// ============================================================

const BRAND_ORANGE = '#f97316';
const TEXT_DARK = '#0b1220';
const TEXT_MUTED = '#6b7280';
const BG_LIGHT = '#fef7ed';
const BORDER = '#e5e7eb';

// Wrapper: single column, max-width 560px, system fonts.
function shell(content, lang) {
  const footer = lang === 'en'
    ? `
      <p style="margin:0;font-size:12px;color:${TEXT_MUTED};text-align:center">
        CorrerJuntos · Train smarter, run faster<br>
        <a href="https://www.correrjuntos.com" style="color:${TEXT_MUTED}">correrjuntos.com</a>
        ·
        <a href="https://www.correrjuntos.com/unsubscribe?email={{contact.EMAIL}}" style="color:${TEXT_MUTED}">Unsubscribe</a>
      </p>`
    : `
      <p style="margin:0;font-size:12px;color:${TEXT_MUTED};text-align:center">
        CorrerJuntos · Entrena mejor, corre más fuerte<br>
        <a href="https://www.correrjuntos.com" style="color:${TEXT_MUTED}">correrjuntos.com</a>
        ·
        <a href="https://www.correrjuntos.com/unsubscribe?email={{contact.EMAIL}}" style="color:${TEXT_MUTED}">Darme de baja</a>
      </p>`;

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CorrerJuntos</title>
</head>
<body style="margin:0;padding:0;background:${BG_LIGHT};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${TEXT_DARK}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG_LIGHT};padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid ${BORDER};border-radius:12px;max-width:560px">
        <tr><td style="padding:32px 32px 24px 32px;border-bottom:1px solid ${BORDER}">
          <a href="https://www.correrjuntos.com" style="text-decoration:none">
            <span style="display:inline-block;font-size:22px;font-weight:800;color:${BRAND_ORANGE};letter-spacing:-0.5px">CorrerJuntos</span>
          </a>
        </td></tr>
        <tr><td style="padding:32px">
          ${content}
        </td></tr>
        <tr><td style="padding:24px 32px;background:${BG_LIGHT};border-top:1px solid ${BORDER};border-radius:0 0 12px 12px">
          ${footer}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(url, label) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0">
      <tr><td>
        <a href="${url}" style="display:inline-block;background:${BRAND_ORANGE};color:#ffffff;padding:14px 28px;border-radius:10px;font-weight:700;font-size:16px;text-decoration:none">${label}</a>
      </td></tr>
    </table>`;
}

// ─────────────────────────────────────────────────────────────
// Day 1 — "How was your first run?"
// Goal: bring them back the day after install.
// ─────────────────────────────────────────────────────────────
function day1Es(name) {
  return shell(`
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;line-height:1.3">¿Qué tal tu primera salida, ${name || 'corredor'}?</h1>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      Empezar es la parte más difícil. Si ayer saliste a correr — perfecto. Si no — hoy es el día.
    </p>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      Tu trial Premium sigue activo. Tienes acceso a:
    </p>
    <ul style="margin:0 0 16px 0;padding-left:20px;font-size:15px;line-height:1.8;color:${TEXT_DARK}">
      <li>Plan personalizado para tu próxima carrera</li>
      <li>Coach AI que ajusta el plan según tu ritmo real</li>
      <li>Matching ilimitado con runners de tu zona</li>
    </ul>
    ${ctaButton('https://www.correrjuntos.com/app', 'Abrir la app')}
    <p style="margin:24px 0 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.5">
      Si tienes dudas, responde a este email. Lo lee Abraham, el fundador.
    </p>
  `, 'es');
}

function day1En(name) {
  return shell(`
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;line-height:1.3">How was your first run, ${name || 'runner'}?</h1>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      Starting is the hardest part. If you ran yesterday — perfect. If not — today's the day.
    </p>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      Your Premium trial is still active. You have access to:
    </p>
    <ul style="margin:0 0 16px 0;padding-left:20px;font-size:15px;line-height:1.8;color:${TEXT_DARK}">
      <li>Personalized plan for your next race</li>
      <li>AI Coach that adjusts to your real pace</li>
      <li>Unlimited matching with runners near you</li>
    </ul>
    ${ctaButton('https://www.correrjuntos.com/app', 'Open the app')}
    <p style="margin:24px 0 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.5">
      Questions? Just reply to this email. Abraham (the founder) reads them.
    </p>
  `, 'en');
}

// ─────────────────────────────────────────────────────────────
// Day 3 — Strava sync + tips
// Goal: reduce technical friction, increase usage.
// ─────────────────────────────────────────────────────────────
function day3Es(name) {
  return shell(`
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;line-height:1.3">Conecta Strava y olvídate del doble registro</h1>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      Si ya usas Strava — es 1 clic. Tus carreras de CorrerJuntos pasan automáticamente a Strava, y al revés.
    </p>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      Para activarlo:
    </p>
    <ol style="margin:0 0 16px 0;padding-left:20px;font-size:15px;line-height:1.8;color:${TEXT_DARK}">
      <li>Abre la app → Perfil</li>
      <li>"Integraciones" → Strava → Conectar</li>
      <li>Listo. La próxima carrera se sincroniza sola.</li>
    </ol>
    ${ctaButton('https://www.correrjuntos.com/app', 'Conectar Strava')}
    <p style="margin:24px 0 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.5">
      ¿Usas otro reloj (Garmin, COROS, Apple Watch)? Estamos integrándolos. Si quieres priorizar el tuyo, respóndeme.
    </p>
  `, 'es');
}

function day3En(name) {
  return shell(`
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;line-height:1.3">Connect Strava — no more double-logging</h1>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      If you already use Strava — it's 1 click. Your CorrerJuntos runs sync automatically to Strava, and vice versa.
    </p>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      To enable:
    </p>
    <ol style="margin:0 0 16px 0;padding-left:20px;font-size:15px;line-height:1.8;color:${TEXT_DARK}">
      <li>Open app → Profile</li>
      <li>"Integrations" → Strava → Connect</li>
      <li>Done. Your next run syncs automatically.</li>
    </ol>
    ${ctaButton('https://www.correrjuntos.com/app', 'Connect Strava')}
    <p style="margin:24px 0 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.5">
      Use a different watch (Garmin, COROS, Apple)? We're integrating them. Want yours prioritized? Reply.
    </p>
  `, 'en');
}

// ─────────────────────────────────────────────────────────────
// Day 7 — "Your week in numbers"
// Goal: make the value concrete via data they generated.
// ─────────────────────────────────────────────────────────────
function day7Es(name) {
  return shell(`
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;line-height:1.3">Tu semana en CorrerJuntos</h1>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      Una semana ya entrenando con plan personalizado. Esto es lo que estás construyendo:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;background:${BG_LIGHT};border-radius:10px">
      <tr><td style="padding:20px">
        <p style="margin:0 0 8px 0;font-size:13px;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.5px">Esta semana</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:${TEXT_DARK}">
          Abre la app y mira tu dashboard. Ahí ves:<br>
          • <strong>Total km y tiempo</strong> de tus carreras<br>
          • <strong>Ritmo medio</strong> y mejor 1 km<br>
          • <strong>Próxima sesión</strong> del plan adaptada a tu progreso
        </p>
      </td></tr>
    </table>
    ${ctaButton('https://www.correrjuntos.com/app', 'Ver mi semana')}
    <p style="margin:24px 0 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.5">
      Tu trial termina en 7 días. Después: 4,99 €/mes. Cancela cuando quieras.
    </p>
  `, 'es');
}

function day7En(name) {
  return shell(`
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;line-height:1.3">Your week on CorrerJuntos</h1>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      One week into your personalized plan. Here's what you're building:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;background:${BG_LIGHT};border-radius:10px">
      <tr><td style="padding:20px">
        <p style="margin:0 0 8px 0;font-size:13px;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.5px">This week</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:${TEXT_DARK}">
          Open the app and check your dashboard. You'll see:<br>
          • <strong>Total km and time</strong> across your runs<br>
          • <strong>Average pace</strong> and fastest km<br>
          • <strong>Next session</strong> in your plan, adapted to your progress
        </p>
      </td></tr>
    </table>
    ${ctaButton('https://www.correrjuntos.com/app', 'See my week')}
    <p style="margin:24px 0 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.5">
      Your trial ends in 7 days. After that: $4.99/mo. Cancel anytime.
    </p>
  `, 'en');
}

// ─────────────────────────────────────────────────────────────
// Day 11 — "Trial ends in 3 days"
// Goal: conversion-focused. Concrete loss aversion.
// ─────────────────────────────────────────────────────────────
function day11Es(name) {
  return shell(`
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;line-height:1.3">Tu trial Premium termina el domingo</h1>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      ${name || 'Hola'}, en 3 días termina tu prueba gratuita. Si decides seguir, tu plan continúa sin interrupción. Si no, vuelves al modo gratuito.
    </p>
    <p style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:${TEXT_DARK}">Lo que pierdes si no continúas:</p>
    <ul style="margin:0 0 24px 0;padding-left:20px;font-size:15px;line-height:1.8;color:${TEXT_DARK}">
      <li>Plan personalizado para tu carrera (4-18 semanas, según distancia)</li>
      <li>Coach AI que ajusta el plan a tu ritmo</li>
      <li>Matching ilimitado con runners cercanos</li>
      <li>Stats avanzados: VO2max, zonas FC, predicción de ritmo</li>
    </ul>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px">
      <tr><td style="padding:20px">
        <p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:${BRAND_ORANGE}">Ahorra 40 % con plan anual</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:${TEXT_DARK}">
          29,99 €/año (≈ 2,50 €/mes) vs 4,99 €/mes. Si vas a usarlo durante varios meses, el anual sale mucho más barato.
        </p>
      </td></tr>
    </table>
    ${ctaButton('https://www.correrjuntos.com/app', 'Gestionar mi suscripción')}
    <p style="margin:24px 0 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.5">
      Si quieres cancelar — adelante, sin presión. App Store/Google Play en 2 toques.
    </p>
  `, 'es');
}

function day11En(name) {
  return shell(`
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;line-height:1.3">Your Premium trial ends Sunday</h1>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      ${name || 'Hi'}, in 3 days your free trial ends. If you keep Premium, your plan continues uninterrupted. If not, you go back to the free tier.
    </p>
    <p style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:${TEXT_DARK}">What you lose if you don't continue:</p>
    <ul style="margin:0 0 24px 0;padding-left:20px;font-size:15px;line-height:1.8;color:${TEXT_DARK}">
      <li>Personalized race plan (4-18 weeks, by distance)</li>
      <li>AI Coach that adjusts the plan to your pace</li>
      <li>Unlimited matching with nearby runners</li>
      <li>Advanced stats: VO2max, HR zones, pace predictions</li>
    </ul>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px">
      <tr><td style="padding:20px">
        <p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:${BRAND_ORANGE}">Save 40% with the annual plan</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:${TEXT_DARK}">
          $29.99/year (≈ $2.50/mo) vs $4.99/mo. If you'll use it for several months, annual is way cheaper.
        </p>
      </td></tr>
    </table>
    ${ctaButton('https://www.correrjuntos.com/app', 'Manage subscription')}
    <p style="margin:24px 0 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.5">
      If you want to cancel — go ahead, no pressure. App Store/Google Play, 2 taps.
    </p>
  `, 'en');
}

// ─────────────────────────────────────────────────────────────
// Day 14 — Trial ended (sent same day)
// Goal: gentle re-engagement OR welcome to paid (depending on
// outcome — but our cron sends only if status='trial_active', so
// it's targeting the "didn't convert yet" cohort).
// ─────────────────────────────────────────────────────────────
function day14Es(name) {
  return shell(`
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;line-height:1.3">Sigues entrenando — la app sigue contigo</h1>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      ${name || 'Hola'}, tu trial Premium ha terminado. Pero tu progreso no — todas tus carreras siguen guardadas, tu nivel sigue ahí, y la versión gratuita es 100 % usable.
    </p>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      Si en algún momento quieres recuperar el plan personalizado y el matching ilimitado, está disponible cuando tú decidas — sin reset, sin perder progreso.
    </p>
    ${ctaButton('https://www.correrjuntos.com/app', 'Sigo corriendo')}
    <p style="margin:24px 0 0 0;font-size:14px;line-height:1.6;color:${TEXT_DARK}">
      Una pregunta: <em>¿qué te haría volver a Premium?</em> Responde a este mail con cualquier feedback — me ayuda a mejorar la app.
    </p>
    <p style="margin:24px 0 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.5">
      — Abraham, fundador de CorrerJuntos
    </p>
  `, 'es');
}

function day14En(name) {
  return shell(`
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;line-height:1.3">You keep running — the app stays with you</h1>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      ${name || 'Hi'}, your Premium trial has ended. But your progress hasn't — all your runs are saved, your level is intact, and the free tier is 100% usable.
    </p>
    <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:${TEXT_DARK}">
      Whenever you want the personalized plan and unlimited matching back, it's there — no reset, no progress loss.
    </p>
    ${ctaButton('https://www.correrjuntos.com/app', 'Keep running')}
    <p style="margin:24px 0 0 0;font-size:14px;line-height:1.6;color:${TEXT_DARK}">
      One question: <em>what would bring you back to Premium?</em> Reply with any feedback — it helps me improve the app.
    </p>
    <p style="margin:24px 0 0 0;font-size:13px;color:${TEXT_MUTED};line-height:1.5">
      — Abraham, founder of CorrerJuntos
    </p>
  `, 'en');
}

// ─────────────────────────────────────────────────────────────
// Public API — getEmailForDay(dayN, lang, name) → { subject, html }
// ─────────────────────────────────────────────────────────────
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
    14: 'Trial ended — but your progress didn\'t',
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
