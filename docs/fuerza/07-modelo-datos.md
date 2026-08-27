# Fase 8 · Datos y arquitectura

> **Diseño. No hay migraciones, no hay SQL, no se ha tocado Supabase.**
> Lo que sigue es el modelo mínimo propuesto, para revisar antes de escribir nada.

## 1. Entidades

Prefijo `strength_` en todas, para que sea trivial identificarlas y, si el piloto
fracasa, retirarlas sin tocar el resto del esquema.

### 1.1 Catálogo (contenido, no datos de usuario)

| Entidad | Propósito | Campos clave |
|---|---|---|
| `strength_exercises` | Las 20 familias | `id` (slug estable, no UUID), `nombre_es`, `nombre_en`, `nivel`, `patron`, `musculos_principales[]`, `musculos_secundarios[]`, `material[]`, `lateralidad`, `tipo_registro`, `descanso_sugerido_s`, `carga_piernas`, `estado_contenido`, `revisado_por`, `revisado_el` |
| `strength_exercise_variants` | Variante por material de una familia | `id`, `exercise_id`, `material`, `nombre_es/en`, `ajuste_tecnica`, `recurso_visual_id` |
| `strength_substitutions` | Sustituciones compatibles | `exercise_id`, `sustituto_id`, `orden`, `motivo_valido[]` (`material`/`molestia`/`preferencia`) |
| `strength_templates` | Plantillas de sesión (las 3 modelo y sus derivadas) | `id`, `modo` (`correr`/`hibrido`), `nivel`, `material_min[]`, `duracion_min`, `carga_piernas`, `bloques` (JSON: calentamiento, orden, series, rango reps, RPE, descanso, vuelta a la calma) |

> El catálogo es **de solo lectura para el cliente** y cacheable en el dispositivo.
> Es lo que permite que la sesión funcione sin conexión.

### 1.2 Datos del usuario

| Entidad | Propósito | Campos clave |
|---|---|---|
| `strength_user_settings` | Configuración del módulo | `user_id` (PK), `activo`, `modo`, `objetivo`, `experiencia`, `material[]`, `minutos`, `frecuencia`, `dias_disponibles[]`, `unidades` (`kg`/`lb`), `creado_el`, `actualizado_el` |
| `strength_planned_sessions` | Lo que toca hacer | `id` (UUID), `user_id`, `template_id`, `fecha`, `semana_iso`, `indice_en_semana`, `estado` (`programada`/`en_curso`/`completada`/`omitida`/`cancelada`), `motivo_colocacion_es/en`, `accion_colision`, `volumen_ajuste`, `running_plan_id` (FK nullable), `generado_por` (`motor`/`usuario`) |
| `strength_session_exercises` | Ejercicios de una sesión concreta | `id`, `planned_session_id`, `exercise_id`, `variant_id`, `orden`, `sustituido_de` (nullable), `motivo_sustitucion`, `saltado`, `motivo_salto` |
| `strength_planned_sets` | Series previstas | `id`, `session_exercise_id`, `indice`, `reps_min`, `reps_max`, `rpe_objetivo`, `carga_sugerida_g`, `descanso_s` |
| `strength_performed_sets` | **Series realizadas — la tabla que importa** | `id` (UUID **generado en cliente**), `planned_set_id` (nullable), `session_exercise_id`, `indice`, `reps`, `carga_g`, `rpe` (nullable), `completada_el` (timestamp cliente), `sincronizado_el` (servidor), `editado_el` (nullable) |
| `strength_personal_records` | Récords | `user_id`, `exercise_id`, `tipo` (`carga_max`/`reps_max`/`volumen_max`/`tiempo_max`), `valor`, `performed_set_id`, `conseguido_el` |
| `strength_session_energy` | Calorías, **solo con fuente** | `planned_session_id`, `kcal`, `fuente` (`apple_health`/`health_connect`/`garmin`), `fuente_id_externo`, `leido_el`. **Sin fila = «Calorías no disponibles». Nunca se inserta una estimación propia.** |

### 1.3 Feature flag

| Entidad | Campos |
|---|---|
| `feature_flags` *(si ya existe, reutilizar; si no, la más simple posible)* | `clave` = `strength_module_v1`, `activa_global` (false), `usuarios_permitidos[]` (los 10–15 del piloto), `plataformas[]` |

Comprobación en cliente **y** en servidor. Si la flag está cerrada, el módulo no
existe: no hay tarjeta en Inicio, no hay entrada en Planes, no se generan sesiones.

## 2. Requisitos transversales

| Requisito | Cómo se cumple |
|---|---|
| **UUID e idempotencia** | Todo id de dato de usuario es UUID **generado en el cliente**. La sincronización es un upsert por `id`: reenviar la misma serie diez veces produce una sola fila |
| **Autoguardado** | Se escribe en el almacén local **al marcar cada serie**, no al terminar. La sesión sobrevive a un cierre forzado de la app |
| **Edición posterior** | `strength_performed_sets.editado_el`. Editar una serie **recalcula récords**; si el récord desaparece, se retira sin ceremonia |
| **Offline y sincronización** | Cola de operaciones local con reintento. Orden garantizado por `(session_id, orden, indice)`. El catálogo va precargado |
| **Sin duplicados** | Clave única lógica `(user_id, semana_iso, indice_en_semana)` en sesiones planificadas; `id` de cliente en series realizadas |
| **RLS owner-only** | Toda tabla de usuario filtrada por `user_id = auth.uid()`. El catálogo, lectura pública autenticada. **Escritura de catálogo solo desde herramientas internas** |
| **Borrado y exportación** | El borrado de cuenta existente debe extenderse a las tablas `strength_*` (borrado en cascada). Exportación: las series realizadas del usuario en formato legible |
| **ES/EN** | Todo texto de catálogo en columnas `_es`/`_en`. Los motivos de colocación se **generan en ambos idiomas** al planificar, no se traducen en el cliente |
| **kg/lb sin pérdida** | Almacenar **`carga_g` en gramos enteros**. `kg`/`lb` es preferencia de presentación. Sin números en coma flotante en el almacenamiento |
| **Cero PII en analítica** | Los eventos llevan `exercise_id`, `modo`, `motivo` como enums cerrados. **Nunca** notas del usuario, nombres ni pesos corporales |

## 3. Vinculación con el plan de running

- `strength_planned_sessions.running_plan_id` referencia el plan activo, **nullable**:
  el módulo debe funcionar sin plan de carrera (aunque entonces sin motor de colisión).
- El motor **lee** el plan de running; **no lo modifica jamás**. La fuerza cede, la
  carrera nunca. Esa asimetría debe ser una garantía del código, no una convención.
- Si el usuario pausa o borra el plan de running, las sesiones de fuerza futuras se
  recalculan como "sin plan" en vez de quedar huérfanas.

## 4. Qué se puede hacer por OTA y qué exige binario nuevo

| Capacidad | OTA | Binario | Por qué |
|---|---|---|---|
| Pantallas, tarjeta en Inicio, tabla de registro | ✅ | | JavaScript puro |
| Motor de calendario y progresión | ✅ | | Lógica en cliente/servidor |
| Catálogo, plantillas, sustituciones | ✅ | | Datos |
| Temporizador de descanso **en primer plano** | ✅ | | `setInterval` mientras la app está visible |
| Almacenamiento local y cola de sincronización | ✅ | | Si se usa el almacén ya presente en el binario |
| **Notificación al acabar el descanso con la app en segundo plano** | | ⚠️ | Depende de si el binario actual ya incluye notificaciones locales. **Verificar**; si no, es binario nuevo |
| **Mantener el temporizador con la pantalla apagada** | | ⚠️ | Ejecución en segundo plano. **Verificar** capacidades del binario actual |
| **Leer calorías de Apple Health** | ❌ | ✅ | Módulo nativo HealthKit + config plugin + `NSHealthShareUsageDescription`. Verificado: no funciona por OTA |
| **Leer calorías de Health Connect** | ❌ | ✅ | Módulo nativo + permisos Health Connect en el manifiesto. Verificado: no funciona por OTA |
| **Escribir el workout en Apple Health / Health Connect** | ❌ | ✅ | Mismo motivo |
| Integración con Garmin | ❌ | ⚠️ | Depende de la aprobación del programa de Garmin, no solo del binario. El Activity API es de solo lectura |

### Recomendación de secuencia

**El MVP sale entero por OTA, sin calorías**, mostrando «Calorías no disponibles» con
una línea de explicación. Se ahorra un ciclo completo de revisión de tiendas y se
respeta la política de honestidad sin coste técnico. La lectura de calorías desde
Apple Health / Health Connect entra en el **siguiente binario ordinario**, cuando toque
por otras razones — nunca se hace un build solo para esto.

⚠️ **Los dos puntos marcados con ⚠️** (notificación de descanso en segundo plano y
temporizador con pantalla apagada) **no he podido verificarlos**: el submódulo
`correr-juntos-app` no está disponible en este entorno. Son la única incógnita real
entre "todo el MVP por OTA" y "hace falta binario". Hay que comprobarlo en el código
antes de comprometer la fecha.
