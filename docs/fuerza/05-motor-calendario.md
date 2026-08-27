# Fase 6 · Motor de calendario — tabla de decisión ejecutable

> Determinista, sin aprendizaje automático. Mismas entradas → misma salida, siempre.
> Cada decisión lleva un **motivo legible** que se muestra al usuario.

## 1. Entradas normalizadas

| Entrada | Tipo | Valores |
|---|---|---|
| `running[]` | lista 14 días | `{fecha, tipo, importancia}` |
| `running[].tipo` | enum | `descanso · rodaje · largo · series · tempo · competicion` |
| `running[].importancia` | enum | `clave` (series, tempo, largo, competición) · `normal` (rodaje) · `nula` (descanso) |
| `carrera_objetivo` | fecha \| null | Fecha de la competición objetivo |
| `dias_disponibles[]` | enum[] | Subconjunto de L–D declarado por el usuario |
| `frecuencia` | int | 1 · 2 · 3 |
| `experiencia` | enum | `nunca · algo · soltura` |
| `tipo_fuerza` | enum | `correr` (modo A) · `hibrido` (modo B) |
| `hist_completadas_4s` | int | Sesiones completadas en 4 semanas |
| `hist_omitidas_seguidas` | int | Omisiones consecutivas |
| `rpe_medio_ult_2` | float \| null | RPE medio de las 2 últimas sesiones |
| `material[]` | enum[] | Material declarado |
| `minutos` | int | 20 · 30 · 45 |
| `semana_descarga` | bool | Marcada por el plan de running |

## 2. Salidas

| Salida | Valores |
|---|---|
| `dia` | Fecha concreta \| `ninguno` |
| `tipo_sesion` | `completa · reducida · solo_core_tobillo · ninguna` |
| `duracion_min` | 15 · 20 · 30 · 45 |
| `volumen` | `normal · -1_serie · -2_series · minimo` |
| `motivo` | Texto ES/EN mostrado al usuario |
| `accion_colision` | `ninguna · mover · reducir · cancelar` |

## 3. Reglas, en orden de prioridad

Se evalúan **en este orden**. La primera que aplica gana. No hay empates.

| # | Regla | Condición | Salida |
|---|---|---|---|
| **R0** | Competición inminente | `carrera_objetivo − hoy ≤ 72 h` | `tipo_sesion=ninguna`, `accion=cancelar`. Motivo: «Tienes {carrera} el {día}. Esta semana la fuerza descansa.» |
| **R1** | Veto de víspera | El día candidato `D` tiene en `D+1` una sesión `importancia=clave` **y** la sesión carga piernas `alta` | `accion=mover` al primer día válido. Motivo: «Movida al {día} para proteger {sesión} del {día}.» |
| **R2** | Veto de resaca | `D−1` fue `largo` o `competicion` | `accion=mover`. Motivo: «Ayer hiciste {sesión}. Mejor darle un día.» |
| **R3** | Semana de descarga | `semana_descarga = true` | `tipo_sesion=reducida`, `volumen=-1_serie`. Motivo: «Semana de descarga: mantenemos el hábito, bajamos el volumen.» |
| **R4** | Sin día válido | Ningún día cumple R1+R2 dentro de `dias_disponibles` | `tipo_sesion=solo_core_tobillo`, `duracion=15`. Motivo: «Esta semana no hay hueco sin comprometer tu plan. Te dejamos core y tobillo, que no cargan las piernas.» |
| **R5** | Fatiga acumulada | `rpe_medio_ult_2 ≥ 8.5` | `volumen=-1_serie`. Motivo: «Las dos últimas se te hicieron duras. Bajamos una serie.» |
| **R6** | Abandono en curso | `hist_omitidas_seguidas ≥ 2` | `frecuencia→1`, `duracion→20`, `tipo_sesion=reducida`. Motivo: «Vamos a hacerlo más fácil: una sesión corta esta semana.» |
| **R7** | Principiante | `experiencia=nunca` **y** `hist_completadas_4s < 4` | `frecuencia=1` forzada, `volumen=-1_serie` las 2 primeras semanas, sesión siempre `completa` pero corta. Motivo: «Empezamos con una sesión por semana.» |
| **R8** | Material insuficiente | El material declarado no cubre ≥ 60 % de los ejercicios | Sustituir por variantes del material disponible. Si aun así < 60 %: `tipo_sesion=reducida`. Motivo: «Adaptada al material que tienes.» |
| **R9** | Doble sesión semanal | `frecuencia=2` | Los dos días deben distar **≥ 48 h** y ambos cumplir R1/R2. Si es imposible → `frecuencia=1` esa semana. Motivo: «Esta semana solo cabe una sin apretarte.» |
| **R10** | Caso normal | Ninguna anterior aplica | Primer día de `dias_disponibles` que cumple R1+R2. Motivo: «Te toca el {día}.» |

**Regla de oro del orden**: R0 y R1 son **vetos duros**. Nunca se saltan, ni por
petición del usuario dentro del flujo automático. Si el usuario mueve la sesión a mano
a un día vetado, se le permite (es su cuerpo) pero **se le avisa antes**:
«El jueves tienes series. Esto puede afectarlas. ¿Lo movemos igual?» → `[Sí, muévela]` · `[Mejor no]`.

## 4. Tabla de escenarios — casos obligatorios

Semana de ejemplo (running): L descanso · M rodaje · X **series** · J rodaje · V descanso · S rodaje · D **largo**.
Días disponibles del usuario: L, M, J, V, S.

| # | Escenario | Regla | Día | Tipo | Duración | Volumen | Motivo mostrado |
|---|---|---|---|---|---|---|---|
| 1 | **Series al día siguiente** (candidato M, series X) | R1 | **J** | completa | 20 | normal | «Movida al jueves para proteger tus series del miércoles.» |
| 2 | **Tirada larga al día siguiente** (candidato S, largo D) | R1 | **V** | completa | 20 | normal | «Movida al viernes para proteger tu tirada larga del domingo.» |
| 3 | **Competición en < 72 h** | R0 | — | ninguna | — | — | «Tienes la carrera el sábado. Esta semana la fuerza descansa.» |
| 4 | **Dos sesiones semanales** (`frecuencia=2`) | R9 | **L + J** | completa | 20 | normal | «Lunes y jueves, con 72 h entre medias.» |
| 5 | **Semana de descarga** | R3 | **J** | reducida | 20 | −1 serie | «Semana de descarga: mantenemos el hábito, bajamos el volumen.» |
| 6 | **Usuario que omite** (2 seguidas) | R6 | **J** | reducida | 20 | −1 serie | «Vamos a hacerlo más fácil: una sesión corta esta semana.» |
| 7 | **Principiante** (`nunca`, 0 completadas) | R7 | **J** | completa | 20 | −1 serie | «Empezamos con una sesión por semana.» |
| 8 | **Strava mete un largo no planificado el sábado** | R2 | **J**→ se recalcula; si ya pasó, sesión de la semana siguiente | completa | 20 | normal | «Ayer hiciste 18 km. Mejor darle un día.» |
| 9 | **El usuario cambia sus días a solo X y D** | R4 | — | solo core y tobillo | 15 | mínimo | «Esta semana no hay hueco sin comprometer tu plan. Te dejamos core y tobillo.» |
| 10 | **Se queda sin material** (declaró mancuernas, marca «sin material») | R8 | **J** | completa (adaptada) | 20 | normal | «Adaptada al material que tienes hoy.» |

## 5. Recálculo — cuándo se dispara

| Disparador | Acción |
|---|---|
| Cambio del plan de running (días, generación, pausa) | Recalcular semana actual y siguiente |
| Actividad importada (Strava / manual) de tipo `largo` o `competicion` | Aplicar R2 sobre el día siguiente |
| Sesión de fuerza omitida | Incrementar `hist_omitidas_seguidas`, reevaluar R6 |
| Sesión completada con RPE | Recalcular `rpe_medio_ult_2`, reevaluar R5 |
| Cambio de material o duración en ajustes | Reevaluar R8 |
| Cambio de día por el usuario | Aviso si viola R0/R1; se respeta su decisión |

**Idempotencia**: el recálculo de una semana ya generada **no duplica** sesiones. Se
identifica por `(user_id, semana_iso, indice_en_semana)`; se actualiza la existente.

## 6. Transparencia — cómo se cuenta al usuario

Cada sesión colocada lleva su motivo **visible en la tarjeta**, no escondido en un menú.

- Movida: «Movida al miércoles para proteger tu tirada larga del domingo.»
- Reducida: «Semana de descarga: hoy una serie menos.»
- Cancelada: «Tienes la carrera el sábado. Esta semana la fuerza descansa.»
- Sin hueco: «Esta semana no hay hueco sin comprometer tu plan.»

Ese texto **es la característica**. Es la diferencia entre "una app de gimnasio dentro
de CorrerJuntos" y "el plan de fuerza que sabe qué carrera preparas".
