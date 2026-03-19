#!/usr/bin/env node
/**
 * add-howto-schema.cjs
 * Adds HowTo schema to tutorial/routine articles.
 * Extracts h2 headings as steps and inserts HowTo into existing @graph.
 */
const fs = require('fs');
const path = require('path');

// Articles that need HowTo schema with their metadata
const ARTICLES = {
  // ES
  'blog/core-para-runners.html': { name: 'Rutina de Core para Runners: 10 Ejercicios en 15 min', time: 'PT15M' },
  'blog/empezar-a-correr-guia-principiantes.html': { name: 'Cómo Empezar a Correr desde Cero', time: 'PT8W' },
  'blog/estiramientos-antes-despues-correr.html': { name: 'Estiramientos Antes y Después de Correr', time: 'PT15M' },
  'blog/plan-entrenamiento-10k.html': { name: 'Plan de Entrenamiento 10K para Principiantes', time: 'PT8W' },
  'blog/plan-entrenamiento-media-maraton.html': { name: 'Plan de Entrenamiento Media Maratón', time: 'PT12W' },
  'blog/de-cero-a-5k.html': { name: 'Plan de Cero a 5K en 8 Semanas', time: 'PT8W' },
  'blog/entrenamiento-series-fartlek.html': { name: 'Entrenamiento de Series y Fartlek para Corredores', time: 'PT45M' },
  'blog/entrenamiento-cruzado-running.html': { name: 'Entrenamiento Cruzado para Runners', time: 'PT30M' },
  'blog/entrenamiento-fuerza-corredores.html': { name: 'Entrenamiento de Fuerza para Corredores', time: 'PT30M' },
  'blog/tapering-semana-previa-carrera.html': { name: 'Tapering: Guía de la Semana Previa a la Carrera', time: 'PT1W' },
  'blog/yoga-para-corredores.html': { name: 'Yoga para Corredores: 10 Posturas Esenciales', time: 'PT20M' },
  'blog/ejercicios-fuerza-piernas-corredores.html': { name: '12 Ejercicios de Fuerza de Piernas para Corredores', time: 'PT25M' },
  'blog/mejores-bandas-elasticas-running.html': { name: 'Rutina de 20 Minutos con Bandas Elásticas para Runners', time: 'PT20M' },
  'blog/volver-a-correr-tras-pausa-larga.html': { name: 'Cómo Volver a Correr Tras una Pausa Larga', time: 'PT6W' },
  'blog/plan-maraton-sub-3-30.html': { name: 'Plan Maratón Sub 3:30 en 16 Semanas', time: 'PT16W' },
  // EN equivalents
  'blog/en/core-exercises-runners.html': { name: 'Core Exercises for Runners: 10 Moves in 15 min', time: 'PT15M' },
  'blog/en/how-to-start-running-beginners-guide.html': { name: 'How to Start Running from Scratch', time: 'PT8W' },
  'blog/en/stretching-before-after-running.html': { name: 'Stretching Before and After Running', time: 'PT15M' },
  'blog/en/10k-training-plan.html': { name: '10K Training Plan for Beginners', time: 'PT8W' },
  'blog/en/half-marathon-training-plan.html': { name: 'Half Marathon Training Plan', time: 'PT12W' },
  'blog/en/couch-to-5k-plan.html': { name: 'Couch to 5K Plan: 8 Weeks', time: 'PT8W' },
  'blog/en/interval-training-fartlek-runners.html': { name: 'Interval Training and Fartlek for Runners', time: 'PT45M' },
  'blog/en/cross-training-for-runners.html': { name: 'Cross-Training for Runners', time: 'PT30M' },
  'blog/en/leg-strength-exercises-runners.html': { name: 'Leg Strength Exercises for Runners', time: 'PT30M' },
  'blog/en/tapering-race-week-guide.html': { name: 'Tapering: Race Week Guide for Runners', time: 'PT1W' },
  'blog/en/yoga-for-runners.html': { name: 'Yoga for Runners: 10 Essential Poses', time: 'PT20M' },
  'blog/en/best-resistance-bands-for-runners.html': { name: '20-Minute Resistance Band Routine for Runners', time: 'PT20M' },
  'blog/en/comeback-running-after-long-break.html': { name: 'How to Come Back to Running After a Long Break', time: 'PT6W' },
  'blog/en/marathon-sub-3-30-plan.html': { name: 'Marathon Sub 3:30 Plan: 16 Weeks', time: 'PT16W' },
};

function extractH2Steps(html) {
  const steps = [];
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  let match;
  let pos = 1;
  while ((match = h2Regex.exec(html)) !== null) {
    let text = match[1].replace(/<[^>]*>/g, '').trim();
    // Skip FAQ, newsletter, related, author sections
    if (/FAQ|Newsletter|Contenido|Contents|Keep reading|Sigue leyendo|Autor|Author/i.test(text)) continue;
    if (text.length < 3) continue;
    steps.push({ position: pos, name: text });
    pos++;
  }
  return steps;
}

let modified = 0;
let total = 0;

for (const [filePath, meta] of Object.entries(ARTICLES)) {
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP (not found): ${filePath}`);
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Skip if already has HowTo
  if (html.includes('"HowTo"') || html.includes("'HowTo'")) {
    console.log(`  SKIP (already has HowTo): ${filePath}`);
    continue;
  }

  total++;
  const steps = extractH2Steps(html);
  if (steps.length < 2) {
    console.log(`  SKIP (< 2 steps): ${filePath}`);
    continue;
  }

  // Build HowTo schema
  const howTo = {
    "@type": "HowTo",
    "name": meta.name,
    "totalTime": meta.time,
    "step": steps.map(s => ({
      "@type": "HowToStep",
      "position": s.position,
      "name": s.name
    }))
  };

  // Find the @graph array and insert HowTo before FAQPage or BreadcrumbList
  // Strategy: find "FAQPage" in the JSON-LD and insert HowTo before it
  const faqMarker = '{"@type":"FAQPage"';
  const faqMarkerAlt = '{\n      "@type": "FAQPage"';

  // Try to insert before FAQPage
  let insertPoint = html.indexOf('"@type": "FAQPage"');
  if (insertPoint === -1) insertPoint = html.indexOf('"@type":"FAQPage"');

  if (insertPoint === -1) {
    console.log(`  SKIP (no FAQPage to insert before): ${filePath}`);
    continue;
  }

  // Walk back to find the opening { of the FAQPage object
  let bracePos = insertPoint;
  while (bracePos > 0 && html[bracePos] !== '{') bracePos--;

  // The HowTo JSON to insert (with trailing comma)
  const howToJson = JSON.stringify(howTo, null, 6).replace(/\n/g, '\n      ');
  const insertion = '      ' + howToJson + ',\n    ';

  // Insert before the FAQPage object
  html = html.substring(0, bracePos) + insertion + html.substring(bracePos);

  fs.writeFileSync(filePath, html, 'utf8');
  modified++;
  console.log(`  + ${filePath}: HowTo added (${steps.length} steps)`);
}

console.log(`\n── Summary ──`);
console.log(`Processed: ${total}`);
console.log(`Modified:  ${modified}`);
