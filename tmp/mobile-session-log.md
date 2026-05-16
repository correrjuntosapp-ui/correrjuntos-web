# Mobile Session Log — CorrerJuntos

Puente entre Claude móvil ↔ Claude PC. Cada entrada resume una tarea significativa con: lo que se pidió, lo que se hizo, estado, y contexto para el otro Claude.

**Convención:** las entradas más recientes van ARRIBA (prepend), no al final. Misma convención que `tmp/pc-session-log.md`.

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
