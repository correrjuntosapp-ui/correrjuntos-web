#!/usr/bin/env node
/**
 * Blog Fix: dark mode auto-detect + add 3 inline photos per article
 * 1. Change theme script to NOT auto-detect system dark mode (light always default)
 * 2. Add 3 contextual <figure> photos per article in body content
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const FILES_ES = [
  'blog/duatlon-principiantes-guia.html',
  'blog/running-y-suelo-pelvico.html',
  'blog/cadencia-running-ideal.html',
  'blog/correr-con-diabetes.html',
  'blog/test-cooper-running.html',
  'blog/correr-con-70-anos.html',
  'blog/carreras-nocturnas-espana.html',
  'blog/plan-entrenamiento-5k-sub-25.html',
  'blog/como-pasar-de-running-a-triatlon.html',
];

const FILES_EN = [
  'blog/en/duathlon-beginners-guide.html',
  'blog/en/running-pelvic-floor-guide.html',
  'blog/en/ideal-running-cadence.html',
  'blog/en/running-with-diabetes-guide.html',
  'blog/en/cooper-test-running-guide.html',
  'blog/en/running-at-70-years-old.html',
  'blog/en/night-races-spain-2026.html',
  'blog/en/5k-sub-25-training-plan.html',
  'blog/en/transition-running-to-triathlon.html',
];

const ALL_FILES = [...FILES_ES, ...FILES_EN];

// === FIX 1: Dark mode script — only explicit choice, no system auto-detect ===
const DARK_SCRIPT_OLD = `<script>(function(){var s=localStorage.getItem('blog_theme'),d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(s==='dark'||(!s&&d))document.documentElement.classList.add('dark-mode')})()</script>`;
const DARK_SCRIPT_NEW = `<script>(function(){if(localStorage.getItem('blog_theme')==='dark')document.documentElement.classList.add('dark-mode')})()</script>`;

// === Verified Pexels photos pool (all confirmed working in existing articles) ===
const PHOTOS = {
  runner_park: { id: '20400836', alt_es: 'Runner corriendo por un camino arbolado en un parque', alt_en: 'Runner jogging through a tree-lined path in a park' },
  runner_road: { id: '2495568', alt_es: 'Runner corriendo con buena postura por una carretera', alt_en: 'Runner with good form on a road' },
  group_running: { id: '5319579', alt_es: 'Grupo de runners corriendo juntos por la ciudad', alt_en: 'Group of runners training together in the city' },
  group_trail: { id: '3823063', alt_es: 'Grupo de runners entrenando juntos a ritmo suave', alt_en: 'Group of runners training together at easy pace' },
  stretching: { id: '8346652', alt_es: 'Corredora estirando las piernas despu\u00e9s de correr', alt_en: 'Runner stretching legs after a run' },
  stretching_recovery: { id: '4379234', alt_es: 'Atleta haciendo ejercicios de recuperaci\u00f3n tras entrenamiento', alt_en: 'Athlete doing recovery exercises after training' },
  food_bowl: { id: '4220141', alt_es: 'Bowl de avena con fruta - desayuno ideal para runners', alt_en: 'Oatmeal bowl with fruit - ideal runner breakfast' },
  gps_watch: { id: '4793250', alt_es: 'Runner consultando datos en su reloj deportivo GPS', alt_en: 'Runner checking data on GPS sports watch' },
  foam_roller: { id: '19070991', alt_es: 'Deportista usando foam roller para recuperaci\u00f3n muscular', alt_en: 'Athlete using foam roller for muscle recovery' },
  finish_line: { id: '2403516', alt_es: 'Runner celebrando al cruzar la meta de una carrera', alt_en: 'Runner celebrating crossing the finish line' },
  tying_shoes: { id: '10257963', alt_es: 'Primer plano de manos atando los cordones de zapatillas de running', alt_en: 'Close-up of hands tying running shoe laces' },
  fatigue: { id: '4046974', alt_es: 'Corredor descansando con signos de fatiga', alt_en: 'Runner resting with signs of fatigue' },
  tired_runner: { id: '2421562', alt_es: 'Corredor agotado recibiendo ayuda durante entrenamiento', alt_en: 'Exhausted runner getting help during training' },
  cycling: { id: '1415811', alt_es: 'Ciclistas entrenando en carretera', alt_en: 'Cyclists training on the road' },
};

function photoTag(photoKey, isEN) {
  const p = PHOTOS[photoKey];
  const alt = isEN ? p.alt_en : p.alt_es;
  return `https://images.pexels.com/photos/${p.id}/pexels-photo-${p.id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=75`;
}

function makeFigure(photoKey, caption, isEN) {
  const p = PHOTOS[photoKey];
  const alt = isEN ? p.alt_en : p.alt_es;
  const url = `https://images.pexels.com/photos/${p.id}/pexels-photo-${p.id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=75`;
  return `\n<figure style="margin:32px 0;text-align:center">\n  <img src="${url}" alt="${alt}" loading="lazy" style="max-width:100%;border-radius:12px">\n  <figcaption style="font-size:.85rem;color:#888;margin-top:8px">${caption}</figcaption>\n</figure>\n`;
}

// Photo assignments per article (3 photos each, placed after specific h2 sections)
const ARTICLE_PHOTOS = {
  'duatlon-principiantes-guia': [
    { after_h2: 'por-que-runners', photo: 'cycling', caption_es: 'El ciclismo es el complemento perfecto para runners que buscan un nuevo reto', caption_en: 'Cycling is the perfect complement for runners looking for a new challenge' },
    { after_h2: 'transiciones', photo: 'tying_shoes', caption_es: 'Las transiciones r\u00e1pidas son clave para un buen resultado en duat\u00f3n', caption_en: 'Fast transitions are key to a good duathlon result' },
    { after_h2: 'nutricion-hidratacion', photo: 'food_bowl', caption_es: 'La nutrici\u00f3n adecuada es fundamental para rendir en un duat\u00f3n', caption_en: 'Proper nutrition is essential for duathlon performance' },
  ],
  'running-y-suelo-pelvico': [
    { after_h2: 'que-es-suelo-pelvico', photo: 'stretching', caption_es: 'Los ejercicios espec\u00edficos fortalecen el suelo p\u00e9lvico y mejoran el rendimiento', caption_en: 'Specific exercises strengthen the pelvic floor and improve performance' },
    { after_h2: 'ejercicios', photo: 'stretching_recovery', caption_es: 'Incorporar ejercicios de suelo p\u00e9lvico en tu rutina reduce los s\u00edntomas significativamente', caption_en: 'Incorporating pelvic floor exercises into your routine significantly reduces symptoms' },
    { after_h2: 'running-seguro', photo: 'runner_park', caption_es: 'Con las adaptaciones adecuadas, puedes seguir corriendo de forma segura', caption_en: 'With the right adaptations, you can continue running safely' },
  ],
  'cadencia-running-ideal': [
    { after_h2: 'que-es-cadencia', photo: 'runner_road', caption_es: 'La cadencia es uno de los par\u00e1metros m\u00e1s importantes para mejorar tu eficiencia', caption_en: 'Cadence is one of the most important parameters to improve your efficiency' },
    { after_h2: 'como-medir', photo: 'gps_watch', caption_es: 'Los relojes GPS modernos miden la cadencia en tiempo real durante tus entrenamientos', caption_en: 'Modern GPS watches measure cadence in real-time during your workouts' },
    { after_h2: 'como-mejorar', photo: 'group_running', caption_es: 'Entrenar con otros runners te ayuda a mantener una cadencia constante', caption_en: 'Training with other runners helps you maintain a steady cadence' },
  ],
  'correr-con-diabetes': [
    { after_h2: 'ciencia', photo: 'runner_park', caption_es: 'El running regular mejora significativamente el control gluc\u00e9mico', caption_en: 'Regular running significantly improves glycemic control' },
    { after_h2: 'durante-carrera', photo: 'gps_watch', caption_es: 'Monitorizar tus datos durante el entrenamiento es esencial con diabetes', caption_en: 'Monitoring your data during training is essential with diabetes' },
    { after_h2: 'plan-entrenamiento', photo: 'group_trail', caption_es: 'Entrenar en grupo aporta seguridad extra para runners con diabetes', caption_en: 'Group training provides extra safety for runners with diabetes' },
  ],
  'test-cooper-running': [
    { after_h2: 'como-realizar', photo: 'runner_road', caption_es: 'El test de Cooper se realiza en pista o superficie plana, corriendo 12 minutos al m\u00e1ximo', caption_en: 'The Cooper test is performed on a track or flat surface, running 12 minutes at maximum effort' },
    { after_h2: 'como-mejorar', photo: 'group_running', caption_es: 'Los entrenamientos por intervalos son la clave para mejorar tu resultado en el test', caption_en: 'Interval training is the key to improving your test result' },
    { after_h2: 'errores-comunes', photo: 'stretching_recovery', caption_es: 'Un calentamiento adecuado es esencial para obtener resultados fiables', caption_en: 'A proper warm-up is essential for reliable results' },
  ],
  'correr-con-70-anos': [
    { after_h2: 'beneficios', photo: 'group_trail', caption_es: 'Correr a cualquier edad aporta beneficios cardiovasculares y cognitivos', caption_en: 'Running at any age provides cardiovascular and cognitive benefits' },
    { after_h2: 'como-empezar', photo: 'stretching', caption_es: 'Empezar con caminata y progresar gradualmente es la clave del \u00e9xito', caption_en: 'Starting with walking and progressing gradually is the key to success' },
    { after_h2: 'fuerza', photo: 'stretching_recovery', caption_es: 'El trabajo de fuerza complementario previene lesiones y mejora la estabilidad', caption_en: 'Complementary strength work prevents injuries and improves stability' },
  ],
  'carreras-nocturnas-espana': [
    { after_h2: 'por-que-noche', photo: 'group_running', caption_es: 'Las carreras nocturnas ofrecen una experiencia \u00fanica y una atm\u00f3sfera especial', caption_en: 'Night races offer a unique experience and special atmosphere' },
    { after_h2: 'equipamiento', photo: 'tying_shoes', caption_es: 'El equipamiento adecuado es crucial para correr de noche con seguridad', caption_en: 'Proper equipment is crucial for running safely at night' },
    { after_h2: 'preparacion', photo: 'food_bowl', caption_es: 'La alimentaci\u00f3n antes de una carrera nocturna requiere ajustes de horario', caption_en: 'Nutrition before a night race requires schedule adjustments' },
  ],
  'plan-entrenamiento-5k-sub-25': [
    { after_h2: 'requisitos', photo: 'runner_road', caption_es: 'Para bajar de 25 minutos en 5K necesitas una base s\u00f3lida de kilometraje', caption_en: 'To break 25 minutes in a 5K you need a solid mileage base' },
    { after_h2: 'tipos-sesion', photo: 'gps_watch', caption_es: 'Controlar tus ritmos con un reloj GPS te ayuda a ejecutar las series con precisi\u00f3n', caption_en: 'Tracking your pace with a GPS watch helps you execute intervals precisely' },
    { after_h2: 'nutricion', photo: 'food_bowl', caption_es: 'La alimentaci\u00f3n es el combustible que soporta tu entrenamiento de alto rendimiento', caption_en: 'Nutrition is the fuel that supports your high-performance training' },
  ],
  'como-pasar-de-running-a-triatlon': [
    { after_h2: 'por-que-triatlon', photo: 'cycling', caption_es: 'El triatl\u00f3n combina nataci\u00f3n, ciclismo y carrera: un reto completo para runners', caption_en: 'Triathlon combines swimming, cycling and running: a complete challenge for runners' },
    { after_h2: 'natacion', photo: 'stretching_recovery', caption_es: 'La t\u00e9cnica de nataci\u00f3n es el mayor reto para runners que debutan en triatl\u00f3n', caption_en: 'Swimming technique is the biggest challenge for runners debuting in triathlon' },
    { after_h2: 'nutricion', photo: 'food_bowl', caption_es: 'La nutrici\u00f3n en triatl\u00f3n es m\u00e1s compleja que en running por la duraci\u00f3n del esfuerzo', caption_en: 'Triathlon nutrition is more complex than running due to the effort duration' },
  ],
};

let stats = { darkFixed: 0, photosAdded: 0, errors: [] };

for (const relPath of ALL_FILES) {
  const filePath = path.join(ROOT, relPath);
  try {
    let html = fs.readFileSync(filePath, 'utf-8');
    const isEN = relPath.includes('/en/');

    // Extract article slug for photo mapping
    const slug = path.basename(relPath, '.html');

    // Map EN slugs to ES slugs for photo lookup
    const enToEs = {
      'duathlon-beginners-guide': 'duatlon-principiantes-guia',
      'running-pelvic-floor-guide': 'running-y-suelo-pelvico',
      'ideal-running-cadence': 'cadencia-running-ideal',
      'running-with-diabetes-guide': 'correr-con-diabetes',
      'cooper-test-running-guide': 'test-cooper-running',
      'running-at-70-years-old': 'correr-con-70-anos',
      'night-races-spain-2026': 'carreras-nocturnas-espana',
      '5k-sub-25-training-plan': 'plan-entrenamiento-5k-sub-25',
      'transition-running-to-triathlon': 'como-pasar-de-running-a-triatlon',
    };

    const photoKey = isEN ? enToEs[slug] : slug;

    // FIX 1: Dark mode script
    if (html.includes(DARK_SCRIPT_OLD)) {
      html = html.replace(DARK_SCRIPT_OLD, DARK_SCRIPT_NEW);
      stats.darkFixed++;
    }

    // FIX 2: Add 3 inline photos (only if article doesn't already have inline figures)
    const existingFigures = (html.match(/<figure/g) || []).length;
    if (existingFigures < 2 && ARTICLE_PHOTOS[photoKey]) {
      const photos = ARTICLE_PHOTOS[photoKey];
      let photosInserted = 0;

      for (const photoConfig of photos) {
        const caption = isEN ? photoConfig.caption_en : photoConfig.caption_es;
        const figure = makeFigure(photoConfig.photo, caption, isEN);

        // Try to find the h2 with matching id and insert after the first paragraph following it
        const h2Pattern = new RegExp(`(<h2[^>]*id="${photoConfig.after_h2}"[^>]*>[\\s\\S]*?</h2>)\\s*(<p>[\\s\\S]*?</p>)`);
        const match = html.match(h2Pattern);

        if (match) {
          html = html.replace(match[0], match[0] + figure);
          photosInserted++;
        } else {
          // Fallback: try just finding id="..." in any tag
          const simplePattern = new RegExp(`(id="${photoConfig.after_h2}"[^>]*>[\\s\\S]*?</h[23]>)\\s*(<p>)`);
          const simpleMatch = html.match(simplePattern);
          if (simpleMatch) {
            // Insert figure between h2 and first paragraph
            html = html.replace(simpleMatch[0], simpleMatch[1] + figure + '\n' + simpleMatch[2]);
            photosInserted++;
          }
        }
      }

      stats.photosAdded += photosInserted;
      console.log(`  ${relPath}: ${photosInserted} photos added`);
    } else if (existingFigures >= 2) {
      console.log(`  ${relPath}: SKIPPED (already has ${existingFigures} figures)`);
    }

    fs.writeFileSync(filePath, html, 'utf-8');

  } catch (err) {
    stats.errors.push(`${relPath}: ${err.message}`);
    console.error(`ERROR ${relPath}: ${err.message}`);
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Dark mode fixed: ${stats.darkFixed}`);
console.log(`Photos added: ${stats.photosAdded}`);
if (stats.errors.length) console.log(`Errors: ${stats.errors.join(', ')}`);
