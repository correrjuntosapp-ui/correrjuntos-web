# SEO Ciclismo — Estrategia y roadmap (creado 21 ago 2026)

Vertical: `/blog/ciclismo/` · 12 URLs publicadas (hub + hub de rutas + 10 guías).
Objetivo de negocio: tráfico cualificado → instalación → registro → primera actividad bici → primera salida acompañada. Diferenciación frente a Strava/Komoot/Garmin: **comunidad local, compatibilidad de nivel y salidas compartidas**, no telemetría.

---

## 1. Arquitectura de clusters

```
/blog/ciclismo/                  ← hub principal (CollectionPage + ItemList)  [LIVE]
├── rutas/                       ← hub de rutas (metodología + plantilla)     [LIVE]
│   └── {ciudad}-{ruta-slug}     ← rutas verificadas por ciudad              [pendiente de datos]
├── carretera/                   ← hub modalidad                              [propuesto, NO publicar vacío]
├── mtb/                         ← hub modalidad                              [propuesto]
├── gravel/                      ← hub modalidad                              [propuesto]
├── equipamiento/                ← hub cuando haya ≥4 comparativas           [propuesto]
├── mantenimiento/               ← hub cuando haya ≥3 guías                  [propuesto]
├── seguridad/                   ← cubierto por artículos; hub futuro        [propuesto]
├── entrenamiento/               ← puente con running; hub futuro            [propuesto]
└── comunidad/                   ← puente con quedadas/matching              [propuesto]
```

**Regla de publicación de hubs**: un hub de modalidad solo se publica cuando existan ≥3 artículos propios del cluster. Hasta entonces, la intención se cubre con la sección *Modalidades* del hub principal (`#modalidades`). No cambiar URLs ya publicadas.

**Regla de slugs**: artículos planos bajo `/blog/ciclismo/{slug}` (como hasta ahora). Cuando un hub de modalidad exista, los artículos nuevos de esa modalidad podrán ir bajo el subdirectorio, pero los ya publicados NO se mueven (evitar redirects innecesarios).

## 2. Mapa de intención

| Intención | Ejemplos de query | Página objetivo | CTA |
|---|---|---|---|
| Informacional | "cómo evitar pinchazos", "presión ruedas bici" | Guías prácticas | Registro Bici / quedada |
| Comercial | "mejores luces bicicleta", "casco ciclismo barato" | Comparativas con afiliados | Afiliado + app secundario |
| Local | "rutas en bici madrid", "grupeta ciclismo sevilla" | Hub rutas → rutas por ciudad; grupeta | Quedadas / matching |
| Transaccional-app | "app registrar ciclismo", "app salidas en bici" | Hub principal | Stores |

## 3. Riesgos de canibalización y mitigación

- `mejores-cascos-ciclismo` vs futura "casco MTB": la actual es genérica multi-perfil → la futura debe ser específica de disciplina y enlazar a la genérica como pieza madre.
- `rutas-faciles-bici-empezar-ciudad` vs `rutas/` hub: la guía es *cómo elegir*; el hub es *índice + metodología*. Mantener esa separación en titles (guía = "rutas fáciles para empezar"; hub = "rutas en bici: planificar").
- `equipamiento-primera-salida` vs futuras comparativas por producto: la checklist enlaza a las comparativas, nunca duplica 8 productos de la misma categoría.
- `ciclismo-para-principiantes` es la pieza madre del cluster Empezar: toda pieza nueva de iniciación (carretera/MTB/gravel para principiantes) debe tratar la modalidad específica y enlazarla.

## 4. Reglas de enlazado interno

1. Todo artículo nuevo enlaza: al hub principal, a su pieza madre y a 2-4 hermanos.
2. El hub principal enlaza todo (pilares + atajos laterales).
3. Anchors con keyword o variación semántica, nunca "aquí".
4. Cruce con running: mínimo 1 enlace a un artículo de running relevante por pieza (pillar equipamiento, correr de noche, duatlón, entrenamiento cruzado).
5. Máximo ~10 enlaces internos por artículo en cuerpo; el resto en sidebar/related.

## 5. Plantilla de artículo (variantes)

Base común: hero editorial + byline con autor real + key-takeaways + TOC (colapsable en móvil) + FAQ + fuentes con fecha + author box con foto.

- **Guía práctica**: pasos numerados, checklist (`.checklist`), caja de errores frecuentes, warning-box para seguridad. CTA: quedada/registro.
- **Comparativa**: aviso de afiliación ANTES del primer enlace, metodología con fecha de consulta, tabla resumen por escenario, 8-10 `buy-card` con foto oficial self-hosted (`/public/blog-images/ciclismo/productos/{ASIN}.jpg`), "la elegiría si", ItemList schema. CTA afiliado principal + app secundario.
- **Ruta**: ver §6. CTA: "encuentra gente para hacer esta ruta".

## 6. Plantilla obligatoria de rutas (contrato editorial)

Publicada como tabla en `/blog/ciclismo/rutas`. Campos obligatorios:
distancia · desnivel positivo · superficie · dificultad física · dificultad técnica · bicicleta recomendada · tráfico · puntos de agua (km) · transporte y aparcamiento · escapatorias · época recomendada · seguridad (cobertura, tramos aislados) · fuente/verificación · fecha de revisión · GPX si existe · punto de encuentro y hora (si es grupal) · CTA de salida compartida.

**Regla dura**: ninguna ruta se publica sin datos verificados sobre el terreno o contra fuente oficial (ayuntamiento, consorcio de vías verdes, FFCV…). Schema recomendado por ruta: `Article` + `Place`/`TouristAttraction` cuando aplique; NO usar `Course` inventando agregaciones.

## 7. Política de fuentes

- Normativa: DGT + BOE con fecha de revisión visible (patrón ya aplicado: RD 518/2026, vigor 1 oct 2026).
- Producto: ficha oficial del fabricante o ficha Amazon verificada; specs sin fuente → no se publican.
- Salud/seguridad: fuentes oficiales; sin consejos médicos propios.
- Prohibido: puntuaciones inventadas, "lo hemos probado" sin prueba real, testimonios fabricados, fotos IA presentadas como evidencia (siempre con nota "imagen editorial").

## 8. Política de afiliación

- Disclosure con clase `.affiliate-note` SIEMPRE antes del primer enlace comercial del cuerpo (validado por `tools/validate-ciclismo.cjs`).
- Solo `/dp/ASIN?tag=diezmejores21-21&linkCode=ll1` + `rel="nofollow sponsored noopener"`.
- Fotos de producto self-hosted, verificadas visualmente, comprimidas ≤640px.
- ASINs verificados contra Amazon ES antes de publicar (título de ficha = producto prometido).
- Sin precios en el cuerpo (cambian); sí rangos orientativos marcados como tales.

## 9. Criterios de actualización

- Comparativas: revisión trimestral de ASINs e imágenes (cron mensual `audit:amazon` ya cubre imágenes).
- Normativa: revisar tras cada cambio DGT/BOE; próximo hito conocido: entrada en vigor RD 518/2026 (1 oct 2026) → actualizar las 4 páginas que lo citan.
- `dateModified` + texto visible "Actualizado" en cada refresh; lastmod del sitemap coherente.

## 10. Plan de publicación — 90 días

Criterio: primero lo que refuerza clusters existentes y el diferencial de comunidad; los "hub-fillers" de modalidad después. Cadencia realista: 1 pieza/semana (el founder es cuello de botella; ver NORTE).

**Mes 1 — Empezar + Rutas (semillas del diferencial)**
1. `velocidad-media-ciclismo-principiantes` (informacional, alto volumen, alimenta matching por nivel)
2. `como-rodar-en-grupeta-señales-relevos` (comunidad; pieza hermana de grupeta)
3. Primera ruta verificada (ciudad del founder: Huelva/Sevilla — datos comprobables en persona)
4. `presion-ruedas-bicicleta-guia` (informacional evergreen, enlaza pinchazos)

**Mes 2 — Gravel (menos competencia SEO que carretera/MTB)**
5. `gravel-para-principiantes`
6. `gravel-vs-mtb-vs-carretera` (comparativa de decisión, enlaza #modalidades)
7. Segunda y tercera ruta verificada (Sevilla/Málaga — aprovechar clubs partner para verificación local)
8. → con 3 piezas gravel: publicar hub `/blog/ciclismo/gravel/`

**Mes 3 — Carretera + monetización**
9. `ciclismo-carretera-principiantes`
10. `como-elegir-primera-bici-carretera` (comercial, afiliación limitada — bicis completas convierten mal en Amazon; enfocar a componentes/accesorios)
11. `nutricion-rutas-50-100-km` (enlaza planes + tienda)
12. Cuarta ruta verificada → hub `/blog/ciclismo/rutas` pasa a listar 4 rutas
13. → con 3 piezas carretera: publicar hub `/blog/ciclismo/carretera/`

MTB queda para el trimestre siguiente (7 ideas ya listadas). Rutas por ciudad restantes (Madrid, Barcelona, Valencia…) solo con fuente local verificable o colaborador sobre el terreno — los clubs partner son la vía natural.

## 11. KPIs y medición de ROI

**Medible hoy (web, implementado en `ciclismo.js`, consent-gated):**
- Sesiones orgánicas del cluster (GA4, filtro page_path `/blog/ciclismo`)
- `cycling_read_depth` (25/50/75/90)
- `cycling_cta_impression` / `cycling_app_click` (por placement)
- `affiliate_link_click` (por product/ASIN)
- `cycling_comparison_view`
- CTR CTA = clicks/impressions por placement
- Ingresos afiliados: informe Amazon Associates filtrado por ASINs del cluster

**NO medible hoy (requiere integración pendiente — no confundir):**
- Instalación atribuida (necesita Apple Search Ads attribution / Play referrer server-side; el referrer de Play ya viaja en la URL pero nadie lo lee en backend)
- Registro/activación atribuidos al cluster (necesita persistir UTM en signup → tabla `analytics_events`)
- Primera actividad bici / primera quedada por cohorte de origen

**Embudo documentado:**
landing orgánica → lectura (`read_depth≥50`) → CTA visto (`cta_impression`) → CTA pulsado (`app_click`) → store (fin de la medición web actual) → [GAP de atribución] → registro → primera actividad Bici → primera quedada.

Cerrar el GAP = punto 1 del roadmap de producto. Meta trimestral razonable: cluster con 500 clics orgánicos/28d y CTR CTA ≥2 % antes de invertir en los 4 hubs de modalidad.

## 12. Roadmap de producto ciclista (priorizado, NO prometido en la web)

| P | Feature | Por qué |
|---|---|---|
| P0 | Persistir UTM/referrer en signup y volcarlo a `analytics_events` | Sin esto no hay ROI medible del vertical |
| P1 | Campo **modalidad** en quedadas (carretera/MTB/gravel/urbana) + filtro | El copy actual obliga a escribirlo en el título |
| P1 | Velocidad media prevista + nivel en quedada ciclista | Compatibilidad de nivel = el diferencial |
| P2 | Distancia, desnivel y terreno en la quedada | Completa la ficha de salida |
| P2 | Política visible "nadie se queda atrás" (toggle del organizador) | Diferencial social, coste mínimo |
| P2 | Búsqueda de salidas ciclistas cercanas (filtro deporte en mapa) | Activa el CTA "encuentra salidas por terreno" |
| P3 | Adjuntar GPX o enlace de ruta a la quedada | Conecta hub de rutas con salidas reales |
| P3 | Material obligatorio (checklist del organizador: luces, casco, cámara) | Cierra el loop con los artículos de equipamiento |
| P3 | Tamaño máximo de grupeta | Ya existe `max_participantes`; falta exponerlo con semántica ciclista |

El perfil multideporte y el registro GPS de Bici ya existen → son los únicos claims publicados en la web. Todo lo demás de esta tabla es roadmap, no copy.

## 13. Estado E-E-A-T actual

✔ Autor real (Abraham Márquez Rodríguez) con foto y página de autor · ✔ fechas visibles · ✔ metodología en comparativas · ✔ fuentes oficiales con fecha · ✔ disclosure pre-enlace validada por script · ✔ imágenes IA declaradas como editoriales · ✘ pendiente: revisor técnico externo para piezas de seguridad vial (candidato natural: contacto de club partner con titulación; sin nombre hasta acuerdo — regla "no partner names without deal").
