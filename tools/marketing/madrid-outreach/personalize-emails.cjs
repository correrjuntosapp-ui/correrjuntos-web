/**
 * Personalize emails from running-clubs-madrid.csv
 *
 * Reads the CSV, applies the master template to each row, and writes one
 * `.txt` file per club under ./outbox/ ready to copy-paste into Gmail.
 *
 * Also writes a combined `all-emails.txt` for scanning at a glance.
 *
 * Usage:
 *   node personalize-emails.cjs
 *   node personalize-emails.cjs --sender="Juan Pérez" --phone="+34 600 000 000"
 */
const fs = require('fs');
const path = require('path');

// ── Args ──
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, ...rest] = a.replace(/^--/, '').split('=');
      return [k, rest.join('=').replace(/^"|"$/g, '')];
    })
);
const SENDER = args.sender || '[TU NOMBRE]';
const PHONE  = args.phone  || '[TU TELEFONO]';

// ── Load CSV ──
const csvPath = path.resolve(__dirname, 'running-clubs-madrid.csv');
const raw = fs.readFileSync(csvPath, 'utf-8').replace(/\r\n/g, '\n');
const lines = raw.split('\n').filter((l) => l.trim().length > 0);

// Minimal CSV parser that handles quoted commas — good enough for our schema.
function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      out.push(cur); cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

const headers = parseCSVLine(lines[0]);
const rows = lines.slice(1).map((line) => {
  const vals = parseCSVLine(line);
  return Object.fromEntries(headers.map((h, i) => [h, vals[i] || '']));
});

// ── Templates ──
const subjectLine = (club) =>
  `Ayudamos a ${club} a captar socios nuevos (sin cambiar nada interno)`;

const body = (row) => {
  const nombre       = row.nombre || 'vuestro club';
  const hook         = row.personalization_hook || '[PERSONALIZAR: menciona algo específico de su IG / última quedada / ruta habitual — este párrafo decide si leen el email]';
  const quedadaDia   = row.hora_quedada_abierta || 'vuestra próxima quedada abierta';
  return `Hola [nombre del organizador],

Soy ${SENDER}, fundador de CorrerJuntos. ${hook}

Hemos construido una app que conecta runners que no pertenecen a ningún club
(hay MUCHOS en Madrid) con clubs locales que organizan runs abiertas. No tocamos
nada de vuestros entrenamientos cerrados ni de vuestra metodología — esas quedan
tal cual. Solo facilitamos la parte de captación: perfil oficial del club en la app,
inscripciones 1-tap para vuestras quedadas abiertas, datos de asistencia, chat
automático por run. Gratis, sin exclusividad, sin compromiso.

Nuestra apuesta con clubs pioneros: los 10 primeros clubs de Madrid que se suman
aparecen destacados durante todo 2026 con badge "Club oficial verificado" y
prioridad cuando un runner busca un club cerca. Los siguientes entran como
clubs normales.

¿Tomamos un café de 15 min esta semana para enseñarte cómo funciona? Sin presión —
si no ves valor me dices "no" y nos vamos en paz. Si te viene mejor, puedo pasarme
por ${quedadaDia} y te lo enseño en 10 minutos antes de empezar a correr.

Un saludo,
${SENDER}
${PHONE}
https://www.correrjuntos.com · @correrjuntosapp
`;
};

// ── Emit ──
const outDir = path.resolve(__dirname, 'outbox');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const allSummary = [];
let count = 0;

for (const row of rows) {
  const clubName = row.nombre;
  if (!clubName || clubName.length === 0) continue; // skip empty template rows

  const slug = clubName.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  const email = row.email_contacto && row.email_contacto !== '' ? row.email_contacto : '[RELLENA_EMAIL_DE_SU_WEB_O_IG]';

  const fileContents =
    `=== EMAIL — ${clubName} ===\n\n` +
    `PARA: ${email}\n` +
    `ASUNTO: ${subjectLine(clubName)}\n\n` +
    `--- CUERPO ---\n\n` +
    body(row) +
    `\n\n--- NOTAS INTERNAS (no enviar) ---\n` +
    `Zona: ${row.zona}\n` +
    `Tier: ${row.tier}\n` +
    `Tamaño: ${row.tamaño_estimado || '—'}\n` +
    `Instagram: ${row.instagram || '—'}\n` +
    `Quedada abierta: ${row.hora_quedada_abierta || '—'}\n` +
    `Notas: ${row.notas || '—'}\n`;

  fs.writeFileSync(path.join(outDir, `${slug}.txt`), fileContents, 'utf-8');

  allSummary.push(`${count + 1}. ${clubName}  →  ${email}  (${row.tier ? 'tier ' + row.tier : 'tier?'})`);
  count++;
}

// Combined overview
fs.writeFileSync(
  path.join(outDir, '_INDEX.txt'),
  `OUTBOX — ${count} clubs\n${'='.repeat(40)}\n\n` +
  allSummary.join('\n') +
  `\n\n---\nCada .txt contiene: PARA, ASUNTO, CUERPO + notas internas.\n` +
  `Cuando mandes uno, renómbralo añadiendo "__SENT-" al inicio para que no lo re-generes.\n`,
  'utf-8'
);

console.log(`✅  ${count} emails generados en ${path.relative(process.cwd(), outDir)}/`);
console.log(`   Abre _INDEX.txt para ver la lista completa.`);
console.log(`\n   Siguiente paso:`);
console.log(`   1. Rellena los campos vacíos del CSV (emails reales, hooks personalizados)`);
console.log(`   2. Re-ejecuta este script`);
console.log(`   3. Copia-pega cada .txt a Gmail (uno por club, personaliza [nombre del organizador])`);
