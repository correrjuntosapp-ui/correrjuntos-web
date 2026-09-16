# Portada de lanzamiento V11 — 11 septiembre 2026

Trabajo local solicitado: centrar la portada en el valor de la app y eliminar los clubes asociados. No se cambia la app nativa, ni se autoriza publicación.

## Cambios

- Hero de running y fuerza, navegación directa y franja de pasos sin cifras sociales antiguas.
- Dos tarjetas visuales: planes de carrera y fuerza para casa/gimnasio. Imágenes originales de la nueva app con su procedencia IA explícita, no fotografías de clientes ni capturas simuladas.
- Registro GPS/Strava, historial, asistentes de IA y quedadas como beneficios. Se conserva la función social sin publicidad de clubes.
- Fuerza diferenciada: configuración y una muestra gratuita; continuidad, historial y progresión Premium. Un plan de running comprado individualmente no incluye Fuerza.
- Blog con Running/Ciclismo independientes y seis tarjetas, sin cambios editoriales.
- FAQ y JSON-LD sincronizados; títulos y descripciones coherentes con el próximo lanzamiento.
- Los archivos de las capturas antiguas, incluido el mapa retirado, se conservan. El HTML no referencia el mapa ni los nombres de los clubes.

## Contrato y límites

Fuente de producto: candidato nativo a61ccf60346bc277a14b11d693fc3202c3e427af, 1.3.29 (123). Revisados strengthProGate.ts, StrengthOnboardingScreen.tsx, featureAvailability.ts, rutas de App.tsx y PaywallScreen.tsx. Código disponible no demuestra publicación en las tiendas ni QA físico del binario final.

La página muestra «próxima versión», incluida una nota global. No se afirma disponibilidad pública de Fuerza. Las capturas siguen siendo las reales de Android 1.3.25, identificadas como tales. Los candidatos encontrados en QA no sustituyen a una galería de marketing revisada: algunos usan inglés/datos de pruebas.

El servidor local devuelve X-Robots-Tag: noindex, nofollow. Se conserva el contrato de indexación del documento de integración; no publicar este borrador sin resolver los gates del manifiesto JSON y retirar la nota de preproducción solo cuando corresponda.

Se preservan scripts inline de consentimiento y UTM, IDs de tiendas, formulario newsletter y sus manejadores. No se envían formularios reales. No se modifican sitemaps, robots, configuración Vercel, app.json ni eas.json.

## Revisión

Backup externo de la versión anterior: C:/tmp/home-v11-before-20260911. Evidencia de esta ronda: C:/tmp/home-v11-qa-20260911. Los tests específicos verifican ausencia de clubes promocionados, contrato de fuerza, hashes de imágenes, galería, FAQ, filtros, navegación sin JS y consentimiento.

## Resultado ejecutado

- Tests unitarios específicos: 9/9.
- Navegador real a 320/390/768/1440: HTTP 200, sin overflow, imágenes rotas ni errores JS; 0 peticiones externas antes del consentimiento. Galería 5/5 y FAQ 7/7 coherente con JSON-LD.
- Running/Ciclismo excluyentes; tarjetas y navegación de Fuerza accesibles también sin JS. El logo vuelve al inicio real desde la sección de fuerza (se movió el ancla fuera de la cabecera sticky).
- Consentimiento aceptar/rechazar/restaurar y cuatro enlaces de tiendas con UTM intactos. Newsletter 201/409/500 simulada, sin suscripciones reales.
- JSON-LD del repo: 1031 bloques, 0 hallazgos. Blog: 884 tarjetas válidas. ESLint: 0 errores, 966 warnings existentes. Build minify correcto; diff-check limpio.
- Los tres scripts inline se mantienen idénticos tras normalizar CRLF/LF. js/home.js conserva su SHA-256. No se modifican medición, consentimiento ni sus manejadores.
- No se repite la suite unitaria general ajena a la home; el resultado 9/9 se refiere exclusivamente a los tests de esta portada.
- Sin commit, push, merge, OTA ni deploy. No se actualiza el PR remoto.
