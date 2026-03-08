const fs = require('fs');

// Mapping: article slug → new Pexels photo ID
const mapping = {
  // ES slugs
  'correr-solo-vs-acompanado': '6293192',
  'mejor-hora-para-correr': '28735804',
  'puedo-correr-todos-los-dias': '4426325',
  'como-evitar-problemas-digestivos-correr': '7298668',
  'correr-embarazada-seguro': '7055663',
  'encontrar-gente-para-correr': '7266749',
  'mejores-zapatillas-trail-running': '29603275',
  'recuperar-ganas-de-correr': '1040427',
  'correr-y-gimnasio-mismo-dia': '4162445',
  'motivacion-para-correr': '2719567',
  'plan-entrenamiento-10k': '3019696',
  'unirse-grupo-running': '33860616',
  // EN slugs
  'running-alone-vs-group': '6293192',
  'best-time-to-run': '28735804',
  'is-it-ok-to-run-every-day': '4426325',
  'how-to-avoid-stomach-issues-running': '7298668',
  'running-while-pregnant-guide': '7055663',
  'find-people-to-run-with': '7266749',
  'best-trail-running-shoes': '29603275',
  'how-to-get-back-into-running': '1040427',
  'running-and-gym-same-day': '4162445',
  'running-motivation-tips': '2719567',
  '10k-training-plan': '3019696',
  'join-running-group': '33860616',
};

// Process blog index files
const indexFiles = ['blog/index.html', 'blog/en/index.html'];
for (const file of indexFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changes = 0;

  for (const [slug, newId] of Object.entries(mapping)) {
    const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match: href containing slug, then within 500 chars find pexels photo ID
    const re = new RegExp(
      '(href=["\'][^"\']*' + escapedSlug + '["\'][\\s\\S]{0,500}?photos/)(\\d+)(/pexels-photo-)(\\d+)',
      'g'
    );
    content = content.replace(re, (match, before, oldId1, middle, oldId2) => {
      if (oldId1 === newId) return match; // already updated
      changes++;
      console.log(`  ${file}: ${slug} — ${oldId1} → ${newId}`);
      return before + newId + middle + newId;
    });
  }

  fs.writeFileSync(file, content);
  console.log(`${file}: ${changes} image(s) updated`);
}

// Process related.js — format is {s:'slug',t:'title',c:'cat',i:'url'}
let relContent = fs.readFileSync('blog/related.js', 'utf8');
let relChanges = 0;
for (const [slug, newId] of Object.entries(mapping)) {
  const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match: s:'slug' then within 300 chars find pexels photo ID
  const re = new RegExp(
    "(s:[\"']" + escapedSlug + "[\"'][\\s\\S]{0,300}?photos/)(\\d+)(/pexels-photo-)(\\d+)",
    'g'
  );
  relContent = relContent.replace(re, (match, before, oldId1, middle, oldId2) => {
    if (oldId1 === newId) return match;
    relChanges++;
    console.log(`  related.js: ${slug} — ${oldId1} → ${newId}`);
    return before + newId + middle + newId;
  });
}
fs.writeFileSync('blog/related.js', relContent);
console.log(`blog/related.js: ${relChanges} image(s) updated`);
