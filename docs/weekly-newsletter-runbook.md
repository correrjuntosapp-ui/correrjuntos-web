# CorrerJuntos Semanal — runbook

Newsletter de los lunes. **La preparación se automatiza; el envío nunca.**
Un correo solo sale si una persona lo aprueba pasando el pick a `status='ready'`.

---

## Cómo funciona

| Pieza | Dónde |
|---|---|
| Contenido de la semana | fila en `public.weekly_newsletter` |
| Plantilla | `api/_lib/jobs/weekly-newsletter.js` |
| Disparo | cron `/api/cron/run?job=weekly-newsletter`, lunes 08:00 UTC |
| Destino | Brevo **lista 3** (suscriptores del blog). Nunca la tabla `profiles` |
| Remitente | `BREVO_SENDER_EMAIL` en Vercel → `hola@correrjuntos.com` |

El cron solo envía si encuentra un pick con **las tres condiciones**: `status='ready'`, `week_of` = lunes actual y `sent_at IS NULL`. Si falta cualquiera, no envía nada y responde `no_ready_pick_this_week`.

⚠️ `abraham.marquez@correrjuntos.com` **no está activo en Brevo**. Si alguien cambia el remitente a esa dirección, la campaña ni se crea.

---

## Semana tipo

**Miércoles — proponer.** Tres candidatos: un artículo con tracción en Search Console, uno estacional y uno de fondo. Se elige uno.

**Viernes — preparar.** Crear la fila en `weekly_newsletter` con `status='draft'` y enviar la prueba:

```
/api/cron/run?job=weekly-newsletter&test=EMAIL
Authorization: Bearer <CRON_SECRET>
```

El modo test manda solo a esa dirección. **No** toca la lista, ni `status`, ni `sent_at`, ni `recipients`, ni `brevo_campaign_id`.

**Domingo — aprobar.** Una persona lee el correo recibido. Si está bien:

```sql
update public.weekly_newsletter set status = 'ready'
where week_of = 'YYYY-MM-DD' and status = 'draft';
```

**Lunes 10:00 Europe/Madrid (08:00 UTC) — envío.** Automático. El job marca la fila como `sent`.

**Martes — métricas.** Aperturas, clics, bajas y rebotes en el panel de Brevo. `recipients` queda en la fila.

### Si el domingo no hay contenido aprobado

No se hace nada. El pick se queda en `draft`, el cron no envía y esa semana no hay newsletter. **Nunca** se aprueba a última hora sin haber leído la prueba: es preferible saltarse una semana que mandar algo con un enlace roto a 171 personas.

---

## Regla de oro: un solo canal

⛔ **Jamás programar desde el panel de Brevo y dejar además un pick en `ready`.** Son dos caminos independientes y el resultado es un envío duplicado. El histórico ya tiene un caso: el 3 de agosto se programó a mano y la fila se quedó en `draft` porque el job nunca intervino.

Si se programa a mano, la fila hay que sincronizarla después:

```sql
update public.weekly_newsletter
set status='sent', brevo_campaign_id=<id>, recipients=<n>, sent_at='<fecha Brevo>'
where week_of='YYYY-MM-DD';
```

**Un `status='draft'` no demuestra que no se enviara.** Demuestra que *el job* no lo envió. La fuente de verdad de los envíos es Brevo.

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

## Riesgo histórico: la ventana entre Brevo y Supabase (resuelto)

En `runWeeklyNewsletter` la secuencia en modo live es:

```js
const sendNow = await brevo(`/emailCampaigns/${campaignId}/sendNow`, ...);
if (!sendNow.ok) return 500;
await supabase.from('weekly_newsletter')
  .update({ status: 'sent', sent_at: ..., brevo_campaign_id: campaignId })
  .eq('id', pick.id);           // ← sin comprobar error
```

**Si Brevo envía y la actualización de Supabase falla**, la fila se queda en `ready` con `sent_at` NULL. Una segunda ejecución del cron ese mismo lunes la volvería a seleccionar y **enviaría por segunda vez**. El `update` además no comprueba su propio error, así que el fallo sería silencioso.

Hoy el riesgo es bajo porque el cron corre una vez al día, pero existe.

**Resuelto** con la máquina de estados descrita arriba: el pick pasa por `sending` antes del envío, ambos `update` comprueban su error y un pick en `sending` jamás se reenvía automáticamente.

---

## Qué hay que dar cada semana

Solo contenido. El código no se toca:

1. Artículo destacado (slug + imagen).
2. Asunto, preheader, H1 e intro.
3. Los cuatro bloques.
4. `utm_campaign` de la semana.
5. La aprobación humana del domingo.
