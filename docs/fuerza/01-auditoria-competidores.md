# Fase 1 · Auditoría de referencias — Fuerza para corredores

> **Ronda**: Fase 0 diseño · 27 ago 2026 · rama `claude/fuerza-correr-juntos-tylacr`
> **Naturaleza**: investigación documental. No se ha copiado interfaz, texto ni
> contenido protegido de ninguna aplicación. Se describen patrones funcionales,
> que no son propiedad de nadie; el contenido concreto es original.

## Nivel de verificación de cada afirmación

| Marca | Significado |
|---|---|
| ✅ | Verificado en fuente oficial (web propia del producto, doc de desarrollador o centro de ayuda oficial). |
| 🟡 | Fuente secundaria fiable o reseña; **no** confirmado en primaria. Verificar antes de tomar decisión irreversible. |
| ⛔ | No verificado en esta ronda. No usar como base de decisión. |

⚠️ El dominio `support.runna.com` está **bloqueado por el proxy de egreso** de este
entorno. Lo relativo a Runna procede de su web pública y de resultados de
búsqueda que citan su centro de ayuda, no de lectura directa del artículo. Marcado 🟡
donde corresponde.

---

## 1. Runna — integración running ↔ fuerza

| Aspecto | Hallazgo | Verif. |
|---|---|---|
| Modelo de integración | La fuerza **no es un plan aparte**: es un "additional workout" que se añade sobre un plan de running ya creado (Plan → Manage Plan → Additional Workouts → Strength). | 🟡 |
| Enfoques | Dos: **Running Focus** (prioriza tren inferior y core para soportar la carrera) y **All Round Strength** (cuerpo completo: piernas, core, tren superior). | ✅ |
| Duración | Sesiones de **30, 45 o 60 minutos**. | ✅ |
| Frecuencia | El usuario elige cuántas sesiones por semana incorporar. | ✅ |
| Personalización | Adaptado a horario, objetivos y **material disponible**. | ✅ |
| Registro | Durante ejercicios con peso, el usuario introduce **reps y peso** en la pestaña Log; eso permite seguir la progresión en el tiempo. | 🟡 |
| Argumento comercial | "Los corredores que incorporan fuerza tienen un 6% más de probabilidad de hacer marca personal". | ✅ |
| **Limitación 1** | **No se pueden crear ni añadir sesiones de fuerza propias**: todas son rutinas prefabricadas del plan. Lo propio solo se registra manualmente como actividad. | 🟡 |
| **Limitación 2** | Quejas de usuarios sobre calidad de las rutinas ("parecen generadas por ordenador"; ejemplo citado: zancadas con peso en días de tren superior). | 🟡 |

**Qué copiar como patrón**: la fuerza como *capa opcional sobre el plan de running*,
no como producto paralelo; la elección explícita entre enfoque running y cuerpo
completo; la pregunta por material y duración antes de generar.

**Qué evitar**: rutinas rígidas prefabricadas sin capacidad de sustituir ni ajustar;
selección de ejercicios que no respeta el sentido del día (el fallo que sus usuarios
señalan).

**Ventaja posible de CorrerJuntos**: Runna programa la fuerza *junto* al plan, pero
las críticas apuntan a que la selección no siempre respeta el contexto de la semana.
Nuestro diferencial declarado es la **regla de colisión explícita y visible**
("hemos movido tu fuerza al miércoles para proteger la tirada larga del domingo").
Eso no lo hemos visto comunicado por nadie como característica de producto. ⛔ *No
verificado que ningún competidor lo haga; no afirmarlo públicamente sin comprobarlo.*

---

## 2. Hevy — registro de la sesión

| Aspecto | Hallazgo | Verif. |
|---|---|---|
| RPE | Escala de esfuerzo percibido **por serie**; se activa en ajustes y añade una **columna extra** en la tabla de registro. Es opcional y por serie, no obligatoria. | ✅ |
| Temporizador de descanso | Automático, **configurable por ejercicio** (más descanso en series pesadas, menos en aislamiento) y **notifica** al llegar a cero. | ✅ |
| Superseries | Con "Smart Superset Scrolling": al marcar una serie completada, salta automáticamente al siguiente ejercicio de la superserie. | ✅ |
| Récords | **Notificación de récord personal** en el momento de conseguirlo. | ✅ |
| Biblioteca | Más de 400 ejercicios. | ✅ |
| Filosofía | Tres pilares: registro, seguimiento de progreso y componente social, manteniendo simplicidad. | ✅ |

**Qué copiar como patrón**: la tabla de registro con columna de valores anteriores
como referencia; RPE **opcional por serie** (no obligatorio, no bloquea); temporizador
automático que arranca solo al completar serie; celebración del récord en el momento.

**Qué evitar**: 400+ ejercicios (nuestro MVP son ~20 familias); la capa social propia
de fuerza — CorrerJuntos ya tiene feed y comunidad de running, duplicarla dividiría
la comunidad.

**Ventaja posible de CorrerJuntos**: Hevy no sabe nada de tu plan de carrera. Nuestro
registro puede ser igual de bueno *y además* estar situado en el calendario de tu
objetivo.

---

## 3. Fitbod — adaptación progresiva

| Aspecto | Hallazgo | Verif. |
|---|---|---|
| Entradas del algoritmo | Reps, series, pesos, material, nivel de esfuerzo y **días saltados** alimentan la sesión siguiente. | ✅ |
| Modelo de recuperación | Modela fatiga y recuperación muscular: aplica sobrecarga "cuando el cuerpo está listo" y la retiene cuando no. Muestra qué tan "fresco" está cada grupo muscular. | ✅ |
| Sobrecarga progresiva | Si completas con facilidad, sube peso o reps. Si fallas una serie, ajusta recomendaciones futuras a la baja. | ✅ |
| Variación | Cicla entre días más pesados y más ligeros ("dynamic variation across loading zones") en vez de repetir el mismo esquema. | ✅ |
| Material | Optimiza para el material que tengas, incluido ninguno. | ✅ |
| Base | Entrenado sobre datasets grandes de usuarios reales. | ✅ |

**Qué copiar como patrón**: la regla básica **completado con holgura → subir; fallo →
mantener o bajar**; la variación de carga entre sesiones; el respeto al material real.

**Qué evitar (explícitamente fuera de MVP)**: el **modelo de recuperación muscular
con porcentajes**. Requiere historial denso que nuestros usuarios no tendrán en las
primeras semanas y, sin ese historial, produciría un número inventado con apariencia
científica. Coincide con la restricción ya fijada: *sin porcentajes falsos de
recuperación muscular*.

**Ventaja posible de CorrerJuntos**: Fitbod modela la fatiga del gimnasio pero ignora
que el domingo hay 21 km. Nosotros tenemos la carga de carrera como entrada real, que
es la variable que más pesa en un corredor.

---

## 4. TrainingPeaks — estructura del plan

| Aspecto | Hallazgo | Verif. |
|---|---|---|
| Constructor | "Strength Workout Builder": permite ejercicios sueltos, **superseries, calentamientos y vueltas a la calma**. | ✅ |
| Prescripción | Se puede prescribir número de reps, peso "o cualquier otro parámetro". | ✅ |
| Intensidad | Usa **RPE y RIR** (reps en reserva) para medir cercanía al fallo; RPE 8 = quedan 2 reps. | ✅ |
| Biblioteca | Más de 1.000 ejercicios con vídeos e instrucciones. | ✅ |
| Restricción de producto | Solo atletas **Premium** planifican sus propias sesiones; el constructor es **solo escritorio**, la ejecución es en móvil. | ✅ |

**Qué copiar como patrón**: la estructura calentamiento → bloques → vuelta a la calma;
el vocabulario **RPE/RIR con equivalencia explicada** (RPE 8 = 2 reps en reserva), que
es el estándar que un corredor informado ya reconoce.

**Qué evitar**: la separación escritorio/móvil (nosotros somos solo móvil) y las 1.000
fichas con vídeo — es exactamente el coste de contenido que la restricción de MVP evita.

**Ventaja posible de CorrerJuntos**: TrainingPeaks es una herramienta de entrenador,
potente y fría. Nuestro público objetivo es el corredor que se autoentrena en español.

---

## 5. Plataformas de salud — qué datos de fuerza existen realmente

Esta es la sección con **más consecuencias técnicas**, porque decide la política de
calorías y si hace falta binario nuevo.

| Plataforma | Qué ofrece para fuerza | Verif. |
|---|---|---|
| **Apple HealthKit** | Tipos de actividad `functionalStrengthTraining` (peso libre y peso corporal) y `traditionalStrengthTraining`. Energía activa (`activeEnergyBurned`) y frecuencia cardiaca se asocian al workout. | ✅ |
| **Apple HealthKit — series/reps** | **No existe un tipo de dato nativo de series/repeticiones/carga.** Las apps de fuerza guardan el workout en Salud y mantienen el detalle de series en su propia base de datos. | 🟡 |
| **Health Connect (Android)** | Tipos `EXERCISE_TYPE_STRENGTH_TRAINING`, `..._CALISTHENICS`, `..._HIGH_INTENSITY_INTERVAL_TRAINING`. `ExerciseSessionRecord` admite segmentos y vueltas. Métricas asociadas: `HeartRateRecord`, `TotalCaloriesBurnedRecord`, etc. | ✅ |
| **Health Connect — `ExerciseSegment`** | Expone `repetitions`, `setIndex` y `rateOfPerceivedExertion` según referencias de la API; segmentos tipados por ejercicio (p. ej. `BENCH_PRESS`). **No** se ha confirmado campo de carga/peso por serie. | 🟡 |
| **Garmin Connect** | El **Activity API es de solo lectura** (más de 30 tipos de actividad, ficheros FIT/GPX/TCX). El **Training API** publica entrenamientos al dispositivo, no recupera detalle de ejecución. | ✅ |
| **Garmin — límite duro** | Las integraciones de terceros **no empujan datos de fuerza a nivel de serie** (series, reps, peso) dentro de Garmin Connect como sesión de fuerza reconocida. | 🟡 |

### Consecuencias directas para nuestro diseño

1. **La política de calorías acordada es la correcta y además es la única honesta
   posible.** Ninguna de las tres plataformas nos daría un gasto energético fiable de
   una sesión de fuerza salvo que el usuario lleve el reloj puesto y la sesión se haya
   registrado allí. Sin fuente autorizada → «Calorías no disponibles», tal como está fijado.
2. **El detalle de series/reps/carga es nuestro, en nuestra base de datos, siempre.**
   Ninguna plataforma es la fuente de verdad de eso. Health Connect es la que más se
   acerca, y aun así el peso por serie está sin confirmar.
3. **Cualquier lectura de calorías desde Apple Health / Health Connect exige binario
   nuevo**: son módulos nativos con config plugin y permisos; no llegan por OTA. ✅
   *(verificado: las librerías de HealthKit/Health Connect en Expo requieren
   development build / prebuild, no funcionan por actualización OTA)*.
4. Por tanto: **el MVP puede salir por OTA solo si sale sin calorías**, mostrando
   «Calorías no disponibles». Es coherente con la restricción y ahorra un ciclo de
   revisión de tienda.

---

## Matriz resumen

| App | Qué hace bien | Qué copiar como patrón | Qué evitar | Ventaja de CorrerJuntos |
|---|---|---|---|---|
| **Runna** | Fuerza acoplada al plan de running; pregunta objetivo, material, duración y frecuencia | Fuerza como capa opcional sobre el plan; enfoque running vs. cuerpo completo | Rutinas rígidas sin sustituciones; selección que ignora el día de la semana | Regla de colisión explícita y explicada al usuario |
| **Hevy** | El mejor registro de sesión del mercado | Tabla con valor anterior, RPE opcional por serie, temporizador automático, récord celebrado | Biblioteca de 400+; capa social duplicada | Mismo registro, pero situado en el calendario de tu carrera |
| **Fitbod** | Adaptación de carga según ejecución y material | Completado con holgura → sube; fallo → mantiene/baja; variación de carga | Modelo de recuperación muscular con porcentajes | La carga de carrera como entrada real de la progresión |
| **TrainingPeaks** | Estructura profesional del entrenamiento | Calentamiento/bloques/vuelta a la calma; RPE y RIR con equivalencia | Escritorio obligatorio; 1.000 fichas con vídeo | Móvil, en español, sin necesitar entrenador |
| **Garmin / Apple / Health Connect** | Fuente autorizada de energía y frecuencia cardiaca | Leer calorías solo de ahí | Creer que darán series/reps/carga fiables | Ser honestos donde otros estiman |

---

## Fuentes

- [Runna — Strength Training for Runners](https://www.runna.com/training/strength-training)
- [Runna — Personalized training plans](https://www.runna.com/training/training-plans)
- [Runna Support — Adding Strength Training to Your Runna Plan](https://support.runna.com/en/articles/15624879-adding-strength-training-to-your-runna-plan) *(no accesible desde este entorno; citado vía resultados de búsqueda)*
- [Hevy — Feature list](https://www.hevyapp.com/features/)
- [Hevy — Automatic workout rest timer](https://www.hevyapp.com/features/workout-rest-timer/)
- [Hevy — Workout settings](https://www.hevyapp.com/features/workout-settings/)
- [Fitbod — How Fitbod builds progressive overload](https://fitbod.me/blog/what-is-progressive-overload-and-how-fitbod-builds-it-into-every-workout-automatically/)
- [Fitbod — The Fitbod algorithm](https://fitbod.me/blog/fitbod-algorithm/)
- [TrainingPeaks — Using the Strength Workout Builder](https://help.trainingpeaks.com/hc/en-us/articles/21397126893581-Using-the-Strength-Workout-Builder)
- [TrainingPeaks — Strength Workout Builder FAQs](https://help.trainingpeaks.com/hc/en-us/articles/23361947242381-Strength-Workout-Builder-FAQs)
- [Apple — HKWorkoutActivityType.functionalStrengthTraining](https://developer.apple.com/documentation/healthkit/hkworkoutactivitytype/functionalstrengthtraining)
- [Apple — HKWorkoutActivityType](https://developer.apple.com/documentation/healthkit/hkworkoutactivitytype)
- [Android — Develop workout experiences with Health Connect](https://developer.android.com/health-and-fitness/health-connect/experiences/workouts)
- [Android — Health Connect release notes](https://developer.android.com/jetpack/androidx/releases/health-connect)
- [Garmin — Activity API](https://developer.garmin.com/gc-developer-program/activity-api/)
- [Garmin — Training API](https://developer.garmin.com/gc-developer-program/training-api/)
- [the5krunner — Garmin Connect+ y apps de fuerza](https://the5krunner.com/2026/03/24/garmin-connect-plus-strength-apps/) *(secundaria)*
- [React Native HealthKit — Installation](https://kingstinct-react-native-healthkit.mintlify.app/installation)
- [React Native Health Connect — Get started](https://matinzd.github.io/react-native-health-connect/docs/get-started/)
