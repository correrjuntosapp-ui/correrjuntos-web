/**
 * add-howto-schema.cjs
 * Adds HowTo structured data to the @graph array in 11 "Cómo..."/"How to..." articles.
 * Steps are curated from H2/H3 headings of each article.
 */
const fs = require('fs');
const path = require('path');

const BASE = __dirname;

const HOWTO_DATA = {
  'como-calentar-antes-de-correr': {
    name: 'Cómo Calentar Antes de Correr: Rutina Completa Paso a Paso',
    description: 'Rutina de calentamiento de 15 minutos para corredores: movilidad articular, trote suave, ejercicios dinámicos, activaciones y progresiones.',
    totalTime: 'PT15M',
    step: [
      { name: 'Movilidad articular (3 min)', text: 'Mueve tobillos, rodillas, caderas y hombros en su rango completo de movimiento. 10 círculos en cada dirección.' },
      { name: 'Trote suave (5 min)', text: 'Empieza con caminata rápida 1-2 minutos y sube gradualmente a trote muy suave para elevar pulsaciones sin esfuerzo.' },
      { name: 'Ejercicios dinámicos (5 min)', text: 'Realiza skipping, talones al glúteo, zancadas dinámicas, balanceos de pierna y cariocas durante 30 metros cada uno.' },
      { name: 'Activaciones musculares (2 min)', text: 'Haz sentadillas con peso corporal, elevaciones de talón y puente de glúteo para activar los músculos principales.' },
      { name: 'Progresiones de ritmo', text: 'Realiza 3-4 progresiones de 60-80 metros, empezando suave y terminando al ritmo de tu sesión principal.' },
      { name: 'Adapta según el tipo de entrenamiento', text: 'Ajusta la intensidad del calentamiento según si vas a hacer rodaje suave, series de velocidad o carrera larga.' }
    ]
  },
  'como-correr-mas-rapido': {
    name: 'Cómo Correr Más Rápido: 12 Claves para Mejorar tu Ritmo',
    description: 'Guía completa con 12 estrategias para correr más rápido: intervalos, fuerza, técnica, cadencia y planes de entrenamiento.',
    step: [
      { name: 'Corre lento para correr rápido', text: 'El 80% de tu entrenamiento debe ser a ritmo cómodo. La base aeróbica es el fundamento de la velocidad.' },
      { name: 'Construye tu base aeróbica', text: 'Incrementa el volumen semanal gradualmente (máximo 10% por semana) con rodajes en zona 2 de frecuencia cardíaca.' },
      { name: 'Incorpora entrenamientos de velocidad', text: 'Añade intervalos, fartlek y series de tempo 1-2 veces por semana para mejorar tu VO2max y umbral de lactato.' },
      { name: 'Trabaja fuerza y potencia', text: 'Incluye 2 sesiones semanales de fuerza: sentadillas, zancadas, peso muerto y pliometría para mejorar la economía de carrera.' },
      { name: 'Mejora tu técnica y cadencia', text: 'Apunta a 170-180 pasos por minuto, aterrizaje bajo el centro de gravedad y brazos a 90 grados.' },
      { name: 'Prioriza recuperación y consistencia', text: 'Duerme 7-9 horas, respeta los días de descanso y sé constante. La velocidad llega con la acumulación de semanas de entrenamiento.' }
    ]
  },
  'como-elegir-reloj-gps-running': {
    name: 'Cómo Elegir un Reloj GPS para Running: Guía Completa 2026',
    description: 'Guía de compra de relojes GPS para running: funciones esenciales, comparativa de marcas y recomendaciones por nivel.',
    step: [
      { name: 'Identifica las funciones esenciales', text: 'GPS preciso, frecuencia cardíaca en muñeca, distancia, ritmo, historial de actividades y batería mínima de 10 horas en modo GPS.' },
      { name: 'Valora las funciones avanzadas', text: 'Mapas, métricas de rendimiento (VO2max, potencia), música offline, pagos NFC y seguimiento de sueño. Útiles pero no imprescindibles.' },
      { name: 'Define tu presupuesto según nivel', text: 'Principiante: 150-250€. Intermedio: 250-400€. Avanzado: 400-700€. No necesitas el modelo más caro para entrenar bien.' },
      { name: 'Compara ecosistemas de marca', text: 'Garmin (más completo), COROS (mejor batería y precio), Polar (mejor ciencia deportiva), Apple Watch (mejor integración iOS).' },
      { name: 'Elige el modelo concreto', text: 'Compara los 2-3 modelos que encajen con tu presupuesto y nivel. Lee análisis independientes y compara especificaciones.' },
      { name: 'Verifica compatibilidad', text: 'Asegúrate de que es compatible con tu móvil, las apps que usas (Strava, TrainingPeaks) y que tiene las correas/sensores que necesitas.' }
    ]
  },
  'como-preparar-primera-carrera-5k': {
    name: 'Cómo Preparar tu Primera Carrera de 5K: Plan de Entrenamiento',
    description: 'Plan de 6 semanas para preparar tu primera carrera de 5K, con nutrición y consejos para el día de la carrera.',
    totalTime: 'P6W',
    step: [
      { name: 'Entiende el objetivo de una 5K', text: 'La 5K es la distancia perfecta para empezar: alcanzable para cualquier nivel pero suficiente para sentir logro. No necesitas experiencia previa.' },
      { name: 'Sigue un plan de 6 semanas', text: 'Alterna carrera y caminata las primeras semanas. Entrena 3-4 días por semana incrementando gradualmente el tiempo de carrera continua.' },
      { name: 'Cuida la nutrición', text: 'Come equilibrado con carbohidratos complejos, proteína y frutas. Hidratación constante. No experimentes con comidas nuevas antes de la carrera.' },
      { name: 'Prepara el día de la carrera', text: 'Recoge dorsal el día anterior, prepara ropa y zapatillas probadas, desayuna 2-3 horas antes y llega con tiempo para calentar.' },
      { name: 'Gestiona después de la meta', text: 'Camina 5-10 minutos para bajar pulsaciones, hidrátate, estira suavemente y celebra tu logro. Descansa 3-5 días antes de volver a entrenar.' }
    ]
  },
  'como-respirar-al-correr': {
    name: 'Cómo Respirar al Correr: Guía Completa de Técnica Respiratoria',
    description: 'Guía completa para respirar correctamente al correr: respiración diafragmática, patrones rítmicos, nariz vs boca y ejercicios prácticos.',
    step: [
      { name: 'Entiende por qué te quedas sin aire', text: 'La falta de aire suele venir de respirar con el pecho en vez del diafragma, ritmo demasiado rápido o mala postura al correr.' },
      { name: 'Practica la respiración diafragmática', text: 'Respira con el abdomen, no con el pecho. Tumbado, pon una mano en el pecho y otra en el vientre: solo debe moverse la del vientre.' },
      { name: 'Elige nariz o boca según intensidad', text: 'Ritmo suave: nariz. Ritmo moderado: inhala nariz, exhala boca. Alta intensidad: boca para maximizar el flujo de oxígeno.' },
      { name: 'Aplica patrones rítmicos', text: 'Usa patrón 3:2 (inhala 3 pasos, exhala 2) para ritmo suave. Cambia a 2:1 en series de velocidad.' },
      { name: 'Adapta según la intensidad', text: 'Rodaje fácil: respiración cómoda por nariz. Tempo: patrón 2:2. Intervalos: respiración profunda y rápida por boca.' },
      { name: 'Haz ejercicios de mejora respiratoria', text: 'Practica respiración diafragmática 5 min/día, sopla velas imaginarias, y haz respiración cuadrada (4-4-4-4) para control.' }
    ]
  },
  'how-to-warm-up-before-running': {
    name: 'How to Warm Up Before Running: Complete Step-by-Step Routine',
    description: 'Complete warm-up guide for runners: joint mobility, easy jogging, dynamic exercises, activations, and strides.',
    totalTime: 'PT15M',
    step: [
      { name: 'Joint mobility (3 min)', text: 'Move ankles, knees, hips and shoulders through their full range of motion. 10 circles in each direction.' },
      { name: 'Easy jogging (5 min)', text: 'Start with brisk walking for 1-2 minutes and gradually build to very easy jogging to raise heart rate without effort.' },
      { name: 'Dynamic exercises (5 min)', text: 'Perform high knees, butt kicks, walking lunges, leg swings and cariocas for 30 meters each.' },
      { name: 'Muscle activations (2 min)', text: 'Do bodyweight squats, calf raises and glute bridges to activate the main running muscles.' },
      { name: 'Strides', text: 'Run 3-4 strides of 60-80 meters, starting easy and finishing at your session pace.' },
      { name: 'Adapt to your workout type', text: 'Adjust warm-up intensity based on whether you are doing an easy run, speed session or long run.' }
    ]
  },
  'how-to-run-faster': {
    name: 'How to Run Faster: 12 Proven Keys to Improve Your Pace',
    description: 'Complete guide with 12 strategies to run faster: intervals, strength training, running form, cadence and training plans.',
    step: [
      { name: 'Run slow to run fast', text: '80% of your training should be at a comfortable pace. Your aerobic base is the foundation of speed.' },
      { name: 'Build your aerobic base', text: 'Gradually increase weekly volume (max 10% per week) with easy runs in heart rate zone 2.' },
      { name: 'Add speed workouts', text: 'Include intervals, fartlek and tempo runs 1-2 times per week to improve VO2max and lactate threshold.' },
      { name: 'Train strength and power', text: 'Include 2 weekly strength sessions: squats, lunges, deadlifts and plyometrics to improve running economy.' },
      { name: 'Improve form and cadence', text: 'Aim for 170-180 steps per minute, land under your center of gravity and keep arms at 90 degrees.' },
      { name: 'Prioritize recovery and consistency', text: 'Sleep 7-9 hours, respect rest days and be consistent. Speed comes from accumulated weeks of training.' }
    ]
  },
  'how-to-choose-gps-running-watch': {
    name: 'How to Choose a GPS Running Watch: Complete 2026 Guide',
    description: 'GPS running watch buying guide: essential features, brand comparison and recommendations by level.',
    step: [
      { name: 'Identify essential features', text: 'Accurate GPS, wrist heart rate, distance, pace, activity history and minimum 10-hour battery in GPS mode.' },
      { name: 'Evaluate advanced features', text: 'Maps, performance metrics (VO2max, power), offline music, NFC payments and sleep tracking. Useful but not essential.' },
      { name: 'Set your budget by level', text: 'Beginner: $150-250. Intermediate: $250-400. Advanced: $400-700. You don\'t need the most expensive model to train well.' },
      { name: 'Compare brand ecosystems', text: 'Garmin (most complete), COROS (best battery and value), Polar (best sports science), Apple Watch (best iOS integration).' },
      { name: 'Choose the specific model', text: 'Compare 2-3 models that fit your budget and level. Read independent reviews and compare specifications.' },
      { name: 'Check compatibility', text: 'Make sure it works with your phone, the apps you use (Strava, TrainingPeaks) and has the straps/sensors you need.' }
    ]
  },
  'how-to-prepare-first-5k-race': {
    name: 'How to Prepare for Your First 5K Race: Training Plan',
    description: '6-week plan to prepare for your first 5K race, with nutrition and race day tips.',
    totalTime: 'P6W',
    step: [
      { name: 'Understand the 5K goal', text: 'The 5K is the perfect starter distance: achievable for any level but enough to feel accomplished. No prior experience needed.' },
      { name: 'Follow a 6-week plan', text: 'Alternate running and walking in the first weeks. Train 3-4 days per week, gradually increasing continuous running time.' },
      { name: 'Manage your nutrition', text: 'Eat balanced meals with complex carbs, protein and fruits. Stay hydrated. Don\'t try new foods before race day.' },
      { name: 'Prepare for race day', text: 'Pick up your bib the day before, prepare tested clothes and shoes, eat breakfast 2-3 hours before and arrive early to warm up.' },
      { name: 'Handle post-race recovery', text: 'Walk 5-10 minutes to lower heart rate, hydrate, stretch gently and celebrate. Rest 3-5 days before training again.' }
    ]
  },
  'how-to-breathe-while-running': {
    name: 'How to Breathe While Running: Complete Breathing Technique Guide',
    description: 'Complete guide to breathing properly while running: diaphragmatic breathing, rhythmic patterns, nose vs mouth and practical exercises.',
    step: [
      { name: 'Understand why you get breathless', text: 'Breathlessness usually comes from chest breathing instead of diaphragmatic, running too fast, or poor posture.' },
      { name: 'Practice diaphragmatic breathing', text: 'Breathe with your belly, not your chest. Lying down, place one hand on chest and one on belly: only the belly hand should move.' },
      { name: 'Choose nose or mouth by intensity', text: 'Easy pace: nose. Moderate pace: inhale nose, exhale mouth. High intensity: mouth to maximize oxygen flow.' },
      { name: 'Apply rhythmic patterns', text: 'Use a 3:2 pattern (inhale 3 steps, exhale 2) for easy runs. Switch to 2:1 for speed intervals.' },
      { name: 'Adapt to training intensity', text: 'Easy run: comfortable nose breathing. Tempo: 2:2 pattern. Intervals: deep and fast mouth breathing.' },
      { name: 'Do breathing improvement exercises', text: 'Practice diaphragmatic breathing 5 min/day, blow out imaginary candles, and do box breathing (4-4-4-4) for control.' }
    ]
  },
  'how-to-start-running-beginners-guide': {
    name: 'How to Start Running from Scratch: Complete Beginner\'s Guide',
    description: 'Complete guide to start running from scratch with an 8-week plan, common mistakes and motivation tips.',
    totalTime: 'P8W',
    step: [
      { name: 'Understand the benefits of running', text: 'Running improves cardiovascular health, mental well-being, sleep quality and energy levels. It\'s the most accessible sport.' },
      { name: 'Get basic gear', text: 'Invest in proper running shoes fitted to your gait. Technical moisture-wicking clothing and a sports watch are helpful but not essential.' },
      { name: 'Learn basic running technique', text: 'Upright posture, slight forward lean, land under your center of gravity, arms at 90 degrees and relaxed shoulders.' },
      { name: 'Follow an 8-week beginner plan', text: 'Start with walk-run intervals (1 min run, 2 min walk). Gradually increase running intervals until you can run 30 minutes continuously.' },
      { name: 'Choose when and where to run', text: 'Morning or evening based on preference. Start on flat, soft surfaces like parks. Avoid extreme heat or cold as a beginner.' },
      { name: 'Avoid common beginner mistakes', text: 'Don\'t start too fast, don\'t skip rest days, don\'t increase distance too quickly, and don\'t compare yourself to others.' },
      { name: 'Fuel your running with basic nutrition', text: 'Eat balanced meals with carbs, protein and healthy fats. Hydrate well. Eat 2-3 hours before running, not right before.' },
      { name: 'Stay motivated long-term', text: 'Set small goals, track your progress, vary your routes, find a running partner or group, and celebrate every milestone.' }
    ]
  }
};

let added = 0;
let skipped = 0;

for (const [slug, data] of Object.entries(HOWTO_DATA)) {
  // Determine file path
  let filePath;
  if (slug.startsWith('how-to-')) {
    filePath = path.join(BASE, 'blog', 'en', slug + '.html');
  } else {
    filePath = path.join(BASE, 'blog', slug + '.html');
  }

  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP (not found): ${slug}`);
    skipped++;
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf-8');

  // Skip if already has HowTo
  if (html.includes('"HowTo"') || html.includes('"@type":"HowTo"')) {
    console.log(`  SKIP (already has HowTo): ${slug}`);
    skipped++;
    continue;
  }

  // Find and parse JSON-LD
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!ldMatch) {
    console.log(`  SKIP (no JSON-LD): ${slug}`);
    skipped++;
    continue;
  }

  try {
    const schema = JSON.parse(ldMatch[1]);

    // Build HowTo object
    const howto = {
      '@type': 'HowTo',
      'name': data.name,
      'description': data.description,
      'step': data.step.map((s, i) => ({
        '@type': 'HowToStep',
        'position': i + 1,
        'name': s.name,
        'text': s.text
      }))
    };
    if (data.totalTime) howto.totalTime = data.totalTime;

    // Add to @graph array
    if (schema['@graph']) {
      schema['@graph'].push(howto);
    } else {
      console.log(`  SKIP (no @graph): ${slug}`);
      skipped++;
      continue;
    }

    // Serialize back
    const newLd = JSON.stringify(schema);

    // Replace in HTML
    html = html.replace(ldMatch[0], '<script type="application/ld+json">' + newLd + '</script>');

    // Validate it parses
    JSON.parse(newLd);

    fs.writeFileSync(filePath, html, 'utf-8');
    added++;
    console.log(`  ADDED: ${slug} (${data.step.length} steps)`);

  } catch (e) {
    console.log(`  ERROR: ${slug} — ${e.message}`);
    skipped++;
  }
}

console.log('\n=== HowTo Schema Results ===');
console.log(`Added: ${added}`);
console.log(`Skipped: ${skipped}`);
