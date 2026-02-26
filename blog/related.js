/* Related Articles — shows 4 related posts based on category */
(function(){
  'use strict';

  /* ── Article database ── */
  var DB=[
{s:'alimentos-antiinflamatorios-runners',t:'15 Alimentos Antiinflamatorios para Runners',c:'Nutricion'},
{s:'apple-watch-running-review',t:'Apple Watch para Running: \u00bfMerece la Pena?',c:'Relojes GPS'},
{s:'asics-gel-nimbus-26-vs-nike-pegasus-41',t:'ASICS Gel-Nimbus 26 vs Nike Pegasus 41',c:'Zapatillas'},
{s:'auriculares-conduccion-osea-vs-in-ear-running',t:'Conducci\u00f3n \u00d3sea vs In-Ear para Correr',c:'Equipamiento'},
{s:'auriculares-running-natacion',t:'Mejores Auriculares para Running y Nataci\u00f3n',c:'Equipamiento'},
{s:'ayuno-intermitente-running',t:'Ayuno Intermitente y Running',c:'Nutricion'},
{s:'beneficios-correr-en-grupo',t:'7 Beneficios de Correr en Grupo',c:'Entrenamiento'},
{s:'beneficios-de-correr',t:'15 Beneficios de Correr Respaldados por la Ciencia',c:'Entrenamiento'},
{s:'cafeina-running-rendimiento',t:'Cafe\u00edna y Running: Mejora tu Rendimiento',c:'Nutricion'},
{s:'calcetines-running',t:'Los 8 Mejores Calcetines para Running',c:'Equipamiento'},
{s:'carga-hidratos-maraton',t:'Carga de Hidratos antes de un Marat\u00f3n',c:'Nutricion'},
{s:'carreras-trail-principiantes',t:'10 Mejores Carreras de Trail para Principiantes',c:'Trail Running'},
{s:'chalecos-hidratacion-running',t:'7 Mejores Chalecos de Hidrataci\u00f3n',c:'Equipamiento'},
{s:'chubasqueros-running',t:'8 Mejores Chubasqueros para Running',c:'Equipamiento'},
{s:'cinturones-running',t:'8 Mejores Cinturones para Running',c:'Equipamiento'},
{s:'como-calentar-antes-de-correr',t:'C\u00f3mo Calentar Antes de Correr',c:'Entrenamiento'},
{s:'como-correr-mas-rapido',t:'C\u00f3mo Correr M\u00e1s R\u00e1pido: 12 Claves',c:'Entrenamiento'},
{s:'como-elegir-reloj-gps-running',t:'C\u00f3mo Elegir un Reloj GPS para Running',c:'Relojes GPS'},
{s:'como-preparar-primera-carrera-5k',t:'C\u00f3mo Preparar tu Primera 5K',c:'Entrenamiento'},
{s:'como-respirar-al-correr',t:'C\u00f3mo Respirar al Correr: Gu\u00eda Completa',c:'Entrenamiento'},
{s:'coros-pace-3-review',t:'COROS PACE 3: Review Completa',c:'Relojes GPS'},
{s:'correr-en-invierno',t:'Correr en Invierno: Gu\u00eda Completa',c:'Entrenamiento'},
{s:'creatina-para-runners',t:'Creatina para Corredores: 7 Beneficios',c:'Nutricion'},
{s:'dieta-runner-que-comer',t:'Dieta para Runners: Qu\u00e9 Comer',c:'Nutricion'},
{s:'diferencias-trail-vs-asfalto',t:'Trail vs Asfalto: Diferencias y Ventajas',c:'Trail Running'},
{s:'dolor-rodilla-al-correr',t:'Dolor de Rodilla al Correr: Causas y Tratamiento',c:'Lesiones'},
{s:'empezar-a-correr-guia-principiantes',t:'C\u00f3mo Empezar a Correr desde Cero',c:'Entrenamiento'},
{s:'empezar-trail-running',t:'C\u00f3mo Empezar en Trail Running',c:'Trail Running'},
{s:'entrenamiento-por-zonas-running',t:'Entrenamiento por Zonas: FC, Ritmo y Potencia',c:'Entrenamiento'},
{s:'errores-comunes-corredores',t:'10 Errores Comunes de los Corredores',c:'Entrenamiento'},
{s:'estiramientos-antes-despues-correr',t:'Estiramientos Antes y Despu\u00e9s de Correr',c:'Entrenamiento'},
{s:'estiramientos-post-carrera',t:'Estiramientos Post-Carrera: Recupera R\u00e1pido',c:'Lesiones'},
{s:'fascitis-plantar-corredores',t:'Fascitis Plantar en Corredores',c:'Lesiones'},
{s:'foam-rollers-runners',t:'7 Mejores Foam Rollers para Corredores',c:'Equipamiento'},
{s:'garmin-forerunner-265-vs-coros-pace-3',t:'Garmin Forerunner 265 vs COROS PACE 3',c:'Relojes GPS'},
{s:'garmin-forerunner-55-review',t:'Garmin Forerunner 55: Review Completa',c:'Relojes GPS'},
{s:'garmin-venu-3-review',t:'Garmin Venu 3: Review para Runners',c:'Relojes GPS'},
{s:'gorras-running',t:'8 Mejores Gorras para Running',c:'Equipamiento'},
{s:'hidratacion-running-guia-completa',t:'Hidrataci\u00f3n para Running: Gu\u00eda Completa',c:'Nutricion'},
{s:'hoka-clifton-9-vs-bondi-8',t:'Hoka Clifton 9 vs Bondi 8',c:'Zapatillas'},
{s:'jbl-reflect-flow-pro-review',t:'JBL Reflect Flow Pro: Review para Runners',c:'Equipamiento'},
{s:'lamparas-frontales-running',t:'7 Mejores L\u00e1mparas Frontales para Running',c:'Equipamiento'},
{s:'mallas-running',t:'10 Mejores Mallas para Running',c:'Equipamiento'},
{s:'material-trail-running',t:'Material Imprescindible para Trail Running',c:'Equipamiento'},
{s:'mejor-reloj-gps-running-calidad-precio',t:'Mejor Reloj GPS Calidad-Precio',c:'Relojes GPS'},
{s:'mejores-apps-running',t:'10 Mejores Apps para Correr Gratis',c:'Entrenamiento'},
{s:'mejores-auriculares-baratos-running',t:'8 Mejores Auriculares Baratos para Running',c:'Equipamiento'},
{s:'mejores-auriculares-running',t:'Mejores Auriculares para Correr',c:'Equipamiento'},
{s:'mejores-creatinas-running',t:'8 Mejores Creatinas para Runners',c:'Nutricion'},
{s:'mejores-rutas-correr-barcelona',t:'Mejores Rutas para Correr en Barcelona',c:'Rutas'},
{s:'mejores-rutas-correr-madrid',t:'10 Mejores Rutas para Correr en Madrid',c:'Rutas'},
{s:'mejores-rutas-correr-malaga',t:'10 Mejores Rutas para Correr en M\u00e1laga',c:'Rutas'},
{s:'mejores-rutas-correr-sevilla',t:'10 Mejores Rutas para Correr en Sevilla',c:'Rutas'},
{s:'mejores-rutas-correr-valencia',t:'Mejores Rutas para Correr en Valencia',c:'Rutas'},
{s:'mejores-suplementos-runners',t:'Mejores Suplementos para Runners',c:'Nutricion'},
{s:'mejores-zapatillas-running-asfalto',t:'10 Mejores Zapatillas para Asfalto',c:'Zapatillas'},
{s:'mejores-zapatillas-running-baratas',t:'Mejores Zapatillas Baratas para Running',c:'Zapatillas'},
{s:'mejores-zapatillas-running-mujer',t:'10 Mejores Zapatillas Running Mujer',c:'Zapatillas'},
{s:'mejores-zapatillas-running-principiantes',t:'Mejores Zapatillas para Principiantes',c:'Zapatillas'},
{s:'mejores-zapatillas-running-sobrepeso',t:'Zapatillas Running para Sobrepeso',c:'Zapatillas'},
{s:'nike-pegasus-41-vs-brooks-ghost-16',t:'Nike Pegasus 41 vs Brooks Ghost 16',c:'Zapatillas'},
{s:'nutricion-dia-de-carrera',t:'Nutrici\u00f3n D\u00eda de Carrera: Antes, Durante y Despu\u00e9s',c:'Nutricion'},
{s:'nutricion-para-runners',t:'Qu\u00e9 Comer Antes y Despu\u00e9s de Correr',c:'Nutricion'},
{s:'pack-basico-running-principiantes',t:'Pack B\u00e1sico de Running para Empezar',c:'Equipamiento'},
{s:'periostitis-tibial-running',t:'Periostitis Tibial: Causas y Tratamiento',c:'Lesiones'},
{s:'plan-entrenamiento-10k',t:'Plan de Entrenamiento 10K',c:'Entrenamiento'},
{s:'plan-entrenamiento-media-maraton',t:'Plan Entrenamiento Media Marat\u00f3n: 12 Semanas',c:'Entrenamiento'},
{s:'polar-pacer-pro-review',t:'Polar Pacer Pro: Review Completa',c:'Relojes GPS'},
{s:'potencia-en-running',t:'Potencia en Running: Qu\u00e9 Es y C\u00f3mo Entrenar',c:'Entrenamiento'},
{s:'prevenir-lesiones-running',t:'C\u00f3mo Prevenir Lesiones al Correr',c:'Lesiones'},
{s:'proteinas-para-runners',t:'Prote\u00ednas para Runners: Cu\u00e1nta Necesitas',c:'Nutricion'},
{s:'que-comer-antes-de-correr',t:'Qu\u00e9 Comer Antes de Correr',c:'Nutricion'},
{s:'que-gel-energetico-usar-maraton',t:'Qu\u00e9 Gel Energ\u00e9tico Usar en un Marat\u00f3n',c:'Nutricion'},
{s:'que-zapatillas-running-comprar-segun-nivel',t:'Zapatillas de Running Seg\u00fan tu Nivel',c:'Zapatillas'},
{s:'rodilla-del-corredor',t:'Rodilla del Corredor: Gu\u00eda Completa',c:'Lesiones'},
{s:'ropa-tecnica-running',t:'Ropa T\u00e9cnica para Correr: Gu\u00eda por Temperatura',c:'Equipamiento'},
{s:'salomon-speedcross-6-vs-hoka-speedgoat-6',t:'Salomon Speedcross 6 vs Hoka Speedgoat 6',c:'Trail Running'},
{s:'shokz-openrun-pro-2-review',t:'Shokz OpenRun Pro 2: Review Completa',c:'Equipamiento'},
{s:'smartwatch-vs-reloj-gps-running',t:'Smartwatch vs Reloj GPS: \u00bfCu\u00e1l Necesitas?',c:'Relojes GPS'},
{s:'strava-vs-garmin-connect',t:'Strava vs Garmin Connect: Comparativa',c:'Entrenamiento'},
{s:'tendinitis-aquiles-running',t:'Tendinitis de Aquiles en Runners',c:'Lesiones'},
{s:'variabilidad-cardiaca-running',t:'Variabilidad Card\u00edaca (HRV) para Runners',c:'Entrenamiento'},
{s:'zapatillas-running-pronadores',t:'Zapatillas para Pronadores: Gu\u00eda Completa',c:'Zapatillas'}
  ];

  /* Category groups for broader matching */
  var GROUPS = {
    'Entrenamiento':['Entrenamiento','Trail Running'],
    'Trail Running':['Trail Running','Entrenamiento','Rutas'],
    'Nutricion':['Nutricion'],
    'Zapatillas':['Zapatillas','Equipamiento'],
    'Equipamiento':['Equipamiento','Zapatillas'],
    'Relojes GPS':['Relojes GPS','Equipamiento'],
    'Lesiones':['Lesiones','Entrenamiento'],
    'Rutas':['Rutas','Entrenamiento'],
  };

  /* ── CSS ── */
  var css = document.createElement('style');
  css.textContent = [
    '.related-section{margin:40px 0 32px;padding:32px 0 0;border-top:1px solid rgba(255,255,255,.06)}',
    '.related-title{font-size:1.1rem;font-weight:800;color:#fff;margin:0 0 20px}',
    '.related-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}',
    '.related-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:18px 16px;text-decoration:none;transition:all .25s;display:block}',
    '.related-card:hover{background:rgba(255,255,255,.06);border-color:rgba(249,115,22,.3);transform:translateY(-2px)}',
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
  var section = document.createElement('div');
  section.className = 'related-section';
  var html = '<h2 class="related-title">\uD83D\uDCDA Art\u00edculos relacionados</h2><div class="related-grid">';
  for(var k=0;k<picks.length;k++){
    var p = picks[k];
    html += '<a href="/blog/'+p.s+'" class="related-card">' +
      '<div class="related-cat">'+p.c+'</div>' +
      '<p class="related-card-title">'+p.t+'</p>' +
      '<div class="related-arrow">Leer art\u00edculo \u2192</div>' +
    '</a>';
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
