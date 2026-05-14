#!/usr/bin/env node
/**
 * brevo-campaign-planes-launch.cjs — Creates a DRAFT Brevo campaign
 * announcing the launch of the 7 training plans (April 2026).
 *
 * Targets the 4 existing segments:
 *   - List 7  (Espana, 240 contacts)
 *   - List 8  (LATAM MX, 26)
 *   - List 9  (LATAM Andinos, 20)
 *   - List 10 (LATAM Cono Sur, 16)
 *
 * Total reach: ~302 contacts.
 *
 * Creates as DRAFT — does NOT send. User reviews in Brevo dashboard
 * and hits "Send" manually.
 *
 * Usage: BREVO_API_KEY=<xkeysib...> node tools/brevo-campaign-planes-launch.cjs
 */
const https = require('https');

const API_KEY = process.env.BREVO_API_KEY;
if (!API_KEY) {
  console.error('❌ Missing BREVO_API_KEY env var. Export it before running.');
  process.exit(1);
}

const SUBJECT = 'Ya están aquí: 7 planes de entrenamiento 🔥';
const PREVIEW = 'Desde 0→5K hasta maratón. 322 sesiones estructuradas. Dos gratis.';

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Planes de entrenamiento — CorrerJuntos</title>
</head>
<body style="margin:0;padding:0;background:#fef7ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1a1a2e;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fef7ed;">
<tr><td align="center" style="padding:24px 16px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">

<!-- Hero -->
<tr><td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:44px 32px 36px;text-align:center;">
  <div style="color:#fff;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;opacity:0.92;margin-bottom:14px;">POR FIN · ABRIL 2026</div>
  <h1 style="color:#fff;font-size:36px;font-weight:900;margin:0 0 12px;line-height:1.1;letter-spacing:-0.5px;">7 planes de<br>entrenamiento.</h1>
  <p style="color:#fff;opacity:0.95;font-size:16px;margin:0;line-height:1.5;font-weight:500;">Desde "empezar a moverte" hasta maratón.<br>Ya disponibles en la app.</p>
</td></tr>

<!-- Body intro -->
<tr><td style="padding:36px 32px 8px;">
  <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 16px;">
    Hola {{contact.FIRSTNAME | default: "runner"}},
  </p>
  <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 14px;">
    Llevabas tiempo pidiéndolos. <strong>Ya están activos en la app</strong> — 7 planes estructurados, diseñados para llevarte desde 0 hasta donde quieras llegar.
  </p>
  <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px;">
    Abre CorrerJuntos, ve a <strong>Planes</strong>, y elige el tuyo.
  </p>
</td></tr>

<!-- Stats strip -->
<tr><td style="padding:0 32px 24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;">
    <tr>
      <td align="center" width="33%" style="padding:18px 8px;">
        <div style="font-size:22px;font-weight:900;color:#c2410c;line-height:1;">7</div>
        <div style="font-size:10px;font-weight:700;color:#7a3d0a;text-transform:uppercase;letter-spacing:0.5px;margin-top:6px;">planes</div>
      </td>
      <td align="center" width="33%" style="padding:18px 8px;border-left:1px solid #fed7aa;border-right:1px solid #fed7aa;">
        <div style="font-size:22px;font-weight:900;color:#c2410c;line-height:1;">322</div>
        <div style="font-size:10px;font-weight:700;color:#7a3d0a;text-transform:uppercase;letter-spacing:0.5px;margin-top:6px;">sesiones</div>
      </td>
      <td align="center" width="33%" style="padding:18px 8px;">
        <div style="font-size:22px;font-weight:900;color:#c2410c;line-height:1;">2</div>
        <div style="font-size:10px;font-weight:700;color:#7a3d0a;text-transform:uppercase;letter-spacing:0.5px;margin-top:6px;">gratis</div>
      </td>
    </tr>
  </table>
</td></tr>

<!-- Plans list -->
<tr><td style="padding:8px 32px 24px;">
  <h2 style="font-size:13px;font-weight:800;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 16px;">Los 7 planes</h2>

  <!-- Free plan 1 -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;background:#ecfdf5;border:1px solid #bbf7d0;border-radius:10px;">
    <tr><td style="padding:16px 18px;">
      <div style="display:inline-block;background:#22c55e;color:#fff;font-size:10px;font-weight:800;letter-spacing:0.8px;padding:3px 8px;border-radius:4px;margin-bottom:8px;">GRATIS</div>
      <div style="font-size:16px;font-weight:800;color:#1a1a2e;margin:2px 0 4px;">Empieza a Moverte</div>
      <div style="font-size:13px;color:#64748b;line-height:1.4;">6 semanas · para quien no ha corrido nunca. Alterna caminar y correr hasta que corres 20 min sin parar.</div>
    </td></tr>
  </table>

  <!-- Free plan 2 -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;background:#ecfdf5;border:1px solid #bbf7d0;border-radius:10px;">
    <tr><td style="padding:16px 18px;">
      <div style="display:inline-block;background:#22c55e;color:#fff;font-size:10px;font-weight:800;letter-spacing:0.8px;padding:3px 8px;border-radius:4px;margin-bottom:8px;">GRATIS</div>
      <div style="font-size:16px;font-weight:800;color:#1a1a2e;margin:2px 0 4px;">0 → 5K</div>
      <div style="font-size:13px;color:#64748b;line-height:1.4;">8 semanas · tu primera carrera de 5 km. 24 sesiones con progresión controlada.</div>
    </td></tr>
  </table>

  <!-- Premium plans -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;background:#fffcf9;border:1px solid #efe6db;border-radius:10px;">
    <tr><td style="padding:16px 18px;">
      <div style="display:inline-block;background:#f97316;color:#fff;font-size:10px;font-weight:800;letter-spacing:0.8px;padding:3px 8px;border-radius:4px;margin-bottom:8px;">PREMIUM</div>
      <div style="font-size:16px;font-weight:800;color:#1a1a2e;margin:2px 0 4px;">Prep 5K · 10K · Trail</div>
      <div style="font-size:13px;color:#64748b;line-height:1.4;">8-12 semanas · mejora tu marca o entra en trail. Progresión por niveles.</div>
    </td></tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;background:#fffcf9;border:1px solid #efe6db;border-radius:10px;">
    <tr><td style="padding:16px 18px;">
      <div style="display:inline-block;background:#f97316;color:#fff;font-size:10px;font-weight:800;letter-spacing:0.8px;padding:3px 8px;border-radius:4px;margin-bottom:8px;">PREMIUM</div>
      <div style="font-size:16px;font-weight:800;color:#1a1a2e;margin:2px 0 4px;">Prep Media Maratón (21K)</div>
      <div style="font-size:13px;color:#64748b;line-height:1.4;">16 semanas · 70 sesiones. Tapering incluido. Listos para tu primera media o mejorar marca.</div>
    </td></tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;background:#fffcf9;border:1px solid #efe6db;border-radius:10px;">
    <tr><td style="padding:16px 18px;">
      <div style="display:inline-block;background:#f97316;color:#fff;font-size:10px;font-weight:800;letter-spacing:0.8px;padding:3px 8px;border-radius:4px;margin-bottom:8px;">PREMIUM</div>
      <div style="font-size:16px;font-weight:800;color:#1a1a2e;margin:2px 0 4px;">Prep Maratón (42K)</div>
      <div style="font-size:13px;color:#64748b;line-height:1.4;">18 semanas · 90 sesiones. El más completo. Para quien quiere cruzar la línea de 42 km sin romperse.</div>
    </td></tr>
  </table>
</td></tr>

<!-- CTA -->
<tr><td style="padding:12px 32px 36px;text-align:center;">
  <a href="https://correrjuntos.com?utm_source=brevo&utm_medium=email&utm_campaign=planes-launch-abr26"
     style="display:inline-block;background:#f97316;color:#fff;font-size:16px;font-weight:800;text-decoration:none;padding:16px 44px;border-radius:50px;box-shadow:0 4px 14px rgba(249,115,22,0.3);letter-spacing:0.3px;">
    Empezar un plan ahora →
  </a>
  <p style="font-size:12px;color:#94a3b8;margin:16px 0 0;">Abre la app y ve a <strong>Planes</strong> en el menú</p>
</td></tr>

<!-- Secondary CTA -->
<tr><td style="padding:0 32px 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
    <tr><td style="padding:16px 18px;">
      <div style="font-size:13px;font-weight:700;color:#64748b;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:4px;">¿Aún no tienes la app?</div>
      <div style="font-size:14px;color:#475569;">
        <a href="https://apps.apple.com/app/id6758505910" style="color:#f97316;font-weight:700;text-decoration:none;">iOS →</a>
        &nbsp;&nbsp;•&nbsp;&nbsp;
        <a href="https://play.google.com/store/apps/details?id=com.correrjuntos.app" style="color:#f97316;font-weight:700;text-decoration:none;">Android →</a>
      </div>
    </td></tr>
  </table>
</td></tr>

<!-- Footer -->
<tr><td style="background:#1a1a2e;padding:24px 32px;text-align:center;">
  <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">CorrerJuntos · La comunidad de runners</p>
  <p style="color:#64748b;font-size:11px;margin:0;">
    <a href="{{unsubscribe}}" style="color:#64748b;text-decoration:underline;">Darse de baja</a>
    &nbsp;·&nbsp;
    <a href="https://correrjuntos.com" style="color:#64748b;text-decoration:underline;">correrjuntos.com</a>
  </p>
</td></tr>

</table>

</td></tr>
</table>
</body>
</html>`;

const TEXT = `Ya están aquí los 7 planes de entrenamiento.

Hola,

Llevabas tiempo pidiéndolos. Ya están activos en la app:

GRATIS:
• Empieza a Moverte (6 semanas, para quien no ha corrido nunca)
• 0 → 5K (8 semanas, tu primera carrera)

PREMIUM:
• Prep 5K / 10K / Trail (8-12 semanas)
• Prep Media Maratón 21K (16 semanas)
• Prep Maratón 42K (18 semanas)

Total: 322 sesiones estructuradas, 1.025 pasos.

Abre la app y ve a "Planes" para empezar uno.

iOS: https://apps.apple.com/app/id6758505910
Android: https://play.google.com/store/apps/details?id=com.correrjuntos.app

CorrerJuntos — la comunidad de runners
`;

const request = (method, path, body) =>
  new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      method,
      hostname: 'api.brevo.com',
      path,
      headers: {
        'api-key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => (chunks += c));
      res.on('end', () => {
        const parsed = chunks ? (() => { try { return JSON.parse(chunks); } catch { return chunks; } })() : null;
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve(parsed);
        reject(new Error(`HTTP ${res.statusCode}: ${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`));
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });

(async () => {
  console.log('▶ Creating Brevo draft campaign "Planes launch"…');

  const payload = {
    name: 'v1.3.4 — Planes de entrenamiento (Abr 26)',
    subject: SUBJECT,
    htmlContent: HTML,
    textContent: TEXT,
    sender: { name: 'CorrerJuntos', email: 'hola@correrjuntos.com' },
    replyTo: 'hola@correrjuntos.com',
    type: 'classic',
    recipients: {
      listIds: [7, 8, 9, 10],  // Espana + MX + Andinos + Cono Sur = ~302 contactos
    },
    // Don't schedule — leave as draft. User reviews + hits Send from Brevo UI.
    inlineImageActivation: false,
    mirrorActive: true,
  };

  const res = await request('POST', '/v3/emailCampaigns', payload);
  console.log('✓ Draft created successfully');
  console.log('  Campaign ID:', res.id);
  console.log('\n📧 Review + send at:');
  console.log(`   https://app.brevo.com/campaigns/email/edit/${res.id}/settings`);
  console.log('\n   Expected recipients: ~302 contacts');
  console.log('     · List 7 (Espana)       — 240');
  console.log('     · List 8 (LATAM MX)     —  26');
  console.log('     · List 9 (LATAM Andinos)—  20');
  console.log('     · List 10 (LATAM C.Sur) —  16');
  console.log('\n  Subject:', SUBJECT);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
