(function(){
  var CLUSTER='ciclismo';
  var article=function(){return document.body.dataset.article||'ciclismo-hub';};
  var canTrack=function(){return !!window.__cjAnalyticsAllowed&&typeof window.gtag==='function';};
  var device=function(){return window.innerWidth<768?'mobile':'desktop';};
  var base=function(){return {article:article(),content_cluster:CLUSTER,device_context:device()};};
  var send=function(name,params){
    if(!canTrack())return;
    var p=base();
    for(var k in params){if(params[k]!==undefined&&params[k]!==null&&params[k]!=='')p[k]=params[k];}
    window.gtag('event',name,p);
  };
  var asinFrom=function(url){var m=/amazon\.[a-z.]+\/dp\/([A-Z0-9]{10})/.exec(url||'');return m?m[1]:'';};
  var placementOf=function(el){
    var sec=el.closest('[id]');
    if(el.closest('.mobile-app-bar'))return 'mobile-sticky';
    if(el.closest('.cta-box'))return 'cta-box';
    if(el.closest('.app-howto'))return 'howto';
    if(el.closest('.app-promo'))return 'promo-top';
    if(el.closest('.buy-card'))return 'buy-card';
    if(el.closest('.table-wrap'))return 'table';
    return sec?sec.id:'body';
  };

  // ---- Clicks (CTA app, afiliados, comunidad, rutas) ----
  document.addEventListener('click',function(event){
    var link=event.target.closest('a[data-track]');
    if(!link)return;
    var name=link.dataset.track;
    var isImage=!!link.querySelector('img')||link.classList.contains('buy-photo');
    var label=(link.textContent||'').trim().replace(/\s+/g,' ')||link.getAttribute('aria-label')||(link.querySelector('img')&&link.querySelector('img').alt)||'';
    var params={
      destination:link.dataset.destination||'unknown',
      placement:placementOf(link),
      link_type:isImage?'image':'text',
      link_url:link.href||'',
      link_text:label.slice(0,80)
    };
    if(name==='affiliate_click'||name==='affiliate_link_click'){
      name='affiliate_link_click';
      params.product=link.dataset.product||asinFrom(link.href);
      params.affiliate_network='amazon';
    }
    send(name,params);
  });

  // ---- Profundidad de lectura ----
  var sent={},ticking=false;
  function measure(){
    ticking=false;
    var doc=document.documentElement;
    var max=Math.max(doc.scrollHeight-window.innerHeight,1);
    var depth=Math.round((window.scrollY/max)*100);
    [25,50,75,90].forEach(function(mark){
      if(depth>=mark&&!sent[mark]){
        sent[mark]=true;
        send('cycling_read_depth',{percent:mark});
      }
    });
    if(sent[90])window.removeEventListener('scroll',onScroll);
  }
  function onScroll(){
    if(ticking)return;
    ticking=true;
    (window.requestAnimationFrame||function(cb){setTimeout(cb,16);})(measure);
  }
  window.addEventListener('scroll',onScroll,{passive:true});

  // ---- Impresiones (CTAs y comparativas) — una vez por elemento ----
  if('IntersectionObserver' in window){
    var seenCta=new WeakSet();
    var ctaTargets=document.querySelectorAll('.app-promo,.app-howto,.cta-box,.mobile-app-bar');
    if(ctaTargets.length){
      var ioCta=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!entry.isIntersecting||seenCta.has(entry.target))return;
          seenCta.add(entry.target);
          send('cycling_cta_impression',{placement:placementOf(entry.target)});
          ioCta.unobserve(entry.target);
        });
      },{threshold:0.5});
      ctaTargets.forEach(function(t){ioCta.observe(t);});
    }
    var grid=document.querySelector('.buy-grid,.buy-grid-2');
    if(grid){
      var ioGrid=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!entry.isIntersecting)return;
          send('cycling_comparison_view',{placement:'buy-grid',product_count:grid.querySelectorAll('.buy-card').length});
          ioGrid.disconnect();
        });
      },{threshold:0.25});
      ioGrid.observe(grid);
    }
  }

  // ---- UX: índice colapsable en móvil ----
  var toc=document.querySelector('nav.toc');
  if(toc&&window.matchMedia&&window.matchMedia('(max-width:700px)').matches){
    var label=toc.querySelector('strong');
    if(label){
      toc.classList.add('toc-collapsible','toc-collapsed');
      label.setAttribute('role','button');
      label.setAttribute('tabindex','0');
      label.setAttribute('aria-expanded','false');
      var toggle=function(){
        var collapsed=toc.classList.toggle('toc-collapsed');
        label.setAttribute('aria-expanded',collapsed?'false':'true');
      };
      label.addEventListener('click',toggle);
      label.addEventListener('keydown',function(e){
        if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}
      });
    }
  }

  // ---- UX: indicador de scroll en tablas ----
  document.querySelectorAll('.table-wrap').forEach(function(wrap){
    var update=function(){
      var scrollable=wrap.scrollWidth>wrap.clientWidth+4;
      wrap.classList.toggle('has-scroll',scrollable&&wrap.scrollLeft<wrap.scrollWidth-wrap.clientWidth-4);
    };
    update();
    wrap.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',update,{passive:true});
  });
})();
