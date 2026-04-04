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
  {s:'alimentos-antiinflamatorios-runners',t:'15 Alimentos Antiinflamatorios para Runners',c:'Nutrición Running',i:'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'apple-watch-running-review',t:'Apple Watch para Running: ¿Merece la Pena?',c:'Tecnología Running',i:'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'apps-correr-en-grupo',t:'Las 10 Mejores Apps para Correr en Grupo',c:'Comunidad Running',i:'https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'andar-vs-correr',t:'Andar vs Correr: ¿Qué Es Mejor para tu Salud?',c:'Salud Running',i:'https://images.pexels.com/photos/10432232/pexels-photo-10432232.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'ansiedad-pre-carrera',t:'Ansiedad Pre-Carrera: 8 Técnicas para los Nervios',c:'Salud Running',i:'https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'asics-gel-nimbus-26-vs-nike-pegasus-41',t:'ASICS Gel-Nimbus 26 vs Nike Pegasus 41',c:'Zapatillas Running',i:'https://images.pexels.com/photos/3763869/pexels-photo-3763869.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'asics-novablast-5-opinion',t:'ASICS Novablast 5: Análisis Completo 2026',c:'Zapatillas Running',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'auriculares-conduccion-osea-vs-in-ear-running',t:'Conducción Ósea vs In-Ear para Correr',c:'Tecnología Running',i:'https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'auriculares-running-natacion',t:'Mejores Auriculares para Running y Natación 2026',c:'Tecnología Running',i:'https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'ayuno-intermitente-running',t:'Ayuno Intermitente y Running: Guía Completa',c:'Nutrición Running',i:'https://images.pexels.com/photos/2377164/pexels-photo-2377164.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'bastones-trail-running',t:'Bastones de Trail Running: Guía Completa',c:'Trail Running',i:'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'bidones-running',t:'8 Mejores Bidones para Running 2026',c:'Equipamiento Running',i:'https://images.pexels.com/photos/10226372/pexels-photo-10226372.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'beneficios-correr-en-grupo',t:'7 Beneficios de Correr en Grupo',c:'Comunidad Running',i:'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'beneficios-de-correr',t:'15 Beneficios de Correr Respaldados por la Ciencia',c:'Salud Running',i:'https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'cafeina-running-rendimiento',t:'Cafeína y Running: Mejora tu Rendimiento',c:'Nutrición Running',i:'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'correr-en-ayunas',t:'Correr en Ayunas: 8 Beneficios y 5 Riesgos',c:'Salud Running',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'calambres-al-correr',t:'Calambres al Correr: Causas y Soluciones',c:'Salud Running',i:'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'calcetines-running',t:'Los 8 Mejores Calcetines para Running 2026',c:'Equipamiento Running',i:'https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'carga-hidratos-maraton',t:'Carga de Hidratos antes de un Maratón',c:'Nutrición Running',i:'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'maraton-barcelona-guia',t:'Maratón de Barcelona 2026: Guía Completa',c:'Carreras Running',i:'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'maraton-madrid-guia',t:'Maratón de Madrid 2026: Guía Completa',c:'Carreras Running',i:'https://images.pexels.com/photos/3757144/pexels-photo-3757144.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'maraton-sevilla-guia',t:'Maratón de Sevilla 2026',c:'Carreras Running',i:'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'maraton-valencia-guia',t:'Maratón de Valencia 2026: Guía del Recorrido',c:'Carreras Running',i:'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'san-silvestre-vallecana-guia',t:'San Silvestre Vallecana 2026: Guía',c:'Carreras Running',i:'https://images.pexels.com/photos/2928057/pexels-photo-2928057.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'carreras-trail-principiantes',t:'10 Carreras de Trail para Principiantes',c:'Trail Running',i:'https://images.pexels.com/photos/8949023/pexels-photo-8949023.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'chalecos-hidratacion-running',t:'7 Mejores Chalecos de Hidratación para Trail',c:'Trail Running',i:'https://images.pexels.com/photos/11598813/pexels-photo-11598813.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'chubasqueros-running',t:'8 Mejores Chubasqueros para Correr bajo la Lluvia',c:'Equipamiento Running',i:'https://images.pexels.com/photos/20234190/pexels-photo-20234190.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'cinturones-running',t:'Los 7 Mejores Cinturones para Running 2026',c:'Equipamiento Running',i:'https://images.pexels.com/photos/4397835/pexels-photo-4397835.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'como-calentar-antes-de-correr',t:'Cómo Calentar antes de Correr: Rutina Completa',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/4498603/pexels-photo-4498603.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'como-correr-mas-rapido',t:'Cómo Correr Más Rápido: 12 Técnicas Probadas',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'como-elegir-zapatillas-running',t:'Cómo Elegir Zapatillas de Running',c:'Zapatillas Running',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'como-evitar-problemas-digestivos-correr',t:'Cómo Evitar Problemas Digestivos al Correr',c:'Nutrición Running',i:'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'como-elegir-reloj-gps-running',t:'Cómo Elegir tu Reloj GPS para Running 2026',c:'Tecnología Running',i:'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'como-hacer-fartlek',t:'Cómo Hacer Fartlek: Guía Práctica',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'como-hidratarse-corriendo',t:'Cómo Hidratarse Correctamente cuando Corres',c:'Nutrición Running',i:'https://images.pexels.com/photos/10226372/pexels-photo-10226372.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'como-organizar-quedadas-running',t:'Cómo Organizar Quedadas de Running',c:'Comunidad Running',i:'https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'como-respirar-corriendo',t:'Cómo Respirar Correctamente al Correr',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'como-superar-el-muro-del-maraton',t:'Cómo Superar el Muro del Maratón',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'como-volver-a-correr-despues-de-una-lesion',t:'Cómo Volver a Correr después de una Lesión',c:'Salud Running',i:'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'coros-pace-3-review',t:'COROS Pace 3 Review: Mejor Reloj Calidad-Precio',c:'Tecnología Running',i:'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'correr-con-asma',t:'Correr con Asma: Guía Segura para Runners',c:'Salud Running',i:'https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'correr-con-diabetes',t:'Correr con Diabetes: Todo lo que Necesitas',c:'Salud Running',i:'https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'correr-durante-menopausia',t:'Correr durante la Menopausia: Beneficios',c:'Salud Running',i:'https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'correr-mejora-salud-mental',t:'Correr Mejora la Salud Mental: La Ciencia',c:'Salud Running',i:'https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'correr-para-perder-peso',t:'Correr para Perder Peso: Guía Definitiva',c:'Salud Running',i:'https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'correr-por-primera-vez',t:'Correr por Primera Vez: Guía Paso a Paso',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'correr-con-rodillera',t:'Correr con Rodillera: Cuándo y Cómo Usarla',c:'Salud Running',i:'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'cross-training-running',t:'Cross Training para Runners: Los Mejores Ejercicios',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/4498603/pexels-photo-4498603.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'dolor-rodilla-corriendo',t:'Dolor de Rodilla al Correr: Causas y Soluciones',c:'Salud Running',i:'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'empezar-a-correr-despues-de-los-40',t:'Empezar a Correr después de los 40',c:'Salud Running',i:'https://images.pexels.com/photos/3771071/pexels-photo-3771071.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'empezar-a-correr-despues-de-los-60',t:'Empezar a Correr después de los 60',c:'Salud Running',i:'https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'empezar-a-correr-guia-principiantes',t:'Empezar a Correr: Guía para Principiantes',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'entrenamiento-cruzado-running',t:'Entrenamiento Cruzado para Runners',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/4498603/pexels-photo-4498603.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'entrenamiento-de-fuerza-para-corredores',t:'Entrenamiento de Fuerza para Corredores',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/4498603/pexels-photo-4498603.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'entrenamiento-en-calor',t:'Entrenamiento en Calor: Cómo Correr en Verano',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'estiramientos-despues-de-correr',t:'Estiramientos después de Correr: Rutina',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/4498603/pexels-photo-4498603.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'fascia-plantar-runners',t:'Fascitis Plantar en Runners: Tratamiento',c:'Salud Running',i:'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'frecuencia-cardiaca-zonas-entrenamiento',t:'Zonas de Frecuencia Cardíaca para Runners',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'garmin-forerunner-55-review',t:'Garmin Forerunner 55 Review 2026',c:'Tecnología Running',i:'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'garmin-forerunner-265-review',t:'Garmin Forerunner 265 Review',c:'Tecnología Running',i:'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'geles-energeticos-running',t:'Geles Energéticos para Running: Guía',c:'Nutrición Running',i:'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'hoka-clifton-10-vs-asics-novablast-5',t:'Hoka Clifton 10 vs ASICS Novablast 5',c:'Zapatillas Running',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'hoka-speedgoat-6-review',t:'Hoka Speedgoat 6 Review: La Reina del Trail',c:'Trail Running',i:'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'indumentaria-running-invierno',t:'Ropa de Running para Invierno',c:'Equipamiento Running',i:'https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'lesiones-running-mas-comunes',t:'10 Lesiones de Running Más Comunes',c:'Salud Running',i:'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'luces-running-seguridad',t:'Mejores Luces para Correr de Noche',c:'Equipamiento Running',i:'https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'maraton-para-principiantes',t:'Tu Primer Maratón: Guía para Principiantes',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'media-maraton-entrenamiento',t:'Plan Entrenamiento Media Maratón',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'mejores-auriculares-baratos-running',t:'Mejores Auriculares Baratos para Running 2026',c:'Tecnología Running',i:'https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'mejores-auriculares-running',t:'Los 10 Mejores Auriculares para Correr 2026',c:'Tecnología Running',i:'https://images.pexels.com/photos/8380433/pexels-photo-8380433.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'mejores-bastones-trail-running',t:'Los 8 Mejores Bastones de Trail Running',c:'Trail Running',i:'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'mejores-proteinas-running',t:'Las Mejores Proteínas para Runners 2026',c:'Nutrición Running',i:'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'mejores-relojes-gps-running',t:'Los 10 Mejores Relojes GPS para Running 2026',c:'Tecnología Running',i:'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'mejores-zapatillas-on-running',t:'Las Mejores Zapatillas On Running 2026',c:'Zapatillas Running',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'motivacion-para-correr',t:'Motivación para Correr: 15 Técnicas',c:'Comunidad Running',i:'https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'music-correr-playlist',t:'Música para Correr: Las Mejores Playlists',c:'Comunidad Running',i:'https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'nike-pegasus-41-review',t:'Nike Pegasus 41 Review: El Clásico Reinventado',c:'Zapatillas Running',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'nike-vaporfly-3-review',t:'Nike Vaporfly 3 Review: ¿La Zapatilla Más Rápida?',c:'Zapatillas Running',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'nike-vomero-18-review',t:'Nike Vomero 18 Review: Máxima Amortiguación',c:'Zapatillas Running',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'nutricion-media-maraton',t:'Nutrición para Media Maratón: Plan Completo',c:'Nutrición Running',i:'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'plan-10k-8-semanas',t:'Plan 10K en 8 Semanas',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'plan-5k-principiantes',t:'Plan 5K: De 0 a 5K en 8 Semanas',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'plan-maraton-sub-4-horas',t:'Plan Maratón Sub 4 Horas: 16 Semanas',c:'Entrenamiento Running',i:'https://images.unsplash.com/photo-1544919982-b61976f0ba43?w=800&q=80'},
  {s:'plan-maraton-sub-3-30',t:'Plan Maratón Sub 3:30: Entrenamiento Avanzado',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'plantillas-running',t:'Mejores Plantillas para Running',c:'Equipamiento Running',i:'https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'polarizado-entrenamiento-running',t:'Entrenamiento Polarizado para Runners',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'prevenir-lesiones-rodilla-corriendo',t:'Cómo Prevenir Lesiones de Rodilla',c:'Salud Running',i:'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'proteinas-despues-de-correr',t:'Proteínas después de Correr: Cuánto Tomar',c:'Nutrición Running',i:'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'quedadas-running-como-organizar',t:'Quedadas de Running: Cómo Organizarlas',c:'Comunidad Running',i:'https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'recuperacion-activa-running',t:'Recuperación Activa para Runners',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/4498603/pexels-photo-4498603.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'rodilla-del-corredor',t:'Rodilla del Corredor: Causas y Tratamiento',c:'Salud Running',i:'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'ropa-running-verano',t:'Ropa de Running para Verano',c:'Equipamiento Running',i:'https://images.pexels.com/photos/8454900/pexels-photo-8454900.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'running-embarazo',t:'Running durante el Embarazo: Guía Segura',c:'Salud Running',i:'https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'running-frio-invierno',t:'Correr en Frío e Invierno: Supervivencia',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'running-para-ciclistas',t:'Running para Ciclistas: Combinar Deportes',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'salida-de-banda-iliotibial',t:'Síndrome de la Banda Iliotibial',c:'Salud Running',i:'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'series-running',t:'Series para Running: Cómo y Por Qué',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'sobreentrenamiento-running-sintomas',t:'Sobreentrenamiento en Running: Síntomas',c:'Salud Running',i:'https://images.pexels.com/photos/3760514/pexels-photo-3760514.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'suplementos-running',t:'Suplementos para Runners que Funcionan',c:'Nutrición Running',i:'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'tecnica-de-carrera-running',t:'Técnica de Carrera: Mejora tu Forma',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'tendinitis-aquiles-runners',t:'Tendinitis de Aquiles en Runners',c:'Salud Running',i:'https://images.pexels.com/photos/3771055/pexels-photo-3771055.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'test-cooper-running',t:'Test de Cooper: Mide tu Forma Física',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'trail-running-principiantes',t:'Trail Running para Principiantes',c:'Trail Running',i:'https://images.pexels.com/photos/8949023/pexels-photo-8949023.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'triatlon-para-runners-principiantes',t:'Triatlón para Runners Principiantes',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'vo2-max-running-como-mejorar',t:'VO2 Max en Running: Cómo Mejorarlo',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'zapatillas-carbon-running',t:'Zapatillas de Carbono para Running',c:'Zapatillas Running',i:'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'zapatillas-trail-running',t:'Mejores Zapatillas de Trail Running 2026',c:'Trail Running',i:'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'zapatillas-minimalistas-running',t:'Zapatillas Minimalistas para Running',c:'Zapatillas Running',i:'https://images.pexels.com/photos/3763869/pexels-photo-3763869.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'correr-con-perro',t:'Correr con tu Perro: Guía de Canicross',c:'Comunidad Running',i:'https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'correr-escuchar-musica',t:'Correr Escuchando Música: Ventajas',c:'Comunidad Running',i:'https://images.pexels.com/photos/4426517/pexels-photo-4426517.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'running-y-alcohol',t:'Running y Alcohol: Cómo Afecta al Rendimiento',c:'Salud Running',i:'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800'},
  {s:'correr-en-cinta',t:'Correr en Cinta: Ventajas y Consejos',c:'Entrenamiento Running',i:'https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=800'},
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
