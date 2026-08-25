# Ciclismo — Plantillas, contratos de datos y diseño de medición (21 ago 2026)

Complementa `docs/seo-ciclismo-roadmap.md`. Nada de este documento es copy publicado: son contratos internos que el QA (`tools/validate-ciclismo.cjs`) hace cumplir donde es automatizable.

---

## 1. Contrato de datos de una ruta

Ninguna ruta se publica sin TODOS los campos obligatorios (●). El QA bloquea fichas incompletas bajo `/blog/ciclismo/rutas/`.

```jsonc
{
  "name": "",                    // ● nombre editorial
  "slug": "",                    // ● kebab-case, inmutable tras publicar
  "region": "",                  // ● p.ej. Andalucía
  "province": "",                // ●
  "municipality": "",            // ●
  "start_point": "",             // ● descripción + referencia física
  "end_point": "",               // ● (== start_point si circular)
  "coordinates": {"lat": 0, "lng": 0},  // ● del punto de inicio, verificadas
  "distance_km": 0,              // ● medida, no estimada
  "elevation_gain_m": 0,         // ● desnivel positivo medido
  "estimated_duration": "",      // ● rango por nivel, no cifra única
  "discipline": "carretera|mtb|gravel|urbana",   // ●
  "route_type": "circular|lineal",                // ●
  "physical_difficulty": "baja|media|alta",       // ●
  "technical_difficulty": "baja|media|alta",      // ● independiente de la física
  "surface_breakdown": {"asfalto": 0, "pista": 0, "sendero": 0}, // ● % aprox
  "traffic_level": "nulo|bajo|medio|alto",        // ●
  "dangerous_sections": [],      // ● lista, puede ser vacía si se comprobó
  "water_points": [],            // ● {km, tipo}
  "repair_points": [],           // ○ talleres/gasolineras
  "transport_access": "",        // ● tren/bus/coche con detalle bici
  "parking": "",                 // ●
  "mobile_coverage": "",         // ● zonas sin cobertura si las hay
  "best_season": "",             // ●
  "weather_warnings": "",        // ○ calor/viento/barro típicos
  "equipment": [],               // ● material recomendado u obligatorio
  "gpx_url": "",                 // ○ solo si el track es propio o con licencia
  "map_url": "",                 // ○
  "verified_by": "",             // ● persona real que verificó
  "verification_date": "",       // ● YYYY-MM-DD, nunca futura
  "last_reviewed": "",           // ● YYYY-MM-DD
  "original_photos": [],         // ● ≥3 fotos propias del recorrido
  "sources": [],                 // ● fuentes oficiales contrastadas
  "group_ride_cta": true         // ● CTA "convierte esta ruta en una salida"
}
```

**Validación automatizada hoy** (QA §4c): presencia de Distancia, Desnivel, Superficie, Escapatorias, verificación y fecha de revisión en el HTML; GeoCoordinates solo con lat/lng reales; prohibido AggregateRating. **Validación pendiente de tooling**: cuando exista la primera ruta, mover el contrato a un JSON por ruta y validar campo a campo.

**Schema.org por ruta**: `WebPage` + `Article` + `BreadcrumbList` + `Place` (con `GeoCoordinates` del inicio) + `ImageObject` para fotos propias. NO usar `Course`, `AggregateRating` ni reviews.

## 2. Plantilla de prueba de producto («Probado por CorrerJuntos»)

Campos obligatorios; sin todos ellos, la etiqueta no se usa y el QA marca error (`data-tested="true"` requerido junto a la evidencia):

1. Producto exacto (modelo, versión, talla/variante).
2. Procedencia: comprado / prestado / cedido por marca (y por cuál).
3. Periodo de prueba (fechas) y modalidad (carretera/MTB/gravel/urbana).
4. Condiciones (clima, terreno, tipo de salidas).
5. Distancia o tiempo de uso solo si hay registro que lo respalde.
6. Mediciones realizadas (qué se midió y con qué).
7. Puntos fuertes y limitaciones observadas.
8. Para quién es / para quién no es.
9. Alternativas consideradas.
10. Bloque separado: especificaciones oficiales vs observaciones propias.
11. Fotografías originales del producto en uso (no stock, no IA).
12. Fecha de revisión + disclosure de afiliación si hay enlaces.

Estado actual: **ningún artículo del cluster afirma prueba propia** (verificado por QA). Esta plantilla existe para cuando la haya.

## 3. Resto de formatos (resumen de requisitos)

| Formato | Elementos obligatorios | Diferencial |
|---|---|---|
| Ruta verificada | contrato §1 completo | fotos propias + salida compartida |
| Comparativa | metodología con fecha, disclosure previa, 8-10 productos con foto oficial, ItemList | «la elegiría si» por perfil |
| Guía principiantes | pasos, checklist, errores, FAQ | plan accionable de N semanas |
| Mantenimiento | herramientas, pasos con foto, cuándo ir al taller | honestidad sobre límites DIY |
| Seguridad | fuente oficial + fecha, sin consejo médico | normativa con vigencia explícita |
| Entrevista a grupeta | consentimiento escrito, quotes reales, foto autorizada | voz local; regla: sin nombres sin acuerdo |
| Historia de usuario | usuario real consentido, datos de su perfil con permiso | prueba social verdadera |
| Análisis con datos propios | dataset de `analytics_events`/BD anonimizado, método replicable | nadie más tiene estos datos |
| Guía local | fuentes municipales/oficiales, verificación en persona | conexión con quedadas de la zona |

## 4. Experimento CRO (definido, NO ejecutado — sin resultados inventados)

- **Hipótesis**: los CTA orientados a compañía («encuentra gente / convierte la ruta en salida») obtienen mayor CTR y mayor calidad de instalación que los CTA de registro GPS, en artículos de intención informacional.
- **A (control)**: cta-box actual de registro («Registra también tus kilómetros»).
- **B (variante)**: cta-box de compañía («Convierte esta ruta en una salida compartida»).
- **Evento principal**: `cycling_app_click` / `cycling_cta_impression` (CTR por placement `cta-box`).
- **Guardrails**: `cycling_read_depth`≥50 no debe caer; clics afiliados no deben caer >10 % en comparativas.
- **Segmentación**: por intención del artículo (`content_cluster` + slug) y `device_context`.
- **Duración mínima orientativa**: 4 semanas o ≥1.000 impresiones de CTA por rama (el tráfico actual del vertical es incipiente: sin esa muestra, no se decide).
- **Criterio de decisión**: diferencia relativa de CTR ≥25 % sostenida; empate → gana la variante de compañía por alineación estratégica.
- **Implementación propuesta**: asignación determinista por `localStorage` seed + variante como parámetro `cta_variant` en los eventos. Pendiente de autorización (añade una rama de copy por página).

## 5. Persistencia de atribución hasta conversión (DISEÑO — no ejecutado)

**Estado real**: la web ya captura UTM en `index.html` (localStorage 30 días, se anexa a `referrer=`/`ct=` de los store links). El backend **no** persiste nada de esto en el signup. Sin este cierre, el ROI del vertical no es medible más allá del clic. NO se ha tocado base de datos.

**Propuesta** (requiere autorización de producto):
1. **App**: en el primer arranque tras instalación, leer `install referrer` (Android, Play Install Referrer API) / `ct` de App Store cuando esté disponible; guardar en `AsyncStorage` como `acquisition_context` {source, medium, campaign, content, term, first_seen_at}.
2. **Signup**: al crear el perfil, escribir `acquisition_context` en una tabla nueva:
   ```sql
   create table public.user_acquisition (
     user_id uuid primary key references profiles(id) on delete cascade,
     utm_source text, utm_medium text, utm_campaign text,
     utm_content text, utm_term text,
     landing_url text, initial_referrer text,
     first_seen_at timestamptz, captured_at timestamptz default now()
   );
   -- RLS: insert solo del propio usuario; select solo service_role
   ```
3. **Eventos**: volcar los hitos (registro, perfil completado, primera actividad bici, primera quedada) a `analytics_events` con el user_id — ya existe la tabla; el join con `user_acquisition` da el embudo completo.
4. **Retención/privacidad**: sin PII en UTM; retención 24 meses; export/purge con la cuenta (ya cubierto por delete-account).
5. **Riesgos**: install referrer no disponible en todos los flujos iOS (atribución parcial — declararlo en dashboards); migración vía `apply_migration` MCP (NUNCA `supabase db push`, regla del proyecto).
6. **Rollback**: la tabla es aditiva; rollback = dejar de escribir. Sin impacto en flujos existentes.
7. **Pruebas**: E2E manual Android con referrer sintético; verificación RLS con anon key.

## 6. Embudo y dashboard (definición)

impresión orgánica (GSC) → clic orgánico (GSC) → lectura (`read_depth≥50`) → interacción (`comparison_view`/clics internos) → segundo contenido (GA4 páginas/sesión) → `cycling_cta_impression` → `cycling_app_click` → **[GAP: instalación/apertura]** → registro → perfil ciclista → salida creada/solicitada → activación → retención → revenue afiliado (informe Amazon por ASIN).

Dimensiones: URL, cluster, modalidad, intención, dispositivo, CTA/placement, producto, canal, nuevo/recurrente. Provincia: **solo cuando existan rutas publicadas**.

**NO VERIFICADO hoy** (sin acceso desde esta sesión): datos GSC del cluster, revenue por ASIN, y todo lo posterior al clic de store. El plan §5 cierra el gap.

## 7. Roadmap editorial priorizado (15 piezas)

| # | Artículo | Keyword principal | Intención | Funnel | CTA | Evidencia necesaria | P | Esfuerzo |
|---|---|---|---|---|---|---|---|---|
| 1 | Qué bici elegir para empezar (carretera/MTB/gravel) | "que bicicleta comprar para empezar" | comercial-info | MOFU | modalidad → salida | fichas oficiales | P0 | M |
| 2 | Cómo rodar en grupeta por primera vez | "rodar en grupeta" | informacional | MOFU | buscar grupeta | fuentes técnicas | P0 | S |
| 3 | Velocidad media según nivel y modalidad | "velocidad media bicicleta" | informacional | TOFU | matching por nivel | fuentes públicas, sin inventar medias propias | P0 | S |
| 4 | Ruta gravel verificada Huelva | "ruta gravel huelva" | local | BOFU | salida compartida | **verificación en persona (founder)** | P0 | L |
| 5 | Ruta carretera verificada Sevilla | "ruta carretera sevilla" | local | BOFU | salida compartida | verificación en persona / club partner | P1 | L |
| 6 | Cómo preparar una ruta segura | "planificar ruta en bici" | informacional | MOFU | hub rutas | ya cubierto parcialmente por el hub — pieza larga | P1 | M |
| 7 | Qué comer en 30/50/100 km | "que comer ruta bicicleta" | informacional | TOFU | tienda/planes | fuentes nutrición deportiva | P1 | M |
| 8 | Presión de neumáticos por modalidad | "presion ruedas bicicleta" | informacional | TOFU | — | calculadoras oficiales | P1 | S |
| 9 | Kit antipinchazos: cámara vs mechas vs CO₂ | "kit pinchazos bicicleta" | comercial | BOFU-afiliado | comparativa | ASINs verificados (parcialmente ya existentes) | P1 | S |
| 10 | De running a ciclismo | "empezar ciclismo corredor" | informacional | MOFU | perfil multideporte | interno | P1 | S |
| 11 | Mantenimiento tras cada salida | "limpiar bicicleta despues de salir" | informacional | TOFU | — | guías fabricantes | P2 | S |
| 12 | Elegir grupeta por velocidad/nivel | "grupeta nivel principiante" | informacional | MOFU | buscar grupeta | riesgo canibalización con guía grupeta → enfocar a tabla de niveles | P2 | S |
| 13 | Errores con pedales automáticos | "caidas pedales automaticos" | informacional | TOFU | — | complementa (no canibaliza) zapatillas-vs | P2 | S |
| 14 | Luces para carretera: normativa y autonomía | "luces bicicleta carretera obligatorias" | comercial-info | MOFU | comparativa luces | DGT/BOE — enfocar normativa para no canibalizar mejores-luces | P2 | M |
| 15 | Transportar la bici en coche legalmente | "llevar bicicleta en el coche" | informacional | TOFU | — | DGT/RGV | P2 | M |

Riesgos de canibalización señalados en la propia tabla (#12 vs grupeta, #14 vs mejores-luces, #6 vs hub): se resuelven con ángulo distinto + enlazado madre-hija.

## 8. Criterios de lanzamiento de arquitectura (recordatorio ejecutable)

- Hub modalidad (`/carretera/`, `/mtb/`, `/gravel/`, `/mecanica/`, `/entrenamiento/`, `/equipamiento/`): ≥3 artículos sustanciales propios.
- Hub geográfico (`/rutas/andalucia/`, `/rutas/huelva/`…): ≥5 rutas reales verificadas.
- Página de ruta: contrato §1 completo, sin excepciones (QA lo bloquea).
- Nada de páginas programáticas sin contenido único y utilidad demostrable.

## 9. QA en CI (documentación de integración)

Local / predeploy:
```bash
node tools/validate-ciclismo.cjs            # con HTTP contra localhost:3400
node tools/validate-ciclismo.cjs --no-http  # solo filesystem (para CI sin servidor)
node tools/validate-ciclismo.cjs --base https://www.correrjuntos.com  # smoke prod
```
Exit code: 0 limpio · 1 con errores. Los avisos (⚠) no bloquean.

GitHub Actions (propuesto, NO añadido — el repo tiene workflows existentes que hay que revisar antes de tocar CI):
```yaml
# .github/workflows/qa-ciclismo.yml
name: QA ciclismo
on:
  pull_request:
    paths: ['blog/ciclismo/**', 'sitemap-blog-es.xml', 'blog/politica-editorial.html']
jobs:
  qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: node tools/validate-ciclismo.cjs --no-http
```
Nota: Actions es gratuito en este repo (público). Activar cuando se autorice tocar `.github/workflows/`.
