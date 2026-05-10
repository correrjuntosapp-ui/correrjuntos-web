# CLAUDE.md — CorrerJuntos Web + Proyecto Global v1.3.6 (en build)

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

| Métrica | Valor |
|---|---|
| **Comisiones (10 abr - 9 may)** | **19,55€** |
| Bonus | 0€ |
| Total mes | 19,55€ |
| Pago real | Llega ~2 meses después (típicamente julio para mayo) — Amazon espera anti-fraude |

### TOTAL canal monetario (10 may 2026)

| Fuente | EUR/mes aprox |
|---|---|
| RevenueCat (subs + one-time + annual) | ~32€ ($35) |
| Amazon afiliados | 19,55€ |
| **Total** | **~52€/mes** |

### Lectura estratégica

- **Amazon afiliados (19,55€) genera 6× lo que RevenueCat MRR ($3 ≈ 2,75€)** hoy. Es contraintuitivo pero importante: el blog SEO está pagando más que las subscripciones premium ahora mismo.
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

- **App publicada en stores**: v1.3.5 (iOS build 83, Android versionCode 83) — **iOS** sigue así
- **v1.3.6 (build 84)** — runtime 1.3.6
- **iOS v1.3.6**: WAITING_FOR_REVIEW desde 9 may 07:46 UTC (33h en cola al cerrar 10 may)
- **Android v1.3.6**: ✅ LIVE Producción 100% rollout
- **Última OTA servida runtime 1.3.6** (10 may): `c8de278b-e017-44ee-9151-ad8ec6984dc5` — workout detail real pace per block. **Acumula los 16 fixes/features de 10 may** (ver sección "Done hoy 10 mayo 2026").
- **Web**: Desplegada en Vercel (correrjuntos.com)

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

**📨 Trial Lifecycle Emails — Pipeline completo construido (esperando CRON_SECRET):**
- `/api/cron/lifecycle-trial.js` daily 09:00 UTC (vercel.json crons configured)
- `/api/_lib/trial-email-templates.js` con 10 templates (ES+EN × Day 1/3/7/11/14)
- `iap.ts` graba `trial_starts` row cuando RC reporta `periodType === 'TRIAL'`
- **ACCIÓN PENDIENTE founder**: añadir `CRON_SECRET` env var en Vercel + redeploy. Resto activo.
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
- iOS v1.3.6: WAITING_FOR_REVIEW (33h en cola, normal 24-48h)
- Android v1.3.6: LIVE Production al 100%
- Sentry: 2 issues resueltos hoy (Pressable, KudosIcon — ambos del primer push de comments)
- Web: 521 articles ES+EN, hreflang reciprocidad, blog Ronda card fixed
- TestFlight founder: dogfooding extensivo todo el día

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
