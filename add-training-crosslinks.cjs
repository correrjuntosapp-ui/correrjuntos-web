#!/usr/bin/env node
/**
 * add-training-crosslinks.cjs
 * Adds cross-link sections to all 12 training plan articles (6 ES + 6 EN).
 * Inserts BEFORE the first <div class="author-bio" in each file.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

const ES_ARTICLES = [
  { slug: 'plan-entrenamiento-10k.html', title: 'Plan 10K', photo: '3019696', cat: 'Entrenamiento · 10K' },
  { slug: 'plan-entrenamiento-media-maraton.html', title: 'Plan Media Maratón', photo: '3601094', cat: 'Entrenamiento · 21K' },
  { slug: 'plan-maraton-sub-3-30.html', title: 'Plan Maratón Sub 3:30', photo: '2402777', cat: 'Entrenamiento · 42K' },
  { slug: 'entrenamiento-series-fartlek.html', title: 'Series y Fartlek', photo: '2803158', cat: 'Entrenamiento · Intervalos' },
  { slug: 'periodizacion-entrenamiento-running.html', title: 'Periodización', photo: '2827392', cat: 'Entrenamiento · Planificación' },
  { slug: 'tapering-semana-previa-carrera.html', title: 'Tapering', photo: '7187803', cat: 'Entrenamiento · Pre-carrera' },
];

const EN_ARTICLES = [
  { slug: '10k-training-plan.html', title: '10K Training Plan', photo: '3019696', cat: 'Training · 10K' },
  { slug: 'half-marathon-training-plan.html', title: 'Half Marathon Plan', photo: '3601094', cat: 'Training · Half Marathon' },
  { slug: 'marathon-sub-3-30-plan.html', title: 'Marathon Sub 3:30', photo: '2402777', cat: 'Training · Marathon' },
  { slug: 'interval-fartlek-training.html', title: 'Intervals & Fartlek', photo: '2803158', cat: 'Training · Intervals' },
  { slug: 'running-training-periodization.html', title: 'Periodization', photo: '2827392', cat: 'Training · Planning' },
  { slug: 'tapering-race-week-guide.html', title: 'Tapering Guide', photo: '7187803', cat: 'Training · Pre-race' },
];

function buildCard(article, lang, blogPrefix) {
  const cta = lang === 'es' ? 'Ver guía →' : 'Read guide →';
  return `        <a href="/${blogPrefix}${article.slug}" style="display:block;text-decoration:none;border-radius:16px;overflow:hidden;border:1px solid #efe6db;background:#fffcf9;transition:all .25s">
          <img src="https://images.pexels.com/photos/${article.photo}/pexels-photo-${article.photo}.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=70" alt="${article.title}" loading="lazy" width="400" height="200" style="width:100%;height:140px;object-fit:cover;display:block">
          <div style="padding:14px 16px">
            <span style="font-size:.7rem;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:.5px">${article.cat}</span>
            <p style="font-size:.95rem;font-weight:700;color:#3d3229;margin:4px 0 6px;line-height:1.3">${article.title}</p>
            <span style="font-size:.8rem;color:#f97316;font-weight:600">${cta}</span>
          </div>
        </a>`;
}

function buildSection(currentSlug, articles, lang, blogPrefix) {
  const heading = lang === 'es' ? '📋 Más guías de entrenamiento' : '📋 More training guides';
  const others = articles.filter(a => a.slug !== currentSlug);
  const cards = others.map(a => buildCard(a, lang, blogPrefix)).join('\n');

  return `
    <div style="margin:48px 0 32px;padding:32px 0 0;border-top:1px solid #efe6db">
      <h2 style="font-size:1.2rem;font-weight:800;color:#3d3229;margin:0 0 20px">${heading}</h2>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">
${cards}
      </div>
    </div>

`;
}

function processFile(filePath, currentSlug, articles, lang, blogPrefix) {
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${filePath}`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf-8');

  if (html.includes('Más guías de entrenamiento') || html.includes('More training guides')) {
    console.log(`SKIP (already has crosslinks): ${filePath}`);
    return;
  }

  // Try author-bio first, then author-box
  let marker = '<div class="author-bio';
  let idx = html.indexOf(marker);
  if (idx === -1) {
    marker = '<!-- Author Box -->';
    idx = html.indexOf(marker);
  }
  if (idx === -1) {
    marker = '<div class="author-box"';
    idx = html.indexOf(marker);
  }
  if (idx === -1) {
    console.log(`SKIP (no author-bio found): ${filePath}`);
    return;
  }

  const section = buildSection(currentSlug, articles, lang, blogPrefix);
  html = html.slice(0, idx) + section + html.slice(idx);

  fs.writeFileSync(filePath, html, 'utf-8');
  console.log(`UPDATED: ${filePath}`);
}

// Process ES articles
for (const article of ES_ARTICLES) {
  const filePath = path.join(ROOT, 'blog', article.slug);
  processFile(filePath, article.slug, ES_ARTICLES, 'es', 'blog/');
}

// Process EN articles
for (const article of EN_ARTICLES) {
  const filePath = path.join(ROOT, 'blog', 'en', article.slug);
  processFile(filePath, article.slug, EN_ARTICLES, 'en', 'blog/en/');
}

console.log('\nDone.');
