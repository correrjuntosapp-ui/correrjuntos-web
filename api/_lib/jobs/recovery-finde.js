// Job: recovery-finde (one-off, 1 jun 2026)
// Send recovery email to 19 weekend signups (sat 30 may + sun 31 may)
// who did not create a plan. Excludes Shantal (already has 2 plans).
//
// Triggered manually:
//   GET /api/cron/run?job=recovery-finde&token=<CRON_SECRET>
// Or via Authorization: Bearer <CRON_SECRET>

const ORANGE='#f97316', BG='#0b1220', TEXT='#f6f1e8';
const TEXT_72='rgba(246,241,232,0.72)', TEXT_42='rgba(246,241,232,0.42)', TEXT_28='rgba(246,241,232,0.28)';
const BORDER_08='rgba(246,241,232,0.08)', BORDER_12='rgba(246,241,232,0.12)';
const FONT_BODY="'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const FONT_MONO="'JetBrains Mono',SFMono-Regular,Consolas,Menlo,monospace";

function shell({ eyebrow, tagline, h1Pre, h1Strong, h1Post='.', body, ctaUrl, ctaLabel, preheader='', lang='es' }) {
  const taglineHtml = `<tr><td style="padding:30px 44px 0 44px;"><div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:${ORANGE};font-weight:500;"><span style="display:inline-block;width:36px;height:1px;background:${ORANGE};vertical-align:middle;margin-right:12px;"></span>${tagline}</div></td></tr>`;
  const ctaHtml = `<tr><td style="padding:36px 44px 0 44px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${ORANGE}" style="border-radius:10px;"><a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:16px 32px;font-family:${FONT_BODY};font-size:15px;font-weight:600;color:${BG};text-decoration:none;border-radius:10px;letter-spacing:0.01em;">${ctaLabel}</a></td></tr></table></td></tr>`;
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>CorrerJuntos</title></head><body style="margin:0;padding:0;background:${BG};font-family:${FONT_BODY};color:${TEXT};-webkit-font-smoothing:antialiased;">
<div style="display:none;font-size:1px;color:${BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:48px 16px;"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:${BG};border:1px solid ${BORDER_08};border-radius:20px;overflow:hidden;">
<tr><td style="padding:36px 44px 0 44px;"><span style="display:inline-block;width:10px;height:10px;background:${ORANGE};border-radius:999px;"></span></td></tr>
<tr><td style="padding:14px 44px 0 44px;"><div style="font-family:${FONT_MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${TEXT_42};font-weight:500;"><span style="color:${ORANGE};">&bull;</span>&nbsp;&nbsp;${eyebrow}</div></td></tr>
${taglineHtml}
<tr><td style="padding:30px 44px 0 44px;"><h1 style="margin:0;font-family:${FONT_BODY};font-size:44px;line-height:0.96;letter-spacing:-0.035em;font-weight:200;color:${TEXT};">${h1Pre} <strong style="font-weight:700;color:${ORANGE};font-style:normal;">${h1Strong}</strong>${h1Post}</h1></td></tr>
<tr><td style="padding:28px 44px 0 44px;">${body}</td></tr>
${ctaHtml}
<tr><td style="padding:30px 44px 34px 44px;"><div style="border-top:1px solid ${BORDER_12};padding-top:26px;"><div style="font-family:${FONT_BODY};font-size:26px;font-weight:800;letter-spacing:-0.03em;color:${TEXT};line-height:1;">Correr<em style="font-style:normal;color:${ORANGE};">Juntos</em></div><div style="margin-top:8px;font-family:${FONT_MONO};font-size:11px;letter-spacing:0.08em;color:${ORANGE};"><a href="mailto:abraham.marquez@correrjuntos.com" style="color:${ORANGE};text-decoration:none;">abraham.marquez@correrjuntos.com</a></div></div></td></tr>
</table>
<div style="font-family:${FONT_MONO};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${TEXT_28};margin-top:26px;font-weight:500;">Meridian Motion &middot; <a href="https://www.correrjuntos.com" style="color:${TEXT_42};text-decoration:none;">correrjuntos.com</a></div>
</td></tr></table></body></html>`;
}
const para = (txt) => `<p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${txt}</p>`;
const paraLast = (txt) => `<p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${txt}</p>`;
const lead = (txt) => `<p style="margin:0 0 22px 0;font-size:15px;line-height:1.65;color:${TEXT_72};font-weight:400;">${txt}</p>`;
const strongCream = (txt) => `<strong style="color:${TEXT};font-weight:600;">${txt}</strong>`;

const recoveryEs = (name) => shell({
  eyebrow: 'Primer plan · Nº 01',
  tagline: 'CORRE ACOMPAÑADO',
  h1Pre: 'Te quedaste',
  h1Strong: 'cerca',
  h1Post: `, ${name}.`,
  preheader: `${name}, 1 tap y tienes tu plan 0→5K gratis.`,
  body: lead(`Creaste tu cuenta hace unos días pero no llegaste a generar tu plan. Pasa — los wizards de 5 pasos son ruido cuando solo quieres salir a correr.`)
       + para(`Hemos arreglado eso esta semana. Ahora cuando abres la app, en un solo tap tienes tu ${strongCream('plan adaptativo 0→5K')} listo: 8 semanas, 3 días a la semana, ajustado a tu ritmo real.`)
       + paraLast(`${strongCream('Gratis')}. Sin tarjeta, sin trial, sin paywall.`),
  ctaUrl: 'https://www.correrjuntos.com/?ref=recovery-weekend',
  ctaLabel: 'Crear mi plan 0→5K  →',
  lang: 'es',
});

const recoveryEn = (name) => shell({
  eyebrow: 'First plan · Nº 01',
  tagline: 'RUN TOGETHER',
  h1Pre: 'You got',
  h1Strong: 'close',
  h1Post: `, ${name}.`,
  preheader: `${name}, 1 tap and your free 0→5K plan is ready.`,
  body: lead(`You created your account a few days ago but didn't get to build your plan. It happens — 5-step wizards are noise when you just want to go run.`)
       + para(`We fixed that this week. Now when you open the app, one tap gives you your ${strongCream('adaptive 0→5K plan')}: 8 weeks, 3 days/week, tuned to your real pace.`)
       + paraLast(`${strongCream('Free')}. No card, no trial, no paywall.`),
  ctaUrl: 'https://www.correrjuntos.com/?ref=recovery-weekend',
  ctaLabel: 'Create my 0→5K plan  →',
  lang: 'en',
});

// 19 recipients — weekend signups sat 30 + sun 31 may 2026 with no plan
const RECIPIENTS = [
  { email: 'josemanuelsfm@gmail.com',          nombre: 'Jose',         lang: 'es' },
  { email: 'amolinesegovia@gmail.com',         nombre: 'Álex',         lang: 'es' },
  { email: 'tnytw8twmf@privaterelay.appleid.com', nombre: 'Simon',     lang: 'es' },
  { email: 'diego.ledesmagil@gmail.com',       nombre: 'Diego',        lang: 'es' },
  { email: 'napoleonyancent369@gmail.com',     nombre: 'Napoleon',     lang: 'en' },
  { email: 'marududuchark@gmail.com',          nombre: 'Maru',         lang: 'es' },
  { email: 'elegoma@gmail.com',                nombre: 'Helen',        lang: 'es' },
  { email: 'j_nunez_pena@yahoo.es',            nombre: 'Joaquin',      lang: 'es' },
  { email: 'leirerodrif578@gmail.com',         nombre: 'Leire',        lang: 'es' },
  { email: 'guaje_pablito@hotmail.com',        nombre: 'Pablo',        lang: 'es' },
  { email: 'chabii@gmail.com',                 nombre: 'Xabi',         lang: 'es' },
  { email: 'josegcfauna1993@hotmail.com',      nombre: 'José Antonio', lang: 'es' },
  { email: 'icorroto21@gmail.com',             nombre: 'Ivan',         lang: 'es' },
  { email: 'xcarrerasc@yahoo.es',              nombre: 'Xavier',       lang: 'es' },
  { email: 'rafamyri56@gmail.com',             nombre: 'Rafa',         lang: 'es' },
  { email: 'martapuertaslamancha@gmail.com',   nombre: 'Marta',        lang: 'es' },
  { email: 'edu.nievares@gmail.com',           nombre: 'Eduardo',      lang: 'es' },
  { email: 'videoslancia@gmail.com',           nombre: 'Rafael',       lang: 'es' },
  { email: 'vmodregoj@gmail.com',              nombre: 'Virginia',     lang: 'es' },
];

const SUBJECTS = {
  es: (name) => `${name}, 1 tap y arrancas`,
  en: (name) => `${name}, 1 tap and you're running`,
};

export default async function runRecoveryFinde(_req, res, env) {
  const BREVO_API_KEY = env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: 'missing_brevo_key' });
  }
  const SENDER_EMAIL = 'abraham.marquez@correrjuntos.com';
  const SENDER_NAME  = 'Abraham · CorrerJuntos';
  const REPLY_TO     = 'abraham.marquez@correrjuntos.com';

  const results = [];
  for (const r of RECIPIENTS) {
    const isEn = r.lang === 'en';
    const html    = (isEn ? recoveryEn : recoveryEs)(r.nombre);
    const subject = (isEn ? SUBJECTS.en : SUBJECTS.es)(r.nombre);
    try {
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { email: SENDER_EMAIL, name: SENDER_NAME },
          replyTo: { email: REPLY_TO, name: 'Abraham' },
          to: [{ email: r.email, name: r.nombre }],
          subject,
          htmlContent: html,
          tags: ['recovery-weekend', `lang-${r.lang}`],
        }),
      });
      const body = await brevoRes.text();
      results.push({
        email: r.email,
        ok: brevoRes.ok,
        statusCode: brevoRes.status,
        body: brevoRes.ok ? '' : body.slice(0, 200),
      });
    } catch (e) {
      results.push({ email: r.email, ok: false, error: (e?.message || '').slice(0, 200) });
    }
  }

  const ok = results.filter((r) => r.ok).length;
  const fail = results.length - ok;
  return res.status(200).json({
    ok: true,
    total: results.length,
    sent: ok,
    failed: fail,
    results,
  });
}
