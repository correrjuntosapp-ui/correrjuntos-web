// Adds "eventStatus": "https://schema.org/EventScheduled" + eventAttendanceMode
// to every Event/SportsEvent JSON-LD node that's missing it.
//
// Strategy: locate each `"@type": "(Event|SportsEvent)"` line and inject the
// new fields immediately after it (so the diff is minimal and predictable).
// We skip nodes that already have eventStatus.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = ['.claude', 'node_modules', 'tmp', '.vercel', 'tools/marketing'];

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    if (SKIP_DIRS.includes(f)) continue;
    const p = path.join(dir, f);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p, files);
    else if (p.endsWith('.html')) files.push(p);
  }
  return files;
}

let totalFiles = 0;
let totalNodes = 0;
const filesPatched = [];

for (const file of walk(ROOT)) {
  // Skip files in any skipped subdirectory
  if (SKIP_DIRS.some(d => path.relative(ROOT, file).split(path.sep).includes(d))) continue;

  let html = fs.readFileSync(file, 'utf8');
  if (!/"@type":\s*"(SportsEvent|Event)"/.test(html)) continue;

  // For each match, look at the immediate object boundaries to decide if
  // eventStatus already present. We'll do it by scanning forward from the
  // @type line until the matching closing brace (depth-aware).
  let nodesPatchedInFile = 0;
  let result = '';
  let cursor = 0;
  const rx = /"@type":\s*"(SportsEvent|Event)"/g;
  let m;
  while ((m = rx.exec(html))) {
    // Find the enclosing object — walk backward to opening brace
    let i = m.index;
    let depth = 0;
    let objStart = -1;
    for (let k = i; k >= 0; k--) {
      const c = html[k];
      if (c === '}') depth++;
      else if (c === '{') {
        if (depth === 0) { objStart = k; break; }
        depth--;
      }
    }
    if (objStart < 0) continue;
    // Walk forward to closing brace
    let j = objStart;
    depth = 0;
    let objEnd = -1;
    for (; j < html.length; j++) {
      const c = html[j];
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) { objEnd = j; break; }
      }
    }
    if (objEnd < 0) continue;
    const node = html.slice(objStart, objEnd + 1);
    if (/"eventStatus"\s*:/.test(node)) continue;  // already has it

    // Find indentation of the @type line for clean injection
    // We look at the line containing @type, count leading whitespace
    const lineStart = html.lastIndexOf('\n', m.index) + 1;
    const indent = html.slice(lineStart, m.index);  // whitespace before "@type"

    // Build the injection (same indent so it matches existing formatting)
    const inject =
      `,\n${indent}"eventStatus": "https://schema.org/EventScheduled"` +
      `,\n${indent}"eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"`;

    // Insert AFTER the @type field's value (after the closing quote of "SportsEvent" or "Event")
    // m.index points to the start of "@type". Find the end of the value (after the quote that closes the type name).
    const typeEndRx = /"@type":\s*"(?:SportsEvent|Event)"/;
    const localMatch = typeEndRx.exec(html.slice(m.index));
    if (!localMatch) continue;
    const insertAt = m.index + localMatch[0].length;

    // We don't actually splice yet — we batch. To keep indices correct under
    // the loop with rx.lastIndex moving forward, we work in the unmodified
    // copy and collect patches, then apply at the end.
    // (Initialize accumulator if not present.)
  }

  // Re-do, but this time we'll collect patches and apply at end
  const patches = [];
  rx.lastIndex = 0;
  while ((m = rx.exec(html))) {
    let i = m.index;
    let depth = 0;
    let objStart = -1;
    for (let k = i; k >= 0; k--) {
      const c = html[k];
      if (c === '}') depth++;
      else if (c === '{') {
        if (depth === 0) { objStart = k; break; }
        depth--;
      }
    }
    if (objStart < 0) continue;
    let j = objStart;
    depth = 0;
    let objEnd = -1;
    for (; j < html.length; j++) {
      const c = html[j];
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) { objEnd = j; break; }
      }
    }
    if (objEnd < 0) continue;
    const node = html.slice(objStart, objEnd + 1);
    if (/"eventStatus"\s*:/.test(node)) continue;

    const typeEndRx = /"@type":\s*"(?:SportsEvent|Event)"/;
    const localMatch = typeEndRx.exec(html.slice(m.index));
    if (!localMatch) continue;
    const insertAt = m.index + localMatch[0].length;

    // Simple injection without newlines — works for both minified
    // one-line JSON and pretty-printed multi-line.
    const inject =
      `,"eventStatus":"https://schema.org/EventScheduled"` +
      `,"eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode"`;

    patches.push({ at: insertAt, text: inject });
  }

  if (patches.length === 0) continue;

  // Apply patches in reverse order so indices don't shift
  patches.sort((a, b) => b.at - a.at);
  for (const p of patches) {
    html = html.slice(0, p.at) + p.text + html.slice(p.at);
  }

  fs.writeFileSync(file, html);
  filesPatched.push({ file: path.relative(ROOT, file), count: patches.length });
  totalFiles++;
  totalNodes += patches.length;
}

console.log(`Files patched:  ${totalFiles}`);
console.log(`Nodes patched:  ${totalNodes}`);
console.log('');
for (const fp of filesPatched.slice(0, 20)) {
  console.log(`  +${fp.count}  ${fp.file}`);
}
if (filesPatched.length > 20) console.log(`  ... and ${filesPatched.length - 20} more`);
