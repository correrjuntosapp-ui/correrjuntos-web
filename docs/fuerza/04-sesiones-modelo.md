# Fase 5 · Tres sesiones modelo — revisadas por nivel de fatiga

> ⚠️ **BORRADOR FASE 0 — todavía no validado por un profesional deportivo ni autorizado para implementación.**
>
> **Revisión 0.1 (27 ago 2026).** La versión anterior clasificaba las tres sesiones como
> «carga de piernas alta». **Era un error de diseño y el founder lo señaló con razón**:
> si las tres son pesadas, el motor solo puede *mover* la sesión, nunca *elegir otra*, y
> se queda sin salida las semanas cargadas. Rehecho con tres niveles de fatiga distintos.
>
> Alineado con la taxonomía que **ya existe** en `strengthEngineService.ts`:
> `category` (`anti_lesion_piernas`·`core`·`gluteos`·`cuerpo_entero`·`compensacion`·`warm_up`),
> `difficulty` (1=principiante, 2=intermedio, 3=pro) y los banderines
> `ok_pre_long_run` · `ok_post_long_run` · `ok_post_intervals` · `ok_any_day`.
>
> **No se prescriben cargas absolutas.** RPE 7 ≈ quedaban 3 reps; RPE 8 ≈ quedaban 2.

---

## Cuadro comparativo — lo que el motor necesita para elegir

| | **S1 · Sin material 20\'** | **S2 · Mancuernas/bandas 30\'** | **S3 · Gimnasio 40\'** |
|---|---|---|---|
| Objetivo | Técnica, estabilidad y fuerza básica | Fuerza específica para correr | Fuerza completa y progresión |
| Nivel (`difficulty`) | **1 · Principiante** | **2 · Intermedio** | **3 · Pro** |
| Categoría | `anti_lesion_piernas` | `anti_lesion_piernas` | `cuerpo_entero` |
| **Fatiga estimada** | **BAJA** | **MEDIA** | **MEDIA-ALTA** |
| Carga de piernas | **Baja** | **Media** | **Alta** |
| Carga de core | Media | Media | Media |
| Carga de tren superior | Nula | Baja | **Alta** |
| Recuperación prevista | **< 12 h** | **24 h** | **36–48 h** |
| `ok_pre_long_run` | ✅ **sí** | ❌ no | ❌ no |
| `ok_post_intervals` | ✅ **sí** | ❌ no | ❌ no |
| `ok_post_long_run` | ✅ sí | ✅ sí | ❌ no |
| `ok_any_day` | ✅ **sí** | ❌ no | ❌ no |

**La consecuencia de diseño es esta**: S1 es la carta que el motor puede jugar
**cualquier día**, incluso la víspera de las series. Antes no existía esa carta, y por
eso el motor solo sabía mover o cancelar. Ahora puede **degradar**: si no hay hueco
para S2, coloca S1 en vez de dejar la semana a cero.

---

## S1 · Sin material — 20 min · fatiga BAJA

| | |
|---|---|
| Objetivo | Técnica, estabilidad y fuerza básica. Tolerancia de tobillo y cadera |
| Nivel | Principiante |
| Material | Ninguno |
| Fatiga | **Baja** · recuperación < 12 h |

**Diferencia clave con la versión anterior**: fuera la sentadilla dividida cargada (era
lo que la hacía pesada). Entra trabajo de **control, isométricos y recorrido corto**,
que da estímulo sin dejar las piernas tocadas.

**Calentamiento (3 min)**: movilidad de tobillo ×10 por lado · bird dog ×6 por lado · puente de glúteo ×10.

| Orden | Ejercicio | Series | Reps | RPE | Descanso |
|---|---|---|---|---|---|
| 1 | `hip_thrust` Puente de glúteo (suelo) | 2 | 12–15 | **6** | 45 s |
| 2 | `soleus_raise` Sóleo, rodilla flexionada | 2 | 12–15 por pierna | **6–7** | 45 s |
| 3 | `tib_raise` Tibial anterior | 2 | 15–20 | 6 | 30 s |
| 4 | `dead_bug` Dead bug | 2 | 8 por lado | 6 | 30 s |
| 5 | `side_plank` Plancha lateral | 2 | 20–30 s por lado | 6–7 | 30 s |

**Sustituciones**: `hip_thrust`→`bird_dog` · `soleus_raise`→`calf_raise` · `side_plank`→`pallof`.

**Duración estimada**: 18–21 min. **Vuelta a la calma (2 min)**: caminar + respiración.

> ✅ **Compatible con cualquier día**, incluida la víspera de series o de tirada larga.
> Ningún ejercicio supera RPE 7 ni carga excéntrica alta de isquios.

---

## S2 · Mancuernas y bandas — 30 min · fatiga MEDIA

| | |
|---|---|
| Objetivo | Fuerza específica para correr, con carga externa y progresión real |
| Nivel | Intermedio |
| Material | Mancuernas + banda |
| Fatiga | **Media** · recuperación 24 h |

**Calentamiento (4 min)**: sentadilla sin peso ×10 · bisagra sin peso ×10 · banda: remo ×12 · gemelo ×15.

| Orden | Ejercicio | Series | Reps | RPE | Descanso |
|---|---|---|---|---|---|
| 1 | `goblet_squat` Sentadilla goblet | 3 | 8–10 | **7** | 90 s |
| 2 | `rdl` Peso muerto rumano | 3 | 10–12 | **7** | 90 s |
| 3a | `row` Remo con mancuerna | 3 | 10–12 por lado | 7 | 30 s |
| 3b | `calf_raise` Gemelo, rodilla extendida | 3 | 12–15 | 7–8 | 60 s |
| 4 | `pallof` Pallof press con banda | 2 | 20–30 s por lado | 7 | 45 s |

*(3a y 3b en serie alterna.)*

**Sustituciones**: `goblet_squat`→`split_squat` · `rdl`→`hip_thrust` · `row`→`pulldown` · `pallof`→`side_plank`.

**Duración estimada**: 28–33 min. **Vuelta a la calma (2 min)**: movilidad de cadera.

> ⛔ **No colocar en las 24 h previas** a series, tempo, tirada larga o competición.
> ✅ Válida el día siguiente a una tirada larga (trabajo de compensación).
> **Cambio respecto a la versión anterior**: RPE 7 en vez de 7–8 y rango de reps más
> alto en el peso muerto rumano — menos carga excéntrica, misma función.

---

## S3 · Gimnasio — 40 min · fatiga MEDIA-ALTA

| | |
|---|---|
| Objetivo | Fuerza completa y progresión de cargas |
| Nivel | Pro |
| Material | Gimnasio |
| Fatiga | **Media-alta** · recuperación 36–48 h |

**Calentamiento (5 min)**: 3 min suave + sentadilla sin peso ×10 + banda: remo ×15 + press vertical sin carga ×10.

| Orden | Ejercicio | Series | Reps | RPE | Descanso |
|---|---|---|---|---|---|
| 1 | `squat` Sentadilla con barra | 3 | 6–8 | **8** | 120 s |
| 2 | `rdl` Peso muerto rumano | 3 | 8–10 | 7–8 | 120 s |
| 3 | `pulldown` Jalón | 3 | 8–12 | 7–8 | 90 s |
| 4 | `overhead_press` Press vertical | 3 | 8–10 | 7–8 | 90 s |
| 5 | `soleus_raise` Sóleo, rodilla flexionada | 3 | 12–15 | 8 | 60 s |
| 6 | `farmer_carry` Transporte del granjero | 2 | 30–40 m | 7 | 60 s |

**Sustituciones**: `squat`→`goblet_squat` o prensa · `rdl`→`hip_thrust` · `pulldown`→`row` · `overhead_press`→`push`.

**Duración estimada**: 38–44 min. **Vuelta a la calma (3 min)**.

> ⛔ **No colocar en las 48 h previas** a series, tempo, tirada larga o competición.
> ⛔ **No colocar el día siguiente a una tirada larga** ni en semana de competición.
> **Cambio respecto a la versión anterior**: 3 series de sentadilla en vez de 4 y rango
> 6–8. Sigue siendo la más exigente, pero baja de «alta» a «media-alta» y su ventana
> de incompatibilidad pasa de bloquear la semana a bloquear 48 h.

---

## Cómo cambia esto el motor

La regla anterior era: **mover la sesión**. La regla nueva es: **elegir la sesión que
cabe**, y solo mover si ninguna cabe.

| Situación | Antes (una sola carta) | Ahora (tres cartas) |
|---|---|---|
| Series mañana | Mover a otro día | **Jugar S1** (`ok_any_day`) — el usuario entrena hoy |
| Tirada larga mañana | Mover | **Jugar S1** |
| Día después de tirada larga | Evitar | **Jugar S2** (compensación) |
| Semana sin ningún hueco limpio | Cancelar la semana | **Jugar S1**, que nunca estorba |
| Semana de descarga | Reducir volumen | **Jugar S1** en vez de S2/S3 reducida |
| Competición en < 72 h | Cancelar | **Cancelar** (esto no cambia) |

**Solo se cancela la semana de competición.** El resto de casos que antes terminaban en
«esta semana no hay hueco» ahora terminan con el usuario entrenando algo. Para un
módulo cuyo problema es que la gente no vuelve una segunda vez, esa diferencia importa
más que cualquier refinamiento del contenido.
