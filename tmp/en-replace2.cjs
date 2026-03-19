const fs = require('fs');
const path = 'C:/Users/guett/OneDrive/Escritorio/correrjuntosV2/blog/en/best-resistance-bands-for-runners.html';
let c = fs.readFileSync(path, 'utf8');

const reps = [
  // Section: Why runners need strength
  ['El running es un deporte predominantemente sagital: te mueves hacia delante y repites el mismo gesto miles de veces. Eso genera desequilibrios musculares predecibles: glúteo medio débil, isquiotibiales acortados, core insuficiente y tobillo inestable. Estos desequilibrios son la raíz de la mayoría de lesiones en corredores: rodilla de corredor, periostitis tibial, fascitis plantar y síndrome de la cintilla iliotibial.',
   'Running is a predominantly sagittal sport: you move forward and repeat the same motion thousands of times. This creates predictable muscle imbalances: weak gluteus medius, tight hamstrings, insufficient core and unstable ankles. These imbalances are the root of most running injuries: runner\'s knee, shin splints, plantar fasciitis and IT band syndrome.'],
  ['Estudios publicados en el British Journal of Sports Medicine confirman que los programas de fuerza reducen las lesiones deportivas hasta un 66% y las lesiones por sobreuso hasta un 50%. Para corredores, el trabajo de fuerza no se trata de ganar volumen muscular, sino de construir resiliencia estructural: tendones más fuertes, articulaciones más estables y músculos que absorben mejor el impacto.',
   'Studies published in the British Journal of Sports Medicine confirm that strength programs reduce sports injuries by up to 66% and overuse injuries by up to 50%. For runners, strength work is not about building muscle mass but about building structural resilience: stronger tendons, more stable joints and muscles that absorb impact better.'],
  ['Además, la fuerza mejora directamente tu economía de carrera. Un corredor con glúteos activos y core estable desperdicia menos energía en movimientos laterales y rotacionales. Si ya trabajas <a href="/blog/en/core-exercises-runners" style="color:#f97316">ejercicios de core específicos para runners</a>, el siguiente paso lógico es complementar con bandas y accesorios que te permitan progresar.',
   'Strength also directly improves your running economy. A runner with active glutes and a stable core wastes less energy on lateral and rotational movements. If you already do <a href="/blog/en/core-exercises-runners" style="color:#f97316">core exercises for runners</a>, the next logical step is to add bands and accessories that let you progress further.'],
  ['No necesitas sesiones largas. Con 2-3 sesiones de 20 minutos a la semana es suficiente para notar mejoras significativas en rendimiento y prevención de lesiones.',
   'You don\'t need long sessions. 2-3 sessions of 20 minutes per week is enough to see significant improvements in performance and injury prevention.'],
  // Top 3 picks
  ['<strong style="color:#ea580c">Si solo vas a comprar 3 cosas:</strong>',
   '<strong style="color:#ea580c">If you\'re only buying 3 things:</strong>'],
  ['<strong>Mini bands de tela (15 €)</strong> — Lo más versátil: activación de glúteos, calentamiento, trabajo de cadera. Imprescindibles.',
   '<strong>Fabric mini bands ($15)</strong> — The most versatile: glute activation, warmup, hip work. Essential.'],
  ['<strong>Foam roller (15 €)</strong> — Recuperación diaria. Tu fisio personal para IT band, gemelos y cuádriceps.',
   '<strong>Foam roller ($15)</strong> — Daily recovery. Your personal physio for IT band, calves and quads.'],
  ['<strong>Entrenamiento en suspensión tipo TRX (30 €)</strong> — Fuerza funcional completa: sentadilla pistol, lunge, remo, plancha.',
   '<strong>Suspension trainer TRX-style ($30)</strong> — Complete functional strength: pistol squats, lunges, rows, planks.'],
  ['<strong>Total: ~60 €</strong> — Un gym completo de corredor por menos que una mensualidad de gimnasio.',
   '<strong>Total: ~$60</strong> — A complete runner\'s gym for less than one month\'s gym membership.'],
  // Bands intro
  ['Las bandas elásticas son el accesorio más polivalente y económico para cualquier corredor. Ocupan menos que un calcetín en la bolsa, pesan nada y permiten trabajar activación muscular, fuerza y movilidad en cualquier lugar. Son ideales para el calentamiento pre-carrera y para sesiones de <a href="/blog/en/cross-training-for-runners" style="color:#f97316">cross-training en casa</a>.',
   'Resistance bands are the most versatile and affordable accessory for any runner. They take up less space than a sock in your bag, weigh nothing and let you work on muscle activation, strength and mobility anywhere. Ideal for pre-run warmups and <a href="/blog/en/cross-training-for-runners" style="color:#f97316">home cross-training sessions</a>.'],
  // Product 1
  ['Si tuvieras que elegir un solo accesorio de esta lista, que sean estas mini bands de tela. La activación de glúteos antes de correr marca una diferencia enorme en la estabilidad de rodilla y cadera, y estas bandas lo hacen posible en 5 minutos. El material de tela antideslizante no se enrolla como las de látex, lo que las hace mucho más cómodas de usar sobre la piel.',
   'If you could only pick one accessory from this list, make it these fabric mini bands. Glute activation before running makes a huge difference in knee and hip stability, and these bands make it possible in 5 minutes. The non-slip fabric material doesn\'t roll up like latex bands, making them far more comfortable on skin.'],
  ['El set de 5 resistencias te permite progresar durante meses sin necesidad de comprar nada más. Empieza con la ligera para activación y calentamiento, y sube a las más fuertes para sentadillas con banda y caminata lateral.',
   'The set of 5 resistance levels lets you progress for months without buying anything else. Start with light for activation and warmup, then move to heavier ones for banded squats and lateral walks.'],
  // Product 2
  ['Estas bandas largas de látex son el complemento perfecto a las mini bands. Su longitud de 208 cm permite usarlas para estiramientos asistidos (isquiotibiales, flexores de cadera), pull-ups asistidas y sentadillas con resistencia progresiva. Son las que recomendamos si quieres trabajar <a href="/blog/en/leg-strength-exercises-runners" style="color:#f97316">ejercicios de fuerza de piernas</a> sin pesas.',
   'These long latex bands are the perfect complement to mini bands. Their 208 cm length makes them ideal for assisted stretches (hamstrings, hip flexors), assisted pull-ups and progressive resistance squats. These are our pick if you want to do <a href="/blog/en/leg-strength-exercises-runners" style="color:#f97316">leg strength exercises</a> without weights.'],
  ['El rango de 50-125 LB cubre desde movilidad suave hasta fuerza seria. El látex natural ofrece una resistencia constante y duradera que no pierde elasticidad con el uso.',
   'The 50-125 LB range covers everything from gentle mobility to serious strength. Natural latex provides consistent, long-lasting resistance that doesn\'t lose elasticity with use.'],
  // Product 3
  ['Este kit convierte cualquier puerta de tu casa en una estación de entrenamiento completa. Las asas y tobilleras permiten replicar ejercicios de polea: remos para la espalda, extensiones de tríceps, patadas de glúteo y rotaciones de hombro. Para corredores, la capacidad de trabajar cadenas posteriores con resistencia variable es muy valiosa.',
   'This kit turns any door in your home into a complete training station. The handles and ankle straps let you replicate cable exercises: back rows, tricep extensions, glute kickbacks and shoulder rotations. For runners, the ability to work posterior chains with variable resistance is invaluable.'],
  ['La combinación de varias bandas permite ajustar la resistencia total sumándolas, algo muy práctico para ir progresando sin comprar equipamiento adicional.',
   'Combining multiple bands lets you adjust total resistance by stacking them, a practical way to progress without buying additional equipment.'],
  // Suspension intro
  ['El entrenamiento en suspensión es probablemente el sistema con mejor relación esfuerzo-beneficio para corredores. Con un solo accesorio puedes trabajar fuerza, equilibrio y movilidad de todo el cuerpo. Y lo mejor: cada ejercicio requiere estabilización constante, lo que activa el core de forma automática.',
   'Suspension training is probably the best effort-to-benefit system for runners. With a single accessory you can work on full-body strength, balance and mobility. The best part: every exercise requires constant stabilization, which automatically activates your core.'],
  // Product 4
  ['Este sistema de suspensión es una inversión que amortizarás en semanas. Permite realizar sentadillas a una pierna (pistol squats), lunges suspendidos, remos invertidos y planchas dinámicas, todos ejercicios con transferencia directa al running. Al depender de tu peso corporal y del ángulo de inclinación, la progresión es natural e intuitiva.',
   'This suspension system is an investment you\'ll pay off in weeks. It enables single-leg squats (pistol squats), suspended lunges, inverted rows and dynamic planks — all exercises with direct transfer to running. Since it relies on your body weight and angle of inclination, progression is natural and intuitive.'],
  ['Se ancla en cualquier puerta, barra o incluso en la rama de un árbol en el parque. Pesa poco y se pliega en una bolsa pequeña, así que puedes llevarlo a tus sesiones de running al aire libre y combinar carrera + fuerza en el mismo entrenamiento.',
   'It anchors to any door, bar or even a tree branch in the park. It\'s lightweight and folds into a small bag, so you can bring it to your outdoor running sessions and combine running + strength in the same workout.'],
  // Core intro
  ['Un core fuerte no significa tener abdominales marcados: significa tener una faja muscular que estabilice tu pelvis y columna en cada zancada. Si notas que al final de tus tiradas largas empiezas a tambalear o a perder la postura, el core es tu asignatura pendiente. Estos tres accesorios trabajan la estabilidad desde ángulos complementarios. Para una rutina detallada, consulta nuestro artículo de <a href="/blog/en/core-exercises-runners" style="color:#f97316">core específico para runners</a>.',
   'A strong core doesn\'t mean visible abs: it means having a muscular corset that stabilizes your pelvis and spine with every stride. If you notice wobbling or losing posture at the end of long runs, core is your weak link. These three accessories work stability from complementary angles. For a detailed routine, check our <a href="/blog/en/core-exercises-runners" style="color:#f97316">core exercises for runners</a> guide.'],
  // Product 5
  ['La rueda abdominal es uno de los ejercicios de core anti-extensión más efectivos que existen, y la anti-extensión es exactamente lo que necesita un corredor para mantener la postura en kilómetros largos. Este modelo con doble rueda ofrece más estabilidad lateral que las de una sola rueda, lo que permite concentrarse en el trabajo abdominal sin preocuparse por el equilibrio.',
   'The ab wheel is one of the most effective core anti-extension exercises there is, and anti-extension is exactly what runners need to maintain posture over long distances. This dual-wheel model offers more lateral stability than single-wheel versions, letting you focus on the ab work without worrying about balance.'],
  ['La alfombrilla incluida protege las rodillas en superficies duras. Empieza desde las rodillas con recorrido corto y ve ampliando el rango a medida que ganes fuerza.',
   'The included knee pad protects your knees on hard surfaces. Start from your knees with a short range and gradually extend as you build strength.'],
  // Product 6
  ['La pelota de Pilates transforma ejercicios básicos en retos de estabilidad. Un puente de glúteos con los pies en la pelota activa mucho más el core y los isquiotibiales que en el suelo. El curl de isquiotibiales sobre pelota es uno de los mejores ejercicios preventivos para la lesión de isquios, una de las más comunes en corredores.',
   'The exercise ball transforms basic exercises into stability challenges. A glute bridge with feet on the ball activates far more core and hamstrings than on the floor. The hamstring curl on the ball is one of the best preventive exercises for hamstring injuries, one of the most common in runners.'],
  ['Elige la talla según tu altura: 55 cm si mides menos de 1,65 m, 65 cm entre 1,65-1,80 m y 75 cm si mides más de 1,80 m. El material anti-explosión garantiza seguridad incluso con carga.',
   'Choose the size based on your height: 55 cm if under 5\'5", 65 cm between 5\'5"-5\'11" and 75 cm if over 5\'11". The anti-burst material ensures safety even under load.'],
  // Product 7
  ['Si has sufrido esguinces o tienes tobillos inestables, este disco debería ser obligatorio en tu rutina. El equilibrio unipodal sobre superficie inestable entrena los propioceptores del tobillo y fortalece los peroneos, los músculos que previenen la torcedura lateral. Dos minutos al día por pie son suficientes para notar mejora.',
   'If you\'ve suffered sprains or have unstable ankles, this disc should be mandatory in your routine. Single-leg balance on an unstable surface trains ankle proprioceptors and strengthens the peroneal muscles that prevent lateral rolling. Two minutes per foot per day is enough to notice improvement.'],
  ['También funciona como cojín para sentarse en la oficina, manteniendo la musculatura del core ligeramente activa durante el día. La superficie texturizada por ambos lados permite variar el estímulo.',
   'It also works as an office seat cushion, keeping your core muscles slightly active throughout the day. The textured surface on both sides lets you vary the stimulus.'],
  // Recovery intro
  ['La recuperación no es un lujo: es parte del entrenamiento. Los kilómetros destruyen fibras musculares y generan adherencias en la fascia que, si no se tratan, se acumulan y limitan el rango de movimiento. Estos tres accesorios cubren desde el auto-masaje general hasta el trabajo de puntos gatillo específicos. Si ya usas <a href="/blog/en/foam-rollers-runners" style="color:#f97316">foam roller</a>, aquí encontrarás opciones complementarias para llevar tu recuperación al siguiente nivel.',
   'Recovery is not a luxury: it\'s part of training. Miles destroy muscle fibers and create fascial adhesions that, if left untreated, accumulate and limit range of motion. These three accessories cover everything from general self-massage to specific trigger point work. If you already use a <a href="/blog/en/foam-rollers-runners" style="color:#f97316">foam roller</a>, here you\'ll find complementary options to take your recovery to the next level.'],
  // Product 8
  ['El foam roller es probablemente el accesorio de recuperación con mejor relación calidad-precio para corredores. Rodar la banda iliotibial, los cuádriceps y los gemelos después de cada sesión reduce la rigidez muscular y mejora la circulación. Este modelo de densidad alta ofrece un masaje profundo que realmente llega al tejido fascial.',
   'The foam roller is probably the best value recovery accessory for runners. Rolling the IT band, quads and calves after each session reduces muscle stiffness and improves circulation. This high-density model delivers deep massage that truly reaches the fascial tissue.'],
  ['Su tamaño de 33 cm es compacto pero suficiente para trabajar cualquier grupo muscular. La superficie texturizada simula la presión de los dedos de un fisioterapeuta, alternando zonas lisas y con relieve para un masaje más efectivo.',
   'Its 33 cm size is compact yet sufficient for any muscle group. The textured surface simulates a physiotherapist\'s finger pressure, alternating smooth and ridged zones for more effective massage.'],
  // Product 9
  ['Cuando el foam roller no llega o necesitas trabajar zonas específicas con más precisión, la pistola de masaje es la herramienta. Sus 30 velocidades permiten ajustar la intensidad desde un masaje suave de activación hasta percusión profunda para deshacer nudos musculares. Los 10 cabezales intercambiables cubren desde grandes grupos musculares hasta puntos gatillo diminutos.',
   'When the foam roller can\'t reach or you need to work specific areas with more precision, the massage gun is the tool. Its 30 speeds let you adjust intensity from gentle activation massage to deep percussion for breaking up muscle knots. The 10 interchangeable heads cover everything from large muscle groups to tiny trigger points.'],
  ['Con menos de 45 dB de ruido, puedes usarla viendo la tele sin molestar. La batería de 6 horas significa que no vas a quedarte sin carga en semanas de uso normal. Especialmente útil después de tiradas largas o entrenamientos de series.',
   'At under 45 dB noise, you can use it watching TV without bothering anyone. The 6-hour battery means you won\'t run out of charge for weeks of normal use. Especially useful after long runs or interval sessions.'],
  // Product 10
  ['Si sufres de <a href="/blog/en/plantar-fasciitis-runners" style="color:#f97316">fascitis plantar</a>, estas pelotas pueden convertirse en tu mejor amigo. Rodar la planta del pie sobre la pelota de pinchos durante 2-3 minutos al día alivia la tensión de la fascia plantar de forma notable. El set de tres durezas permite ir de un masaje suave a uno intenso según la zona y la tolerancia.',
   'If you suffer from <a href="/blog/en/plantar-fasciitis-runners" style="color:#f97316">plantar fasciitis</a>, these balls can become your best friend. Rolling the sole of your foot over the spiky ball for 2-3 minutes daily noticeably relieves plantar fascia tension. The set of three firmness levels lets you go from gentle to intense massage depending on the area and your tolerance.'],
  ['También son perfectas para el piriforme (un músculo profundo del glúteo que comprime el nervio ciático cuando está tenso) y para puntos gatillo en la espalda alta. Por 10 € son una de las mejores inversiones de esta lista.',
   'They\'re also perfect for the piriformis (a deep glute muscle that compresses the sciatic nerve when tight) and for trigger points in the upper back. At $10, they\'re one of the best investments on this list.'],
  // Extras intro
  ['Estos dos accesorios completan tu equipamiento básico de corredor en casa. No son imprescindibles para empezar, pero marcan la diferencia cuando quieres subir el nivel de tus sesiones.',
   'These two accessories complete your basic runner\'s home gym setup. Not essential to start, but they make a difference when you want to level up your sessions.'],
  // Product 11
  ['Las tobilleras lastradas son un complemento excelente para ejercicios de activación de glúteo medio (elevaciones laterales, extensiones de cadera). Para corredores, el glúteo medio es clave para evitar la caída de pelvis durante la carrera, y añadir peso gradual a estos ejercicios acelera las ganancias de fuerza.',
   'Weighted ankle straps are an excellent complement for gluteus medius activation exercises (lateral raises, hip extensions). For runners, the gluteus medius is key to preventing pelvic drop during running, and gradually adding weight to these exercises accelerates strength gains.'],
  ['El peso ajustable de 0,5 a 4 kg por unidad permite una progresión muy precisa. El cierre de velcro asegura un ajuste firme sin deslizamientos. Importante: no se recomiendan para correr con ellas puestas, solo para ejercicios de fuerza.',
   'The adjustable weight from 0.5 to 4 kg per unit allows very precise progression. The Velcro closure ensures a firm fit without slipping. Important: not recommended for running with them on, only for strength exercises.'],
  // Product 12
  ['Una esterilla gruesa es la base sobre la que se construye todo lo demás. Los 13 mm de grosor protegen rodillas, codos y espalda en ejercicios de suelo, algo que las esterillas finas de yoga no consiguen. Si vas a hacer planchas, rueda abdominal, puentes de glúteo o <a href="/blog/en/stretching-before-after-running" style="color:#f97316">estiramientos post-carrera</a>, necesitas una superficie que amortigüe.',
   'A thick mat is the foundation everything else is built on. The 13 mm thickness protects knees, elbows and back during floor exercises, something thin yoga mats can\'t do. If you\'re doing planks, ab wheel, glute bridges or <a href="/blog/en/stretching-before-after-running" style="color:#f97316">post-run stretches</a>, you need a surface that cushions.'],
  ['El material NBR de alta densidad no se deforma con el uso y ofrece agarre tanto por arriba (para tus pies y manos) como por abajo (para que no se deslice sobre el suelo). La correa de transporte incluida facilita llevarla al parque.',
   'The high-density NBR material doesn\'t deform with use and provides grip on top (for your feet and hands) and bottom (to prevent sliding on the floor). The included carrying strap makes it easy to take to the park.'],
  // How to choose
  ['Antes de añadir todo al carrito, piensa en qué fase estás como corredor y cuáles son tus puntos débiles. No necesitas los 12 productos: necesitas los que resuelvan tus problemas concretos.',
   'Before adding everything to your cart, think about where you are as a runner and what your weak points are. You don\'t need all 12 products: you need the ones that solve your specific problems.'],
  ['<strong style="color:#ea580c">Si eres principiante o nunca has hecho fuerza:</strong> Empieza con las mini bands de tela, el foam roller y la esterilla. Con estos tres accesorios y una buena rutina tienes para meses de progresión. Total: unos 55 €.',
   '<strong style="color:#ea580c">If you\'re a beginner or never done strength:</strong> Start with fabric mini bands, foam roller and mat. With these three accessories and a good routine you have months of progression. Total: about $55.'],
  ['<strong style="color:#ea580c">Si ya haces fuerza básica y quieres progresar:</strong> Añade el sistema de suspensión (TRX) y las bandas largas. Te permitirán hacer ejercicios más avanzados como sentadillas a una pierna, lunges con suspensión y estiramientos asistidos.',
   '<strong style="color:#ea580c">If you already do basic strength and want to progress:</strong> Add the suspension trainer (TRX) and long bands. They\'ll let you do more advanced exercises like single-leg squats, suspended lunges and assisted stretches.'],
  ['<strong style="color:#ea580c">Si te lesionas con frecuencia:</strong> Prioriza la recuperación. Foam roller + pelotas de masaje + pistola de masaje es la combinación ideal. Y si son esguinces o problemas de tobillo, el disco de estabilidad es obligatorio.',
   '<strong style="color:#ea580c">If you get injured frequently:</strong> Prioritize recovery. Foam roller + massage balls + massage gun is the ideal combination. And if it\'s sprains or ankle problems, the balance disc is mandatory.'],
  ['Busca materiales duraderos (tela > látex en mini bands), resistencia progresiva (sets con varios niveles), portabilidad (bolsa incluida) y polivalencia (que sirva para varios ejercicios). Evita lo más barato si sacrifica durabilidad: una banda que se rompe a las dos semanas no es ahorro.',
   'Look for durable materials (fabric > latex in mini bands), progressive resistance (sets with multiple levels), portability (bag included) and versatility (works for multiple exercises). Avoid the cheapest option if it sacrifices durability: a band that breaks in two weeks is no bargain.'],
  // Routine
  ['Esta rutina usa los accesorios de la lista y trabaja los puntos débiles más comunes en corredores. Puedes hacerla 2-3 veces por semana, idealmente después de correr o en días de descanso activo.',
   'This routine uses the accessories from this list and targets the most common weak points in runners. Do it 2-3 times per week, ideally after running or on active recovery days.'],
  ['<strong style="color:#ea580c">Bloque 1 — Activación (4 min):</strong>', '<strong style="color:#ea580c">Block 1 — Activation (4 min):</strong>'],
  ['<strong>Caminata lateral con mini band</strong> — 15 pasos cada lado × 2 series', '<strong>Lateral walk with mini band</strong> — 15 steps each side × 2 sets'],
  ['<strong>Clamshell con mini band</strong> — 12 reps cada lado × 2 series', '<strong>Clamshell with mini band</strong> — 12 reps each side × 2 sets'],
  ['<strong style="color:#ea580c">Bloque 2 — Fuerza (10 min):</strong>', '<strong style="color:#ea580c">Block 2 — Strength (10 min):</strong>'],
  ['<strong>Sentadilla búlgara en TRX</strong> — 10 reps cada pierna × 3 series', '<strong>Bulgarian split squat on TRX</strong> — 10 reps each leg × 3 sets'],
  ['<strong>Remo invertido en TRX</strong> — 12 reps × 3 series', '<strong>TRX inverted row</strong> — 12 reps × 3 sets'],
  ['<strong>Puente de glúteos con pies en pelota Pilates</strong> — 15 reps × 3 series', '<strong>Glute bridge with feet on exercise ball</strong> — 15 reps × 3 sets'],
  ['<strong>Rueda abdominal desde rodillas</strong> — 8-10 reps × 3 series', '<strong>Ab wheel rollout from knees</strong> — 8-10 reps × 3 sets'],
  ['<strong style="color:#ea580c">Bloque 3 — Equilibrio y propiocepción (3 min):</strong>', '<strong style="color:#ea580c">Block 3 — Balance & proprioception (3 min):</strong>'],
  ['<strong>Apoyo unipodal sobre disco de estabilidad</strong> — 30 seg cada pie × 2 series', '<strong>Single-leg stand on balance disc</strong> — 30 sec each foot × 2 sets'],
  ['<strong>Sentadilla a una pierna sobre disco</strong> — 6 reps cada pie × 2 series', '<strong>Single-leg squat on disc</strong> — 6 reps each foot × 2 sets'],
  ['<strong style="color:#ea580c">Bloque 4 — Recuperación (3 min):</strong>', '<strong style="color:#ea580c">Block 4 — Recovery (3 min):</strong>'],
  ['<strong>Foam roller en cuádriceps</strong> — 45 seg cada pierna', '<strong>Foam roller on quads</strong> — 45 sec each leg'],
  ['<strong>Foam roller en IT band</strong> — 45 seg cada pierna', '<strong>Foam roller on IT band</strong> — 45 sec each leg'],
  ['<strong>Pelota de pinchos en planta del pie</strong> — 30 seg cada pie', '<strong>Spiky ball on foot sole</strong> — 30 sec each foot'],
  ['Cuando un ejercicio te resulte fácil (puedes hacer las reps sin esfuerzo), sube la resistencia de la banda, aumenta el rango de movimiento o añade una serie extra. La clave es la progresión gradual, no el volumen.',
   'When an exercise feels easy (you can do the reps without effort), increase band resistance, extend range of motion or add an extra set. The key is gradual progression, not volume.'],
  // FAQ body content
  ['Lo ideal son 2-3 sesiones de 20-30 minutos por semana. Estudios muestran que con esta frecuencia se obtienen mejoras significativas en economía de carrera y prevención de lesiones. No hace falta más: la fuerza complementa al running, no lo sustituye.',
   '2-3 sessions of 20-30 minutes per week is ideal. Studies show this frequency produces significant improvements in running economy and injury prevention. No more is needed: strength complements running, it doesn\'t replace it.'],
  ['Para la mayoría de corredores populares, sí. El trabajo de fuerza que necesita un runner se centra en activación muscular, estabilidad y fuerza-resistencia, no en levantar pesos máximos. Las bandas ofrecen resistencia progresiva suficiente para estos objetivos sin necesidad de máquinas ni barras con discos.',
   'For most recreational runners, yes. The strength work runners need focuses on muscle activation, stability and strength-endurance, not maximal lifts. Bands offer enough progressive resistance for these goals without needing machines or barbells.'],
  ['Empieza siempre con resistencia ligera-media. Es preferible dominar la técnica y la activación muscular con tensión moderada antes de subir. Un set con varias resistencias es la mejor inversión porque te acompaña a medida que ganas fuerza sin necesidad de comprar nada nuevo.',
   'Always start with light-to-medium resistance. It\'s better to master technique and muscle activation with moderate tension before increasing. A set with multiple resistance levels is the best investment as it grows with you without needing to buy anything new.'],
  ['Son complementarios, no excluyentes. El foam roller permite un auto-masaje más amplio y profundo (ideal para IT band, cuádriceps y gemelos), mientras que la pistola de masaje es mejor para puntos gatillo localizados y zonas difíciles de alcanzar. Si solo puedes comprar uno, empieza por el foam roller.',
   'They are complementary, not exclusive. The foam roller allows broader and deeper self-massage (ideal for IT band, quads and calves), while the massage gun is better for localized trigger points and hard-to-reach areas. If you can only buy one, start with the foam roller.'],
  ['Sí, pero el orden importa. Lo ideal es correr primero y hacer fuerza después, para no fatigar las piernas antes de la carrera. Si son sesiones de calidad (series o tempo), es mejor separar la fuerza a otro día. Para rodajes suaves, combinar es perfectamente viable.',
   'Yes, but order matters. Ideally run first and do strength after, to avoid fatiguing your legs before running. For quality sessions (intervals or tempo), it\'s better to separate strength to another day. For easy runs, combining is perfectly fine.'],
  ['No, para nada. Si empiezas de cero, con unas mini bands de tela (~15 €), un foam roller (~15 €) y una esterilla (~25 €) tienes un kit de corredor completo por 55 €. Ve añadiendo accesorios según descubras tus puntos débiles y tus objetivos evolucionen.',
   'Not at all. If starting from scratch, fabric mini bands (~$15), a foam roller (~$15) and a mat (~$25) give you a complete runner\'s kit for $55. Add accessories as you discover your weak points and your goals evolve.'],
];

let count = 0;
for (const [old, nw] of reps) {
  if (c.includes(old)) { c = c.split(old).join(nw); count++; }
}

fs.writeFileSync(path, c, 'utf8');
console.log('Replaced ' + count + ' body content patterns');
