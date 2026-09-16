# Contrato de medición comercial — V12

Diseño de medición, no informe de resultados. Fecha: 11 septiembre 2026. Objetivo: comprobar si la portada ayuda a conseguir usuarios activos y clientes, no premiar clics sin valor. No hay baseline de conversiones verificado, publicación de V12 ni objetivo numérico de ROI aprobado.

## Tres indicadores principales

| Indicador | Cálculo y fuente | Decisión y límite |
|---|---|---|
| Intención de descarga | Sesiones consentidas con al menos un home_download_click / sesiones consentidas que ven la home. GA4, URL raíz. Deduplicar por sesión. | Comparar claridad del hero/CTA. Es una señal intermedia, NO instalaciones. Separar smart_link y tiendas directas sin sumar porcentajes solapados. |
| Activación del usuario nuevo a 7 días | Cuentas nuevas con primer entrenamiento completado dentro de 7 días / cuentas nuevas elegibles con 7 días completos de observación. Fuente nativa/BD verificada en lectura antes de calcular. | Detectar si la promesa se cumple en el producto. Excluir demos y QA mediante clasificación documentada. No atribuir esta tasa a la web sin unión demostrada. |
| Margen de contribución de la cohorte | Cobros netos verificados menos reembolsos, comisiones y costes variables atribuibles durante un horizonte declarado; cohortes y fechas equivalentes. | Evaluar ventas rentables, no trials ni valor teórico. Fuente financiera: tiendas/RevenueCat y costes reales. No multiplicar purchase_success por 4,99 €. |

Diagnósticos: pantalla explorada antes de descargar; destino y posición del CTA; navegación al blog por deporte. En la app, primer entrenamiento visto → iniciado → completado, por usuario y no por cantidad bruta de eventos.

Guardas: cero eventos nuevos antes del consentimiento; no empeorar errores ni abandono del primer entrenamiento. Monitorizar devoluciones/cancelaciones en la misma cohorte. Clics del newsletter no cuentan como usuarios de la app ni como ventas.

## Eventos web implementados

| Evento | Parámetros controlados | Disparo |
|---|---|---|
| home_download_click | home_version=v12; destination=app_store/google_play/smart_link; placement=header/hero/pricing/download/other | Clic en un enlace autorizado de descarga, únicamente con consentimiento y hostname de producción. |
| home_gallery_select | home_version=v12; screen_id=01-inicio/02-plan/03-sesion/04-carreras/05-ana | Selección de una pantalla, incluido el recorrido guiado. Es interacción, no entrenamiento. |
| home_blog_click | home_version=v12; sport=running/cycling; link_type=article/index | Clic editorial hacia /blog desde la sección del blog; excluye el enlace a la política editorial. |
| lead_magnet_signup (existente) | lead_magnet=plan-10k-preview; location=homepage; duplicate=false | Respuesta nueva correcta del API con consentimiento. 409/500 no emiten Lead ni signup. No certifica doble opt-in. |

No se registran parámetros de campaña en estos eventos custom: GA4 usa su atribución de sesión existente. Los parámetros nuevos necesitan dimensiones personalizadas o exportación para segmentarlos; no se han configurado consolas. Antes de publicar, resolver quién es dueño de la propiedad GA4 y no añadir una segunda instalación. El código preserva G-RQYYGNC12T, no resuelve el conflicto histórico de propiedad.

UTM: source/medium/campaign/content/term, máximo 80 caracteres y solo letras ASCII, números, guion o guion bajo. Convenio propuesto: utm_source=newsletter&utm_medium=email&utm_campaign=launch_v12. No incluir emails, IDs personales ni frases libres. Caducidad local de 30 días; no guardar ni propagar al rechazar. En Apple se transmite ct y en Google Play referrer; su recepción y reporting requieren comprobación autorizada en las tiendas. No se acredita Install Referrer nativo ni atribución individual multi-dispositivo.

## Evidencia nativa consultada, sin modificar

Fuente: candidato a61ccf60346bc277a14b11d693fc3202c3e427af en C:/tmp/cj-release-home-20260910.

- src/utils/firstWorkoutEvents.ts: first_workout_viewed/started/completed comprobados contra user_workouts; falla cerrado si no puede demostrar el primer entrenamiento. No presupone cobertura de todos los deportes ni de Fuerza: verificar sus call sites y datos antes de usarlo como indicador global.
- src/utils/analytics.ts: transporte con event_id y compatibilidad params._event_id. Deduplicar según el esquema remoto real; no sumar entregas redundantes como acciones distintas. No se consulta ni modifica el esquema en esta ronda.
- src/context/PremiumContext.tsx: purchase_success después de la concesión del entitlement; existe contrato para compras individuales. Un entitlement concedido o un trial no demuestra ingreso liquidado. Conciliar IDs de transacción, entorno sandbox/producción, moneda, reembolsos y recibos antes de informar ventas.

No se ha probado aquí instalación → cuenta nueva → sesión completa → pago/restauración. Las pruebas web terminan en destinos simulados y no sustituyen ese QA.

## Lectura tras una publicación autorizada

1. Registrar T0 real del deploy y versión nativa disponible; hoy T0 está pendiente. No interpretar visitas a localhost como tráfico de clientes.
2. Validar en DebugView el contrato con una sesión de prueba consentida, clasificada como interna; sin compra real. No configurar todos los clics como conversiones de venta.
3. Mantener una ventana inicial de 28 días completos. Comparar con 28 días previos equivalentes y separar móvil/escritorio, país, canal y mezcla de tráfico. Cohortes de 7 días solo cuando hayan madurado.
4. Informar numerador, denominador y cobertura del consentimiento. Si la muestra es pequeña, no declarar ganador ni extrapolar ingresos. Un antes/después no identifica por sí solo causalidad; la versión nativa y el mix de tráfico también cambian.
5. Para SEO, GSC por página y consulta: clics, impresiones, CTR y posición; la media global puede cambiar por mezcla. Para buscadores IA, referidos identificables y consultas de marca: ausencia de referido no demuestra ausencia de cita. No prometer ranking ni inventar un «score GEO».

No hay tasa objetivo inventada. Establecer baseline y volumen antes de fijar un uplift alcanzable o diseñar un A/B. ROI incremental = (margen incremental atribuible − coste de la iniciativa) / coste de la iniciativa; solo calcularlo con costes y comparación defendible. Si no hay atribución suficiente, informar margen observado sin llamarlo ROI de la home.

Fuentes: scripts y tests locales citados; contrato oficial de [eventos GA4](https://developers.google.com/analytics/devguides/collection/ga4/events). La presencia de código y parámetros es evidencia de instrumentación, no de recepción en GA4, instalaciones ni facturación.
