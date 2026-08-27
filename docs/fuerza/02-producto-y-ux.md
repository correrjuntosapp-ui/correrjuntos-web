# Fases 2 y 3 · Producto y UX — Módulo Fuerza

> Diseño. **No implementado.** Detrás de feature flag `strength_module_v1`,
> cerrada hasta terminar la medición de F141 y D+1 y recibir autorización expresa.

⚠️ **Limitación de esta ronda**: el submódulo `correr-juntos-app` no está disponible
en este entorno (no hay mapeo en `.gitmodules`), así que **no he podido leer los
componentes, tipografías ni espaciados reales**. Todo lo que sigue está escrito para
*reutilizar* lo existente, pero los nombres de componentes concretos son
**supuestos a validar** contra el código antes de implementar. Los colores proceden
de `CLAUDE.md` (naranja `#FF6B00`, negro `#111111`, blanco `#FFFFFF`, gris `#888888`,
modo claro por defecto).

---

## 1. Los dos modos

### A · Fuerza para correr *(por defecto)*

| | |
|---|---|
| A quién sirve | El corredor con un plan de carrera activo que nunca ha entrenado fuerza o lo hace de forma irregular |
| Contenido | Tren inferior, gemelo/sóleo, cadera, glúteo y core. Tren superior mínimo (solo lo que sostiene la postura) |
| Frecuencia | 1–2 sesiones por semana |
| Duración | 20–30 min |
| Prioridad | **La carrera manda siempre.** La fuerza se coloca donde no estorbe |
| Progresión | Conservadora. Antes reps y control que carga |
| Framing | "Fuerza para correr mejor" |

### B · Atleta híbrido

| | |
|---|---|
| A quién sirve | Quien ya entrena fuerza y quiere que conviva con correr sin que una cosa arruine la otra |
| Contenido | Cuerpo completo equilibrado: empuje, tracción, bisagra, sentadilla, core, transporte |
| Frecuencia | 2–3 sesiones por semana |
| Duración | 30–45 min |
| Prioridad | **Convivencia negociada.** La carrera sigue mandando en semana de competición; fuera de ella, la fuerza puede sostener carga |
| Progresión | Mayor peso a la progresión de cargas |
| Framing | "Atleta híbrido" — **solo si la v1 tracciona** (decisión ya tomada en `CLAUDE.md`) |

**Regla común e inamovible:** ni el modo A ni el modo B colocan fuerza exigente de
piernas en las 24 h previas a series, tempo, tirada larga o competición.

---

## 2. Qué se pregunta al activar (máximo 2 pantallas)

No hay onboarding largo. Se pregunta lo mínimo para generar algo sensato y **el resto
se aprende del uso**.

### Pantalla 1 · «¿Para qué?» (4 toques)

| Campo | Opciones | Por defecto |
|---|---|---|
| Objetivo | Correr mejor · Fuerza completa | Correr mejor |
| Experiencia | Nunca · Algo · Con soltura | Algo |
| Material | Sin material · Bandas · Mancuernas · Gimnasio *(multiselección)* | Sin material |
| Tiempo por sesión | 20 · 30 · 45 min | 20 min (A) / 30 min (B) |

### Pantalla 2 · «¿Cuándo?» (2 toques + confirmación)

| Campo | Opciones | Por defecto |
|---|---|---|
| Frecuencia | 1 · 2 sesiones/semana | 1 |
| Días disponibles | Chips L–D, multiselección | Los que ya están libres en el plan de running |
| Unidades | kg · lb | Hereda el perfil |

Al confirmar, la aplicación **muestra ya la colocación propuesta con su motivo** antes
de crear nada:

> «Te ponemos la fuerza el **martes**. El miércoles tienes series y el domingo la
> tirada larga: el martes es el único día que no interfiere.»
> `[Me vale]` · `[Elegir otro día]`

Esa pantalla de confirmación **es el producto**. Es el momento en el que el usuario ve
que esto no es una app de gimnasio pegada con cinta adhesiva.

### Progresivo, no de golpe
- Lo que **no** se pregunta al inicio: peso corporal, lesiones, historial de cargas,
  1RM, preferencias por ejercicio.
- Se aprende de: series completadas, RPE registrado, sustituciones repetidas y
  omisiones. Cada dato se pide **en el momento en que hace falta**, nunca antes.

---

## 3. Flujo completo de usuario

```
INICIO ("Hoy")
  └─ tarjeta "Fuerza para correr · 20 min"  ← punto de entrada principal
       ├─ [Empezar] ──────────────► ENTRENAMIENTO ACTIVO
       ├─ [Ver sesión]  ─────────► detalle (lista de ejercicios, sustituir, mover)
       └─ [Hoy no] ──────────────► motivo (sin tiempo / cansado / sin material / molestia)
                                     └─ recolocación con motivo visible

PLANES
  └─ semana del plan de carrera, con la sesión de fuerza EN LA MISMA rejilla
       (no en una lista aparte) + aviso de colisión si el usuario mueve algo

ENTRENAMIENTO ACTIVO
  └─ ejercicio 1..N → series → autoguardado por serie → descanso → siguiente
       ├─ sustituir ejercicio (motivo: material / molestia / no me gusta)
       ├─ saltar ejercicio (motivo obligatorio)
       └─ salir → confirmación segura ("guardamos lo hecho, puedes retomarla")

RESUMEN
  └─ duración · series · reps · grupos musculares · récords · cumplimiento
       └─ "Próxima: jueves" + [Ver en Actividades]

ACTIVIDADES
  └─ la sesión de fuerza aparece como una actividad más, junto a las carreras
```

**Puntos de entrada (los tres acordados, sin sexta pestaña):**
1. **Inicio** — la tarjeta del día. Es la entrada del 90% de las sesiones.
2. **Planes** — la fuerza dentro de la semana del plan, no en una pestaña propia.
3. **Actividades** — historial, récords y registro manual de una sesión libre.

---

## 4. Especificación de las cuatro pantallas

Los mockups navegables están en `docs/fuerza/mockups/index.html` (ES y EN, modo claro
y oscuro, tamaño pequeño y fuente grande). Aquí queda la especificación textual, que
es la que manda si algo no coincide.

### 4.1 Configuración de fuerza

- Cabecera reutilizada de la app. Sin pestaña nueva.
- Dos pasos con indicador `1 de 2` / `2 de 2`.
- Cada opción es un chip o tarjeta pulsable de altura ≥ 48 dp (objetivo táctil).
- Botón primario naranja `#FF6B00`, secundario texto.
- **Cierre con la colocación propuesta y su motivo** (ver arriba).
- Estado de error: sin plan de running activo → se ofrece igualmente, con el texto
  «Sin plan de carrera activo colocamos la fuerza en los días que elijas».

### 4.2 Tarjeta de fuerza dentro de «Hoy»

Estados que debe cubrir:

| Estado | Contenido |
|---|---|
| Programada hoy | Título, modo, duración, material, `[Empezar]` + `[Hoy no]` |
| En curso (retomable) | «Llevas 3 de 6 ejercicios» + `[Retomar]` |
| Completada hoy | Marca de completada, resumen en una línea, sin acción principal |
| Movida por colisión | **Motivo visible**: «Movida al miércoles para proteger la tirada larga» |
| No programada | La tarjeta **no se muestra**. Nunca ocupar «Hoy» con algo que no toca |

Peso visual: **por debajo** de la sesión de carrera del día. La carrera es lo primero
que ve el usuario, siempre.

### 4.3 Entrenamiento activo

Es la pantalla que decide si el módulo se usa o se abandona.

```
┌─────────────────────────────────────┐
│ ← Fuerza para correr    Ejercicio 3/6│
│ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░  50%   │
├─────────────────────────────────────┤
│  [ demostración / marcador de vídeo ]│
│  Peso muerto rumano · mancuernas     │
├─────────────────────────────────────┤
│ · Cadera atrás, espalda larga        │
│ · Baja hasta notar el isquio, no más │
│ · Sube apretando el glúteo           │
├─────────────────────────────────────┤
│ SERIE │ ANTERIOR │  KG  │ REPS │ RPE │ ✓ │
│   1   │ 12×8 RPE7│  12  │  8   │  7  │ ✓ │
│   2   │ 12×8     │  12  │  8   │  –  │ ✓ │
│   3   │ 12×8     │  14  │      │     │ ○ │
├─────────────────────────────────────┤
│        ⏱  Descanso  0:47             │
│     [ +15s ]   [ Saltar descanso ]   │
├─────────────────────────────────────┤
│ [ Sustituir ]  [ Saltar ejercicio ]  │
└─────────────────────────────────────┘
```

Requisitos funcionales:
- **«Ejercicio X de Y»** siempre visible.
- **Columna ANTERIOR** con lo hecho la última vez (patrón Hevy). Es lo que convierte
  el registro en progresión sin pedirle nada al usuario.
- **RPE opcional**, nunca bloquea el guardado. Con ayuda contextual: «RPE 8 ≈ te
  quedaban 2 repeticiones».
- **Temporizador de descanso** automático al marcar la serie; configurable por
  ejercicio; `+15 s` y `Saltar`.
- **Sustituir ejercicio** → lista corta de sustituciones compatibles de la misma
  familia, filtradas por material declarado. Motivo: material / molestia / preferencia.
- **Saltar ejercicio** → **motivo obligatorio** (alimenta la progresión y las métricas).
- **Autoguardado por serie**, no al final. Nunca perder una sesión.
- **Estado sin conexión**: banda discreta «Sin conexión · se guardará al volver».
  La sesión funciona **completa** sin red. Nada se bloquea.
- **Salida segura**: al pulsar atrás, hoja de confirmación con tres salidas —
  `Seguir`, `Guardar y salir`, `Descartar sesión` (esta última con confirmación
  adicional).

### 4.4 Resumen e historial

Resumen al terminar:

| Bloque | Contenido | Condición |
|---|---|---|
| Duración | Tiempo real de sesión | Siempre |
| Series y repeticiones | Totales completados vs. previstos | Siempre |
| Volumen externo | Σ (peso × reps) | **Solo** si todos los ejercicios con carga tienen peso registrado. Si hay peso corporal sin lastre, se muestra «no calculable» en vez de un total engañoso |
| Grupos musculares | Chips de los trabajados | Siempre |
| Récords | «Nuevo récord: peso muerto rumano 14 kg × 8» | Si los hay |
| Cumplimiento | «6 de 6 ejercicios · 1 sustituido» | Siempre |
| Próxima sesión | Día y motivo de la colocación | Si hay plan |
| **Calorías** | Valor + fuente («Apple Salud», «Garmin»…) | **Solo con fuente autorizada.** Sin ella: «Calorías no disponibles» — sin estimación propia, sin número gris, sin asterisco |

Historial (en Actividades):
- Lista unificada con las carreras. La fuerza es una actividad más.
- Por ejercicio: evolución de carga y reps, y récords.
- Edición posterior de una sesión ya guardada (corregir un peso mal metido).

---

## 5. Accesibilidad y comprobaciones obligatorias

| Comprobación | Criterio |
|---|---|
| Objetivo táctil | ≥ 48 dp en toda casilla de la tabla de series |
| Contraste | ≥ 4.5:1 en texto; el naranja `#FF6B00` **no** se usa como único portador de significado |
| Fuente grande | La tabla de series debe seguir siendo usable al 200%: la columna ANTERIOR se colapsa antes que las columnas editables |
| Pantalla pequeña | Referencia 360×640 dp: la tabla no debe requerir desplazamiento horizontal |
| Modo claro/oscuro | Claro por defecto (norma del proyecto). Oscuro soportado — es la pantalla que más se usa en gimnasios con poca luz |
| Lectores de pantalla | Cada casilla anunciada como «Serie 3, peso, 14 kilos»; el temporizador anuncia el final, no solo lo pinta |
| Sin conexión | Ningún estado de la sesión activa depende de la red |
| Navegación | **No se toca.** Sin sexta pestaña, sin reordenar las cinco existentes |

---

## 6. Mapeo a componentes reales *(añadido en la revisión 0.1 — con el código delante)*

Auditado sobre `correr-juntos-app@cf7b63db`. La advertencia del principio de este
documento («no he podido leer los componentes») **queda superada**: ya se han leído.

### 6.1 Tokens reales — corrigen lo que había supuesto

| Token | Valor real | Dónde | Lo que yo había supuesto |
|---|---|---|---|
| Acento | **`#f97316`** | `StrengthSessionDetailScreen.tsx:31` | ❌ `#FF6B00` |
| Fondo | **`#111111`** | `:29` | ❌ Blanco (modo claro) |
| Tarjeta | **`#1C1C1E`** | `:30` | ❌ `#FFFFFF` |
| Texto principal | `#FFFFFF` | `:32` | ❌ `#111111` |
| Texto atenuado | **`#8E8E93`** | `:33` | ❌ `#888888` |
| Escalado tipográfico | **`ms(size)`** | `src/utils/scale.ts:62` | ❌ px fijos |

**El módulo de fuerza real se pinta en oscuro**, no en claro. La norma «modo claro
siempre por defecto» de `CLAUDE.md` **no se cumple en este módulo**. No lo cambio por
mi cuenta: es una inconsistencia a decidir por el founder.

### 6.2 Qué se reutiliza y qué es nuevo

| Zona de la pantalla | Componente existente a reutilizar | ¿Nuevo? |
|---|---|---|
| Configuración (pantallas 1–2) | **`StrengthOnboardingScreen.tsx`** (623 líneas) — ya existe | ♻️ Reutilizar |
| Tarjeta en «Hoy» | **`StrengthHomeCard.tsx`** (309) — ya montada en `FeedScreen:100` | ♻️ Reutilizar |
| Próxima sesión | `NextStrengthCard.tsx` (103) | ♻️ Reutilizar |
| Tira semanal running+fuerza | `HybridWeekStrip.tsx` (172) | ♻️ Reutilizar |
| Lista de sesiones | `StrengthSessionsScreen.tsx` (562) | ♻️ Reutilizar |
| Detalle / entrenamiento | `StrengthSessionDetailScreen.tsx` (510) | ♻️ Base a **extender** |
| Demostración del ejercicio | `ExerciseMedia.tsx` (133) | ♻️ Reutilizar ⚠️ *ver riesgo MuscleWiki* |
| Zona muscular | `MuscleZoneVisual.tsx` (104) | ♻️ Reutilizar |
| Bloque de venta | `StrengthPremiumBlock.tsx` (115), ya en `PaywallScreen:1378` | ♻️ Reutilizar |
| Tema | `src/context/ThemeContext.tsx` | ♻️ Reutilizar |
| Escalado de fuente | `ms()` de `src/utils/scale.ts` | ♻️ Reutilizar |
| Persistencia local | `@react-native-async-storage/async-storage` + `strengthWeekCache.ts` | ♻️ Reutilizar |
| Temporizador / pantalla activa | `expo-keep-awake` (ya en el binario) | ♻️ Reutilizar |
| Notificación de descanso | `expo-notifications` (ya en el binario) | ♻️ Reutilizar |
| **Tabla ANTERIOR/KG/REPS/RPE/✓** | — | 🆕 **NUEVO** |
| **Autoguardado por serie + recuperación** | — | 🆕 **NUEVO** |
| **Cola de escritura offline** | — | 🆕 **NUEVO** |
| **Sustitución de ejercicio en sesión** | — | 🆕 **NUEVO** |
| **Récords personales** | — | 🆕 **NUEVO** |
| **Historial de fuerza en Actividades** | — | 🆕 **NUEVO** (`ActivitiesScreen` no referencia fuerza) |
| **Resumen post-sesión** | — | 🆕 **NUEVO** |

**Cinco piezas nuevas, todas dentro de la sesión activa y su historial.** Todo lo demás
ya existe. Las cuatro pantallas del diseño siguen siendo las correctas; tres de ellas
ya están construidas y solo la tercera —el entrenamiento activo— necesita trabajo real.

### 6.3 Requisito no negociable de QA

El módulo tiene suite propia: **`scripts/strength-module-harness.cjs`** (1.060 líneas).
Cualquier cambio debe pasarla. **El proyecto no usa jest y no hay que introducirlo** —
el propio harness lo dice: añadirlo cambiaría `package.json` y el lockfile.
