/**
 * Recategorize articles in blog/index.html according to the mis-categorization
 * audit (April 22, 2026). For each entry in MOVES, finds the article card
 * whose <h2> contains the given title fragment and rewrites its
 * data-category attribute and its category badge (class + text).
 *
 *   node tools/blog-recategorize.cjs           # dry-run (list changes)
 *   node tools/blog-recategorize.cjs --apply   # write to disk
 */
const fs = require('fs');
const path = require('path');

const INDEX = path.resolve(__dirname, '..', 'blog', 'index.html');
const APPLY = process.argv.includes('--apply');

const CAT = {
  entrenamiento: 'Entrenamiento',
  nutricion: 'Nutrici&oacute;n',
  equipamiento: 'Equipamiento',
  tecnologia: 'Tecnolog&iacute;a',
  zapatillas: 'Zapatillas',
  salud: 'Salud',
  rutas: 'Rutas',
  trail: 'Trail',
  suplementacion: 'Suplementaci&oacute;n',
  'atleta-hibrido': 'Atleta H&iacute;brido',
  carreras: 'Carreras',
};

// title fragment (distinctive enough to match only the target article) -> new category
const MOVES = [
  // → rutas (social/group/quedadas)
  { needle: 'Grupos de Running en Madrid', to: 'rutas' },
  { needle: 'Grupos de Running en Barcelona', to: 'rutas' },
  { needle: 'Grupos de Running en Valencia', to: 'rutas' },
  { needle: 'No Tengo con Qui&eacute;n Correr', to: 'rutas' },
  { needle: 'No Tengo con Quién Correr', to: 'rutas' },
  { needle: 'Correr Acompa&ntilde;ado Engancha', to: 'rutas' },
  { needle: 'Correr Acompañado Engancha', to: 'rutas' },
  { needle: 'Correr Es Social', to: 'rutas' },
  { needle: 'Grupos de Running: Gu&iacute;a Completa para Encontrar', to: 'rutas' },
  { needle: 'Grupos de Running: Guía Completa para Encontrar', to: 'rutas' },
  { needle: 'Quedadas Running: Gu&iacute;a para Organizar', to: 'rutas' },
  { needle: 'Quedadas Running: Guía para Organizar', to: 'rutas' },
  { needle: 'Running Social: La Revoluci&oacute;n', to: 'rutas' },
  { needle: 'Running Social: La Revolución', to: 'rutas' },
  { needle: 'C&oacute;mo Encontrar Gente para Correr', to: 'rutas' },
  { needle: 'Cómo Encontrar Gente para Correr', to: 'rutas' },
  { needle: 'Correr Solo vs Acompa&ntilde;ado', to: 'rutas' },
  { needle: 'Correr Solo vs Acompañado', to: 'rutas' },
  { needle: 'Tu Primera Quedada Running', to: 'rutas' },
  { needle: '10 Mejores Apps para Correr en Grupo', to: 'rutas' },
  { needle: 'C&oacute;mo Unirte a un Grupo de Running', to: 'rutas' },
  { needle: 'Cómo Unirte a un Grupo de Running', to: 'rutas' },
  { needle: 'Seguro Correr con Desconocidos', to: 'rutas' },
  { needle: '7 Beneficios de Correr en Grupo', to: 'rutas' },
  { needle: 'C&oacute;mo Conocer Gente Haciendo Deporte', to: 'rutas' },
  { needle: 'Cómo Conocer Gente Haciendo Deporte', to: 'rutas' },
  { needle: 'Por Qu&eacute; la Mayor&iacute;a Deja de Correr en 3 Meses', to: 'rutas' },
  { needle: 'Por Qué la Mayoría Deja de Correr en 3 Meses', to: 'rutas' },
  // "Cómo Encontrar Compañeros de Running Cerca de Ti" was listed under rutas as a dup — actually keep in rutas since it fits
  // "Cómo Organizar Quedadas de Running" same

  // → salud
  { needle: 'Correr durante la Menstruaci&oacute;n', to: 'salud' },
  { needle: 'Correr durante la Menstruación', to: 'salud' },
  { needle: 'Ansiedad Pre-Carrera', to: 'salud' },
  { needle: 'Psicolog&iacute;a del Corredor', to: 'salud' },
  { needle: 'Psicología del Corredor', to: 'salud' },
  { needle: 'Correr con Sobrepeso', to: 'salud' },
  { needle: 'Andar vs Correr', to: 'salud' },
  { needle: 'Beneficios de Correr: 15 Razones', to: 'salud' },

  // → carreras (race-specific guides, not generic training plans)
  { needle: 'Marat&oacute;n de Valencia 2026', to: 'carreras' },
  { needle: 'Maratón de Valencia 2026', to: 'carreras' },
  { needle: 'Marat&oacute;n de Barcelona 2026', to: 'carreras' },
  { needle: 'Maratón de Barcelona 2026', to: 'carreras' },
  { needle: 'Marat&oacute;n de Sevilla 2026', to: 'carreras' },
  { needle: 'Maratón de Sevilla 2026', to: 'carreras' },
  { needle: 'Marat&oacute;n de Madrid 2026', to: 'carreras' },
  { needle: 'Maratón de Madrid 2026', to: 'carreras' },
  { needle: 'San Silvestre Vallecana', to: 'carreras' },

  // entrenamiento → equipamiento
  { needle: 'Pack B&aacute;sico de Running', to: 'equipamiento' },
  { needle: 'Pack Básico de Running', to: 'equipamiento' },

  // nutrición → suplementación
  { needle: 'Mejores Suplementos para Runners', to: 'suplementacion' },
  { needle: 'Creatina para Corredores', to: 'suplementacion' },
  { needle: 'Cafe&iacute;na y Running', to: 'suplementacion' },
  { needle: 'Cafeína y Running', to: 'suplementacion' },
  { needle: 'Qu&eacute; Gel Energ&eacute;tico Usar en un Marat&oacute;n', to: 'suplementacion' },
  { needle: 'Qué Gel Energético Usar en un Maratón', to: 'suplementacion' },

  // equipamiento → zapatillas
  { needle: 'Zapatillas Running vs Normales', to: 'zapatillas' },

  // equipamiento → tecnologia (audio + cardio)
  { needle: 'Conducci&oacute;n &Oacute;sea vs In-Ear', to: 'tecnologia' },
  { needle: 'Conducción Ósea vs In-Ear', to: 'tecnologia' },
  { needle: 'Shokz OpenRun Pro 2', to: 'tecnologia' },
  { needle: 'JBL Reflect Flow Pro', to: 'tecnologia' },
  { needle: '8 Mejores Auriculares Baratos', to: 'tecnologia' },
  { needle: 'Auriculares para Running y Nataci&oacute;n', to: 'tecnologia' },
  { needle: 'Auriculares para Running y Natación', to: 'tecnologia' },
  { needle: 'Mejores Auriculares para Correr', to: 'tecnologia' },
  { needle: '10 Mejores Puls&oacute;metros', to: 'tecnologia' },
  { needle: '10 Mejores Pulsómetros', to: 'tecnologia' },

  // atleta-hibrido → equipamiento (accessories, not hybrid training)
  { needle: 'Calleras para CrossFit', to: 'equipamiento' },
  { needle: 'mochilas para CrossFit', to: 'equipamiento' },
  { needle: '20 Mejores Rodillos y Pistolas de Masaje', to: 'equipamiento' },
  { needle: '7 Mejores Foam Rollers', to: 'equipamiento' },
];

let html = fs.readFileSync(INDEX, 'utf8');

// Match a card block: <a href="/blog/..." class="article-card" ...> ... </a>
// Also matches "article-card featured" variant. Non-greedy on inner HTML.
const cardRe = /<a\s+href="\/blog\/[^"]+"\s+class="article-card(?:\s+featured)?"[^>]*>[\s\S]*?<\/a>/g;

const changes = [];
const notFound = [];

MOVES.forEach(move => {
  const targetLabel = CAT[move.to];
  let matched = false;

  html = html.replace(cardRe, cardHtml => {
    if (!cardHtml.includes(move.needle)) return cardHtml;
    // Already in target category? skip
    if (new RegExp(`data-category="${move.to}"`).test(cardHtml)) {
      matched = true;
      return cardHtml;
    }
    // Extract current category for logging
    const curMatch = cardHtml.match(/data-category="([^"]+)"/);
    const curCat = curMatch ? curMatch[1] : '?';
    // Extract title
    const titleMatch = cardHtml.match(/<h2[^>]*>([^<]+)<\/h2>/);
    const title = titleMatch ? titleMatch[1].slice(0, 70) : '(no title)';
    // Extract slug
    const slugMatch = cardHtml.match(/href="\/blog\/([^"]+)"/);
    const slug = slugMatch ? slugMatch[1] : '?';

    let updated = cardHtml.replace(/data-category="[^"]+"/, `data-category="${move.to}"`);
    updated = updated.replace(
      /<span class="category cat-badge-[^"]+">[^<]+<\/span>/,
      `<span class="category cat-badge-${move.to}">${targetLabel}</span>`
    );

    changes.push({ slug, title, from: curCat, to: move.to });
    matched = true;
    return updated;
  });

  if (!matched) notFound.push(move.needle);
});

// Deduplicate changes (in case two needle variants both matched the same card)
const seen = new Set();
const uniqueChanges = changes.filter(c => {
  if (seen.has(c.slug)) return false;
  seen.add(c.slug);
  return true;
});

console.log(`\n=== Recategorization ${APPLY ? '(APPLIED)' : '(DRY RUN)'} ===\n`);
console.log(`Matched: ${uniqueChanges.length} unique articles\n`);
uniqueChanges.forEach(c => {
  console.log(`  ${c.from.padEnd(18)} → ${c.to.padEnd(15)}  ${c.slug}`);
});

if (notFound.length) {
  console.log(`\nNot found (may already be in target category or use unexpected title):`);
  notFound.forEach(n => console.log(`  · ${n}`));
}

if (APPLY) {
  fs.writeFileSync(INDEX, html);
  console.log(`\nWritten to ${INDEX}`);
} else {
  console.log(`\n(Dry run — re-run with --apply to persist.)`);
}
