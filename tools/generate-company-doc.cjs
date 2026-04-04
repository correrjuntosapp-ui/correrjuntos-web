const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, LevelFormat,
  PageNumber, PageBreak } = require('docx');
const fs = require('fs');

const ORANGE = 'FF6B00';
const BLACK = '111111';
const GRAY = '666666';
const LIGHT_GRAY = 'F5F5F5';
const WHITE = 'FFFFFF';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, spacing: { before: level === HeadingLevel.HEADING_1 ? 400 : 240, after: 200 },
    children: [new TextRun({ text, bold: true, font: 'Arial', size: level === HeadingLevel.HEADING_1 ? 36 : level === HeadingLevel.HEADING_2 ? 28 : 24, color: level === HeadingLevel.HEADING_1 ? ORANGE : BLACK })] });
}

function para(text, opts = {}) {
  return new Paragraph({ spacing: { after: 160 }, alignment: opts.align || AlignmentType.LEFT,
    children: [new TextRun({ text, font: 'Arial', size: opts.size || 22, color: opts.color || BLACK, bold: opts.bold || false, italics: opts.italic || false })] });
}

function bulletItem(text, ref) {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 80 },
    children: [new TextRun({ text, font: 'Arial', size: 22, color: BLACK })] });
}

function tableRow(cells, isHeader = false) {
  return new TableRow({ children: cells.map((text, i) => new TableCell({
    borders, margins: cellMargins,
    width: { size: Math.floor(9360 / cells.length), type: WidthType.DXA },
    shading: isHeader ? { fill: ORANGE, type: ShadingType.CLEAR } : (i % 2 === 0 ? { fill: LIGHT_GRAY, type: ShadingType.CLEAR } : undefined),
    children: [new Paragraph({ children: [new TextRun({ text: String(text), font: 'Arial', size: 20, bold: isHeader, color: isHeader ? WHITE : BLACK })] })]
  })) });
}

function makeTable(headers, rows) {
  const colWidth = Math.floor(9360 / headers.length);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: headers.map(() => colWidth),
    rows: [tableRow(headers, true), ...rows.map(r => tableRow(r))]
  });
}

function teamMember(name, role, description, tools) {
  return [
    new Paragraph({ spacing: { before: 200, after: 60 }, children: [
      new TextRun({ text: name, font: 'Arial', size: 24, bold: true, color: ORANGE }),
      new TextRun({ text: `  \u2014  ${role}`, font: 'Arial', size: 22, color: GRAY })
    ]}),
    para(description),
    new Paragraph({ spacing: { after: 120 }, children: [
      new TextRun({ text: 'Herramientas IA: ', font: 'Arial', size: 20, bold: true, color: BLACK }),
      new TextRun({ text: tools, font: 'Arial', size: 20, color: GRAY })
    ]}),
  ];
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: ORANGE },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: BLACK },
        paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: BLACK },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [
    // ═══════════════ PORTADA ═══════════════
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        new Paragraph({ spacing: { before: 4000 }, alignment: AlignmentType.CENTER, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
          new TextRun({ text: 'CORRER', font: 'Arial', size: 72, bold: true, color: BLACK }),
          new TextRun({ text: 'JUNTOS', font: 'Arial', size: 72, bold: true, color: ORANGE }),
        ]}),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [
          new TextRun({ text: 'La app que conecta corredores', font: 'Arial', size: 28, color: GRAY })
        ]}),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
          new TextRun({ text: 'Plan de Empresa, Estructura de Equipo', font: 'Arial', size: 32, bold: true, color: BLACK })
        ]}),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
          new TextRun({ text: 'y Estrategia de Crecimiento', font: 'Arial', size: 32, bold: true, color: BLACK })
        ]}),
        new Paragraph({ spacing: { before: 1200 }, alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: 'Documento Confidencial \u2014 Marzo 2026', font: 'Arial', size: 22, color: GRAY })
        ]}),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: 'correrjuntos.com', font: 'Arial', size: 22, color: ORANGE })
        ]}),
      ]
    },

    // ═══════════════ CONTENIDO PRINCIPAL ═══════════════
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
        new TextRun({ text: 'CORRER', font: 'Arial', size: 16, bold: true, color: BLACK }),
        new TextRun({ text: 'JUNTOS', font: 'Arial', size: 16, bold: true, color: ORANGE }),
        new TextRun({ text: ' \u2014 Plan de Empresa 2026', font: 'Arial', size: 16, color: GRAY }),
      ]})] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: 'Confidencial \u2014 P\u00e1gina ', font: 'Arial', size: 16, color: GRAY }),
        new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 16, color: GRAY }),
      ]})] }) },
      children: [

        // ─── 1. QU\u00c9 ES CORRERJUNTOS ───
        heading('1. Qu\u00e9 es CorrerJuntos'),
        para('CorrerJuntos es una aplicaci\u00f3n m\u00f3vil de comunidad running que conecta corredores para salir a correr juntos. Disponible en iOS y Android de forma gratuita, con un modelo freemium que ofrece funcionalidades premium a 4,99\u20ac/mes.'),
        para('No es solo un tracker GPS como Strava ni solo una red social. Es el puente entre querer correr y tener a alguien con quien hacerlo.'),

        heading('El problema que resolvemos', HeadingLevel.HEADING_2),
        para('El 70% de la gente que empieza a correr lo deja antes de 3 meses. La raz\u00f3n principal: correr solo es aburrido, duro y f\u00e1cil de abandonar. No es falta de motivaci\u00f3n \u2014 es falta de compa\u00f1\u00eda.'),
        para('Las apps actuales (Strava, Nike Run Club, Garmin Connect) est\u00e1n dise\u00f1adas para corredores individuales. Te dan datos, m\u00e9tricas, gr\u00e1ficas... pero no te dan a nadie con quien correr.'),

        heading('Nuestra soluci\u00f3n', HeadingLevel.HEADING_2),
        bulletItem('Quedadas de running geolocalizadas por ciudad, nivel y distancia', 'bullets'),
        bulletItem('Runner Matching: algoritmo que encuentra corredores compatibles por ritmo, horario y objetivos', 'bullets'),
        bulletItem('7 planes de entrenamiento con 1.025 workouts estructurados', 'bullets'),
        bulletItem('GPS tracking con audio alertas en segundo plano', 'bullets'),
        bulletItem('Sincronizaci\u00f3n con Garmin, COROS y Apple Watch (en desarrollo)', 'bullets'),
        bulletItem('Feed social: compartir actividades, likes, comentarios', 'bullets'),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── 2. MISI\u00d3N, VISI\u00d3N Y VALORES ───
        heading('2. Misi\u00f3n, Visi\u00f3n y Valores'),

        heading('Misi\u00f3n', HeadingLevel.HEADING_2),
        para('Que nadie tenga que correr solo si no quiere. Conectar a cada corredor con personas de su nivel, ritmo y zona para que correr sea una actividad social, motivadora y sostenible en el tiempo.', { bold: true }),

        heading('Visi\u00f3n', HeadingLevel.HEADING_2),
        para('Ser la app de referencia de la comunidad running en espa\u00f1ol. El lugar donde cualquier persona \u2014 desde un sedentario que quiere dar su primer paso hasta un maratoniano que busca compa\u00f1eros de entrenamiento \u2014 encuentra su grupo.'),

        heading('Valores', HeadingLevel.HEADING_2),
        makeTable(
          ['Valor', 'Significado'],
          [
            ['Comunidad primero', 'Cada funcionalidad se eval\u00faa por si mejora la conexi\u00f3n entre corredores'],
            ['Accesibilidad', 'Lo esencial es gratis. Premium mejora la experiencia, nunca la bloquea'],
            ['Inclusividad', 'Todos los niveles, todas las edades. De caminar a marat\u00f3n'],
            ['Datos reales', 'GPS real, m\u00e9tricas reales, personas reales con fotos verificadas'],
            ['Simplicidad', 'Abrir la app, encontrar una quedada, salir a correr. Sin complicaciones'],
          ]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── 3. CLIENTE IDEAL ───
        heading('3. Cliente Ideal'),

        heading('Perfil Primario \u2014 El Corredor Solitario (70%)', HeadingLevel.HEADING_2),
        makeTable(
          ['Caracter\u00edstica', 'Detalle'],
          [
            ['Edad', '25-55 a\u00f1os'],
            ['H\u00e1bito', 'Corre 2-3 veces/semana pero siempre solo'],
            ['Apps', 'Tiene Strava pero no interact\u00faa con nadie'],
            ['Necesidad', 'Quiere compa\u00f1\u00eda pero no sabe c\u00f3mo encontrarla'],
            ['Club', 'No pertenece a ning\u00fan club de running'],
            ['Ubicaci\u00f3n', 'Ciudad mediana-grande en Espa\u00f1a o Latinoam\u00e9rica'],
          ]
        ),

        heading('Perfil Secundario \u2014 El Principiante Motivado (20%)', HeadingLevel.HEADING_2),
        bulletItem('30-60 a\u00f1os, quiere empezar a correr pero no sabe c\u00f3mo', 'bullets'),
        bulletItem('Le da verg\u00fcenza correr solo/a', 'bullets'),
        bulletItem('Busca un plan paso a paso + apoyo social', 'bullets'),
        bulletItem('Descarga la app por un art\u00edculo del blog', 'bullets'),

        heading('Perfil Terciario \u2014 El Organizador de Grupo (10%)', HeadingLevel.HEADING_2),
        bulletItem('Corredor experimentado que ya organiza quedadas informales', 'bullets'),
        bulletItem('Quiere una herramienta para gestionar su grupo', 'bullets'),
        bulletItem('Crea quedadas, invita gente, registra actividades del grupo', 'bullets'),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── 4. SERVICIOS PRINCIPALES ───
        heading('4. Servicios Principales'),

        makeTable(
          ['Servicio', 'Descripci\u00f3n', 'Precio'],
          [
            ['Quedadas de running', 'Crear y unirse a quedadas geolocalizadas por ciudad, nivel y distancia', 'Gratis'],
            ['GPS Tracking', 'Registro de Carrera, Bici, Trail, Caminata con audio alertas cada km', 'Gratis'],
            ['Runner Matching', 'Algoritmo 5 factores: ritmo, horario, nivel, objetivos, actividad', 'Gratis parcial / Premium'],
            ['Planes entrenamiento', '7 planes (Moverte a Marat\u00f3n), 1.025 workouts estructurados', '2 gratis / 5 Premium'],
            ['Sync relojes', 'Garmin Connect + COROS + Apple Watch (workouts al reloj)', 'Premium'],
            ['Feed social', 'Publicar actividades, likes, comentarios, compartir', 'Gratis'],
            ['Blog SEO', '400+ art\u00edculos en ES + EN, motor de captaci\u00f3n org\u00e1nica', 'Gratis (web)'],
          ]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── 5. MODELO DE NEGOCIO ───
        heading('5. Modelo de Negocio'),

        heading('Ingresos', HeadingLevel.HEADING_2),
        makeTable(
          ['Canal', 'Tipo', 'Estado', 'Estimaci\u00f3n'],
          [
            ['Premium mensual', '4,99\u20ac/mes', 'Activo', 'Principal'],
            ['Premium anual', '29,99\u20ac/a\u00f1o', 'Abril 2026', 'Mayor LTV'],
            ['Amazon afiliados', 'Comisi\u00f3n por venta', 'Activo', 'Pasivo'],
            ['Patrocinios', 'Tiendas, eventos, marcas', 'Futuro', 'Escalable'],
          ]
        ),

        heading('Unit Economics', HeadingLevel.HEADING_2),
        makeTable(
          ['M\u00e9trica', 'Valor', 'Notas'],
          [
            ['CAC (coste adquisici\u00f3n)', '~0\u20ac', 'SEO org\u00e1nico, sin ads'],
            ['Conversi\u00f3n free \u2192 premium', '5-10%', 'Objetivo'],
            ['ARPU mensual', '4,99\u20ac', 'Solo premium'],
            ['LTV (6 meses)', '30\u20ac', '4,99 x 6 meses'],
            ['Margen', '>90%', 'Costes servidor m\u00ednimos'],
          ]
        ),

        heading('Embudo de conversi\u00f3n', HeadingLevel.HEADING_2),
        new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: 'SEO: 400+ art\u00edculos generan 3.300 impresiones/d\u00eda en Google', font: 'Arial', size: 22 })] }),
        new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: 'Landing pages de planes convierten visita en descarga', font: 'Arial', size: 22 })] }),
        new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: 'Plan 0\u21925K gratis engancha al usuario durante 8 semanas', font: 'Arial', size: 22 })] }),
        new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: 'Comunidad + quedadas retienen al usuario a largo plazo', font: 'Arial', size: 22 })] }),
        new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: 'Paywall premium al querer plan 10K+ o sync con reloj', font: 'Arial', size: 22 })] }),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── 6. EQUIPO IA (10 PERSONAS) ───
        heading('6. Estructura del Equipo \u2014 10 Personas con IA'),

        para('CorrerJuntos opera con un equipo de 10 personas potenciado por inteligencia artificial. Cada miembro utiliza herramientas de IA espec\u00edficas para multiplicar su productividad x5-x10, permitiendo competir con equipos de 40-50 personas.'),

        heading('Organigrama', HeadingLevel.HEADING_2),
        para('CEO/Founder \u2192 3 \u00e1reas: Producto (3), Crecimiento (4), Negocio (2)', { bold: true }),

        new Paragraph({ children: [new PageBreak()] }),

        heading('\u00c1rea 1 \u2014 Producto (3 personas)', HeadingLevel.HEADING_2),

        ...teamMember(
          '1. CEO / Founder / CTO',
          'Direcci\u00f3n + Desarrollo',
          'Lidera el producto, toma decisiones de arquitectura, desarrolla features cr\u00edticas. Define roadmap, prioriza backlog, y es el \u00faltimo filtro de calidad. Programa la app, el backend y la web.',
          'Claude Code (desarrollo + automatizaci\u00f3n), GitHub Copilot (c\u00f3digo), Cursor (IDE IA)'
        ),

        ...teamMember(
          '2. UX/UI Designer',
          'Dise\u00f1o de Producto',
          'Dise\u00f1a todas las pantallas de la app, flujos de usuario, prototipos interactivos. Realiza tests de usabilidad con usuarios reales. Mantiene el design system (colores, tipograf\u00eda, componentes). Colabora con desarrollo para implementar los dise\u00f1os pixel-perfect.',
          'Figma + plugins IA, Midjourney (conceptos visuales), Maze (user testing automatizado)'
        ),

        ...teamMember(
          '3. QA Engineer',
          'Testing + Calidad',
          'Prueba cada release antes de subir a tiendas. Testing manual en iOS + Android + web. Escribe tests automatizados (Playwright web, Detox mobile). Verifica flows cr\u00edticos: registro, GPS tracking, compra premium, planes de entrenamiento.',
          'Playwright + Claude (generaci\u00f3n tests), BrowserStack (devices), Detox (mobile E2E)'
        ),

        new Paragraph({ children: [new PageBreak()] }),

        heading('\u00c1rea 2 \u2014 Crecimiento (4 personas)', HeadingLevel.HEADING_2),

        ...teamMember(
          '4. Director de Marketing',
          'Estrategia + KPIs',
          'Define la estrategia global de crecimiento. Coordina SEO, contenido, redes sociales y partnerships. Gestiona presupuesto de marketing. Reporta KPIs semanales: CAC, LTV, conversi\u00f3n, retenci\u00f3n. Decide qu\u00e9 canales escalar y cu\u00e1les cortar.',
          'Claude (an\u00e1lisis + estrategia), GA4 + Looker Studio (dashboards), Semrush (competencia)'
        ),

        ...teamMember(
          '5. Especialista SEO + Analista',
          'Posicionamiento + Datos',
          'Gestiona Search Console, audita el sitio, optimiza t\u00edtulos y metas, construye internal linking. Analiza funnels de conversi\u00f3n en GA4. A/B testing de CTAs. Monitoriza posiciones de keywords. Genera reportes de rendimiento semanal.',
          'Claude (optimizaci\u00f3n masiva t\u00edtulos/metas), Semrush, Ahrefs, Screaming Frog, Search Console API'
        ),

        ...teamMember(
          '6. Creador de Contenido',
          'Blog + Newsletter + Redes',
          'Escribe 5-7 art\u00edculos/semana para el blog (SEO-optimized). Gestiona el calendario editorial de 30 d\u00edas. Crea newsletter semanal (Brevo). Produce contenido para Instagram, TikTok y X. Graba reels de running con el m\u00f3vil.',
          'Claude (redacci\u00f3n + SEO), Canva (gr\u00e1ficos redes), CapCut (v\u00eddeo), Brevo (email)'
        ),

        ...teamMember(
          '7. Community Manager',
          'Redes Sociales + Usuarios',
          'Gestiona Instagram, TikTok, X y Strava Club. Responde comentarios y DMs en <2h. Coordina embajadores runners (5-10 personas con premium gratis). Genera UGC (User Generated Content). Crea y modera quedadas semanales en ciudades clave.',
          'Buffer/Hootsuite (programaci\u00f3n), ChatGPT (respuestas r\u00e1pidas), Canva (stories)'
        ),

        new Paragraph({ children: [new PageBreak()] }),

        heading('\u00c1rea 3 \u2014 Negocio (2 personas)', HeadingLevel.HEADING_2),

        ...teamMember(
          '8. Business Developer',
          'Partnerships + Ventas',
          'Cierra acuerdos con tiendas de running, clubs, eventos y marcas deportivas. Negocia patrocinios de quedadas. Gestiona relaciones con Amazon Afiliados y marcas de zapatillas. Busca oportunidades de co-marketing con Garmin, COROS, etc.',
          'LinkedIn Sales Navigator, HubSpot CRM, Claude (propuestas comerciales)'
        ),

        ...teamMember(
          '9. ASO + Growth Hacker',
          'App Stores + Crecimiento',
          'Optimiza fichas de App Store y Google Play (t\u00edtulos, descripciones, screenshots, keywords). Gestiona reviews y ratings. Dise\u00f1a experimentos de crecimiento: referral programs, onboarding optimization, push notification strategy. A/B testing de paywall.',
          'AppTweak/Sensor Tower (ASO), Firebase A/B Testing, Claude (copy variaciones)'
        ),

        new Paragraph({ children: [new PageBreak()] }),

        heading('Soporte Transversal', HeadingLevel.HEADING_2),

        ...teamMember(
          '10. Coordinador de Embajadores',
          'Comunidad Real + UGC',
          'Recluta y gestiona 10-20 embajadores runners en ciudades clave (Madrid, Barcelona, Valencia, Sevilla, M\u00e9xico DF). Cada embajador crea 1 quedada/semana y publica 2-3 stories. Les da premium gratis + material de marca. Organiza eventos presenciales trimestrales.',
          'Notion (gesti\u00f3n embajadores), WhatsApp Business (comunicaci\u00f3n), Canva (kits de marca)'
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── 7. MULTIPLICADOR IA ───
        heading('7. El Multiplicador IA'),

        para('Cada persona del equipo rinde como 3-5 gracias a herramientas de IA integradas en su flujo de trabajo:'),

        makeTable(
          ['Tarea', 'Sin IA', 'Con IA', 'Multiplicador'],
          [
            ['Escribir art\u00edculo SEO 1.500 palabras', '4-6 horas', '30-45 min', 'x8'],
            ['Optimizar t\u00edtulos 400 art\u00edculos', '2 semanas', '4 horas', 'x20'],
            ['Dise\u00f1ar pantalla app completa', '2-3 d\u00edas', '4-6 horas', 'x4'],
            ['Desarrollar feature completa', '1-2 semanas', '2-3 d\u00edas', 'x4'],
            ['Crear 6 landing pages SEO', '3 semanas', '1 d\u00eda', 'x15'],
            ['Analizar Search Console + plan acci\u00f3n', '1 d\u00eda', '30 min', 'x16'],
            ['Generar tests E2E', '3-4 d\u00edas', '2-3 horas', 'x10'],
            ['Responder 50 comentarios redes', '3 horas', '45 min', 'x4'],
          ]
        ),

        para('Un equipo de 10 personas con IA equivale a un equipo tradicional de 40-50 personas en output, con un coste 4x menor.', { bold: true }),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── 8. M\u00c9TRICAS ACTUALES ───
        heading('8. M\u00e9tricas Actuales (Marzo 2026)'),

        makeTable(
          ['M\u00e9trica', 'Valor'],
          [
            ['App publicada', 'iOS App Store + Google Play'],
            ['Descargas Android', '88 (creciendo)'],
            ['Art\u00edculos blog', '400+ (210 ES + 188 EN)'],
            ['P\u00e1ginas indexadas Google', '722'],
            ['Impresiones/d\u00eda', '3.300'],
            ['Landing pages planes', '6 con schema HowTo + FAQ + testimonios'],
            ['Planes entrenamiento', '7 planes, 1.025 workouts estructurados'],
            ['Pa\u00edses', 'Espa\u00f1a, M\u00e9xico, Argentina, Colombia, Chile, Per\u00fa, Portugal'],
            ['Integraciones relojes', 'Garmin (solicitado) + COROS (solicitado) + Apple Watch (SDK p\u00fablico)'],
          ]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── 9. ROADMAP ───
        heading('9. Roadmap 2026'),

        makeTable(
          ['Mes', 'Hito', 'KPI objetivo'],
          [
            ['Marzo 2026', 'v1.3.0 publicada, 400 art\u00edculos SEO, 6 landings', '88 descargas'],
            ['Abril 2026', 'Activar 7 planes + plan anual + Apple Watch', '200 descargas'],
            ['Mayo 2026', 'Garmin + COROS sync + 30 art\u00edculos completados', '500 descargas'],
            ['Junio 2026', 'Clubs de running + primer patrocinio', '1.000 descargas'],
            ['Q3 2026', '1.000 usuarios activos + embajadores 5 ciudades', '3.000 descargas'],
            ['Q4 2026', 'Internacionalizaci\u00f3n (UK, Francia, Italia)', '10.000 descargas'],
          ]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── 10. COMPETENCIA ───
        heading('10. Anlisis Competitivo'),

        makeTable(
          ['Feature', 'CorrerJuntos', 'Strava', 'TrainingPeaks', 'Nike Run Club'],
          [
            ['Planes estructurados', '7 planes', 'No', 'S\u00ed', '4 planes'],
            ['Sync con reloj', 'Garmin+COROS+Apple', 'No', 'Solo Garmin', 'No'],
            ['Comunidad + quedadas', 'S\u00ed', 'Parcial', 'No', 'No'],
            ['GPS tracking', 'S\u00ed', 'S\u00ed', 'No', 'S\u00ed'],
            ['Runner Matching', 'S\u00ed', 'No', 'No', 'No'],
            ['Plan gratuito completo', '2 planes gratis', '\u2014', 'Todo pago', 'Gratis'],
            ['Precio premium', '4,99\u20ac/mes', '7,99\u20ac/mes', '9,99\u20ac/mes', 'Gratis'],
            ['Mercado', 'ES + LATAM', 'Global', 'Global (EN)', 'Global'],
            ['Idioma', 'ES + EN', 'Multi', 'EN', 'Multi'],
          ]
        ),

        para('Ninguna app en espa\u00f1ol ofrece planes estructurados con sincronizaci\u00f3n a relojes + comunidad social.', { bold: true }),

        new Paragraph({ children: [new PageBreak()] }),

        // ─── 11. POR QU\u00c9 INVERTIR ───
        heading('11. Por Qu\u00e9 Invertir Ahora'),

        new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 120 }, children: [
          new TextRun({ text: 'Producto construido', font: 'Arial', size: 22, bold: true }),
          new TextRun({ text: ' \u2014 1.025 workouts, 7 planes, app en ambas tiendas, 400+ art\u00edculos SEO', font: 'Arial', size: 22 }),
        ]}),
        new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 120 }, children: [
          new TextRun({ text: 'Sin competencia en espa\u00f1ol', font: 'Arial', size: 22, bold: true }),
          new TextRun({ text: ' \u2014 ninguna app combina planes + reloj + comunidad en ES', font: 'Arial', size: 22 }),
        ]}),
        new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 120 }, children: [
          new TextRun({ text: 'SEO como motor gratuito', font: 'Arial', size: 22, bold: true }),
          new TextRun({ text: ' \u2014 400+ art\u00edculos generando tr\u00e1fico org\u00e1nico sin coste de adquisici\u00f3n', font: 'Arial', size: 22 }),
        ]}),
        new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 120 }, children: [
          new TextRun({ text: 'Mercado de 50M+ runners', font: 'Arial', size: 22, bold: true }),
          new TextRun({ text: ' \u2014 en Espa\u00f1a + Latinoam\u00e9rica, creciendo 15% anual', font: 'Arial', size: 22 }),
        ]}),
        new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 120 }, children: [
          new TextRun({ text: 'Unit economics claros', font: 'Arial', size: 22, bold: true }),
          new TextRun({ text: ' \u2014 CAC ~0\u20ac (SEO), LTV 30\u20ac, margen >90%', font: 'Arial', size: 22 }),
        ]}),
        new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 120 }, children: [
          new TextRun({ text: 'Equipo IA = 10 personas = 40 tradicionales', font: 'Arial', size: 22, bold: true }),
          new TextRun({ text: ' \u2014 eficiencia operativa desde d\u00eda 1', font: 'Arial', size: 22 }),
        ]}),

        new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: 'CorrerJuntos \u2014 La app que convierte correr solo en correr acompa\u00f1ado.', font: 'Arial', size: 24, bold: true, color: ORANGE }),
        ]}),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  const path = 'C:/Users/guett/OneDrive/Escritorio/CorrerJuntos-Plan-Empresa-2026.docx';
  fs.writeFileSync(path, buffer);
  console.log('Document created at: ' + path);
});
