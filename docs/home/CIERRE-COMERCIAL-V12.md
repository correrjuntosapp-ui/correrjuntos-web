# Home V12 — cierre comercial local, 11 septiembre 2026

Estado: candidata local, NO publicada ni autorizada para publicar. Conserva el diseño V11 de running y fuerza, sin promoción de clubes. Preview: http://127.0.0.1:4174/?preview=home-v12-cierre-comercial

## Mejoras terminadas

- Recorrido guiado de tres pasos en la galería: elegir plan, consultar sesión y siguiente paso. Usa las capturas verificadas existentes; teclado, ampliación y enlaces sin JavaScript conservados. No representa un registro ni una sesión realmente completados.
- /abrir-app deja de prometer «100 % gratis» y un plan en 60 segundos. Explica dos planes gratuitos y Premium opcional. Utiliza Inter local, permite zoom y muestra una captura con procedencia conocida. Tipografía mínima de 12 px, foco visible, pie debajo del contenido y captura completa sin recorte por cover.
- Descarga comprobada desde la portada hasta el enlace de cada tienda. Android e iOS tienen fallback a su tienda; el escritorio ofrece elección. El retorno a la app instalada se comprueba como modelo de visibilidad, no como QA nativo físico.
- Atribución UTM de portada a /abrir-app y tiendas: los parámetros de la URL de llegada se aplican a los enlaces sin almacenar nada (cambio del 15 sep 2026: antes se exigía consentimiento también para esto y se perdía la atribución de ~90 % de las descargas). La persistencia de 30 días en el navegador solo tras consentimiento, con claves limitadas, valores saneados y eliminación al rechazar. Las rutas y los IDs de tienda no cambian.
- Eventos de intención, galería y blog usando el GA4 existente; no se añaden SDK ni propiedades. Sin envío de esos eventos en localhost ni antes del consentimiento, ni reproducción posterior de clics anteriores. No se adjuntan emails, URLs completas, IDs de cuenta ni datos de salud.
- La respuesta 409 del newsletter ya no genera una nueva conversión GA4/Meta Lead. Un envío nuevo no equivale a confirmación del doble opt-in ni a registro en la app.

## Qué se mide y qué NO

Contrato operativo en MEDICION-COMERCIAL-V12.md. Pulsar «Descargar» es intención, no instalación. No se emiten compras ni altas desde botones de la web. No se ha demostrado un enlace individual entre sesión web, instalación, registro y cobro.

Se mantienen los cargadores y propiedades GA4/Pixel ya existentes. La revocación detiene los eventos del nuevo módulo y restaura enlaces; no se ha rediseñado la descarga de SDK ni su comportamiento automático una vez cargados. Las pruebas interceptan los proveedores y no acreditan recepción real de eventos en sus consolas.

## Capturas y lanzamiento: bloqueo pendiente

La galería y el puente muestran Android 1.3.25 con etiqueta explícita. No se han renombrado como 1.3.29 ni se han fabricado pantallas de fuerza.

Lectura de esta ronda: el emulador tiene 1.3.29 (123). El candidato local C:/tmp/cj-release-home-20260910 está en a61ccf60346bc277a14b11d693fc3202c3e427af con trabajo nativo adicional pendiente; no se toca. Un número de versión instalado no prueba que sea el artefacto final, su aprobación ni su publicación. El informe C:/tmp/cj-strength-photos-20260911/RESULTADO.md mantiene NO-GO para tiendas para el APK QA allí evaluado; no se atribuye esa procedencia al build 123 instalado después.

La ficha pública de Google Play consultada sigue mostrando notas de 1.3.25. La disponibilidad de Fuerza para usuarios y la versión de iOS no quedan certificadas en esta ronda. Se conserva la nota «próximo lanzamiento» y no se publica esta candidata.

Para cerrar este único gate de lanzamiento: artefacto final aprobado y trazable; capturas en español de su cuenta demo para running, fuerza y seguimiento; QA real de instalación, registro, primer entrenamiento y compra/restauración en sandbox o track autorizado. Sin cobros reales ni actividades presentadas como resultados de clientes. Actualizar el manifiesto con versión, build, OTA, hash, fecha y entorno de cada captura, conservar originales y volver a ejecutar la batería. Retirar la nota de próxima versión únicamente al confirmar disponibilidad por plataforma y recibir autorización de publicación.

## Evidencia y verificación

- Backup anterior: C:/tmp/home-v12-before-20260911. Capturas de navegador y reportes: C:/tmp/home-v12-qa-20260911.
- Tests específicos: tests/unit/home-funnel.test.cjs y tests/unit/home-landing.test.cjs.
- Navegador de portada: tools/verify-home-landing.cjs a 320/390/768/1440; galería 5/5, FAQ 7/7, imágenes, overflow, consola, deportes, consentimiento y newsletter simulado.
- Recorrido comercial: tools/verify-home-funnel.cjs sirve archivos locales bajo origen de producción simulado; intercepta tiendas, SDK y newsletter. Prueba aceptación/rechazo, campañas, duplicados y fallback móvil. No hace peticiones reales a esos proveedores.
- SEO técnico conservado: un H1, canonical, hreflang, FAQ e ItemList coherentes, enlaces y HTML legibles sin JS. El servidor local conserva X-Robots-Tag: noindex, nofollow. Ningún marcado garantiza ranking ni citas por buscadores de IA.

Comandos reproducibles desde este worktree:

```powershell
node --test tests/unit/home-funnel.test.cjs tests/unit/home-landing.test.cjs
npx --no-install eslint js/home-funnel.js js/open-app.js js/home.js
node tools/verify-home-funnel.cjs
$env:HOME_QA_URL='http://127.0.0.1:4174/'
node tools/verify-home-landing.cjs
npm run lint
npm run build
node tools/test-jsonld-structured-data.mjs
node tools/test-blog-cards.mjs
git diff --check
```

## Alcance y rollback

Resultado ejecutado: 27/27 pruebas unitarias específicas, 17/17 escenarios del recorrido comercial, portada y puente en 320/390/768/1440 sin overflow, foco del puente verificado por teclado. JSON-LD: 1031 bloques, cero hallazgos. Blog: 884 tarjetas válidas. Lint general: cero errores y 966 warnings preexistentes; lint de los tres JS de esta ronda: cero errores y warnings. Build y git diff --check correctos. No se presenta como aprobada la suite unitaria general ni el QA nativo pendiente.

No hay commit, push, PR nuevo, merge, OTA, build nativo, deploy, cambio de flags ni escritura en tiendas o Supabase. El PR remoto no se actualiza. Artículos, sitemaps, robots, vercel.json, app.json y eas.json permanecen fuera de alcance. Los cambios V11 previos se conservan.

Rollback de esta ronda local: comparar con el backup V12 y restaurar solo sus cambios, preservando cualquier trabajo posterior. Tras una eventual integración aprobada, revertir el commit de V12 mediante PR; no usar reset/force push ni eliminar assets compartidos.
