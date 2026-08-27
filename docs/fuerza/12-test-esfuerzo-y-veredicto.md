# Fases 7–9 · Test con usuarios, esfuerzo revisado y veredicto

> ⚠️ **BORRADOR FASE 0 — todavía no validado por un profesional deportivo ni autorizado para implementación.**
> Revisado tras auditar el código real (ver `11-auditoria-app-real.md`).

---

## Fase 7 · Prueba con cinco usuarios — preparada, NO ejecutada

**Cambio importante respecto a lo planeado**: como el módulo **ya está en producción**,
esto no es un test de prototipo. Es un **test de usabilidad sobre el producto vivo**,
que es mucho mejor: los usuarios tocan lo real, no un dibujo.

### Selección

| # | Perfil | Criterio de selección (consultable en base de datos) | Por qué |
|---|---|---|---|
| 1 | Principiante absoluto | Plan activo · **0** sesiones de fuerza abiertas · < 8 semanas en la app | Ve el módulo por primera vez |
| 2 | Principiante absoluto | Igual, pero con plan 0→5K | Perfil más numeroso de la base |
| 3 | Corredor con algo de fuerza | Ha abierto `StrengthSessions` **≥ 1 vez** y no ha vuelto | **El más valioso**: sabe por qué no volvió |
| 4 | Corredor con algo de fuerza | Ha completado **≥ 1** sesión de fuerza | Contraste con el 3 |
| 5 | Atleta híbrido | Entrena fuerza fuera de la app (Hevy u otra) | Compara con el estándar del mercado |

Reclutamiento propuesto: entre los usuarios activos con plan, empezando por los cuatro
clubs partner. **No contactar todavía.**

### Guion (20–25 min por persona, sin ayudar)

| # | Tarea | Qué se observa |
|---|---|---|
| 1 | Activa la fuerza | ¿La encuentra sin ayuda desde Inicio? |
| 2 | Configura material y tiempo | ¿Entiende las opciones? ¿Se atasca? |
| 3 | «Dime qué te toca hoy y por qué» | **La pregunta clave.** ¿Entiende que la sesión está colocada a propósito? |
| 4 | Empieza una sesión | ¿Duda antes de pulsar? ¿Cuánto tarda? |
| 5 | Registra una serie | ⚠️ **Hoy no se puede.** Se observa qué intenta hacer y qué espera encontrar |
| 6 | Sustituye un ejercicio | ⚠️ **Hoy no se puede.** Idem |
| 7 | Termina y explica el resumen | ¿Qué cree que ha hecho? ¿Le sirve? |

Las tareas 5 y 6 **son las más informativas precisamente porque no existen**: revelan
qué espera el usuario en el hueco que hay que construir.

### Qué se mide

| Medida | Cómo |
|---|---|
| Tiempo hasta empezar la primera sesión | Cronómetro, desde Inicio |
| Dudas | Nº de veces que pregunta o duda en voz alta |
| Errores | Toques en sitio equivocado, caminos sin salida |
| Campos que no comprende | Anotar literalmente qué palabra no entiende |
| Confianza en la sesión | «Del 1 al 5, ¿te fías de que esto no te va a estropear el domingo?» |
| Utilidad percibida | «¿Qué harías distinto la semana que viene por haber visto esto?» |
| Disposición a pagar | Al final, con la negativa como opción cómoda |
| Qué esperarían de José | «Si José te comentara esta sesión, ¿qué te diría?» |

### Mensaje propuesto (pendiente de tu autorización — **no enviado**)

> Hola {nombre} 👋 Soy Abraham, el que lleva CorrerJuntos.
> Estoy revisando la parte de fuerza de la app y me vendría genial ver a alguien
> usarla de verdad, sin que yo le ayude. Son 20 minutos por videollamada, cuando te
> venga bien, y no hay que preparar nada.
> No te voy a vender nada: lo que busco es justo lo contrario, que me digas qué no se
> entiende. ¿Te apetece?

---

## Fase 8 · Esfuerzo revisado — tras ver el código real

⚠️ **Estimaciones, no presupuesto.** Los 800–2.000 € y las 5–7 semanas de la Fase 0
quedan **anulados**: se calcularon suponiendo que había que construirlo todo.

| Bloque | Partida | Estimación | OTA/binario | Confianza | Riesgo principal |
|---|---|---|---:|---|---|
| **Producto/UX** | Diseño del registro de sesión sobre componentes reales | 2–3 días | OTA | **Alta** | Que no encaje con el `ThemeContext` existente |
| | Historial de fuerza en Actividades | 1–2 días | OTA | Media | Integrarse con el historial de carreras sin romperlo |
| **Código** | **Registro: ANTERIOR/KG/REPS/RPE/COMPLETADO** | **5–8 días** | OTA | **Alta** | Es el grueso. No existe nada |
| | Autoguardado por serie + recuperación tras cierre | 2–3 días | OTA | Alta | — |
| | Temporizador de descanso + notificación | 1–2 días | OTA | **Alta** | Ninguno: `expo-notifications` y `expo-keep-awake` ya están |
| | Sustitución de ejercicio en sesión | 2–3 días | OTA | Media | Depende de si la Edge Function ya devuelve sustitutos |
| | Récords personales | 2 días | OTA | Media | Recalcular al editar |
| | Feature flag retroactiva (decisión D10) | 1–2 días | OTA | Media | Ya hay usuarios dentro |
| **Backend** | Tablas de series realizadas + RLS | 2–3 días | — | **Baja** | **No he auditado el esquema de Supabase.** Puede que ya exista algo |
| | Extender la Edge Function `strength-engine` | 1–3 días | Servidor | **Baja** | No he leído su código: vive en Supabase |
| **Offline** | Cola de escritura + idempotencia | 3–4 días | OTA | Media | `async-storage` ya está; falta la cola |
| **QA** | Harness `strength-module-harness.cjs` extendido | 2–3 días | — | Alta | **Obligatorio**: el módulo ya tiene suite propia. Sin jest |
| | Dispositivos, offline, interrupciones, fuente grande | 3–4 días | — | Media | — |
| **Contenido** | Revisar los **30 ejercicios existentes** (no crear 20) | 2–3 días | — | Media | Puede que el contenido actual no aguante una revisión |
| **Ilustración/vídeo** | **Resolver MuscleWiki** | Ver §R1 | — | **Baja** | 🔴 Si no hay licencia: 600–1.500 € y 3–5 semanas |
| **Revisión profesional** | 30 ejercicios + 3 plantillas + reglas del motor | 3–5 semanas de calendario · 200–500 € | — | Media | **Ruta crítica si MuscleWiki está limpio** |
| **Integraciones nativas** | Apple Health / Health Connect (calorías) | 4–6 días | 🔴 **Binario** | Alta | Fuera de v1 por decisión |

### Lectura

| | Fase 0 (a ciegas) | **Fase 0.1 (con el código delante)** |
|---|---|---|
| Código | 23–35 días | **15–24 días** |
| Contenido | 5–8 días | **2–3 días** (ya existe) |
| Coste externo | 800–2.000 € | **200–500 €** si MuscleWiki está licenciado · **800–2.000 €** si no |
| Ruta crítica | Ilustraciones + revisión | **Revisión profesional** · o MuscleWiki si hay problema de derechos |

**La estimación baja porque el motor, el catálogo y la analítica ya están hechos.** Lo
que queda es casi todo el registro de la sesión, que es OTA puro.

**Confianza baja en los dos bloques de backend**: no he auditado el esquema de Supabase
ni el código de la Edge Function (fuera del alcance read-only de esta ronda). Esas dos
cifras pueden moverse mucho.

### Proveedores — tres perfiles, sin contactar

| Perfil | Para qué | Rango orientativo |
|---|---|---|
| Ilustrador vectorial freelance (deporte/fitness) | 30 ilustraciones de ejercicio, estilo de marca | 900–1.800 € |
| Banco de ilustración de ejercicios con licencia comercial | Alternativa rápida a lo anterior | 200–600 €/año |
| Entrenador titulado (CAFyD) con perfil de corredores | Revisión de contenido y de las reglas del motor | 200–500 € |

**Brief preparado** en `09-contenido-y-derechos.md`. **No se ha contactado con nadie ni
se ha pedido presupuesto.**

---

## Fase 9 · Veredicto

# 🔴 NECESITA CORRECCIONES

No es «listo para test de prototipo» y tampoco «bloqueado». Es que **el trabajo estaba
mal dirigido**, y ahora se sabe por qué.

**Por qué no es LISTO PARA TEST DE PROTOTIPO**: no hay prototipo que testear. Hay un
producto en producción. El test que procede es de usabilidad sobre lo real, y eso
requiere tu autorización para contactar usuarios.

**Por qué no es BLOQUEADO**: nada impide avanzar. La auditoría está hecha, el hueco
real está identificado (el registro de la sesión) y es OTA puro.

**Qué hay que corregir, en orden:**

1. **Aceptar que el módulo está publicado** y decidir qué hacer con eso (D10).
2. **Verificar la licencia de MuscleWiki.** Es el único riesgo legal abierto.
3. **Medir el conflicto F141 ↔ tarjeta de fuerza en Inicio** antes de tocar nada más.
4. **Reorientar el trabajo pendiente**: no diseñar motor ni catálogo (existen);
   construir el registro de la sesión, que es lo único que falta de verdad.
5. **Actualizar `CLAUDE.md`** (web y app): van 19 versiones por detrás.
6. **Cerrar la reconciliación** con el documento original, que sigue sin ser accesible.

---

## Decisiones que necesitan tu aprobación

Las de la Fase 0 siguen en pie salvo la de calorías, ya resuelta y corregida en
`CLAUDE.md`. Estas son **nuevas**, y salen de la auditoría:

| # | Decisión | Opciones | Mi recomendación |
|---|---|---|---|
| **D10** | **El módulo ya está publicado sin flag** | (a) Dejarlo y medir · (b) Añadir flag retroactiva y reducir exposición · (c) Retirar de Inicio hasta cerrar F141 | **(c) mientras F141 esté en medición**, luego (a). La tarjeta de fuerza compite con la de activación del primer entrenamiento, que es tu prioridad #1 declarada |
| **D11** | **GIFs de MuscleWiki** | (a) Verificar licencia · (b) Sustituir por ilustración propia · (c) Dejarlo | **(a) ya**, y si no hay licencia, **(b)**. Es riesgo legal y de rotura de CDN |
| **D12** | ¿Contacto a los 5 usuarios del test? | Sí · no todavía | **Sí**, es lo más barato que puedes hacer esta semana |
| **D13** | ¿Actualizo `CLAUDE.md` con el estado real (v1.3.25, módulo existente)? | Sí · no | **Sí.** Esta ronda entera se diseñó a ciegas por culpa de esa memoria desfasada |
| **D14** | ¿Actualizo el gitlink del submódulo en el repo web? | Sí · no | Sí, pero es cosmético. Baja prioridad |
| **D15** | ¿Audito el esquema de Supabase y la Edge Function `strength-engine`? | Sí · no | **Sí**, en la próxima ronda. Es el único bloque con confianza baja en la estimación |

---

## Autorización mínima recomendada para la siguiente ronda

Para que la siguiente ronda sea útil, necesito **como mínimo**:

1. **El documento original** — commiteado o pegado en el chat.
2. **Lectura del esquema de Supabase** y del código de la Edge Function `strength-engine`
   (solo lectura). Sin esto, dos bloques de la estimación siguen con confianza baja.
3. **Respuesta a D10 y D11** — son las dos que condicionan todo lo demás.

Y **no** necesito todavía: permiso para escribir código, para tocar Supabase, ni para
contactar con proveedores.
