#!/usr/bin/env node
/**
 * pinterest-bulk-pin.cjs
 * Crea tableros por categoría y pina todos los artículos del blog de CorrerJuntos en Pinterest.
 * Uso: node tools/pinterest-bulk-pin.cjs --token TU_ACCESS_TOKEN
 */

'use strict';

const https = require('https');

// ── Config ──────────────────────────────────────────────────────────────────
const TOKEN = process.argv[2] === '--token' ? process.argv[3] : null;
const BASE_URL = 'https://www.correrjuntos.com';
const DELAY_MS = 7000; // 7s entre pins (Pinterest limit: ~10/min para apps nuevas)

if (!TOKEN) {
  console.error('❌ Falta el access token.\nUso: node tools/pinterest-bulk-pin.cjs --token TU_TOKEN');
  process.exit(1);
}

// ── Artículos extraídos de blog/related.js ──────────────────────────────────
const ARTICLES = [
  {s:'alimentos-antiinflamatorios-runners',t:'15 Alimentos Antiinflamatorios para Runners',c:'Nutrición',i:'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'apple-watch-running-review',t:'Apple Watch para Running: ¿Merece la Pena?',c:'Tecnología',i:'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'apps-correr-en-grupo',t:'Las 10 Mejores Apps para Correr en Grupo',c:'Comunidad',i:'https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'andar-vs-correr',t:'Andar vs Correr: ¿Qué Es Mejor?',c:'Salud',i:'https://images.pexels.com/photos/10432232/pexels-photo-10432232.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'ansiedad-pre-carrera',t:'Ansiedad Pre-Carrera: 8 Técnicas para los Nervios',c:'Salud',i:'https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'asics-gel-nimbus-26-vs-nike-pegasus-41',t:'ASICS Gel-Nimbus 26 vs Nike Pegasus 41',c:'Zapatillas',i:'https://images.pexels.com/photos/3763869/pexels-photo-3763869.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'asics-novablast-5-opinion',t:'ASICS Novablast 5 Opinión 2026: Análisis Completo',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'auriculares-conduccion-osea-vs-in-ear-running',t:'Conducción Ósea vs In-Ear para Correr',c:'Tecnología',i:'https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'auriculares-running-natacion',t:'Mejores Auriculares para Running y Natación',c:'Tecnología',i:'https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'ayuno-intermitente-running',t:'Ayuno Intermitente y Running',c:'Nutrición',i:'https://images.pexels.com/photos/2377164/pexels-photo-2377164.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'bastones-trail-running',t:'Bastones de Trail Running: Guía Completa',c:'Trail',i:'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'bidones-running',t:'8 Mejores Bidones para Running',c:'Equipamiento',i:'https://images.pexels.com/photos/10226372/pexels-photo-10226372.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'beneficios-correr-en-grupo',t:'7 Beneficios de Correr en Grupo',c:'Comunidad',i:'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'beneficios-de-correr',t:'15 Beneficios de Correr Respaldados por la Ciencia',c:'Salud',i:'https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'cafeina-running-rendimiento',t:'Cafeína y Running: Mejora tu Rendimiento',c:'Nutrición',i:'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-en-ayunas',t:'Correr en Ayunas: 8 Beneficios y 5 Riesgos',c:'Salud',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'calambres-al-correr',t:'Calambres al Correr: Causas y Soluciones',c:'Salud',i:'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'calcetines-running',t:'Los 8 Mejores Calcetines para Running',c:'Equipamiento',i:'https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'carga-hidratos-maraton',t:'Carga de Hidratos antes de un Maratón',c:'Nutrición',i:'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'maraton-barcelona-guia',t:'Maratón de Barcelona 2026: Guía Completa',c:'Carreras',i:'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'maraton-madrid-guia',t:'Maratón de Madrid 2026: Guía Completa',c:'Carreras',i:'https://images.pexels.com/photos/3757144/pexels-photo-3757144.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'maraton-sevilla-guia',t:'Maratón de Sevilla 2026: Guía Completa',c:'Carreras',i:'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'maraton-valencia-guia',t:'Maratón de Valencia 2026: Guía Completa',c:'Carreras',i:'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'san-silvestre-vallecana-guia',t:'San Silvestre Vallecana 2026: Guía Completa',c:'Carreras',i:'https://images.pexels.com/photos/2928057/pexels-photo-2928057.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'carreras-trail-principiantes',t:'10 Mejores Carreras de Trail para Principiantes',c:'Trail',i:'https://images.pexels.com/photos/8949023/pexels-photo-8949023.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'chalecos-hidratacion-running',t:'7 Mejores Chalecos de Hidratación',c:'Trail',i:'https://images.pexels.com/photos/11598813/pexels-photo-11598813.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'chubasqueros-running',t:'8 Mejores Chubasqueros para Running',c:'Equipamiento',i:'https://images.pexels.com/photos/20234190/pexels-photo-20234190.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'cinturones-running',t:'8 Mejores Cinturones para Running',c:'Equipamiento',i:'https://images.pexels.com/photos/10226372/pexels-photo-10226372.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'como-calentar-antes-de-correr',t:'Cómo Calentar Antes de Correr',c:'Entrenamiento',i:'https://images.pexels.com/photos/7869580/pexels-photo-7869580.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'como-correr-mas-rapido',t:'Cómo Correr Más Rápido: 12 Claves',c:'Entrenamiento',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'como-elegir-zapatillas-running',t:'Cómo Elegir Zapatillas de Running',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'como-evitar-problemas-digestivos-correr',t:'Cómo Evitar Problemas Digestivos al Correr',c:'Nutrición',i:'https://images.pexels.com/photos/7298668/pexels-photo-7298668.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'como-elegir-reloj-gps-running',t:'Cómo Elegir un Reloj GPS para Running',c:'Tecnología',i:'https://images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'como-preparar-primera-carrera-5k',t:'Cómo Preparar tu Primera 5K',c:'Entrenamiento',i:'https://images.pexels.com/photos/3601094/pexels-photo-3601094.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'como-respirar-al-correr',t:'Cómo Respirar al Correr: Guía Completa',c:'Entrenamiento',i:'https://images.pexels.com/photos/7869580/pexels-photo-7869580.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'conocer-gente-haciendo-deporte',t:'Cómo Conocer Gente Haciendo Deporte en 2026',c:'Comunidad',i:'https://images.pexels.com/photos/8381748/pexels-photo-8381748.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'coros-pace-3-review',t:'COROS PACE 3: Review Completa',c:'Tecnología',i:'https://images.pexels.com/photos/5037319/pexels-photo-5037319.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-acompanado-engancha-mas',t:'Correr Acompañado Engancha Más que Solo',c:'Comunidad',i:'https://images.pexels.com/photos/5038843/pexels-photo-5038843.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-en-invierno',t:'Correr en Invierno: Guía Completa',c:'Entrenamiento',i:'https://images.pexels.com/photos/373984/pexels-photo-373984.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-con-sobrepeso',t:'Correr con Sobrepeso: Guía Segura',c:'Salud',i:'https://images.pexels.com/photos/6551282/pexels-photo-6551282.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-antes-o-despues-de-comer',t:'Correr Antes o Después de Comer',c:'Nutrición',i:'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-con-musica-beneficios',t:'Correr con Música: 7 Beneficios',c:'Entrenamiento',i:'https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-con-perro-canicross',t:'Correr con tu Perro: Guía de Canicross',c:'Entrenamiento',i:'https://images.pexels.com/photos/4587996/pexels-photo-4587996.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-durante-menopausia',t:'Correr Durante la Menopausia: Guía Completa',c:'Salud',i:'https://images.pexels.com/photos/3823517/pexels-photo-3823517.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-embarazada-seguro',t:'Correr Embarazada: Guía Segura',c:'Salud',i:'https://images.pexels.com/photos/3823496/pexels-photo-3823496.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-en-verano-calor',t:'Correr en Verano: Guía para el Calor',c:'Entrenamiento',i:'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-en-cinta-vs-calle',t:'Cinta vs Calle: ¿Dónde Es Mejor Correr?',c:'Entrenamiento',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-en-montana-tecnica',t:'Técnica para Correr en Montaña',c:'Trail',i:'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-mejora-salud-mental',t:'Correr Mejora la Salud Mental: La Ciencia',c:'Salud',i:'https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-para-adelgazar',t:'Correr para Adelgazar: Guía Completa',c:'Salud',i:'https://images.pexels.com/photos/6551282/pexels-photo-6551282.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-por-la-noche-consejos',t:'Correr de Noche: 10 Consejos de Seguridad',c:'Entrenamiento',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-solo-vs-acompanado',t:'Correr Solo vs Acompañado',c:'Comunidad',i:'https://images.pexels.com/photos/5038843/pexels-photo-5038843.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'correr-y-gimnasio-mismo-dia',t:'Correr y Gimnasio el Mismo Día',c:'Entrenamiento',i:'https://images.pexels.com/photos/4164517/pexels-photo-4164517.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'creatina-para-runners',t:'Creatina para Runners: ¿Funciona?',c:'Nutrición',i:'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'cuantas-calorias-se-queman-corriendo',t:'¿Cuántas Calorías se Queman Corriendo?',c:'Salud',i:'https://images.pexels.com/photos/7869580/pexels-photo-7869580.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'cuantas-veces-semana-correr',t:'¿Cuántas Veces a la Semana Debo Correr?',c:'Entrenamiento',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'cuanto-duran-zapatillas-running',t:'¿Cuánto Duran las Zapatillas de Running?',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'de-cero-a-5k',t:'De Cero a 5K: Plan para Principiantes',c:'Entrenamiento',i:'https://images.pexels.com/photos/3601094/pexels-photo-3601094.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'desayunos-antes-de-correr',t:'Los Mejores Desayunos Antes de Correr',c:'Nutrición',i:'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'dieta-runner-que-comer',t:'Dieta del Runner: Qué Comer para Rendir',c:'Nutrición',i:'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'dieta-vegetariana-runner',t:'Dieta Vegetariana para Runners',c:'Nutrición',i:'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'dolor-rodilla-al-correr',t:'Dolor de Rodilla al Correr: Causas y Solución',c:'Salud',i:'https://images.pexels.com/photos/3760275/pexels-photo-3760275.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'drop-zapatillas-running',t:'Drop de las Zapatillas de Running: Guía',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'ejercicios-fuerza-piernas-corredores',t:'Ejercicios de Fuerza para Piernas de Corredores',c:'Entrenamiento',i:'https://images.pexels.com/photos/4164517/pexels-photo-4164517.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'ejercicios-gimnasio-para-running',t:'Ejercicios de Gimnasio para Corredores',c:'Entrenamiento',i:'https://images.pexels.com/photos/4164517/pexels-photo-4164517.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'empezar-a-correr-con-verguenza',t:'Empezar a Correr con Vergüenza: Lo Que Nadie Te Dice',c:'Salud',i:'https://images.pexels.com/photos/6551282/pexels-photo-6551282.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'empezar-a-correr-despues-de-los-40',t:'Empezar a Correr Después de los 40',c:'Salud',i:'https://images.pexels.com/photos/3823517/pexels-photo-3823517.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'empezar-a-correr-despues-de-los-50',t:'Empezar a Correr Después de los 50',c:'Salud',i:'https://images.pexels.com/photos/3823517/pexels-photo-3823517.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'empezar-a-correr-despues-de-los-60',t:'Empezar a Correr Después de los 60',c:'Salud',i:'https://images.pexels.com/photos/3823517/pexels-photo-3823517.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'empezar-a-correr-guia-principiantes',t:'Cómo Empezar a Correr: Guía para Principiantes',c:'Entrenamiento',i:'https://images.pexels.com/photos/3601094/pexels-photo-3601094.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'empezar-trail-running',t:'Cómo Empezar en el Trail Running',c:'Trail',i:'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'encontrar-gente-para-correr',t:'Cómo Encontrar Gente para Correr',c:'Comunidad',i:'https://images.pexels.com/photos/5038843/pexels-photo-5038843.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'entrenamiento-cruzado-running',t:'Entrenamiento Cruzado para Runners',c:'Entrenamiento',i:'https://images.pexels.com/photos/4164517/pexels-photo-4164517.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'entrenamiento-de-fuerza-para-corredores',t:'Fuerza para Corredores: Ejercicios y Plan',c:'Entrenamiento',i:'https://images.pexels.com/photos/4164517/pexels-photo-4164517.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'entrenamiento-por-zonas-running',t:'Entrenamiento por Zonas de Frecuencia Cardíaca',c:'Entrenamiento',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'entrenamiento-series-fartlek',t:'Series y Fartlek: Guía Completa de Intervalos',c:'Entrenamiento',i:'https://images.pexels.com/photos/1265952/pexels-photo-1265952.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'entrenamiento-trail-running-plan',t:'Plan de Entrenamiento Trail Running',c:'Trail',i:'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'errores-comunes-corredores',t:'10 Errores Comunes de los Corredores',c:'Entrenamiento',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'estiramientos-antes-despues-correr',t:'Estiramientos Antes y Después de Correr',c:'Entrenamiento',i:'https://images.pexels.com/photos/7869580/pexels-photo-7869580.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'fascitis-plantar-corredores',t:'Fascitis Plantar en Corredores: Guía Completa',c:'Salud',i:'https://images.pexels.com/photos/3760275/pexels-photo-3760275.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'flato-dolor-costado-al-correr',t:'Flato al Correr: Causas y Cómo Evitarlo',c:'Salud',i:'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'foam-rollers-runners',t:'Foam Roller para Runners: Guía de Uso',c:'Equipamiento',i:'https://images.pexels.com/photos/3823517/pexels-photo-3823517.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'gafas-running',t:'Las 8 Mejores Gafas para Running',c:'Equipamiento',i:'https://images.pexels.com/photos/3763869/pexels-photo-3763869.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'garmin-forerunner-265-vs-coros-pace-3',t:'Garmin Forerunner 265 vs COROS Pace 3',c:'Tecnología',i:'https://images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'garmin-forerunner-55-review',t:'Garmin Forerunner 55: Review Completa',c:'Tecnología',i:'https://images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'garmin-venu-3-review',t:'Garmin Venu 3: Review Completa',c:'Tecnología',i:'https://images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'gorras-running',t:'Las 8 Mejores Gorras para Running',c:'Equipamiento',i:'https://images.pexels.com/photos/3763869/pexels-photo-3763869.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'grupos-de-running-guia-completa',t:'Grupos de Running: Guía Completa',c:'Comunidad',i:'https://images.pexels.com/photos/5038843/pexels-photo-5038843.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'grupos-running-madrid',t:'Grupos de Running en Madrid',c:'Comunidad',i:'https://images.pexels.com/photos/3757144/pexels-photo-3757144.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'grupos-running-barcelona',t:'Grupos de Running en Barcelona',c:'Comunidad',i:'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'grupos-running-valencia',t:'Grupos de Running en Valencia',c:'Comunidad',i:'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'grupos-running-bilbao',t:'Grupos de Running en Bilbao',c:'Comunidad',i:'https://images.pexels.com/photos/5038843/pexels-photo-5038843.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'grupos-running-malaga',t:'Grupos de Running en Málaga',c:'Comunidad',i:'https://images.pexels.com/photos/5038843/pexels-photo-5038843.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'grupos-running-zaragoza',t:'Grupos de Running en Zaragoza',c:'Comunidad',i:'https://images.pexels.com/photos/5038843/pexels-photo-5038843.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'hidratacion-running-guia-completa',t:'Hidratación en Running: Guía Completa',c:'Nutrición',i:'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'hierro-para-corredores',t:'Hierro para Corredores: Todo lo que Necesitas',c:'Nutrición',i:'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'hoka-clifton-10-vs-asics-novablast-5',t:'Hoka Clifton 10 vs ASICS Novablast 5',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'hoka-clifton-9-vs-bondi-8',t:'Hoka Clifton 9 vs Bondi 8',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'jbl-reflect-flow-pro-review',t:'JBL Reflect Flow Pro: Review Completa',c:'Tecnología',i:'https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mallas-running',t:'Las 8 Mejores Mallas para Running',c:'Equipamiento',i:'https://images.pexels.com/photos/3763869/pexels-photo-3763869.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'material-trail-running',t:'Material Esencial para Trail Running',c:'Trail',i:'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejor-hora-para-correr',t:'¿Cuál es la Mejor Hora para Correr?',c:'Entrenamiento',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejor-reloj-gps-running-calidad-precio',t:'Mejor Reloj GPS Running Calidad-Precio',c:'Tecnología',i:'https://images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-alimentos-para-runners',t:'Los 15 Mejores Alimentos para Runners',c:'Nutrición',i:'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-apps-running',t:'Las 10 Mejores Apps de Running',c:'Tecnología',i:'https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-auriculares-baratos-running',t:'Mejores Auriculares Baratos para Running',c:'Tecnología',i:'https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-auriculares-running',t:'Los 10 Mejores Auriculares para Correr',c:'Tecnología',i:'https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-geles-energeticos-running',t:'Los 8 Mejores Geles Energéticos para Running',c:'Nutrición',i:'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-garmin-running',t:'Los Mejores Relojes Garmin para Running',c:'Tecnología',i:'https://images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-relojes-gps-running',t:'Los 10 Mejores Relojes GPS para Running',c:'Tecnología',i:'https://images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-zapatillas-on-running',t:'Las Mejores Zapatillas On Running',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-zapatillas-placa-carbono',t:'Las Mejores Zapatillas con Placa de Carbono',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-zapatillas-running',t:'Las 10 Mejores Zapatillas de Running',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-zapatillas-running-asfalto',t:'Mejores Zapatillas Running para Asfalto',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-zapatillas-running-baratas',t:'Las Mejores Zapatillas de Running Baratas',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-zapatillas-running-mujer',t:'Las Mejores Zapatillas de Running para Mujer',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-zapatillas-running-principiantes',t:'Las Mejores Zapatillas para Principiantes',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mejores-zapatillas-trail-running',t:'Las 10 Mejores Zapatillas de Trail Running',c:'Trail',i:'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'mochilas-trail-running',t:'Las 7 Mejores Mochilas para Trail Running',c:'Trail',i:'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'motivacion-para-correr',t:'Motivación para Correr: 12 Trucos',c:'Salud',i:'https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'navegacion-gps-trail-running',t:'Navegación GPS en Trail Running',c:'Trail',i:'https://images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'new-balance-1080-vs-hoka-clifton',t:'New Balance 1080 vs Hoka Clifton',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'nike-pegasus-41-vs-brooks-ghost-16',t:'Nike Pegasus 41 vs Brooks Ghost 16',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'nike-vomero-18-review',t:'Nike Vomero 18: Review Completa',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'no-tengo-con-quien-correr',t:'No Tengo con Quién Correr: Soluciones',c:'Comunidad',i:'https://images.pexels.com/photos/5038843/pexels-photo-5038843.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'nutricion-para-runners',t:'Nutrición para Runners: La Guía Definitiva',c:'Nutrición',i:'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'nutricion-dia-de-carrera',t:'Nutrición el Día de la Carrera',c:'Nutrición',i:'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'nutricion-recuperacion-post-entreno',t:'Nutrición para Recuperación Post-Entrenamiento',c:'Nutrición',i:'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'nutricion-trail-running',t:'Nutrición para Trail Running',c:'Trail',i:'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'periostitis-tibial-running',t:'Periostitis Tibial: Causas y Tratamiento',c:'Salud',i:'https://images.pexels.com/photos/3760275/pexels-photo-3760275.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'plan-entrenamiento-10k',t:'Plan de Entrenamiento 10K',c:'Entrenamiento',i:'https://images.pexels.com/photos/3019696/pexels-photo-3019696.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'plan-entrenamiento-media-maraton',t:'Plan de Entrenamiento Media Maratón',c:'Entrenamiento',i:'https://images.pexels.com/photos/3601094/pexels-photo-3601094.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'plan-maraton-sub-3-30',t:'Plan Maratón Sub 3:30 en 16 Semanas',c:'Entrenamiento',i:'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'plan-maraton-sub-4-horas',t:'Plan Maratón Sub 4 Horas en 16 Semanas',c:'Entrenamiento',i:'https://images.unsplash.com/photo-1590333748338-d629e4564ad9?q=80&w=800&h=500&fit=crop'},
  {s:'periodizacion-entrenamiento-running',t:'Periodización del Entrenamiento Running',c:'Entrenamiento',i:'https://images.pexels.com/photos/2827392/pexels-photo-2827392.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'polar-pacer-pro-review',t:'Polar Pacer Pro: Review Completa',c:'Tecnología',i:'https://images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'potencia-en-running',t:'Potencia en Running: Qué Es y Cómo Usarla',c:'Entrenamiento',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'prevenir-lesiones-running',t:'Cómo Prevenir Lesiones en el Running',c:'Salud',i:'https://images.pexels.com/photos/3760275/pexels-photo-3760275.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'psicologia-del-corredor',t:'Psicología del Corredor: Mente y Running',c:'Salud',i:'https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'puedo-correr-todos-los-dias',t:'¿Puedo Correr Todos los Días?',c:'Entrenamiento',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'que-comer-antes-de-correr',t:'Qué Comer Antes de Correr',c:'Nutrición',i:'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'que-comer-despues-de-correr',t:'Qué Comer Después de Correr',c:'Nutrición',i:'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'que-gel-energetico-usar-maraton',t:'Qué Gel Energético Usar en Maratón',c:'Nutrición',i:'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'recetas-runners-rapidas',t:'10 Recetas Rápidas para Runners',c:'Nutrición',i:'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'rodilla-del-corredor',t:'Rodilla del Corredor: Síntomas y Tratamiento',c:'Salud',i:'https://images.pexels.com/photos/3760275/pexels-photo-3760275.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'rodillo-vs-pistola-masaje-recuperacion',t:'Foam Roller vs Pistola de Masaje',c:'Equipamiento',i:'https://images.pexels.com/photos/3823517/pexels-photo-3823517.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'ropa-correr-segun-temperatura',t:'Ropa para Correr Según la Temperatura',c:'Equipamiento',i:'https://images.pexels.com/photos/3763869/pexels-photo-3763869.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'ropa-tecnica-running',t:'Ropa Técnica de Running: Guía Completa',c:'Equipamiento',i:'https://images.pexels.com/photos/3763869/pexels-photo-3763869.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'salomon-speedcross-6-vs-hoka-speedgoat-6',t:'Salomon Speedcross 6 vs Hoka Speedgoat 6',c:'Trail',i:'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'seguridad-correr-con-desconocidos',t:'Seguridad al Correr con Desconocidos',c:'Comunidad',i:'https://images.pexels.com/photos/5038843/pexels-photo-5038843.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'seguridad-trail-running',t:'Seguridad en Trail Running',c:'Trail',i:'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'shokz-openrun-pro-2-review',t:'Shokz OpenRun Pro 2: Review Completa',c:'Tecnología',i:'https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'smartwatch-vs-reloj-gps-running',t:'Smartwatch vs Reloj GPS para Running',c:'Tecnología',i:'https://images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'sobreentrenamiento-running-sintomas',t:'Sobreentrenamiento en Running: Síntomas',c:'Salud',i:'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'soledad-del-runner',t:'La Soledad del Runner: Cómo Combatirla',c:'Comunidad',i:'https://images.pexels.com/photos/5038843/pexels-photo-5038843.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'tapering-semana-previa-carrera',t:'Tapering: Guía de la Semana Previa a tu Carrera',c:'Entrenamiento',i:'https://images.pexels.com/photos/7187803/pexels-photo-7187803.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'tendinitis-aquiles-running',t:'Tendinitis de Aquiles en Runners',c:'Salud',i:'https://images.pexels.com/photos/3760275/pexels-photo-3760275.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'triatlon-para-runners-principiantes',t:'Triatlón para Runners Principiantes',c:'Entrenamiento',i:'https://images.pexels.com/photos/3601094/pexels-photo-3601094.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'ultra-trail-principiantes',t:'Ultra Trail para Principiantes: Guía',c:'Trail',i:'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'variabilidad-cardiaca-running',t:'Variabilidad de la Frecuencia Cardíaca en Running',c:'Entrenamiento',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'vo2-max-running-como-mejorar',t:'VO2 Max en Running: Cómo Mejorarlo',c:'Entrenamiento',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'volver-a-correr-despues-de-lesion',t:'Volver a Correr Después de una Lesión',c:'Salud',i:'https://images.pexels.com/photos/3760275/pexels-photo-3760275.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'volver-a-correr-tras-pausa-larga',t:'Volver a Correr tras una Pausa Larga',c:'Salud',i:'https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'yoga-para-corredores',t:'Yoga para Corredores: 10 Posturas Esenciales',c:'Entrenamiento',i:'https://images.pexels.com/photos/7869580/pexels-photo-7869580.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'zapatillas-running-media-maraton',t:'Mejores Zapatillas para Media Maratón',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'zapatillas-running-pisada-neutra',t:'Mejores Zapatillas Running Pisada Neutra',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'zapatillas-running-pronadores',t:'Mejores Zapatillas para Pronadores',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'zapatillas-running-supinadores',t:'Mejores Zapatillas para Supinadores',c:'Zapatillas',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'zona-2-running-quemar-grasa',t:'Zona 2: El Secreto para Quemar Grasa Corriendo',c:'Entrenamiento',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
  {s:'calendario-carreras-populares-2026',t:'Calendario de Carreras Populares 2026',c:'Carreras',i:'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop&q=80'},
];

// ── Tableros por categoría ───────────────────────────────────────────────────
const BOARDS_CONFIG = {
  'Entrenamiento': { name: 'Entrenamiento Running 🏃', description: 'Planes, técnica y consejos de entrenamiento para corredores de todos los niveles. CorrerJuntos.com' },
  'Salud':         { name: 'Salud y Running 💪',       description: 'Lesiones, recuperación, salud mental y bienestar para runners. CorrerJuntos.com' },
  'Nutrición':     { name: 'Nutrición para Runners 🥗', description: 'Qué comer antes, durante y después de correr. Suplementos, hidratación y dietas para runners. CorrerJuntos.com' },
  'Zapatillas':    { name: 'Zapatillas Running 👟',     description: 'Reviews, comparativas y guías para elegir las mejores zapatillas de running. CorrerJuntos.com' },
  'Tecnología':    { name: 'Tecnología Running ⌚',     description: 'Relojes GPS, auriculares y gadgets para corredores. Reviews y comparativas. CorrerJuntos.com' },
  'Equipamiento':  { name: 'Equipamiento Running 🎽',   description: 'Ropa, accesorios y material imprescindible para correr. CorrerJuntos.com' },
  'Trail':         { name: 'Trail Running 🏔️',          description: 'Guías, técnica, material y carreras de trail running para todos los niveles. CorrerJuntos.com' },
  'Comunidad':     { name: 'Comunidad Running 👥',      description: 'Grupos de running, quedadas y cómo encontrar compañeros para correr. CorrerJuntos.com' },
  'Carreras':      { name: 'Carreras y Maratones 🏅',   description: 'Guías de maratones, calendarios de carreras y consejos para el día de la competición. CorrerJuntos.com' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.pinterest.com',
      path: `/v5${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(json)}`));
          else resolve(json);
        } catch {
          reject(new Error(`Parse error: ${raw}`));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 CorrerJuntos Pinterest Bulk Pinner`);
  console.log(`📌 ${ARTICLES.length} artículos a pinear\n`);

  // 1. Crear tableros
  console.log('📋 Creando tableros...');
  const boardIds = {};

  for (const [cat, cfg] of Object.entries(BOARDS_CONFIG)) {
    try {
      const board = await apiRequest('POST', '/boards', {
        name: cfg.name,
        description: cfg.description,
        privacy: 'PUBLIC',
      });
      boardIds[cat] = board.id;
      console.log(`  ✅ Tablero creado: ${cfg.name} (${board.id})`);
      await sleep(1000);
    } catch (err) {
      console.error(`  ❌ Error creando tablero ${cat}: ${err.message}`);
    }
  }

  console.log(`\n📌 Creando pins (${ARTICLES.length} artículos, ~${Math.ceil(ARTICLES.length * DELAY_MS / 60000)} min estimados)...\n`);

  let ok = 0, fail = 0;

  for (let i = 0; i < ARTICLES.length; i++) {
    const art = ARTICLES[i];
    const boardId = boardIds[art.c];

    if (!boardId) {
      console.warn(`  ⚠️  Sin tablero para categoría "${art.c}" — ${art.s}`);
      fail++;
      continue;
    }

    // Asegurar imagen absoluta
    const imgUrl = art.i.startsWith('http') ? art.i : `${BASE_URL}${art.i}`;

    try {
      await apiRequest('POST', '/pins', {
        board_id: boardId,
        title: art.t,
        description: `${art.t} — Guía completa para runners en CorrerJuntos.com. Consejos, planes y trucos para mejorar tu running.`,
        link: `${BASE_URL}/blog/${art.s}`,
        media_source: {
          source_type: 'image_url',
          url: imgUrl,
        },
      });
      ok++;
      console.log(`  [${i+1}/${ARTICLES.length}] ✅ ${art.t}`);
    } catch (err) {
      fail++;
      console.error(`  [${i+1}/${ARTICLES.length}] ❌ ${art.t}: ${err.message}`);
    }

    if (i < ARTICLES.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\n🏁 Listo. ✅ ${ok} pins creados, ❌ ${fail} errores.`);
  console.log(`👉 Ver resultado: https://es.pinterest.com/correrjuntos/\n`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
