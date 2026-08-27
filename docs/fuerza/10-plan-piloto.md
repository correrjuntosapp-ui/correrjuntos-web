# Fase 10 · Plan de piloto

> **No se ejecuta en esta ronda.** Queda diseñado para cuando F141 y D+1 estén
> medidos, la activación resuelta y el founder dé autorización expresa.

## 1. Forma del piloto

| | |
|---|---|
| Participantes | **10–15 voluntarios**, reclutados entre usuarios activos con plan de carrera en marcha |
| Duración | **4 semanas** |
| Plataforma | **Android primero.** Motivo: el despliegue es más rápido y reversible que en iOS, y si aparece un problema de plataforma se descubre antes y sin depender de un ciclo de revisión de Apple |
| Exposición | **Cero exposición pública.** Flag por lista de usuarios; sin nota de versión, sin anuncio, sin blog, sin redes |
| Requisito de entrada | Plan de running activo + al menos 2 actividades registradas en los últimos 14 días |
| Consentimiento | Explícito: se les dice que es una prueba, que puede fallar y que pueden salirse cuando quieran |

## 2. Criterios técnicos de parada

Cualquiera de estos detiene el piloto **el mismo día**:

| # | Criterio |
|---|---|
| P1 | Cualquier guarda G1–G7 de `08-analitica-y-negocio.md` incumplida |
| P2 | Una sola sesión de usuario perdida por fallo de sincronización |
| P3 | Una sola sesión duplicada |
| P4 | Un valor de calorías mostrado sin fuente |
| P5 | El motor coloca carga alta de piernas la víspera de una sesión clave |
| P6 | Cualquier movimiento del embudo principal fuera del grupo del piloto |
| P7 | Un participante reporta molestia física que atribuye a una sesión → parada y revisión con el profesional que revisó el contenido |

## 3. Métricas de uso a recoger

| Métrica | Qué respondería |
|---|---|
| % que completa la configuración | ¿Las dos pantallas son suficientes o sobran preguntas? |
| % que completa la 1.ª sesión | ¿La pantalla de entrenamiento activo funciona? |
| % que completa la 2.ª | **La más importante**: ¿vuelven? |
| Sesiones completadas por participante en 4 semanas | Uso real, no intención |
| Ejercicios sustituidos / saltados y su motivo | ¿El catálogo y el filtro de material aciertan? |
| `collision_resolved` con `ignorada_por_usuario` | ¿Se creen el motor? |
| Uso de RPE | ¿Se usa o sobra la columna? |
| Sesiones iniciadas sin conexión | ¿Era necesario el offline o fue sobreingeniería? |
| Cumplimiento del plan de running (antes/durante) | **G1** — que la fuerza no rompa lo que ya funciona |

## 4. Entrevista final

15–20 minutos por participante, entre 8 y 12 personas. Guion:

1. ¿Cuántas sesiones has hecho de las que te tocaban? ¿Qué pasó con las que no?
2. Cuando te movimos una sesión y te dijimos por qué, ¿te lo creíste? ¿Lo leíste siquiera?
3. ¿Has notado que la fuerza te haya estropeado algún entrenamiento de carrera?
4. ¿Qué hiciste la primera vez que no sabías qué peso poner?
5. ¿Echaste de menos algún ejercicio? ¿Sobraba alguno?
6. Si mañana esto costara 4,99 €/mes, ¿lo pagarías? ¿Por qué no?
7. ¿Qué le dirías a un amigo corredor sobre esto en una frase?

La pregunta 6 se hace **al final** y con la respuesta negativa como opción cómoda. La 7
es la que dice si el posicionamiento se ha entendido.

## 5. Rollback

| Escenario | Acción |
|---|---|
| Parada técnica | Cerrar la flag. El módulo desaparece de la interfaz al instante. **Los datos del usuario NO se borran** |
| Decisión NO-GO | Flag cerrada indefinidamente. Datos conservados. Tablas `strength_*` intactas por si se retoma |
| Retirada definitiva | Exportar a cada participante su historial antes de eliminar nada. Nunca borrar sin avisar |

El rollback es trivial **porque el módulo está aislado**: prefijo propio en las tablas,
sin pestaña nueva, sin tocar el motor de running. Ese aislamiento es el precio que
paga el diseño para poder equivocarse barato.

## 6. Decisión GO / NO-GO

Se toma al terminar la semana 4, con datos sobre la mesa.

**GO si se cumplen las tres:**
1. ≥ 60 % de los participantes completó **al menos 2** sesiones.
2. **Cero** guardas incumplidas en las 4 semanas.
3. ≥ 4 de cada 10 entrevistados dice, sin que se le sugiera, que la colocación
   automática de la sesión le aportó algo.

**NO-GO si cualquiera de estas:**
- Alguna guarda incumplida.
- < 40 % completó 2 sesiones.
- El cumplimiento del plan de running empeoró.
- Nadie menciona la integración con el plan como valor → el posicionamiento no se
  sostiene, y sin él esto es una app de gimnasio mediocre más.

**Zona intermedia** → prórroga de 4 semanas con los ajustes concretos que salgan de
las entrevistas, no ampliación del alcance.
