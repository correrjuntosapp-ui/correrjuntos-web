/**
 * Extract critical Tailwind CSS for above-the-fold content
 * 1. Parse above-fold HTML to find all class names
 * 2. Match them in tailwind.min.css
 * 3. Output only the critical rules
 */
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const twPath = path.join(__dirname, 'css', 'tailwind.min.css');

const html = fs.readFileSync(htmlPath, 'utf8');
const twCSS = fs.readFileSync(twPath, 'utf8');

// Extract above-fold HTML: from <body> through hero + app banner + strava badge (~line 510)
// BUG FIX: search for '100% gratis' AFTER <body> — it also appears in JSON-LD in <head>
const bodyStart = html.indexOf('<body>');
const heroEnd = html.indexOf('100% gratis', bodyStart); // search after <body>!
// Extend to include App Download Banner + Strava badge (visible above fold on desktop)
const foldMarker = html.indexOf('Product Hunt', heroEnd);
const foldIndex = foldMarker > 0
  ? html.indexOf('</a>', foldMarker) + 10
  : html.indexOf('</div>', heroEnd + 200) + 10; // fallback
const aboveFold = html.substring(bodyStart, foldIndex);
console.log(`Extracted above-fold HTML: ${aboveFold.length} chars (body @${bodyStart}, fold @${foldIndex})`);

// Extract all class names from class="..." attributes
const classRegex = /class="([^"]*)"/g;
const classSet = new Set();
let m;
while ((m = classRegex.exec(aboveFold)) !== null) {
  m[1].split(/\s+/).filter(Boolean).forEach(c => classSet.add(c));
}

// Also add some essential utility classes not in above-fold HTML but needed
// (like breakpoint variants that affect layout)
const extraClasses = ['block', 'inline', 'inline-block', 'relative', 'absolute'];
extraClasses.forEach(c => classSet.add(c));

console.log(`Found ${classSet.size} unique classes in above-fold HTML`);

// Escape class name for CSS selector matching
function escapeForRegex(cls) {
  return cls
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\//g, '\\/');
}

// Convert Tailwind class name to possible CSS selectors
// e.g., "md:text-6xl" → ".md\\:text-6xl" in a @media block
// e.g., "hover:scale-105" → ".hover\\:scale-105:hover"
// e.g., "bg-orange-500/20" → ".bg-orange-500\\/20"
function classToSelector(cls) {
  // Escape special chars: /, :, [, ], .
  return '\\.' + cls
    .replace(/\//g, '\\/')
    .replace(/:/g, '\\:')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\./g, '\\.');
}

// Split minified CSS into individual rules (handling @media blocks)
function extractRules(css) {
  const rules = [];
  let i = 0;
  while (i < css.length) {
    if (css[i] === '@') {
      // @media or @keyframes block
      const start = i;
      const braceStart = css.indexOf('{', i);
      if (braceStart === -1) break;
      let depth = 1;
      let j = braceStart + 1;
      while (j < css.length && depth > 0) {
        if (css[j] === '{') depth++;
        if (css[j] === '}') depth--;
        j++;
      }
      rules.push(css.substring(start, j));
      i = j;
    } else if (css[i] === '.' || css[i] === '*' || css[i] === ':' || css[i] === '[') {
      // Regular rule
      const start = i;
      const braceStart = css.indexOf('{', i);
      if (braceStart === -1) break;
      let depth = 1;
      let j = braceStart + 1;
      while (j < css.length && depth > 0) {
        if (css[j] === '{') depth++;
        if (css[j] === '}') depth--;
        j++;
      }
      rules.push(css.substring(start, j));
      i = j;
    } else {
      i++;
    }
  }
  return rules;
}

const allRules = extractRules(twCSS);
console.log(`Parsed ${allRules.length} CSS rules from tailwind.min.css`);

// Match rules that contain any of our class selectors
const criticalRules = new Set();
const matchedClasses = new Set();

for (const cls of classSet) {
  // Build regex pattern for this class
  const escaped = cls
    .replace(/\//g, '\\\\/')  // CSS escapes /
    .replace(/:/g, '\\\\:')   // CSS escapes :
    .replace(/\[/g, '\\\\[')
    .replace(/\]/g, '\\\\]')
    .replace(/\./g, '\\\\.');

  // The selector in CSS looks like: .text-4xl or .md\:text-6xl or .bg-orange-500\/20
  const selectorPattern = '\\.' + escaped;

  try {
    const regex = new RegExp(selectorPattern + '[{:,\\s>~+\\[]');
    for (const rule of allRules) {
      if (regex.test(rule)) {
        criticalRules.add(rule);
        matchedClasses.add(cls);
      }
    }
  } catch (e) {
    // Skip invalid regex patterns
  }
}

console.log(`Matched ${matchedClasses.size}/${classSet.size} classes → ${criticalRules.size} rules`);

// Also include the * { box-sizing } reset if present
for (const rule of allRules) {
  if (rule.startsWith('*,') || rule.startsWith('*{') || rule.includes('::before') && rule.includes('box-sizing')) {
    criticalRules.add(rule);
  }
}

// Combine and output
const criticalCSS = Array.from(criticalRules).join('\n');
const outputPath = path.join(__dirname, 'css', 'tailwind-critical.css');
fs.writeFileSync(outputPath, criticalCSS, 'utf8');

console.log(`\nWritten: css/tailwind-critical.css`);
console.log(`Size: ${Math.round(criticalCSS.length / 1024)}KB (uncompressed)`);
console.log(`\nUnmatched classes:`);
for (const cls of classSet) {
  if (!matchedClasses.has(cls)) {
    // Skip non-Tailwind classes
    if (['group', 'btn-shimmer', 'btn-secondary', 'hero-particle', 'runner-svg-container',
         'view', 'hero-bg', 'active', 'typewriter-cursor', 'toast', 'running-dots',
         'running-dot', 'safe-area-bottom'].includes(cls)) continue;
    console.log(`  - ${cls}`);
  }
}
