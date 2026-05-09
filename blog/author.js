/* Author Bio Card — auto-injected based on <meta name="author">
   v2 (9 may 26):
   - 4 autores: Jose Marquez, Carlos Ruiz, María López, Abraham Márquez Rodríguez
   - Soporte foto real (campo `photo` URL); fallback a iniciales con color brand
   - Lookup normalizado: acepta variantes con/sin acentos + entidades HTML
     ej: "José Márquez" / "Jose Marquez" / "Jos&eacute; M&aacute;rquez"
     todas matchean la misma entry
   - CSS adaptado a light mode (default web) + dark mode con prefers-color-scheme
*/
(function(){
  'use strict';

  var AUTHORS = {
    'jose marquez': {
      initials: 'JM',
      name: 'José Márquez',
      role: 'Fundador de CorrerJuntos',
      credentials: 'Maratón sub-3:30 · 8.000+ km · 12 carreras oficiales',
      bio: 'Corredor desde 2012 y maratoniano sub-3:30. Fundó CorrerJuntos con una idea simple: que ningún runner tenga que entrenar solo. Escribe sobre entrenamiento, carreras y la comunidad runner.',
      color: '#f97316',
      photo: '/blog/autor/photos/jose-marquez.jpg',
      url: '/blog/autor/jose-marquez'
    },
    'carlos ruiz': {
      initials: 'CR',
      name: 'Carlos Ruiz',
      role: 'Editor de Running y Equipamiento',
      credentials: 'Periodista deportivo · 30+ zapatillas analizadas · 10 años experiencia',
      bio: 'Periodista deportivo y corredor popular con más de 10 años de experiencia. Especializado en análisis de zapatillas, relojes GPS, nutrición deportiva y todo lo que un runner necesita para mejorar.',
      color: '#3b82f6',
      photo: '/blog/autor/photos/carlos-ruiz.jpg',
      url: '/blog/autor/carlos-ruiz'
    },
    'maria lopez': {
      initials: 'ML',
      name: 'María López',
      role: 'Especialista en Running Femenino y Salud',
      credentials: 'Nutricionista deportiva · Coach de mujeres runners · 21K sub-1:50',
      bio: 'Nutricionista deportiva y coach especializada en running femenino. Escribe sobre menstruación, embarazo, menopausia y todo lo que afecta al rendimiento de las mujeres runners. Apasionada de la divulgación científica con base en evidencia.',
      color: '#ec4899',
      photo: '/blog/autor/photos/maria-lopez.jpg',
      url: '/blog/autor/maria-lopez'
    },
    'abraham marquez rodriguez': {
      initials: 'AM',
      name: 'Abraham Márquez Rodríguez',
      role: 'CEO y Fundador de CorrerJuntos',
      credentials: 'Founder · Maratoniano · Empresario tech',
      bio: 'CEO de CorrerJuntos y fundador del proyecto. Maratoniano y empresario tecnológico, comparte la visión del producto, los aprendizajes del crecimiento y la cultura del running. Su misión: que ningún corredor entrene solo.',
      color: '#10b981',
      photo: '/public/abraham.jpg',
      url: '/blog/autor/abraham-marquez',
      instagram: 'https://www.instagram.com/abraham_marquez_rodriguez/',
      linkedin: 'https://www.linkedin.com/in/abrahammarquezrodriguez/'
    },
    /* Alias para "Abraham Márquez" sin Rodríguez */
    'abraham marquez': null /* resolved at lookup time → maps to abraham marquez rodriguez */
  };
  AUTHORS['abraham marquez'] = AUTHORS['abraham marquez rodriguez'];

  /* ── Helpers ─────────────────────────────────────────── */

  /* Normaliza nombre: decodifica entidades HTML, quita acentos, lowercase, trim */
  function normalize(s) {
    if (!s) return '';
    /* Decodificar entidades HTML básicas */
    var t = document.createElement('textarea');
    t.innerHTML = s;
    var decoded = t.value;
    /* Quitar diacríticos (acentos) */
    return decoded
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
  }

  /* ── CSS — light mode default + dark mode opt-in ─────── */
  var css = document.createElement('style');
  css.textContent = [
    /* Light mode (default — cream blog background) */
    '.author-card{margin:48px 0 32px;padding:28px 24px;background:#fffcf9;border:1px solid #efe6db;border-radius:20px;display:flex;gap:20px;align-items:flex-start;box-shadow:0 2px 12px rgba(0,0,0,.04)}',
    '.author-avatar{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.2rem;color:#fff;flex-shrink:0;overflow:hidden;background-size:cover;background-position:center}',
    '.author-info{flex:1;min-width:0}',
    '.author-label{font-size:.7rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #efe6db}',
    '.author-name{font-size:1.15rem;font-weight:800;color:#3d3229;margin:0 0 4px}',
    '.author-role{font-size:.85rem;color:#5c4d3d;margin:0 0 12px;font-weight:600}',
    '.author-credentials{font-size:.78rem;color:#5c4d3d;background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.16);padding:6px 14px;border-radius:999px;display:inline-block;margin:0 0 12px;font-weight:600}',
    '.author-bio{font-size:.9rem;color:#3d3229;line-height:1.65;margin:0 0 14px}',
    '.author-link{display:inline-flex;align-items:center;gap:6px;color:#f97316;font-size:.88rem;font-weight:700;text-decoration:none;transition:opacity .2s}',
    '.author-link:hover{opacity:.7}',
    '.author-socials{display:inline-flex;gap:8px;margin-left:14px;vertical-align:middle}',
    '.author-socials a{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.04);color:#5c4d3d;text-decoration:none;transition:all .2s;border:1px solid #efe6db}',
    '.author-socials a:hover{background:#f97316;color:#fff;border-color:#f97316}',
    '.author-socials svg{width:14px;height:14px;fill:currentColor}',
    '.dark-mode .author-socials a,html.dark-mode .author-socials a{background:rgba(255,255,255,.05);color:#cbd5e1;border-color:rgba(255,255,255,.08)}',
    '.dark-mode .author-socials a:hover,html.dark-mode .author-socials a:hover{background:#f97316;color:#fff}',
    /* Dark mode (when blog has dark-mode class on root) */
    '.dark-mode .author-card,html.dark-mode .author-card{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08);box-shadow:none}',
    '.dark-mode .author-label,html.dark-mode .author-label{color:#64748b;border-bottom-color:rgba(255,255,255,.06)}',
    '.dark-mode .author-name,html.dark-mode .author-name{color:#fff}',
    '.dark-mode .author-role,html.dark-mode .author-role{color:#94a3b8}',
    '.dark-mode .author-credentials,html.dark-mode .author-credentials{color:#cbd5e1;background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.08)}',
    '.dark-mode .author-bio,html.dark-mode .author-bio{color:#94a3b8}',
    /* Mobile */
    '@media(max-width:480px){.author-card{flex-direction:column;align-items:center;text-align:center;padding:24px 20px}.author-avatar{width:72px;height:72px;font-size:1.3rem}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ── Find author ──────────────────────────────────────── */
  var meta = document.querySelector('meta[name="author"]');
  if (!meta) return;
  /* Skip if static author-box already exists */
  if (document.querySelector('.author-box')) return;

  var rawAuthor = meta.getAttribute('content');
  var key = normalize(rawAuthor);
  var author = AUTHORS[key];
  if (!author) {
    /* Fallback: log para diagnóstico */
    if (window.console) console.warn('[author.js] No match for author:', rawAuthor, '→', key);
    return;
  }

  /* ── Build avatar (foto real con fallback a iniciales) ── */
  var avatarHtml;
  if (author.photo) {
    /* Imagen — img con onerror para fallback a iniciales si la foto no existe */
    avatarHtml =
      '<div class="author-avatar" style="background:' + author.color + '">' +
        '<img src="' + author.photo + '" alt="' + author.name + '" ' +
        'onerror="this.style.display=\'none\';this.parentNode.textContent=\'' + author.initials + '\'" ' +
        'style="width:100%;height:100%;object-fit:cover;border-radius:50%">' +
      '</div>';
  } else {
    avatarHtml = '<div class="author-avatar" style="background:' + author.color + '">' + author.initials + '</div>';
  }

  /* Socials inline (Instagram + LinkedIn icons SVG) */
  var socialsHtml = '';
  if (author.instagram || author.linkedin) {
    socialsHtml = '<span class="author-socials">';
    if (author.instagram) {
      socialsHtml += '<a href="' + author.instagram + '" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.9.9 1.4.2.4.4 1.1.4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.9.7-1.4.9-.4.2-1.1.4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.9-.9-1.4-.2-.4-.4-1.1-.4-2.2-.1-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.9-.7 1.4-.9.4-.2 1.1-.4 2.2-.4 1.2-.1 1.6-.1 4.8-.1zm0-2.2C8.7 0 8.3 0 7.1.1 5.8.1 5 .3 4.2.6c-.8.3-1.5.7-2.2 1.4C1.3 2.7.9 3.4.6 4.2.3 5 .1 5.8.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.1 1.3.3 2.1.6 2.9.3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.6.5 2.9.6 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c1.3-.1 2.1-.3 2.9-.6.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.6.6-2.9.1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.1-1.3-.3-2.1-.6-2.9-.3-.8-.7-1.5-1.4-2.2C20.7 1.3 20 .9 19.2.6 18.4.3 17.6.1 16.3.1 15.1 0 14.7 0 12 0z"/><path d="M12 5.8c-3.4 0-6.2 2.8-6.2 6.2s2.8 6.2 6.2 6.2 6.2-2.8 6.2-6.2-2.8-6.2-6.2-6.2zm0 10.2c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zM18.4 4.2c-.8 0-1.4.6-1.4 1.4s.6 1.4 1.4 1.4 1.4-.6 1.4-1.4-.6-1.4-1.4-1.4z"/></svg></a>';
    }
    if (author.linkedin) {
      socialsHtml += '<a href="' + author.linkedin + '" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>';
    }
    socialsHtml += '</span>';
  }

  /* ── Build card ──────────────────────────────────────── */
  var card = document.createElement('div');
  card.className = 'author-card';
  card.innerHTML =
    avatarHtml +
    '<div class="author-info">' +
      '<div class="author-label">Escrito por</div>' +
      '<p class="author-name">' + author.name + '</p>' +
      '<p class="author-role">' + author.role + '</p>' +
      (author.credentials ? '<div class="author-credentials">' + author.credentials + '</div>' : '') +
      '<p class="author-bio">' + author.bio + '</p>' +
      '<a href="' + author.url + '" class="author-link">Ver todos los artículos de ' + author.name + ' →</a>' +
      socialsHtml +
    '</div>';

  /* ── Inject before CTA or at end of .content ─────────── */
  var cta = document.querySelector('.cta-box');
  var content = document.querySelector('.content');
  if (cta && cta.parentNode) {
    cta.parentNode.insertBefore(card, cta);
  } else if (content) {
    content.appendChild(card);
  }

})();
