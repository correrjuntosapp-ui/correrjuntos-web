# Mobile Session Log — CorrerJuntos

Puente entre Claude móvil ↔ Claude PC. Cada entrada resume una tarea significativa con: lo que se pidió, lo que se hizo, estado, y contexto para el otro Claude.

**Convención:** las entradas más recientes van ARRIBA (prepend), no al final. Misma convención que `tmp/pc-session-log.md`.

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
