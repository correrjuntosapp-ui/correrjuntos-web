import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── CORS: restrict to known origins ──
const ALLOWED_ORIGINS = [
  'https://correrjuntos.com',
  'https://www.correrjuntos.com',
  'http://localhost:3000',
  'http://localhost:5173',
]

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

// ── Auth: verify caller is authenticated (JWT or service role) ──
async function verifyAuth(req: Request): Promise<{ authorized: boolean; userId?: string }> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { authorized: false }
  }

  const token = authHeader.replace('Bearer ', '')

  // Check if it's the service role key (server-to-server calls)
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (token === serviceRoleKey) {
    return { authorized: true, userId: 'service' }
  }

  // Otherwise verify as user JWT
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseAnon)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return { authorized: false }
  }

  return { authorized: true, userId: user.id }
}

// ============================================================
// BREVO TRANSACTIONAL EMAIL — Edge Function
// Envía emails transaccionales vía Brevo API v3
// Tipos: welcome, nearby_quedada, premium_activated, reactivation, post_quedada, weekly_digest
// ============================================================

const SENDER = {
  name: 'Correr Juntos',
  email: 'correrjuntosapp@gmail.com',
}

const BASE_URL = 'https://correrjuntos.com'

// ---- HTML Email Templates ----

function baseTemplate(content: string, lang: string): string {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0b1220;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1220;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#111827;border-radius:16px;overflow:hidden;">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:30px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">CORRER<span style="font-weight:400;">JUNTOS</span></h1>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:40px;">
    ${content}
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:20px 40px 30px;border-top:1px solid #1f2937;text-align:center;">
    <p style="margin:0 0 8px;color:#6b7280;font-size:12px;">
      ${lang === 'en' ? 'You received this email because you have an account on' : 'Recibes este email porque tienes una cuenta en'}
      <a href="${BASE_URL}" style="color:#f97316;text-decoration:none;">correrjuntos.com</a>
    </p>
    <p style="margin:0 0 8px;color:#4b5563;font-size:11px;">
      <a href="${BASE_URL}/?unsubscribe=email" style="color:#6b7280;text-decoration:underline;">
        ${lang === 'en' ? 'Manage email preferences / Unsubscribe' : 'Gestionar preferencias de email / Cancelar suscripcion'}
      </a>
    </p>
    <p style="margin:0;color:#4b5563;font-size:11px;">
      Correr Juntos &copy; ${new Date().getFullYear()}
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function ctaButton(text: string, url: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
<tr><td align="center">
  <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;font-weight:700;font-size:16px;padding:14px 32px;border-radius:12px;text-decoration:none;">
    ${text}
  </a>
</td></tr>
</table>`
}

// ---- Welcome Email ----
function welcomeEmail(name: string, lang: string): { subject: string; html: string } {
  const isEN = lang === 'en'
  const subject = isEN
    ? `Welcome to CorrerJuntos, ${name}!`
    : `Bienvenido a CorrerJuntos, ${name}!`

  const content = isEN
    ? `
    <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;">Welcome, ${name}! 🎉</h2>
    <p style="margin:0 0 20px;color:#d1d5db;font-size:15px;line-height:1.6;">
      You've joined a community of <strong style="color:#f97316;">1,200+ runners</strong> in 55+ cities across 20 countries.
      Here are 3 steps to get started:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:12px 0;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:40px;height:40px;background:#f97316;border-radius:50%;text-align:center;vertical-align:middle;color:#fff;font-weight:700;font-size:16px;">1</td>
          <td style="padding-left:16px;color:#d1d5db;font-size:14px;"><strong style="color:#fff;">Complete your profile</strong><br/>Add your city, level and photo</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:12px 0;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:40px;height:40px;background:#f97316;border-radius:50%;text-align:center;vertical-align:middle;color:#fff;font-weight:700;font-size:16px;">2</td>
          <td style="padding-left:16px;color:#d1d5db;font-size:14px;"><strong style="color:#fff;">Find a meetup near you</strong><br/>Check the map and join one</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:12px 0;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:40px;height:40px;background:#f97316;border-radius:50%;text-align:center;vertical-align:middle;color:#fff;font-weight:700;font-size:16px;">3</td>
          <td style="padding-left:16px;color:#d1d5db;font-size:14px;"><strong style="color:#fff;">Run together!</strong><br/>Meet your group and enjoy the run</td>
        </tr></table>
      </td></tr>
    </table>
    ${ctaButton('Explore meetups near you', BASE_URL)}`
    : `
    <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;">Bienvenido, ${name}! 🎉</h2>
    <p style="margin:0 0 20px;color:#d1d5db;font-size:15px;line-height:1.6;">
      Te has unido a una comunidad de <strong style="color:#f97316;">1.200+ runners</strong> en 55+ ciudades de 20 paises.
      3 pasos para empezar:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:12px 0;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:40px;height:40px;background:#f97316;border-radius:50%;text-align:center;vertical-align:middle;color:#fff;font-weight:700;font-size:16px;">1</td>
          <td style="padding-left:16px;color:#d1d5db;font-size:14px;"><strong style="color:#fff;">Completa tu perfil</strong><br/>Ciudad, nivel y foto</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:12px 0;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:40px;height:40px;background:#f97316;border-radius:50%;text-align:center;vertical-align:middle;color:#fff;font-weight:700;font-size:16px;">2</td>
          <td style="padding-left:16px;color:#d1d5db;font-size:14px;"><strong style="color:#fff;">Encuentra una quedada</strong><br/>Mira el mapa y apuntate a una</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:12px 0;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:40px;height:40px;background:#f97316;border-radius:50%;text-align:center;vertical-align:middle;color:#fff;font-weight:700;font-size:16px;">3</td>
          <td style="padding-left:16px;color:#d1d5db;font-size:14px;"><strong style="color:#fff;">Corre en grupo!</strong><br/>Conoce gente y disfruta corriendo</td>
        </tr></table>
      </td></tr>
    </table>
    ${ctaButton('Explorar quedadas cerca de ti', BASE_URL)}`

  return { subject, html: baseTemplate(content, lang) }
}

// ---- Nearby Quedada Email ----
function nearbyQuedadaEmail(
  data: { titulo: string; ciudad: string; fecha: string; hora: string; distancia: string; quedada_id: string },
  lang: string
): { subject: string; html: string } {
  const isEN = lang === 'en'
  const subject = isEN
    ? `New meetup near you: "${data.titulo}"`
    : `Nueva quedada cerca de ti: "${data.titulo}"`

  const quedadaUrl = `${BASE_URL}/?quedada=${data.quedada_id}`

  const content = isEN
    ? `
    <h2 style="margin:0 0 8px;color:#ffffff;font-size:22px;">📍 New meetup near you</h2>
    <p style="margin:0 0 24px;color:#9ca3af;font-size:14px;">Someone created a meetup close to your location</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;padding:20px;">
      <tr><td style="padding:16px 20px;">
        <h3 style="margin:0 0 12px;color:#f97316;font-size:18px;">${data.titulo}</h3>
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="padding:4px 0;color:#d1d5db;font-size:14px;">📍 <strong>${data.ciudad}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#d1d5db;font-size:14px;">📅 ${data.fecha} &nbsp; 🕐 ${data.hora}</td></tr>
          <tr><td style="padding:4px 0;color:#d1d5db;font-size:14px;">📏 ${data.distancia}</td></tr>
        </table>
      </td></tr>
    </table>
    ${ctaButton('View meetup', quedadaUrl)}`
    : `
    <h2 style="margin:0 0 8px;color:#ffffff;font-size:22px;">📍 Nueva quedada cerca de ti</h2>
    <p style="margin:0 0 24px;color:#9ca3af;font-size:14px;">Alguien ha creado una quedada cerca de tu ubicacion</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;padding:20px;">
      <tr><td style="padding:16px 20px;">
        <h3 style="margin:0 0 12px;color:#f97316;font-size:18px;">${data.titulo}</h3>
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="padding:4px 0;color:#d1d5db;font-size:14px;">📍 <strong>${data.ciudad}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#d1d5db;font-size:14px;">📅 ${data.fecha} &nbsp; 🕐 ${data.hora}</td></tr>
          <tr><td style="padding:4px 0;color:#d1d5db;font-size:14px;">📏 ${data.distancia}</td></tr>
        </table>
      </td></tr>
    </table>
    ${ctaButton('Ver quedada', quedadaUrl)}`

  return { subject, html: baseTemplate(content, lang) }
}

// ---- Premium Activated Email ----
function premiumEmail(name: string, lang: string): { subject: string; html: string } {
  const isEN = lang === 'en'
  const subject = isEN
    ? `Welcome to Premium, ${name}! ⭐`
    : `Bienvenido a Premium, ${name}! ⭐`

  const features = isEN
    ? [
        ['🔓', 'Unlimited meetups', 'Create as many meetups as you want'],
        ['🔁', 'Recurring meetups', 'Weekly, biweekly or monthly auto-repeat'],
        ['🔒', 'Private meetups', 'With access code for your group'],
        ['🗺️', 'GPS routes', 'Draw routes on the map'],
      ]
    : [
        ['🔓', 'Quedadas ilimitadas', 'Crea todas las que quieras'],
        ['🔁', 'Quedadas recurrentes', 'Semanal, quincenal o mensual'],
        ['🔒', 'Quedadas privadas', 'Con codigo de acceso para tu grupo'],
        ['🗺️', 'Rutas GPS', 'Dibuja rutas en el mapa'],
      ]

  const featuresHtml = features.map(([icon, title, desc]) => `
    <tr><td style="padding:8px 0;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:36px;font-size:20px;vertical-align:top;">${icon}</td>
        <td style="padding-left:8px;color:#d1d5db;font-size:14px;"><strong style="color:#fff;">${title}</strong><br/><span style="color:#9ca3af;">${desc}</span></td>
      </tr></table>
    </td></tr>
  `).join('')

  const content = isEN
    ? `
    <h2 style="margin:0 0 8px;color:#ffffff;font-size:22px;">⭐ Welcome to Premium!</h2>
    <p style="margin:0 0 24px;color:#d1d5db;font-size:15px;line-height:1.6;">
      Thanks, ${name}! You now have access to all premium features:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;">
      <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">${featuresHtml}</table>
      </td></tr>
    </table>
    ${ctaButton('Create your first Premium meetup', BASE_URL)}`
    : `
    <h2 style="margin:0 0 8px;color:#ffffff;font-size:22px;">⭐ Bienvenido a Premium!</h2>
    <p style="margin:0 0 24px;color:#d1d5db;font-size:15px;line-height:1.6;">
      Gracias, ${name}! Ya tienes acceso a todas las funciones Premium:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;">
      <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">${featuresHtml}</table>
      </td></tr>
    </table>
    ${ctaButton('Crea tu primera quedada Premium', BASE_URL)}`

  return { subject, html: baseTemplate(content, lang) }
}

// ---- Reactivation Email (7 days inactive) ----
function reactivationEmail(name: string, lang: string, data: { ciudad?: string; quedadas_count?: number }): { subject: string; html: string } {
  const isEN = lang === 'en'
  const subject = isEN
    ? `We miss you, ${name}! 🏃`
    : `Te echamos de menos, ${name}! 🏃`

  const quedadasText = data.quedadas_count && data.quedadas_count > 0
    ? (isEN
        ? `There are <strong style="color:#f97316;">${data.quedadas_count} meetups</strong> waiting${data.ciudad ? ` in ${data.ciudad}` : ''}.`
        : `Hay <strong style="color:#f97316;">${data.quedadas_count} quedadas</strong> esperandote${data.ciudad ? ` en ${data.ciudad}` : ''}.`)
    : (isEN
        ? `New meetups are being created every day.`
        : `Nuevas quedadas se crean cada dia.`)

  const content = isEN
    ? `
    <h2 style="margin:0 0 8px;color:#ffffff;font-size:22px;">Hey ${name}, it's been a while! 👋</h2>
    <p style="margin:0 0 20px;color:#d1d5db;font-size:15px;line-height:1.6;">
      Your running shoes are getting dusty! ${quedadasText}
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;">
      <tr><td style="padding:20px;text-align:center;">
        <p style="margin:0 0 8px;font-size:40px;">🏃‍♂️💨</p>
        <p style="margin:0;color:#d1d5db;font-size:14px;">
          ${isEN ? 'Every run is a chance to meet amazing people' : 'Cada carrera es una oportunidad de conocer gente increible'}
        </p>
      </td></tr>
    </table>
    ${ctaButton('Find a meetup', BASE_URL)}`
    : `
    <h2 style="margin:0 0 8px;color:#ffffff;font-size:22px;">Ey ${name}, hace tiempo que no te vemos! 👋</h2>
    <p style="margin:0 0 20px;color:#d1d5db;font-size:15px;line-height:1.6;">
      Tus zapatillas se estan llenando de polvo! ${quedadasText}
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;">
      <tr><td style="padding:20px;text-align:center;">
        <p style="margin:0 0 8px;font-size:40px;">🏃‍♂️💨</p>
        <p style="margin:0;color:#d1d5db;font-size:14px;">
          Cada carrera es una oportunidad de conocer gente increible
        </p>
      </td></tr>
    </table>
    ${ctaButton('Buscar quedadas', BASE_URL)}`

  return { subject, html: baseTemplate(content, lang) }
}

// ---- Post-Quedada Email (after attending) ----
function postQuedadaEmail(
  name: string,
  lang: string,
  data: { titulo: string; ciudad: string; participantes: number; quedada_id: string }
): { subject: string; html: string } {
  const isEN = lang === 'en'
  const subject = isEN
    ? `How was "${data.titulo}"? Share your experience! 🏅`
    : `Que tal "${data.titulo}"? Comparte tu experiencia! 🏅`

  const quedadaUrl = `${BASE_URL}/?quedada=${data.quedada_id}`

  const content = isEN
    ? `
    <h2 style="margin:0 0 8px;color:#ffffff;font-size:22px;">Great run, ${name}! 🏅</h2>
    <p style="margin:0 0 24px;color:#d1d5db;font-size:15px;line-height:1.6;">
      You ran with <strong style="color:#f97316;">${data.participantes} runners</strong> at "${data.titulo}" in ${data.ciudad}. Awesome!
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;">
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:center;padding:8px;">
              <p style="margin:0;font-size:28px;">🤝</p>
              <p style="margin:4px 0 0;color:#f97316;font-size:20px;font-weight:700;">${data.participantes}</p>
              <p style="margin:2px 0 0;color:#9ca3af;font-size:11px;">runners</p>
            </td>
            <td style="text-align:center;padding:8px;">
              <p style="margin:0;font-size:28px;">📍</p>
              <p style="margin:4px 0 0;color:#f97316;font-size:14px;font-weight:700;">${data.ciudad}</p>
              <p style="margin:2px 0 0;color:#9ca3af;font-size:11px;">city</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:20px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
      Did you enjoy it? Share with your friends!
    </p>
    ${ctaButton('See your next meetup', BASE_URL)}`
    : `
    <h2 style="margin:0 0 8px;color:#ffffff;font-size:22px;">Gran carrera, ${name}! 🏅</h2>
    <p style="margin:0 0 24px;color:#d1d5db;font-size:15px;line-height:1.6;">
      Corriste con <strong style="color:#f97316;">${data.participantes} runners</strong> en "${data.titulo}" en ${data.ciudad}. Genial!
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;">
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:center;padding:8px;">
              <p style="margin:0;font-size:28px;">🤝</p>
              <p style="margin:4px 0 0;color:#f97316;font-size:20px;font-weight:700;">${data.participantes}</p>
              <p style="margin:2px 0 0;color:#9ca3af;font-size:11px;">runners</p>
            </td>
            <td style="text-align:center;padding:8px;">
              <p style="margin:0;font-size:28px;">📍</p>
              <p style="margin:4px 0 0;color:#f97316;font-size:14px;font-weight:700;">${data.ciudad}</p>
              <p style="margin:2px 0 0;color:#9ca3af;font-size:11px;">ciudad</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:20px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
      Te gusto? Comparte con tus amigos!
    </p>
    ${ctaButton('Ver tu proxima quedada', BASE_URL)}`

  return { subject, html: baseTemplate(content, lang) }
}

// ---- Weekly Digest Email ----
function weeklyDigestEmail(
  name: string,
  lang: string,
  data: { ciudad: string; quedadas: Array<{ titulo: string; fecha: string; hora: string; participantes: number; id: string }> }
): { subject: string; html: string } {
  const isEN = lang === 'en'
  const count = data.quedadas.length
  const subject = isEN
    ? `${count} meetups this week in ${data.ciudad} 📅`
    : `${count} quedadas esta semana en ${data.ciudad} 📅`

  const quedadasHtml = data.quedadas.slice(0, 5).map(q => `
    <tr><td style="padding:12px 16px;border-bottom:1px solid #374151;">
      <a href="${BASE_URL}/?quedada=${q.id}" style="text-decoration:none;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td>
            <p style="margin:0;color:#f97316;font-size:15px;font-weight:700;">${q.titulo}</p>
            <p style="margin:4px 0 0;color:#9ca3af;font-size:12px;">📅 ${q.fecha} &nbsp; 🕐 ${q.hora} &nbsp; 🏃 ${q.participantes} runners</p>
          </td>
          <td style="width:30px;text-align:right;color:#6b7280;font-size:18px;">→</td>
        </tr></table>
      </a>
    </td></tr>
  `).join('')

  const moreText = count > 5
    ? (isEN ? `<p style="margin:12px 0 0;color:#9ca3af;font-size:12px;text-align:center;">...and ${count - 5} more</p>` : `<p style="margin:12px 0 0;color:#9ca3af;font-size:12px;text-align:center;">...y ${count - 5} mas</p>`)
    : ''

  const content = isEN
    ? `
    <h2 style="margin:0 0 8px;color:#ffffff;font-size:22px;">📅 Your weekly rundown</h2>
    <p style="margin:0 0 24px;color:#d1d5db;font-size:15px;line-height:1.6;">
      Hey ${name}! This week there are <strong style="color:#f97316;">${count} meetups</strong> in ${data.ciudad}:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;overflow:hidden;">
      ${quedadasHtml}
    </table>
    ${moreText}
    ${ctaButton('See all meetups', BASE_URL)}`
    : `
    <h2 style="margin:0 0 8px;color:#ffffff;font-size:22px;">📅 Tu resumen semanal</h2>
    <p style="margin:0 0 24px;color:#d1d5db;font-size:15px;line-height:1.6;">
      Hola ${name}! Esta semana hay <strong style="color:#f97316;">${count} quedadas</strong> en ${data.ciudad}:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;overflow:hidden;">
      ${quedadasHtml}
    </table>
    ${moreText}
    ${ctaButton('Ver todas las quedadas', BASE_URL)}`

  return { subject, html: baseTemplate(content, lang) }
}

// ---- Reminder Email (24h / 1h before) ----
function reminderEmail(
  name: string,
  lang: string,
  data: { titulo: string; ciudad: string; fecha: string; hora: string; quedada_id: string; tipo_recordatorio: string }
): { subject: string; html: string } {
  const isEN = lang === 'en'
  const is24h = data.tipo_recordatorio === '24h'

  const subject = isEN
    ? (is24h ? `Tomorrow: "${data.titulo}" in ${data.ciudad} ⏰` : `Starting in 1 hour: "${data.titulo}" 🏃`)
    : (is24h ? `Mañana: "${data.titulo}" en ${data.ciudad} ⏰` : `Empieza en 1 hora: "${data.titulo}" 🏃`)

  const quedadaUrl = `${BASE_URL}/?quedada=${data.quedada_id}`

  const content = isEN
    ? `
    <h2 style="margin:0 0 8px;color:#ffffff;font-size:22px;">${is24h ? '⏰ Tomorrow you have a meetup!' : '🏃 Your meetup starts in 1 hour!'}</h2>
    <p style="margin:0 0 24px;color:#d1d5db;font-size:15px;line-height:1.6;">
      ${is24h ? `Don't forget, ${name}!` : `Get ready, ${name}!`} Your meetup is ${is24h ? 'tomorrow' : 'about to start'}:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;">
      <tr><td style="padding:20px;">
        <h3 style="margin:0 0 12px;color:#f97316;font-size:18px;">${data.titulo}</h3>
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="padding:4px 0;color:#d1d5db;font-size:14px;">📍 <strong>${data.ciudad}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#d1d5db;font-size:14px;">📅 ${data.fecha} &nbsp; 🕐 ${data.hora}h</td></tr>
        </table>
      </td></tr>
    </table>
    ${ctaButton('View meetup details', quedadaUrl)}`
    : `
    <h2 style="margin:0 0 8px;color:#ffffff;font-size:22px;">${is24h ? '⏰ Mañana tienes quedada!' : '🏃 Tu quedada empieza en 1 hora!'}</h2>
    <p style="margin:0 0 24px;color:#d1d5db;font-size:15px;line-height:1.6;">
      ${is24h ? `No te olvides, ${name}!` : `Preparate, ${name}!`} Tu quedada ${is24h ? 'es mañana' : 'esta a punto de empezar'}:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;">
      <tr><td style="padding:20px;">
        <h3 style="margin:0 0 12px;color:#f97316;font-size:18px;">${data.titulo}</h3>
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="padding:4px 0;color:#d1d5db;font-size:14px;">📍 <strong>${data.ciudad}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#d1d5db;font-size:14px;">📅 ${data.fecha} &nbsp; 🕐 ${data.hora}h</td></tr>
        </table>
      </td></tr>
    </table>
    ${ctaButton('Ver detalles de la quedada', quedadaUrl)}`

  return { subject, html: baseTemplate(content, lang) }
}

// ---- Send via Brevo API ----
async function sendBrevoEmail(
  to: { email: string; name?: string },
  subject: string,
  htmlContent: string
): Promise<boolean> {
  const apiKey = Deno.env.get('BREVO_API_KEY')
  if (!apiKey) {
    console.error('BREVO_API_KEY not configured')
    return false
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email: to.email, name: to.name || to.email }],
        subject,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error('Brevo API error:', response.status, err)
      return false
    }

    console.log(`Email sent to ${to.email}: ${subject}`)
    return true
  } catch (error) {
    console.error('Error sending Brevo email:', error)
    return false
  }
}

// ---- Main Handler ----
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // ── Auth check ──
  const auth = await verifyAuth(req)
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json()
    const { type, to_email, to_name, lang = 'es', data = {} } = body

    if (!type || !to_email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, to_email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let subject: string
    let html: string

    switch (type) {
      case 'welcome': {
        const result = welcomeEmail(to_name || to_email.split('@')[0], lang)
        subject = result.subject
        html = result.html
        break
      }
      case 'nearby_quedada': {
        const result = nearbyQuedadaEmail(data, lang)
        subject = result.subject
        html = result.html
        break
      }
      case 'premium_activated': {
        const result = premiumEmail(to_name || to_email.split('@')[0], lang)
        subject = result.subject
        html = result.html
        break
      }
      case 'reactivation': {
        const result = reactivationEmail(to_name || to_email.split('@')[0], lang, data)
        subject = result.subject
        html = result.html
        break
      }
      case 'post_quedada': {
        const result = postQuedadaEmail(to_name || to_email.split('@')[0], lang, data)
        subject = result.subject
        html = result.html
        break
      }
      case 'weekly_digest': {
        const result = weeklyDigestEmail(to_name || to_email.split('@')[0], lang, data)
        subject = result.subject
        html = result.html
        break
      }
      case 'reminder': {
        const result = reminderEmail(to_name || to_email.split('@')[0], lang, data)
        subject = result.subject
        html = result.html
        break
      }
      default:
        return new Response(
          JSON.stringify({ error: `Unknown email type: ${type}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    const success = await sendBrevoEmail({ email: to_email, name: to_name }, subject, html)

    // Log en notificaciones_enviadas
    if (success) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        await supabase.from('notificaciones_enviadas').insert({
          user_id: data.user_id || null,
          tipo: type,
          titulo: subject,
          cuerpo: `Email to ${to_email}`,
          quedada_id: data.quedada_id || null,
          canal: 'email',
        }).catch(() => {}) // Silently fail if table doesn't exist
      } catch (e) {
        console.warn('Failed to log email notification:', e)
      }
    }

    return new Response(
      JSON.stringify({ success, type, to: to_email }),
      { status: success ? 200 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
