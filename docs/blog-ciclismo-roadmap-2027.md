# Blog Ciclismo — Roadmap 2027

> Planificación de la vertical `/blog/ciclismo/` en cuatro áreas: **Bicicletas · Equipamiento y mantenimiento · Nutrición e hidratación · Entrenamiento y comunidad**.
> Complementa a `docs/seo-ciclismo-roadmap.md` (fases SEO generales) y `docs/ciclismo-plantillas-y-contratos.md` (contratos de datos).
> Actualizado: 23 de agosto de 2026.

## 1. Inventario de artículos existentes

| Artículo | Intención de búsqueda | Categoría | Funnel | Monetización | Riesgo canibalización | Prioridad mantenimiento | Artículo padre | Enlaces internos necesarios |
|---|---|---|---|---|---|---|---|---|
| mejores-bicicletas-carretera-2027 | comercial: "mejores bicicletas carretera 2027/2026" | Bicicletas | BOFU | Tráfico → afiliación accesorios (cascos) + app | Bajo (única comparativa carretera) | **Alta** — refrescar precios/gamas cada trimestre | hub ciclismo | hub, gravel, mtb, principiantes, cascos, talla |
| mejores-bicicletas-gravel-2027 | comercial: "mejores gravel 2027" | Bicicletas | BOFU | Ídem | Bajo | **Alta** — ídem | hub ciclismo | hub, carretera, mtb, pinchazos/tubeless, equipamiento-primera-salida |
| mejores-mtb-2027 | comercial: "mejores mtb 2027" | Bicicletas | BOFU | Ídem | Bajo | **Alta** — ídem (Spark 950 sustituida el 23-08 por Spark RC Comp con manual de plataforma 2027) | hub ciclismo | hub, carretera, gravel, pinchazos, luces |
| ciclismo-para-principiantes | informacional: "empezar ciclismo" | Entrenamiento y comunidad | TOFU | App CTA | Bajo | Alta (pilar de entrada) | hub | comparativas (¿qué bici?), equipamiento, grupeta |
| equipamiento-primera-salida-bicicleta | informacional/comercial mixta | Equipamiento | MOFU | Afiliación Amazon accesorios | Medio con futuros artículos de accesorios (ver Fase 2: cada accesorio nuevo debe ENLAZAR aquí, no repetir su contenido) | Alta | hub | cascos, luces, pinchazos, comparativas |
| mejores-cascos-ciclismo | comercial: "mejores cascos ciclismo" | Equipamiento | BOFU | Afiliación Amazon | Bajo — los bloques "kit" de las comparativas enlazan aquí y solo listan 2 cascos | Alta | equipamiento-primera-salida | comparativas, luces |
| mejores-luces-bicicleta | comercial | Equipamiento | BOFU | Afiliación Amazon | Bajo | Alta | equipamiento-primera-salida | cascos, invierno, rutas |
| como-evitar-pinchazos-bicicleta | informacional: "evitar pinchazos" | Equipamiento | MOFU | Afiliación (kit reparación) | Medio con Fase 2 "kit antipinchazos y tubeless" → la Fase 2 debe ser la versión COMERCIAL (productos) y esta la técnica; enlazarse mutuamente | Alta | equipamiento-primera-salida | gravel, mtb |
| zapatillas-ciclismo-automaticas-vs-planas | informacional/decisión | Equipamiento | MOFU | Afiliación futura (pedales) | Medio con futura "mejores pedales" (Fase 2) — misma regla técnica-vs-comercial | Media | equipamiento-primera-salida | principiantes |
| ciclismo-invierno-ropa-seguridad | informacional estacional | Equipamiento | MOFU | Afiliación ropa | Bajo | Media (refresco octubre) | equipamiento-primera-salida | luces, culottes (Fase 2) |
| rutas-faciles-bici-empezar-ciudad | informacional | Entrenamiento y comunidad | TOFU | App CTA | Bajo | Media | principiantes | rutas hub, grupeta |
| como-encontrar-grupeta-ciclismo | informacional/local | Entrenamiento y comunidad | TOFU→app | App CTA (quedadas) | Bajo | Alta (conversión a app) | principiantes | app, correr-y-bici |
| correr-y-bicicleta-combinar-entrenamiento | informacional multideporte | Entrenamiento y comunidad | TOFU | App CTA | Bajo (puente con vertical running) | Alta | hub | principiantes, running cluster |
| rutas/ (hub) | navegacional | Entrenamiento y comunidad | TOFU | App CTA | Bajo | Media | hub | rutas-faciles |

## 2. Fase 1 — TERMINADA con este paquete

- ✅ Comparativa carretera (10 modelos verificados, estado 2026/2027 visible).
- ✅ Comparativa gravel (ídem, precio Checkpoint corregido a 3.499 €).
- ✅ Comparativa MTB (ídem; el 23-08 la Spark 950 retirada por Scott se sustituyó por la Spark RC Comp, con manual de plataforma 2027 adjunto a su ficha).
- ✅ Hub reorganizado en 4 áreas con navegación por anclas HTML.
- ✅ Enlazado interno bidireccional comparativas ↔ guías.
- ✅ QA visual y técnico (ver informe de entrega).

## 3. Fase 2 — Accesorios con intención comercial (por orden)

Antes de crear cada uno: comprobar canibalización contra el inventario (columna del §1).

1. ✅ **Mejores ciclocomputadores GPS** — PUBLICADO en local 23 ago 2026 (`blog/ciclismo/mejores-ciclocomputadores-gps.html`, slug evergreen, año solo en title/H1). 10 modelos con roles: Edge 850 (mejor absoluto), BOLT 3 (calidad-precio), Karoo (navegación), DURA (autonomía), Edge 550 (entrenamiento), Edge 1050 (pantalla), 1040 Solar (ultradistancia), ACE (alternativa premium), Explore 2 (cicloturismo), BSC300T (económico). ROAM 3 excluido por solape de rol (documentado en "Fuentes y método"). Enlace cruzado con `mejores-relojes-gps-running` hecho en ambos sentidos.
2. **Mejores bombas y miniinfladores** — sin solape; enlaza a pinchazos (técnica).
3. **Kit antipinchazos y tubeless (comercial)** — ⚠ riesgo medio con `como-evitar-pinchazos-bicicleta`: este nuevo lista PRODUCTOS, el existente explica TÉCNICA; cada uno enlaza al otro en su primer tercio.
4. **Mejores gafas para ciclismo** — ⚠ revisar solape con `mejores-gafas-sol-running` y `equipamiento/las-10-mejores-gafas-deportivas`: ángulo diferencial obligatorio (lente fotocromática, ventilación en bici, compatibilidad casco). Si no se puede diferenciar honestamente, ampliar el existente en su lugar.
5. **Mejores culottes para rutas largas** — sin solape.

## 4. Fase 3 — Nutrición ciclista (intención propia, NO clonar artículos runner)

Regla: cada pieza debe tener escenarios ciclistas reales (avituallamiento en marcha, bolsillos del maillot, comer sobre la bici, paradas). Prohibido duplicar cambiando "runner" por "ciclista".

1. ✅ Nutrición para rutas largas: qué comer en salidas de 2, 4 y 6 horas (pilar del área) — PUBLICADO en local 23 ago 2026 (`blog/ciclismo/nutricion-salidas-largas-bicicleta.html`). Marco de hidratos: hasta ~60 g/h (2-3 h), hasta ~90 g/h glucosa+fructosa en prolongado entrenado, >90 g/h solo estrategia avanzada. 4 fuentes PubMed citadas. Prozis: solo Energy Gel 50 g y 100% Real Hydration, verificados en ficha viva.
2. Qué comer antes, durante y después de montar en bici.
3. Geles, barritas y comida real para ciclismo — **deslinde anti-canibalización respecto al pilar (§1)**: el pilar responde a "¿cuánto y cuándo como según la duración de MI salida?" (intención de planificación, organizado por horas); este artículo responderá a "¿QUÉ producto o alimento concreto elijo y en qué se diferencian?" (intención de compra/elección, organizado por tipo de producto: geles vs barritas vs comida real, criterios de composición, precio por ración, tolerancia). No repetirá las horquillas g/h del pilar: enlazará a él como referencia de cantidades y se centrará en la elección entre formatos. Puede enlazar a `alternativas-geles-energeticos-comida-real` como referencia general. NO escribir hasta tener datos de rendimiento del pilar.
4. Hidratación y electrolitos en bicicleta (padre transversal: `sales-electrolitos-correr-calor`).
5. Cafeína en salidas largas.
6. Recuperación después de una salida larga.

**Prozis**: solo podrá aparecer en estas piezas cuando el producto encaje realmente, con enlace verificable, relación comercial identificada, sin afirmaciones médicas y con el artículo útil sin comprar. Nunca en las comparativas de bicicletas.

## 5. Fase 4 — Comunidad y retención

1. Cómo preparar tus primeros 50 km.
2. Cómo preparar tus primeros 100 km (padre: primeros 50 km).
3. Cómo elegir una grupeta (ampliación del existente, no duplicado — valorar refresh del actual).
4. Rutas fáciles por ciudades (extensión del hub rutas/).
5. Combinar bicicleta y running (refresh del existente).
6. Registrar y compartir salidas en CorrerJuntos (solo funciones reales: GPS bici, historial multideporte, estadísticas por deporte, feed, compartir, quedadas generales).

## 6. Reglas transversales

- Estado comercial visible en toda ficha de producto: "Gama 2027 confirmada" / "Modelo vigente en 2026" / "Catálogo anterior" — nunca presentar un modelo 2026 como colección 2027.
- Precios siempre con fecha de consulta y fuente oficial; "no publicado por el fabricante" cuando no conste.
- Bicicletas completas → ficha oficial o tienda autorizada (no forzar Amazon).
- Amazon solo `/dp/ASIN/?tag=diezmejores21-21` verificado visualmente, con `rel="nofollow sponsored noopener"`.
- Sin AggregateRating, Review ficticio, estrellas ni "hemos probado" salvo evidencia estructurada.

## 7. Medición Fase 2 — KPIs 30/60/90 días

Publicados (pendiente de deploy) el 23 ago 2026: `mejores-ciclocomputadores-gps` y `nutricion-salidas-largas-bicicleta`.

**Baseline**: PENDIENTE. No hay datos previos de estas URLs (son nuevas) y no se ha extraído baseline GSC del cluster ciclismo en esta sesión — no inventar cifras. Al hacer el primer pull de GSC tras el deploy, anotar aquí: impresiones/clics del filtro `blog/ciclismo` y de las 2 URLs nuevas, con fecha.

| Hito | Qué mirar | Señal de éxito | Señal de alarma |
|---|---|---|---|
| 30 días | GSC: impresiones de las 2 URLs; GA4 (consent-gated): `affiliate_link_click` con `affiliate_network` = amazon/prozis | URLs indexadas + primeras impresiones | 0 impresiones → revisar indexación/sitemap |
| 60 días | GSC: queries que activan cada URL; CTR; clics afiliados por red | Queries de marca de producto ("edge 850", "bolt 3") apareciendo | Solo queries genéricas sin clics |
| 90 días | Posición media; conversiones Amazon (informe Associates) atribuibles al periodo; decisión sobre artículo geles/barritas (§4.3) | Clics afiliados sostenidos → luz verde a §4.3 | Sin tracción → ajustar antes de escribir más nutrición |

Eventos GA4 disponibles para este seguimiento (solo con consentimiento, sin PII): `affiliate_link_click` (product, placement, affiliate_network — ahora distingue amazon/prozis/other por hostname), `cycling_bike_link`, `cycling_app_click`, scroll depth.

**Newsletter ciclismo**: en rutas `/blog/ciclismo*`, `newsletter.js` ya NO promete el Plan 0→5K (running) ni contenido ciclista semanal — mientras Brevo no entregue contenido ciclista segmentado, el copy es neutral y honesto («La newsletter de CorrerJuntos: entrenamiento, equipamiento y comunidad», «un email a la semana como máximo»). El lead magnet propio de ciclismo está especificado en `docs/ciclismo-lead-magnet-checklist-spec.md` y no se anunciará hasta que exista el PDF real. No se han tocado automatizaciones externas (Brevo) — requiere autorización.
