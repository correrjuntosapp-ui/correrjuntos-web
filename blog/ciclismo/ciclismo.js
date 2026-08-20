(function(){
  document.addEventListener('click',function(event){
    var link=event.target.closest('a[data-track]');
    if(!link||typeof window.gtag!=='function')return;
    window.gtag('event',link.dataset.track,{
      article:document.body.dataset.article||'ciclismo-hub',
      destination:link.dataset.destination||'unknown'
    });
  });
})();
