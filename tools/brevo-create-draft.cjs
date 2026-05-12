#!/usr/bin/env node
/**
 * Creates a Brevo email campaign as DRAFT (not sent).
 * User reviews it in Brevo dashboard and sends manually.
 */
const https = require('https');

// Read from .env file (gitignored) — never hardcode keys
const API_KEY = process.env.BREVO_API_KEY || require('fs').readFileSync(require('path').join(__dirname, '..', '.env'), 'utf8').match(/BREVO_API_KEY=(.+)/)?.[1]?.trim();
if (!API_KEY) {
  console.error('Missing BREVO_API_KEY in env or .env file');
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Nueva version 1.3.2</title></head>
<body style="margin:0;padding:0;background:#fef7ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1a1a2e;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fef7ed;">
    <tr><td align="center" style="padding:24px 16px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">

        <!-- Hero -->
        <tr><td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:36px 32px 28px;text-align:center;">
          <div style="color:#fff;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;opacity:0.9;margin-bottom:8px;">Nueva version 1.3.2</div>
          <h1 style="color:#fff;font-size:28px;font-weight:800;margin:0;line-height:1.25;">7 planes de entrenamiento<br>+ Coach Jose (IA)</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 32px 8px;">
          <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 20px;">
            Hola {{contact.FIRSTNAME | default: "runner"}},
          </p>
          <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 22px;">
            Acabamos de publicar la version 1.3.2 con todo lo que nos pediais:
          </p>

          <!-- Features list -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
              <span style="color:#f97316;font-weight:800;font-size:18px;margin-right:10px;">1</span>
              <span style="font-size:15px;color:#1a1a2e;font-weight:600;">7 planes de entrenamiento</span><br>
              <span style="font-size:14px;color:#64748b;margin-left:28px;">Gratis: "Empieza a Moverte" y 0&rarr;5K. Premium: 5K, 10K, Trail, 21K, 42K.</span>
            </td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
              <span style="color:#f97316;font-weight:800;font-size:18px;margin-right:10px;">2</span>
              <span style="font-size:15px;color:#1a1a2e;font-weight:600;">Coach Jose (IA)</span><br>
              <span style="font-size:14px;color:#64748b;margin-left:28px;">Te genera un plan personalizado en 60 segundos.</span>
            </td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
              <span style="color:#f97316;font-weight:800;font-size:18px;margin-right:10px;">3</span>
              <span style="font-size:15px;color:#1a1a2e;font-weight:600;">Matching con runners cerca</span><br>
              <span style="font-size:14px;color:#64748b;margin-left:28px;">Encuentra compañeros compatibles por ritmo, nivel y zona.</span>
            </td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
              <span style="color:#f97316;font-weight:800;font-size:18px;margin-right:10px;">4</span>
              <span style="font-size:15px;color:#1a1a2e;font-weight:600;">Audio alertas cada km</span><br>
              <span style="font-size:14px;color:#64748b;margin-left:28px;">Funciona en segundo plano iOS y Android, incluso con la app cerrada.</span>
            </td></tr>
            <tr><td style="padding:10px 0;">
              <span style="color:#f97316;font-weight:800;font-size:18px;margin-right:10px;">5</span>
              <span style="font-size:15px;color:#1a1a2e;font-weight:600;">Google Sign-In arreglado</span><br>
              <span style="font-size:14px;color:#64748b;margin-left:28px;">Ya puedes entrar con Gmail sin problemas desde iOS y Android.</span>
            </td></tr>
          </table>

          <!-- Trial CTA -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;background:#fff7ed;border-radius:12px;border:1px solid #fed7aa;">
            <tr><td style="padding:16px 20px;">
              <div style="font-size:13px;font-weight:800;color:#c2410c;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:4px;">Exclusivo esta semana</div>
              <div style="font-size:15px;color:#1a1a2e;font-weight:600;">Prueba Pro 7 dias gratis. Cancela cuando quieras.</div>
            </td></tr>
          </table>

          <!-- Main CTA -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
            <tr><td align="center">
              <a href="https://www.correrjuntos.com?utm_source=brevo&utm_medium=email&utm_campaign=v132_launch" style="display:inline-block;background:#f97316;color:#fff;font-size:16px;font-weight:700;text-decoration:none;padding:15px 32px;border-radius:12px;">Abrir Correr Juntos</a>
            </td></tr>
          </table>

          <p style="font-size:14px;color:#64748b;line-height:1.6;margin:0 0 8px;">
            ¿No tienes la app todavia?
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
            <tr>
              <td style="padding-right:10px;">
                <a href="https://apps.apple.com/app/id6758505910?utm_source=brevo&utm_medium=email&utm_campaign=v132_launch" style="font-size:13px;color:#f97316;text-decoration:underline;font-weight:600;">Descargar en App Store</a>
              </td>
              <td>
                <a href="https://play.google.com/store/apps/details?id=com.correrjuntos.app&utm_source=brevo&utm_medium=email&utm_campaign=v132_launch" style="font-size:13px;color:#f97316;text-decoration:underline;font-weight:600;">Descargar en Google Play</a>
              </td>
            </tr>
          </table>

          <p style="font-size:14px;line-height:1.6;color:#64748b;margin:0 0 4px;">
            Cualquier duda, responde directamente a este email — lo leemos personalmente.
          </p>
          <p style="font-size:14px;line-height:1.6;color:#1a1a2e;font-weight:600;margin:24px 0 0;">
            Javi<br><span style="color:#64748b;font-weight:400;">Correr Juntos</span>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="font-size:12px;color:#94a3b8;margin:0 0 10px;line-height:1.5;">
            Recibes este correo porque te registraste en <a href="https://www.correrjuntos.com" style="color:#94a3b8;text-decoration:underline;">correrjuntos.com</a>.
          </p>
          <p style="font-size:12px;color:#94a3b8;margin:0;">
            <a href="{{ unsubscribe }}" style="color:#94a3b8;text-decoration:underline;">Darse de baja</a> &middot;
            <a href="https://www.correrjuntos.com/privacy" style="color:#94a3b8;text-decoration:underline;">Privacidad</a>
          </p>
        </td></tr>

      </table>

    </td></tr>
  </table>
</body></html>`;

const text = `Hola {{contact.FIRSTNAME | default: "runner"}},

Acabamos de publicar la version 1.3.2 de Correr Juntos con todo lo que nos pediais:

1. 7 planes de entrenamiento - Gratis: "Empieza a Moverte" y 0->5K. Premium: 5K, 10K, Trail, 21K, 42K.
2. Coach Jose (IA) - Te genera un plan personalizado en 60 segundos.
3. Matching con runners cerca - Encuentra companeros compatibles por ritmo, nivel y zona.
4. Audio alertas cada km - Funciona en segundo plano iOS y Android.
5. Google Sign-In arreglado - Ya puedes entrar con Gmail sin problemas.

EXCLUSIVO ESTA SEMANA: Prueba Pro 7 dias gratis. Cancela cuando quieras.

Abrir la app: https://www.correrjuntos.com
App Store: https://apps.apple.com/app/id6758505910
Google Play: https://play.google.com/store/apps/details?id=com.correrjuntos.app

Cualquier duda responde a este email.

Javi
Correr Juntos

--
Darse de baja: {{ unsubscribe }}`;

const body = JSON.stringify({
  name: 'v1.3.2 Launch - Reactivacion Espana (DRAFT)',
  subject: 'Nuevo: 7 planes de entrenamiento + Coach IA',
  sender: { id: 3 }, // hola@correrjuntos.com
  replyTo: 'hola@correrjuntos.com',
  htmlContent: html,
  textContent: text,
  recipients: { listIds: [7] },
  inlineImageActivation: false,
  header: 'Nuevo: 7 planes de entrenamiento + Coach IA',
  footer: 'Correr Juntos',
});

const req = https.request({
  hostname: 'api.brevo.com',
  path: '/v3/emailCampaigns',
  method: 'POST',
  headers: {
    'api-key': API_KEY,
    'content-type': 'application/json',
    'accept': 'application/json',
    'content-length': Buffer.byteLength(body),
  },
}, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const parsed = JSON.parse(data);
      console.log('\n✓ Draft creado');
      console.log('Campaign ID:', parsed.id);
      console.log('Dashboard: https://my.brevo.com/camp/template/' + parsed.id);
      console.log('\nNo enviada. Revisala en Brevo y dale "Enviar" cuando quieras.');
    } else {
      console.error('FAILED:', res.statusCode);
      console.error(data);
      process.exit(1);
    }
  });
});
req.on('error', (e) => { console.error('REQUEST ERROR:', e.message); process.exit(1); });
req.write(body);
req.end();
