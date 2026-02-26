/* Blog Links — shows 4 related blog article cards on city pages */
(function(){
  'use strict';

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
    '.blog-links-section{margin:48px 0 32px;padding:32px 0 0;border-top:1px solid rgba(255,255,255,.06)}',
    '.blog-links-title{font-size:1.1rem;font-weight:800;color:#fff;margin:0 0 20px}',
    '.blog-links-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}',
    '.blog-link-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:18px 16px;text-decoration:none;transition:all .25s;display:block}',
    '.blog-link-card:hover{background:rgba(255,255,255,.06);border-color:rgba(249,115,22,.3);transform:translateY(-2px)}',
    '.blog-link-cat{font-size:.7rem;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px}',
    '.blog-link-card-title{font-size:.9rem;font-weight:700;color:#cbd5e1;line-height:1.4;margin:0;transition:color .2s}',
    '.blog-link-card:hover .blog-link-card-title{color:#fff}',
    '.blog-link-arrow{font-size:.75rem;color:#64748b;margin-top:8px;transition:color .2s}',
    '.blog-link-card:hover .blog-link-arrow{color:#f97316}',
    '@media(max-width:640px){.blog-links-grid{grid-template-columns:1fr}}'
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

  /* ── Inject before "other cities" section ── */
  var otherCities=document.querySelector('.other-cities-section');
  if(otherCities && otherCities.parentNode){
    otherCities.parentNode.insertBefore(section,otherCities);
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
