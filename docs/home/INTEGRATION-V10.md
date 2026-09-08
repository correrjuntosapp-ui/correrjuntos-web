# Home V10 — candidata integrada

Base: f58cd39d266b9a18927ecadf7c3c1538e08a99bb. Rama: codex/home-v10-integration.
La V10 original permanece intacta en su preview local.

## Alcance

- Sustitución de la portada por el diseño V10 aprobado.
- CSS y JavaScript propios en css/home.css y js/home.js, con huella de contenido en la URL.
- Assets utilizados exclusivamente en public/home; fuente Inter local y licencia OFL en public/fonts.
- Cinco capturas reales Android 1.3.25 (110), OTA documentada, sin recomprimir sus derivados.
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
En el mismo espacio queda un bloque neutro identificado como pendiente de autorización, manteniendo el pie y enlace del club.
No se han contactado terceros ni se ha supuesto permiso por una publicación previa.
Antes de fusionar, el usuario debe aprobar ese estado o aportar el permiso para incorporar la foto y sus derivados verificados.

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
