# Validación de la candidata Home V10

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
El PR conserva un bloque neutro donde iría la foto pendiente; no publica dicha foto en la portada.
Debe verificarse X-Robots-Tag y el mismo comportamiento en el preview de Vercel antes de considerar la integración revisada.
