// Audit all Event / SportsEvent schemas in the site for missing
// startDate (critical) and eventStatus (recommended) fields.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP = ['.claude', 'node_modules', 'tmp', '.vercel', 'tools/marketing'];

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    if (SKIP.some(s => path.relative(ROOT, dir).startsWith(s))) continue;
    if (SKIP.includes(f)) continue;
    const p = path.join(dir, f);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p, files);
    else if (p.endsWith('.html')) files.push(p);
  }
  return files;
}

// Extract every JSON-LD <script> block from an HTML, parse loosely,
// and find every node with @type Event or SportsEvent.
function findEventNodes(html) {
  const blocks = [];
  const scriptRx = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRx.exec(html))) blocks.push(m[1]);

  const events = [];
  for (const block of blocks) {
    // Loose: match every {...} object that contains @type with Event/SportsEvent
    // We'll extract the surrounding object using brace matching.
    const typeRx = /"@type"\s*:\s*"(SportsEvent|Event)"/g;
    let tm;
    while ((tm = typeRx.exec(block))) {
      // Walk backwards to find the opening brace of this object
      let i = tm.index;
      let depth = 0;
      let start = -1;
      for (let k = i; k >= 0; k--) {
        const c = block[k];
        if (c === '}') depth++;
        else if (c === '{') {
          if (depth === 0) { start = k; break; }
          depth--;
        }
      }
      if (start < 0) continue;
      // Walk forward to matching closing brace
      let j = start;
      depth = 0;
      let end = -1;
      for (; j < block.length; j++) {
        const c = block[j];
        if (c === '{') depth++;
        else if (c === '}') {
          depth--;
          if (depth === 0) { end = j; break; }
        }
      }
      if (end < 0) continue;
      const node = block.slice(start, end + 1);
      events.push({ type: tm[1], node });
    }
  }
  return events;
}

const files = walk(ROOT).filter(f => !SKIP.some(s => path.relative(ROOT, f).split(path.sep)[0] === s));
const issues = [];

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const events = findEventNodes(html);
  if (events.length === 0) continue;

  for (const e of events) {
    const hasStartDate = /"startDate"\s*:/.test(e.node);
    const hasEventStatus = /"eventStatus"\s*:/.test(e.node);
    const missing = [];
    if (!hasStartDate) missing.push('startDate (CRITICAL)');
    if (!hasEventStatus) missing.push('eventStatus');

    if (missing.length > 0) {
      const nameMatch = e.node.match(/"name"\s*:\s*"([^"]{0,80})"/);
      issues.push({
        file: path.relative(ROOT, file),
        type: e.type,
        name: nameMatch ? nameMatch[1] : '(no name)',
        missing,
      });
    }
  }
}

console.log(`\nAudit Event/SportsEvent schemas`);
console.log(`================================`);
console.log(`Total HTML files scanned: ${files.length}`);
console.log(`Total Event nodes broken: ${issues.length}\n`);

const bySeverity = { critical: 0, eventStatusOnly: 0 };
for (const i of issues) {
  if (i.missing.some(m => m.includes('CRITICAL'))) bySeverity.critical++;
  else bySeverity.eventStatusOnly++;
}
console.log(`Critical (missing startDate):       ${bySeverity.critical}`);
console.log(`Non-critical (missing eventStatus): ${bySeverity.eventStatusOnly}\n`);

// Show 20 worst offenders
console.log('Top broken files (sample):');
const sample = issues.slice(0, 20);
for (const i of sample) {
  const tag = i.missing.some(m => m.includes('CRITICAL')) ? '🔴' : '🟡';
  console.log(`  ${tag} ${i.file}`);
  console.log(`     ${i.type}: "${i.name}"`);
  console.log(`     missing: ${i.missing.join(', ')}`);
}

// Save for fix step
fs.writeFileSync(
  path.resolve(__dirname, 'event-schema-issues.json'),
  JSON.stringify(issues, null, 2)
);
console.log(`\n→ Detail saved to tmp/event-schema-issues.json`);
