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

- **App publicada en stores**: v1.3.5 (iOS build 83, Android versionCode 83)
- **App en build (9 may 26)**: **v1.3.6 (iOS build 84, Android versionCode 84)** — runtime 1.3.6
- **iOS**: Publicada en App Store, build 84 en cola EAS para submit
- **Android**: Publicada en Google Play (88+ descargas), build 84 en cola EAS para submit
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

## Pending (status May 9, 2026 — fin de día)

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
