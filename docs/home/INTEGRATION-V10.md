# Home V10 — candidata integrada

Actualización 11 septiembre: este documento describe la integración original. El estado local vigente es V13; consultar CIERRE-CAPTURAS-V13.md y CIERRE-COMERCIAL-V12.md. V11 retiró la promoción de clubes y el mapa; V12 reemplaza el bloque UTM heredado y corrige /abrir-app; V13 sustituye las capturas por Android 1.3.29 (123), de prepublicación. El manifiesto vigente es native-captures-v13.json. Las afirmaciones históricas de bloques inline idénticos, capturas 1.3.25 y puente sin cambios ya no describen el diff actual. No hay publicación autorizada.

Base: f58cd39d266b9a18927ecadf7c3c1538e08a99bb. Rama: codex/home-v10-integration.
La V10 original permanece intacta en su preview local.

## Alcance

- Sustitución de la portada por el diseño V10 aprobado.
- CSS y JavaScript propios en css/home.css y js/home.js, con huella de contenido en la URL.
- Assets utilizados exclusivamente en public/home; fuente Inter local y licencia OFL en public/fonts.
- Seis capturas reales Android 1.3.25 (110), OTA documentada: cinco en la galería y una en comunidad, con doce derivados verificados por SHA-256.
- Metadatos de app/PWA, Pinterest y perfiles sociales preservados.
- Canonical y hreflang siguen apuntando a producción; enlaces HTML internos son relativos a la raíz.
- JSON-LD de la V10 conserva FAQ y ItemList sincronizados con el contenido.
- Se mantienen los bloques de carga de GA4/Pixel, la clave de consentimiento y la atribución UTM del master.
- El formulario del Plan 10K que faltaba en el procedimiento previo se conserva de forma compacta en el pie, con el mismo endpoint, source y lead_magnet. Las pruebas de envío interceptan el API: no crean suscripciones.
- Compatibilidad de anclas antiguas de portada: main, features, demo, quedadas, pricing y compare.

## Límites de la atribución existente

El bloque heredado propaga cj_utm (30 días) a los badges directos de App Store (ct) y Google Play (referrer).
No cubre por sí mismo los tres enlaces a /abrir-app: ese puente no consume cj_utm ni propaga parámetros a su fallback.
Se conserva ese comportamiento preexistente, sin afirmar que esté resuelta la atribución de todas las descargas.
No se cambian GA4, Pixel, /abrir-app ni otros documentos.

## Protección de la revisión

El HTML candidato tiene la meta de indexación final; no se ha modificado la V10 local noindex.
vercel.json ya aplica X-Robots-Tag: noindex, nofollow a todos los hosts *.vercel.app. Debe verificarse en el preview.
El PR es de revisión, no autorización de merge. No hay cambios en master, producción, tiendas, robots ni sitemaps.

## Fotografía de comunidad

No se incluye ni se referencia la foto de grupo pendiente de consentimiento en la nueva portada.
En su lugar, el bloque de comunidad muestra una captura real de la app (Android 1.3.25, cuenta demo): pestaña Quedadas › Clubs con radio «Sin límite», seis clubs como marcadores y sin nombres de clubs. Es un recorte vertical documentado del máster (captura 06-clubs-mapa en native-captures-manifest.json) para no mostrar la tarjeta del primer club; sin retoque ni composición. El pie no nombra a ningún club y enlaza a la sección de descarga.
No se han contactado terceros ni se ha supuesto permiso por una publicación previa.
El mapa se puede ampliar mediante un enlace a su derivada de 720 px, también sin JavaScript. El enlace avisa de que abre otra pestaña; no se cambia la imagen ni la galería de cinco pantallas.
Si más adelante se aporta el permiso de una fotografía de club, puede sustituir a la captura con sus derivados verificados.

Las fotos ambientales de ciclismo conservan su aviso explícito. Renovar las 30 fotografías de producto de los artículos es un trabajo separado.

## Precios

No se publica porcentaje de ahorro. Con mensual 4,99 € y anual 29,99 €, el cálculo es 49,92 %.
La discrepancia del 40 % en las fichas no se corrige desde esta rama.

## Validación y rollback

Ejecutar node --test tests/unit/home-landing.test.cjs, las comprobaciones existentes del repositorio y la batería de navegador de la portada.
Verificar en contextos nuevos: cuatro anchos, consentimiento rechazado/aceptado/persistido, badges UTM, galería, idiomas y ambos deportes.
Las pruebas de analítica interceptan los SDK; demuestran una inicialización por proveedor, no una conversión real ni un page_view recibido por GA4.
No realizar altas reales en Brevo para QA.

Rollback después de una eventual publicación autorizada: revertir el commit de integración mediante un PR, sin reset/force push ni tocar los artículos.
Los assets nuevos pueden permanecer hasta que expire la caché; los originales y el master previo no se borran.
