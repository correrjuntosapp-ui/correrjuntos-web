/* Author Bio Card — auto-injected based on <meta name="author"> */
(function(){
  'use strict';

  var AUTHORS = {
    'Jose Marquez': {
      initials: 'JM',
      name: 'Jos\u00e9 M\u00e1rquez',
      role: 'Fundador de CorrerJuntos',
      credentials: 'Marat\u00f3n sub-3:30 \u00b7 8.000+ km \u00b7 12 carreras oficiales',
      bio: 'Corredor desde 2012 y maratoniano sub-3:30. Fund\u00f3 CorrerJuntos con una idea simple: que ning\u00fan runner tenga que entrenar solo. Escribe sobre entrenamiento, carreras y la comunidad runner.',
      color: '#f97316',
      url: '/blog/autor/jose-marquez'
    },
    'Carlos Ruiz': {
      initials: 'CR',
      name: 'Carlos Ruiz',
      role: 'Editor de Running y Equipamiento',
      credentials: 'Periodista deportivo \u00b7 30+ zapatillas analizadas \u00b7 10 a\u00f1os experiencia',
      bio: 'Periodista deportivo y corredor popular con m\u00e1s de 10 a\u00f1os de experiencia. Especializado en an\u00e1lisis de zapatillas, relojes GPS, nutrici\u00f3n deportiva y todo lo que un runner necesita para mejorar.',
      color: '#3b82f6',
      url: '/blog/autor/carlos-ruiz'
    }
  };

  /* ── CSS ── */
  var css = document.createElement('style');
  css.textContent = [
    '.author-card{margin:48px 0 32px;padding:28px 24px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:20px;display:flex;gap:20px;align-items:flex-start}',
    '.author-avatar{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.2rem;color:#fff;flex-shrink:0}',
    '.author-info{flex:1;min-width:0}',
    '.author-name{font-size:1.1rem;font-weight:800;color:#fff;margin:0 0 2px}',
    '.author-role{font-size:.82rem;color:#94a3b8;margin:0 0 10px;font-weight:600}',
    '.author-credentials{font-size:.78rem;color:#cbd5e1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);padding:6px 14px;border-radius:999px;display:inline-block;margin:0 0 10px;font-weight:600}',
    '.author-bio{font-size:.88rem;color:#94a3b8;line-height:1.6;margin:0 0 14px}',
    '.author-link{display:inline-flex;align-items:center;gap:6px;color:#f97316;font-size:.85rem;font-weight:600;text-decoration:none;transition:opacity .2s}',
    '.author-link:hover{opacity:.8}',
    '.author-label{font-size:.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.06)}',
    '@media(max-width:480px){.author-card{flex-direction:column;align-items:center;text-align:center}.author-avatar{width:56px;height:56px;font-size:1rem}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ── Find author ── */
  var meta = document.querySelector('meta[name="author"]');
  if (!meta) return;
  var authorKey = meta.getAttribute('content');
  var author = AUTHORS[authorKey];
  if (!author) return;

  /* ── Build card ── */
  var card = document.createElement('div');
  card.className = 'author-card';
  card.innerHTML =
    '<div class="author-avatar" style="background:' + author.color + '">' + author.initials + '</div>' +
    '<div class="author-info">' +
      '<div class="author-label">Escrito por</div>' +
      '<p class="author-name">' + author.name + '</p>' +
      '<p class="author-role">' + author.role + '</p>' +
      (author.credentials ? '<div class="author-credentials">' + author.credentials + '</div>' : '') +
      '<p class="author-bio">' + author.bio + '</p>' +
      '<a href="' + author.url + '" class="author-link">Ver todos sus art\u00edculos \u2192</a>' +
    '</div>';

  /* ── Inject before CTA or at end of .content ── */
  var cta = document.querySelector('.cta-box');
  var content = document.querySelector('.content');
  if (cta && cta.parentNode) {
    cta.parentNode.insertBefore(card, cta);
  } else if (content) {
    content.appendChild(card);
  }

})();
