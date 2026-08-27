# Fase 0.1 · Auditoría de la app real (read-only) y reconciliación

> **Ronda 0.1 · 27 ago 2026.** Auditoría estrictamente de solo lectura. **No se ha
> modificado ningún archivo de la app.**

---

## 0. HALLAZGO PRINCIPAL — lee esto antes que nada

**El módulo de fuerza ya existe, está construido y está en producción.**

No es un diseño pendiente de implementar. Son **4.627 líneas de código vivo**, con
motor propio en una Edge Function de Supabase, 30 ejercicios maestros, 75 variantes,
9 sesiones precargadas, analítica completa de 18 eventos, entrada desde Inicio, bloque
de venta en el paywall e internacionalización ES/EN. **Sin feature flag.**

Esto invalida la premisa sobre la que se escribieron la Fase 0 y el encargo de la
Fase 0.1 («diseñar ahora, no publicar todavía», «detrás de una flag cerrada hasta
medir F141 y D+1»). La flag no existe y el módulo no está esperando: está publicado.

**La Fase 0 se diseñó a ciegas** porque el submódulo no era accesible en la ronda
anterior. Buena parte de lo que propuse ya está resuelto en el código, de otra manera.
Y lo que de verdad falta no es lo que yo había priorizado.

---

## 1. Procedencia — qué estoy auditando exactamente

| Elemento | Valor | Cómo se ha obtenido |
|---|---|---|
| Repositorio | `correrjuntosapp-ui/correr-juntos-app` (privado) | Añadido a la sesión y clonado en `/home/user/correr-juntos-app` |
| `origin/master` actual | **`cf7b63db`** — «feat(feed): activacion del primer entrenamiento donde el hero no llega», 24 ago 2026 | `git ls-remote origin refs/heads/master` |
| HEAD del checkout | `cf7b63db` — **idéntico a origin/master** | `git rev-parse HEAD` |
| Estado del árbol | **Limpio**, 0 cambios | `git status --porcelain` |
| Profundidad | Clon shallow (`--depth 1`) | Historia no disponible; ver §1.1 |
| Gitlink en `correrjuntos-web/master` | **`d6a7acfa`** ≠ `cf7b63db` | `git ls-tree HEAD correr-juntos-app` |
| Versión declarada | **v1.3.25 · build 110 · versionCode 110** | `app.json` |
| `runtimeVersion` | `{ policy: "appVersion" }` → runtime **1.3.25** | `app.json` |

**El checkout NO está sucio ni es antiguo**: coincide exactamente con `origin/master`.

### 1.1 Diferencias detectadas — tres desfases reales

| # | Desfase | Detalle | Consecuencia |
|---|---|---|---|
| **DF1** | **El submódulo del repo web va por detrás** | `correrjuntos-web/master` fija la app en `d6a7acfa`; el master real de la app es `cf7b63db` | El repo web referencia una versión anterior. **No es un problema para esta ronda** (he auditado el master real), pero conviene actualizar el gitlink cuando toque |
| **DF2** | **`CLAUDE.md` del repo web está desactualizado** | Dice «App publicada v1.3.6 (build 84)». La realidad es **v1.3.25 (build 110)** | 19 versiones de desfase. La memoria del proyecto no refleja el estado real. **No lo he corregido**: solo estaba autorizada la línea de calorías |
| **DF3** | **`CLAUDE.md` de la app también está desactualizado** | Su cabecera dice «v1.3.6 (en build 9 may 26)» y «App publicada v1.3.5» | Mismo problema, dentro del repo de la app |

### 1.2 Qué NO he podido demostrar

**Qué commit sirve exactamente a producción.** Puedo demostrar qué hay en
`origin/master` y qué versión declara `app.json`, pero **no** qué build está en las
tiendas ni qué OTA se está sirviendo: eso vive en EAS/Expo, no en el repositorio, y no
tengo acceso desde aquí. Lo trato como **no demostrado**, no como confirmado.

Para cerrarlo haría falta `eas update:list --branch production` y `eas build:list`, que
requieren credenciales de EAS.

---

## 2. El documento original — no está donde se creía

**Ruta indicada**: `C:\Users\guett\...\correr-juntos-app\docs\fuerza-atletas-hibridos-plan-producto-2026-08-26.md`

| Comprobación | Resultado |
|---|---|
| Ruta de Windows accesible desde aquí | ❌ No. Esta sesión corre en un contenedor Linux remoto, no en tu PC. `C:\`, `/mnt/c` y `/c/` no existen |
| ¿Existe `docs/` en el repo de la app? | ❌ **No existe la carpeta `docs/`** en `origin/master` |
| ¿Algún archivo con «fuerza» / «híbrido» / «strength» en el nombre? | Solo código (`src/screens/Strength*.tsx`, etc.). **Ningún `.md`** |
| ¿Está en la historia? | No verificable: clon shallow. Aunque estuviera en un commit anterior, no está en el master actual |

**Conclusión: el documento original nunca se ha commiteado.** Vive solo en tu OneDrive
local. Por eso no aparecía en la Fase 0 ni aparece ahora.

### ⛔ Reconciliación con el documento original: NO COMPLETADA

Tal como pedía la Fase 1, **lo indico y me detengo en ese punto concreto**. No declaro
reconciliación. Para completarla necesito que hagas una de estas dos cosas:

1. **Commitear el documento** en el repo de la app (p. ej. `docs/fuerza-atletas-hibridos-plan-producto-2026-08-26.md`) y decírmelo, o
2. **Pegar su contenido** en el chat.

**Lo que sí he podido hacer, y vale más**: reconciliar la Fase 0 contra el **código
real**, que es una fuente de verdad más dura que cualquier documento.

---

## 3. El módulo de fuerza existente — inventario

### 3.1 Superficie de código

| Archivo | Líneas | Qué es |
|---|---:|---|
| `src/screens/StrengthOnboardingScreen.tsx` | 623 | Configuración del módulo |
| `src/screens/StrengthSessionsScreen.tsx` | 562 | Lista de sesiones |
| `src/screens/StrengthSessionDetailScreen.tsx` | 510 | Detalle de sesión + demostraciones |
| `src/services/strengthEngineService.ts` | 364 | Cliente del motor (Edge Function) |
| `src/components/strength/StrengthHomeCard.tsx` | 309 | **Tarjeta en Inicio** |
| `src/utils/strengthLabels.ts` | 218 | Etiquetas ES/EN |
| `src/components/strength/HybridWeekStrip.tsx` | 172 | Tira semanal running+fuerza |
| `src/utils/strengthOnboarding.ts` | 170 | Estado del onboarding |
| `src/components/strength/ExerciseMedia.tsx` | 133 | Reproductor de GIF |
| `src/components/strength/StrengthPremiumBlock.tsx` | 115 | **Bloque en el paywall** |
| `src/utils/strengthWeek.ts` | 112 | Cálculo de semana |
| `src/components/strength/MuscleZoneVisual.tsx` | 104 | Visual de zona muscular |
| `src/components/strength/NextStrengthCard.tsx` | 103 | Próxima sesión |
| `src/services/strengthWeekCache.ts` | 72 | Caché semanal |
| `scripts/strength-module-harness.cjs` | 1.060 | **Suite de pruebas del módulo** |
| **Total** | **4.627** | |

### 3.2 Cómo está enganchado

```
App.tsx:389-391   tipos de ruta   StrengthSessions · StrengthOnboarding · StrengthSessionDetail
App.tsx:1093-1105 registro real de las tres pantallas en el stack
FeedScreen.tsx:100        importa StrengthHomeCard   ← ENTRADA DESDE INICIO
PaywallScreen.tsx:28,1378 importa StrengthPremiumBlock ← YA SE VENDE
PaywallScreen.tsx:1312    "Strength sessions placed around your key running days"
WorkoutPlayerScreen:265   navega a StrengthSessions
PlanesScreen_legacy:302   navega a StrengthSessions
PlanScreen.tsx:3019       comparte clave local con StrengthSessionsScreen
i18n/locales/es.ts, en.ts textos ES y EN
utils/analytics.ts:248-265  18 eventos de fuerza
```

**Las cinco pestañas reales** (`App.tsx:780-788`): Feed («Inicio»), Planes, Activities
(«Actividades»), Map («Quedadas»), Profile («Perfil»).
✅ **El módulo NO añade una sexta pestaña** — usa rutas de stack. El principio se
cumple, y ya se cumplía antes de que yo lo escribiera.

### 3.3 Qué hace el motor existente

De la cabecera de `strengthEngineService.ts`:

```
Módulo Fuerza client (v1.3.7)
Llama a la Edge Function 'strength-engine' de Supabase
30 ejercicios maestros · 75 variantes casa+gym · 9 sesiones precargadas
GIFs MuscleWiki vía slug

Reglas oro algoritmo:
 - NUNCA fuerza piernas pre-tirada larga
 - NUNCA fuerza pesada post-series duras
 - Core SIEMPRE compatible
 - Compensación post-larga → domingo
```

Y el modelo de datos ya tiene los banderines de compatibilidad por sesión:
`ok_pre_long_run`, `ok_post_long_run`, `ok_post_intervals`, `ok_any_day`,
`difficulty: 1|2|3`, `category`, `duration_min`, `LocationPref`, `Equipment`.

**El módulo existe desde la v1.3.7.** La app va por la 1.3.25.

---

## 4. Supuesto de Fase 0 · Evidencia · Veredicto · Cambio necesario

| # | Supuesto de Fase 0 | Evidencia exacta | Veredicto | Cambio necesario |
|---|---|---|---|---|
| S1 | «El módulo no existe; hay que diseñarlo» | 4.627 líneas en `src/**/strength*` + rutas en `App.tsx:1093-1105` | **REFUTADO** | Reorientar todo: de diseñar a **completar y corregir** lo existente |
| S2 | «Detrás de una feature flag cerrada» | Búsqueda de `featureFlag\|STRENGTH_ENABLED\|isStrengthEnabled` en `src/`: **sin resultados** | **REFUTADO** | O se acepta que está publicado, o se añade la flag ahora (decisión D10) |
| S3 | «Sin sexta pestaña» | `App.tsx:780-788`: 5 `Tab.Screen`. Fuerza va en el stack | **CONFIRMADO** | Ninguno |
| S4 | «Se integra en Inicio, Planes y Actividades» | Inicio ✅ (`FeedScreen:100`), Planes ✅ (`PlanScreen:3019`, `PlanesScreen_legacy:302`). **Actividades: sin referencias** | **PARCIAL** | El historial en Actividades **falta**. Es hueco real |
| S5 | «Hay que diseñar el motor de colisiones R0–R10» | Ya implementado como banderines por sesión: `ok_pre_long_run`, `ok_post_intervals`, `ok_post_long_run`, `ok_any_day` | **REFUTADO (ya existe)** | Mis R0–R10 son más finos, pero **rehacerlos sería tirar trabajo**. Auditar el motor real y extenderlo si hace falta |
| S6 | «Catálogo de 20 familias por crear» | **30 ejercicios maestros + 75 variantes** ya en base de datos | **REFUTADO (ya existe)** | Mi catálogo de 20 es redundante. Sirve como **rejilla de revisión** del existente, no como sustituto |
| S7 | «Registro estilo Hevy: ANTERIOR/KG/REPS/RPE/COMPLETADO» | `StrengthSessionDetailScreen` solo pinta `sets × reps` **prescritos**. Sin `rpe`, sin `weight`, sin `insert`, sin autoguardado, sin récords | **CONFIRMADO COMO HUECO** | **Este es el trabajo real que falta.** Es lo único de mi Fase 0 que sigue siendo válido tal cual |
| S8 | «Calorías exigen binario nuevo» | `package.json`: **ninguna** dependencia de HealthKit / Health Connect / Fit | **CONFIRMADO** | Mantener «Calorías no disponibles». El módulo hoy no muestra ninguna caloría (búsqueda `calor\|kcal\|energy`: sin resultados) ✅ |
| S9 | «Notificación de descanso en segundo plano: ⚠️ podría exigir binario» | `expo-notifications ~0.32.17` **ya está** en `package.json`; en uso en `backgroundLocation.ts:178` | **REFUTADO — es OTA** | La incógnita de Fase 0 queda cerrada: **se puede hacer por OTA** |
| S10 | «Temporizador con pantalla apagada: ⚠️ podría exigir binario» | `expo-keep-awake ~15.0.8` **ya está**; en uso en `RunTrackerScreen.tsx:867` | **REFUTADO — es OTA** | Idem. Cerrada |
| S11 | «Persistencia offline por diseñar» | `@react-native-async-storage/async-storage ^2.2.0` + `strengthWeekCache.ts` ya cachea la semana | **PARCIAL** | La infraestructura existe. **Falta la cola de escritura** de series realizadas |
| S12 | «Tema claro/oscuro» | `src/context/ThemeContext.tsx` existe | **CONFIRMADO** | Los mockups deben usar sus tokens, no los míos inventados |
| S13 | «Hay que diseñar la analítica del módulo» | `analytics.ts:248-265`: 18 eventos ya definidos, incluidos `strength_paywall_viewed` y `strength_trial_started` | **REFUTADO (ya existe)** | Mis eventos se solapan. **Alinearse con la nomenclatura existente**, no crear otra |
| S14 | «F141 es una métrica externa al código» | `utils/firstWorkoutActivation.ts`, `components/feed/FirstWorkoutActivationCard.tsx`, `analytics.ts:203` — F141 es **código vivo**, del 24 ago 2026 | **REFUTADO** | F141 no es solo una medición: es una tarjeta en Inicio. **La tarjeta de fuerza compite por el mismo espacio** ← conflicto real, ver §5 |
| S15 | «Sin pruebas del módulo» | `scripts/strength-module-harness.cjs`, 1.060 líneas, patrón del `paywall-funnel-harness` | **REFUTADO** | Cualquier cambio debe pasar por ese harness. **No hay jest**: no introducirlo |

---

## 5. Riesgos detectados que NO estaban en el radar

### 🔴 R1 · GIFs de MuscleWiki hotlinkeados — riesgo de derechos

`strengthEngineService.ts:303-313` compone URLs contra el CDN de MuscleWiki a partir de
slugs guardados en base de datos (`"musclewiki:bodyweight-squat-front"`).

Esto choca frontalmente con la restricción que tú mismo fijaste para esta ronda: *«No
utilizar imágenes, vídeos ni textos de otras aplicaciones sin licencia»*. Y técnicamente
es el mismo patrón que ya nos ha mordido en el blog: **hotlink a un CDN de terceros que
puede rotar o bloquear en cualquier momento**, dejando las demostraciones en blanco.

Hay que verificar si existe licencia. Si no la hay, es la partida de contenido más
urgente — y es exactamente la que la Fase 0 estimaba en 600–1.500 € de ilustración propia.

### 🟠 R2 · La tarjeta de fuerza compite con F141 en Inicio

`FeedScreen` monta **a la vez** `FirstWorkoutActivationCard` (F141, la activación del
primer entrenamiento, del 24 ago) y `StrengthHomeCard`. El comentario de
`FeedScreen:3116` ya trata `StrengthHomeCard` como uno de los bloques que compiten por
el espacio.

**Es exactamente el riesgo que motivaba el gate**: la fuerza contaminando el embudo de
activación. Solo que no es un riesgo futuro — está ocurriendo ahora. Merece medición
específica antes que cualquier función nueva.

### 🟠 R3 · Sin feature flag no hay reversibilidad

Todo el plan de piloto de la Fase 0 (10–15 usuarios, rollback cerrando la flag) es
inaplicable: no hay flag. Hoy el rollback sería una OTA de retirada, que afecta a todos.

### 🟡 R4 · Memoria del proyecto desfasada en 19 versiones

`CLAUDE.md` (web y app) declara v1.3.6/v1.3.5 cuando la app va por **v1.3.25**. Cualquier
agente que lea la memoria trabajará sobre una foto de mayo. Es cómo se llegó a diseñar
una Fase 0 entera sin saber que el módulo existía.

---

## 6. OTA vs binario — tabla revisada con evidencia

| Capacidad | Veredicto Fase 0 | **Veredicto real** | Evidencia |
|---|---|---|---|
| Pantallas y tarjetas | OTA | ✅ **OTA** | Ya existen |
| Motor de colocación | OTA | ✅ **OTA + Edge Function** | `strength-engine` es servidor: cambia sin tocar el cliente |
| Registro de series (ANTERIOR/KG/REPS/RPE) | OTA | ✅ **OTA** | Solo UI + escritura; sin dependencia nativa nueva |
| Autoguardado y cola offline | OTA «si el almacén está» | ✅ **OTA** | `async-storage ^2.2.0` presente |
| Temporizador de descanso | OTA | ✅ **OTA** | `setInterval` + `expo-keep-awake` presente |
| **Notificación al acabar el descanso** | ⚠️ **incógnita** | ✅ **OTA** | `expo-notifications ~0.32.17` presente y en uso |
| **Temporizador con pantalla apagada** | ⚠️ **incógnita** | ✅ **OTA** | `expo-keep-awake` presente y en uso |
| Calorías desde Apple Health / Health Connect | Binario | 🔴 **Binario** | **Cero** dependencias de salud en `package.json` |
| Escribir el workout en Salud | Binario | 🔴 **Binario** | Idem |

**Resultado: todo lo que falta del módulo es OTA.** Las dos incógnitas de la Fase 0 se
cierran a favor de OTA. Lo único que exige binario es lo que ya habíamos decidido dejar
fuera de v1: las calorías.
