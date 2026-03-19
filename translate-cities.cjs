/**
 * Translate 3 city running group articles ES -> EN
 * Bilbao, Malaga, Zaragoza
 */
const fs = require('fs');
const path = require('path');

const BASE = __dirname;

const articles = [
  {
    esFile: 'blog/grupos-running-bilbao.html',
    enFile: 'blog/en/running-groups-bilbao.html',
    esSlug: 'grupos-running-bilbao',
    enSlug: 'running-groups-bilbao',
    city: 'Bilbao',
    region: 'the Basque Country',
    // Specific translations map for this article
    translations: {
      // Title & meta
      'Grupos de Running en Bilbao 2026: Clubes, Quedadas y Rutas': 'Running Groups in Bilbao 2026: Clubs, Meetups and Routes',
      'Los mejores grupos de running en Bilbao 2026. Clubes, quedadas gratuitas y rutas por la R&iacute;a, Artxanda, Do&ntilde;a Casilda y Getxo. Corre acompa&ntilde;ado en Euskadi.': 'The best running groups in Bilbao 2026. Clubs, free meetups and routes along the R&iacute;a, Artxanda, Do&ntilde;a Casilda and Getxo. Run with company in the Basque Country.',
      'Los mejores grupos de running en Bilbao: clubes, quedadas gratuitas y rutas por la R&iacute;a, Artxanda, Do&ntilde;a Casilda y Getxo. Corre acompa&ntilde;ado en Euskadi.': 'The best running groups in Bilbao: clubs, free meetups and routes along the R&iacute;a, Artxanda, Do&ntilde;a Casilda and Getxo. Run with company in the Basque Country.',
      'grupos running bilbao, clubes running bilbao, quedadas correr bilbao, running bilbao euskadi': 'running groups Bilbao, Bilbao running clubs, running meetups Bilbao, running Bilbao Basque Country',
      'Los mejores grupos de running en Bilbao 2026. Clubes, quedadas gratuitas y rutas por la Ría, Artxanda, Doña Casilda y Getxo.': 'The best running groups in Bilbao 2026. Clubs, free meetups and routes along the Ría, Artxanda, Doña Casilda and Getxo.',
    }
  },
  {
    esFile: 'blog/grupos-running-malaga.html',
    enFile: 'blog/en/running-groups-malaga.html',
    esSlug: 'grupos-running-malaga',
    enSlug: 'running-groups-malaga',
    city: 'M&aacute;laga',
    cityClean: 'Málaga',
    region: 'the Costa del Sol',
    translations: {
      'Grupos de Running en M&aacute;laga 2026: Clubes y Quedadas': 'Running Groups in M&aacute;laga 2026: Clubs and Meetups',
      'grupos running malaga, clubes running malaga, quedadas correr malaga, running malaga costa del sol': 'running groups Malaga, Malaga running clubs, running meetups Malaga, running Malaga Costa del Sol',
      'Grupos de Running en Málaga 2026: Clubes, Quedadas y Rutas Costeras': 'Running Groups in Málaga 2026: Clubs, Meetups and Coastal Routes',
      'Los mejores grupos de running en Málaga 2026. Clubes, quedadas gratuitas y rutas por el paseo marítimo, Montes de Málaga y el centro histórico.': 'The best running groups in Málaga 2026. Clubs, free meetups and routes along the seafront promenade, Montes de Málaga and the historic center.',
    }
  },
  {
    esFile: 'blog/grupos-running-zaragoza.html',
    enFile: 'blog/en/running-groups-zaragoza.html',
    esSlug: 'grupos-running-zaragoza',
    enSlug: 'running-groups-zaragoza',
    city: 'Zaragoza',
    region: 'Arag&oacute;n',
    translations: {
      'Grupos de Running en Zaragoza 2026: Clubes, Quedadas y Rutas': 'Running Groups in Zaragoza 2026: Clubs, Meetups and Routes',
      'grupos running zaragoza, clubes running zaragoza, quedadas correr zaragoza, running zaragoza ebro': 'running groups Zaragoza, Zaragoza running clubs, running meetups Zaragoza, running Zaragoza Ebro',
      'Los mejores grupos de running en Zaragoza 2026. Clubes, quedadas gratuitas y rutas por el Ebro, Parque Grande y Canal Imperial.': 'The best running groups in Zaragoza 2026. Clubs, free meetups and routes along the Ebro, Parque Grande and Canal Imperial.',
    }
  }
];

// Common ES->EN text replacements for all articles
const commonReplacements = [
  // HTML lang
  ['<html lang="es-ES">', '<html lang="en">'],
  // Meta/nav
  ['"es-ES"', '"en"'],
  ['Cambiar tema', 'Toggle theme'],
  ['Entrar</a>', 'Log in</a>'],
  ['>&Uacute;nete</a>', '>Join</a>'],

  // Nav
  ['Ciudades</a>', 'Cities</a>'],

  // Breadcrumb schema
  ['"name": "Inicio"', '"name": "Home"'],
  // Breadcrumb visible
  ['<a href="/">Inicio</a><span>/</span><a href="/blog/">Blog</a>', '<a href="/">Home</a><span>/</span><a href="/blog/en/">Blog</a>'],

  // TOC
  ['>Contenido</div>', '>Contents</div>'],

  // Share section
  ['>Compartir:</span>', '>Share:</span>'],
  ['Copiar link</a>', 'Copy link</a>'],
  ["b.textContent='&#10003; Copiado';setTimeout(function(){b.innerHTML='&#128203; Copiar link'}", "b.textContent='Copied!';setTimeout(function(){b.innerHTML='Copy link'}"],

  // Newsletter
  ['>Tips de running en tu email</h3>', '>Running tips in your inbox</h3>'],
  ['Recibe gu&iacute;as de entrenamiento, salud y consejos para correr mejor. Sin spam.', 'Training guides, health tips and advice to run better. No spam.'],
  ['placeholder="tu@email.com"', 'placeholder="your@email.com"'],
  ['aria-label="Tu email para la newsletter"', 'aria-label="Your email for the newsletter"'],
  ['>Suscribirme</button>', '>Subscribe</button>'],
  ["Bienvenido/a! Te avisaremos con los mejores tips.", "You're in! We'll send you the best running tips."],
  ['Error. Int&eacute;ntalo de nuevo.', 'Error. Please try again.'],
  ["lang: 'es'", "lang: 'en'"],
  ["Ya est\\u00e1s suscrito/a. Gracias!", "You are already subscribed. Thanks!"],
  ["btn.textContent = 'Suscribirme';", "btn.textContent = 'Subscribe';"],

  // Related
  ['>Sigue leyendo</div>', '>Keep reading</div>'],

  // Cookie Banner
  ['Usamos cookies propias y de an&aacute;lisis para mejorar tu experiencia. <a href="/legal/cookies.html">M&aacute;s info</a>', 'We use our own and analytics cookies to improve your experience. <a href="/legal/cookies.html">More info</a>'],
  ['>Rechazar</button>', '>Reject</button>'],
  ['>Aceptar</button>', '>Accept</button>'],

  // Footer
  ['La comunidad de running m&aacute;s activa de Espa&ntilde;a. Corre acompa&ntilde;ado, mejora juntos.', 'The most active running community in Spain. Run together, improve together.'],
  ['>Explora</div>', '>Explore</div>'],
  ['>Ciudades</a>', '>Cities</a>'],
  ['>Lugares</a>', '>Places</a>'],
  ['>Eventos</a>', '>Events</a>'],
  ['<a href="/blog/"', '<a href="/blog/en/"'],
  ['>Empresa</div>', '>Company</div>'],
  ['>Sobre Nosotros</a>', '>About Us</a>'],
  ['>Inversores</a>', '>Investors</a>'],
  ['>Contacto</a>', '>Contact</a>'],
  ['>Patrocinadores</a>', '>Sponsors</a>'],
  ['>Media Kit</a>', '>Media Kit</a>'],
  ['>Pol&iacute;tica de Privacidad</a>', '>Privacy Policy</a>'],
  ['>T&eacute;rminos de Uso</a>', '>Terms of Use</a>'],
  ['>Pol&iacute;tica de Cookies</a>', '>Cookie Policy</a>'],
  ['Todos los derechos reservados.', 'All rights reserved.'],

  // CTA box common
  ['&Uacute;nete a 5.000+ runners', 'Join 5,000+ runners'],

  // Author bio
  ['Periodista deportivo y corredor popular con más de 10 años de experiencia. Especializado en análisis de zapatillas, relojes GPS, nutrición deportiva y todo lo que un runner necesita para mejorar.', 'Sports journalist and recreational runner with over 10 years of experience. Specialized in running shoe analysis, GPS watches, sports nutrition and everything a runner needs to improve.'],
];

// Bilbao-specific content translations
const bilbaoContentReplacements = [
  // Hero
  ['Descubre los mejores clubes, quedadas gratuitas y rutas para correr acompa&ntilde;ado en Bilbao y Bizkaia: desde la R&iacute;a hasta la cima de Artxanda.', 'Discover the best clubs, free meetups and routes for running with company in Bilbao and Bizkaia: from the R&iacute;a to the top of Artxanda.'],
  ['<span class="category">Rutas</span> &middot; 4 marzo 2026 &middot; Por Carlos Ruiz &middot; 10 min lectura', '<span class="category">Routes</span> &middot; March 4, 2026 &middot; By Carlos Ruiz &middot; 10 min read'],

  // TOC entries
  ['Por qu&eacute; Bilbao es una gran ciudad para correr', 'Why Bilbao is a great city for running'],
  ['Las mejores rutas para correr en grupo en Bilbao', 'The best routes for group running in Bilbao'],
  ['Clubes de running y atletismo en Bilbao', 'Running and athletics clubs in Bilbao'],
  ['Quedadas gratuitas y running social', 'Free meetups and social running'],
  ['Parkrun en Bilbao', 'Parkrun in Bilbao'],
  ['Correr bajo la lluvia: el car&aacute;cter del runner vasco', 'Running in the rain: the Basque runner spirit'],
  ['Carreras populares en Bilbao y Bizkaia', 'Popular races in Bilbao and Bizkaia'],
  ['C&oacute;mo CorrerJuntos te ayuda a encontrar grupo en Bilbao', 'How CorrerJuntos helps you find a group in Bilbao'],
  ['Preguntas frecuentes', 'Frequently asked questions'],

  // Section headings (h2)
  ['>Por qu&eacute; Bilbao es una gran ciudad para correr</h2>', '>Why Bilbao is a great city for running</h2>'],
  ['>Las mejores rutas para correr en grupo en Bilbao</h2>', '>The best routes for group running in Bilbao</h2>'],
  ['>Clubes de running y atletismo en Bilbao</h2>', '>Running and athletics clubs in Bilbao</h2>'],
  ['>Quedadas gratuitas y running social</h2>', '>Free meetups and social running</h2>'],
  ['>Parkrun en Bilbao</h2>', '>Parkrun in Bilbao</h2>'],
  ['>Correr bajo la lluvia: el car&aacute;cter del runner vasco</h2>', '>Running in the rain: the Basque runner spirit</h2>'],
  ['>Carreras populares en Bilbao y Bizkaia</h2>', '>Popular races in Bilbao and Bizkaia</h2>'],
  ['>C&oacute;mo CorrerJuntos te ayuda a encontrar grupo en Bilbao</h2>', '>How CorrerJuntos helps you find a group in Bilbao</h2>'],
  ['>Preguntas frecuentes</h2>', '>Frequently asked questions</h2>'],

  // H3 subheadings
  ['>Paseo de la R&iacute;a (8 km ida y vuelta)</h3>', '>R&iacute;a Promenade (8 km round trip)</h3>'],
  ['>Subida a Artxanda (trail urbano)</h3>', '>Artxanda climb (urban trail)</h3>'],
  ['>Parque de Do&ntilde;a Casilda</h3>', '>Do&ntilde;a Casilda Park</h3>'],
  ['>Senda costera de Getxo (10 km)</h3>', '>Getxo coastal path (10 km)</h3>'],
  ['>Urkiola (trail)</h3>', '>Urkiola (trail)</h3>'],
  ['>Bilbao Runners</h3>', '>Bilbao Runners</h3>'],
  ['>Athletic Club Atletismo</h3>', '>Athletic Club Athletics</h3>'],
  ['>Bilbao Triathlon</h3>', '>Bilbao Triathlon</h3>'],
  ['>Artxanda Trail</h3>', '>Artxanda Trail</h3>'],
  ['>Otros clubes destacados</h3>', '>Other notable clubs</h3>'],

  // Paragraphs - intro
  ['Bilbao tiene algo que engancha a los corredores. Puede que sea la mezcla de ciudad compacta y naturaleza salvaje a solo diez minutos de cualquier barrio. O el reflejo del Guggenheim en la R&iacute;a mientras haces tu tirada matutina. O quiz&aacute; esa actitud vasca de que la lluvia no es excusa, sino parte del paisaje. Si est&aacute;s buscando grupos de running en Bilbao, has llegado al sitio correcto: la capital vizcaina tiene una comunidad runner en plena expansi&oacute;n, con opciones para todos los niveles y gustos (<a href="https://www.worldathletics.org/" target="_blank" rel="noopener" style="color:#f97316">World Athletics</a>).', 'Bilbao has something that hooks runners. It might be the mix of compact city and wild nature just ten minutes from any neighborhood. Or the Guggenheim reflected in the R&iacute;a during your morning long run. Or perhaps that Basque attitude that rain is not an excuse but part of the landscape. If you are looking for running groups in Bilbao, you have come to the right place: the Biscayan capital has a thriving running community with options for all levels and preferences (<a href="https://www.worldathletics.org/" target="_blank" rel="noopener" style="color:#f97316">World Athletics</a>).'],

  ['Da igual si acabas de calzarte tus primeras zapatillas o si llevas a&ntilde;os acumulando dorsales. Bilbao ofrece desde clubes federados con entrenadores de primer nivel hasta quedadas informales por la R&iacute;a donde lo que importa es disfrutar. En esta gu&iacute;a te cuento todo lo que necesitas para <a href="/blog/encontrar-gente-para-correr" style="color:#f97316">encontrar gente para correr</a> en Bilbao y convertirte en parte de esta comunidad que no para de crecer (<a href="https://www.acsm.org/" target="_blank" rel="noopener" style="color:#f97316">ACSM</a>).', 'Whether you have just laced up your first pair of running shoes or have been collecting race bibs for years, Bilbao offers everything from federated clubs with top-level coaches to informal meetups along the R&iacute;a where the only thing that matters is having fun. In this guide we cover everything you need to <a href="/blog/en/find-people-to-run-with" style="color:#f97316">find people to run with</a> in Bilbao and become part of this ever-growing community (<a href="https://www.acsm.org/" target="_blank" rel="noopener" style="color:#f97316">ACSM</a>).'],

  ['Porque los <a href="/blog/beneficios-correr-en-grupo" style="color:#f97316">beneficios de correr en grupo</a> van mucho m&aacute;s all&aacute; de la motivaci&oacute;n: est&aacute; demostrado que entrenar con otros mejora la constancia, reduce el riesgo de lesiones y hace que cada kil&oacute;metro pese menos. Y en una ciudad con el car&aacute;cter de Bilbao, correr acompa&ntilde;ado se convierte en toda una experiencia (<a href="https://www.who.int/news-room/fact-sheets/detail/physical-activity" target="_blank" rel="noopener" style="color:#f97316">OMS</a>).', 'The <a href="/blog/en/benefits-of-group-running" style="color:#f97316">benefits of group running</a> go far beyond motivation: research shows that training with others improves consistency, reduces injury risk and makes every kilometer feel lighter. And in a city with the character of Bilbao, running with company becomes a truly special experience (<a href="https://www.who.int/news-room/fact-sheets/detail/physical-activity" target="_blank" rel="noopener" style="color:#f97316">WHO</a>).'],

  // Section: Why Bilbao
  ['Bilbao se ha transformado radicalmente en las &uacute;ltimas d&eacute;cadas. La ciudad que fue sin&oacute;nimo de industria pesada hoy es un referente de urbanismo, cultura y calidad de vida. Y esa transformaci&oacute;n tambi&eacute;n ha llegado al running. Los paseos junto a la R&iacute;a, los parques urbanos renovados y la conexi&oacute;n directa con los montes circundantes convierten a Bilbao en un lugar privilegiado para correr.', 'Bilbao has undergone a radical transformation in recent decades. The city once synonymous with heavy industry is now a benchmark for urban planning, culture and quality of life. That transformation has also reached the running scene. The promenades along the R&iacute;a, the renovated urban parks and the direct connection to the surrounding mountains make Bilbao a privileged place for running.'],

  ['El clima atl&aacute;ntico, aunque temido por los de fuera, es en realidad un aliado del corredor. Las temperaturas son suaves durante todo el a&ntilde;o, oscilando entre los 10&deg;C en invierno y los 25&deg;C en verano. Nada de los 40 grados extremos de otras ciudades espa&ntilde;olas. S&iacute;, llueve con frecuencia, pero eso mantiene los montes verdes, el aire limpio y las temperaturas agradables para entrenar en cualquier &eacute;poca del a&ntilde;o.', 'The Atlantic climate, though feared by outsiders, is actually a runner\'s ally. Temperatures are mild year-round, ranging from 10&deg;C in winter to 25&deg;C in summer. None of the extreme 40-degree heat found in other Spanish cities. Yes, it rains frequently, but that keeps the mountains green, the air clean and the temperatures pleasant for training at any time of year.'],

  ['La geograf&iacute;a de Bilbao es otro factor diferencial. En pocos minutos puedes pasar de correr por un paseo urbano completamente llano junto a la R&iacute;a a subir un monte con desniveles serios y senderos de trail. Esa versatilidad permite entrenar todo tipo de sesiones sin salir del &aacute;rea metropolitana: series en llano, tiradas largas por la costa de Getxo, subidas a Artxanda o trail puro en Pagasarri.', 'The geography of Bilbao is another differentiating factor. In just a few minutes you can go from running along a completely flat urban promenade by the R&iacute;a to climbing a mountain with serious elevation gain and trail paths. This versatility allows you to train all types of sessions without leaving the metropolitan area: flat intervals, long runs along the Getxo coast, Artxanda hill climbs or pure trail running on Pagasarri.'],

  ['Adem&aacute;s, Bilbao es una ciudad compacta con un excelente transporte p&uacute;blico. El metro te lleva en minutos desde cualquier barrio al punto de encuentro de tu grupo de running, lo que elimina una de las grandes excusas para no entrenar: el desplazamiento. Muchos grupos quedan en puntos accesibles en metro como Moyua, Do&ntilde;a Casilda o Abandoibarra.', 'Furthermore, Bilbao is a compact city with excellent public transport. The metro takes you in minutes from any neighborhood to your running group\'s meeting point, eliminating one of the biggest excuses not to train: the commute. Many groups meet at metro-accessible spots like Moyua, Do&ntilde;a Casilda or Abandoibarra.'],

  // Routes section paragraphs
  ['Bilbao y su entorno ofrecen una variedad de rutas que pocos pueden igualar. Desde paseos urbanos junto al agua hasta senderos de monta&ntilde;a con vistas al Cant&aacute;brico, aqu&iacute; tienes las favoritas de los grupos de running bilba&iacute;nos:', 'Bilbao and its surroundings offer a variety of routes that few cities can match. From urban promenades along the water to mountain trails with views of the Cantabrian Sea, here are the favorites of Bilbao running groups:'],

  ['La R&iacute;a del Nervi&oacute;n es el eje vertebrador del running en Bilbao. El paseo que recorre ambas orillas desde el Casco Viejo hasta Abandoibarra y m&aacute;s all&aacute; es el circuito favorito de la mayor&iacute;a de grupos. El recorrido est&aacute;ndar de ida y vuelta suma unos 8 kil&oacute;metros completamente llanos, con el agua siempre a tu lado, el Guggenheim como punto intermedio y los puentes ic&oacute;nicos marcando el ritmo.', 'The Nervi&oacute;n R&iacute;a is the backbone of running in Bilbao. The promenade that runs along both banks from the Casco Viejo to Abandoibarra and beyond is the favorite circuit of most groups. The standard round trip covers about 8 completely flat kilometers, with the water always by your side, the Guggenheim as a midpoint and the iconic bridges marking the pace.'],

  ['Por las tardes, especialmente entre semana, la R&iacute;a se llena de corredores. Es habitual cruzarte con grupos de 10 o 15 personas entrenando juntos. La superficie es asfalto y baldosa en buen estado, con buena iluminaci&oacute;n para correr de noche en invierno. Si alargas el recorrido hacia Deusto o Zorrotzaurre, puedes sumar f&aacute;cilmente hasta 12-14 km.', 'In the afternoons, especially on weekdays, the R&iacute;a fills up with runners. It is common to cross paths with groups of 10 or 15 people training together. The surface is well-maintained asphalt and pavement, with good lighting for night running in winter. If you extend the route toward Deusto or Zorrotzaurre, you can easily add up to 12-14 km.'],

  ['Artxanda es el monte que vigila Bilbao desde el norte. La subida desde el centro es un cl&aacute;sico del running bilba&iacute;no: entre 3 y 4 km de ascensi&oacute;n con un desnivel de unos 250 metros, combinando tramos de asfalto, pista forestal y sendero. Al llegar arriba, las vistas panor&aacute;micas de toda la villa y la R&iacute;a son la mejor recompensa.', 'Artxanda is the mountain that watches over Bilbao from the north. The climb from the city center is a classic of Bilbao running: 3 to 4 km of ascent with about 250 meters of elevation gain, combining stretches of asphalt, forest track and trail. At the top, the panoramic views of the entire city and the R&iacute;a are the best reward.'],

  ['Muchos grupos de trail utilizan Artxanda como entrenamiento de desnivel entre semana. Hay varias rutas para subir (por Casta&ntilde;os, por Zabalbide, por el funicular), lo que permite variar y no aburrirse nunca. La bajada se puede hacer por el mismo camino o enlazar con senderos que llevan hasta Enekuri o el monte Avril.', 'Many trail groups use Artxanda for elevation training during the week. There are several routes up (via Casta&ntilde;os, via Zabalbide, via the funicular), which allows you to vary and never get bored. The descent can be done along the same path or linked with trails leading to Enekuri or Mount Avril.'],

  ['El pulm&oacute;n verde del centro de Bilbao es el punto de encuentro favorito de muchos grupos. El circuito perimetral del parque tiene aproximadamente 1.5 km, perfecto para hacer series, intervalos o calentamientos antes de salir a la R&iacute;a. Los caminos son anchos, la superficie es firme y hay suficiente sombra bajo los &aacute;rboles centenarios.', 'The green lung of central Bilbao is the favorite meeting point for many groups. The park\'s perimeter circuit is approximately 1.5 km, perfect for intervals, repeats or warm-ups before heading out to the R&iacute;a. The paths are wide, the surface is firm and there is plenty of shade under the century-old trees.'],

  ['Do&ntilde;a Casilda es especialmente popular los s&aacute;bados por la ma&ntilde;ana, cuando varios grupos coinciden all&iacute; para sus sesiones. La proximidad al Museo de Bellas Artes y a las cafeter&iacute;as de Indautxu hace que el tercer tiempo post-entrenamiento est&eacute; siempre garantizado.', 'Do&ntilde;a Casilda is especially popular on Saturday mornings, when several groups converge there for their sessions. The proximity to the Museum of Fine Arts and the cafes of Indautxu means the post-workout socializing is always guaranteed.'],

  ['A solo 20 minutos en metro desde Bilbao, la senda litoral de Getxo es una de las rutas m&aacute;s espectaculares de todo el norte de Espa&ntilde;a. Desde el Puente Colgante (Patrimonio de la Humanidad) hasta la Playa de Gorrondatxe, el recorrido alterna acantilados, playas, paseos mar&iacute;timos y tramos de sendero con el Cant&aacute;brico siempre presente. Unos 10 km que se hacen cortos por la belleza del paisaje.', 'Just 20 minutes by metro from Bilbao, the Getxo coastal path is one of the most spectacular routes in all of northern Spain. From the Puente Colgante (UNESCO World Heritage Site) to Gorrondatxe Beach, the route alternates between cliffs, beaches, seafront promenades and trail sections with the Cantabrian Sea ever-present. About 10 km that feel short thanks to the beauty of the scenery.'],

  ['Los fines de semana, muchos grupos de Bilbao se desplazan a Getxo para sus tiradas largas. La brisa marina, la ausencia de coches y las vistas al mar abierto hacen que esta ruta sea terapia pura para el corredor.', 'On weekends, many Bilbao groups head to Getxo for their long runs. The sea breeze, the absence of cars and the open ocean views make this route pure therapy for the runner.'],

  ['Para los amantes del trail running, el Parque Natural de Urkiola es el para&iacute;so. A unos 40 minutos en coche desde Bilbao, ofrece senderos se&ntilde;alizados de todos los niveles, desde rutas suaves entre hayedos hasta ascensiones t&eacute;cnicas al Anboto (1.331 m). Varios clubes de Bilbao organizan salidas mensuales a Urkiola, y es el terreno de juego habitual para los que preparan carreras de monta&ntilde;a.', 'For trail running lovers, the Urkiola Natural Park is paradise. About 40 minutes by car from Bilbao, it offers signposted trails of all levels, from gentle routes through beech forests to technical ascents of Anboto (1,331 m). Several Bilbao clubs organize monthly outings to Urkiola, and it is the regular playground for those preparing for mountain races.'],

  // CTA mid
  ['Encuentra quedadas de running en Bilbao', 'Find running meetups in Bilbao'],
  ['Conecta con corredores de tu zona y nivel. Prueba el matching de CorrerJuntos.', 'Connect with runners in your area and level. Try CorrerJuntos matching.'],
  ['Encontrar runners', 'Find runners'],

  // Clubs section
  ['Bilbao tiene una tradici&oacute;n atl&eacute;tica profunda, ligada al deporte vasco y a una cultura de esfuerzo y superaci&oacute;n. Hoy conviven clubes hist&oacute;ricos con grupos m&aacute;s j&oacute;venes que han surgido con el boom del running social. Si quieres <a href="/blog/unirse-grupo-running" style="color:#f97316">unirte a un grupo de running</a>, estas son las opciones m&aacute;s destacadas:', 'Bilbao has a deep athletic tradition, linked to Basque sport and a culture of effort and self-improvement. Today, historic clubs coexist with younger groups that have emerged with the social running boom. If you want to <a href="/blog/en/how-to-join-a-running-group" style="color:#f97316">join a running group</a>, these are the most notable options:'],

  ['El grupo de running social m&aacute;s activo de la villa. Bilbao Runners organiza quedadas semanales abiertas a todos los niveles, con subgrupos por ritmo para que nadie se quede atr&aacute;s ni nadie se aburra. Sus rutas habituales recorren la R&iacute;a, Do&ntilde;a Casilda y los barrios del ensanche. La filosof&iacute;a es clara: correr tiene que ser divertido y social. Despu&eacute;s de cada entrenamiento hay pintxos y zurito, que en Bilbao es ley no escrita.', 'The most active social running group in the city. Bilbao Runners organizes weekly meetups open to all levels, with sub-groups by pace so nobody gets left behind and nobody gets bored. Their usual routes cover the R&iacute;a, Do&ntilde;a Casilda and the Ensanche neighborhoods. The philosophy is clear: running should be fun and social. After every session there are pintxos and zurito (a small local beer), which in Bilbao is an unwritten law.'],

  ['La secci&oacute;n de atletismo del club m&aacute;s emblem&aacute;tico de Bilbao. Aunque el Athletic es conocido por el f&uacute;tbol, su secci&oacute;n atl&eacute;tica tiene d&eacute;cadas de historia y ha formado corredores de alto nivel. Cuentan con entrenadores titulados, acceso a pista de atletismo, planes de entrenamiento personalizados y un sentimiento de pertenencia que solo un club con la historia del Athletic puede ofrecer. La cuota incluye licencia federativa y participaci&oacute;n en competiciones auton&oacute;micas y nacionales.', 'The athletics section of Bilbao\'s most iconic club. Although Athletic is known for football, its athletics section has decades of history and has trained high-level runners. They have certified coaches, track access, personalized training plans and a sense of belonging that only a club with Athletic\'s history can offer. The membership fee includes a federation license and participation in regional and national competitions.'],

  ['Aunque su nombre sugiere triatl&oacute;n, Bilbao Triathlon tiene una secci&oacute;n de running muy potente. Los que solo quieren correr encuentran aqu&iacute; un grupo exigente pero amable, con entrenamientos estructurados que combinan <a href="/blog/entrenamiento-series-fartlek" style="color:#f97316">series y fartlek</a>, tiradas largas y sesiones de fuerza. Suelen entrenar en la zona de Abandoibarra y la R&iacute;a, y organizan salidas de trail los fines de semana. Ideal para corredores de nivel intermedio y avanzado que quieren mejorar con m&eacute;todo.', 'Despite its name suggesting triathlon, Bilbao Triathlon has a very strong running section. Those who only want to run find here a demanding but friendly group, with structured workouts combining <a href="/blog/en/interval-training-fartlek" style="color:#f97316">intervals and fartlek</a>, long runs and strength sessions. They usually train in the Abandoibarra area and the R&iacute;a, and organize trail outings on weekends. Ideal for intermediate and advanced runners who want to improve with method.'],

  ['Para los que necesitan monta&ntilde;a para sentirse vivos, Artxanda Trail es el grupo de referencia en Bilbao. Especializados en trail running y carreras de monta&ntilde;a, sus entrenamientos combinan subidas a Artxanda, Pagasarri, Ganekogorta y salidas m&aacute;s largas a Urkiola, Gorbea y la costa vizcaina. Organizan preparaci&oacute;n espec&iacute;fica para carreras de monta&ntilde;a y son una comunidad muy unida con esp&iacute;ritu monta&ntilde;ero aut&eacute;ntico.', 'For those who need mountains to feel alive, Artxanda Trail is the go-to group in Bilbao. Specializing in trail running and mountain races, their workouts combine climbs up Artxanda, Pagasarri, Ganekogorta and longer outings to Urkiola, Gorbea and the Biscayan coast. They organize specific mountain race preparation and are a tight-knit community with an authentic mountain spirit.'],

  // Club list items
  ['<strong>Bilbao Atletismo:</strong> Club federado con secciones de fondo, medio fondo y pista. Entrenan en las instalaciones de La Casilla y organizan competiciones locales.', '<strong>Bilbao Atletismo:</strong> Federated club with distance, middle distance and track sections. They train at the La Casilla facilities and organize local competitions.'],
  ['<strong>Durango Kirol Taldea:</strong> Basado en el cercano Durango, combina atletismo y trail. Muy activo en el circuito vasco de carreras de monta&ntilde;a.', '<strong>Durango Kirol Taldea:</strong> Based in nearby Durango, combining athletics and trail. Very active in the Basque mountain racing circuit.'],
  ['<strong>Emakumeak Korrika:</strong> Grupo femenino de running en Bilbao que organiza quedadas en un ambiente seguro y empoderador. Han crecido notablemente y su comunidad es cada vez m&aacute;s fuerte.', '<strong>Emakumeak Korrika:</strong> Women\'s running group in Bilbao that organizes meetups in a safe and empowering environment. They have grown notably and their community is increasingly strong.'],
  ['<strong>Basque Trail Running:</strong> Colectivo que organiza salidas de trail por los montes de Bizkaia, Gipuzkoa y Araba. Perfecto para conocer senderos nuevos cada semana.', '<strong>Basque Trail Running:</strong> A collective that organizes trail outings through the mountains of Bizkaia, Gipuzkoa and Araba. Perfect for discovering new trails every week.'],

  // Tip
  ['<strong>Tip local:</strong> En Bilbao, el tercer tiempo despu&eacute;s de entrenar es sagrado. Un zurito (ca&ntilde;a peque&ntilde;a) y un pintxo en un bar del Casco Viejo o de Indautxu es la manera perfecta de cerrar cualquier sesi&oacute;n. Si te unes a un grupo y te vas directamente despu&eacute;s de correr, te perder&aacute;s la mitad de la experiencia.', '<strong>Local tip:</strong> In Bilbao, the post-run socializing is sacred. A zurito (small beer) and a pintxo in a bar in the Casco Viejo or Indautxu is the perfect way to end any session. If you join a group and leave right after running, you will miss half the experience.'],

  // Quedadas section
  ['M&aacute;s all&aacute; de los clubes con estructura formal, Bilbao tiene un ecosistema vibrante de quedadas informales y gratuitas. Las redes sociales y apps como CorrerJuntos han facilitado que cualquier corredor pueda organizar o unirse a un entrenamiento sin compromiso ni cuotas.', 'Beyond the formally structured clubs, Bilbao has a vibrant ecosystem of informal and free meetups. Social media and apps like CorrerJuntos have made it easy for any runner to organize or join a workout with no commitment or fees.'],

  ['En Instagram, hashtags como #RunningBilbao, #BilbaoRunners o #CorrerEnBilbao agrupan perfiles de grupos que publican sus quedadas cada semana. Muchos nacieron como grupos de amigos que fueron creciendo y hoy re&uacute;nen a decenas de personas en cada salida. La barrera de entrada es cero: llegas, te presentas y corres. As&iacute; de sencillo.', 'On Instagram, hashtags like #RunningBilbao, #BilbaoRunners or #CorrerEnBilbao group profiles of groups that post their meetups every week. Many started as groups of friends that kept growing and now bring together dozens of people at each outing. The barrier to entry is zero: show up, introduce yourself and run. It is that simple.'],

  ['Las tiendas de running de Bilbao tambi&eacute;n se han sumado a la tendencia. Establecimientos como Forum Sport y tiendas especializadas del centro organizan salidas gratuitas semanales. Suelen incluir calentamiento guiado, un recorrido de 5-8 km y vuelta a la tienda con peque&ntilde;as promociones. Es una forma excelente de probar zapatillas nuevas en condiciones reales y conocer gente.', 'Bilbao\'s running stores have also joined the trend. Shops like Forum Sport and specialized stores in the center organize free weekly runs. They usually include a guided warm-up, a 5-8 km route and return to the store with small promotions. It is an excellent way to test new shoes in real conditions and meet people.'],

  ['Si eres de los que prefieren tener la informaci&oacute;n centralizada y no andar buscando en decenas de perfiles, <a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" target="_blank" rel="noopener" style="color:#f97316">CorrerJuntos</a> te muestra todas las quedadas activas en tu zona de Bilbao, filtradas por nivel, horario y tipo de entrenamiento. As&iacute; no te pierdes ninguna y puedes apuntarte con un solo toque.', 'If you prefer having all information centralized rather than searching through dozens of profiles, <a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" target="_blank" rel="noopener" style="color:#f97316">CorrerJuntos</a> shows you all active meetups in your area of Bilbao, filtered by level, schedule and type of workout. That way you never miss one and can sign up with a single tap.'],

  // Parkrun section
  ['Si conoces <a href="https://www.parkrun.es/" target="_blank" rel="noopener" style="color:#f97316">parkrun</a>, sabr&aacute;s que es uno de los movimientos m&aacute;s inclusivos del running mundial: carreras gratuitas de 5 km cada s&aacute;bado a las 9:00 en parques de todo el planeta. A d&iacute;a de hoy, Bilbao no cuenta con un parkrun oficial establecido, aunque hay iniciativas en marcha para organizar uno en el Parque de Etxebarria, un enclave con vistas privilegiadas de la ciudad y terreno ideal para un circuito de 5K.', 'If you know <a href="https://www.parkrun.es/" target="_blank" rel="noopener" style="color:#f97316">parkrun</a>, you will know it is one of the most inclusive movements in world running: free 5 km runs every Saturday at 9:00 AM in parks all over the planet. As of today, Bilbao does not have an official established parkrun, although there are initiatives underway to organize one at Etxebarria Park, a spot with privileged views of the city and ideal terrain for a 5K circuit.'],

  ['Mientras el parkrun oficial llega, la comunidad runner de Bilbao ya ha creado alternativas con el mismo esp&iacute;ritu. Varios grupos organizan carreras informales de 5 km cronometradas los s&aacute;bados por la ma&ntilde;ana, normalmente en Do&ntilde;a Casilda o en la R&iacute;a. El formato es similar: gratuito, sin inscripci&oacute;n previa, abierto a todos los niveles y con desayuno posterior.', 'While the official parkrun arrives, the Bilbao running community has already created alternatives with the same spirit. Several groups organize informal timed 5 km runs on Saturday mornings, usually at Do&ntilde;a Casilda or the R&iacute;a. The format is similar: free, no pre-registration, open to all levels and with breakfast afterwards.'],

  ['Si vienes de una ciudad con parkrun y lo echas de menos, busca estas quedadas sabatinas en CorrerJuntos o en redes sociales. La filosof&iacute;a es la misma: correr juntos, sin presi&oacute;n, cada s&aacute;bado. Y si tienes ganas de montar el parkrun oficial en Bilbao, en parkrun.es explican c&oacute;mo organizar uno nuevo. Ser&iacute;a un gran regalo para la comunidad runner de la villa.', 'If you come from a city with parkrun and miss it, look for these Saturday meetups on CorrerJuntos or social media. The philosophy is the same: run together, no pressure, every Saturday. And if you feel like setting up the official parkrun in Bilbao, parkrun.es explains how to organize a new one. It would be a great gift for the city\'s running community.'],

  // Climate section
  ['Hay un dicho entre los corredores de Bilbao: el que espera a que deje de llover para salir a correr, no corre nunca. El clima atl&aacute;ntico de Euskadi trae precipitaciones frecuentes, especialmente entre octubre y abril, pero eso no frena a nadie. De hecho, correr bajo el sirimiri (esa lluvia fina y persistente tan vasca) se convierte en algo casi meditativo cuando te acostumbras.', 'There is a saying among Bilbao runners: whoever waits for the rain to stop before going for a run never runs at all. The Atlantic climate of the Basque Country brings frequent rainfall, especially between October and April, but that does not stop anyone. In fact, running in the sirimiri (that fine, persistent Basque drizzle) becomes almost meditative once you get used to it.'],

  ['La gran ventaja del clima bilba&iacute;no es la estabilidad t&eacute;rmica. Las temperaturas raramente bajan de 5&deg;C en invierno y rara vez superan los 28&deg;C en verano. Eso significa que puedes correr c&oacute;modamente todo el a&ntilde;o sin los extremos de calor del sur o de fr&iacute;o del interior. Para un corredor, es un lujo.', 'The great advantage of Bilbao\'s climate is thermal stability. Temperatures rarely drop below 5&deg;C in winter and rarely exceed 28&deg;C in summer. This means you can run comfortably all year round without the extreme heat of the south or the cold of the interior. For a runner, it is a luxury.'],

  ['Equipamiento esencial para correr en Bilbao:', 'Essential gear for running in Bilbao:'],

  ['<strong>Cortavientos impermeable y transpirable:</strong> La prenda m&aacute;s importante del runner vasco. Una buena membrana que repela el agua sin hacerte sudar es la inversi&oacute;n m&aacute;s inteligente que puedes hacer.', '<strong>Waterproof and breathable windbreaker:</strong> The most important garment for the Basque runner. A good membrane that repels water without making you sweat is the smartest investment you can make.'],
  ['<strong>Zapatillas con buen agarre:</strong> Las aceras mojadas y los senderos h&uacute;medos de Artxanda piden suelas con tracci&oacute;n. Evita modelos con suela lisa para entrenamientos bajo lluvia.', '<strong>Shoes with good grip:</strong> The wet sidewalks and damp trails of Artxanda call for soles with traction. Avoid models with smooth soles for training in the rain.'],
  ['<strong>Gorra con visera:</strong> M&aacute;s que para el sol, para mantener las gotas fuera de los ojos. Parece un detalle menor, pero marca una diferencia enorme en comodidad.', '<strong>Cap with visor:</strong> More for keeping raindrops out of your eyes than for sun protection. It seems like a small detail, but it makes a huge difference in comfort.'],
  ['<strong>Mallas o pantalones t&eacute;cnicos:</strong> El algod&oacute;n mojado pesa y roza. La ropa t&eacute;cnica seca r&aacute;pido y te mantiene c&oacute;modo incluso empapado.', '<strong>Technical tights or pants:</strong> Wet cotton is heavy and chafes. Technical gear dries quickly and keeps you comfortable even when soaked.'],
  ['<strong>Calcetines de lana merina:</strong> La lana merina mantiene los pies calientes aunque est&eacute;n mojados. Son el secreto mejor guardado de los runners que entrenan bajo lluvia.', '<strong>Merino wool socks:</strong> Merino wool keeps your feet warm even when wet. They are the best-kept secret of runners who train in the rain.'],

  ['<strong>Tip de supervivencia:</strong> Los d&iacute;as de lluvia intensa, muchos grupos de Bilbao siguen quedando igualmente. El truco es aceptar que te vas a mojar, abrazarlo y disfrutar del hecho de que el parque o la R&iacute;a estar&aacute;n casi vac&iacute;os para vosotros. Los mejores entrenamientos a veces son los m&aacute;s mojados, y las ca&ntilde;as de despu&eacute;s saben mejor.', '<strong>Survival tip:</strong> On heavy rain days, many Bilbao groups still meet up regardless. The trick is to accept that you will get wet, embrace it and enjoy the fact that the park or the R&iacute;a will be almost empty just for you. The best workouts are sometimes the wettest ones, and the beers afterwards taste even better.'],

  // CTA mid 2
  ['Descarga CorrerJuntos y corre acompa&ntilde;ado en Bilbao', 'Download CorrerJuntos and run with company in Bilbao'],
  ['Encuentra corredores de tu nivel cerca de ti. Gratis en App Store.', 'Find runners at your level near you. Free on the App Store.'],
  ['Descargar app', 'Download app'],

  // Races section
  ['El calendario de carreras populares en Bilbao y Bizkaia es ambicioso y variado. Desde grandes maratones internacionales hasta carreras de barrio con sabor local, hay opciones para cada fin de semana del a&ntilde;o. Participar con tu grupo de running convierte cada carrera en una experiencia compartida que refuerza los lazos del equipo.', 'The calendar of popular races in Bilbao and Bizkaia is ambitious and varied. From major international marathons to neighborhood races with local flavor, there are options for every weekend of the year. Racing with your running group turns each event into a shared experience that strengthens team bonds.'],

  ['Las citas imprescindibles incluyen:', 'The must-attend events include:'],

  ['<strong>EDP Bilbao Bizkaia Marathon (octubre/noviembre):</strong> La gran cita del running bilba&iacute;no. El recorrido pasa por el Guggenheim, la R&iacute;a, el Casco Viejo y la costa de Getxo. Ambiente espectacular con miles de participantes y p&uacute;blico animando en cada kil&oacute;metro.', '<strong>EDP Bilbao Bizkaia Marathon (October/November):</strong> The big event of Bilbao running. The course passes by the Guggenheim, the R&iacute;a, the Casco Viejo and the Getxo coast. Spectacular atmosphere with thousands of participants and crowds cheering at every kilometer.'],
  ['<strong>Bilbao Night Marathon (junio):</strong> Una propuesta &uacute;nica: correr una marat&oacute;n (o media) al atardecer y bajo las luces de la ciudad. Ambiente festivo y temperaturas perfectas para una noche m&aacute;gica de running.', '<strong>Bilbao Night Marathon (June):</strong> A unique proposition: running a marathon (or half) at sunset and under the city lights. Festive atmosphere and perfect temperatures for a magical night of running.'],
  ['<strong>Medio Marat&oacute;n de Bilbao:</strong> El formato perfecto para los que quieren un reto serio sin el compromiso de una marat&oacute;n completa. Recorrido urbano que combina la R&iacute;a con los barrios m&aacute;s emblem&aacute;ticos.', '<strong>Bilbao Half Marathon:</strong> The perfect format for those who want a serious challenge without the commitment of a full marathon. An urban course combining the R&iacute;a with the most iconic neighborhoods.'],
  ['<strong>Bilbao Herri Krosa (cross popular):</strong> Los cross populares tienen mucha tradici&oacute;n en Euskadi. En Bilbao se celebran varias pruebas de campo a trav&eacute;s a lo largo del invierno, con categor&iacute;as para todas las edades.', '<strong>Bilbao Herri Krosa (popular cross-country):</strong> Cross-country races have a strong tradition in the Basque Country. Bilbao hosts several cross-country events throughout winter, with categories for all ages.'],
  ['<strong>Carreras de monta&ntilde;a en Bizkaia:</strong> Zegama-Aizkorri (Gipuzkoa, pero muchos bilba&iacute;nos participan), Artxanda Vertical, subidas al Pagasarri y al Ganekogorta. El circuito vasco de trail es uno de los m&aacute;s activos de Espa&ntilde;a.', '<strong>Mountain races in Bizkaia:</strong> Zegama-Aizkorri (Gipuzkoa, but many from Bilbao participate), Artxanda Vertical, climbs up Pagasarri and Ganekogorta. The Basque trail circuit is one of the most active in Spain.'],
  ['<strong>San Silvestre Bilbao (diciembre):</strong> La carrera que cierra el a&ntilde;o. Miles de corredores disfrazados llenando las calles del centro en un ambiente de celebraci&oacute;n que mezcla deporte y fiesta.', '<strong>San Silvestre Bilbao (December):</strong> The race that closes the year. Thousands of costumed runners filling the city center streets in a celebratory atmosphere that mixes sport and party.'],

  ['Entrenar con un grupo para una carrera convierte la preparaci&oacute;n en algo m&aacute;s que kil&oacute;metros: los nervios compartidos en la salida, el apoyo en los momentos duros y la celebraci&oacute;n al cruzar la meta crean v&iacute;nculos que van mucho m&aacute;s all&aacute; del deporte.', 'Training with a group for a race turns the preparation into more than just kilometers: the shared nerves at the start, the support during the tough moments and the celebration at the finish line create bonds that go far beyond sport.'],

  // App section
  ['Con tantas opciones en Bilbao, puede resultar complicado saber por d&oacute;nde empezar. Aqu&iacute; es donde <a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" target="_blank" rel="noopener" style="color:#f97316">CorrerJuntos</a> marca la diferencia. La app est&aacute; dise&ntilde;ada para conectar corredores en Bilbao (y toda Espa&ntilde;a) seg&uacute;n su nivel, ritmo, horario y ubicaci&oacute;n.', 'With so many options in Bilbao, it can be hard to know where to start. This is where <a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" target="_blank" rel="noopener" style="color:#f97316">CorrerJuntos</a> makes the difference. The app is designed to connect runners in Bilbao (and all of Spain) based on their level, pace, schedule and location.'],

  ['El sistema de <a href="/matching/" style="color:#f97316">matching de CorrerJuntos</a> analiza tu perfil y te sugiere corredores compatibles en tu zona de Bilbao. Si vives en Deusto y corres a las 19:00 a ritmo de 5:30/km, la app te conecta con otros corredores de la zona que buscan exactamente eso. Sin tener que rastrear decenas de cuentas de Instagram ni enviar mensajes a grupos que quiz&aacute; ya no est&aacute;n activos.', 'The <a href="/matching/" style="color:#f97316">CorrerJuntos matching</a> system analyzes your profile and suggests compatible runners in your Bilbao area. If you live in Deusto and run at 19:00 at a pace of 5:30/km, the app connects you with other runners in the area who are looking for exactly that. No need to browse dozens of Instagram accounts or message groups that may no longer be active.'],

  ['Adem&aacute;s, puedes ver todas las quedadas activas en Bilbao en un mapa interactivo, filtrando por d&iacute;a, hora, distancia y nivel. Crea tu propia quedada y deja que otros corredores de tu zona te encuentren, o &uacute;nete a las que ya existen. La comunidad de CorrerJuntos en Bilbao no para de crecer, y cada nuevo miembro hace la red m&aacute;s fuerte.', 'You can also see all active meetups in Bilbao on an interactive map, filtering by day, time, distance and level. Create your own meetup and let other runners in your area find you, or join existing ones. The CorrerJuntos community in Bilbao keeps growing, and each new member makes the network stronger.'],

  ['Tambi&eacute;n puedes encontrar grupos en otras ciudades del norte como <a href="/blog/grupos-correr-sevilla" style="color:#f97316">Sevilla</a>, perfectos para cuando viajas y no quieres dejar de entrenar acompa&ntilde;ado.', 'You can also find groups in other cities like <a href="/blog/en/running-groups-seville" style="color:#f97316">Seville</a>, perfect for when you travel and want to keep training with company.'],

  // FAQ
  // FAQ h3
  ['>&iquest;Cu&aacute;les son los mejores clubes de running en Bilbao?</h3>', '>What are the best running clubs in Bilbao?</h3>'],
  ['>&iquest;Cu&aacute;ndo quedan los grupos de running en Bilbao?</h3>', '>When do running groups in Bilbao meet?</h3>'],
  ['>&iquest;Pueden unirse principiantes a los grupos de running en Bilbao?</h3>', '>Can beginners join running groups in Bilbao?</h3>'],
  ['>&iquest;Se puede correr en Bilbao cuando llueve?</h3>', '>Can you run in Bilbao when it rains?</h3>'],
  ['>&iquest;Cu&aacute;les son las mejores rutas para correr en Bilbao?</h3>', '>What are the best running routes in Bilbao?</h3>'],
  ['>&iquest;Existe parkrun en Bilbao?</h3>', '>Is there parkrun in Bilbao?</h3>'],
  ['>&iquest;Existen grupos de running gratuitos en Bilbao?</h3>', '>Are there free running groups in Bilbao?</h3>'],

  // FAQ answers
  ['Entre los clubes m&aacute;s destacados est&aacute;n Bilbao Runners (running social para todos los niveles), Athletic Club Atletismo (secci&oacute;n atl&eacute;tica del hist&oacute;rico club), Bilbao Triathlon (con secci&oacute;n de running exigente) y Artxanda Trail (especializado en trail running por los montes de Bilbao). Tambi&eacute;n hay grupos como Emakumeak Korrika (femenino) y quedadas organizadas por tiendas locales.', 'The most notable clubs include Bilbao Runners (social running for all levels), Athletic Club Athletics (athletics section of the historic club), Bilbao Triathlon (with a demanding running section) and Artxanda Trail (specialized in trail running through the Bilbao mountains). There are also groups like Emakumeak Korrika (women only) and meetups organized by local stores.'],

  ['La mayor&iacute;a quedan entre semana por las tardes (18:30-20:00) y los fines de semana por la ma&ntilde;ana (9:00-11:00). El clima atl&aacute;ntico permite horarios bastante estables todo el a&ntilde;o, sin grandes ajustes estacionales. Los puntos de encuentro habituales son Do&ntilde;a Casilda, Abandoibarra y el Casco Viejo.', 'Most meet on weekday afternoons (18:30-20:00) and weekend mornings (9:00-11:00). The Atlantic climate allows fairly stable schedules year-round, without major seasonal adjustments. The usual meeting points are Do&ntilde;a Casilda, Abandoibarra and the Casco Viejo.'],

  ['Absolutamente s&iacute;. La comunidad bilba&iacute;na es muy acogedora. Bilbao Runners tiene subgrupos por ritmo, y las quedadas informales son abiertas a cualquier nivel. En CorrerJuntos puedes filtrar por nivel para encontrar grupos de iniciaci&oacute;n donde ir a tu ritmo sin presi&oacute;n.', 'Absolutely yes. The Bilbao community is very welcoming. Bilbao Runners has sub-groups by pace, and informal meetups are open to any level. On CorrerJuntos you can filter by level to find beginner groups where you can go at your own pace with no pressure.'],

  ['Por supuesto. Los runners vascos no paran por lluvia, que es parte del paisaje. La clave es tener un buen cortavientos impermeable y transpirable, zapatillas con agarre y aceptar que mojarse no es un problema. Las rutas de la R&iacute;a y Do&ntilde;a Casilda drenan bien y son seguras incluso con lluvia. Las temperaturas suaves (10-25&deg;C todo el a&ntilde;o) hacen que correr mojado sea c&oacute;modo.', 'Of course. Basque runners do not stop for rain, which is part of the landscape. The key is having a good waterproof and breathable windbreaker, shoes with grip and accepting that getting wet is not a problem. The R&iacute;a and Do&ntilde;a Casilda routes drain well and are safe even in rain. Mild temperatures (10-25&deg;C year-round) make running wet quite comfortable.'],

  ['Las m&aacute;s populares son el Paseo de la R&iacute;a (8 km ida y vuelta, llano), la subida a Artxanda (trail urbano con 250 m de desnivel), el Parque de Do&ntilde;a Casilda (circuito de 1.5 km ideal para series), la senda costera de Getxo (10 km espectaculares junto al mar) y los senderos de Urkiola para trail running puro.', 'The most popular are the R&iacute;a Promenade (8 km round trip, flat), the Artxanda climb (urban trail with 250 m elevation gain), Do&ntilde;a Casilda Park (1.5 km circuit ideal for intervals), the Getxo coastal path (10 km of spectacular running by the sea) and the Urkiola trails for pure trail running.'],

  ['Actualmente no hay un parkrun oficial en Bilbao, aunque hay iniciativas para organizarlo en el Parque de Etxebarria. Mientras tanto, varios grupos informales organizan carreras de 5 km cronometradas los s&aacute;bados por la ma&ntilde;ana con un formato similar. Consulta CorrerJuntos o redes sociales (#RunningBilbao) para encontrar estas quedadas sabatinas.', 'Currently there is no official parkrun in Bilbao, although there are initiatives to organize one at Etxebarria Park. Meanwhile, several informal groups organize timed 5 km runs on Saturday mornings with a similar format. Check CorrerJuntos or social media (#RunningBilbao) to find these Saturday meetups.'],

  ['S&iacute;, hay muchas opciones gratuitas. Tiendas como Forum Sport organizan salidas abiertas. Marcas deportivas realizan quedadas peri&oacute;dicas. Varios colectivos informales entrenan gratis por la R&iacute;a y Do&ntilde;a Casilda. Y en CorrerJuntos puedes unirte a cualquier quedada creada por otros corredores de Bilbao sin coste alguno. Muchos clubes tambi&eacute;n ofrecen sesiones de prueba gratuitas.', 'Yes, there are many free options. Stores like Forum Sport organize open runs. Sports brands hold periodic meetups. Several informal collectives train for free along the R&iacute;a and Do&ntilde;a Casilda. And on CorrerJuntos you can join any meetup created by other Bilbao runners at no cost. Many clubs also offer free trial sessions.'],

  // CTA box
  ['Encuentra tu grupo de running en Bilbao', 'Find your running group in Bilbao'],
  ['Cada vez m&aacute;s corredores en Bilbao est&aacute;n usando CorrerJuntos para encontrar su grupo ideal. Llueva o haga sol, aqu&iacute; siempre hay alguien con quien correr.', 'More and more runners in Bilbao are using CorrerJuntos to find their ideal group. Rain or shine, there is always someone to run with here.'],

  // Related links
  ['>Encontrar gente para correr</a>', '>Find people to run with</a>'],
  ['>Beneficios de correr en grupo</a>', '>Benefits of group running</a>'],
  ['>Grupos de running en Sevilla</a>', '>Running groups in Seville</a>'],
  ['>Unirse a un grupo de running</a>', '>How to join a running group</a>'],
  ['>Correr acompa&ntilde;ado en C&aacute;diz</a>', '>Running with company in C&aacute;diz</a>'],
  // Update related links to EN versions
  ['href="/blog/encontrar-gente-para-correr"', 'href="/blog/en/find-people-to-run-with"'],
  ['href="/blog/beneficios-correr-en-grupo"', 'href="/blog/en/benefits-of-group-running"'],
  ['href="/blog/grupos-correr-sevilla"', 'href="/blog/en/running-groups-seville"'],
  ['href="/blog/unirse-grupo-running"', 'href="/blog/en/how-to-join-a-running-group"'],
  ['href="/blog/correr-acompanado-cadiz"', 'href="/blog/en/running-with-company-cadiz"'],

  // Schema FAQ translations
  ['"¿Cuáles son los mejores clubes de running en Bilbao?"', '"What are the best running clubs in Bilbao?"'],
  ['"Entre los clubes más destacados de Bilbao están Bilbao Runners (running social para todos los niveles), Athletic Club Atletismo (sección atlética del histórico club), Bilbao Triathlon (con sección de running) y Artxanda Trail (enfocado en trail running por los montes de Bilbao). También hay grupos informales que organizan quedadas semanales por la Ría."', '"The most notable clubs in Bilbao include Bilbao Runners (social running for all levels), Athletic Club Athletics (athletics section of the historic club), Bilbao Triathlon (with a running section) and Artxanda Trail (focused on trail running through the Bilbao mountains). There are also informal groups that organize weekly meetups along the Ría."'],
  ['"¿Cuándo quedan los grupos de running en Bilbao?"', '"When do running groups in Bilbao meet?"'],
  ['"La mayoría de grupos de running en Bilbao quedan entre semana por las tardes (18:30-20:00) y los fines de semana por la mañana (9:00-11:00). El clima atlántico permite horarios bastante estables todo el año, sin necesidad de grandes ajustes por calor extremo. Los sábados muchos corredores se reúnen en el Parque de Doña Casilda o en la Alhondiga para salidas grupales."', '"Most running groups in Bilbao meet on weekday afternoons (18:30-20:00) and weekend mornings (9:00-11:00). The Atlantic climate allows fairly stable schedules year-round, without the need for major adjustments due to extreme heat. On Saturdays many runners gather at Doña Casilda Park or the Alhondiga for group runs."'],
  ['"¿Pueden unirse principiantes a los grupos de running en Bilbao?"', '"Can beginners join running groups in Bilbao?"'],
  ['"Sí, absolutamente. La comunidad runner de Bilbao es muy acogedora con principiantes. Bilbao Runners tiene subgrupos por ritmo, y muchas tiendas de running locales organizan salidas abiertas para todos los niveles. En CorrerJuntos puedes filtrar quedadas por nivel para encontrar grupos de iniciación en Bilbao donde nadie te juzgará por tu ritmo."', '"Yes, absolutely. The Bilbao running community is very welcoming to beginners. Bilbao Runners has sub-groups by pace, and many local running stores organize open runs for all levels. On CorrerJuntos you can filter meetups by level to find beginner groups in Bilbao where nobody will judge your pace."'],
  ['"¿Se puede correr en Bilbao cuando llueve?"', '"Can you run in Bilbao when it rains?"'],
  ['"Por supuesto. Los runners vascos no paran por lluvia. Bilbao tiene un clima atlántico con precipitaciones frecuentes, especialmente de octubre a abril. La clave es tener buena ropa impermeable y transpirable: cortavientos con membrana, mallas técnicas y zapatillas con buen agarre. Las rutas por la Ría y Doña Casilda drenan bien y son seguras incluso con lluvia."', '"Of course. Basque runners do not stop for rain. Bilbao has an Atlantic climate with frequent rainfall, especially from October to April. The key is having good waterproof and breathable gear: membrane windbreaker, technical tights and shoes with good grip. The Ría and Doña Casilda routes drain well and are safe even in the rain."'],
  ['"¿Cuáles son las mejores rutas para correr en Bilbao?"', '"What are the best running routes in Bilbao?"'],
  ['"Las rutas más populares incluyen el Paseo de la Ría (8 km ida y vuelta, llano y escénico), la subida a Artxanda (trail urbano con vistas panorámicas), el Parque de Doña Casilda (circuito de 1.5 km ideal para series), la senda costera de Getxo (10 km espectaculares junto al mar) y los senderos del Parque Natural de Urkiola para trail running."', '"The most popular routes include the Ría Promenade (8 km round trip, flat and scenic), the Artxanda climb (urban trail with panoramic views), Doña Casilda Park (1.5 km circuit ideal for intervals), the Getxo coastal path (10 km of spectacular running by the sea) and the trails of Urkiola Natural Park for trail running."'],
  ['"¿Existe parkrun en Bilbao?"', '"Is there parkrun in Bilbao?"'],
  ['"Actualmente Bilbao no tiene un parkrun oficial establecido, aunque hay movimientos para organizarlo en el Parque de Etxebarria. Mientras tanto, varios grupos informales organizan carreras de 5 km cronometradas los sábados por la mañana con un formato similar. Consulta CorrerJuntos o redes sociales para encontrar estas quedadas de 5K gratuitas en Bilbao."', '"Currently Bilbao does not have an official established parkrun, although there are movements to organize one at Etxebarria Park. Meanwhile, several informal groups organize timed 5 km runs on Saturday mornings with a similar format. Check CorrerJuntos or social media to find these free 5K meetups in Bilbao."'],
  ['"¿Existen grupos de running gratuitos en Bilbao?"', '"Are there free running groups in Bilbao?"'],
  ['"Sí, hay varias opciones gratuitas en Bilbao. Tiendas de running como Forum Sport organizan salidas abiertas. Marcas deportivas realizan quedadas periódicas sin coste. Varios colectivos informales organizan entrenamientos gratuitos por la Ría y Doña Casilda. Y en CorrerJuntos puedes unirte a quedadas creadas por otros corredores de Bilbao sin pagar nada."', '"Yes, there are several free options in Bilbao. Running stores like Forum Sport organize open runs. Sports brands hold periodic meetups at no cost. Several informal collectives organize free training sessions along the Ría and Doña Casilda. And on CorrerJuntos you can join meetups created by other Bilbao runners without paying anything."'],

  // Schema breadcrumb
  ['"Grupos de Running en Bilbao"', '"Running Groups in Bilbao"'],

  // Newsletter source
  ["source: 'blog-grupos-running-bilbao'", "source: 'blog-running-groups-bilbao-en'"],
];

function processArticle(article, contentReplacements) {
  let html = fs.readFileSync(path.join(BASE, article.esFile), 'utf8');

  // 1. Apply specific title/meta translations
  for (const [from, to] of Object.entries(article.translations)) {
    html = html.split(from).join(to);
  }

  // 2. Apply common replacements
  for (const [from, to] of commonReplacements) {
    html = html.split(from).join(to);
  }

  // 3. Apply content-specific replacements
  for (const [from, to] of contentReplacements) {
    html = html.split(from).join(to);
  }

  // 4. Update canonical and hreflang
  html = html.replace(
    `href="https://www.correrjuntos.com/blog/${article.esSlug}"`,
    `href="https://www.correrjuntos.com/blog/en/${article.enSlug}"`
  );
  // Fix canonical (only the first one which is the canonical link)
  html = html.replace(
    `<link rel="canonical" href="https://www.correrjuntos.com/blog/en/${article.enSlug}">`,
    `<link rel="canonical" href="https://www.correrjuntos.com/blog/en/${article.enSlug}">`
  );

  // Update hreflang links
  html = html.replace(
    new RegExp(`<link rel="alternate" hreflang="es" href="https://www.correrjuntos.com/blog/en/${article.enSlug}">`, 'g'),
    `<link rel="alternate" hreflang="es" href="https://www.correrjuntos.com/blog/${article.esSlug}">`
  );

  // Add EN hreflang if not present
  if (!html.includes(`hreflang="en"`)) {
    html = html.replace(
      `<link rel="alternate" hreflang="x-default"`,
      `<link rel="alternate" hreflang="en" href="https://www.correrjuntos.com/blog/en/${article.enSlug}">\n<link rel="alternate" hreflang="x-default"`
    );
  }

  // Fix: hreflang es should point to ES slug, x-default to ES slug
  // The es hreflang was already correct in source, but canonical changed it
  // Let's ensure proper hreflang structure
  // Remove all hreflang lines and re-add them properly
  html = html.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n?/g, '');
  const canonicalLine = `<link rel="canonical" href="https://www.correrjuntos.com/blog/en/${article.enSlug}">`;
  html = html.replace(
    canonicalLine,
    `${canonicalLine}\n<link rel="alternate" hreflang="es" href="https://www.correrjuntos.com/blog/${article.esSlug}">\n<link rel="alternate" hreflang="en" href="https://www.correrjuntos.com/blog/en/${article.enSlug}">\n<link rel="alternate" hreflang="x-default" href="https://www.correrjuntos.com/blog/${article.esSlug}">`
  );

  // 5. Update OG url
  html = html.replace(
    `content="https://www.correrjuntos.com/blog/${article.esSlug}"`,
    `content="https://www.correrjuntos.com/blog/en/${article.enSlug}"`
  );

  // 6. Update schema URLs
  html = html.replace(
    new RegExp(`https://www.correrjuntos.com/blog/${article.esSlug}`, 'g'),
    `https://www.correrjuntos.com/blog/en/${article.enSlug}`
  );

  // Fix: es hreflang in schema should still point to ES (already done above in link tags)

  // 7. Update OG locale
  html = html.replace('content="es_ES"', 'content="en_US"');

  // 8. Fix blog link in nav for EN
  // Already handled by footer common replacement

  return html;
}

// Process Bilbao
console.log('Processing Bilbao...');
const bilbaoEN = processArticle(articles[0], bilbaoContentReplacements);
fs.writeFileSync(path.join(BASE, articles[0].enFile), bilbaoEN, 'utf8');
console.log(`Written: ${articles[0].enFile}`);

console.log('\nDone! Now run the Malaga and Zaragoza translations separately.');
