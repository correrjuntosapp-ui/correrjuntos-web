# Fuerza CorrerJuntos · Fase 0 — Informe ejecutivo

> ⚠️ **BORRADOR FASE 0 — todavía no validado por un profesional deportivo ni autorizado para implementación.**

**Fecha**: 27 ago 2026 · **Rama**: `claude/fuerza-correr-juntos-tylacr` · **Estado**: diseño, sin implementar
**Alcance de esta ronda**: investigación, producto, UX, contenido, arquitectura y medición. Sin código, sin SQL, sin commit.

---

## ⚠️ ACTUALIZACIÓN RONDA 0.1 (27 ago 2026) — LEE ESTO ANTES QUE EL RESTO

**El módulo de fuerza ya existe y está en producción.** 4.627 líneas de código vivo,
motor propio en una Edge Function de Supabase, 30 ejercicios, 75 variantes, 9 sesiones,
18 eventos de analítica, entrada desde Inicio y bloque de venta en el paywall.
**Sin feature flag.** Existe desde la v1.3.7; la app va por la **v1.3.25 build 110**.

**Todo lo que hay por debajo de esta sección se escribió sin acceso al código de la app
y da por hecho que el módulo no existía.** Sigue siendo válido en la forma (las cuatro
pantallas, la política de calorías, el criterio de fatiga), pero **no en el diagnóstico
ni en la estimación**. Lo que manda es:

| Documento | Qué corrige |
|---|---|
| **`11-auditoria-app-real.md`** | Qué existe realmente, con evidencia archivo:línea. 15 supuestos contrastados |
| **`12-test-esfuerzo-y-veredicto.md`** | Estimación revisada, test con usuarios y **veredicto** |
| `04-sesiones-modelo.md` | Reescrito: tres niveles de fatiga en vez de tres sesiones pesadas |
| `02-producto-y-ux.md` §6 | Mapeo a componentes reales y tokens reales |

**Veredicto de la ronda 0.1: 🔴 NECESITA CORRECCIONES.**

**Lo que sigue siendo cierto de este informe**: el hueco real es el **registro de la
sesión** (ANTERIOR/KG/REPS/RPE/COMPLETADO, autoguardado, récords) — la única pieza que
la app no tiene y que sí diseñé. Y es **OTA puro**.

**Lo que ya NO es cierto**: que hubiera que diseñar el motor de colisiones (existe),
crear el catálogo (existe), definir la analítica (existe) o que hicieran falta 23–35
días de código y 800–2.000 € (ver estimación revisada).


---

## 1. Recomendación (ronda 0.1: leer con la actualización de arriba)

**Recomiendo GO al diseño (hecho) y NO-GO a empezar a construir todavía.** No por el
diseño, que está listo, sino por tres motivos concretos:

1. **El bloqueante no es técnico, es contenido.** El módulo entero cabe casi por
   completo en una actualización OTA. Lo que no cabe en días son las 20 fichas de
   ejercicio, los 20 recursos visuales y **la revisión de un profesional cualificado**,
   que es obligatoria y es una dependencia externa de 3–5 semanas.
2. **La regla de publicación ya acordada sigue mandando**: nada se libera hasta que
   F141 y D+1 estén medidos y la activación esté resuelta. Construir ahora significa
   tener código terminado esperando meses, que es la peor forma de gastar el tiempo.
3. **El norte del proyecto no ha cambiado.** Los clubs siguen siendo el camino a
   1.000 €/mes. Este módulo es una palanca de retención y de pago, no de ingresos a 30 días.

**Lo que sí recomiendo hacer ya, y es barato**: encargar los 20 recursos visuales y
cerrar al revisor profesional. Son las dos únicas partidas con plazo largo. Si se
arrancan ahora en paralelo, cuando el gate de F141/D+1 se abra el contenido ya estará
listo y el código son semanas, no meses.

## 2. La tesis del producto, en una frase

> «El plan de fuerza que sabe qué carrera preparas, qué sesión de running tienes mañana
> y qué levantaste la última vez.»

De las tres partes, **la del medio es la única que nadie más tiene**. Hevy registra
mejor que nosotros. Fitbod adapta mejor que nosotros. Runna integra, pero sus propios
usuarios se quejan de que la selección no respeta el contexto de la semana. La
característica que justifica este módulo es una frase en una tarjeta:

> «Movida al jueves para proteger tus series del miércoles.»

Si esa frase no le importa a nadie en el piloto, el módulo no tiene razón de ser y
conviene saberlo con 12 personas, no con 690.

## 3. Qué se ha producido

| # | Entregable | Dónde |
|---|---|---|
| 1 | Informe ejecutivo con recomendación | este documento |
| 2 | Matriz de competidores con fuentes | `01-auditoria-competidores.md` |
| 3 | Flujo completo de usuario | `02-producto-y-ux.md` §3 |
| 4 | Mockups de las 4 pantallas (ES/EN, claro/oscuro, fuente grande) | `mockups/index.html` |
| 5 | Catálogo de familias de ejercicios (20) | `03-biblioteca-ejercicios.md` §2 |
| 6 | Cinco fichas modelo completas | `03-biblioteca-ejercicios.md` §3 |
| 7 | Tres sesiones modelo | `04-sesiones-modelo.md` |
| 8 | Tabla de colisiones del calendario (R0–R10 + 10 escenarios) | `05-motor-calendario.md` |
| 9 | Reglas de progresión + pseudocódigo + 15 casos de prueba | `06-progresion.md` |
| 10 | Modelo de datos propuesto | `07-modelo-datos.md` |
| 11 | Eventos y embudo | `08-analitica-y-negocio.md` §1–2 |
| 12 | Gratis vs Pro y momento de venta | `08-analitica-y-negocio.md` §4–5 |
| 13 | Plan de contenido y derechos audiovisuales | `09-contenido-y-derechos.md` |
| 14 | Dependencias técnicas: OTA vs binario | `07-modelo-datos.md` §4 |
| 15 | Plan de piloto | `10-plan-piloto.md` |
| 16 | Estimación de esfuerzo | §5 de este documento |
| 17 | Decisiones que necesitan aprobación del founder | §6 de este documento |

## 4. Hallazgos que cambian decisiones

| # | Hallazgo | Consecuencia |
|---|---|---|
| H1 | **Ninguna plataforma de salud da series/reps/carga fiables.** HealthKit no tiene tipo de dato para ello; el Activity API de Garmin es de solo lectura y los terceros no empujan datos a nivel de serie | El detalle de la sesión es nuestro, en nuestra base de datos, siempre |
| H2 | **Leer calorías exige binario nuevo.** Los módulos de HealthKit y Health Connect en Expo requieren build nativo; no llegan por OTA | El MVP sale por OTA **sin calorías**, mostrando «Calorías no disponibles». La lectura entra en el siguiente binario ordinario |
| H3 | **Las tres sesiones modelo tienen carga de piernas alta** — es inevitable, porque su función es servir para correr | El motor de colisión **no es un extra**: sin él, este contenido perjudica el plan del usuario |
| H4 | **Runna ya integra fuerza y plan**, con quejas públicas sobre la calidad de la selección | No inventamos categoría. Competimos en ejecución y en transparencia de la decisión |
| H5 | **La revisión profesional es la ruta crítica**, no el código | Arrancarla ya, en paralelo, es lo único que acorta la fecha real |

## 5. Estimación de esfuerzo

⚠️ **Son estimaciones, no compromisos ni presupuestos.** Están hechas sin poder leer el
código de la app (ver §7). Un margen de ±40 % es realista.

| Bloque | Partida | Estimación | Depende de |
|---|---|---|---|
| **Código** | Pantallas (config, tarjeta Hoy, entreno activo, resumen, historial) | 8–12 días | — |
| | Registro offline-first + cola de sincronización + idempotencia | 4–6 días | Almacén local ya presente en el binario |
| | Motor de calendario (R0–R10) + recálculo | 3–5 días | Acceso al motor de planes existente |
| | Motor de progresión + récords | 2–3 días | — |
| | Feature flag + analítica + guardas | 2–3 días | Si ya existe sistema de flags |
| | Integración Apple Health / Health Connect (calorías) | 4–6 días | **Binario nuevo** |
| | **Subtotal código** | **23–35 días** | |
| **Contenido** | 15 fichas restantes (las 5 modelo ya están) | 3–5 días | Formato validado |
| | Textos de interfaz + motivos del motor, ES y EN | 2–3 días | — |
| | **Subtotal contenido** | **5–8 días** | |
| **Diseño** | Paso de wireframe a diseño final con los componentes reales | 3–5 días | Acceso al sistema de componentes |
| **Revisión profesional** | 20 fichas + 3 sesiones + tabla del motor | **3–5 semanas de calendario** · 200–500 € | **Externo. Ruta crítica** |
| **Recursos visuales** | 20 ilustraciones propias | **3–5 semanas de calendario** · 600–1.500 € | **Externo. Ruta crítica** |
| **QA** | Matriz de dispositivos, offline, interrupciones, accesibilidad, fuente grande | 4–6 días | — |
| | Piloto de 4 semanas + entrevistas | **4 semanas de calendario** + 2–3 días de análisis | GO del founder |

**Lectura**: unas **5–7 semanas de trabajo de desarrollo**, pero **el calendario real lo
marcan las dos partidas externas** (revisión profesional e ilustraciones), que suman
3–5 semanas y pueden correr en paralelo desde hoy. Coste externo total estimado:
**800–2.000 €**.

## 6. Decisiones que necesitan tu aprobación

| # | Decisión | Opciones | Mi recomendación |
|---|---|---|---|
| **D1** | **Contradicción de calorías** (ver §7) | (a) Sin estimación propia nunca, «Calorías no disponibles» · (b) Estimación propia etiquetada con fuente y precisión, como decía la spec de ayer | **(a)**. La estimación de kcal en fuerza tiene un error enorme; una etiqueta no arregla un número inventado |
| **D2** | Recursos visuales | Ilustración propia · foto propia · stock · sin visual | **Ilustración propia** (600–1.500 €) |
| **D3** | Revisor profesional | ¿Quién y con qué presupuesto? | Cerrarlo **ya**: es la ruta crítica |
| **D4** | ¿Se arranca el contenido ahora, en paralelo, con la flag cerrada? | Sí · esperar al gate de F141/D+1 | **Sí**, solo contenido. El código espera |
| **D5** | Modo B (atleta híbrido) en el MVP | Dentro · fuera | **Fuera del MVP**, tal como ya está decidido. Entra si la v1 tracciona |
| **D6** | Historial gratis limitado a 4 semanas | 4 semanas · ilimitado | 4 semanas. Es el límite menos hostil de los posibles |
| **D7** | Piloto Android primero | Android · ambas · iOS | **Android primero** |
| **D8** | ¿Se pide peso corporal? | Sí · no | **No** en el MVP. Sin calorías propias, no hace falta para nada |
| **D9** | 20 familias vs. 40–60 ejercicios | Ver §7 | 20 familias + variantes por material ≈ 40–60 ejercicios visibles. Se cumplen las dos cifras |

## 7. Contradicciones detectadas — no he decidido por ti

Tal como pide la restricción, las documento y **paro antes de tomar una decisión
irreversible**. Ninguna de las dos me ha impedido completar la Fase 0, porque el
diseño está escrito para poder cambiar de opción sin rehacerlo.

### C1 · Calorías — contradicción real entre lo acordado ayer y hoy

| Fuente | Qué dice |
|---|---|
| `CLAUDE.md`, memorizado el 26 ago | «Primero dato de dispositivo. **Después estimación por peso + duración + intensidad.** Siempre indicar fuente y precisión» |
| Encargo de hoy | «**No calcular calorías con fórmulas propias en el MVP.** Sin fuente válida: mostrar "Calorías no disponibles"» |

**He diseñado según el encargo de hoy** (la opción más restrictiva y más reciente):
sin estimación propia. Si confirmas la opción (a) de **D1**, hay que **actualizar
`CLAUDE.md`** para que la memoria no siga diciendo lo contrario — eso sería un cambio
al documento, y no lo hago sin que me lo digas.

**Alternativa (b)**, si prefieres mantener lo de ayer: la estimación entraría como
campo aparte (`kcal_estimada`, nunca en el mismo sitio que `kcal` de fuente
autorizada), siempre con el rango de error visible. El modelo de datos ya lo permite
sin cambios.

### C2 · Tamaño de la biblioteca — aparente, se reconcilia

`CLAUDE.md` dice «40–60 ejercicios»; el encargo de hoy dice «~20 familias con variantes
por material». **No es un conflicto real**: 20 familias × variantes de material
producen entre 40 y 60 ejercicios distintos de cara al usuario. Lo he diseñado como
20 familias canónicas con variantes, que satisface ambas cifras. Sin acción necesaria,
salvo que quieras que lo deje anotado en `CLAUDE.md`.

### C3 · «Máximo tres días de diseño» vs. el alcance total

La ronda de diseño cabe en el plazo, y está entregada. Lo que **no** cabe en tres días
son las 15 fichas restantes, los recursos visuales y la revisión profesional. No es un
incumplimiento: son trabajo de contenido y dependencias externas, no diseño. Lo señalo
para que la cifra de «3 días» no se lea como «el módulo estará listo en 3 días».

## 8. Limitaciones de esta ronda — lo que no he podido verificar

1. **El submódulo `correr-juntos-app` no está disponible en este entorno** (sin mapeo en
   `.gitmodules`). No he podido leer componentes, tipografías, espaciados ni el motor de
   planes. Todo lo relativo a reutilizar el diseño existente son **supuestos a validar**.
2. **Dos capacidades quedan sin confirmar** y son la única duda entre «todo por OTA» y
   «hace falta binario»: notificación de fin de descanso en segundo plano, y
   temporizador con la pantalla apagada. Hay que mirarlo en el código.
3. **`support.runna.com` está bloqueado por el proxy de egreso**; lo de Runna procede de
   su web pública y de resultados de búsqueda que citan su centro de ayuda. Marcado
   como tal en la auditoría.
4. **`docs/fuerza-atletas-hibridos-plan-producto-2026-08-26.md` no existe** en el repo.
   Si ese documento existe fuera de aquí, conviene contrastarlo con lo entregado.
5. **Los objetivos del embudo (§2 de analítica) son hipótesis mías**, no datos. No hay
   base histórica del módulo.

## 9. Qué NO se ha hecho, por restricción

Sin implementación, sin código de producción tocado, sin SQL, sin migraciones, sin
cambios en Supabase, sin commit, sin push, sin PR, sin deploy, sin OTA, sin build, sin
tocar `app.json`/`eas.json`, sin permisos nuevos, sin compras ni licencias, sin mensajes
externos, sin publicar nada. F141, F144, D+1, paywall, José, Ana y onboarding intactos.
