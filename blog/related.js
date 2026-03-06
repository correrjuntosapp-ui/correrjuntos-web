/* Related Articles — shows 4 related posts based on category (ES + EN) */
(function(){
  'use strict';

  /* ── Language detection ── */
  var isEN = /\/blog\/en\//.test(window.location.pathname);

  /* ── Article databases ── */
  var DB_ES=[
{s:'alimentos-antiinflamatorios-runners',t:'15 Alimentos Antiinflamatorios para Runners',c:'Nutrici\u00f3n'},
{s:'apple-watch-running-review',t:'Apple Watch para Running: \u00bfMerece la Pena?',c:'Tecnolog\u00eda'},
{s:'apps-correr-en-grupo',t:'Las 10 Mejores Apps para Correr en Grupo',c:'Entrenamiento'},
{s:'andar-vs-correr',t:'Andar vs Correr: \u00bfQu\u00e9 Es Mejor?',c:'Entrenamiento'},
{s:'asics-gel-nimbus-26-vs-nike-pegasus-41',t:'ASICS Gel-Nimbus 26 vs Nike Pegasus 41',c:'Zapatillas'},
{s:'auriculares-conduccion-osea-vs-in-ear-running',t:'Conducci\u00f3n \u00d3sea vs In-Ear para Correr',c:'Equipamiento'},
{s:'auriculares-running-natacion',t:'Mejores Auriculares para Running y Nataci\u00f3n',c:'Equipamiento'},
{s:'ayuno-intermitente-running',t:'Ayuno Intermitente y Running',c:'Nutrici\u00f3n'},
{s:'bastones-trail-running',t:'Bastones de Trail Running: Gu\u00eda Completa',c:'Trail'},
{s:'bidones-running',t:'8 Mejores Bidones para Running',c:'Equipamiento'},
{s:'beneficios-correr-en-grupo',t:'7 Beneficios de Correr en Grupo',c:'Entrenamiento'},
{s:'beneficios-de-correr',t:'15 Beneficios de Correr Respaldados por la Ciencia',c:'Entrenamiento'},
{s:'cafeina-running-rendimiento',t:'Cafe\u00edna y Running: Mejora tu Rendimiento',c:'Nutrici\u00f3n'},
{s:'calcetines-running',t:'Los 8 Mejores Calcetines para Running',c:'Equipamiento'},
{s:'carga-hidratos-maraton',t:'Carga de Hidratos antes de un Marat\u00f3n',c:'Nutrici\u00f3n'},
{s:'carreras-trail-principiantes',t:'10 Mejores Carreras de Trail para Principiantes',c:'Trail'},
{s:'chalecos-hidratacion-running',t:'7 Mejores Chalecos de Hidrataci\u00f3n',c:'Equipamiento'},
{s:'chubasqueros-running',t:'8 Mejores Chubasqueros para Running',c:'Equipamiento'},
{s:'cinturones-running',t:'8 Mejores Cinturones para Running',c:'Equipamiento'},
{s:'como-calentar-antes-de-correr',t:'C\u00f3mo Calentar Antes de Correr',c:'Entrenamiento'},
{s:'como-correr-mas-rapido',t:'C\u00f3mo Correr M\u00e1s R\u00e1pido: 12 Claves',c:'Entrenamiento'},
{s:'como-elegir-zapatillas-running',t:'C\u00f3mo Elegir Zapatillas de Running',c:'Zapatillas'},
{s:'como-evitar-problemas-digestivos-correr',t:'C\u00f3mo Evitar Problemas Digestivos al Correr',c:'Nutrici\u00f3n'},
{s:'como-elegir-reloj-gps-running',t:'C\u00f3mo Elegir un Reloj GPS para Running',c:'Tecnolog\u00eda'},
{s:'como-preparar-primera-carrera-5k',t:'C\u00f3mo Preparar tu Primera 5K',c:'Entrenamiento'},
{s:'como-respirar-al-correr',t:'C\u00f3mo Respirar al Correr: Gu\u00eda Completa',c:'Entrenamiento'},
{s:'correr-acompanado-cadiz',t:'D\u00f3nde Correr Acompa\u00f1ado en C\u00e1diz',c:'Rutas'},
{s:'conocer-gente-haciendo-deporte',t:'C\u00f3mo Conocer Gente Haciendo Deporte en 2026',c:'Entrenamiento'},
{s:'coros-pace-3-review',t:'COROS PACE 3: Review Completa',c:'Tecnolog\u00eda'},
{s:'correr-acompanado-engancha-mas',t:'Correr Acompa\u00f1ado Engancha M\u00e1s que Solo',c:'Entrenamiento'},
{s:'correr-en-invierno',t:'Correr en Invierno: Gu\u00eda Completa',c:'Entrenamiento'},
{s:'correr-con-sobrepeso',t:'Correr con Sobrepeso: Gu\u00eda Segura',c:'Entrenamiento'},
{s:'correr-en-montana-tecnica',t:'Correr en Monta\u00f1a: T\u00e9cnica Subida y Bajada',c:'Trail'},
{s:'correr-es-social-tendencia',t:'Correr Es Social: La Nueva Tendencia Fitness',c:'Entrenamiento'},
{s:'correr-para-adelgazar',t:'Correr para Adelgazar: Gu\u00eda Cient\u00edfica',c:'Entrenamiento'},
{s:'correr-solo-vs-acompanado',t:'Correr Solo vs Acompa\u00f1ado: Ventajas y Ciencia',c:'Entrenamiento'},
{s:'creatina-para-runners',t:'Creatina para Corredores: 7 Beneficios',c:'Nutrici\u00f3n'},
{s:'cuantas-veces-semana-correr',t:'\u00bfCu\u00e1ntas Veces a la Semana Correr?',c:'Entrenamiento'},
{s:'cuanto-duran-zapatillas-running',t:'\u00bfCu\u00e1nto Duran las Zapatillas de Running?',c:'Zapatillas'},
{s:'de-cero-a-5k',t:'De 0 a 5K: Plan de 8 Semanas',c:'Entrenamiento'},
{s:'desayunos-antes-de-correr',t:'Los 8 Mejores Desayunos Antes de Correr',c:'Nutrici\u00f3n'},
{s:'dieta-runner-que-comer',t:'Dieta para Runners: Qu\u00e9 Comer',c:'Nutrici\u00f3n'},
{s:'dieta-vegetariana-runner',t:'Dieta Vegetariana para Runners',c:'Nutrici\u00f3n'},
{s:'diferencias-trail-vs-asfalto',t:'Trail vs Asfalto: Diferencias y Ventajas',c:'Trail'},
{s:'dolor-rodilla-al-correr',t:'Dolor de Rodilla al Correr: Causas y Tratamiento',c:'Salud'},
{s:'drop-zapatillas-running',t:'Drop en Zapatillas de Running: Gu\u00eda Completa',c:'Zapatillas'},
{s:'empezar-a-correr-con-verguenza',t:'Empezar a Correr Si Te Da Verg\u00fcenza',c:'Entrenamiento'},
{s:'empezar-a-correr-guia-principiantes',t:'C\u00f3mo Empezar a Correr desde Cero',c:'Entrenamiento'},
{s:'empezar-trail-running',t:'C\u00f3mo Empezar en Trail Running',c:'Trail'},
{s:'encontrar-gente-para-correr',t:'C\u00f3mo Encontrar Gente para Correr Cerca de Ti',c:'Entrenamiento'},
{s:'encontrar-runners-malaga',t:'D\u00f3nde Encontrar Runners en M\u00e1laga',c:'Rutas'},
{s:'entrenamiento-trail-running-plan',t:'Plan de Entrenamiento Trail Running',c:'Trail'},
{s:'entrenamiento-por-zonas-running',t:'Entrenamiento por Zonas: FC, Ritmo y Potencia',c:'Entrenamiento'},
{s:'errores-comunes-corredores',t:'10 Errores Comunes de los Corredores',c:'Entrenamiento'},
{s:'errores-principiante-running',t:'7 Errores de Principiante que Nadie Te Cuenta',c:'Entrenamiento'},
{s:'estiramientos-antes-despues-correr',t:'Estiramientos Antes y Despu\u00e9s de Correr',c:'Entrenamiento'},
{s:'estiramientos-post-carrera',t:'Estiramientos Post-Carrera: Recupera R\u00e1pido',c:'Salud'},
{s:'fascitis-plantar-corredores',t:'Fascitis Plantar en Corredores',c:'Salud'},
{s:'foam-rollers-runners',t:'7 Mejores Foam Rollers para Corredores',c:'Equipamiento'},
{s:'gafas-running',t:'8 Mejores Gafas de Sol para Running',c:'Equipamiento'},
{s:'garmin-forerunner-265-vs-coros-pace-3',t:'Garmin Forerunner 265 vs COROS PACE 3',c:'Tecnolog\u00eda'},
{s:'garmin-forerunner-55-review',t:'Garmin Forerunner 55: Review Completa',c:'Tecnolog\u00eda'},
{s:'garmin-venu-3-review',t:'Garmin Venu 3: Review para Runners',c:'Tecnolog\u00eda'},
{s:'gorras-running',t:'8 Mejores Gorras para Running',c:'Equipamiento'},
{s:'grupos-correr-sevilla',t:'Grupos para Correr en Sevilla',c:'Rutas'},
{s:'grupos-running-bilbao',t:'Grupos de Running en Bilbao',c:'Rutas'},
{s:'grupos-running-madrid-principiantes',t:'Grupos de Running en Madrid para Principiantes',c:'Rutas'},
{s:'grupos-running-malaga',t:'Grupos de Running en M\u00e1laga',c:'Rutas'},
{s:'grupos-running-valencia',t:'Grupos de Running en Valencia',c:'Rutas'},
{s:'grupos-running-zaragoza',t:'Grupos de Running en Zaragoza',c:'Rutas'},
{s:'hidratacion-running-guia-completa',t:'Hidrataci\u00f3n para Running: Gu\u00eda Completa',c:'Nutrici\u00f3n'},
{s:'hoka-clifton-9-vs-bondi-8',t:'Hoka Clifton 9 vs Bondi 8',c:'Zapatillas'},
{s:'hierro-para-corredores',t:'Hierro para Corredores: C\u00f3mo Evitar la Anemia',c:'Nutrici\u00f3n'},
{s:'jbl-reflect-flow-pro-review',t:'JBL Reflect Flow Pro: Review para Runners',c:'Equipamiento'},
{s:'lamparas-frontales-running',t:'7 Mejores L\u00e1mparas Frontales para Running',c:'Equipamiento'},
{s:'mallas-running',t:'10 Mejores Mallas para Running',c:'Equipamiento'},
{s:'material-trail-running',t:'Material Imprescindible para Trail Running',c:'Equipamiento'},
{s:'mejor-hora-para-correr',t:'\u00bfCu\u00e1l Es la Mejor Hora para Correr?',c:'Entrenamiento'},
{s:'mejor-reloj-gps-running-calidad-precio',t:'Mejor Reloj GPS Calidad-Precio',c:'Tecnolog\u00eda'},
{s:'mejores-apps-running',t:'10 Mejores Apps para Correr Gratis',c:'Entrenamiento'},
{s:'mejores-auriculares-baratos-running',t:'8 Mejores Auriculares Baratos para Running',c:'Equipamiento'},
{s:'mejores-auriculares-running',t:'Mejores Auriculares para Correr',c:'Equipamiento'},
{s:'mejores-creatinas-running',t:'10 Mejores Creatinas para Running',c:'Suplementaci\u00f3n'},
{s:'mejores-garmin-running',t:'8 Mejores Relojes Garmin para Running',c:'Tecnolog\u00eda'},
{s:'mejores-rutas-correr-barcelona',t:'Mejores Rutas para Correr en Barcelona',c:'Rutas'},
{s:'mejores-rutas-correr-madrid',t:'10 Mejores Rutas para Correr en Madrid',c:'Rutas'},
{s:'mejores-rutas-correr-malaga',t:'10 Mejores Rutas para Correr en M\u00e1laga',c:'Rutas'},
{s:'mejores-rutas-correr-sevilla',t:'10 Mejores Rutas para Correr en Sevilla',c:'Rutas'},
{s:'mejores-rutas-correr-valencia',t:'Mejores Rutas para Correr en Valencia',c:'Rutas'},
{s:'mejores-bebidas-hidratacion-running',t:'10 Mejores Bebidas de Hidrataci\u00f3n Running',c:'Suplementaci\u00f3n'},
{s:'mejores-geles-energeticos-running',t:'10 Mejores Geles Energ\u00e9ticos Running',c:'Suplementaci\u00f3n'},
{s:'mejores-omega-3-runners',t:'10 Mejores Omega 3 para Runners',c:'Suplementaci\u00f3n'},
{s:'mejores-proteinas-running',t:'10 Mejores Prote\u00ednas para Running',c:'Suplementaci\u00f3n'},
{s:'mejores-recuperadores-running',t:'10 Mejores Recuperadores para Running',c:'Suplementaci\u00f3n'},
{s:'mejores-relojes-gps-running',t:'10 Mejores Relojes GPS para Running',c:'Tecnolog\u00eda'},
{s:'mejores-suplementos-runners',t:'Mejores Suplementos para Runners',c:'Nutrici\u00f3n'},
{s:'mejores-zapatillas-placa-carbono',t:'10 Mejores Zapatillas Placa de Carbono',c:'Zapatillas'},
{s:'mejores-zapatillas-running-asfalto',t:'10 Mejores Zapatillas para Asfalto',c:'Zapatillas'},
{s:'mejores-zapatillas-running-baratas',t:'Mejores Zapatillas Baratas para Running',c:'Zapatillas'},
{s:'mejores-zapatillas-trail-running',t:'10 Mejores Zapatillas Trail Running',c:'Zapatillas'},
{s:'mejores-zapatillas-running-mujer',t:'10 Mejores Zapatillas Running Mujer',c:'Zapatillas'},
{s:'mejores-zapatillas-running-principiantes',t:'Mejores Zapatillas para Principiantes',c:'Zapatillas'},
{s:'mejores-zapatillas-running-sobrepeso',t:'Zapatillas Running para Sobrepeso',c:'Zapatillas'},
{s:'mochilas-trail-running',t:'8 Mejores Mochilas de Trail Running',c:'Trail'},
{s:'motivacion-para-correr',t:'10 Trucos de Motivaci\u00f3n para Correr',c:'Entrenamiento'},
{s:'nike-pegasus-41-vs-brooks-ghost-16',t:'Nike Pegasus 41 vs Brooks Ghost 16',c:'Zapatillas'},
{s:'navegacion-gps-trail-running',t:'Navegaci\u00f3n GPS para Trail Running',c:'Trail'},
{s:'new-balance-1080-vs-hoka-clifton',t:'New Balance 1080 vs Hoka Clifton',c:'Zapatillas'},
{s:'no-tengo-con-quien-correr',t:'No Tengo con Qui\u00e9n Correr: Soluciones',c:'Entrenamiento'},
{s:'nutricion-dia-de-carrera',t:'Nutrici\u00f3n D\u00eda de Carrera: Antes, Durante y Despu\u00e9s',c:'Nutrici\u00f3n'},
{s:'nutricion-recuperacion-post-entreno',t:'Nutrici\u00f3n Post-Entreno: Qu\u00e9 Comer Despu\u00e9s de Correr',c:'Nutrici\u00f3n'},
{s:'nutricion-trail-running',t:'Nutrici\u00f3n para Trail Running',c:'Trail'},
{s:'nutricion-para-runners',t:'Qu\u00e9 Comer Antes y Despu\u00e9s de Correr',c:'Nutrici\u00f3n'},
{s:'pack-basico-running-principiantes',t:'Pack B\u00e1sico de Running para Empezar',c:'Equipamiento'},
{s:'periostitis-tibial-running',t:'Periostitis Tibial: Causas y Tratamiento',c:'Salud'},
{s:'plan-entrenamiento-10k',t:'Plan de Entrenamiento 10K',c:'Entrenamiento'},
{s:'plan-entrenamiento-media-maraton',t:'Plan Entrenamiento Media Marat\u00f3n: 12 Semanas',c:'Entrenamiento'},
{s:'polar-pacer-pro-review',t:'Polar Pacer Pro: Review Completa',c:'Tecnolog\u00eda'},
{s:'por-que-dejan-correr-3-meses',t:'Por Qu\u00e9 Dejan de Correr en 3 Meses',c:'Entrenamiento'},
{s:'potencia-en-running',t:'Potencia en Running: Qu\u00e9 Es y C\u00f3mo Entrenar',c:'Entrenamiento'},
{s:'primera-quedada-running',t:'Tu Primera Quedada Running: Gu\u00eda Completa',c:'Entrenamiento'},
{s:'prevenir-lesiones-running',t:'C\u00f3mo Prevenir Lesiones al Correr',c:'Salud'},
{s:'proteinas-para-runners',t:'Prote\u00ednas para Runners: Cu\u00e1nta Necesitas',c:'Nutrici\u00f3n'},
{s:'que-comer-antes-de-correr',t:'Qu\u00e9 Comer Antes de Correr',c:'Nutrici\u00f3n'},
{s:'recuperar-ganas-de-correr',t:'C\u00f3mo Recuperar las Ganas de Correr',c:'Entrenamiento'},
{s:'que-gel-energetico-usar-maraton',t:'Qu\u00e9 Gel Energ\u00e9tico Usar en un Marat\u00f3n',c:'Nutrici\u00f3n'},
{s:'que-zapatillas-running-comprar-segun-nivel',t:'Zapatillas de Running Seg\u00fan tu Nivel',c:'Zapatillas'},
{s:'quedadas-correr-barcelona',t:'Quedadas para Correr en Barcelona',c:'Rutas'},
{s:'recetas-runners-rapidas',t:'10 Recetas R\u00e1pidas para Runners',c:'Nutrici\u00f3n'},
{s:'rodilla-del-corredor',t:'Rodilla del Corredor: Gu\u00eda Completa',c:'Salud'},
{s:'ropa-tecnica-running',t:'Ropa T\u00e9cnica para Correr: Gu\u00eda por Temperatura',c:'Equipamiento'},
{s:'seguridad-correr-con-desconocidos',t:'\u00bfEs Seguro Correr con Desconocidos?',c:'Entrenamiento'},
{s:'salomon-speedcross-6-vs-hoka-speedgoat-6',t:'Salomon Speedcross 6 vs Hoka Speedgoat 6',c:'Trail'},
{s:'seguridad-trail-running',t:'Seguridad en Trail Running: Gu\u00eda Esencial',c:'Trail'},
{s:'snacks-energeticos-running',t:'Los Mejores Snacks Energ\u00e9ticos para Running',c:'Nutrici\u00f3n'},
{s:'soledad-del-runner',t:'La Soledad del Runner',c:'Entrenamiento'},
{s:'shokz-openrun-pro-2-review',t:'Shokz OpenRun Pro 2: Review Completa',c:'Equipamiento'},
{s:'smartwatch-vs-reloj-gps-running',t:'Smartwatch vs Reloj GPS: \u00bfCu\u00e1l Necesitas?',c:'Tecnolog\u00eda'},
{s:'strava-vs-garmin-connect',t:'Strava vs Garmin Connect: Comparativa',c:'Entrenamiento'},
{s:'tendinitis-aquiles-running',t:'Tendinitis de Aquiles en Runners',c:'Salud'},
{s:'ultra-trail-principiantes',t:'Tu Primera Ultra Trail: Gu\u00eda para Principiantes',c:'Trail'},
{s:'unirse-grupo-running',t:'C\u00f3mo Unirte a un Grupo de Running',c:'Entrenamiento'},
{s:'variabilidad-cardiaca-running',t:'Variabilidad Card\u00edaca (HRV) para Runners',c:'Entrenamiento'},
{s:'zapatillas-running-pronadores',t:'Zapatillas para Pronadores: Gu\u00eda Completa',c:'Zapatillas'},
{s:'zapatillas-running-media-maraton',t:'Mejores Zapatillas para Media Marat\u00f3n',c:'Zapatillas'},
{s:'zapatillas-running-pisada-neutra',t:'Zapatillas Running para Pisada Neutra',c:'Zapatillas'},
{s:'zapatillas-running-supinadores',t:'Zapatillas Running para Supinadores',c:'Zapatillas'},
{s:'agujetas-despues-de-correr',t:'Agujetas Despu\u00e9s de Correr: Causas y Remedios',c:'Salud'},
{s:'como-aumentar-resistencia-corriendo',t:'C\u00f3mo Aumentar tu Resistencia Corriendo',c:'Entrenamiento'},
{s:'correr-antes-o-despues-de-comer',t:'Correr Antes o Despu\u00e9s de Comer',c:'Nutrici\u00f3n'},
{s:'correr-con-musica-beneficios',t:'Correr con M\u00fasica: Beneficios y BPM Ideal',c:'Entrenamiento'},
{s:'correr-con-perro-canicross',t:'Correr con Perro (Canicross): Gu\u00eda Completa',c:'Entrenamiento'},
{s:'correr-embarazada-seguro',t:'Correr Embarazada: Gu\u00eda Segura por Trimestre',c:'Salud'},
{s:'correr-en-cinta-vs-calle',t:'Correr en Cinta vs Calle: Comparativa',c:'Entrenamiento'},
{s:'correr-en-verano-calor',t:'Correr en Verano con Calor: Gu\u00eda Segura',c:'Entrenamiento'},
{s:'correr-por-la-noche-consejos',t:'Correr por la Noche: Consejos de Seguridad',c:'Entrenamiento'},
{s:'correr-y-gimnasio-mismo-dia',t:'Correr y Gimnasio el Mismo D\u00eda',c:'Entrenamiento'},
{s:'cuanto-tardo-en-correr-5km',t:'Cu\u00e1nto se Tarda en Correr 5K por Edad',c:'Entrenamiento'},
{s:'diferencia-zapatillas-running-normales',t:'Diferencia Zapatillas Running vs Normales',c:'Equipamiento'},
{s:'empezar-a-correr-despues-de-los-40',t:'Empezar a Correr Despu\u00e9s de los 40',c:'Salud'},
{s:'empezar-a-correr-despues-de-los-50',t:'Empezar a Correr Despu\u00e9s de los 50',c:'Salud'},
{s:'flato-dolor-costado-al-correr',t:'Flato al Correr: Causas y Soluciones',c:'Salud'},
{s:'mejores-superficies-para-correr',t:'Mejores Superficies para Correr',c:'Entrenamiento'},
{s:'puedo-correr-todos-los-dias',t:'\u00bfPuedo Correr Todos los D\u00edas?',c:'Entrenamiento'},
{s:'ritmo-para-principiantes-running',t:'Ritmo para Principiantes: Gu\u00eda de Pace',c:'Entrenamiento'},
{s:'ropa-correr-segun-temperatura',t:'Ropa para Correr Seg\u00fan la Temperatura',c:'Equipamiento'},
{s:'soft-flasks-running',t:'8 Mejores Soft Flasks para Running',c:'Equipamiento'},
{s:'volver-a-correr-despues-de-lesion',t:'Volver a Correr Despu\u00e9s de una Lesi\u00f3n',c:'Salud'},
{s:'hyrox-principiantes-guia',t:'HYROX para Principiantes: Gu\u00eda Completa',c:'Atleta H\u00edbrido'},
{s:'deka-fit-vs-deka-strong',t:'DEKA FIT vs DEKA STRONG: Diferencias',c:'Atleta H\u00edbrido'},
{s:'hyrox-vs-deka-fit',t:'HYROX vs DEKA FIT: Comparativa',c:'Atleta H\u00edbrido'},
{s:'mejores-zapatillas-hyrox',t:'Las 4 Mejores Zapatillas para HYROX',c:'Atleta H\u00edbrido'},
{s:'zapatillas-deka-strong-atlas',t:'Mejores Zapatillas para DEKA',c:'Atleta H\u00edbrido'},
{s:'wall-ball-hyrox-comprar',t:'Mejores Wall Balls para HYROX',c:'Atleta H\u00edbrido'},
{s:'sandbag-lunges-hyrox',t:'Mejores Sandbags para HYROX',c:'Atleta H\u00edbrido'},
{s:'kettlebells-farmer-carry-hyrox',t:'Mejores Kettlebells para Farmer\u2019s Carry',c:'Atleta H\u00edbrido'},
{s:'entrenar-skierg-row-hyrox',t:'C\u00f3mo Entrenar SkiErg y Remo para HYROX',c:'Atleta H\u00edbrido'},
{s:'rodillo-vs-pistola-masaje-recuperacion',t:'Rodillo vs Pistola de Masaje: Cu\u00e1l Elegir',c:'Atleta H\u00edbrido'}
  ];

  var DB_EN=[
{s:'10k-training-plan',t:'10K Training Plan for Beginners',c:'Entrenamiento'},
{s:'achilles-tendinitis-running',t:'Achilles Tendinitis in Runners',c:'Salud'},
{s:'anti-inflammatory-foods-runners',t:'15 Anti-Inflammatory Foods for Runners',c:'Nutrici\u00f3n'},
{s:'apple-watch-running-review',t:'Apple Watch for Running: Is It Worth It?',c:'Tecnolog\u00eda'},
{s:'asics-gel-nimbus-26-vs-nike-pegasus-41',t:'ASICS Gel-Nimbus 26 vs Nike Pegasus 41',c:'Zapatillas'},
{s:'basic-running-pack-beginners',t:'Basic Running Pack: Everything You Need',c:'Entrenamiento'},
{s:'beginner-running-groups-madrid',t:'Beginner Running Groups in Madrid',c:'Rutas'},
{s:'beginner-running-mistakes-nobody-tells',t:'Beginner Running Mistakes Nobody Tells You',c:'Entrenamiento'},
{s:'benefits-of-group-running',t:'7 Benefits of Group Running',c:'Entrenamiento'},
{s:'benefits-of-running',t:'Benefits of Running: 15 Science-Backed Reasons',c:'Entrenamiento'},
{s:'best-apps-running-groups',t:'10 Best Apps for Running Groups 2026',c:'Entrenamiento'},
{s:'best-budget-running-headphones',t:'8 Best Budget Running Headphones',c:'Equipamiento'},
{s:'best-budget-running-shoes',t:'Best Budget Running Shoes 2026',c:'Zapatillas'},
{s:'best-carbon-plate-running-shoes',t:'10 Best Carbon Plate Running Shoes 2026',c:'Zapatillas'},
{s:'best-energy-gels-running',t:'10 Best Energy Gels for Running 2026',c:'Suplementaci\u00f3n'},
{s:'best-garmin-running-watches',t:'8 Best Garmin Running Watches 2026',c:'Tecnolog\u00eda'},
{s:'best-gps-running-watches',t:'10 Best GPS Running Watches 2026',c:'Tecnolog\u00eda'},
{s:'best-hydration-drinks-running',t:'10 Best Hydration Drinks for Running 2026',c:'Suplementaci\u00f3n'},
{s:'best-creatine-running',t:'10 Best Creatine Supplements for Running 2026',c:'Suplementaci\u00f3n'},
{s:'best-omega-3-running',t:'10 Best Omega-3 Supplements for Running 2026',c:'Suplementaci\u00f3n'},
{s:'best-protein-running',t:'10 Best Protein Supplements for Running 2026',c:'Suplementaci\u00f3n'},
{s:'best-recovery-drinks-running',t:'10 Best Recovery Drinks for Running 2026',c:'Suplementaci\u00f3n'},
{s:'best-road-running-shoes',t:'10 Best Road Running Shoes 2026',c:'Zapatillas'},
{s:'best-breakfasts-before-running',t:'8 Best Breakfasts Before Running',c:'Nutrici\u00f3n'},
{s:'best-energy-snacks-for-runners',t:'Best Energy Snacks for Runners',c:'Nutrici\u00f3n'},
{s:'best-half-marathon-shoes',t:'Best Half Marathon Shoes 2026',c:'Zapatillas'},
{s:'best-running-shoes-neutral-gait',t:'Best Running Shoes for Neutral Gait',c:'Zapatillas'},
{s:'best-running-shoes-supinators',t:'Best Running Shoes for Supinators',c:'Zapatillas'},
{s:'best-trekking-poles-trail-running',t:'Best Trekking Poles for Trail Running',c:'Trail'},
{s:'best-trail-running-shoes',t:'10 Best Trail Running Shoes 2026',c:'Zapatillas'},
{s:'best-time-to-run',t:'Best Time of Day to Run: Morning vs Evening',c:'Entrenamiento'},
{s:'best-running-apps',t:'10 Best Free Running Apps 2026',c:'Tecnolog\u00eda'},
{s:'best-running-headphones',t:'Best Running Headphones 2026',c:'Equipamiento'},
{s:'best-running-routes-barcelona',t:'Best Running Routes in Barcelona',c:'Rutas'},
{s:'best-running-routes-madrid',t:'10 Best Running Routes in Madrid',c:'Rutas'},
{s:'best-running-routes-malaga',t:'10 Best Running Routes in Malaga',c:'Rutas'},
{s:'best-running-routes-sevilla',t:'10 Best Running Routes in Seville',c:'Rutas'},
{s:'best-running-routes-valencia',t:'Best Running Routes in Valencia',c:'Rutas'},
{s:'best-running-shoes-beginners',t:'Best Running Shoes for Beginners 2026',c:'Zapatillas'},
{s:'best-running-shoes-overweight',t:'Best Running Shoes for Heavier Runners',c:'Zapatillas'},
{s:'best-supplements-runners',t:'Best Supplements for Runners 2026',c:'Nutrici\u00f3n'},
{s:'best-value-gps-running-watch',t:'Best Value GPS Running Watch 2026',c:'Tecnolog\u00eda'},
{s:'best-womens-running-shoes',t:'10 Best Women\u2019s Running Shoes 2026',c:'Zapatillas'},
{s:'bone-conduction-vs-in-ear-running',t:'Bone Conduction vs In-Ear for Running',c:'Equipamiento'},
{s:'caffeine-running-performance',t:'Caffeine and Running Performance',c:'Nutrici\u00f3n'},
{s:'common-running-mistakes',t:'10 Most Common Running Mistakes',c:'Entrenamiento'},
{s:'coros-pace-3-review',t:'COROS PACE 3: Full Review',c:'Tecnolog\u00eda'},
{s:'couch-to-5k-plan',t:'Couch to 5K: 8-Week Beginner Plan',c:'Entrenamiento'},
{s:'creatine-for-runners',t:'Creatine for Runners: 7 Benefits',c:'Nutrici\u00f3n'},
{s:'find-people-to-run-with',t:'How to Find People to Run With Near You',c:'Entrenamiento'},
{s:'find-runners-malaga',t:'Where to Find Runners in Malaga',c:'Rutas'},
{s:'first-ultra-trail-guide',t:'Your First Ultra Trail: Beginner\u2019s Guide',c:'Trail'},
{s:'first-running-meetup',t:'Your First Running Meetup: Beginner\u2019s Guide',c:'Entrenamiento'},
{s:'foam-rollers-runners',t:'7 Best Foam Rollers for Runners',c:'Salud'},
{s:'garmin-forerunner-265-vs-coros-pace-3',t:'Garmin Forerunner 265 vs COROS PACE 3',c:'Tecnolog\u00eda'},
{s:'garmin-forerunner-55-review',t:'Garmin Forerunner 55: Full Review',c:'Tecnolog\u00eda'},
{s:'garmin-venu-3-review',t:'Garmin Venu 3: Review for Runners',c:'Tecnolog\u00eda'},
{s:'gps-navigation-trail-running',t:'GPS Navigation for Trail Running',c:'Trail'},
{s:'half-marathon-training-plan',t:'Half Marathon Training Plan: 12 Weeks',c:'Entrenamiento'},
{s:'heart-rate-variability-running',t:'Heart Rate Variability (HRV) for Runners',c:'Tecnolog\u00eda'},
{s:'hoka-clifton-9-vs-bondi-8',t:'Hoka Clifton 9 vs Bondi 8',c:'Zapatillas'},
{s:'how-long-running-shoes-last',t:'How Long Do Running Shoes Last?',c:'Zapatillas'},
{s:'how-to-avoid-stomach-issues-running',t:'How to Avoid Stomach Issues While Running',c:'Nutrici\u00f3n'},
{s:'how-to-breathe-while-running',t:'How to Breathe While Running',c:'Entrenamiento'},
{s:'how-to-get-back-into-running',t:'How to Get Back Into Running',c:'Entrenamiento'},
{s:'how-to-choose-gps-running-watch',t:'How to Choose a GPS Running Watch',c:'Tecnolog\u00eda'},
{s:'how-to-choose-running-shoes',t:'How to Choose Running Shoes',c:'Zapatillas'},
{s:'how-to-join-running-group',t:'How to Join a Running Group: Step-by-Step Guide',c:'Entrenamiento'},
{s:'how-many-days-week-run',t:'How Many Days a Week Should You Run?',c:'Entrenamiento'},
{s:'how-to-prepare-first-5k-race',t:'How to Prepare for Your First 5K',c:'Entrenamiento'},
{s:'how-to-run-faster',t:'How to Run Faster: 12 Proven Keys',c:'Entrenamiento'},
{s:'how-to-start-running-beginners-guide',t:'How to Start Running: Beginner\u2019s Guide',c:'Entrenamiento'},
{s:'how-to-warm-up-before-running',t:'How to Warm Up Before Running',c:'Entrenamiento'},
{s:'intermittent-fasting-running',t:'Intermittent Fasting and Running',c:'Nutrici\u00f3n'},
{s:'iron-for-runners',t:'Iron for Runners: How to Prevent Anemia',c:'Nutrici\u00f3n'},
{s:'jbl-reflect-flow-pro-review',t:'JBL Reflect Flow Pro: Review for Runners',c:'Equipamiento'},
{s:'knee-pain-while-running',t:'Knee Pain While Running: Causes & Treatment',c:'Salud'},
{s:'loneliness-of-running',t:'The Loneliness of Running',c:'Entrenamiento'},
{s:'marathon-carb-loading',t:'Marathon Carb Loading: Complete Protocol',c:'Nutrici\u00f3n'},
{s:'meet-people-through-sports',t:'How to Meet People Through Sports in 2026',c:'Entrenamiento'},
{s:'nike-pegasus-41-vs-brooks-ghost-16',t:'Nike Pegasus 41 vs Brooks Ghost 16',c:'Zapatillas'},
{s:'new-balance-1080-vs-hoka-clifton',t:'New Balance 1080 vs Hoka Clifton',c:'Zapatillas'},
{s:'no-one-to-run-with',t:'No One to Run With? Real Solutions',c:'Entrenamiento'},
{s:'nutrition-for-runners',t:'What to Eat Before and After Running',c:'Nutrici\u00f3n'},
{s:'plantar-fasciitis-runners',t:'Plantar Fasciitis in Runners',c:'Salud'},
{s:'polar-pacer-pro-review',t:'Polar Pacer Pro: Full Review',c:'Tecnolog\u00eda'},
{s:'post-run-recovery-nutrition',t:'Post-Run Recovery Nutrition',c:'Nutrici\u00f3n'},
{s:'post-run-stretches',t:'Post-Run Stretches: Recover Faster',c:'Salud'},
{s:'prevent-running-injuries',t:'How to Prevent Running Injuries',c:'Salud'},
{s:'protein-for-runners',t:'Protein for Runners: How Much You Need',c:'Nutrici\u00f3n'},
{s:'quick-recipes-for-runners',t:'10 Quick Recipes for Runners',c:'Nutrici\u00f3n'},
{s:'race-day-nutrition',t:'Race Day Nutrition: Before, During & After',c:'Nutrici\u00f3n'},
{s:'runner-diet-what-to-eat',t:'Runner\u2019s Diet: What to Eat to Run Better',c:'Nutrici\u00f3n'},
{s:'running-shoe-drop-explained',t:'Running Shoe Drop Explained',c:'Zapatillas'},
{s:'runners-knee',t:'Runner\u2019s Knee: Complete Guide',c:'Salud'},
{s:'running-alone-vs-group',t:'Running Alone vs in a Group: Pros, Cons & Science',c:'Entrenamiento'},
{s:'running-belts',t:'8 Best Running Belts 2026',c:'Equipamiento'},
{s:'running-caps',t:'8 Best Running Caps 2026',c:'Equipamiento'},
{s:'running-groups-seville',t:'Running Groups in Seville',c:'Rutas'},
{s:'running-groups-near-me',t:'Running Groups Near Me: Free Local Runs',c:'Rutas'},
{s:'find-running-partners',t:'How to Find Running Partners Near You',c:'Rutas'},
{s:'running-headlamps',t:'7 Best Running Headlamps 2026',c:'Equipamiento'},
{s:'running-hydration-complete-guide',t:'Running Hydration: Complete Guide',c:'Nutrici\u00f3n'},
{s:'running-hydration-vests',t:'7 Best Running Hydration Vests',c:'Equipamiento'},
{s:'running-in-winter',t:'Running in Winter: Complete Guide',c:'Entrenamiento'},
{s:'running-is-social-fitness-trend',t:'Running Is Social: Fitness Trend 2026',c:'Entrenamiento'},
{s:'running-meetups-barcelona',t:'Running Meetups in Barcelona',c:'Rutas'},
{s:'running-motivation-tips',t:'10 Running Motivation Tips That Work',c:'Entrenamiento'},
{s:'running-overweight-guide',t:'Running While Overweight: Safe Guide',c:'Entrenamiento'},
{s:'running-power',t:'Running Power: What It Is and How to Train',c:'Tecnolog\u00eda'},
{s:'running-rain-jackets',t:'8 Best Running Rain Jackets 2026',c:'Equipamiento'},
{s:'running-shoes-overpronators',t:'Running Shoes for Overpronators',c:'Zapatillas'},
{s:'running-socks',t:'8 Best Running Socks 2026',c:'Equipamiento'},
{s:'running-soft-flasks',t:'8 Best Running Soft Flasks 2026',c:'Equipamiento'},
{s:'running-sunglasses',t:'8 Best Running Sunglasses 2026',c:'Equipamiento'},
{s:'running-technical-clothing',t:'Running Technical Clothing Guide',c:'Equipamiento'},
{s:'running-tights',t:'10 Best Running Tights 2026',c:'Equipamiento'},
{s:'running-to-lose-weight',t:'Running to Lose Weight: Science-Based Guide',c:'Entrenamiento'},
{s:'running-water-bottles',t:'8 Best Running Water Bottles 2026',c:'Equipamiento'},
{s:'running-with-others-cadiz',t:'Running With Others in Cadiz',c:'Rutas'},
{s:'safety-running-with-strangers',t:'Is It Safe to Run With Strangers?',c:'Entrenamiento'},
{s:'salomon-speedcross-6-vs-hoka-speedgoat-6',t:'Salomon Speedcross 6 vs Hoka Speedgoat 6',c:'Trail'},
{s:'shin-splints-running',t:'Shin Splints: Causes & Treatment',c:'Salud'},
{s:'shokz-openrun-pro-2-review',t:'Shokz OpenRun Pro 2: Full Review',c:'Equipamiento'},
{s:'smartwatch-vs-gps-watch-running',t:'Smartwatch vs GPS Watch for Running',c:'Tecnolog\u00eda'},
{s:'start-running-when-embarrassed',t:'Start Running When Embarrassed',c:'Entrenamiento'},
{s:'start-trail-running',t:'How to Start Trail Running',c:'Trail'},
{s:'strava-vs-garmin-connect',t:'Strava vs Garmin Connect: Comparison',c:'Tecnolog\u00eda'},
{s:'stretching-before-after-running',t:'Stretching Before and After Running',c:'Entrenamiento'},
{s:'trail-races-beginners',t:'10 Best Trail Races for Beginners',c:'Trail'},
{s:'trail-running-backpacks',t:'8 Best Trail Running Backpacks 2026',c:'Trail'},
{s:'trail-running-gear',t:'Essential Trail Running Gear',c:'Trail'},
{s:'trail-running-nutrition',t:'Trail Running Nutrition: Complete Guide',c:'Trail'},
{s:'trail-running-safety',t:'Trail Running Safety: Essential Tips',c:'Trail'},
{s:'trail-running-training-plan',t:'Trail Running Training Plan: 12 Weeks',c:'Trail'},
{s:'trail-vs-road-running',t:'Trail vs Road Running: Differences',c:'Trail'},
{s:'uphill-downhill-running-technique',t:'Uphill & Downhill Running Technique',c:'Trail'},
{s:'vegetarian-diet-for-runners',t:'Vegetarian Diet for Runners',c:'Nutrici\u00f3n'},
{s:'waterproof-headphones-running-swimming',t:'Best Headphones for Running & Swimming',c:'Equipamiento'},
{s:'walking-vs-running',t:'Walking vs Running: Which Is Better?',c:'Entrenamiento'},
{s:'what-energy-gel-marathon',t:'What Energy Gel to Use for a Marathon',c:'Nutrici\u00f3n'},
{s:'what-to-eat-before-running',t:'What to Eat Before Running',c:'Nutrici\u00f3n'},
{s:'which-running-shoes-by-level',t:'Which Running Shoes by Level',c:'Zapatillas'},
{s:'why-group-running-is-addictive',t:'Why Group Running Is Addictive',c:'Entrenamiento'},
{s:'why-people-quit-running-3-months',t:'Why People Quit Running in 3 Months',c:'Entrenamiento'},
{s:'zone-training-running',t:'Zone Training: HR, Pace and Power Zones',c:'Tecnolog\u00eda'},
{s:'average-5k-time-by-age',t:'Average 5K Time by Age and Gender',c:'Entrenamiento'},
{s:'best-surfaces-for-running',t:'Best Surfaces for Running: Complete Guide',c:'Entrenamiento'},
{s:'how-to-build-running-endurance',t:'How to Build Running Endurance',c:'Entrenamiento'},
{s:'is-it-ok-to-run-every-day',t:'Is It OK to Run Every Day?',c:'Entrenamiento'},
{s:'return-to-running-after-injury',t:'Return to Running After Injury',c:'Salud'},
{s:'running-and-gym-same-day',t:'Running and Gym Same Day: How to Combine',c:'Entrenamiento'},
{s:'running-at-night-safety-tips',t:'Running at Night: Safety Tips',c:'Entrenamiento'},
{s:'running-before-or-after-eating',t:'Running Before or After Eating',c:'Nutrici\u00f3n'},
{s:'running-in-summer-heat',t:'Running in Summer Heat: Safety Guide',c:'Entrenamiento'},
{s:'running-pace-for-beginners',t:'Running Pace for Beginners',c:'Entrenamiento'},
{s:'running-shoes-vs-regular-shoes',t:'Running Shoes vs Regular Shoes',c:'Equipamiento'},
{s:'running-while-pregnant-guide',t:'Running While Pregnant: Safe Guide',c:'Salud'},
{s:'running-with-music-benefits',t:'Running with Music: Benefits and BPM Guide',c:'Entrenamiento'},
{s:'running-with-your-dog-canicross',t:'Running with Your Dog (Canicross)',c:'Entrenamiento'},
{s:'side-stitch-while-running',t:'Side Stitch While Running: Causes and Fixes',c:'Salud'},
{s:'sore-muscles-after-running',t:'Sore Muscles After Running: Recovery Guide',c:'Salud'},
{s:'start-running-after-40',t:'Start Running After 40: Complete Guide',c:'Salud'},
{s:'start-running-after-50',t:'Start Running After 50: Complete Guide',c:'Salud'},
{s:'treadmill-vs-outdoor-running',t:'Treadmill vs Outdoor Running',c:'Entrenamiento'},
{s:'what-to-wear-running-by-temperature',t:'What to Wear Running by Temperature',c:'Equipamiento'}
  ];

  var DB = isEN ? DB_EN : DB_ES;
  var basePath = isEN ? '/blog/en/' : '/blog/';

  /* Category groups for broader matching */
  var GROUPS = {
    'Entrenamiento':['Entrenamiento','Trail'],
    'Trail':['Trail','Entrenamiento','Rutas'],
    'Nutrici\u00f3n':['Nutrici\u00f3n'],
    'Zapatillas':['Zapatillas','Equipamiento'],
    'Equipamiento':['Equipamiento','Zapatillas'],
    'Tecnolog\u00eda':['Tecnolog\u00eda','Equipamiento'],
    'Salud':['Salud','Entrenamiento'],
    'Rutas':['Rutas','Entrenamiento'],
    'Suplementaci\u00f3n':['Suplementaci\u00f3n','Nutrici\u00f3n'],
    'Atleta H\u00edbrido':['Atleta H\u00edbrido','Equipamiento','Entrenamiento'],
  };

  /* Category thumbnail images (same Unsplash URLs as hero system) */
  var CAT_IMGS = {
    'Entrenamiento':'https://images.pexels.com/photos/3756042/pexels-photo-3756042.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Trail':'https://images.pexels.com/photos/8949023/pexels-photo-8949023.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Nutrici\u00f3n':'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Zapatillas':'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Equipamiento':'https://images.pexels.com/photos/4397831/pexels-photo-4397831.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Tecnolog\u00eda':'https://images.pexels.com/photos/4679246/pexels-photo-4679246.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Salud':'https://images.pexels.com/photos/4056832/pexels-photo-4056832.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Rutas':'https://images.pexels.com/photos/4652250/pexels-photo-4652250.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60',
    'Atleta H\u00edbrido':'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60'
  };
  var DEFAULT_IMG = 'https://images.pexels.com/photos/4397831/pexels-photo-4397831.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60';

  /* ── CSS ── */
  var css = document.createElement('style');
  css.textContent = [
    '.related-section{margin:40px 0 32px;padding:32px 0 0;border-top:1px solid rgba(255,255,255,.06)}',
    '.related-title{font-size:1.1rem;font-weight:800;color:#fff;margin:0 0 20px}',
    '.related-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}',
    '.related-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:0;text-decoration:none;transition:all .25s;display:block;overflow:hidden}',
    '.related-card:hover{background:rgba(255,255,255,.06);border-color:rgba(249,115,22,.3);transform:translateY(-2px)}',
    '.related-img{width:100%;height:120px;object-fit:cover;display:block}',
    '.related-body{padding:14px 16px 16px}',
    '.related-cat{font-size:.7rem;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px}',
    '.related-card-title{font-size:.9rem;font-weight:700;color:#cbd5e1;line-height:1.4;margin:0;transition:color .2s}',
    '.related-card:hover .related-card-title{color:#fff}',
    '.related-arrow{font-size:.75rem;color:#64748b;margin-top:8px;transition:color .2s}',
    '.related-card:hover .related-arrow{color:#f97316}',
    '@media(max-width:640px){.related-grid{grid-template-columns:1fr}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ── Find current article ── */
  var path = window.location.pathname.replace(/\/$/,'');
  var slug = path.split('/').pop();
  var current = null;
  for(var i=0;i<DB.length;i++){ if(DB[i].s===slug){ current=DB[i]; break; } }
  if(!current) return;

  /* ── Find related ── */
  var cats = GROUPS[current.c] || [current.c];
  var sameCat = [], otherCat = [];
  for(var j=0;j<DB.length;j++){
    if(DB[j].s===slug) continue;
    if(cats.indexOf(DB[j].c)>=0) sameCat.push(DB[j]);
    else otherCat.push(DB[j]);
  }
  /* Shuffle */
  function shuffle(a){for(var i=a.length-1;i>0;i--){var r=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[r];a[r]=t;}return a;}
  shuffle(sameCat); shuffle(otherCat);
  var picks = sameCat.slice(0,3);
  if(picks.length<4){ picks = picks.concat(otherCat.slice(0,4-picks.length)); }

  if(picks.length<2) return;

  /* ── Build section ── */
  var title = isEN ? '\uD83D\uDCDA Related Articles' : '\uD83D\uDCDA Art\u00edculos relacionados';
  var cta = isEN ? 'Read article \u2192' : 'Leer art\u00edculo \u2192';
  var section = document.createElement('div');
  section.className = 'related-section';
  var html = '<h2 class="related-title">'+title+'</h2><div class="related-grid">';
  for(var k=0;k<picks.length;k++){
    var p = picks[k];
    var img = CAT_IMGS[p.c] || DEFAULT_IMG;
    html += '<a href="'+basePath+p.s+'" class="related-card">' +
      '<img class="related-img" src="'+img+'" alt="'+p.t+'" loading="lazy" width="400" height="200">' +
      '<div class="related-body">' +
      '<div class="related-cat">'+p.c+'</div>' +
      '<p class="related-card-title">'+p.t+'</p>' +
      '<div class="related-arrow">'+cta+'</div>' +
      '</div></a>';
  }
  html += '</div>';
  section.innerHTML = html;

  /* ── Inject after author card or before CTA ── */
  var author = document.querySelector('.author-card');
  var ctaBox = document.querySelector('.cta-box');
  if(author && author.parentNode){
    author.parentNode.insertBefore(section, author.nextSibling);
  } else if(ctaBox && ctaBox.parentNode){
    ctaBox.parentNode.insertBefore(section, ctaBox);
  } else {
    var content = document.querySelector('.content');
    if(content) content.appendChild(section);
  }

})();
