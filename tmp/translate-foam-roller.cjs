#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'blog', 'rodillo-vs-pistola-masaje-recuperacion.html');
let html = fs.readFileSync(src, 'utf8');

// Replacements array [from, to]
const replacements = [
  // HTML lang
  ['lang="es-ES"', 'lang="en"'],
  // Title
  ['<title>Rodillo vs Pistola de Masaje: Cu&aacute;l Elegir para Recuperarte | CorrerJuntos</title>', '<title>Foam Roller vs Massage Gun: Which to Choose for Recovery | CorrerJuntos</title>'],
  // Meta description
  ['<meta name="description" content="Rodillo de espuma vs pistola de masaje: cuál es mejor para recuperación deportiva. Comparativa con los 20 mejores productos, precios y Amazon.">', '<meta name="description" content="Foam roller vs massage gun: which is better for sports recovery? Comparison with the 20 best products, prices and Amazon links.">'],
  // Keywords
  ['<meta name="keywords" content="rodillo espuma vs pistola masaje, foam roller, pistola masaje, recuperación deportiva, TriggerPoint, Theragun, RENPHO, masaje muscular">', '<meta name="keywords" content="foam roller vs massage gun, foam roller, massage gun, sports recovery, TriggerPoint, Theragun, RENPHO, muscle massage">'],
  // Canonical
  ['<link rel="canonical" href="https://www.correrjuntos.com/blog/rodillo-vs-pistola-masaje-recuperacion">', '<link rel="canonical" href="https://www.correrjuntos.com/blog/en/foam-roller-vs-massage-gun">'],
  // OG tags
  ['<meta property="og:title" content="Rodillo vs Pistola de Masaje: Cu&aacute;l Elegir para Recuperarte">', '<meta property="og:title" content="Foam Roller vs Massage Gun: Which to Choose for Recovery">'],
  ['<meta property="og:description" content="Rodillo de espuma vs pistola de masaje: cuál es mejor para recuperación deportiva. Comparativa con los 20 mejores productos, precios y Amazon.">', '<meta property="og:description" content="Foam roller vs massage gun: which is better for sports recovery? Comparison with the 20 best products, prices and Amazon links.">'],
  ['<meta property="og:url" content="https://www.correrjuntos.com/blog/rodillo-vs-pistola-masaje-recuperacion">', '<meta property="og:url" content="https://www.correrjuntos.com/blog/en/foam-roller-vs-massage-gun">'],
  ['<meta property="og:locale" content="es_ES">', '<meta property="og:locale" content="en">'],
  // Twitter
  ['<meta name="twitter:title" content="Rodillo vs Pistola de Masaje: Cu&aacute;l Elegir para Recuperarte">', '<meta name="twitter:title" content="Foam Roller vs Massage Gun: Which to Choose for Recovery">'],
  ['<meta name="twitter:description" content="Rodillo de espuma vs pistola de masaje: cuál es mejor para recuperación deportiva. Comparativa con los 20 mejores productos, precios y Amazon.">', '<meta name="twitter:description" content="Foam roller vs massage gun: which is better for sports recovery? Comparison with the 20 best products, prices and Amazon links.">'],

  // Schema - WebPage
  ['"url": "https://www.correrjuntos.com/blog/rodillo-vs-pistola-masaje-recuperacion",\n      "name": "Rodillo de Espuma vs Pistola de Masaje: Cuál Elegir para Recuperación 2026 | CorrerJuntos",\n      "description": "Rodillo de espuma vs pistola de masaje: cuál es mejor para recuperación deportiva. Comparativa con los 20 mejores productos, precios y Amazon.",', '"url": "https://www.correrjuntos.com/blog/en/foam-roller-vs-massage-gun",\n      "name": "Foam Roller vs Massage Gun: Which to Choose for Recovery 2026 | CorrerJuntos",\n      "description": "Foam roller vs massage gun: which is better for sports recovery? Comparison with the 20 best products, prices and Amazon links.",'],
  // Schema - BlogPosting
  ['"headline": "Rodillo de Espuma vs Pistola de Masaje: Cuál Elegir para Recuperación 2026",\n      "description": "Rodillo de espuma vs pistola de masaje: cuál es mejor para recuperación deportiva. Comparativa con los 20 mejores productos, precios y Amazon.",\n      "url": "https://www.correrjuntos.com/blog/rodillo-vs-pistola-masaje-recuperacion",', '"headline": "Foam Roller vs Massage Gun: Which to Choose for Recovery 2026",\n      "description": "Foam roller vs massage gun: which is better for sports recovery? Comparison with the 20 best products, prices and Amazon links.",\n      "url": "https://www.correrjuntos.com/blog/en/foam-roller-vs-massage-gun",'],
  // Schema inLanguage
  ['"inLanguage": "es-ES"', '"inLanguage": "en"'],
  ['"inLanguage": "es"', '"inLanguage": "en"'],
  // Schema author
  ['"jobTitle": "Periodista Deportivo y Editor"', '"jobTitle": "Sports Journalist & Editor"'],
  // Schema breadcrumbs
  ['"name": "Inicio",', '"name": "Home",'],
  ['"name": "Rodillo vs Pistola masaje"', '"name": "Foam Roller vs Massage Gun"'],
  // Schema FAQ questions
  ['"name": "¿Necesito rodillo Y pistola o con uno basta?",', '"name": "Do I need both a roller AND a gun, or is one enough?",'],
  ['"text": "Depende de tu presupuesto. Si solo puedes comprar uno, elige el rodillo: es más versátil, más barato y no necesita batería. La pistola es un excelente complemento para trigger points y zonas difíciles, pero no es imprescindible."', '"text": "It depends on your budget. If you can only buy one, choose the roller: it\'s more versatile, cheaper and doesn\'t need a battery. The gun is an excellent complement for trigger points and hard-to-reach areas, but it\'s not essential."'],
  ['"name": "¿Cuánto tiempo debo usar el rodillo o la pistola?",', '"name": "How long should I use the roller or the gun?",'],
  ['"text": "Rodillo: 1-2 minutos por grupo muscular, total 10-15 minutos. Pistola: 30-60 segundos por punto, total 5-10 minutos. No más de 2 minutos por zona con la pistola para evitar irritación del tejido."', '"text": "Roller: 1-2 minutes per muscle group, total 10-15 minutes. Gun: 30-60 seconds per point, total 5-10 minutes. No more than 2 minutes per area with the gun to avoid tissue irritation."'],
  ['"name": "¿Puedo usar la pistola antes de entrenar?",', '"name": "Can I use the massage gun before training?",'],
  ['"text": "Sí, pero con moderación (velocidad baja, 30 seg por zona). El objetivo pre-entrenamiento es activar, no relajar. El rodillo es generalmente mejor para pre-entrenamiento porque trabaja la fascia de forma más amplia."', '"text": "Yes, but in moderation (low speed, 30 sec per area). The pre-workout goal is to activate, not relax. The roller is generally better for pre-workout as it works the fascia more broadly."'],
  ['"name": "¿La RENPHO es tan buena como una Theragun?",', '"name": "Is the RENPHO as good as a Theragun?",'],
  ['"text": "Para el 90% de atletas, sí. La Theragun Pro tiene más profundidad (16 mm vs 12 mm), más velocidades y mejor construcción. Pero la RENPHO cubre las necesidades de recuperación de la mayoría de personas por una fracción del precio."', '"text": "For 90% of athletes, yes. The Theragun Pro has more depth (16 mm vs 12 mm), more speeds and better build quality. But the RENPHO covers most people\'s recovery needs at a fraction of the price."'],
  ['"name": "¿Cuándo NO debo usar rodillo o pistola?",', '"name": "When should I NOT use a roller or massage gun?",'],
  ['"text": "Nunca directamente sobre huesos, articulaciones o lesiones agudas (inflamación, desgarro). Evita la zona lumbar con la pistola (usar rodillo en su lugar). Si tienes una lesión diagnosticada, consulta a tu fisioterapeuta antes de usar estas herramientas."', '"text": "Never directly on bones, joints or acute injuries (inflammation, tears). Avoid the lower back with the gun (use the roller instead). If you have a diagnosed injury, consult your physiotherapist before using these tools."'],
  // Schema ItemList names
  ['"name": "TriggerPoint GRID Rodillo de Espuma 33 cm"', '"name": "TriggerPoint GRID Foam Roller 33 cm"'],
  ['"name": "unycos Rodillo para Masajes Musculares"', '"name": "unycos Muscle Massage Roller"'],
  ['"name": "EVEREST FITNESS Rodillo de Espuma 33 cm"', '"name": "EVEREST FITNESS Foam Roller 33 cm"'],
  ['"name": "Core Balance Rulo de Masaje Rodillo Muscular"', '"name": "Core Balance Massage Roller"'],
  ['"name": "Rodillo de Espuma con Vibración"', '"name": "Vibrating Foam Roller"'],
  ['"name": "ELVIRE SPORT Rodillo de Espuma Profesional"', '"name": "ELVIRE SPORT Professional Foam Roller"'],
  ['"name": "Foam Roller Masaje Muscular 45x15 cm"', '"name": "Foam Roller Muscle Massage 45x15 cm"'],
  ['"name": "Pistola de Masaje Muscular 30 Velocidades"', '"name": "Muscle Massage Gun 30 Speeds"'],
  ['"name": "Lefity Pistola de Masaje 30 Velocidades LCD"', '"name": "Lefity Massage Gun 30 Speeds LCD"'],
  ['"name": "RENPHO Massage Gun con Calor y Bluetooth"', '"name": "RENPHO Massage Gun with Heat & Bluetooth"'],
  ['"name": "Pistola de Masaje Profesional 6 Velocidades"', '"name": "Professional Massage Gun 6 Speeds"'],
  ['"name": "cotsoco Pistola de Masaje 20 Velocidades 9 Cabezales"', '"name": "cotsoco Massage Gun 20 Speeds 9 Heads"'],
  ['"name": "EKUPUZ Pistola de Masaje 30 Velocidades"', '"name": "EKUPUZ Massage Gun 30 Speeds"'],
  ['"name": "RENPHO Reach Massage Gun Mango Extensible"', '"name": "RENPHO Reach Massage Gun Extendable Handle"'],
  ['"name": "arboleaf Mini Pistola de Masaje"', '"name": "arboleaf Mini Massage Gun"'],
  ['"name": "RENPHO Pistola de Masaje Calor y Frío"', '"name": "RENPHO Hot & Cold Massage Gun"'],

  // All @id URLs
  ['https://www.correrjuntos.com/blog/rodillo-vs-pistola-masaje-recuperacion#webpage', 'https://www.correrjuntos.com/blog/en/foam-roller-vs-massage-gun#webpage'],
  ['https://www.correrjuntos.com/blog/rodillo-vs-pistola-masaje-recuperacion#article', 'https://www.correrjuntos.com/blog/en/foam-roller-vs-massage-gun#article'],
  ['https://www.correrjuntos.com/blog/rodillo-vs-pistola-masaje-recuperacion#breadcrumbs', 'https://www.correrjuntos.com/blog/en/foam-roller-vs-massage-gun#breadcrumbs'],
  ['https://www.correrjuntos.com/blog/rodillo-vs-pistola-masaje-recuperacion#faq', 'https://www.correrjuntos.com/blog/en/foam-roller-vs-massage-gun#faq'],

  // Nav
  ['<a href="/matching/">Matching</a>', '<a href="/matching/en/">Matching</a>'],
  ['<a href="/cities/">Ciudades</a>', '<a href="/cities/">Cities</a>'],
  ['<a href="/blog/" class="active">Blog</a>', '<a href="/blog/en/" class="active">Blog</a>'],
  ['aria-label="Cambiar tema"', 'aria-label="Toggle theme"'],
  ['>Entrar</a>', '>Login</a>'],
  ['>Únete</a>', '>Sign Up</a>'],

  // Breadcrumb
  ['<a href="/">Inicio</a><span>/</span><a href="/blog/">Blog</a><span>/</span>Rodillo vs Pistola masaje', '<a href="/">Home</a><span>/</span><a href="/blog/en/">Blog</a><span>/</span>Foam Roller vs Massage Gun'],

  // Hero
  ['alt="Atleta usando herramientas de recuperación muscular después del entrenamiento"', 'alt="Athlete using muscle recovery tools after training"'],
  ['<h1>Rodillo de Espuma vs Pistola de Masaje: Cuál Elegir para Recuperación 2026</h1>', '<h1>Foam Roller vs Massage Gun: Which to Choose for Recovery 2026</h1>'],
  ['<p>Rodillo de espuma vs pistola de masaje: cuál es mejor para recuperación deportiva. Comparativa con los 20 mejores productos, precios y Amazon.</p>', '<p>Foam roller vs massage gun: which is better for sports recovery? Comparison with the 20 best products, prices and Amazon links.</p>'],
  ['<span class="category">Atleta Híbrido</span> &middot; 2026-03-08 &middot; Carlos Ruiz &middot; 13 min lectura', '<span class="category">Hybrid Athlete</span> &middot; 2026-03-08 &middot; Carlos Ruiz &middot; 13 min read'],

  // Disclosure
  ['&#128203; <strong>Transparencia:</strong> Este artículo contiene enlaces de afiliado a Amazon. Si compras a través de ellos, recibimos una pequeña comisión sin coste adicional para ti. Esto nos ayuda a mantener CorrerJuntos gratuito. Solo recomendamos productos que hemos probado o analizado en profundidad.', '&#128203; <strong>Disclosure:</strong> This article contains affiliate links to Amazon. If you buy through them, we earn a small commission at no extra cost to you. This helps keep CorrerJuntos free. We only recommend products we have tested or thoroughly analyzed.'],

  // TOC
  ['<h2>Contenido de esta guía</h2>', '<h2>Table of Contents</h2>'],
  ['<a href="#comparativa-general">Rodillo vs Pistola: comparativa</a>', '<a href="#comparativa-general">Roller vs Gun: comparison</a>'],
  ['<a href="#cuando-usar">Cuándo usar cada uno</a>', '<a href="#cuando-usar">When to use each</a>'],
  ['<a href="#ranking">Los 20 mejores productos</a>', '<a href="#ranking">The 20 best products</a>'],
  ['<a href="#tabla">Tabla comparativa</a>', '<a href="#tabla">Comparison table</a>'],
  ['<a href="#rutina">Rutina de recuperación post-HYROX</a>', '<a href="#rutina">Post-HYROX recovery routine</a>'],
  ['<a href="#faq">Preguntas frecuentes</a>', '<a href="#faq">FAQ</a>'],

  // Section headings
  ['<h2 id="comparativa-general">Rodillo de espuma vs Pistola de masaje</h2>', '<h2 id="comparativa-general">Foam Roller vs Massage Gun</h2>'],
  ['<h2 id="cuando-usar">Cu&aacute;ndo usar cada uno</h2>', '<h2 id="cuando-usar">When to Use Each</h2>'],
  ['<h2 id="ranking">Los 20 mejores productos de recuperación 2026</h2>', '<h2 id="ranking">The 20 Best Recovery Products 2026</h2>'],
  ['<h2 id="tabla">Tabla comparativa</h2>', '<h2 id="tabla">Comparison Table</h2>'],
  ['<h2 id="rutina">Rutina de recuperaci&oacute;n post-HYROX</h2>', '<h2 id="rutina">Post-HYROX Recovery Routine</h2>'],
  ['<h2 id="faq">Preguntas frecuentes</h2>', '<h2 id="faq">Frequently Asked Questions</h2>'],
  ['<h2>Conclusi&oacute;n</h2>', '<h2>Conclusion</h2>'],

  // Comparison table headers
  ['<th>Aspecto</th><th>Rodillo (Foam Roller)</th><th>Pistola de Masaje</th>', '<th>Aspect</th><th>Foam Roller</th><th>Massage Gun</th>'],
  ['<td>Tipo de presi&oacute;n</td><td>Amplia, usa tu peso</td><td>Puntual, percusi&oacute;n localizada</td>', '<td>Pressure type</td><td>Broad, uses body weight</td><td>Pinpoint, localized percussion</td>'],
  ['<td>Profundidad</td><td>Superficial-media</td><td>Media-profunda</td>', '<td>Depth</td><td>Shallow-medium</td><td>Medium-deep</td>'],
  ['<td>Mejor para</td><td>Grandes m&uacute;sculos</td><td>Trigger points espec&iacute;ficos</td>', '<td>Best for</td><td>Large muscles</td><td>Specific trigger points</td>'],
  ['<td>Ruido</td><td>Silencioso</td><td>Moderado-alto</td>', '<td>Noise</td><td>Silent</td><td>Moderate-high</td>'],
  ['<td>Precio</td><td>15-45&euro;</td><td>60-400&euro;</td>', '<td>Price</td><td>€15-45</td><td>€60-400</td>'],
  ['<td>Portabilidad</td><td>Voluminoso</td><td>Compacta</td>', '<td>Portability</td><td>Bulky</td><td>Compact</td>'],
  ['<td>Curva de aprendizaje</td><td>Baja</td><td>Muy baja</td>', '<td>Learning curve</td><td>Low</td><td>Very low</td>'],
  ['<td>Bater&iacute;a</td><td>No necesita</td><td>2-5 horas</td>', '<td>Battery</td><td>Not needed</td><td>2-5 hours</td>'],

  // "When to use" section
  ['<h3>Usa el rodillo cuando:</h3>', '<h3>Use the roller when:</h3>'],
  ['<h3>Usa la pistola cuando:</h3>', '<h3>Use the gun when:</h3>'],

  // Quick summary tip
  ['<strong>Resumen r&aacute;pido:</strong> El rodillo es mejor para <strong>grandes grupos musculares</strong> (cu&aacute;driceps, IT band, gemelos). La pistola es mejor para <strong>puntos espec&iacute;ficos</strong> (nudos, trigger points, zonas profundas). Lo ideal: tener los dos.', '<strong>Quick summary:</strong> The roller is better for <strong>large muscle groups</strong> (quads, IT band, calves). The gun is better for <strong>specific points</strong> (knots, trigger points, deep areas). Ideally: have both.'],

  // Roller usage items
  ['<strong>Pre-entrenamiento:</strong> 5 minutos de rodillo en cu&aacute;driceps, gemelos e IT band aumenta el rango de movimiento sin afectar la fuerza.', '<strong>Pre-workout:</strong> 5 minutes of rolling on quads, calves and IT band increases range of motion without affecting strength.'],
  ['<strong>Grandes superficies musculares:</strong> Cu&aacute;driceps, isquiotibiales, gemelos, espalda alta. El rodillo cubre m&aacute;s &aacute;rea por pasada.', '<strong>Large muscle surfaces:</strong> Quads, hamstrings, calves, upper back. The roller covers more area per pass.'],
  ['<strong>Fascia y adhesi&oacute;n miofascial:</strong> El rodillo es m&aacute;s efectivo para &ldquo;despegar&rdquo; la fascia de los m&uacute;sculos subyacentes.', '<strong>Fascia and myofascial adhesion:</strong> The roller is more effective at "unsticking" fascia from underlying muscles.'],
  ['<strong>Post-carrera larga:</strong> 10-15 minutos de rodillo en piernas despu&eacute;s de tiradas largas o HYROX.', '<strong>Post-long run:</strong> 10-15 minutes of rolling legs after long runs or HYROX.'],

  // Gun usage items
  ['<strong>Nudos espec&iacute;ficos:</strong> Trigger points en trapecios, gl&uacute;teos, piriforme. La pistola llega donde el rodillo no puede.', '<strong>Specific knots:</strong> Trigger points in traps, glutes, piriformis. The gun reaches where the roller can\'t.'],
  ['<strong>Post-entrenamiento de fuerza:</strong> Despu&eacute;s de estaciones HYROX pesadas (sled, farmer&apos;s carry, wall balls).', '<strong>Post-strength training:</strong> After heavy HYROX stations (sled, farmer\'s carry, wall balls).'],
  ['<strong>Zonas dif&iacute;ciles:</strong> Subescapular, dorsal, tib&iacute;al anterior. Zonas donde el rodillo no tiene buen &aacute;ngulo.', '<strong>Hard-to-reach areas:</strong> Subscapular, lats, tibialis anterior. Areas where the roller doesn\'t have a good angle.'],
  ['<strong>Viajes y competici&oacute;n:</strong> M&aacute;s port&aacute;til que un rodillo. Perfecta para llevar al evento HYROX.', '<strong>Travel and competition:</strong> More portable than a roller. Perfect to bring to HYROX events.'],

  // Intro paragraphs
  ['<p>La recuperaci&oacute;n es la mitad olvidada del entrenamiento.', '<p>Recovery is the forgotten half of training.'],
  ['Para atletas h&iacute;bridos que combinan running con HYROX, DEKA o CrossFit, el estr&eacute;s muscular es mayor que para un corredor puro.', 'For hybrid athletes combining running with HYROX, DEKA or CrossFit, muscle stress is greater than for a pure runner.'],
  ['Los <strong>rodillos de espuma (foam rollers)</strong> y las <strong>pistolas de masaje (massage guns)</strong> son las dos herramientas de recuperaci&oacute;n m&aacute;s populares.</p>', '<strong>Foam rollers</strong> and <strong>massage guns</strong> are the two most popular recovery tools.</p>'],
  ['<p>&iquest;Cu&aacute;l es mejor? &iquest;Necesitas las dos? En esta gu&iacute;a comparamos ambas opciones, explicamos cu&aacute;ndo usar cada una y te recomendamos los mejores modelos para cada categor&iacute;a.</p>', '<p>Which is better? Do you need both? In this guide we compare both options, explain when to use each and recommend the best models in each category.</p>'],

  // Product ranking intro
  ['<p>Rodillos de espuma y pistolas de masaje: los veinte mejores en su categor&iacute;a para atletas h&iacute;bridos.</p>', '<p>Foam rollers and massage guns: the twenty best in each category for hybrid athletes.</p>'],

  // Product 1 subtitles & descriptions
  ['<h3>1. TriggerPoint GRID Foam Roller - Mejor rodillo de espuma</h3>', '<h3>1. TriggerPoint GRID Foam Roller - Best Foam Roller</h3>'],
  ['<span class="spec-label">Longitud</span>', '<span class="spec-label">Length</span>'],
  ['<span class="spec-label">Diámetro</span>', '<span class="spec-label">Diameter</span>'],
  ['<span class="spec-label">Peso</span>', '<span class="spec-label">Weight</span>'],
  ['<span class="spec-label">Material</span>', '<span class="spec-label">Material</span>'],
  ['<span class="spec-label">Velocidades</span>', '<span class="spec-label">Speeds</span>'],
  ['<span class="spec-label">Cabezales</span>', '<span class="spec-label">Heads</span>'],
  ['<span class="spec-label">Batería</span>', '<span class="spec-label">Battery</span>'],
  ['<span class="spec-label">Resistencia</span>', '<span class="spec-label">Capacity</span>'],
  ['<span class="spec-label">Superficie</span>', '<span class="spec-label">Surface</span>'],
  ['<span class="spec-label">Uso</span>', '<span class="spec-label">Use</span>'],
  ['<span class="spec-label">Tama&ntilde;o</span>', '<span class="spec-label">Size</span>'],
  ['<span class="spec-label">Port&aacute;til</span>', '<span class="spec-label">Portable</span>'],
  ['<span class="spec-label">V&iacute;deos</span>', '<span class="spec-label">Videos</span>'],
  ['<span class="spec-label">Formato</span>', '<span class="spec-label">Format</span>'],
  ['<span class="spec-label">Piezas</span>', '<span class="spec-label">Pieces</span>'],
  ['<span class="spec-label">Bolsa</span>', '<span class="spec-label">Bag</span>'],
  ['<span class="spec-label">Incluye</span>', '<span class="spec-label">Includes</span>'],
  ['<span class="spec-label">Pantalla</span>', '<span class="spec-label">Display</span>'],
  ['<span class="spec-label">Motor</span>', '<span class="spec-label">Motor</span>'],
  ['<span class="spec-label">Calor</span>', '<span class="spec-label">Heat</span>'],
  ['<span class="spec-label">Carga</span>', '<span class="spec-label">Charge</span>'],
  ['<span class="spec-label">Mango</span>', '<span class="spec-label">Handle</span>'],
  ['<span class="spec-label">Marca</span>', '<span class="spec-label">Brand</span>'],
  ['<span class="spec-label">Alcance</span>', '<span class="spec-label">Reach</span>'],
  ['<span class="spec-label">Nivel</span>', '<span class="spec-label">Level</span>'],
  ['<span class="spec-label">Vibraci&oacute;n</span>', '<span class="spec-label">Vibration</span>'],
  ['<span class="spec-label">Tejido</span>', '<span class="spec-label">Tissue</span>'],
  ['<span class="spec-label">Fr&iacute;o</span>', '<span class="spec-label">Cold</span>'],

  // Spec values
  ['<span class="spec-value">5 niveles</span>', '<span class="spec-value">5 levels</span>'],
  ['<span class="spec-value">5 incluidos</span>', '<span class="spec-value">5 included</span>'],
  ['<span class="spec-value">3 niveles</span>', '<span class="spec-value">3 levels</span>'],
  ['<span class="spec-value">1 (bola)</span>', '<span class="spec-value">1 (ball)</span>'],
  ['<span class="spec-value">2.5h uso</span>', '<span class="spec-value">2.5h use</span>'],
  ['<span class="spec-value">EVA + núcleo ABS</span>', '<span class="spec-value">EVA + ABS core</span>'],
  ['<span class="spec-value">Espuma dura</span>', '<span class="spec-value">Hard foam</span>'],
  ['<span class="spec-value">Automasaje</span>', '<span class="spec-value">Self-massage</span>'],
  ['<span class="spec-value">S&iacute;</span>', '<span class="spec-value">Yes</span>'],
  ['<span class="spec-value">Tutoriales incluidos</span>', '<span class="spec-value">Tutorials included</span>'],
  ['<span class="spec-value">Texturizada</span>', '<span class="spec-value">Textured</span>'],
  ['<span class="spec-value">Rejilla 3D</span>', '<span class="spec-value">3D grid</span>'],
  ['<span class="spec-value">Ligero</span>', '<span class="spec-value">Light</span>'],
  ['<span class="spec-value">S&iacute;, 4 niveles</span>', '<span class="spec-value">Yes, 4 levels</span>'],
  ['<span class="spec-value">Recargable USB</span>', '<span class="spec-value">USB rechargeable</span>'],
  ['<span class="spec-value">Masaje profundo</span>', '<span class="spec-value">Deep massage</span>'],
  ['<span class="spec-value">Profesional</span>', '<span class="spec-value">Professional</span>'],
  ['<span class="spec-value">Rejilla masaje</span>', '<span class="spec-value">Massage grid</span>'],
  ['<span class="spec-value">Grande</span>', '<span class="spec-value">Large</span>'],
  ['<span class="spec-value">3 piezas</span>', '<span class="spec-value">3 pieces</span>'],
  ['<span class="spec-value">Rodillo+Bola+Stick</span>', '<span class="spec-value">Roller+Ball+Stick</span>'],
  ['<span class="spec-value">Incluida</span>', '<span class="spec-value">Included</span>'],
  ['<span class="spec-value">6 incluidos</span>', '<span class="spec-value">6 included</span>'],
  ['<span class="spec-value">Silencioso</span>', '<span class="spec-value">Quiet</span>'],
  ['<span class="spec-value">30 niveles</span>', '<span class="spec-value">30 levels</span>'],
  ['<span class="spec-value">Profundo</span>', '<span class="spec-value">Deep</span>'],
  ['<span class="spec-value">S&iacute;, integrado</span>', '<span class="spec-value">Yes, built-in</span>'],
  ['<span class="spec-value">S&iacute;, con APP</span>', '<span class="spec-value">Yes, with APP</span>'],
  ['<span class="spec-value">LED</span>', '<span class="spec-value">LED</span>'],
  ['<span class="spec-value">4 incluidos</span>', '<span class="spec-value">4 included</span>'],
  ['<span class="spec-value">Ultrasilencioso</span>', '<span class="spec-value">Ultra-quiet</span>'],
  ['<span class="spec-value">Larga duraci&oacute;n</span>', '<span class="spec-value">Long-lasting</span>'],
  ['<span class="spec-value">20 niveles</span>', '<span class="spec-value">20 levels</span>'],
  ['<span class="spec-value">9 incluidos</span>', '<span class="spec-value">9 included</span>'],
  ['<span class="spec-value">LCD t&aacute;ctil</span>', '<span class="spec-value">Touch LCD</span>'],
  ['<span class="spec-value">Extensible</span>', '<span class="spec-value">Extendable</span>'],
  ['<span class="spec-value">Espalda completa</span>', '<span class="spec-value">Full back</span>'],
  ['<span class="spec-value">S&iacute;, ligera</span>', '<span class="spec-value">Yes, light</span>'],
  ['<span class="spec-value">4 silicona</span>', '<span class="spec-value">4 silicone</span>'],
  ['<span class="spec-value">Tejido profundo</span>', '<span class="spec-value">Deep tissue</span>'],

  // "Ver en Amazon" links
  ['Ver en Amazon &rarr;', 'View on Amazon &rarr;'],

  // "best-for" lines (all product cards)
  ['Ideal para: recuperación post-running, pre-entrenamiento, grandes grupos musculares', 'Best for: post-running recovery, pre-workout, large muscle groups'],
  ['Ideal para: atletas que buscan pistola de masaje sin gastar 300€, uso diario', 'Best for: athletes looking for a massage gun without spending €300, daily use'],
  ['Ideal para: portabilidad máxima, llevar a competiciones, calidad Therabody', 'Best for: maximum portability, competitions, Therabody quality'],
  ['Ideal para: runner que busca portabilidad con calidad TriggerPoint', 'Best for: runner seeking portability with TriggerPoint quality'],
  ['Ideal para: presupuesto ajustado, principiantes, uso diario', 'Best for: tight budget, beginners, daily use'],
  ['Ideal para: automasaje diario, gym, recuperaci&oacute;n post-running', 'Best for: daily self-massage, gym, post-running recovery'],
  ['Ideal para: grandes grupos musculares, yoga, pilates, recuperaci&oacute;n', 'Best for: large muscle groups, yoga, pilates, recovery'],
  ['Ideal para: masaje profundo con vibraci&oacute;n, atletas avanzados', 'Best for: deep massage with vibration, advanced athletes'],
  ['Ideal para: crossfit, HYROX, uso profesional intensivo', 'Best for: CrossFit, HYROX, intensive professional use'],
  ['Ideal para: espalda completa, cu&aacute;driceps, personas altas', 'Best for: full back, quads, tall people'],
  ['Ideal para: kit completo de recuperaci&oacute;n, principiantes que quieren variedad', 'Best for: complete recovery kit, beginners wanting variety'],
  ['Ideal para: uso diario, m&uacute;ltiples zonas musculares, presupuesto ajustado', 'Best for: daily use, multiple muscle zones, tight budget'],
  ['Ideal para: alivio dolor muscular, tejido profundo, post-entrenamiento', 'Best for: muscle pain relief, deep tissue, post-workout'],
  ['Ideal para: terapia con calor, control v&iacute;a app, atletas tech', 'Best for: heat therapy, app control, tech athletes'],
  ['Ideal para: uso profesional, motor silencioso, bater&iacute;a duradera', 'Best for: professional use, quiet motor, long battery'],
  ['Ideal para: m&aacute;xima versatilidad, 9 cabezales para todas las zonas', 'Best for: maximum versatility, 9 heads for all areas'],
  ['Ideal para: ejercicio diario, alivio dolor muscular, viajes', 'Best for: daily exercise, muscle pain relief, travel'],
  ['Ideal para: automasaje en espalda, zonas dif&iacute;ciles de alcanzar', 'Best for: back self-massage, hard-to-reach areas'],
  ['Ideal para: portabilidad extrema, competiciones, viajes', 'Best for: extreme portability, competitions, travel'],
  ['Ideal para: terapia completa calor/fr&iacute;o, recuperaci&oacute;n profesional', 'Best for: complete hot/cold therapy, professional recovery'],

  // Product headings 2-20
  ['<h3>2. RENPHO Massage Gun - Mejor pistola calidad-precio</h3>', '<h3>2. RENPHO Massage Gun - Best Value Massage Gun</h3>'],
  ['<h3>3. Theragun Mini (2.0) - Mejor pistola premium portátil</h3>', '<h3>3. Theragun Mini (2.0) - Best Premium Portable Gun</h3>'],
  ['<h3>4. TriggerPoint GRID Rodillo de Espuma — Portátil 33 cm</h3>', '<h3>4. TriggerPoint GRID Foam Roller — Portable 33 cm</h3>'],
  ['<h3>5. unycos Rodillo para Masajes Musculares — 33x14 cm</h3>', '<h3>5. unycos Muscle Massage Roller — 33x14 cm</h3>'],
  ['<h3>6. EVEREST FITNESS Rodillo de Espuma — 33 cm Automasaje</h3>', '<h3>6. EVEREST FITNESS Foam Roller — 33 cm Self-Massage</h3>'],
  ['<h3>7. Core Balance Rulo de Masaje — Rodillo Muscular Fitness</h3>', '<h3>7. Core Balance Massage Roller — Fitness Muscle Roller</h3>'],
  ['<h3>8. Rodillo de Espuma con Vibraci&oacute;n — Masaje Profundo</h3>', '<h3>8. Vibrating Foam Roller — Deep Massage</h3>'],
  ['<h3>9. ELVIRE SPORT Rodillo de Espuma — Foam Roller Profesional</h3>', '<h3>9. ELVIRE SPORT Foam Roller — Professional Grade</h3>'],
  ['<h3>10. Foam Roller Masaje Muscular — 45&times;15 cm Gran Formato</h3>', '<h3>10. Foam Roller Muscle Massage — 45×15 cm Large Format</h3>'],
  ['<h3>11. KALAHARI Foam Roller Kit 3 en 1 — Rodillo + Bola + Stick</h3>', '<h3>11. KALAHARI Foam Roller Kit 3-in-1 — Roller + Ball + Stick</h3>'],
  ['<h3>12. Pistola de Masaje Muscular — 30 Velocidades, 6 Cabezales</h3>', '<h3>12. Muscle Massage Gun — 30 Speeds, 6 Heads</h3>'],
  ['<h3>13. Lefity Pistola de Masaje — 30 Velocidades + Pantalla LCD</h3>', '<h3>13. Lefity Massage Gun — 30 Speeds + LCD Display</h3>'],
  ['<h3>14. RENPHO Massage Gun con Calor y Bluetooth — Compatible con APP</h3>', '<h3>14. RENPHO Massage Gun with Heat & Bluetooth — APP Compatible</h3>'],
  ['<h3>15. Pistola de Masaje Profesional — 6 Velocidades, Motor Ultrasilencioso</h3>', '<h3>15. Professional Massage Gun — 6 Speeds, Ultra-Quiet Motor</h3>'],
  ['<h3>16. cotsoco Pistola de Masaje — 20 Velocidades, 9 Cabezales</h3>', '<h3>16. cotsoco Massage Gun — 20 Speeds, 9 Heads</h3>'],
  ['<h3>17. EKUPUZ Pistola de Masaje — 30 Velocidades, Port&aacute;til</h3>', '<h3>17. EKUPUZ Massage Gun — 30 Speeds, Portable</h3>'],
  ['<h3>18. RENPHO Reach Massage Gun — Mango Extensible Desmontable</h3>', '<h3>18. RENPHO Reach Massage Gun — Detachable Extendable Handle</h3>'],
  ['<h3>19. arboleaf Mini Pistola de Masaje — Ultraligera 0,47 kg</h3>', '<h3>19. arboleaf Mini Massage Gun — Ultra-Light 0.47 kg</h3>'],
  ['<h3>20. RENPHO Pistola de Masaje Calor y Fr&iacute;o — Terapia Completa</h3>', '<h3>20. RENPHO Hot & Cold Massage Gun — Complete Therapy</h3>'],

  // Comparison table products
  ['<th>Producto</th><th>Tipo</th><th>Precio</th><th>Mejor para</th>', '<th>Product</th><th>Type</th><th>Price</th><th>Best for</th>'],
  ['<td>Rodillo espuma</td>', '<td>Foam roller</td>'],
  ['<td>Pistola masaje</td>', '<td>Massage gun</td>'],
  ['<td>Rodillo vibratorio</td>', '<td>Vibrating roller</td>'],
  ['<td>Kit recuperaci&oacute;n</td>', '<td>Recovery kit</td>'],
  ['<td>Grandes m&uacute;sculos, pre/post</td>', '<td>Large muscles, pre/post</td>'],
  ['<td>Calidad-precio, uso diario</td>', '<td>Value, daily use</td>'],
  ['<td>Portabilidad, competiciones</td>', '<td>Portability, competitions</td>'],
  ['<td>Port&aacute;til, con tutoriales</td>', '<td>Portable, with tutorials</td>'],
  ['<td>Presupuesto, principiantes</td>', '<td>Budget, beginners</td>'],
  ['<td>Automasaje diario, gym</td>', '<td>Daily self-massage, gym</td>'],
  ['<td>Grandes m&uacute;sculos, yoga</td>', '<td>Large muscles, yoga</td>'],
  ['<td>Masaje profundo, avanzados</td>', '<td>Deep massage, advanced</td>'],
  ['<td>CrossFit, HYROX, profesional</td>', '<td>CrossFit, HYROX, professional</td>'],
  ['<td>Espalda, personas altas</td>', '<td>Back, tall people</td>'],
  ['<td>Kit completo, variedad</td>', '<td>Complete kit, variety</td>'],
  ['<td>Econ&oacute;mica, uso diario</td>', '<td>Budget, daily use</td>'],
  ['<td>Tejido profundo, post-entreno</td>', '<td>Deep tissue, post-workout</td>'],
  ['<td>Calor integrado, app</td>', '<td>Built-in heat, app</td>'],
  ['<td>Profesional, silenciosa</td>', '<td>Professional, quiet</td>'],
  ['<td>M&aacute;s cabezales (9)</td>', '<td>Most heads (9)</td>'],
  ['<td>Port&aacute;til, ligera</td>', '<td>Portable, light</td>'],
  ['<td>Mango extensible, espalda</td>', '<td>Extendable handle, back</td>'],
  ['<td>Ultraligera 0,47 kg</td>', '<td>Ultra-light 0.47 kg</td>'],
  ['<td>Terapia calor/fr&iacute;o completa</td>', '<td>Complete hot/cold therapy</td>'],

  // Recovery routine
  ['<p>Despu&eacute;s de una competici&oacute;n HYROX o un entrenamiento h&iacute;brido intenso, esta rutina de 15 minutos acelera la recuperaci&oacute;n:</p>', '<p>After a HYROX competition or intense hybrid workout, this 15-minute routine accelerates recovery:</p>'],
  ['<strong>0-5 min &mdash; Rodillo (piernas):</strong> Cu&aacute;driceps (1 min cada pierna), IT band (1 min cada lado), gemelos (1 min).', '<strong>0-5 min — Roller (legs):</strong> Quads (1 min each leg), IT band (1 min each side), calves (1 min).'],
  ['<strong>5-10 min &mdash; Pistola (puntos espec&iacute;ficos):</strong> Gl&uacute;teos y piriforme (2 min por lado), trapecios (1 min por lado), antebrazos (1 min por lado &mdash; cr&iacute;tico despu&eacute;s de farmer&apos;s carry).', '<strong>5-10 min — Gun (specific points):</strong> Glutes and piriformis (2 min per side), traps (1 min per side), forearms (1 min per side — critical after farmer\'s carry).'],
  ['<strong>10-15 min &mdash; Estiramientos suaves:</strong> Hip flexors (1 min por lado), isquiotibiales (1 min por lado), pecho y hombros (1 min), cuello (1 min).', '<strong>10-15 min — Gentle stretches:</strong> Hip flexors (1 min per side), hamstrings (1 min per side), chest and shoulders (1 min), neck (1 min).'],
  ['<strong>Consejo:</strong> No uses la pistola a m&aacute;xima intensidad inmediatamente despu&eacute;s de competir. El m&uacute;sculo est&aacute; inflamado y sensible. Empieza con la velocidad m&aacute;s baja y sube gradualmente. El rodillo primero ayuda a &ldquo;preparar&rdquo; el m&uacute;sculo para la percusi&oacute;n.', '<strong>Tip:</strong> Don\'t use the gun at maximum intensity immediately after competing. The muscle is inflamed and sensitive. Start with the lowest speed and increase gradually. Rolling first helps "prepare" the muscle for percussion.'],

  // FAQ visible text
  ['<h3>¿Necesito rodillo Y pistola o con uno basta?</h3>', '<h3>Do I need both a roller AND a gun, or is one enough?</h3>'],
  ['<p>Depende de tu presupuesto. Si solo puedes comprar uno, elige el rodillo: es más versátil, más barato y no necesita batería. La pistola es un excelente complemento para trigger points y zonas difíciles, pero no es imprescindible.</p>', '<p>It depends on your budget. If you can only buy one, choose the roller: it\'s more versatile, cheaper and doesn\'t need a battery. The gun is an excellent complement for trigger points and hard-to-reach areas, but it\'s not essential.</p>'],
  ['<h3>¿Cuánto tiempo debo usar el rodillo o la pistola?</h3>', '<h3>How long should I use the roller or the gun?</h3>'],
  ['<p>Rodillo: 1-2 minutos por grupo muscular, total 10-15 minutos. Pistola: 30-60 segundos por punto, total 5-10 minutos. No más de 2 minutos por zona con la pistola para evitar irritación del tejido.</p>', '<p>Roller: 1-2 minutes per muscle group, total 10-15 minutes. Gun: 30-60 seconds per point, total 5-10 minutes. No more than 2 minutes per area with the gun to avoid tissue irritation.</p>'],
  ['<h3>¿Puedo usar la pistola antes de entrenar?</h3>', '<h3>Can I use the massage gun before training?</h3>'],
  ['<p>Sí, pero con moderación (velocidad baja, 30 seg por zona). El objetivo pre-entrenamiento es activar, no relajar. El rodillo es generalmente mejor para pre-entrenamiento porque trabaja la fascia de forma más amplia.</p>', '<p>Yes, but in moderation (low speed, 30 sec per area). The pre-workout goal is to activate, not relax. The roller is generally better for pre-workout as it works the fascia more broadly.</p>'],
  ['<h3>¿La RENPHO es tan buena como una Theragun?</h3>', '<h3>Is the RENPHO as good as a Theragun?</h3>'],
  ['<p>Para el 90% de atletas, sí. La Theragun Pro tiene más profundidad (16 mm vs 12 mm), más velocidades y mejor construcción. Pero la RENPHO cubre las necesidades de recuperación de la mayoría de personas por una fracción del precio.</p>', '<p>For 90% of athletes, yes. The Theragun Pro has more depth (16 mm vs 12 mm), more speeds and better build quality. But the RENPHO covers most people\'s recovery needs at a fraction of the price.</p>'],
  ['<h3>¿Cuándo NO debo usar rodillo o pistola?</h3>', '<h3>When should I NOT use a roller or massage gun?</h3>'],
  ['<p>Nunca directamente sobre huesos, articulaciones o lesiones agudas (inflamación, desgarro). Evita la zona lumbar con la pistola (usar rodillo en su lugar). Si tienes una lesión diagnosticada, consulta a tu fisioterapeuta antes de usar estas herramientas.</p>', '<p>Never directly on bones, joints or acute injuries (inflammation, tears). Avoid the lower back with the gun (use the roller instead). If you have a diagnosed injury, consult your physiotherapist before using these tools.</p>'],

  // CTA / share / newsletter / footer
  ['Compartir:', 'Share:'],
  ['Copiar link', 'Copy link'],
  ['Copiado', 'Copied'],
  ['<h2>Estrena tu equipo corriendo en grupo</h2>', '<h2>Try your new gear running with others</h2>'],
  ['<p>Encuentra runners cerca de ti y pon a prueba tu equipo nuevo. Quedadas gratuitas, todos los niveles.</p>', '<p>Find runners near you and test your new gear. Free group runs, all levels.</p>'],
  ['Únete a 5.000+ runners', 'Join 5,000+ runners'],
  ['Descargar gratis', 'Download free'],
  ['<h3>Tips de running en tu email</h3>', '<h3>Running tips in your inbox</h3>'],
  ['<p>Recibe guías de equipamiento, ofertas y planes de entrenamiento. Sin spam.</p>', '<p>Get gear guides, deals and training plans. No spam.</p>'],
  ['>Suscribirme</button>', '>Subscribe</button>'],
  ['Bienvenido/a! Te avisaremos con los mejores tips.', 'Welcome! We\'ll send you the best tips.'],
  ['Error. Inténtalo de nuevo.', 'Error. Please try again.'],
  ['📬 Tips de Running en tu Email', '📬 Running Tips in Your Email'],
  ['Rutas, planes de entrenamiento y consejos para correr mejor. Sin spam.', 'Routes, training plans and tips to run better. No spam.'],
  ['🔒 Respetamos tu privacidad. Cancela cuando quieras.', '🔒 We respect your privacy. Cancel anytime.'],
  ['Sigue leyendo', 'Keep reading'],
  ['Guía HYROX para principiantes', 'HYROX Beginners Guide'],
  ['Entrenar SkiErg y Remo', 'Train SkiErg & Row'],
  ['Zapatillas para HYROX', 'HYROX Shoes'],
  ['Estiramientos después de correr', 'Stretching After Running'],

  // Newsletter source
  ["source: 'blog-rodillo-vs-pistola-masaje-recuperacion'", "source: 'blog-en-foam-roller-vs-massage-gun'"],
  ["lang: 'es'", "lang: 'en'"],

  // Cookie
  ['Usamos cookies propias y de análisis para mejorar tu experiencia.', 'We use our own and analytics cookies to improve your experience.'],
  ['<a href="/legal/cookies.html">Más info</a>', '<a href="/legal/cookies.html">More info</a>'],
  ['>Rechazar</button>', '>Reject</button>'],
  ['>Aceptar</button>', '>Accept</button>'],

  // Footer
  ['La comunidad de running más activa de España. Corre acompañado, mejora juntos.', 'The most active running community in Spain. Run together, improve together.'],
  ['class="footer-heading">Explora</div>', 'class="footer-heading">Explore</div>'],
  ['>Ciudades</a>', '>Cities</a>'],
  ['class="footer-heading">Empresa</div>', 'class="footer-heading">Company</div>'],
  ['>Sobre Nosotros</a>', '>About Us</a>'],
  ['>Inversores</a>', '>Investors</a>'],
  ['>Contacto</a>', '>Contact</a>'],
  ['>Patrocinadores</a>', '>Sponsors</a>'],
  ['class="footer-heading">Legal</div>', 'class="footer-heading">Legal</div>'],
  ['>Política de Privacidad</a>', '>Privacy Policy</a>'],
  ['>Términos de Uso</a>', '>Terms of Use</a>'],
  ['>Política de Cookies</a>', '>Cookie Policy</a>'],
  ['Todos los derechos reservados. Hecho con amor para runners.', 'All rights reserved. Made with love for runners.'],

  // Author box
  ['Periodista deportivo y corredor popular con más de 10 años de experiencia. Especializado en análisis de zapatillas, relojes GPS, nutrición deportiva y todo lo que un runner necesita para mejorar.', 'Sports journalist and recreational runner with over 10 years of experience. Specialized in shoe reviews, GPS watches, sports nutrition and everything a runner needs to improve.'],

  // Mid CTA
  ['Encuentra tu <a href="/blog/beneficios-correr-en-grupo" style="color:#f97316">correr en grupo</a>', 'Find your <a href="/blog/en/benefits-running-in-group" style="color:#f97316">running group</a>'],
  ['5.000+ runners ya entrenan juntos. Gratis en iOS.', '5,000+ runners already train together. Free on iOS.'],

  // Hreflang - add EN
  ['<link rel="alternate" hreflang="x-default" href="https://www.correrjuntos.com/blog/rodillo-vs-pistola-masaje-recuperacion">', '<link rel="alternate" hreflang="en" href="https://www.correrjuntos.com/blog/en/foam-roller-vs-massage-gun">\n<link rel="alternate" hreflang="x-default" href="https://www.correrjuntos.com/blog/rodillo-vs-pistola-masaje-recuperacion">'],
];

let count = 0;
for (const [from, to] of replacements) {
  if (html.includes(from)) {
    html = html.replace(from, to);
    count++;
  }
}

// Write EN file
const dest = path.join(__dirname, '..', 'blog', 'en', 'foam-roller-vs-massage-gun.html');
fs.writeFileSync(dest, html, 'utf8');
console.log(`Written: ${dest}`);
console.log(`Replacements applied: ${count}/${replacements.length}`);

// Check for remaining Spanish
const spanishPatterns = ['Ideal para:', 'Ver en Amazon', 'Suscribirme', 'Rechazar', 'Aceptar', 'Contenido de esta', 'Preguntas frecuentes', 'Tabla comparativa'];
const remaining = spanishPatterns.filter(p => html.includes(p));
if (remaining.length) {
  console.log('WARNING: Remaining Spanish text:', remaining.join(', '));
} else {
  console.log('OK: No remaining Spanish patterns detected');
}
