# Fuerza CorrerJuntos — Fase 0 (diseño)

> ⚠️ **BORRADOR FASE 0 — todavía no validado por un profesional deportivo ni autorizado para implementación.**

Diseño del módulo de fuerza para corredores y atletas híbridos.

> 🔴 **Ronda 0.1 (27 ago 2026): el módulo YA EXISTE y está en producción**, sin feature
> flag, desde la v1.3.7. Lo descubrió la auditoría del código real. Empieza por
> [`11-auditoria-app-real.md`](11-auditoria-app-real.md) y
> [`12-test-esfuerzo-y-veredicto.md`](12-test-esfuerzo-y-veredicto.md): los documentos
> de la ronda 0 se escribieron sin acceso al código y dan por hecho que no existía.

| Documento | Contenido |
|---|---|
| [`00-informe-ejecutivo.md`](00-informe-ejecutivo.md) | **Empezar por aquí.** Recomendación, estimación de esfuerzo, decisiones pendientes y contradicciones detectadas |
| [`01-auditoria-competidores.md`](01-auditoria-competidores.md) | Runna, Hevy, Fitbod, TrainingPeaks, Garmin/Apple/Health Connect, con fuentes y nivel de verificación |
| [`02-producto-y-ux.md`](02-producto-y-ux.md) | Modos A/B, configuración en 2 pantallas, flujo de usuario, las 4 pantallas, accesibilidad |
| [`03-biblioteca-ejercicios.md`](03-biblioteca-ejercicios.md) | Esquema de ficha, 20 familias canónicas y 5 fichas modelo completas |
| [`04-sesiones-modelo.md`](04-sesiones-modelo.md) | Tres sesiones: sin material 20', mancuernas 30', gimnasio 40' |
| [`05-motor-calendario.md`](05-motor-calendario.md) | Reglas R0–R10 y 10 escenarios resueltos |
| [`06-progresion.md`](06-progresion.md) | Motor determinista, pseudocódigo y 15 casos de prueba |
| [`07-modelo-datos.md`](07-modelo-datos.md) | Entidades, requisitos transversales y qué exige binario nuevo |
| [`08-analitica-y-negocio.md`](08-analitica-y-negocio.md) | Eventos, embudo, guardas de parada, gratis vs Pro |
| [`09-contenido-y-derechos.md`](09-contenido-y-derechos.md) | Recursos visuales, revisión profesional, qué está prohibido |
| [`10-plan-piloto.md`](10-plan-piloto.md) | 10–15 usuarios, 4 semanas, criterios de parada y GO/NO-GO |
| [`11-auditoria-app-real.md`](11-auditoria-app-real.md) | **Ronda 0.1.** Auditoría del código real: qué existe ya, 15 supuestos contrastados, riesgos y OTA/binario |
| [`12-test-esfuerzo-y-veredicto.md`](12-test-esfuerzo-y-veredicto.md) | **Ronda 0.1.** Test con 5 usuarios, estimación revisada, veredicto y decisiones pendientes |
| [`mockups/index.html`](mockups/index.html) | Las 4 pantallas. ES/EN, claro/oscuro, fuente normal/grande |

## Reglas que atraviesan todo el diseño

- La **carrera manda siempre**. La fuerza cede; el plan de running nunca se modifica.
- **Sin sexta pestaña.** Inicio, Planes y Actividades.
- **Nunca** carga alta de piernas en las 24 h previas a series, tempo, tirada larga o competición.
- **Calorías solo con fuente autorizada.** Sin ella: «Calorías no disponibles».
- **Sin afirmaciones médicas** ni promesas de prevenir lesiones.
- Todo el contenido técnico está **pendiente de revisión profesional**.
- Nada de otras apps: ni imágenes, ni vídeos, ni textos.
