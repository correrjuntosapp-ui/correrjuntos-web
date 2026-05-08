# CLAUDE.md — CorrerJuntos Web + Proyecto Global v1.3.0

## Reglas Inamovibles

- **NUNCA** modificar archivos existentes que funcionen sin permiso explícito
- **NUNCA** cambiar el diseño actual sin que el usuario lo pida
- **SIEMPRE** añadir, nunca reemplazar funcionalidad existente
- **SIEMPRE** verificar cambios antes de hacer commit
- **NUNCA** hacer commit sin confirmación del usuario
- **NUNCA** hacer push a main/master sin autorización
- OneDrive causa conflictos con git index.lock — usar `sleep 2` antes de git si falla

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

## Versión Actual

- **App**: v1.3.0 (iOS build 66, Android build 41)
- **iOS**: Publicada en App Store
- **Android**: Publicada en Google Play (88 descargas)
- **Web**: Desplegada en Vercel (correrjuntos.com)

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

## Pending (status May 7, 2026)

1. ✅ Activate training plans — DONE April
2. ✅ Activate annual plan 29,99€ — DONE in v1.3.0 (paywall visible, anual = default)
3. Show seed quedadas in app — pending build (es_seed filter removed locally)
4. Blog calendar days 7-30 — superseded by ~349 articles published Mar-May
5. Implement Garmin/COROS/Apple Watch sync — pending API approval (COROS ticket #534211, Garmin direct email)
6. Dogfood quedada 14K Sunday — requires user action in app

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
