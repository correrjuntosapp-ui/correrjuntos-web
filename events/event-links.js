/* Event Links — shows place cards + blog articles on event pages */
(function(){
  'use strict';

  /* ── City → Places mapping ── */
  var CITY_PLACES={
    'madrid':[
      {s:'retiro',n:'Parque del Retiro'},
      {s:'casa-de-campo',n:'Casa de Campo'},
      {s:'madrid-rio',n:'Madrid Río'}
    ],
    'barcelona':[
      {s:'montjuic',n:'Montjuïc'},
      {s:'serra-de-collserola',n:'Serra de Collserola'},
      {s:'parc-de-la-ciutadella',n:'Parc de la Ciutadella'}
    ],
    'valencia':[{s:'parque-del-turia',n:'Jardín del Turia'}],
    'sevilla':[
      {s:'parque-del-alamillo',n:'Parque del Alamillo'},
      {s:'parque-de-maria-luisa',n:'Parque de María Luisa'}
    ],
    'london':[{s:'hyde-park',n:'Hyde Park'},{s:'regents-park',n:'Regent\'s Park'}],
    'new-york':[{s:'central-park',n:'Central Park'}],
    'paris':[{s:'bois-de-boulogne',n:'Bois de Boulogne'}],
    'berlin':[{s:'tiergarten',n:'Tiergarten'}],
    'amsterdam':[{s:'vondelpark',n:'Vondelpark'}],
    'rome':[{s:'villa-borghese',n:'Villa Borghese'}],
    'dublin':[{s:'phoenix-park',n:'Phoenix Park'}],
    'mexico-city':[{s:'chapultepec',n:'Bosque de Chapultepec'}],
    'buenos-aires':[{s:'parque-del-este',n:'Parque 3 de Febrero'}]
  };

  /* ── Blog articles by city ── */
  var CITY_BLOG={
    'madrid':[{s:'mejores-rutas-correr-madrid',t:'10 Mejores Rutas para Correr en Madrid',c:'Rutas'}],
    'barcelona':[{s:'mejores-rutas-correr-barcelona',t:'Mejores Rutas para Correr en Barcelona',c:'Rutas'}],
    'valencia':[{s:'mejores-rutas-correr-valencia',t:'Mejores Rutas para Correr en Valencia',c:'Rutas'}],
    'sevilla':[{s:'mejores-rutas-correr-sevilla',t:'Mejores Rutas para Correr en Sevilla',c:'Rutas'}],
    'malaga':[{s:'mejores-rutas-correr-malaga',t:'10 Mejores Rutas para Correr en Málaga',c:'Rutas'}]
  };
  var DEF_BLOG=[{s:'empezar-a-correr-guia-principiantes',t:'Cómo Empezar a Correr desde Cero',c:'Entrenamiento'}];

  /* ── Detect city slug ── */
  var citySlug=location.pathname.replace(/\/$/,'').split('/').pop();
  var places=CITY_PLACES[citySlug]||[];

  /* ── CSS ── */
  var css=document.createElement('style');
  css.textContent=[
    '.event-links-section{margin:48px 0 32px;padding:32px 0 0;border-top:1px solid rgba(255,255,255,.06)}',
    '.event-links-title{font-size:1.1rem;font-weight:800;color:#fff;margin:0 0 20px}',
    '.event-links-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}',
    '.el-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:18px 16px;text-decoration:none;transition:all .25s;display:block}',
    '.el-card:hover{background:rgba(255,255,255,.06);border-color:rgba(249,115,22,.3);transform:translateY(-2px)}',
    '.el-cat{font-size:.7rem;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px}',
    '.el-title{font-size:.9rem;font-weight:700;color:#cbd5e1;line-height:1.4;margin:0}',
    '.el-card:hover .el-title{color:#fff}',
    '.el-arrow{font-size:.75rem;color:#64748b;margin-top:8px}',
    '.el-card:hover .el-arrow{color:#f97316}',
    '@media(max-width:640px){.event-links-grid{grid-template-columns:1fr}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ── Build section ── */
  var section=document.createElement('div');
  section.className='event-links-section';
  var html='<h2 class="event-links-title">📍 Explora más</h2><div class="event-links-grid">';

  /* Place cards */
  for(var i=0;i<places.length&&i<3;i++){
    html+='<a href="/places/'+places[i].s+'" class="el-card">'+
      '<div class="el-cat">Lugar</div>'+
      '<p class="el-title">Correr en '+places[i].n+'</p>'+
      '<div class="el-arrow">Ver lugar →</div></a>';
  }

  /* Blog cards */
  var articles=CITY_BLOG[citySlug]||DEF_BLOG;
  for(var j=0;j<articles.length;j++){
    html+='<a href="/blog/'+articles[j].s+'" class="el-card">'+
      '<div class="el-cat">'+articles[j].c+'</div>'+
      '<p class="el-title">'+articles[j].t+'</p>'+
      '<div class="el-arrow">Leer artículo →</div></a>';
  }

  html+='</div>';
  section.innerHTML=html;

  /* ── Inject before CTA box ── */
  var cta=document.querySelector('.cta-box');
  if(cta&&cta.parentNode){cta.parentNode.insertBefore(section,cta);}
  else{var c=document.querySelector('.content');if(c)c.appendChild(section);}
})();
