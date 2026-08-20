(function(){
  document.addEventListener('click',function(event){
    var link=event.target.closest('a[data-track]');
    if(!link||!window.__cjAnalyticsAllowed||typeof window.gtag!=='function')return;
    window.gtag('event',link.dataset.track,{
      article:document.body.dataset.article||'ciclismo-hub',
      destination:link.dataset.destination||'unknown',
      link_url:link.href||'',
      link_text:(link.textContent||'').trim().replace(/\s+/g,' ').slice(0,80)
    });
  });

  if(!window.__cjAnalyticsAllowed||typeof window.gtag!=='function')return;
  var sent={};
  function trackDepth(){
    var doc=document.documentElement;
    var max=Math.max(doc.scrollHeight-window.innerHeight,1);
    var depth=Math.round((window.scrollY/max)*100);
    [50,90].forEach(function(mark){
      if(depth>=mark&&!sent[mark]){
        sent[mark]=true;
        window.gtag('event','cycling_read_depth',{article:document.body.dataset.article||'ciclismo-hub',percent:mark});
      }
    });
  }
  window.addEventListener('scroll',trackDepth,{passive:true});
})();
