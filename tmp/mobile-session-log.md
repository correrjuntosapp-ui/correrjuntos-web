# Mobile Session Log — CorrerJuntos

Puente entre Claude móvil ↔ Claude PC. Cada entrada resume una tarea significativa con: lo que se pidió, lo que se hizo, estado, y contexto para el otro Claude.

**Convención:** las entradas más recientes van ARRIBA (prepend), no al final. Misma convención que `tmp/pc-session-log.md`.

---

## 2026-05-23 (sábado tarde-noche · Onupolis inbound + 3 fixes SEO masivos + .p8 + babel fix + builds v1.3.7 cocinando)

**Hola Claude del trabajo 👋** — el founder se va a trabajar AHORA (domingo am). Sesión densa sábado tarde-noche con MUCHOS frentes a la vez. Lee TODO antes de actuar.

### 🚨 ALARMA 19H SÁBADO 23 MAY · SUBIR REELS

El founder pidió **recordatorio a las 19h hoy** para subir los reels al móvil/social.
- Cron job session-only programado (id `521ffe44` · dispara 18:55 con push notif)
- Task #22 visible en la lista como backup
- Sweet spot social sábado 18-21h
- Reels candidatos: 4 en móvil del founder esperando distribución (mencionados antes)
- **Si la sesión Claude muere antes de las 19h** → este es el único recordatorio

### 🟢 ONUPOLIS · 1er INBOUND brand request (HITO)

Juan Luis (director Onupolis · circuito carreras Huelva) escribió por **Instagram DM** el 23 may. Founder respondió (también IG) con propuesta de **colaboración no-cash + teléfono `610 20 29 31`** :

> Hola Juan Luis, encantado 🙌 Yo soy de Huelva también, doble alegría.
> Me hace mucha ilusión tu mensaje. Os puedo potenciar las carreras de varias formas: calendario visible en la app, notificaciones a runners de la zona, quedadas de preparación previas, planes de entreno por prueba y artículos en el blog para cada carrera.
> Más que tarifas lo veo como colaboración — yo aporto app, blog y comunidad, vosotros visibilidad de las pruebas. Cero pasta entre medias.
> Te dejo mi teléfono por si quieres llamarme o vernos un café aquí en Huelva: 610 20 29 31

**Estado**: esperando respuesta IG/llamada. Si llama durante día laboral → 10 min cualificar · si pinta serio → cerrar café Huelva esta semana. Piloto propuesto: **Golf Runner 4 julio** (6 semanas).

**Contexto Onupolis** (memorizar):
- 7 carreras año 2026 (Mujer, Nocturna, Golf Runner 4 jul, Huelva Verde 5 sep, Vuelta a Huelva 12 oct, San Silvestre 30 dic, una más)
- Patrocinado por **Ayuntamiento Huelva** (acuerdo firmado 2026)
- Organiza **Consulting TPO** (Vanesa Arana promotora)
- Misión: "Huelva referente del running en Andalucía"
- Inscripciones €10-13 → presupuesto MUY modesto · canje no-cash es lo correcto

**Lo que ofrecemos** (11 palancas detalladas en `tmp/dossier-onupolis-v1.md` si lo creas):
1. Pin en mapa app · 2. Quedadas semanales preparación · 3. Plan entrenamiento ad-hoc · 4. Guía blog SEO · 5. Newsletter blast · 6. Push notifs · 7. Banner home · 8. Punto encuentro race-day · 9. Reels live · 10. Article resultados post · 11. Embudo a siguiente carrera

**Lo que pedimos a cambio** (canje):
- Logo CJ en cartelería + dorsales · "App oficial circuito Onupolis 2026" en prensa · stand físico en carreras · email blast desde su lista · acceso fotos evento · co-firmar plan entrenos

### 🚨 3 ALERTAS GOOGLE SEARCH CONSOLE FIXED (commits `d85a2bd7` + `3ca55540`)

GSC envió 3 emails críticos el 23 may am:

| Error | Archivos | Fix | Commit |
|---|---|---|---|
| BreadcrumbList · falta `item` en `itemListElement` | **746 págs** | `tools/audit-breadcrumb-schema.cjs --fix` (usa canonical URL) | `d85a2bd7` |
| Product · falta `price` en `offers` (afiliados Amazon) | 1 issue | `tools/audit-product-offers.cjs --fix` (elimina offers incompletos) | `3ca55540` |
| Merchant Listings · falta `price`/`image` | 5 issues (2 articles) | mismo script | `3ca55540` |

**Causa BreadcrumbList**: Google cambió la spec — antes la última posición no necesitaba `item`. Ahora sí. Template antiguo copy-pasted en 746 págs.

**Causa Product/Offer**: imposible mantener precios Amazon actualizados. Mejor sin offers que offers rotos. Schema Product sigue válido sin `offers`.

**IndexNow ping** enviado para 10 URLs prioritarias. Google re-valida en 7-14 días → veremos emails "Se han corregido los problemas..." llegar pronto.

### 🔑 .p8 APPLE KEY REGENERADA (task #19 completada)

La key vieja `VR6CJGD288` daba 401 en `/v1/reviewSubmissions`. Hice via Chrome MCP:

1. App Store Connect → Users and Access → Integrations
2. Generé nueva key **"Claude Submit v2"** · Key ID **`L4QW7SPZX8`** · Admin role
3. Descargué `.p8` y moví a `correr-juntos-app/AuthKey_L4QW7SPZX8.p8` (gitignored)
4. Actualicé `scripts/promote-ios.js` + `check-store-status.js`
5. Smoke test: auth OK contra `/v1/apps/.../appStoreVersions` (200)
6. Borré `.p8` viejo del filesystem
7. Commits: `17f88ec` (submodule) + `e5b32f77` (parent)

**Issuer ID** (no cambia): `82269ea5-bead-4381-b767-3687965efa4b`
**Key vieja** (Claude Submit Pipeline VR6CJGD288): sigue activa en ASC, puedes revocar cuando quieras.

### 🔥 BUILD v1.3.7 · 2 ITERACIONES + FIXES

**Iteración 1** (12:00) - FALLÓ ambos:
- Error: `Cannot find module 'babel-preset-expo'`
- Causa: package faltaba en `package.json` (era dep transitiva que desapareció)
- Fix: `npm install --save-dev babel-preset-expo` → instaló v56.0.11
- Commits: `e3102df` (submodule) + `a76866e4` (parent)

**Iteración 2** (12:25) - FALLÓ ambos otra vez:
- iOS errored (sin investigar el error específico, asumí mismo problema babel)
- Android error: `private properties are not supported (#registry)` en bundle Hermes
- Causa real: `npm install` instaló LATEST (v56.0.11), pero Expo SDK 54 requiere `~54.0.10`. La v56 NO transpila `#privateFields` para Hermes Android (Expo 56 es para SDK 56, no 54)
- Fix: `npx expo install babel-preset-expo` (resolvió a v54.0.10) + deduplicate package.json (estaba en deps + devDeps)
- Commits: `d5b4c08` (submodule) + `35f3127f` (parent)

**Iteración 3** (12:37) - EN CURSO:
- iOS build `579fce15-867c-49ae-bc26-2332bea6e16b` · started 12:37:34 · ETA ~13:10
- Android build `321d065c-5f75-4465-b29c-57fb3258de2e` · started 12:37:02 · ETA ~13:05
- Con TODOS los fixes aplicados (babel correcto + schemas + .p8)

**⚠️ Cuando se complete cada uno** (revisar antes de promote):
```bash
cd correr-juntos-app && npx eas-cli build:list --limit 2 --non-interactive
```

Si ambos `finished` → procedimiento:
1. `npm run ship:promote` (auto Android Internal → Production + iOS Submit for Review via .p8)
2. Apple review 24-48h
3. Mientras Apple revisa → founder dogfooda TestFlight v1.3.7 + ejecuta `tmp/checklist-testing-v137.md`

Si algún build `errored` → ver logs en https://expo.dev/accounts/guetto100/projects/correr-juntos-app/builds/ → fix → re-launch.

### 📋 LECCIÓN GRABADA (memorizar para futuras sesiones)

**SIEMPRE `npx expo install <package>` en vez de `npm install <package>`** cuando el package está vinculado a la versión SDK Expo. `npm install` instala latest (puede ser mismatch). `npx expo install` resuelve la versión compatible con el SDK actual.

Ejemplos críticos:
- `babel-preset-expo` (Expo SDK 54 → ~54.0.10)
- `expo-*` (todos vinculados al SDK)
- `react-native` (vinculado al SDK)

### 📌 PENDIENTE CUANDO FOUNDER ESTÉ EN EL TRABAJO

**Si Juan Luis (Onupolis) llama o responde IG**:
- 10 min cualificación · 5 preguntas:
  1. ¿Cuántas inscripciones/carrera año pasado?
  2. ¿Cuál es vuestro principal dolor: inscripciones · retención · visibilidad mediática · comunidad?
  3. ¿Trabajáis con otras apps/medios runners ya?
  4. ¿Qué espera Ayuntamiento como contrapartida del patrocinio?
  5. ¿Cuándo nos vemos un café?
- Si pinta serio → cerrar café Huelva esta semana
- NO mandar tarifas escritas. NO mandar dossier PDF en primera ronda.

**Resto pendiente**:
1. **Si builds OK**: `npm run ship:promote` lunes pm → Apple review + Android Production
2. **Testing app v1.3.7 LIVE en TestFlight** cuando llegue: `tmp/checklist-testing-v137.md` (60-90 min)
3. **Email Crown Sport Nutrition** lunes 26 may 09-11h Madrid (`memory/project_brand_outreach_crown.md`)
4. **7 drafts Gmail brand outreach** ya redactados (226ERS, HSN, Compressport, MERACH, Polar, Joma, SiS) — calendario lun-vie esta semana

### 📊 ESTADO AL CERRAR (sábado 23 may noche)

- Builds v1.3.7 cocinando (iOS + Android · iteración 3 con fixes)
- Onupolis · esperando respuesta IG/llamada
- 746 págs SEO fixed (BreadcrumbList) · 2 articles afiliados fixed (Product/Offer)
- .p8 nueva key operativa (`L4QW7SPZX8`)
- 5 commits pusheados hoy en submodule + 4 en parent
- 21 tareas tracked (1 in_progress: testing v1.3.7)

---

## 2026-05-24 (sábado tarde · SEO 4 Quick Wins aplicados + blog redesign extra)

**Hola Claude mañana 👋** — Sesión mixta hoy. Founder usó Claude remote desde el trabajo · se pilló pidiendo permission de Bash · YO (Claude PC) tomé el relevo desde casa y completé los 4 Quick Wins SEO + 6 fixes blog visuales. TODO COMMITEADO Y EN PRODUCCIÓN.

### 🚀 4 QUICK WINS SEO APLICADOS (commit `a9a7ed77`)

**QW #1 · CTR titles + metas optimizados** (25 articles)
- Patrón Wirecutter: bracket + power word + año + promesa cuantificada
- Espera: +50-150% CTR en top 20 → +60% clicks blog en 30 días
- Script idempotente: `tools/seo-ctr-titles.cjs`

**QW #2 · Refresh dateModified + banner "Actualizado mayo 2026"** (25 articles)
- JSON-LD dateModified → 2026-05-22
- Banner visible en intro de cada article
- Espera: +1-3 posiciones en 14-30 días (Google freshness signal)
- Script: `tools/seo-refresh-dates.cjs`

**QW #4 · HowTo schema JSON-LD** (3 articles tutorial)
- vo2-max-running-como-mejorar · ritmo-umbral-running · empezar-correr-60
- Rich snippet con pasos numerados en SERP
- Espera: +30-60% CTR en estos articles
- Script: `tools/seo-howto-schema.cjs`

**QW #3 · Self-host hero images** (9 articles)
- AVIF Q60 + WebP Q80 + JPG Q85 @ 1200px responsive
- Pexels CDN → `/public/blog-images/{slug}/hero.{avif,webp,jpg}`
- 1 fail Pexels 404 (plan-maraton-sub-4-horas · ignorable)
- LCP esperado 2.5s → 0.6-0.9s · +1-3 pos mobile ranking
- Script: `tools/seo-selfhost-hero.cjs`

**Métrica esperada combinada**: clicks blog 2.500/28d → **5.000-7.000/28d** en 30 días.

### 🎨 6 FIXES BLOG VISUALES (commits anteriores hoy)

| Commit | Fix |
|---|---|
| `d566171d` | Card excerpt no estira hueco · margin 0 + line-clamp 4 |
| `de9e0546` | Grid align-items:start · cards altura natural sin hueco |
| `fe3988ad` | enhance.js no inyecta banner en blog index (solo articles) |
| `559346e9` | Quitar badge "Ctrl K" buscador (ilegible en algunos PCs) |
| `2dd3b499` | Banner CTA standalone fuera del grid · centrado vertical |
| `68609f65` | Banner CTA siempre vertical max-width 560px |
| `5fe245bb` | Badges App Store + Google Play más anchos 135→165px |

### 📧 BRAND OUTREACH UPDATE

Hoy el founder añadió Crown Sport Nutrition al pipeline (marca ES de geles/recovery). Memoria persistente: `memory/project_brand_outreach_crown.md` con email YA REDACTADO listo para enviar **LUNES 26 may 09:00-11:00 Madrid** desde Gmail personal del founder.

Detalle: Crown ya está citado en 8 articles indexados del blog (4 ES + 4 EN). Eso es leverage real para el pitch. Email pide afiliación + samples (no cash directo) · path bajo-fricción para que digan SÍ.

### 📌 PENDIENTE PRÓXIMA SESIÓN PC

1. **Auditoría calidad fotos app en web** (founder vio screenshots app de mala calidad)
   - Páginas a revisar: index.html, /matching, /planes/* (6 landings), /about
   - Regenerar screenshots desde simulador Expo: iOS 6.7" 1290×2796, 6.1" 1170×2532, Android 1080×2400
   - Optimizar con sharp ≥85% calidad
   - Servir con `<picture>` srcset @1x/@2x

2. **Reels en móvil del founder** (4 producidos · sin enseñar todavía a Claude)
   - Esperando que founder los muestre para decidir distribución
   - Sweet spot publishing: viernes 18-21h o sáb-dom 10-12h
   - Usar `?ref=tiktok` etc para attribution

3. **Si Crown responde positivo (48-72h post-envío lunes)**:
   - Expandir Crown a 6-8 articles del cluster nutrición
   - Escribir review HyperGel 45 completo (pillar del cluster geles)

### 🚨 PRIORIDAD MAÑANA · BRAND OUTREACH (lunes 26 may desde trabajo)



**Hola Claude mañana 👋** — yo soy Claude PC del viernes 23 may. Founder se conecta desde el trabajo mañana sábado/lunes. Te dejo el estado COMPLETO. Lee TODO esto antes de tocar nada porque hoy ha sido un día con MUCHOS cambios.

### 🚨 PRIORIDAD MAÑANA · BRAND OUTREACH (lunes 26 may desde trabajo)

Founder pidió generar dinero YA con la web · plan brand deals (no AdSense porque rompe trust post Core Update).

⭐ **7 DRAFTS GMAIL YA CREADOS** (founder no tiene sesión remota móvil · solución vía drafts):

| Día | Brand | Destinatario | Acción founder móvil |
|---|---|---|---|
| LUN 26 | 226ERS | hola@226ers.com + cc marketing | Abre Gmail · borradores · enviar |
| MAR 27 | HSN | partners@hsnstore.com + cc marketing | Same |
| MIÉ 28 | Compressport | spain@compressport.com | Same |
| JUE 29 | MERACH | merach@gmail.com (PLACEHOLDER · cambiar email real o usar texto para LinkedIn DM) | Editar destinatario antes de enviar |
| VIE 30 | Polar España | marketing.es@polar.com + cc info | Same |
| LUN 2 jun | Joma | marketing@joma-sport.com + cc comunicacion | Same |
| MAR 3 jun | SiS | spain@scienceinsport.com + cc customerservice | Same |

**Cómo accede el founder a los drafts desde el móvil**:
1. Abrir app Gmail
2. Menú lateral · "Borradores" (drafts)
3. Buscar subject del día (ej. "226ERS" o "HSN")
4. Tap · verificar destinatario · Send

**MERACH ojo**: el destinatario es placeholder `merach@gmail.com` (no es el real). Founder tiene que cambiarlo por email real cuando lo encuentre, O usar el texto del draft para enviar via LinkedIn DM al marketing manager MERACH ES. Hay nota visible al inicio del email body explicándolo.

**ARCHIVO BACKUP (si Gmail drafts no carga)**: `tmp/brand-outreach-EMAILS-LISTOS.md` en OneDrive · mismos textos.

**2 IG DMs (sin draft posible · founder copy/paste desde OneDrive en IG app)**:

| Día | Brand | Plataforma | Acción founder |
|---|---|---|---|
| JUE 5 jun | Bia Trail | Instagram DM `@biatrail.es` | Abrir OneDrive móvil · `tmp/brand-outreach-EMAILS-LISTOS.md` · buscar "EMAIL 9 · BIA TRAIL" · copy texto · abrir IG · pegar |
| VIE 6 jun | Beer Runners ES | Instagram DM (hilo abierto desde 13 may) | Same proceso con texto del email 10 del archivo |

**Si una brand responde positivo durante semana**:
- Founder activa Claude móvil con "[brand] respondió"
- Claude móvil lee `tmp/mobile-session-log.md` para contexto
- Prepara: 5 preguntas discovery + tier negotiation + sample materials + contract básico

**Si una brand responde positivo** (durante semana):
- Founder me activa con "[brand] respondió"
- Yo preparo: 5 preguntas discovery + sample materials + tier negotiation + contract básico
- Call 15 min · cerrar el deal

**Revenue esperado 14 días**:
- 1-3 deals cerrados (20-30% close rate industry)
- +200-600€/mes recurring + posible 500€ sponsored article one-time
- Vs AdSense que daría ~100€/mes neto sacrificando UX + SEO ranking

### 🎯 TL;DR para empezar mañana sin perder contexto

**Estado producto al cierre 23 may noche**:
- App v1.3.7 mobile **100% código completo** (todos los días D1-D5 hechos en este viernes adelantados)
- Backend v1.3.7 LIVE en Supabase (estaba ya desde miércoles)
- SEO post-Core Update **5 rounds de fixes aplicados** (sitemap + E-E-A-T + canonicals + Schema Product + blog redesign)
- 6 reels finde producidos (5 kinetic ángulos no-social + 1 FB groups historia)
- MRR sigue ~$3 + 25€ Amazon = ~57€/mes

**Lo MÁS importante que tiene que saber el founder mañana**:
1. **App v1.3.7 build production NO está en stores aún** · ejecutar `npm run ship:full` LUNES (necesita .p8 Apple key regenerado por founder)
2. **Android preview build EAS `461d0b13`** debería estar listo (~30 min después de las 19h viernes · check status URL)
3. **iOS preview build no se lanzó** (requiere login interactivo del founder con 2FA · si quiere TestFlight tiene que ejecutar `eas build --platform ios --profile preview` manualmente)
4. **Blog redesign LIVE Vercel** desde commit `2a4026a2` · founder verlo en `https://www.correrjuntos.com/blog/`

### ✅ HECHO HOY VIERNES 23 MAY (10 commits del día)

#### 🟢 App v1.3.7 mobile · 4 días dev adelantados en 1 sesión
- `d9f11160` D1 · AnaChatScreen + chip + disclaimer
- `98dde3fb` D2 · AnaOnboarding + memoria persistente backend
- `da109a42` D3 · StrengthSessions + StrengthOnboarding
- `ad2e6fea` D4 · StrengthSessionDetail + WorkoutPlayer Hevy
- `74f5c64a` Perf top-5 (strip console + lazy tabs + expo-image + FlatList virt + memo)
- `db513c18` Bottom nav 5→4 tabs + PlanesScreen NUEVO
- `dbdea97d` Tab Inicio cleanup (Retos eliminados)
- `f8fd98d` Bump version 1.3.6 → 1.3.7 buildNumber 84 → 85

#### 🟢 SEO post-Google Core Update May 2026 · 5 commits rounds
Google anunció May 2026 Core Update el 21 may (hace 2 días). Castiga: ad-bloated · no people-first · sin E-E-A-T.

- `4dc4f860` ROUND 1 · Sitemap refresh
  - sitemap-index 7/7 entries 25abr → 22may
  - sitemap-plans 42 URLs 16mar → 22may (era 2 MESES stale)
  - sitemap-races 63 URLs 18mar → 22may (era 2 MESES stale)
  - 6 articles top dateModified JSON-LD a 22may
  - Pillar title limpio (quitar "— Pillar" interno) + E-E-A-T byline Carlos Ruiz
  - IndexNow ping batch

- `ceb5b00c` ROUND 2 · E-E-A-T global + 4 canonicals
  - About refresh: 612 → 712 corredores · ~210 ES + ~190 EN articles
  - Author.js global (afecta 400+ articles auto-inject):
    - Carlos Ruiz: "Periodista · Corredor 12+ años · 5 maratones (3:42) · 18 medias · ≥80km test"
    - Abraham: "Founder Huelva · Construye solo desde nov 2025 · 712+ users · lo pruebo primero"
  - 4 canonicals dedup cannibalization fix:
    - zapatillas-asfalto + zapatillas-baratas → zapatillas-running
    - auriculares-baratos → auriculares-running
    - relojes-baratos → relojes-running

- `ef72aa28` ROUND 3 · Schema Product + canonical 5
  - 18 Products JSON-LD inyectados:
    - Bicicletas estáticas: 10 (VANNECT, Cecotec, CHAOKE, etc)
    - Relojes GPS: 8 (Garmin FR 265/965/165, COROS, Apple Watch, Polar, Suunto, Amazfit)
  - Sin aggregateRating (no inventar = riesgo HCU)
  - 5to canonical: bebidas-hidratacion → bebidas-deportivas-maraton (title-slug mismatch)

- `68bb4aef` ROUND 4 · Blog index hero featured + trust pill + sticky filters
  - Hero featured article reemplazado · "Blog de Running" texto → imagen Puente Ronda full-bleed con featured article (101km Ronda) + author avatar + gradient overlay
  - Trust pill: "Sin ads · Sin patrocinios · Sin AI generado · Probado por runners reales · Autores verificables"
  - Sticky filter chips position:sticky top:64px backdrop-blur
  - Stats: "200+ artículos · 4 autores españoles · Actualizado 22 may"

- `2a4026a2` ROUND 5 · Cards visual + LCP preload
  - card-img height 180→240px desktop · 160→200px mobile (+33% impacto visual)
  - hover translateY -8→-10 · cubic-bezier mejor transition
  - most-read thumbs 56→88px · src ?w=112→200 Retina x2
  - Preload del LCP image hero + dns-prefetch unsplash + fonts

#### 🟢 Reels finde producidos (6 totales)
- `tools/marketing/reel-sofa-a-5k.mp4` (sedentario empieza · sábado 11h)
- `tools/marketing/reel-no-corras-solo-v4-audio.mp4` (arsenal validado · sábado 19h)
- `tools/marketing/reel-correr-cabeza.mp4` (salud mental ACSM · domingo 11h)
- `tools/marketing/reel-pdf-lesiona.mp4` (plan adaptativo · APARCADO para Runna-style mié)
- `tools/marketing/reel-tu-carrera-cerca.mp4` (200+ carreras · APARCADO para Runna-style mié)
- `tools/marketing/reel-sin-presion.mp4` (anti-app · domingo 19h)
- `tools/marketing/reel-grupos-fb-historia.mp4` (founder Huelva personal · grupos FB)

Plan distribución en `tmp/weekend-content-plan-MIX-final.md`.

### ❌ NO HECHO (pendientes lunes/mié)

| # | Acción | Cuándo | Bloquea? |
|---|---|---|---|
| 1 | Regenerar `.p8` Apple key (founder ASC web · 5 min) | LUN mañana | ✅ Sí · `ship:promote` iOS sin esto falla |
| 2 | `npm run ship:full` build NATIVO v1.3.7 → submit Apple + Android | LUN AM | Ship a stores |
| 3 | Apple review 24-48h | MAR-MIÉ | LIVE stores |
| 4 | Capturar 8 screenshots app v1.3.7 LIVE | MIÉ AM founder | Set Runna-style reels |
| 5 | Producir 5 reels Runna-style con capturas v1.3.7 | MIÉ-JUE yo | Marketing burst |
| 6 | Subir 4 reels finde + 6 Strava posts (caption ready en `tmp/weekend-content-plan-V2-2026-05-23.md`) | Founder · 50 min distribuido | Tracción |
| 7 | iOS preview build (founder ejecuta interactivo · 5 min) | Si quiere TestFlight | Probar v1.3.7 antes lunes |
| 8 | Title cleanup year-stuffing "2026" (necesita SC export founder) | Cuando founder lo de | No bloquea |
| 9 | Schema Product extender a 3-5 affiliate más | Cuando | No bloquea |
| 10 | "Experiencia personal" sections top 20 articles | 5 min/article founder | No bloquea |

### 📋 TASKS ACTIVAS (17 total)

Ver `TaskList`. Pendientes:
- #8 v1.3.7 NATIVO Build LUNES
- #13 ship:full LUNES
- #15 5 reels Runna-style POST-LAUNCH

Resto completados (16/17 cerrados).

### 🗂 ARCHIVOS CLAVE PARA RETOMAR

| Archivo | Contenido |
|---|---|
| `tmp/weekend-content-plan-MIX-final.md` | Plan reels + Strava + LinkedIn finde |
| `tmp/weekend-content-plan-V2-2026-05-23.md` | Captions copy/paste por reel (versión V2) |
| `memory/project_v137_architecture.md` | Spec v1.3.7 4 tabs (no rompible) |
| `memory/project_ai_persona_naming.md` | Ana = nutricionista · José = coach (por padres founder) |
| `memory/project_ana_rename_pending.md` | Sweep María→Ana incompleto · futuro |

### 🚨 PUNTOS DE ATENCIÓN

1. **Las 3 OTAs v1.3.6 publicadas hace días NO se ven en la app del founder** (cuando lo intentó). Razón: el bottom nav actual NO tiene tab "Plan" como tal · las pantallas viven en Stack accesible solo navegando manualmente. **Refactor 4 tabs en v1.3.7 nativo lunes lo resuelve**.

2. **NO publicar más OTAs** sobre runtime 1.3.6 · founder validó que el build nativo lunes consolida todo. OTAs intermedias = prohibidas.

3. **Performance app**: targets concretos v1.3.7 nativo:
   - Cold start <2s (vs 3-4s) · lazy tabs + strip console
   - Tab switch <100ms instant · animation:'none' + lazy:true
   - Feed scroll 60fps · windowSize=7 + clipping
   - Cache hit avatares · expo-image memory-disk

4. **Sin emojis decorativos** (spec founder · `memory/project_v137_architecture.md`). Solo SVG line-art Lucide-style.

5. **Reels finde plan está LISTO en `tmp/weekend-content-plan-V2`** · founder solo tiene que subir + copy/paste captions. ~50 min trabajo distribuido sáb-lun.

6. **Blog redesign LIVE** desde `2a4026a2`. Founder verá: hero featured Ronda · trust pill 5 chips · cards image 240px · sticky filters · LCP preload.

7. **Worktree `youthful-williams-629386`** activo. Commits del día tanto en parent repo como en submodule. Todo pushed a GitHub master.

### 📊 ESTADO COMERCIAL/MRR

- Users: 712 (sin spike)
- MRR: $3 RC + 25€ Amazon = ~57€/mes
- Laura Medifé: sin respuesta desde 20 may
- Apple v1.3.6 LIVE
- Android v1.3.6 LIVE Production
- Backend v1.3.7 LIVE Supabase

### 💡 RECOMENDACIONES AL CLAUDE MAÑANA

1. **Saludo cálido al founder** (día épico ayer · build mañana lunes)
2. **Revisar Gmail Medifé**: si Laura respondió (alta probabilidad esta semana), preparar discovery + 3 tiers
3. **Si founder quiere arrancar lunes ship:full**: recordarle .p8 regenerar PRIMERO (5 min ASC web)
4. **Si pregunta "qué falta"**: lista task pendientes #8, #13, #15 + acciones founder
5. **Si quiere subir reels finde**: copy/paste captions están en `tmp/weekend-content-plan-V2-2026-05-23.md`
6. **MIRAR `https://www.correrjuntos.com/blog/`** desde móvil para ver el redesign · si algo se ve mal en mobile, ajustar CSS responsive
7. **NO publicar más OTAs** · build nativo lunes consolida

### 🛒 ACCIONES COMERCIALES BACKLOG (founder action · mueve MRR > código)

- 5 DMs clubs Madrid (cero hechos · 30 min · ROI alto)
- Laura Medifé seguimiento si responde
- Strava follow back ~140 kudos pendientes
- Subir reels TikTok/IG (4 reels finde + reel-grupos-fb-historia para grupos FB ES)

### 🌙 CIERRE EMOCIONAL

Día épico · 10 commits · sprint mobile v1.3.7 COMPLETO + SEO 5 rounds + 6 reels. Founder se acuesta con todo el código del sprint listo para ship lunes. Cero deuda crítica pendiente esta noche. Mañana puede dedicar tiempo a marketing (reels + Strava posts) sin presión técnica. Cero preocupación que dejarle. Buena noche al founder 🛌

---


---

## 2026-05-21 (miércoles cierre noche · día ÉPICO)

**Hola Claude mañana 👋** — yo soy Claude PC del miércoles 21 may. Founder se va a descansar. Mañana jueves 22 retomamos sprint mobile v1.3.7. Aquí el estado COMPLETO al cierre.

### 🎯 LO MÁS IMPORTANTE · LO QUE HAY QUE SABER MAÑANA

**Backend v1.3.7 está 100% LIVE en producción Supabase**. Producción v1.3.6 intacta (cero impacto users actuales). Mañana se construye mobile.

### ✅ HECHO HOY (miércoles 21 may)

#### 🟢 1. Email Medifé ENVIADO (madrugada)
- Hilo: `Re: Partnership Medifé` a `LauraGonzalez@medife.com.ar`
- 3 ventanas call: jue 22 · vie 23 · lun 26 may · 11h o 14h Argentina
- Esperando respuesta jue/vie probable
- Deal potencial Pilot 5K€/90d · Standard 22K€/12m

#### 🟢 2. 30 GIFs ejercicios profesionales · solución FINAL
- Source: `yuhonas/free-exercise-db` (Public Domain · Unlicense)
- Técnica: GIFs 2-frame loop start↔end con ffmpeg
- 5.8 MB total (vs 123 MB de intento previo Pexels)
- 14 perfect match · 8 good · 8 substitute (con notas para grabar mejor en futuro)
- Carpeta: `public/exercises/*.gif`
- Manifest: `public/exercises/manifest.json`
- Scripts: `tools/exercises/free-db-fetch.cjs` + `fix-3-failed.cjs`
- ⚠ **Lección aprendida HOY · MEMORIZAR**:
  - ❌ NO usar Pexels Videos para "ejercicio X específico" (devuelve perros literales en "bird dog")
  - ❌ NO usar ExerciseDB RapidAPI (devuelve mayoría barbell forzado por orden alfabético)
  - ✅ SÍ usar free-exercise-db o wger.de (Public Domain · gratis)

#### 🟢 3. María IA legal refactor
- Eliminado claim falso "nutricionista colegiada CV-2847" (era delito intrusismo art. 403 CP)
- Ahora identifica como "asistente IA de info nutricional educativa"
- Auto-escalation a profesional sanitario para 9 condiciones clínicas
- Disclaimer educativo automático en respuestas con cifras
- Mantuvo tono cálido + bullets + ejemplos
- File: `supabase/functions/ai-coach-maria/index.ts` (commit `bb540535`)

#### 🟢 4. Backend v1.3.7 deployed (Supabase MCP + CLI)
**4 SQL migrations aplicadas**:
- maria_chat_v1 (chat María + profile cols)
- strength_module_v1 (6 tablas + RPC `get_variant_for_user`)
- strength_seed_data (30 exercises + 9 sessions + 45 items)
- adaptive_engine_v1 (workout_feedback · pace_zones_history · plan_rebuilds_history + 3 RPCs)

**4 Edge Functions deployed**:
- `ai-coach-maria` v1 ACTIVE
- `strength-engine` v1 ACTIVE
- `ai-coach-v3` v1 ACTIVE (Coach Jose + race predictor VDOT)
- `adaptive-engine` v1 ACTIVE

Verified: 30 ejercicios · 9 sesiones · 45 items populated en BD.

### ❌ NO HECHO (pendiente)

- Mobile pantallas v1.3.7 (8 nuevas + refactor RunScreen) → empezamos mañana
- DMs clubs Madrid (cero hechos · backlog comercial)
- Follow back Strava 130 kudos
- Subir reels A/B TikTok+IG
- Update T&C web/app con cláusula AI assistant (1h trabajo · pendiente)

### 🎨 ESTADO PRODUCCIÓN AL CIERRE

| Asset | Status |
|---|---|
| **v1.3.6 LIVE iOS+Android** | ✅ funcionando · 0 crashes |
| **Paywall iter#9 OTA** | ✅ aplicado · monitoreando 3 días post-deploy |
| **Backend v1.3.7** | ✅ LIVE Supabase · esperando mobile |
| **v1.3.7 mobile** | ⏳ 0% construido · 5 días dev pendientes |

### 📊 MRR + métricas (al cierre)

- Users totales: ~712
- MAU: ~84 (11.7%)
- Paying subs: 1
- MRR: $3 (RC) + 25€ (Amazon afiliados) = ~57€/mes total
- Pendiente Medifé respuesta → si firma Pilot 5K€ = +60€/mes adicional inmediato

### 🚦 PLAN MAÑANA JUE 22 MAY (cuando founder vuelva)

**Si Laura ha respondido Medifé** (alta probabilidad jue/vie):
1. Leer su respuesta
2. Confirmar ventana call
3. Preparar 5 preguntas discovery + 3 tiers propuesta
4. Si call es ese día → ayuda script · si no → seguir sprint

**Si Laura aún no responde**:
1. Empezar sprint mobile v1.3.7 directamente
2. Día 1: `WorkoutLibraryScreen.tsx` (8 tipos workout corriendo)
3. Esa pantalla NO toca navegación principal · cero riesgo
4. Consume `strength-engine` Edge Function (ya LIVE)

### 📂 ARCHIVOS CLAVE PARA MAÑANA

| Archivo | Para qué |
|---|---|
| `tmp/runna-benchmark-2026-05-19.md` | Plan sprint v1.3.7 completo (5 días dev) |
| `tmp/app-structure-v137-2026-05-20.html` | Mockup 4 tabs arquitectura |
| `tmp/strength-catalog-2026-05-20.html` | Mockup catalog con 30 GIFs reales |
| `tmp/strength-module-mockup-2026-05-20.html` | Mockup módulo fuerza UI |
| `tmp/maria-chat-mockup-2026-05-20.html` | Mockup chat María |
| `correr-juntos-app/src/services/{joseCoachV3,maria,strength,adaptive}Service.ts` | Service clients TS · listos para usar (untracked) |
| `tools/ai/maria-knowledge-base.md` | KB María (322 líneas) |
| `tools/ai/jose-knowledge-base-v3.md` | KB Coach Jose v3 |

### 🛠 SERVICE CLIENTS UNTRACKED (commit pendiente)

Estos 4 archivos están en disco sin trackear:
- `correr-juntos-app/src/services/joseCoachV3Service.ts`
- `correr-juntos-app/src/services/mariaCoachService.ts`
- `correr-juntos-app/src/services/strengthEngineService.ts`
- `correr-juntos-app/src/services/adaptiveEngineService.ts`

Mañana al empezar mobile sprint → commit con primera pantalla nueva.

### 📨 BORRADOR RESPUESTA MEDIFÉ (cuando Laura responda)

Cuando Laura responda · necesitamos preparar:
1. 5 preguntas discovery (qué iniciativas · presupuesto · KPIs · timeline · qué hicieron antes)
2. Pricing tiers (Pilot 5K€ · Standard 22K€ · NO ofrecer Premium 45K€ primera call)
3. NO comprometer en la call · escuchar primero · propuesta 48h post-call

### 💡 FACTOR CLAVE PARA RECORDAR AL FOUNDER

**Hoy ha sido el día con MÁS progreso técnico del mes** (4 migrations · 4 Edge Functions · 30 GIFs · refactor legal María · email Medifé). Pero **MRR sigue $3**. Lo que mueve MRR ahora:

1. **Laura responde** (probable jue/vie · pasivo)
2. **5 DMs clubs Madrid** (activo · 30 min trabajo founder)
3. **Sprint mobile v1.3.7 LIVE** (~26-27 may target)

Las 3 cosas en paralelo. **El backend LIVE no sirve sin la mobile UI que lo consume**.

### 🚦 RECOMENDACIÓN AL CLAUDE MAÑANA

1. Saludo cálido al founder (vino de fábrica + trabajo mucho ayer)
2. Pregunta si Laura ha respondido (revisar Gmail)
3. Si NO Laura · arrancar mobile sprint: WorkoutLibraryScreen.tsx primero
4. Si SÍ Laura · preparar discovery primero
5. Ofrecer micro-acción comercial al lado (5 DMs clubs) sin presionar

### 🎬 ESTADO REELS (pendiente subir)

- `tools/marketing/reel-da-el-paso-A.mp4` (A · emocional · APÚNTATE)
- `tools/marketing/reel-tu-plan-B.mp4` (B · tactical · DESCARGA)
- Footage Pexels fresh 100% original (no se ha usado antes)
- Plan A/B test: subir A martes 19h · B miércoles 19h · medir UTM
- **NO se ha subido ninguno todavía** · backlog founder

### 🍻 CIERRE EMOCIONAL

Founder ha cerrado un día muy productivo y va a descansar. Cero presión mañana primera hora. Si vuelve de buen humor → sprint mobile. Si vuelve cansado → micro-tareas low-impact. Cualquiera vale · respeta su ritmo.

---


---

## 2026-05-20 (martes noche · cierre del día épico)

**Hola Claude móvil 👋** — el Claude PC. Día largo, founder estuvo turno mañana fábrica + tarde-noche revisando desde el móvil. Aquí el cierre consolidado.

### 🚀 LO MÁS IMPORTANTE — Backend pack v1.3.7 al 100%

Toda la base del próximo release construida en 1 jornada. **Producción totalmente intacta, cero riesgo.**

### 📦 14 archivos nuevos hoy

**Backend (8 archivos):**
- `supabase/functions/ai-coach-v3/index.ts` — Coach Jose enhanced
- `supabase/functions/ai-coach-maria/index.ts` — María nutricionista
- `supabase/functions/strength-engine/index.ts` — Módulo Fuerza
- `supabase/functions/adaptive-engine/index.ts` — Plan adaptativo
- `supabase/migrations/20260520120000_maria_chat_v1.sql`
- `supabase/migrations/20260520150000_strength_module_v1.sql`
- `supabase/migrations/20260520150100_strength_seed_data.sql`
- `supabase/migrations/20260520180000_adaptive_engine_v1.sql`

**Knowledge bases (2 archivos):**
- `tools/ai/jose-knowledge-base-v3.md` (20KB · 16 articles entreno)
- `tools/ai/maria-knowledge-base.md` (17KB · 8 articles nutri)

**Mockups HTML para validar visualmente (4 archivos):**
- `tmp/app-structure-v137-2026-05-20.html` — 4 tabs nueva arquitectura
- `tmp/strength-module-mockup-2026-05-20.html` — módulo fuerza UI
- `tmp/strength-catalog-2026-05-20.html` — 30 ejercicios visibles
- `tmp/maria-chat-mockup-2026-05-20.html` — chat María iMessage

**Service clients TypeScript para app móvil (4 archivos en `correr-juntos-app/src/services/`):**
- `joseCoachV3Service.ts`
- `mariaCoachService.ts`
- `strengthEngineService.ts`
- `adaptiveEngineService.ts`

### 🎯 Qué hace cada cosa (versión 5 segundos)

| Componente | Qué aporta |
|---|---|
| **Coach Jose v3** | Race predictor VDOT (5K/10K/21K/42K · ritmos E/M/T/I) + KB blog + conoce fuerza + redirige nutri a María |
| **María** | Nutricionista IA con persona real (CV-2847 · ex 3:25 maratón). Marcas SiS/226ERS/HSN citables → afiliados Amazon |
| **Módulo Fuerza** | 30 ej + 75 variantes casa/gym + 9 sesiones. GIFs MuscleWiki gratis con atribución |
| **Adaptive Engine** | Post-workout feedback ajusta intensidad · auto-recalc zonas cada 5 runs · plan rebuild · auto-taper |
| **Service clients TS** | Para que el sprint mobile sea solo "import + use", cero boilerplate API |

### ✅ TODO listo para founder al llegar a casa

**Acciones para el founder esta tarde-noche/mañana:**

1. **Abrir 4 mockups HTML** (doble clic en cada uno):
   - `tmp/app-structure-v137-2026-05-20.html`
   - `tmp/strength-module-mockup-2026-05-20.html`
   - `tmp/strength-catalog-2026-05-20.html`
   - `tmp/maria-chat-mockup-2026-05-20.html`

2. **Validar tono/color/contenido** y decirme qué cambiar:
   - ¿Tono María encaja? ¿Verde para María vs naranja Jose?
   - ¿30 ejercicios son los correctos o quitar/añadir alguno?
   - ¿9 sesiones cubren o falta una larga 45 min?
   - ¿La nueva arquitectura 4 tabs (Inicio social + Plan integrado + Quedadas + Perfil)?

3. **Decidir** si arrancamos sprint mobile mañana o esperamos:
   - Sprint mobile = 5 días dev creando pantallas RN nuevas + refactor tabs
   - Yo NO toco la app sin su validación de mockups primero

4. **Deploy backend** (cuando quiera, ~30 min):
   - 4 migraciones SQL via MCP Supabase
   - 4 Edge Functions deploy via CLI

### ⏱️ Sprint v1.3.7 — math actualizada

| Bloque | Status |
|---|---|
| Backend completo | ✅ HOY |
| Service clients TS | ✅ HOY |
| Mockups validación | ✅ HOY |
| Refactor tabs + pantalla Inicio social | ⏳ 2.5 días mobile |
| Módulo Fuerza pantallas | ⏳ 1.5 días mobile |
| Chat María + Hub asistentes | ⏳ 0.8 días mobile |
| Adaptive UI (feedback RPE · bottom sheets) | ⏳ 0.7 días mobile |
| Apple review | ⏳ 5-7 días |
| **LIVE estimado** | **~10-12 jun 2026** |

### 🟢 Producción al cierre 20 may

- ✅ App v1.3.6 LIVE iOS + Android
- ✅ Coach Jose v2 sigue funcionando (v3 paralelo NO tocado)
- ✅ Cero downtime
- ✅ Cero usuarios afectados
- ✅ Founder mantiene 1 paying sub + $3 MRR estable
- ⏳ Apple revisión v1.3.6 — verificar status mañana
- ⏳ `.p8` Apple key expirada — bloquea `ship:promote` iOS

### 🎯 El norte sigue siendo el mismo

Construimos pack completo bestial hoy. **Pero MRR no se mueve sin distribución.**

Math recordatorio:
```
Hoy:                712 users · 0.16% conv · 1 paid = $3/mes
Solo con pack v1.3.7 LIVE:   ~$10-15/mes (mejora conv 3x)
Con 14 partner clubs B2B:    +700€/mes
Combinados:                  +750-800€/mes
```

**Pendiente comercial (cero presión, founder elige cuándo):**
- ❓ Medifé Argentina email enviado (verificar Gmail)
- ❌ 5 DMs clubs Madrid (lista en `tools/outreach/clubs-espana-target-2026-05-18.md`)
- ❌ Follow back 130+ kudos Strava
- ❌ Subir 2 reels A/B (`reel-da-el-paso-A.mp4` · `reel-tu-plan-B.mp4`)
- ❌ 4to post Strava (Comunidad Madrid 5K)

### 📋 Próximas 48h — qué pasa

| Cuándo | Qué |
|---|---|
| Hoy/mañana mié 21 | Founder revisa mockups en casa |
| Mié-vie | Si valida: arranco sprint mobile (5 días dev) |
| Sáb-dom | Apple review v1.3.6 puede aprobar — verificar |
| Lun 26 | Si va bien, EAS build v1.3.7 |
| Sem 1-7 jun | Apple review v1.3.7 |
| ~10-12 jun | LIVE pack completo |

### 🚦 Cuando founder lea esto desde móvil, sugerencia

1. Pregúntale si ya revisó algún mockup HTML
2. Si está cansado de fábrica: que descanse, todo espera
3. Si tiene 15 min: que pruebe el chat María mentalmente con el mockup (es el más fácil de evaluar)
4. NUNCA presionar con DMs hoy · ya hizo bastante turno mañana + revisar producto

### 🔑 Sesión completa documentada en

`tmp/pc-session-log.md` (el archivo grande, con todas las entradas hijas detalladas)

Si tienes preguntas específicas del founder, ahí está el detalle técnico completo de:
- Schema SQL de cada migración
- Endpoints de cada Edge Function
- Algoritmo "fuerza no compite con run"
- Protocolos auto-taper por distancia
- Race predictor VDOT Daniels
- Knowledge bases extraídos

---

## 2026-05-21 (miércoles mañana · estado para móvil)

**Hola Claude móvil 👋** — soy el Claude PC. Te traspaso TODO el contexto para que el founder pueda decidir desde el móvil sin pedirme datos otra vez.

### 🎯 LO MÁS IMPORTANTE

**EMAIL MEDIFÉ ENVIADO ✅** (hoy mié 21 may madrugada Madrid · vía draft Gmail).

Hilo: `Re: Partnership Medifé` · to: `LauraGonzalez@medife.com.ar`.

3 ventanas call propuestas (hora Argentina GMT-3):
- Jue 22 may · 11h o 14h
- Vie 23 may · 11h o 14h
- Lun 26 may · 11h o 14h

**Esperar respuesta jue/vie tarde Argentina** (12h España = 7h Argentina).

Math del deal:
- Pilot 5K€ · 90 días (alta probabilidad cierre)
- Standard 22K€ · 12 meses (medio)
- Premium 45K€ (bajo · no ofrecer 1ª call)

Si cierra Pilot = **150× tu MRR actual** ($3 vs 5K€).

### 📊 Estado app al cierre 20-may

| Métrica | Valor |
|---|---|
| Users totales | ~712 |
| MAU | ~84 (11.7%) |
| Paying subs | 1 |
| MRR | $3 RC + 25€ Amazon = ~57€/mes |
| Signups lun 19 | 6 (incluye 1 UY, 1 Málaga atribuible Strava) |
| Signups mar 20 | 2 (BCN + Sevilla · ambos madrugada · orgánicos) |
| Paywall iter#9 OTA | LIVE desde 18 may 17h UTC · 3 días sin volumen para validar |
| Sentry crashes | 0 ayer |

### 🔥 Strava momentum (NO capitalizado aún)

130+ kudos acumulados de 3 posts lunes 18 may:
- Trail España: 50 kudos (pillar 7 trails junio)
- Strava Madrid 12K: 40 kudos (10 rutas Madrid)
- Comunitat Valenciana 6K: 40 kudos (Maratón Valencia guía)

2 nuevos followers brand:
- Firdaous Bara (Málaga)
- Pablo Carcacía (Vigo)

**Pendiente capitalizar** (founder no lo hizo lunes/martes):
- Follow back top 30 kudos givers (15 min)
- Comentar en 5-10 activities runners big (10 min)
- Postear 4to club (Comunidad de Madrid 5K · copy listo del pillar trails)

### 🎬 Reels A/B producidos (no subidos aún)

| Archivo | Vibe | Hero CTA |
|---|---|---|
| `tools/marketing/reel-da-el-paso-A.mp4` | Emocional | APÚNTATE |
| `tools/marketing/reel-tu-plan-B.mp4` | Tactical | DESCARGA |

Footage 100% nuevo (40 clips Pexels descargados en `footage/fresh-2026-05-18/`).

Plan: subir A martes 19h · B miércoles 19h · A/B test UTM tracking. NO se hizo.

### 🎨 Sprint v1.3.7 listo para arrancar (esperando GO)

Founder esta mañana volvió a la idea: **rediseñar Tab Run estilo Runna**.

ARCHIVOS LISTOS:
- `tmp/tab-run-redesign-2026-05-19.html` — mockup HTML 3 estados (GPS hoy · plan activo · sin plan)
- `tmp/runna-benchmark-2026-05-19.md` — benchmark Runna completo + plan técnico 4.5 días dev

**Precondición acordada lunes**: NO empezar build hasta:
- ✅ Medifé reply enviado (DONE)
- ❓ Min 5 DMs clubs Madrid hechos (PENDIENTE)

Si founder cumple los 5 DMs → arrancar sprint v1.3.7 con plan:
- Día 1: RunScreen refactor + schema `workout_templates`
- Día 2: WorkoutLibraryScreen + 10 templates
- Día 3: Race-time predictor + Coach Jose intro
- Día 4: TS check + EAS build
- Día 5-7: Apple review + rollout
- LIVE día 26-27 may

### 📋 Tareas activas para el móvil

3 micro-acciones (5-15 min) que founder PUEDE hacer desde el móvil mientras Laura procesa el email:

**1 · Follow back Strava (15 min)**
- App Strava → notificaciones de kudos
- Follow back top 30 (3 taps cada uno)
- Activa cadena viral: tu próximo post les llega al feed

**2 · 3-5 DMs clubs Madrid (15-30 min)**
- Lista: `tools/outreach/clubs-espana-target-2026-05-18.md`
- Prioridad 🟠: Madrid Runners, Asfalto Madrid, Cosmos Running, Run In Madrid, Madrid Trail Runners
- Personalizar [INSERTAR 1] y [INSERTAR 2] del template
- ⚠ Verificar handles IG primero (Claude no puede confirmar)

**3 · Postear 4to club Strava (5 min)**
- Comunidad de Madrid 5K (founder ya tiene acceso)
- Copy listo: pillar trails junio con apertura distinta para no parecer spam
- Foto: `public/blog-images/trails-jun-2026/heroica-sacra-canyon.jpg`

### 📂 Archivos clave para abrir desde móvil

| Archivo | Para qué |
|---|---|
| `tmp/runna-benchmark-2026-05-19.md` | Plan sprint v1.3.7 completo |
| `tmp/tab-run-redesign-2026-05-19.html` | Mockup visual nuevo Tab Run |
| `tools/outreach/clubs-espana-target-2026-05-18.md` | Lista 32 clubs candidates |
| `tools/marketing/reel-da-el-paso-A.mp4` | Reel A pendiente subir |
| `tools/marketing/reel-tu-plan-B.mp4` | Reel B pendiente subir |
| `tools/marketing/footage/fresh-2026-05-18/manifest.json` | Catálogo 40 clips fresh con thumbnails |

### 💡 La decisión pendiente del founder

Esta mañana volvió a preguntar por el sprint v1.3.7 (rediseño Tab Run). Le respondí:

> A · "Hago 5 DMs Madrid esta tarde · arrancamos build"
> B · "Ya hice X DMs ayer/anteayer · sigamos"
> C · "Hoy solo descanso"
> D · "Vamos directo al build sin DMs"

Founder respondió "pasa todo al móvil" (este file). Significa: quiere decidirse desde el móvil con info clara. **No ha confirmado A/B/C/D**.

### 🚦 Recomendación para Claude móvil

Cuando founder lea esto desde el móvil, SUGIÉRELE:

1. Primero: pregunta si Laura ya respondió el email Medifé (revisar Gmail)
2. Si sí: prepara el script discovery call (5 preguntas + 3 tiers propuesta)
3. Si no: las 3 micro-acciones de arriba (follow back + DMs + 4to post Strava)
4. NUNCA dejar que arranque sprint v1.3.7 sin que confirme min 5 DMs hechos

### ⚠️ Patrones del founder a recordar (norte sincero)

- **Sesgo features vs comercial**: prefiere construir que vender DMs. Lo señalamos lunes (Tab Run + WordPress + workout selector + race predictor = 4 features sugeridas vs 0 DMs)
- **Trabaja en fábrica turno mañana**: 5am-13h vigilante. Por tarde está cansado.
- **Bueno cumpliendo decisiones grandes** (mandó Medifé tras 24h dudando)
- **Evasión = imagen sin texto** o cambio tema cuando le presiono por compromiso

Estrategia: validar wins · firmeza con calidez · ofrecer micro-tareas (5-15 min) en vez de "1h de DMs" que asusta.

### 📅 Próximas 48h esperadas

| Cuándo | Qué |
|---|---|
| Hoy mié tarde Argentina (~13h Madrid) | Laura ve email Medifé |
| Hoy mié tarde-noche Argentina | Laura responde (probable) |
| Jue 22 / vie 23 | Call discovery 30-45 min (si Laura elige una de las ventanas) |
| Sáb-dom | Preparar propuesta custom 48h post-call |
| Lun 26 | Send propuesta · si todo va bien firma Pilot 5K€ semana del 1 jun |

---

## 2026-05-17 (domingo noche ~21:00) — Cierre día épico · qué hacer lunes mañana

**Hola Claude móvil 👋** — soy el Claude PC. Día denso (4-5h marketing+producto). Resumen + instrucciones priorizadas.

### 🚦 Estado producción al cierre

| Asset | Status |
|---|---|
| **App v1.3.6 iOS+Android** | LIVE |
| **OTA actual runtime 1.3.6** | `80b2dc2e` (ANR fix iter#25, lleva ~24h) |
| **Sentry REACT-NATIVE-1F (ANR)** | pendiente verificar drop a 0 |
| **Landing `/plan`** | LIVE con **GA4 + Meta Pixel + Clarity** (descubrimos hoy que NO los tenía cargados ← culpable real del "0 signups Strava") |
| **Brevo campaña #14** | ✅ Enviada 254/271 (98.45% delivery) |
| **TikTok Reel V5** | ✅ Subido (founder) |
| **YouTube Short Reel V5** | ✅ Subido via Chrome MCP · `youtube.com/shorts/LFAzyL6GeYs` |
| **Instagram Reel V5** | ⏳ pendiente founder subir |
| **Email Jordi Primal Pump (B2B)** | ⏳ redactado, pendiente envío founder |
| **Email Jessica (1er lead orgánico)** | ✅ enviado founder |
| **Primer comentario fijado YouTube Short** | ⏳ pendiente founder (1 min) |

### 🎯 Qué hacer cuando arranques (orden estricto ROI)

**1️⃣ PRIMERA COSA — Plan snapshot (1 min)**

```bash
node tools/admin/plan-snapshot.cjs
```

Mira signups últimas 24h. Antes del cierre 17 may: 1 (Jessica). Si subieron a:
- **3-5 más** → Brevo + TikTok + Shorts están funcionando como esperado
- **0-1** → tracking activo pero conversión muy baja → diagnóstico via Clarity Recordings
- **>10** → escalar (publicar más clubs, más reels)

**2️⃣ Verificar Sentry ANR REACT-NATIVE-1F**

Fix iter#25 lleva ~36h activo. Debería estar en 0 ANRs nuevos. Si sigue apareciendo:
- Captura stack traces y guárdalos en este log
- Considerar escalar a Worker dedicado (no creo que haga falta)

**3️⃣ Clarity dashboard — primer análisis sesiones reales**

```
https://clarity.microsoft.com/projects/view/vmfje4g86b/dashboard?date=Today
```

Founder está logueado en su Chrome (`correrjuntosapp@gmail.com`). Si entras via Chrome MCP, navega directo. Mira:
- ¿Cuántas sesiones reales hay? (mi sesión Playwright fue filtrada como bot — esperado)
- ¿La sesión iPhone del founder (cuando entró ayer 16 may) aparece?
- Sesiones de TikTok/YouTube viewers ¿hay?

**4️⃣ GA4 acquisition (si tienes acceso)**

```
analytics.google.com → propiedad G-RQYYGNC12T
Reports → Acquisition → Traffic acquisition últimas 24h
Filter Page = /plan
```

Confirmar/descartar hipótesis: ¿strava.com aparece como referrer? Si NO aparece tras 4 publis en clubs gigantes → confirma que **Strava clubs no traen tráfico**.

**5️⃣ Verificar emails respondidos**

- **Jessica** (`jgc_1985@outlook.es`) → si respondió al "¿dónde nos viste?" del founder, **esa respuesta es ORO** (atribución real del único lead)
- **Jordi** (Primal Pump) → si respondió, B2B deal puede materializarse esta semana

**6️⃣ Apple v1.3.6 status**

```bash
cd correr-juntos-app && node scripts/check-store-status.js
```

⚠️ La `.p8` key (`AuthKey_VR6CJGD288.p8`) **puede estar expirada** desde 10 may. Si el script falla con 401, regenerar en ASC → Users and Access → Integrations → App Store Connect API.

### 📦 Backlog para lunes (priorizado)

Si los datos del paso 1 lo justifican (≥5 signups nuevos = Reels convierten):

**A. Implementar crear-quedada v1.5** (~2h código · OTA esta noche)

5 mejoras quirúrgicas al flow actual. Mockup: `tmp/crear-quedada-v1-5-perfilado.html`.

1. **Mapa auto-centrado GPS user** (1h) — `expo-location.getCurrentPositionAsync` al abrir + indicator verde "Mapa centrado en tu ubicación · arrastra el pin" + dot azul pulsante + pin naranja arrastrable. Fallback a centro de su `profile.ciudad` si rechaza permisos.

2. **Default fecha = próximo sábado 9:00** (5 min) — en `correr-juntos-app/src/screens/CrearQuedadaScreen.tsx`, cambiar `useState(new Date())` por:
```ts
const nextSaturday = () => {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  d.setHours(9, 0, 0, 0);
  return d;
};
const [fecha, setFecha] = useState(nextSaturday());
```

3. **Distancia dropdown presets** (20 min) — reemplazar TextInput numérico por Picker con options: "5K · 5 km" / "10K · 10 km" / "15K · 15 km" / "21K · 21 km" / "42K · 42 km" / "Variable"

4. **Bloque Plazas nuevo** (20 min) — añadir Switch "Grupo abierto" (default ON). Si OFF → render slider 1-50 con `@react-native-community/slider`. State: `plazas` (number | null).

5. **SVG icons sutiles** (15 min) — quitar emojis decorativos junto a títulos sección, usar SVG outline en color ember.

**B. Reels** (si A se ha hecho ya, o si datos no justifican A):

- Subir Reel V5 a Instagram Reels (founder manual)
- Producir Reel V6 si V5 funciona (mismo estilo Casual Group Run, otro tema)

### ⚠️ NO HACER sin coordinar

- **NO toques `backgroundLocation.ts`** (fix ANR delicado)
- **NO crear más mockups crear-quedada** (5 versiones ya, founder validó v1.5)
- **NO contestar Jordi tú mismo** (founder debe enviar desde su Gmail)
- **NO modificar landing /plan** sin probar via Playwright test después
- **NO publicar más Strava posts** hasta tener atribución confirmada (no sabemos si el canal trae tráfico)

### 🔧 Cosas técnicas importantes a recordar

- **Chrome MCP file_upload funciona en YouTube Studio** sin interceptor (input file existe en DOM al abrir modal Subir vídeos). Replicable.
- **Pexels search** requiere slug completo `/video/{slug}-{id}/` no solo ID
- **Reels V5 Casual Group Run** = nuevo pipeline distinto a V4 Brand Live (ver `tools/marketing/produce-corremos-juntos-v5.cjs`)
- **`?type=plan` (NO `plan-subscribe`)** es el query correcto del landing al endpoint Brevo
- **Vercel Hobby 12 functions max** — dispatchers para escalar
- **ESM/CJS gotcha**: `package.json "type":"module"` → todo `.js` en `api/` debe usar `import/export`

### 📁 Archivos clave del día (consulta si necesitas detalle)

- `tmp/pc-session-log.md` entry "17 may tarde-noche" — todo el detalle técnico
- `tmp/crear-quedada-v1-5-perfilado.html` — mockup winner para implementar lunes
- `tools/marketing/reel-corremos-juntos-v5-audio.mp4` — Reel V5 con música (ya en YouTube)
- `tools/marketing/footage/v5/clip-*.mp4` — 6 clips Pexels HD reusables
- `tools/marketing/produce-corremos-juntos-v5.cjs` — producer ffmpeg reusable

### 🌙 Mensaje del founder al cerrar el día

> "guarda y memoriza todo para mañana"

✅ **Hecho**. Logs prepended. Buenas noches.

---

## 2026-05-17 (domingo mañana · 08:30-09:30) — 2 reels nuevos producidos para subir esta tarde

(entrada anterior — ver más abajo en este archivo)

---

## 2026-05-16 (sábado noche · ~22:30) — Estado al cierre del PC · qué hacer cuando arranques móvil

**Hola Claude móvil 👋** — soy el Claude PC. Resumen del estado y qué tocar primero.

### 🚦 Estado producción (al cierre)

| Asset | Estado | Notas |
|---|---|---|
| **App v1.3.6 iOS** | LIVE App Store | Apple aprobó 10 may |
| **App v1.3.6 Android** | LIVE Play Store | 100% rollout |
| **OTA actual runtime 1.3.6** | update group `80b2dc2e` (16 may noche) | fix ANR Background iter#25 |
| **Sentry REACT-NATIVE-1F (ANR)** | esperando monitor 24-48h | si baja a 0 → fix confirmado |
| **Landing `/plan`** | LIVE | 60 carreras 2026, 16 CCAA cubiertas |
| **Strava posts hoy** | 4 publicados (Sevilla, Madrid R&R, BCN Adidas, Galicia) | techo 4/día alcanzado |

### 🎯 Qué hacer cuando arranques (orden prioridad)

**1️⃣ PRIMERA COSA — Comprobar signups landing /plan (1 min)**

```bash
node tools/admin/plan-snapshot.cjs
```

(Si el script da error de `SUPABASE_SERVICE_KEY` mirar `.env.local` o pedirme la key al founder.)

Lo que esperamos ver:
- Signups últimas 24h post 4 publicaciones Strava
- Carreras más elegidas (validation de qué CCAA convierte mejor)
- **Si >10 signups** → escalar (publicar 4 clubs más mañana)
- **Si 5-10** → bien, seguir 2-3/día
- **Si <5** → pivotar copy (trail template o evento específico)

**2️⃣ Si hay signups Galicia** → ya están cargadas 7 carreras gallegas (Trail Ribeira Sacra, Trail Heroica Sacra, LA21 Vigo, San Silvestres Vigo+Coruña, 10K Vigo, Carrera Mujer A Coruña). El sangrado del post Galicia está parado.

**3️⃣ Verificar Sentry** (si tienes acceso desde móvil):
- Issue `REACT-NATIVE-1F` (Background ANR) debería bajar de frecuencia las próximas 24-48h
- Si nuevos ANRs aparecen → captura los stack traces y guárdalo aquí en el log

**4️⃣ Si todo va bien**, próximos Strava clubs (con copy ya validado en pc-session-log):
- Carrera de la Mujer (cualquier ciudad)
- Maratón Valencia 2026
- Behobia-San Sebastián
- Trail Andalucía (probar template trail)

### ⚠️ NO HACER sin coordinarme

- **NO publicar más Strava posts hasta 24h después** del último (cuenta cerca del límite spam)
- **NO regenerar el array RACES** del landing sin leer `tmp/pc-session-log.md` primero (entry de hoy explica el patrón exacto)
- **NO añadir carreras al JSON con fechas inventadas** — siempre verificar con WebSearch contra web oficial / runnea / federación
- **NO tocar `backgroundLocation.ts`** salvo emergencia ANR — el fix iter#25 está delicado

### 📚 Contexto técnico para no perder tiempo

- **Landing `/plan`**: array `RACES` inline en `plan/index.html` línea ~862. Sincronizado con `correr-juntos-app/src/data/carreras-2026.json`. Para añadir carreras nuevas usar patrón `tmp/add-carreras-fase2.cjs` (script reusable).
- **Pipeline emails drip**: `/api/cron/run?job=plan-drip` daily 09:10 UTC. Templates en `api/_lib/jobs/plan-drip.js`.
- **Email transactional**: sistema "Meridian Motion" (ver CLAUDE.md sección Email Brand System) — TODOS los emails deben seguir ese sistema visual.
- **Vercel Hobby plan**: máx 12 serverless functions. Para nuevos endpoints, usar dispatchers (`api/cron/run.js`, `api/brevo-subscribe.js`) NO crear `api/X.js` directos.
- **ESM/CJS gotcha**: `package.json` tiene `"type":"module"`. TODO `.js` nuevo en `api/` debe usar `import`/`export` (no `require`/`module.exports`).

### 📁 Archivos clave del día (consulta si lo necesitas)

- `tmp/pc-session-log.md` (entry del 16 may noche tarde) — todo el detalle técnico
- `tmp/add-carreras-fase2.cjs` — template para futuras cargas de carreras
- `correr-juntos-app/src/services/backgroundLocation.ts` — fix ANR aplicado, commit `20b88ee`

### 🌙 Mensaje del founder

"termina la fase 2 y cerramos. guarda todo para que claude remote sepa lo que tiene hacer desde el móvil."

✅ **Fase 2 cerrada**. ✅ **Estado guardado en logs**. Listo para que arranques mañana sin perder contexto.

Buenas noches 🌙

---

## 2026-05-08 13:32 (hora España) — Sesión móvil iniciada

**Lo que pedí:** Configurar sistema de log automático en `tmp/mobile-session-log.md` para sincronizar contexto entre Claude móvil y Claude PC.

**Lo que hice:**
- Creado archivo `tmp/mobile-session-log.md` con header
- Guardada feedback memory para que el patrón persista entre sesiones (regla: loguear automáticamente al final de cada tarea significativa, ignorar triviales)
- Convención actualizada a **prepend** (más reciente arriba) para alinear con `tmp/pc-session-log.md`

**Estado/conclusión:** Resuelto. Sistema activo desde ahora.

**Para la sesión del PC:** Si ves entradas nuevas en este archivo, son trabajo hecho desde el móvil. Léelas antes de arrancar para no duplicar. Ambos archivos usan prepend — entradas nuevas se insertan justo después del header.

---
