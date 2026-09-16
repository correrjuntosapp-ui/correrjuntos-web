# Validación de la candidata Home V10

Estado vigente: V13, 11 septiembre. Ver CIERRE-CAPTURAS-V13.md para las capturas reales Android 1.3.29 (123), sus límites y la revalidación de 28 unitarios, 17 escenarios de embudo y cuatro anchuras. Los resultados V10 siguientes son históricos, no una certificación del lanzamiento actual.

Fecha: 8 septiembre 2026. Base: f58cd39d. Revisión local, sin producción.

## Resultados

- Navegador Chrome real, headless: 320, 390, 768 y 1440 px; sin overflow, errores de consola ni imágenes rotas.
- Contextos nuevos y solicitudes interceptadas únicamente para analítica y API de suscripción: cero solicitudes externas antes del consentimiento, incluidas fuentes.
- Aceptar carga una vez cada SDK; aceptar repetidamente no duplica; rechazar y recargar conserva el rechazo; aceptar y recargar restaura la aceptación.
- Cuatro badges de tienda conservan UTM (ct/referrer) con campaña de prueba. La limitación preexistente de /abrir-app queda descrita en INTEGRATION-V10.md.
- Running/Ciclismo exclusivos, tres tarjetas por panel; las dos secciones y navegación permanecen accesibles sin JavaScript.
- Siete FAQ coinciden con sus datos estructurados. El JSON-LD completo es idéntico al de V10 local.
- Cinco pantallas con navegación circular, ampliación sincronizada, foco atrapado, Escape y retorno del foco.
- Dos chips completos inicialmente a 320 y 390 px; mínimo 44 px de alto.
- Formulario Plan 10K: 201, 409 y 500 interceptados y verificados; mismo payload que master. Cero emails o altas reales.
- 44 enlaces relativos a la raíz resuelven a archivos locales. Canonical/hreflang permanecen absolutos.
- Diez derivados nativos conservan sus SHA-256; sus cinco másteres se documentan sin introducir archivos personales de QA.
- Test específico de portada: 7/7. Suite npm run test:unit: 10/10 entradas, más contrato de redirects aprobado.
- Auditoría de JSON-LD: 1031 archivos/bloques, cero hallazgos. Blog: 884 tarjetas válidas.
- ESLint del nuevo js/home.js: cero errores y advertencias. Lint del alcance existente: cero errores, 966 advertencias preexistentes.
- Build de minificación correcto (762 KB → 451 KB); git diff --check limpio.

## Repetición

```sh
node --test tests/unit/home-landing.test.cjs
npm run test:unit
node tools/test-jsonld-structured-data.mjs
node tools/test-blog-cards.mjs
npm run build
HOME_QA_URL=http://127.0.0.1:4176/ node tools/verify-home-landing.cjs
```

La batería de navegador usa @playwright/test del proyecto. HOME_QA_CHROME permite especificar un Chrome instalado y HOME_QA_OUTPUT un directorio externo para capturas e informe JSON.

## No acreditado por esta batería

No equivale a QA físico iOS/Android, conversiones recibidas en GA4, altas reales en Brevo, permiso de imagen del club ni autorización para merge.
El bloque neutro original fue sustituido el 9 de septiembre por la captura de la app documentada abajo; la foto de personas pendiente de permiso no se publica.
Debe verificarse X-Robots-Tag y el mismo comportamiento en el preview de Vercel antes de considerar la integración revisada.

## Actualización 9 septiembre 2026

- El bloque de comunidad sustituye el espacio «pendiente de autorización» por la captura 06-clubs-mapa (Android 1.3.25, cuenta demo, mapa de Quedadas › Clubs con radio sin límite): seis clubs como marcadores, sin nombres de clubs. Recorte vertical documentado en native-captures-manifest.json; ubicación simulada en Huelva por el emulador.
- Repetida la batería completa (320/390/768/1440, contextos nuevos, caché desactivada): 0 solicitudes externas antes del consentimiento, 0 errores de consola, 0 imágenes rotas (19), sin overflow, dos chips completos en móvil, FAQ 7/7, ItemList 6/6, 61 enlaces internos resueltos y 4 badges con UTM.
- Repetidos tools/verify-home-landing.cjs y tests/unit/home-landing.test.cjs (ahora seis derivadas con hash) contra el worktree servido en local.
- El pie de la captura pasa a una sola columna hasta 700 px para que el enlace no estreche el texto.

## Revisión independiente y cierre local — 9 septiembre 2026

- Se mantiene la captura de comunidad, sin cambios en los doce derivados de las seis capturas: sus hashes coinciden con el manifiesto. No se ha repetido la extracción del binario ni una sesión nativa; la procedencia de los másteres se apoya en las evidencias existentes.
- Mejora puntual de legibilidad: mapa ampliable mediante enlace nativo a la imagen de 720 px, con indicación visible, aviso de nueva pestaña y foco por teclado. Funciona sin JavaScript; no añade librerías, imágenes ni peticiones externas. La galería sigue teniendo cinco pantallas.
- Los seis nombres de clubes coinciden con `data/product-facts.json`, cuya verificación está fechada el 2 de agosto. Se conservan; no se infiere una asociación nueva de los marcadores del mapa ni se afirma una consulta actual a Supabase.
- Batería de portada ampliada: PASS a 320/390/768/1440. Se verifican respuesta 200 del mapa ampliado, proporción 1,9, resolución suficiente para DPR 2 en móvil y foco visible, además de los controles de galería, deportes, FAQ, consentimiento y formulario simulado existentes.
- Tests específicos de portada: 8/8. JSON-LD: 1031 bloques, cero hallazgos. Blog: 884 tarjetas válidas. Contrato de redirects: PASS. Lint: cero errores, 966 advertencias; `js/home.js` sin errores ni advertencias. Build: OK. `git diff --check`: limpio.
- La suite general `npm run test:unit` NO queda acreditada como verde en este equipo: 10/11 entradas pasan; `newsletter-automation.test.cjs`, sin cambios en esta revisión, completa sus 90 comprobaciones y después aborta con `UV_HANDLE_CLOSING` en `src/win/async.c:76` (Node 24.13.0, Windows). Reproducido también aisladamente y fuera de `node --test`. No se modifica newsletter para ocultarlo; comprobar este gate en CI antes de publicar.
- El primer control de nitidez del mapa comparaba `naturalWidth` con el ancho CSS, lo que no es válido con la densidad de `srcset`. Corregido el test para comparar la dimensión del recurso elegido en el manifiesto con el ancho renderizado por DPR. La imagen no cambió.
- Evidencias externas al repo: `C:/tmp/home-v10-independent-20260909-final/browser-report.json`, capturas en ese mismo directorio y logs `C:/tmp/home-v10-{browser-final,unit-retry,newsletter-direct,newsletter-isolated}.log`.
- Solo revisión local. No commit, push, cambios en la PR remota, merge ni deploy. No se acredita una mejora de conversión sin medición posterior.
