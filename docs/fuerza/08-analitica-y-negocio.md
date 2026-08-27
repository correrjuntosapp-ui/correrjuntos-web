# Fase 9 · Analítica y negocio

## 1. Eventos — enums cerrados, cero PII

Ningún evento lleva texto libre, nombres, pesos corporales ni notas del usuario.
Todos los parámetros son **enumerados cerrados o números**.

| Evento | Parámetros |
|---|---|
| `strength_setup_started` | `origen`: `inicio` \| `planes` \| `actividades` \| `ajustes` |
| `strength_setup_completed` | `modo`: `correr`\|`hibrido` · `experiencia`: `nunca`\|`algo`\|`soltura` · `material`: `ninguno`\|`banda`\|`mancuernas`\|`gimnasio` · `minutos`: `20`\|`30`\|`45` · `frecuencia`: `1`\|`2` |
| `strength_session_viewed` | `origen` · `estado`: `programada`\|`en_curso`\|`completada`\|`movida` |
| `strength_session_started` | `template_id` · `modo` · `duracion_prevista_min` · `offline`: `true`\|`false` |
| `strength_session_completed` | `template_id` · `duracion_real_min` · `series_completadas` · `series_previstas` · `ejercicios_sustituidos` · `ejercicios_saltados` · `rpe_medio` (nullable) |
| `strength_set_completed` | `exercise_id` · `indice_serie` · `tiene_carga`: bool · `tiene_rpe`: bool |
| `strength_exercise_swapped` | `exercise_id_origen` · `exercise_id_destino` · `motivo`: `material`\|`molestia`\|`preferencia` |
| `strength_exercise_skipped` | `exercise_id` · `motivo`: `sin_tiempo`\|`material`\|`molestia`\|`no_me_gusta` |
| `strength_rest_timer_used` | `exercise_id` · `accion`: `completo`\|`saltado`\|`ampliado` |
| `strength_plan_collision_detected` | `regla`: `R0`…`R10` · `tipo_running`: `series`\|`tempo`\|`largo`\|`competicion` |
| `strength_plan_collision_resolved` | `regla` · `accion`: `mover`\|`reducir`\|`cancelar`\|`ignorada_por_usuario` |
| `strength_pr_achieved` | `exercise_id` · `tipo`: `carga_max`\|`reps_max`\|`volumen_max`\|`tiempo_max` |
| `strength_paywall_viewed` | `disparador`: `post_sesion_1`\|`planificacion`\|`estadisticas`\|`hibrido` · `sesiones_completadas` |
| `strength_trial_started` | `disparador` · `sesiones_completadas` |

**Evento propio que ningún competidor tiene y que hay que vigilar**:
`strength_plan_collision_resolved` con `accion=ignorada_por_usuario`. Si mucha gente
ignora el aviso y entrena igual la víspera de las series, o el motor está mal calibrado
o el mensaje no convence. Es la métrica que valida la tesis del producto.

## 2. Embudo principal

```
Configuración completada
        ↓  (objetivo ≥ 70 % de los que la empiezan)
Primera sesión vista
        ↓  (objetivo ≥ 60 %)
Primera sesión iniciada
        ↓  (objetivo ≥ 75 % — si no, la pantalla activa falla)
Primera sesión completada        ← MÉTRICA CLAVE DE ACTIVACIÓN DEL MÓDULO
        ↓  (objetivo ≥ 50 % en 10 días)
Segunda sesión completada        ← la que predice retención
        ↓  (objetivo ≥ 30 %)
Sigue activo en la semana 4
        ↓
Trial iniciado  →  Pago
```

⚠️ **Estos objetivos son estimaciones mías, no datos.** No hay base histórica del
módulo. Deben tratarse como hipótesis a contrastar con el piloto, no como compromisos.

## 3. Guardas — condiciones que detienen el piloto

Se revisan **semanalmente** durante el piloto. Cualquiera que se incumpla → parada y
revisión, no "seguimos y ya veremos".

| # | Guarda | Umbral de parada |
|---|---|---|
| G1 | **El cumplimiento del plan de running no empeora** | Caída > 5 puntos en % de sesiones de carrera completadas en los usuarios del piloto frente a su propia línea base |
| G2 | **Sin aumento de fallos** | Cualquier subida medible de crashes o ANR atribuible a las pantallas de fuerza |
| G3 | **Sin sesiones duplicadas** | 1 sola sesión duplicada detectada ya es fallo de idempotencia → parada |
| G4 | **Sin colisiones antes de sesiones clave** | 0 sesiones de carga de piernas alta colocadas **por el motor** en la víspera de una sesión clave. (Las movidas a mano por el usuario, avisado, no cuentan) |
| G5 | **Sin calorías de fuente desconocida** | 0 valores de kcal mostrados sin `fuente` registrada |
| G6 | **Sin pérdida de datos** | 0 sesiones perdidas por cierre de app o falta de conexión |
| G7 | **F141 y D+1 no se tocan** | Cualquier movimiento en las métricas del embudo principal fuera del grupo del piloto → parada inmediata (indicaría fuga de la flag) |

## 4. Gratis vs Pro

| | **Gratis** | **Pro** |
|---|---|---|
| Registro manual de sesión | ✅ | ✅ |
| Rutinas básicas (las 3 modelo) | ✅ | ✅ |
| Temporizador de descanso | ✅ | ✅ |
| Biblioteca inicial (20 familias) | ✅ | ✅ |
| Historial | Últimas **4 semanas** | Completo |
| Récords personales | ✅ (los ve) | ✅ |
| **Integración con el plan de carrera** | ❌ | ✅ |
| **Calendario sin colisiones** (motor R0–R10) | ❌ | ✅ |
| **Progresión automática** | ❌ | ✅ |
| **Sustituciones inteligentes** | ❌ *(puede cambiar a mano)* | ✅ |
| **Estadísticas completas** | ❌ | ✅ |
| **Comentarios de José sobre la sesión** | ❌ | ✅ |
| **Plan híbrido (modo B)** | ❌ | ✅ |

La línea divisoria es limpia y defendible: **gratis es una app de registro decente;
Pro es lo único que ninguna app de gimnasio puede darte** — que tu fuerza sepa qué
carrera preparas. No se recorta el registro para forzar el pago; se cobra por la
integración, que es donde está el valor real y donde está nuestro coste.

## 5. Momento de venta

**Regla dura: el paywall no aparece hasta que el usuario ha completado al menos una
sesión de fuerza.** Antes de eso no ha visto nada por lo que pagar.

| Momento | Qué se ofrece | Por qué ahí |
|---|---|---|
| Al terminar la **1.ª sesión**, en el resumen | Una línea, sin bloquear: «Con Pro colocamos estas sesiones solas para que no choquen con tu plan» + `[Ver Pro]` | Acaba de sentir el valor y está satisfecho |
| Al intentar **planificar la semana** | Pantalla de Pro completa | Es literalmente la función de pago |
| Al pedir **estadísticas más allá de 4 semanas** | Pantalla de Pro | Ha acumulado historial: hay algo que perder |
| Al elegir **modo híbrido** | Pantalla de Pro | Público más comprometido |

**Nada de**: intersticial al abrir, cuenta atrás, bloqueo a mitad de sesión, descuento
"solo hoy". Sería incoherente con el resto de la app y con lo poco que tenemos que
ofrecer todavía.
