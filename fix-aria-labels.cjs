/**
 * Add aria-label to buttons that only have an onclick and no text/aria-label/title.
 * Targets close buttons, toggle buttons, and icon-only buttons.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'index.html');
let html = fs.readFileSync(file, 'utf8');

let count = 0;

// Pattern: <button ... onclick="closeModal('modal-xxx')" ...> with only SVG inside (no text)
// Add aria-label="Cerrar" to close buttons
html = html.replace(/<button([^>]*onclick="close(?:Modal|Sidebar|CiudadView)\([^)]*\)"[^>]*)>/g, (match, attrs) => {
  if (/aria-label/.test(attrs)) return match;
  count++;
  return `<button${attrs} aria-label="Cerrar">`;
});

// Pattern: <button ... onclick="document.getElementById('modal-quedada-preview').c..." (close preview)
html = html.replace(/<button([^>]*onclick="document\.getElementById\('modal-quedada-preview'\)\.c[^"]*"[^>]*)>/g, (match, attrs) => {
  if (/aria-label/.test(attrs)) return match;
  count++;
  return `<button${attrs} aria-label="Cerrar">`;
});

// Toggle buttons (notifications, etc.)
html = html.replace(/<button([^>]*id="notif-toggle-btn"[^>]*)>/g, (match, attrs) => {
  if (/aria-label/.test(attrs)) return match;
  count++;
  return `<button${attrs} aria-label="Notificaciones">`;
});

// Share stats button
html = html.replace(/<button([^>]*id="btn-share-stats"[^>]*)>/g, (match, attrs) => {
  if (/aria-label/.test(attrs)) return match;
  count++;
  return `<button${attrs} aria-label="Compartir estadísticas">`;
});

// Theme toggle (already has title, but add aria-label if missing)
html = html.replace(/<button([^>]*onclick="toggleTheme\(\)"[^>]*)>/g, (match, attrs) => {
  if (/aria-label/.test(attrs)) return match;
  count++;
  return `<button${attrs} aria-label="Cambiar tema">`;
});

// Generic: any button with only SVG content and onclick but no text/aria-label
// Match buttons that contain SVG but no visible text
const btnRegex = /<button([^>]*)>([\s]*<svg[^]*?<\/svg>[\s]*)<\/button>/g;
html = html.replace(btnRegex, (match, attrs, content) => {
  if (/aria-label/.test(attrs) || /title=/.test(attrs)) return match;
  // Check if there's text content besides SVG
  const textOnly = content.replace(/<svg[^]*?<\/svg>/g, '').trim();
  if (textOnly) return match; // Has text, skip

  // Try to guess label from onclick
  const onclickMatch = attrs.match(/onclick="([^"]+)"/);
  let label = 'Acción';
  if (onclickMatch) {
    const onclick = onclickMatch[1];
    if (onclick.includes('close')) label = 'Cerrar';
    else if (onclick.includes('share')) label = 'Compartir';
    else if (onclick.includes('toggle')) label = 'Alternar';
    else if (onclick.includes('back') || onclick.includes('Back')) label = 'Volver';
  }

  count++;
  return `<button${attrs} aria-label="${label}">${content}</button>`;
});

fs.writeFileSync(file, html, 'utf8');
console.log(`✓ Added aria-label to ${count} buttons`);
