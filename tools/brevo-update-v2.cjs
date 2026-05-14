#!/usr/bin/env node
/**
 * Updates the existing Brevo draft campaign (id 12) with the v2 optimized copy.
 * Then sends a test email so the owner can preview.
 */
const https = require('https');

const API_KEY = process.env.BREVO_API_KEY || (() => {
  try {
    const fs = require('fs'), path = require('path');
    const env = fs.readFileSync(path.join(__dirname, '..', '.env.brevo'), 'utf8');
    return env.match(/BREVO_API_KEY[=\s"']+([^"'\s]+)/)?.[1];
  } catch { return null; }
})();
if (!API_KEY) { console.error('Missing BREVO_API_KEY in env or .env.brevo'); process.exit(1); }
const CAMPAIGN_ID = 12;
const TEST_EMAIL = 'guetto2012@gmail.com';

const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Correr Juntos v1.3.2</title></head>
<body style="margin:0;padding:0;background:#fef7ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1a1a2e;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fef7ed;">
    <tr><td align="center" style="padding:24px 16px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">

        <!-- Hero -->
        <tr><td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:36px 32px 28px;text-align:center;">
          <div style="color:#fff;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;opacity:0.9;margin-bottom:8px;">Nueva version 1.3.2</div>
          <h1 style="color:#fff;font-size:30px;font-weight:800;margin:0 0 8px;line-height:1.2;">Tu plan de running<br>en 60 segundos</h1>
          <p style="color:#fff;opacity:0.92;font-size:15px;margin:0;line-height:1.5;">Con IA, matching y 7 planes profesionales.<br>Ya disponible en iOS y Android.</p>
        </td></tr>

        <!-- Social proof bar -->
        <tr><td style="background:#fff7ed;padding:14px 20px;border-bottom:1px solid #fed7aa;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" width="33%" style="padding:0 4px;">
                <div style="font-size:18px;font-weight:800;color:#c2410c;">579+</div>
                <div style="font-size:10px;font-weight:700;color:#7a3d0a;text-transform:uppercase;letter-spacing:0.5px;">runners</div>
              </td>
              <td align="center" width="33%" style="padding:0 4px;border-left:1px solid #fed7aa;border-right:1px solid #fed7aa;">
                <div style="font-size:18px;font-weight:800;color:#c2410c;">7</div>
                <div style="font-size:10px;font-weight:700;color:#7a3d0a;text-transform:uppercase;letter-spacing:0.5px;">planes</div>
              </td>
              <td align="center" width="33%" style="padding:0 4px;">
                <div style="font-size:18px;font-weight:800;color:#c2410c;">4★+</div>
                <div style="font-size:10px;font-weight:700;color:#7a3d0a;text-transform:uppercase;letter-spacing:0.5px;">valoracion</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 32px 8px;">
          <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 18px;">
            Hola {{contact.FIRSTNAME | default: \"runner\"}},
          </p>
          <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 22px;">
            Llevamos meses escuchando lo que nos ped&iacute;as. La v1.3.2 trae las 4 novedades m&aacute;s solicitadas:
          </p>

          <!-- Features list — 4 items, Google Sign-In dropped -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
            <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
              <span style="color:#f97316;font-weight:800;font-size:18px;margin-right:10px;">1</span>
              <span style="font-size:15px;color:#1a1a2e;font-weight:700;">Coach Jos&eacute; (IA)</span><br>
              <span style="font-size:14px;color:#64748b;margin-left:28px;">Te genera un plan personalizado en menos de 60 segundos seg&uacute;n tu nivel y objetivo.</span>
            </td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
              <span style="color:#f97316;font-weight:800;font-size:18px;margin-right:10px;">2</span>
              <span style="font-size:15px;color:#1a1a2e;font-weight:700;">7 planes de entrenamiento</span><br>
              <span style="font-size:14px;color:#64748b;margin-left:28px;">Gratis: "Empieza a Moverte" y 0&rarr;5K. Premium: 5K, 10K, Trail, 21K y 42K.</span>
            </td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
              <span style="color:#f97316;font-weight:800;font-size:18px;margin-right:10px;">3</span>
              <span style="font-size:15px;color:#1a1a2e;font-weight:700;">Matching con runners cerca</span><br>
              <span style="font-size:14px;color:#64748b;margin-left:28px;">Algoritmo que cruza tu ritmo, horario, nivel y zona para que no corras solo.</span>
            </td></tr>
            <tr><td style="padding:12px 0;">
              <span style="color:#f97316;font-weight:800;font-size:18px;margin-right:10px;">4</span>
              <span style="font-size:15px;color:#1a1a2e;font-weight:700;">Audio alertas cada km</span><br>
              <span style="font-size:14px;color:#64748b;margin-left:28px;">En segundo plano iOS y Android — incluso con la app cerrada y pantalla bloqueada.</span>
            </td></tr>
          </table>

          <!-- Product screenshot -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
            <tr><td align="center" style="padding:16px;background:#fff7ed;border-radius:14px;">
              <img src="https://www.correrjuntos.com/public/coach-jose.jpg" alt="Coach Jose IA de Correr Juntos" width="200" style="max-width:100%;height:auto;border-radius:12px;display:block;">
              <p style="font-size:12px;color:#7a3d0a;margin:10px 0 0;font-weight:600;font-style:italic;">Coach Jos&eacute; — tu entrenador con IA</p>
            </td></tr>
          </table>

          <!-- Trial CTA banner -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;background:#fff7ed;border-radius:12px;border:1px solid #fed7aa;">
            <tr><td style="padding:14px 18px;">
              <div style="font-size:11px;font-weight:800;color:#c2410c;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:2px;">Exclusivo esta semana</div>
              <div style="font-size:14px;color:#1a1a2e;font-weight:600;">Prueba Pro 7 d&iacute;as gratis. Cancela cuando quieras desde la tienda.</div>
            </td></tr>
          </table>

          <!-- Main CTA — benefit + time + free -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
            <tr><td align="center">
              <a href="https://www.correrjuntos.com?utm_source=brevo&utm_medium=email&utm_campaign=v132_launch_v2" style="display:inline-block;background:#f97316;color:#fff;font-size:16px;font-weight:800;text-decoration:none;padding:16px 36px;border-radius:12px;box-shadow:0 4px 12px rgba(249,115,22,0.25);">Probar Pro 7 d&iacute;as gratis &rarr;</a>
            </td></tr>
          </table>

          <p style="font-size:13px;color:#64748b;line-height:1.5;margin:0 0 8px;text-align:center;">
            Si ya tienes la app, &aacute;brela y ver&aacute;s las novedades al instante.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 24px;" align="center">
            <tr>
              <td style="padding:0 8px;">
                <a href="https://apps.apple.com/app/id6758505910?utm_source=brevo&utm_medium=email&utm_campaign=v132_launch_v2" style="font-size:12px;color:#f97316;text-decoration:underline;font-weight:600;">App Store</a>
              </td>
              <td style="padding:0 8px;color:#cbd5e1;">|</td>
              <td style="padding:0 8px;">
                <a href="https://play.google.com/store/apps/details?id=com.correrjuntos.app&utm_source=brevo&utm_medium=email&utm_campaign=v132_launch_v2" style="font-size:12px;color:#f97316;text-decoration:underline;font-weight:600;">Google Play</a>
              </td>
            </tr>
          </table>

          <p style="font-size:14px;line-height:1.6;color:#64748b;margin:0 0 4px;">
            &iquest;Dudas o feedback? Responde directamente a este email. Lo leemos personalmente.
          </p>
          <p style="font-size:14px;line-height:1.6;color:#1a1a2e;font-weight:600;margin:20px 0 0;">
            Javi<br><span style="color:#64748b;font-weight:400;">Fundador &mdash; Correr Juntos</span>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="font-size:11px;color:#94a3b8;margin:0 0 8px;line-height:1.5;">
            Recibes este correo porque te registraste en <a href="https://www.correrjuntos.com" style="color:#94a3b8;text-decoration:underline;">correrjuntos.com</a>. Para asegurarte de recibir nuestras novedades, a&ntilde;ade <strong>hola@correrjuntos.com</strong> a tus contactos.
          </p>
          <p style="font-size:11px;color:#94a3b8;margin:0;">
            <a href="{{ unsubscribe }}" style="color:#94a3b8;text-decoration:underline;">Darse de baja</a> &middot;
            <a href="https://www.correrjuntos.com/privacy" style="color:#94a3b8;text-decoration:underline;">Privacidad</a>
          </p>
        </td></tr>

      </table>

    </td></tr>
  </table>
</body></html>`;

const text = `Hola {{contact.FIRSTNAME | default: \"runner\"}},

Llevamos meses escuchando lo que nos pedias. La v1.3.2 trae las 4 novedades mas solicitadas:

1. Coach Jose (IA) — Plan personalizado en menos de 60 segundos.
2. 7 planes de entrenamiento — Gratis: "Empieza a Moverte" y 0->5K. Premium: 5K, 10K, Trail, 21K, 42K.
3. Matching con runners cerca — Algoritmo por ritmo, horario, nivel y zona.
4. Audio alertas cada km — Segundo plano iOS y Android, incluso con la app cerrada.

EXCLUSIVO ESTA SEMANA: Prueba Pro 7 dias gratis. Cancela cuando quieras.

Probar Pro 7 dias gratis: https://www.correrjuntos.com?utm_source=brevo&utm_medium=email&utm_campaign=v132_launch_v2

App Store: https://apps.apple.com/app/id6758505910
Google Play: https://play.google.com/store/apps/details?id=com.correrjuntos.app

Responde a este email con cualquier duda.

Javi
Fundador — Correr Juntos

--
Darse de baja: {{ unsubscribe }}`;

const body = JSON.stringify({
  name: 'v1.3.2 Launch v2 - Reactivacion Espana',
  subject: 'Tu plan de running en 60 segundos (v1.3.2 ya disponible)',
  sender: { id: 3 },
  replyTo: 'hola@correrjuntos.com',
  htmlContent: html,
  textContent: text,
  recipients: { listIds: [7] },
  inlineImageActivation: false,
});

const req = https.request({
  hostname: 'api.brevo.com',
  path: `/v3/emailCampaigns/${CAMPAIGN_ID}`,
  method: 'PUT',
  headers: {
    'api-key': API_KEY,
    'content-type': 'application/json',
    'accept': 'application/json',
    'content-length': Buffer.byteLength(body),
  },
}, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', async () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✓ Draft ${CAMPAIGN_ID} actualizado (v2)`);
      console.log(`Sending test to ${TEST_EMAIL}...`);
      // Send test
      const testBody = JSON.stringify({ emailTo: [TEST_EMAIL] });
      const testReq = https.request({
        hostname: 'api.brevo.com',
        path: `/v3/emailCampaigns/${CAMPAIGN_ID}/sendTest`,
        method: 'POST',
        headers: { 'api-key': API_KEY, 'content-type': 'application/json', 'content-length': Buffer.byteLength(testBody) },
      }, (tr) => {
        let td = '';
        tr.on('data', (c) => td += c);
        tr.on('end', () => {
          if (tr.statusCode >= 200 && tr.statusCode < 300) {
            console.log(`✓ Test enviado a ${TEST_EMAIL}`);
          } else {
            console.error(`Test FAILED ${tr.statusCode}: ${td}`);
          }
        });
      });
      testReq.write(testBody);
      testReq.end();
    } else {
      console.error(`UPDATE FAILED ${res.statusCode}: ${data}`);
      process.exit(1);
    }
  });
});
req.write(body);
req.end();
