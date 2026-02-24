const fs = require('fs');
const path = require('path');
const glob = require('glob');

const blogDir = path.join(__dirname, 'blog');

// All replacement pairs - order matters for some (longer strings first to avoid partial matches)
const replacements = [
  // Multi-word / longer patterns first to avoid substring issues
  ['amortiguacion', 'amortiguación'],
  ['hidratacion', 'hidratación'],
  ['recuperacion', 'recuperación'],
  ['nutricion', 'nutrición'],
  ['energeticos', 'energéticos'],
  ['tecnicas', 'técnicas'],  // before "tecnica" to avoid double-replacing
  ['tecnico', 'técnico'],
  ['tecnica', 'técnica'],
  ['tecnologia', 'tecnología'],
  ['paginas', 'páginas'],
  ['comision', 'comisión'],
  ['traves', 'través'],
  ['despues', 'después'],
  ['Terminos', 'Términos'],
  ['disenadas', 'diseñadas'],
  ['disenada', 'diseñada'],
  ['diseno', 'diseño'],
  ['rapido', 'rápido'],
  ['rapida', 'rápida'],
  ['duracion', 'duración'],
  ['autonomia', 'autonomía'],
  ['bateria', 'batería'],
  ['telefono', 'teléfono'],
  ['Espana', 'España'],
  ['compresion', 'compresión'],
  ['proteccion', 'protección'],
  ['informacion', 'información'],
  ['conexion', 'conexión'],
  ['navegacion', 'navegación'],
  ['versatil', 'versátil'],
  ['dificil', 'difícil'],  // before "facil"
  ['facil', 'fácil'],
  ['maxima', 'máxima'],
  ['minimo', 'mínimo'],
  ['tambien', 'también'],
  ['ademas', 'además'],
  ['unicas', 'únicas'],  // plural first
  ['unicos', 'únicos'],
  ['unica', 'única'],
  ['unico', 'único'],
  ['ultimas', 'últimas'],  // plural first
  ['ultimos', 'últimos'],
  ['ultima', 'última'],
  ['ultimo', 'último'],
  ['basicas', 'básicas'],  // plural first
  ['basicos', 'básicos'],
  ['basica', 'básica'],
  ['basico', 'básico'],
  ['practicas', 'prácticas'],  // plural first
  ['practicos', 'prácticos'],
  ['practica', 'práctica'],
  ['practico', 'práctico'],
  ['economicas', 'económicas'],
  ['economicos', 'económicos'],
  ['economica', 'económica'],
  ['economico', 'económico'],
  ['kilometros', 'kilómetros'],
  ['musica', 'música'],
  ['metricas', 'métricas'],
  ['especificas', 'específicas'],
  ['especificos', 'específicos'],
  ['especifica', 'específica'],
  ['especifico', 'específico'],
  ['pequena', 'pequeña'],
];

// Find all HTML files in blog directory
const files = glob.sync(path.join(blogDir, '*.html'));

let totalChanges = 0;
const fileChanges = {};

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changes = [];

  replacements.forEach(([from, to]) => {
    // Case-sensitive replacement using word boundary-like approach
    // We use a regex that matches the word but avoids matching already-accented versions
    // or partial matches within URLs/filenames (which use hyphens)

    // Count occurrences before replacing
    const regex = new RegExp(from, 'g');
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      content = content.replace(regex, to);
      changes.push(`  ${from} -> ${to} (${matches.length} occurrences)`);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    const fileName = path.basename(filePath);
    fileChanges[fileName] = changes;
    totalChanges += changes.length;
    console.log(`Fixed: ${path.basename(filePath)} (${changes.length} replacement types)`);
  } else {
    console.log(`No changes: ${path.basename(filePath)}`);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total files processed: ${files.length}`);
console.log(`Files modified: ${Object.keys(fileChanges).length}`);
console.log(`Total replacement types applied: ${totalChanges}`);

// Print detailed changes
Object.entries(fileChanges).forEach(([file, changes]) => {
  console.log(`\n${file}:`);
  changes.forEach(c => console.log(c));
});
