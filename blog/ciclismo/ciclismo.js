(function(){
  var article=function(){return document.body.dataset.article||'ciclismo-hub';};
  var canTrack=function(){return !!window.__cjAnalyticsAllowed&&typeof window.gtag==='function';};

  document.addEventListener('click',function(event){
    var link=event.target.closest('a[data-track]');
    if(!link||!canTrack())return;
    window.gtag('event',link.dataset.track,{
      article:article(),
      destination:link.dataset.destination||'unknown',
      link_url:link.href||'',
      link_text:(link.textContent||'').trim().replace(/\s+/g,' ').slice(0,80)
    });
  });

  if(!canTrack())return;

  var sent={},ticking=false;
  function measure(){
    ticking=false;
    var doc=document.documentElement;
    var max=Math.max(doc.scrollHeight-window.innerHeight,1);
    var depth=Math.round((window.scrollY/max)*100);
    [50,90].forEach(function(mark){
      if(depth>=mark&&!sent[mark]){
        sent[mark]=true;
        window.gtag('event','cycling_read_depth',{article:article(),percent:mark});
      }
    });
    if(sent[50]&&sent[90]){
      window.removeEventListener('scroll',onScroll);
    }
  }
  function onScroll(){
    if(ticking)return;
    ticking=true;
    (window.requestAnimationFrame||function(cb){setTimeout(cb,16);})(measure);
  }
  window.addEventListener('scroll',onScroll,{passive:true});

  if('IntersectionObserver' in window){
    var bar=document.querySelector('.mobile-app-bar');
    if(bar){
      var seen=false;
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!seen&&entry.isIntersecting){
            seen=true;
            window.gtag('event','cycling_app_impression',{
              article:article(),
              destination:'mobile-sticky'
            });
            io.disconnect();
          }
        });
      },{threshold:0.5});
      io.observe(bar);
    }
  }
})();
