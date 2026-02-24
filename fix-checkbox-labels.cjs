/**
 * Add aria-label to checkboxes without one
 */
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

const labels = {
  'login-remember': 'Recordar sesión',
  'reg-terminos': 'Acepto los términos y condiciones',
  'profile-wa': 'Activar WhatsApp',
  'pref-recordatorio-24h': 'Recordatorio 24 horas antes',
  'pref-recordatorio-1h': 'Recordatorio 1 hora antes',
  'pref-participante-se-une': 'Cuando un participante se une',
  'pref-nueva-quedada-ciudad': 'Nueva quedada en mi ciudad',
  'pref-quedada-cancelada': 'Quedada cancelada',
  'pref-premium-zona': 'Alertas por zona',
  'pref-premium-nivel': 'Alertas por nivel',
  'pref-premium-horario': 'Alertas por horario',
  'pref-premium-popular': 'Quedadas populares',
  'alert-push': 'Notificaciones push',
  'alert-email': 'Notificaciones por email',
  'welcome-level-all': 'Todos los niveles',
  'welcome-level-beginner': 'Principiante',
  'welcome-level-intermediate': 'Intermedio',
  'welcome-level-advanced': 'Avanzado',
  'welcome-notif-push': 'Notificaciones push',
  'welcome-notif-email': 'Notificaciones por email',
};

let count = 0;
for (const [id, label] of Object.entries(labels)) {
  const regex = new RegExp(`(<input[^>]*id="${id}"[^>]*)(>)`, 'g');
  html = html.replace(regex, (match, before, after) => {
    if (/aria-label/.test(before)) return match;
    count++;
    return `${before} aria-label="${label}"${after}`;
  });
}

fs.writeFileSync(filePath, html, 'utf8');
console.log(`✓ Added aria-label to ${count} checkboxes`);
