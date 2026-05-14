# PC Session Log — CorrerJuntos

> Archivo puente entre la sesión Claude del PC y la sesión Claude del móvil.
> Yo (Claude PC) escribo aquí lo que hago. El Claude móvil debería leer este
> archivo al empezar para saber el estado actual.
>
> Hermano de este archivo: `tmp/mobile-session-log.md` (lo escribe el móvil).
>
> **CONVENCIÓN COMÚN (PC + móvil):** Entradas más recientes ARRIBA (prepend),
> justo después de este header. NUNCA al final del archivo.

---

## 2026-05-09 (cierre de día — actualización) — Adaptive Plans + Reels Pipeline

**Resumen breve (full detail abajo en la entrada anterior del 9 may):**

### 🎯 Planes adaptativos (Runna-style) — implementado y validado
- SQL migration `56_adaptive_plans.sql` aplicada en Supabase (aditivo, no toca lo viejo)
- Tabla `plan_distance_bounds` + RPCs `validate_plan_feasibility()` + `generate_user_plan_adaptive()`
- 12/12 escenarios validados + 2 generaciones reales (10K extend +4 base, 5K compress −3 base)
- Bug encontrado y fixeado: `JSONB ->>(text)` no funciona en arrays, hay que usar `->>(int)`
- `api.ts` con `validatePlanFeasibility()` + `generateUserPlanAdaptive()` + `AdaptiveDistance` type
- `PlanWizardScreen.tsx` integrado: cuando hay race date → adaptive RPC, sin race → legacy RPC
- Commits: app `a8d02bd`, repo padre `7b010402`
- Pendiente: `npm run ship:ota` cuando iOS v1.3.6 apruebe (Android v1.3.6 ya está LIVE)

### 📊 Monitor iOS aprobación
- Cron task `monitor-ios-v136-review` activado
- Cada 2h checa ASC API, solo notifica si cambia estado (silent run otherwise)
- Eventos: IN_REVIEW / READY_FOR_SALE / REJECTED → notificación con instrucción

### 🎬 PIPELINE REELS KINETIC TYPOGRAPHY (NUEVO — guardado para futuro)

**Documentación completa: `tools/marketing/REELS_PIPELINE.md`**

Resumen:
- HTML 1080×1920 con `renderAtTime(ms)` time-driven (no @keyframes)
- Recorder Playwright que dispara screenshot por frame → ffmpeg-static H.264
- Preview frames script para validar diseño antes del render full (~5 min ahorra)
- 3 reels producidos hoy: `reel-busca-tu-carrera`, `reel-plan-adaptativo` (ES + EN)
- Tiempo de iteración: ~10 min por reel una vez familiarizado con el pipeline

Reglas inamovibles del estilo:
- Paleta: ink #0b1220, paper #f6f1e8, ember #f97316, ash 42%
- Tipografía: Inter 200/600/700/800 + JetBrains Mono para eyebrows
- Una sola palabra naranja por escena (no más)
- Sin emojis, sin grabaciones de pantalla
- Subir SIN audio para que TikTok/Reels priorice música nativa (algoritmo orgánico)

Comandos típicos:
```bash
# Preview frames de cada escena
node tools/marketing/preview-reel-{slug}.cjs

# Render MP4 final
node tools/marketing/record-tiktok.cjs reel-{slug}
```

Listos para reusar:
- `tools/marketing/reel-plan-adaptativo.mp4` (ES, 2.34 MB) — publicar cuando v1.3.7 esté live
- `tools/marketing/reel-adaptive-plan-en.mp4` (EN, 2.31 MB) — mercado UK/US
- `tools/marketing/reel-busca-tu-carrera.mp4` (ES, 3.0 MB) — intro genérico app

---

## 2026-05-09 (cierre de día) — App v1.3.6 + Pipeline release 100% automatizado + Blog SEO masivo

**Día enorme. ~30+ commits. Resumen ejecutivo:**

### 🚀 App v1.3.6 — pipeline release 100% automatizado (HITO)

- ✅ EAS build v1.3.6 iOS + Android (build 84) — finished
- ✅ iOS subida a ASC vía EAS Submit
- ✅ **iOS Submit for Review automatizado** vía ASC API + .p8 key
  - Script: `correr-juntos-app/scripts/promote-ios.js`
  - Credenciales: Key ID `VR6CJGD288`, Issuer `82269ea5-bead-4381-b767-3687965efa4b`, file `AuthKey_VR6CJGD288.p8` (gitignored)
  - JWT ES256 → bearer token ASC API → reviewSubmissions endpoint
  - **Status**: WAITING_FOR_REVIEW (Apple)
- ✅ Android subida Internal vía EAS Submit
- ✅ **Android Internal → Production automatizado** vía Google Play Developer API
  - Script: `correr-juntos-app/scripts/promote-android.js`
  - Service account: `correrjuntos-8187a2854893.json`
  - **Status**: LIVE en Production track (88+ users con "Actualizar")
- ✅ Scripts npm release pipeline:
  - `npm run ship:ota -- "msg"` → OTA hotfix JS (segundos)
  - `npm run ship:full` → bump version + build + submit ambas
  - `npm run ship:promote` → Android Production + iOS Submit for Review
  - `npm run ship:status` → versión + último OTA + builds
- ✅ `OTAUpdateGate` añadido en App.tsx → auto-update silencioso al cold-start

### ⚠️ LECCIONES CRÍTICAS iOS Submit (memorizadas en CLAUDE.md raíz)

1. **`appStoreVersionSubmissions` deprecated** desde 2022 — devuelve `403 FORBIDDEN_ERROR`. Usar `/v1/reviewSubmissions` + `/v1/reviewSubmissionItems` + PATCH `submitted=true`.
2. **No crear locales nuevos vía API sin poblar todos sus campos** — si app ASC solo tiene `es-ES`, intentar crear `en-US` con solo `whatsNew` bloquea submit con `STATE_ERROR.ENTITY_STATE_INVALID`.
3. **Apple no auto-inherit screenshots** vía API. POST `/v1/appStoreVersions` SI auto-copia localizations existentes pero NO crea nuevas.
4. **`usesIdfa` y `usesNonExemptEncryption`** ya vienen del Info.plist si app.json los declara. PATCH-ear el build devuelve 409 (ignorable).
5. **`eas submit --track production` Android FALLA** "already submitted" — Google rechaza re-upload mismo versionCode. Solución: API "promote release".

### 🐛 Backend / SQL fixes

- Premium fake del founder removido de BD
- RPC `get_ranking_mensual/global` ahora chequea `premium_until > NOW()` (no solo `es_premium` flag)
- Test user "Prueba" (correrjuntosapp+test2@gmail.com) borrado completo de BD

### 📝 Blog SEO + monetización (DÍA ÉPICO)

**Artículos nuevos hoy (4 con EN):**
- ✅ **Pillar page** `/blog/guia-equipamiento-running-2026` (493 líneas, links a 79 articles)
- ✅ **Kit principiante** `/blog/equipamiento-running-principiante-200-euros` (200€ exactos)
- ✅ **101 km Ronda** `/blog/101-km-ronda-2026-guia-completa` + EN `/blog/en/ronda-101-km-2026-complete-guide`
  - URL oficial evento: **lalegion101.com** (NO 101kmlegion.com)
  - Organizador: Tercio Alejandro Farnesio (4º La Legión) y Club Deportivo La Legión 101
  - 8 affiliates `/dp/ASIN`, schema SportsEvent + BlogPosting + FAQPage + ItemList
- ✅ **Refresh** `/blog/mejores-relojes-gps-running` con date+callout mayo 2026 + 3 imgs Amazon caducadas fixed

**Sitemaps actualizados (commit `e54e17f9`):**
- ✅ `sitemap-blog-es.xml` → 3 entradas nuevas
- ✅ `sitemap-blog-en.xml` → 1 entrada Ronda EN con hreflang reciprocidad
- IndexNow ping (HTTP 200) post-deploy

**Categorización en `/blog/index.html`:**
- 101 km Ronda → `Ultra Trail` (data-category: entrenamiento), autor Abraham
- Guía Equipamiento (pillar) → `Equipamiento`, autor Carlos Ruiz
- Kit 200€ → `Equipamiento`, autor Carlos Ruiz

### 🎨 Diseño profesional (Wirecutter level)

- Logos SVG inline (en lugar de emojis) para clusters + popups newsletter
- Fotos producto reales Amazon `m.media-amazon.com/images/I/...` en cluster icons del pillar (8 SVGs reemplazados por: Hoka Clifton 10, COROS PACE 3, Shokz, Salomon, Maurten, etc.)
- 100% **enlaces Amazon directos `/dp/ASIN`** con tag `diezmejores21-21`:
  - 20/20 con afiliado, 0 search URLs, 0 rotos
  - Sustituciones del día: Hoka Clifton 10 (B0D5FRX2W9), Shokz OpenMove (B09BW29FJS), adidas Workout Essentials (B0F54S2H4H), adidas Own The Run Shorts (B0CKTPLS56)

### 🖼️ Imágenes Amazon — sistema anti-rotación instalado

**Detectado**: 24/524 imágenes blog rotas (4.6%). **3 tipos de roturas Amazon descubiertos:**

1. **HTTP 404 explícito** — fácil
2. **Placeholder silencioso 200 OK con 43 bytes** — invisible si solo miras status code
3. **Sponsored ad genérico** — primer ASIN search a veces es producto chino sponsored (ej: Hoka Speedgoat 6 devolvió `41AZPVp6xVL` zapatilla amarilla china — fix `613xDSI2gqL` real Hoka)

**Fix script + cron mensual instalado:**
- `tools/audit-amazon-images.cjs` (auditoría)
- `tools/fix-broken-images.cjs` (reemplazo automático con asin-hires-map + Pexels fallbacks por categoría)
- `tools/fetch-hires-urls.cjs` (scrape Amazon page con UA Safari, busca `"hiRes":"..."`)
- `tools/map-broken-to-asin.cjs` (mapea URL rota → ASIN del contexto HTML)
- npm scripts: `audit:amazon`, `audit:amazon:json`, `audit:amazon:quiet`
- GitHub Actions: `.github/workflows/audit-amazon-images.yml` (primer lunes mes 09:00 UTC, crea Issue automático)
- 24 imágenes reparadas en 8 articles (6 con ASIN real + 18 Pexels fallback temático)

### 🏞️ Imágenes Ronda — self-hosted (Wikimedia hotlinking falló)

**Problema**: hotlink Wikimedia Commons fallaba intermitente en browser pese a 200 OK desde curl.

**Solución**: descargadas 3 imágenes CC BY-SA 3.0 a `/public/blog-images/ronda/`:
- `puente-nuevo-ronda.jpg` (238 KB)
- `ronda-desde-sierra-blanquilla.jpg` (192 KB)
- `sierra-las-nieves-pinares.jpg` (435 KB)

Eliminada dependencia de CDN externo → Vercel CDN siempre disponible.

### 👤 Author unification + fotos

- **246 artículos**: "Jose Marquez" → "Abraham Márquez Rodríguez"
  - Script: `tools/replace-jose-to-abraham.cjs`
  - Vercel redirect 301: `/blog/autor/jose-marquez` → `/blog/autor/abraham-marquez`
  - Foto: `/public/abraham.jpg` + Instagram + LinkedIn
- **Carlos Ruiz photo** añadida (POV pista atletismo `/blog/autor/photos/carlos-ruiz.jpg`) — el founder eligió esta foto temática como avatar (decisión consciente)
- **author.js v2**: 4 autores (Carlos, Abraham, María, Jose alias) + lookup acentos + light mode CSS + foto real con fallback onerror

### 🎯 Deep link contextual cro.js (CTR esperado +35-50%)

- Mid/end CTAs ahora matchean slug del artículo con plan específico:
  - 5K/principiante → `/planes/0-5k`
  - 10K → `/planes/10k`
  - 21K → `/planes/media-maraton`
  - 42K → `/planes/maraton`
  - Trail/montaña → `/planes/trail`
  - Default → `/planes/`

### 🔧 Fix Coach José CTA

- **Bug**: botón "Prueba Coach José gratis →" en mid-article callout apuntaba a `/feed` (404)
- **Fix** (commit `c80c3dac`): `deepLink('/feed')` → `deepLink('/')` en `blog/cro.js` línea 372
- Aplica automáticamente a ~400 artículos (cro.js es shared)
- Universal Links → abre app si instalada, si no muestra home con CTAs descarga

### 📊 Estado producción (al cerrar 9 mayo)

- iOS v1.3.6: WAITING_FOR_REVIEW (Apple Review 24-48h)
- Android v1.3.6: LIVE en Google Play Production
- Web: 4 nuevos articles deployed + 2 sitemaps actualizados
- Pillar page + 79 articles enlazados, 100% Amazon /dp/ASIN, 0 imgs rotas
- Cron audit mensual instalado
- 0 Sentry unresolved
- Pipeline release: hotfix OTA = `ship:ota`, full = `ship:full + ship:promote` (ambas plataformas)

### 🟡 Pendientes reales al cerrar

1. iOS v1.3.6 esperando Apple Review (auto-aprobación al pasar)
2. Android v1.3.6 propagación CDN 1-2h para que users vean "Actualizar"
3. Apple Watch + Garmin + COROS implementación → disparador: primer email aprobación API
4. María López photo (cuando founder la mande)
5. 18 imágenes blog usando Pexels fallback temático (no roto, mejorable cuando relax anti-scrape Amazon)

### 📦 Commits clave del día

- `c80c3dac` — fix(cro): Coach Jose CTA /feed → / homepage
- `e54e17f9` — seo(sitemaps): add today's 4 articles to ES + EN sitemaps
- + ~25 commits adicionales (pillar, kit 200€, ronda ES+EN, refresh relojes, fix imágenes, author unification, etc.)

### ⚙️ CLAUDE.md raíz actualizado

Sección extensa "🚀 PROCESO DEPLOY APPS A TIENDAS" con tabla mental, lecciones críticas iOS Submit, release notes templates ES/EN, qué Claude PUEDE/NO PUEDE, IDs y credenciales clave, checklist pre-deploy, procedimiento típico release v1.3.X.

Sección "11. Imágenes Amazon — protocolo anti-rotación" con 3 tipos roturas + cron audit + fix manual.

Pendientes actualizado a "9 may 2026 fin de día".

---

## 2026-05-08 ~16:30 hora España — Estrategia redes sociales + 2 carruseles preparados

**Lo que pidió el founder:** trabajar las redes sociales — subir contenido (carruseles ya hechos en `tools/marketing/`).

**Lo que hice:**
- Auditoría TikTok @correrjuntosapp: 768 seguidores, 327 likes, viral 22K plays con "No corras solo en tu ciudad" (resto carruseles 200-800 plays).
- **Bio TikTok actualizada** (web): añadido " · App gratis" → 77/80 caracteres, sigue regla "no correr solo" + URL.
- **Carrusel #1 — comunidad** preparado:
    - Re-renderizado SIN emojis (banderas eliminadas) por regla global del founder
    - Slide 3 actualizado con DATOS REALES de Supabase: 693 runners, top 8 ciudades por usuarios (Madrid 63, Sevilla 31, Barcelona 29, Valencia 21, Málaga 11, Lima 10, Bilbao 9, Bogotá 9)
    - 5 PNGs listos: `tools/marketing/carrusel-comunidad/png/tt/`
- **Carrusel #2 — pick-race-plan** creado nuevo:
    - 5 slides: hook (68 carreras) → problema → flow 3 pasos → 7 planes → CTA
    - Aprovecha la feature multi-distance picker que implementamos hoy
    - PNGs listos: `tools/marketing/carrusel-pick-race-plan/png/tt/`
- **Caption optimizado** con datos reales (693 runners + ciudades) y 5 hashtags precisos.
- **Primer comentario** preparado: "Soy Abraham, fundador. ¿Cuál es tu ciudad? La añado al mapa."

**Reglas nuevas memorizadas (persistentes):**
- `feedback_tiktok_hashtags.md` — SIEMPRE 5 hashtags estructurados (1 brand + 1 broad + 1 niche + 1 emocional + 1 geográfico). Nunca más, nunca menos.
- Sets go-to por tema (comunidad, planes, distancias, trail, LATAM) documentados.

**Estado:** ✅ Carrusel #1 listo para subir desde móvil del founder. Carrusel #2 en standby para 48-72h después.

**Bloqueo conocido:** TikTok Studio web NO admite carruseles de imágenes (solo vídeo). El founder debe subir desde la app móvil. Las imágenes están en OneDrive ya sincronizadas.

**Para la sesión móvil / próximas sesiones:**
- Si el founder pregunta por subir, los PNGs están en `tools/marketing/carrusel-{comunidad,pick-race-plan}/png/tt/`.
- Caption + 5 hashtags + primer comentario están en este log y en `feedback_tiktok_hashtags.md`.
- Reorder de pins en TikTok pendiente — solo se puede desde app móvil (no web).
- Música recomendada: BOOM - Tiësto (consistencia con viral 22K).
- Horario óptimo subida: 18:00-21:00 hora España.

---

## 2026-05-08 ~14:25 hora España — Race card v3 + freemium repositioning + premium gate fix (3 cambios consolidados)

**Lo que pidió el founder:** dogfood en su móvil descubrió 3 cosas seguidas:
1. RacePlanCard saturado de naranja → quería rediseño estilo Strava/Nike Run Club.
2. "Bug" creado por confusión: como premium founder veía planes empezar sin pagar — al investigar encontramos bug REAL semántico en `fecha_premium`.
3. Estratégico: Strava + BLE estaban en paywall, decidimos quitarlos como acquisition tools.

**Lo que hice:**
- **RacePlanCard.tsx**: hero cinematográfico + tipografía Nike-level (26px peso 900) + banner 200px + pin SVG (no emoji) + trial bar verde + CTA personalizado por ciudad + countdown rediseñado.
- **iap.ts**: `checkSupabasePremium` ahora lee `premium_until` (correcto), `syncPremiumToSupabase` guarda expiry en `premium_until` (era bug semántico — antes guardaba expiry en `fecha_premium` causando colisión con grants manuales SQL).
- **PremiumContext.tsx**: re-checkea con lógica completa al cambiar profile.
- **StravaSection.tsx**: removido `if (!isPremium)` lock — Strava ahora gratis.
- **SensorPairingScreen.tsx**: `if (!isPremium)` cambiado a `if (false)` — BLE ahora gratis.
- **PaywallScreen.tsx**: tabla comparativa actualizada — quitados "Sensores BLE", añadidos "Planes 7 vs 2" + "Coach IA".
- **SettingsScreen.tsx**: premium card Strava → Planes de entrenamiento.
- **Migración BD**: 2 users premium reales con fecha_premium futura migrados a premium_until (Javier `fjavier.araujo@gmail.com` hasta 2027-05-08, redman hasta 2026-05-12). Founder profile: `premium_until = 2099-12-31` (lifetime).

**Estado:** ✅ Todo deployed a master.

**Para la sesión móvil:**
- Validado dogfood en móvil del founder (Fast Refresh aplicó cambios al guardar).
- Los 3 cambios son TS/React Native puro → OTA update bastaría para distribuir a v1.3.0 publicada.
- Submódulo: 152593f. Padre: 6144440f.
- Pendiente: OTA `eas update --branch production --message "race card v3 + freemium + premium gate fix"` cuando founder lo confirme.
- Posicionamiento premium nuevo: planes (7 vs 2) + Coach IA + matches ilimitados. Strava + BLE básico FREE.

---

## 2026-05-08 ~13:42 hora España — Setup PC↔móvil CERRADO

**Estado final del puente bidireccional:**
- ✅ `tmp/pc-session-log.md` — convención prepend, header con regla explícita
- ✅ `tmp/mobile-session-log.md` — convención prepend, header alineado
- ✅ `feedback_mobile_session_log.md` (memoria móvil) — regla prepend para ambos archivos
- ✅ `MEMORY.md` — pointer actualizado por el móvil

**Móvil confirmó autonomía:** detectó inconsistencia, pidió aclaración, ejecutó cambios y actualizó su propia memoria persistente. Buen comportamiento — confiable para tareas no triviales mientras founder está fuera del PC.

---

## 2026-05-08 ~13:38 hora España — Convención unificada prepend (acuerdo PC↔móvil)

**Lo que pidió el founder:** alinear convención de ambos logs.

**Lo que hice:**
- Móvil pilló inconsistencia: PC usaba prepend, móvil append.
- Acordada convención común: **prepend en ambos** (más reciente arriba).
- Header de este archivo actualizado con la nota de convención.
- Móvil va a reordenar `tmp/mobile-session-log.md` para alinearse.

**Estado:** ✅ Convenio establecido. Ambos archivos seguirán prepend a partir de ahora.

**Para la sesión móvil:** después de reordenar, no hace falta migración futura
— ambos coordinados.

---

## 2026-05-08 ~13:30 hora España — Setup Remote Control móvil

**Lo que pidió el founder:** configurar remote-control para poder usar Claude
desde el móvil cuando esté fuera del PC.

**Lo que hice:**
- Creado `Claude-Remote-CorrerJuntos.bat` en escritorio (con `pushd` por OneDrive).
- Sesión remote-control activa en URL `session_0127W6qpyu1trfRpA2FX61Y5`.
- Configurado patrón de logging compartido vía `tmp/mobile-session-log.md` y
  `tmp/pc-session-log.md` (este).

**Estado:** ✅ Funcionando. Móvil conectado.

**Para la sesión móvil:**
- Tienes contexto completo en `MEMORY.md` (sección "SESIÓN 7 MAYO 2026").
- Lee este archivo (`tmp/pc-session-log.md`) al empezar para ver últimas acciones del PC.
- Escribe tus resúmenes en `tmp/mobile-session-log.md` (modo append).
- Si tocas archivos del proyecto o haces commits, dilo aquí.

---

## 2026-05-07 — Resumen del día (referencia rápida)

**6 commits totales hoy:**
- `b3de36d9` — fix(seo): schema fixes 9 archivos (price/image/availability)
- `eef2448b` — feat(seo): calendario carreras enriquecido (24 SportsEvent)
- `def3a51a` — fix(blog): firma Abraham Márquez (founder real)
- `4b620bc9` — feat(seo): EN version of races calendar 2026
- `d08950d4` — docs(claude): sync project status

**Estado al cerrar el día:**
- Bug Strava: ✅ cerrado, validado en móvil, comunicado a Javier
- Push fix Plan B: ✅ OTA `2b1d93ab` al 100% rollout
- Sentry: ✅ 0 unresolved
- SEO Schema: ✅ 3 validaciones GSC iniciadas, 6 URLs reindex
- Blog EN nuevo: ✅ `running-races-spain-2026` deployed + IndexNow
- Plan anual 29,99€: ✅ confirmado ACTIVO en v1.3.0

**Pendientes esperando respuesta de terceros:**
1. COROS API team (ticket #534211, 1-2 días lab)
2. Garmin connect-support
3. Javier (Strava reconexión)
4. GSC validaciones aprobadas

**Pendientes que requieren acción del founder:**
1. Crear quedada 14K domingo en app (dogfood)
2. Mostrar seed quedadas en app (requiere nueva build)

---

(Las entradas más recientes van ARRIBA. Cada nueva sesión añade encima.)
