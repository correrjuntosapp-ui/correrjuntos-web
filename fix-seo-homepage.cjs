/**
 * SEO Fix: Convert H1/H2 tags in hidden SPA sections to <div> tags
 * This prevents Google from seeing multiple H1s and ~37 phantom H2s in the homepage DOM.
 * Only affects content AFTER view-landing (line 3531), keeping all landing page headings intact.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'index.html');
let html = fs.readFileSync(file, 'utf8');
const lines = html.split('\n');

// Find the end of view-landing section (</section> closing view-landing)
const landingEnd = lines.findIndex((l, i) => i > 2500 && l.trim() === '</section>');
console.log(`view-landing ends at line ${landingEnd + 1}`);

let h1Count = 0, h2Count = 0;

for (let i = landingEnd; i < lines.length; i++) {
  const original = lines[i];

  // Replace opening <h1 ...> with <div ...>
  if (/<h1[\s>]/.test(lines[i])) {
    lines[i] = lines[i].replace(/<h1([\s>])/g, '<div$1');
    h1Count++;
  }
  // Replace closing </h1> with </div>
  if (/<\/h1>/.test(lines[i])) {
    lines[i] = lines[i].replace(/<\/h1>/g, '</div>');
  }
  // Replace opening <h2 ...> with <div ...>
  if (/<h2[\s>]/.test(lines[i])) {
    lines[i] = lines[i].replace(/<h2([\s>])/g, '<div$1');
    h2Count++;
  }
  // Replace closing </h2> with </div>
  if (/<\/h2>/.test(lines[i])) {
    lines[i] = lines[i].replace(/<\/h2>/g, '</div>');
  }

  if (original !== lines[i]) {
    console.log(`  Line ${i + 1}: ${original.trim().substring(0, 80)} → ${lines[i].trim().substring(0, 80)}`);
  }
}

console.log(`\nConverted: ${h1Count} H1 tags, ${h2Count} H2 tags to <div>`);

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('✓ index.html updated');
