# Home V13 — datos y atribución, 15 septiembre 2026

Estado: revisión local, sin commit, push, merge ni deploy. Conserva V11–V13.

## Datos reverificados (data/product-facts.json)

| Métrica | Antes (2 ago) | Ahora (15 sep) | Publicado |
|---|---|---|---|
| Cuentas registradas (sin seed / sin internas) | 1.218 / 1.088 | 1.590 / 1.508 | 1.500+ |
| Guías blog ES / EN (sitemaps) | 312 / 243 | 349 / 264 | 600+ en español e inglés |
| Quedadas organizadas | 85 | 132 | 120+ |
| Clubes con recurrencia activa | 6 | 6 | 6 |
| Ciudades con quedadas | 6 | 6 | 6 |
| Strava: conexiones / runs importados / usuarios | 46 / 1.467 / 39 | 50 / 2.693 / 45 | integración activa |

Cambios en la portada: eyebrow del blog «600+ guías en español e inglés» y prueba social en el hero «Más de 1.500 cuentas registradas». Las referencias a Android 1.3.29 (123) no cambian: siguen siendo las capturas reales de la versión en pruebas y se sustituirán cuando la app salga a las tiendas.

## Atribución a tiendas

La campaña de la URL de llegada (utm_*) se aplica a /abrir-app y a los badges de App Store (ct) y Google Play (referrer) sin consentimiento, porque no almacena ni lee nada en el dispositivo. El almacén de 30 días (cj_utm) y los eventos de medición siguen exigiendo consentimiento. Pruebas: tests/unit/home-funnel.test.cjs y tools/verify-home-landing.cjs actualizados.

## Pendiente (decisión del titular)

- Longitud en móvil (~11.500 px): recortar solo con la medición de la V12.
- Publicar únicamente cuando la 1.3.29 esté en las tiendas y tras sustituir las etiquetas «versión en pruebas».
