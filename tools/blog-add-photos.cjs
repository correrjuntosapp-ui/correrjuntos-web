#!/usr/bin/env node
/**
 * Add 3 inline <figure> photos to each of 18 blog articles.
 * Uses verified Pexels IDs from existing working articles.
 * Inserts after the first <p> following each target <h2 id="...">.
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function makeFigure(photoId, alt, caption) {
  return `\n<figure style="margin:32px 0;text-align:center">\n  <img src="https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=75" alt="${alt}" loading="lazy" style="max-width:100%;border-radius:12px">\n  <figcaption style="font-size:.85rem;color:#888;margin-top:8px">${caption}</figcaption>\n</figure>\n`;
}

// Insert a figure after the first </p> that follows an h2 with given id
function insertAfterH2(html, h2Id, figure) {
  // Find the h2 tag with this id
  const h2Regex = new RegExp(`(id="${h2Id}"[^>]*>)`, 'i');
  const h2Match = html.match(h2Regex);
  if (!h2Match) return { html, inserted: false };

  const h2Pos = html.indexOf(h2Match[0]);
  // Find the first </p> after this h2
  const afterH2 = html.substring(h2Pos);
  const firstPEnd = afterH2.indexOf('</p>');
  if (firstPEnd === -1) return { html, inserted: false };

  const insertPos = h2Pos + firstPEnd + 4; // after </p>
  html = html.substring(0, insertPos) + figure + html.substring(insertPos);
  return { html, inserted: true };
}

const ARTICLES = [
  // === ES ===
  {
    file: 'blog/duatlon-principiantes-guia.html',
    photos: [
      { h2: 'por-que-runners', id: '1415811', alt: 'Ciclistas entrenando en carretera', cap: 'El ciclismo complementa la carrera y reduce el riesgo de lesiones por sobreuso' },
      { h2: 'transiciones', id: '10257963', alt: 'Primer plano de manos atando los cordones de zapatillas de running', cap: 'Unas transiciones r\u00e1pidas pueden marcar la diferencia en tu resultado final' },
      { h2: 'nutricion-hidratacion', id: '4220141', alt: 'Bowl de avena con fruta - desayuno ideal para runners', cap: 'La nutrici\u00f3n adecuada es fundamental para rendir en las tres disciplinas' },
    ],
  },
  {
    file: 'blog/running-y-suelo-pelvico.html',
    photos: [
      { h2: 'sintomas-comunes', id: '8346652', alt: 'Corredora estirando las piernas despu\u00e9s de correr', cap: 'Los ejercicios espec\u00edficos fortalecen el suelo p\u00e9lvico y mejoran el rendimiento' },
      { h2: 'ejercicios-fortalecimiento', id: '4379234', alt: 'Atleta haciendo ejercicios de recuperaci\u00f3n tras entrenamiento', cap: 'Incorporar ejercicios de suelo p\u00e9lvico en tu rutina reduce los s\u00edntomas significativamente' },
      { h2: 'running-postparto', id: '20400836', alt: 'Runner corriendo por un camino arbolado en un parque', cap: 'Con las adaptaciones adecuadas, puedes volver a correr de forma segura tras el parto' },
    ],
  },
  {
    file: 'blog/cadencia-running-ideal.html',
    photos: [
      { h2: 'que-es-cadencia', id: '2495568', alt: 'Runner corriendo con buena postura por una carretera', cap: 'La cadencia es uno de los par\u00e1metros m\u00e1s importantes para mejorar tu eficiencia' },
      { h2: 'como-medir', id: '4793250', alt: 'Runner consultando datos en su reloj deportivo GPS', cap: 'Los relojes GPS modernos miden la cadencia en tiempo real' },
      { h2: 'como-mejorar', id: '5319579', alt: 'Grupo de runners corriendo juntos por la ciudad', cap: 'Entrenar con otros runners te ayuda a mantener una cadencia constante' },
    ],
  },
  {
    file: 'blog/correr-con-diabetes.html',
    photos: [
      { h2: 'ciencia-running-diabetes', id: '20400836', alt: 'Runner corriendo por un camino arbolado en un parque', cap: 'El running regular mejora significativamente el control gluc\u00e9mico' },
      { h2: 'durante-carrera', id: '4793250', alt: 'Runner consultando datos en su reloj deportivo GPS', cap: 'Monitorizar tus datos durante el entrenamiento es esencial con diabetes' },
      { h2: 'plan-entrenamiento', id: '3823063', alt: 'Grupo de runners entrenando juntos a ritmo suave', cap: 'Entrenar en grupo aporta seguridad extra para runners con diabetes' },
    ],
  },
  {
    file: 'blog/test-cooper-running.html',
    photos: [
      { h2: 'como-realizar-test', id: '2495568', alt: 'Runner corriendo con buena postura por una carretera', cap: 'El test de Cooper se realiza corriendo 12 minutos al m\u00e1ximo esfuerzo en superficie plana' },
      { h2: 'como-mejorar', id: '5319579', alt: 'Grupo de runners corriendo juntos por la ciudad', cap: 'Los entrenamientos por intervalos son la clave para mejorar tu resultado' },
      { h2: 'errores-comunes', id: '4379234', alt: 'Atleta haciendo ejercicios de recuperaci\u00f3n', cap: 'Un calentamiento adecuado es esencial para obtener resultados fiables' },
    ],
  },
  {
    file: 'blog/correr-con-70-anos.html',
    photos: [
      { h2: 'beneficios-correr-70', id: '3823063', alt: 'Grupo de runners entrenando juntos a ritmo suave', cap: 'Correr a cualquier edad aporta beneficios cardiovasculares y cognitivos' },
      { h2: 'como-empezar', id: '8346652', alt: 'Corredora estirando las piernas en un parque', cap: 'Empezar con caminata y progresar gradualmente es la clave del \u00e9xito' },
      { h2: 'fuerza-complementaria', id: '4379234', alt: 'Atleta haciendo ejercicios de recuperaci\u00f3n', cap: 'El trabajo de fuerza complementario previene lesiones y mejora la estabilidad' },
    ],
  },
  {
    file: 'blog/carreras-nocturnas-espana.html',
    photos: [
      { h2: 'por-que-correr-de-noche', id: '5319579', alt: 'Grupo de runners corriendo juntos por la ciudad', cap: 'Las carreras nocturnas ofrecen una experiencia \u00fanica y una atm\u00f3sfera especial' },
      { h2: 'equipamiento-esencial', id: '10257963', alt: 'Primer plano de manos atando cordones de zapatillas', cap: 'El equipamiento adecuado es crucial para correr de noche con seguridad' },
      { h2: 'preparacion-especifica', id: '4220141', alt: 'Bowl de avena con fruta - alimentaci\u00f3n para runners', cap: 'La alimentaci\u00f3n antes de una carrera nocturna requiere ajustes de horario' },
    ],
  },
  {
    file: 'blog/plan-entrenamiento-5k-sub-25.html',
    photos: [
      { h2: 'requisitos-previos', id: '2495568', alt: 'Runner corriendo con buena postura por una carretera', cap: 'Para bajar de 25 minutos en 5K necesitas una base s\u00f3lida de kilometraje' },
      { h2: 'tipos-sesiones', id: '4793250', alt: 'Runner consultando datos en su reloj deportivo GPS', cap: 'Controlar tus ritmos con un reloj GPS te ayuda a ejecutar las series con precisi\u00f3n' },
      { h2: 'nutricion', id: '4220141', alt: 'Bowl de avena con fruta - desayuno ideal para runners', cap: 'La alimentaci\u00f3n es el combustible que soporta tu entrenamiento' },
    ],
  },
  {
    file: 'blog/como-pasar-de-running-a-triatlon.html',
    photos: [
      { h2: 'por-que-triatlon', id: '1415811', alt: 'Ciclistas entrenando en carretera', cap: 'El triatl\u00f3n combina nataci\u00f3n, ciclismo y carrera: un reto completo para runners' },
      { h2: 'que-aprender', id: '4379234', alt: 'Atleta haciendo ejercicios de recuperaci\u00f3n', cap: 'La t\u00e9cnica de nataci\u00f3n es el mayor reto para runners que debutan en triatl\u00f3n' },
      { h2: 'nutricion-triatletas', id: '4220141', alt: 'Bowl de avena con fruta - alimentaci\u00f3n para deportistas', cap: 'La nutrici\u00f3n en triatl\u00f3n es m\u00e1s compleja por la duraci\u00f3n del esfuerzo' },
    ],
  },
  // === EN ===
  {
    file: 'blog/en/duathlon-beginners-guide.html',
    photos: [
      { h2: 'why-runners', id: '1415811', alt: 'Cyclists training on the road', cap: 'Cycling complements running and reduces the risk of overuse injuries' },
      { h2: 'transitions', id: '10257963', alt: 'Close-up of hands tying running shoe laces', cap: 'Fast transitions can make the difference in your final result' },
      { h2: 'nutrition-hydration', id: '4220141', alt: 'Oatmeal bowl with fruit - ideal runner breakfast', cap: 'Proper nutrition is essential to perform across all three disciplines' },
    ],
  },
  {
    file: 'blog/en/running-pelvic-floor-guide.html',
    photos: [
      { h2: 'common-symptoms', id: '8346652', alt: 'Runner stretching legs after a run', cap: 'Specific exercises strengthen the pelvic floor and improve performance' },
      { h2: 'strengthening-exercises', id: '4379234', alt: 'Athlete doing recovery exercises after training', cap: 'Incorporating pelvic floor exercises into your routine significantly reduces symptoms' },
      { h2: 'postpartum-running', id: '20400836', alt: 'Runner jogging through a tree-lined path in a park', cap: 'With the right adaptations, you can return to running safely postpartum' },
    ],
  },
  {
    file: 'blog/en/ideal-running-cadence.html',
    photos: [
      { h2: 'what-is-cadence', id: '2495568', alt: 'Runner with good form on a road', cap: 'Cadence is one of the most important parameters to improve your efficiency' },
      { h2: 'how-to-measure', id: '4793250', alt: 'Runner checking data on GPS sports watch', cap: 'Modern GPS watches measure cadence in real-time' },
      { h2: 'how-to-improve', id: '5319579', alt: 'Group of runners training together in the city', cap: 'Training with other runners helps you maintain a steady cadence' },
    ],
  },
  {
    file: 'blog/en/running-with-diabetes-guide.html',
    photos: [
      { h2: 'science-running-diabetes', id: '20400836', alt: 'Runner jogging through a park', cap: 'Regular running significantly improves glycemic control' },
      { h2: 'during-the-run', id: '4793250', alt: 'Runner checking data on GPS sports watch', cap: 'Monitoring your data during training is essential with diabetes' },
      { h2: 'training-plan', id: '3823063', alt: 'Group of runners training together at easy pace', cap: 'Group training provides extra safety for runners with diabetes' },
    ],
  },
  {
    file: 'blog/en/cooper-test-running-guide.html',
    photos: [
      { h2: 'how-to-perform', id: '2495568', alt: 'Runner with good form on a road', cap: 'The Cooper test is performed running 12 minutes at maximum effort on a flat surface' },
      { h2: 'how-to-improve', id: '5319579', alt: 'Group of runners training together in the city', cap: 'Interval training is the key to improving your test result' },
      { h2: 'common-mistakes', id: '4379234', alt: 'Athlete doing recovery exercises', cap: 'A proper warm-up is essential for reliable results' },
    ],
  },
  {
    file: 'blog/en/running-at-70-years-old.html',
    photos: [
      { h2: 'benefits-running-70', id: '3823063', alt: 'Group of runners training together at easy pace', cap: 'Running at any age provides cardiovascular and cognitive benefits' },
      { h2: 'how-to-start', id: '8346652', alt: 'Runner stretching legs in a park', cap: 'Starting with walking and progressing gradually is the key to success' },
      { h2: 'strength-training', id: '4379234', alt: 'Athlete doing recovery exercises', cap: 'Complementary strength work prevents injuries and improves stability' },
    ],
  },
  {
    file: 'blog/en/night-races-spain-2026.html',
    photos: [
      { h2: 'why-run-at-night', id: '5319579', alt: 'Group of runners training together in the city', cap: 'Night races offer a unique experience and special atmosphere' },
      { h2: 'essential-gear', id: '10257963', alt: 'Close-up of hands tying running shoe laces', cap: 'Proper equipment is crucial for running safely at night' },
      { h2: 'specific-preparation', id: '4220141', alt: 'Oatmeal bowl with fruit - runner nutrition', cap: 'Nutrition before a night race requires schedule adjustments' },
    ],
  },
  {
    file: 'blog/en/5k-sub-25-training-plan.html',
    photos: [
      { h2: 'prerequisites', id: '2495568', alt: 'Runner with good form on a road', cap: 'To break 25 minutes in a 5K you need a solid mileage base' },
      { h2: 'session-types', id: '4793250', alt: 'Runner checking data on GPS sports watch', cap: 'Tracking your pace with a GPS watch helps you execute intervals precisely' },
      { h2: 'nutrition', id: '4220141', alt: 'Oatmeal bowl with fruit - ideal runner breakfast', cap: 'Nutrition is the fuel that supports your high-performance training' },
    ],
  },
  {
    file: 'blog/en/transition-running-to-triathlon.html',
    photos: [
      { h2: 'why-triathlon', id: '1415811', alt: 'Cyclists training on the road', cap: 'Triathlon combines swimming, cycling and running: a complete challenge' },
      { h2: 'what-to-learn', id: '4379234', alt: 'Athlete doing recovery exercises', cap: 'Swimming technique is the biggest challenge for runners debuting in triathlon' },
      { h2: 'nutrition', id: '4220141', alt: 'Oatmeal bowl with fruit - sports nutrition', cap: 'Triathlon nutrition is more complex due to the effort duration' },
    ],
  },
];

let totalPhotos = 0;
let totalFiles = 0;

for (const article of ARTICLES) {
  const filePath = path.join(ROOT, article.file);
  let html = fs.readFileSync(filePath, 'utf-8');
  let inserted = 0;

  // First, remove any figures that were partially inserted by the previous script
  // (only remove figures that match our exact pattern and were just added)
  // Skip this - just add if not already present

  for (const photo of article.photos) {
    // Check if this photo is already in the file
    if (html.includes(`pexels-photo-${photo.id}.jpeg`) && html.includes(`<figure`)) {
      // Already has this photo as a figure, skip
      continue;
    }

    const figure = makeFigure(photo.id, photo.alt, photo.cap);
    const result = insertAfterH2(html, photo.h2, figure);
    html = result.html;
    if (result.inserted) inserted++;
  }

  fs.writeFileSync(filePath, html, 'utf-8');
  totalPhotos += inserted;
  totalFiles++;
  console.log(`${article.file}: ${inserted} new photos added`);
}

console.log(`\n=== TOTAL: ${totalPhotos} photos added across ${totalFiles} files ===`);
