# Blog Ciclismo — Roadmap 2027

> Planificación de la vertical `/blog/ciclismo/` en cuatro áreas: **Bicicletas · Equipamiento y mantenimiento · Nutrición e hidratación · Entrenamiento y comunidad**.
> Complementa a `docs/seo-ciclismo-roadmap.md` (fases SEO generales) y `docs/ciclismo-plantillas-y-contratos.md` (contratos de datos).
> Actualizado: 23 de agosto de 2026.

## 1. Inventario de artículos existentes

| Artículo | Intención de búsqueda | Categoría | Funnel | Monetización | Riesgo canibalización | Prioridad mantenimiento | Artículo padre | Enlaces internos necesarios |
|---|---|---|---|---|---|---|---|---|
| mejores-bicicletas-carretera-2027 | comercial: "mejores bicicletas carretera 2027/2026" | Bicicletas | BOFU | Tráfico → afiliación accesorios (cascos) + app | Bajo (única comparativa carretera) | **Alta** — refrescar precios/gamas cada trimestre | hub ciclismo | hub, gravel, mtb, principiantes, cascos, talla |
| mejores-bicicletas-gravel-2027 | comercial: "mejores gravel 2027" | Bicicletas | BOFU | Ídem | Bajo | **Alta** — ídem | hub ciclismo | hub, carretera, mtb, pinchazos/tubeless, equipamiento-primera-salida |
| mejores-mtb-2027 | comercial: "mejores mtb 2027" | Bicicletas | BOFU | Ídem | Bajo | **Alta** — ídem (⚠ Scott retiró ficha del Spark 950; revisar sustitución de modelo en el próximo refresh) | hub ciclismo | hub, carretera, gravel, pinchazos, luces |
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
- ✅ Comparativa MTB (ídem, Spark 950 marcado "catálogo anterior", enlace a gama viva).
- ✅ Hub reorganizado en 4 áreas con navegación por anclas HTML.
- ✅ Enlazado interno bidireccional comparativas ↔ guías.
- ✅ QA visual y técnico (ver informe de entrega).

## 3. Fase 2 — Accesorios con intención comercial (por orden)

Antes de crear cada uno: comprobar canibalización contra el inventario (columna del §1).

1. **Mejores ciclocomputadores GPS** — sin solape (no existe nada de electrónica ciclista). Padre: equipamiento. Nota: NO canibaliza `mejores-relojes-gps-running` (dispositivo distinto); enlazarse mutuamente.
2. **Mejores bombas y miniinfladores** — sin solape; enlaza a pinchazos (técnica).
3. **Kit antipinchazos y tubeless (comercial)** — ⚠ riesgo medio con `como-evitar-pinchazos-bicicleta`: este nuevo lista PRODUCTOS, el existente explica TÉCNICA; cada uno enlaza al otro en su primer tercio.
4. **Mejores gafas para ciclismo** — ⚠ revisar solape con `mejores-gafas-sol-running` y `equipamiento/las-10-mejores-gafas-deportivas`: ángulo diferencial obligatorio (lente fotocromática, ventilación en bici, compatibilidad casco). Si no se puede diferenciar honestamente, ampliar el existente en su lugar.
5. **Mejores culottes para rutas largas** — sin solape.

## 4. Fase 3 — Nutrición ciclista (intención propia, NO clonar artículos runner)

Regla: cada pieza debe tener escenarios ciclistas reales (avituallamiento en marcha, bolsillos del maillot, comer sobre la bici, paradas). Prohibido duplicar cambiando "runner" por "ciclista".

1. Nutrición para rutas largas: qué comer en salidas de 2, 4 y 6 horas (pilar del área).
2. Qué comer antes, durante y después de montar en bici.
3. Geles, barritas y comida real para ciclismo (puede enlazar a `alternativas-geles-energeticos-comida-real` como referencia general).
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
