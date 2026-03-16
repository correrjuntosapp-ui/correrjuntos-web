// Build script to generate plans-data.json
// Run with: node tools/plans-generator/build-plans.cjs
const fs = require('fs');
const path = require('path');

const plans = [];

// ============================================================
// PLAN 1: 5K Principiantes
// ============================================================
plans.push({
  slug: "5k-principiantes",
  slugEn: "5k-beginners",
  category: "distancia",
  distance: "5K",
  level: "principiante",
  title: "Plan de Entrenamiento 5K para Principiantes",
  titleEn: "5K Training Plan for Beginners",
  subtitle: "De 0 a 5K en 8 semanas",
  subtitleEn: "From Couch to 5K in 8 Weeks",
  description: "Plan progresivo de 8 semanas para completar tu primera carrera de 5 kilómetros partiendo de cero.",
  descriptionEn: "Progressive 8-week plan to complete your first 5K race starting from scratch.",
  metaDescription: "Plan de entrenamiento 5K para principiantes. 8 semanas progresivas para correr tu primera carrera de 5 km.",
  metaDescriptionEn: "5K training plan for beginners. 8 progressive weeks to run your first 5K race.",
  keywords: "plan 5k principiantes, entrenamiento 5k, de 0 a 5k, empezar a correr 5km",
  keywordsEn: "5k training plan beginners, couch to 5k, beginner 5k plan, start running 5k",
  weeks: 8, sessionsPerWeek: 3, targetTime: null,
  heroImage: "2526878",
  overview: "Este plan está diseñado para personas que nunca han corrido o llevan mucho tiempo sin hacerlo. Combina caminata y carrera de forma progresiva para que tu cuerpo se adapte sin riesgo de lesión. Al final de las 8 semanas serás capaz de correr 5 km sin parar.",
  overviewEn: "This plan is designed for people who have never run or haven't run in a long time. It progressively combines walking and running so your body adapts without injury risk. By the end of 8 weeks you'll be able to run 5K non-stop.",
  weeklyPlan: [
    {week:1,focus:"Adaptación",focusEn:"Adaptation",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Carrera/Caminar",typeEn:"Run/Walk",detail:"Alterna 1 min corriendo / 2 min caminando × 10",detailEn:"Alternate 1 min running / 2 min walking × 10"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Carrera/Caminar",typeEn:"Run/Walk",detail:"Alterna 1 min corriendo / 2 min caminando × 10",detailEn:"Alternate 1 min running / 2 min walking × 10"},
      {day:"Viernes",dayEn:"Friday",type:"Carrera/Caminar",typeEn:"Run/Walk",detail:"Alterna 1 min corriendo / 1.5 min caminando × 10",detailEn:"Alternate 1 min running / 1.5 min walking × 10"}
    ]},
    {week:2,focus:"Progresión",focusEn:"Progression",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Carrera/Caminar",typeEn:"Run/Walk",detail:"Alterna 2 min corriendo / 2 min caminando × 8",detailEn:"Alternate 2 min running / 2 min walking × 8"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Carrera/Caminar",typeEn:"Run/Walk",detail:"Alterna 2 min corriendo / 1.5 min caminando × 8",detailEn:"Alternate 2 min running / 1.5 min walking × 8"},
      {day:"Viernes",dayEn:"Friday",type:"Carrera/Caminar",typeEn:"Run/Walk",detail:"Alterna 3 min corriendo / 2 min caminando × 6",detailEn:"Alternate 3 min running / 2 min walking × 6"}
    ]},
    {week:3,focus:"Consolidación",focusEn:"Consolidation",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Carrera/Caminar",typeEn:"Run/Walk",detail:"Alterna 3 min corriendo / 1 min caminando × 7",detailEn:"Alternate 3 min running / 1 min walking × 7"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Carrera/Caminar",typeEn:"Run/Walk",detail:"Alterna 4 min corriendo / 2 min caminando × 5",detailEn:"Alternate 4 min running / 2 min walking × 5"},
      {day:"Viernes",dayEn:"Friday",type:"Carrera/Caminar",typeEn:"Run/Walk",detail:"Alterna 5 min corriendo / 2 min caminando × 4",detailEn:"Alternate 5 min running / 2 min walking × 4"}
    ]},
    {week:4,focus:"Más carrera continua",focusEn:"More continuous running",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Carrera/Caminar",typeEn:"Run/Walk",detail:"Alterna 5 min corriendo / 1 min caminando × 4",detailEn:"Alternate 5 min running / 1 min walking × 4"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Carrera/Caminar",typeEn:"Run/Walk",detail:"Alterna 7 min corriendo / 2 min caminando × 3",detailEn:"Alternate 7 min running / 2 min walking × 3"},
      {day:"Viernes",dayEn:"Friday",type:"Carrera continua",typeEn:"Continuous run",detail:"8 min corriendo + 2 min caminando + 8 min corriendo",detailEn:"8 min running + 2 min walking + 8 min running"}
    ]},
    {week:5,focus:"Carrera continua",focusEn:"Continuous running",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Carrera continua",typeEn:"Continuous run",detail:"10 min corriendo + 1 min caminando + 10 min corriendo",detailEn:"10 min running + 1 min walking + 10 min running"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Carrera continua",typeEn:"Continuous run",detail:"12 min corriendo + 1 min caminando + 8 min corriendo",detailEn:"12 min running + 1 min walking + 8 min running"},
      {day:"Viernes",dayEn:"Friday",type:"Carrera continua",typeEn:"Continuous run",detail:"15 min de carrera continua a ritmo suave",detailEn:"15 min continuous run at easy pace"}
    ]},
    {week:6,focus:"Aumentar duración",focusEn:"Increase duration",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Carrera continua",typeEn:"Continuous run",detail:"18 min de carrera continua a ritmo suave",detailEn:"18 min continuous run at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Carrera continua",typeEn:"Continuous run",detail:"20 min de carrera continua",detailEn:"20 min continuous run"},
      {day:"Viernes",dayEn:"Friday",type:"Carrera continua",typeEn:"Continuous run",detail:"22 min de carrera continua a ritmo cómodo",detailEn:"22 min continuous run at comfortable pace"}
    ]},
    {week:7,focus:"Acercarse a 5K",focusEn:"Approaching 5K",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Carrera continua",typeEn:"Continuous run",detail:"25 min de carrera continua a ritmo suave",detailEn:"25 min continuous run at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Carrera continua",typeEn:"Continuous run",detail:"28 min de carrera continua",detailEn:"28 min continuous run"},
      {day:"Viernes",dayEn:"Friday",type:"Carrera continua",typeEn:"Continuous run",detail:"25 min de carrera continua + 4 aceleraciones de 30 seg",detailEn:"25 min continuous run + 4 × 30 sec strides"}
    ]},
    {week:8,focus:"Semana de carrera",focusEn:"Race week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Carrera suave",typeEn:"Easy run",detail:"20 min de carrera suave (descarga)",detailEn:"20 min easy run (taper)"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Carrera suave",typeEn:"Easy run",detail:"15 min suave + 3 aceleraciones de 20 seg",detailEn:"15 min easy + 3 × 20 sec strides"},
      {day:"Domingo",dayEn:"Sunday",type:"¡Carrera 5K!",typeEn:"5K Race Day!",detail:"¡Tu primera carrera de 5K! Disfruta y complétala",detailEn:"Your first 5K race! Enjoy and finish it"}
    ]}
  ],
  tips: [
    {text:"No te preocupes por la velocidad, solo por completar cada sesión",textEn:"Don't worry about speed, just focus on completing each session"},
    {text:"Invierte en unas buenas zapatillas de running",textEn:"Invest in a good pair of running shoes"},
    {text:"Hidrátate bien antes, durante y después de cada sesión",textEn:"Stay well hydrated before, during and after each session"},
    {text:"Calienta 5 minutos caminando rápido antes de cada sesión",textEn:"Warm up with 5 minutes of brisk walking before each session"},
    {text:"Si un día no puedes completar la sesión, repite esa semana",textEn:"If you can't complete a session, repeat that week"}
  ],
  faq: [
    {q:"¿Puedo hacer este plan si nunca he corrido?",a:"Sí, este plan está diseñado para empezar desde cero con intervalos de caminar/correr.",qEn:"Can I do this plan if I've never run before?",aEn:"Yes, this plan is designed to start from scratch with walk/run intervals."},
    {q:"¿Qué pasa si no puedo completar una sesión?",a:"Repite la semana anterior hasta que te sientas cómodo antes de avanzar.",qEn:"What if I can't complete a session?",aEn:"Repeat the previous week until you feel comfortable before moving on."},
    {q:"¿Necesito un reloj GPS?",a:"No es imprescindible, pero ayuda a controlar tiempos y distancias.",qEn:"Do I need a GPS watch?",aEn:"It's not essential, but it helps track times and distances."},
    {q:"¿Cuántas veces por semana debo entrenar?",a:"Este plan tiene 3 sesiones semanales con días de descanso entre medias.",qEn:"How many times a week should I train?",aEn:"This plan has 3 weekly sessions with rest days in between."},
    {q:"¿Puedo combinar este plan con gimnasio?",a:"Sí, los días de descanso puedes hacer fuerza suave o yoga.",qEn:"Can I combine this plan with gym workouts?",aEn:"Yes, on rest days you can do light strength training or yoga."}
  ],
  relatedArticles: [
    {slug:"empezar-a-correr-guia-principiantes",slugEn:"how-to-start-running-beginners-guide"},
    {slug:"como-elegir-zapatillas-running",slugEn:"best-running-shoes-beginners"},
    {slug:"como-preparar-primera-carrera-5k",slugEn:"how-to-prepare-first-5k-race"}
  ],
  nextPlan: "5k-sub-25",
  prevPlan: null
});

// ============================================================
// PLAN 2: 5K Sub 25
// ============================================================
plans.push({
  slug: "5k-sub-25",
  slugEn: "5k-under-25",
  category: "distancia",
  distance: "5K",
  level: "intermedio",
  title: "Plan 5K Sub 25 Minutos",
  titleEn: "5K Under 25 Minutes Plan",
  subtitle: "Baja de 25 minutos en 5K",
  subtitleEn: "Break the 25-Minute 5K Barrier",
  description: "Plan de 8 semanas con series y tempo para correr 5K por debajo de 25 minutos.",
  descriptionEn: "8-week plan with intervals and tempo runs to break 25 minutes in the 5K.",
  metaDescription: "Plan de entrenamiento 5K sub 25 minutos. Series, tempo y fartlek para mejorar tu marca en 8 semanas.",
  metaDescriptionEn: "5K training plan under 25 minutes. Intervals, tempo and fartlek to improve your time in 8 weeks.",
  keywords: "plan 5k sub 25, bajar de 25 minutos 5k, entrenamiento 5k intermedio, series 5k",
  keywordsEn: "5k under 25 plan, sub 25 5k training, intermediate 5k plan, 5k interval training",
  weeks: 8, sessionsPerWeek: 4, targetTime: "24:59",
  heroImage: "2803158",
  overview: "Este plan es para corredores que ya pueden completar 5K y quieren bajar de 25 minutos. Incorpora series, fartlek y carreras a ritmo tempo para mejorar tu velocidad y resistencia. Requiere una base mínima de 20 km semanales.",
  overviewEn: "This plan is for runners who can already complete a 5K and want to break 25 minutes. It incorporates intervals, fartlek and tempo runs to improve your speed and endurance. Requires a minimum base of 20 km per week.",
  weeklyPlan: [
    {week:1,focus:"Base y test",focusEn:"Base and test",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave (6:00-6:30/km)",detailEn:"30 min at easy pace (6:00-6:30/km)"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 6 × 400m a 4:45/km (rec 90 seg) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × 400m at 4:45/km (90 sec rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje medio",typeEn:"Moderate run",detail:"35 min a ritmo medio (5:30-5:45/km)",detailEn:"35 min at moderate pace (5:30-5:45/km)"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"}
    ]},
    {week:2,focus:"Velocidad básica",focusEn:"Basic speed",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 8 × (1 min rápido / 1 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 8 × (1 min fast / 1 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 15 min a ritmo tempo (5:00/km) + 10 min vuelta calma",detailEn:"10 min warm-up + 15 min at tempo pace (5:00/km) + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"}
    ]},
    {week:3,focus:"Subir volumen de series",focusEn:"Increase interval volume",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 5 × 800m a 4:40/km (rec 2 min) + 10 min vuelta calma",detailEn:"10 min warm-up + 5 × 800m at 4:40/km (2 min rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje medio",typeEn:"Moderate run",detail:"35 min a ritmo medio",detailEn:"35 min at moderate pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"50 min a ritmo suave con últimos 10 min a ritmo medio",detailEn:"50 min at easy pace with last 10 min at moderate pace"}
    ]},
    {week:4,focus:"Ritmo de carrera",focusEn:"Race pace",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave (recuperación)",detailEn:"30 min at easy pace (recovery)"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 4 × 1000m a 4:50/km (rec 2 min) + 10 min vuelta calma",detailEn:"10 min warm-up + 4 × 1000m at 4:50/km (2 min rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 20 min a ritmo tempo (5:00/km) + 10 min vuelta calma",detailEn:"10 min warm-up + 20 min at tempo pace (5:00/km) + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"55 min a ritmo suave",detailEn:"55 min at easy pace"}
    ]},
    {week:5,focus:"Bloque de calidad",focusEn:"Quality block",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 3 × 1200m a 4:45/km (rec 2 min) + 10 min vuelta calma",detailEn:"10 min warm-up + 3 × 1200m at 4:45/km (2 min rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 10 × (1 min rápido / 1 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 10 × (1 min fast / 1 min easy) + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"55 min a ritmo suave",detailEn:"55 min at easy pace"}
    ]},
    {week:6,focus:"Ritmo específico",focusEn:"Specific pace",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 6 × 800m a 4:35/km (rec 90 seg) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × 800m at 4:35/km (90 sec rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 25 min a ritmo tempo (4:55/km) + 10 min vuelta calma",detailEn:"10 min warm-up + 25 min at tempo pace (4:55/km) + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"60 min a ritmo suave",detailEn:"60 min at easy pace"}
    ]},
    {week:7,focus:"Puesta a punto",focusEn:"Sharpening",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 5 × 600m a 4:30/km (rec 90 seg) + 10 min vuelta calma",detailEn:"10 min warm-up + 5 × 600m at 4:30/km (90 sec rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje medio",typeEn:"Moderate run",detail:"30 min a ritmo medio con 4 aceleraciones de 30 seg",detailEn:"30 min at moderate pace with 4 × 30 sec strides"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"}
    ]},
    {week:8,focus:"Semana de carrera",focusEn:"Race week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 4 × 200m a ritmo de carrera (rec 1 min) + 10 min vuelta calma",detailEn:"15 min easy + 4 × 200m at race pace (1 min rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso activo",typeEn:"Active rest",detail:"20 min caminando o trote muy suave",detailEn:"20 min walking or very easy jog"},
      {day:"Domingo",dayEn:"Sunday",type:"¡Carrera 5K!",typeEn:"5K Race Day!",detail:"Objetivo: sub 25 min. Sal a 5:00/km y baja progresivamente",detailEn:"Goal: sub 25 min. Start at 5:00/km and negative split"}
    ]}
  ],
  tips: [
    {text:"Haz el 80% de tu volumen semanal a ritmo suave",textEn:"Run 80% of your weekly volume at easy pace"},
    {text:"Las series son la clave: respeta los descansos entre repeticiones",textEn:"Intervals are key: respect the rest periods between reps"},
    {text:"Incluye ejercicios de fuerza para piernas 2 veces por semana",textEn:"Include leg strength exercises twice a week"},
    {text:"Practica tu ritmo objetivo (5:00/km) en los entrenamientos de tempo",textEn:"Practice your goal pace (5:00/km) during tempo workouts"}
  ],
  faq: [
    {q:"¿Qué ritmo debo llevar en las series?",a:"Para sub 25, las series de 800m deben ir entre 4:30-4:45/km. Es más rápido que tu ritmo de carrera para generar adaptación.",qEn:"What pace should I run intervals at?",aEn:"For sub 25, 800m intervals should be at 4:30-4:45/km. This is faster than race pace to drive adaptation."},
    {q:"¿Puedo correr 4 días y hacer gimnasio?",a:"Sí, pero coloca el gimnasio en días de rodaje suave, no después de series.",qEn:"Can I run 4 days and do gym?",aEn:"Yes, but place gym sessions on easy run days, not after intervals."},
    {q:"¿Qué base necesito antes de este plan?",a:"Deberías poder correr 5K sin parar en unos 28-30 minutos cómodamente.",qEn:"What base do I need before this plan?",aEn:"You should be able to run a 5K non-stop in about 28-30 minutes comfortably."},
    {q:"¿Qué hago si fallo una sesión de series?",a:"No pasa nada, hazla al día siguiente o pasa a la siguiente semana manteniendo el rodaje.",qEn:"What if I miss an interval session?",aEn:"No worries, do it the next day or move to the next week keeping your easy runs."},
    {q:"¿Cuánto tiempo de descanso entre series?",a:"Entre 90 segundos y 2 minutos según indica el plan. No acortes los descansos.",qEn:"How much rest between intervals?",aEn:"Between 90 seconds and 2 minutes as indicated. Don't shorten the rest periods."}
  ],
  relatedArticles: [
    {slug:"como-correr-mas-rapido",slugEn:"how-to-run-faster"},
    {slug:"entrenamiento-series-fartlek",slugEn:"interval-fartlek-training"},
    {slug:"cuanto-tardo-en-correr-5km",slugEn:"average-5k-time-by-age"}
  ],
  nextPlan: null,
  prevPlan: "5k-principiantes"
});

// ============================================================
// PLAN 3: 10K Principiantes
// ============================================================
plans.push({
  slug: "10k-principiantes", slugEn: "10k-beginners",
  category: "distancia", distance: "10K", level: "principiante",
  title: "Plan de Entrenamiento 10K para Principiantes",
  titleEn: "10K Training Plan for Beginners",
  subtitle: "Tu primer 10K en 10 semanas",
  subtitleEn: "Your First 10K in 10 Weeks",
  description: "Plan de 10 semanas para completar tu primera carrera de 10 kilómetros con una base de 5K.",
  descriptionEn: "10-week plan to complete your first 10K race with a 5K base.",
  metaDescription: "Plan de entrenamiento 10K para principiantes. 10 semanas progresivas partiendo de una base de 5K.",
  metaDescriptionEn: "10K training plan for beginners. 10 progressive weeks starting from a 5K base.",
  keywords: "plan 10k principiantes, entrenamiento 10k, de 5k a 10k, primer 10k",
  keywordsEn: "10k training plan beginners, 5k to 10k plan, first 10k, beginner 10k training",
  weeks: 10, sessionsPerWeek: 3, targetTime: null,
  heroImage: "3764554",
  overview: "Has completado un 5K y ahora quieres dar el salto al 10K. Este plan incrementa gradualmente tu distancia y tiempo en pie. Al final podrás completar 10 km con confianza.",
  overviewEn: "You've completed a 5K and now want to step up to 10K. This plan gradually increases your distance and time on feet. By the end you'll complete 10K with confidence.",
  weeklyPlan: [
    {week:1,focus:"Base aeróbica",focusEn:"Aerobic base",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga",typeEn:"Long run",detail:"35 min a ritmo cómodo",detailEn:"35 min at comfortable pace"}
    ]},
    {week:2,focus:"Volumen progresivo",focusEn:"Progressive volume",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje medio",typeEn:"Moderate run",detail:"30 min a ritmo medio",detailEn:"30 min at moderate pace"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga",typeEn:"Long run",detail:"40 min a ritmo cómodo",detailEn:"40 min at comfortable pace"}
    ]},
    {week:3,focus:"Introducir fartlek",focusEn:"Introduce fartlek",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 6 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × (1 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga",typeEn:"Long run",detail:"45 min a ritmo cómodo",detailEn:"45 min at comfortable pace"}
    ]},
    {week:4,focus:"Consolidar distancia",focusEn:"Consolidate distance",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje medio",typeEn:"Moderate run",detail:"35 min a ritmo medio con últimos 5 min más alegres",detailEn:"35 min at moderate pace with last 5 min faster"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga",typeEn:"Long run",detail:"50 min a ritmo cómodo",detailEn:"50 min at comfortable pace"}
    ]},
    {week:5,focus:"Semana de descarga",focusEn:"Recovery week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga",typeEn:"Long run",detail:"40 min a ritmo muy cómodo",detailEn:"40 min at very comfortable pace"}
    ]},
    {week:6,focus:"Aumentar ritmo",focusEn:"Increase pace",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 8 × (1 min rápido / 1.5 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 8 × (1 min fast / 1.5 min easy) + 10 min cool-down"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga",typeEn:"Long run",detail:"55 min a ritmo cómodo",detailEn:"55 min at comfortable pace"}
    ]},
    {week:7,focus:"Resistencia específica",focusEn:"Specific endurance",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 15 min a ritmo tempo + 10 min vuelta calma",detailEn:"10 min warm-up + 15 min at tempo pace + 10 min cool-down"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga",typeEn:"Long run",detail:"60 min a ritmo cómodo (aprox. 9-10 km)",detailEn:"60 min at comfortable pace (approx. 9-10 km)"}
    ]},
    {week:8,focus:"Pico de volumen",focusEn:"Peak volume",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 5 × (2 min rápido / 1 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 5 × (2 min fast / 1 min easy) + 10 min cool-down"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga",typeEn:"Long run",detail:"65 min a ritmo cómodo (aprox. 10-11 km)",detailEn:"65 min at comfortable pace (approx. 10-11 km)"}
    ]},
    {week:9,focus:"Puesta a punto",focusEn:"Taper",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje medio",typeEn:"Moderate run",detail:"25 min con 4 aceleraciones de 30 seg",detailEn:"25 min with 4 × 30 sec strides"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga",typeEn:"Long run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"}
    ]},
    {week:10,focus:"Semana de carrera",focusEn:"Race week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"20 min de trote suave",detailEn:"20 min easy jog"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 3 × 200m a ritmo medio + 10 min vuelta calma",detailEn:"15 min easy + 3 × 200m at moderate pace + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"¡Carrera 10K!",typeEn:"10K Race Day!",detail:"¡Tu primer 10K! Sal conservador y disfruta",detailEn:"Your first 10K! Start conservative and enjoy"}
    ]}
  ],
  tips: [
    {text:"Aumenta la distancia semanal un máximo del 10%",textEn:"Increase weekly distance by a maximum of 10%"},
    {text:"La tirada larga es la sesión más importante: no la hagas rápido",textEn:"The long run is the most important session: don't run it fast"},
    {text:"Lleva agua si la tirada supera los 50 minutos",textEn:"Carry water if the long run exceeds 50 minutes"},
    {text:"Usa días de descanso para estiramientos o yoga",textEn:"Use rest days for stretching or yoga"}
  ],
  faq: [
    {q:"¿Puedo hacer este plan si ya corro 5K?",a:"Sí, es el requisito mínimo. Deberías correr 5K cómodamente.",qEn:"Can I do this plan if I can already run 5K?",aEn:"Yes, that's the minimum requirement. You should be able to run 5K comfortably."},
    {q:"¿Cuánto tardaré en mi primer 10K?",a:"Para principiantes, entre 55 y 70 minutos es normal.",qEn:"How long will my first 10K take?",aEn:"For beginners, between 55 and 70 minutes is normal."},
    {q:"¿Debo llevar geles energéticos?",a:"Para 10K no suele ser necesario, pero lleva agua en entrenamientos largos.",qEn:"Should I carry energy gels?",aEn:"For 10K it's usually not necessary, but carry water on long training runs."},
    {q:"¿Qué zapatillas necesito?",a:"Unas zapatillas de running con buena amortiguación para tu tipo de pisada.",qEn:"What shoes do I need?",aEn:"Running shoes with good cushioning for your foot strike type."},
    {q:"¿Puedo hacer cross-training los días libres?",a:"Sí, natación, bici o elíptica son excelentes complementos.",qEn:"Can I do cross-training on off days?",aEn:"Yes, swimming, cycling or elliptical are excellent supplements."}
  ],
  relatedArticles: [
    {slug:"como-aumentar-resistencia-corriendo",slugEn:"how-to-build-running-endurance"},
    {slug:"ritmo-para-principiantes-running",slugEn:"running-pace-for-beginners"},
    {slug:"hidratacion-running-guia-completa",slugEn:"running-hydration-complete-guide"}
  ],
  nextPlan: "10k-sub-50", prevPlan: null
});

// ============================================================
// PLAN 4: 10K Sub 50
// ============================================================
plans.push({
  slug: "10k-sub-50", slugEn: "10k-under-50",
  category: "distancia", distance: "10K", level: "intermedio",
  title: "Plan 10K Sub 50 Minutos", titleEn: "10K Under 50 Minutes Plan",
  subtitle: "Baja de 50 minutos en 10K", subtitleEn: "Break 50 Minutes in the 10K",
  description: "Plan de 10 semanas con trabajo de ritmo y series para correr 10K por debajo de 50 minutos.",
  descriptionEn: "10-week plan with pace work and intervals to run a 10K under 50 minutes.",
  metaDescription: "Plan de entrenamiento 10K sub 50 minutos. Series, tempo y fartlek en 10 semanas.",
  metaDescriptionEn: "10K training plan under 50 minutes. Intervals, tempo and fartlek over 10 weeks.",
  keywords: "plan 10k sub 50, bajar de 50 minutos 10k, entrenamiento 10k intermedio",
  keywordsEn: "10k under 50 plan, sub 50 10k training, intermediate 10k plan",
  weeks: 10, sessionsPerWeek: 4, targetTime: "49:59",
  heroImage: "3771071",
  overview: "Para corredores que completan 10K y quieren bajar de 50 minutos. Combina rodajes suaves, series, tempo y tiradas largas progresivas. Necesitas una base de al menos 25 km semanales.",
  overviewEn: "For runners who can complete a 10K and want to break 50 minutes. Combines easy runs, intervals, tempo and progressive long runs. Requires a base of at least 25 km per week.",
  weeklyPlan: [
    {week:1,focus:"Evaluación y base",focusEn:"Assessment and base",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave (5:45-6:00/km)",detailEn:"35 min at easy pace (5:45-6:00/km)"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 6 × 400m a 4:40/km (rec 90 seg) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × 400m at 4:40/km (90 sec rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje medio",typeEn:"Moderate run",detail:"35 min a ritmo medio (5:15-5:30/km)",detailEn:"35 min at moderate pace (5:15-5:30/km)"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"}
    ]},
    {week:2,focus:"Trabajo de velocidad",focusEn:"Speed work",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 10 × (1 min fuerte / 1 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 10 × (1 min hard / 1 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 20 min a 5:00/km + 10 min vuelta calma",detailEn:"10 min warm-up + 20 min at 5:00/km + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"55 min a ritmo suave",detailEn:"55 min at easy pace"}
    ]},
    {week:3,focus:"Series más largas",focusEn:"Longer intervals",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 5 × 800m a 4:30/km (rec 2 min) + 10 min vuelta calma",detailEn:"10 min warm-up + 5 × 800m at 4:30/km (2 min rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje medio",typeEn:"Moderate run",detail:"40 min a ritmo medio",detailEn:"40 min at moderate pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"60 min a ritmo suave con últimos 10 min a ritmo medio",detailEn:"60 min at easy pace with last 10 min at moderate pace"}
    ]},
    {week:4,focus:"Ritmo específico",focusEn:"Specific pace",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 4 × 1000m a 4:45/km (rec 2 min) + 10 min vuelta calma",detailEn:"10 min warm-up + 4 × 1000m at 4:45/km (2 min rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 25 min a 4:55/km + 10 min vuelta calma",detailEn:"10 min warm-up + 25 min at 4:55/km + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"65 min a ritmo suave",detailEn:"65 min at easy pace"}
    ]},
    {week:5,focus:"Semana de descarga",focusEn:"Recovery week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 6 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × (1 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"50 min a ritmo cómodo",detailEn:"50 min at comfortable pace"}
    ]},
    {week:6,focus:"Subir intensidad",focusEn:"Increase intensity",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 6 × 800m a 4:25/km (rec 90 seg) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × 800m at 4:25/km (90 sec rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 30 min a 4:55/km + 10 min vuelta calma",detailEn:"10 min warm-up + 30 min at 4:55/km + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"70 min a ritmo suave (aprox. 12 km)",detailEn:"70 min at easy pace (approx. 12 km)"}
    ]},
    {week:7,focus:"Simulación de carrera",focusEn:"Race simulation",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 3 × 1600m a 4:45/km (rec 2.5 min) + 10 min vuelta calma",detailEn:"10 min warm-up + 3 × 1600m at 4:45/km (2.5 min rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje medio",typeEn:"Moderate run",detail:"40 min a ritmo medio con últimos 10 min a ritmo tempo",detailEn:"40 min at moderate pace with last 10 min at tempo"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"75 min a ritmo suave",detailEn:"75 min at easy pace"}
    ]},
    {week:8,focus:"Pico de fitness",focusEn:"Peak fitness",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 5 × 1000m a 4:40/km (rec 2 min) + 10 min vuelta calma",detailEn:"10 min warm-up + 5 × 1000m at 4:40/km (2 min rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 12 × (1 min fuerte / 1 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 12 × (1 min hard / 1 min easy) + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"70 min a ritmo suave con últimos 15 min a ritmo medio",detailEn:"70 min easy with last 15 min at moderate pace"}
    ]},
    {week:9,focus:"Puesta a punto",focusEn:"Taper",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 4 × 400m a 4:30/km (rec 90 seg) + 10 min vuelta calma",detailEn:"10 min warm-up + 4 × 400m at 4:30/km (90 sec rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min con 3 aceleraciones",detailEn:"25 min with 3 strides"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"}
    ]},
    {week:10,focus:"Semana de carrera",focusEn:"Race week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 4 × 200m a ritmo de carrera + 10 min vuelta calma",detailEn:"15 min easy + 4 × 200m at race pace + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso activo",typeEn:"Active rest",detail:"20 min caminando",detailEn:"20 min walking"},
      {day:"Domingo",dayEn:"Sunday",type:"¡Carrera 10K!",typeEn:"10K Race Day!",detail:"Objetivo: sub 50. Sal a 5:00/km y mantén",detailEn:"Goal: sub 50. Start at 5:00/km and hold"}
    ]}
  ],
  tips: [
    {text:"El ritmo de 5:00/km será tu referencia: practica en los tempo",textEn:"5:00/km will be your reference pace: practice it in tempo runs"},
    {text:"Las series deben ser 15-20 seg/km más rápidas que tu ritmo de carrera",textEn:"Intervals should be 15-20 sec/km faster than race pace"},
    {text:"No descuides la hidratación en tiradas de más de 60 minutos",textEn:"Don't neglect hydration on runs over 60 minutes"}
  ],
  faq: [
    {q:"¿Qué base necesito para empezar?",a:"Deberías poder correr 10K en unos 55-60 minutos cómodamente.",qEn:"What base do I need to start?",aEn:"You should be able to run 10K in about 55-60 minutes comfortably."},
    {q:"¿Cómo sé si voy al ritmo correcto en las series?",a:"Usa un reloj GPS. Las series de 800m deben ser a 4:25-4:30/km.",qEn:"How do I know if I'm at the right interval pace?",aEn:"Use a GPS watch. 800m intervals should be at 4:25-4:30/km."},
    {q:"¿Puedo hacer 5 días si me sobra energía?",a:"Puedes añadir un día de cross-training, no más rodaje.",qEn:"Can I do 5 days if I have extra energy?",aEn:"You can add a cross-training day, not more running."},
    {q:"¿Cuándo debo hacer un test de forma?",a:"Haz un 5K test en la semana 5 (descarga) para evaluar.",qEn:"When should I do a fitness test?",aEn:"Do a 5K test in week 5 (recovery) to assess."},
    {q:"¿Necesito geles energéticos para 10K?",a:"No son necesarios si desayunas bien 2-3h antes.",qEn:"Do I need energy gels for 10K?",aEn:"Not necessary if you eat well 2-3h before."}
  ],
  relatedArticles: [
    {slug:"como-correr-mas-rapido",slugEn:"how-to-run-faster"},
    {slug:"entrenamiento-series-fartlek",slugEn:"interval-fartlek-training"},
    {slug:"nutricion-dia-de-carrera",slugEn:"race-day-nutrition"}
  ],
  nextPlan: "10k-sub-45", prevPlan: "10k-principiantes"
});

// ============================================================
// PLAN 5: 10K Sub 45
// ============================================================
plans.push({
  slug: "10k-sub-45", slugEn: "10k-under-45",
  category: "distancia", distance: "10K", level: "avanzado",
  title: "Plan 10K Sub 45 Minutos", titleEn: "10K Under 45 Minutes Plan",
  subtitle: "Baja de 45 minutos en 10K", subtitleEn: "Break 45 Minutes in the 10K",
  description: "Plan exigente de 10 semanas con 5 sesiones semanales para correr 10K por debajo de 45 minutos.",
  descriptionEn: "Demanding 10-week plan with 5 weekly sessions to run a 10K under 45 minutes.",
  metaDescription: "Plan 10K sub 45 minutos para corredores avanzados. 5 sesiones semanales con series, tempo y tirada larga.",
  metaDescriptionEn: "10K under 45 minutes plan for advanced runners. 5 weekly sessions with intervals, tempo and long runs.",
  keywords: "plan 10k sub 45, bajar de 45 minutos 10k, entrenamiento 10k avanzado",
  keywordsEn: "10k under 45 plan, sub 45 10k training, advanced 10k plan",
  weeks: 10, sessionsPerWeek: 5, targetTime: "44:59",
  heroImage: "2827392",
  overview: "Plan para corredores experimentados que buscan bajar de 45 minutos en 10K (ritmo de 4:30/km). Incluye dobles sesiones de calidad, series cortas y largas, y tiradas largas con cambios de ritmo. Requiere base de 35-40 km semanales.",
  overviewEn: "Plan for experienced runners aiming to break 45 minutes in the 10K (4:30/km pace). Includes double quality sessions, short and long intervals, and long runs with pace changes. Requires 35-40 km weekly base.",
  weeklyPlan: [
    {week:1,focus:"Base de calidad",focusEn:"Quality base",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave (5:30/km)",detailEn:"40 min at easy pace (5:30/km)"},
      {day:"Martes",dayEn:"Tuesday",type:"Series cortas",typeEn:"Short intervals",detail:"15 min calentamiento + 10 × 400m a 4:10/km (rec 60 seg) + 10 min vuelta calma",detailEn:"15 min warm-up + 10 × 400m at 4:10/km (60 sec rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"15 min calentamiento + 20 min a 4:35/km + 10 min vuelta calma",detailEn:"15 min warm-up + 20 min at 4:35/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"65 min a ritmo suave con últimos 15 min a 5:00/km",detailEn:"65 min easy with last 15 min at 5:00/km"}
    ]},
    {week:2,focus:"Series largas",focusEn:"Long intervals",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 5 × 1000m a 4:15/km (rec 2 min) + 10 min vuelta calma",detailEn:"15 min warm-up + 5 × 1000m at 4:15/km (2 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Fartlek",typeEn:"Fartlek",detail:"15 min calentamiento + 12 × (1 min fuerte / 1 min suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 12 × (1 min hard / 1 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"70 min progresivo: 50 min suave + 20 min a 5:00/km",detailEn:"70 min progressive: 50 min easy + 20 min at 5:00/km"}
    ]},
    {week:3,focus:"Umbral",focusEn:"Threshold",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 4 × 1200m a 4:15/km (rec 2.5 min) + 10 min vuelta calma",detailEn:"15 min warm-up + 4 × 1200m at 4:15/km (2.5 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"15 min calentamiento + 25 min a 4:30/km + 10 min vuelta calma",detailEn:"15 min warm-up + 25 min at 4:30/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"75 min a ritmo suave",detailEn:"75 min at easy pace"}
    ]},
    {week:4,focus:"Semana de descarga",focusEn:"Recovery week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Fartlek suave",typeEn:"Easy fartlek",detail:"15 min calentamiento + 6 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 6 × (1 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso activo",typeEn:"Active rest",detail:"30 min bici o natación suave",detailEn:"30 min easy cycling or swimming"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"55 min a ritmo cómodo",detailEn:"55 min at comfortable pace"}
    ]},
    {week:5,focus:"Bloque de calidad",focusEn:"Quality block",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 6 × 800m a 4:05/km (rec 90 seg) + 10 min vuelta calma",detailEn:"15 min warm-up + 6 × 800m at 4:05/km (90 sec rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo largo",typeEn:"Long tempo",detail:"15 min calentamiento + 30 min a 4:30/km + 10 min vuelta calma",detailEn:"15 min warm-up + 30 min at 4:30/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"80 min a ritmo suave",detailEn:"80 min at easy pace"}
    ]},
    {week:6,focus:"Ritmo de carrera",focusEn:"Race pace",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 3 × 2000m a 4:20/km (rec 3 min) + 10 min vuelta calma",detailEn:"15 min warm-up + 3 × 2000m at 4:20/km (3 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Fartlek",typeEn:"Fartlek",detail:"15 min calentamiento + 6 × (2 min fuerte / 1 min suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 6 × (2 min hard / 1 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"75 min progresivo: 55 min suave + 20 min a 4:45/km",detailEn:"75 min progressive: 55 min easy + 20 min at 4:45/km"}
    ]},
    {week:7,focus:"Sesión clave",focusEn:"Key session",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 4 × 1600m a 4:20/km (rec 2.5 min) + 10 min vuelta calma",detailEn:"15 min warm-up + 4 × 1600m at 4:20/km (2.5 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"15 min calentamiento + 35 min a 4:30/km + 10 min vuelta calma",detailEn:"15 min warm-up + 35 min at 4:30/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"80 min a ritmo suave",detailEn:"80 min at easy pace"}
    ]},
    {week:8,focus:"Descarga",focusEn:"Recovery",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Fartlek suave",typeEn:"Easy fartlek",detail:"15 min calentamiento + 8 × (45 seg rápido / 90 seg suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 8 × (45 sec fast / 90 sec easy) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje medio",typeEn:"Moderate run",detail:"30 min a ritmo medio",detailEn:"30 min at moderate pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"60 min a ritmo cómodo",detailEn:"60 min at comfortable pace"}
    ]},
    {week:9,focus:"Puesta a punto",focusEn:"Taper",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 5 × 600m a 4:10/km (rec 90 seg) + 10 min vuelta calma",detailEn:"10 min warm-up + 5 × 600m at 4:10/km (90 sec rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje medio",typeEn:"Moderate run",detail:"30 min con 4 aceleraciones de 30 seg",detailEn:"30 min with 4 × 30 sec strides"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"}
    ]},
    {week:10,focus:"Semana de carrera",focusEn:"Race week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 5 × 200m a ritmo de carrera + 10 min vuelta calma",detailEn:"15 min easy + 5 × 200m at race pace + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Trote suave",typeEn:"Easy jog",detail:"20 min de trote muy suave",detailEn:"20 min very easy jog"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso",typeEn:"Rest",detail:"Descanso total o caminata de 20 min",detailEn:"Full rest or 20 min walk"},
      {day:"Domingo",dayEn:"Sunday",type:"¡Carrera 10K!",typeEn:"10K Race Day!",detail:"Objetivo: sub 45. Sal a 4:30/km, mantén ritmo constante",detailEn:"Goal: sub 45. Start at 4:30/km, maintain steady pace"}
    ]}
  ],
  tips: [
    {text:"La consistencia en las sesiones de calidad es la clave semana a semana",textEn:"Consistency in quality sessions is key week after week"},
    {text:"Duerme 8 horas: la recuperación es donde se produce la adaptación",textEn:"Sleep 8 hours: recovery is where adaptation happens"},
    {text:"No hagas las series más rápido de lo indicado: respeta los ritmos",textEn:"Don't run intervals faster than prescribed: respect the paces"},
    {text:"Complementa con ejercicios pliométricos 1-2 veces por semana",textEn:"Supplement with plyometric exercises 1-2 times per week"}
  ],
  faq: [
    {q:"¿Qué nivel necesito para este plan?",a:"Deberías correr 10K en unos 48-50 minutos como referencia.",qEn:"What level do I need for this plan?",aEn:"You should be able to run 10K in about 48-50 minutes as reference."},
    {q:"¿Son necesarias 5 sesiones semanales?",a:"Sí, el volumen es clave para sub 45. Si no puedes, baja al plan sub 50.",qEn:"Are 5 weekly sessions necessary?",aEn:"Yes, volume is key for sub 45. If you can't manage, drop to the sub 50 plan."},
    {q:"¿Puedo sustituir una sesión por bici?",a:"Un rodaje suave sí, pero no las sesiones de calidad.",qEn:"Can I substitute a session with cycling?",aEn:"An easy run yes, but not quality sessions."},
    {q:"¿Qué ritmo en los rodajes suaves?",a:"Entre 5:15 y 5:45/km. Si vas más rápido no recuperas bien.",qEn:"What pace for easy runs?",aEn:"Between 5:15 and 5:45/km. Going faster means poor recovery."},
    {q:"¿Debo hacer estiramientos después?",a:"Al menos 10 min de estiramientos dinámicos después de cada sesión de calidad.",qEn:"Should I stretch after?",aEn:"At least 10 min dynamic stretching after every quality session."}
  ],
  relatedArticles: [
    {slug:"entrenamiento-series-fartlek",slugEn:"interval-fartlek-training"},
    {slug:"como-correr-mas-rapido",slugEn:"how-to-run-faster"},
    {slug:"entrenamiento-fuerza-corredores",slugEn:"leg-strength-exercises-runners"}
  ],
  nextPlan: null, prevPlan: "10k-sub-50"
});

// ============================================================
// PLAN 6: Media Maratón Principiantes
// ============================================================
plans.push({
  slug: "media-maraton-principiantes", slugEn: "half-marathon-beginners",
  category: "distancia", distance: "Media Maratón", level: "intermedio",
  title: "Plan Media Maratón para Principiantes", titleEn: "Half Marathon Training Plan for Beginners",
  subtitle: "Tu primer medio maratón en 12 semanas", subtitleEn: "Your First Half Marathon in 12 Weeks",
  description: "Plan de 12 semanas para completar tu primera media maratón con una base de 10K.",
  descriptionEn: "12-week plan to complete your first half marathon with a 10K base.",
  metaDescription: "Plan de entrenamiento media maratón para principiantes. 12 semanas progresivas desde una base de 10K.",
  metaDescriptionEn: "Half marathon training plan for beginners. 12 progressive weeks from a 10K base.",
  keywords: "plan media maratón principiantes, primer medio maratón, entrenamiento 21k",
  keywordsEn: "half marathon training plan beginners, first half marathon, 21k training",
  weeks: 12, sessionsPerWeek: 4, targetTime: null,
  heroImage: "7187803",
  overview: "Ya corres 10K y quieres dar el salto a la media maratón. Este plan de 12 semanas incrementa progresivamente tu tirada larga hasta los 18-20 km, añade sesiones de tempo y te prepara para completar los 21.1 km con confianza.",
  overviewEn: "You already run 10K and want to step up to the half marathon. This 12-week plan progressively increases your long run to 18-20 km, adds tempo sessions and prepares you to complete 21.1 km with confidence.",
  weeklyPlan: [
    {week:1,focus:"Base aeróbica",focusEn:"Aerobic base",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje medio",typeEn:"Moderate run",detail:"35 min a ritmo medio",detailEn:"35 min at moderate pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"55 min a ritmo cómodo (aprox. 9 km)",detailEn:"55 min at comfortable pace (approx. 9 km)"}
    ]},
    {week:2,focus:"Progresión de volumen",focusEn:"Volume progression",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 8 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 8 × (1 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"60 min a ritmo cómodo (aprox. 10 km)",detailEn:"60 min at comfortable pace (approx. 10 km)"}
    ]},
    {week:3,focus:"Introducir tempo",focusEn:"Introduce tempo",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 15 min a ritmo tempo + 10 min vuelta calma",detailEn:"10 min warm-up + 15 min at tempo pace + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"70 min a ritmo cómodo (aprox. 11-12 km)",detailEn:"70 min at comfortable pace (approx. 11-12 km)"}
    ]},
    {week:4,focus:"Semana de descarga",focusEn:"Recovery week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek suave",typeEn:"Easy fartlek",detail:"10 min calentamiento + 5 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 5 × (1 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"55 min a ritmo cómodo",detailEn:"55 min at comfortable pace"}
    ]},
    {week:5,focus:"Construir distancia",focusEn:"Build distance",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 20 min a ritmo tempo + 10 min vuelta calma",detailEn:"10 min warm-up + 20 min at tempo pace + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"80 min a ritmo cómodo (aprox. 13 km)",detailEn:"80 min at comfortable pace (approx. 13 km)"}
    ]},
    {week:6,focus:"Resistencia aeróbica",focusEn:"Aerobic endurance",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 10 × (1 min rápido / 1.5 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 10 × (1 min fast / 1.5 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"90 min a ritmo cómodo (aprox. 14-15 km)",detailEn:"90 min at comfortable pace (approx. 14-15 km)"}
    ]},
    {week:7,focus:"Pico de tirada larga",focusEn:"Long run peak",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 25 min a ritmo tempo + 10 min vuelta calma",detailEn:"10 min warm-up + 25 min at tempo pace + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"100 min a ritmo cómodo (aprox. 16-17 km)",detailEn:"100 min at comfortable pace (approx. 16-17 km)"}
    ]},
    {week:8,focus:"Semana de descarga",focusEn:"Recovery week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje medio",typeEn:"Moderate run",detail:"30 min a ritmo medio",detailEn:"30 min at moderate pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"70 min a ritmo cómodo",detailEn:"70 min at comfortable pace"}
    ]},
    {week:9,focus:"Tirada máxima",focusEn:"Maximum long run",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 20 min a ritmo tempo + 10 min vuelta calma",detailEn:"10 min warm-up + 20 min at tempo pace + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"110 min a ritmo cómodo (aprox. 18 km)",detailEn:"110 min at comfortable pace (approx. 18 km)"}
    ]},
    {week:10,focus:"Consolidación",focusEn:"Consolidation",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 8 × (2 min rápido / 1 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 8 × (2 min fast / 1 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"100 min a ritmo cómodo (aprox. 16 km)",detailEn:"100 min at comfortable pace (approx. 16 km)"}
    ]},
    {week:11,focus:"Puesta a punto",focusEn:"Taper",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje medio",typeEn:"Moderate run",detail:"30 min con 4 aceleraciones de 30 seg",detailEn:"30 min with 4 × 30 sec strides"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"70 min a ritmo suave",detailEn:"70 min at easy pace"}
    ]},
    {week:12,focus:"Semana de carrera",focusEn:"Race week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 4 × 200m a ritmo medio + 10 min vuelta calma",detailEn:"15 min easy + 4 × 200m at moderate pace + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso activo",typeEn:"Active rest",detail:"20 min caminando",detailEn:"20 min walking"},
      {day:"Domingo",dayEn:"Sunday",type:"¡Media Maratón!",typeEn:"Half Marathon Race Day!",detail:"¡Tu primera media maratón! Sal conservador",detailEn:"Your first half marathon! Start conservative"}
    ]}
  ],
  tips: [
    {text:"La tirada larga se hace a ritmo conversacional: debes poder hablar",textEn:"The long run is done at conversational pace: you should be able to talk"},
    {text:"Practica la nutrición de carrera en tiradas de más de 80 minutos",textEn:"Practice race nutrition on runs over 80 minutes"},
    {text:"No estrenes nada el día de la carrera: zapatillas, ropa o geles",textEn:"Don't use anything new on race day: shoes, clothes or gels"},
    {text:"Hidrátate con 500 ml de agua 2 horas antes de las tiradas largas",textEn:"Hydrate with 500 ml of water 2 hours before long runs"}
  ],
  faq: [
    {q:"¿Qué base necesito?",a:"Deberías poder correr 10K cómodamente, al menos 3-4 veces por semana.",qEn:"What base do I need?",aEn:"You should be able to run 10K comfortably, at least 3-4 times per week."},
    {q:"¿Necesito geles energéticos?",a:"Sí, para carreras de más de 90 minutos. Pruébalos en entrenamientos.",qEn:"Do I need energy gels?",aEn:"Yes, for races over 90 minutes. Test them in training."},
    {q:"¿Cuánto tardaré en mi primera media maratón?",a:"Para principiantes, entre 2:00 y 2:20 es un objetivo realista.",qEn:"How long will my first half marathon take?",aEn:"For beginners, between 2:00 and 2:20 is a realistic goal."},
    {q:"¿Debo correr los 21 km en los entrenamientos?",a:"No, la tirada más larga es de 18 km. El tapering y la adrenalina hacen el resto.",qEn:"Should I run the full 21 km in training?",aEn:"No, the longest run is 18 km. Tapering and adrenaline do the rest."},
    {q:"¿Puedo caminar durante la carrera?",a:"Sí, muchos principiantes usan estrategia de correr/caminar con éxito.",qEn:"Can I walk during the race?",aEn:"Yes, many beginners use a run/walk strategy successfully."}
  ],
  relatedArticles: [
    {slug:"como-aumentar-resistencia-corriendo",slugEn:"how-to-build-running-endurance"},
    {slug:"nutricion-dia-de-carrera",slugEn:"race-day-nutrition"},
    {slug:"mejores-geles-energeticos-running",slugEn:"best-energy-gels-running"}
  ],
  nextPlan: "media-maraton-sub-1-45", prevPlan: null
});

// ============================================================
// PLAN 7: Media Maratón Sub 1:45
// ============================================================
plans.push({
  slug: "media-maraton-sub-1-45", slugEn: "half-marathon-under-1-45",
  category: "distancia", distance: "Media Maratón", level: "avanzado",
  title: "Plan Media Maratón Sub 1:45", titleEn: "Half Marathon Under 1:45 Plan",
  subtitle: "Baja de 1 hora 45 en media maratón", subtitleEn: "Break 1:45 in the Half Marathon",
  description: "Plan de 12 semanas con 5 sesiones semanales para correr la media maratón por debajo de 1:45.",
  descriptionEn: "12-week plan with 5 weekly sessions to run the half marathon under 1:45.",
  metaDescription: "Plan media maratón sub 1:45. 12 semanas con series, tempo y tirada larga para avanzados.",
  metaDescriptionEn: "Half marathon under 1:45 plan. 12 weeks with intervals, tempo and long runs for advanced runners.",
  keywords: "plan media maratón sub 1:45, medio maratón avanzado, entrenamiento 21k rápido",
  keywordsEn: "half marathon under 1:45 plan, advanced half marathon, fast 21k training",
  weeks: 12, sessionsPerWeek: 5, targetTime: "1:44:59",
  heroImage: "3019696",
  overview: "Para corredores avanzados que buscan bajar de 1:45 en media maratón (ritmo 4:58/km). Combina series de 1000-2000m, tempo largos y tiradas de hasta 22 km con cambios de ritmo. Requiere base de 40-50 km semanales.",
  overviewEn: "For advanced runners aiming to break 1:45 in the half marathon (4:58/km pace). Combines 1000-2000m intervals, long tempo runs and long runs up to 22 km with pace changes. Requires 40-50 km weekly base.",
  weeklyPlan: [
    {week:1,focus:"Base de calidad",focusEn:"Quality base",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 6 × 800m a 4:30/km (rec 90 seg) + 10 min vuelta calma",detailEn:"15 min warm-up + 6 × 800m at 4:30/km (90 sec rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"15 min calentamiento + 20 min a 4:55/km + 10 min vuelta calma",detailEn:"15 min warm-up + 20 min at 4:55/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"70 min a ritmo suave",detailEn:"70 min at easy pace"}
    ]},
    {week:2,focus:"Volumen de series",focusEn:"Interval volume",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 5 × 1000m a 4:25/km (rec 2 min) + 10 min vuelta calma",detailEn:"15 min warm-up + 5 × 1000m at 4:25/km (2 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Fartlek",typeEn:"Fartlek",detail:"15 min calentamiento + 10 × (90 seg fuerte / 90 seg suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 10 × (90 sec hard / 90 sec easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"80 min a ritmo suave con últimos 15 min a 5:10/km",detailEn:"80 min easy with last 15 min at 5:10/km"}
    ]},
    {week:3,focus:"Umbral anaeróbico",focusEn:"Anaerobic threshold",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 4 × 1600m a 4:30/km (rec 2.5 min) + 10 min vuelta calma",detailEn:"15 min warm-up + 4 × 1600m at 4:30/km (2.5 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"15 min calentamiento + 25 min a 4:50/km + 10 min vuelta calma",detailEn:"15 min warm-up + 25 min at 4:50/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"90 min a ritmo suave (aprox. 15-16 km)",detailEn:"90 min at easy pace (approx. 15-16 km)"}
    ]},
    {week:4,focus:"Semana de descarga",focusEn:"Recovery week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Fartlek suave",typeEn:"Easy fartlek",detail:"15 min calentamiento + 6 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 6 × (1 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso activo",typeEn:"Active rest",detail:"30 min bici o natación",detailEn:"30 min cycling or swimming"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"65 min a ritmo cómodo",detailEn:"65 min at comfortable pace"}
    ]},
    {week:5,focus:"Bloque específico",focusEn:"Specific block",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 3 × 2000m a 4:35/km (rec 3 min) + 10 min vuelta calma",detailEn:"15 min warm-up + 3 × 2000m at 4:35/km (3 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"15 min calentamiento + 30 min a 4:55/km + 10 min vuelta calma",detailEn:"15 min warm-up + 30 min at 4:55/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"95 min a ritmo suave (aprox. 16-17 km)",detailEn:"95 min at easy pace (approx. 16-17 km)"}
    ]},
    {week:6,focus:"Resistencia a ritmo",focusEn:"Pace endurance",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 6 × 1000m a 4:25/km (rec 2 min) + 10 min vuelta calma",detailEn:"15 min warm-up + 6 × 1000m at 4:25/km (2 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Fartlek",typeEn:"Fartlek",detail:"15 min calentamiento + 6 × (3 min fuerte / 2 min suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 6 × (3 min hard / 2 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"100 min progresivo: 70 min suave + 30 min a 5:10/km",detailEn:"100 min progressive: 70 min easy + 30 min at 5:10/km"}
    ]},
    {week:7,focus:"Tirada máxima",focusEn:"Maximum long run",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 5 × 1200m a 4:30/km (rec 2 min) + 10 min vuelta calma",detailEn:"15 min warm-up + 5 × 1200m at 4:30/km (2 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"15 min calentamiento + 35 min a 4:55/km + 10 min vuelta calma",detailEn:"15 min warm-up + 35 min at 4:55/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"110 min a ritmo suave (aprox. 19-20 km)",detailEn:"110 min at easy pace (approx. 19-20 km)"}
    ]},
    {week:8,focus:"Descarga",focusEn:"Recovery",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Fartlek suave",typeEn:"Easy fartlek",detail:"15 min calentamiento + 6 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 6 × (1 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje medio",typeEn:"Moderate run",detail:"35 min a ritmo medio",detailEn:"35 min at moderate pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"75 min a ritmo cómodo",detailEn:"75 min at comfortable pace"}
    ]},
    {week:9,focus:"Sesión clave",focusEn:"Key session",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 4 × 2000m a 4:40/km (rec 2.5 min) + 10 min vuelta calma",detailEn:"15 min warm-up + 4 × 2000m at 4:40/km (2.5 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"15 min calentamiento + 35 min a 4:55/km + 10 min vuelta calma",detailEn:"15 min warm-up + 35 min at 4:55/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"105 min progresivo: 75 min suave + 30 min a 5:00/km",detailEn:"105 min progressive: 75 min easy + 30 min at 5:00/km"}
    ]},
    {week:10,focus:"Última tirada larga",focusEn:"Last long run",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 8 × 800m a 4:20/km (rec 90 seg) + 10 min vuelta calma",detailEn:"15 min warm-up + 8 × 800m at 4:20/km (90 sec rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje medio",typeEn:"Moderate run",detail:"40 min a ritmo medio",detailEn:"40 min at moderate pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"90 min a ritmo suave",detailEn:"90 min at easy pace"}
    ]},
    {week:11,focus:"Puesta a punto",focusEn:"Taper",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 4 × 600m a 4:20/km (rec 90 seg) + 10 min vuelta calma",detailEn:"10 min warm-up + 4 × 600m at 4:20/km (90 sec rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje medio",typeEn:"Moderate run",detail:"30 min con 4 aceleraciones de 30 seg",detailEn:"30 min with 4 × 30 sec strides"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"60 min a ritmo suave",detailEn:"60 min at easy pace"}
    ]},
    {week:12,focus:"Semana de carrera",focusEn:"Race week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 4 × 200m a ritmo de carrera + 10 min vuelta calma",detailEn:"15 min easy + 4 × 200m at race pace + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Trote suave",typeEn:"Easy jog",detail:"20 min de trote muy suave",detailEn:"20 min very easy jog"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso",typeEn:"Rest",detail:"Descanso total",detailEn:"Full rest"},
      {day:"Domingo",dayEn:"Sunday",type:"¡Media Maratón!",typeEn:"Half Marathon!",detail:"Objetivo: sub 1:45. Sal a 5:00/km y baja a 4:55 en la segunda mitad",detailEn:"Goal: sub 1:45. Start at 5:00/km and drop to 4:55 in second half"}
    ]}
  ],
  tips: [
    {text:"El ritmo de 4:58/km debe sentirse sostenible durante 20+ min en los tempo",textEn:"4:58/km pace should feel sustainable for 20+ min during tempo runs"},
    {text:"Toma un gel cada 45 minutos en tiradas de más de 90 minutos",textEn:"Take a gel every 45 minutes on runs over 90 minutes"},
    {text:"No subas el volumen de series y de tirada larga la misma semana",textEn:"Don't increase both interval volume and long run distance in the same week"}
  ],
  faq: [
    {q:"¿Qué nivel necesito?",a:"Deberías correr media maratón en unas 1:50-1:55 cómodamente.",qEn:"What level do I need?",aEn:"You should be able to run a half marathon in about 1:50-1:55 comfortably."},
    {q:"¿Cuántos km semanales haré?",a:"Entre 45 y 60 km en las semanas de máximo volumen.",qEn:"How many weekly km will I do?",aEn:"Between 45 and 60 km during peak volume weeks."},
    {q:"¿Debo hacer la tirada de 22 km?",a:"Sí, 1-2 tiradas de 20-22 km son esenciales para la media maratón rápida.",qEn:"Should I do the 22 km long run?",aEn:"Yes, 1-2 runs of 20-22 km are essential for a fast half marathon."},
    {q:"¿Necesito zapatillas de competición?",a:"Ayudan, pero no son imprescindibles. Unas con buena respuesta son suficientes.",qEn:"Do I need racing shoes?",aEn:"They help but aren't essential. Shoes with good responsiveness are enough."},
    {q:"¿Cómo gestiono la nutrición en carrera?",a:"1 gel a los 45 min y otro a los 90 min. Agua en cada avituallamiento.",qEn:"How do I manage race nutrition?",aEn:"1 gel at 45 min and another at 90 min. Water at every aid station."}
  ],
  relatedArticles: [
    {slug:"como-correr-mas-rapido",slugEn:"how-to-run-faster"},
    {slug:"mejores-geles-energeticos-running",slugEn:"best-energy-gels-running"},
    {slug:"nutricion-dia-de-carrera",slugEn:"race-day-nutrition"}
  ],
  nextPlan: "media-maraton-sub-1-30", prevPlan: "media-maraton-principiantes"
});

// ============================================================
// PLAN 8: Media Maratón Sub 1:30
// ============================================================
plans.push({
  slug: "media-maraton-sub-1-30", slugEn: "half-marathon-under-1-30",
  category: "distancia", distance: "Media Maratón", level: "elite",
  title: "Plan Media Maratón Sub 1:30", titleEn: "Half Marathon Under 1:30 Plan",
  subtitle: "Baja de 1 hora 30 en media maratón", subtitleEn: "Break 1:30 in the Half Marathon",
  description: "Plan élite de 14 semanas con 5 sesiones semanales para correr la media maratón sub 1:30.",
  descriptionEn: "Elite 14-week plan with 5 weekly sessions to run the half marathon under 1:30.",
  metaDescription: "Plan media maratón sub 1:30 para corredores élite. 14 semanas con series, tempo y tiradas largas avanzadas.",
  metaDescriptionEn: "Half marathon under 1:30 elite plan. 14 weeks with intervals, tempo and advanced long runs.",
  keywords: "plan media maratón sub 1:30, medio maratón élite, entrenamiento 21k avanzado",
  keywordsEn: "half marathon under 1:30 plan, elite half marathon training, advanced 21k plan",
  weeks: 14, sessionsPerWeek: 5, targetTime: "1:29:59",
  heroImage: "4498155",
  overview: "Plan para corredores de alto nivel que buscan bajar de 1:30 en media maratón (ritmo 4:16/km). Requiere una base sólida de 60+ km semanales y experiencia en competiciones. Incluye series largas a umbral, tempos agresivos y tiradas de hasta 24 km con cambios de ritmo.",
  overviewEn: "Plan for high-level runners aiming to break 1:30 in the half marathon (4:16/km pace). Requires a solid base of 60+ km per week and race experience. Includes long threshold intervals, aggressive tempos and long runs up to 24 km with pace changes.",
  weeklyPlan: [
    {week:1,focus:"Fase general",focusEn:"General phase",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"50 min a ritmo suave (5:10-5:30/km)",detailEn:"50 min at easy pace (5:10-5:30/km)"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 8 × 800m a 3:50/km (rec 90 seg) + 15 min vuelta calma",detailEn:"15 min warm-up + 8 × 800m at 3:50/km (90 sec rest) + 15 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"15 min calentamiento + 25 min a 4:15/km + 10 min vuelta calma",detailEn:"15 min warm-up + 25 min at 4:15/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"80 min a ritmo suave (aprox. 15 km)",detailEn:"80 min at easy pace (approx. 15 km)"}
    ]},
    {week:2,focus:"Subir volumen de calidad",focusEn:"Increase quality volume",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 6 × 1000m a 3:55/km (rec 2 min) + 15 min vuelta calma",detailEn:"15 min warm-up + 6 × 1000m at 3:55/km (2 min rest) + 15 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Fartlek",typeEn:"Fartlek",detail:"15 min calentamiento + 8 × (2 min fuerte / 1 min suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 8 × (2 min hard / 1 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"90 min progresivo: 65 min suave + 25 min a 4:30/km",detailEn:"90 min progressive: 65 min easy + 25 min at 4:30/km"}
    ]},
    {week:3,focus:"Umbral alto",focusEn:"High threshold",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 4 × 1600m a 3:55/km (rec 2.5 min) + 15 min vuelta calma",detailEn:"15 min warm-up + 4 × 1600m at 3:55/km (2.5 min rest) + 15 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"15 min calentamiento + 30 min a 4:15/km + 10 min vuelta calma",detailEn:"15 min warm-up + 30 min at 4:15/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"95 min a ritmo suave (aprox. 17-18 km)",detailEn:"95 min at easy pace (approx. 17-18 km)"}
    ]},
    {week:4,focus:"Descarga",focusEn:"Recovery",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Fartlek suave",typeEn:"Easy fartlek",detail:"15 min calentamiento + 6 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 6 × (1 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso activo",typeEn:"Active rest",detail:"30 min bici o natación",detailEn:"30 min cycling or swimming"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"70 min a ritmo cómodo",detailEn:"70 min at comfortable pace"}
    ]},
    {week:5,focus:"Fase específica",focusEn:"Specific phase",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 5 × 1200m a 3:50/km (rec 2 min) + 15 min vuelta calma",detailEn:"15 min warm-up + 5 × 1200m at 3:50/km (2 min rest) + 15 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"15 min calentamiento + 35 min a 4:15/km + 10 min vuelta calma",detailEn:"15 min warm-up + 35 min at 4:15/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"100 min progresivo: 70 min suave + 30 min a 4:25/km",detailEn:"100 min progressive: 70 min easy + 30 min at 4:25/km"}
    ]},
    {week:6,focus:"Series largas a ritmo",focusEn:"Long pace intervals",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 3 × 3000m a 4:05/km (rec 3 min) + 15 min vuelta calma",detailEn:"15 min warm-up + 3 × 3000m at 4:05/km (3 min rest) + 15 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Fartlek",typeEn:"Fartlek",detail:"15 min calentamiento + 6 × (3 min fuerte / 90 seg suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 6 × (3 min hard / 90 sec easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"105 min a ritmo suave (aprox. 19-20 km)",detailEn:"105 min at easy pace (approx. 19-20 km)"}
    ]},
    {week:7,focus:"Pico de volumen",focusEn:"Peak volume",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 5 × 1600m a 3:55/km (rec 2.5 min) + 15 min vuelta calma",detailEn:"15 min warm-up + 5 × 1600m at 3:55/km (2.5 min rest) + 15 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"15 min calentamiento + 40 min a 4:15/km + 10 min vuelta calma",detailEn:"15 min warm-up + 40 min at 4:15/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"115 min progresivo: 80 min suave + 35 min a 4:20/km (aprox. 22 km)",detailEn:"115 min progressive: 80 min easy + 35 min at 4:20/km (approx. 22 km)"}
    ]},
    {week:8,focus:"Descarga",focusEn:"Recovery",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Fartlek suave",typeEn:"Easy fartlek",detail:"15 min calentamiento + 8 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 8 × (1 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje medio",typeEn:"Moderate run",detail:"35 min a ritmo medio",detailEn:"35 min at moderate pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"75 min a ritmo cómodo",detailEn:"75 min at comfortable pace"}
    ]},
    {week:9,focus:"Simulación de carrera",focusEn:"Race simulation",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 4 × 2000m a 4:05/km (rec 3 min) + 15 min vuelta calma",detailEn:"15 min warm-up + 4 × 2000m at 4:05/km (3 min rest) + 15 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"15 min calentamiento + 40 min a 4:18/km + 10 min vuelta calma",detailEn:"15 min warm-up + 40 min at 4:18/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"110 min con 10 km finales a 4:25/km (aprox. 21 km)",detailEn:"110 min with last 10 km at 4:25/km (approx. 21 km)"}
    ]},
    {week:10,focus:"Última tirada fuerte",focusEn:"Last hard long run",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 10 × 800m a 3:45/km (rec 90 seg) + 15 min vuelta calma",detailEn:"15 min warm-up + 10 × 800m at 3:45/km (90 sec rest) + 15 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Fartlek",typeEn:"Fartlek",detail:"15 min calentamiento + 8 × (2 min fuerte / 1 min suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 8 × (2 min hard / 1 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"100 min a ritmo suave",detailEn:"100 min at easy pace"}
    ]},
    {week:11,focus:"Reducir volumen",focusEn:"Volume reduction",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 5 × 1000m a 3:55/km (rec 2 min) + 10 min vuelta calma",detailEn:"15 min warm-up + 5 × 1000m at 3:55/km (2 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"15 min calentamiento + 25 min a 4:18/km + 10 min vuelta calma",detailEn:"15 min warm-up + 25 min at 4:18/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"80 min a ritmo suave",detailEn:"80 min at easy pace"}
    ]},
    {week:12,focus:"Pre-taper",focusEn:"Pre-taper",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 6 × 600m a 3:45/km (rec 90 seg) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × 600m at 3:45/km (90 sec rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje medio",typeEn:"Moderate run",detail:"35 min a ritmo medio con 4 aceleraciones de 30 seg",detailEn:"35 min moderate with 4 × 30 sec strides"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"65 min a ritmo suave",detailEn:"65 min at easy pace"}
    ]},
    {week:13,focus:"Puesta a punto",focusEn:"Taper",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 4 × 400m a ritmo de carrera + 10 min vuelta calma",detailEn:"15 min easy + 4 × 400m at race pace + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso",typeEn:"Rest",detail:"Descanso total",detailEn:"Full rest"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"}
    ]},
    {week:14,focus:"Semana de carrera",focusEn:"Race week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 3 × 200m a ritmo de carrera + 10 min vuelta calma",detailEn:"15 min easy + 3 × 200m at race pace + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Trote suave",typeEn:"Easy jog",detail:"15 min de trote muy suave",detailEn:"15 min very easy jog"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso",typeEn:"Rest",detail:"Descanso total",detailEn:"Full rest"},
      {day:"Domingo",dayEn:"Sunday",type:"¡Media Maratón!",typeEn:"Half Marathon!",detail:"Objetivo: sub 1:30. Sal a 4:16/km y mantén. Negative split ideal",detailEn:"Goal: sub 1:30. Start at 4:16/km and hold. Negative split ideal"}
    ]}
  ],
  tips: [
    {text:"Corre los tempo a 4:15/km sin esfuerzo máximo: debes sentir que podrías aguantar 10 min más",textEn:"Run tempos at 4:15/km without maximum effort: you should feel you could hold 10 more min"},
    {text:"La nutrición es crítica: practica tu estrategia de geles en cada tirada de más de 90 min",textEn:"Nutrition is critical: practice your gel strategy on every run over 90 min"},
    {text:"Usa zapatillas de competición con placa de carbono para la carrera",textEn:"Use carbon plate racing shoes for race day"}
  ],
  faq: [
    {q:"¿Qué marca debo tener en 10K?",a:"Un 10K en unos 41-43 minutos indica que sub 1:30 en media es posible.",qEn:"What 10K time should I have?",aEn:"A 10K in about 41-43 minutes indicates sub 1:30 half is possible."},
    {q:"¿Cuántos km semanales haré?",a:"Entre 60 y 80 km en semanas de pico.",qEn:"How many weekly km will I do?",aEn:"Between 60 and 80 km during peak weeks."},
    {q:"¿Debo hacer dobles sesiones?",a:"No es necesario para media maratón. Mejor calidad que cantidad.",qEn:"Should I do double sessions?",aEn:"Not necessary for half marathon. Quality over quantity."},
    {q:"¿Cómo gestiono las tiradas progresivas?",a:"Empieza 30-40 seg/km más lento que ritmo objetivo y baja cada 3-4 km.",qEn:"How do I manage progressive long runs?",aEn:"Start 30-40 sec/km slower than goal pace and drop every 3-4 km."},
    {q:"¿Necesito un pulsómetro?",a:"Muy recomendable para controlar las zonas en los rodajes suaves.",qEn:"Do I need a heart rate monitor?",aEn:"Highly recommended to control zones during easy runs."}
  ],
  relatedArticles: [
    {slug:"como-correr-mas-rapido",slugEn:"how-to-run-faster"},
    {slug:"carga-hidratos-maraton",slugEn:"marathon-carb-loading"},
    {slug:"nutricion-dia-de-carrera",slugEn:"race-day-nutrition"}
  ],
  nextPlan: null, prevPlan: "media-maraton-sub-1-45"
});

// ============================================================
// PLAN 9: Maratón Principiantes
// ============================================================
plans.push({
  slug: "maraton-principiantes", slugEn: "marathon-beginners",
  category: "distancia", distance: "Maratón", level: "intermedio",
  title: "Plan de Entrenamiento Maratón para Principiantes", titleEn: "Marathon Training Plan for Beginners",
  subtitle: "Tu primer maratón en 16 semanas", subtitleEn: "Your First Marathon in 16 Weeks",
  description: "Plan de 16 semanas para completar tu primer maratón con una base de media maratón.",
  descriptionEn: "16-week plan to complete your first marathon with a half marathon base.",
  metaDescription: "Plan de entrenamiento maratón para principiantes. 16 semanas progresivas para tu primer 42K.",
  metaDescriptionEn: "Marathon training plan for beginners. 16 progressive weeks for your first 42K.",
  keywords: "plan maratón principiantes, primer maratón, entrenamiento 42k, plan 16 semanas maratón",
  keywordsEn: "marathon training plan beginners, first marathon, 42k training, 16 week marathon plan",
  weeks: 16, sessionsPerWeek: 4, targetTime: null,
  heroImage: "1571939",
  overview: "Has corrido una media maratón y ahora quieres dar el salto al maratón. Este plan de 16 semanas construye tu resistencia de forma segura, con tiradas largas de hasta 32 km, sesiones de tempo y descarga cada 4 semanas. El objetivo es completar los 42.195 km disfrutando.",
  overviewEn: "You've run a half marathon and now want to step up to the marathon. This 16-week plan safely builds your endurance with long runs up to 32 km, tempo sessions and recovery every 4 weeks. The goal is to complete 42.195 km and enjoy it.",
  weeklyPlan: (() => {
    const w = [];
    // Week 1-4: Base building
    w.push({week:1,focus:"Base aeróbica",focusEn:"Aerobic base",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje medio",typeEn:"Moderate run",detail:"40 min a ritmo medio",detailEn:"40 min at moderate pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"70 min a ritmo cómodo (aprox. 11-12 km)",detailEn:"70 min at comfortable pace (approx. 11-12 km)"}
    ]});
    w.push({week:2,focus:"Progresión de volumen",focusEn:"Volume progression",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 8 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 8 × (1 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"80 min a ritmo cómodo (aprox. 13 km)",detailEn:"80 min at comfortable pace (approx. 13 km)"}
    ]});
    w.push({week:3,focus:"Introducir tempo",focusEn:"Introduce tempo",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 20 min a ritmo tempo + 10 min vuelta calma",detailEn:"10 min warm-up + 20 min at tempo pace + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"90 min a ritmo cómodo (aprox. 14-15 km)",detailEn:"90 min at comfortable pace (approx. 14-15 km)"}
    ]});
    w.push({week:4,focus:"Semana de descarga",focusEn:"Recovery week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"65 min a ritmo cómodo",detailEn:"65 min at comfortable pace"}
    ]});
    // Week 5-8: Build endurance
    w.push({week:5,focus:"Construir resistencia",focusEn:"Build endurance",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 10 × (1 min rápido / 1.5 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 10 × (1 min fast / 1.5 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"100 min a ritmo cómodo (aprox. 16-17 km)",detailEn:"100 min at comfortable pace (approx. 16-17 km)"}
    ]});
    w.push({week:6,focus:"Tirada larga progresiva",focusEn:"Progressive long run",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 25 min a ritmo tempo + 10 min vuelta calma",detailEn:"10 min warm-up + 25 min at tempo pace + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"110 min a ritmo cómodo (aprox. 18-19 km)",detailEn:"110 min at comfortable pace (approx. 18-19 km)"}
    ]});
    w.push({week:7,focus:"Primera tirada 20+",focusEn:"First 20+ long run",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 6 × (2 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × (2 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"120 min a ritmo cómodo (aprox. 20-21 km)",detailEn:"120 min at comfortable pace (approx. 20-21 km)"}
    ]});
    w.push({week:8,focus:"Semana de descarga",focusEn:"Recovery week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje medio",typeEn:"Moderate run",detail:"30 min a ritmo medio",detailEn:"30 min at moderate pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"75 min a ritmo cómodo",detailEn:"75 min at comfortable pace"}
    ]});
    // Week 9-12: Peak phase
    w.push({week:9,focus:"Pico de distancia",focusEn:"Peak distance",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 25 min a ritmo tempo + 10 min vuelta calma",detailEn:"10 min warm-up + 25 min at tempo pace + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"130 min a ritmo cómodo (aprox. 22-23 km)",detailEn:"130 min at comfortable pace (approx. 22-23 km)"}
    ]});
    w.push({week:10,focus:"Consolidar distancia larga",focusEn:"Consolidate long distance",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 8 × (2 min rápido / 1.5 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 8 × (2 min fast / 1.5 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"140 min a ritmo cómodo (aprox. 24-25 km)",detailEn:"140 min at comfortable pace (approx. 24-25 km)"}
    ]});
    w.push({week:11,focus:"Tirada más larga",focusEn:"Longest run",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 30 min a ritmo tempo + 10 min vuelta calma",detailEn:"10 min warm-up + 30 min at tempo pace + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"160 min a ritmo cómodo (aprox. 28-30 km)",detailEn:"160 min at comfortable pace (approx. 28-30 km)"}
    ]});
    w.push({week:12,focus:"Semana de descarga",focusEn:"Recovery week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"80 min a ritmo cómodo",detailEn:"80 min at comfortable pace"}
    ]});
    // Week 13-16: Taper
    w.push({week:13,focus:"Segunda tirada larga máxima",focusEn:"Second maximum long run",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 6 × (2 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × (2 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"170 min a ritmo cómodo (aprox. 30-32 km)",detailEn:"170 min at comfortable pace (approx. 30-32 km)"}
    ]});
    w.push({week:14,focus:"Inicio del taper",focusEn:"Start taper",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 20 min a ritmo tempo + 10 min vuelta calma",detailEn:"10 min warm-up + 20 min at tempo pace + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"100 min a ritmo suave (aprox. 16 km)",detailEn:"100 min at easy pace (approx. 16 km)"}
    ]});
    w.push({week:15,focus:"Puesta a punto",focusEn:"Taper",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje medio",typeEn:"Moderate run",detail:"25 min con 4 aceleraciones de 30 seg",detailEn:"25 min with 4 × 30 sec strides"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"20 min a ritmo suave",detailEn:"20 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"60 min a ritmo suave",detailEn:"60 min at easy pace"}
    ]});
    w.push({week:16,focus:"Semana de carrera",focusEn:"Race week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"20 min a ritmo suave",detailEn:"20 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 3 × 200m a ritmo medio + 10 min vuelta calma",detailEn:"15 min easy + 3 × 200m at moderate pace + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso",typeEn:"Rest",detail:"Descanso total. Carga de hidratos",detailEn:"Full rest. Carb loading"},
      {day:"Domingo",dayEn:"Sunday",type:"¡Maratón!",typeEn:"Marathon Day!",detail:"¡Tu primer maratón! Sal conservador, disfruta cada kilómetro",detailEn:"Your first marathon! Start conservative, enjoy every kilometer"}
    ]});
    return w;
  })(),
  tips: [
    {text:"La regla del 10%: no aumentes el volumen semanal más del 10%",textEn:"The 10% rule: don't increase weekly volume by more than 10%"},
    {text:"Practica la nutrición en carrera: geles cada 30-45 minutos",textEn:"Practice race nutrition: gels every 30-45 minutes"},
    {text:"No estrenes nada el día de la carrera",textEn:"Don't use anything new on race day"},
    {text:"La tirada más larga es de 30-32 km, no el maratón completo",textEn:"The longest run is 30-32 km, not the full marathon"},
    {text:"El taper es sagrado: reduce volumen pero no intensidad",textEn:"Taper is sacred: reduce volume but not intensity"}
  ],
  faq: [
    {q:"¿Puedo hacer mi primer maratón sin haber corrido media?",a:"No es recomendable. La media maratón te da una referencia de resistencia necesaria.",qEn:"Can I run my first marathon without having done a half?",aEn:"Not recommended. A half marathon gives you a necessary endurance reference."},
    {q:"¿Cuántos geles necesito para el maratón?",a:"Entre 5 y 7 geles, uno cada 30-45 minutos aproximadamente.",qEn:"How many gels do I need for the marathon?",aEn:"Between 5 and 7 gels, one every 30-45 minutes approximately."},
    {q:"¿Qué tiempo puedo esperar?",a:"Para un primer maratón, entre 4:00 y 5:00 horas es normal.",qEn:"What time can I expect?",aEn:"For a first marathon, between 4:00 and 5:00 hours is normal."},
    {q:"¿Debo hacer carga de hidratos?",a:"Sí, los 2-3 días previos aumenta los carbohidratos en tu dieta.",qEn:"Should I carb load?",aEn:"Yes, increase carbohydrates in your diet 2-3 days before."},
    {q:"¿Qué hago si quiero parar durante el maratón?",a:"Es normal en el km 30-35. Camina, toma un gel, hidrátate y sigue.",qEn:"What if I want to stop during the marathon?",aEn:"It's normal at km 30-35. Walk, take a gel, hydrate and continue."}
  ],
  relatedArticles: [
    {slug:"carga-hidratos-maraton",slugEn:"marathon-carb-loading"},
    {slug:"mejores-geles-energeticos-running",slugEn:"best-energy-gels-running"},
    {slug:"nutricion-dia-de-carrera",slugEn:"race-day-nutrition"}
  ],
  nextPlan: "maraton-sub-4", prevPlan: null
});

// ============================================================
// PLAN 10: Maratón Sub 4
// ============================================================
plans.push({
  slug: "maraton-sub-4", slugEn: "marathon-under-4",
  category: "distancia", distance: "Maratón", level: "intermedio-avanzado",
  title: "Plan Maratón Sub 4 Horas", titleEn: "Marathon Under 4 Hours Plan",
  subtitle: "Baja de 4 horas en maratón", subtitleEn: "Break 4 Hours in the Marathon",
  description: "Plan de 16 semanas con 5 sesiones para correr el maratón por debajo de 4 horas.",
  descriptionEn: "16-week plan with 5 sessions to run the marathon under 4 hours.",
  metaDescription: "Plan maratón sub 4 horas. 16 semanas con series, tempo y tiradas largas para bajar de 4h.",
  metaDescriptionEn: "Marathon under 4 hours plan. 16 weeks with intervals, tempo and long runs to break 4h.",
  keywords: "plan maratón sub 4, bajar de 4 horas maratón, entrenamiento maratón intermedio",
  keywordsEn: "marathon under 4 plan, sub 4 hour marathon, intermediate marathon training",
  weeks: 16, sessionsPerWeek: 5, targetTime: "3:59:59",
  heroImage: "3776816",
  overview: "Para corredores que quieren bajar de 4 horas en maratón (ritmo 5:41/km). Requiere experiencia previa en maratón o media maratón sub 1:50. Combina series, tempo y tiradas largas de hasta 34 km con secciones a ritmo de carrera.",
  overviewEn: "For runners aiming to break 4 hours in the marathon (5:41/km pace). Requires prior marathon or sub 1:50 half marathon experience. Combines intervals, tempo and long runs up to 34 km with race pace sections.",
  weeklyPlan: (() => {
    const w = [];
    w.push({week:1,focus:"Base y evaluación",focusEn:"Base and assessment",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 6 × 800m a 5:10/km (rec 90 seg) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × 800m at 5:10/km (90 sec rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje medio",typeEn:"Moderate run",detail:"40 min a ritmo medio",detailEn:"40 min at moderate pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"75 min a ritmo suave",detailEn:"75 min at easy pace"}
    ]});
    w.push({week:2,focus:"Subir volumen",focusEn:"Increase volume",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 10 × (1 min rápido / 1 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 10 × (1 min fast / 1 min easy) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 20 min a 5:20/km + 10 min vuelta calma",detailEn:"10 min warm-up + 20 min at 5:20/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"85 min a ritmo suave (aprox. 14 km)",detailEn:"85 min at easy pace (approx. 14 km)"}
    ]});
    w.push({week:3,focus:"Resistencia aeróbica",focusEn:"Aerobic endurance",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 5 × 1000m a 5:05/km (rec 2 min) + 10 min vuelta calma",detailEn:"10 min warm-up + 5 × 1000m at 5:05/km (2 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje medio",typeEn:"Moderate run",detail:"45 min a ritmo medio",detailEn:"45 min at moderate pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"95 min a ritmo cómodo (aprox. 16 km)",detailEn:"95 min at comfortable pace (approx. 16 km)"}
    ]});
    w.push({week:4,focus:"Descarga",focusEn:"Recovery",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Fartlek suave",typeEn:"Easy fartlek",detail:"10 min calentamiento + 6 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × (1 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso activo",typeEn:"Active rest",detail:"30 min bici o natación",detailEn:"30 min cycling or swimming"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"70 min a ritmo cómodo",detailEn:"70 min at comfortable pace"}
    ]});
    w.push({week:5,focus:"Fase específica",focusEn:"Specific phase",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 4 × 1600m a 5:10/km (rec 2.5 min) + 10 min vuelta calma",detailEn:"10 min warm-up + 4 × 1600m at 5:10/km (2.5 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 30 min a 5:20/km + 10 min vuelta calma",detailEn:"10 min warm-up + 30 min at 5:20/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"105 min a ritmo cómodo (aprox. 18 km)",detailEn:"105 min at comfortable pace (approx. 18 km)"}
    ]});
    w.push({week:6,focus:"Tirada larga con ritmo",focusEn:"Long run with pace",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 8 × (2 min fuerte / 1 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 8 × (2 min hard / 1 min easy) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje medio",typeEn:"Moderate run",detail:"45 min a ritmo medio",detailEn:"45 min at moderate pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"115 min: 90 min suave + 25 min a 5:45/km (aprox. 20 km)",detailEn:"115 min: 90 min easy + 25 min at 5:45/km (approx. 20 km)"}
    ]});
    w.push({week:7,focus:"Primera tirada 22+",focusEn:"First 22+ long run",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 6 × 1000m a 5:05/km (rec 2 min) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × 1000m at 5:05/km (2 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 25 min a 5:20/km + 10 min vuelta calma",detailEn:"10 min warm-up + 25 min at 5:20/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"130 min a ritmo cómodo (aprox. 22-23 km)",detailEn:"130 min at comfortable pace (approx. 22-23 km)"}
    ]});
    w.push({week:8,focus:"Descarga",focusEn:"Recovery",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Fartlek suave",typeEn:"Easy fartlek",detail:"10 min calentamiento + 6 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × (1 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"80 min a ritmo cómodo",detailEn:"80 min at comfortable pace"}
    ]});
    w.push({week:9,focus:"Pico de volumen",focusEn:"Peak volume",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 3 × 2000m a 5:15/km (rec 3 min) + 10 min vuelta calma",detailEn:"10 min warm-up + 3 × 2000m at 5:15/km (3 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 35 min a 5:20/km + 10 min vuelta calma",detailEn:"10 min warm-up + 35 min at 5:20/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"145 min: 110 min suave + 35 min a 5:45/km (aprox. 26 km)",detailEn:"145 min: 110 min easy + 35 min at 5:45/km (approx. 26 km)"}
    ]});
    w.push({week:10,focus:"Tirada larga máxima",focusEn:"Maximum long run",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 6 × (3 min fuerte / 2 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × (3 min hard / 2 min easy) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje medio",typeEn:"Moderate run",detail:"40 min a ritmo medio",detailEn:"40 min at moderate pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"165 min a ritmo cómodo (aprox. 29-30 km)",detailEn:"165 min at comfortable pace (approx. 29-30 km)"}
    ]});
    w.push({week:11,focus:"Última tirada larga fuerte",focusEn:"Last hard long run",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 5 × 1000m a 5:10/km (rec 2 min) + 10 min vuelta calma",detailEn:"10 min warm-up + 5 × 1000m at 5:10/km (2 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 30 min a 5:25/km + 10 min vuelta calma",detailEn:"10 min warm-up + 30 min at 5:25/km + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"180 min: 140 min suave + 40 min a 5:41/km (aprox. 32-34 km)",detailEn:"180 min: 140 min easy + 40 min at 5:41/km (approx. 32-34 km)"}
    ]});
    w.push({week:12,focus:"Descarga",focusEn:"Recovery",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Fartlek suave",typeEn:"Easy fartlek",detail:"10 min calentamiento + 6 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × (1 min fast / 2 min easy) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"80 min a ritmo cómodo",detailEn:"80 min at comfortable pace"}
    ]});
    w.push({week:13,focus:"Última tirada larga",focusEn:"Last long run",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:"10 min calentamiento + 4 × 1000m a 5:15/km (rec 2 min) + 10 min vuelta calma",detailEn:"10 min warm-up + 4 × 1000m at 5:15/km (2 min rest) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje medio",typeEn:"Moderate run",detail:"35 min a ritmo medio",detailEn:"35 min at moderate pace"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"120 min a ritmo suave (aprox. 20 km)",detailEn:"120 min at easy pace (approx. 20 km)"}
    ]});
    w.push({week:14,focus:"Taper medio",focusEn:"Mid taper",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 6 × (1 min rápido / 1 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × (1 min fast / 1 min easy) + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso activo",typeEn:"Active rest",detail:"25 min caminando",detailEn:"25 min walking"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"80 min a ritmo suave",detailEn:"80 min at easy pace"}
    ]});
    w.push({week:15,focus:"Puesta a punto",focusEn:"Taper",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Martes",dayEn:"Tuesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 4 × 200m a ritmo de carrera + 10 min vuelta calma",detailEn:"15 min easy + 4 × 200m at race pace + 10 min cool-down"},
      {day:"Jueves",dayEn:"Thursday",type:"Rodaje suave",typeEn:"Easy run",detail:"20 min a ritmo suave",detailEn:"20 min at easy pace"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso",typeEn:"Rest",detail:"Descanso total",detailEn:"Full rest"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"}
    ]});
    w.push({week:16,focus:"Semana de carrera",focusEn:"Race week",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"20 min a ritmo suave",detailEn:"20 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 3 × 200m a ritmo de carrera + 10 min vuelta calma",detailEn:"15 min easy + 3 × 200m at race pace + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso",typeEn:"Rest",detail:"Descanso total. Carga de hidratos",detailEn:"Full rest. Carb loading"},
      {day:"Domingo",dayEn:"Sunday",type:"¡Maratón!",typeEn:"Marathon Day!",detail:"Objetivo: sub 4h. Sal a 5:45/km, mantén hasta el km 30, luego da todo",detailEn:"Goal: sub 4h. Start at 5:45/km, hold until km 30, then give it all"}
    ]});
    return w;
  })(),
  tips: [
    {text:"El ritmo de 5:41/km debe sentirse cómodo en los tempo de 30 min",textEn:"5:41/km pace should feel comfortable during 30 min tempos"},
    {text:"Haz las tiradas largas a 6:00-6:30/km, no a ritmo de carrera",textEn:"Do long runs at 6:00-6:30/km, not at race pace"},
    {text:"Practica el avituallamiento exacto que usarás en carrera",textEn:"Practice the exact fueling you'll use in the race"},
    {text:"Duerme 8+ horas en las últimas 2 semanas antes de la carrera",textEn:"Sleep 8+ hours in the last 2 weeks before the race"}
  ],
  faq: [
    {q:"¿Qué marca de media maratón necesito?",a:"Una media en unas 1:50 o menos indica que sub 4 en maratón es viable.",qEn:"What half marathon time do I need?",aEn:"A half in about 1:50 or less indicates sub 4 marathon is viable."},
    {q:"¿Son necesarias 5 sesiones?",a:"Sí, el volumen es importante para maratón. Si no puedes, baja a 4.",qEn:"Are 5 sessions necessary?",aEn:"Yes, volume is important for marathon. If you can't, drop to 4."},
    {q:"¿Cuántos km semanales haré?",a:"Entre 45 y 65 km en semanas de pico.",qEn:"How many weekly km?",aEn:"Between 45 and 65 km during peak weeks."},
    {q:"¿Debo hacer tiradas de más de 34 km?",a:"No, 32-34 km es suficiente. El taper completa la preparación.",qEn:"Should I do runs longer than 34 km?",aEn:"No, 32-34 km is enough. Taper completes the preparation."},
    {q:"¿Qué estrategia de avituallamiento uso?",a:"Un gel cada 30-40 min desde el km 5. Agua en cada avituallamiento.",qEn:"What fueling strategy should I use?",aEn:"A gel every 30-40 min from km 5. Water at every aid station."}
  ],
  relatedArticles: [
    {slug:"carga-hidratos-maraton",slugEn:"marathon-carb-loading"},
    {slug:"que-gel-energetico-usar-maraton",slugEn:"what-energy-gel-marathon"},
    {slug:"nutricion-dia-de-carrera",slugEn:"race-day-nutrition"}
  ],
  nextPlan: "maraton-sub-3-30", prevPlan: "maraton-principiantes"
});

// ============================================================
// PLAN 11: Maratón Sub 3:30
// ============================================================
plans.push({
  slug: "maraton-sub-3-30", slugEn: "marathon-under-3-30",
  category: "distancia", distance: "Maratón", level: "avanzado",
  title: "Plan Maratón Sub 3:30", titleEn: "Marathon Under 3:30 Plan",
  subtitle: "Baja de 3 horas 30 en maratón", subtitleEn: "Break 3:30 in the Marathon",
  description: "Plan avanzado de 18 semanas con 5 sesiones para correr el maratón sub 3:30.",
  descriptionEn: "Advanced 18-week plan with 5 sessions to run the marathon under 3:30.",
  metaDescription: "Plan maratón sub 3:30 para corredores avanzados. 18 semanas con series, tempo y tiradas largas.",
  metaDescriptionEn: "Marathon under 3:30 plan for advanced runners. 18 weeks with intervals, tempo and long runs.",
  keywords: "plan maratón sub 3:30, maratón avanzado, entrenamiento maratón rápido",
  keywordsEn: "marathon under 3:30, advanced marathon plan, fast marathon training",
  weeks: 18, sessionsPerWeek: 5, targetTime: "3:29:59",
  heroImage: "2402777",
  overview: "Para corredores experimentados que buscan bajar de 3:30 en maratón (ritmo 4:58/km). Requiere una base de 50-60 km semanales y un maratón previo sub 3:50 o media sub 1:40. Incluye sesiones de umbral, series largas y tiradas de hasta 35 km con tramos a ritmo de carrera.",
  overviewEn: "For experienced runners aiming to break 3:30 in the marathon (4:58/km pace). Requires a base of 50-60 km per week and a previous sub 3:50 marathon or sub 1:40 half. Includes threshold sessions, long intervals and runs up to 35 km with race pace sections.",
  weeklyPlan: (() => {
    const w = [];
    for (let i = 1; i <= 18; i++) {
      if (i <= 3) {
        // Weeks 1-3: General phase
        w.push({week:i,focus:["Base general","Subir volumen","Umbral"][i-1],focusEn:["General base","Increase volume","Threshold"][i-1],sessions:[
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:`${40+i*2} min a ritmo suave`,detailEn:`${40+i*2} min at easy pace`},
          {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:`15 min calentamiento + ${4+i} × ${i===3?1200:1000}m a ${i===3?"4:30":"4:40"}/km (rec 2 min) + 10 min vuelta calma`,detailEn:`15 min warm-up + ${4+i} × ${i===3?1200:1000}m at ${i===3?"4:30":"4:40"}/km (2 min rest) + 10 min cool-down`},
          {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:`15 min calentamiento + ${15+i*5} min a 4:50/km + 10 min vuelta calma`,detailEn:`15 min warm-up + ${15+i*5} min at 4:50/km + 10 min cool-down`},
          {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
          {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:`${70+i*10} min a ritmo suave`,detailEn:`${70+i*10} min at easy pace`}
        ]});
      } else if (i === 4 || i === 8 || i === 12 || i === 16) {
        // Recovery weeks
        w.push({week:i,focus:"Semana de descarga",focusEn:"Recovery week",sessions:[
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
          {day:"Martes",dayEn:"Tuesday",type:"Fartlek suave",typeEn:"Easy fartlek",detail:"15 min calentamiento + 6 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 6 × (1 min fast / 2 min easy) + 10 min cool-down"},
          {day:"Jueves",dayEn:"Thursday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
          {day:"Viernes",dayEn:"Friday",type:"Descanso activo",typeEn:"Active rest",detail:"30 min bici suave",detailEn:"30 min easy cycling"},
          {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"70 min a ritmo cómodo",detailEn:"70 min at comfortable pace"}
        ]});
      } else if (i >= 5 && i <= 7) {
        // Weeks 5-7: Specific
        const longMin = [105, 120, 130][i-5];
        const longKm = ["18-19", "20-22", "23-24"][i-5];
        w.push({week:i,focus:["Fase específica","Tirada con ritmo","Pico de tirada"][i-5],focusEn:["Specific phase","Paced long run","Long run peak"][i-5],sessions:[
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"},
          {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:`15 min calentamiento + ${i===7?4:5} × ${i===7?2000:1200}m a 4:35/km (rec ${i===7?3:2} min) + 10 min vuelta calma`,detailEn:`15 min warm-up + ${i===7?4:5} × ${i===7?2000:1200}m at 4:35/km (${i===7?3:2} min rest) + 10 min cool-down`},
          {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:`15 min calentamiento + ${25+i*2} min a 4:50/km + 10 min vuelta calma`,detailEn:`15 min warm-up + ${25+i*2} min at 4:50/km + 10 min cool-down`},
          {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
          {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:`${longMin} min progresivo con últimos 20 min a 5:10/km (aprox. ${longKm} km)`,detailEn:`${longMin} min progressive with last 20 min at 5:10/km (approx. ${longKm} km)`}
        ]});
      } else if (i >= 9 && i <= 11) {
        // Weeks 9-11: Peak
        const longMin = [140, 155, 170][i-9];
        const longKm = ["25-26", "28-30", "32-35"][i-9];
        w.push({week:i,focus:["Subir pico","Tirada máxima","Sesión clave"][i-9],focusEn:["Increase peak","Maximum long run","Key session"][i-9],sessions:[
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"},
          {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:`15 min calentamiento + ${i===11?3:5} × ${i===11?3000:1600}m a 4:40/km (rec ${i===11?3:2.5} min) + 10 min vuelta calma`,detailEn:`15 min warm-up + ${i===11?3:5} × ${i===11?3000:1600}m at 4:40/km (${i===11?3:2.5} min rest) + 10 min cool-down`},
          {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:`15 min calentamiento + ${35+(i-9)*5} min a 4:52/km + 10 min vuelta calma`,detailEn:`15 min warm-up + ${35+(i-9)*5} min at 4:52/km + 10 min cool-down`},
          {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
          {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:`${longMin} min con últimos 30 min a 5:00/km (aprox. ${longKm} km)`,detailEn:`${longMin} min with last 30 min at 5:00/km (approx. ${longKm} km)`}
        ]});
      } else if (i >= 13 && i <= 15) {
        // Weeks 13-15: Pre-taper
        const longMin = [120, 100, 80][i-13];
        w.push({week:i,focus:["Última tirada fuerte","Inicio taper","Reducción"][i-13],focusEn:["Last hard long run","Start taper","Volume reduction"][i-13],sessions:[
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:`${50-(i-13)*5} min a ritmo suave`,detailEn:`${50-(i-13)*5} min at easy pace`},
          {day:"Martes",dayEn:"Tuesday",type:i===15?"Activación":"Series",typeEn:i===15?"Activation":"Intervals",detail:i===15?"15 min suave + 5 × 400m a ritmo de carrera + 10 min vuelta calma":`15 min calentamiento + ${7-(i-13)*2} × 1000m a 4:40/km (rec 2 min) + 10 min vuelta calma`,detailEn:i===15?"15 min easy + 5 × 400m at race pace + 10 min cool-down":`15 min warm-up + ${7-(i-13)*2} × 1000m at 4:40/km (2 min rest) + 10 min cool-down`},
          {day:"Jueves",dayEn:"Thursday",type:"Rodaje medio",typeEn:"Moderate run",detail:`${35-(i-13)*5} min a ritmo medio`,detailEn:`${35-(i-13)*5} min at moderate pace`},
          {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:`${35-(i-13)*5} min a ritmo suave`,detailEn:`${35-(i-13)*5} min at easy pace`},
          {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:`${longMin} min a ritmo suave`,detailEn:`${longMin} min at easy pace`}
        ]});
      } else if (i === 17) {
        w.push({week:17,focus:"Puesta a punto",focusEn:"Taper",sessions:[
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
          {day:"Martes",dayEn:"Tuesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 4 × 200m a ritmo de carrera + 10 min vuelta calma",detailEn:"15 min easy + 4 × 200m at race pace + 10 min cool-down"},
          {day:"Jueves",dayEn:"Thursday",type:"Rodaje suave",typeEn:"Easy run",detail:"20 min a ritmo suave",detailEn:"20 min at easy pace"},
          {day:"Viernes",dayEn:"Friday",type:"Descanso",typeEn:"Rest",detail:"Descanso total",detailEn:"Full rest"},
          {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"}
        ]});
      } else if (i === 18) {
        w.push({week:18,focus:"Semana de carrera",focusEn:"Race week",sessions:[
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"20 min a ritmo suave",detailEn:"20 min at easy pace"},
          {day:"Miércoles",dayEn:"Wednesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 3 × 200m a ritmo de carrera + 10 min vuelta calma",detailEn:"15 min easy + 3 × 200m at race pace + 10 min cool-down"},
          {day:"Viernes",dayEn:"Friday",type:"Descanso",typeEn:"Rest",detail:"Descanso total. Carga de hidratos",detailEn:"Full rest. Carb loading"},
          {day:"Sábado",dayEn:"Saturday",type:"Trote suave",typeEn:"Easy jog",detail:"15 min trote muy suave + estiramientos",detailEn:"15 min very easy jog + stretching"},
          {day:"Domingo",dayEn:"Sunday",type:"¡Maratón!",typeEn:"Marathon Day!",detail:"Objetivo: sub 3:30. Sal a 5:00/km, negative split ideal",detailEn:"Goal: sub 3:30. Start at 5:00/km, negative split ideal"}
        ]});
      }
    }
    return w;
  })(),
  tips: [
    {text:"Las tiradas largas con tramos a ritmo de carrera son la sesión clave del plan",textEn:"Long runs with race pace sections are the key session of this plan"},
    {text:"Cuida la nutrición post-entreno: proteínas + carbohidratos en los 30 min posteriores",textEn:"Mind post-workout nutrition: protein + carbs within 30 min after"},
    {text:"No hagas las series demasiado rápido: el ritmo de maratón se entrena en los tempo",textEn:"Don't run intervals too fast: marathon pace is trained during tempos"},
    {text:"Considera usar zapatillas con placa de carbono para la carrera",textEn:"Consider using carbon plate shoes for race day"}
  ],
  faq: [
    {q:"¿Qué marca previa necesito?",a:"Un maratón sub 3:50 o media maratón sub 1:40.",qEn:"What previous time do I need?",aEn:"A sub 3:50 marathon or sub 1:40 half marathon."},
    {q:"¿Cuántos km semanales?",a:"Entre 55 y 75 km en semanas de pico.",qEn:"How many weekly km?",aEn:"Between 55 and 75 km during peak weeks."},
    {q:"¿Por qué 18 semanas y no 16?",a:"Las 2 semanas extra permiten una mejor adaptación y taper más progresivo.",qEn:"Why 18 weeks and not 16?",aEn:"The extra 2 weeks allow better adaptation and more progressive taper."},
    {q:"¿Cuántos geles para sub 3:30?",a:"Entre 4 y 6, cada 30-40 minutos desde el km 5.",qEn:"How many gels for sub 3:30?",aEn:"Between 4 and 6, every 30-40 minutes from km 5."},
    {q:"¿Debo usar liebre/pacer?",a:"Muy recomendable si la carrera lo ofrece. Te permite centrarte en correr.",qEn:"Should I use a pacer?",aEn:"Highly recommended if the race offers it. Lets you focus on running."}
  ],
  relatedArticles: [
    {slug:"carga-hidratos-maraton",slugEn:"marathon-carb-loading"},
    {slug:"nutricion-dia-de-carrera",slugEn:"race-day-nutrition"},
    {slug:"como-correr-mas-rapido",slugEn:"how-to-run-faster"}
  ],
  nextPlan: "maraton-sub-3", prevPlan: "maraton-sub-4"
});

// ============================================================
// PLAN 12: Maratón Sub 3
// ============================================================
plans.push({
  slug: "maraton-sub-3", slugEn: "marathon-under-3",
  category: "distancia", distance: "Maratón", level: "elite",
  title: "Plan Maratón Sub 3 Horas", titleEn: "Marathon Under 3 Hours Plan",
  subtitle: "El reto de bajar de 3 horas en maratón", subtitleEn: "The Sub-3 Hour Marathon Challenge",
  description: "Plan élite de 18 semanas con 6 sesiones semanales para correr el maratón sub 3 horas.",
  descriptionEn: "Elite 18-week plan with 6 weekly sessions to run the marathon under 3 hours.",
  metaDescription: "Plan maratón sub 3 horas para corredores élite. 18 semanas con 6 sesiones, series y tiradas largas.",
  metaDescriptionEn: "Marathon under 3 hours elite plan. 18 weeks with 6 sessions, intervals and long runs.",
  keywords: "plan maratón sub 3, maratón élite, entrenamiento maratón sub 3 horas",
  keywordsEn: "marathon under 3 plan, elite marathon training, sub 3 hour marathon",
  weeks: 18, sessionsPerWeek: 6, targetTime: "2:59:59",
  heroImage: "3757144",
  overview: "El plan más exigente de la colección. Para corredores con un maratón sub 3:15 o media sub 1:25. Ritmo objetivo 4:15/km. Incluye 6 sesiones semanales con doble sesión de calidad, tiradas de hasta 35 km con secciones a ritmo de carrera, y bloques de series a umbral. Volumen pico de 80-100 km semanales.",
  overviewEn: "The most demanding plan in the collection. For runners with a sub 3:15 marathon or sub 1:25 half. Target pace 4:15/km. Includes 6 weekly sessions with double quality sessions, long runs up to 35 km with race pace sections, and threshold interval blocks. Peak volume 80-100 km per week.",
  weeklyPlan: (() => {
    const w = [];
    for (let i = 1; i <= 18; i++) {
      if (i <= 3) {
        w.push({week:i,focus:["Base general","Volumen","Umbral"][i-1],focusEn:["General base","Volume","Threshold"][i-1],sessions:[
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:`${50+i*2} min a ritmo suave`,detailEn:`${50+i*2} min at easy pace`},
          {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:`15 min calentamiento + ${5+i} × 1000m a 3:55/km (rec 90 seg) + 15 min vuelta calma`,detailEn:`15 min warm-up + ${5+i} × 1000m at 3:55/km (90 sec rest) + 15 min cool-down`},
          {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
          {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:`15 min calentamiento + ${20+i*5} min a 4:10/km + 10 min vuelta calma`,detailEn:`15 min warm-up + ${20+i*5} min at 4:10/km + 10 min cool-down`},
          {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
          {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:`${75+i*10} min progresivo`,detailEn:`${75+i*10} min progressive`}
        ]});
      } else if (i === 4 || i === 8 || i === 12 || i === 16) {
        w.push({week:i,focus:"Descarga",focusEn:"Recovery",sessions:[
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
          {day:"Martes",dayEn:"Tuesday",type:"Fartlek suave",typeEn:"Easy fartlek",detail:"15 min calentamiento + 8 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"15 min warm-up + 8 × (1 min fast / 2 min easy) + 10 min cool-down"},
          {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
          {day:"Jueves",dayEn:"Thursday",type:"Rodaje medio",typeEn:"Moderate run",detail:"35 min a ritmo medio",detailEn:"35 min at moderate pace"},
          {day:"Viernes",dayEn:"Friday",type:"Descanso activo",typeEn:"Active rest",detail:"30 min bici o natación",detailEn:"30 min cycling or swimming"},
          {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"70 min a ritmo cómodo",detailEn:"70 min at comfortable pace"}
        ]});
      } else if (i >= 5 && i <= 7) {
        const longMin = [110, 125, 140][i-5];
        w.push({week:i,focus:["Fase específica","Series largas","Pico medio"][i-5],focusEn:["Specific phase","Long intervals","Mid peak"][i-5],sessions:[
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"55 min a ritmo suave",detailEn:"55 min at easy pace"},
          {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:`15 min calentamiento + ${i===7?4:5} × ${i===7?2000:1600}m a ${i===7?"4:00":"3:55"}/km (rec ${i===7?3:2.5} min) + 15 min vuelta calma`,detailEn:`15 min warm-up + ${i===7?4:5} × ${i===7?2000:1600}m at ${i===7?"4:00":"3:55"}/km (${i===7?3:2.5} min rest) + 15 min cool-down`},
          {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
          {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:`15 min calentamiento + ${35+(i-5)*5} min a 4:12/km + 10 min vuelta calma`,detailEn:`15 min warm-up + ${35+(i-5)*5} min at 4:12/km + 10 min cool-down`},
          {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"},
          {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:`${longMin} min con últimos 25 min a 4:20/km`,detailEn:`${longMin} min with last 25 min at 4:20/km`}
        ]});
      } else if (i >= 9 && i <= 11) {
        const longMin = [145, 160, 175][i-9];
        const longKm = ["26-27", "29-31", "33-35"][i-9];
        w.push({week:i,focus:["Pico de calidad","Tirada máxima","Sesión clave"][i-9],focusEn:["Quality peak","Maximum long run","Key session"][i-9],sessions:[
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"55 min a ritmo suave",detailEn:"55 min at easy pace"},
          {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:`15 min calentamiento + ${i===11?3:4} × ${i===11?3000:2000}m a 4:00/km (rec 3 min) + 15 min vuelta calma`,detailEn:`15 min warm-up + ${i===11?3:4} × ${i===11?3000:2000}m at 4:00/km (3 min rest) + 15 min cool-down`},
          {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje suave",typeEn:"Easy run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"},
          {day:"Jueves",dayEn:"Thursday",type:"Tempo",typeEn:"Tempo",detail:`15 min calentamiento + ${40+(i-9)*5} min a 4:12/km + 10 min vuelta calma`,detailEn:`15 min warm-up + ${40+(i-9)*5} min at 4:12/km + 10 min cool-down`},
          {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"45 min a ritmo suave",detailEn:"45 min at easy pace"},
          {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:`${longMin} min con últimos 35 min a 4:18/km (aprox. ${longKm} km)`,detailEn:`${longMin} min with last 35 min at 4:18/km (approx. ${longKm} km)`}
        ]});
      } else if (i >= 13 && i <= 15) {
        w.push({week:i,focus:["Pre-taper fuerte","Inicio taper","Reducción"][i-13],focusEn:["Strong pre-taper","Start taper","Reduction"][i-13],sessions:[
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:`${50-(i-13)*5} min a ritmo suave`,detailEn:`${50-(i-13)*5} min at easy pace`},
          {day:"Martes",dayEn:"Tuesday",type:"Series",typeEn:"Intervals",detail:`15 min calentamiento + ${8-(i-13)*2} × 800m a 3:50/km (rec 90 seg) + 10 min vuelta calma`,detailEn:`15 min warm-up + ${8-(i-13)*2} × 800m at 3:50/km (90 sec rest) + 10 min cool-down`},
          {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje suave",typeEn:"Easy run",detail:`${40-(i-13)*5} min a ritmo suave`,detailEn:`${40-(i-13)*5} min at easy pace`},
          {day:"Jueves",dayEn:"Thursday",type:i===15?"Rodaje medio":"Tempo",typeEn:i===15?"Moderate run":"Tempo",detail:i===15?"30 min a ritmo medio con 4 aceleraciones":`15 min calentamiento + ${30-(i-13)*5} min a 4:15/km + 10 min vuelta calma`,detailEn:i===15?"30 min moderate with 4 strides":`15 min warm-up + ${30-(i-13)*5} min at 4:15/km + 10 min cool-down`},
          {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:`${35-(i-13)*5} min a ritmo suave`,detailEn:`${35-(i-13)*5} min at easy pace`},
          {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:`${120-(i-13)*20} min a ritmo suave`,detailEn:`${120-(i-13)*20} min at easy pace`}
        ]});
      } else if (i === 17) {
        w.push({week:17,focus:"Puesta a punto",focusEn:"Final taper",sessions:[
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
          {day:"Martes",dayEn:"Tuesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 5 × 200m a ritmo de carrera + 10 min vuelta calma",detailEn:"15 min easy + 5 × 200m at race pace + 10 min cool-down"},
          {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
          {day:"Jueves",dayEn:"Thursday",type:"Descanso activo",typeEn:"Active rest",detail:"20 min caminando",detailEn:"20 min walking"},
          {day:"Viernes",dayEn:"Friday",type:"Descanso",typeEn:"Rest",detail:"Descanso total",detailEn:"Full rest"},
          {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"40 min a ritmo suave",detailEn:"40 min at easy pace"}
        ]});
      } else if (i === 18) {
        w.push({week:18,focus:"Semana de carrera",focusEn:"Race week",sessions:[
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"20 min a ritmo suave",detailEn:"20 min at easy pace"},
          {day:"Martes",dayEn:"Tuesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 3 × 200m a ritmo de carrera + 10 min vuelta calma",detailEn:"15 min easy + 3 × 200m at race pace + 10 min cool-down"},
          {day:"Miércoles",dayEn:"Wednesday",type:"Descanso",typeEn:"Rest",detail:"Descanso total",detailEn:"Full rest"},
          {day:"Jueves",dayEn:"Thursday",type:"Trote suave",typeEn:"Easy jog",detail:"15 min trote muy suave",detailEn:"15 min very easy jog"},
          {day:"Viernes",dayEn:"Friday",type:"Descanso",typeEn:"Rest",detail:"Descanso total. Carga de hidratos",detailEn:"Full rest. Carb loading"},
          {day:"Domingo",dayEn:"Sunday",type:"¡Maratón!",typeEn:"Marathon Day!",detail:"Objetivo: sub 3:00. Sal a 4:15/km, negative split. ¡A por ello!",detailEn:"Goal: sub 3:00. Start at 4:15/km, negative split. Go for it!"}
        ]});
      }
    }
    return w;
  })(),
  tips: [
    {text:"El descanso es parte del entrenamiento: respeta las semanas de descarga",textEn:"Rest is part of training: respect recovery weeks"},
    {text:"Las tiradas con tramos a 4:18/km simulan las condiciones de carrera",textEn:"Long runs with sections at 4:18/km simulate race conditions"},
    {text:"Nutrición: prueba diferentes marcas de gel hasta encontrar la ideal",textEn:"Nutrition: try different gel brands until you find the ideal one"},
    {text:"Mentaliza el maratón en 3 bloques: km 1-15 (cómodo), 15-30 (ritmo), 30-42 (resistir)",textEn:"Mentally divide the marathon into 3 blocks: km 1-15 (comfortable), 15-30 (pace), 30-42 (endure)"}
  ],
  faq: [
    {q:"¿Qué marcas previas necesito?",a:"Maratón sub 3:15 o media maratón sub 1:25 como mínimo.",qEn:"What previous times do I need?",aEn:"Sub 3:15 marathon or sub 1:25 half marathon minimum."},
    {q:"¿Cuántos km semanales?",a:"Entre 80 y 100 km en semanas de pico.",qEn:"How many weekly km?",aEn:"Between 80 and 100 km during peak weeks."},
    {q:"¿Necesito zapatillas con placa de carbono?",a:"Sí, para sub 3 cada segundo cuenta. Las carbon plate ahorran entre 1 y 4%.",qEn:"Do I need carbon plate shoes?",aEn:"Yes, for sub 3 every second counts. Carbon plates save 1-4%."},
    {q:"¿Cómo gestiono el muro del km 30?",a:"Nutrición correcta, ritmo controlado y entrenamiento de tiradas largas con ritmo.",qEn:"How do I manage the wall at km 30?",aEn:"Proper nutrition, controlled pace and long run training with pace work."},
    {q:"¿Debo hacer 6 días o puedo hacer 5?",a:"6 días es ideal, pero si reduces, elimina uno de los rodajes suaves.",qEn:"Should I do 6 days or can I do 5?",aEn:"6 days is ideal, but if you reduce, drop one of the easy runs."}
  ],
  relatedArticles: [
    {slug:"carga-hidratos-maraton",slugEn:"marathon-carb-loading"},
    {slug:"como-correr-mas-rapido",slugEn:"how-to-run-faster"},
    {slug:"entrenamiento-series-fartlek",slugEn:"interval-fartlek-training"}
  ],
  nextPlan: null, prevPlan: "maraton-sub-3-30"
});

// ============================================================
// PLAN 13: Perder Peso
// ============================================================
plans.push({
  slug: "perder-peso", slugEn: "lose-weight",
  category: "objetivo", distance: null, level: "principiante-intermedio",
  title: "Plan Running para Perder Peso", titleEn: "Running Plan for Weight Loss",
  subtitle: "Quema grasa corriendo en 12 semanas", subtitleEn: "Burn Fat Running in 12 Weeks",
  description: "Plan de 12 semanas que combina correr en zona 2, HIIT y fuerza para perder peso de forma saludable.",
  descriptionEn: "12-week plan combining zone 2 running, HIIT and strength to lose weight healthily.",
  metaDescription: "Plan de running para perder peso. 12 semanas combinando zona 2, HIIT y fuerza para quemar grasa.",
  metaDescriptionEn: "Running plan for weight loss. 12 weeks combining zone 2, HIIT and strength to burn fat.",
  keywords: "plan running perder peso, correr para adelgazar, quemar grasa corriendo",
  keywordsEn: "running plan lose weight, running for weight loss, burn fat running",
  weeks: 12, sessionsPerWeek: 4, targetTime: null,
  heroImage: "4164761",
  overview: "Este plan combina carrera en zona 2 (quema grasa), intervalos HIIT (acelera metabolismo) y fuerza (preserva músculo). No se trata solo de correr más, sino de correr inteligente. Incluye pautas nutricionales generales.",
  overviewEn: "This plan combines zone 2 running (fat burning), HIIT intervals (metabolism boost) and strength (muscle preservation). It's not about running more, but running smart. Includes general nutrition guidelines.",
  weeklyPlan: (() => {
    const w = [];
    const phases = [
      // Weeks 1-4: Base + habit
      ...Array.from({length:4}, (_, i) => ({
        week:i+1,
        focus:["Crear hábito","Zona 2","Introducir intervalos","Descarga"][i],
        focusEn:["Build habit","Zone 2","Introduce intervals","Recovery"][i],
        sessions: i === 3 ? [
          {day:"Lunes",dayEn:"Monday",type:"Rodaje zona 2",typeEn:"Zone 2 run",detail:"25 min a ritmo suave (zona 2)",detailEn:"25 min at easy pace (zone 2)"},
          {day:"Miércoles",dayEn:"Wednesday",type:"Caminata rápida",typeEn:"Brisk walk",detail:"30 min caminata rápida",detailEn:"30 min brisk walk"},
          {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave",detailEn:"25 min at easy pace"},
          {day:"Domingo",dayEn:"Sunday",type:"Rodaje largo suave",typeEn:"Long easy run",detail:"35 min a ritmo cómodo",detailEn:"35 min at comfortable pace"}
        ] : [
          {day:"Lunes",dayEn:"Monday",type:"Rodaje zona 2",typeEn:"Zone 2 run",detail:`${25+i*5} min a ritmo suave (zona 2)`,detailEn:`${25+i*5} min at easy pace (zone 2)`},
          {day:"Miércoles",dayEn:"Wednesday",type:i>=2?"HIIT":"Carrera/Caminar",typeEn:i>=2?"HIIT":"Run/Walk",detail:i>=2?`10 min calentamiento + ${4+i} × (30 seg sprint / 90 seg suave) + 10 min vuelta calma`:`Alterna ${2+i} min corriendo / 1 min caminando × ${8-i}`,detailEn:i>=2?`10 min warm-up + ${4+i} × (30 sec sprint / 90 sec easy) + 10 min cool-down`:`Alternate ${2+i} min running / 1 min walking × ${8-i}`},
          {day:"Viernes",dayEn:"Friday",type:"Fuerza + Rodaje",typeEn:"Strength + Run",detail:`20 min circuito fuerza (sentadillas, zancadas, plancha) + ${15+i*5} min rodaje suave`,detailEn:`20 min strength circuit (squats, lunges, plank) + ${15+i*5} min easy run`},
          {day:"Domingo",dayEn:"Sunday",type:"Rodaje largo zona 2",typeEn:"Long zone 2 run",detail:`${35+i*5} min a ritmo zona 2`,detailEn:`${35+i*5} min at zone 2 pace`}
        ]
      })),
      // Weeks 5-8: Increase intensity
      ...Array.from({length:4}, (_, i) => ({
        week:i+5,
        focus:["Subir intensidad","HIIT + zona 2","Pico de volumen","Descarga"][i],
        focusEn:["Increase intensity","HIIT + zone 2","Peak volume","Recovery"][i],
        sessions: i === 3 ? [
          {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
          {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek suave",typeEn:"Easy fartlek",detail:"10 min calentamiento + 5 × (1 min rápido / 2 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 5 × (1 min fast / 2 min easy) + 10 min cool-down"},
          {day:"Viernes",dayEn:"Friday",type:"Fuerza",typeEn:"Strength",detail:"30 min circuito fuerza completo",detailEn:"30 min full strength circuit"},
          {day:"Domingo",dayEn:"Sunday",type:"Rodaje largo",typeEn:"Long run",detail:"45 min a ritmo cómodo",detailEn:"45 min at comfortable pace"}
        ] : [
          {day:"Lunes",dayEn:"Monday",type:"Rodaje zona 2",typeEn:"Zone 2 run",detail:`${40+i*5} min a ritmo zona 2`,detailEn:`${40+i*5} min at zone 2 pace`},
          {day:"Miércoles",dayEn:"Wednesday",type:"HIIT",typeEn:"HIIT",detail:`10 min calentamiento + ${6+i} × (${30+i*5} seg sprint / 60 seg suave) + 10 min vuelta calma`,detailEn:`10 min warm-up + ${6+i} × (${30+i*5} sec sprint / 60 sec easy) + 10 min cool-down`},
          {day:"Viernes",dayEn:"Friday",type:"Fuerza + Rodaje",typeEn:"Strength + Run",detail:`25 min circuito fuerza + ${25+i*5} min rodaje suave`,detailEn:`25 min strength circuit + ${25+i*5} min easy run`},
          {day:"Domingo",dayEn:"Sunday",type:"Rodaje largo zona 2",typeEn:"Long zone 2 run",detail:`${50+i*5} min a ritmo zona 2`,detailEn:`${50+i*5} min at zone 2 pace`}
        ]
      })),
      // Weeks 9-12: Maintain and optimize
      ...Array.from({length:4}, (_, i) => ({
        week:i+9,
        focus:["Optimizar","Fartlek largo","Consolidar","Mantenimiento"][i],
        focusEn:["Optimize","Long fartlek","Consolidate","Maintenance"][i],
        sessions: i === 3 ? [
          {day:"Lunes",dayEn:"Monday",type:"Rodaje zona 2",typeEn:"Zone 2 run",detail:"40 min a ritmo zona 2",detailEn:"40 min at zone 2 pace"},
          {day:"Miércoles",dayEn:"Wednesday",type:"HIIT",typeEn:"HIIT",detail:"10 min calentamiento + 8 × (45 seg sprint / 45 seg suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 8 × (45 sec sprint / 45 sec easy) + 10 min cool-down"},
          {day:"Viernes",dayEn:"Friday",type:"Fuerza + Rodaje",typeEn:"Strength + Run",detail:"25 min fuerza + 30 min rodaje suave",detailEn:"25 min strength + 30 min easy run"},
          {day:"Domingo",dayEn:"Sunday",type:"Rodaje largo",typeEn:"Long run",detail:"60 min a ritmo cómodo: ¡celebra tu progreso!",detailEn:"60 min at comfortable pace: celebrate your progress!"}
        ] : [
          {day:"Lunes",dayEn:"Monday",type:"Rodaje zona 2",typeEn:"Zone 2 run",detail:`${45+i*3} min a ritmo zona 2`,detailEn:`${45+i*3} min at zone 2 pace`},
          {day:"Miércoles",dayEn:"Wednesday",type:"HIIT/Fartlek",typeEn:"HIIT/Fartlek",detail:`10 min calentamiento + ${8+i} × (${40+i*5} seg fuerte / ${60-i*5} seg suave) + 10 min vuelta calma`,detailEn:`10 min warm-up + ${8+i} × (${40+i*5} sec hard / ${60-i*5} sec easy) + 10 min cool-down`},
          {day:"Viernes",dayEn:"Friday",type:"Fuerza + Rodaje",typeEn:"Strength + Run",detail:`25 min fuerza + ${30+i*5} min rodaje suave`,detailEn:`25 min strength + ${30+i*5} min easy run`},
          {day:"Domingo",dayEn:"Sunday",type:"Rodaje largo zona 2",typeEn:"Long zone 2 run",detail:`${60+i*5} min a ritmo zona 2`,detailEn:`${60+i*5} min at zone 2 pace`}
        ]
      }))
    ];
    return phases;
  })(),
  tips: [
    {text:"La zona 2 es donde más grasa quemas: corre a un ritmo donde puedas hablar",textEn:"Zone 2 is where you burn the most fat: run at a pace where you can talk"},
    {text:"No reduzcas calorías drásticamente: necesitas energía para entrenar",textEn:"Don't cut calories drastically: you need energy to train"},
    {text:"El ejercicio de fuerza preserva masa muscular mientras pierdes grasa",textEn:"Strength training preserves muscle mass while losing fat"},
    {text:"Pésate una vez por semana, siempre a la misma hora y en las mismas condiciones",textEn:"Weigh yourself once a week, always at the same time and conditions"},
    {text:"El HIIT acelera tu metabolismo durante horas después del ejercicio",textEn:"HIIT boosts your metabolism for hours after exercise"}
  ],
  faq: [
    {q:"¿Cuánto peso puedo perder?",a:"De forma saludable, 0.5-1 kg por semana combinando ejercicio y alimentación.",qEn:"How much weight can I lose?",aEn:"Healthily, 0.5-1 kg per week combining exercise and nutrition."},
    {q:"¿Es mejor correr en ayunas para perder peso?",a:"Puede ayudar, pero no es imprescindible. Lo importante es el déficit calórico total.",qEn:"Is fasted running better for weight loss?",aEn:"It can help, but it's not essential. Total caloric deficit is what matters."},
    {q:"¿Necesito cambiar mi alimentación?",a:"Sí, el ejercicio solo no basta. Prioriza proteínas, verduras y carbohidratos complejos.",qEn:"Do I need to change my diet?",aEn:"Yes, exercise alone isn't enough. Prioritize proteins, vegetables and complex carbs."},
    {q:"¿Puedo hacer este plan si tengo sobrepeso?",a:"Sí, pero empieza con las sesiones de caminar/correr y progresa gradualmente.",qEn:"Can I do this plan if I'm overweight?",aEn:"Yes, but start with walk/run sessions and progress gradually."},
    {q:"¿Es normal no perder peso al principio?",a:"Sí, puedes ganar músculo al inicio. Mide también centímetros de cintura.",qEn:"Is it normal not to lose weight at first?",aEn:"Yes, you may gain muscle initially. Also measure waist centimeters."}
  ],
  relatedArticles: [
    {slug:"correr-para-adelgazar",slugEn:"running-to-lose-weight"},
    {slug:"zona-2-running-quemar-grasa",slugEn:"running-plan-lose-weight"},
    {slug:"correr-con-sobrepeso",slugEn:"running-overweight-guide"}
  ],
  nextPlan: null, prevPlan: null
});

// ============================================================
// PLAN 14: Resistencia
// ============================================================
plans.push({
  slug: "resistencia", slugEn: "endurance",
  category: "objetivo", distance: null, level: "todos",
  title: "Plan para Aumentar Resistencia", titleEn: "Endurance Building Plan",
  subtitle: "Corre más lejos sin cansarte en 10 semanas", subtitleEn: "Run Farther Without Tiring in 10 Weeks",
  description: "Plan de 10 semanas enfocado en aumentar tu resistencia aeróbica y capacidad de correr más lejos.",
  descriptionEn: "10-week plan focused on building aerobic endurance and ability to run farther.",
  metaDescription: "Plan para aumentar resistencia corriendo. 10 semanas de entrenamiento aeróbico progresivo.",
  metaDescriptionEn: "Plan to build running endurance. 10 weeks of progressive aerobic training.",
  keywords: "aumentar resistencia corriendo, plan resistencia running, correr más lejos",
  keywordsEn: "build running endurance, endurance running plan, run farther",
  weeks: 10, sessionsPerWeek: 4, targetTime: null,
  heroImage: "3764014",
  overview: "Este plan se enfoca en construir tu motor aeróbico. Incrementa progresivamente el tiempo en pie, la tirada larga y la capacidad de mantener un ritmo cómodo durante más tiempo. Ideal para cualquier corredor que quiera mejorar su base.",
  overviewEn: "This plan focuses on building your aerobic engine. Progressively increases time on feet, long run and ability to maintain a comfortable pace for longer. Ideal for any runner wanting to improve their base.",
  weeklyPlan: Array.from({length:10}, (_, i) => {
    const week = i + 1;
    const isRecovery = week === 4 || week === 8;
    const baseEasy = isRecovery ? 30 : 30 + Math.min(i, 6) * 3;
    const longRun = isRecovery ? 45 : 45 + i * 7;
    return {
      week,
      focus: isRecovery ? "Semana de descarga" : ["Base aeróbica","Subir volumen","Rodaje medio","Descarga","Resistencia específica","Tirada progresiva","Pico de volumen","Descarga","Consolidación","Mantenimiento"][i],
      focusEn: isRecovery ? "Recovery week" : ["Aerobic base","Increase volume","Moderate runs","Recovery","Specific endurance","Progressive long run","Peak volume","Recovery","Consolidation","Maintenance"][i],
      sessions: [
        {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:`${baseEasy} min a ritmo suave (zona 2)`,detailEn:`${baseEasy} min at easy pace (zone 2)`},
        {day:"Miércoles",dayEn:"Wednesday",type:isRecovery?"Rodaje suave":(i>=4?"Tempo":"Fartlek"),typeEn:isRecovery?"Easy run":(i>=4?"Tempo":"Fartlek"),
          detail:isRecovery?`${baseEasy} min a ritmo suave`:(i>=4?`10 min calentamiento + ${15+Math.min(i-4,4)*5} min a ritmo tempo + 10 min vuelta calma`:`10 min calentamiento + ${6+i} × (1 min rápido / ${i<3?"2":"1.5"} min suave) + 10 min vuelta calma`),
          detailEn:isRecovery?`${baseEasy} min at easy pace`:(i>=4?`10 min warm-up + ${15+Math.min(i-4,4)*5} min at tempo pace + 10 min cool-down`:`10 min warm-up + ${6+i} × (1 min fast / ${i<3?"2":"1.5"} min easy) + 10 min cool-down`)},
        {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:`${baseEasy-5} min a ritmo suave`,detailEn:`${baseEasy-5} min at easy pace`},
        {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:`${longRun} min a ritmo cómodo${i>=6&&!isRecovery?" con últimos 10 min a ritmo medio":""}`,detailEn:`${longRun} min at comfortable pace${i>=6&&!isRecovery?" with last 10 min at moderate pace":""}`}
      ]
    };
  }),
  tips: [
    {text:"La clave de la resistencia es la paciencia: no intentes ir rápido",textEn:"The key to endurance is patience: don't try to go fast"},
    {text:"Incrementa tu tirada larga solo 10 min por semana como máximo",textEn:"Increase your long run by only 10 min per week maximum"},
    {text:"La hidratación es fundamental en sesiones de más de 60 minutos",textEn:"Hydration is essential in sessions over 60 minutes"}
  ],
  faq: [
    {q:"¿A qué ritmo debo hacer las tiradas largas?",a:"A ritmo conversacional. Debes poder hablar frases completas.",qEn:"What pace should long runs be?",aEn:"At conversational pace. You should be able to speak full sentences."},
    {q:"¿Puedo hacer este plan si soy principiante?",a:"Sí, ajusta los tiempos a tu nivel actual y progresa gradualmente.",qEn:"Can I do this plan as a beginner?",aEn:"Yes, adjust the times to your current level and progress gradually."},
    {q:"¿Cuánto mejoraré mi resistencia?",a:"Puedes esperar correr un 30-50% más de tiempo sin cansarte en 10 semanas.",qEn:"How much will my endurance improve?",aEn:"You can expect to run 30-50% longer without tiring in 10 weeks."},
    {q:"¿Necesito suplementos?",a:"No, una alimentación equilibrada es suficiente. Hidratación sí es clave.",qEn:"Do I need supplements?",aEn:"No, a balanced diet is enough. Hydration is key though."},
    {q:"¿Después de este plan qué hago?",a:"Puedes pasar a un plan de 10K o media maratón según tu nivel.",qEn:"What do I do after this plan?",aEn:"You can move to a 10K or half marathon plan depending on your level."}
  ],
  relatedArticles: [
    {slug:"como-aumentar-resistencia-corriendo",slugEn:"how-to-build-running-endurance"},
    {slug:"hidratacion-running-guia-completa",slugEn:"running-hydration-complete-guide"},
    {slug:"ritmo-para-principiantes-running",slugEn:"running-pace-for-beginners"}
  ],
  nextPlan: null, prevPlan: null
});

// ============================================================
// PLAN 15: Velocidad
// ============================================================
plans.push({
  slug: "velocidad", slugEn: "speed",
  category: "objetivo", distance: null, level: "intermedio",
  title: "Plan para Mejorar Velocidad", titleEn: "Speed Improvement Plan",
  subtitle: "Corre más rápido en 8 semanas", subtitleEn: "Run Faster in 8 Weeks",
  description: "Plan de 8 semanas con series, fartlek y tempo para mejorar tu velocidad en cualquier distancia.",
  descriptionEn: "8-week plan with intervals, fartlek and tempo to improve your speed at any distance.",
  metaDescription: "Plan para mejorar velocidad corriendo. 8 semanas de series, fartlek y tempo para correr más rápido.",
  metaDescriptionEn: "Plan to improve running speed. 8 weeks of intervals, fartlek and tempo to run faster.",
  keywords: "mejorar velocidad corriendo, plan velocidad running, correr más rápido, series running",
  keywordsEn: "improve running speed, speed running plan, run faster, running intervals",
  weeks: 8, sessionsPerWeek: 4, targetTime: null,
  heroImage: "3756042",
  overview: "Este plan se centra en mejorar tu VO2max y economía de carrera a través de series de diferentes distancias, fartlek y carrera a ritmo tempo. Requiere una base de al menos 20 km semanales. Al final correrás más rápido a menos esfuerzo.",
  overviewEn: "This plan focuses on improving your VO2max and running economy through various distance intervals, fartlek and tempo runs. Requires a base of at least 20 km per week. By the end you'll run faster at less effort.",
  weeklyPlan: [
    {week:1,focus:"Test y base de velocidad",focusEn:"Test and speed base",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series cortas",typeEn:"Short intervals",detail:"15 min calentamiento + 8 × 200m rápido (rec 200m trote) + 10 min vuelta calma",detailEn:"15 min warm-up + 8 × 200m fast (200m jog rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 15 min a ritmo tempo + 10 min vuelta calma",detailEn:"10 min warm-up + 15 min at tempo pace + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"50 min a ritmo suave",detailEn:"50 min at easy pace"}
    ]},
    {week:2,focus:"Velocidad pura",focusEn:"Pure speed",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 10 × 300m rápido (rec 100m trote) + 10 min vuelta calma",detailEn:"15 min warm-up + 10 × 300m fast (100m jog rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 10 × (30 seg sprint / 90 seg suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 10 × (30 sec sprint / 90 sec easy) + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"55 min a ritmo suave",detailEn:"55 min at easy pace"}
    ]},
    {week:3,focus:"Series medias",focusEn:"Medium intervals",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 6 × 600m rápido (rec 90 seg) + 10 min vuelta calma",detailEn:"15 min warm-up + 6 × 600m fast (90 sec rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 20 min a ritmo tempo + 10 min vuelta calma",detailEn:"10 min warm-up + 20 min at tempo pace + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"55 min a ritmo suave",detailEn:"55 min at easy pace"}
    ]},
    {week:4,focus:"Descarga activa",focusEn:"Active recovery",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fartlek suave",typeEn:"Easy fartlek",detail:"10 min calentamiento + 6 × (30 seg rápido / 90 seg suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × (30 sec fast / 90 sec easy) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"45 min a ritmo cómodo",detailEn:"45 min at comfortable pace"}
    ]},
    {week:5,focus:"Series largas",focusEn:"Long intervals",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series",typeEn:"Intervals",detail:"15 min calentamiento + 5 × 800m rápido (rec 2 min) + 10 min vuelta calma",detailEn:"15 min warm-up + 5 × 800m fast (2 min rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 6 × (2 min fuerte / 1 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 6 × (2 min hard / 1 min easy) + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"55 min a ritmo suave con últimos 10 min a ritmo medio",detailEn:"55 min easy with last 10 min at moderate pace"}
    ]},
    {week:6,focus:"VO2max",focusEn:"VO2max",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series VO2max",typeEn:"VO2max intervals",detail:"15 min calentamiento + 5 × 1000m a ritmo 5K (rec 2.5 min) + 10 min vuelta calma",detailEn:"15 min warm-up + 5 × 1000m at 5K pace (2.5 min rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Tempo",typeEn:"Tempo",detail:"10 min calentamiento + 25 min a ritmo tempo + 10 min vuelta calma",detailEn:"10 min warm-up + 25 min at tempo pace + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"60 min a ritmo suave",detailEn:"60 min at easy pace"}
    ]},
    {week:7,focus:"Series mixtas",focusEn:"Mixed intervals",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Series pirámide",typeEn:"Pyramid intervals",detail:"15 min calentamiento + 200-400-600-800-600-400-200m rápido (rec igual tiempo) + 10 min vuelta calma",detailEn:"15 min warm-up + 200-400-600-800-600-400-200m fast (equal time rest) + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Fartlek",typeEn:"Fartlek",detail:"10 min calentamiento + 8 × (1 min sprint / 1 min suave) + 10 min vuelta calma",detailEn:"10 min warm-up + 8 × (1 min sprint / 1 min easy) + 10 min cool-down"},
      {day:"Domingo",dayEn:"Sunday",type:"Tirada larga",typeEn:"Long run",detail:"55 min a ritmo suave",detailEn:"55 min at easy pace"}
    ]},
    {week:8,focus:"Test final",focusEn:"Final test",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min a ritmo suave",detailEn:"30 min at easy pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Activación",typeEn:"Activation",detail:"15 min suave + 4 × 200m rápido + 10 min vuelta calma",detailEn:"15 min easy + 4 × 200m fast + 10 min cool-down"},
      {day:"Viernes",dayEn:"Friday",type:"Descanso activo",typeEn:"Active rest",detail:"20 min trote suave + estiramientos",detailEn:"20 min easy jog + stretching"},
      {day:"Domingo",dayEn:"Sunday",type:"Test de velocidad",typeEn:"Speed test",detail:"¡Haz un 5K o 10K test y compara con tu marca del inicio!",detailEn:"Do a 5K or 10K test and compare with your starting mark!"}
    ]}
  ],
  tips: [
    {text:"Las series cortas (200-400m) mejoran tu velocidad pura y economía de carrera",textEn:"Short intervals (200-400m) improve pure speed and running economy"},
    {text:"Las series largas (800-1000m) mejoran tu VO2max y resistencia a la velocidad",textEn:"Long intervals (800-1000m) improve VO2max and speed endurance"},
    {text:"El 80% de tu entrenamiento debe ser a ritmo suave para recuperarte bien",textEn:"80% of your training should be at easy pace for proper recovery"},
    {text:"Haz ejercicios de técnica de carrera (skipping, talones, rodillas altas) antes de las series",textEn:"Do running drills (skipping, butt kicks, high knees) before intervals"}
  ],
  faq: [
    {q:"¿Qué base necesito?",a:"Deberías correr al menos 20 km semanales cómodamente.",qEn:"What base do I need?",aEn:"You should be running at least 20 km per week comfortably."},
    {q:"¿A qué ritmo hago las series cortas?",a:"Al 90-95% de tu esfuerzo máximo. Rápido pero controlado.",qEn:"What pace for short intervals?",aEn:"At 90-95% of your max effort. Fast but controlled."},
    {q:"¿Puedo combinar con entrenamiento de fuerza?",a:"Sí, haz fuerza los días de rodaje suave, no después de series.",qEn:"Can I combine with strength training?",aEn:"Yes, do strength on easy run days, not after intervals."},
    {q:"¿Cuánto mejoraré mi velocidad?",a:"Puedes esperar mejorar entre 15-30 segundos por km en 8 semanas.",qEn:"How much will my speed improve?",aEn:"You can expect to improve 15-30 seconds per km in 8 weeks."},
    {q:"¿Necesito pista de atletismo?",a:"No es imprescindible, pero facilita medir distancias en las series.",qEn:"Do I need a track?",aEn:"Not essential, but it makes measuring interval distances easier."}
  ],
  relatedArticles: [
    {slug:"como-correr-mas-rapido",slugEn:"how-to-run-faster"},
    {slug:"entrenamiento-series-fartlek",slugEn:"interval-fartlek-training"},
    {slug:"entrenamiento-fuerza-corredores",slugEn:"leg-strength-exercises-runners"}
  ],
  nextPlan: null, prevPlan: null
});

// ============================================================
// PLAN 16: Trail Principiantes
// ============================================================
plans.push({
  slug: "trail-principiantes", slugEn: "trail-beginners",
  category: "especializado", distance: null, level: "principiante",
  title: "Plan Trail Running para Principiantes", titleEn: "Trail Running Plan for Beginners",
  subtitle: "Empieza en el trail en 10 semanas", subtitleEn: "Start Trail Running in 10 Weeks",
  description: "Plan de 10 semanas para pasar del asfalto al trail con seguridad y disfrute.",
  descriptionEn: "10-week plan to transition from road to trail safely and enjoyably.",
  metaDescription: "Plan trail running para principiantes. 10 semanas para pasar del asfalto a la montaña.",
  metaDescriptionEn: "Trail running plan for beginners. 10 weeks to transition from road to mountain.",
  keywords: "plan trail running principiantes, empezar trail running, entrenamiento trail",
  keywordsEn: "trail running plan beginners, start trail running, trail training plan",
  weeks: 10, sessionsPerWeek: 3, targetTime: null,
  heroImage: "3822864",
  overview: "Este plan te prepara para correr por montaña partiendo de una base de carrera en asfalto. Incluye trabajo de fuerza específico, técnica de subida y bajada, y tiradas progresivas en terreno variado. No se trata de velocidad sino de disfrutar la naturaleza.",
  overviewEn: "This plan prepares you for mountain running from a road running base. Includes specific strength work, uphill and downhill technique, and progressive runs on varied terrain. It's not about speed but enjoying nature.",
  weeklyPlan: Array.from({length:10}, (_, i) => {
    const week = i + 1;
    const isRecovery = week === 4 || week === 8;
    return {
      week,
      focus: isRecovery ? "Semana de descarga" : ["Adaptación al terreno","Técnica de subida","Técnica de bajada","Descarga","Desnivel progresivo","Terreno técnico","Primera tirada larga trail","Descarga","Consolidar","Semana de carrera trail"][i],
      focusEn: isRecovery ? "Recovery week" : ["Terrain adaptation","Uphill technique","Downhill technique","Recovery","Progressive elevation","Technical terrain","First long trail run","Recovery","Consolidate","Trail race week"][i],
      sessions: isRecovery ? [
        {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min a ritmo suave (asfalto)",detailEn:"25 min at easy pace (road)"},
        {day:"Miércoles",dayEn:"Wednesday",type:"Fuerza",typeEn:"Strength",detail:"20 min circuito: sentadillas, zancadas, plancha, gemelos",detailEn:"20 min circuit: squats, lunges, plank, calf raises"},
        {day:"Sábado",dayEn:"Saturday",type:"Senderismo activo",typeEn:"Active hiking",detail:"45 min de senderismo a ritmo moderado",detailEn:"45 min hiking at moderate pace"}
      ] : week === 10 ? [
        {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"20 min a ritmo suave",detailEn:"20 min at easy pace"},
        {day:"Miércoles",dayEn:"Wednesday",type:"Activación",typeEn:"Activation",detail:"15 min trote + 4 × 30 seg cuestas suaves",detailEn:"15 min jog + 4 × 30 sec easy hills"},
        {day:"Domingo",dayEn:"Sunday",type:"¡Carrera trail!",typeEn:"Trail Race Day!",detail:"¡Tu primera carrera trail! Disfruta cada sendero",detailEn:"Your first trail race! Enjoy every trail"}
      ] : [
        {day:"Lunes",dayEn:"Monday",type:i>=4?"Fuerza + Rodaje":"Rodaje suave",typeEn:i>=4?"Strength + Run":"Easy run",
          detail:i>=4?`20 min fuerza piernas + ${25+Math.min(i,5)*3} min rodaje suave`:`${25+i*3} min a ritmo suave`,
          detailEn:i>=4?`20 min leg strength + ${25+Math.min(i,5)*3} min easy run`:`${25+i*3} min at easy pace`},
        {day:"Miércoles",dayEn:"Wednesday",type:"Técnica trail",typeEn:"Trail technique",
          detail:i<3?`Cuestas: ${4+i*2} × 30 seg subida fuerte + bajada trotando`:`${30+i*3} min en sendero con desnivel moderado`,
          detailEn:i<3?`Hills: ${4+i*2} × 30 sec hard uphill + jog down`:`${30+i*3} min on trail with moderate elevation`},
        {day:"Sábado",dayEn:"Saturday",type:"Tirada larga trail",typeEn:"Long trail run",
          detail:`${40+i*8} min en sendero a ritmo cómodo (camina las subidas fuertes)`,
          detailEn:`${40+i*8} min on trail at comfortable pace (walk steep uphills)`}
      ]
    };
  }),
  tips: [
    {text:"En trail no mires el ritmo: guíate por esfuerzo percibido y pulsaciones",textEn:"In trail don't watch your pace: use perceived effort and heart rate"},
    {text:"Caminar las subidas fuertes no es hacer trampa, es estrategia",textEn:"Walking steep uphills isn't cheating, it's strategy"},
    {text:"Invierte en zapatillas de trail con buen agarre y protección",textEn:"Invest in trail shoes with good grip and protection"},
    {text:"Lleva agua y algo de comida siempre que salgas al monte",textEn:"Always carry water and some food when heading to the mountains"}
  ],
  faq: [
    {q:"¿Puedo hacer trail si solo he corrido en asfalto?",a:"Sí, este plan está diseñado exactamente para esa transición.",qEn:"Can I do trail if I've only run on road?",aEn:"Yes, this plan is designed exactly for that transition."},
    {q:"¿Qué zapatillas necesito?",a:"Zapatillas de trail con suela Vibram o similar, buen agarre y protección de roca.",qEn:"What shoes do I need?",aEn:"Trail shoes with Vibram or similar sole, good grip and rock protection."},
    {q:"¿Necesito bastones?",a:"Para empezar no, pero son útiles en trails con mucho desnivel.",qEn:"Do I need poles?",aEn:"Not to start, but they're useful on trails with lots of elevation."},
    {q:"¿Es peligroso correr en montaña?",a:"Con precaución no. Avisa siempre adónde vas y lleva móvil cargado.",qEn:"Is mountain running dangerous?",aEn:"Not with caution. Always tell someone where you're going and carry a charged phone."},
    {q:"¿Cuánto desnivel debo buscar?",a:"Empieza con 100-200m de desnivel y sube progresivamente hasta 500m.",qEn:"How much elevation should I look for?",aEn:"Start with 100-200m of elevation and progressively increase to 500m."}
  ],
  relatedArticles: [
    {slug:"empezar-trail-running",slugEn:"best-trail-running-shoes"},
    {slug:"carreras-trail-principiantes",slugEn:"first-ultra-trail-guide"},
    {slug:"bastones-trail-running",slugEn:"best-trail-running-poles"}
  ],
  nextPlan: null, prevPlan: null
});

// ============================================================
// PLAN 17: Después de Lesión
// ============================================================
plans.push({
  slug: "despues-de-lesion", slugEn: "post-injury",
  category: "especializado", distance: null, level: "recuperación",
  title: "Plan de Vuelta a Correr Después de Lesión", titleEn: "Return to Running After Injury Plan",
  subtitle: "Vuelve a correr de forma segura en 8 semanas", subtitleEn: "Return to Running Safely in 8 Weeks",
  description: "Plan conservador de 8 semanas para retomar el running después de una lesión de forma segura y progresiva.",
  descriptionEn: "Conservative 8-week plan to resume running after injury safely and progressively.",
  metaDescription: "Plan para volver a correr después de lesión. 8 semanas progresivas y seguras de rehabilitación running.",
  metaDescriptionEn: "Plan to return to running after injury. 8 safe and progressive weeks of running rehabilitation.",
  keywords: "volver a correr después de lesión, plan post lesión running, rehabilitación running",
  keywordsEn: "return to running after injury, post injury running plan, running rehabilitation",
  weeks: 8, sessionsPerWeek: 3, targetTime: null,
  heroImage: "2444852",
  overview: "Este plan está diseñado para corredores que vuelven tras una lesión (periostitis, fascitis, rodilla de corredor, etc.) con el visto bueno médico. Es muy conservador y progresivo: empieza con caminata y gradualmente introduce la carrera. La prioridad es no recaer.",
  overviewEn: "This plan is designed for runners returning after injury (shin splints, plantar fasciitis, runner's knee, etc.) with medical clearance. It's very conservative and progressive: starts with walking and gradually introduces running. The priority is not to relapse.",
  weeklyPlan: [
    {week:1,focus:"Solo caminata",focusEn:"Walking only",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Caminata rápida",typeEn:"Brisk walk",detail:"20 min de caminata rápida en llano",detailEn:"20 min brisk walk on flat ground"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fuerza rehabilitación",typeEn:"Rehab strength",detail:"15 min ejercicios de fortalecimiento (banda elástica, equilibrio, core)",detailEn:"15 min strengthening exercises (resistance band, balance, core)"},
      {day:"Viernes",dayEn:"Friday",type:"Caminata rápida",typeEn:"Brisk walk",detail:"25 min de caminata rápida",detailEn:"25 min brisk walk"}
    ]},
    {week:2,focus:"Introducir trote",focusEn:"Introduce jogging",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Caminar/Trotar",typeEn:"Walk/Jog",detail:"Alterna 1 min trote muy suave / 3 min caminando × 6",detailEn:"Alternate 1 min very easy jog / 3 min walking × 6"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fuerza rehabilitación",typeEn:"Rehab strength",detail:"20 min ejercicios de fortalecimiento específicos",detailEn:"20 min specific strengthening exercises"},
      {day:"Viernes",dayEn:"Friday",type:"Caminar/Trotar",typeEn:"Walk/Jog",detail:"Alterna 1 min trote / 2 min caminando × 7",detailEn:"Alternate 1 min jog / 2 min walking × 7"}
    ]},
    {week:3,focus:"Más trote",focusEn:"More jogging",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Caminar/Trotar",typeEn:"Walk/Jog",detail:"Alterna 2 min trote / 2 min caminando × 6",detailEn:"Alternate 2 min jog / 2 min walking × 6"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fuerza",typeEn:"Strength",detail:"20 min fuerza: sentadillas suaves, gemelos, puente de glúteos, plancha",detailEn:"20 min strength: gentle squats, calf raises, glute bridge, plank"},
      {day:"Viernes",dayEn:"Friday",type:"Caminar/Trotar",typeEn:"Walk/Jog",detail:"Alterna 3 min trote / 2 min caminando × 5",detailEn:"Alternate 3 min jog / 2 min walking × 5"}
    ]},
    {week:4,focus:"Consolidar trote",focusEn:"Consolidate jogging",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Caminar/Trotar",typeEn:"Walk/Jog",detail:"Alterna 4 min trote / 1 min caminando × 5",detailEn:"Alternate 4 min jog / 1 min walking × 5"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fuerza",typeEn:"Strength",detail:"25 min fuerza específica para corredores",detailEn:"25 min runner-specific strength"},
      {day:"Viernes",dayEn:"Friday",type:"Carrera suave",typeEn:"Easy run",detail:"15 min de carrera continua muy suave (si hay molestias, vuelve a caminar/trotar)",detailEn:"15 min very easy continuous run (if discomfort, return to walk/jog)"}
    ]},
    {week:5,focus:"Primera carrera continua",focusEn:"First continuous run",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Carrera suave",typeEn:"Easy run",detail:"18 min de carrera continua muy suave",detailEn:"18 min very easy continuous run"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fuerza",typeEn:"Strength",detail:"25 min fuerza + 10 min caminata",detailEn:"25 min strength + 10 min walking"},
      {day:"Viernes",dayEn:"Friday",type:"Carrera suave",typeEn:"Easy run",detail:"20 min de carrera continua suave",detailEn:"20 min easy continuous run"}
    ]},
    {week:6,focus:"Aumentar duración",focusEn:"Increase duration",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Carrera suave",typeEn:"Easy run",detail:"22 min de carrera continua suave",detailEn:"22 min easy continuous run"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fuerza + Trote",typeEn:"Strength + Jog",detail:"20 min fuerza + 15 min trote suave",detailEn:"20 min strength + 15 min easy jog"},
      {day:"Viernes",dayEn:"Friday",type:"Carrera suave",typeEn:"Easy run",detail:"25 min de carrera continua suave",detailEn:"25 min easy continuous run"}
    ]},
    {week:7,focus:"Normalizar volumen",focusEn:"Normalize volume",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"28 min de rodaje suave",detailEn:"28 min easy run"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Fuerza + Rodaje",typeEn:"Strength + Run",detail:"20 min fuerza + 20 min rodaje suave",detailEn:"20 min strength + 20 min easy run"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min de rodaje suave",detailEn:"30 min easy run"}
    ]},
    {week:8,focus:"Vuelta a la normalidad",focusEn:"Return to normal",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min de rodaje suave",detailEn:"30 min easy run"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje con aceleraciones",typeEn:"Run with strides",detail:"25 min rodaje suave + 4 × 20 seg aceleraciones suaves",detailEn:"25 min easy run + 4 × 20 sec gentle strides"},
      {day:"Viernes",dayEn:"Friday",type:"Rodaje suave",typeEn:"Easy run",detail:"35 min de rodaje suave: ¡has vuelto!",detailEn:"35 min easy run: you're back!"}
    ]}
  ],
  tips: [
    {text:"La regla de oro: si duele, para. No confundas molestia con dolor",textEn:"Golden rule: if it hurts, stop. Don't confuse discomfort with pain"},
    {text:"No te saltes las sesiones de fuerza: son tu seguro anti-recaída",textEn:"Don't skip strength sessions: they're your insurance against relapse"},
    {text:"Corre en superficies blandas (tierra, hierba) las primeras semanas",textEn:"Run on soft surfaces (dirt, grass) in the first weeks"},
    {text:"Escucha a tu cuerpo: si necesitas repetir una semana, hazlo sin culpa",textEn:"Listen to your body: if you need to repeat a week, do it guilt-free"}
  ],
  faq: [
    {q:"¿Cuándo puedo empezar este plan?",a:"Cuando tu fisio o médico te dé el alta para empezar a caminar rápido sin dolor.",qEn:"When can I start this plan?",aEn:"When your physio or doctor clears you to start brisk walking pain-free."},
    {q:"¿Qué pasa si siento molestias?",a:"Para, camina y evalúa. Si persiste más de 24h, consulta a tu fisio.",qEn:"What if I feel discomfort?",aEn:"Stop, walk and evaluate. If it persists more than 24h, consult your physio."},
    {q:"¿Puedo ir más rápido de lo que dice el plan?",a:"No. La paciencia es clave. Ir demasiado rápido es la causa #1 de recaídas.",qEn:"Can I go faster than the plan says?",aEn:"No. Patience is key. Going too fast is the #1 cause of relapses."},
    {q:"¿Después de este plan qué sigue?",a:"Puedes pasar al plan de 5K para principiantes o al de resistencia.",qEn:"What comes after this plan?",aEn:"You can move to the 5K beginners plan or the endurance plan."},
    {q:"¿Necesito seguir con ejercicios de fuerza después?",a:"Sí, la fuerza debe ser parte permanente de tu rutina para prevenir lesiones.",qEn:"Do I need to continue strength exercises after?",aEn:"Yes, strength should be a permanent part of your routine to prevent injuries."}
  ],
  relatedArticles: [
    {slug:"volver-a-correr-despues-de-lesion",slugEn:"return-to-running-after-injury"},
    {slug:"prevenir-lesiones-running",slugEn:"common-running-mistakes"},
    {slug:"ejercicios-fuerza-piernas-corredores",slugEn:"leg-strength-exercises-runners"}
  ],
  nextPlan: "5k-principiantes", prevPlan: null
});

// ============================================================
// PLAN 18: Mayores de 50
// ============================================================
plans.push({
  slug: "mayores-de-50", slugEn: "over-50",
  category: "especializado", distance: null, level: "principiante",
  title: "Plan Running para Mayores de 50", titleEn: "Running Plan for Over 50",
  subtitle: "Empieza a correr después de los 50", subtitleEn: "Start Running After 50",
  description: "Plan de 10 semanas adaptado para personas mayores de 50 que quieren empezar a correr.",
  descriptionEn: "10-week plan adapted for people over 50 who want to start running.",
  metaDescription: "Plan de running para mayores de 50. 10 semanas seguras y adaptadas para empezar a correr.",
  metaDescriptionEn: "Running plan for over 50. 10 safe and adapted weeks to start running.",
  keywords: "plan running mayores 50, empezar a correr después de 50, running tercera edad",
  keywordsEn: "running plan over 50, start running after 50, running older adults",
  weeks: 10, sessionsPerWeek: 3, targetTime: null,
  heroImage: "4056723",
  overview: "Correr después de los 50 es perfectamente posible y muy beneficioso. Este plan respeta los tiempos de recuperación más largos, incluye más trabajo de fuerza y movilidad, y progresa muy gradualmente. Consulta con tu médico antes de empezar.",
  overviewEn: "Running after 50 is perfectly possible and very beneficial. This plan respects longer recovery times, includes more strength and mobility work, and progresses very gradually. Consult your doctor before starting.",
  weeklyPlan: Array.from({length:10}, (_, i) => {
    const week = i + 1;
    if (week <= 3) {
      return {week, focus:["Adaptación","Más movimiento","Introducir trote"][i], focusEn:["Adaptation","More movement","Introduce jogging"][i], sessions:[
        {day:"Lunes",dayEn:"Monday",type:"Caminata + Movilidad",typeEn:"Walk + Mobility",detail:`${20+i*5} min caminata rápida + 10 min estiramientos/movilidad`,detailEn:`${20+i*5} min brisk walk + 10 min stretching/mobility`},
        {day:"Miércoles",dayEn:"Wednesday",type:i===2?"Caminar/Trotar":"Caminata rápida",typeEn:i===2?"Walk/Jog":"Brisk walk",detail:i===2?"Alterna 1 min trote suave / 3 min caminando × 5":`${25+i*5} min caminata rápida`,detailEn:i===2?"Alternate 1 min easy jog / 3 min walking × 5":`${25+i*5} min brisk walk`},
        {day:"Viernes",dayEn:"Friday",type:"Fuerza + Equilibrio",typeEn:"Strength + Balance",detail:`${15+i*3} min: sentadillas con silla, gemelos, equilibrio unipodal, plancha`,detailEn:`${15+i*3} min: chair squats, calf raises, single-leg balance, plank`}
      ]};
    } else if (week <= 6) {
      return {week, focus:["Más trote","Carrera suave","Consolidar"][i-3], focusEn:["More jogging","Easy running","Consolidate"][i-3], sessions:[
        {day:"Lunes",dayEn:"Monday",type:"Caminar/Trotar",typeEn:"Walk/Jog",detail:`Alterna ${i-1} min trote / ${4-Math.floor(i/3)} min caminando × ${5+Math.floor(i/2)}`,detailEn:`Alternate ${i-1} min jog / ${4-Math.floor(i/3)} min walking × ${5+Math.floor(i/2)}`},
        {day:"Miércoles",dayEn:"Wednesday",type:"Fuerza + Movilidad",typeEn:"Strength + Mobility",detail:`25 min fuerza adaptada + 10 min movilidad articular`,detailEn:`25 min adapted strength + 10 min joint mobility`},
        {day:"Sábado",dayEn:"Saturday",type:i>=5?"Carrera suave":"Caminar/Trotar",typeEn:i>=5?"Easy run":"Walk/Jog",detail:i>=5?`${15+(i-5)*5} min carrera continua suave`:`Alterna ${i} min trote / 2 min caminando × ${4+i-3}`,detailEn:i>=5?`${15+(i-5)*5} min easy continuous run`:`Alternate ${i} min jog / 2 min walking × ${4+i-3}`}
      ]};
    } else if (week <= 9) {
      return {week, focus:["Carrera continua","Descarga","Subir duración"][i-6], focusEn:["Continuous running","Recovery","Increase duration"][i-6], sessions: week === 8 ? [
        {day:"Lunes",dayEn:"Monday",type:"Caminata rápida",typeEn:"Brisk walk",detail:"25 min caminata rápida",detailEn:"25 min brisk walk"},
        {day:"Miércoles",dayEn:"Wednesday",type:"Fuerza",typeEn:"Strength",detail:"25 min fuerza + 10 min movilidad",detailEn:"25 min strength + 10 min mobility"},
        {day:"Sábado",dayEn:"Saturday",type:"Carrera suave",typeEn:"Easy run",detail:"20 min carrera suave + 10 min caminando",detailEn:"20 min easy run + 10 min walking"}
      ] : [
        {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:`${20+(i-6)*5} min a ritmo suave`,detailEn:`${20+(i-6)*5} min at easy pace`},
        {day:"Miércoles",dayEn:"Wednesday",type:"Fuerza + Trote",typeEn:"Strength + Jog",detail:`20 min fuerza + ${15+(i-6)*3} min trote suave`,detailEn:`20 min strength + ${15+(i-6)*3} min easy jog`},
        {day:"Sábado",dayEn:"Saturday",type:"Rodaje suave",typeEn:"Easy run",detail:`${25+(i-6)*5} min a ritmo cómodo`,detailEn:`${25+(i-6)*5} min at comfortable pace`}
      ]};
    } else {
      return {week:10, focus:"Celebración", focusEn:"Celebration", sessions:[
        {day:"Lunes",dayEn:"Monday",type:"Rodaje suave",typeEn:"Easy run",detail:"25 min de rodaje suave",detailEn:"25 min easy run"},
        {day:"Miércoles",dayEn:"Wednesday",type:"Fuerza + Rodaje",typeEn:"Strength + Run",detail:"20 min fuerza + 20 min rodaje suave",detailEn:"20 min strength + 20 min easy run"},
        {day:"Sábado",dayEn:"Saturday",type:"Rodaje suave",typeEn:"Easy run",detail:"30 min de rodaje continuo suave: ¡lo has conseguido!",detailEn:"30 min easy continuous run: you did it!"}
      ]};
    }
  }),
  tips: [
    {text:"Deja al menos un día de descanso entre sesiones de carrera",textEn:"Leave at least one rest day between running sessions"},
    {text:"La movilidad articular es tu mejor aliada: dedícale 10 min diarios",textEn:"Joint mobility is your best ally: dedicate 10 min daily"},
    {text:"Corre siempre a un ritmo donde puedas mantener una conversación",textEn:"Always run at a pace where you can maintain a conversation"},
    {text:"El trabajo de equilibrio previene caídas y mejora la estabilidad",textEn:"Balance work prevents falls and improves stability"}
  ],
  faq: [
    {q:"¿Es seguro empezar a correr después de los 50?",a:"Sí, con revisión médica previa y un plan progresivo como este.",qEn:"Is it safe to start running after 50?",aEn:"Yes, with prior medical check-up and a progressive plan like this."},
    {q:"¿Necesito equipamiento especial?",a:"Buenas zapatillas con amortiguación extra y ropa transpirable.",qEn:"Do I need special equipment?",aEn:"Good shoes with extra cushioning and breathable clothing."},
    {q:"¿Cuánto tardaré en poder correr 30 minutos?",a:"Con este plan, en unas 8-10 semanas podrás correr 30 min seguidos.",qEn:"How long until I can run 30 minutes?",aEn:"With this plan, in about 8-10 weeks you'll run 30 min non-stop."},
    {q:"¿Puedo hacer este plan si tengo problemas de rodilla?",a:"Consulta con tu médico primero. Puede ser necesario adaptar algunos ejercicios.",qEn:"Can I do this plan with knee problems?",aEn:"Consult your doctor first. Some exercises may need to be adapted."},
    {q:"¿La fuerza es realmente necesaria?",a:"Absolutamente. Después de los 50, el trabajo de fuerza es tan importante como correr.",qEn:"Is strength really necessary?",aEn:"Absolutely. After 50, strength work is as important as running."}
  ],
  relatedArticles: [
    {slug:"empezar-a-correr-despues-de-los-50",slugEn:"how-to-start-running-beginners-guide"},
    {slug:"ejercicios-fuerza-piernas-corredores",slugEn:"leg-strength-exercises-runners"},
    {slug:"prevenir-lesiones-running",slugEn:"common-running-mistakes"}
  ],
  nextPlan: "5k-principiantes", prevPlan: null
});

// ============================================================
// PLAN 19: Correr en Ayunas
// ============================================================
plans.push({
  slug: "correr-en-ayunas", slugEn: "fasted-running",
  category: "especializado", distance: null, level: "intermedio",
  title: "Plan de Running en Ayunas", titleEn: "Fasted Running Plan",
  subtitle: "Entrena tu metabolismo de grasas en 6 semanas", subtitleEn: "Train Your Fat Metabolism in 6 Weeks",
  description: "Plan de 6 semanas para incorporar el running en ayunas de forma segura y efectiva.",
  descriptionEn: "6-week plan to incorporate fasted running safely and effectively.",
  metaDescription: "Plan de running en ayunas. 6 semanas para entrenar tu metabolismo de grasas corriendo en ayunas.",
  metaDescriptionEn: "Fasted running plan. 6 weeks to train your fat metabolism through fasted running.",
  keywords: "correr en ayunas plan, running en ayunas, entrenar ayuno intermitente running",
  keywordsEn: "fasted running plan, running on empty stomach, intermittent fasting running",
  weeks: 6, sessionsPerWeek: 3, targetTime: null,
  heroImage: "6551282",
  overview: "Correr en ayunas puede mejorar tu capacidad de quemar grasas como combustible. Este plan introduce gradualmente sesiones en ayunas, empezando con 15 minutos y llegando a 45-60 minutos. Siempre a ritmo suave y con pautas de seguridad claras.",
  overviewEn: "Fasted running can improve your ability to burn fat as fuel. This plan gradually introduces fasted sessions, starting with 15 minutes and reaching 45-60 minutes. Always at easy pace with clear safety guidelines.",
  weeklyPlan: [
    {week:1,focus:"Introducción al ayuno",focusEn:"Introduction to fasting",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje en ayunas",typeEn:"Fasted run",detail:"15 min de trote muy suave en ayunas + desayuno inmediato después",detailEn:"15 min very easy jog fasted + immediate breakfast after"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje normal",typeEn:"Normal run",detail:"30 min a ritmo suave (con desayuno previo)",detailEn:"30 min at easy pace (with breakfast before)"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga normal",typeEn:"Normal long run",detail:"45 min a ritmo cómodo (con desayuno)",detailEn:"45 min at comfortable pace (with breakfast)"}
    ]},
    {week:2,focus:"Extender duración",focusEn:"Extend duration",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje en ayunas",typeEn:"Fasted run",detail:"20 min de rodaje suave en ayunas + desayuno post",detailEn:"20 min easy run fasted + breakfast after"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje normal",typeEn:"Normal run",detail:"35 min a ritmo suave",detailEn:"35 min at easy pace"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga normal",typeEn:"Normal long run",detail:"50 min a ritmo cómodo",detailEn:"50 min at comfortable pace"}
    ]},
    {week:3,focus:"Dos sesiones en ayunas",focusEn:"Two fasted sessions",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje en ayunas",typeEn:"Fasted run",detail:"25 min de rodaje suave en ayunas",detailEn:"25 min easy run fasted"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje en ayunas",typeEn:"Fasted run",detail:"20 min de rodaje suave en ayunas + desayuno post",detailEn:"20 min easy run fasted + breakfast after"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga normal",typeEn:"Normal long run",detail:"55 min a ritmo cómodo (con desayuno)",detailEn:"55 min at comfortable pace (with breakfast)"}
    ]},
    {week:4,focus:"Consolidar",focusEn:"Consolidate",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje en ayunas",typeEn:"Fasted run",detail:"30 min de rodaje suave en ayunas",detailEn:"30 min easy run fasted"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje en ayunas",typeEn:"Fasted run",detail:"25 min de rodaje suave en ayunas",detailEn:"25 min easy run fasted"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga normal",typeEn:"Normal long run",detail:"55 min a ritmo cómodo",detailEn:"55 min at comfortable pace"}
    ]},
    {week:5,focus:"Tirada larga en ayunas",focusEn:"Long fasted run",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje en ayunas",typeEn:"Fasted run",detail:"35 min de rodaje suave en ayunas",detailEn:"35 min easy run fasted"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje normal",typeEn:"Normal run",detail:"35 min a ritmo medio (con desayuno)",detailEn:"35 min at moderate pace (with breakfast)"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga en ayunas",typeEn:"Long fasted run",detail:"45 min en ayunas a ritmo muy suave (lleva gel por seguridad)",detailEn:"45 min fasted at very easy pace (carry gel for safety)"}
    ]},
    {week:6,focus:"Plan completo",focusEn:"Full plan",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Rodaje en ayunas",typeEn:"Fasted run",detail:"40 min de rodaje suave en ayunas",detailEn:"40 min easy run fasted"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Rodaje normal",typeEn:"Normal run",detail:"35 min a ritmo medio (con desayuno)",detailEn:"35 min at moderate pace (with breakfast)"},
      {day:"Sábado",dayEn:"Saturday",type:"Tirada larga en ayunas",typeEn:"Long fasted run",detail:"50-60 min en ayunas a ritmo suave (lleva gel y agua)",detailEn:"50-60 min fasted at easy pace (carry gel and water)"}
    ]}
  ],
  tips: [
    {text:"Nunca hagas series o entrenamientos intensos en ayunas: solo ritmo suave",textEn:"Never do intervals or intense workouts fasted: only easy pace"},
    {text:"Lleva siempre un gel de emergencia por si te mareas",textEn:"Always carry an emergency gel in case you feel dizzy"},
    {text:"Hidrátate bien: bebe agua antes de salir aunque sea en ayunas",textEn:"Stay hydrated: drink water before heading out even when fasted"},
    {text:"Desayuna proteínas + carbohidratos dentro de los 30 min post-entreno",textEn:"Eat protein + carbs within 30 min post-workout"}
  ],
  faq: [
    {q:"¿Es seguro correr en ayunas?",a:"Sí, a ritmo suave y con progresión gradual. Si tienes diabetes o problemas metabólicos, consulta a tu médico.",qEn:"Is fasted running safe?",aEn:"Yes, at easy pace and with gradual progression. If you have diabetes or metabolic issues, consult your doctor."},
    {q:"¿Perderé peso corriendo en ayunas?",a:"Puede ayudar a quemar más grasa, pero la pérdida de peso depende del balance calórico total.",qEn:"Will I lose weight running fasted?",aEn:"It can help burn more fat, but weight loss depends on total caloric balance."},
    {q:"¿Puedo tomar café antes?",a:"Sí, café solo sin azúcar no rompe el ayuno y puede mejorar el rendimiento.",qEn:"Can I have coffee before?",aEn:"Yes, black coffee without sugar doesn't break the fast and can improve performance."},
    {q:"¿Qué hago si me mareo?",a:"Para inmediatamente, toma el gel de emergencia y camina de vuelta.",qEn:"What if I feel dizzy?",aEn:"Stop immediately, take the emergency gel and walk back."},
    {q:"¿Cuánto tiempo se necesita para adaptar el metabolismo?",a:"Entre 4 y 6 semanas para notar mejoras en la oxidación de grasas.",qEn:"How long to adapt the metabolism?",aEn:"Between 4 and 6 weeks to notice improvements in fat oxidation."}
  ],
  relatedArticles: [
    {slug:"correr-en-ayunas",slugEn:"intermittent-fasting-running"},
    {slug:"ayuno-intermitente-running",slugEn:"intermittent-fasting-running"},
    {slug:"zona-2-running-quemar-grasa",slugEn:"running-plan-lose-weight"}
  ],
  nextPlan: null, prevPlan: null
});

// ============================================================
// PLAN 20: Primer Mes
// ============================================================
plans.push({
  slug: "primer-mes", slugEn: "first-month",
  category: "especializado", distance: null, level: "principiante total",
  title: "Plan Tu Primer Mes Corriendo", titleEn: "Your First Month Running Plan",
  subtitle: "De cero absoluto a correr 20 minutos", subtitleEn: "From Absolute Zero to Running 20 Minutes",
  description: "Plan de 4 semanas para personas que nunca han hecho deporte y quieren empezar a correr desde cero absoluto.",
  descriptionEn: "4-week plan for people who have never exercised and want to start running from absolute zero.",
  metaDescription: "Plan tu primer mes corriendo. 4 semanas para empezar desde cero absoluto a correr 20 minutos.",
  metaDescriptionEn: "Your first month running plan. 4 weeks to go from absolute zero to running 20 minutes.",
  keywords: "primer mes corriendo, empezar a correr desde cero, plan 4 semanas running principiante",
  keywordsEn: "first month running, start running from zero, 4 week running plan beginner",
  weeks: 4, sessionsPerWeek: 3, targetTime: null,
  heroImage: "3601094",
  overview: "El plan más básico y accesible. Para personas que nunca han corrido, llevan años sedentarias o simplemente quieren dar el primer paso. Empieza con caminata y progresa hasta correr 20 minutos seguidos. Sin presión, sin prisa, con mucho ánimo.",
  overviewEn: "The most basic and accessible plan. For people who have never run, have been sedentary for years, or simply want to take the first step. Starts with walking and progresses to running 20 minutes non-stop. No pressure, no rush, lots of encouragement.",
  weeklyPlan: [
    {week:1,focus:"Solo caminar",focusEn:"Just walk",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Caminata",typeEn:"Walk",detail:"15 min de caminata a paso normal + 5 min paso rápido",detailEn:"15 min normal pace walk + 5 min brisk pace"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Caminata rápida",typeEn:"Brisk walk",detail:"20 min de caminata rápida continua",detailEn:"20 min continuous brisk walk"},
      {day:"Viernes",dayEn:"Friday",type:"Caminata",typeEn:"Walk",detail:"10 min paso normal + 10 min paso rápido + 5 min paso normal",detailEn:"10 min normal pace + 10 min brisk + 5 min normal pace"}
    ]},
    {week:2,focus:"Primer trote",focusEn:"First jog",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Caminata rápida",typeEn:"Brisk walk",detail:"25 min de caminata rápida",detailEn:"25 min brisk walk"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Caminar/Trotar",typeEn:"Walk/Jog",detail:"Alterna 30 seg trotando / 3 min caminando × 6",detailEn:"Alternate 30 sec jogging / 3 min walking × 6"},
      {day:"Viernes",dayEn:"Friday",type:"Caminar/Trotar",typeEn:"Walk/Jog",detail:"Alterna 30 seg trotando / 2.5 min caminando × 7",detailEn:"Alternate 30 sec jogging / 2.5 min walking × 7"}
    ]},
    {week:3,focus:"Más trote",focusEn:"More jogging",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Caminar/Trotar",typeEn:"Walk/Jog",detail:"Alterna 1 min trotando / 2 min caminando × 7",detailEn:"Alternate 1 min jogging / 2 min walking × 7"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Caminar/Trotar",typeEn:"Walk/Jog",detail:"Alterna 1.5 min trotando / 2 min caminando × 6",detailEn:"Alternate 1.5 min jogging / 2 min walking × 6"},
      {day:"Viernes",dayEn:"Friday",type:"Caminar/Trotar",typeEn:"Walk/Jog",detail:"Alterna 2 min trotando / 2 min caminando × 6",detailEn:"Alternate 2 min jogging / 2 min walking × 6"}
    ]},
    {week:4,focus:"¡Ya corres!",focusEn:"You're running!",sessions:[
      {day:"Lunes",dayEn:"Monday",type:"Caminar/Trotar",typeEn:"Walk/Jog",detail:"Alterna 3 min trotando / 1 min caminando × 5",detailEn:"Alternate 3 min jogging / 1 min walking × 5"},
      {day:"Miércoles",dayEn:"Wednesday",type:"Caminar/Trotar",typeEn:"Walk/Jog",detail:"Alterna 5 min trotando / 1 min caminando × 3 + 2 min trotando",detailEn:"Alternate 5 min jogging / 1 min walking × 3 + 2 min jogging"},
      {day:"Viernes",dayEn:"Friday",type:"¡Carrera continua!",typeEn:"Continuous run!",detail:"¡Intenta correr 15-20 min seguidos a ritmo muy suave! Si necesitas, camina 1 min",detailEn:"Try to run 15-20 min non-stop at very easy pace! Walk 1 min if needed"}
    ]}
  ],
  tips: [
    {text:"Lo más importante es crear el hábito: sal a la misma hora cada día de entrenamiento",textEn:"The most important thing is building the habit: go out at the same time every training day"},
    {text:"No te compares con nadie: esto es tu viaje personal",textEn:"Don't compare yourself to anyone: this is your personal journey"},
    {text:"Unas zapatillas cómodas son tu única inversión necesaria",textEn:"Comfortable shoes are your only necessary investment"},
    {text:"Si un día no puedes, no pasa nada: retoma al día siguiente",textEn:"If you can't one day, no worries: pick up the next day"},
    {text:"Celebra cada pequeño logro: tu primer minuto corriendo es un hito",textEn:"Celebrate every small achievement: your first minute running is a milestone"}
  ],
  faq: [
    {q:"¿Puedo hacer este plan si nunca he hecho deporte?",a:"Sí, está diseñado exactamente para eso. Empieza solo caminando.",qEn:"Can I do this plan if I've never exercised?",aEn:"Yes, it's designed exactly for that. Start just walking."},
    {q:"¿Necesito ir al médico antes?",a:"Recomendable si tienes más de 40 años, sobrepeso o condiciones previas.",qEn:"Do I need to see a doctor first?",aEn:"Recommended if you're over 40, overweight or have pre-existing conditions."},
    {q:"¿Qué hago después de las 4 semanas?",a:"Pasa al plan 5K para principiantes: estás listo.",qEn:"What do I do after 4 weeks?",aEn:"Move to the 5K beginners plan: you're ready."},
    {q:"¿Es normal que me duela todo al principio?",a:"Agujetas son normales. Dolor articular no: consulta si persiste.",qEn:"Is it normal to be sore at first?",aEn:"Muscle soreness is normal. Joint pain is not: consult if it persists."},
    {q:"¿Debo correr rápido?",a:"No, nunca. Corre tan lento que puedas hablar sin problema.",qEn:"Should I run fast?",aEn:"No, never. Run so slow you can talk without any problem."}
  ],
  relatedArticles: [
    {slug:"empezar-a-correr-guia-principiantes",slugEn:"how-to-start-running-beginners-guide"},
    {slug:"errores-principiante-running",slugEn:"beginner-running-mistakes-nobody-tells"},
    {slug:"como-elegir-zapatillas-running",slugEn:"best-running-shoes-beginners"}
  ],
  nextPlan: "5k-principiantes", prevPlan: null
});

// ============================================================
// TRANSFORM TO GENERATOR FORMAT & WRITE
// ============================================================
// The generator (generate-plans.cjs) expects an object keyed by ES slug
// with specific property names. Transform the array here.

const output = {};
plans.forEach(p => {
  const heroUrl = `https://images.pexels.com/photos/${p.heroImage}/pexels-photo-${p.heroImage}.jpeg?auto=compress&cs=tinysrgb&w=1200&h=500&fit=crop&q=70`;

  // Transform weeks
  const weeks = p.weeklyPlan.map(w => ({
    weekNum: w.week,
    titleEs: w.focus,
    titleEn: w.focusEn,
    summaryEs: w.sessions.map(s => `${s.day}: ${s.detail}`).join(' | '),
    summaryEn: w.sessions.map(s => `${s.dayEn}: ${s.detailEn}`).join(' | '),
    sessions: w.sessions.map(s => ({
      dayEs: s.day,
      dayEn: s.dayEn,
      descEs: `${s.type}: ${s.detail}`,
      descEn: `${s.typeEn}: ${s.detailEn}`
    }))
  }));

  // Transform tips
  const tipsEs = p.tips.map(t => t.text);
  const tipsEn = p.tips.map(t => t.textEn);

  // Transform FAQ
  const faqEs = p.faq.map(f => ({ q: f.q, a: f.a }));
  const faqEn = p.faq.map(f => ({ q: f.qEn, a: f.aEn }));

  // Related plan slugs
  const relatedPlanSlugs = [];
  if (p.prevPlan) relatedPlanSlugs.push(p.prevPlan);
  if (p.nextPlan) relatedPlanSlugs.push(p.nextPlan);

  // Related blog
  const relatedBlogEs = p.relatedArticles.map(a => `/blog/${a.slug}`);
  const relatedBlogEn = p.relatedArticles.map(a => `/blog/en/${a.slugEn}`);

  output[p.slug] = {
    slugEs: p.slug,
    slugEn: p.slugEn,
    distance: p.distance,
    category: p.category,
    level: p.level,
    titleEs: p.title,
    titleEn: p.titleEn,
    subtitleEs: p.subtitle,
    subtitleEn: p.subtitleEn,
    metaDescriptionEs: p.metaDescription,
    metaDescriptionEn: p.metaDescriptionEn,
    durationWeeks: p.weeks,
    totalTime: `PT${p.weeks * 7}D`,
    daysPerWeek: p.sessionsPerWeek,
    heroImage: heroUrl,
    overviewEs: p.overview,
    overviewEn: p.overviewEn,
    prerequisitesEs: [
      p.level === 'principiante' ? 'Poder caminar 30 minutos sin fatiga' : 'Experiencia previa corriendo',
      'Zapatillas de running adecuadas',
      'Aprobación médica si tienes más de 40 años o condiciones previas',
      p.level === 'avanzado' ? 'Haber completado al menos una carrera de la distancia inferior' : 'Constancia y compromiso con el plan'
    ],
    prerequisitesEn: [
      p.level === 'principiante' ? 'Ability to walk 30 minutes without fatigue' : 'Previous running experience',
      'Proper running shoes',
      'Medical clearance if over 40 or pre-existing conditions',
      p.level === 'avanzado' ? 'Having completed at least one race of the shorter distance' : 'Consistency and commitment to the plan'
    ],
    weeks: weeks,
    tipsEs,
    tipsEn,
    faqEs,
    faqEn,
    relatedPlanSlugs,
    relatedBlogEs,
    relatedBlogEn
  };
});

const filePath = path.join(__dirname, 'plans-data.json');
fs.writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf8');
console.log(`\n✅ plans-data.json generated with ${Object.keys(output).length} plans.`);

// Validate
const totalWeeks = plans.reduce((sum, p) => sum + p.weeklyPlan.length, 0);
console.log(`Total weekly entries: ${totalWeeks}`);
plans.forEach(p => {
  if (p.weeklyPlan.length !== p.weeks) {
    console.error(`❌ ${p.slug}: has ${p.weeklyPlan.length} weeks but expected ${p.weeks}`);
  }
});
