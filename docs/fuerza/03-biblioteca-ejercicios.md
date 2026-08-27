# Fase 4 · Biblioteca MVP — esquema, catálogo y fichas modelo

> ⚠️ **Todo el contenido técnico de este documento está PENDIENTE DE REVISIÓN por un
> entrenador o profesional cualificado antes de publicarse.** Ninguna ficha tiene
> estado `revisado`. Nada de lo que sigue es consejo médico ni promete prevenir
> lesiones; describe cómo ejecutar un movimiento, no cómo tratar una dolencia.

## 1. Esquema de una familia de movimiento

```jsonc
{
  "id": "rdl",                          // estable, minúsculas, nunca cambia
  "nombre": { "es": "...", "en": "..." },
  "nivel": "iniciacion | intermedio | avanzado",
  "patron": "sentadilla | bisagra | zancada | empuje_horizontal | empuje_vertical |
             traccion_horizontal | traccion_vertical | core_antiextension |
             core_antirrotacion | core_antilateral | transporte | tobillo_pie",
  "musculos": { "principales": ["..."], "secundarios": ["..."] },
  "material": ["ninguno", "banda", "mancuernas", "barra", "kettlebell", "maquina", "step"],
  "lateralidad": "bilateral | unilateral",
  "registro": "peso_reps | reps | tiempo | distancia",
  "descanso_sugerido_s": { "iniciacion": 60, "intermedio": 90, "avanzado": 120 },
  "tecnica": ["2-4 frases, imperativo, sin jerga innecesaria"],
  "errores_frecuentes": ["2-3 errores observables"],
  "sustituciones": ["ids de la misma familia o patrón, ordenados por cercanía"],
  "restricciones": {
    "carga_piernas": "alta | media | baja",   // ← entrada del motor de calendario
    "no_usar_si": ["texto orientativo, nunca diagnóstico"]
  },
  "recurso_visual": {
    "tipo": "ilustracion | foto | video",
    "estado": "pendiente | encargado | disponible",
    "licencia": "propia | licenciada | por_determinar"
  },
  "estado_contenido": "pendiente_revision_profesional | revisado",
  "revisado_por": null,
  "revisado_el": null
}
```

**Campo crítico y propio nuestro: `restricciones.carga_piernas`.** Es lo que permite
al motor de calendario decidir. Ninguna app de gimnasio necesita este campo; nosotros
sí, porque tenemos que saber si un ejercicio puede ir la víspera de unas series.

---

## 2. Catálogo — 20 familias canónicas

Se han fusionado variantes para mantener 20 familias (p. ej. puente de glúteo entra en
`hip_thrust`; sentadilla dividida y zancada inversa comparten familia `split_squat`).

| # | ID | Familia (ES) | Patrón | Carga piernas | Registro | Material mínimo |
|---|---|---|---|---|---|---|
| 1 | `squat` | Sentadilla | sentadilla | **alta** | peso_reps | ninguno |
| 2 | `goblet_squat` | Sentadilla goblet | sentadilla | **alta** | peso_reps | mancuerna/kettlebell |
| 3 | `split_squat` | Sentadilla dividida / zancada inversa | zancada | **alta** | peso_reps | ninguno |
| 4 | `step_up` | Step-up | zancada | **alta** | peso_reps | step |
| 5 | `rdl` | Peso muerto rumano | bisagra | **alta** | peso_reps | mancuernas |
| 6 | `hip_thrust` | Hip thrust / puente de glúteo | bisagra | media | peso_reps | ninguno |
| 7 | `ham_curl` | Curl femoral (incl. nórdico asistido) | bisagra | **alta** | reps | ninguno/banda |
| 8 | `calf_raise` | Gemelo, rodilla extendida | tobillo_pie | media | peso_reps | ninguno |
| 9 | `soleus_raise` | Sóleo, rodilla flexionada | tobillo_pie | media | peso_reps | ninguno |
| 10 | `tib_raise` | Tibial anterior | tobillo_pie | baja | reps | ninguno |
| 11 | `row` | Remo | traccion_horizontal | baja | peso_reps | mancuernas/banda |
| 12 | `pulldown` | Jalón / dominada asistida | traccion_vertical | baja | peso_reps | banda/máquina |
| 13 | `push` | Flexión / press banca | empuje_horizontal | baja | peso_reps | ninguno |
| 14 | `overhead_press` | Press vertical | empuje_vertical | baja | peso_reps | mancuernas |
| 15 | `farmer_carry` | Transporte del granjero | transporte | media | distancia | mancuernas |
| 16 | `pallof` | Pallof press | core_antirrotacion | baja | tiempo | banda |
| 17 | `dead_bug` | Dead bug | core_antiextension | baja | reps | ninguno |
| 18 | `side_plank` | Plancha lateral | core_antilateral | baja | tiempo | ninguno |
| 19 | `copenhagen` | Copenhagen plank | core_antilateral | media | tiempo | ninguno |
| 20 | `bird_dog` | Bird dog | core_antiextension | baja | reps | ninguno |

**Fuera del MVP, explícitamente:** pliometría (saltos, multisaltos, drop jumps) y
movimientos olímpicos (cargada, arrancada, envión). Alta exigencia técnica, riesgo
elevado sin supervisión, y no son necesarios para el objetivo del módulo.

**Cobertura por material**: 12 de las 20 familias se pueden ejecutar **sin material
alguno**. Es deliberado: el corredor típico no tiene gimnasio, y el modo A tiene que
funcionar en el salón de casa.

---

## 3. Cinco fichas modelo completas

Formato a validar antes de escribir las 15 restantes.

### 3.1 `rdl` — Peso muerto rumano

```jsonc
{
  "id": "rdl",
  "nombre": { "es": "Peso muerto rumano", "en": "Romanian deadlift" },
  "nivel": "intermedio",
  "patron": "bisagra",
  "musculos": {
    "principales": ["isquiosurales", "gluteo_mayor"],
    "secundarios": ["erectores_espinales", "dorsal_ancho"]
  },
  "material": ["mancuernas", "barra", "kettlebell", "banda"],
  "lateralidad": "bilateral",
  "registro": "peso_reps",
  "descanso_sugerido_s": { "iniciacion": 90, "intermedio": 90, "avanzado": 120 },
  "tecnica": [
    "De pie, pies al ancho de cadera y rodillas ligeramente flexionadas.",
    "Lleva la cadera hacia atrás manteniendo la espalda larga; el peso baja pegado a las piernas.",
    "Baja hasta que notes tensión en la parte posterior del muslo, no más.",
    "Vuelve arriba empujando la cadera hacia delante y apretando el glúteo."
  ],
  "errores_frecuentes": [
    "Redondear la espalda baja en vez de mover la cadera.",
    "Convertirlo en una sentadilla flexionando mucho la rodilla.",
    "Bajar más de lo que la movilidad permite buscando tocar el suelo."
  ],
  "sustituciones": ["hip_thrust", "ham_curl", "squat"],
  "restricciones": {
    "carga_piernas": "alta",
    "no_usar_si": ["Molestia en la zona lumbar o en la parte posterior del muslo: consulta antes con un profesional."]
  },
  "recurso_visual": { "tipo": "ilustracion", "estado": "pendiente", "licencia": "por_determinar" },
  "estado_contenido": "pendiente_revision_profesional",
  "revisado_por": null, "revisado_el": null
}
```

### 3.2 `split_squat` — Sentadilla dividida / zancada inversa

```jsonc
{
  "id": "split_squat",
  "nombre": { "es": "Sentadilla dividida", "en": "Split squat" },
  "nivel": "iniciacion",
  "patron": "zancada",
  "musculos": {
    "principales": ["cuadriceps", "gluteo_mayor"],
    "secundarios": ["isquiosurales", "aductores", "estabilizadores_cadera"]
  },
  "material": ["ninguno", "mancuernas", "banda"],
  "lateralidad": "unilateral",
  "registro": "peso_reps",
  "descanso_sugerido_s": { "iniciacion": 60, "intermedio": 90, "avanzado": 90 },
  "tecnica": [
    "Un pie delante y otro detrás, separados como un paso largo.",
    "Baja en vertical hasta que la rodilla de atrás se acerque al suelo.",
    "El peso reparte entre el talón de delante y la punta de atrás.",
    "Sube empujando con la pierna delantera. Completa todas las reps antes de cambiar."
  ],
  "errores_frecuentes": [
    "Dar un paso demasiado corto: la rodilla delantera se adelanta en exceso.",
    "Inclinar el tronco hacia delante y perder la vertical.",
    "Cambiar de pierna a mitad de serie."
  ],
  "sustituciones": ["step_up", "squat", "goblet_squat"],
  "restricciones": {
    "carga_piernas": "alta",
    "no_usar_si": ["Molestia en la rodilla al flexionar bajo carga: reduce el recorrido o consulta con un profesional."]
  },
  "recurso_visual": { "tipo": "ilustracion", "estado": "pendiente", "licencia": "por_determinar" },
  "estado_contenido": "pendiente_revision_profesional",
  "revisado_por": null, "revisado_el": null
}
```

### 3.3 `soleus_raise` — Sóleo con rodilla flexionada

```jsonc
{
  "id": "soleus_raise",
  "nombre": { "es": "Elevación de sóleo (rodilla flexionada)", "en": "Bent-knee calf raise" },
  "nivel": "iniciacion",
  "patron": "tobillo_pie",
  "musculos": { "principales": ["soleo"], "secundarios": ["tibial_posterior", "musculatura_intrinseca_pie"] },
  "material": ["ninguno", "mancuernas", "step"],
  "lateralidad": "unilateral",
  "registro": "peso_reps",
  "descanso_sugerido_s": { "iniciacion": 45, "intermedio": 60, "avanzado": 60 },
  "tecnica": [
    "Sentado o de pie con la rodilla flexionada unos 30 grados.",
    "Sube el talón despacio hasta el final del recorrido.",
    "Baja controlando, sin dejar caer el talón de golpe.",
    "Mantén la rodilla flexionada todo el rato: si la estiras, trabaja el gemelo, no el sóleo."
  ],
  "errores_frecuentes": [
    "Estirar la rodilla a mitad de serie.",
    "Rebotar abajo aprovechando el impulso.",
    "Recorrido corto: no llegar arriba del todo."
  ],
  "sustituciones": ["calf_raise", "tib_raise"],
  "restricciones": {
    "carga_piernas": "media",
    "no_usar_si": ["Dolor en el tendón de Aquiles o en la planta del pie: consulta antes con un profesional."]
  },
  "recurso_visual": { "tipo": "ilustracion", "estado": "pendiente", "licencia": "por_determinar" },
  "estado_contenido": "pendiente_revision_profesional",
  "revisado_por": null, "revisado_el": null
}
```

### 3.4 `pallof` — Pallof press

```jsonc
{
  "id": "pallof",
  "nombre": { "es": "Pallof press", "en": "Pallof press" },
  "nivel": "iniciacion",
  "patron": "core_antirrotacion",
  "musculos": { "principales": ["obliquos", "transverso_abdominal"], "secundarios": ["gluteo_medio", "hombro"] },
  "material": ["banda", "maquina"],
  "lateralidad": "unilateral",
  "registro": "tiempo",
  "descanso_sugerido_s": { "iniciacion": 45, "intermedio": 60, "avanzado": 60 },
  "tecnica": [
    "De pie, de lado a un anclaje, banda a la altura del pecho con las dos manos.",
    "Separa hasta que la banda tire y estira los brazos al frente.",
    "Aguanta sin dejar que el tronco gire hacia el anclaje.",
    "Vuelve al pecho con control y repite antes de cambiar de lado."
  ],
  "errores_frecuentes": [
    "Dejar que el tronco rote: es justo lo que hay que evitar.",
    "Aguantar la respiración en vez de respirar de forma continua.",
    "Poner tanta tensión que ya no se puede mantener la postura."
  ],
  "sustituciones": ["side_plank", "dead_bug", "bird_dog"],
  "restricciones": { "carga_piernas": "baja", "no_usar_si": [] },
  "recurso_visual": { "tipo": "ilustracion", "estado": "pendiente", "licencia": "por_determinar" },
  "estado_contenido": "pendiente_revision_profesional",
  "revisado_por": null, "revisado_el": null
}
```

### 3.5 `hip_thrust` — Hip thrust / puente de glúteo

```jsonc
{
  "id": "hip_thrust",
  "nombre": { "es": "Hip thrust", "en": "Hip thrust" },
  "nivel": "iniciacion",
  "patron": "bisagra",
  "musculos": { "principales": ["gluteo_mayor"], "secundarios": ["isquiosurales", "cuadriceps"] },
  "material": ["ninguno", "mancuernas", "barra", "banda"],
  "lateralidad": "bilateral",
  "registro": "peso_reps",
  "descanso_sugerido_s": { "iniciacion": 60, "intermedio": 90, "avanzado": 90 },
  "tecnica": [
    "Espalda alta apoyada en un sofá o banco, pies en el suelo al ancho de cadera.",
    "Sube la cadera hasta alinear hombros, cadera y rodillas.",
    "Aprieta el glúteo arriba un segundo.",
    "Baja con control sin llegar a apoyar del todo entre repeticiones."
  ],
  "errores_frecuentes": [
    "Arquear la zona lumbar en vez de terminar el movimiento con el glúteo.",
    "Pies demasiado lejos: pasa a trabajar el isquio.",
    "Subir a tirones."
  ],
  "sustituciones": ["rdl", "ham_curl", "split_squat"],
  "restricciones": {
    "carga_piernas": "media",
    "no_usar_si": ["Molestia lumbar al extender la cadera: reduce el recorrido o consulta con un profesional."]
  },
  "recurso_visual": { "tipo": "ilustracion", "estado": "pendiente", "licencia": "por_determinar" },
  "estado_contenido": "pendiente_revision_profesional",
  "revisado_por": null, "revisado_el": null
}
```

---

## 4. Qué falta y qué cuesta

- **15 fichas restantes** siguiendo este formato, una vez el founder valide el formato.
- **20 recursos visuales** (uno por familia). Ver `09-contenido-y-derechos.md`.
- **Revisión profesional de las 20 fichas**. Es un gasto externo y una dependencia de
  calendario, no una tarea de código. Sin esa revisión, ninguna ficha pasa a `revisado`
  y el módulo **no debería publicarse**.
