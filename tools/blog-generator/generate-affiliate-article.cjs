/**
 * generate-affiliate-article.cjs
 *
 * Generates a complete affiliate ranking article (ES + EN) from a JSON config.
 * Template based on chalecos-hidratacion-running.html (gold standard).
 *
 * Usage:
 *   node tools/blog-generator/generate-affiliate-article.cjs configs/gafas-running.json
 *   node tools/blog-generator/generate-affiliate-article.cjs configs/gafas-running.json --lang es
 *   node tools/blog-generator/generate-affiliate-article.cjs configs/gafas-running.json --lang en
 */
const fs = require('fs');
const path = require('path');

const configPath = process.argv[2];
if (!configPath) { console.error('Usage: node generate-affiliate-article.cjs <config.json> [--lang es|en]'); process.exit(1); }

const langFlag = process.argv.indexOf('--lang') !== -1 ? process.argv[process.argv.indexOf('--lang') + 1] : null;
const configFile = path.resolve(__dirname, configPath);
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const rootDir = path.join(__dirname, '..', '..');

function generate(lang) {
  const c = config[lang];
  if (!c) { console.log(`No config for lang=${lang}, skipping.`); return; }
  const other = lang === 'es' ? config.en : config.es;
  const isES = lang === 'es';

  // --- i18n labels ---
  const L = isES ? {
    lang: 'es-ES', locale: 'es_ES',
    home: 'Inicio', blog: 'Blog', cities: 'Ciudades', matching: 'Matching', app: 'App',
    login: 'Entrar', signup: '\u00danete',
    readTime: 'min lectura', by: 'Por',
    disclosure: '&#128203; <strong>Transparencia:</strong> Este art\u00edculo contiene enlaces de afiliado a Amazon. Si compras a trav\u00e9s de ellos, recibimos una peque\u00f1a comisi\u00f3n sin coste adicional para ti. Esto nos ayuda a mantener CorrerJuntos gratuito. Solo recomendamos productos que hemos probado o analizado en profundidad.',
    tocTitle: 'Contenido de esta gu\u00eda',
    idealFor: 'Ideal para:',
    seeOnAmazon: 'Ver en Amazon &rarr;',
    shareLabel: 'Compartir:',
    copyLink: '&#128203; Copiar link',
    copied: '\u2713 Copiado',
    ctaTitle: 'Encuentra tu grupo de running',
    ctaSub: '5.000+ runners ya entrenan juntos. Gratis en iOS.',
    ctaBtn: 'Descargar gratis',
    ctaBoxJoin: '\u00danete a 5.000+ runners',
    nlTitle: 'Tips de running en tu email',
    nlSub: 'Recibe gu\u00edas de equipamiento, ofertas y planes de entrenamiento. Sin spam.',
    nlBtn: 'Suscribirme',
    nlSuccess: 'Bienvenido/a! Te avisaremos con los mejores tips.',
    nlError: 'Error. Int\u00e9ntalo de nuevo.',
    nlTitle2: '\ud83d\udcec Tips de Running en tu Email',
    nlSub2: 'Rutas, planes de entrenamiento y consejos para correr mejor. Sin spam.',
    nlPrivacy: '\ud83d\udd12 Respetamos tu privacidad. Cancela cuando quieras.',
    relatedTitle: 'Sigue leyendo',
    cookieText: 'Usamos cookies propias y de an\u00e1lisis para mejorar tu experiencia.',
    cookieMore: 'M\u00e1s info',
    cookieAccept: 'Aceptar', cookieReject: 'Rechazar',
    footerDesc: 'La comunidad de running m\u00e1s activa de Espa\u00f1a. Corre acompa\u00f1ado, mejora juntos.',
    footerExplore: 'Explora', footerCompany: 'Empresa', footerLegal: 'Legal',
    footerAbout: 'Sobre Nosotros', footerInvestors: 'Inversores', footerContact: 'Contacto',
    footerSponsors: 'Patrocinadores', footerMedia: 'Media Kit',
    footerPrivacy: 'Pol\u00edtica de Privacidad', footerTerms: 'T\u00e9rminos de Uso', footerCookies: 'Pol\u00edtica de Cookies',
    footerCopy: '&copy; 2026 CorrerJuntos. Todos los derechos reservados. Hecho con amor para runners.',
    blogPrefix: '/blog/', blogEnPrefix: '/blog/en/',
    citiesHref: '/cities/', citiesLabel: 'Ciudades',
    matchingHref: '/matching/',
  } : {
    lang: 'en', locale: 'en_US',
    home: 'Home', blog: 'Blog', cities: 'Cities', matching: 'Matching', app: 'App',
    login: 'Login', signup: 'Sign Up',
    readTime: 'min read', by: 'By',
    disclosure: '&#128203; <strong>Transparency:</strong> This article contains affiliate links to Amazon. If you purchase through them, we receive a small commission at no extra cost to you. This helps us keep CorrerJuntos free. We only recommend products we have tested or thoroughly analyzed.',
    tocTitle: 'In this guide',
    idealFor: 'Best for:',
    seeOnAmazon: 'See on Amazon &rarr;',
    shareLabel: 'Share:',
    copyLink: '&#128203; Copy link',
    copied: '\u2713 Copied',
    ctaTitle: 'Find your running group',
    ctaSub: '5,000+ runners already train together. Free on iOS.',
    ctaBtn: 'Download free',
    ctaBoxJoin: 'Join 5,000+ runners',
    nlTitle: 'Running tips in your inbox',
    nlSub: 'Gear guides, deals and training plans. No spam.',
    nlBtn: 'Subscribe',
    nlSuccess: 'Welcome! We\u2019ll send you the best tips.',
    nlError: 'Error. Please try again.',
    nlTitle2: '\ud83d\udcec Running Tips in Your Inbox',
    nlSub2: 'Routes, training plans and tips to run better. No spam.',
    nlPrivacy: '\ud83d\udd12 We respect your privacy. Unsubscribe anytime.',
    relatedTitle: 'Keep reading',
    cookieText: 'We use cookies to improve your experience.',
    cookieMore: 'Learn more',
    cookieAccept: 'Accept', cookieReject: 'Reject',
    footerDesc: 'The most active running community in Spain. Run together, improve together.',
    footerExplore: 'Explore', footerCompany: 'Company', footerLegal: 'Legal',
    footerAbout: 'About Us', footerInvestors: 'Investors', footerContact: 'Contact',
    footerSponsors: 'Sponsors', footerMedia: 'Media Kit',
    footerPrivacy: 'Privacy Policy', footerTerms: 'Terms of Use', footerCookies: 'Cookie Policy',
    footerCopy: '&copy; 2026 CorrerJuntos. All rights reserved. Made with love for runners.',
    blogPrefix: '/blog/en/', blogEnPrefix: '/blog/en/',
    citiesHref: '/cities/', citiesLabel: 'Cities',
    matchingHref: '/matching/en/',
  };

  const esSlug = config.es.slug;
  const enSlug = config.en.slug;
  const canonicalUrl = `https://www.correrjuntos.com${isES ? '/blog/' + esSlug : '/blog/en/' + enSlug}`;
  const esUrl = `https://www.correrjuntos.com/blog/${esSlug}`;
  const enUrl = `https://www.correrjuntos.com/blog/en/${enSlug}`;
  const heroUrl = c.heroImage;
  const nlSource = `blog-${c.slug}`;

  // --- Build HTML ---
  let html = '';

  // HEAD
  html += `<!DOCTYPE html>
<html lang="${L.lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="author" content="${c.author || 'Carlos Ruiz'}">
<title>${c.title} | CorrerJuntos</title>
<meta name="description" content="${c.metaDescription}">
<meta name="robots" content="index, follow">
<meta name="keywords" content="${c.keywords}">
<link rel="canonical" href="${canonicalUrl}">
<link rel="alternate" hreflang="es" href="${esUrl}">
<link rel="alternate" hreflang="x-default" href="${esUrl}">
<link rel="alternate" hreflang="en" href="${enUrl}">
<meta property="og:title" content="${c.ogTitle || c.title}">
<meta property="og:description" content="${c.ogDescription || c.metaDescription}">
<meta property="og:type" content="article">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:image" content="${heroUrl}">
<meta property="og:locale" content="${L.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@CorrerJuntos">
<meta name="twitter:title" content="${c.ogTitle || c.title}">
<meta name="twitter:description" content="${c.ogDescription || c.metaDescription}">
<meta name="twitter:image" content="${heroUrl}">
`;

  // SCHEMA JSON-LD
  const authorName = c.author || 'Carlos Ruiz';
  const authorSlug = authorName === 'Carlos Ruiz' ? 'carlos-ruiz' : 'jose-marquez';
  const authorTitle = authorName === 'Carlos Ruiz' ? 'Periodista Deportivo y Editor' : 'Running Coach y Periodista';
  const authorUrl = `https://www.correrjuntos.com/blog/autor/${authorSlug}`;

  const schemaGraph = [
    {
      '@type': 'Organization',
      '@id': 'https://www.correrjuntos.com/#organization',
      name: 'CorrerJuntos',
      url: 'https://www.correrjuntos.com/',
      logo: { '@type': 'ImageObject', url: 'https://www.correrjuntos.com/icons/icon-512.png' },
      sameAs: ['https://www.instagram.com/correrjuntosapp/','https://x.com/CorrerJuntos','https://www.tiktok.com/@correrjuntosapp']
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.correrjuntos.com/#website',
      url: 'https://www.correrjuntos.com/',
      name: 'CorrerJuntos',
      publisher: { '@id': 'https://www.correrjuntos.com/#organization' },
      inLanguage: 'es'
    },
    {
      '@type': 'WebPage',
      '@id': canonicalUrl + '#webpage',
      url: canonicalUrl,
      name: c.title + ' | CorrerJuntos',
      description: c.metaDescription,
      isPartOf: { '@id': 'https://www.correrjuntos.com/#website' },
      about: { '@id': 'https://www.correrjuntos.com/#organization' },
      primaryImageOfPage: { '@type': 'ImageObject', url: heroUrl },
      inLanguage: L.lang
    },
    {
      '@type': 'Person',
      '@id': authorUrl + '#author',
      name: authorName,
      url: authorUrl,
      jobTitle: authorTitle,
      sameAs: ['https://www.strava.com/athletes/correrjuntos','https://www.instagram.com/correrjuntosapp/','https://x.com/correrjuntosapp']
    },
    {
      '@type': 'BlogPosting',
      '@id': canonicalUrl + '#article',
      mainEntityOfPage: { '@id': canonicalUrl + '#webpage' },
      headline: c.title,
      description: c.metaDescription,
      url: canonicalUrl,
      datePublished: c.datePublished || '2026-03-05',
      dateModified: c.dateModified || c.datePublished || '2026-03-05',
      author: { '@id': authorUrl + '#author' },
      publisher: { '@id': 'https://www.correrjuntos.com/#organization' },
      image: heroUrl,
      inLanguage: L.lang
    },
    {
      '@type': 'BreadcrumbList',
      '@id': canonicalUrl + '#breadcrumbs',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: L.home, item: 'https://www.correrjuntos.com/' },
        { '@type': 'ListItem', position: 2, name: L.blog, item: isES ? 'https://www.correrjuntos.com/blog/' : 'https://www.correrjuntos.com/blog/en/' },
        { '@type': 'ListItem', position: 3, name: c.breadcrumbLabel }
      ]
    }
  ];

  // FAQPage only when FAQ items exist
  if (c.faqItems && c.faqItems.length > 0) {
    schemaGraph.push({
      '@type': 'FAQPage',
      '@id': canonicalUrl + '#faq',
      mainEntity: c.faqItems.map(f => ({
        '@type': 'Question', name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer }
      }))
    });
  }

  // ItemList for products
  if (c.products && c.products.length > 0) {
    schemaGraph.push({
      '@type': 'ItemList',
      itemListElement: c.products.map((p, i) => ({
        '@type': 'ListItem', position: i + 1, name: p.name, url: p.amazonUrl
      }))
    });
  }

  html += `<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@graph': schemaGraph }, null, 2)}
</script>
`;

  // GA4 + META PIXEL
  html += `<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
function loadGA4(){if(document.getElementById('ga4-script'))return;var s=document.createElement('script');s.id='ga4-script';s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-RQYYGNC12T';document.head.appendChild(s);gtag('js',new Date());gtag('config','G-RQYYGNC12T');}
if(localStorage.getItem('cj_cookie_consent')==='accepted'){loadGA4();}
function loadMetaPixel(){if(window.fbqLoaded)return;window.fbqLoaded=true;!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1466415711868158');fbq('track','PageView');}
if(localStorage.getItem('cj_cookie_consent')==='accepted'){loadMetaPixel();}
</script>
`;

  // CSS (identical to chalecos template)
  html += `<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',sans-serif;background:#0b1220;color:#fff;line-height:1.7}.container{max-width:1000px;margin:0 auto;padding:0 20px}.nav-wrapper{position:sticky;top:0;z-index:100;background:rgba(11,18,32,.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06)}.nav{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;max-width:1000px;margin:0 auto}.nav>a{color:#f97316;text-decoration:none;font-weight:700;font-size:1.1rem}.nav-links{display:flex;gap:4px;font-size:.85rem;background:rgba(255,255,255,.04);padding:4px;border-radius:999px;border:1px solid rgba(255,255,255,.08)}.nav-links a{color:#94a3b8;font-weight:600;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);transition:all .2s;text-decoration:none}.nav-links a:hover{color:#f97316;background:rgba(249,115,22,.12)}.nav-links a.active{color:#fff;background:rgba(249,115,22,.9);font-weight:700}.breadcrumb{padding:16px 0;font-size:.85rem;color:#64748b}.breadcrumb a{color:#f97316;text-decoration:none}.breadcrumb span{margin:0 8px}.hero{text-align:center;padding:0;position:relative;overflow:hidden;min-height:340px;display:flex;align-items:center;justify-content:center;flex-direction:column}.hero-bg{position:absolute;inset:0;z-index:0}.hero-bg img{width:100%;height:100%;object-fit:cover}.hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(11,18,32,.45) 0%,rgba(11,18,32,.75) 60%,#0b1220 100%)}.hero-content{position:relative;z-index:1;padding:60px 20px 40px;max-width:800px}.hero h1{font-size:2.2rem;font-weight:900;color:#f97316;margin-bottom:12px;line-height:1.15}.hero p{font-size:1.1rem;color:#cbd5e1;max-width:640px;margin:0 auto}.meta{text-align:center;color:#64748b;font-size:.85rem;margin-top:12px}.meta .category{color:#f97316;font-weight:600}.content{padding:40px 32px 60px;max-width:720px;margin:0 auto;font-size:1.08rem;line-height:1.8;background:rgba(255,255,255,.025);border-radius:20px}h2{font-size:1.5rem;font-weight:800;margin:40px 0 16px;color:#fff}h3{font-size:1.15rem;font-weight:700;margin:24px 0 8px;color:#f97316}p{margin-bottom:16px;color:#cbd5e1}ul,ol{margin:0 0 24px 20px}li{margin-bottom:8px;color:#cbd5e1}li strong{color:#fff}.tip{background:rgba(249,115,22,.08);border-left:3px solid #f97316;padding:16px 20px;border-radius:0 12px 12px 0;margin:24px 0}.tip strong{color:#f97316}.product-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px 24px;margin:16px 0}.product-card h3{margin-top:0;font-size:1.05rem}.product-card .product-meta{font-size:.85rem;color:#94a3b8;margin-bottom:8px}.product-card .price-tag{display:inline-block;padding:3px 12px;border-radius:999px;font-size:.85rem;font-weight:700;color:#f97316;background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.2);margin-bottom:10px}.product-card .best-for{font-size:.85rem;color:#4ade80;font-weight:600;margin-bottom:8px}.specs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin:12px 0 16px;font-size:.85rem}.spec-item{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:8px 12px;text-align:center}.spec-item .spec-label{display:block;color:#64748b;font-size:.75rem;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}.spec-item .spec-value{color:#fff;font-weight:700;font-size:.9rem}.comparison-table{width:100%;border-collapse:collapse;margin:24px 0;font-size:.85rem;overflow-x:auto;display:block}.comparison-table th,.comparison-table td{padding:10px 12px;text-align:left;border-bottom:1px solid rgba(255,255,255,.06);white-space:nowrap}.comparison-table th{background:rgba(249,115,22,.12);color:#f97316;font-weight:700;font-size:.8rem;text-transform:uppercase;letter-spacing:.5px;position:sticky;top:0}.comparison-table td{color:#cbd5e1}.comparison-table tr:hover td{background:rgba(255,255,255,.02)}.comparison-table td:first-child{color:#fff;font-weight:600}.faq-item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px 20px;margin:12px 0}.faq-item h3{margin:0 0 8px;font-size:1rem}.faq-item p{margin:0;font-size:.95rem}.cta-box{text-align:center;margin:48px 0;padding:40px 20px;background:rgba(249,115,22,.05);border:1px solid rgba(249,115,22,.15);border-radius:24px}.cta-box h2{margin-top:0}.cta-box p{color:#94a3b8;margin-bottom:20px}.cta{display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;padding:14px 32px;border-radius:50px;font-weight:700;text-decoration:none;font-size:1rem;transition:transform .2s,box-shadow .2s;box-shadow:0 4px 24px rgba(249,115,22,.25)}.cta:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(249,115,22,.35)}.newsletter{margin:40px 0;padding:32px;background:rgba(249,115,22,.04);border:1px solid rgba(249,115,22,.12);border-radius:20px;text-align:center}.newsletter h3{color:#fff;margin-bottom:8px}.newsletter p{color:#94a3b8;font-size:.9rem;margin-bottom:16px}.newsletter form{display:flex;gap:8px;max-width:400px;margin:0 auto;flex-wrap:wrap;justify-content:center}.newsletter input{flex:1;min-width:200px;padding:10px 16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:.9rem;outline:none}.newsletter input:focus{border-color:#f97316}.newsletter button{padding:10px 20px;border-radius:12px;border:none;cursor:pointer}.related{margin:40px 0 0;padding:24px 0;border-top:1px solid rgba(255,255,255,.06)}.related h2{font-size:1.1rem;margin-bottom:16px}.related-links{display:flex;flex-wrap:wrap;gap:8px}.related-links a{color:#f97316;text-decoration:none;padding:6px 14px;border:1px solid rgba(249,115,22,.2);border-radius:999px;font-size:.85rem;white-space:nowrap;transition:background .2s}.related-links a:hover{background:rgba(249,115,22,.1)}.toc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px 24px;margin:0 0 32px}.toc h2{font-size:1rem;margin:0 0 12px;color:#f97316}.toc ul{list-style:none;margin:0;padding:0}.toc li{margin:4px 0}.toc a{color:#94a3b8;text-decoration:none;font-size:.9rem;transition:color .2s}.toc a:hover{color:#f97316}.cookie-banner{position:fixed;bottom:0;left:0;right:0;background:rgba(11,18,32,.97);border-top:1px solid rgba(255,255,255,.1);padding:16px 20px;z-index:9999;display:none;backdrop-filter:blur(12px)}.cookie-inner{max-width:1000px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.cookie-inner p{font-size:.85rem;color:#94a3b8;margin:0;flex:1;min-width:200px}.cookie-inner a{color:#f97316}.cookie-btns{display:flex;gap:8px}.cookie-btns button{padding:8px 20px;border-radius:10px;font-weight:600;font-size:.85rem;cursor:pointer;border:none;transition:all .2s}.btn-accept{background:#f97316;color:#fff}.btn-accept:hover{background:#ea580c}.btn-reject{background:rgba(255,255,255,.06);color:#94a3b8;border:1px solid rgba(255,255,255,.1)}.btn-reject:hover{color:#fff}.product-img{text-align:center;padding:16px;background:rgba(255,255,255,.95);border-radius:12px;margin-bottom:16px}.product-img img{max-height:200px;max-width:100%;object-fit:contain}@media(max-width:640px){.hero{min-height:260px}.hero h1{font-size:1.6rem}h2{font-size:1.3rem}.specs-grid{grid-template-columns:1fr 1fr}.comparison-table{font-size:.75rem}.comparison-table th,.comparison-table td{padding:8px 6px}.nav-links{display:none}.cookie-inner{flex-direction:column;text-align:center}}
@media(max-width:768px){.nav{flex-wrap:wrap;padding:12px 16px}.nav-links{order:3;width:100%;justify-content:center;margin-top:4px}.nav-links a{font-size:.78rem;padding:5px 12px;white-space:nowrap}.nav-auth{margin-left:auto}}
</style>
</head>
`;

  // BODY START
  html += `<body><noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1466415711868158&ev=PageView&noscript=1"/></noscript>

<div class="nav-wrapper">
<nav class="nav">
  <a href="/">CORRER<b>JUNTOS</b></a>
  <div class="nav-links">
      <a href="${L.matchingHref}">${L.matching}</a>
      <a href="${L.citiesHref}">${L.citiesLabel}</a>
      <a href="${isES ? '/blog/' : '/blog/en/'}" class="active">${L.blog}</a>
      <a href="/#app">${L.app}</a>
    </div>
  <div class="nav-auth" style="display:flex;gap:8px;align-items:center">
    <a href="/" style="color:#94a3b8;font-size:.85rem;font-weight:600;padding:6px 14px;border-radius:999px;text-decoration:none">${L.login}</a>
    <a href="/" style="background:#f97316;color:#fff;font-size:.85rem;font-weight:700;padding:6px 16px;border-radius:999px;text-decoration:none">${L.signup}</a>
  </div>
</nav>
</div>

<div class="container">
  <div class="breadcrumb">
    <a href="/">${L.home}</a><span>/</span><a href="${isES ? '/blog/' : '/blog/en/'}">${L.blog}</a><span>/</span>${c.breadcrumbLabel}
  </div>
</div>

<div class="hero">
  <div class="hero-bg"><img src="${heroUrl}" alt="${c.heroAlt || c.title}" loading="eager" fetchpriority="high" width="1200" height="500"></div>
  <div class="hero-content">
  <h1>${c.title}</h1>
  <p>${c.subtitle || c.metaDescription}</p>
  <div class="meta">
    <span class="category">${c.category}</span> &middot; ${c.datePublished} &middot; ${isES ? (c.author || 'Carlos Ruiz') : (c.author || 'Carlos Ruiz')} &middot; ${c.readTime || '15'} ${L.readTime}
  </div>
  </div>
</div>

<div class="container">
  <div class="content">
`;

  // AFFILIATE DISCLOSURE
  html += `    <p style="font-size:.8rem;color:#64748b;background:rgba(255,255,255,.03);padding:12px 16px;border-radius:10px;border:1px solid rgba(255,255,255,.06)">
      ${L.disclosure}
    </p>

`;

  // INTRO
  html += c.introHtml + '\n\n';

  // TOC
  if (c.tocItems && c.tocItems.length > 0) {
    html += `    <nav class="toc">
      <h2>${L.tocTitle}</h2>
      <ul>\n`;
    for (const item of c.tocItems) {
      html += `        <li><a href="#${item.id}">${item.label}</a></li>\n`;
    }
    html += `      </ul>
    </nav>\n\n`;
  }

  // EDUCATIONAL SECTIONS (before products)
  if (c.educationalHtml) {
    html += c.educationalHtml + '\n\n';
  }

  // PRODUCTS
  if (c.products && c.products.length > 0) {
    html += `    <h2 id="ranking">${c.rankingTitle || c.title}</h2>\n\n`;
    if (c.rankingIntro) html += `    <p>${c.rankingIntro}</p>\n\n`;

    for (let i = 0; i < c.products.length; i++) {
      const p = c.products[i];
      const pid = p.id || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      html += `    <div class="product-card" id="${pid}">
      <h3>${i + 1}. ${p.name}${p.tagline ? ' - ' + p.tagline : ''}</h3>\n`;

      // Product image
      if (p.amazonImageUrl) {
        html += `      <div class="product-img"><a href="${p.amazonUrl}" target="_blank" rel="nofollow sponsored noopener"><img src="${p.amazonImageUrl}" alt="${p.name}" loading="lazy"></a></div>\n`;
      }

      // Specs grid
      if (p.specs && p.specs.length > 0) {
        html += `      <div class="specs-grid">\n`;
        for (const s of p.specs) {
          html += `        <div class="spec-item"><span class="spec-label">${s.label}</span><span class="spec-value">${s.value}</span></div>\n`;
        }
        html += `      </div>\n`;
      }

      // Price + best for
      if (p.price) html += `      <span class="price-tag">${p.price}</span>\n`;
      if (p.bestFor) html += `      <p class="best-for">${L.idealFor} ${p.bestFor}</p>\n`;

      // Description
      if (p.descriptionHtml) html += p.descriptionHtml + '\n';

      // Amazon link
      html += `      <p style="margin-top:12px"><a href="${p.amazonUrl}" target="_blank" rel="nofollow sponsored noopener" style="color:#f97316;font-weight:700">${L.seeOnAmazon.replace('Amazon', p.amazonLabel || 'Amazon')}</a></p>
    </div>\n\n`;
    }
  }

  // CTA MID
  html += `    <div class="cta-mid" style="margin:32px 0;padding:20px 24px;background:linear-gradient(135deg,rgba(249,115,22,.08),rgba(249,115,22,.03));border:1px solid rgba(249,115,22,.15);border-radius:16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap"><div style="flex:1;min-width:200px"><p style="color:#fff;font-weight:700;font-size:.95rem;margin:0 0 4px">${L.ctaTitle}</p><p style="color:#94a3b8;font-size:.85rem;margin:0">${L.ctaSub}</p></div><a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" target="_blank" rel="noopener" class="cta" style="padding:10px 20px;font-size:.85rem;white-space:nowrap">${L.ctaBtn}</a></div>\n\n`;

  // COMPARISON TABLE
  if (c.comparisonTableHtml) {
    html += c.comparisonTableHtml + '\n\n';
  }

  // AFTER PRODUCTS (buying guide, tips, etc)
  if (c.afterProductsHtml) {
    html += c.afterProductsHtml + '\n\n';
  }

  // FAQ
  if (c.faqItems && c.faqItems.length > 0) {
    html += `    <h2 id="faq">${c.faqTitle || (isES ? 'Preguntas frecuentes' : 'Frequently asked questions')}</h2>\n\n`;
    for (const f of c.faqItems) {
      html += `    <div class="faq-item">
      <h3>${f.question}</h3>
      <p>${f.answer}</p>
    </div>\n\n`;
    }
  }

  // CONCLUSION
  if (c.conclusionHtml) {
    html += c.conclusionHtml + '\n';
  }

  // CLOSE .content
  html += `  </div>\n\n`;

  // SHARE BUTTONS
  html += `<div class="share-article" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:32px 0;padding:20px;background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.15);border-radius:16px">
  <span style="color:#94a3b8;font-size:.85rem;font-weight:600">${L.shareLabel}</span>
  <a href="#" onclick="event.preventDefault();window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(document.title+' '+location.href),'_blank','width=600,height=400')" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#25D366;color:#fff;border-radius:999px;font-size:.8rem;font-weight:700;text-decoration:none;transition:transform .2s" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"><svg style="width:16px;height:16px" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.682-1.228A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.204 0-4.243-.7-5.912-1.892l-.413-.297-2.783.73.744-2.717-.326-.436A9.962 9.962 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg> WhatsApp</a>
  <a href="#" onclick="event.preventDefault();window.open('https://x.com/intent/tweet?text='+encodeURIComponent(document.title)+'&url='+encodeURIComponent(location.href)+'&via=CorrerJuntos','_blank','width=600,height=400')" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#1e293b;color:#fff;border-radius:999px;font-size:.8rem;font-weight:700;text-decoration:none;transition:transform .2s" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"><svg style="width:14px;height:14px" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X</a>
  <a href="#" onclick="event.preventDefault();navigator.clipboard.writeText(location.href).then(function(){var b=this;b.textContent='\\u2713 ${L.copied.replace("'", "\\'")}';setTimeout(function(){b.innerHTML='${L.copyLink}'},2000)}.bind(this))" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:rgba(255,255,255,.08);color:#cbd5e1;border:1px solid rgba(255,255,255,.12);border-radius:999px;font-size:.8rem;font-weight:600;text-decoration:none;cursor:pointer;transition:transform .2s" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">${L.copyLink}</a>
</div>\n`;

  // CTA BOX (App Store + Google Play)
  html += `<div class="cta-box">
      <h2>${c.ctaBoxTitle || (isES ? 'Estrena tu equipo corriendo en grupo' : 'Break in your gear running with a group')}</h2>
      <p>${c.ctaBoxSub || (isES ? 'Encuentra runners cerca de ti y pon a prueba tu equipo nuevo. Quedadas gratuitas, todos los niveles.' : 'Find runners near you and put your new gear to the test. Free meetups, all levels.')}</p>
      <p style="font-size:.9rem;color:#f97316;font-weight:700;margin:0 0 12px">${L.ctaBoxJoin}</p>
  <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center">
    <a href="https://apps.apple.com/us/app/correr-juntos/id6758505910" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;background:#000;color:#fff;padding:10px 20px;border-radius:12px;text-decoration:none;font-weight:600;font-size:.9rem;border:1px solid rgba(255,255,255,.2);transition:transform .2s"><svg style="width:20px;height:20px" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> App Store</a>
    <a href="https://play.google.com/store/apps/details?id=com.correrjuntos.app" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;background:#000;color:#fff;padding:10px 20px;border-radius:12px;text-decoration:none;font-weight:600;font-size:.9rem;border:1px solid rgba(255,255,255,.2);transition:transform .2s"><svg style="width:20px;height:20px" viewBox="0 0 24 24"><path fill="#34A853" d="M3.609 1.814L13.792 12 3.61 22.186a1.002 1.002 0 01-.61-.92V2.734c0-.388.223-.72.609-.92z"/><path fill="#FBBC04" d="M16.296 15.504L13.792 12l2.504-3.504 4.704 2.734c.859.5.859 1.04 0 1.54l-4.704 2.734z"/><path fill="#4285F4" d="M3.609 1.814L13.792 12l2.504-3.504L5.418.35c-.5-.29-1.14-.18-1.809.464l.001 1z"/><path fill="#EA4335" d="M13.792 12l-10.183 10.186c.669.644 1.309.754 1.809.464l10.878-6.146L13.792 12z"/></svg> Google Play</a>
  </div>
    </div>\n`;

  // AUTHOR BOX
  html += `    <div class="author-box" style="display:flex;gap:16px;align-items:flex-start;padding:24px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px;margin:40px 0">
      <img src="/icons/autor-${authorSlug}.svg" alt="${authorName}" width="64" height="64" loading="lazy" style="border-radius:50%;flex-shrink:0;border:2px solid rgba(249,115,22,.3)">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <a href="/blog/autor/${authorSlug}" style="color:#fff;font-weight:700;font-size:1rem;text-decoration:none">${authorName}</a>
          <span style="font-size:.75rem;padding:2px 8px;background:rgba(249,115,22,.15);color:#f97316;border-radius:6px">Fundador</span>
        </div>
        <p style="color:#94a3b8;font-size:.85rem;line-height:1.5;margin:0">${isES ? 'Corredor desde 2015. 3 maratones, 15+ medias maratones. Fundador de CorrerJuntos. Pruebo cada producto que recomendamos y corro cada ruta que publicamos.' : 'Runner since 2015. 3 marathons, 15+ half marathons. Founder of CorrerJuntos. I test every product we recommend and run every route we publish.'}</p>
        <div style="display:flex;gap:12px;margin-top:8px">
          <a href="https://www.strava.com/athletes/correrjuntos" target="_blank" rel="noopener" style="color:#64748b;font-size:.8rem;text-decoration:none" title="Strava">\ud83c\udfc3 Strava</a>
          <a href="https://www.instagram.com/correrjuntosapp/" target="_blank" rel="noopener" style="color:#64748b;font-size:.8rem;text-decoration:none" title="Instagram">\ud83d\udcf8 Instagram</a>
          <a href="https://x.com/correrjuntosapp" target="_blank" rel="noopener" style="color:#64748b;font-size:.8rem;text-decoration:none" title="X/Twitter">\ud835\udd4f Twitter</a>
        </div>
      </div>
    </div>\n\n`;

  // NEWSLETTER
  html += `  <div class="newsletter">
    <h3>${L.nlTitle}</h3>
    <p>${L.nlSub}</p>
    <form id="newsletter-form" onsubmit="submitNewsletter(event)">
      <input type="email" id="newsletter-email" required placeholder="tu@email.com" aria-label="Email">
      <button type="submit" id="newsletter-btn" class="cta" style="padding:10px 20px;font-size:.9rem">${L.nlBtn}</button>
    </form>
    <div id="newsletter-success" style="display:none;margin-top:12px;padding:10px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:10px"><p style="color:#4ade80;font-size:.85rem;font-weight:600;margin:0">${L.nlSuccess}</p></div>
    <div id="newsletter-error" style="display:none;margin-top:12px;padding:10px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:10px"><p style="color:#f87171;font-size:.85rem;margin:0">${L.nlError}</p></div>
  </div>

    <div class="cta-box" style="background:rgba(249,115,22,.03);border:1px solid rgba(249,115,22,.1)">
    <h2>${L.nlTitle2}</h2>
    <p style="color:#94a3b8;margin-bottom:16px">${L.nlSub2}</p>
    <form id="nl-form" onsubmit="submitNL(event)" style="display:flex;gap:8px;max-width:420px;margin:0 auto;flex-wrap:wrap;justify-content:center">
      <input type="email" id="nl-email" required placeholder="tu@email.com" style="flex:1;min-width:200px;padding:12px 16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:.9rem;outline:none" onfocus="this.style.borderColor='#f97316'" onblur="this.style.borderColor='rgba(255,255,255,.1)'">
      <button type="submit" id="nl-btn" class="cta" style="padding:12px 24px;font-size:.9rem">${L.nlBtn}</button>
    </form>
    <p style="font-size:.72rem;color:#64748b;margin-top:8px">${L.nlPrivacy}</p>
  </div>\n\n`;

  // RELATED
  if (c.relatedLinks && c.relatedLinks.length > 0) {
    html += `  <div class="related">
    <h2>${L.relatedTitle}</h2>
    <div class="related-links">\n`;
    for (const r of c.relatedLinks) {
      html += `      <a href="${r.href}">${r.label}</a>\n`;
    }
    html += `    </div>
  </div>\n`;
  }

  // CLOSE .container
  html += `</div>\n\n`;

  // NEWSLETTER SCRIPT
  html += `<script>
async function submitNewsletter(e) {
    e.preventDefault();
    var email = document.getElementById('newsletter-email').value.trim();
    var btn = document.getElementById('newsletter-btn');
    var form = document.getElementById('newsletter-form');
    var successDiv = document.getElementById('newsletter-success');
    var errorDiv = document.getElementById('newsletter-error');
    if (!email) return;
    btn.disabled = true; btn.textContent = '...';
    successDiv.style.display = 'none'; errorDiv.style.display = 'none';
    try {
        var res = await fetch('/api/brevo-subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, lang: '${lang}', source: '${nlSource}' }) });
        if (res.ok || res.status === 201) { form.style.display = 'none'; successDiv.style.display = 'block'; }
        else if (res.status === 409) { successDiv.querySelector('p').textContent = '${isES ? 'Ya est\\u00e1s suscrito/a. Gracias!' : 'Already subscribed. Thanks!'}'; form.style.display = 'none'; successDiv.style.display = 'block'; }
        else { throw new Error('HTTP ' + res.status); }
    } catch (err) { errorDiv.style.display = 'block'; console.error('Newsletter error:', err); }
    finally { btn.disabled = false; btn.textContent = '${L.nlBtn}'; }
}
async function submitNL(e) {
    e.preventDefault();
    var email = document.getElementById('nl-email').value.trim();
    var btn = document.getElementById('nl-btn');
    var form = document.getElementById('nl-form');
    if (!email) return;
    btn.disabled = true; btn.textContent = '...';
    try {
        var res = await fetch('/api/brevo-subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, lang: '${lang}', source: '${nlSource}' }) });
        if (res.ok || res.status === 201 || res.status === 409) { form.innerHTML = '<p style="color:#4ade80;font-weight:600;font-size:.9rem">${isES ? '\\u2705 Bienvenido/a!' : '\\u2705 Welcome!'}</p>'; }
        else { throw new Error('HTTP ' + res.status); }
    } catch (err) { btn.disabled = false; btn.textContent = '${L.nlBtn}'; alert('Error'); }
}
</script>\n\n`;

  // COOKIE BANNER
  html += `<div class="cookie-banner" id="cookie-banner">
  <div class="cookie-inner">
    <p>${L.cookieText} <a href="/legal/cookies.html">${L.cookieMore}</a></p>
    <div class="cookie-btns">
      <button class="btn-reject" onclick="rejectCookies()">${L.cookieReject}</button>
      <button class="btn-accept" onclick="acceptCookies()">${L.cookieAccept}</button>
    </div>
  </div>
</div>
<script>
if(!localStorage.getItem('cj_cookie_consent')){document.getElementById('cookie-banner').style.display='block';}
function acceptCookies(){localStorage.setItem('cj_cookie_consent','accepted');document.getElementById('cookie-banner').style.display='none';loadGA4();}
function rejectCookies(){localStorage.setItem('cj_cookie_consent','rejected');document.getElementById('cookie-banner').style.display='none';}
</script>\n\n`;

  // FOOTER
  html += `<footer style="background:rgba(255,255,255,.03);border-top:1px solid rgba(255,255,255,.06);padding:48px 20px 24px;margin-top:60px">
<div style="max-width:1000px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:32px;margin-bottom:32px">
  <div>
    <a href="/" style="color:#f97316;font-weight:800;font-size:1.1rem;text-decoration:none;display:block;margin-bottom:16px">CorrerJuntos</a>
    <p style="color:#64748b;font-size:.85rem;line-height:1.6">${L.footerDesc}</p>
    <div style="display:flex;gap:8px;margin-top:16px">
      <a href="https://instagram.com/correrjuntosapp/" target="_blank" rel="noopener" style="color:#94a3b8;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:rgba(255,255,255,.06);border-radius:8px" aria-label="Instagram"><svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
      <a href="https://tiktok.com/@correrjuntosapp" target="_blank" rel="noopener" style="color:#94a3b8;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:rgba(255,255,255,.06);border-radius:8px" aria-label="TikTok"><svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg></a>
      <a href="https://youtube.com/@correrjuntos" target="_blank" rel="noopener" style="color:#94a3b8;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:rgba(255,255,255,.06);border-radius:8px" aria-label="YouTube"><svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
      <a href="https://strava.com/clubs/correrjuntos" target="_blank" rel="noopener" style="color:#94a3b8;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:rgba(255,255,255,.06);border-radius:8px" aria-label="Strava"><svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg></a>
      <a href="https://twitter.com/CorrerJuntos" target="_blank" rel="noopener" style="color:#94a3b8;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:rgba(255,255,255,.06);border-radius:8px" aria-label="X"><svg style="width:18px;height:18px" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
    </div>
  </div>
  <div>
    <div style="color:#fff;font-weight:700;font-size:.9rem;margin-bottom:16px">${L.footerExplore}</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <a href="${L.citiesHref}" style="color:#94a3b8;text-decoration:none;font-size:.85rem">${L.citiesLabel}</a>
      <a href="${isES ? '/blog/' : '/blog/en/'}" style="color:#94a3b8;text-decoration:none;font-size:.85rem">${L.blog}</a>
      <a href="/equipamiento/" style="color:#94a3b8;text-decoration:none;font-size:.85rem">Equipamiento</a>
      <a href="/#app" style="color:#94a3b8;text-decoration:none;font-size:.85rem">${L.app}</a>
    </div>
  </div>
  <div>
    <div style="color:#fff;font-weight:700;font-size:.9rem;margin-bottom:16px">${L.footerCompany}</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <a href="/sobre-nosotros.html" style="color:#94a3b8;text-decoration:none;font-size:.85rem">${L.footerAbout}</a>
      <a href="/inversores.html" style="color:#94a3b8;text-decoration:none;font-size:.85rem">${L.footerInvestors}</a>
      <a href="mailto:hola@correrjuntos.com" style="color:#94a3b8;text-decoration:none;font-size:.85rem">${L.footerContact}</a>
      <a href="/patrocinadores" style="color:#94a3b8;text-decoration:none;font-size:.85rem">${L.footerSponsors}</a>
      <a href="/media-kit" style="color:#94a3b8;text-decoration:none;font-size:.85rem">${L.footerMedia}</a>
    </div>
  </div>
  <div>
    <div style="color:#fff;font-weight:700;font-size:.9rem;margin-bottom:16px">${L.footerLegal}</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <a href="/privacy.html" style="color:#94a3b8;text-decoration:none;font-size:.85rem">${L.footerPrivacy}</a>
      <a href="/terms.html" style="color:#94a3b8;text-decoration:none;font-size:.85rem">${L.footerTerms}</a>
      <a href="/legal/cookies.html" style="color:#94a3b8;text-decoration:none;font-size:.85rem">${L.footerCookies}</a>
    </div>
  </div>
</div>
<div style="border-top:1px solid rgba(255,255,255,.06);padding-top:24px;text-align:center">
  <p style="color:#64748b;font-size:.8rem">${L.footerCopy}</p>
</div>
</footer>
<script src="/blog/toc.js" defer></script>
<script src="/blog/author.js" defer></script>
<script src="/blog/related.js" defer></script>
<script src="/blog/enhance.js" defer></script>
<script src="/blog/city-links.js" defer></script>
</body>
</html>`;

  // Write file
  const outDir = isES ? path.join(rootDir, 'blog') : path.join(rootDir, 'blog', 'en');
  const outPath = path.join(outDir, c.slug + '.html');
  fs.writeFileSync(outPath, html, 'utf8');
  const lines = html.split('\n').length;
  console.log(`[${lang.toUpperCase()}] ${outPath} (${lines} lines)`);
}

// Run
if (langFlag) {
  generate(langFlag);
} else {
  generate('es');
  generate('en');
}

console.log('Done!');
