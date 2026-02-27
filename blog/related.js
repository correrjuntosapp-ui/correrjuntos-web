/* Related Articles — shows 4 related posts based on category (ES + EN) */
(function(){
  'use strict';

  /* ── Language detection ── */
  var isEN = /\/blog\/en\//.test(window.location.pathname);

  /* ── Article databases ── */
  var DB_ES=[
{s:'alimentos-antiinflamatorios-runners',t:'15 Alimentos Antiinflamatorios para Runners',c:'Nutrici\u00f3n'},
{s:'apple-watch-running-review',t:'Apple Watch para Running: \u00bfMerece la Pena?',c:'Tecnolog\u00eda'},
{s:'asics-gel-nimbus-26-vs-nike-pegasus-41',t:'ASICS Gel-Nimbus 26 vs Nike Pegasus 41',c:'Zapatillas'},
{s:'auriculares-conduccion-osea-vs-in-ear-running',t:'Conducci\u00f3n \u00d3sea vs In-Ear para Correr',c:'Equipamiento'},
{s:'auriculares-running-natacion',t:'Mejores Auriculares para Running y Nataci\u00f3n',c:'Equipamiento'},
{s:'ayuno-intermitente-running',t:'Ayuno Intermitente y Running',c:'Nutrici\u00f3n'},
{s:'beneficios-correr-en-grupo',t:'7 Beneficios de Correr en Grupo',c:'Entrenamiento'},
{s:'beneficios-de-correr',t:'15 Beneficios de Correr Respaldados por la Ciencia',c:'Entrenamiento'},
{s:'cafeina-running-rendimiento',t:'Cafe\u00edna y Running: Mejora tu Rendimiento',c:'Nutrici\u00f3n'},
{s:'calcetines-running',t:'Los 8 Mejores Calcetines para Running',c:'Equipamiento'},
{s:'carga-hidratos-maraton',t:'Carga de Hidratos antes de un Marat\u00f3n',c:'Nutrici\u00f3n'},
{s:'carreras-trail-principiantes',t:'10 Mejores Carreras de Trail para Principiantes',c:'Trail'},
{s:'chalecos-hidratacion-running',t:'7 Mejores Chalecos de Hidrataci\u00f3n',c:'Equipamiento'},
{s:'chubasqueros-running',t:'8 Mejores Chubasqueros para Running',c:'Equipamiento'},
{s:'cinturones-running',t:'8 Mejores Cinturones para Running',c:'Equipamiento'},
{s:'como-calentar-antes-de-correr',t:'C\u00f3mo Calentar Antes de Correr',c:'Entrenamiento'},
{s:'como-correr-mas-rapido',t:'C\u00f3mo Correr M\u00e1s R\u00e1pido: 12 Claves',c:'Entrenamiento'},
{s:'como-elegir-reloj-gps-running',t:'C\u00f3mo Elegir un Reloj GPS para Running',c:'Tecnolog\u00eda'},
{s:'como-preparar-primera-carrera-5k',t:'C\u00f3mo Preparar tu Primera 5K',c:'Entrenamiento'},
{s:'como-respirar-al-correr',t:'C\u00f3mo Respirar al Correr: Gu\u00eda Completa',c:'Entrenamiento'},
{s:'coros-pace-3-review',t:'COROS PACE 3: Review Completa',c:'Tecnolog\u00eda'},
{s:'correr-en-invierno',t:'Correr en Invierno: Gu\u00eda Completa',c:'Entrenamiento'},
{s:'creatina-para-runners',t:'Creatina para Corredores: 7 Beneficios',c:'Nutrici\u00f3n'},
{s:'dieta-runner-que-comer',t:'Dieta para Runners: Qu\u00e9 Comer',c:'Nutrici\u00f3n'},
{s:'diferencias-trail-vs-asfalto',t:'Trail vs Asfalto: Diferencias y Ventajas',c:'Trail'},
{s:'dolor-rodilla-al-correr',t:'Dolor de Rodilla al Correr: Causas y Tratamiento',c:'Salud'},
{s:'empezar-a-correr-guia-principiantes',t:'C\u00f3mo Empezar a Correr desde Cero',c:'Entrenamiento'},
{s:'empezar-trail-running',t:'C\u00f3mo Empezar en Trail Running',c:'Trail'},
{s:'entrenamiento-por-zonas-running',t:'Entrenamiento por Zonas: FC, Ritmo y Potencia',c:'Entrenamiento'},
{s:'errores-comunes-corredores',t:'10 Errores Comunes de los Corredores',c:'Entrenamiento'},
{s:'estiramientos-antes-despues-correr',t:'Estiramientos Antes y Despu\u00e9s de Correr',c:'Entrenamiento'},
{s:'estiramientos-post-carrera',t:'Estiramientos Post-Carrera: Recupera R\u00e1pido',c:'Salud'},
{s:'fascitis-plantar-corredores',t:'Fascitis Plantar en Corredores',c:'Salud'},
{s:'foam-rollers-runners',t:'7 Mejores Foam Rollers para Corredores',c:'Equipamiento'},
{s:'garmin-forerunner-265-vs-coros-pace-3',t:'Garmin Forerunner 265 vs COROS PACE 3',c:'Tecnolog\u00eda'},
{s:'garmin-forerunner-55-review',t:'Garmin Forerunner 55: Review Completa',c:'Tecnolog\u00eda'},
{s:'garmin-venu-3-review',t:'Garmin Venu 3: Review para Runners',c:'Tecnolog\u00eda'},
{s:'gorras-running',t:'8 Mejores Gorras para Running',c:'Equipamiento'},
{s:'hidratacion-running-guia-completa',t:'Hidrataci\u00f3n para Running: Gu\u00eda Completa',c:'Nutrici\u00f3n'},
{s:'hoka-clifton-9-vs-bondi-8',t:'Hoka Clifton 9 vs Bondi 8',c:'Zapatillas'},
{s:'jbl-reflect-flow-pro-review',t:'JBL Reflect Flow Pro: Review para Runners',c:'Equipamiento'},
{s:'lamparas-frontales-running',t:'7 Mejores L\u00e1mparas Frontales para Running',c:'Equipamiento'},
{s:'mallas-running',t:'10 Mejores Mallas para Running',c:'Equipamiento'},
{s:'material-trail-running',t:'Material Imprescindible para Trail Running',c:'Equipamiento'},
{s:'mejor-reloj-gps-running-calidad-precio',t:'Mejor Reloj GPS Calidad-Precio',c:'Tecnolog\u00eda'},
{s:'mejores-apps-running',t:'10 Mejores Apps para Correr Gratis',c:'Entrenamiento'},
{s:'mejores-auriculares-baratos-running',t:'8 Mejores Auriculares Baratos para Running',c:'Equipamiento'},
{s:'mejores-auriculares-running',t:'Mejores Auriculares para Correr',c:'Equipamiento'},
{s:'mejores-creatinas-running',t:'8 Mejores Creatinas para Runners',c:'Nutrici\u00f3n'},
{s:'mejores-rutas-correr-barcelona',t:'Mejores Rutas para Correr en Barcelona',c:'Rutas'},
{s:'mejores-rutas-correr-madrid',t:'10 Mejores Rutas para Correr en Madrid',c:'Rutas'},
{s:'mejores-rutas-correr-malaga',t:'10 Mejores Rutas para Correr en M\u00e1laga',c:'Rutas'},
{s:'mejores-rutas-correr-sevilla',t:'10 Mejores Rutas para Correr en Sevilla',c:'Rutas'},
{s:'mejores-rutas-correr-valencia',t:'Mejores Rutas para Correr en Valencia',c:'Rutas'},
{s:'mejores-suplementos-runners',t:'Mejores Suplementos para Runners',c:'Nutrici\u00f3n'},
{s:'mejores-zapatillas-placa-carbono',t:'10 Mejores Zapatillas Placa de Carbono',c:'Zapatillas'},
{s:'mejores-zapatillas-running-asfalto',t:'10 Mejores Zapatillas para Asfalto',c:'Zapatillas'},
{s:'mejores-zapatillas-running-baratas',t:'Mejores Zapatillas Baratas para Running',c:'Zapatillas'},
{s:'mejores-zapatillas-trail-running',t:'10 Mejores Zapatillas Trail Running',c:'Zapatillas'},
{s:'mejores-zapatillas-running-mujer',t:'10 Mejores Zapatillas Running Mujer',c:'Zapatillas'},
{s:'mejores-zapatillas-running-principiantes',t:'Mejores Zapatillas para Principiantes',c:'Zapatillas'},
{s:'mejores-zapatillas-running-sobrepeso',t:'Zapatillas Running para Sobrepeso',c:'Zapatillas'},
{s:'nike-pegasus-41-vs-brooks-ghost-16',t:'Nike Pegasus 41 vs Brooks Ghost 16',c:'Zapatillas'},
{s:'nutricion-dia-de-carrera',t:'Nutrici\u00f3n D\u00eda de Carrera: Antes, Durante y Despu\u00e9s',c:'Nutrici\u00f3n'},
{s:'nutricion-para-runners',t:'Qu\u00e9 Comer Antes y Despu\u00e9s de Correr',c:'Nutrici\u00f3n'},
{s:'pack-basico-running-principiantes',t:'Pack B\u00e1sico de Running para Empezar',c:'Equipamiento'},
{s:'periostitis-tibial-running',t:'Periostitis Tibial: Causas y Tratamiento',c:'Salud'},
{s:'plan-entrenamiento-10k',t:'Plan de Entrenamiento 10K',c:'Entrenamiento'},
{s:'plan-entrenamiento-media-maraton',t:'Plan Entrenamiento Media Marat\u00f3n: 12 Semanas',c:'Entrenamiento'},
{s:'polar-pacer-pro-review',t:'Polar Pacer Pro: Review Completa',c:'Tecnolog\u00eda'},
{s:'potencia-en-running',t:'Potencia en Running: Qu\u00e9 Es y C\u00f3mo Entrenar',c:'Entrenamiento'},
{s:'prevenir-lesiones-running',t:'C\u00f3mo Prevenir Lesiones al Correr',c:'Salud'},
{s:'proteinas-para-runners',t:'Prote\u00ednas para Runners: Cu\u00e1nta Necesitas',c:'Nutrici\u00f3n'},
{s:'que-comer-antes-de-correr',t:'Qu\u00e9 Comer Antes de Correr',c:'Nutrici\u00f3n'},
{s:'que-gel-energetico-usar-maraton',t:'Qu\u00e9 Gel Energ\u00e9tico Usar en un Marat\u00f3n',c:'Nutrici\u00f3n'},
{s:'que-zapatillas-running-comprar-segun-nivel',t:'Zapatillas de Running Seg\u00fan tu Nivel',c:'Zapatillas'},
{s:'rodilla-del-corredor',t:'Rodilla del Corredor: Gu\u00eda Completa',c:'Salud'},
{s:'ropa-tecnica-running',t:'Ropa T\u00e9cnica para Correr: Gu\u00eda por Temperatura',c:'Equipamiento'},
{s:'salomon-speedcross-6-vs-hoka-speedgoat-6',t:'Salomon Speedcross 6 vs Hoka Speedgoat 6',c:'Trail'},
{s:'shokz-openrun-pro-2-review',t:'Shokz OpenRun Pro 2: Review Completa',c:'Equipamiento'},
{s:'smartwatch-vs-reloj-gps-running',t:'Smartwatch vs Reloj GPS: \u00bfCu\u00e1l Necesitas?',c:'Tecnolog\u00eda'},
{s:'strava-vs-garmin-connect',t:'Strava vs Garmin Connect: Comparativa',c:'Entrenamiento'},
{s:'tendinitis-aquiles-running',t:'Tendinitis de Aquiles en Runners',c:'Salud'},
{s:'variabilidad-cardiaca-running',t:'Variabilidad Card\u00edaca (HRV) para Runners',c:'Entrenamiento'},
{s:'zapatillas-running-pronadores',t:'Zapatillas para Pronadores: Gu\u00eda Completa',c:'Zapatillas'}
  ];

  var DB_EN=[
{s:'10k-training-plan',t:'10K Training Plan for Beginners',c:'Entrenamiento'},
{s:'achilles-tendinitis-running',t:'Achilles Tendinitis in Runners',c:'Salud'},
{s:'anti-inflammatory-foods-runners',t:'15 Anti-Inflammatory Foods for Runners',c:'Nutrici\u00f3n'},
{s:'apple-watch-running-review',t:'Apple Watch for Running: Is It Worth It?',c:'Tecnolog\u00eda'},
{s:'asics-gel-nimbus-26-vs-nike-pegasus-41',t:'ASICS Gel-Nimbus 26 vs Nike Pegasus 41',c:'Zapatillas'},
{s:'basic-running-pack-beginners',t:'Basic Running Pack: Everything You Need',c:'Entrenamiento'},
{s:'benefits-of-group-running',t:'7 Benefits of Group Running',c:'Entrenamiento'},
{s:'benefits-of-running',t:'Benefits of Running: 15 Science-Backed Reasons',c:'Entrenamiento'},
{s:'best-budget-running-headphones',t:'8 Best Budget Running Headphones',c:'Equipamiento'},
{s:'best-budget-running-shoes',t:'Best Budget Running Shoes 2026',c:'Zapatillas'},
{s:'best-carbon-plate-running-shoes',t:'10 Best Carbon Plate Running Shoes 2026',c:'Zapatillas'},
{s:'best-creatine-running',t:'8 Best Creatines for Runners',c:'Nutrici\u00f3n'},
{s:'best-road-running-shoes',t:'10 Best Road Running Shoes 2026',c:'Zapatillas'},
{s:'best-trail-running-shoes',t:'10 Best Trail Running Shoes 2026',c:'Zapatillas'},
{s:'best-running-apps',t:'10 Best Free Running Apps 2026',c:'Tecnolog\u00eda'},
{s:'best-running-headphones',t:'Best Running Headphones 2026',c:'Equipamiento'},
{s:'best-running-routes-barcelona',t:'Best Running Routes in Barcelona',c:'Rutas'},
{s:'best-running-routes-madrid',t:'10 Best Running Routes in Madrid',c:'Rutas'},
{s:'best-running-routes-malaga',t:'10 Best Running Routes in Malaga',c:'Rutas'},
{s:'best-running-routes-sevilla',t:'10 Best Running Routes in Seville',c:'Rutas'},
{s:'best-running-routes-valencia',t:'Best Running Routes in Valencia',c:'Rutas'},
{s:'best-running-shoes-beginners',t:'Best Running Shoes for Beginners 2026',c:'Zapatillas'},
{s:'best-running-shoes-overweight',t:'Best Running Shoes for Heavier Runners',c:'Zapatillas'},
{s:'best-supplements-runners',t:'Best Supplements for Runners 2026',c:'Nutrici\u00f3n'},
{s:'best-value-gps-running-watch',t:'Best Value GPS Running Watch 2026',c:'Tecnolog\u00eda'},
{s:'best-womens-running-shoes',t:'10 Best Women\u2019s Running Shoes 2026',c:'Zapatillas'},
{s:'bone-conduction-vs-in-ear-running',t:'Bone Conduction vs In-Ear for Running',c:'Equipamiento'},
{s:'caffeine-running-performance',t:'Caffeine and Running Performance',c:'Nutrici\u00f3n'},
{s:'common-running-mistakes',t:'10 Most Common Running Mistakes',c:'Entrenamiento'},
{s:'coros-pace-3-review',t:'COROS PACE 3: Full Review',c:'Tecnolog\u00eda'},
{s:'creatine-for-runners',t:'Creatine for Runners: 7 Benefits',c:'Nutrici\u00f3n'},
{s:'foam-rollers-runners',t:'7 Best Foam Rollers for Runners',c:'Salud'},
{s:'garmin-forerunner-265-vs-coros-pace-3',t:'Garmin Forerunner 265 vs COROS PACE 3',c:'Tecnolog\u00eda'},
{s:'garmin-forerunner-55-review',t:'Garmin Forerunner 55: Full Review',c:'Tecnolog\u00eda'},
{s:'garmin-venu-3-review',t:'Garmin Venu 3: Review for Runners',c:'Tecnolog\u00eda'},
{s:'half-marathon-training-plan',t:'Half Marathon Training Plan: 12 Weeks',c:'Entrenamiento'},
{s:'heart-rate-variability-running',t:'Heart Rate Variability (HRV) for Runners',c:'Tecnolog\u00eda'},
{s:'hoka-clifton-9-vs-bondi-8',t:'Hoka Clifton 9 vs Bondi 8',c:'Zapatillas'},
{s:'how-to-breathe-while-running',t:'How to Breathe While Running',c:'Entrenamiento'},
{s:'how-to-choose-gps-running-watch',t:'How to Choose a GPS Running Watch',c:'Tecnolog\u00eda'},
{s:'how-to-prepare-first-5k-race',t:'How to Prepare for Your First 5K',c:'Entrenamiento'},
{s:'how-to-run-faster',t:'How to Run Faster: 12 Proven Keys',c:'Entrenamiento'},
{s:'how-to-start-running-beginners-guide',t:'How to Start Running: Beginner\u2019s Guide',c:'Entrenamiento'},
{s:'how-to-warm-up-before-running',t:'How to Warm Up Before Running',c:'Entrenamiento'},
{s:'intermittent-fasting-running',t:'Intermittent Fasting and Running',c:'Nutrici\u00f3n'},
{s:'jbl-reflect-flow-pro-review',t:'JBL Reflect Flow Pro: Review for Runners',c:'Equipamiento'},
{s:'knee-pain-while-running',t:'Knee Pain While Running: Causes & Treatment',c:'Salud'},
{s:'marathon-carb-loading',t:'Marathon Carb Loading: Complete Protocol',c:'Nutrici\u00f3n'},
{s:'nike-pegasus-41-vs-brooks-ghost-16',t:'Nike Pegasus 41 vs Brooks Ghost 16',c:'Zapatillas'},
{s:'nutrition-for-runners',t:'What to Eat Before and After Running',c:'Nutrici\u00f3n'},
{s:'plantar-fasciitis-runners',t:'Plantar Fasciitis in Runners',c:'Salud'},
{s:'polar-pacer-pro-review',t:'Polar Pacer Pro: Full Review',c:'Tecnolog\u00eda'},
{s:'post-run-stretches',t:'Post-Run Stretches: Recover Faster',c:'Salud'},
{s:'prevent-running-injuries',t:'How to Prevent Running Injuries',c:'Salud'},
{s:'protein-for-runners',t:'Protein for Runners: How Much You Need',c:'Nutrici\u00f3n'},
{s:'race-day-nutrition',t:'Race Day Nutrition: Before, During & After',c:'Nutrici\u00f3n'},
{s:'runner-diet-what-to-eat',t:'Runner\u2019s Diet: What to Eat to Run Better',c:'Nutrici\u00f3n'},
{s:'runners-knee',t:'Runner\u2019s Knee: Complete Guide',c:'Salud'},
{s:'running-belts',t:'8 Best Running Belts 2026',c:'Equipamiento'},
{s:'running-caps',t:'8 Best Running Caps 2026',c:'Equipamiento'},
{s:'running-headlamps',t:'7 Best Running Headlamps 2026',c:'Equipamiento'},
{s:'running-hydration-complete-guide',t:'Running Hydration: Complete Guide',c:'Nutrici\u00f3n'},
{s:'running-hydration-vests',t:'7 Best Running Hydration Vests',c:'Equipamiento'},
{s:'running-in-winter',t:'Running in Winter: Complete Guide',c:'Entrenamiento'},
{s:'running-power',t:'Running Power: What It Is and How to Train',c:'Tecnolog\u00eda'},
{s:'running-rain-jackets',t:'8 Best Running Rain Jackets 2026',c:'Equipamiento'},
{s:'running-shoes-overpronators',t:'Running Shoes for Overpronators',c:'Zapatillas'},
{s:'running-socks',t:'8 Best Running Socks 2026',c:'Equipamiento'},
{s:'running-technical-clothing',t:'Running Technical Clothing Guide',c:'Equipamiento'},
{s:'running-tights',t:'10 Best Running Tights 2026',c:'Equipamiento'},
{s:'salomon-speedcross-6-vs-hoka-speedgoat-6',t:'Salomon Speedcross 6 vs Hoka Speedgoat 6',c:'Trail'},
{s:'shin-splints-running',t:'Shin Splints: Causes & Treatment',c:'Salud'},
{s:'shokz-openrun-pro-2-review',t:'Shokz OpenRun Pro 2: Full Review',c:'Equipamiento'},
{s:'smartwatch-vs-gps-watch-running',t:'Smartwatch vs GPS Watch for Running',c:'Tecnolog\u00eda'},
{s:'start-trail-running',t:'How to Start Trail Running',c:'Trail'},
{s:'strava-vs-garmin-connect',t:'Strava vs Garmin Connect: Comparison',c:'Tecnolog\u00eda'},
{s:'stretching-before-after-running',t:'Stretching Before and After Running',c:'Entrenamiento'},
{s:'trail-races-beginners',t:'10 Best Trail Races for Beginners',c:'Trail'},
{s:'trail-running-gear',t:'Essential Trail Running Gear',c:'Trail'},
{s:'trail-vs-road-running',t:'Trail vs Road Running: Differences',c:'Trail'},
{s:'waterproof-headphones-running-swimming',t:'Best Headphones for Running & Swimming',c:'Equipamiento'},
{s:'what-energy-gel-marathon',t:'What Energy Gel to Use for a Marathon',c:'Nutrici\u00f3n'},
{s:'what-to-eat-before-running',t:'What to Eat Before Running',c:'Nutrici\u00f3n'},
{s:'which-running-shoes-by-level',t:'Which Running Shoes by Level',c:'Zapatillas'},
{s:'zone-training-running',t:'Zone Training: HR, Pace and Power Zones',c:'Tecnolog\u00eda'}
  ];

  var DB = isEN ? DB_EN : DB_ES;
  var basePath = isEN ? '/blog/en/' : '/blog/';

  /* Category groups for broader matching */
  var GROUPS = {
    'Entrenamiento':['Entrenamiento','Trail'],
    'Trail':['Trail','Entrenamiento','Rutas'],
    'Nutrici\u00f3n':['Nutrici\u00f3n'],
    'Zapatillas':['Zapatillas','Equipamiento'],
    'Equipamiento':['Equipamiento','Zapatillas'],
    'Tecnolog\u00eda':['Tecnolog\u00eda','Equipamiento'],
    'Salud':['Salud','Entrenamiento'],
    'Rutas':['Rutas','Entrenamiento'],
  };

  /* Category thumbnail images (same Unsplash URLs as hero system) */
  var CAT_IMGS = {
    'Entrenamiento':'https://images.pexels.com/photos/3756042/pexels-photo-3756042.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Trail':'https://images.pexels.com/photos/8949023/pexels-photo-8949023.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Nutrici\u00f3n':'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Zapatillas':'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Equipamiento':'https://images.pexels.com/photos/4397831/pexels-photo-4397831.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Tecnolog\u00eda':'https://images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Salud':'https://images.pexels.com/photos/4056832/pexels-photo-4056832.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Rutas':'https://images.pexels.com/photos/4652250/pexels-photo-4652250.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60'
  };
  var DEFAULT_IMG = 'https://images.pexels.com/photos/4397831/pexels-photo-4397831.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60';

  /* ── CSS ── */
  var css = document.createElement('style');
  css.textContent = [
    '.related-section{margin:40px 0 32px;padding:32px 0 0;border-top:1px solid rgba(255,255,255,.06)}',
    '.related-title{font-size:1.1rem;font-weight:800;color:#fff;margin:0 0 20px}',
    '.related-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}',
    '.related-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:0;text-decoration:none;transition:all .25s;display:block;overflow:hidden}',
    '.related-card:hover{background:rgba(255,255,255,.06);border-color:rgba(249,115,22,.3);transform:translateY(-2px)}',
    '.related-img{width:100%;height:120px;object-fit:cover;display:block}',
    '.related-body{padding:14px 16px 16px}',
    '.related-cat{font-size:.7rem;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px}',
    '.related-card-title{font-size:.9rem;font-weight:700;color:#cbd5e1;line-height:1.4;margin:0;transition:color .2s}',
    '.related-card:hover .related-card-title{color:#fff}',
    '.related-arrow{font-size:.75rem;color:#64748b;margin-top:8px;transition:color .2s}',
    '.related-card:hover .related-arrow{color:#f97316}',
    '@media(max-width:640px){.related-grid{grid-template-columns:1fr}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ── Find current article ── */
  var path = window.location.pathname.replace(/\/$/,'');
  var slug = path.split('/').pop();
  var current = null;
  for(var i=0;i<DB.length;i++){ if(DB[i].s===slug){ current=DB[i]; break; } }
  if(!current) return;

  /* ── Find related ── */
  var cats = GROUPS[current.c] || [current.c];
  var sameCat = [], otherCat = [];
  for(var j=0;j<DB.length;j++){
    if(DB[j].s===slug) continue;
    if(cats.indexOf(DB[j].c)>=0) sameCat.push(DB[j]);
    else otherCat.push(DB[j]);
  }
  /* Shuffle */
  function shuffle(a){for(var i=a.length-1;i>0;i--){var r=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[r];a[r]=t;}return a;}
  shuffle(sameCat); shuffle(otherCat);
  var picks = sameCat.slice(0,3);
  if(picks.length<4){ picks = picks.concat(otherCat.slice(0,4-picks.length)); }

  if(picks.length<2) return;

  /* ── Build section ── */
  var title = isEN ? '\uD83D\uDCDA Related Articles' : '\uD83D\uDCDA Art\u00edculos relacionados';
  var cta = isEN ? 'Read article \u2192' : 'Leer art\u00edculo \u2192';
  var section = document.createElement('div');
  section.className = 'related-section';
  var html = '<h2 class="related-title">'+title+'</h2><div class="related-grid">';
  for(var k=0;k<picks.length;k++){
    var p = picks[k];
    var img = CAT_IMGS[p.c] || DEFAULT_IMG;
    html += '<a href="'+basePath+p.s+'" class="related-card">' +
      '<img class="related-img" src="'+img+'" alt="'+p.t+'" loading="lazy" width="400" height="200">' +
      '<div class="related-body">' +
      '<div class="related-cat">'+p.c+'</div>' +
      '<p class="related-card-title">'+p.t+'</p>' +
      '<div class="related-arrow">'+cta+'</div>' +
      '</div></a>';
  }
  html += '</div>';
  section.innerHTML = html;

  /* ── Inject after author card or before CTA ── */
  var author = document.querySelector('.author-card');
  var ctaBox = document.querySelector('.cta-box');
  if(author && author.parentNode){
    author.parentNode.insertBefore(section, author.nextSibling);
  } else if(ctaBox && ctaBox.parentNode){
    ctaBox.parentNode.insertBefore(section, ctaBox);
  } else {
    var content = document.querySelector('.content');
    if(content) content.appendChild(section);
  }

})();
