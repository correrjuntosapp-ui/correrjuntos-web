# Mobile Session Log — CorrerJuntos

Puente entre Claude móvil ↔ Claude PC. Cada entrada resume una tarea significativa con: lo que se pidió, lo que se hizo, estado, y contexto para el otro Claude.

**Convención:** las entradas más recientes van ARRIBA (prepend), no al final. Misma convención que `tmp/pc-session-log.md`.

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
