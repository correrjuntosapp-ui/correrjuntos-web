/* City Links — shows 4 city cards on blog posts for internal linking */
(function(){
  'use strict';

  /* ── City database (top 20 cities with images) ── */
  var CITIES=[
    {s:'madrid',n:'Madrid',f:'\ud83c\uddea\ud83c\uddf8',img:'photo-1539037116277-4db20889f2d4'},
    {s:'barcelona',n:'Barcelona',f:'\ud83c\uddea\ud83c\uddf8',img:'photo-1583422409516-2895a77efded'},
    {s:'london',n:'London',f:'\ud83c\uddec\ud83c\udde7',img:'photo-1513635269975-59663e0ac1ad'},
    {s:'new-york',n:'New York',f:'\ud83c\uddfa\ud83c\uddf8',img:'photo-1496442226666-8d4d0e62e6e9'},
    {s:'paris',n:'Paris',f:'\ud83c\uddeb\ud83c\uddf7',img:'photo-1502602898657-3e91760cbb34'},
    {s:'berlin',n:'Berlin',f:'\ud83c\udde9\ud83c\uddea',img:'photo-1560969184-10fe8719e047'},
    {s:'valencia',n:'Valencia',f:'\ud83c\uddea\ud83c\uddf8',img:'photo-1771370791775-4e7503add534'},
    {s:'sevilla',n:'Sevilla',f:'\ud83c\uddea\ud83c\uddf8',img:'photo-1636060823063-fe90cc147c06'},
    {s:'malaga',n:'M\u00e1laga',f:'\ud83c\uddea\ud83c\uddf8',img:'photo-1592906209472-a36b1f3782ef'},
    {s:'lisbon',n:'Lisbon',f:'\ud83c\uddf5\ud83c\uddf9',img:'photo-1555881400-74d7acaacd8b'},
    {s:'rome',n:'Rome',f:'\ud83c\uddee\ud83c\uddf9',img:'photo-1552832230-c0197dd311b5'},
    {s:'amsterdam',n:'Amsterdam',f:'\ud83c\uddf3\ud83c\uddf1',img:'photo-1534351590666-13e3e96b5017'},
    {s:'sydney',n:'Sydney',f:'\ud83c\udde6\ud83c\uddfa',img:'photo-1506973035872-a4ec16b8e8d9'},
    {s:'mexico-city',n:'Ciudad de M\u00e9xico',f:'\ud83c\uddf2\ud83c\uddfd',img:'photo-1518659526054-190340b32735'},
    {s:'buenos-aires',n:'Buenos Aires',f:'\ud83c\udde6\ud83c\uddf7',img:'photo-1589909202802-8f4aadce1849'},
    {s:'chicago',n:'Chicago',f:'\ud83c\uddfa\ud83c\uddf8',img:'photo-1494522855154-9297ac14b55f'},
    {s:'toronto',n:'Toronto',f:'\ud83c\udde8\ud83c\udde6',img:'photo-1666332865181-0e6505e75ab0'},
    {s:'melbourne',n:'Melbourne',f:'\ud83c\udde6\ud83c\uddfa',img:'photo-1514395462725-fb4566210144'},
    {s:'dubai',n:'Dubai',f:'\ud83c\udde6\ud83c\uddea',img:'photo-1512453979798-5ea266f8880c'},
    {s:'san-francisco',n:'San Francisco',f:'\ud83c\uddfa\ud83c\uddf8',img:'photo-1501594907352-04cda38ebc29'}
  ];

  /* ── Blog → City mapping (route-specific blogs) ── */
  var BLOG_CITY={
    'mejores-rutas-correr-madrid':['madrid'],
    'mejores-rutas-correr-barcelona':['barcelona'],
    'mejores-rutas-correr-valencia':['valencia'],
    'mejores-rutas-correr-malaga':['malaga'],
    'mejores-rutas-correr-sevilla':['sevilla'],
    'best-running-routes-madrid':['madrid'],
    'best-running-routes-barcelona':['barcelona'],
    'best-running-routes-valencia':['valencia'],
    'best-running-routes-malaga':['malaga'],
    'best-running-routes-sevilla':['sevilla'],
    'mejores-carreras-running-andalucia-2026':['sevilla','malaga'],
    'grupos-correr-sevilla':['sevilla'],
    'encontrar-runners-malaga':['malaga'],
    'correr-acompanado-cadiz':['malaga','sevilla']
  };

  /* ── Detect language & slug ── */
  var isEN = location.pathname.indexOf('/blog/en/')===0 || (document.documentElement.lang||'').startsWith('en');
  var slug = location.pathname.replace(/\/$/,'').split('/').pop();

  /* ── Shuffle helper ── */
  function shuffle(a){for(var i=a.length-1;i>0;i--){var r=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[r];a[r]=t;}return a;}

  /* ── Place database (cities with places pages) ── */
  var CITY_PLACES={
    'madrid':[{s:'retiro',n:'Parque del Retiro'},{s:'casa-de-campo',n:'Casa de Campo'},{s:'madrid-rio',n:'Madrid Río'}],
    'barcelona':[{s:'montjuic',n:'Montjuïc'},{s:'parc-de-la-ciutadella',n:'Parc de la Ciutadella'}],
    'valencia':[{s:'parque-del-turia',n:'Jardín del Turia'}],
    'sevilla':[{s:'parque-del-alamillo',n:'Parque del Alamillo'}],
    'london':[{s:'hyde-park',n:'Hyde Park'}],
    'new-york':[{s:'central-park',n:'Central Park'}],
    'paris':[{s:'bois-de-boulogne',n:'Bois de Boulogne'}],
    'berlin':[{s:'tiergarten',n:'Tiergarten'}],
    'amsterdam':[{s:'vondelpark',n:'Vondelpark'}],
    'rome':[{s:'villa-borghese',n:'Villa Borghese'}]
  };

  /* ── Pick cities ── */
  var mapped = BLOG_CITY[slug];
  var picks = [];
  var placePicks = [];
  if(mapped){
    for(var m=0;m<mapped.length;m++){
      for(var c=0;c<CITIES.length;c++){ if(CITIES[c].s===mapped[m]) picks.push(CITIES[c]); }
      /* Grab places for this city */
      var cp=CITY_PLACES[mapped[m]];
      if(cp) placePicks=placePicks.concat(cp.slice(0,2));
    }
    var others=CITIES.filter(function(c){return mapped.indexOf(c.s)<0;});
    shuffle(others);
    /* If we have places, show 2 cities + 2 places; otherwise 4 cities */
    var cityCount=placePicks.length>0?2:4;
    picks=picks.concat(others.slice(0,cityCount-picks.length));
  } else {
    var copy=CITIES.slice();
    shuffle(copy);
    picks=copy.slice(0,4);
  }
  if(picks.length<2 && placePicks.length<1) return;

  /* ── CSS ── */
  var css=document.createElement('style');
  css.textContent=[
    '.city-links-section{margin:40px 0 32px;padding:32px 0 0;border-top:1px solid #efe6db}',
    '.city-links-title{font-size:1.1rem;font-weight:800;color:#3d3229;margin:0 0 20px}',
    '.city-links-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}',
    '.city-link-card{background:#fffcf9;border:1px solid #efe6db;border-radius:14px;overflow:hidden;text-decoration:none;transition:all .25s;display:block}',
    '.city-link-card:hover{background:#fff;border-color:rgba(249,115,22,.3);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08)}',
    '.city-link-img{width:100%;height:100px;object-fit:cover;display:block}',
    '.city-link-body{padding:12px 16px}',
    '.city-link-name{font-size:.95rem;font-weight:700;color:#3d3229;margin:0 0 4px}',
    '.city-link-cta{font-size:.75rem;color:#f97316;margin:0;transition:color .2s}',
    '.city-link-card:hover .city-link-cta{color:#fb923c}',
    '@media(max-width:640px){.city-links-grid{grid-template-columns:1fr}.city-link-card{display:flex;flex-direction:row}.city-link-img{width:100px;height:80px;flex-shrink:0}.city-link-body{display:flex;flex-direction:column;justify-content:center}}',
    '.dark-mode .city-links-section{border-top-color:rgba(255,255,255,.06)}',
    '.dark-mode .city-links-title{color:#fff}',
    '.dark-mode .city-link-card{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08)}',
    '.dark-mode .city-link-card:hover{background:rgba(255,255,255,.06);box-shadow:0 8px 24px rgba(0,0,0,.2)}',
    '.dark-mode .city-link-name{color:#fff}'
  ].join('\n');
  document.head.appendChild(css);

  /* ── Build HTML ── */
  var title=isEN?'\ud83c\udfd9\ufe0f Find Running Groups':'🏙️ Encuentra grupos de running';
  var ctaText=isEN?'Explore city \u2192':'Explorar ciudad \u2192';

  /* ── Place card CSS ── */
  if(placePicks.length>0){
    var placeCss=document.createElement('style');
    placeCss.textContent='.city-link-place-badge{font-size:.6rem;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:.05em;margin:0 0 2px}';
    document.head.appendChild(placeCss);
  }

  var section=document.createElement('div');
  section.className='city-links-section';
  var html='<h2 class="city-links-title">'+title+'</h2><div class="city-links-grid">';
  for(var k=0;k<picks.length;k++){
    var p=picks[k];
    html+='<a href="/cities/'+p.s+'" class="city-link-card">'+
      '<img class="city-link-img" src="https://images.unsplash.com/'+p.img+'?auto=format&fit=crop&w=300&h=150&q=70" alt="Running en '+p.n+'" loading="lazy" width="300" height="150">'+
      '<div class="city-link-body">'+
        '<p class="city-link-name">'+p.f+' '+p.n+'</p>'+
        '<p class="city-link-cta">'+ctaText+'</p>'+
      '</div>'+
    '</a>';
  }
  /* Place cards (no image, text-only) */
  var placeCtaText=isEN?'Running guide →':'Guía para correr →';
  for(var pl=0;pl<placePicks.length;pl++){
    html+='<a href="/places/'+placePicks[pl].s+'" class="city-link-card" style="display:flex;align-items:center">'+
      '<div class="city-link-body">'+
        '<p class="city-link-place-badge">'+(isEN?'Running spot':'Lugar')+'</p>'+
        '<p class="city-link-name">'+placePicks[pl].n+'</p>'+
        '<p class="city-link-cta">'+placeCtaText+'</p>'+
      '</div>'+
    '</a>';
  }
  html+='</div>';
  section.innerHTML=html;

  /* ── Inject after related articles or before CTA box ── */
  var related=document.querySelector('.related-section');
  var ctaBox=document.querySelector('.cta-box');
  if(related && related.parentNode){
    related.parentNode.insertBefore(section,related.nextSibling);
  } else if(ctaBox && ctaBox.parentNode){
    ctaBox.parentNode.insertBefore(section,ctaBox);
  } else {
    var content=document.querySelector('.content');
    if(content) content.appendChild(section);
  }
})();
