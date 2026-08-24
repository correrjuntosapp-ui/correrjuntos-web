# Auditoría SEO / GEO / imágenes — remediación agosto 2026

> Rama `claude/blog-auditoria-seo-geo-imagenes`, worktree `C:\tmp\web-auditoria-fix`, base `cfb2624c`.
> Sin push, merge, deploy ni IndexNow.

## 1. Qué se corrigió y se verificó

| Área | Antes | Después | Verificación |
|---|---|---|---|
| Enlaces internos 404 | 1 | **0** | Slug con vocal acentuada corregido; destino comprobado en el árbol |
| Fragmentos internos rotos | 18 en 8 páginas (+1 no detectado) | **0** | Validador propio sobre las 357 páginas españolas |
| Anclas vacías | — | **0** | Mismo validador |
| URLs no canónicas en sitemap | 7 | **0** | Canonical propio tras comparar contenido |
| `lastmod` obsoletos en sitemap-index | 8 | **0** | Recalculados desde el máximo real de cada hijo, con tope en la fecha de hoy |
| Imágenes de Amazon en og/twitter/JSON-LD | 34 páginas | **26** (8 corregidas) | Las 26 restantes no tienen alternativa en la propia página |
| Páginas de ciclismo sin `twitter:image` | 17 | **0** | Reutiliza la `og:image` autorizada, con comprobación de que no sea de Amazon |
| Páginas sin JSON-LD señaladas | 1 | **0** | `/blog/entrenamiento` marcada como CollectionPage + ItemList |
| Artículos sin autor en schema | 1 | **0** | Autor, publisher y mainEntityOfPage añadidos |
| Grupos de crawler que ignoraban los Disallow técnicos | 16 | **0** | 15 Disallow replicados en cada grupo |
| URLs rotas o redirigidas en llms.txt | 15 | **0** | Las 28 responden 200 directo |

## 2. Decisiones que exigieron criterio

### Los 7 canonicals

Se comparó el contenido de cada página con su canonical declarado mediante solapamiento de 5-gramas
(Jaccard). El resultado fue del **1,0 % al 2,2 %**: no eran alias ni duplicados, sino artículos con
intención de búsqueda propia. Como además estaban las 7 en el sitemap, el sitio pedía indexarlas y
desindexarlas a la vez. Se les asigna canonical propio, lo que resuelve el criterio «cero URLs no
canónicas en sitemap» sin sacrificar contenido único (entre 1.289 y 6.053 palabras por página).

### Los 18 fragmentos

Dos resoluciones distintas según la evidencia:

- **Añadir el id** donde la sección existe: `cursa-de-la-merce-2026` y `volta-a-peu-valencia-2026` sí
  tienen bloque de preguntas frecuentes, solo carecía de `id`.
- **Retirar la entrada del índice** donde la sección no existe: en `bidones-running`,
  `mejores-garmin-running`, `mochilas-trail-running` y `soft-flasks-running`, lo único presente en el
  HTML son las clases CSS `.comparison-table` y `.faq-item` declaradas en el `<style>`, nunca
  renderizadas. En `mejores-bicicletas-estaticas-runners` los anclas apuntaban a tres productos
  retirados del ranking. No se fabricaron anclas invisibles para satisfacer al rastreador.

### robots.txt

Los grupos específicos declaraban solo `Allow: /`. Según la especificación, un robot que encuentra su
propio grupo **ignora por completo el grupo comodín**, de modo que `/api/`, `/supabase/`, `/stats/`,
`*.sql` y `*.md` quedaban abiertos precisamente para los crawlers de IA. Se replican los 15 Disallow
en los 12 grupos de IA y en bingbot, AhrefsBot, SemrushBot y MJ12bot, que tenían el mismo defecto por
declarar solo `Crawl-delay`.

## 3. Rastreabilidad frente a indexación

Prueba real contra producción con 12 User-Agent (Googlebot, bingbot, OAI-SearchBot, GPTBot,
ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User,
Google-Extended, Applebot-Extended): **12/12 reciben HTTP 200, sin `X-Robots-Tag` restrictivo y con
canonical correcto**.

Eso acredita **rastreabilidad técnica** y nada más. No acredita indexación, ni aparición en
resultados, ni citaciones en asistentes. Esas cuatro cosas son distintas y solo se miden con datos de
las plataformas:

| Qué medir | Dónde | Cómo |
|---|---|---|
| URLs indexadas | Search Console → Indexación → Páginas | Comparar «indexadas» con las 338 del sitemap |
| Impresiones, clics, consultas | Search Console → Rendimiento | Filtrar por `/blog/`, exportar 28 días |
| Apariciones en AI Overviews | Search Console → Rendimiento → tipo de búsqueda | Cuando Google exponga el desglose; hoy no está separado |
| Indexación y citas en Bing/Copilot | Bing Webmaster Tools → Rendimiento | Bing alimenta a Copilot |
| Tráfico desde ChatGPT/Perplexity | GA4 → Adquisición → referencias | Buscar `chatgpt.com`, `perplexity.ai` |
| Visitas reales de los bots | Logs de Vercel | Filtrar por User-Agent `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot` |

No hay acceso autenticado a Search Console ni a Bing Webmaster Tools en esta sesión, así que ninguna
de esas métricas se puede afirmar.

## 4. Lo que queda bloqueado

| Bloqueo | Alcance | Qué lo desbloquea |
|---|---|---|
| Imágenes de Amazon en metadatos | 26 páginas | Un hero licenciado nuevo por página |
| Heroes incorrectos | 11 | Fotografía ambiental con licencia y procedencia documentada |
| Heroes débiles | 11 | Ídem |
| Tarjetas con foto de otro producto | ≥11 | Fragmento SiteStripe del producto correcto, o placeholder |
| Imágenes sin derechos defendibles | 885 en 150 artículos | 844 fragmentos SiteStripe (ver `amazon-sitestripe-pendientes-2026.md`) |
| Imagen Decathlon HTTP 410 | 1 | SiteStripe, permiso del fabricante o placeholder |
| 361 usos sin width/height | 75 páginas | Trabajo mecánico pendiente |

## 5. Hallazgos registrados, no modificados

- **18 enlaces internos en 12 páginas** apuntan a rutas que `vercel.json` redirige con 308 al índice
  genérico `/blog`. No son 404 —por eso la auditoría de producción no los marcó— pero prometen un
  artículo concreto y aterrizan en un listado.
- **`/plan-cero-a-5k/` redirigía con 308 a `/plan-cero-a-5k`, que devuelve 404**: una redirección a un
  404. Corregido en llms.txt apuntando a `/planes/0-5k`, pero la redirección del servidor sigue ahí.
- **La landing de Runner Matching ya no existe** y redirige a la página de descarga de la app.
- **`bastones-trail-running`** tiene un `<title>` que promete «10 Mejores Bastones» mientras su H1 y su
  contenido son una guía de uso.
- **Lighthouse por debajo de objetivo, preexistente y ajeno a estos cambios**: `/blog/` rendimiento 69
  (fichero no tocado en esta rama), `/blog/entrenamiento` accesibilidad 80 (contraste y falta de
  landmark `main`), `/blog/proteinas-para-runners` SEO 92 (textos de enlace poco descriptivos).

---

## 6. Segunda tanda — retirada de fotografía de Amazon (24 ago 2026)

### Contexto: trabajo concurrente

Al retomar, `HEAD` era `4eeff76f` y no `b696dd20`: otra sesión había añadido dos commits a las 14:29.
Es un avance limpio (mi commit sigue siendo ancestro, nada se reescribió). Sus cambios:

- `c3e9a14c` sustituyó enlaces externos rotos en 587 ficheros. La cifra asusta porque `sameAs` está
  repetido en todo el sitio: 577 usos de `strava.com/athletes/…` y 479 de `x.com/correrjuntosapp`.
- `4eeff76f` sustituyó fotos genéricas de producto por un placeholder editorial en 5 ficheros y creó
  `/public/producto-pendiente-autorizacion-{300,600,800}.webp`.

**Revalidé sus sustituciones una a una** con GET, User-Agent de Chrome y siguiendo redirecciones.
Todas responden 200 salvo una: `stansnotubes.com` **no resuelve** (HTTP 000, fallo de DNS), mientras
`continental-tires.com`, `schwalbe.com` y `notubes.com` sí lo hacen desde el mismo entorno. La marca
opera hoy en `stans.com`. Corregido a `stans.com/pages/how-to-and-tech-videos` (200).

### Retirada completa de fotografía de Amazon

| Concepto | Antes | Después |
|---|---:|---:|
| `<img>` servidas desde el CDN de Amazon | 673 en 103 páginas | **0** |
| Páginas con Amazon en og:image / twitter:image / JSON-LD | 32 | **0** |
| `<img>` de contenido sin width/height | 566 en 87 páginas | **46 en 8** |
| Referencias locales de imagen inexistentes | — | **0** |

En las 26 páginas cuya única imagen era de Amazon se usa un activo editorial neutro del sitio para los
metadatos sociales; **no se presenta como fotografía del producto**. Las 46 dimensiones que faltan
corresponden a imágenes externas o ausentes que no se pueden medir: no se inventan tamaños.

### Estados finales de las imágenes de producto

- `PLACEHOLDER_SIN_FOTO`: 673 usos, con el nombre real del producto en el `alt`.
- `BLOQUEADA_CON_MOTIVO`: toda fotografía de Amazon, por ausencia de SiteStripe y de PA-API.
- Los 30 placeholders de bicicletas siguen intactos.

### Integridad comercial

Token a token sobre los 164 HTML modificados: 1.624 URLs de Amazon, 1.540 ASIN, 1.624 tag, 1.368 rel,
25 data-track, 25 data-destination, 657 precios y 8 buy-card, **todos idénticos**.

### Lo que sigue pendiente

- **Los 11 heroes incorrectos y los 11 débiles no se han sustituido.** Requieren descargar fotografía
  ambiental con licencia, documentar autor/URL/licencia/fecha y generar tres derivados por artículo.
  No lo he hecho, así que no lo declaro hecho.
- Las 46 dimensiones no medibles.
- Los 844 fragmentos SiteStripe siguen siendo el único desbloqueo para volver a mostrar fotografía de
  producto.

### Nota de higiene

Los cambios de dimensiones quedaron dentro del commit `d69d2e0c` en lugar de en un commit propio, por
un `git add -A` mío. Tocan los mismos ficheros que la retirada de imágenes y separarlos exigiría
reescribir historia, que está prohibido en este encargo.
