/* TOC Enhanced — sticky sidebar, scroll spy, progress bar, mobile toggle */
(function(){
  'use strict';

  /* ── CSS ── */
  var css = document.createElement('style');
  css.textContent = [
    /* Progress bar */
    '#toc-progress{position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#f97316,#ea580c);z-index:9999;width:0;transition:width .15s linear;pointer-events:none}',
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
    /* Mobile toggle */
    '.toc-toggle{display:none;width:100%;padding:10px 16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;color:#f97316;font-weight:700;font-size:.85rem;cursor:pointer;margin-bottom:8px;text-align:left;transition:background .2s}',
    '.toc-toggle:hover{background:rgba(255,255,255,.06)}',
    '.toc-toggle span{float:right;transition:transform .3s}',
    '.toc-toggle.open span{transform:rotate(180deg)}',
    '.toc.collapsed ul{max-height:0;overflow:hidden;margin:0;padding:0;opacity:0;transition:max-height .35s ease,opacity .25s}',
    '.toc.expanded ul{max-height:600px;opacity:1;transition:max-height .4s ease,opacity .3s .1s}',
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

  /* ── Mobile: toggle button ── */
  var tocH2 = toc.querySelector('h2');
  var btn = document.createElement('button');
  btn.className = 'toc-toggle';
  btn.innerHTML = '\uD83D\uDCD1 \u00CDndice del art\u00EDculo <span>\u25BC</span>';
  toc.insertBefore(btn, tocH2 ? tocH2.nextSibling : toc.firstChild);
  if (tocH2) tocH2.style.display = 'none';

  /* Start collapsed on mobile */
  function isMobile(){ return window.innerWidth < 1200; }
  if (isMobile()) toc.classList.add('collapsed');
  else toc.classList.add('expanded');

  btn.addEventListener('click', function(){
    var collapsed = toc.classList.contains('collapsed');
    toc.classList.toggle('collapsed', !collapsed);
    toc.classList.toggle('expanded', collapsed);
    btn.classList.toggle('open', collapsed);
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
