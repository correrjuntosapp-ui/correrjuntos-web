#!/usr/bin/env node
/**
 * pinterest-playwright.cjs
 * Usa widget URL de Pinterest (imagen+link pre-rellenados) para crear pins.
 * Uso: node tools/pinterest-playwright.cjs --email EMAIL --pass PASS
 *      node tools/pinterest-playwright.cjs --email EMAIL --pass PASS --from N
 */
'use strict';

const { chromium } = require('playwright');
const readline = require('readline');
const path = require('path');

const https = require('https');
const http  = require('http');

// Descarga una imagen a buffer en memoria
const downloadImage = (url) => new Promise((resolve, reject) => {
  const mod = url.startsWith('https') ? https : http;
  mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return downloadImage(res.headers.location).then(resolve).catch(reject);
    }
    const chunks = [];
    res.on('data', c => chunks.push(c));
    res.on('end', () => resolve(Buffer.concat(chunks)));
    res.on('error', reject);
  }).on('error', reject);
});

const args = process.argv.slice(2);
const getArg = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i+1] : null; };
const START_FROM = parseInt(getArg('--from') || '0', 10);
const EMAIL = getArg('--email') || '';
const PASS  = getArg('--pass')  || '';

const waitForEnter = (msg) => new Promise(resolve => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(msg, () => { rl.close(); resolve(); });
});
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const BASE  = 'https://www.correrjuntos.com';
const DELAY = 7000;

const ARTICLES = [
  {s:"agujetas-despues-de-correr",t:"Agujetas Después de Correr: Cómo Aliviarlas Rápido",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"alimentos-antiinflamatorios-runners",t:"15 Alimentos Antiinflamatorios para Runners 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"alimentos-sin-gluten-para-corredores",t:"Alimentos Sin Gluten para Corredores: Guía 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"andar-vs-correr",t:"Andar vs Correr: ¿Qué Quema Más Grasa en 2026?",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"ansiedad-pre-carrera",t:"Ansiedad Pre-Carrera: 8 Técnicas que Funcionan",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"apple-watch-running-review",t:"Apple Watch Running 2026: Análisis para Corredores",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"apps-correr-en-grupo",t:"Mejores Apps para Correr en Grupo en España 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"asics-gel-nimbus-26-vs-nike-pegasus-41",t:"ASICS Nimbus 26 vs Nike Pegasus 41: Comparativa 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"asics-novablast-5-opinion",t:"ASICS Novablast 5 Opinión 2026: Análisis Completo tras 400 km",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"auriculares-conduccion-osea-vs-in-ear-running",t:"Auriculares Ósea vs In-Ear para Correr: Guía 2026",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"auriculares-running-natacion",t:"7 Mejores Auriculares Running y Natación 2026",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"ayuno-intermitente-running",t:"Ayuno Intermitente y Running: Guía Completa 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"bastones-trail-running",t:"10 Mejores Bastones Trail Running 2026: Guía",c:"Trail Running",i:"https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"beneficios-correr-en-grupo",t:"12 Beneficios de Correr en Grupo Respaldados 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"beneficios-de-correr",t:"20 Beneficios de Correr Probados por la Ciencia 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"bidones-running",t:"10 Mejores Bidones para Running 2026: Guía",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"cadencia-running-ideal",t:"Cadencia en Running: Cuál es la Ideal y Cómo Mejorarla 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"cafeina-running-rendimiento",t:"Cafeína y Running: Cómo Mejora tu Rendimiento",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"calambres-al-correr",t:"Calambres al Correr: Causas y 7 Soluciones Rápidas",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"calcetines-running",t:"10 Mejores Calcetines Running 2026: Guía Completa",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"calendario-carreras-populares-2026",t:"Carreras Populares 2026 España: Calendario Completo",c:"Carreras Running",i:"https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"calentamiento-media-maraton",t:"Calentamiento para Media Maratón: Rutina de 20 Minutos el Día de la Carrera",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"carga-hidratos-maraton",t:"Carga de Hidratos para Maratón: Guía 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"carreras-nocturnas-espana",t:"Carreras Nocturnas en España 2026: Calendario, Consejos y Mejores Eventos",c:"Carreras Running",i:"https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"carreras-trail-principiantes",t:"Carreras Trail para Principiantes: Guía 2026",c:"Trail Running",i:"https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"chalecos-hidratacion-running",t:"10 Mejores Chalecos Hidratación Running 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"chubasqueros-running",t:"10 Mejores Chubasqueros Running 2026: Ligeros",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"cinturones-running",t:"10 Mejores Cinturones Running 2026: Comparativa",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"como-aumentar-resistencia-corriendo",t:"Aumentar Resistencia Corriendo: 7 Claves 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"como-calentar-antes-de-correr",t:"Calentar Antes de Correr: Rutina Completa 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"como-correr-mas-rapido",t:"Correr Más Rápido: 12 Claves para tu Ritmo 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"como-crear-habito-de-correr",t:"Crear el Hábito de Correr: De 0 a Runner 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"como-elegir-reloj-gps-running",t:"Elegir Reloj GPS Running: Guía Completa 2026",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"como-elegir-zapatillas-running",t:"Elegir Zapatillas Running según Pisada 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"como-evitar-problemas-digestivos-correr",t:"Problemas Digestivos al Correr: Cómo Evitarlos 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"como-mantener-motivacion-para-correr",t:"Motivación para Correr: 15 Estrategias 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"como-organizar-quedadas-running",t:"Organizar Quedadas Running: Guía Paso a Paso 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"como-pasar-de-running-a-triatlon",t:"Cómo Pasar de Running a Triatlón: Guía de Transición para Runners 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"como-preparar-primera-carrera-5k",t:"Primera Carrera 5K: Plan de 6 Semanas 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"como-preparar-primera-media-maraton",t:"Cómo Preparar tu Primera Media Maratón 2026: Guía Completa",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"como-respirar-al-correr",t:"Respirar al Correr: Técnica Correcta 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"conocer-gente-haciendo-deporte",t:"Conocer Gente Haciendo Deporte: 10 Ideas 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"core-para-runners",t:"Core para Runners: 10 Ejercicios + Rutina 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"coros-pace-3-review",t:"COROS PACE 3 Review 2026: Mejor GPS Calidad-Precio",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-acompanado-cadiz",t:"Correr Acompañado en Cádiz: Grupos y Rutas 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-acompanado-engancha-mas",t:"Correr Acompañado Engancha Más: La Ciencia 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-antes-o-despues-de-comer",t:"Correr Antes o Después de Comer: Guía 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-con-70-anos",t:"Correr con 70 Años: Guía Completa para Runners Senior 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-con-diabetes",t:"Correr con Diabetes: Guía Completa para Runners con Tipo 1 y Tipo 2 (2026)",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-con-musica-beneficios",t:"Correr con Música: Beneficios y BPM Ideal 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-con-perro-canicross",t:"Canicross: Correr con Perro, Guía Completa 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-con-sobrepeso",t:"Correr con Sobrepeso: Guía Segura 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-durante-menopausia",t:"Correr y Menopausia: Guía Completa 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-embarazada-seguro",t:"Correr Embarazada: Guía Segura por Trimestre 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-en-ayunas",t:"Correr en Ayunas 2026: Beneficios, Riesgos y Cómo Hacerlo Bien",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-en-cinta-vs-calle",t:"Cinta vs Calle: Diferencias para Corredores 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-en-invierno",t:"Correr en Invierno: Guía Completa 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-en-montana-tecnica",t:"Trail Running: Técnica de Subida y Bajada 2026",c:"Trail Running",i:"https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-en-verano-calor",t:"Correr en Verano con Calor: Guía Segura 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-es-social-tendencia",t:"Running Social: La Tendencia Fitness de 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-mejora-salud-mental",t:"Correr y Salud Mental 2026: Beneficios Científicos",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-para-adelgazar",t:"Correr para Adelgazar: Plan 12 Semanas 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-por-la-noche-consejos",t:"Correr de Noche: 10 Consejos de Seguridad 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-solo-vs-acompanado",t:"Correr Solo vs Acompañado: Pros y Contras 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correr-y-gimnasio-mismo-dia",t:"Correr y Gimnasio el Mismo Día: Guía 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correrjuntos-vs-meetup-running",t:"CorrerJuntos vs Meetup Running: Comparativa 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"correrjuntos-vs-strava-grupos",t:"CorrerJuntos vs Strava Grupos: Comparativa 2026",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"creatina-para-runners",t:"Creatina para Runners: 7 Beneficios en 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"cross-training-running",t:"Cross-Training Running: 8 Deportes Complementarios 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"cuantas-calorias-se-queman-corriendo",t:"Calorías Corriendo: Calculadora y Tablas 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"cuantas-veces-semana-correr",t:"Cuántas Veces Correr a la Semana según Nivel 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"cuanto-duran-zapatillas-running",t:"Duración Zapatillas Running: Km y Señales 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"cuanto-tardo-en-correr-5km",t:"Tiempo Medio 5K por Edad y Nivel 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"cursa-de-la-merce-2026",t:"Cursa de la Mercè 2026 Barcelona: Fecha, Recorrido e Inscripción",c:"Carreras Running",i:"https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"de-cero-a-5k",t:"De Cero a 5K: Plan 8 Semanas Principiantes 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"deka-fit-vs-deka-strong",t:"DEKA FIT vs DEKA STRONG: Comparativa 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"desayunos-antes-de-correr",t:"8 Desayunos Antes de Correr: Guía 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"dieta-runner-que-comer",t:"Dieta Runner: Qué Comer para Correr Mejor 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"dieta-vegetariana-runner",t:"Dieta Vegetariana Runner: Guía Completa 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"diferencia-zapatillas-running-normales",t:"Zapatillas Running vs Normales: 5 Diferencias 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"diferencias-trail-vs-asfalto",t:"Trail Running vs Asfalto: Comparativa 2026",c:"Trail Running",i:"https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"dolor-rodilla-al-correr",t:"Dolor Rodilla al Correr: 6 Causas y Soluciones 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"drop-zapatillas-running",t:"Drop Zapatillas Running: Qué Es y Cuál Elegir 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"duatlon-principiantes-guia",t:"Duatlón para Principiantes: Guía Completa para Runners 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"ejercicios-fuerza-piernas-corredores",t:"Fuerza Piernas Corredores: 12 Ejercicios 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"ejercicios-gimnasio-para-running",t:"12 Ejercicios Gimnasio para Runners: Guía 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"empezar-a-correr-con-verguenza",t:"Empezar a Correr con Vergüenza: Plan 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"empezar-a-correr-despues-de-los-40",t:"Empezar a Correr a los 40: Guía Segura 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"empezar-a-correr-despues-de-los-50",t:"Empezar a Correr a los 50: Guía Completa 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"empezar-a-correr-despues-de-los-60",t:"Empezar a Correr con 60 Años: Guía 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"empezar-a-correr-guia-principiantes",t:"Empezar a Correr desde Cero: Guía + Plan 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"empezar-trail-running",t:"Empezar Trail Running: Guía Principiantes 2026",c:"Trail Running",i:"https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"encontrar-companeros-running-cerca",t:"Encontrar Compañeros Running Cerca de Ti 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"encontrar-gente-para-correr",t:"Encontrar Gente para Correr Cerca: 6 Métodos 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"encontrar-runners-malaga",t:"Runners Málaga: Grupos y Rutas Running 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"entrenamiento-cruzado-running",t:"Entrenamiento Cruzado Running: Guía 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"entrenamiento-de-fuerza-para-corredores",t:"Fuerza para Corredores: Ejercicios y Plan 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"entrenamiento-fuerza-corredores",t:"Fuerza Runners: Rutina y Ejercicios 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"entrenamiento-por-zonas-running",t:"Zonas Entrenamiento Running: FC y Potencia 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"entrenamiento-series-fartlek",t:"Series y Fartlek Running: Guía Intervalos 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"entrenamiento-trail-running-plan",t:"Plan Trail Running 12 Semanas: Asfalto a Montaña 2026",c:"Trail Running",i:"https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"entrenar-skierg-row-hyrox",t:"SkiErg y Remo HYROX: Técnica y Plan 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"errores-comunes-corredores",t:"10 Errores Comunes Corredores y Cómo Evitarlos 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"errores-principiante-running",t:"7 Errores Principiante Running que Nadie Cuenta 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"estiramientos-antes-despues-correr",t:"Estiramientos Antes y Después de Correr 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"estiramientos-post-carrera",t:"Estiramientos Post-Carrera: 10 Ejercicios 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"estrategia-carrera-media-maraton",t:"Estrategia de Carrera en Media Maratón: Ritmo, Pacing y Cómo Llegar al Final",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"fascitis-plantar-corredores",t:"Fascitis Plantar Corredores: Tratamiento 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"flato-dolor-costado-al-correr",t:"Flato al Correr: Causas y Cómo Eliminarlo 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"foam-rollers-runners",t:"7 Mejores Foam Rollers Running 2026",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"gafas-running",t:"8 Mejores Gafas Running 2026: Comparativa",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"garmin-forerunner-265-vs-coros-pace-3",t:"Garmin 265 vs COROS PACE 3: Comparativa 2026",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"garmin-forerunner-55-review",t:"Garmin Forerunner 55 Review: Análisis 2026",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"garmin-venu-3-review",t:"Garmin Venu 3 Review Running: Análisis 2026",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"geles-media-maraton",t:"Cuántos Geles Tomar en una Media Maratón: Guía Práctica 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"gorras-running",t:"Las 8 Mejores Gorras para Running 2026",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"grupos-correr-sevilla",t:"Grupos para Correr en Sevilla: Guía Completa 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"grupos-de-running-guia-completa",t:"Grupos de Running: Guía Completa para Encontrar tu Grupo Ideal en 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"grupos-running-barcelona",t:"Grupos de Running en Barcelona: Los Mejores Grupos para Correr en 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"grupos-running-bilbao",t:"Grupos de Running en Bilbao 2026: Clubes, Quedadas y Rutas",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"grupos-running-madrid-principiantes",t:"Grupos de Running en Madrid para Principiantes: Guía 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"grupos-running-madrid",t:"Grupos de Running en Madrid: Los 15 Mejores Grupos para Correr en 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"grupos-running-malaga",t:"Grupos de Running en Málaga 2026: Clubes y Quedadas",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"grupos-running-valencia",t:"Grupos de Running en Valencia: Los Mejores Grupos para Correr en 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"grupos-running-zaragoza",t:"Grupos de Running en Zaragoza 2026: Clubes, Quedadas y Rutas",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"hidratacion-media-maraton",t:"Hidratación en Media Maratón: Cuánto Beber y Cuándo para No Perder Tiempo ni Rendimiento",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"hidratacion-running-guia-completa",t:"Hidratación Running 2026: Cuánto Beber por Km",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"hierro-para-corredores",t:"Hierro para Corredores 2026: Evita la Anemia del Runner",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"hoka-clifton-10-vs-asics-novablast-5",t:"Hoka Clifton 10 vs Novablast 5: Review 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"hoka-clifton-9-vs-bondi-8",t:"Hoka Clifton 9 vs Bondi 8: Comparativa 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"hyrox-principiantes-guia",t:"HYROX Principiantes 2026: Guía para Tu Primera Carrera",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"hyrox-vs-deka-fit",t:"HYROX vs DEKA FIT 2026: Diferencias y Cuál Elegir",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"jbl-reflect-flow-pro-review",t:"JBL Reflect Flow Pro: Review Running 2026",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"kettlebells-farmer-carry-hyrox",t:"11 Mejores Kettlebells Farmer Carry HYROX 2026",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"lamparas-frontales-running",t:"7 Mejores Lámparas Frontales Running 2026",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mallas-running",t:"10 Mejores Mallas Running 2026: Hombre y Mujer",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"maraton-barcelona-guia",t:"Maratón Barcelona 2026: Inscripción y Recorrido",c:"Carreras Running",i:"https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"maraton-madrid-guia",t:"Maratón Madrid 2026: Inscripción y Recorrido",c:"Carreras Running",i:"https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"maraton-sevilla-guia",t:"Maratón Sevilla 2026: Inscripción y Recorrido",c:"Carreras Running",i:"https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"maraton-valencia-guia",t:"Maratón Valencia 2026: Inscripción y Recorrido",c:"Carreras Running",i:"https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"material-trail-running",t:"Material Trail Running 2026: Guía de Equipamiento",c:"Trail Running",i:"https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"media-maraton-barcelona-2026",t:"Mitja Marató de Barcelona 2026: Guía Completa + Inscripción",c:"Carreras Running",i:"https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"media-maraton-madrid-2026",t:"EDP Media Maratón de Madrid 2026: Guía Completa + Inscripción",c:"Carreras Running",i:"https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"media-maraton-sevilla-2026",t:"Media Maratón de Sevilla 2026: Guía Completa + Inscripción",c:"Carreras Running",i:"https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"media-maraton-valencia-2026",t:"Media Maratón Valencia 2026 (Trinitat Nogera): La Más Rápida de España",c:"Carreras Running",i:"https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejor-hora-para-correr",t:"Mejor Hora para Correr 2026: Mañana vs Noche",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejor-reloj-gps-running-calidad-precio",t:"Mejor Reloj GPS Running Calidad-Precio 2026",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-alimentos-para-runners",t:"20 Mejores Alimentos para Runners 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-apps-running",t:"10 Mejores Apps para Correr 2026: Análisis",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-auriculares-baratos-running",t:"8 Mejores Auriculares Baratos Running 2026 (<60€)",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-auriculares-running",t:"Mejores Auriculares Running 2026: Guía Completa",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-bandas-elasticas-running",t:"12 Mejores Bandas Elásticas para Runners 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-bastones-trail-running",t:"10 Mejores Bastones Trail Running 2026",c:"Trail Running",i:"https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-bcaas-runners",t:"8 Mejores BCAAs para Runners 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-bebidas-hidratacion-running",t:"10 Mejores Bebidas Deportivas para Maratón 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-calleras-crossfit",t:"10 Mejores Calleras CrossFit 2026: Comparativa",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-colagenos-runners",t:"8 Mejores Colágenos para Runners 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-creatinas-running",t:"10 Mejores Creatinas para Running 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-garmin-running",t:"8 Mejores Relojes Garmin Running 2026",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-geles-energeticos-running",t:"Geles Energéticos Running 2026: Cuándo y Cuántos",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-magnesios-runners",t:"8 Mejores Magnesios para Runners 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-multivitaminicos-runners",t:"8 Mejores Multivitamínicos para Runners 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-omega-3-runners",t:"10 Mejores Omega 3 para Runners 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-proteinas-running",t:"10 Mejores Proteínas para Running 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-pulsometros-running-2026",t:"10 Mejores Pulsómetros Running 2026 — Cintas y Brazaletes",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-recuperadores-running",t:"Recuperación Muscular Running 2026: Guía Completa",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-relojes-gps-running",t:"8 Mejores Relojes GPS Running 2026 — Comparativa Completa",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-rutas-correr-barcelona",t:"10 Mejores Rutas para Correr en Barcelona 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-rutas-correr-madrid",t:"10 Mejores Rutas para Correr en Madrid 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-rutas-correr-malaga",t:"10 Mejores Rutas para Correr en Málaga 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-rutas-correr-sevilla",t:"10 Mejores Rutas para Correr en Sevilla 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-rutas-correr-valencia",t:"10 Mejores Rutas para Correr en Valencia 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-superficies-para-correr",t:"Mejores Superficies para Correr 2026: Comparativa",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-suplementos-runners",t:"Mejores Suplementos para Runners 2026: Creatina, Geles, Magnesio",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-zapatillas-hyrox",t:"Mejores Zapatillas HYROX 2026: Comparativa",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-zapatillas-on-running",t:"10 Mejores Zapatillas On Running 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-zapatillas-placa-carbono",t:"10 Mejores Zapatillas Placa de Carbono 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-zapatillas-running-asfalto",t:"10 Mejores Zapatillas Running Asfalto 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-zapatillas-running-baratas",t:"Zapatillas Running Baratas 2026: 8 Mejores (<100€)",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-zapatillas-running-mujer",t:"10 Mejores Zapatillas Running Mujer 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-zapatillas-running-principiantes",t:"Zapatillas Running Principiantes 2026: 6 Mejores",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-zapatillas-running-sobrepeso",t:"Zapatillas Running Sobrepeso 2026: 7 Mejores (+80kg)",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-zapatillas-running",t:"10 Mejores Zapatillas Running 2026: Guía Definitiva",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mejores-zapatillas-trail-running",t:"10 Mejores Zapatillas Trail Running 2026: Análisis Profesional",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"mochilas-trail-running",t:"8 Mejores Mochilas Trail Running 2026",c:"Trail Running",i:"https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"motivacion-para-correr",t:"Motivación para Correr 2026: 10 Trucos Efectivos",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"navegacion-gps-trail-running",t:"Navegación GPS Trail Running 2026: Relojes y Apps",c:"Trail Running",i:"https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"new-balance-1080-vs-hoka-clifton",t:"New Balance 1080 vs Hoka Clifton: Comparativa 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"nike-pegasus-41-vs-brooks-ghost-16",t:"Nike Pegasus 41 vs Brooks Ghost 16: Comparativa 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"nike-vomero-18-review",t:"Nike Vomero 18 Review 2026: Análisis Completo tras 300 km",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"no-tengo-con-quien-correr",t:"No Tengo con Quién Correr: 5 Soluciones 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"nutricion-dia-de-carrera",t:"Nutrición Día de Carrera 2026: Qué Comer",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"nutricion-para-runners",t:"Nutrición para Runners 2026: Guía Completa",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"nutricion-recuperacion-post-entreno",t:"Nutrición Post-Entreno Running 2026: Qué Comer",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"nutricion-trail-running",t:"Nutrición Trail Running 2026: Guía Completa",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"pack-basico-running-principiantes",t:"Pack Básico Running Principiantes 2026",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"periodizacion-entrenamiento-running",t:"Periodización Entrenamiento Running 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"periostitis-tibial-running",t:"Periostitis Tibial Running: Causas y Tratamiento 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"plan-10k-sub-45-minutos",t:"Plan 10K Sub 45 Minutos en 10 Semanas: Para Runners Intermedios",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"plan-10k-sub-60-minutos",t:"Plan 10K Sub 60 Minutos en 8 Semanas: Guía Completa",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"plan-entrenamiento-10k",t:"Plan Entrenamiento 10K: 8 Semanas Principiantes 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"plan-entrenamiento-5k-sub-25",t:"Plan de Entrenamiento 5K Sub-25 Minutos: 8 Semanas para Bajar de 25:00 (2026)",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"plan-entrenamiento-media-maraton",t:"Plan Entrenamiento Media Maratón 12 Semanas 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"plan-maraton-sub-3-30",t:"Plan Maratón Sub 3:30 en 16 Semanas 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"plan-maraton-sub-4-horas",t:"Plan Maratón Sub 4 Horas en 16 Semanas 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"plan-media-maraton-principiantes",t:"Plan Media Maratón para Principiantes: Tu Primera 21K en 16 Semanas",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"plan-media-maraton-sub-1-30",t:"Plan Media Maratón Sub 1h30: Entrenamiento de Alto Rendimiento 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"plan-media-maraton-sub-1-45",t:"Plan Media Maratón Sub 1:45 — 12 Semanas para Bajar de 1 Hora 45",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"plan-media-maraton-sub-2-horas",t:"Plan Media Maratón Sub 2 Horas en 12 Semanas 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"plan-running-perder-peso",t:"Correr para Adelgazar: Plan 12 Semanas 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"polar-pacer-pro-review",t:"Polar Pacer Pro Review 2026: Análisis Completo",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"por-que-dejan-correr-3-meses",t:"Por Qué Dejan de Correr a los 3 Meses (y Cómo Evitarlo)",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"potencia-en-running",t:"Potencia en Running: Vatios, Stryd y Zonas 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"prevenir-lesiones-running",t:"Prevenir Lesiones Running: 10 Claves Esenciales 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"primera-carrera-10k-consejos",t:"Tu Primera Carrera de 10K: 15 Consejos para no Arrepentirte el Día D",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"primera-carrera-10k-guia",t:"Tu Primera Carrera de 10K: Guía Completa para Principiantes 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"primera-media-maraton-consejos",t:"Tu Primera Media Maratón: 20 Consejos de Quien Ya Ha Corrido Más de 10",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"primera-quedada-running",t:"Primera Quedada Running: Qué Llevar y Cómo Prepararte",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"proteinas-para-runners",t:"Proteínas para Runners: Cuánta Necesitas en 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"psicologia-del-corredor",t:"Psicología del Corredor: Motivación y Muro Mental 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"puedo-correr-todos-los-dias",t:"Correr Todos los Días: Beneficios y Riesgos 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"que-comer-antes-10k",t:"Qué Comer Antes de Correr un 10K: Desayuno y Cena Previa",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"que-comer-antes-de-correr",t:"Qué Comer Antes de Correr: Guía por Distancia 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"que-comer-antes-media-maraton",t:"Qué Comer Antes de una Media Maratón: La Noche Antes y el Día de la Carrera",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"que-comer-despues-de-correr",t:"Qué Comer Después de Correr: Recupera en 30 Min",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"que-gel-energetico-usar-maraton",t:"Geles Energéticos Maratón: Cuál Elegir 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"que-zapatillas-running-comprar-segun-nivel",t:"Zapatillas Running Según tu Nivel: Guía 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"quedadas-correr-barcelona",t:"Quedadas Correr Barcelona: Grupos y Rutas 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"quedadas-running-como-organizar",t:"Quedadas Running: Cómo Organizar y Encontrar 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"recetas-runners-rapidas",t:"Recetas Rápidas para Runners: 10 Comidas en 15 Min",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"recuperar-ganas-de-correr",t:"Recuperar Ganas de Correr: 7 Claves que Funcionan",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"ritmo-10k-calculadora",t:"Calculadora de Ritmo 10K — Tiempo Objetivo a Paso por Kilómetro",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"ritmo-media-maraton-calculadora",t:"Calculadora de Ritmo Media Maratón: Tiempo Objetivo a Paso por Kilómetro",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"ritmo-para-principiantes-running",t:"Ritmo para Principiantes Running: Guía de Pace 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"rodilla-del-corredor",t:"Rodilla del Corredor: Causas, Ejercicios y Cura 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"rodillo-vs-pistola-masaje-recuperacion",t:"Rodillo vs Pistola Masaje: Cuál Comprar 2026",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"ropa-correr-segun-temperatura",t:"Ropa para Correr Según Temperatura: Guía 2026",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"ropa-media-maraton-que-llevar",t:"Qué Ropa Llevar en una Media Maratón: Equipación Completa Según el Tiempo",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"ropa-tecnica-running",t:"Ropa Técnica Running 2026: Guía de Capas y Tejidos",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"running-social-revolucion-2026",t:"Running Social 2026: Por Qué Correr en Grupo Arrasa",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"running-y-suelo-pelvico",t:"Running y Suelo Pélvico: Guía Completa para Corredoras 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"salomon-speedcross-6-vs-hoka-speedgoat-6",t:"Speedcross 6 vs Speedgoat 6: Comparativa Trail 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"san-silvestre-vallecana-guia",t:"San Silvestre Vallecana 2026: Inscripción y Recorrido",c:"Carreras Running",i:"https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"sandbag-lunges-hyrox",t:"Sandbag Lunges HYROX: 11 Mejores Sacos de Arena 2026",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"seguridad-correr-con-desconocidos",t:"Seguridad al Correr con Desconocidos: 10 Consejos",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"seguridad-trail-running",t:"Seguridad Trail Running: 10 Reglas en Montaña 2026",c:"Trail Running",i:"https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"shokz-openrun-pro-2-review",t:"Shokz OpenRun Pro 2 Review: Análisis Running 2026",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"smartwatch-vs-reloj-gps-running",t:"Smartwatch vs Reloj GPS Running: Cuál Elegir 2026",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"snacks-energeticos-running",t:"Snacks Energéticos Running: Los Mejores Probados 2026",c:"Nutrición Running",i:"https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"sobreentrenamiento-running-sintomas",t:"Sobreentrenamiento Running: 12 Síntomas + Plan de Recuperación 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"soft-flasks-running",t:"Soft Flask Running: 8 Mejores Bidones Blandos 2026",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"soledad-del-runner",t:"Soledad del Runner: Cómo Superarla Corriendo en Grupo",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"strava-vs-garmin-connect",t:"Strava vs Garmin Connect 2026: Cuál Elegir",c:"Tecnología Running",i:"https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"tapering-semana-previa-carrera",t:"Tapering Running: Semana Previa a la Carrera 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"tendinitis-aquiles-running",t:"Tendinitis Aquiles Running: Tratamiento y Ejercicios 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"test-cooper-running",t:"Test de Cooper: Cómo Hacerlo, Tablas de Resultados y Cálculo de VO2max (2026)",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"triatlon-para-runners-principiantes",t:"Triatlón para Runners Principiantes 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"ultra-trail-principiantes",t:"Ultra Trail Principiantes: Guía Primera Ultra 2026",c:"Trail Running",i:"https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"unirse-grupo-running",t:"Unirse a Grupo Running: Guía Paso a Paso 2026",c:"Comunidad Running",i:"https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"variabilidad-cardiaca-running",t:"HRV Running: Variabilidad Cardíaca para Corredores 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"vo2-max-running-como-mejorar",t:"VO2 Max Running: Qué Es y Cómo Mejorar 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"volta-a-peu-valencia-2026",t:"Volta a Peu Valencia 2026: Guía Completa + Inscripción",c:"Carreras Running",i:"https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"volver-a-correr-despues-de-lesion",t:"Volver a Correr Tras Lesión: Plan Progresivo 2026",c:"Salud Running",i:"https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"volver-a-correr-tras-pausa-larga",t:"Volver a Correr Tras Pausa Larga: Plan 8 Semanas 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"wall-ball-hyrox-comprar",t:"Wall Ball HYROX: 8 Mejores Balones Medicinales 2026",c:"Equipamiento Running",i:"https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"yoga-para-corredores",t:"Yoga para Corredores: 10 Posturas + Rutina 20 Min 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"zapatillas-10k",t:"Mejores Zapatillas para 10K 2026: Velocidad sin Sacrificar Comodidad",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"zapatillas-deka-strong-atlas",t:"Zapatillas DEKA STRONG y ATLAS: Top Modelos 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"zapatillas-running-media-maraton",t:"Zapatillas Media Maratón 2026: Top 7 para 21K",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"zapatillas-running-pisada-neutra",t:"Mejores Zapatillas Running Pisada Neutra 2026: Top 7",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"zapatillas-running-pronadores",t:"Zapatillas Running Pronadores: Las Mejores 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"zapatillas-running-supinadores",t:"Zapatillas Running Supinadores: Guía y Modelos 2026",c:"Zapatillas Running",i:"https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {s:"zona-2-running-quemar-grasa",t:"Zona 2 Running: Quemar Grasa Corriendo Lento 2026",c:"Entrenamiento Running",i:"https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800"},
];

(async () => {
  console.log(`🚀 CorrerJuntos Pinterest Bot — ${ARTICLES.length} artículos | desde #${START_FROM}\n`);

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const ctx = await browser.newContext({ locale: 'es-ES', viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // ── Login ──────────────────────────────────────────────────────────────────
  await page.goto('https://www.pinterest.es/login/');
  await page.waitForLoadState('networkidle');
  await sleep(2000);

  const emailEl = page.locator('#email');
  if (await emailEl.isVisible({ timeout: 4000 }).catch(() => false)) {
    await emailEl.fill(EMAIL);
    await page.locator('#password').fill(PASS);
    await page.locator('button[type="submit"]').click();
    await sleep(4000);
  }

  const onPinterest = await page.locator('input[placeholder*="Buscar"]').isVisible({ timeout: 6000 }).catch(() => false);
  if (!onPinterest) {
    await waitForEnter('\n👉 Inicia sesión con Google en el navegador y pulsa ENTER cuando estés en Pinterest...\n');
    await sleep(2000);
  }
  console.log('✅ Sesión iniciada\n');

  // ── Pins via pin-creation-tool con screenshot en error ─────────────────────
  for (let i = START_FROM; i < ARTICLES.length; i++) {
    const art = ARTICLES[i];
    const link = `${BASE}/blog/${art.s}`;
    const desc = `${art.t} — Guía para runners. #running #correr #correrjuntos`;

    try {
      await page.goto('https://www.pinterest.es/pin-creation-tool/', { waitUntil: 'networkidle', timeout: 30000 });
      await sleep(3000);

      // ── Imagen: descargar y subir via file input ──
      const imgBuffer = await downloadImage(art.i);
      const fileInput = page.locator('#storyboard-upload-input');
      await fileInput.waitFor({ timeout: 8000 });
      await fileInput.setInputFiles({
        name: 'image.jpg',
        mimeType: 'image/jpeg',
        buffer: imgBuffer,
      });
      await sleep(5000); // esperar que la imagen cargue y aparezca el board selector

      // ── Título ──
      const titleIn = page.locator('#storyboard-selector-title');
      if (await titleIn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await titleIn.click();
        await titleIn.fill(art.t);
      }

      // ── Descripción (contenteditable div) ──
      const descEl = page.locator('div[contenteditable="true"]').first();
      if (await descEl.isVisible({ timeout: 3000 }).catch(() => false)) {
        await descEl.click();
        await page.keyboard.type(desc, { delay: 8 });
      }

      // ── Enlace ──
      const linkIn = page.locator('#WebsiteField');
      if (await linkIn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await linkIn.click();
        await linkIn.fill(link);
      }

      // ── Tablero ──
      const boardBtn = page.locator('[data-test-id="board-dropdown-select-button"]');
      if (await boardBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await boardBtn.click();
        await sleep(2500);

        // Si hay buscador en el dropdown, úsalo para filtrar
        const searchInput = page.locator(
          '[data-test-id="board-dropdown-search-input"], ' +
          'input[placeholder*="ablero"], input[placeholder*="usca"], input[placeholder*="earch"]'
        ).first();
        if (await searchInput.isVisible({ timeout: 1500 }).catch(() => false)) {
          await searchInput.fill(art.c);
          await sleep(1000);
        }

        // Debug: volcar todos los li/option visibles en el dropdown (siempre, no solo primer pin)
        const dropItems = await page.evaluate(() =>
          Array.from(document.querySelectorAll('li, [role="option"], [role="listitem"], [data-test-id*="board"]'))
            .filter(el => el.offsetParent !== null && (el.innerText||'').trim().length > 1)
            .slice(0, 30)
            .map(el => `<${el.tagName}> role="${el.getAttribute('role')||''}" tid="${el.getAttribute('data-test-id')||''}" text="${(el.innerText||'').trim().slice(0,50)}"`)
        );
        if (dropItems.length) console.log('  Dropdown items:\n    ' + dropItems.join('\n    '));
        else console.log('  ⚠ Dropdown vacío — tomando screenshot');

        await page.screenshot({ path: path.join(process.cwd(), 'tools', 'debug-dropdown.png') });

        // Intentar seleccionar tablero: primero por data-test-id, luego por texto exacto
        const boardSelectors = [
          `[data-test-id*="board"]:has-text("${art.c}")`,
          `li:has-text("${art.c}")`,
          `[role="option"]:has-text("${art.c}")`,
          `[role="listitem"]:has-text("${art.c}")`,
        ];
        let boardSelected = false;
        for (const sel of boardSelectors) {
          const opt = page.locator(sel).first();
          if (await opt.isVisible({ timeout: 1500 }).catch(() => false)) {
            await opt.click();
            boardSelected = true;
            console.log(`  📌 Tablero seleccionado con: ${sel}`);
            break;
          }
        }
        // Último recurso: getByText
        if (!boardSelected) {
          const byText = page.getByText(art.c, { exact: true }).first();
          if (await byText.isVisible({ timeout: 1500 }).catch(() => false)) {
            await byText.click();
            boardSelected = true;
            console.log(`  📌 Tablero seleccionado por getByText`);
          }
        }

        if (!boardSelected) {
          // Crear tablero via modal
          const createEl = page.getByText('Crear tablero', { exact: false }).first();
          if (await createEl.isVisible({ timeout: 2000 }).catch(() => false)) {
            await createEl.click();
            await sleep(1500);
            const nameIn = page.locator('div[role="dialog"] input').first();
            await nameIn.waitFor({ timeout: 4000 });
            await nameIn.fill(art.c);
            await sleep(400);
            const createModalBtn = page.locator(
              '[data-test-id="board-form-submit-button"], div[role="dialog"] button:has-text("Crear")'
            ).first();
            await createModalBtn.click({ timeout: 8000 }).catch(() => {});
            await sleep(2000);

            // Si el modal muestra error "Ya tienes un tablero", cerrarlo con Escape
            const alreadyExists = page.locator('text=Ya tienes un tablero');
            if (await alreadyExists.isVisible({ timeout: 1500 }).catch(() => false)) {
              console.log(`  ℹ Tablero "${art.c}" ya existe — cerrando modal y reintentando selección`);
              await page.keyboard.press('Escape');
              await sleep(1000);
              // Reabrir dropdown y buscar el tablero
              await boardBtn.click();
              await sleep(2000);
              for (const sel of boardSelectors) {
                const opt = page.locator(sel).first();
                if (await opt.isVisible({ timeout: 1500 }).catch(() => false)) {
                  await opt.click();
                  boardSelected = true;
                  console.log(`  📌 Tablero seleccionado (2º intento) con: ${sel}`);
                  break;
                }
              }
              if (!boardSelected) {
                const byText2 = page.getByText(art.c, { exact: true }).first();
                if (await byText2.isVisible({ timeout: 1500 }).catch(() => false)) {
                  await byText2.click();
                  boardSelected = true;
                  console.log(`  📌 Tablero seleccionado (2º intento) por getByText`);
                }
              }
              if (!boardSelected) console.log(`  ⚠ No se pudo seleccionar tablero "${art.c}" en 2º intento`);
            } else {
              console.log(`  🆕 Tablero "${art.c}" creado`);
              await sleep(1500);
            }
          } else {
            console.log(`  ⚠ No se pudo seleccionar ni crear tablero "${art.c}"`);
          }
        }
        await sleep(500);
      }

      // ── Debug antes de publicar ──
      if (i === START_FROM) {
        await page.screenshot({ path: path.join(process.cwd(), 'tools', 'debug-before-publish.png') });
        const btns = await page.evaluate(() =>
          Array.from(document.querySelectorAll('button, [role="button"]'))
            .map(el => `"${(el.innerText||'').trim().slice(0,40)}" aria="${el.getAttribute('aria-label')||''}" disabled=${el.disabled} data-test-id="${el.getAttribute('data-test-id')||''}"`)
        );
        console.log('  Botones visibles antes de publicar:');
        btns.forEach(b => console.log('    ' + b));
      }

      // ── Publicar ──
      // Publicar — el botón está en la esquina superior derecha de la página
      // Probar varios selectores posibles
      const publishSelectors = [
        '[data-test-id="storyboard-creation-nav-done-button"]',
        '[data-test-id="board-dropdown-save-button"]',
        'button:has-text("Publicar")',
        'button:has-text("Guardar")',
        'header button:last-child',
      ];
      let published = false;
      for (const sel of publishSelectors) {
        const btn = page.locator(sel).first();
        if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await btn.click({ timeout: 10000 });
          published = true;
          break;
        }
      }
      if (!published) {
        await page.screenshot({ path: path.join(process.cwd(), 'tools', `debug-fail-${i}.png`) });
        throw new Error('Botón publicar no encontrado');
      }

      await sleep(DELAY);

      // Si aparece error "No se ha encontrado el tablero", guardar borrador y continuar
      const errorModal = page.locator('text=No se ha encontrado el tablero');
      if (await errorModal.isVisible({ timeout: 2000 }).catch(() => false)) {
        const draftBtn = page.locator('button:has-text("Guardar borrador")').first();
        await draftBtn.click({ timeout: 5000 }).catch(() => {});
        await sleep(2000);
        console.log(`  ⚠️  [${i+1}/${ARTICLES.length}] ${art.s} → borrador (error tablero)`);
      } else {
        console.log(`  ✅ [${i+1}/${ARTICLES.length}] ${art.s}`);
      }

    } catch (err) {
      console.log(`  ❌ [${i+1}/${ARTICLES.length}] ${art.s}: ${err.message.split('\n')[0]}`);
      console.log(`     ↩  Reanudar: --from ${i}`);
      await sleep(3000);
    }
  }

  console.log('\n🎉 ¡Completado!');
  await browser.close();
})();
