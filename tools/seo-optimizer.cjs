const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'blog');
const SKIP_SLUGS = [
  'cuanto-tardo-en-correr-5km',
  'empezar-a-correr-despues-de-los-60',
  'mejores-zapatillas-on-running',
  'vo2-max-running-como-mejorar',
  'index'
];

// SEO optimizations map: slug -> { title, metaDesc }
// Title should be max 60 chars (before "| CorrerJuntos")
// Meta desc max 150 chars
const SEO_MAP = {
  'agujetas-despues-de-correr': {
    title: 'Agujetas Despu&eacute;s de Correr: C&oacute;mo Aliviarlas R&aacute;pido',
    titleClean: 'Agujetas Después de Correr: Cómo Aliviarlas Rápido',
    metaDesc: 'Aprende por qu&eacute; aparecen las agujetas al correr, cu&aacute;nto duran y 5 m&eacute;todos probados para aliviarlas. Vuelve a entrenar antes. Desc&uacute;brelo aqu&iacute;.',
  },
  'alimentos-antiinflamatorios-runners': {
    title: '15 Alimentos Antiinflamatorios para Runners 2026',
    titleClean: '15 Alimentos Antiinflamatorios para Runners 2026',
    metaDesc: 'Reduce la inflamaci&oacute;n y acelera tu recuperaci&oacute;n con estos 15 alimentos clave para corredores. Previene lesiones de forma natural. Empieza hoy.',
  },
  'alimentos-sin-gluten-para-corredores': {
    title: 'Alimentos Sin Gluten para Corredores: Gu&iacute;a 2026',
    titleClean: 'Alimentos Sin Gluten para Corredores: Guía 2026',
    metaDesc: 'Los mejores alimentos sin gluten para mejorar tu rendimiento running. Dieta completa con men&uacute;s y recetas f&aacute;ciles. Desc&uacute;brelos.',
  },
  'andar-vs-correr': {
    title: 'Andar vs Correr: &iquest;Qu&eacute; Quema M&aacute;s Grasa en 2026?',
    titleClean: 'Andar vs Correr: ¿Qué Quema Más Grasa en 2026?',
    metaDesc: 'Comparativa definitiva entre andar y correr: calor&iacute;as, impacto articular, p&eacute;rdida de peso y salud cardiovascular. Elige tu mejor opci&oacute;n.',
  },
  'ansiedad-pre-carrera': {
    title: 'Ansiedad Pre-Carrera: 8 T&eacute;cnicas que Funcionan',
    titleClean: 'Ansiedad Pre-Carrera: 8 Técnicas que Funcionan',
    metaDesc: 'Controla los nervios antes de competir con 8 t&eacute;cnicas probadas por psic&oacute;logos deportivos. Rinde al m&aacute;ximo el d&iacute;a de la carrera. Desc&uacute;brelas.',
  },
  'apple-watch-running-review': {
    title: 'Apple Watch Running 2026: An&aacute;lisis para Corredores',
    titleClean: 'Apple Watch Running 2026: Análisis para Corredores',
    metaDesc: 'An&aacute;lisis completo del Apple Watch para running: GPS, puls&oacute;metro, apps y precisi&oacute;n real. &iquest;Merece la pena para correr? Desc&uacute;brelo.',
  },
  'apps-correr-en-grupo': {
    title: 'Mejores Apps para Correr en Grupo en Espa&ntilde;a 2026',
    titleClean: 'Mejores Apps para Correr en Grupo en España 2026',
    metaDesc: 'Las 7 mejores aplicaciones para encontrar grupos de running cerca de ti. Organiza quedadas y corre acompa&ntilde;ado. Desc&aacute;rgalas gratis.',
  },
  'asics-gel-nimbus-26-vs-nike-pegasus-41': {
    title: 'ASICS Nimbus 26 vs Nike Pegasus 41: Comparativa 2026',
    titleClean: 'ASICS Nimbus 26 vs Nike Pegasus 41: Comparativa 2026',
    metaDesc: 'Comparativa detallada ASICS Gel-Nimbus 26 vs Nike Pegasus 41: amortiguaci&oacute;n, peso, durabilidad y precio. Elige la mejor para ti.',
  },
  'auriculares-conduccion-osea-vs-in-ear-running': {
    title: 'Auriculares &Oacute;sea vs In-Ear para Correr: Gu&iacute;a 2026',
    titleClean: 'Auriculares Ósea vs In-Ear para Correr: Guía 2026',
    metaDesc: 'Conducci&oacute;n &oacute;sea o in-ear para running: seguridad, calidad de sonido, sudor y comodidad. Elige los mejores auriculares para correr.',
  },
  'auriculares-running-natacion': {
    title: '7 Mejores Auriculares Running y Nataci&oacute;n 2026',
    titleClean: '7 Mejores Auriculares Running y Natación 2026',
    metaDesc: 'Los mejores auriculares resistentes al agua para running y nataci&oacute;n. Comparativa con precios y valoraciones. Encuentra el tuyo.',
  },
  'ayuno-intermitente-running': {
    title: 'Ayuno Intermitente y Running: Gu&iacute;a Completa 2026',
    titleClean: 'Ayuno Intermitente y Running: Guía Completa 2026',
    metaDesc: 'Todo sobre ayuno intermitente y correr: beneficios, riesgos, protocolos recomendados y cu&aacute;ndo evitarlo. Decide con informaci&oacute;n.',
  },
  'bastones-trail-running': {
    title: '10 Mejores Bastones Trail Running 2026: Gu&iacute;a',
    titleClean: '10 Mejores Bastones Trail Running 2026: Guía',
    metaDesc: 'Los mejores bastones de trail running: plegables, ultraligeros y con amortiguaci&oacute;n. Comparativa actualizada con precios. Elige los tuyos.',
  },
  'beneficios-correr-en-grupo': {
    title: '12 Beneficios de Correr en Grupo Respaldados 2026',
    titleClean: '12 Beneficios de Correr en Grupo Respaldados 2026',
    metaDesc: 'Correr en grupo mejora tu motivaci&oacute;n, ritmo y constancia. 12 beneficios probados por la ciencia para runners sociales. Empieza hoy.',
  },
  'beneficios-de-correr': {
    title: '20 Beneficios de Correr Probados por la Ciencia 2026',
    titleClean: '20 Beneficios de Correr Probados por la Ciencia 2026',
    metaDesc: 'Los 20 beneficios f&iacute;sicos y mentales de correr respaldados por estudios cient&iacute;ficos. Transforma tu salud corriendo. Empieza hoy.',
  },
  'bidones-running': {
    title: '10 Mejores Bidones para Running 2026: Gu&iacute;a',
    titleClean: '10 Mejores Bidones para Running 2026: Guía',
    metaDesc: 'Los mejores bidones y botellas para correr: blandos, r&iacute;gidos y con filtro. Comparativa con precios actualizados. Hidr&aacute;tate mejor.',
  },
  'cafeina-running-rendimiento': {
    title: 'Cafe&iacute;na y Running: C&oacute;mo Mejora tu Rendimiento',
    titleClean: 'Cafeína y Running: Cómo Mejora tu Rendimiento',
    metaDesc: 'La cafe&iacute;na mejora un 3-5% el rendimiento en running. Dosis, timing y formas de tomarla para rendir m&aacute;s. Desc&uacute;brelo.',
  },
  'calambres-al-correr': {
    title: 'Calambres al Correr: Causas y 7 Soluciones R&aacute;pidas',
    titleClean: 'Calambres al Correr: Causas y 7 Soluciones Rápidas',
    metaDesc: 'Por qu&eacute; te dan calambres al correr y 7 formas de prevenirlos y aliviarlos en el momento. Corre sin dolor. Desc&uacute;brelas.',
  },
  'calcetines-running': {
    title: '10 Mejores Calcetines Running 2026: Gu&iacute;a Completa',
    titleClean: '10 Mejores Calcetines Running 2026: Guía Completa',
    metaDesc: 'Los mejores calcetines t&eacute;cnicos para correr: anti-ampollas, compresi&oacute;n y transpirables. Comparativa con precios. Prot&eacute;ge tus pies.',
  },
  'carga-hidratos-maraton': {
    title: 'Carga de Hidratos para Marat&oacute;n: Gu&iacute;a 2026',
    titleClean: 'Carga de Hidratos para Maratón: Guía 2026',
    metaDesc: 'C&oacute;mo hacer la carga de carbohidratos antes de un marat&oacute;n: protocolos, men&uacute;s y errores a evitar. Rinde al m&aacute;ximo el d&iacute;a D.',
  },
  'carreras-trail-principiantes': {
    title: 'Carreras Trail para Principiantes: Gu&iacute;a 2026',
    titleClean: 'Carreras Trail para Principiantes: Guía 2026',
    metaDesc: 'Todo lo que necesitas para tu primera carrera de trail running: equipamiento, entrenamiento y las mejores carreras en Espa&ntilde;a. Empieza hoy.',
  },
  'chalecos-hidratacion-running': {
    title: '10 Mejores Chalecos Hidrataci&oacute;n Running 2026',
    titleClean: '10 Mejores Chalecos Hidratación Running 2026',
    metaDesc: 'Los mejores chalecos de hidrataci&oacute;n para running y trail: ligeros, c&oacute;modos y con espacio para todo. Comparativa y precios. Elige el tuyo.',
  },
  'chubasqueros-running': {
    title: '10 Mejores Chubasqueros Running 2026: Ligeros',
    titleClean: '10 Mejores Chubasqueros Running 2026: Ligeros',
    metaDesc: 'Los mejores chubasqueros para correr bajo la lluvia: impermeables, transpirables y ultraligeros. Comparativa con precios. Corre sin mojarte.',
  },
  'cinturones-running': {
    title: '10 Mejores Cinturones Running 2026: Comparativa',
    titleClean: '10 Mejores Cinturones Running 2026: Comparativa',
    metaDesc: 'Los mejores cinturones para correr: porta m&oacute;vil, hidrataci&oacute;n y llaves sin rebotes. Comparativa actualizada con precios. Elige el tuyo.',
  },
  'como-aumentar-resistencia-corriendo': {
    title: 'C&oacute;mo Aumentar Resistencia Corriendo: 10 Claves',
    titleClean: 'Cómo Aumentar Resistencia Corriendo: 10 Claves',
    metaDesc: '10 m&eacute;todos probados para mejorar tu resistencia al correr: desde principiante hasta avanzado. Corre m&aacute;s lejos sin fatigarte. Empieza hoy.',
  },
  'como-calentar-antes-de-correr': {
    title: 'C&oacute;mo Calentar Antes de Correr: Rutina 10 Min',
    titleClean: 'Cómo Calentar Antes de Correr: Rutina 10 Min',
    metaDesc: 'Rutina de calentamiento de 10 minutos antes de correr: ejercicios din&aacute;micos que previenen lesiones y mejoran rendimiento. S&iacute;guela paso a paso.',
  },
  'como-correr-mas-rapido': {
    title: 'C&oacute;mo Correr M&aacute;s R&aacute;pido: 12 Consejos 2026',
    titleClean: 'Cómo Correr Más Rápido: 12 Consejos 2026',
    metaDesc: '12 t&eacute;cnicas para correr m&aacute;s r&aacute;pido: desde la t&eacute;cnica de carrera hasta el entrenamiento por intervalos. Mejora tu marca. Empieza hoy.',
  },
  'como-crear-habito-de-correr': {
    title: 'C&oacute;mo Crear el H&aacute;bito de Correr en 30 D&iacute;as',
    titleClean: 'Cómo Crear el Hábito de Correr en 30 Días',
    metaDesc: 'Plan de 30 d&iacute;as para convertir el running en h&aacute;bito: trucos psicol&oacute;gicos, rutinas progresivas y motivaci&oacute;n real. Empieza hoy.',
  },
  'como-elegir-reloj-gps-running': {
    title: 'C&oacute;mo Elegir Reloj GPS Running 2026: Gu&iacute;a',
    titleClean: 'Cómo Elegir Reloj GPS Running 2026: Guía',
    metaDesc: 'Gu&iacute;a para elegir el mejor reloj GPS de running: funciones, GPS, bater&iacute;a y presupuesto. Comparativa de los mejores modelos. Desc&uacute;brelos.',
  },
  'como-elegir-zapatillas-running': {
    title: 'C&oacute;mo Elegir Zapatillas Running 2026: Gu&iacute;a',
    titleClean: 'Cómo Elegir Zapatillas Running 2026: Guía',
    metaDesc: 'Aprende a elegir las zapatillas de running perfectas seg&uacute;n tu pisada, peso y tipo de terreno. Evita lesiones. Encuentra las tuyas.',
  },
  'como-evitar-problemas-digestivos-correr': {
    title: 'Problemas Digestivos al Correr: C&oacute;mo Evitarlos',
    titleClean: 'Problemas Digestivos al Correr: Cómo Evitarlos',
    metaDesc: 'Evita n&aacute;useas, flato y problemas de est&oacute;mago al correr con estas 8 estrategias probadas por nutricionistas deportivos. Desc&uacute;brelas.',
  },
  'como-mantener-motivacion-para-correr': {
    title: 'Motivaci&oacute;n para Correr: 15 Trucos que Funcionan',
    titleClean: 'Motivación para Correr: 15 Trucos que Funcionan',
    metaDesc: '15 estrategias probadas para mantener la motivaci&oacute;n al correr cuando no te apetece. No vuelvas a saltarte un entrenamiento. Desc&uacute;brelas.',
  },
  'como-organizar-quedadas-running': {
    title: 'C&oacute;mo Organizar Quedadas Running: Gu&iacute;a 2026',
    titleClean: 'Cómo Organizar Quedadas Running: Guía 2026',
    metaDesc: 'Organiza quedadas de running exitosas: logística, rutas, comunicación y herramientas gratis. Crea tu grupo de corredores. Empieza hoy.',
  },
  'como-preparar-primera-carrera-5k': {
    title: 'Primera Carrera 5K: Plan de Preparaci&oacute;n 2026',
    titleClean: 'Primera Carrera 5K: Plan de Preparación 2026',
    metaDesc: 'Plan completo de 8 semanas para preparar tu primera carrera de 5 km. Entrenamiento, nutrici&oacute;n y consejos el d&iacute;a de carrera. Empieza hoy.',
  },
  'como-respirar-al-correr': {
    title: 'C&oacute;mo Respirar al Correr: T&eacute;cnica Correcta 2026',
    titleClean: 'Cómo Respirar al Correr: Técnica Correcta 2026',
    metaDesc: 'Aprende la t&eacute;cnica correcta de respiraci&oacute;n al correr: nasal vs bucal, ritmo y ejercicios pr&aacute;cticos. Mejora tu rendimiento. Desc&uacute;brelo.',
  },
  'conocer-gente-haciendo-deporte': {
    title: 'Conocer Gente Haciendo Deporte: 10 Formas 2026',
    titleClean: 'Conocer Gente Haciendo Deporte: 10 Formas 2026',
    metaDesc: '10 formas de conocer gente nueva haciendo deporte: running, ciclismo, senderismo y m&aacute;s. Haz amigos mientras te pones en forma. Desc&uacute;brelas.',
  },
  'core-para-runners': {
    title: 'Core para Runners: 10 Ejercicios Esenciales 2026',
    titleClean: 'Core para Runners: 10 Ejercicios Esenciales 2026',
    metaDesc: '10 ejercicios de core espec&iacute;ficos para corredores que mejoran postura, potencia y previenen lesiones. Rutina de 15 minutos. Empieza hoy.',
  },
  'coros-pace-3-review': {
    title: 'COROS PACE 3 Review 2026: An&aacute;lisis para Runners',
    titleClean: 'COROS PACE 3 Review 2026: Análisis para Runners',
    metaDesc: 'An&aacute;lisis completo del COROS PACE 3: GPS, bater&iacute;a, precisi&oacute;n y relaci&oacute;n calidad-precio para corredores. &iquest;El mejor reloj econ&oacute;mico? Desc&uacute;brelo.',
  },
  'correr-acompanado-cadiz': {
    title: 'Correr Acompa&ntilde;ado en C&aacute;diz: Grupos y Rutas 2026',
    titleClean: 'Correr Acompañado en Cádiz: Grupos y Rutas 2026',
    metaDesc: 'Encuentra grupos de running en C&aacute;diz, las mejores rutas para correr y quedadas semanales. Corre acompa&ntilde;ado en tu ciudad. &Uacute;nete hoy.',
  },
  'correr-acompanado-engancha-mas': {
    title: 'Correr Acompa&ntilde;ado Engancha M&aacute;s: La Ciencia 2026',
    titleClean: 'Correr Acompañado Engancha Más: La Ciencia 2026',
    metaDesc: 'La ciencia explica por qu&eacute; correr en grupo motiva m&aacute;s y genera m&aacute;s adherencia al ejercicio. Encuentra compa&ntilde;eros de running. Desc&uacute;brelo.',
  },
  'correr-antes-o-despues-de-comer': {
    title: 'Correr Antes o Despu&eacute;s de Comer: Gu&iacute;a 2026',
    titleClean: 'Correr Antes o Después de Comer: Guía 2026',
    metaDesc: '&iquest;Es mejor correr antes o despu&eacute;s de comer? Tiempos de espera, qu&eacute; comer y c&oacute;mo evitar problemas digestivos. Decide con datos.',
  },
  'correr-con-musica-beneficios': {
    title: 'Correr con M&uacute;sica: 8 Beneficios Cient&iacute;ficos 2026',
    titleClean: 'Correr con Música: 8 Beneficios Científicos 2026',
    metaDesc: '8 beneficios probados de correr con m&uacute;sica: mejora el ritmo, reduce fatiga y aumenta motivaci&oacute;n. Las mejores playlists running. Desc&uacute;brelo.',
  },
  'correr-con-perro-canicross': {
    title: 'Canicross 2026: C&oacute;mo Correr con tu Perro Seguro',
    titleClean: 'Canicross 2026: Cómo Correr con tu Perro Seguro',
    metaDesc: 'Gu&iacute;a completa de canicross: equipamiento, entrenamiento, razas ideales y consejos de seguridad. Corre con tu perro. Empieza hoy.',
  },
  'correr-con-sobrepeso': {
    title: 'Correr con Sobrepeso: Gu&iacute;a Segura para Empezar',
    titleClean: 'Correr con Sobrepeso: Guía Segura para Empezar',
    metaDesc: 'C&oacute;mo empezar a correr con sobrepeso de forma segura: plan progresivo, zapatillas, nutrici&oacute;n y prevenci&oacute;n de lesiones. Empieza hoy.',
  },
  'correr-embarazada-seguro': {
    title: 'Correr Embarazada: Gu&iacute;a Segura por Trimestres',
    titleClean: 'Correr Embarazada: Guía Segura por Trimestres',
    metaDesc: 'Gu&iacute;a m&eacute;dica para correr durante el embarazo: qu&eacute; hacer cada trimestre, se&ntilde;ales de alerta y alternativas seguras. Cons&uacute;ltala.',
  },
  'correr-en-ayunas': {
    title: 'Correr en Ayunas: Beneficios y Riesgos Reales 2026',
    titleClean: 'Correr en Ayunas: Beneficios y Riesgos Reales 2026',
    metaDesc: '&iquest;Es bueno correr en ayunas? Beneficios, riesgos y para qui&eacute;n funciona seg&uacute;n la ciencia. Decide con informaci&oacute;n real. Desc&uacute;brelo.',
  },
  'correr-en-cinta-vs-calle': {
    title: 'Correr en Cinta vs Calle: Diferencias Reales 2026',
    titleClean: 'Correr en Cinta vs Calle: Diferencias Reales 2026',
    metaDesc: 'Cinta de correr vs correr al aire libre: calor&iacute;as, impacto, m&uacute;sculos y rendimiento. Comparativa completa para elegir mejor. Desc&uacute;brelo.',
  },
  'correr-en-invierno': {
    title: 'Correr en Invierno: Ropa y Consejos Esenciales 2026',
    titleClean: 'Correr en Invierno: Ropa y Consejos Esenciales 2026',
    metaDesc: 'Gu&iacute;a completa para correr en invierno: ropa por capas, calentamiento, seguridad y motivaci&oacute;n en fr&iacute;o. Entrena todo el a&ntilde;o. Desc&uacute;brelo.',
  },
  'correr-en-montana-tecnica': {
    title: 'T&eacute;cnica de Correr en Monta&ntilde;a: Gu&iacute;a Trail 2026',
    titleClean: 'Técnica de Correr en Montaña: Guía Trail 2026',
    metaDesc: 'Mejora tu t&eacute;cnica de trail running en subidas, bajadas y terreno t&eacute;cnico. Consejos de corredores expertos. Corre monta&ntilde;a seguro.',
  },
  'correr-en-verano-calor': {
    title: 'Correr en Verano con Calor: 10 Consejos Clave 2026',
    titleClean: 'Correr en Verano con Calor: 10 Consejos Clave 2026',
    metaDesc: '10 consejos para correr en verano sin riesgo de golpe de calor: hidrataci&oacute;n, horarios, ropa y se&ntilde;ales de alerta. Entrena seguro.',
  },
  'correr-es-social-tendencia': {
    title: 'Correr Es Social: La Tendencia Running 2026',
    titleClean: 'Correr Es Social: La Tendencia Running 2026',
    metaDesc: 'El running social es la mayor tendencia de 2026: clubes, apps y quedadas para correr juntos. &Uacute;nete al movimiento. Desc&uacute;brelo.',
  },
};

let updated = 0;
let errors = [];

const files = fs.readdirSync(BLOG_DIR)
  .filter(f => f.endsWith('.html') && !SKIP_SLUGS.includes(f.replace('.html', '')))
  .filter(f => !f.startsWith('index'))
  .sort()
  .slice(0, 50);

for (const file of files) {
  const slug = file.replace('.html', '');
  const seo = SEO_MAP[slug];
  if (!seo) {
    console.log(`SKIP (no SEO data): ${slug}`);
    continue;
  }

  const filePath = path.join(BLOG_DIR, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  try {
    // 1. Update <title>
    content = content.replace(
      /<title>[^<]+<\/title>/,
      `<title>${seo.title} | CorrerJuntos</title>`
    );

    // 2. Update meta description
    content = content.replace(
      /<meta name="description" content="[^"]*">/,
      `<meta name="description" content="${seo.metaDesc}">`
    );

    // 3. Update og:title
    content = content.replace(
      /<meta property="og:title" content="[^"]*">/,
      `<meta property="og:title" content="${seo.titleClean}">`
    );

    // 4. Update og:description
    content = content.replace(
      /<meta property="og:description" content="[^"]*">/,
      `<meta property="og:description" content="${seo.metaDesc}">`
    );

    // 5. Update twitter:title if exists
    content = content.replace(
      /<meta name="twitter:title" content="[^"]*">/,
      `<meta name="twitter:title" content="${seo.titleClean}">`
    );

    // 6. Update twitter:description if exists
    content = content.replace(
      /<meta name="twitter:description" content="[^"]*">/,
      `<meta name="twitter:description" content="${seo.metaDesc}">`
    );

    // 7. Update dateModified in JSON-LD
    content = content.replace(
      /"dateModified":\s*"[^"]*"/,
      `"dateModified": "2026-03-22"`
    );

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      updated++;
      console.log(`OK: ${slug}`);
    } else {
      console.log(`NO CHANGE: ${slug}`);
    }
  } catch (err) {
    errors.push({ slug, error: err.message });
    console.log(`ERROR: ${slug} - ${err.message}`);
  }
}

console.log(`\n=== RESULTS ===`);
console.log(`Total files processed: ${files.length}`);
console.log(`Files updated: ${updated}`);
console.log(`Errors: ${errors.length}`);
if (errors.length > 0) {
  console.log('Error details:', JSON.stringify(errors, null, 2));
}
