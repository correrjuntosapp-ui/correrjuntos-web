# Auditoría integral de la vertical de ciclismo — 25 de agosto de 2026

**Rama**: `claude/ciclismo-auditoria-10` (worktree `C:\tmp\web-auditoria-fix`)
**Base**: `origin/master = 50957d5e` (merge del PR #93)
**Alcance**: las 25 páginas de la vertical (hub, 23 artículos bajo `/blog/ciclismo/` y la review `/blog/prozis-real-hydration-opiniones`), más `sitemap-blog-es.xml`, `llms.txt`, `blog/ciclismo/ciclismo.css`, expediente de derechos y este documento. El hub de rutas (`/blog/ciclismo/rutas`) recibió solo el listener de analítica y la normalización de DOCTYPE.

## Metodología

Cada hipótesis del estado base se revalidó contra el repo real con scripts reproducibles (scratchpad `aud10-*.cjs`): inventario de metadatos, auditoría de enlaces internos/fragmentos por resolución local, chequeo HTTP de externos con reglas por dominio y re-verificación en Chrome headless de los 403/429/errores, validación JSON-LD + FAQ↔schema + ItemList↔visible, inventario visual de imágenes con hojas de contacto revisadas una a una, comparación de afiliación token a token contra `origin/master`, prueba de clic real (Amazon/Prozis) en navegador limpio, prueba de consentimiento de analítica, QA renderizado 390/768/1440 y Lighthouse móvil.

## Resultados antes → después

| Área | Antes | Después |
|---|---|---|
| Enlaces Garmin (guía GPS) | 5 URLs antiguas (1 malformada `p/pn/...`) ×4 usos | 5 fichas `p/{id}/pn/{sku}` verificadas en navegador: 200, sin redirección, título del modelo exacto |
| RFEC Women in Bike | URL antigua → redirige a página de error de rfec.com | Sección oficial viva `Women-in-Bike/WIB` (título verificado) ×2 usos |
| URLs externas movidas | 8 con redirección de contenido reubicado | Actualizadas al destino final 200: EFSA (PDF UL), Schwalbe, MIPS, Magicshine, Ravemen, COROS, Trek, Canyon |
| Footer del clúster | `/privacidad` y `/contacto` (301 → /privacy, /about) | Enlace directo a `/privacy` y `/about` en las 24 páginas del clúster |
| meta robots | 0/25 | 25/25 con `max-image-preview:large` |
| twitter:title + twitter:description | 1/25 (solo RH) | 25/25 explícitos (copy reutilizado de OG, coherente) |
| Descriptions largas | GPS 206; creatina 167; omega 164; potenciómetros 174; RH 168 | 137 / 136 / 138 / 136 / 148 caracteres |
| Title GPS | 68 caracteres | «Mejores ciclocomputadores GPS 2026: 10 modelos» (46) |
| Titles restantes >60 | 5 (hub 64, nutrición 61, carretera 63, MTB 65, zapatillas 60) | **Sin cambio, decisión justificada**: el exceso es íntegramente el sufijo « | CorrerJuntos»; el copy útil cabe en el límite y los títulos funcionan |
| FAQ visible ↔ FAQPage | 4 páginas con schema divergente (principiantes, grupeta, equipamiento, luces: preguntas ampliadas distintas de las visibles) | Regenerados desde el visible; **25/25 con coincidencia** verificada (soporte h3+p y details/summary) |
| ItemList ↔ visible | Proteínas posición 6 con nombre no literal | Alineado («Scitec 100% Whey Professional»); resto verificado (hub 24/24 URLs enlazadas; pinchazos/equipamiento con productos visibles en tarjetas) |
| Entrantes a piezas comerciales | omega 1, potenciómetros 1, RH 0, rutas 1, invierno 1 | omega 3, potenciómetros 3, RH 3, rutas 4, invierno 3 (9 enlaces contextuales; anchors naturales variados) |
| Newsletter en páginas nuevas | 0/8 | 8/8 con bloque ciclista honesto (sin lead magnet inexistente), form a `/api/brevo-subscribe` con `source=blog-ciclismo-inline`, accesible por teclado, responsive, eventos GA4 solo con consentimiento |
| Tracking de clic afiliado | `data-track` presente pero **sin ningún listener** en la plantilla ciclista → 0 eventos siempre | Listener delegado único en 26 páginas: 0 eventos sin consentimiento; exactamente 1 `affiliate_click` por clic con destination + page_slug (verificado con spy en headless) |
| Tarjetas Prozis del pilar nutricional | 2 sin imagen | 2 con imagen oficial de ficha (activos ya autorizados por la marca, derivados a 400 px, ~15/31 KB), enlazadas con atribución `ot=AFFES3177` |
| Hub en sitemap | lastmod 2026-08-21 pese a modificarse el 25 | lastmod 2026-08-25; +15 páginas modificadas actualizadas; dateModified solo donde cambió contenido real |
| llms.txt | Marca solo running; sin ciclismo; cifras desactualizadas (602/338) | Running **y** ciclismo; hub + 8 categorías ciclistas + 5 comparativas principales; recuentos reales de sitemaps (611 = 347 ES + 264 EN); fecha de verificación; sin afirmar efecto en Google |
| DOCTYPE | 16 páginas en minúscula | 26 normalizados; html-validate **0 errores en 26 archivos** |

## Enlaces — resultado completo

- **Internos**: 727 enlaces, 0 rotos (los 48 avisos de `/privacidad`+`/contacto` eran redirects de vercel.json, ahora directos). `/blog/ciclismo/rutas` verificado como página real (hub de rutas con canonical propio).
- **Fragmentos**: 429, 0 sin destino. **Anclas vacías**: 0.
- **Externos** (256 únicos): 108 con 2xx directo · 37 redirecciones que terminan en 200 (mayoría: locale de App Store — se conservan las URLs neutras; JISSN→Springer es el redirect canónico del DOI; Cube usa un redirector de producto propio) · 1 fallo real corregido (RFEC) · 20 anti-bot re-verificados en Chrome headless: Orbea/BJSM/UNE/NIH **200 OK**; Prozis 429 solo para fetch (clic real verificado con cookie); **Decathlon 403 incluso en headless** (muro Cloudflare) — no verificable de forma automatizada; las fichas se verificaron manualmente al construir los artículos de bicicletas (22 ago) y no se declaran rotas ni verificadas hoy.
- **Amazon**: 96 ASIN únicos y 286 apariciones `/dp/` intactos; muestra de 6 verificada + prueba de clic real (producto correcto, tag preservado).

## Afiliación (token a token vs `origin/master`)

- Amazon: **idéntico** — 96 ASIN, `tag=diezmejores21-21` ×286, `rel="nofollow sponsored noopener"`, data-track/data-destination, precios y orden sin cambios.
- Única diferencia deliberada: +2 anclajes de imagen Prozis en nutrición (`prozis-nutricion-*-img`), con los mismos URLs de campaña ya presentes en la página.
- Prueba en navegador limpio: Amazon → título del producto correcto y `tag` en la URL final; Prozis con `ot=AFFES3177` → cookie **`aff=AFFES3177`** creada; enlace corto `prozis.com/1XBDL` → resuelve con `ot=AFFES3177` y misma cookie. No se afirma contabilización de comisión (exigiría compra + panel).

## Imágenes

- Hojas de contacto generadas y revisadas visualmente: `AUD10-heroes.jpg` (25 héroes, todos relevantes; nutrición y GPS usan ilustración SVG propia) y `AUD10-productos-1..3.jpg` (**73 fotos de producto, 73 correspondencias correctas producto↔ASIN↔imagen**, incluidas las 2 Prozis nuevas).
- 0 imágenes rotas, 0 sin alt, 0 sin width/height, 0 hotlinks a CDN de Amazon.
- Sin foto y así permanecen: 30 bicicletas (permiso de marca pendiente), 9 ciclocomputadores + 1 tarjeta Garmin oficial y 6 cascos de las comparativas de bicicletas (pendientes de Creators API), 2 referencias editoriales de potenciómetros (sin permiso de uso). **Ninguna foto existente retirada; ninguna descarga nueva de Amazon; ninguna imagen generada por IA.**
- Inventario completo: `docs/inventario-imagenes-producto-ciclismo.json` (121 tarjetas con origen, estado y destino de migración). Script preparado: `tools/migrate-amazon-images-creators-api.cjs` (sin secretos; termina con error explicativo hasta que existan credenciales).

## IA/GEO

- `robots.txt` **ya cumplía**: grupos específicos con Disallows técnicos repetidos para OAI-SearchBot, GPTBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, bingbot, Google-Extended, Applebot-Extended, Meta-ExternalAgent (más cohere-ai y bloqueo de Bytespider). Verificado, sin cambios. Se mantiene la distinción: GPTBot y Google-Extended controlan uso/entrenamiento de modelos, no la búsqueda.
- `llms.txt` actualizado (ver tabla). Se trata como contexto auxiliar para agentes: **no** se afirma que afecte al ranking ni a las funciones generativas de Google.
- Las pruebas de crawlers de IA sobre producción (48/48 con 200) corresponden al estado publicado; se repetirán sobre las URLs tras el deploy de esta rama. Sin acceso autenticado a GSC/Bing en esta sesión: la medición de indexación/citas queda **pendiente** (procedimiento: URL Inspection de las 25 en GSC; Bing URL Inspection + AI Performance; no usar `site:` como prueba).

## QA

- Estático: 25/25 con 1 H1, canonical propio sin `.html`, JSON-LD 100 % parseable, FAQ=schema, sin Product/Review/AggregateRating, sin imágenes Amazon en og/twitter/schema.
- Renderizado: **75/75 vistas** (25 páginas × 390/768/1440) con 0 desbordes, 0 imágenes rotas, 0 errores de consola; tablas con scroll propio en móvil (0 overflow lo confirma).
- html-validate: **0 errores en 26 archivos**.
- Lighthouse móvil (12 páginas, servidor local sin CDN): ver entrega; los valores de producción serán ≥ que los locales (precedente PR #93: RH 89–91 local → 98 en producción).

## Bloqueos externos (fuera del alcance del repo)

1. **Amazon Creators API/PA-API**: caso A2POUPWGXYY3L2 en revisión. Bloquea la regularización de las fotos transitorias y las 15+1 tarjetas GPS/cascos sin foto.
2. **Permisos de fabricantes de bicicletas**: 11 solicitudes pendientes de envío por el founder; las 30 tarjetas siguen con placeholder honesto.
3. **GSC / Bing Webmaster / GA4 / paneles de afiliados**: sin acceso autenticado en esta sesión; métricas de indexación, citas y conversión no verificables hoy.
4. **Decathlon**: muro anti-bot impide verificación automatizada de sus 4 fichas (no se declaran rotas; verificación manual del 22 ago).

## Seguimiento

- **A 7 días**: comprobar en GSC la reindexación de las 25 URLs (lastmod nuevos), primeros eventos `affiliate_click` y `newsletter_*` ciclistas en GA4, y altas Brevo con `source=blog-ciclismo-inline`.
- **A 30 días**: CTR de las piezas comerciales con los nuevos titles/descriptions; entradas desde el enlazado interno nuevo (potenciómetros/omega/RH); revisar si llegaron credenciales Creators API y ejecutar la migración; reintentar permisos de bicicletas.
