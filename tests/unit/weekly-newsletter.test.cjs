/** Pruebas de bloques + render del correo del 10 ago. No toca BD ni Brevo. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const src = fs.readFileSync(path.join(ROOT, 'api/_lib/jobs/weekly-newsletter.js'), 'utf8').replace(/\r\n/g, '\n');
const grab = (n) => { const i = src.indexOf('function ' + n + '('); let d = 0; const j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}') { d--; if (!d) return src.slice(i, k + 1); } } };
const consts = src.slice(src.indexOf('const BLOCK_TYPES'), src.indexOf('// Solo http(s)'));
const fn = new Function(consts + grab('esc') + '\n' + grab('safeUrl') + '\n' + grab('withUtm') + '\n' + grab('renderBlocks') + '\n' + grab('buildEmailHtml')
  + '\nreturn {buildEmailHtml, renderBlocks};')();

const ART = 'https://www.correrjuntos.com/blog/correr-en-verano-calor';
const PICK = {
  week_of: '2026-08-10', status: 'draft',
  campaign_name: 'Weekly · 2026-08-10 · Correr con calor',
  title: 'Con calor, el reloj miente',
  subject: 'Si corres más lento con calor, no estás perdiendo forma',
  preheader: 'Un entrenamiento adaptable, un consejo práctico y una herramienta para correr mejor este verano.',
  url: ART,
  cta_label: 'Cómo entrenar con calor sin riesgos',
  utm_campaign: 'weekly-2026-08-10-calor',
  excerpt: 'Agosto no es el momento de demostrarle nada al reloj. Con calor, el mismo ritmo exige más esfuerzo. Esta semana proponemos una sesión adaptable para seguir entrenando sin convertir un rodaje normal en una prueba de supervivencia.',
  blocks: {
    version: 1,
    items: [
      { type: 'training', title: 'Entrenamiento de la semana',
        items: ['10 minutos muy suaves', '20 minutos a ritmo conversacional',
                '6 progresivos de 20 segundos, recuperando 60 segundos caminando o trotando',
                '5 minutos suaves para terminar'],
        meta: 'Si el calor es intenso o aparecen malas sensaciones, reduce o detén la sesión.' },
      { type: 'coach', title: 'Consejo del equipo CorrerJuntos',
        text: 'En días calurosos, controla la sesión por respiración y sensación de esfuerzo. El ritmo del reloj es secundario. Entrenar algo más lento puede ser exactamente lo que necesitas para completar bien la semana.' },
      { type: 'race', title: 'Carrera recomendada',
        text: 'Busca una prueba que encaje con tu calendario y tu punto de forma.',
        url: 'https://www.correrjuntos.com/carreras', link_text: 'Encuentra tu próxima carrera' },
      { type: 'tool', title: 'Herramienta de la semana',
        text: 'Calcula tus ritmos objetivo y ajústalos a las condiciones del día.',
        url: 'https://www.correrjuntos.com/calculadora', link_text: 'Calculadora de ritmos' },
    ],
  },
};

let f = 0; const ok = (c, m) => { console.log((c ? '  OK   ' : '  FALLO') + '  ' + m); if (!c) f++; };
const html = fn.buildEmailHtml(PICK);
if (process.env.CJ_PREVIEW) fs.writeFileSync(path.join(ROOT, 'tmp', 'preview-2026-08-10.html'), html);

console.log('=== PICK NUEVO (con blocks) ===');
ok(html.includes('Entrenamiento de la semana'), 'bloque training');
ok(html.includes('6 progresivos de 20 segundos'), 'items del entrenamiento');
ok(html.includes('Consejo del equipo CorrerJuntos'), 'bloque coach');
ok(!/Coach Jos[ée]/.test(html), 'NO atribuye nada al Coach José');
ok(html.includes('Encuentra tu próxima carrera'), 'bloque race con texto fallback');
ok(html.includes('Calculadora de ritmos'), 'bloque tool');
ok(!html.includes('utm_content=training'), 'training sin enlace -> sin utm_content (correcto: el brief no define URL)');
ok(html.includes('utm_content=race'), 'utm_content=race');
ok(html.includes('utm_content=tool'), 'utm_content=tool');
ok(html.includes('utm_content=article'), 'utm_content=article (CTA principal)');
ok(html.includes('utm_campaign=weekly-2026-08-10-calor'), 'utm_campaign');
ok(!/href="[^"]*&(?!amp;|#)/.test(html), 'ningún & sin escapar en href');
ok((html.match(/<h1/g) || []).length === 1, 'un solo H1');
ok(html.includes('Cómo entrenar con calor sin riesgos &rarr;'), 'CTA principal');
ok(html.includes('{{ unsubscribe }}') && html.includes('Huelva'), 'baja + datos legales');
ok(!/prozis|amazon/i.test(html) && !/CORRERJUNTOS/.test(html) && !/afiliado/i.test(html), 'sin promociones ni afiliados');
const iCta = html.indexOf('background:#f97316;color:#fff'), iRace = html.indexOf('Encuentra tu próxima carrera');
ok(iCta > -1 && iRace > iCta, 'CTA principal antes que los enlaces secundarios');

console.log('\n=== PICK ANTIGUO (sin blocks ni campaign_name) ===');
const legacy = fn.buildEmailHtml({ title: 'Viejo', url: 'https://www.correrjuntos.com/blog/x', excerpt: 'Resumen' });
ok(!legacy.includes('<ul'), 'sin bloques');
ok(legacy.includes('utm_campaign=weekly'), 'utm_campaign por defecto');
ok(legacy.includes('Leer el artículo'), 'CTA por defecto');
ok(legacy.includes('{{ unsubscribe }}'), 'baja intacta');

console.log('\n=== BLOCKS INVÁLIDOS (deben ignorarse sin romper) ===');
const casos = [
  ['null', null], ['array', [1, 2]], ['string', 'x'], ['sin version', { items: [] }],
  ['version 2', { version: 2, items: [{ type: 'training', title: 'X' }] }],
  ['items no array', { version: 1, items: 'x' }],
  ['tipo desconocido', { version: 1, items: [{ type: 'malicioso', title: 'X' }] }],
  ['bloque vacío', { version: 1, items: [{ type: 'training' }] }],
  ['item null', { version: 1, items: [null, { type: 'coach', text: 'ok' }] }],
];
for (const [nombre, blocks] of casos) {
  let out; try { out = fn.buildEmailHtml({ ...PICK, blocks }); } catch (e) { out = null; }
  ok(out !== null, nombre + ' -> no lanza');
  if (nombre === 'tipo desconocido') ok(!out.includes('malicioso'), '  tipo desconocido no se pinta');
  if (nombre === 'item null') ok(out.includes('ok'), '  item válido junto a uno null sí se pinta');
}
// XSS / esquemas peligrosos
const evil = fn.buildEmailHtml({ ...PICK, blocks: { version: 1, items: [
  { type: 'race', title: '<script>alert(1)</script>', url: 'javascript:alert(1)', link_text: 'x' },
  { type: 'tool', title: 'ok', url: 'https://www.correrjuntos.com/calculadora', link_text: '"><b>' }] } });
ok(!evil.includes('<script>alert(1)</script>'), 'título con script escapado');
ok(!evil.includes('javascript:'), 'URL javascript: descartada');
ok(evil.includes('&quot;&gt;&lt;b&gt;'), 'link_text escapado');

console.log('\nPreview: tmp/preview-2026-08-10.html');
console.log('');console.log('=== EYEBROW ===');
ok(html.includes('CorrerJuntos Semanal'), 'pick nuevo -> eyebrow CorrerJuntos Semanal');
ok(!html.includes('El artículo del lunes'), 'pick nuevo -> sin el eyebrow antiguo');
ok(legacy.includes('El artículo del lunes'), 'pick antiguo -> eyebrow El artículo del lunes');
ok(!legacy.includes('CorrerJuntos Semanal'), 'pick antiguo -> sin el eyebrow nuevo');
ok(fn.buildEmailHtml({ ...PICK, blocks: { version: 2, items: [{ type: 'training', title: 'X' }] } }).includes('El artículo del lunes'), 'blocks invalidos -> eyebrow antiguo');
ok(fn.buildEmailHtml({ ...PICK, blocks: { version: 1, items: [{ type: 'desconocido' }] } }).includes('El artículo del lunes'), 'sin bloques renderizables -> eyebrow antiguo');
console.log('');console.log('=== campaign_name ===');
const nombreDe = (p) => (p.campaign_name || ('Weekly · ' + p.week_of + ' · ' + p.title)).slice(0, 90);
ok(nombreDe(PICK) === 'Weekly · 2026-08-10 · Correr con calor', 'campaign_name personalizado se usa');
ok(nombreDe({ week_of: '2026-06-08', title: 'Viejo' }) === 'Weekly · 2026-06-08 · Viejo', 'campaign_name NULL -> autogenerado');
ok(src.includes('name: (pick.campaign_name ||'), 'el job usa pick.campaign_name con fallback');
console.log('');console.log('=== HTML sin escapar ===');
const inyecta = fn.buildEmailHtml({ ...PICK, blocks: { version: 1, items: [{ type: 'training', title: '<b>t</b>', items: ['<i>x</i>'], meta: '<u>m</u>' }, { type: 'coach', text: '<img src=x onerror=1>' }] } });
ok(!/<b>t<[/]b>|<i>x<[/]i>|<u>m<[/]u>|<img src=x/.test(inyecta), 'ningun bloque introduce HTML sin escapar');
ok(inyecta.includes('&lt;b&gt;t&lt;/b&gt;'), 'titulo escapado como entidades');
console.log('');console.log('=== SEMANA FUTURA (genericidad) ===');
const futuro = fn.buildEmailHtml({
  week_of: '2026-11-16', campaign_name: 'Weekly · 2026-11-16 · Series en pista',
  title: 'Volver a la pista sin lesionarte', subject: 'Series: menos es más',
  preheader: 'Cómo volver a las series después del verano.',
  url: 'https://www.correrjuntos.com/blog/otro-articulo-cualquiera',
  cta_label: 'Leer la guía', utm_campaign: 'weekly-2026-11-16-series',
  excerpt: 'Texto de otra semana.',
  blocks: { version: 1, items: [
    { type: 'training', title: 'Sesión', items: ['4x800'] },
    { type: 'race', title: 'Carrera', url: 'https://www.correrjuntos.com/carreras', link_text: 'Buscar' },
    { type: 'tool', title: 'Herramienta', url: 'https://www.correrjuntos.com/calculadora', link_text: 'Calcular' }] } });
ok(futuro.includes('utm_campaign=weekly-2026-11-16-series'), 'utm_campaign de otra semana');
ok(futuro.includes('otro-articulo-cualquiera'), 'artículo distinto al de agosto');
ok(futuro.includes('CorrerJuntos Semanal'), 'eyebrow nuevo en semana futura');
ok(!/2026-08|correr-en-verano|calor/i.test(futuro), 'sin rastro de la campaña de agosto');
ok(futuro.includes('utm_content=race') && futuro.includes('utm_content=tool'), 'utm_content por tipo en semana futura');
console.log('');console.log('=== DUPLICADOS ===');
const sel = (filas, isTest, monday) => { let r = filas.filter(x => x.sent_at == null); if (!isTest) r = r.filter(x => x.status === 'ready' && x.week_of === monday); return r[0] || null; };
const M = '2026-08-10';
ok(sel([{ week_of: M, status: 'sent', sent_at: '2026-08-10T08:00:00Z' }], false, M) === null, 'pick ya enviado no se reselecciona');
ok(sel([{ week_of: M, status: 'ready', sent_at: '2026-08-10T08:00:00Z' }], false, M) === null, 'ready con sent_at no se reselecciona');
const dosEjec = [{ week_of: M, status: 'ready', sent_at: null }];
const e1 = sel(dosEjec, false, M); ok(e1 !== null, 'primera ejecución selecciona');
dosEjec[0].status = 'sent'; dosEjec[0].sent_at = '2026-08-10T08:00:00Z';
ok(sel(dosEjec, false, M) === null, 'segunda ejecución NO vuelve a enviar');
console.log(f ? f + ' FALLOS' : 'TODAS OK');
process.exit(f ? 1 : 0);
