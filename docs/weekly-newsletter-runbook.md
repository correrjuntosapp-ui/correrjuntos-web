# CorrerJuntos Semanal — runbook

Newsletter de los lunes, **automática de principio a fin**.

Viernes prepara → domingo verifica → lunes envía. **Nadie tiene que aprobar nada cada semana**: la prueba del viernes llega al correo del responsable para que pueda mirarla, pero no hay que contestar. Si nadie dice nada, la edición sale. La intervención humana solo hace falta para **frenar** una semana concreta o para apagar el sistema entero.

Esta es la única operación vigente. Si encuentras instrucciones que digan que hay que pasar el pick a `ready` a mano, están obsoletas.

---

## Cómo funciona

| Pieza | Dónde |
|---|---|
| Contenido de la semana | fila en `public.weekly_newsletter` |
| Plantilla | `api/_lib/jobs/weekly-newsletter.js` |
| Lista blanca editorial | `data/newsletter-catalog.json` |
| Bloques aprobados | `data/newsletter-block-library.json` |
| Disparos | cron `/api/cron/run?job=…` (ver tabla de horarios más abajo) |
| Destino | Brevo **lista 3** (suscriptores del blog). Nunca la tabla `profiles` |
| Remitente | `BREVO_SENDER_EMAIL` en Vercel → `hola@correrjuntos.com` |
| Interruptor | `WEEKLY_NEWSLETTER_AUTOMATION_ENABLED` en Vercel |

El cron del lunes solo envía si encuentra un pick con **las tres condiciones**: `status='ready'`, `week_of` = lunes actual y `sent_at IS NULL`. Si falta cualquiera, no envía nada y lo dice en `outcome`.

⚠️ `abraham.marquez@correrjuntos.com` **no está activo en Brevo**. Si alguien cambia el remitente a esa dirección, la campaña ni se crea.

---

## Semana tipo (no requiere a nadie)

**Viernes — `weekly-newsletter-prepare`.** Elige un artículo de la lista blanca, monta los cuatro bloques, comprueba que el artículo y todos los enlaces responden 200, renderiza el correo, crea el pick, manda la prueba a `guetto2012@gmail.com` y **lo deja en `ready` él solo**.

**La prueba es informativa.** Llega para que puedas mirarla, no para que respondas. Si no contestas, el lunes sale igual. Si algo no te gusta, tienes hasta el lunes a las 10:00 para pausarla (más abajo).

**Domingo — `weekly-newsletter-preflight`.** Comprueba que hay exactamente un `ready` para el lunes y que el artículo sigue vivo. Si falta el pick, lo prepara. Si el viernes se quedó a medias en un `draft` automático, lo reanuda **una** vez. Si no puede dejarlo listo, manda un aviso. **Nunca envía a la lista.**

**Lunes 10:00 Madrid — `weekly-newsletter`.** Envía con la máquina `ready → sending → sent`.

**Martes — métricas.** Aperturas, clics y bajas en Brevo.

### Si una semana no sale

No pasa nada: no hay newsletter esa semana. El sistema nunca improvisa contenido ni fuerza un envío. Los avisos del domingo dicen qué falló.

---

## Regla de oro: un solo canal

⛔ **Jamás programar la misma campaña desde el panel de Brevo.** El cron del lunes es la única vía de envío. Programar a mano en paralelo produce un envío duplicado, y ya pasó una vez: el 3 de agosto se programó desde el panel y la fila se quedó en `draft` porque el job nunca intervino.

**Brevo sigue siendo la fuente de verdad de lo que se ha enviado.** Un `status` en la tabla dice lo que hizo *el job*, no lo que llegó a los buzones. Ante cualquier duda sobre si un correo salió, se mira Brevo.

---

## Emergencias

**El cron no se ejecutó el lunes.** Comprobar primero que el dispatcher responde: una petición sin `Authorization` debe devolver **401**, no 500. Un 500 significa que el módulo no carga y ningún job funciona. Si todo está bien, se puede disparar a mano con el Bearer correcto — el job es seguro de repetir: si la fila ya está `sent`, no vuelve a enviar.

**Brevo rechaza la campaña.** `Sender is invalid / inactive` → remitente no verificado. No probar otros remitentes a ciegas: revisar cuál está activo en Brevo y ajustar `BREVO_SENDER_EMAIL`.

**Se envió algo equivocado.** No se puede recuperar. Se prepara una fe de erratas como pick de la semana siguiente; no se reenvía la misma campaña corregida.

---

## Plantilla de contenido

Esquema `blocks` versión 1. Tipos admitidos: `training`, `coach`, `race`, `tool`. Cualquier otro se ignora. **Nada de HTML**: todo se escapa al renderizar y las URLs deben ser `http(s)`.

```json
{
  "week_of": "YYYY-MM-DD",
  "status": "draft",
  "campaign_name": "Weekly · YYYY-MM-DD · <tema>",
  "subject": "<asunto, sin clickbait>",
  "preheader": "<una frase que complete el asunto>",
  "title": "<H1 del correo, distinto del asunto>",
  "excerpt": "<intro de 2-3 frases>",
  "url": "https://www.correrjuntos.com/blog/<slug>",
  "image_url": "https://www.correrjuntos.com/public/blog-images/<...>",
  "cta_label": "<verbo + beneficio>",
  "utm_campaign": "weekly-YYYY-MM-DD-<tema>",
  "blocks": {
    "version": 1,
    "items": [
      { "type": "training", "title": "Entrenamiento de la semana",
        "items": ["<paso 1>", "<paso 2>"],
        "meta": "<nota de prudencia>" },
      { "type": "coach", "title": "Consejo del equipo CorrerJuntos",
        "text": "<consejo>" },
      { "type": "race", "title": "Carrera recomendada", "text": "<contexto>",
        "url": "https://www.correrjuntos.com/carreras",
        "link_text": "Encuentra tu próxima carrera" },
      { "type": "tool", "title": "Herramienta de la semana", "text": "<para qué sirve>",
        "url": "https://www.correrjuntos.com/calculadora",
        "link_text": "Calculadora de ritmos" }
    ]
  }
}
```

Con `blocks` válidos el eyebrow es **«CorrerJuntos Semanal»**; con `blocks` nulos o inválidos vuelve a **«El artículo del lunes»**, para que los picks antiguos no cambien.

### Reglas editoriales

- **No atribuir frases al Coach José** sin texto aprobado por él. Si no lo hay: «Consejo del equipo CorrerJuntos».
- **No inventar carreras.** Si no hay una prueba futura verificada (fecha, lugar y URL), usar el buscador con «Encuentra tu próxima carrera».
- **No crear herramientas** para un envío. Enlazar una existente y comprobar que responde 200.
- **Nada médico** ni promesas de resultados.
- Verificar **200** en todos los enlaces antes de la prueba.

---

## Automatización (desde 2026-08-17)

La newsletter ya no necesita que nadie la apruebe cada semana. Tres tareas encadenadas:

| Cron UTC | Job | Hora local verano (CEST) | Hora local invierno (CET) |
|---|---|---|---|
| `0 7 * * 5` | `weekly-newsletter-prepare` | viernes **09:00** | viernes **08:00** |
| `0 8 * * 0` | `weekly-newsletter-preflight` | domingo **10:00** | domingo **09:00** |
| `0 8 * * 1` + `0 9 * * 1` | `weekly-newsletter` | lunes **10:00** (actúa el de las 08:00) | lunes **10:00** (actúa el de las 09:00) |

⚠️ **Prepare y preflight se desplazan una hora con el cambio de estación**, y no pasa nada: no tienen hora crítica. El único que mantiene las 10:00 todo el año es el envío, y por eso lleva dos disparos.

**Los dos disparos del lunes son intencionados.** Ambos cron se ejecutan siempre; la guarda `isSendWindowMadrid` deja pasar solo al que cae en la **hora local 10** (10:00–10:59). En verano es el de las 08:00 UTC, en invierno el de las 09:00. El otro responde `outside_send_window` sin tocar Brevo ni la base de datos.

**Por qué la hora entera y no quince minutos:** en el plan Hobby de Vercel los cron pueden ejecutarse con retraso dentro de su hora. Una ventana de 15 minutos perdería esos envíos. Está diseñado para el caso peor, y no he podido verificar que el proyecto sea Pro. Si un disparo se retrasase más allá de las 10:59 locales, esa semana no saldría — el aviso del domingo no lo cubre, se detectaría el martes al mirar métricas.

Aunque ambos disparos entrasen en ventana, la toma atómica del pick (`update … where status='ready'`) impide el segundo envío.

### Qué puede elegir el sistema

Solo lo que esté en **`data/newsletter-catalog.json`**, la lista blanca. Un artículo es elegible únicamente si declara `enabled:true`, `affiliate:false`, `promotional:false`, `draft:false` y `language:"es"`. **Un campo que falte hace el artículo inelegible**: nunca se asume que algo es seguro.

⛔ **Un artículo nuevo del blog no entra solo.** Hay que revisarlo a mano y añadirlo. Y jamás se marca `affiliate:false` un artículo con enlaces monetizados: `correr-en-verano-calor` está en el catálogo con `affiliate:true, enabled:false` y su motivo, precisamente para que quede constancia de por qué no puede salir.

Los bloques salen de `data/newsletter-block-library.json`, rotan por identificador y no se repiten en semanas seguidas. Nada se atribuye al Coach José.

### Cómo cancelar o pausar una semana

```sql
-- Saltarse la edición de una semana concreta:
update public.weekly_newsletter set status = 'cancelled'
where week_of = 'YYYY-MM-DD';

-- Aparcarla sin descartarla del todo:
update public.weekly_newsletter set status = 'paused'
where week_of = 'YYYY-MM-DD';
```

**Ningún job sobrescribe `paused` ni `cancelled`.** `prepare` ve que ya hay fila y no toca nada; `preflight` lo reporta como decisión humana y no alerta; el lunes responde `skipped_paused`. Para reactivarla, se vuelve a poner en `ready`.

Si la edición aún no existe (antes del viernes), basta con crear la fila directamente en `cancelled`: `prepare` la respetará.

### Recuperar un `draft` automático a medias

Si el viernes se interrumpió después de crear la fila (Brevo no aceptó la prueba, falló la promoción, se cortó el proceso), el pick se queda en `draft` con `auto_prepared = true`. **No hay que tocarlo a mano.**

Lo reanuda solo el preflight del domingo, y también puede lanzarse cuando quieras:

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" "https://www.correrjuntos.com/api/cron/run?job=weekly-newsletter-prepare"
```

La reanudación **no crea una segunda fila ni una segunda campaña de test**: el `test_campaign_id` se guarda —y se confirma— antes de usarse, así que un reintento reutiliza el mismo. El único efecto secundario posible es que **tú recibas dos correos de prueba**. Es deliberado: se prefiere duplicar una prueba interna antes que arriesgar un envío duplicado a la lista, que sigue protegido por la máquina de estados del lunes.

⚠️ Un `draft` con `auto_prepared = false` es un borrador escrito por una persona. Ningún job lo toca: solo se avisa. Si querías que saliera, pásalo a `ready`; si no, a `cancelled`.

### Ensayo en seco (`dry_run`)

Recorre todo el camino de decisión y validación sin escribir nada, sin crear campañas y sin enviar. **Funciona incluso con la automatización apagada**, que es justo como se usa tras un despliegue para comprobar que los JSON se empaquetaron, que los enlaces responden y que el artículo elegido es el esperado:

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" "https://www.correrjuntos.com/api/cron/run?job=weekly-newsletter-prepare&dry_run=1"
```

Devuelve un resumen: artículo, categoría, si venía reservado, asunto, preheader, ids de bloques, enlaces comprobados y tamaño del HTML. Cero escrituras, cero llamadas a Brevo.

### Apagar toda la automatización

Variable de entorno en Vercel, sin tocar código ni borrar cron:

```
WEEKLY_NEWSLETTER_AUTOMATION_ENABLED=false   # o simplemente borrarla
```

Con eso los tres jobs terminan sin hacer nada. **Es fail-closed**: solo se activa con `true`, `1`, `on` o `yes`. Ausente, vacía o cualquier otro valor = apagada. El `dry_run` sigue funcionando.

### Cómo saber qué pasó un lunes

El campo `outcome` de la respuesta distingue: `sent`, `skipped_no_pick`, `skipped_paused`, `outside_send_window`, `automation_disabled`. En la fila quedan `auto_prepared`, `prepared_at`, `ready_at`, `selected_article`, `category`, `test_campaign_id`, `block_ids` y `last_error`.

⚠️ `test_campaign_id` y `brevo_campaign_id` son columnas distintas a propósito: la primera guarda la campaña de prueba del viernes, la segunda solo la campaña real del lunes. Una prueba nunca puede confundirse con un envío.

### Cuando el catálogo se queda corto

`prepare` devuelve `low_catalog: true` cuando quedan menos de cuatro artículos sin usar. Es el momento de ampliar la lista blanca. Hoy hay **16 artículos** aprobados en nueve categorías: con cooldown de 12 ediciones eso garantiza candidato todas las semanas, pero el margen es de cuatro. Cuanto más crezca el catálogo, más holgada será la rotación y menos se repetirán los temas.

---

## Máquina de estados: por qué no se puede enviar dos veces

`draft → ready → sending → sent`

El orden importa: **primero se deja constancia de que vamos a enviar y solo después se envía.**

1. Se crea la campaña en Brevo (queda en borrador, no sale nada).
2. Se escribe en la fila `status='sending'`, `sending_at` y `brevo_campaign_id`.
3. Se comprueba que Supabase confirmó esa escritura devolviendo la fila. **Si no la confirma, no se envía** — un envío que no podemos registrar es un envío que mañana se repetiría.
4. `sendNow`, una sola vez.
5. Se marca `sent` y también se comprueba el resultado.

La escritura del paso 2 es **atómica**: el `UPDATE` exige a la vez `id`, `week_of`, `status='ready'`, `sent_at IS NULL` y `brevo_campaign_id IS NULL`. Solo se envía si Postgres devuelve exactamente una fila.

### Campañas huérfanas en Brevo

Si dos ejecuciones coinciden, ambas crean su campaña en borrador pero solo una consigue la toma. La perdedora responde `pick_already_claimed` con `orphan_campaign_id` y **deja su borrador en Brevo sin tocarlo**: no se borra ni se cancela automáticamente, porque un borrado automático sobre el id equivocado sí sería irreversible.

Esos borradores no envían nada por sí solos. **Limpieza manual**: buscar en Brevo campañas `Weekly · …` en estado borrador duplicadas y eliminarlas a mano. Merece la pena revisarlo el martes, junto con las métricas.

### Un pick en `sending` nunca se reenvía

Si el proceso muere en cualquier punto posterior al paso 3, la fila queda en `sending`. La siguiente ejecución del cron la recoge y **solo consulta** el estado de esa campaña en Brevo:

| Brevo responde | Qué hace el cron |
|---|---|
| `sent` (literal) | Sincroniza la fila a `sent` con la fecha de Brevo. No reenvía |
| `draft` | Nada. Conserva `sending`, anota `manual_recovery_required` y para |
| Cualquier otro valor | Nada. Conserva `sending`, anota `manual_recovery_unknown_state` y para |
| No responde | Nada. Anota `recovery_status_unavailable` y para |

**Desde la recuperación no se llama nunca a `sendNow` ni se crea una segunda campaña.** Priorizamos no duplicar frente a garantizar el envío: es preferible que una semana no salga el correo a que 171 personas lo reciban dos veces.

Por eso, **una fila atascada en `sending` siempre requiere una persona.** Mirar la campaña en el panel de Brevo y decidir:

```sql
-- Si Brevo confirma que salió:
update public.weekly_newsletter
set status='sent', sent_at='<fecha de Brevo>', recipients=<n>, last_error=null
where week_of='YYYY-MM-DD';

-- Si Brevo confirma que NO salió y quieres reintentarlo:
update public.weekly_newsletter
set status='ready', brevo_campaign_id=null, sending_at=null, last_error=null
where week_of='YYYY-MM-DD';
```

⚠️ Antes de devolver un pick a `ready`, **borrar o descartar la campaña anterior en Brevo**. Si no, quedan dos campañas con el mismo contenido.

`last_error` solo guarda códigos internos (`send_failed`, `sent_update_failed`, `manual_recovery_required`, `manual_recovery_unknown_state`, `recovery_status_unavailable`). Nunca respuestas de Brevo ni trazas: el detalle está en los logs de Vercel.

---

## Cómo ampliar el catálogo

**No hay nada que hacer cada semana.** El sistema elige, prepara y envía solo. La única tarea recurrente es que el catálogo no se agote.

Para añadir un artículo a la lista blanca:

1. **Leerlo.** Que sea editorial: no una review, ni una comparativa comercial, ni contenido patrocinado.
2. **Confirmar que está limpio.** Cero enlaces de Amazon o Prozis, cero tags de afiliado (`diezmejores21-21`, `amzn.to`), cero cupones y cero promociones. Si tiene aunque sea uno, **se registra `affiliate: true, enabled: false` con su motivo** — nunca se marca como limpio.
3. **Comprobar los metadatos.** `<title>`, `meta name="description"` y `og:image` presentes, y que la imagen exista de verdad.
4. **Añadirlo a `data/newsletter-catalog.json`** con todos los campos: `enabled`, `affiliate`, `promotional`, `draft`, `language`, `category`, `seasonMonths`, `priority`, `cooldownWeeks`. Un campo que falte lo deja inelegible.
5. **Darle contenido propio:** dos `subjectTemplates`, un `preheader`, y las claves de bloques compatibles (`trainingLibraryKeys`, `tipLibraryKeys`, `toolKeys`).
6. **Ejecutar las pruebas**: `node tests/unit/newsletter-automation.test.cjs`. La prueba de rotación de 20 semanas confirma que el catálogo sigue dando de sí.

Para reservar un artículo en una semana concreta, `scheduledWeeks: ["YYYY-MM-DD"]`. Una reserva por semana como máximo, y se impone a estacionalidad, categoría y cooldown — **nunca** a las banderas de seguridad.

---

## Las únicas intervenciones humanas

No existe aprobación semanal. Solo estas cuatro:

1. **Ampliar el catálogo** cuando `low_catalog` avise (arriba).
2. **Pausar o cancelar** una semana concreta.
3. **Resolver un `sending` ambiguo**, que siempre requiere una persona y nunca se desatasca solo.
4. **Mirar métricas y avisos**: las alertas del domingo y los números del martes.
