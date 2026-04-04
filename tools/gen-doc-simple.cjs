const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } = require('docx');
const fs = require('fs');
const path = require('path');

function h1(t) { return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: t, bold: true, font: 'Arial', size: 32, color: 'FF6B00' })] }); }
function h2(t) { return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 }, children: [new TextRun({ text: t, bold: true, font: 'Arial', size: 26 })] }); }
function p(t, b) { return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: String(t), font: 'Arial', size: 22, bold: !!b })] }); }
function pb() { return new Paragraph({ children: [new PageBreak()] }); }

const doc = new Document({
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    children: [
      new Paragraph({ spacing: { before: 3000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CORRERJUNTOS', font: 'Arial', size: 64, bold: true, color: 'FF6B00' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: 'Plan de Empresa y Estructura de Equipo', font: 'Arial', size: 28 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Documento Confidencial - Marzo 2026', font: 'Arial', size: 20, color: '888888' })] }),
      pb(),

      h1('1. Que es CorrerJuntos'),
      p('CorrerJuntos es una app de comunidad running que conecta corredores para salir a correr juntos. Disponible gratis en iOS y Android con modelo freemium (4,99 euros/mes premium).'),
      p('No es solo un tracker GPS. Es el puente entre querer correr y tener a alguien con quien hacerlo.'),
      h2('El problema'),
      p('El 70% de la gente que empieza a correr lo deja antes de 3 meses. La razon: correr solo es aburrido y facil de abandonar.'),
      h2('La solucion'),
      p('Quedadas geolocalizadas, Runner Matching, 7 planes con 1.025 workouts, GPS con audio alertas, sync Garmin/COROS/Apple Watch, feed social.'),
      pb(),

      h1('2. Mision, Vision y Valores'),
      h2('Mision'),
      p('Que nadie tenga que correr solo si no quiere.', true),
      h2('Vision'),
      p('Ser la app de referencia de la comunidad running en espanol.'),
      h2('Valores'),
      p('1. Comunidad primero - cada feature mejora la conexion entre corredores'),
      p('2. Accesibilidad - lo esencial es gratis'),
      p('3. Inclusividad - de caminar a maraton, todas las edades'),
      p('4. Datos reales - GPS real, personas verificadas'),
      p('5. Simplicidad - abrir, encontrar quedada, correr'),
      pb(),

      h1('3. Cliente Ideal'),
      h2('Perfil Primario: El Corredor Solitario (70%)'),
      p('25-55 anos. Corre 2-3 veces/semana solo. Tiene Strava pero no interactua. Quiere compania. Ciudad mediana-grande en Espana o LATAM.'),
      h2('Perfil Secundario: El Principiante Motivado (20%)'),
      p('30-60 anos. Quiere empezar pero no sabe como. Le da verguenza correr solo. Llega por el blog.'),
      h2('Perfil Terciario: El Organizador (10%)'),
      p('Corredor experimentado que organiza quedadas informales y quiere herramienta para gestionar su grupo.'),
      pb(),

      h1('4. Servicios Principales'),
      p('1. Quedadas de running - geolocalizadas por ciudad, nivel, distancia (GRATIS)'),
      p('2. GPS Tracking - Carrera/Bici/Trail/Caminata con audio alertas km (GRATIS)'),
      p('3. Runner Matching - algoritmo 5 factores (GRATIS parcial / PREMIUM)'),
      p('4. Planes entrenamiento - 7 planes, 1.025 workouts (2 GRATIS / 5 PREMIUM)'),
      p('5. Sync relojes - Garmin + COROS + Apple Watch (PREMIUM)'),
      p('6. Feed social - actividades, likes, comentarios (GRATIS)'),
      p('7. Blog SEO - 400+ articulos captacion organica (WEB)'),
      pb(),

      h1('5. Modelo de Negocio'),
      p('Premium mensual: 4,99 euros/mes (ACTIVO)'),
      p('Premium anual: 29,99 euros/ano (ABRIL 2026)'),
      p('Amazon afiliados: comision por venta en blog (ACTIVO)'),
      p('Patrocinios: tiendas, eventos, marcas (FUTURO)'),
      p(''),
      p('Unit Economics:', true),
      p('CAC: ~0 euros (SEO organico) | LTV: 30 euros (6 meses) | Margen: >90%'),
      pb(),

      h1('6. Equipo: 10 Personas con IA'),
      p('Cada miembro usa IA para multiplicar productividad x5-x10. 10 personas con IA = 40-50 tradicionales.', true),
      p(''),

      h2('AREA PRODUCTO (3 personas)'),
      p(''),
      p('PERSONA 1: CEO / Founder / CTO', true),
      p('Funcion: Lidera producto, arquitectura tecnica, desarrolla features criticas, define roadmap.'),
      p('Dia a dia: revisar PRs, desarrollar features criticas, decisiones arquitectura, reuniones areas.'),
      p('Herramientas IA: Claude Code, GitHub Copilot, Cursor IDE'),
      p(''),
      p('PERSONA 2: UX/UI Designer', true),
      p('Funcion: Disena pantallas, flujos usuario, prototipos, tests usabilidad, design system.'),
      p('Dia a dia: disenar en Figma, prototipos interactivos, 2 tests usabilidad/semana, pixel-perfect con dev.'),
      p('Herramientas IA: Figma plugins IA, Midjourney, Maze'),
      p(''),
      p('PERSONA 3: QA Engineer', true),
      p('Funcion: Testing cada release iOS + Android + web. Tests automatizados E2E. Flows criticos.'),
      p('Dia a dia: testing manual features nuevas, mantenimiento tests, verificar registro/GPS/pagos/planes.'),
      p('Herramientas IA: Playwright + Claude, BrowserStack, Detox'),
      pb(),

      h2('AREA CRECIMIENTO (4 personas)'),
      p(''),
      p('PERSONA 4: Director de Marketing', true),
      p('Funcion: Estrategia global crecimiento. Coordina SEO, contenido, redes, partnerships. KPIs semanales.'),
      p('Dia a dia: revisar metricas GA4, coordinar publicaciones, analizar canales, reuniones CEO, objetivos mensuales.'),
      p('KPIs: descargas/semana, CTR blog, conversion premium, retention D7/D30'),
      p('Herramientas IA: Claude, GA4 + Looker Studio, Semrush'),
      p(''),
      p('PERSONA 5: Especialista SEO + Analista', true),
      p('Funcion: Posicionamiento Google, optimizar titulos/metas, internal linking, funnels GA4, A/B testing.'),
      p('Dia a dia: revisar Search Console, optimizar 10-20 articulos/semana, analizar embudo, reporte semanal.'),
      p('KPIs: paginas indexadas, posicion media, CTR, clics organicos/dia'),
      p('Herramientas IA: Claude (optimizacion masiva), Semrush, Ahrefs, Screaming Frog'),
      p(''),
      p('PERSONA 6: Creador de Contenido', true),
      p('Funcion: 5-7 articulos/semana blog, calendario editorial 30 dias, newsletter, contenido redes.'),
      p('Dia a dia: escribir 1 articulo SEO, buscar keywords, newsletter semanal, 3-5 piezas redes.'),
      p('KPIs: articulos/semana, trafico organico, suscriptores newsletter'),
      p('Herramientas IA: Claude (redaccion + SEO), Canva, CapCut, Brevo'),
      p(''),
      p('PERSONA 7: Community Manager', true),
      p('Funcion: Instagram, TikTok, X, Strava Club. Responde en <2h. Coordina embajadores. UGC.'),
      p('Dia a dia: 1-2 posts/stories, responder TODOS los comentarios/DMs, coordinar embajadores, crear quedadas.'),
      p('KPIs: engagement rate, tiempo respuesta, UGC generado, quedadas creadas'),
      p('Herramientas IA: Buffer/Hootsuite, ChatGPT, Canva'),
      pb(),

      h2('AREA NEGOCIO (2 personas)'),
      p(''),
      p('PERSONA 8: Business Developer', true),
      p('Funcion: Acuerdos con tiendas running, clubs, eventos, marcas. Patrocinios quedadas.'),
      p('Dia a dia: contactar 5-10 leads/semana, propuestas colaboracion, seguimiento CRM, negociar.'),
      p('KPIs: partnerships cerrados/mes, revenue partnerships, leads contactados'),
      p('Herramientas IA: LinkedIn Sales Navigator, HubSpot CRM, Claude'),
      p(''),
      p('PERSONA 9: ASO + Growth Hacker', true),
      p('Funcion: Fichas App Store/Google Play, reviews, experimentos crecimiento, paywall, onboarding.'),
      p('Dia a dia: monitorizar rankings, A/B testing, responder reviews, optimizar conversion.'),
      p('KPIs: conversion tienda, rating medio, descargas organicas, trial-to-paid'),
      p('Herramientas IA: AppTweak, Firebase A/B, Claude'),
      pb(),

      h2('SOPORTE TRANSVERSAL (1 persona)'),
      p(''),
      p('PERSONA 10: Coordinador de Embajadores', true),
      p('Funcion: Recluta y gestiona 10-20 embajadores runners. 1 quedada/semana + 2-3 stories por embajador.'),
      p('Dia a dia: comunicacion WhatsApp, verificar compromisos, reclutar ciudades, kits marca, eventos trimestrales.'),
      p('Ciudades: Madrid, Barcelona, Valencia, Sevilla, Mexico DF, Buenos Aires'),
      p('KPIs: quedadas embajadores, descargas atribuidas, UGC generado'),
      p('Herramientas IA: Notion, WhatsApp Business, Canva'),
      pb(),

      h1('7. Multiplicador IA'),
      p('Articulo SEO 1.500 palabras: sin IA 4-6h, con IA 30-45min (x8)'),
      p('Optimizar 400 titulos: sin IA 2 semanas, con IA 4 horas (x20)'),
      p('Disenar pantalla app: sin IA 2-3 dias, con IA 4-6h (x4)'),
      p('Desarrollar feature: sin IA 1-2 semanas, con IA 2-3 dias (x4)'),
      p('6 landing pages: sin IA 3 semanas, con IA 1 dia (x15)'),
      p(''),
      p('10 personas con IA = 40-50 tradicionales, coste 4x menor.', true),
      pb(),

      h1('8. Roadmap 2026'),
      p('Marzo: v1.3.0, 400 articulos, 88 descargas'),
      p('Abril: 7 planes activos + anual + Apple Watch (200 descargas)'),
      p('Mayo: Garmin + COROS + 30 articulos (500 descargas)'),
      p('Junio: Clubs + patrocinios (1.000 descargas)'),
      p('Q3: 1.000 usuarios activos (3.000 descargas)'),
      p('Q4: Internacionalizacion UK/FR/IT (10.000 descargas)'),
      pb(),

      h1('9. Por Que Invertir'),
      p('1. Producto construido: app en tiendas, 1.025 workouts, 400+ articulos'),
      p('2. Sin competencia en espanol'),
      p('3. SEO como motor gratuito (CAC ~0 euros)'),
      p('4. Mercado 50M+ runners creciendo 15% anual'),
      p('5. Unit economics: LTV 30 euros, margen >90%'),
      p('6. Equipo IA: 10 = 40 en output'),
      p(''),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [
        new TextRun({ text: 'CorrerJuntos', font: 'Arial', size: 28, bold: true, color: 'FF6B00' }),
      ]}),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: 'La app que convierte correr solo en correr acompanado.', font: 'Arial', size: 24, color: '888888' }),
      ]}),
    ]
  }]
});

const outPath = path.join(__dirname, '..', 'CorrerJuntos-Plan-Empresa-2026.docx');
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('OK: ' + outPath);
  console.log('Size: ' + (buf.length / 1024).toFixed(0) + 'KB');
});
