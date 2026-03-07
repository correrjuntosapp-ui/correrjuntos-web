/* Blog Links — shows places, events + blog article cards on city pages */
(function(){
  'use strict';

  /* ── City → Places mapping ── */
  var CITY_PLACES={
    'madrid':[
      {s:'retiro',n:'Parque del Retiro'},{s:'casa-de-campo',n:'Casa de Campo'},
      {s:'madrid-rio',n:'Madrid Río'},{s:'parque-juan-carlos',n:'Parque Juan Carlos I'},
      {s:'parque-del-oeste',n:'Parque del Oeste'}
    ],
    'barcelona':[
      {s:'montjuic',n:'Montjuïc'},{s:'serra-de-collserola',n:'Serra de Collserola'},
      {s:'parc-de-la-ciutadella',n:'Parc de la Ciutadella'}
    ],
    'valencia':[{s:'parque-del-turia',n:'Jardín del Turia'}],
    'sevilla':[{s:'parque-del-alamillo',n:'Parque del Alamillo'},{s:'parque-de-maria-luisa',n:'Parque de María Luisa'}],
    'london':[{s:'hyde-park',n:'Hyde Park'},{s:'regents-park',n:'Regent\'s Park'}],
    'new-york':[{s:'central-park',n:'Central Park'}],
    'paris':[{s:'bois-de-boulogne',n:'Bois de Boulogne'}],
    'berlin':[{s:'tiergarten',n:'Tiergarten'}],
    'amsterdam':[{s:'vondelpark',n:'Vondelpark'}],
    'rome':[{s:'villa-borghese',n:'Villa Borghese'}],
    'dublin':[{s:'phoenix-park',n:'Phoenix Park'}],
    'san-francisco':[{s:'golden-gate-park',n:'Golden Gate Park'}],
    'los-angeles':[{s:'griffith-park',n:'Griffith Park'}],
    'vancouver':[{s:'stanley-park',n:'Stanley Park'}],
    'mexico-city':[{s:'chapultepec',n:'Bosque de Chapultepec'}],
    'buenos-aires':[{s:'parque-del-este',n:'Parque 3 de Febrero'}],
    'sao-paulo':[{s:'ibirapuera',n:'Parque Ibirapuera'}],
    'munich':[{s:'englischer-garten',n:'Englischer Garten'}],
    'copenhagen':[{s:'botanisk-have',n:'Botanisk Have'}],
    'singapore':[{s:'gardens-by-the-bay',n:'Gardens by the Bay'}],
    'melbourne':[{s:'kings-park',n:'Kings Park'}],
    'quito':[{s:'parque-carolina',n:'Parque La Carolina'}]
  };

  /* ── Cities with /events/ pages ── */
  var EVENTS_CITIES=['madrid','barcelona','valencia','sevilla','malaga',
    'london','new-york','paris','berlin','amsterdam','rome','dublin',
    'mexico-city','buenos-aires','lisbon'];

  /* ── City-specific article mappings ── */
  var CITY_BLOG={
    'madrid':[
      {s:'mejores-rutas-correr-madrid',t:'10 Mejores Rutas para Correr en Madrid',c:'Rutas'},
      {s:'como-preparar-primera-carrera-5k',t:'C\u00f3mo Preparar tu Primera 5K',c:'Entrenamiento'},
      {s:'ropa-tecnica-running',t:'Ropa T\u00e9cnica para Correr: Gu\u00eda por Temperatura',c:'Equipamiento'},
      {s:'hidratacion-running-guia-completa',t:'Hidrataci\u00f3n para Running: Gu\u00eda Completa',c:'Nutrici\u00f3n'}
    ],
    'barcelona':[
      {s:'mejores-rutas-correr-barcelona',t:'Mejores Rutas para Correr en Barcelona',c:'Rutas'},
      {s:'empezar-a-correr-guia-principiantes',t:'C\u00f3mo Empezar a Correr desde Cero',c:'Entrenamiento'},
      {s:'mejores-zapatillas-running-asfalto',t:'10 Mejores Zapatillas para Asfalto',c:'Zapatillas'},
      {s:'nutricion-para-runners',t:'Qu\u00e9 Comer Antes y Despu\u00e9s de Correr',c:'Nutrici\u00f3n'}
    ],
    'valencia':[
      {s:'mejores-rutas-correr-valencia',t:'Mejores Rutas para Correr en Valencia',c:'Rutas'},
      {s:'plan-entrenamiento-10k',t:'Plan de Entrenamiento 10K',c:'Entrenamiento'},
      {s:'mejores-zapatillas-running-principiantes',t:'Mejores Zapatillas para Principiantes',c:'Zapatillas'},
      {s:'que-comer-antes-de-correr',t:'Qu\u00e9 Comer Antes de Correr',c:'Nutrici\u00f3n'}
    ],
    'malaga':[
      {s:'mejores-rutas-correr-malaga',t:'10 Mejores Rutas para Correr en M\u00e1laga',c:'Rutas'},
      {s:'correr-en-invierno',t:'Correr en Invierno: Gu\u00eda Completa',c:'Entrenamiento'},
      {s:'chalecos-hidratacion-running',t:'7 Mejores Chalecos de Hidrataci\u00f3n',c:'Equipamiento'},
      {s:'fascitis-plantar-corredores',t:'Fascitis Plantar en Corredores',c:'Lesiones'}
    ],
    'sevilla':[
      {s:'mejores-rutas-correr-sevilla',t:'10 Mejores Rutas para Correr en Sevilla',c:'Rutas'},
      {s:'como-correr-mas-rapido',t:'C\u00f3mo Correr M\u00e1s R\u00e1pido: 12 Claves',c:'Entrenamiento'},
      {s:'gorras-running',t:'8 Mejores Gorras para Running',c:'Equipamiento'},
      {s:'hidratacion-running-guia-completa',t:'Hidrataci\u00f3n para Running: Gu\u00eda Completa',c:'Nutrici\u00f3n'}
    ]
  };

  /* ── Default articles by language ── */
  var DEF_ES=[
    {s:'empezar-a-correr-guia-principiantes',t:'C\u00f3mo Empezar a Correr desde Cero',c:'Entrenamiento'},
    {s:'mejores-zapatillas-running-asfalto',t:'10 Mejores Zapatillas para Asfalto',c:'Zapatillas'},
    {s:'nutricion-para-runners',t:'Qu\u00e9 Comer Antes y Despu\u00e9s de Correr',c:'Nutrici\u00f3n'},
    {s:'como-preparar-primera-carrera-5k',t:'C\u00f3mo Preparar tu Primera 5K',c:'Entrenamiento'}
  ];
  var DEF_EN=[
    {s:'en/how-to-start-running-beginners-guide',t:'How to Start Running from Scratch',c:'Training'},
    {s:'en/best-road-running-shoes',t:'10 Best Road Running Shoes',c:'Shoes'},
    {s:'en/nutrition-for-runners',t:'What to Eat Before and After Running',c:'Nutrition'},
    {s:'en/how-to-prepare-first-5k-race',t:'How to Prepare Your First 5K',c:'Training'}
  ];

  /* ── Detect city & language ── */
  var citySlug=location.pathname.replace(/\/$/,'').split('/').pop();
  var lang=document.documentElement.lang||'es';
  var isEN=lang.startsWith('en');

  /* ── Select articles ── */
  var articles=CITY_BLOG[citySlug]||(isEN?DEF_EN:DEF_ES);
  if(!articles||articles.length<2) return;

  /* ── CSS (matches related.js style) ── */
  var css=document.createElement('style');
  css.textContent=[
    '.blog-links-section{margin:48px 0 32px;padding:32px 0 0;border-top:1px solid #efe6db}',
    '.blog-links-title{font-size:1.1rem;font-weight:800;color:#3d3229;margin:0 0 20px}',
    '.blog-links-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}',
    '.blog-link-card{background:#fffcf9;border:1px solid #efe6db;border-radius:14px;padding:18px 16px;text-decoration:none;transition:all .25s;display:block;box-shadow:0 2px 8px rgba(0,0,0,.04)}',
    '.blog-link-card:hover{background:#fff;border-color:rgba(249,115,22,.3);transform:translateY(-2px);box-shadow:0 8px 24px rgba(249,115,22,.1)}',
    '.blog-link-cat{font-size:.7rem;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px}',
    '.blog-link-card-title{font-size:.9rem;font-weight:700;color:#3d3229;line-height:1.4;margin:0;transition:color .2s}',
    '.blog-link-card:hover .blog-link-card-title{color:#f97316}',
    '.blog-link-arrow{font-size:.75rem;color:#8b7355;margin-top:8px;transition:color .2s}',
    '.blog-link-card:hover .blog-link-arrow{color:#f97316}',
    '@media(max-width:640px){.blog-links-grid{grid-template-columns:1fr}}',
    '.dark-mode .blog-links-section{border-top-color:rgba(255,255,255,.06)}',
    '.dark-mode .blog-links-title{color:#fff}',
    '.dark-mode .blog-link-card{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08);box-shadow:none}',
    '.dark-mode .blog-link-card:hover{background:rgba(255,255,255,.06)}',
    '.dark-mode .blog-link-card-title{color:#cbd5e1}',
    '.dark-mode .blog-link-card:hover .blog-link-card-title{color:#fff}',
    '.dark-mode .blog-link-arrow{color:#64748b}'
  ].join('\n');
  document.head.appendChild(css);

  /* ── Build HTML ── */
  var title=isEN?'\ud83d\udcda Running Guides & Tips':'\ud83d\udcda Gu\u00edas y consejos para runners';
  var readText=isEN?'Read article \u2192':'Leer art\u00edculo \u2192';

  var section=document.createElement('div');
  section.className='blog-links-section';
  var html='<h2 class="blog-links-title">'+title+'</h2><div class="blog-links-grid">';
  for(var k=0;k<articles.length;k++){
    var a=articles[k];
    html+='<a href="/blog/'+a.s+'" class="blog-link-card">'+
      '<div class="blog-link-cat">'+a.c+'</div>'+
      '<p class="blog-link-card-title">'+a.t+'</p>'+
      '<div class="blog-link-arrow">'+readText+'</div>'+
    '</a>';
  }
  html+='</div>';
  section.innerHTML=html;

  /* ── Build Places & Events section ── */
  var places=CITY_PLACES[citySlug]||[];
  var hasEvents=EVENTS_CITIES.indexOf(citySlug)>=0;

  if(places.length>0||hasEvents){
    var peCss=document.createElement('style');
    peCss.textContent=[
      '.places-events-section{margin:48px 0 0;padding:32px 0 0;border-top:1px solid #efe6db}',
      '.pe-title{font-size:1.1rem;font-weight:800;color:#3d3229;margin:0 0 20px}',
      '.pe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;margin-bottom:24px}',
      '.pe-card{background:#fffcf9;border:1px solid #efe6db;border-radius:14px;padding:18px 16px;text-decoration:none;transition:all .25s;display:block;box-shadow:0 2px 8px rgba(0,0,0,.04)}',
      '.pe-card:hover{background:#fff;border-color:rgba(249,115,22,.3);transform:translateY(-2px);box-shadow:0 8px 24px rgba(249,115,22,.1)}',
      '.pe-cat{font-size:.7rem;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px}',
      '.pe-name{font-size:.9rem;font-weight:700;color:#3d3229;margin:0;transition:color .2s}',
      '.pe-card:hover .pe-name{color:#f97316}',
      '.pe-arrow{font-size:.75rem;color:#8b7355;margin-top:8px;transition:color .2s}',
      '.pe-card:hover .pe-arrow{color:#f97316}',
      '.dark-mode .places-events-section{border-top-color:rgba(255,255,255,.06)}',
      '.dark-mode .pe-title{color:#fff}',
      '.dark-mode .pe-card{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08);box-shadow:none}',
      '.dark-mode .pe-card:hover{background:rgba(255,255,255,.06)}',
      '.dark-mode .pe-name{color:#cbd5e1}',
      '.dark-mode .pe-card:hover .pe-name{color:#fff}',
      '.dark-mode .pe-arrow{color:#64748b}'
    ].join('\n');
    document.head.appendChild(peCss);

    var peSection=document.createElement('div');
    peSection.className='places-events-section';
    var peHtml='<h2 class="pe-title">📍 Lugares y eventos</h2><div class="pe-grid">';
    for(var pi=0;pi<places.length&&pi<5;pi++){
      peHtml+='<a href="/places/'+places[pi].s+'" class="pe-card">'+
        '<div class="pe-cat">Lugar</div>'+
        '<p class="pe-name">'+places[pi].n+'</p>'+
        '<div class="pe-arrow">Ver guía →</div></a>';
    }
    if(hasEvents){
      peHtml+='<a href="/events/'+citySlug+'" class="pe-card">'+
        '<div class="pe-cat">Eventos</div>'+
        '<p class="pe-name">Carreras y quedadas</p>'+
        '<div class="pe-arrow">Ver eventos →</div></a>';
    }
    peHtml+='</div>';
    peSection.innerHTML=peHtml;

    var otherCities=document.querySelector('.other-cities-section');
    if(otherCities&&otherCities.parentNode){
      otherCities.parentNode.insertBefore(peSection,otherCities);
    } else {
      var ctaBox2=document.querySelector('.cta-box');
      if(ctaBox2&&ctaBox2.parentNode) ctaBox2.parentNode.insertBefore(peSection,ctaBox2);
    }
  }

  /* ── Inject blog section before places/events or "other cities" section ── */
  var insertBefore=document.querySelector('.places-events-section')||document.querySelector('.other-cities-section');
  if(insertBefore && insertBefore.parentNode){
    insertBefore.parentNode.insertBefore(section,insertBefore);
  } else {
    var ctaBox=document.querySelector('.cta-box');
    if(ctaBox && ctaBox.parentNode){
      ctaBox.parentNode.insertBefore(section,ctaBox);
    } else {
      var content=document.querySelector('.content');
      if(content) content.appendChild(section);
    }
  }
})();
