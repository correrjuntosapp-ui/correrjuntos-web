#!/usr/bin/env node
const fs = require('fs');
const p = require('path').join(__dirname, '..', 'blog', 'en', 'foam-roller-vs-massage-gun.html');
let h = fs.readFileSync(p, 'utf8');

const R = [
  // Product 1
  ['El TriggerPoint GRID es el <strong>rodillo de espuma m&aacute;s vendido del mundo</strong> por buenas razones. La superficie tiene tres zonas de densidad diferente que simulan las manos de un fisioterapeuta: una zona de dedos (puntos espec&iacute;ficos), una de palma (presi&oacute;n media) y una plana (presi&oacute;n amplia).',
   'The TriggerPoint GRID is the <strong>world\'s best-selling foam roller</strong> for good reason. The surface has three different density zones that simulate a physiotherapist\'s hands: a finger zone (specific points), a palm zone (medium pressure) and a flat zone (broad pressure).'],
  ['El n&uacute;cleo r&iacute;gido de ABS no se deforma con el uso (los rodillos de espuma blanda se aplastan en semanas). La espuma EVA exterior es lo suficientemente firme para ser efectiva sin ser dolorosa. Soporta hasta 225 kg de peso corporal.',
   'The rigid ABS core doesn\'t deform with use (soft foam rollers flatten within weeks). The outer EVA foam is firm enough to be effective without being painful. Supports up to 225 kg body weight.'],
  ['Con 33 cm de longitud es compacto y port&aacute;til. Perfecto para llevar al gym o incluso al evento HYROX para <a href="/blog/como-calentar-antes-de-correr" style="color:#f97316">cómo calentar antes de correr</a> de competir. Es una compra que dura a&ntilde;os.',
   'At 33 cm long it\'s compact and portable. Perfect to bring to the gym or even to HYROX events for <a href="/blog/en/how-to-warm-up-before-running" style="color:#f97316">warming up before running</a>. It\'s a purchase that lasts years.'],
  // Product 2
  ['La RENPHO es la <strong>pistola de masaje con mejor relaci&oacute;n calidad-precio del mercado</strong>. Por 65&euro; (vs 300-400&euro; de una Theragun Pro), ofrece 5 velocidades de percusi&oacute;n, 5 cabezales intercambiables y una bater&iacute;a que dura ~3 horas de uso.',
   'The RENPHO is the <strong>best value massage gun on the market</strong>. For €65 (vs €300-400 for a Theragun Pro), it offers 5 percussion speeds, 5 interchangeable heads and a battery that lasts ~3 hours of use.'],
  ['El motor brushless es relativamente silencioso para su categor&iacute;a de precio. La profundidad de percusi&oacute;n (hasta 12 mm) es suficiente para la mayor&iacute;a de atletas &mdash; no llega a los 16 mm de una Theragun, pero para cu&aacute;driceps, gemelos, gl&uacute;teos y espalda es m&aacute;s que efectiva.',
   'The brushless motor is relatively quiet for its price range. The percussion depth (up to 12 mm) is sufficient for most athletes — it doesn\'t reach the 16 mm of a Theragun, but for quads, calves, glutes and back it\'s more than effective.'],
  ['Incluye cabezales de bola (uso general), plano (grandes m&uacute;sculos), bala (trigger points), horquilla (columna/aquiles) y amortiguado (zonas sensibles). Para el 90% de atletas, esta pistola cubre todas las necesidades.',
   'Includes ball head (general use), flat (large muscles), bullet (trigger points), fork (spine/achilles) and cushioned (sensitive areas). For 90% of athletes, this gun covers all needs.'],
  // Product 3
  ['La Theragun Mini es la versi&oacute;n port&aacute;til de la marca l&iacute;der en terapia de percusi&oacute;n. Con <strong>solo 500 g y del tama&ntilde;o de un m&oacute;vil</strong>, es la pistola perfecta para llevar a competiciones HYROX, viajes o tener siempre en la bolsa de gym.',
   'The Theragun Mini is the portable version from the leading percussion therapy brand. At <strong>only 500 g and the size of a phone</strong>, it\'s the perfect gun for HYROX competitions, travel or always having in your gym bag.'],
  ['A pesar de su tama&ntilde;o, el motor QX65 de Therabody entrega una percusi&oacute;n seria (hasta 2.400 rpm). La calidad de construcci&oacute;n es premium: se siente s&oacute;lida y duradera. La app Therabody (opcional) ofrece rutinas de recuperaci&oacute;n guiadas.',
   'Despite its size, Therabody\'s QX65 motor delivers serious percussion (up to 2,400 rpm). Build quality is premium: it feels solid and durable. The Therabody app (optional) offers guided recovery routines.'],
  ['El precio es alto para lo que ofrece (180&euro; vs 65&euro; de la RENPHO con m&aacute;s cabezales y velocidades). Pero si valoras la portabilidad, la calidad de construcci&oacute;n y la marca, la Mini es imbatible en su formato.',
   'The price is high for what it offers (€180 vs €65 for the RENPHO with more heads and speeds). But if you value portability, build quality and the brand, the Mini is unbeatable in its form factor.'],
  // Product 4
  ['Versi&oacute;n compacta del GRID con <strong>superficie patentada de tres zonas de densidad</strong> que simula manos de fisioterapeuta. Incluye acceso a v&iacute;deos tutoriales de uso. El n&uacute;cleo ABS hueco soporta hasta 225 kg sin deformarse.',
   'Compact version of the GRID with <strong>patented three-density-zone surface</strong> simulating physiotherapist hands. Includes access to tutorial videos. The hollow ABS core supports up to 225 kg without deforming.'],
  // Product 5
  ['Rodillo de <strong>espuma dura de alta densidad que resiste hasta 130 kg</strong>. Opci&oacute;n econ&oacute;mica de unycos para automasaje y recuperaci&oacute;n muscular. Perfecto para empezar sin gran inversi&oacute;n. A ~15&euro; es la opci&oacute;n m&aacute;s asequible de la lista.',
   'High-density <strong>hard foam roller rated for up to 130 kg</strong>. Budget option from unycos for self-massage and muscle recovery. Perfect to start without a big investment. At ~€15 it\'s the most affordable option on the list.'],
  // Product 6
  ['Rodillo compacto de <strong>33 cm con superficie texturizada</strong> que mejora el agarre y la presi&oacute;n sobre los m&uacute;sculos. La espuma EVA de alta densidad es firme sin ser dolorosa. Excelente opci&oacute;n econ&oacute;mica para uso diario en casa o en el gym.',
   'Compact <strong>33 cm roller with textured surface</strong> that improves grip and pressure on muscles. High-density EVA foam is firm without being painful. Excellent budget option for daily use at home or the gym.'],
  // Product 7
  ['Rodillo de <strong>45 cm con rejilla 3D que simula los dedos de un masajista</strong>. La espuma EPP de alta densidad mantiene su forma con el uso prolongado. Tama&ntilde;o ideal para trabajar cu&aacute;driceps, isquiotibiales y espalda de forma c&oacute;moda.',
   '<strong>45 cm roller with 3D grid simulating a masseuse\'s fingers</strong>. High-density EPP foam maintains its shape with prolonged use. Ideal size for working quads, hamstrings and back comfortably.'],
  // Product 8
  ['Rodillo con <strong>motor de vibraci&oacute;n integrado con 4 intensidades</strong> que potencia la liberaci&oacute;n miofascial. Combina la presi&oacute;n del foam roller con la percusi&oacute;n de la pistola en un solo dispositivo. Bater&iacute;a recargable por USB con buena autonom&iacute;a.',
   'Roller with <strong>built-in vibration motor with 4 intensities</strong> that enhances myofascial release. Combines foam roller pressure with gun percussion in a single device. USB rechargeable battery with good life.'],
  // Product 9
  ['Rodillo profesional de <strong>ELVIRE SPORT con espuma EVA de alta densidad</strong> que resiste el uso intensivo. La superficie texturizada proporciona diferentes zonas de presi&oacute;n para un masaje m&aacute;s efectivo. Compacto y resistente para llevar al box.',
   'Professional roller from <strong>ELVIRE SPORT with high-density EVA foam</strong> that withstands intensive use. Textured surface provides different pressure zones for more effective massage. Compact and durable for the gym.'],
  // Product 10
  ['Rodillo de <strong>45 cm de longitud para cubrir m&aacute;s superficie muscular</strong> en cada pasada. La rejilla de masaje ofrece tres zonas de densidad para trabajar diferentes profundidades. Perfecto para personas altas o para trabajar la espalda completa de una vez.',
   '<strong>45 cm long roller to cover more muscle surface</strong> per pass. The massage grid offers three density zones for working different depths. Perfect for tall people or working the full back at once.'],
  // Product 11
  ['Kit completo de recuperaci&oacute;n <strong>3 en 1 con rodillo de espuma, bola de masaje y stick de masaje</strong>. El rodillo para grandes m&uacute;sculos, la bola para trigger points y el stick para automasaje en gemelos y antebrazos. Incluye bolsa de transporte. La mejor relaci&oacute;n calidad-variedad del mercado.',
   'Complete <strong>3-in-1 recovery kit with foam roller, massage ball and massage stick</strong>. The roller for large muscles, the ball for trigger points and the stick for self-massage on calves and forearms. Includes carry bag. Best value-variety ratio on the market.'],
  // Product 12
  ['Pistola de masaje con <strong>30 velocidades ajustables y 6 cabezales intercambiables</strong> para trabajar diferentes grupos musculares. Pantalla LCD para controlar la intensidad. Motor silencioso ideal para uso en casa sin molestar.',
   'Massage gun with <strong>30 adjustable speeds and 6 interchangeable heads</strong> for working different muscle groups. LCD display to control intensity. Quiet motor ideal for home use.'],
  // Product 13
  ['Pistola masajeadora Lefity con <strong>30 velocidades y 6 cabezales de masaje</strong> con pantalla LCD para control preciso. Dise&ntilde;ada para terapia de tejido profundo. Excelente relaci&oacute;n calidad-precio para atletas que buscan percusi&oacute;n efectiva.',
   'Lefity massage gun with <strong>30 speeds and 6 massage heads</strong> with LCD display for precise control. Designed for deep tissue therapy. Excellent value for athletes seeking effective percussion.'],
  // Product 14
  ['Pistola RENPHO premium con <strong>funci&oacute;n de calor integrada y conectividad Bluetooth</strong> para controlar rutinas desde la app RENPHO. El calor relaja el m&uacute;sculo antes de la percusi&oacute;n para una recuperaci&oacute;n m&aacute;s profunda. Carga USB-C r&aacute;pida.',
   'Premium RENPHO gun with <strong>built-in heat function and Bluetooth connectivity</strong> to control routines from the RENPHO app. Heat relaxes the muscle before percussion for deeper recovery. Fast USB-C charging.'],
  // Product 15
  ['Pistola profesional con <strong>6 velocidades y 4 cabezales intercambiables</strong>. Motor ultrasilencioso perfecto para usar en cualquier momento. Bater&iacute;a de larga duraci&oacute;n para m&uacute;ltiples sesiones sin recargar. Dise&ntilde;o ergon&oacute;mico para sesi&oacute;nes prolongadas.',
   'Professional gun with <strong>6 speeds and 4 interchangeable heads</strong>. Ultra-quiet motor perfect for use anytime. Long-lasting battery for multiple sessions without recharging. Ergonomic design for prolonged sessions.'],
  // Product 16
  ['La cotsoco incluye <strong>9 cabezales intercambiables &mdash; la selecci&oacute;n m&aacute;s amplia</strong> de esta lista. 20 velocidades con pantalla LCD t&aacute;ctil. Cada cabezal est&aacute; dise&ntilde;ado para una zona espec&iacute;fica: bola, plano, bala, horquilla, amortiguado, etc. Muy completa.',
   'The cotsoco includes <strong>9 interchangeable heads — the widest selection</strong> on this list. 20 speeds with touch LCD display. Each head is designed for a specific area: ball, flat, bullet, fork, cushioned, etc. Very complete.'],
  // Product 17
  ['Pistola EKUPUZ <strong>ligera y port&aacute;til con 30 velocidades</strong>. 6 cabezales de masaje con pantalla LCD. Dise&ntilde;o compacto ideal para llevar al gym o a competiciones. Motor silencioso para uso discreto en cualquier lugar.',
   'EKUPUZ gun <strong>light and portable with 30 speeds</strong>. 6 massage heads with LCD display. Compact design ideal for the gym or competitions. Quiet motor for discreet use anywhere.'],
  // Product 18
  ['La RENPHO Reach tiene un <strong>mango extensible desmontable que permite alcanzar la espalda</strong> sin ayuda. Pantalla LED profesional. Perfecta para atletas que entrenan solos y necesitan tratar la espalda, trapecios y zona lumbar por s&iacute; mismos.',
   'The RENPHO Reach has a <strong>detachable extendable handle that lets you reach your back</strong> without help. Professional LED display. Perfect for athletes who train alone and need to treat their back, traps and lower back on their own.'],
  // Product 19
  ['La arboleaf Mini pesa <strong>solo 0,47 kg &mdash; la m&aacute;s ligera de esta lista</strong>. 5 velocidades hasta 3200 rpm con 4 cabezales de silicona suave. Triple bater&iacute;a de 2000 mAh con carga USB-C. Bajo ruido para uso en cualquier lugar. Rival directa de la Theragun Mini a mitad de precio.',
   'The arboleaf Mini weighs <strong>just 0.47 kg — the lightest on this list</strong>. 5 speeds up to 3200 rpm with 4 soft silicone heads. Triple 2000 mAh battery with USB-C charging. Low noise for use anywhere. Direct rival to the Theragun Mini at half the price.'],
  // Product 20
  ['La RENPHO m&aacute;s completa: <strong>combina percusi&oacute;n con terapia de calor Y fr&iacute;o</strong>. El calor relaja y prepara el m&uacute;sculo; el fr&iacute;o reduce la inflamaci&oacute;n post-esfuerzo. Motor de tejido profundo a 3200 rpm. La opci&oacute;n premium para atletas que quieren todo en un dispositivo.',
   'The most complete RENPHO: <strong>combines percussion with heat AND cold therapy</strong>. Heat relaxes and prepares the muscle; cold reduces post-effort inflammation. Deep tissue motor at 3200 rpm. The premium option for athletes who want everything in one device.'],
  // Conclusion
  ['La combinaci&oacute;n ideal para un atleta h&iacute;brido es <strong>rodillo + pistola</strong>: el <strong><a href="#triggerpoint-grid" style="color:#f97316">TriggerPoint GRID</a></strong> (35&euro;) para grandes grupos musculares y la <strong><a href="#renpho-massage-gun" style="color:#f97316">RENPHO</a></strong> (65&euro;) para puntos espec&iacute;ficos. Por 100&euro; total tienes un kit de recuperaci&oacute;n profesional.',
   'The ideal combination for a hybrid athlete is <strong>roller + gun</strong>: the <strong><a href="#triggerpoint-grid" style="color:#f97316">TriggerPoint GRID</a></strong> (€35) for large muscle groups and the <strong><a href="#renpho-massage-gun" style="color:#f97316">RENPHO</a></strong> (€65) for specific points. For €100 total you have a professional recovery kit.'],
  ['Si solo puedes elegir uno, elige el rodillo. Si ya tienes rodillo y quieres a&ntilde;adir percusi&oacute;n, la RENPHO es la opci&oacute;n m&aacute;s inteligente. Y si la portabilidad es prioritaria (viajes, competiciones), la <strong><a href="#theragun-mini" style="color:#f97316">Theragun Mini</a></strong> cabe en cualquier bolsa.',
   'If you can only choose one, choose the roller. If you already have a roller and want to add percussion, the RENPHO is the smartest option. And if portability is a priority (travel, competitions), the <strong><a href="#theragun-mini" style="color:#f97316">Theragun Mini</a></strong> fits in any bag.'],
  // Newsletter "Ya estás suscrito"
  ['Ya est\\u00e1s suscrito/a. Gracias!', 'You\'re already subscribed. Thanks!'],
  ['\\u2705 Bienvenido/a!', '\\u2705 Welcome!'],
];

let c = 0;
for (const [f, t] of R) {
  if (h.includes(f)) { h = h.replace(f, t); c++; }
}
fs.writeFileSync(p, h, 'utf8');
console.log(`Fixed ${c}/${R.length} product descriptions`);

// Final check
const sp = ['rodillo de espuma', 'pistola de masaje con', 'Versi&oacute;n compacta', 'espuma dura de alta', 'Rodillo compacto', 'Rodillo de <strong>45', 'Rodillo con <strong>motor', 'Rodillo profesional', 'Kit completo de', 'Pistola de masaje con', 'Pistola masajeadora', 'Pistola RENPHO', 'Pistola profesional con', 'La cotsoco incluye', 'Pistola EKUPUZ', 'La RENPHO Reach', 'La arboleaf Mini pesa', 'La RENPHO m&aacute;s completa', 'combinaci&oacute;n ideal'];
const rem = sp.filter(p => h.includes(p));
console.log(rem.length ? 'Still remaining: ' + rem.join(', ') : 'All product descriptions translated!');
