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

## 2026-05-17 (domingo tarde-noche · 14:30-21:00) — Día épico: funnel /plan auditado + Reel V5 publicado + B2B Primal Pump + 5 mockups crear-quedada

**El día más denso de marketing/producto en semanas. Resumen entrada/salida**:

Founder llegó a casa después de mañana de producción (2 reels v4 + plan day). Sesión tarde dedicada a:
1. **Auditar funnel /plan** tras 1 solo signup (Jessica) en 24h pese a 4 publis Strava ayer + 2 reels publicados hoy mañana
2. **Iterar diseño "crear quedada"** (5 versiones HTML, llegando finalmente a v1.5 = v1 actual perfilado)
3. **Oportunidad B2B real**: email de Jordi (cofundador Primal Pump) malentendiendo que organizamos la Cursa de la Mercè → pivot a propuesta sostenible
4. **Reel V5 nuevo estilo Runna** producido y publicado en TikTok + YouTube Shorts via Chrome MCP

### 🔴 HALLAZGOS CRÍTICOS del día

#### A. El landing /plan NO tenía NINGÚN analytics cargado

**Causa raíz del "0 signups Strava"** descubierta tras auditar:
- Las llamadas a `gtag('event', 'plan_landing_signup', ...)` eran **no-ops** (window.gtag undefined)
- No había Meta Pixel cargado
- Clarity tag SOLO en `index-pwa-backup.html` (archivo backup, no servido)
- **Estábamos volando ciegos** todo el tiempo desde que se creó el landing (ayer noche 16 may)

**FIX desplegado (commits `00057bed` + `b59fe7fc`)**:
- GA4 inline (`G-RQYYGNC12T`) con `anonymize_ip:true` (GDPR-friendlier)
- Meta Pixel inline (`1466415711868158`) + PageView automático
- Microsoft Clarity (`vmfje4g86b`) session recordings + heatmaps
- Form submit ahora dispara: GA4 `plan_landing_signup` + Meta `fbq('track','Lead')` con content_category

**Verificado**: 3 trackers disparando (3 GA + 4 Pixel + 2 Clarity requests) en sesión Playwright simulada. Filtrada como bot por Clarity (esperado, requiere humano real).

#### B. Funnel técnico /plan FUNCIONA, problema = atribución sin UTMs

Test funcional completo con email `guetto2012+plantest@gmail.com`:
- ✅ POST `/api/brevo-subscribe?type=plan` retorna 201
- ✅ Fila grabada en `plan_subscribers` correctamente
- ✅ Welcome email llega (founder confirmó)
- ✅ Brevo API key activa

**Bug descubierto**: el dispatcher `api/brevo-subscribe.js` matchea `?type=plan` (correcto del landing). Mi primer test mal-tipado `?type=plan-subscribe` cayó al handler default newsletter → contaminó `newsletter_subscribers` (limpiado después).

**El problema real**: las 4 publis Strava de ayer linkaban a `correrjuntos.com/plan` SIN UTMs. No podemos saber si Jessica vino de Strava o de SEO orgánico o de otra parte. Para futuro: TODO link en posts externos DEBE llevar UTMs.

#### C. Único signup orgánico = Jessica (jgc_1985@outlook.es)

- Carrera: EDP Bilbao Night Half Marathon (17 oct 2026)
- Plan: prep-21k
- Fecha signup: 2026-05-17 08:01:37 UTC (10:01 España)
- `converted_to_app_at`: NULL → **NO descargó app** (solo lead)
- Email manual personal enviado por founder desde Gmail con línea "¿dónde nos viste?" para research atribución

### 🎬 Reel V5 "Corremos Juntos" — nuevo estilo Casual Group Run

Founder feedback: los reels existentes V4 (Brand Live) están todos igual ("es lo mismo de ayer"). Necesita estilo distinto, **referencia Runna**. Mostró 2 shorts Runna como ejemplo (canal @Runna):
- `1tg5VLWa8xQ` — Educational "4 ways to improve form with Coach Andre"
- `Mye9YFvsmGc` — Social casual "Would you?😆 #heatwave #london"

**Estilo elegido**: similar al short #2 (casual, real, con grupos diversos), NO kinetic typography.

**Producción**:
- 6 clips Pexels HD descargados (people running together, friends having fun, marathon front view, close-up feet, talking jogging, elderly beach) → 82 MB total en `tools/marketing/footage/v5/`
- Producer `tools/marketing/produce-corremos-juntos-v5.cjs` — ffmpeg portrait conversion (blur background fill) + xfades 0.4s + drawtext minimal con fade in/out
- Storyboard 17.6s · 1080×1920 · 8.69 MB silent / 9.2 MB con audio

**Diferencias clave vs V4 Brand Live**:
- ❌ NO kinetic typography pesada
- ❌ NO phone reveal app
- ❌ NO laptop reveal web
- ❌ NO closing card formal con URL pill grande
- ✅ B-roll PURO de grupos diversos
- ✅ Solo 3 frases minimal ("¿Te apuntarías a esto?" / "Cada sábado · gratis" / "Sin importar tu edad")
- ✅ Closing simple "correrjuntos.com / @correrjuntosapp"

**Publicación**:
- TikTok ES → subido manual founder (sin audio, música nativa TikTok)
- YouTube Shorts → **subido vía Chrome MCP auto** (con audio motivational.mp3)
  - URL: https://youtube.com/shorts/LFAzyL6GeYs
  - Title: "Quedadas de running gratis cada sábado en España · CorrerJuntos"
  - 5 hashtags: #Shorts #Running #Correr #RunnersEspaña #CorrerJuntos
  - Visibilidad pública, "no es contenido para niños"
- Primer comentario fijado pendiente founder
- Instagram Reels pendiente founder

### 🛠️ Chrome MCP file_upload trick funcionó perfecto en YouTube Studio

Sin necesidad de inyectar interceptor JS — el input file YA existe en DOM al abrir el modal "Subir vídeos". El tool `find` lo detectó como `ref_289`, `file_upload` cargó el .mp4 con path absoluto Windows, YouTube procesó. Esto es replicable para futuros uploads automáticos.

### 🔥 Oportunidad B2B real — Email Primal Pump

Llegó email de **Jordi** (cofundador Primal Pump, marca top de gominolas creatina en España, 70k+ unidades vendidas, founders: Jordi + Alex). Pedían patrocinar "la Cursa de la Mercè Barcelona" pensando que la organizábamos.

**Aclaración honesta + pivot estratégico**:
- NO organizamos la Mercè (Ayuntamiento de Barcelona)
- PERO: somos su puerta al mercado running ES (ellos están posicionados gym/strength, intentando entrar en running)
- **First mover en afiliados** (no tienen programa todavía)

**Email redactado** (founder pendiente envío) con 3 frentes Andalucía:
1. **APP** — código descuento exclusivo banner permanente + comisión
2. **BLOG SEO** — integración 2-3 articles/mes con afiliado
3. **CARRERAS Andalucía** — brand presence en eventos reales (Maratón Málaga dic, Nocturna Guadalquivir Sevilla jun, 10K Huelva jun, Maratón Córdoba nov, Trail Marbella oct)

Números a negociar (no en email, en call): 12-15% comisión (first mover) + 200-400€ flat blog mensual + 200-500€/evento. **Potencial: 500-1000€/mes recurrente** = +15-30% MRR de un solo deal.

### 🎨 Iteraciones HTML crear-quedada (5 versiones, llegando a v1.5)

Founder validó la pantalla actual de "Crear Quedada" en la app y la consideró 7/10. Para llevarla a 10/10:

| Versión | Estado | Por qué |
|---|---|---|
| v2 — 10/10 con todo | ❌ Rechazado | "Muchos datos" — añadía progress bar + preview organizador + más options |
| v3 — Smart auto-rellenado | ❌ Rechazado | Para usuarios habituales, no para principiantes |
| v4 — Principiantes (sin ritmo/km, intensidad por sensación) | ❌ Rechazado | Sigue siendo "muchos datos" |
| v5 — Minimal (3 preguntas, 1 pantalla) | ✅ Aprobado base | OK pero faltan calendario real + hora libre + mapa |
| v5.1 — v5 + 3 mejoras (microcopy franjas + barras 5p + "podrás editarla") | ✅ Aprobado refinement | |
| v5.2 — calendario grid + hora libre + Leaflet mapa + 0 emojis | ✅ Pro tone | |
| **v1.5 — v1 actual + 5 mejoras quirúrgicas** | ✅ **WINNER** | No reinventa, perfila el v1 ya familiar |

**v1.5 mejoras a implementar** (~2h código, OTA mañana lunes):

1. **Mapa auto-centrado en GPS user** (1h) — `expo-location.getCurrentPositionAsync` al abrir + indicador verde "Mapa centrado en tu ubicación · arrastra el pin para ajustar" + dot azul pulsante usuario + pin naranja arrastrable
2. **Default fecha = próximo sábado 9:00** (5 min) — calcular `nextSaturday at 09:00` en lugar de `now()`
3. **Distancia dropdown presets** (20 min) — "5K · 5 km" / "10K · 10 km" / "15K · 15 km" / "21K · 21 km" / "42K · 42 km" / "Variable" en lugar de input numérico
4. **Bloque Plazas nuevo** (20 min) — toggle "Grupo abierto" (default ON) + slider 1-50 si se desactiva
5. **SVG icons sutiles** (15 min) — quitar emojis 🗓️ 🏃 al lado de títulos, dejar SVG outline naranja

**Mockup HTML final**: `tmp/crear-quedada-v1-5-perfilado.html` (con Leaflet embebido + Pin GPS animado + plazas toggle funcional + dummy data Sevilla).

⚠️ **CRÍTICO**: implementar v1.5 NO mueve MRR a 30 días (solo 5-8 organizadores activos hoy). Founder lo entiende. Decisión: implementar **el mapa GPS + default fecha + plazas** (lo más rápido) cuando haya hueco, no urgente.

### 📩 Brevo campaña #14 — ENVIADA con éxito

- **Nombre**: "App captación · Mayo 2026 (271 subs)"
- **Subject**: "Tu plan de running para esta semana — ..."
- **Body preview**: "Plan, coach y grupo — para que esta vez lo acabes"
- **Status**: ✅ Enviada 17 may 2026 20:00
- **Entregados**: 254 / 271 (98.45% deliverability — excelente)
- **Aperturas inicio**: 3 (1.18%) — esperar 24-48h para métrica final (benchmark fitness 18-25%)
- **Clics**: 0 inicio — esperar
- **Bajas**: 0

### 📋 Estado producción al cerrar 17 may

| Asset | Estado |
|---|---|
| App v1.3.6 iOS+Android | LIVE |
| OTA actual runtime 1.3.6 | `80b2dc2e` (ANR fix iter#25, 24h+ activo) |
| Sentry REACT-NATIVE-1F (Background ANR) | esperando data confirmación drop a 0 |
| Landing `/plan` | LIVE con GA4 + Meta Pixel + Clarity (vmfje4g86b) |
| Carreras 2026 | 60 españolas en 16 CCAA (Fase 2 cargada ayer) |
| Brevo campaña #14 | ✅ Enviada 254/271 |
| TikTok Reel V5 | ✅ Subido (founder) |
| YouTube Short Reel V5 | ✅ Subido (Chrome MCP auto) · `youtube.com/shorts/LFAzyL6GeYs` |
| Instagram Reel V5 | ⏳ Pendiente founder |
| Email Jordi Primal Pump | ⏳ Pendiente envío founder |
| Email Jessica (1er lead orgánico) | ✅ Enviado founder desde Gmail |
| Primer comentario fijado YouTube Short | ⏳ Pendiente founder (1 min) |

### 📁 Archivos clave creados hoy

- `tools/marketing/footage/v5/clip-*.mp4` (6 clips Pexels HD, 82 MB)
- `tools/marketing/reel-corremos-juntos-v5.mp4` (8.69 MB silent)
- `tools/marketing/reel-corremos-juntos-v5-audio.mp4` (9.2 MB con music)
- `tools/marketing/produce-corremos-juntos-v5.cjs` (producer reusable)
- `tmp/crear-quedada-v2-preview.html` → v3 → v4 → v5 → v5.1 → v5.2 → **v1-5-perfilado.html** (winner)
- `tmp/test-clarity-session.cjs` (Playwright test para validar 3 trackers — filtrado como bot por Clarity)

### 🎯 Backlog priorizado para mañana lunes (orden ROI)

1. **Verificar signups** noche y mañana (`node tools/admin/plan-snapshot.cjs`) → si >5 nuevos = Reels funcionan
2. **Verificar Sentry ANR REACT-NATIVE-1F** → si en 0 = fix iter#25 confirmed
3. **Implementar crear-quedada v1.5** mejoras (2h código) → OTA mañana noche si los datos del paso 1 lo justifican
4. **Email Jordi seguimiento** si respondió
5. **Apple v1.3.6 status** → `cd correr-juntos-app && node scripts/check-store-status.js` (⚠️ `.p8` key puede estar expirada)
6. **Clarity Recordings** primer análisis sesiones reales (incluye founder iPhone sesión)
7. **GA4 acquisition últimas 24h** → confirmar/descartar hipótesis "Strava no convierte"

### 💡 Lecciones del día (memorizar)

1. **NUNCA crear landing sin verificar analytics cargados** — el primer test que debí hacer ayer noche fue `curl /plan | grep -E "(gtag|fbq|clarity)"`. No hacerlo costó 1 día completo de tráfico no medido.

2. **Chrome MCP file_upload SÍ funciona en YouTube Studio** sin interceptor — el input file existe en DOM al abrir modal "Subir vídeos". Usable para automatizar Shorts en el futuro.

3. **Reels: cuando hay que cambiar estilo, cambiar TODOS los elementos** (kinetic→cinematic NO es solo cambiar texto — es cambiar B-roll, ritmo edit, música, closing). V5 vs V4 fue casi diseño desde cero, no iteración.

4. **Founder valida "perfilar v1" > "rediseñar"** consistentemente. La estructura actual está bien, las mejoras son quirúrgicas. Mockups completos rediseñados se rechazan por "muchos datos".

5. **Oportunidades B2B aparecen por error** — Primal Pump escribió pensando que organizamos la Mercè. La respuesta correcta no fue "no, gracias" sino "no organizamos eso PERO te propongo X, Y, Z". Patrón replicable.

6. **Pexels search requiere slug completo** (no solo ID) — `pexels.com/video/{slug}-{id}/` da 200, `pexels.com/video/{id}/` da 403. Para automatización futura: primero search en Pexels, extraer slugs, luego descargar.

---

## 2026-05-17 (domingo mañana · 08:30-09:30) — 2 reels nuevos producidos para subir esta tarde

**Estado entrada/salida**:
- Founder estaba revisando el plan del día y pidió 2 reels nuevos con objetivos distintos (awareness + acquisition) para subir esta tarde
- Ambos producidos con pipeline V4 Brand Live, validados visualmente, captions redactados, archivos listos
- Founder los abrirá tranquilo en casa — quería todo guardado para continuar luego

### 🚦 Estado producción al cierre PC (08:30 dom)

| Asset | Estado | Notas |
|---|---|---|
| App v1.3.6 iOS+Android | LIVE | sin novedades |
| OTA actual runtime 1.3.6 | `80b2dc2e` (16 may noche, fix ANR iter#25) | monitor Sentry 24-48h |
| Brevo campaña #14 | programada Dom 17 may 20:00 · 257 destinatarios | auto |
| YouTube Short `0-a-5k` | programado Dom 17 may 19:00 | auto |
| **Signups landing /plan** | **3 desde ayer (sáb), 0 hoy hasta 08:30** | sangrado tras 4 posts Strava ayer |

### 📊 Snapshot signups (consulta directa Supabase 08:30)

```sql
SELECT COUNT(*) FROM auth.users WHERE created_at >= '2026-05-16 00:00:00+02';
-- Resultado: 3 (los 3 fueron ayer sábado, cero hoy aún)
```

⚠️ **Bajo conversión vs los 4 publish Strava** (Sevilla, Madrid R&R, BCN Adidas, Galicia). Si esta tarde sigue 0-2 hoy → revisar GA4 si hubo tráfico al landing y dónde se cayeron.

### 🎬 2 reels nuevos producidos (V4 Brand Live, 13.4s cada uno)

#### Reel A — **El runner invisible** (brand awareness)

| Asset | Path |
|---|---|
| Overlay HTML | `tools/marketing/reel-runner-invisible-v4-overlay.html` |
| Producer | `tools/marketing/produce-runner-invisible-v4.cjs` |
| MP4 silent (TikTok+IG) | `tools/marketing/reel-runner-invisible-v4.mp4` · **14.06 MB** |
| MP4 audio (YouTube+X) | `tools/marketing/reel-runner-invisible-v4-audio.mp4` · 14.38 MB |
| Frames overlay | `.frames-reel-runner-invisible-v4-overlay/` (405 PNG) |
| Footage usado | `solo-runner.mp4` (cool grade) + `group-runners.mp4` (warm grade) |

**Narrativa**: "Hay un runner como tú a 800m de tu casa. Y no os habéis visto nunca."
- Phone reveal: mapa con runners cercanos (María 5:20, Carlos 4:55, Lucía 5:10, Javi 4:40) + "12 runners a menos de 1km"
- Laptop reveal: correrjuntos.com homepage "Descubre quién corre cerca de ti"
- Closing: "— HAY GENTE COMO TÚ — / CorrerJuntos / DESCÚBRELOS / 🔒 correrjuntos.com / iOS · Android · gratis"

#### Reel B — **Empieza el sábado** (acquisition CTA)

| Asset | Path |
|---|---|
| Overlay HTML | `tools/marketing/reel-sabado-9am-v4-overlay.html` |
| Producer | `tools/marketing/produce-sabado-9am-v4.cjs` |
| MP4 silent | `tools/marketing/reel-sabado-9am-v4.mp4` · **11.49 MB** |
| MP4 audio | `tools/marketing/reel-sabado-9am-v4-audio.mp4` · 11.81 MB |
| Frames overlay | `.frames-reel-sabado-9am-v4-overlay/` (405 PNG) |
| Footage usado | `solo-deciding.mp4` (perfecto match — chico mirando móvil dudoso) + `group-track.mp4` (pista atletismo) |

**Narrativa**: "3 lunes diciendo 'la semana que viene empiezo'. Te falta la gente, no el plan. EL SÁBADO 9am en tu ciudad."
- Phone reveal: lista de quedadas con SÁB 23 destacada (rodaje suave 5km · 12 confirmados · 9:00 parque)
- Laptop reveal: correrjuntos.com/quedadas
- Closing: "— ESTE SÁBADO, NO EL LUNES — / CorrerJuntos / SÁBADO · 9AM / 🔒 correrjuntos.com/quedadas / GRATIS · SIN REGISTRO"

### 📝 Captions copy-paste (validados, listos para subir)

**Reel A — Instagram Reels**
```
A 800 metros de tu casa hay alguien que sale a correr
a la misma hora que tú.

Va al mismo parque. Hace tu mismo ritmo.

Nunca os habéis visto.

Hicimos CorrerJuntos para arreglar eso. Una app que
te enseña quién corre cerca, qué ritmo lleva, y a qué
hora sale. Si te apetece, salís juntos.

Si no, sigues a lo tuyo. Sin presión.

📍 correrjuntos.com → ver quién corre cerca

¿Cuántos km tienes hechos esta semana? 👇

#correrjuntos #runnersespaña #correr #running #correrjuntosapp
```

**Reel A — TikTok** (190 chars)
```
Hay un runner a 800m de tu casa con tu mismo ritmo.
Nunca os habéis visto.

CorrerJuntos te enseña quién corre cerca · gratis

📍 Link en bio

#correrespaña #running #fyp #runner #correr
```

**Reel A — Primer comentario fijado**
```
Es una app española, hecha por un corredor desde Huelva.
Sin spam, sin tarjeta. Si te encaja, te quedas. Si no, la
borras y todos contentos 🤙
```

**Reel B — Instagram Reels**
```
3 lunes diciendo "la semana que viene empiezo".
3 lunes empezando con pereza y abandonando el jueves.

El problema no es tu plan. Es que no tienes a nadie
esperándote.

Este sábado, a las 9 de la mañana, en cada ciudad de
España hay un grupo de runners quedando para hacer
5km suaves. Sin federación, sin chip, sin pagar.

Tú apareces, corres, te tomas un café y a casa.

📍 Link en bio → quedadas cerca de ti

¿En qué ciudad estás? Te digo si hay grupo el sábado 👇

#correrjuntos #empezaracorrer #correresvida #runner #running
```

**Reel B — TikTok** (190 chars)
```
Este sábado 9am hay un grupo de runners en tu ciudad
quedando para 5km suaves. Gratis. Sin registro.

📍 Link en bio → ver tu ciudad

#correrjuntos #empezaracorrer #fyp #running #correr
```

**Reel B — Primer comentario fijado**
```
Dime ciudad y miro si hay quedada este sábado. Y si no,
podemos hacer una — solo necesitamos a 3-4 personas
que digan "vamos" 🤙
```

### 🔗 UTM links bio sugeridos

| Reel | UTM bio link |
|---|---|
| A (awareness) | `correrjuntos.com?utm_source=tiktok&utm_medium=bio&utm_campaign=runner-invisible` (cambiar `tiktok→instagram` en IG) |
| B (acquisition) | `correrjuntos.com/app?utm_source=tiktok&utm_medium=bio&utm_campaign=sabado-9am` |

### ⏰ Orden de publicación recomendado para esta tarde

1. **14:00-15:00** — Reel A (TikTok ES → IG ES, en este orden, 10 min de gap). Cambiar bio a `runner-invisible` antes.
2. **17:00-18:00** — Reel B (TikTok ES → IG ES). Cambiar bio a `sabado-9am` antes.
3. **18:55** — Cambiar bio a `finde-0a5k` (POST 5 del weekend checklist).
4. **19:00** — Reel `0-a-5k.mp4` (ya programado en checklist) + YouTube Short auto.
5. **20:00** — Brevo campaña #14 auto.

⚠️ Regla del playbook: NUNCA subir EN primero. Solo ES hoy. EN mañana si funcionó.

### ✅ Tareas que YA hice (no repetir)

- Verificado footage existe (solo-runner, solo-deciding, group-runners, group-track) y dimensiones
- Producidos overlays HTML + frames PNG + composite ffmpeg + audio merge
- Validados 4 frames clave de cada reel (hero + phone + laptop + closing)
- Captions ES redactados con voz de marca consistente
- Tasks `#1` y `#2` marcadas completadas

### 🔍 Quick checks pendientes hoy (cualquier momento)

- [ ] Sentry `REACT-NATIVE-1F` — fix iter#25 lleva ~14h, monitorear si bajan ANRs
- [ ] Apple v1.3.6 status — `node correr-juntos-app/scripts/check-store-status.js` (ojo: `.p8` puede estar expirada del 10 may)
- [ ] Signups landing /plan a mediodía — `node tools/admin/plan-snapshot.cjs` para ver si suben hoy

### 📁 Files clave del día

- `tools/marketing/reel-runner-invisible-v4.mp4` (Reel A silent)
- `tools/marketing/reel-runner-invisible-v4-audio.mp4` (Reel A con música)
- `tools/marketing/reel-sabado-9am-v4.mp4` (Reel B silent)
- `tools/marketing/reel-sabado-9am-v4-audio.mp4` (Reel B con música)
- `tools/marketing/weekend-publishing-checklist.md` (checklist finde original)
- `tools/marketing/REELS_PIPELINE_V4_BRAND_LIVE.md` (doc canónica del pipeline)

### 🌙 Mensaje para próxima sesión (PC o móvil)

Founder dijo: "en casa lo miro, guarda todo para que sepamos en casa por dónde vamos".

**Cuando arranque la próxima sesión**:
1. Confirmarle que ambos reels están listos en `tools/marketing/reel-runner-invisible-v4.mp4` y `tools/marketing/reel-sabado-9am-v4.mp4`
2. Si ya los vio y le gustan → recordarle el orden de publicación de esta tarde (Reel A 14:00, Reel B 17:00)
3. Si quiere cambios → re-editar overlay HTML + re-grabar frames (~5 min) + re-producir MP4 (~30s ffmpeg)
4. Si arranca en móvil → los MP4 están en `OneDrive\Escritorio\correrjuntosV2\tools\marketing\` (OneDrive sync auto, debería verlos también en móvil)

---

## 2026-05-16 (sábado noche tarde · ~21:30-22:30) — Fix ANR Background (iter#25) + Sincronización landing /plan (Fase 1 + Fase 2)

**3 hitos del cierre del día, en orden cronológico**:

### A. Fix ANR Background — iter#25 (OTA publicada)

**Origen**: Email Sentry "Background ANR" issue REACT-NATIVE-1F en Samsung Galaxy A36 (Android 16, expo 54.0.13). Android mata la app cuando main thread queda bloqueado >5s en background.

**Causa raíz identificada en `correr-juntos-app/src/services/backgroundLocation.ts`**:
- El callback `TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ...)` recibía batches de 5+ locations cuando volvía foreground o cada N segundos.
- Procesaba sync: `gpsTracker.processPoint` (OK, rápido) + `Notifications.scheduleNotificationAsync` × 5 (km splits) + audio km alerts + periodic stats notification.
- Las 5 notifications se encolaban sync → main thread bloqueado >5s en device gama media-baja → ANR.

**Fix aplicado**:
```ts
// Step 1 — Sync: solo math en memoria
for (const loc of locations) {
  gpsTracker.processPoint(point);
}
// Step 2 — Defer side effects a next tick
setTimeout(() => {
  // notifications + audio + periodic updates aquí
}, 0);
```

El task callback returns inmediatamente. Cero cambios en lógica de tracking (distancia, ritmo, precisión idénticos).

**Deploy**:
- Commit `20b88ee` en submodule app
- OTA publicada: update group `80b2dc2e-bed5-4f88-bd2b-442d335a9028` runtime 1.3.6 (Android + iOS)
- Parent repo commit `33fb3cad` (submodule pointer bump)

**Monitor 24-48h**: Sentry REACT-NATIVE-1F debería bajar a 0 ANRs. Si sigue → escalar a worker dedicado (no creo que haga falta).

---

### B. Sincronización landing /plan Fase 1 — Sangrado parado

**Problema detectado tras auditar BD post-4 publicaciones Strava del día**:
- App tenía 92 carreras en `correr-juntos-app/src/data/carreras-2026.json`
- Landing `/plan` tenía SOLO 18 carreras hardcoded inline
- Copy "92 carreras 2026 ya cargadas" → MENTIRA visible
- CCAA visibles: solo Madrid/BCN/Valencia/Bilbao/Sevilla/Málaga/Huelva/Bagà/SS
- CCAA invisibles: Galicia, Asturias, Cantabria, Canarias, Baleares, Aragón, Murcia, CyL, C-LM, Extremadura, La Rioja, Navarra
- **Crítico**: el post Strava de Galicia llevaba a una landing donde Galicia NO aparecía → riesgo reputacional alto

**Fix Fase 1**:
- Reemplazado array hardcoded 18 → 47 carreras españolas futuras (>= 2026-05-16) leídas del JSON master
- Copy ajustado: "92 carreras" → "carreras populares 2026 toda España" (sin número, no hay que mantenerlo cuando añadimos)
- Meta description, og:description, hero, how-step todos actualizados
- CCAA cubiertas: 9 → 13
- Galicia ahora visible (2 carreras: 10K Vigo + Carrera Mujer A Coruña)

**Deploy**: commit `e129d965` parent repo, HTTP 200 verificado en live, 47 carreras renderizadas.

---

### C. Fase 2 — Cobertura nacional honesta (12 carreras nuevas + 1 fix fecha)

**Investigación**: 16 WebSearches en 2 batches paralelos para verificar fechas oficiales 2026. Solo añadí carreras con fecha confirmada en web oficial / runnea / federación. **CERO carreras inventadas**.

**Carreras añadidas al JSON master** (12 nuevas verificadas):

🟢 **Galicia (+5)** — urgente, post Strava ya publicado:
- `trail-heroica-sacra-2026` (27 jun)
- `trail-ribeira-sacra-2026` (11 oct, X edición · Luintra)
- `la21-media-vigo-2026` (15 nov · 21K)
- `san-silvestre-vigo-2026` (31 dic)
- `san-silvestre-coruna-2026` (31 dic · 7K)

🟢 **Castilla y León (+4)**:
- `media-uva-valladolid-2026` (17 may, XLV Media UVA)
- `media-valladolid-2026` (27 sep, XXXVII Media Ciudad)
- `burgos-21k-cid-2026` (25 oct, Tras las Huellas del Cid)
- `cross-atapuerca-2026` (22 nov, XXI Cross Internacional)

🟢 **Castilla-La Mancha (+2)**:
- `maraton-toledo-2026` (15 nov, I Maratón Imperial Toledo)
- `media-albacete-2026` (4 oct, XXIX Albacete)

🟢 **Navarra (+1)**:
- `media-san-fermin-pamplona-2026` (21 jun, XII La Media San Fermín)

🟢 **ACTUALIZACIÓN La Rioja**:
- `maraton-logrono-2026` fecha corregida: 2026-04-19 (ya pasó) → 2026-10-04 (XII edición oficial)

**Cobertura final** (carreras españolas futuras ≥2026-05-16 después de Fase 2):

| CCAA | Antes | Fase 1 | Fase 2 |
|---|---|---|---|
| Madrid | 5 | 9 | 9 |
| Andalucía | 3 | 9 | 9 |
| País Vasco | 3 | 8 | 8 |
| **Galicia** | **0** | **2** | **7 ✅** |
| Cataluña | 3 | 6 | 6 |
| **Castilla y León** | **0** | **0** | **4 ✅** |
| Comunidad Valenciana | 3 | 4 | 4 |
| **Castilla-La Mancha** | **0** | **1** | **3 ✅** |
| Murcia | 0 | 2 | 2 |
| Aragón | 0 | 2 | 2 |
| Asturias | 0 | 1 | 1 |
| **Navarra** | **0** | **0** | **1 ✅** |
| Cantabria | 0 | 1 | 1 |
| **La Rioja** | **0** | **0** | **1 ✅** |
| Baleares | 0 | 1 | 1 |
| Canarias | 0 | 1 | 1 |
| **TOTAL** | **18** | **47** | **60** |

**Deploy Fase 2**:
- Submodule app commit `f25a00a` (JSON ordenado por fecha asc para mantenimiento)
- Parent repo commit `0a54921e` (landing /plan + submodule pointer bump)
- HTTP 200 verificado, 60 carreras + 16 CCAA en producción

---

### Scripts creados (reusables para próximas Fases)

1. `tmp/add-carreras-fase2.cjs` — script Node que añade carreras al JSON master + valida no duplicados + permite UPDATES de fechas + reordena por fecha asc + actualiza meta. Patrón claro para próximas cargas masivas.

2. `tmp/races-array-fase2.txt` — output del generator del array RACES inline. Útil cuando hagamos Fase 3.

---

### Backlog Fase 3 (cuando haya hueco — NO urgente)

Las CCAA con solo 1 carrera futura siguen flojas:
- **Asturias** (1): solo Carrera Mujer Gijón. Falta: trail Picos Europa, San Silvestre Avilés
- **Cantabria** (1): solo Media Santander 20 sep. Falta: Trail Liébana, San Silvestre Santander
- **Extremadura (0)**: Mérida (11 abr) y San Silvestres Cáceres/Badajoz ambiguas. Investigar fechas oficiales 2026
- **Coruña10** (octubre): web oficial no publicó fecha 2026 aún, revisar agosto/septiembre

Cuando lleguemos a 70+ carreras → actualizar copy a "70+ carreras populares 2026" o similar (más concreto que la versión actual sin número).

---

## 2026-05-16 (sábado noche · ~19:00) — Landing /plan + Drip campaign 4 emails (iter#24)

Founder pidió analísis honesto ROI tras día épico de bugs/UX. Honesty check confirmó: **distribución > features**. Construido el motor de conversión que faltaba: landing `/plan` + email drip.

### Stack desplegado

**SQL migration `plan_subscribers_landing_v1`** ✅ aplicada:
- Tabla `plan_subscribers` con email/nombre/lang/carrera/plan_slug/UTM/status/emails_sent
- RLS service_role only
- Index lower(email), status+last_email, carrera_id
- Trigger updated_at

**API backend** (todo en `api/_lib/jobs/` para Hobby 12-fn limit):
- `plan-subscribe.js` — captura email + carrera + envía welcome email con preview plan
- `plan-drip.js` — cron job 4 emails post-signup (D1, D3, D7, D14)
- Wire en `brevo-subscribe.js?type=plan` + `cron/run.js?job=plan-drip`

**Landing `/plan/index.html`** (~1080 líneas):
- Hero: "Tú eliges la carrera. Yo preparo el plan."
- Selector 18 carreras populares 2026 (filtros 5K/10K/21K/42K/Trail/Todas)
- "No veo mi carrera" fallback
- Email gate con pill carrera seleccionada
- 3 pasos cómo funciona
- 4 partner clubs (social proof tangible)
- FAQ 5 preguntas
- Footer brand + links
- UTM tracking end-to-end
- GA4 event `plan_landing_signup` con carrera_id + plan_slug

**Vercel cron `vercel.json`**:
- `plan-drip` daily @ 09:10 UTC (entre lifecycle-trial 09:00 y recovery-ultra 09:05)

### Drip campaign templates (Meridian Motion editorial)

| Día | Subject | Hook | CTA |
|---|---|---|---|
| 0 | "✓ Tu plan para [carrera] ya está en camino" | Welcome + preview plan | Activar mi plan |
| 1 | "Tu primera semana (y la más importante)" | 60% de planes mueren primera semana | Activar mi plan en la app |
| 3 | "El error que comete el 80%" | 80% corren días suaves demasiado rápido | Abrir la app + Coach Jose |
| 7 | "¿Has empezado tu plan para [carrera]?" | "Cada día sin entrenar = adaptación perdida" | Instalar la app |
| 14 | "Última: 14 días gratis si activas hoy" | Last call + sin tarjeta + cancela | Activar 14 días gratis |

Cada email:
- Eyebrow mono tracked
- Tagline CORRE ACOMPAÑADO
- H1 Inter 200 ultra-thin + strong highlight orange
- Body 3-4 párrafos
- CTA pill orange con dark text
- UTM `utm_source=plan_drip&utm_medium=email&utm_campaign=day_X`
- Unsubscribe link (legal compliance)

### ROI proyectado (de cara a llegar a 1.000€/mes)

| Escenario | Conv visit→email | Conv email→install | MRR/100visits |
|---|---|---|---|
| Sin landing (status quo) | 0% | n/a | 0€ |
| Landing solo (sin drip) | 15% email | 8% install | 0.30€/m |
| **Landing + drip (HOY)** | 15% email | **25% install** | **0.95€/m** |

A escala: 10.000 visits/mes (factible con SEO + paid ads) → **570€/mes MRR** = más de la mitad del objetivo de 1K€/m.

### Diferenciación con `/planes/*` existente

- `/planes/{distancia}` (ya existía) → SEO content para Google indexar
- `/plan` (nueva) → CONVERSION funnel lead capture

No se pisan. Pendiente añadir CTA al final de cada `/planes/{distancia}` apuntando a `/plan` (10 min trabajo) para conectar SEO traffic → funnel.

### Smoke tests pasados

- ✅ Landing `/plan` 200 OK live
- ✅ API endpoint `?type=plan` valida email (400 con email inválido)
- ✅ Cron `?job=plan-drip` deploy ↗ available list
- ✅ IndexNow ping URL nueva

### Pendiente próxima sesión

1. **CTAs en `/planes/{distancia}/` → `/plan`** (10 min, conecta SEO existente)
2. **Paid FB ads test €10/d × 7d** apuntando a `/plan?utm_source=fbads` (€70 inversión, 100-300 signups proyectados)
3. **Outreach 20 clubs partner nuevos** con link `/plan` (4h trabajo, mejor ROI distribución)
4. **TikTok bio link** apuntar a `/plan?utm_source=tiktok&utm_medium=bio`
5. **Email blast** a los 270 newsletter contacts con el link `/plan`
6. **KPIs a vigilar** post-deploy (30 días):
   - `plan_subscribers` count
   - Email open rates per drip day (Brevo dashboard)
   - Conv email → install (UTM `plan_drip` en GA4)
   - Conv install → trial activated
   - Conv trial → paid

### Stack final del día 16 may

| Componente | Estado |
|---|---|
| 10 OTAs runtime 1.3.6 (iter#21+22+23) | 🟢 Live |
| 2 SQL migrations | 🟢 Aplicadas |
| Landing `/plan` | 🟢 Live |
| API `?type=plan` | 🟢 Live |
| Cron `plan-drip` | 🟢 Live, cron activo desde mañana 09:10 UTC |
| Web 521 articles | 🟢 sin tocar |
| iOS v1.3.6 | 🟡 WAITING_FOR_REVIEW Apple |

Sesión cerrada. Día épico — 10 OTAs producto + landing conversion funnel completo. Ahora la palanca es DISTRIBUCIÓN.

---

## 2026-05-16 (sábado tarde · ~14:00) — Dogfood del padre + 8 OTAs + Iter#21 producto

**Founder dogfoodeando desde la tablet del padre** (cuenta nueva "PapA · Punta Umbría") encontró 6 bugs/UX issues + me pidió rediseño nivel Strava/Runna/NRC para 3 zonas. Resultado: **8 OTAs publicadas en runtime 1.3.6** en una tarde.

### OTAs encadenadas

| # | OTA ID | Cambio |
|---|---|---|
| 1 | `019e3058-45a5-73e1-81bc-577f13d484c7` | Fix ritmo `NaN:NaN/km` en card actividad amigos (BD guarda `runs.ritmo_promedio` como text "4:57", FeedActivityCard lo trataba como number → Math.floor("4:57"/60)=NaN). formatPace ahora acepta string\|number\|null. |
| 2 | `019e305e-8f4c-76e7-b380-aa01ac69abe2` | Fix mapa vacío "bórralo" en ProfileActivityCard + RunActivityFeedCard. Si !hasRoute, no renderiza mapContainer (antes: rectángulo gris 140px con icono pin pequeño). |
| 3 | `019e3069-55b5-7e03-978e-e884ebc5eba9` | Botón "Editar perfil" prominente en ProfileHeader (Instagram/Strava-style pill outline naranja). Reusa SettingsScreen editor via `editProfile=true` param navigation. Discoverability 0 → 1 tap. |
| 4 | `019e3070-bda6-796d-bc0d-442c8849f77f` | Foto real del runner en "ACTIVIDAD RECIENTE" — FeedActivityCard ignoraba user_photo aunque RPC `get_feed_with_compatible` lo devuelve. Mismo run con foto en "Amigos" pero SIN foto en "Reciente". Inconsistencia visible. |
| 5 | `bc0b620a-7cd6-408a-bac6-bfc6fcd9b3cc` | RaceCard CTA con gradient pill + copy de urgencia: "Empezar mi plan 10K · Listo el 6 jun · gratis · 3 sem". Antes: texto suelto "Ver plan 10K de Huelva" (pasivo). |
| 6 | RPC migration `feed_with_compatible_exclude_follows` + OTA | Separación de scope: "ACTIVIDAD RECIENTE" → "DESCUBRE RUNNERS" (solo `known + compatible`, excluye `follow`). "ACTIVIDAD DE AMIGOS" sigue siendo chronological de seguidos. Cero solape, founder approved. |
| 7 | `cf...` | Tap en "Siguiendo" abre lista correcta (antes UN solo TouchableOpacity envolvía ambos stats con onPress hardcoded a `seguidores`). Separados en 2 TouchableOpacity con type correcto cada uno. |
| 8 | **`c20bdcd7` (iter#21 final)** | **Tu Progreso + Partner clubs hero + Mapa zoom 25km local** (3 cambios producto nivel Strava/Runna/NRC — ver detalle abajo). |

### Iter#21 — 3 cambios producto validados por founder

Founder pidió análisis honesto comparando con Runna/Strava/NRC. Diagnóstico:
- "92% precisión · 700+ runners · 251 ciudades" en hero matching → números humillantes vs Strava 100M/Runna 1M+
- "1 runners se han unido a quedadas esta semana" (typo + número humillante)
- Ranking de runners → contaminado (60% positions: founder #1, cuenta corporativa #3, partner club #4)
- Mapa default 'all' = España wide con 3 pins → parece país vacío

**Solución aplicada (HTML preview iterado 7/10 → 10/10 antes de aplicar):**

1. **Ranking → Tu Progreso (self-comparison)**:
   - Pattern Apple Fitness rings · Strava PRs · Whoop strain
   - Sparkline 7 días L..D + trend "+X% vs semana pasada"
   - Stats grid: esta sem / sem pasada / sesiones
   - Récords: Mejor 5K extrapolado (run ≥4.95km, pace * 5) + Tirada más larga
   - `loadMyProgress()` agrega runs últimos 60 días, todo cliente-side (0 SQL migration)
   - `renderTuProgreso()` reemplaza `renderRanking()` (legacy queda para rollback)

2. **Hero matching → Partner clubs strip**:
   - Quita "92% · 700+ · 251" + sub copy renovado
   - Añade 4 partner cards (Beer Runners Málaga · Sevilla RC · Soul Run Huelva · Sin Límites TdM)
   - Logos cargados desde `correrjuntos.com/public/quedadas/{slug}/logo.png?v=2`
   - Pattern Stripe/Notion/Linear: logos reales > números abstractos
   - Sin emojis decorativos (founder request: "como Strava/Runna/NRC")

3. **MapScreen default zoom 25km**:
   - `selectedRadius` default: 'all' → 'nearby' (25 km)
   - `filterNearby` default: false → true (alineado)
   - Smart-fallback `useEffect`: si al cargar quedadas + userLocation hay <2 en 25km, expande a 50km, luego 'all'. Flag `smartDefaultApplied` para que no se auto-revierta tras toque manual del user.
   - Pattern Citymapper local-first / Komoot expand-on-empty
   - Comunica "barrio activo" en vez de "país vacío"

### Reglas memorizadas hoy

1. **Source of truth en SQL**: si quieres separar scope (ej: solo `compatible+known`, excluir `follow`), hazlo en la RPC con `WHERE r.user_id NOT IN (followed)`. Cliente NO debe filtrar lo que SQL ya puede excluir → menos payload, single source.

2. **Discoverability matters >>> feature exists**: editor de perfil ya existía pero estaba enterrado (4 taps). Mover a botón visible (1 tap) = mejora UX 4x sin trabajo backend nuevo.

3. **"Esconder números humillantes"** es patrón Wirecutter / Lenny Rachitsky para apps tempranas. Cuando el competidor tiene 100M y tú 612, los números TUYOS comunican vacío. Reemplazar por badges cualitativos o social proof tangible (logos partner clubs reales).

4. **Self-comparison > social ranking** en apps con <10K users. Apple Fitness, Strava PRs, Whoop, Garmin Connect — todos usan TÚ vs TÚ semana pasada como motor de retención. Ranking social requiere masa crítica que CJ no tiene aún.

5. **Smart default con fallback** (Citymapper pattern): tener un default agresivo (25km local) que se auto-expande si la realidad lo desmiente (<2 quedadas). Aplicado UNA VEZ con flag — el user puede sobrescribirlo manualmente sin que se revierta.

6. **Sin emojis decorativos en UI seria** (Strava/Runna/NRC style). Solo SVG inline funcional (chevrons, trends). Los emojis los ven los AIs de Apple/Google y bajan polish score percibido.

### Pipeline reels v4 sigue intacto

Reel `reel-da-el-paso` (sin partners) y `reel-no-corras-solo-v4` (con partner clubs) listos para subir. Pipeline `tools/marketing/REELS_PIPELINE_V4_BRAND_LIVE.md` documentado.

### Iter#22 — 5 fixes adicionales en Profile (cierre del día)

Founder revisó el Profile de su cuenta personal en la tablet del padre y reportó 5 issues funcionales que bajaban la sensación de calidad de 8.5/10 a 7/10. Análisis honesto + fix de todos:

| # | Bug | Fix aplicado |
|---|---|---|
| 1 | Strava conectado pero 0/0/0:00 + "Sin sincronizar" | useEffect auto-refresh al mount si `!lastSyncAt && stats=0`. Botón "Sincronizar" + "Sincronizando…" label. |
| 2 | "Racha actual: 1 semanas" vs "Tu serie: 0 semanas" en misma pantalla | Extraído a `src/utils/streakCalc.ts` — single source of truth `calcWeeklyStreak()`. Ambos componentes importan ahora. |
| 3 | Chart pace con Y invertido (4:57 visible "arriba" como si fuera mejora vs 2:23) | (a) Filter strict pace points: km≥2, sec≥600, pace 3-12 /km. (b) Y axis invertido (subir = más rápido). (c) Color verde si mejorando / naranja si empeorando. |
| 4 | "Próximo: 100 km" con bar pero sin número | "Próximo logro · 52 / 100 km" + bar + "Te faltan 48 km · 52%". |
| 5 | Objetivo sugerido days/km mismatch ("Corre 3 días" header + "19.1/5 km" bar) | Refactor `suggestedGoal` a `{current, meta, unit}`. Goal consistencia → `current=daysThisWeek, meta=3, unit='días'`. Goals km unchanged. |

OTA `fbe68009` publicada al cierre. 0 SQL migration. Cliente only. OTA-safe.

Founder validó en su Android personal: "lo veo bien" ✅. Tablet del padre devuelta — dogfood Android desde cero del founder pospuesto.

### Pendiente próxima sesión

- **Test Android dogfood desde cero** del founder (en su móvil, no la tablet del padre).
- Verificar Apple v1.3.6 status (estaba WAITING_FOR_REVIEW desde 9 may — handle de check-store-status.js .p8 expirado, requiere regenerar key ASC).
- Subir reels a redes (TikTok ES primero, luego IG/YT/LinkedIn).
- KPI tracking de los cambios iter#21 + iter#22 — 30 días para validar.
- Si en próximo dogfood aparece "1 runners se han unido a quedadas esta semana" (banner verde con typo), también esconder hasta >5/semana.

---

## 2026-05-16 (sábado 11:45 AM) — Reel V4 Brand Live Action (Pexels + overlay HTML + app+web reveal)

**Founder validó "esto me gusta, memoriza para hacer Shorts/videos así"** después de pedir refs estilo Veo IA y entender que sin IA generativa la alternativa pro es B-roll Pexels + overlay HTML brand.

### Iteraciones rendered

| Versión | Cambio | Veredicto founder |
|---|---|---|
| v2 | Pexels B-roll + ffmpeg drawtext Arial system | "está bien pero genérico" |
| v3 | Inter font via HTML overlay + cool/warm grades + phone reveal | "necesita brand colors mejor + watermark + logo profesional" |
| v3 (iter) | Cambio group clip (jóvenes → adultos hombre+mujer Pexels 7876926) | "ok pero falta la web" |
| **v4** | + Laptop reveal con correrjuntos.com homepage mockup + closing URL pill | ✅ **"esto me gusta"** |

### Pipeline V4 canónico (documentado en `tools/marketing/REELS_PIPELINE_V4_BRAND_LIVE.md`)

**Arquitectura 2 capas + composite ffmpeg**:
- CAPA 1: Pexels B-roll color-graded (solo cool / group warm) + xfade
- CAPA 2: Overlay HTML transparente con renderAtTime (vignette + tints + 3 headlines + phone reveal + laptop reveal + closing card + watermark)
- Composite via `ffmpeg overlay=0:0:format=auto:eof_action=pass`

**Files canónicos** (clonar para próximos reels):
- `tools/marketing/reel-no-corras-solo-v4-overlay.html` — overlay reusable (clonar)
- `tools/marketing/produce-no-corras-solo-v4.cjs` — producer ffmpeg (clonar)
- `tools/marketing/record-overlay.cjs` — grabador PNG con alpha (NO tocar, reusable)

**Footage canónico**:
- Pexels 19523592 (solo runner sunrise hoodie) — `footage/solo-runner.mp4`
- Pexels 7876926 (adult couple jogging urban) — `footage/group-runners.mp4`

**Output: 13.5s · 1080×1920 · ~14 MB con audio**

### Timeline V4 canónico

```
0.0s   solo (cool grade) + "CORRER SOLO."
4.0s   "Hasta hoy." (orange Inter 600)
5.4s   xfade solo → group (0.6s)
5.5s   📱 Phone reveal (CJ app: map + pins + 12 quedadas)
6.7s   Phone exits
6.8s   💻 Laptop reveal (correrjuntos.com: navbar + hero + phone mini)
8.3s   Laptop exits
8.5s   "ENCUENTRA RUNNERS cerca de ti." (group warm grade)
10.6s  📋 Closing card: eyebrow + logo + tagline "CORRE ACOMPAÑADO" + URL pill 🔒 correrjuntos.com + iOS·Android·gratis
13.5s  end
```

### Lecciones críticas memorizadas

1. **fps + setpts + settb obligatorios antes del xfade**. Si los 2 clips Pexels tienen fps distinto (29.97 vs 25), xfade falla con "First input link timebase do not match". Normalizar con `fps=30,setpts=PTS-STARTPTS,...,settb=AVTB` en AMBOS.

2. **Pexels HD URLs requieren `Referer: https://www.pexels.com/`**. Sin header devuelve 403 Forbidden aunque el patrón URL sea correcto.

3. **Founder rechaza runners que parezcan jóvenes/niños**. Siempre verificar visualmente con Read tool ANTES de bajar HD. Default seguro: hombre+mujer adultos 25-40 corriendo.

4. **Phone reveal con CONTENIDO REAL CJ** (no Lorem ipsum). Header con logo y ciudad, map con pins reales, "12 quedadas" footer. Si es Lorem ipsum la marca no se identifica.

5. **Web reveal con browser chrome OBLIGATORIO** (3 dots Mac + URL bar 🔒 correrjuntos.com). Sin chrome el laptop parece otra "app", no la web. Con chrome se entiende "esto es nuestra web".

6. **Closing URL pill imprescindible**. Es la única forma de que el viewer recuerde el dominio si no descarga la app en el momento. URL pill > logo grande sin URL.

### Próximos reels candidatos V4 (anotados para futuras sesiones)

1. **"Sin plan → con plan adaptativo"** — chico confuso (solo) → plan en app → /planes web → grupo corriendo seguro
2. **"Empieza el sábado"** — runner indeciso (solo) → quedadas app → pillar blog → grupo sábado → CTA
3. **"Coach IA 24/7"** — duda 6am (solo) → chat coach IA → Coach IA web → confianza corriendo → CTA
4. **"Tu primera quedada"** — móvil dudoso (solo) → mapa quedadas → grupos local web → llegando saludos → CTA

Todos siguen el patrón: **problema individual → app → web (legitimidad multi-touchpoint) → solución social → cierre brand**.

### Doc completa

`tools/marketing/REELS_PIPELINE_V4_BRAND_LIVE.md` — pipeline completo con CSS recipes, ffmpeg filters, timeline canónico, reglas inamovibles y workflow 30-40 min de clonado.

---

## 2026-05-16 (sábado 10:35 AM) — Photo carousel TikTok-style + Video carrusel multiplataforma

**Founder validó "esto está muy bien"** tras producir 5 photo composites + video carrusel animado 15s.

### Producido

**5 PNGs (1080×1920) en `tools/marketing/`:**
- `photo-1.png` (0.79 MB) — "No es correr. Es correr **solo**." · fondo friends-urban · pantalla lista quedadas
- `photo-2.png` (0.74 MB) — "Tu plan en **60 segundos**." · fondo morning-dawn · pantalla plan 5K S3/8
- `photo-3.png` (1.21 MB) — "**567** runners en España." · fondo diverse-city · pantalla mapa con 9 pins
- `photo-4.png` (1.07 MB) — "Quedadas **reales** este finde." · fondo finish-arms-up · pantalla quedada TRENDING + avatares stack
- `photo-5.png` (0.98 MB) — "Tu coach. **A las 6 AM**." · fondo solo-runner · pantalla chat Coach Jose

**Video carrusel `reel-photo-carousel`:**
- HTML driven by `window.renderAtTime(ms)` (mismo pipeline que reels existentes)
- 5 fotos × 3000ms slot · 500ms crossfade · Ken Burns scale 1.06 + pan ±10px alternating · progress dots top
- Silent: `reel-photo-carousel.mp4` (6.5 MB · 15s · 30fps · 1080×1920)
- Con audio: `reel-photo-carousel-audio.mp4` (6.8 MB · Bensound Energy a 70% vol)
- Script: `tools/marketing/record-tiktok.cjs reel-photo-carousel`

### Plan de publicación matriz

| Plataforma | Asset | Formato |
|---|---|---|
| TikTok | 5 PNGs sueltas | Photo carousel nativo |
| Instagram Reels | `reel-photo-carousel.mp4` silent | Reel + música IG nativa |
| YouTube Shorts | `reel-photo-carousel-audio.mp4` | Short con audio |
| LinkedIn | `reel-photo-carousel-audio.mp4` | Video post |
| X (Twitter) | `reel-photo-carousel-audio.mp4` | Video post |

### Lección registrada

**Para photo carousel: TikTok prefiere photo post nativo** (algoritmo está empujándolos 2025-2026). Para otras plataformas (Reels/Shorts/LinkedIn/X) producir video carrusel animado del mismo asset = 1 producción → 5 plataformas.

**Nuevo script reutilizable**: `tools/marketing/render-photo.cjs <basename>` renderiza HTML → PNG 1080×1920. Útil para futuros photo composites estilo carousel.

### Pendiente

Founder hace upload manual a las 5 plataformas (5-15 min). Caption ES first, EN luego.

---

## 2026-05-16 (sábado 07:40 AM) — Dogfood completo + Claude Remote Control setup + Reel sábado

### Lo grande del día (acumulado)
- **20 OTAs LIVE** runtime 1.3.6 (iter#4-19):
  - Onboarding 3 pantallas refactor completo (iter#4-6)
  - Paywall surgical fixes + race context + social proof + hero contextual (iter#7-8bc)
  - Home v3: quedadas dominantes + race card SLIM + "Ver todas" link + Premium mini (iter#8a/17)
  - Mapa segmented tabs Quedadas/Carreras (iter#9)
  - Wizard back nav + skip beginner steps + sin forzar post-signup (iter#10/12/14)
  - Hook screen sin scroll (iter#15)
  - Push banner permanentlyHidden tras grant — fix flicker + scroll (iter#19, hoy)
- **iter#18 reverted** — DB trigger auto-confirm users (founder pidió mantener email confirm normal)
- **`auth/confirmed.html` mejorada** — pasos 1-2-3 manuales + Smart App Banner + webview warning
- **`reel-empieza-sabado.mp4` producido** (3.63 MB · 19.5s) con fotos solo runner → group runners
- **Subido a TikTok + Instagram** (sábado mañana). Pendiente esta noche: `reel-despensa-runner.mp4`

### Bugs encontrados en dogfood + fix
1. Hook screen requiere scroll → iter#15 (map 220→150 + spacing apretado)
2. Wizard 5 pantallas demasiado largo → iter#12 (beginner 2 pantallas)
3. Back nav un-skip step 1 → iter#10
4. Email confirmation "no funciona" → diagnosticado: Gmail link scanner pre-consume tokens. Workaround: auth/confirmed.html con pasos manuales + "Enlace directo" copy fallback
5. Push banner persist + parpadeo + scroll bloqueado → iter#19 (3 bugs = 1 root cause: race condition recalcState)

### 🔗 Claude Code Remote Control setup (NUEVO, validado hoy)
- Founder activó `/remote-control` slash command en Claude Code
- URL sesión: `https://claude.ai/code/session_01K6abFBCNXtgMmnbivwRbWn`
- Móvil: app Claude → tab "Code" abajo → ve sesión disponible
- Setup completo para mañana en el trabajo (founder requiere PC encendido en casa)
- Shortcuts escritorio Windows creados: `Claude Remoto.url` (Chrome Remote Desktop fallback) + `Claude.ai.url`

### Pendiente próxima sesión
- Plan testing end-to-end (signup nuevo → wizard 2 pantallas → primer workout)
- Subir `reel-despensa-runner.mp4` esta noche (slot 19:00)
- Subir `reel-planificar-semana.mp4` mañana domingo 11:00
- Consolidar CLAUDE.md raíz (warning perf: 100.9k chars > 40k)

---

## 2026-05-15 (viernes 10:46 AM — DÍA ÉPICO 4-EN-1) — Afiliados + Bug fix + Reels + YouTube Channel + Brevo schedule

**12 commits, ~30 enlaces afiliados nuevos, 2 reels producidos, canal YouTube de cero a operativo + 4 Shorts programados, campaña Brevo agendada, bug crítico detectado + fixed. Día récord absoluto.**

### 📧 Brevo campaña #14 — programada (sesión mañana temprano)

- **Lista**: 7 lists "Tu primera carpeta" = 257 destinatarios (dedup desde 271)
- **Asunto**: "Tu plan de running para esta semana — gratis"
- **Preheader**: "8 semanas estructuradas. Sin pagar nada."
- **CTA**: "Descargar gratis →" `#FF6B35` → `correrjuntos.com/app/?utm_source=brevo&utm_medium=email&utm_campaign=app-captacion-mayo26`
- **Diseño**: Meridian Motion (dark `#0b1220`, cream text, JetBrains Mono eyebrows)
- **Test verificado** en guetto2012@gmail.com ✓
- **Programación**: **Domingo 17 may 2026 · 20:00 hora Madrid** · Europe/Madrid timezone
- Pulsé yo el "Programar" tras OK explícito del founder
- Math expectativa: 257 → 30% open (77) → 4% click (3) → 5% install (0-1)

### 💰 Afiliados Amazon ES — 12 articles monetizados con Top picks

**4 commits totalizando ~30 enlaces `/dp/ASIN` nuevos con tag `diezmejores21-21`, todas las imágenes self-hosted en `/public/blog-images/{slug}/`.**

#### Commit `e48ff529` — creatina + hierro EN/ES (4 articles)
- `creatina-para-runners` (ES): 1 /s?k= → 4 product cards
- `hierro-para-corredores` (ES): 2 /s?k= → 4 product cards
- `creatine-for-runners` (EN): 0 → 4 product cards
- `iron-for-runners` (EN): 0 → 4 product cards
- **ASINs creatina**: B00T7L20AQ (Optimum), B07TVSKW21 (HSN Creapure), B00CHJ3DW4 (Myprotein), B00SP2ZKW8 (Bulk)
- **ASINs hierro**: B0001OP028 (Solgar Gentle Iron), B002F5EUQ8 (Floradix), B0F3XJYL29 (Vitavea), B00020IBF4 (Solgar Vit C)
- Imágenes en `/public/blog-images/{creatina,hierro}/`

#### Commit `9266f8de` — snacks EN/ES (2 articles)
- `snacks-energeticos-running` (ES): 3 /s?k= → 4 product cards
- `best-energy-snacks-for-runners` (EN): 0 → 4 product cards (este artículo YA EXISTÍA — solo monetizado, no creado)
- **ASINs**: B07Y3YXCVT (Maurten Gel 100 CAF 100), B0BJ2M5J2T (Dátiles Medjool 1kg), B0C74Q93NK (CLIF BAR Peanut Butter), B084J2VBKG (Compressport Race Belt)
- Imágenes en `/public/blog-images/snacks/`

#### Commit `61449e48` — best-foods + best-breakfasts EN/ES (4 articles)
- `best-foods-for-runners` (EN) + `mejores-alimentos-para-runners` (ES): 0 → 4 product cards
- `best-breakfasts-before-running` (EN) + `desayunos-antes-de-correr` (ES): 0 → 4 product cards
- **ASINs foods**: B015Q72O8W (Quaker Oats), B096MM3Y58 (nut&me Almond Butter), B0CNDF4WLB (Amoseeds Chía BIO), B005AW7WD6 (Lindt 85%)
- **ASINs breakfasts**: B015Q72O8W (Quaker, reused), B0BLZN1KGV (HSN Peanut Butter), B0FJLYR89V (Miel Camino de Santiago), B0GXB9L82Q (AZADA Granola)
- Imágenes en `/public/blog-images/{foods,breakfasts}/`

#### Commit `103e01cb` — 🐛 BUG FIX CRÍTICO FAQ accordion

**Root cause**: `blog/enhance.js` línea 180 trata cualquier `<DIV>` después de `<h2 id="faq">` que contenga un `<h3>` como item del acordeón FAQ. Mi bloque "Top picks" insertado DESPUÉS del FAQ con un `<h3>` dentro → quedó atrapado en panel colapsado → DOM tenía los `/dp/ASIN` pero invisible al usuario.

**Fix doble**:
1. Movido Top picks de AFTER del FAQ a **BEFORE primer content H2** (mejor SEO también)
2. Reemplazado `<h3>` interno por `<div>` con estilos (defensa en profundidad)

**Afectados**: `best-foods-for-runners` (EN) + `mejores-alimentos-para-runners` (ES). Otros 6 artículos del día auditados — OK (Top picks antes del FAQ o sin sección FAQ).

### ⚠️ REGLA CRÍTICA aprendida (memorizar para todos los futuros artículos afiliados)

**NUNCA insertar bloques con `<h3>` después de `<h2 id="faq">` en ningún article del blog.** `enhance.js` walker los engulle al acordeón. Patrón seguro:
- ✅ Insertar Top picks **antes del primer content H2** (mejor SEO + 0 riesgo de walker)
- ✅ Si va al final, usar `<div>` o `<p strong>` en vez de `<h3>` para títulos internos
- ✅ Añadir `class="top-picks"` al wrapper para auditoría rápida

Esto debería ir al CLAUDE.md sección 12 "Imágenes Amazon — protocolo" como punto 13.

### 🎬 Reels nuevos producidos (kinetic typography pipeline)

#### `reel-despensa-runner.mp4` (commit `03e1cf0e`) — 2.64 MB · 19.5s
- 6 escenas: Hook "La nutrición no es magia. Es despensa" → Lista 5 básicos (Avena/Almendras/Chía/Chocolate 85%/Plátanos) → Feature 37 raciones · 15€ → Stats 80%/5/~40€/0 → Quote "4 desayunos cubren la semana" → CTA correrjuntos.com/blog
- Reemplaza el carrusel manual de Canva del Sáb 19:00 → más alcance (IG Reels + TikTok + YouTube Shorts vs solo IG Feed)
- Files: `reel-despensa-runner.html` + `preview-reel-despensa.cjs` + `.mp4`

#### `reel-planificar-semana.mp4` (commit `a60c27e6`) — 2.66 MB · 19.5s
- 6 escenas: Hook "Tu semana se gana el VIERNES, no el lunes" → Problem "Abres plan lunes 7am ya improvisas" → 5 reglas list → Compare 80% calendar vs 30% list → Quote "Tu plan no se ejecuta. Se diseña" → CTA correrjuntos.com/app
- Companion del X thread Domingo 11:00
- Subido como primer Short del finde (Vie 18:00) — meta-joke: el reel dice "tu semana se gana el viernes" y se publica un viernes

### 📄 Weekend publishing checklist (commit `e4f0594a`)

- `tools/marketing/weekend-publishing-checklist.md` (443 líneas, single source of truth)
- Plan finde: 4 reels TT/IG + 1 X thread distribuidos Vie 18:00 → Dom 19:00
- Sección por post con: paths archivos, captions IG + TT, hashtags, primer comentario fijado, rotación link en bio (3 cambios el finde)
- Monitoring lunes 18: thresholds éxito + KPIs

### 🚫 Rechazado: Buffer API agent (procrastinación productiva)

Founder propuso construir Node script para auto-publicar todo via Buffer API. Yo lo rechacé honestamente:
- Buffer NO soporta TikTok via API (solo desde UI web)
- Buffer NO soporta IG Reels API (sólo "remind me to publish" push)
- X API tier es $200/mes para 3rd parties
- Tiempo dev: 6-7h vs 15-20 min de manual upload
- ROI: -100% (no funciona para TT/IG video)

**Lección**: Próxima vez que aparezca "construyamos automation para X redes", la respuesta correcta antes de empezar es: ¿la API objetivo soporta REALMENTE upload de video para esa red? Si TikTok o IG Reels son target → solo `ayrshare.com` ($25/mes) lo hace bien. Buffer y SocialPilot NO.

### 📊 Metricool explorado (no usado al final)

Sesión tarde verificó Metricool free tier:
- ✅ TikTok + Instagram conectados (4.090 + 769 followers)
- ✅ 20 posts/mes free (suficiente para finde)
- ❌ X / Twitter NO conectado a esta cuenta
- ❌ Para subir video, Metricool usa **File System Access API moderna** que NO expone `<input type="file">` — mi `mcp__Claude_in_Chrome__file_upload` no puede targetearlo
- Conclusión: para Metricool, founder hace upload manual de file (1 click) y yo agilizo el resto (caption, fecha, primer comentario). NO usado al final porque pivot a YouTube + upload manual TT/IG.

### 🎥 YouTube Channel — configurado + 4 Shorts programados (sesión 10:00-10:46 AM)

#### Canal `youtube.com/@CorrerJuntos` LIVE

**Estado al empezar**: handle + avatar OK · banner + descripción + links + email + watermark VACÍOS · 0 vídeos.

**Configurado en ~40 min**:
- **Banner 2048×1152**: kinetic typography mismo style que reels · paleta ink/paper/ember · pills "PLAN 0→5K · GRATIS / SIN POLVOS · SIN HUMO / iOS · ANDROID"
- **Descripción 759 chars** ES con SEO + hashtags + email contacto
- **5 enlaces externos**: Web · Instagram · TikTok · App Store · Google Play
- **Email**: hola@correrjuntos.com
- **Watermark 152×152**: logo CJ orbe · default "Final del vídeo" en reproductor
- Files generados: `tools/marketing/youtube-banner.html` + `record-banner.cjs` + `youtube-banner.png` (526 KB) + `youtube-watermark.png`

#### 4 Shorts programados con horario IDÉNTICO al calendar TT/IG

| # | Reel local | YouTube URL | Programa |
|---|---|---|---|
| 1 | `reel-planificar-semana.mp4` | `youtube.com/shorts/zDuwvLdk-sc` | **Vie 15 may · 18:00** |
| 2 | `reel-recuperacion-ultra.mp4` | `youtube.com/shorts/2DVSuj2nozQ` | **Sáb 16 may · 11:00** |
| 3 | `reel-despensa-runner.mp4` | `youtube.com/shorts/U3XLQteTXJM` | **Sáb 16 may · 19:00** |
| 4 | `reel-0-a-5k.mp4` | `youtube.com/shorts/L2JrqnPfFxo` | **Dom 17 may · 19:00** |

**Cada Short con**:
- Title SEO-friendly (≤60 chars)
- Description 1.000+ chars con CTA + hashtags + email contacto + link to specific page
- Audiencia: "No, no creado para niños"
- Categoría: Gente y blogs
- Comprobaciones derechos autor: passed
- Visibilidad: Programado público con fecha/hora

#### 🛠️ Técnica Chrome MCP usada — `<input type="file">` interception

**Patch JS** (aplicado al inicio de cada upload session):
```js
const orig = HTMLInputElement.prototype.click;
HTMLInputElement.prototype.click = function() {
  if (this.type === 'file') {
    this.setAttribute('data-claude-intercepted', '1');
    return; // intercepta sin abrir dialog nativo
  }
  return orig.apply(this, arguments);
};
```

Esto permite que cuando YouTube/Metricool crea el `<input type="file">` dinámicamente y llama `.click()`, el input queda en DOM sin abrir dialog nativo. Después usamos `mcp__Claude_in_Chrome__file_upload` con el ref del input.

**Funcionó en YouTube** (input expuesto como `<input id="file-selector" type="file" accept="image/*">` para banner/watermark; `<input name="Filedata" type="file">` para vídeos).
**NO funcionó en Metricool** (usa File System Access API moderna, no crea `<input type="file">` en DOM).

#### 🚨 Lección crítica: Date picker YouTube + auto-scroll

Al programar fechas en el wizard YouTube, el input de fecha es un text input editable. **Más fiable que clickear pixels del calendar popup**:
```
1. triple_click sobre el text input "15 may 2026"
2. type "15 may 2026"
3. press Enter
```
Esto cierra el calendar popup y aplica la fecha sin problemas de coords.

Para la hora:
```
1. left_click sobre input "0:00"
2. ctrl+a
3. type "18:00"
4. press Tab → cierra dropdown sugerencias, aplica valor
```

### 📊 Estado final del finde 15-17 mayo 2026 (al cierre de esta sesión 10:46)

| Plataforma | Estado |
|---|---|
| **YouTube Shorts** (4) | ✅ Programados automáticamente (sin intervención founder en finde) |
| **Brevo email blast** | ✅ Programado Dom 17 may 20:00 (257 destinatarios) |
| **TikTok** (4 reels) | ⏳ Pendiente upload manual founder (usar `weekend-publishing-checklist.md`) |
| **Instagram Reels** (4 reels) | ⏳ Pendiente upload manual founder |
| **X thread** (7 tweets Dom 11:00) | ⏳ Pendiente copy-paste manual founder |
| **X cortos** entre threads (3) | ⏳ Pendiente manual |

### 📦 Total commits del día (12)

1. `e48ff529` — creatina + hierro EN/ES afiliados (4 articles)
2. `9266f8de` — snacks EN/ES afiliados (2 articles)
3. `61449e48` — best-foods + best-breakfasts EN/ES afiliados (4 articles)
4. `103e01cb` — fix bug FAQ accordion (2 articles afectados)
5. `03e1cf0e` — reel-despensa-runner producido
6. `a60c27e6` — reel-planificar-semana producido
7. `e4f0594a` — weekend-publishing-checklist.md

(El resto son parte del trabajo de YouTube + Metricool exploration sin commit nuevo al repo principal — todo el trabajo YT está en YouTube Studio directo.)

### 🏆 Insights estratégicos

1. **Doble-rendimiento de reels**: producir 2 reels nuevos hoy → 5 plataformas usándolos (TikTok + IG Reels + YouTube Shorts + posibles cross-post)
2. **Buffer rejection**: ahorrados 6-7h dev evitando proyecto que NO funciona
3. **Bug FAQ accordion**: detectado por feedback honesto del founder ("DOM no tiene /dp/") — sin eso, hubiera quedado oculto en producción afectando ROI afiliado a largo plazo
4. **YouTube como asset permanente**: 4 Shorts en canal vacío = primer contenido define al algoritmo. Calidad alta (kinetic typography) + descripción rica = recommender YT bien orientado desde día 1
5. **Cross-platform horario IDÉNTICO**: TT/IG/YT a la misma hora = coherencia narrativa para audiencia que sigue múltiples cuentas + algoritmo premia regularidad

### 💸 Estado financiero esperado próximos 30-45 días (proyección)

- Amazon afiliados: bump esperado de 25,11€/mes (cierre 11 may) → 35-50€/mes (cuando los 12 articles indexen)
- App installs: 1-3 nuevos del finde (TikTok + IG + YouTube + Brevo blast combinado)
- Suscripciones Recovery Ultra: 5-10 nuevos del finde si todos los canales convierten

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
