# Cierre del expediente visual del contenido español

24 de agosto de 2026. Cierra la retirada de fotografía no autorizada y la
dependencia de imagen remota en **todo** el contenido público español, no solo en
el blog. El alcance son las 598 URL españolas de los nueve sitemaps del índice.

## 1. Corrección de un dato que di por bueno

En la entrega anterior afirmé «cero imágenes Amazon». Era falso fuera del recorrido
que hice: revisé `blog`, `planes`, `cities`, `places` y `events`, pero no
`/equipamiento/` ni `/redes/`. La comprobación de esta fase es global sobre todo el
repositorio y separa `<img>` de enlaces afiliados `href`, que es lo que hacía falta
para que el resultado significara algo.

## 2. Amazon: recuento por idioma, antes y después

| Categoría | `<img>` antes | `<img>` ahora | og/twitter | JSON-LD | Copias locales ASIN | `href` afiliado |
|---|---:|---:|---:|---:|---:|---:|
| Español público | 115 | **0** | 0 | 80 → **0** | 31 → **0** | 1.865 intactos |
| Español interno | 1 | **0** | 0 | 0 | 0 | 23 intactos |
| Inglés (fase aparte) | 523 | 523 | 28 | 48 | 0 | 1.157 |
| Código y utilidades | 1 | 1 | 0 | 0 | 0 | 4 |

El único resto en código es `fix-seo-batch.cjs`, una utilidad que manipula etiquetas
`<img>` de Amazon y llega a inyectar un `preconnect` a su CDN. No se publica, pero
si vuelve a ejecutarse reintroduciría ese `preconnect`.

## 3. Páginas de equipamiento corregidas

| Página | Imágenes retiradas | Campos `image` del JSON-LD |
|---|---:|---:|
| `equipamiento/accesorios-running.html` | 10 | 10 |
| `equipamiento/auriculares-running.html` | 10 | 10 |
| `equipamiento/bebidas-hidratacion-running.html` | 9 | 0 |
| `equipamiento/geles-energeticos-running.html` | 9 | 0 |
| `equipamiento/recuperadores-running.html` | 10 | 10 |
| `equipamiento/relojes-gps-running.html` | 10 | 10 |
| `equipamiento/ropa-running.html` | 10 | 10 |
| `equipamiento/suplementos-running.html` | 18 | 10 |
| `equipamiento/zapatillas-running.html` | 10 | 10 |
| `equipamiento/zapatillas-trail-running.html` | 9 | 10 |
| `equipamiento/index.html` | 10 | 0 |
| **Total** | **115** | **80** |

Además: una imagen en `redes/newsletter-relojes-2026.html` —no está en ningún
sitemap y no lleva `noindex`, así que es alcanzable— y 36 usos de 31 copias
locales de fotografía de producto de Amazon en seis guías de `/blog/ciclismo/`,
nombradas por ASIN. No es una sospecha: el propio expediente de derechos del clúster
las describe como «descargas directas del CDN de Amazon SIN método autorizado del
programa». Los 31 ficheros se eliminaron del árbol al quedar sin uso.

Se retiraron también 81 `preconnect` al CDN de Amazon que ya no servían para nada.

## 4. Integridad de la afiliación

Comparación literal contra la base `cfb2624c` sobre los mismos 908 ficheros HTML no
ingleses. Ni un solo elemento cambia:

| Elemento | Base | Ahora |
|---|---:|---:|
| `amzn.to` | 261 | 261 |
| `tag=diezmejores21-21` | 2327 | 2327 |
| `rel="nofollow sponsored noopener"` | 2064 | 2064 |
| `data-track=` | 311 | 311 |
| `data-destination=` | 309 | 309 |
| `class="product-name"` | 117 | 117 |
| `product-rank` | 139 | 139 |
| `price-badge` | 18 | 18 |
| `product-card` | 1410 | 1410 |
| `buy-card` | 84 | 84 |
| `Ver precio en Amazon` | 287 | 287 |
| `Ver en Amazon` | 663 | 663 |
| `Enlaces /dp/ASIN` | 2209 | 2209 |

Nota aparte, no tocada por respetar el encargo: las once páginas de equipamiento
enlazan por `amzn.to` en lugar de `/dp/ASIN`. El propio proyecto tiene registrado
que los acortadores de Amazon derivan con el tiempo a un producto distinto.

## 5. Metadatos sociales y schema

| Métrica | Antes | Ahora |
|---|---:|---:|
| `og:image` relativas | 274 | **0** |
| `twitter:image` relativas | 273 | **0** |
| Imágenes relativas en JSON-LD | 480 | **0** |
| URLs de imagen en schema que no existen | — | **0** |
| Schema que apunta a Amazon | 80 | **0** |
| Páginas con el retrato del autor como imagen social | 4 | **0** |

Se corrigieron además 17 rutas locales que arrastraban parámetros de redimensionado
de un CDN remoto (`?auto=format&fit=crop&…`), residuo de la tanda anterior, y la
`og:image` de `app/index.html`, que apuntaba a un `/og-image.png` inexistente.

## 6. Localizaciones

Las tarjetas mostraban un monumento cualquiera de la ciudad rotulado como si fuera el
parque: el Coliseo para Villa Borghese, la Gran Vía para el Retiro, Big Ben para
Regent's Park, la Torre Eiffel para el Bois de Boulogne, el puente Golden Gate para el
Golden Gate Park.

Se sustituyeron por fotografía del lugar exacto de Wikimedia Commons: **17 parques**
(395 instancias) y **58 ciudades** (204 instancias). Solo se aceptaron licencias
reutilizables y solo cuando el título, la descripción o las categorías de la ficha
nombran el sitio. El detalle por fotografía está en
[`registro-lugares-ciudades-2026.md`](registro-lugares-ciudades-2026.md).

Las 75 elecciones se revisaron a resolución de detalle. Elegir automáticamente el
primer resultado produjo 16 imágenes equivocadas —un skyline que no era Burgos, un
jardín de cactus por León, un dibujo a lápiz del siglo XIX por Guadalajara y un mapa
topográfico por Huelva— y hubo que repetir la búsqueda con términos específicos. Se
descartaron también dos fotocromos de ~1890 del Bois de Boulogne, que habrían dado
una idea falsa del parque actual.

CC BY y CC BY-SA obligan a atribuir. El crédito había quedado dentro del contenedor
del hero, que lleva la imagen en posición absoluta, así que no se veía; se recolocó
al final del contenido en las 72 páginas y los dos hubs llevan un bloque de créditos
completo.

## 7. Hotlinks a Unsplash

| Métrica | Valor |
|---|---:|
| Usos en contenido público español | 237 |
| URLs únicas | 151 |
| Páginas afectadas | 80 |
| Respondían HTTP 200 | 151 |
| Con autoría identificable | **0** |
| Con licencia documentada | **0** |
| Quedan tras el cambio | **0** |

No fue posible documentar la procedencia: `unsplash.com/photos/…` responde con una
verificación anti-bot, `napi` exige autorización y su CDN entrega la imagen sin EXIF,
IPTC ni XMP. Sin página original ni autor, mantenerlas solo porque hoy responden 200
no es defendible.

Se resolvieron de dos formas: 60 imágenes reutilizando el hero propio de la página a
la que enlaza la tarjeta —ya licenciado, documentado y alojado aquí— y el resto con la
fotografía verificada de Commons de la sección anterior.

De las 4.351 referencias visuales del contenido español, 3.975 se sirven ahora desde
el propio dominio. Las 376 externas restantes son una única URL: el píxel de
seguimiento de Facebook, que no es una imagen de contenido.

## 8. QA de los nueve sitemaps españoles

No solo `/blog/`. Se recorrieron las 598 URL españolas de `sitemap-blog-es`,
`sitemap-cities`, `sitemap-places`, `sitemap-events`, `sitemap-equipamiento`,
`sitemap-pages`, `sitemap-races` y `sitemap-plans`.

| Comprobación | Resultado |
|---|---|
| HTTP 200 | 598 / 598 |
| Canonical propio | 598 / 598 |
| H1 presente | 598 / 598 |
| JSON-LD parseable | 665 bloques, 0 inválidos |
| `og:image` absoluta | 598 / 598 |
| `twitter:image` absoluta | 598 / 598 |
| Imágenes existentes | 0 ausentes |
| Amazon visual no autorizado | 0 |
| Fragmentos rotos | 0 |
| Enlaces internos rotos | 0 |
| Imágenes sin dimensiones | 0 |
| Anclas vacías | 0 |
| Productos con fotografía equivocada | 0 |

Los 324 enlaces internos que un recuento ingenuo marcaría como rotos resuelven
todos por una redirección declarada en `vercel.json` (`/sobre-nosotros`,
`/privacidad`, `/contacto`, `/terminos`, `/blog/categoria/*`…). Ninguno queda sin
destino: se comprobó regla por regla, no por suposición.

Se corrigieron en el camino dos anclas que sí estaban rotas: `/#app`, al que
apuntaban 543 enlaces de CTA y que no existía en la portada, y `/#mapa`, con dos
enlaces en el clúster de ciclismo.

## 9. Comprobación visual

Capturas a 390, 768 y 1440 px de las once páginas de equipamiento, su hub, tres
páginas con muchos placeholders, cinco páginas de lugar, el hub del blog, el hub de
ciclismo, el hub de ciudades y páginas de ciudad, evento y carrera. En las 81 vistas:
0 desbordamientos horizontales, 0 imágenes que no cargan, 0 errores de consola y 0
`<img>` sin `alt`.

## 10. Lighthouse (móvil, servidor local)

| Página | Rendimiento | Accesibilidad | Prácticas | SEO | CLS | LCP |
|---|---:|---:|---:|---:|---:|---:|
| `equipamiento/relojes-gps-running` | 100 | 89 | 100 | 100 | 0 | 1,4 s |
| `equipamiento/index` | 99 | 88 | 100 | 100 | 0,001 | 1,6 s |
| `places/villa-borghese` | 100 | 88 | 100 | 100 | 0 | 1,7 s |
| `places/index` | 100 | 88 | 100 | 100 | 0 | 0,9 s |
| `cities/index` | 84 | 90 | 100 | 100 | 0,267 | 2,2 s |
| `blog/index` | 69 | 96 | 100 | 100 | 0,096 | 5,6 s |

Dos comparaciones honestas contra la versión base, medidas en la misma ruta:

- `blog/index`: base 65 / CLS 0,098 / LCP 5,8 s → ahora 69 / 0,096 / 5,6 s. Mejora
  ligeramente.
- `cities/index`: base 85 / CLS 0,267 / LCP 1,8 s. Mi primera versión lo dejó en 71 y
  3,7 s porque servía las 58 miniaturas a 480 px para pintarlas a unos 240. Con
  `srcset` y `sizes` queda en 84 y 2,2 s. Sigue habiendo 0,4 s de diferencia: es el
  precio de servir WebP propio en lugar de depender del CDN de Unsplash.

El CLS de 0,267 de `cities/index` es idéntico al de la base y no lo provoca ninguna
imagen: procede de un desplazamiento propio de esa plantilla.

## 11. Fase inglesa, sin tocar

Registrada con el recuento exacto, para abordarla por separado:

| Elemento | Cantidad |
|---|---:|
| `<img>` de Amazon | 523 |
| Páginas del blog inglés afectadas | 76 |
| `og:image` / `twitter:image` con Amazon | 28 en 14 páginas |
| Referencias a Amazon en JSON-LD | 48 |
| Páginas inglesas con hotlinks a Unsplash | 9 |
| `app/en/index.html` con `og:image` rota a `/og-image.png` | 1 |

## 12. Bloqueos reales que quedan

1. **Sin SiteStripe ni PA-API no hay fotografía de producto.** Los 115 huecos de
   equipamiento, los 36 de ciclismo y los que ya había siguen mostrando el
   placeholder editorial. Es lo único que separa esas páginas de tener foto real.
2. **Las once páginas de equipamiento enlazan por `amzn.to`,** no por `/dp/ASIN`.
   No se ha tocado por respetar la integridad de afiliación de este encargo, pero el
   proyecto ya tiene registrado que esos acortadores derivan a otro producto con el
   tiempo.
3. **La fase inglesa** del punto 11.
4. **`fix-seo-batch.cjs`** reintroduciría el `preconnect` al CDN de Amazon si se
   vuelve a ejecutar.
5. **CLS de 0,267 en `cities/index`** y de 0,266 en la plantilla de
   `blog/entrenamiento/`. Ambos anteriores a este trabajo y ajenos a las imágenes.
6. **Contraste del hero de `cities/index`**: el subtítulo se lee mal sobre el
   degradado claro. Es anterior y no lo provoca ningún cambio de esta tanda.

---

## Adenda — 25 de agosto de 2026: reversión temporal de las fotografías de producto

Las tablas anteriores describen el estado del 24 de agosto. El 25 de agosto el
editor decidió **restaurar las fotografías de producto** mientras se resuelve el
acceso a la vía autorizada, asumiendo que vuelven a cargarse desde el CDN de
Amazon sin método del programa, igual que antes de la retirada.

### Estado de la solicitud de credenciales

- Amazon ha trasladado la generación de credenciales de PA-API a la **API de
  Creators** (`afiliados.amazon.es/creatorsapi`). En esa página, la sección
  «Aplicaciones» devuelve «Se ha producido un error. Inténtalo de nuevo» y no
  muestra el botón de crear aplicación. El error viene renderizado desde el
  servidor de Amazon; no depende de nada del lado del editor.
- En la página clásica de PA-API ya no existe el botón de solicitud; solo el
  aviso que redirige a la API de Creators.
- Se envió una incidencia al soporte de Afiliados el 25 de agosto describiendo
  el error, con los datos de la cuenta.
- El texto de Associates Central menciona un requisito de **10 ventas válidas
  en los últimos 30 días**. Es lo que muestra su página; **no está confirmado
  por soporte** ni se ha verificado su aplicación exacta. La cuenta registra 92
  productos pedidos en los últimos 30 días según el panel de informes.
- La concesión de acceso **no es automática**: según la propia FAQ de Amazon,
  la elegibilidad se revisa en un plazo de hasta 48 horas tras crear una
  credencial, y puede denegarse («AssociateNotEligible»).

### Qué se restauró y qué no

- 775 fotografías en 122 páginas, cada una emparejada con su tarjeta por el
  nombre exacto del producto (nunca por posición) y con su URL verificada
  (HTTP 200 y píxeles medidos; 535/535 válidas).
- Los 31 ficheros locales de las guías de ciclismo volvieron del historial.
  Siguen siendo «descargas directas del CDN de Amazon SIN método autorizado
  del programa», como ya recogía su expediente: la reversión no cambia esa
  calificación, solo la decisión de mostrarlos.
- Siguen en placeholder: 1 asociación dudosa (Garmin Forerunner 965 en la guía
  del maratón de Valencia, marcada por la auditoría) y 12 tarjetas que nunca
  tuvieron fotografía en ninguna versión.
- No volvió Amazon a heroes, `og:image`, `twitter:image` ni JSON-LD: 0
  referencias, verificado tras la reversión.

### Plan al recibir las credenciales

Con las claves de la API de Creators/PA-API se sustituirán las ~535 URLs del
CDN por las URLs oficiales que devuelva la API para los 393 ASIN de las
tarjetas restauradas, en una sola pasada. La lista de tarjetas y ASIN queda
registrada en el plan de restauración de esta tanda.
