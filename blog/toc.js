/* TOC Enhanced — sticky sidebar, scroll spy, progress bar, mobile toggle */
(function(){
  'use strict';

  /* ── CSS ── */
  var css = document.createElement('style');
  css.textContent = [
    /* Progress bar */
    '#toc-progress{position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#f97316,#ea580c);z-index:9999;width:0;transition:width .15s linear;pointer-events:none}',

    /* ── Inline TOC (override article CSS) ── */
    '.toc{background:linear-gradient(135deg,#fffcf9 0%,#fff7ed 100%)!important;border:1px solid rgba(249,115,22,.15)!important;border-left:none!important;border-radius:16px!important;padding:0!important;margin:0 0 32px!important;overflow:hidden;box-shadow:0 2px 12px rgba(249,115,22,.06)}',
    '.toc-header{display:flex;align-items:center;gap:10px;padding:16px 20px 12px;border-bottom:1px solid rgba(249,115,22,.08)}',
    '.toc-header svg{flex-shrink:0}',
    '.toc-header-text{font-size:.8rem;font-weight:700;color:#3d3229;text-transform:uppercase;letter-spacing:.06em}',
    '.toc-header-count{font-size:.7rem;color:#f97316;font-weight:600;background:rgba(249,115,22,.1);padding:2px 8px;border-radius:99px;margin-left:auto}',
    '.toc h2,.toc .toc-title,.toc>div[role="heading"]{display:none!important}',
    '.toc ul{list-style:none!important;margin:0!important;padding:8px 0!important;counter-reset:toc-counter}',
    '.toc li{margin:0!important;counter-increment:toc-counter}',
    '.toc li a{display:flex;align-items:center;gap:10px;padding:10px 20px;color:#5c4d3d;text-decoration:none;font-size:.88rem;font-weight:500;line-height:1.4;transition:all .2s;border-left:3px solid transparent;position:relative}',
    '.toc li a::before{content:counter(toc-counter);display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;background:rgba(249,115,22,.08);color:#f97316;font-size:.75rem;font-weight:700;border-radius:8px;flex-shrink:0;transition:all .2s}',
    '.toc li a:hover{background:rgba(249,115,22,.04);color:#f97316;border-left-color:#f97316}',
    '.toc li a:hover::before{background:#f97316;color:#fff}',

    /* Dark mode inline TOC */
    '.dark-mode .toc{background:linear-gradient(135deg,rgba(255,255,255,.03),rgba(255,255,255,.01))!important;border-color:rgba(255,255,255,.08)!important;box-shadow:0 2px 12px rgba(0,0,0,.2)}',
    '.dark-mode .toc-header{border-bottom-color:rgba(255,255,255,.06)}',
    '.dark-mode .toc-header-text{color:#e2e8f0}',
    '.dark-mode .toc-header-count{background:rgba(249,115,22,.15)}',
    '.dark-mode .toc li a{color:#94a3b8}',
    '.dark-mode .toc li a::before{background:rgba(249,115,22,.12)}',
    '.dark-mode .toc li a:hover{background:rgba(255,255,255,.04);color:#f97316}',
    '.dark-mode .toc li a:hover::before{background:#f97316;color:#fff}',

    /* Floating sidebar (desktop ≥1200px) */
    '#toc-float{display:none;position:fixed;top:80px;left:12px;width:180px;max-height:calc(100vh - 120px);overflow-y:auto;background:rgba(11,18,32,.97);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.08);border-left:3px solid #f97316;border-radius:0 14px 14px 0;padding:16px 14px;z-index:90;opacity:0;transform:translateX(-12px);transition:opacity .3s,transform .3s}',
    '#toc-float.visible{opacity:1;transform:translateX(0)}',
    '#toc-float h4{font-size:.7rem;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,.06)}',
    '#toc-float ul{list-style:none;margin:0;padding:0}',
    '#toc-float li{margin:0}',
    '#toc-float a{display:block;color:#64748b;text-decoration:none;font-size:.78rem;line-height:1.35;padding:5px 0 5px 12px;border-left:2px solid transparent;transition:all .2s}',
    '#toc-float a:hover{color:#cbd5e1}',
    '#toc-float a.active{color:#f97316;font-weight:700;border-left-color:#f97316}',
    /* Scrollbar */
    '#toc-float::-webkit-scrollbar{width:3px}',
    '#toc-float::-webkit-scrollbar-track{background:transparent}',
    '#toc-float::-webkit-scrollbar-thumb{background:rgba(249,115,22,.3);border-radius:9px}',
    /* Mobile toggle — merged into header row */
    /* top/height en vez de inset:0 — con inset el boton tapaba TODOS los
       enlaces del TOC expandido (no eran clicables: el clic colapsaba) */
    '.toc-toggle{display:none;width:100%;padding:0;background:none;border:none;color:#c2410c;font-weight:700;font-size:.85rem;cursor:pointer;text-align:left;transition:background .2s;position:absolute;top:0;left:0;right:0;height:44px;z-index:2}',
    '.toc-header{position:relative;cursor:pointer}',
    '.toc-header-arrow{margin-left:8px;transition:transform .3s;color:#f97316;font-size:.75rem}',
    '.toc-toggle.open + * .toc-header-arrow,.toc.expanded .toc-header-arrow{transform:rotate(180deg)}',
    '.toc.collapsed ul{max-height:0;overflow:hidden;margin:0;padding:0;opacity:0;transition:max-height .35s ease,opacity .25s}',
    '.toc.expanded ul{max-height:1200px;opacity:1;transition:max-height .4s ease,opacity .3s .1s}',
    '@media(max-width:1199px){.toc-toggle{display:block}}',
    '@media(min-width:1200px){.toc-toggle{display:none}.toc ul{max-height:none!important;opacity:1!important;overflow:visible!important}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ── Progress bar ── */
  var bar = document.createElement('div');
  bar.id = 'toc-progress';
  document.body.appendChild(bar);

  window.addEventListener('scroll', function(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0';
  }, {passive:true});

  /* ── Find or build TOC ── */
  var toc = document.querySelector('nav.toc');
  var headings = document.querySelectorAll('.content h2[id]');

  if (!toc && headings.length >= 2) {
    /* Auto-generate TOC */
    toc = document.createElement('nav');
    toc.className = 'toc';
    toc.innerHTML = '<h2>Contenido</h2><ul></ul>';
    var ul = toc.querySelector('ul');
    headings.forEach(function(h){
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      ul.appendChild(li);
    });
    var content = document.querySelector('.content');
    if (content) content.insertBefore(toc, content.firstChild);
  }

  if (!toc || headings.length < 2) return;

  /* ── Inject header with icon + count ── */
  var isEN = document.documentElement.lang === 'en' || window.location.pathname.indexOf('/en/') !== -1;
  var tocHeader = document.createElement('div');
  tocHeader.className = 'toc-header';
  tocHeader.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>' +
    '<span class="toc-header-text">' + (isEN ? 'In this article' : 'En este art\u00edculo') + '</span>' +
    '<span class="toc-header-count">' + headings.length + (isEN ? ' sections' : ' secciones') + '</span>' +
    '<span class="toc-header-arrow">\u25BC</span>';
  toc.insertBefore(tocHeader, toc.firstChild);

  /* ── Mobile: toggle button (invisible overlay on header) ── */
  var tocH2 = toc.querySelector('h2') || toc.querySelector('.toc-title') || toc.querySelector('[role="heading"]');
  var btn = document.createElement('button');
  btn.className = 'toc-toggle';
  btn.setAttribute('aria-label', isEN ? 'Toggle table of contents' : 'Mostrar/ocultar \u00edndice');
  toc.insertBefore(btn, tocHeader.nextSibling);
  if (tocH2) tocH2.style.display = 'none';

  /* Start expanded always */
  function isMobile(){ return window.innerWidth < 1200; }
  toc.classList.add('expanded');

  btn.addEventListener('click', function(){
    var collapsed = toc.classList.contains('collapsed');
    toc.classList.toggle('collapsed', !collapsed);
    toc.classList.toggle('expanded', collapsed);
    btn.classList.toggle('open', collapsed);
    var arrow = toc.querySelector('.toc-header-arrow');
    if (arrow) arrow.style.transform = collapsed ? 'rotate(180deg)' : '';
  });

  /* ── Desktop: floating sidebar ── */
  var float = document.createElement('nav');
  float.id = 'toc-float';
  float.innerHTML = '<h4>\u00CDndice</h4>';
  var ul2 = document.createElement('ul');
  headings.forEach(function(h){
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.dataset.target = h.id;
    li.appendChild(a);
    ul2.appendChild(li);
  });
  float.appendChild(ul2);
  document.body.appendChild(float);

  /* Position helper */
  function posFloat(){
    if (window.innerWidth < 1200){ float.style.display = 'none'; return; }
    float.style.display = 'block';
  }

  /* Show/hide float on scroll */
  var tocRect, showFloat = false;
  function updateFloat(){
    if (window.innerWidth < 1200){ float.classList.remove('visible'); return; }
    posFloat();
    tocRect = toc.getBoundingClientRect();
    var shouldShow = tocRect.bottom < 0;
    if (shouldShow !== showFloat){
      showFloat = shouldShow;
      float.classList.toggle('visible', shouldShow);
    }
  }
  window.addEventListener('scroll', updateFloat, {passive:true});
  window.addEventListener('resize', function(){ posFloat(); updateFloat(); }, {passive:true});
  posFloat();

  /* ── Scroll spy (scroll-based for reliability) ── */
  var links = float.querySelectorAll('a[data-target]');
  var currentId = null;

  function updateSpy(){
    var scrollY = window.scrollY + 120;
    var active = null;
    for (var i = 0; i < headings.length; i++){
      if (headings[i].offsetTop <= scrollY) active = headings[i].id;
    }
    if (active !== currentId){
      currentId = active;
      links.forEach(function(a){
        a.classList.toggle('active', a.dataset.target === active);
      });
    }
  }
  window.addEventListener('scroll', updateSpy, {passive:true});

  /* ── Smooth scroll ── */
  function smoothScroll(e){
    var href = e.currentTarget.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    var target = document.getElementById(href.substring(1));
    if (!target) return;
    e.preventDefault();
    var y = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({top: y, behavior: 'smooth'});
  }

  /* Attach to both float and inline TOC links */
  float.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', smoothScroll); });
  toc.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', smoothScroll); });

})();
