/* Place Links — shows related blog articles + events link on place pages */
(function(){
  'use strict';

  /* ── Place → City mapping ── */
  var PLACE_CITY={
    'retiro':'madrid','casa-de-campo':'madrid','madrid-rio':'madrid',
    'parque-juan-carlos':'madrid','parque-del-oeste':'madrid',
    'montjuic':'barcelona','serra-de-collserola':'barcelona','parc-de-la-ciutadella':'barcelona',
    'parque-del-turia':'valencia','parque-del-alamillo':'sevilla','parque-de-maria-luisa':'sevilla',
    'central-park':'new-york','hyde-park':'london','regents-park':'london',
    'golden-gate-park':'san-francisco','vondelpark':'amsterdam','bois-de-boulogne':'paris',
    'tiergarten':'berlin','botanisk-have':'copenhagen','villa-borghese':'rome',
    'englischer-garten':'munich','phoenix-park':'dublin','griffith-park':'los-angeles',
    'stanley-park':'vancouver','ibirapuera':'sao-paulo','chapultepec':'mexico-city',
    'parque-carolina':'quito','parque-del-este':'buenos-aires',
    'kings-park':'melbourne','gardens-by-the-bay':'singapore'
  };

  /* ── Cities with /events/ pages ── */
  var EVENTS_CITIES=['madrid','barcelona','valencia','sevilla','malaga',
    'london','new-york','paris','berlin','amsterdam','rome','dublin',
    'mexico-city','buenos-aires','lisbon'];

  /* ── Blog articles by city ── */
  var CITY_BLOG_ES={
    'madrid':[
      {s:'mejores-rutas-correr-madrid',t:'10 Mejores Rutas para Correr en Madrid',c:'Rutas'},
      {s:'como-preparar-primera-carrera-5k',t:'Cómo Preparar tu Primera 5K',c:'Entrenamiento'}
    ],
    'barcelona':[
      {s:'mejores-rutas-correr-barcelona',t:'Mejores Rutas para Correr en Barcelona',c:'Rutas'},
      {s:'empezar-a-correr-guia-principiantes',t:'Cómo Empezar a Correr desde Cero',c:'Entrenamiento'}
    ],
    'valencia':[
      {s:'mejores-rutas-correr-valencia',t:'Mejores Rutas para Correr en Valencia',c:'Rutas'},
      {s:'plan-entrenamiento-10k',t:'Plan de Entrenamiento 10K',c:'Entrenamiento'}
    ],
    'sevilla':[
      {s:'mejores-rutas-correr-sevilla',t:'10 Mejores Rutas para Correr en Sevilla',c:'Rutas'},
      {s:'como-correr-mas-rapido',t:'Cómo Correr Más Rápido',c:'Entrenamiento'}
    ]
  };
  var DEF_BLOG=[
    {s:'empezar-a-correr-guia-principiantes',t:'Cómo Empezar a Correr desde Cero',c:'Entrenamiento'},
    {s:'mejores-zapatillas-running-asfalto',t:'10 Mejores Zapatillas para Asfalto',c:'Zapatillas'}
  ];

  /* ── Detect place slug ── */
  var placeSlug=location.pathname.replace(/\/$/,'').split('/').pop();
  var citySlug=PLACE_CITY[placeSlug];
  if(!citySlug) return;

  /* ── CSS ── */
  var css=document.createElement('style');
  css.textContent=[
    '.place-links-section{margin:48px 0 32px;padding:32px 0 0;border-top:1px solid rgba(255,255,255,.06)}',
    '.place-links-title{font-size:1.1rem;font-weight:800;color:#fff;margin:0 0 20px}',
    '.place-links-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}',
    '.pl-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:18px 16px;text-decoration:none;transition:all .25s;display:block}',
    '.pl-card:hover{background:rgba(255,255,255,.06);border-color:rgba(249,115,22,.3);transform:translateY(-2px)}',
    '.pl-cat{font-size:.7rem;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px}',
    '.pl-title{font-size:.9rem;font-weight:700;color:#cbd5e1;line-height:1.4;margin:0;transition:color .2s}',
    '.pl-card:hover .pl-title{color:#fff}',
    '.pl-arrow{font-size:.75rem;color:#64748b;margin-top:8px;transition:color .2s}',
    '.pl-card:hover .pl-arrow{color:#f97316}',
    '@media(max-width:640px){.place-links-grid{grid-template-columns:1fr}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ── Build links section ── */
  var section=document.createElement('div');
  section.className='place-links-section';
  var html='<h2 class="place-links-title">📚 Guías y recursos para runners</h2><div class="place-links-grid">';

  /* Events card */
  if(EVENTS_CITIES.indexOf(citySlug)>=0){
    html+='<a href="/events/'+citySlug+'" class="pl-card">'+
      '<div class="pl-cat">Eventos</div>'+
      '<p class="pl-title">Carreras y eventos de running</p>'+
      '<div class="pl-arrow">Ver eventos →</div></a>';
  }

  /* Blog cards */
  var articles=CITY_BLOG_ES[citySlug]||DEF_BLOG;
  for(var i=0;i<articles.length;i++){
    html+='<a href="/blog/'+articles[i].s+'" class="pl-card">'+
      '<div class="pl-cat">'+articles[i].c+'</div>'+
      '<p class="pl-title">'+articles[i].t+'</p>'+
      '<div class="pl-arrow">Leer artículo →</div></a>';
  }

  html+='</div>';
  section.innerHTML=html;

  /* ── Inject before CTA box ── */
  var cta=document.querySelector('.cta-box');
  if(cta&&cta.parentNode){cta.parentNode.insertBefore(section,cta);}
  else{var c=document.querySelector('.content');if(c)c.appendChild(section);}
})();
