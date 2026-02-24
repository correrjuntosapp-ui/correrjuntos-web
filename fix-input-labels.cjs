/**
 * Add aria-label to all <input>, <select>, and <textarea> without one.
 * Uses placeholder text or id as the label source.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(filePath, 'utf8');
let count = 0;

// Map of id -> descriptive aria-label for inputs without good placeholders
const labelMap = {
  'q-fecha': 'Fecha de la quedada',
  'q-distancia-num': 'Distancia en kilómetros',
  'q-ritmo-min': 'Ritmo minutos',
  'q-ritmo-sec': 'Ritmo segundos',
  'referral-link-input': 'Enlace de referido',
};

// Fix static <input> tags
html = html.replace(/<input\b([^>]*?)>/g, (match, attrs) => {
  // Skip if already has aria-label, or is hidden/checkbox/radio/file
  if (/aria-label/i.test(attrs)) return match;
  if (/type=["'](?:hidden|file|checkbox|radio)["']/i.test(attrs)) return match;

  // Extract id and placeholder
  const idMatch = attrs.match(/id=["']([^"']+)["']/);
  const phMatch = attrs.match(/placeholder=["']([^"']+)["']/);
  const id = idMatch ? idMatch[1] : '';

  let label = '';
  if (labelMap[id]) {
    label = labelMap[id];
  } else if (phMatch) {
    label = phMatch[1];
  } else if (id) {
    // Convert id to readable label: "profile-first" -> "Nombre"
    label = id.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  if (!label) return match;

  count++;
  return `<input${attrs} aria-label="${label}">`;
});

// Fix static <select> tags without aria-label
html = html.replace(/<select\b([^>]*?)>/g, (match, attrs) => {
  if (/aria-label/i.test(attrs)) return match;

  const idMatch = attrs.match(/id=["']([^"']+)["']/);
  const id = idMatch ? idMatch[1] : '';

  const selectLabels = {
    'q-nivel': 'Nivel de dificultad',
    'q-max': 'Máximo de participantes',
    'profile-level': 'Tu nivel de running',
    'profile-gender': 'Género',
    'onboard-nivel': 'Tu nivel de running',
    'alert-distance': 'Radio de distancia',
    'alert-level': 'Nivel de la alerta',
    'alert-time': 'Hora preferida',
  };

  let label = selectLabels[id] || (id ? id.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '');
  if (!label) return match;

  count++;
  return `<select${attrs} aria-label="${label}">`;
});

// Fix static <textarea> tags without aria-label
html = html.replace(/<textarea\b([^>]*?)>/g, (match, attrs) => {
  if (/aria-label/i.test(attrs)) return match;

  const phMatch = attrs.match(/placeholder=["']([^"']+)["']/);
  const idMatch = attrs.match(/id=["']([^"']+)["']/);

  let label = phMatch ? phMatch[1] : (idMatch ? idMatch[1].replace(/[-_]/g, ' ') : '');
  if (!label) return match;

  count++;
  return `<textarea${attrs} aria-label="${label}">`;
});

fs.writeFileSync(filePath, html, 'utf8');
console.log(`✓ Added aria-label to ${count} form elements`);
