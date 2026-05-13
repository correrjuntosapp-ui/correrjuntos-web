# CLAUDE.md — CorrerJuntos Web + Proyecto Global v1.3.6 (en build)

## 🍻 Partner Clubs B2B — sistema completo (memorizado 13 may 2026)

**HITO**: primer club partner B2B operativo después del primer SÍ tras outreach
del 11-12 may. Beer Runners Málaga aceptó compartir sus quedadas en la app.

### Stack técnico del sistema "partner clubs"

| Pieza | Detalle |
|---|---|
| Tabla nueva | `partner_quedada_recurrences` (1 fila por patrón recurrente) |
| Función Postgres | `rotate_partner_quedadas()` — idempotente, timezone-aware. Crea próxima quedada si club no tiene futura |
| Cron Vercel | `/api/cron/run?job=partner-quedadas` daily 04:30 UTC (06:30 Madrid) |
| Endpoint dispatcher | `api/_lib/jobs/partner-quedadas.js` (ESM, thin wrapper sobre RPC) |
| Tool onboarding | `tools/add-beer-runners-malaga.cjs` (template para futuros clubs — adaptar) |
| App handling | MapScreen + CardQuedadaCompacta detectan `max_participantes=NULL` → "Grupo abierto · todos bienvenidos" |

### Beer Runners Málaga — IDs y datos

- **Partner profile ID**: `5e99da62-332e-4e3d-8f27-b377591d7cff`
- **Email partner técnico**: `beerrunners-malaga@partners.correrjuntos.app`
- **Logo URL**: `https://www.correrjuntos.com/public/quedadas/beer-runners-malaga/logo.png`
- **Carpeta logo**: `public/quedadas/beer-runners-malaga/logo.png`
- **Recurrencia**: martes 20:30 Madrid TZ, en Las Letras de la Playa de la Malagueta (lat 36.7186, lng -4.4117)
- **Distancia**: NULL (Entrenos diversos)
- **Ritmo**: "Cómodo"
- **Plazas/max**: NULL (grupo abierto, sin límite)
- **Auto-join del organizer**: el partner profile se añade como 1º participante de cada quedada (no es fake, ES quien organiza — patrón Meetup/Strava)
- **Instagram**: https://instagram.com/beerrunnersmalaga
- **Contacto humano**: el "chico" que respondió al DM inicial (12 may pm) — pendiente llamada/charla 13 may pm

### Playbook para añadir nuevo club partner (replicar Beer Runners)

Cuando otro club acepte el outreach:

1. **Logo**: pedirles PNG con fondo transparente. Guardar en `public/quedadas/{slug}/logo.png`.
2. **Crear partner profile** (vía MCP SQL o adaptando script):
   - INSERT en `auth.users` (trigger crea profile mínimo)
   - UPDATE profile con nombre + apellidos + ciudad + bio + photo_url
   - UUID en auth.users con `raw_user_meta_data` flag `is_partner_club: true`
3. **INSERT en `partner_quedada_recurrences`** con: partner_profile_id, day_of_week (Postgres DOW: 0=Sun..6=Sat), hora, timezone, titulo, descripcion, ciudad, ubicacion, direccion, lat, lng, nivel, distancia (NULL si variable), ritmo, plazas (NULL si grupo abierto), pais, tipo='user', recurrence_label='weekly_X', active=true
4. **Crear primera quedada manualmente** (para no esperar al cron de las 04:30):
   ```sql
   SELECT public.rotate_partner_quedadas();
   ```
   o INSERT directo en quedadas + INSERT en participantes del organizador.
5. **Push + verificar** logo en CDN antes de mandar respuesta al club.
6. **Cron se encarga del resto** — cada día verifica si club tiene futura, si no la crea.

### Reglas críticas — no romper esto

⚠️ **`fecha_hora` NUNCA puede ser NULL** al INSERT manual de quedadas. El filtro de la app (`fecha_hora >= now()`) excluye NULL. Si insertas con SQL crudo, calcular: `((fecha + hora) AT TIME ZONE 'Europe/Madrid')`. La función `rotate_partner_quedadas()` lo hace bien — si añades nuevas quedadas a mano, hacerlo igual.

⚠️ **`plazas`/`max_participantes` = NULL** significa "grupo abierto". Hasta el OTA del 13 may, la app hacía `|| 10` y mostraba "9 plazas libres" falsamente. Ya arreglado en MapScreen.tsx + CardQuedadaCompacta.tsx (commit `c96142d` + OTA `f8c69a8b-471f-43bc-9431-bb2fd6b17bf3`).

⚠️ **NUNCA crear participantes fake (`es_seed=true`)** para inflar contador. Miguel ya nos avisó hace meses ("cantan mucho los perfiles falsos"). Lo único OK: auto-join del organizer profile, porque ES quien organiza (Meetup/Strava pattern). La descripción aclara "grupo de 15-25 runners habituales" para contexto.

### UTM tracking system (memorizado 13 may 2026)

Sistema short-link en `vercel.json` redirects + JS capture en `index.html`:

- `correrjuntos.com/tk` → `?utm_source=tiktok&utm_medium=bio` para bio TikTok
- `correrjuntos.com/ig` → `?utm_source=instagram&utm_medium=bio` para bio Instagram
- `correrjuntos.com/yt` → `?utm_source=youtube&utm_medium=bio` para bio YouTube
- `correrjuntos.com/r/{reel-slug}` → `?utm_source={slug}&utm_medium=reel` para attribution per-reel

JS snippet en `index.html` (commit `fb32e9e0`):
- Captura UTM en localStorage 30 días
- Append a `referrer=` (Google Play) o `ct=` (App Store) en links de tienda → attribution sobrevive al handoff a la store

**GA4**: dispara event `utm_landing` con source/medium/campaign. Reports → Acquisition → Traffic acquisition.

## 🎯 NORTE — opinión sincera siempre (memorizado 12 may 2026)

El founder me ha pedido **opinión real y sincera para toda decisión**. No filtrar para complacer. No vender features. Aplicar lente de negocio: ¿esto acerca a 1.000€/mes? Si no, decir que NO.

### Estado financiero realista (12 may 2026)

- **Revenue actual**: ~57€/mes (32€ subs + 25€ Amazon afiliados)
- **Target mínimo**: **1.000€/mes** (17× el actual)
- **Métricas malas**: 19% MAU (vs 30-50% benchmark fitness), 0.7% paid conversion de activos (vs 2-5% benchmark)
- **Métrica buena**: SEO 2.5k clicks/28d, infraestructura técnica sólida (RN + Supabase + RevenueCat)

### Diagnóstico honesto del producto

**Tiene**:
- Stack técnico solid (escalable 100k users sin tocar)
- Spanish-first como nicho real (poca competición)
- SEO trabajado (521 articles, blogs ROI probado)
- Features-parity con Runna en planes/coach

**Le falta**:
- **Wedge claro** (un caso de uso donde sea OBVIO superior)
- **Identidad de 1 frase** (Strava=fitness social, Nike=running brand, Runna=plans. CorrerJuntos=¿?)
- **Distribución** — features se construyen más rápido que el outreach
- **Conversión** — paywall no es el problema, el VALUE-PROP es

### Camino real a 1.000€/mes (90 días) — sin más features

| Mes | Acción | Target |
|---|---|---|
| **Mayo** | Lifecycle emails + 30 club outreaches + 5 articles SEO | 100€/mes |
| **Junio** | Convertir 2-3 clubs B2B + 1 brand deal + 10 subs | 350€/mes |
| **Julio** | 5-8 clubs + 1 brand deal recurrente + 20-30 subs | 1.000€/mes |

**Insight clave**: 10 clubs × 50€/mes = 1.000€/mes. **Esto es lo más rápido.**

### Reglas de honestidad en decisiones

Al evaluar cualquier propuesta (nueva feature, refactor, optimización), Claude debe responder:

1. **¿Esto mueve MRR los próximos 30 días?** Si NO → cuestionar prioridad
2. **¿Esto sería más rápido con una llamada/DM que con código?** Si SÍ → desviar a outreach
3. **¿Estamos resolviendo problemas técnicos para evitar la incomodidad de vender?** Si SÍ → señalarlo
4. **¿Lleva el founder >2h ese día sin moverse hacia revenue?** Si SÍ → recordarle el norte

### Cosas que el founder NO quiere oír pero son ciertas

- Construir más features es procrastinación productiva. La app YA está sobrada de features.
- Los 692 users no se convierten porque no ven el value, no porque el paywall sea malo.
- 2h fixing JWT esta mañana fue necesario pero **no movió MRR**. Cada hora técnica tiene coste de oportunidad: outreach a clubs.
- Bilingüe ES+EN para 700 users es prematuro. Foco en ES, conquistar España primero.
- Lo que más mueve es lo más incómodo: vender, llamar, hacer DMs. Lo más cómodo: codear.

### Cuándo Claude DEBE callarse

Si el founder está en outreach mode (DMs a clubs, brand deals), Claude no le distrae con tech ideas. Apoya.

Si el founder está dogfooding la app, Claude reporta hallazgos solo de bugs críticos o conversión. No de UI nits.

Si el founder pregunta "¿qué piensas?", Claude responde HONESTO incluso si discrepa del entusiasmo del founder.

---

## Reglas Inamovibles

- **NUNCA** modificar archivos existentes que funcionen sin permiso explícito
- **NUNCA** cambiar el diseño actual sin que el usuario lo pida
- **SIEMPRE** añadir, nunca reemplazar funcionalidad existente
- **SIEMPRE** verificar cambios antes de hacer commit
- **NUNCA** hacer commit sin confirmación del usuario
- **NUNCA** hacer push a main/master sin autorización
- OneDrive causa conflictos con git index.lock — usar `sleep 2` antes de git si falla

## ⚠️ CHECKLIST OBLIGATORIO Blog Articles (NUNCA SALTARSE)

Cuando crees o actualices CUALQUIER artículo del blog, debe incluir:

### 1. SEO + Meta (siempre)
- [ ] `<title>` con keyword principal + 2026 + brand
- [ ] `<meta name="description">` 150-160 chars con CTA
- [ ] `<meta name="author" content="Carlos Ruiz">` (o Jose Marquez)
- [ ] `<link rel="canonical">` URL absoluta
- [ ] `<link rel="alternate" hreflang="es">` + `hreflang="en">` + `x-default`
- [ ] OG tags + Twitter card + Apple/Android App Links
- [ ] Schema.org JSON-LD: WebPage + Person + BlogPosting + BreadcrumbList + FAQPage + ItemList

### 2. Enlaces afiliados Amazon (CRÍTICO — el founder lo monitoriza)
- [ ] Tag siempre presente: `?tag=diezmejores21-21`
- [ ] **PREFERIDO: `/dp/ASIN`** — NUNCA `/s?k=` salvo modelo descontinuado/saldo
- [ ] ASINs verificados ya usados en otros blog files (grep para encontrarlos)
- [ ] `target="_blank" rel="nofollow sponsored noopener"` en todos los buy buttons

### 3. Visuales producto (CRÍTICO — pro look)
- [ ] **TODA** product card o callout DEBE tener foto Amazon (`m.media-amazon.com/images/I/...`)
- [ ] Imagen wrapped en `<a>` afiliado para que la imagen también convierta
- [ ] `loading="lazy"` excepto hero image (que va con `fetchpriority="high"`)
- [ ] Width + height explícitos para evitar CLS

### 4. Iconos (CRÍTICO — pro look)
- [ ] **NUNCA** emojis decorativos (👟⌚🎧💧👕🏔️🥤🧘🎯🆕📋✅❌)
- [ ] Solo SVG inline estilo Lucide en badges naranja brand
- [ ] Excepción: emojis de país de carreras 🇪🇸🇫🇷 (banderas son OK)

### 5. Scripts auto-inject (CRÍTICO — author + CTAs app)
TODO artículo debe cargar AL FINAL del `<body>` antes de `</body>`:
```html
<script src="/blog/toc.js" defer></script>
<script src="/blog/author.js" defer></script>
<script src="/blog/related.js" defer></script>
<script src="/blog/enhance.js" defer></script>
<script src="/blog/cro.js" defer></script>
```
Esto inyecta automáticamente:
- **author.js**: bio card del autor con foto/credenciales
- **cro.js**: CTAs app mid/end-article + scroll trigger
- **related.js**: 4 artículos relacionados al final
- **enhance.js**: FAQ accordion + scroll-to-top + newsletter slide-in
- **toc.js**: tabla de contenido expandible

### 6. CTAs CorrerJuntos app
- [ ] Mínimo 1 CTA visible (descargar app) — cro.js inyecta más automáticamente
- [ ] Link App Store iOS: `https://apps.apple.com/app/correr-juntos/id6758505910`
- [ ] Link Google Play: `https://play.google.com/store/apps/details?id=com.correrjuntos.app`

### 7. Privacy/Cookies + Analytics
- [ ] Script `loadGA4()` + `loadMetaPixel()` con consent gating
- [ ] Cookie banner respect (no cargar GA4/Pixel sin consent)

### 8. Internal linking
- [ ] Mínimo 3-5 enlaces a otros artículos blog/cluster
- [ ] Enlace al pillar `/blog/guia-equipamiento-running-2026` si es affiliate
- [ ] Enlace a planes relevantes `/planes/...` si aplica

### 9. Post-deploy
- [ ] IndexNow ping con la nueva URL
- [ ] Verificar live en `https://www.correrjuntos.com/blog/{slug}`
- [ ] Si refresh: bumpear `dateModified` en JSON-LD + visible "Actualizado X may 2026"

### 10. Lección aprendida 9 may 2026
Founder reportó que los 2 nuevos articles (pillar + kit 200€) parecían "muy
simples, sin foto producto, sin CTA app, sin nombre creador". Causa: olvidé
los 5 scripts de auto-inject + las imágenes Amazon. **Si el founder lo
detecta, ya es demasiado tarde — siempre seguir este checklist al pie.**

### 11. Imágenes Amazon — protocolo anti-rotación

⚠️ **Las URLs de Amazon CDN rotan sin previo aviso** cuando el seller actualiza
la galería. Detectado el 9 may 26: 24 de 524 imágenes del blog rotas (4.6%).

**3 tipos de roturas Amazon:**

1. **HTTP 404 explícito** — fácil detectar
2. **Placeholder silencioso** — devuelve 200 OK con archivo de 43 bytes (blank
   image). Bug INVISIBLE si solo miras status code. Detectar con size <5KB.
3. **Sponsored ad genérico** — la imagen del primer ASIN del search a veces
   es de un producto chino sponsored, NO el producto real. Visual check
   imprescindible (el size es OK pero el contenido es otro producto).

**Antes de publicar cualquier article con afiliados Amazon:**
- Usar `/images/I/{IMAGEID}` con hiRes URL de la página oficial del producto
  (NO `/images/P/{ASIN}.01.LZZZZZZZ.jpg` — devuelve placeholder en muchos)
- Verificar size con `curl -s -o /dev/null -w "%{size_download}"` (>10KB)
- **Ver visualmente cada imagen** antes de commit (Read tool en Claude)
- Para hiRes URL: scrape Amazon page con UA Safari, buscar `"hiRes":"..."`

**Cron de auditoría mensual instalado** (9 may 26):
- Script: `tools/audit-amazon-images.cjs`
- npm scripts: `npm run audit:amazon`, `audit:amazon:json`, `audit:amazon:quiet`
- GitHub Actions: `.github/workflows/audit-amazon-images.yml`
  - Schedule: primer lunes del mes a las 09:00 UTC
  - Trigger manual disponible
  - Si hay imágenes rotas → crea GitHub Issue automático con lista
  - Artifact JSON guardado 90 días

**Fix manual cuando salta una rotura:**
```bash
# 1. Ver lista
npm run audit:amazon

# 2. Para cada ASIN afectado, obtener nueva hiRes URL
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
curl -s -A "$UA" "https://www.amazon.es/dp/{ASIN}" | grep -oE '"hiRes":"[^"]+"' | head -3

# 3. Verificar size
curl -s -o /dev/null -w "%{size_download}\n" "{NUEVA_URL}"

# 4. Reemplazar con node script
node -e "const fs=require('fs');let t=fs.readFileSync('blog/X.html','utf8');t=t.replace('OLD_URL','NEW_URL');fs.writeFileSync('blog/X.html',t)"
```

### 12. PLAYBOOK GOLD STANDARD — Article afiliado nuevo (memorizado 11 may 2026)

**Aplicar a TODOS los articles tipo `mejores-X-2026` con productos Amazon.**

El article `mejores-bicicletas-estaticas-runners` (11 may 2026) es el primer ejemplo siguiendo este playbook al pie de la letra. Resultado: el founder lo aprobó como "muy bien". Replicarlo para cualquier nuevo affiliate article.

#### ❌ NUNCA hacer (lecciones aprendidas el 11 may 26)

1. **NUNCA inventar ASINs** — varios productos premium "aspiracionales" (DKN AM-3i, Bowflex VeloCore, NordicTrack S22i, Schwinn IC4 exacto) NO existen en Amazon ES → si haces scrape de "primer resultado" Amazon devuelve productos COMPLETAMENTE distintos (bici eléctrica plegable, mancuernas, etc).
2. **NUNCA inventar URLs de imagen Amazon CDN** (`m.media-amazon.com/images/I/61vK6XJ8FbL._AC_SL1500_.jpg` random) — devuelven 9 bytes blank placeholder.
3. **NUNCA usar `/s?k=ProductName&tag=...`** (search URL) — conversion -30 a -50% vs `/dp/ASIN` directo. Amazon SiteStripe siempre recomienda `/dp/`.
4. **NUNCA aceptar imagen del primer resultado de search** sin verificarla visualmente — puede ser sponsored ad de otro producto.
5. **NUNCA proponer rango de precio premium €1000+** sin confirmar disponibilidad Amazon ES (suelen ser USA-only).

#### ✅ SIEMPRE hacer (workflow obligatorio)

**Paso 1 — Scrape Amazon ES con queries GENÉRICAS, NO específicas:**
```bash
# BIEN — query amplia, devuelve productos disponibles
"bicicleta estatica" "indoor cycling" "bicicleta spinning"

# MAL — query con marca/modelo específico que puede no existir en ES
"DKN AM-3i bicicleta" "Bowflex VeloCore 22"
```
Con UA Safari + Accept-Language ES + headers Accept-Language:
```bash
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
curl -s -A "$UA" -H "Accept-Language: es-ES,es;q=0.9" "https://www.amazon.es/s?k=..."
```
Si Amazon devuelve <100KB es un block — esperar 30-60s, rotar UA Chrome Windows.

**Paso 2 — Extraer top 20-30 productos del HTML:**
- ASINs: regex `data-asin="([A-Z0-9]{10})"`
- Filtrar resultados sponsored si es posible (`data-component-type="s-search-result"`)
- Capturar también precio y título para shortlist

**Paso 3 — Obtener hiRes image de cada producto** (esto es crítico):
```bash
# Visit each /dp/ASIN page, extract "hiRes":"..." from HTML
curl -s -A "$UA" "https://www.amazon.es/dp/{ASIN}" | grep -oE '"hiRes":"[^"]+"' | head -1
```

**Paso 4 — Descargar Y VERIFICAR VISUALMENTE cada imagen** (NO opcional):
```bash
curl -s -A "$UA" -o /tmp/bikes/{key}.jpg "{hiRes_url}"
```
Después con `Read tool` en Claude **mirar CADA imagen** y confirmar que es el producto correcto. Filtrar:
- ❌ Bicicletas eléctricas urbanas / scooters (Bodywel, etc) cuando buscas bici estática
- ❌ Mancuernas / pesas (Bowflex SelectTech) cuando buscas bici
- ❌ Sponsored ad genérico de marca china
- ❌ Imagen <10KB (placeholder)
- ✅ Solo el producto exacto que el title promete

**Paso 5 — Self-hostear en `/public/blog-images/{slug}/`** (recomendado):
```bash
mkdir -p public/blog-images/bicis-estaticas/
cp /tmp/bikes/yosuda.jpg public/blog-images/bicis-estaticas/yosuda.jpg
```
Razones:
- Inmune a rotación CDN Amazon
- Path en HTML: `src="/public/blog-images/bicis-estaticas/yosuda.jpg"` (prefijo `/public/` literal, ver regla "Blog assets path")
- Más rápido (Vercel CDN edge vs Amazon CDN)
- Si el producto desaparece de Amazon, la imagen sigue válida

**Paso 6 — Formato OBLIGATORIO de los botones "Ver en Amazon":**
```html
<a href="https://www.amazon.es/dp/{ASIN}?tag=diezmejores21-21&linkCode=ll1"
   target="_blank"
   rel="nofollow sponsored noopener"
   style="background:#f97316;color:#fff;padding:8px 16px;border-radius:8px;font-weight:600;font-size:.9rem;text-decoration:none">
   Ver en Amazon
</a>
```
- `?tag=diezmejores21-21` SIEMPRE presente (es el tag Amazon Associates España)
- `&linkCode=ll1` (Site Stripe Link 1) — mejora tracking analytics
- `target="_blank"` para no perder el visitor
- `rel="nofollow sponsored noopener"` 3 valores obligatorios (SEO + seguridad + Google policy)

**Paso 7 — Verificar técnicamente que los links funcionan:**
```bash
curl -s -A "$UA" -L "https://www.amazon.es/dp/{ASIN}?tag=diezmejores21-21&linkCode=ll1" | grep -oE '<title>[^<]+'
# Confirmar título coincide con el producto que el HTML del article promete
```

**Paso 8 — Rango de precio realista € €99-€500** sweet spot Amazon ES. Productos premium USA-only (€1500+) suelen no estar en Amazon ES. Si hay alguno premium, confirmar que el ASIN responde realmente. Mix recomendado:
- 2 entry-level (€80-€150)
- 4-5 mid (€150-€250)
- 2-3 premium (€250-€500)

**Paso 9 — Schema.org JSON-LD `ItemList` con `/dp/ASIN` URLs:**
```json
{"@type": "ItemList","itemListElement": [
  {"@type": "ListItem","position": 1,"name": "YOSUDA YB001","url": "https://www.amazon.es/dp/B0FFB43N5L?tag=diezmejores21-21&linkCode=ll1"},
  ...
]}
```
**NO** poner URLs `/s?k=` aquí — el itemList debe match exactamente lo que está en cada product card.

**Paso 10 — Body copy honesto basado en specs reales** (no aspirational):
- ❌ "Volante de 38 kg, Lean Mode único, pantalla 22" iFit Studio" (inventado)
- ✅ "Volante 6-13 kg, resistencia magnética con 16 niveles, app MERACH compatible Zwift, capacidad 150 kg" (real)

#### Aplicación rápida — bash one-liner para verificar article live

Después de publicar, verificar live:
```bash
# 1. Status code 200
curl -s -o /dev/null -w "%{http_code}" "https://www.correrjuntos.com/blog/{slug}"

# 2. Todas las imágenes self-hosted cargan >10KB
for img in $(ls public/blog-images/{slug}/*.jpg); do
  size=$(curl -s -o /dev/null -w "%{size_download}" "https://www.correrjuntos.com/$img")
  echo "$((size/1024))KB  $img"
done

# 3. Random check 3 links afiliado llevan al producto correcto
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15"
for asin in B0FFB43N5L B0DZ1SKZGJ B0BWNCLDXC; do
  curl -s -A "$UA" -L "https://www.amazon.es/dp/$asin?tag=diezmejores21-21" | grep -oE '<title>[^<]+' | head -1
done
```

#### Resumen de tiempo y output esperado

| Tarea | Tiempo |
|---|---|
| Scrape Amazon ES con 3 queries | 5-10 min (incluye delays anti-rate-limit) |
| Verificar 12-15 imágenes visualmente con Read | 10-15 min |
| Self-host las 10 elegidas | 1 min |
| Reescribir HTML con script `tmp/rewrite-X-articles.cjs` | 15-20 min |
| Commit + push + IndexNow ping | 5 min |
| **Total: article afiliado bullet-proof** | **40-60 min** |

#### Casos exitosos siguiendo este playbook

- ✅ `mejores-bicicletas-estaticas-runners` (ES + EN) — 11 may 2026, founder aprobó "muy bien"
  - 10 productos €99-€269 verificados visualmente
  - Imágenes self-hosted `/public/blog-images/bicis-estaticas/*.jpg`
  - Tag `diezmejores21-21` confirmado funcionando 3/3 ASINs random sample

## Estructura del Proyecto

```
correrjuntosV2/                        # Repo padre (correrjuntos-web)
├── correr-juntos-app/                 # Submodulo — app React Native/Expo (tiene su propio CLAUDE.md)
├── index.html                         # Web PWA monolítica (~15k líneas)
├── js/                                # Módulos JS web (17 IIFE + app.js coordinador)
├── blog/                              # ~210 artículos ES
│   ├── en/                            # ~188 artículos EN
│   ├── toc.js                         # Tabla de contenido (expandido por defecto)
│   ├── author.js                      # Author box
│   ├── related.js                     # Related articles DB (93KB)
│   ├── enhance.js                     # FAQ accordion, scroll-top, newsletter, GA4 events
│   ├── cro.js                         # CRO: mid/end CTAs, scroll trigger, micro-conversión GA4
│   └── city-links.js                  # City link injection
├── planes/                            # 6 landing pages SEO de planes
│   ├── index.html                     # Landing general planes
│   ├── 0-5k/index.html               # Plan 0→5K (gratis)
│   ├── 5k/index.html                 # Plan 5K
│   ├── trail/index.html              # Plan Trail
│   ├── 10k/index.html                # Plan 10K
│   ├── media-maraton/index.html      # Plan 21K
│   └── maraton/index.html            # Plan 42K
├── cities/, places/, events/          # SEO Marketplace (16 events + 31 places)
├── matching/                          # Runner Matching landing (ES + EN)
├── tools/                             # Generadores (blog, events, places, docs)
├── api/                               # Vercel serverless functions
│   ├── brevo-subscribe.js             # Newsletter Brevo DOI
│   └── indexnow.js                    # IndexNow submit URLs
├── icons/                             # Logos app (48-512px + COROS logos 102-300px)
├── supabase/                          # SQL migrations (51, 52 training plans)
└── public/                            # Assets estáticos web
```

## Stack Técnico

### Web
- **Hosting**: Vercel (vercel.json, trailingSlash: false)
- **Backend**: Supabase (waihiwdbtcbdazmaxdor.supabase.co)
- **CSS**: Tailwind
- **Mapas**: Leaflet
- **Analytics**: GA4 (G-RQYYGNC12T), Meta Pixel (1466415711868158)
- **Newsletter**: Brevo API con DOI
- **Afiliados**: Amazon tag diezmejores21-21

### App (ver correr-juntos-app/CLAUDE.md para detalle completo)
- React Native + Expo SDK 54 + TypeScript
- Supabase + RevenueCat + expo-av + expo-location

## Blog — Estado Actual (Marzo 2026)

- **~210 artículos ES** + **~188 artículos EN** = ~400 total
- **TODOS los títulos y metas SEO optimizados** (keyword-first, 2026, CTAs contextuales)
- **CTAs contextuales** en todos los artículos ES (11 categorías por tema)
- **TOC siempre expandido** por defecto
- **Estilo visual nuevo**: badges, stat-box, solution-box, warning-box
- **GA4 micro-conversión**: blog_article_view, blog_scroll_depth, cta_box_click, blog_to_plan_landing, blog_time_on_page

### 30-Day SEO Calendar (started 2026-03-21)
- Day 1 ✅ empezar-a-correr-despues-de-los-60 (Salud)
- Day 2 ✅ mejores-zapatillas-on-running (Zapatillas, 10 affiliates)
- Day 3 ✅ vo2-max-running-como-mejorar (Entrenamiento)
- Day 4 ✅ correr-durante-menopausia (Salud, visual badges)
- Day 5 ✅ hoka-clifton-10-vs-asics-novablast-5 (Zapatillas, 2 affiliates)
- Day 6 ✅ triatlon-para-runners-principiantes (Entrenamiento, 8 affiliates)
- Day 7-30: pending

### Blog Generator
- `tools/blog-generator/generate-affiliate-article.cjs` — bilingual ES/EN from JSON config
- Article HTML template: same as `blog/correr-mejora-salud-mental.html`
- Images: Pexels (public, no auth), Amazon product images for affiliates

## Landing Pages de Planes (6 páginas)

- /planes/0-5k, /planes/5k, /planes/trail, /planes/10k, /planes/media-maraton, /planes/maraton
- Schema: HowTo + FAQPage + BreadcrumbList
- Testimonios: 3 por plan (18 total)
- Submitted to Google via Search Console + IndexNow
- CTA: solo descarga app, sin precios

## SEO Status

- 722 páginas indexadas, 215 no indexadas
- Posición media: 13, CTR: 0.7%
- Sitemaps: sitemap-index.xml con 7 child sitemaps
- IndexNow: `/api/indexnow` (key: c4f7e2a9b3d1)
- GeoScore target: 35 → 44+ en 60 días

## Training Plans (7 planes en Supabase)

| Plan | Slug | Semanas | Sesiones | Steps | Gratis |
|------|------|---------|----------|-------|--------|
| Empieza a Moverte | empieza-a-moverte | 6 | 18 | 68 | ✅ |
| 0→5K | empezar-0-5k | 8 | 24 | 80 | ✅ |
| Prep 5K | prep-5k | 8 | 32 | 102 | ❌ |
| Prep 10K | prep-10k | 12 | 48 | 151 | ❌ |
| Prep Trail | prep-trail | 10 | 40 | 126 | ❌ |
| Prep 21K | prep-21k | 16 | 70 | 220 | ❌ |
| Prep 42K | prep-42k | 18 | 90 | 278 | ❌ |

**Total: 322 sesiones, 1.025 steps estructurados** — listos para Garmin/COROS/Apple Watch

## Watch Integrations

- **Garmin Connect API**: Solicitud enviada (Training API). Contact: connect-support@developer.garmin.com
- **COROS API**: Solicitud enviada + 4 logos a api@coros.com. Webhook: /api/coros/webhook
- **Apple Watch**: WorkoutKit SDK público (iOS 17+/watchOS 10+), no necesita aprobación

## Monetización

- Premium mensual: 4,99€/mes via RevenueCat (ACTIVO)
- Premium anual: 29,99€/año via RevenueCat (ACTIVO desde v1.3.0 — selector visible, anual = default, badge "Ahorra 40%", trial 14 días)
- Amazon afiliados: tag diezmejores21-21 (ACTIVO)

## 📊 Estado Financiero (cierre 10 may 2026)

**Snapshot real del día — primer mes con tracking completo de ambos canales.**

### RevenueCat dashboard

| Métrica | Valor | Qué significa |
|---|---|---|
| **MRR** | **$3** | Monthly Recurring Revenue — lo que se va a repetir cada mes con subs actuales |
| **Revenue (28d)** | **$35** | Cash REAL recibido en los últimos 28 días (incluye one-time + annual paid upfront) |
| Active Trials | 1 | Founder (premium 30d desde 10 may para testear plan Huelva — quitar al cerrar test) |
| Active Subscriptions | 1 | Solo 1 sub mensual real |
| New Customers (28d) | 268 | Nuevos accounts trackeados (mostly free tier) |
| Active Customers | 306 | Total con actividad reciente |

**Por qué el gap MRR ($3) ↔ Revenue ($35)**:
- 1 sub mensual activa = ~$3 MRR
- Resto = compras one-time (planes individuales prep-5k/10k/trail/21k/42k cada uno con su productId no-consumible) + posibles annual subs ($29,99 cuentan íntegros en el mes del pago, pero solo aportan ~$2,5 a MRR)

**RevenueCat free tier**: hasta $2.500 MTR. Founder está en $35 — MUY lejos del límite, sin urgencia. ⚠️ Aviso: tarjeta de crédito hace falta añadir cuando puedas (en dashboard hay warning de "Add your credit card to avoid losing access" — preventivo, no bloqueante hoy).

### Amazon Afiliados (StoreID `diezmejores21-21`)

| Métrica | 9 may close | **11 may am** | Δ 48h |
|---|---:|---:|---:|
| **Comisiones 30d rolling** | 19,55€ | **25,11€** | **+5,56€ (+28%)** |
| Bonus | 0€ | 0€ | — |
| Total mes Amazon | 19,55€ | **25,11€** | — |
| Pago real | Llega ~2 meses después (julio para mayo) — Amazon espera anti-fraude | | |

**Spike +4,3× ritmo diario** (2,78€/día vs media 0,65€/día). Coincide con publicación 9 may del pillar Trail + article kit 200€ + refresh relojes GPS + author unification + deep link contextual cro.js. Si mantiene ritmo 48h actuales → cierre mayo proyectado **45-55€** Amazon solo.

### TOTAL canal monetario (11 may am)

| Fuente | EUR/mes aprox | Δ vs 10 may |
|---|---:|---:|
| RevenueCat (subs + one-time + annual) | ~32€ ($35) | — |
| Amazon afiliados | **25,11€** | **+5,56€** |
| **Total** | **~57€/mes** | **+5,56€** |

### Lectura estratégica

- **Amazon afiliados (25,11€) ahora genera 9× lo que RevenueCat MRR ($3 ≈ 2,75€)** hoy. Subió de 6× a 9× en 48h. El blog SEO está pagando 9× lo que las subscripciones premium.
- Cuando la base de subs crezca con lifecycle emails + push activations + más users post v1.3.6, el ratio se invertirá: RevenueCat será 5-10× Amazon.
- Mientras tanto el blog mantiene **cash flow positivo predecible** y reduce dependencia del único motor.
- **Lifecycle emails (Phase A) deberían mover el MRR significativamente en próximos 30-60 días** según se vayan disparando emails día 1/3/7/11/14 a los new customers que entran al trial.

### Métricas a vigilar

1. **Top 5 articles por comisión Amazon** — replicar patrón en clusters similares
2. **% paywall views eligible vs no_trial** — leading indicator de cohort aging (GA4 events ya activos desde 10 may)
3. **Trial → paid conversion rate** — semanal post-lifecycle activation
4. **Bounce rate** del pillar `/guia-equipamiento-running-2026` — health del cluster
5. **CTR del CTA app** dentro de articles afiliados — equilibrio Amazon vs Premium

### Notas operacionales

- Founder tiene premium activo en BD hasta 9 jun 2026 (manual SQL grant para test 10K Huelva). **Acción**: revertir cuando termine de validar plan Huelva (`UPDATE profiles SET es_premium=false, premium_until=NULL WHERE email='guetto2012@gmail.com'`).
- Webhook `supabase/functions/revenucat-webhook/index.ts` existe pero no verificado si está escribiendo todas las purchase events. Pendiente: confirmar que captura plan_individual purchases para reconciliar revenue.

## 🚀 PROCESO DEPLOY APPS A TIENDAS (memorizado 9 may 26)

### Tabla mental — quién hace qué

| Paso | Quién | Cómo |
|---|---|---|
| 1. Bump version + buildNumber | Claude | `npm run ship:full` o edit app.json manual |
| 2. Build IPA + AAB en cloud | EAS Build | `eas build --platform all --profile production` |
| 3. Subir IPA a App Store Connect (TestFlight) | EAS Submit | `eas submit --platform ios --latest` — usa ASC API key remota |
| 4. Subir AAB a Google Play **Internal track** | EAS Submit | `eas submit --platform android --latest` — usa service account `correrjuntos-8187a2854893.json` |
| 5. Promover Android Internal → Production | Claude | `npm run ship:promote` (script `promote-android.js` + Google Play API) |
| 6. **iOS Submit for Review** (crear version + asignar build + release notes + submit) | **Manualmente USER en ASC web** | https://appstoreconnect.apple.com/ → Apps → CorrerJuntos → iOS App → versión → Add for Review |
| 7. Apple Review | Apple | 24-48h |
| 8. Google Review | Google | 2-12h |
| 9. Liberar a producción | Auto | Tras aprobar tienda |

### ⚠️ Lección clave 9 may 26

**`eas submit --platform android` con `track: "production"` FALLA** con error "You've already submitted this version of the app". Google Play rechaza re-upload del mismo versionCode. Para promover Internal → Production hay que usar el endpoint "promote release" del Google Play Developer API. Eso lo hace `correr-juntos-app/scripts/promote-android.js`.

**iOS Submit for Review NO se puede automatizar sin .p8 key local** con scope App Manager. La key que usa EAS está en sus servidores y no es accesible. Las reglas de seguridad de Claude prohíben hacer login en cuentas con password.

### ✅ iOS Submit for Review automatizado (HECHO 9 may 26)

**Setup completo. `npm run ship:promote` ahora hace AMBAS plataformas.**

Credenciales (en `correr-juntos-app/`):
- Key ID: `VR6CJGD288`
- Issuer ID: `82269ea5-bead-4381-b767-3687965efa4b`
- File: `AuthKey_VR6CJGD288.p8` (en .gitignore — NUNCA commit)
- Role: Administración (full access)

Script: `scripts/promote-ios.js` hace:
1. JWT ES256 firmado con .p8 → bearer token ASC API
2. Find or create `appStoreVersion` (filter por versionString + platform)
3. Find build (filter por app + version + preReleaseVersion)
4. PATCH `/v1/appStoreVersions/{id}/relationships/build`
5. PATCH localizations existentes (whatsNew) — solo locales que YA tiene la app
6. PATCH `/v1/builds/{id}` con usesNonExemptEncryption=false
7. POST `/v1/reviewSubmissions` + POST `reviewSubmissionItems` + PATCH submitted=true

### ⚠️ LECCIONES CRÍTICAS iOS Submit (memorizadas)

#### Lección 1: `appStoreVersionSubmissions` está deprecated
Apple cambió el endpoint en 2022. Ya NO se usa `/v1/appStoreVersionSubmissions` — devuelve `403 FORBIDDEN_ERROR: does not allow CREATE, allowed: DELETE`.

**Endpoint nuevo correcto** (Review Submissions, agrupa app + IAP):
1. `POST /v1/reviewSubmissions` con platform + app
2. `POST /v1/reviewSubmissionItems` (linkear appStoreVersion al submission)
3. `PATCH /v1/reviewSubmissions/{id}` con `attributes.submitted = true`

#### Lección 2: NO crear locales nuevos vía API sin poblar todos sus campos
Si la app en ASC solo tiene `es-ES` configurada (description + keywords + screenshots), y al crear una version nueva intentas crear `en-US` con solo `whatsNew`, Apple bloquea el submit con:
```
STATE_ERROR.ENTITY_STATE_INVALID: This resource cannot be reviewed
```

El script ahora SOLO actualiza `whatsNew` en locales que YA existen en la version (auto-copiados de la version anterior). Para añadir un locale nuevo (ej: en-US para ir bilingüe), hay que:
- Hacerlo via ASC web (auto-copia campos genéricos)
- O setear vía API: description + keywords + marketingUrl + supportUrl + subir 6+ screenshots por device family

#### Lección 3: Apple no auto-inherit screenshots de version anterior vía API
Cuando creas un `appStoreVersion` via API (POST `/v1/appStoreVersions`), Apple SÍ auto-copia las localizations existentes (con description/keywords/screenshots de la version anterior), pero NO crea nuevas localizations para locales que no existían.

#### Lección 4: `usesIdfa` se puede setear vía PATCH version
Necesario antes de submit. `PATCH /v1/appStoreVersions/{id}` con `attributes.usesIdfa: false` (si no usas IDFA tracking).

#### Lección 5: `usesNonExemptEncryption` ya viene del Info.plist
Si `app.json` tiene `ITSAppUsesNonExemptEncryption: false`, el flag llega al binario y Apple lo lee automáticamente. Intentar PATCH-ear el build devuelve 409 (no es error — ya está seteado). Script ignora el 409.

### 📝 Release notes template (tener siempre listo)

**Spanish:**
```
v1.3.X — Lo nuevo:
• [feature 1]
• [feature 2]
• [feature 3]
• Múltiples mejoras de rendimiento y estabilidad
```

**English:**
```
v1.3.X — What's new:
• [feature 1]
• [feature 2]
• [feature 3]
• Multiple performance and stability improvements
```

### 🔍 Qué Claude PUEDE y NO PUEDE hacer

✅ **PUEDE:**
- Bump version, commits, push git
- Triggear builds EAS (cloud)
- Subir IPA / AAB vía EAS Submit
- Promover Android via Google Play API + service account
- Modificar app.json, eas.json, scripts
- Publicar OTAs (`eas update`)
- Verificar status (`eas build:list`, `eas update:list`)
- IndexNow ping
- Vercel deploy via git push

❌ **NO PUEDE:**
- Abrir URLs en el navegador del user
- Login en cuentas con password (Apple ID, Google account)
- Acción manual en ASC web (Submit for Review actual)
- Acción manual en Play Console web
- Aceptar 2FA codes del iPhone
- Cualquier cosa que requiera browser interactivo + auth humana

### ✅ Checklist pre-deploy v1.3.X

- [ ] `npm run ship:status` → ver versión + último OTA + builds
- [ ] Verificar Sentry sin issues críticos
- [ ] App.tsx + componentes sin warnings nuevos
- [ ] CLAUDE.md actualizado con cambios
- [ ] Si SDK nativo cambió: verificar runtimeVersion bump
- [ ] Si app.json (permisos, plugins): commit antes del build
- [ ] Si quedadas/seed data SQL: aplicar migration en Supabase

### 🎯 Procedimiento típico release v1.3.X

```bash
# 1. Cambios JS/TS → OTA (segundos)
npm run ship:ota -- "fix bug X"

# 2. Cambios nativos / nueva versión → full release (~30-40 min)
npm run ship:full

# 3. Cuando build termina y se sube a stores:
npm run ship:promote   # Android internal → production via API
                       # (iOS recordatorio: el user va a ASC y clica "Add for Review")
```

### 📞 IDs y credenciales clave

- **iOS App Store Connect**: App ID `6758505910`, Apple Team `4AVU63B7Q4`
- **Google Play Developer**: Account `6979904302857989185`, Service Account `eas-submit@correrjuntos.iam.gserviceaccount.com` (key: `correrjuntos-8187a2854893.json`)
- **EAS Project**: `236bbb35-24f6-47d4-8f1e-f43d79dded3d`
- **EAS API Key (iOS submit)**: `8NAQ3L94Z7` ([Expo] EAS Submit TtV7LNVfkP) — gestionada en EAS servers
- **runtimeVersion policy**: `appVersion` en app.json → cada bump crea nuevo runtime (OTA target)
- **Email cuenta dev**: correrjuntosapp@gmail.com (Apple) + cuenta Google Play

## Versión Actual

- **App publicada en stores**: **v1.3.6 (build 84)** en iOS + Android — runtime 1.3.6
- **iOS v1.3.6**: ✅ APROBADO por Apple (10 may noche). Disponible en App Store. Los 88+ users iOS recibirán notificación "Actualizar" según vayan abriendo la app
- **Android v1.3.6**: ✅ LIVE Producción 100% rollout
- **Última OTA servida runtime 1.3.6** (10 may): `c8de278b-e017-44ee-9151-ad8ec6984dc5` — workout detail real pace per block. **Acumula los 17 fixes/features de 10 may** (ver sección "Done hoy 10 mayo 2026").
- **Web**: Desplegada en Vercel (correrjuntos.com)
- **⚠️ ASC API .p8 key** (`AuthKey_VR6CJGD288.p8`): expirada o revocada — `check-store-status.js` devuelve 401. **Acción pendiente**: regenerar key en App Store Connect → Users and Access → Integrations → App Store Connect API. Sin esto `ship:promote` iOS y `check-store-status` no funcionan.

### Última OTA estable runtime 1.3.5 (alcanza users actuales)
- Update Group: `109067a4-489e-4585-a5d3-4aa711ac23b2`
- Mensaje: "feat(updates): OTAUpdateGate — auto-update silencioso (1f2c7fc)"
- Push: 9 may 26
- Acumula TODOS los fixes de mayo: welcome v4, race cards, mapa, push, feed scroll, premium gate, etc.

### Por qué v1.3.6 — problema de bundle embebido
Founder reportó (9 may 26) que tras desinstalar e instalar la app, la primera apertura mostraba el flujo viejo (welcome "568 runners cerca de ti", home Coach-Jose). Causa: el binario v1.3.5 lleva JS embebido del momento de build (abril); todos los OTAs de mayo se aplican en el SIGUIENTE cold-start. Solución v1.3.6 = nuevo binario con todo el JS de mayo embebido + componente OTAUpdateGate que bloquea render hasta aplicar OTA pendiente (parche para futuros OTAs sobre 1.3.6).

## 8 Seed Quedadas

- 🇪🇸 Madrid, Barcelona, Valencia, Sevilla
- 🇬🇧 Londres, 🇫🇷 París, 🇲🇽 CDMX, 🇦🇷 Buenos Aires
- Fotos reales Unsplash, nombres completos reales
- Visibles en web, NO en app hasta abril (filtro es_seed removido localmente)

## Local Changes NOT committed (for April build)

- `correr-juntos-app/src/services/api.ts` — removed es_seed filter
- `correr-juntos-app/src/services/storeReview.ts` — NEW: expo-store-review (7 días + 3 actividades)
- `correr-juntos-app/src/screens/PlanScreen.tsx` — resume paused plan, progress fix
- `correr-juntos-app/src/screens/PlanWizardScreen.tsx` — fixes
- `correr-juntos-app/src/screens/ActivityCompletionScreen.tsx` — store review integration
- `correr-juntos-app/src/context/AuthContext.tsx` — initInstallDate
- `correr-juntos-app/src/utils/analytics.ts` — 8 GA4 events for plans

## Pending (status May 10, 2026 — fin de día)

### 📋 Backlog próxima sesión (lunes 11 may 2026 o cuando vuelvas)

**✅ Resuelto el 11 may am (sesión actual)**:
1. ~~Añadir `CRON_SECRET` env var en Vercel~~ → **DONE**. Configurado en Vercel Production + Preview (Sensitive). Secret guardado en `.env.local` (gitignored).
2. Bonus fix: cron dispatcher tenía bug ESM/CJS — `package.json "type":"module"` hacía que `require()` crasheara con `ReferenceError`. Convertido a ESM en commit `45940e78`. Pipeline ahora 200 OK.
3. **Estado pipeline (11 may 07:49 UTC)**:
   - `lifecycle-trial`: 200 OK, processed=0, sent=0 (no trials en ventana 16d aún)
   - `recovery-ultra`: 200 OK, processed=0, sent=0 (landing acaba de salir live 10 may noche)
   - Vercel cron daily 09:00/09:05 UTC ya con auth — se ejecuta solo a partir de mañana.

**Verificación primera cosa al arrancar**:
1. **Apple v1.3.6 status** — `cd correr-juntos-app && node scripts/check-store-status.js`
   - Estado al cerrar 10 may: `WAITING_FOR_REVIEW` desde 9 may 07:46 UTC (~37h en cola)
   - Ventana normal Apple: 24-48h. Probable aprobación 11 o 12 may.
   - Si aprobada: los 88+ users iOS empiezan a actualizar a v1.3.6 + reciben todas las OTAs acumuladas.

**Para acelerar canal Recovery Ultra (sin coste, ROI alto)**:
3. **Email blast a 270 newsletter contacts** (5 min)
   - Plantilla: "Si has hecho ultra recientemente — plan recuperación 10 días gratis 👇"
   - Linkar a `/recuperacion-ultra?ref=newsletter-blast`
   - Esperado: 15-30 nuevos signups en 24h
4. **Banner recovery en pillar `/blog/guia-equipamiento-running-2026`** sección Trail (10 min)
   - Mismo patrón que el banner del article Ronda
   - Esperado: 5-10 signups/semana extra
5. **Post Instagram + link bio** "Plan recuperación post-ultra gratis" (5 min)
   - Foto Sierra de las Nieves (ya self-hosted)

**Cuando `lalegion101.com` publique resultados oficiales 2026** → ejecutar **Opción B** del article Ronda:
6. Tabla Top 10 General (M + F) con tiempos
7. Stats hero: inscritos / finishers / % / tiempo medio / récord
8. Galería 5-8 fotos del evento (CC BY o licencias)
9. Sección "Lecciones de la edición" (errores típicos, condiciones, abandonos por km)
10. Sección "Prepara la 2027" long-tail SEO (cuándo abren inscripciones, plan 12 meses, link `/planes/trail`)

**Otros backlog medio plazo**:
11. RevenueCat webhook → cerrar ciclo trial_starts (cuando sub convierte a paid o cancela, actualizar status automáticamente). Hoy queda `trial_active` indefinidamente.
12. Brevo webhook → escribir a `trial_email_log.opened/clicked` para ver engagement por email.
13. Coach dashboard básico (3 features: lista miembros · quedadas grupo · chat) — disparador para outreach a clubs.
14. Affiliate / referral system para coaches micro-influencers.
15. Bulk-add 200 carreras España + multi-race tab (Phase 2 carreras).
16. Push lifecycle "after first run" (Phase A.2).

**Datos del founder en BD que requieren reversión**:
- Premium activo hasta 9 jun 2026 (manual SQL grant para test 10K Huelva). **Acción**: cuando termines de validar el plan, ejecutar:
  ```sql
  UPDATE profiles SET es_premium=false, premium_until=NULL, fecha_premium=NULL
  WHERE email='guetto2012@gmail.com';
  ```

### 🟢 Done hoy 10 mayo 2026

**Día épico de dogfood. ~16 OTAs publicadas, 5 migraciones SQL, 1 Edge Function nueva, fix web blog. Founder ejerciendo de QA en TestFlight.**

**📱 App v1.3.6 — 16 OTAs encadenadas (runtime 1.3.6, 100% rollout)**

Orden cronológico (la última se sirve a todos):
1. `2acda1cb` — fix matching save button (TouchableOpacity propagation Android)
2. `c5747249` — fix filter race-meetups SQL (excluir tipo='race_meetup' en getRecommendedQuedadas)
3. `a5cca1ac` — fix heart/kudos optimistic UI (nested TouchableOpacity propagation)
4. `b5b1d4d9` — feat comments Strava-style (likes per comment, edit, delete) + RPCs
5. `c4b92836` — fix Pressable import en FeedScreen (crash modal comentarios)
6. `a48ade3c` — fix KudosIcon undefined → SVG inline + commentEditInput style
7. `aa21b88e` — feat race recommendation lat/lng haversine (geocoded 92 races)
8. `40c2a45c` — feat paywall hides trial copy if user already consumed it
9. `146ec159` — feat PlanWizard inherits race context (skip step "¿entrenas para evento?")
10. `755429a7` — fix wizard summary uses real plan weeks (not template default)
11. `2a8f4f64` — feat "Crear plan acelerado" button (force-override min_weeks)
12. `98376878` — fix hide RacePlanCard once active plan exists
13. `5fb69279` — fix timezone bug en change-training-days (toISOString shifted -1 day)
14. `52c35531` — fix hide hero quedada card from home top
15. `f6d5f87d` — fix home greeting respects when next workout actually is
16. **`c8de278b`** ← actual servida — fix workout detail real pace per block (ZONE_OFFSETS_SEC + labels amigables)

**🤖 Edge Function (server-side, instantáneo):**
- `ai-coach v6` — Coach Jose v2 prompt humanizado: "como un colega que ha corrido contigo cien veces, no como un fisiólogo en consulta". 3 ejemplos few-shot de MAL→BIEN. max_tokens 600→350.
- Founder validó: "Perfecto tío. Entonces a darte con confianza..." — fix funcionando

**🗄️ Supabase migrations (5 nuevas):**
1. `race_meetups_v1_system_user_and_tipo` — race-day meetups + system user
2. `feed_likes_comments_rpcs` + `feed_comment_likes_edit_delete` — comentarios Strava
3. `fix_get_feed_comments_ambiguous_user_id` — bug ambigüedad SQL `user_id`
4. `trial_lifecycle_emails_v1` — tablas trial_starts + trial_email_log + RLS
5. `plan_feasibility_force_override` — `p_force` boolean en validate + generate RPCs

**📨 Trial Lifecycle Emails — Pipeline completo construido (LIVE desde 11 may am):**
- `/api/cron/run?job=lifecycle-trial` daily 09:00 UTC (vercel.json crons configured)
- `/api/_lib/trial-email-templates.js` con 10 templates (ES+EN × Day 1/3/7/11/14)
- `iap.ts` graba `trial_starts` row cuando RC reporta `periodType === 'TRIAL'`
- ✅ `CRON_SECRET` configurado en Vercel 11 may am — pipeline 200 OK smoke-tested.
- ROI esperado: +20-40% trial→paid conversion

**🌐 Web blog fix:**
- `blog/index.html` — Card "101 km de Ronda" usaba foto de Machu Picchu (Pexels 2356045). Sustituida por `/public/blog-images/ronda/puente-nuevo-ronda.jpg` (self-hosted, real)
- ⚠️ Lección: el path correcto es `/public/blog-images/...` con prefijo `/public/` LITERAL (este proyecto NO es Next.js, sirve la jerarquía as-is). Mi primer intento usé `/blog-images/...` y dio 404.

**🔧 Datos del founder corregidos en BD:**
- `profiles.es_premium=true, premium_until=NOW()+30d` (para testear plan Huelva)
- `user_plans.ritmo_base = 4.83` (4:50/km, basado en su run real 12.33km @ 4:57/km — antes era 3.83/3:50, irreal)
- 12 user_workouts re-calculados con offsets pace_zones: easy 5:40, tempo 4:25, específico 4:50
- Workouts re-asignados a [3,4,7] (Mié/Jue/Dom) tras el fix timezone

**🎯 Decisión estratégica del día:**
Identificado el cuello de botella real: 612 users · 1 paid · $3 MRR = 0.16% conversion ratio (vs benchmark fitness 2-5%). Cuello NO es el paywall, ES que la gente no llega comprometida. **Phase A elegida: Trial Lifecycle Emails** (server-side, server-only, +20-40% conversión, ROI inmediato). Phase 2 (bulk-add 200 carreras, multi-race tab) y Push lifecycle aplazados al backlog.

**📊 Estado producción al cerrar 10 mayo:**
- iOS v1.3.6: WAITING_FOR_REVIEW (~37h en cola, dentro del rango normal 24-48h)
- Android v1.3.6: LIVE Production al 100%
- Sentry: 2 issues resueltos hoy (Pressable, KudosIcon — ambos del primer push de comments)
- Web: 521 articles ES+EN, hreflang reciprocidad, blog Ronda card fixed, **landing /recuperacion-ultra LIVE**
- TestFlight founder: dogfooding extensivo todo el día

**🌙 Sesión nocturna 10 may — Funnel Recovery Ultra + Vercel rescue:**
- 🚨 Vercel deploy del funnel recovery falló (commit `134b9ed`) — 14 functions vs 12 limit Hobby
- ✅ Consolidación a 12 con dispatchers (commit `1edffa22`):
  - 2 cron endpoints → 1 dispatcher `api/cron/run.js` que branchea por `?job=`
  - 2 subscribe endpoints → `api/brevo-subscribe.js` que branchea por `?type=`
  - Lógica de jobs movida a `api/_lib/jobs/` (no cuenta como function)
- ✅ Cleanup 2 endpoints muertos (`referral-validate`, `error-report`) — 12→10 con margen
- ✅ Fix ESM/CJS mismatch en `brevo-subscribe.js` (commit `b6ae031d`) — `import` ESM al top + `require()` en handler era incompatible. Convertido `_lib/jobs/recovery-ultra-subscribe.js` a ESM con `export default`
- ✅ /recuperacion-ultra landing LIVE 200 OK + banner article Ronda con CTA
- ✅ Migración Supabase `ultra_recovery_drip_v1` (subscribers + email_log)
- ✅ 20 templates email (10 días × ES+EN) en `_lib/ultra-recovery-templates.js`
- ✅ Cron en vercel.json daily 09:05 UTC (`/api/cron/run?job=recovery-ultra`)
- ✅ IndexNow ping para article + landing
- ✅ **CRON_SECRET configurado 11 may am** + cron dispatcher convertido a ESM (commit `45940e78` — `package.json "type":"module"` hacía crashear `require()`). Smoke test: ambos crons devuelven `{"ok":true, processed:0, ...}` con auth válida. Pipeline LIVE.

### ⚠️ REGLA NUEVA — Vercel Hobby plan: max 12 serverless functions

Cualquier endpoint nuevo bajo `api/*.js` cuenta como una function. Pasar de 12 = deploy fail (state=ERROR en "Deploying outputs..."). Patrón obligatorio para escalar sin pagar Pro:

**Crons** → todos bajo `/api/cron/run?job=<nombre>`. Handler en `api/_lib/jobs/<nombre>.js`. Registrar en `JOBS` map de `run.js`:
```js
const JOBS = {
  'lifecycle-trial': require('../_lib/jobs/lifecycle-trial'),
  'recovery-ultra':  require('../_lib/jobs/recovery-ultra'),
  // nuevo cron aquí, NO en api/cron/X.js
};
```

**Subscribe / form endpoints** → todos bajo `/api/brevo-subscribe?type=<nombre>`. Handler en `_lib/jobs/<nombre>-subscribe.js`. Branchear en el dispatch del top de `brevo-subscribe.js`.

**Otros tipos de endpoint** (admin, webhooks de terceros, OAuth callbacks) → si son ≤12 totales, OK. Si pasamos, agrupar bajo `/api/admin/run?action=` o similar.

**Carpetas que NO cuentan como function**:
- `api/_lib/` (cualquier subcarpeta) — son shared modules
- Ficheros con extensión que NO sea `.js` o `.ts`

**Triggers para upgrade a Pro ($20/mes)**:
- MRR > $200/mes (Pro será <10% revenue → cómodo)
- Bandwidth > 70GB/mes
- Necesitas previews protegidos por password
- Build time > 30s

Hoy ninguno aplica → seguimos Hobby.

**ESM ↔ CJS gotcha** (memo crítico, ya nos ha picado 2 veces):
- `package.json` tiene `"type": "module"` → **TODO `.js` es ESM por defecto**.
- En ESM, `require()` y `module.exports` NO existen → al cargar el módulo da `ReferenceError: require is not defined` y Vercel responde 500 `FUNCTION_INVOCATION_FAILED`.
- **Regla**: cualquier archivo nuevo en `api/**/*.js` o `api/_lib/**/*.js` DEBE usar:
  - `import X from '...'` al top (no `require`)
  - `export default async function handler(req, res) {...}` (no `module.exports = ...`)
  - Imports relativos con extensión `.js` (`'./templates.js'` NO `'./templates'`)
- Si un módulo importa otro `_lib/`, el otro también debe ser ESM (`export {...}`).
- **Cómo se descubre**: smoke test cron devuelve 401 (con auth wrong) pero 500 con auth correcta. Ver `get_runtime_logs` con `statusCode:500` para ver `ReferenceError: require is not defined`.
- **Histórico**: nos ha picado en `brevo-subscribe.js` (10 may → commit `b6ae031d`) y de nuevo en `api/cron/run.js` + jobs + templates (11 may → commit `45940e78`).

### ⚠️ REGLA NUEVA — Blog assets path

**Este proyecto NO es Next.js**. Vercel sirve la jerarquía as-is. **Todo asset estático bajo `/public/...` debe usarse con el prefijo `/public/` LITERAL en la URL**:

```html
<!-- BIEN: -->
<img src="/public/blog-images/ronda/puente-nuevo-ronda.jpg">

<!-- MAL (404): -->
<img src="/blog-images/ronda/puente-nuevo-ronda.jpg">
```

Aplica a: blog/index.html, og:image, hero images, JSON-LD schema. El blog-generator script debería enforcearlo.

### 🟢 Done hoy 9 mayo 2026

**App v1.3.6 — pipeline 100% automatizado:**
- ✅ EAS build v1.3.6 iOS + Android (build 84) — finished
- ✅ iOS subida a App Store Connect via EAS Submit
- ✅ iOS **Submit for Review automatizado** vía ASC API + .p8 key (script `promote-ios.js`)
  - Status actual: **WAITING_FOR_REVIEW** (Apple)
  - Endpoint nuevo: `/v1/reviewSubmissions` (el viejo `appStoreVersionSubmissions` deprecated)
- ✅ Android subida a track Internal via EAS Submit
- ✅ Android **promovido a Production** vía Google Play API (script `promote-android.js`)
  - Status actual: **Disponible en Google Play (lanzamiento completo)** — live para 88+ users
- ✅ Scripts npm: `ship:ota`, `ship:full`, `ship:promote`, `ship:status` (release pipeline completo)
- ✅ OTAUpdateGate añadido en App.tsx — auto-update silencioso

**Backend / SQL:**
- ✅ Premium fake del founder removido de BD
- ✅ RPC `get_ranking_mensual/global` ahora chequea `premium_until > NOW()` (no solo `es_premium`)
- ✅ Test user "Prueba" (correrjuntosapp+test2@gmail.com) borrado completo de BD

**Blog SEO + monetización:**
- ✅ **Pillar page** `/blog/guia-equipamiento-running-2026` (493 líneas, links 79 articles)
- ✅ **Gap article** `/blog/equipamiento-running-principiante-200-euros` (kit completo)
- ✅ Refresh `/blog/mejores-relojes-gps-running` (date+callout mayo, 3 imgs Amazon caducadas fixed)
- ✅ Logos SVG inline (en lugar de emojis) para clusters + popups newsletter
- ✅ Fotos producto reales (estilo Wirecutter) en cluster icons del pillar
- ✅ Author unification: 246 articles "Jose Marquez" → "Abraham Márquez Rodríguez"
  con foto `/public/abraham.jpg` + Instagram + LinkedIn. Vercel redirect 301 al URL nuevo.
- ✅ Author Carlos Ruiz photo añadida (POV pista atletismo `/blog/autor/photos/carlos-ruiz.jpg`)
- ✅ author.js v2: 4 autores + lookup acentos + light mode CSS + foto real con fallback
- ✅ **100% enlaces Amazon directos `/dp/ASIN`** con tag `diezmejores21-21`:
  - 20/20 con afiliado, 0 search URLs, 0 rotos
  - Sustituciones del día: Hoka Clifton 10 (B0D5FRX2W9), Shokz OpenMove (B09BW29FJS),
    adidas Workout Essentials (B0F54S2H4H), adidas Own The Run Shorts (B0CKTPLS56)
- ✅ **Deep link contextual cro.js** — mid/end CTAs ahora matchean slug con plan específico
  - `/planes/0-5k` para principiantes, `/planes/maraton`, `/planes/trail`, etc.
  - CTR esperado +35-50% vs genérico (data Wirecutter/RTINGS)

### 🟡 En review (esperando)
1. 🟡 **iOS v1.3.6** WAITING_FOR_REVIEW — Apple Review 24-48h
2. 🟡 **Android v1.3.6** ya LIVE en Production track — propagación CDN 1-2h para que users vean "Actualizar"

### 📅 ESTA SEMANA — articles SEO con tirón

#### 🚨 PRIORIDAD HOY/ESTA SEMANA: 101 km de Ronda (10 may 2026)

- **Evento**: 101 km de Ronda — ultratrail anual organizada por la Legión Española en Ronda (Málaga)
- **Dato a confirmar**: 101 km clásico O 110 km versión corta (founder sospecha 110, hay que verificar)
- **Por qué tiene tirón**: search volume PICO durante la semana del evento. Google premia contenido publicado el día/semana del evento (signal "freshness" + "newsworthy"). Los runners buscan: clasificaciones, perfil, recorrido, supervivientes, fotos, time cuts, guía nutrición.
- **Article objetivo**: `/blog/101-km-ronda-2026-guia-completa.html`
- **Estructura sugerida** (Wirecutter level):
  - Hero con imagen del evento + perfil altura
  - Stats hero: distancia, desnivel, time cut, participantes
  - Recorrido: 4 secciones del trayecto con km, desnivel, tipo terreno
  - Tabla nutrición (geles, agua, sales) por hora de carrera
  - Equipamiento obligatorio + recomendado (con afiliados Amazon — Salomon, Petzl, Compressport)
  - Plan entrenamiento ultra (linkear `/planes/trail` cuando exista versión ultra)
  - Time cuts oficiales por punto
  - Histórico ganadores + récords
  - FAQ (10 preguntas)
- **Affiliates objetivo**: 8-12 productos directos /dp/ASIN
- **CTA app**: "Encuentra runners que hagan los 101 cerca de ti"
- **Hreflang**: ES + EN (versión EN: `101-km-ronda-2026-complete-guide`)
- **Schema.org**: SportsEvent + Article + ItemList + FAQPage
- **IndexNow ping** post-deploy

### Backlog (resto)
1. ✅ Activate training plans — DONE April
2. ✅ Activate annual plan 29,99€ — DONE in v1.3.0
3. Show seed quedadas in app — pending build (es_seed filter removed locally)
4. Estrategia contenido quedadas — solo 2 quedadas reales en BD, founder dijo "mañana hacemos"
5. Implement Garmin/COROS/Apple Watch sync — pending API approval
6. Foto María López para author bio (la "chica" del blog, 3 articles)
7. (Opcional) Cron mensual auditoría imágenes Amazon — detecta 404s en CDN

### 🔧 Scripts de release ya operativos

```bash
# Hotfix JS via OTA (segundos)
npm run ship:ota -- "fix message"

# Release completo (bump version + build EAS + submit ambas tiendas)
npm run ship:full

# Promover ambas plataformas a producción/review
# - Android: Internal → Production via Google Play API
# - iOS: Submit for Review via ASC API + .p8 key
npm run ship:promote

# Estado actual
npm run ship:status
```

## Colores

- App: Naranja #FF6B00, Negro #111111, Blanco #FFFFFF, Gris #888888
- Deportes: Carrera #FF6B00, Bici #0066FF, Trail #2ECC71, Caminata #888888
- Web: orange #f97316, dark bg #0b1220, warm cream #fef7ed
- **Theme: Light mode ALWAYS default**

## 📱 Recovery Ultra Reels — Social Playbook (memorizado 11 may 2026)

**Reels producidos** (en `tools/marketing/`, kinetic typography + fotos Ronda con Ken Burns):
- `reel-recuperacion-ultra.mp4` — 🇪🇸 ES (4.55 MB, 19.5s, 6 escenas, 3 con foto Puente Nuevo/Sierra)
- `reel-ultra-recovery-en.mp4` — 🇬🇧 EN (4.43 MB, 19.5s, mismas escenas traducidas)

**Fotos Ronda usadas**: `tools/marketing/ronda-photos/` (`puente-nuevo-ronda.jpg`, `ronda-desde-sierra-blanquilla.jpg`, `sierra-las-nieves-pinares.jpg`). Origen: `/public/blog-images/ronda/`.

### 📋 Copy & paste para subir

#### TikTok caption (190 chars, SEO-first)
```
Cómo recuperarse después de una ultra trail · Plan gratis 10 días post-Ronda 101km. Sin login, sin pagar.

📍 Link en bio → recuperación ultra

¿Hiciste Ronda este sábado? Cuéntame qué tal 👇

#ultratrail #101kmronda #recuperacion #trailrunning #fyp
```
**5 hashtags TikTok**: `#ultratrail #101kmronda #recuperacion #trailrunning #fyp`

#### Instagram Reels caption (storytelling, no keyword-stuff)
```
Hiciste la ultra. Lo difícil ahora son los siguientes 10 días.

La mayoría se sienta en el sofá pensando que es descanso. Y se lesiona 6 semanas después.

Hemos diseñado el plan que nos hubiera gustado tener: 10 emails, 1 al día, qué hacer + qué evitar + cuándo es normal sentir mierda.

Sin login. Sin spam. Gratis.

📍 Link en bio → recuperación ultra

¿Hiciste Ronda este sábado? Contadme el peor km 👇

#ultratrail #101kmronda #recuperacion #trailrunning
```
**4 hashtags IG** (NO `#fyp`, ese es TikTok-only): `#ultratrail #101kmronda #recuperacion #trailrunning`

#### Primer comentario (auto-comment, SAME para IG + TikTok)
```
Por si alguien duda: NO es la app, son emails. Sin login, sin pagar, sin spam. Lo creamos porque nosotros también la lesionamos por saltarnos la recuperación 😅

¿Cuál es vuestra peor lesión post-ultra?
```
**Por qué funciona doble**: objection killer (no es app) + humaniza (nosotros también la lesionamos) + pregunta abierta (invita historias) + algoritmo TikTok/IG cuenta comentarios primeros 60min como señal de calidad.

### Reglas SEO-platform diferenciadas

| Aspecto | TikTok | Instagram |
|---|---|---|
| Primer 100 chars | Keywords search-friendly | Hook emocional (storytelling) |
| Hashtags | 5 (3 nicho + 1 evento + 1 broad/fyp) | 4 (3 nicho + 1 broad, **sin** fyp) |
| Caption length | <200 chars (peak retention) | 4 párrafos cortos OK (premia retención) |
| `#fyp` | ✅ amplificador | ❌ penaliza (IG no lo entiende) |
| Search behavior | Plataforma usada como buscador | Discovery vía Explore/Reels |
| Indexa keywords del caption | SÍ fuertemente | Débilmente desde 2024 |

### Tracking attribution

Cada signup que llegue via `/recuperacion-ultra` se attributiona via `?ref=`:
- `?ref=tiktok` — desde TikTok bio
- `?ref=instagram` — desde IG bio
- `?ref=ronda-101` — desde artículo Ronda + comentarios FB grupo
- `?ref=newsletter-blast` — desde email Brevo
- `?ref=pillar-trail` — desde pillar Trail

BD: `ultra_recovery_subscribers.race_source` guarda el valor → consulta:
```sql
SELECT race_source, COUNT(*) FROM ultra_recovery_subscribers GROUP BY race_source;
```

### Comentario en grupo FB "101Km 24h de La Legión. Ronda" (memorizado)
Postear DESPUÉS de compartir el artículo Ronda en el grupo. Empuja el algoritmo + atrae directamente a finishers.
```
PD: para los que aún tenéis las piernas destrozadas hoy, hemos hecho también un plan recuperación 10 días gratis — un email al día con qué hacer y qué evitar tras la ultra. Sin login, sin spam.

👉 correrjuntos.com/recuperacion-ultra

¿Cómo os ha ido el sábado? Contadme el peor km que recordáis 👇
```

### Orden de publicación recomendado
1. **AHORA** (post-Ronda hot window 24-48h) — TikTok ES primero (algoritmo aprende ES audience)
2. **+10 min** — IG Reels ES
3. **+10 min** — YouTube Shorts ES
4. **+ 30-60 min** — Mismo reel a otros grupos FB running ES
5. **Esta noche / mañana** — Versión EN (TikTok + IG)

NUNCA subir EN primero — el algoritmo asigna audience EN y la siguiente publicación ES tiene menos reach.

### Pipeline reels (referencia técnica)
Ver `tools/marketing/REELS_PIPELINE.md`. Comandos:
```bash
# Validar diseño antes de render
node tools/marketing/preview-reel-recuperacion.cjs
node tools/marketing/preview-reel-recovery-en.cjs

# Render MP4 final
node tools/marketing/record-tiktok.cjs reel-recuperacion-ultra
node tools/marketing/record-tiktok.cjs reel-ultra-recovery-en
```

Para nuevo reel sobre otro tema (ej: Madrid Maratón, UTMB):
1. `cp reel-recuperacion-ultra.html reel-{nuevo}.html`
2. Editar texto + foto path en `.photo-bg` style
3. Crear preview script + render

---

## 🎨 Email Brand System — "Meridian Motion" (memorizado de Supabase Auth template "Confirm signup")

**FUENTE DE VERDAD**: Supabase Dashboard → Authentication → Email Templates → "Confirm sign up" (asunto "Confirma tu cuenta en CorrerJuntos"). **NO** es el Brevo template #3 (esa fue una mala asunción en una sesión anterior — corregida 10 may pm).

URL: `https://supabase.com/dashboard/project/waihiwdbtcbdazmaxdor/auth/templates/confirm-sign-up`

**Cuando un agente edite cualquier email transaccional de la app, debe seguir este sistema visual** para mantener identidad con el primer email que el user recibe (confirmación tras registro).

### Tokens de paleta

| Token | Valor | Uso |
|---|---|---|
| `BG` | `#0b1220` | Outer bg + card bg |
| `ORANGE` | `#f97316` | Brand: bullet, eyebrow accent, tagline, H1 strong, CTA bg, links |
| `TEXT` | `#f6f1e8` | Cream principal — H1, strong, logo signature |
| `TEXT_72` | `rgba(246,241,232,0.72)` | Body paragraphs |
| `TEXT_42` | `rgba(246,241,232,0.42)` | Eyebrow muted, footer notes |
| `TEXT_28` | `rgba(246,241,232,0.28)` | Footer "Meridian Motion" micro |
| `BORDER_08` | `rgba(246,241,232,0.08)` | Card border |
| `BORDER_12` | `rgba(246,241,232,0.12)` | Section dividers (top of footer) |

### Tipografía

| Slot | Font | Peso | Tamaño | Letter-spacing |
|---|---|---|---|---|
| Body / paragraphs | `Inter` (con fallback stack) | 400 | 15px | normal |
| H1 (light part) | Inter | **200** ultra-thin | **44px** | -0.035em |
| H1 (`<strong>` highlight) | Inter | **700** | 44px | -0.035em (color naranja) |
| Eyebrow `• Confirmación · Nº 01` | `JetBrains Mono` | 500 | 11px | **0.22em** uppercase |
| Tagline `── CORRE ACOMPAÑADO` | JetBrains Mono | 500 | 11px | **0.30em** uppercase orange |
| CTA label | Inter | 600 | 15px | 0.01em |
| Logo "Correr*Juntos*" | Inter | **800** | 26px | -0.03em |
| Footer "Meridian Motion · correrjuntos.com" | JetBrains Mono | 500 | 10px | **0.28em** uppercase |
| Direct-link section header "Enlace directo" | JetBrains Mono | 500 | 10px | 0.22em uppercase |

### Estructura del email (orden de secciones)

```
┌──────────────────────────────────────────────┐  outer padding 48px 16px
│                                              │
│  ┌────────────────────────────────────────┐ │  card max-w 560px, br 20px,
│  │ • [orange dot 10×10px circle]          │ │  bg #0b1220, border subtle
│  │                                         │ │
│  │ • Confirmación · Nº 01                 │ │  EYEBROW (mono, tracked)
│  │                                         │ │
│  │ ── CORRE ACOMPAÑADO                    │ │  TAGLINE (mono, tracked, orange)
│  │                                         │ │
│  │ Un paso más y estás dentro.            │ │  H1: light 200 + strong 700 orange
│  │                                         │ │
│  │ Gracias por registrarte en             │ │  BODY (15px, line 1.65, cream/72%)
│  │ CorrerJuntos. Confirma tu correo y...  │ │
│  │                                         │ │
│  │  ┌─────────────────────┐              │ │  CTA solid orange,
│  │  │ Confirmar mi cuenta →│              │ │  DARK text on top
│  │  └─────────────────────┘              │ │  (NOT pill — radius 10px)
│  │                                         │ │
│  │ ─── divider ───                         │ │  border-top BORDER_12
│  │                                         │ │
│  │ CorrerJuntos                            │ │  Logo signature (Juntos italic orange)
│  │ hola@correrjuntos.com                   │ │  Mono 11px tracked orange
│  └────────────────────────────────────────┘ │
│                                              │
│  MERIDIAN MOTION · correrjuntos.com         │  Footer micro (mono 10px, tracked, fade)
│                                              │
└──────────────────────────────────────────────┘
```

### Reglas de copy

- **Eyebrow**: `Confirmación · Nº 01`, `Recuperación · Día 03`, `Trial · Día 07` — formato `[Categoría] · [Numero]`. Numero con leading zero (01, 02…).
- **Tagline**: siempre `CORRE ACOMPAÑADO` (ES) / `RUN TOGETHER` (EN). NUNCA cambiar.
- **H1**: máx 5-6 palabras. Mix-weight: parte regular cream + 1 palabra clave orange bold. Ej: `Un paso más y estás **dentro**.`
- **Body**: 1-3 párrafos cortos, 15px, color al 72%. Strong en cream 100% para emphasis (NO en orange).
- **CTA**: máx 4 palabras + flecha (`→`). Verbo de acción. Texto DARK sobre orange.
- **Footer**: solo logo + email contacto + "Meridian Motion · correrjuntos.com" micro. NUNCA redes sociales.

### Helpers reutilizables (`api/_lib/*-templates.js`)

- `shell({ eyebrow, tagline, h1Pre, h1Strong, h1Post, body, ctaUrl, ctaLabel, preheader, lang })` — wrap completo
- `lead(txt)` — primer párrafo (margin-bottom 22px)
- `para(txt)` — párrafo intermedio (margin-bottom 18px)
- `paraLast(txt)` — último párrafo sin margin
- `list(items[])` — UL con bullets
- `callout(label, body)` — caja naranja sutil con header tracked
- `warn(label, body)` — caja roja para señales de alarma (rabdomiólisis, etc)
- `strongCream(txt)` — `<strong>` en cream 100% (NO orange) para emphasis

### NO TOCAR sin coordinar

| Plataforma | Template | Donde editar |
|---|---|---|
| Supabase Auth | "Confirm sign up" | Supabase Dashboard → Auth → Email Templates |
| Supabase Auth | "Reset password" | (mismo) |
| Supabase Auth | "Magic link" | (mismo) |
| Brevo | #3 CJ DOI Confirmation | Brevo dashboard → Templates |
| Brevo | #1 Bienvenida Newsletter | (mismo) |
| Brevo | #4 CJ Welcome EN | (mismo) |

**Si vas a editar uno** → modifica TODOS los demás simultáneamente para mantener identidad. La identidad solo funciona si es consistente.

## 🔒 Auditoría de seguridad — 11-12 mayo 2026

**Origen**: CI fallaba desde 26 abril → billing GitHub Actions bloqueado (agotado 2.000 min/mes Hobby plan). Decisión: hacer el repo público (Actions gratis ilimitado en públicos = $0/forever vs $20/mes Pro). Pero antes había que limpiar secrets leaked.

### Estado final secrets (TODOS muertos)

| Secret | Estado | Acción aplicada |
|---|---|---|
| Buffer API key (`...jJ5N`) | 💀 | Revocada en buffer.com (0 uso 30d) |
| Make webhook (`...y70bz`) | 💀 | Eliminada en make.com (0 uso 50d) |
| Supabase service key (`sb_secret_FbZDb...`) | 💀 | Reemplazada por `sb_secret_TZEBm...` + leaked DELETED |
| Stripe secret key + webhook | 💀 | **Cuenta Stripe cerrada entera** (era legacy, 0 usuarios activos pagando) |
| Brevo API key (`xkeysib-ad79201...`) | 💀 | Ya estaba dead (HTTP 401) — rotada hace meses |
| INDEXNOW_SECRET (`cj_indexnow_s3cr3t_2026`) | 💀 | Rotado a 64-char hex aleatorio |
| Vercel OIDC token | 💀 | Expired mar 19 (8 semanas pre-leak) |

### Git history scrubbing aplicado

- `.env` scrubeado con `git filter-repo --invert-paths --path .env` (942 commits)
- `.env.brevo` + `.env.vercel` scrubeados con mismo método
- Brevo key hardcoded en `tools/brevo-create-draft.cjs` redactada con `git filter-repo --replace-text` en TODO el history
- 2 force-pushes a master (única persona usando el repo, sin riesgo)
- `tools/brevo-create-draft.cjs` ahora lee `BREVO_API_KEY` de `.env` o env vars

### `.gitignore` final (post-cleanup)

```
.env
.env.*
.env*.local
```

### Estado producción tras cleanup

- ✅ Vercel deployment `A5M31R5QQ` con nuevo SUPABASE_SERVICE_KEY (Project-scoped var, overrides Shared)
- ✅ Smoke tests post-rotación: 200/401/405/404 (todos esperados, ningún 500)
- ✅ Edge Functions usan `SERVICE_ROLE_KEY` legacy JWT (sin tocar — diferente del rotado)
- ✅ Brevo 2 active keys (correrjuntos-web-prod, Supabase Edge Functions) sin tocar

### ⚠️ Trick clave: workaround Vercel Pro paywall

Vercel Hobby plan **no permite rotar/editar Shared Variables** (`SUPABASE_SERVICE_KEY`, `STRIPE_*` antes de cerrarse, etc.). Intenta cobrar $20/mes Pro al clicar Rotate.

**Solución**: añadir la misma key como **Project-scoped variable** (gratis). Project sobreescribe Shared. Pasos:
1. Vercel env vars → tab "Project"
2. "Add Environment Variable"
3. Mismo nombre que la Shared
4. Nuevo valor
5. Environments: Production + Preview (Development queda bloqueado por Pro pero no importa)
6. Save → trigger redeploy

### Pendientes housekeeping (no urgente)

1. **Limpiar código dead de Stripe** (account closed):
   - `api/stripe-webhook.js`
   - `supabase/functions/stripe-webhook/`, `create-checkout/`, `create-portal-session/`
   - STRIPE_* env vars en Vercel (los valores están dead pero quedan como ruido)
   - STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET secrets en Supabase Edge Functions
   - PremiumContext.tsx — limpiar branch `premiumSource === 'stripe'` (solo 2 users legacy con `expired`/`canceled` status)

2. **Tests E2E Playwright obsoletos** (40/40 fallan — testean arquitectura SPA con modales que ya no existe post-refactor 25 abril `aea2dcb9`)

3. **`.p8` Apple key expirada** — bloquea `ship:promote` iOS y `check-store-status.js`. Regenerar en ASC → Users and Access → Integrations → App Store Connect API.

### Memorizar para futuro

- **NUNCA hardcodear secrets** en código. Usar `process.env.X` o leer de `.env` (gitignored).
- **Sospechar siempre** de archivos `.env.brevo` / `.env.vercel` / `.env.local` — Vercel CLI los genera al hacer `vercel env pull` y se cuelan en commits si no están en `.gitignore` desde el inicio.
- **Antes de hacer repo público**: `git grep -nE "(sk_(live|test)_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,}|xkeysib-[a-f0-9]{20,}|sb_secret_[A-Za-z0-9]{20,})" HEAD` para detectar secret patterns en código tracked.

### Backup tags creados

- `backup-before-env-scrub-20260511-190926` (antes del primer scrub)
- `backup-before-env-final-scrub-20260512-073935` (antes del scrub final + replace-text)

## 🚨 Emergencia GitGuardian — 12 may 2026 (sesión 2)

**Origen**: Tras hacer público el repo, GitGuardian detectó leak en **6 segundos**. 2 emails: Stripe Webhook Secret + Supabase Service Role JWT expuestos.

### Vector real del leak

Auditoría inicial pre-public solo cubrió `.env*`. **NO auditó `tools/*.cjs` con fallbacks hardcoded**:

```js
// PATRÓN PELIGROSO — en tools/create-quedadas.cjs
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGci...';
//                                                    ^^^^^^^^^^^^^^
//                                  Fallback con JWT real hardcoded
```

El leaked JWT era el **legacy service_role JWT** (`role:service_role`, iat:1768554060, exp:2036). God-mode DB access. Estuvo público **~8 minutos** antes del scrub.

### Cómo se neutralizó (Path C surgical, no nuclear)

Supabase ofrece 2 caminos:
- **Nuclear**: Reset JWT signing secret (mata todo, **loguea fuera a todos los users**)
- **Quirúrgico**: "Disable JWT-based API keys" (mata legacy anon + service_role, **preserva sesiones de usuarios** porque solo invalida uso como `apikey` header, no como Bearer token de sesión)

Se eligió quirúrgico. Pero requiere migrar previamente todo lo que usa los keys legacy.

### Workflow exacto aplicado

#### 1. Scrub git history (replace-text)
```bash
# Crear replacement file
cat > /tmp/replacements.txt <<EOF
LEAKED_LEGACY_JWT_FULL_STRING==>REDACTED_SUPABASE_SERVICE_JWT_LEGACY
whsec_LEAKED_STRIPE==>REDACTED_STRIPE_WEBHOOK_DEAD
LEAKED_STRAVA_SECRET==>REDACTED_STRAVA_CLIENT_SECRET_OLD
EOF

git filter-repo --replace-text /tmp/replacements.txt --force
git remote add origin <URL>  # filter-repo lo borra
git push --force origin master
```

#### 2. Migrar web frontend (anon JWT → publishable key)
```bash
OLD_ANON="eyJhbGci...iat:1768554060..."
NEW_PUB="sb_publishable_JjURpz9jAqM4S9r4ofknAg_GW4Es97N"

# Files (master): auth/reset.html, js/app.js, js/app.min.js,
# js/modules/quedadas.js + .min.js, stats/index.html,
# tools/create-real-quedadas.cjs, index-pwa-backup.html
# Use node script with split/join to handle long strings safely
```

#### 3. Migrar React Native app
- `correr-juntos-app/.env`: `EXPO_PUBLIC_SUPABASE_ANON_KEY` → publishable
- EAS production env var: `eas env:update --environment production --variable-name EXPO_PUBLIC_SUPABASE_ANON_KEY --value sb_publishable_... --visibility plaintext --non-interactive`
- OTA push: `eas update --branch production --message "..."`
- v1.3.6 con OTAUpdateGate aplica auto al next launch

#### 4. Migrar Edge Functions (lo más complejo)

Supabase **NO permite custom secrets con prefix `SUPABASE_`** (error "Name must not start with the SUPABASE_"). Solución:

```ts
// Pattern: leer custom secret PRIMERO, fallback a built-in legacy
const supabaseKey = (Deno.env.get('SERVICE_ROLE_KEY_NEW') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))!;
```

Bulk script:
```bash
for f in supabase/functions/*/index.ts; do
  if grep -q "SUPABASE_SERVICE_ROLE_KEY" "$f"; then
    node -e "let s=require('fs').readFileSync('$f','utf8');
      s=s.replace(/Deno\.env\.get\(['\"\']SUPABASE_SERVICE_ROLE_KEY['\"\']\)/g,
        \"(Deno.env.get('SERVICE_ROLE_KEY_NEW') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))\");
      require('fs').writeFileSync('$f',s);"
  fi
done

# Deploy ALL functions at once
supabase functions deploy --project-ref waihiwdbtcbdazmaxdor
```

**⚠️ Pull orphan functions primero** (functions deployed en Supabase pero NO en git):
```bash
for fn in hyper-action delete-account notify-new-quedada ai-coach; do
  supabase functions download $fn --project-ref waihiwdbtcbdazmaxdor
done
```

#### 5. Crear custom secrets en Supabase

- `SERVICE_ROLE_KEY` (existente, value updated) — usado por `notify-new-quedada`, `delete-account`
- `SERVICE_ROLE_KEY_NEW` (nuevo) — usado por las 14 funciones migradas
- Ambos contienen el mismo `sb_secret_TZEBm...` value (el nuevo sb_secret_ key del 11 may)

#### 6. Click final
Supabase Dashboard → Settings → API → Legacy anon, service_role API keys → **"Disable JWT-based API keys"** → typing "disable" → Confirm

#### 7. Smoke tests verifican

```bash
# Leaked JWT debe retornar 401:
curl -H "apikey: $LEAKED_JWT" \
  "https://waihiwdbtcbdazmaxdor.supabase.co/rest/v1/profiles?select=id&limit=1"
# → HTTP 401 ✅

# New publishable key debe retornar 200:
curl -H "apikey: $NEW_PUB" "..."
# → HTTP 200 ✅

# Production web sigue OK:
curl "https://www.correrjuntos.com"
# → HTTP 200 ✅
```

### Estado final post-emergencia

| Asset | Estado |
|---|---|
| Legacy anon JWT | 💀 disabled |
| Legacy service_role JWT (LEAKED) | 💀 disabled — was alive ~8 min, now HTTP 401 |
| New `sb_publishable_*` | 🟢 active in web + app |
| New `sb_secret_TZEBm...` | 🟢 active in Supabase Edge Functions |
| User sessions | 🟢 preserved (JWT as Bearer still valid) |
| GitGuardian detection time | 6 seconds post-push 💥 |
| Total exposure window | ~8 minutes |

### Reglas grabadas a fuego post-emergencia

1. **NUNCA fallback hardcoded de secrets** — el patrón `process.env.X || 'literal'` es bomba de relojería. Usar:
   ```js
   const X = process.env.X || readFromDotEnv('X');
   if (!X) { console.error('Missing X'); process.exit(1); }
   ```

2. **Pre-public-flip checklist EXHAUSTIVO**:
   ```bash
   # Secret patterns (no solo .env*)
   git grep -nE "(sk_(live|test)_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,}|xkeysib-[a-f0-9]{20,}|sb_secret_[A-Za-z0-9]{20,})" HEAD

   # JWTs (decode payload to check role)
   git grep -nE "eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{50,}\.[A-Za-z0-9_-]{20,}" HEAD

   # Hardcoded fallbacks (el patrón peligroso)
   git grep -nE "process\.env\.[A-Z_]+\s*\|\|\s*['\"\']" HEAD
   git grep -nE "Deno\.env\.get\([^)]+\)\s*\|\|\s*['\"\']" HEAD
   ```

3. **Supabase custom secrets reservan prefix `SUPABASE_`** — usar nombres custom (ej: `SERVICE_ROLE_KEY_NEW`) y actualizar código a leer de ahí con fallback.

4. **Edge Functions orphan**: pueden estar deployed en Supabase pero NO en git. SIEMPRE auditar con `supabase functions list --project-ref X` antes de operaciones de seguridad. Pull con `supabase functions download $fn`.

5. **Supabase Disable JWT-based API keys NO loguea fuera a users** — solo invalida uso como `apikey` header. Sesiones (Bearer auth) sobreviven.

### Backup tags emergencia
- `emergency-backup-20260512-064207` (antes del scrub emergency)
- 3 force pushes en sesión 12 may

### Pendientes derivados (próxima sesión)

1. **Monitor Sentry 24-48h** — users con app v1.3.5 o anterior podrían fallar auth (legacy anon JWT en bundle viejo). Si hay errores → considerar push prompt para update.
2. **Limpiar dead Stripe code** — sigue siendo housekeeping del día anterior.
3. **Tests E2E Playwright obsoletos** — reescribir cuando volvamos a tener tiempo.
4. **`.p8` Apple key expirada** — pendiente desde 11 may.
5. **Re-enable legacy keys NO** — quedan disabled permanentemente. Si necesitas activity, todos los new tools usan new format ya.

## Comandos

```bash
# Deploy web (auto via Vercel on push)
git push origin master

# IndexNow submit URLs
curl -X POST "https://api.indexnow.org/indexnow" -H "Content-Type: application/json" -d '{"host":"www.correrjuntos.com","key":"c4f7e2a9b3d1","keyLocation":"https://www.correrjuntos.com/c4f7e2a9b3d1.txt","urlList":["URL1","URL2"]}'

# Submodule workflow
cd correr-juntos-app && git add . && git commit && git push origin master
cd .. && sleep 2 && git add correr-juntos-app && git commit && git push origin master

# App builds
cd correr-juntos-app
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios --latest
# Android: subir AAB manual a Google Play Console

# Blog article from config
node tools/blog-generator/generate-affiliate-article.cjs configs/ARTICLE.json --lang es
```

## IDs

| Plataforma | ID |
|-----------|-----|
| iOS App Store | 6758505910 |
| Google Play Developer | 6979904302857989185 |
| Supabase | waihiwdbtcbdazmaxdor |
| GA4 | G-RQYYGNC12T |
| Meta Pixel | 1466415711868158 |
| IndexNow Key | c4f7e2a9b3d1 |
| RevenueCat Project | 7c0240d9 |
<!-- CI check 2026-05-12T05:50:34Z -->
