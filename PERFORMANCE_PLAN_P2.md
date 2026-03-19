# Plan de Optimizacion P2 — CorrerJuntos

## Alcance: Feed Social + Comentarios | Cache de Datos | Bundle Web

---

## BLOQUE A: Feed Social / Comentarios

### Estado actual

| Componente | Query | Paginacion | Cache | Problema |
|------------|-------|------------|-------|----------|
| Feed amigos | `get_feed_amigos` RPC | `p_offset=0` hardcoded | Ninguno | Solo carga 30 items, nunca pagina |
| Ranking | `get_ranking_mensual/global` RPC | Limit 50, sin scroll | Ninguno | COUNT subquery N+1 por fila |
| Comentarios | `getComments()` select + join | Limit 50 | Ninguno | Correcto pero sin paginacion |
| Buscar usuarios | `buscar_usuarios` RPC | Limit 20 | Ninguno | ILIKE `%query%` = full scan |
| Seguidores | `get_seguidores/siguiendo` RPC | Limit 100 hardcoded | In-memory Set | Corta en 100 |

### Cambios propuestos

#### A1. Feed con scroll infinito (P0)
**Archivos**: `SocialScreen.tsx`
**Problema**: `p_offset` siempre es 0. El usuario nunca ve mas de 30 items.
**Cambio**:
- Anadir estado `feedOffset` + `feedHasMore`
- Implementar `onEndReached` en FlatList del feed
- Incrementar offset en cada carga
- Anadir `ListFooterComponent` con spinner

**Riesgo**: Bajo. Solo anade logica de paginacion.
**Validacion**: Scroll hasta el final del feed, verificar que carga mas items.

#### A2. Ranking: eliminar COUNT subquery (P1)
**Archivos**: `supabase/33_ranking_optimization.sql`
**Problema**: `get_ranking_mensual` ejecuta un COUNT subquery por cada fila (~50 subqueries).
**Cambio**: Reescribir con LEFT JOIN + COUNT + GROUP BY en una sola pasada.
```sql
-- ANTES (N+1)
SELECT ..., (SELECT COUNT(*) FROM participantes WHERE user_id = p.id AND ...) as quedadas_mes

-- DESPUES (1 query)
SELECT ..., COALESCE(pcount.total, 0) as quedadas_mes
FROM profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) as total
  FROM participantes WHERE created_at >= date_trunc('month', now())
  GROUP BY user_id
) pcount ON p.id = pcount.user_id
```
**Riesgo**: Medio. Cambio SQL. Verificar que ranking muestra mismos numeros.
**Validacion**: Comparar ranking antes/despues en Supabase SQL Editor.

#### A3. Buscar usuarios: indice trigram (P2)
**Archivos**: `supabase/33_social_indexes.sql`
**Problema**: `ILIKE '%query%'` no usa indices.
**Cambio**:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_profiles_nombre_trgm ON profiles USING gin (nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_ciudad_trgm ON profiles USING gin (ciudad gin_trgm_ops);
```
**Riesgo**: Bajo. Extension pg_trgm ya existe en Supabase por defecto.
**Validacion**: `EXPLAIN ANALYZE` de buscar_usuarios antes/despues.

#### A4. Feed RPC: IN subquery a JOIN (P2)
**Archivos**: `supabase/33_social_indexes.sql`
**Problema**: `WHERE af.user_id IN (SELECT following_id FROM seguidores ...)` es suboptimo.
**Cambio**: Reescribir como JOIN o cambiar a `= ANY(ARRAY(...))`.
**Riesgo**: Bajo. Mismo resultado, mejor plan de ejecucion.

**Impacto total Bloque A**:
- Feed usable con 100+ items (actualmente maximo 30)
- Ranking 50x mas rapido (1 query vs 50 subqueries)
- Busqueda de usuarios usa index scan vs full scan

---

## BLOQUE B: Cache de Datos (Mobile)

### Estado actual

| Dato | Cacheado | Donde | TTL |
|------|----------|-------|-----|
| Weather | Si | useRef Map | 2h (MapScreen) + 30min (weather.ts) |
| Idioma | Si | AsyncStorage | Persistente |
| Session/email | Si | SecureStore | Persistente |
| Premium status | Si | React Context | Sesion |
| GPS crash recovery | Si | AsyncStorage | Hasta recovery |
| **Profile** | **No** | -- | -- |
| **Quedadas** | **No** | -- | -- |
| **Participaciones** | **No** | -- | -- |
| **Heatmap** | **No** | -- | -- |
| **Run stats** | **No** | -- | -- |
| **Matching** | **No** | -- | -- |

### Cambios propuestos

#### B1. Cache layer con useRef Map + TTL (P0)
**Archivos**: `src/services/queryCache.ts` (nuevo)
**Cambio**: Crear utilidad reutilizable de cache en memoria con TTL.
```typescript
// queryCache.ts
const cache = new Map<string, { data: any; ts: number }>();

export function getCached<T>(key: string, ttl: number): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < ttl) return entry.data as T;
  return null;
}

export function setCache(key: string, data: any): void {
  cache.set(key, { data, ts: Date.now() });
}

export function invalidate(key: string): void { cache.delete(key); }
export function invalidatePrefix(prefix: string): void {
  for (const k of cache.keys()) if (k.startsWith(prefix)) cache.delete(k);
}
```
**Riesgo**: Nulo. Utilidad nueva sin efectos laterales.

#### B2. Aplicar cache a queries criticas (P0)
**Archivos**: `api.ts`
**Cambio**: Envolver queries principales con getCached/setCache.

| Query | Key | TTL | Invalidar cuando |
|-------|-----|-----|-------------------|
| `getQuedadas` | `quedadas:{pais}` | 5 min | Pull-to-refresh, crear quedada |
| `getProfile` | `profile:{userId}` | 5 min | Editar perfil |
| `loadUserParticipations` | `participations:{userId}` | 5 min | Unirse/salir |
| `getHeatmapData` | `heatmap` | 30 min | Nunca (lazy-load ya) |
| `getUserRunStats` | `runstats:{userId}` | 10 min | Completar run |
| `getRecommendedQuedadas` | `recommendations:{userId}` | 10 min | Cambio ubicacion |

**Riesgo**: Bajo. Stale-while-revalidate: muestra cache, luego actualiza en background.
**Validacion**: Navegar entre tabs, verificar que no hay flash de datos vacios.

#### B3. Invalidacion en escrituras (P0)
**Archivos**: `api.ts` (en funciones de escritura)
**Cambio**: Tras unirseQuedada/salirQuedada, invalidar `participations:*` y `quedadas:*`.
Tras crearQuedada, invalidar `quedadas:*`.
Tras editarProfile, invalidar `profile:*`.

**Riesgo**: Bajo. Solo llama `invalidate()` despues de la escritura exitosa.

#### B4. Offline fallback con AsyncStorage (P2)
**Archivos**: `queryCache.ts`
**Cambio**: Para `getQuedadas` y `getProfile`, persistir ultima respuesta valida en AsyncStorage. Si red falla, devolver datos persistidos.
**Riesgo**: Medio. Datos potencialmente stale en modo offline.
**Validacion**: Activar modo avion, abrir app, verificar que muestra datos cacheados.

**Impacto total Bloque B**:
- -60% queries Supabase por sesion (datos servidos desde cache en cambios de tab)
- Navegacion entre tabs instantanea (0ms vs 200-500ms)
- Soporte offline basico para datos criticos

---

## BLOQUE C: Bundle Web (app.js)

### Estado actual

| Asset | Tamano | Gzip | Estado |
|-------|--------|------|--------|
| index.html | 476 KB | 85 KB | Monolitico, correcto para PWA |
| app.min.js | 656 KB | 144 KB | Minificado, defer |
| geo-data.min.js | 23 KB | 6.2 KB | Modularizado, defer |
| i18n-es.min.js | 33 KB | 10.3 KB | Preloaded (default lang) |
| i18n-en.min.js | 30 KB | ~10 KB | Preloaded |
| css/deferred.min.css | 84 KB | ~25 KB | Correcto |
| Modulos (toast, badges...) | ~25 KB | ~8 KB | Ya modularizados |
| **Total gzip** | | **~296 KB** | |

### Cambios propuestos

#### C1. Lazy-load strava.js (P0)
**Archivos**: `index.html`, `app.js`
**Problema**: strava.js (14 KB) se carga siempre aunque <5% usuarios lo usa.
**Cambio**: Eliminar `<script src="/js/strava.js" defer>`. Cargar dinamicamente al pulsar "Conectar Strava".
```javascript
async function connectStrava() {
  if (!window.StravaModule) {
    await loadScript('/js/strava.js');
  }
  window.StravaModule.connect();
}
```
**Riesgo**: Bajo. El boton de Strava muestra spinner mientras carga.
**Validacion**: Pulsar "Conectar Strava", verificar que funciona tras carga.
**Ahorro**: ~4-5 KB gzip

#### C2. Lazy-load push.js (P0)
**Archivos**: `index.html`, `app.js`
**Problema**: push.js (8.5 KB) se carga siempre.
**Cambio**: Cargar solo al abrir modal de notificaciones.
**Riesgo**: Bajo.
**Ahorro**: ~2-3 KB gzip

#### C3. Diferir i18n no-default (P1)
**Archivos**: `index.html`
**Problema**: i18n-en.min.js se precarga siempre (30 KB).
**Cambio**: Solo precargar idioma detectado del navegador. Cargar otros bajo demanda al cambiar idioma.
**Riesgo**: Bajo. Ligero delay al cambiar idioma la primera vez.
**Ahorro**: ~10 KB gzip para usuarios ES (mayoria)

#### C4. Extraer Premium features a bundle separado (P1)
**Archivos**: `app.js` -> `js/premium-features.js` (nuevo)
**Problema**: ~1,500-2,000 lineas de matching/premium en app.js que solo usan usuarios premium.
**Cambio**: Extraer funciones de matching, smart alerts, premium modals a archivo separado. Cargar dinamicamente al detectar plan premium o abrir modal premium.
**Riesgo**: Medio. Requiere verificar que todas las referencias cruzadas estan resueltas.
**Ahorro**: ~30-40 KB gzip
**Validacion**: Flujo completo de matching como usuario free y premium.

#### C5. Eliminar duplicados flags (P2)
**Archivos**: `app.js`
**Problema**: Objeto de banderas de paises aparece 3 veces (lineas 94, 5527, 8196).
**Cambio**: Unificar en una sola constante global.
**Riesgo**: Bajo.
**Ahorro**: ~0.3 KB gzip

#### C6. Verificar minificacion app.min.js (P0)
**Archivos**: Build script / `app.min.js`
**Problema**: app.min.js (656 KB) es mas grande que app.js (646 KB). Posible error en proceso de minificacion.
**Cambio**: Verificar pipeline de build. Ejecutar terser/esbuild manualmente y comparar.
**Riesgo**: Nulo. Solo diagnostico.
**Ahorro potencial**: Si minificacion esta rota, 30+ KB gzip

**Impacto total Bloque C**:
- Inicial: ~296 KB gzip -> ~250 KB gzip (-15%)
- Con premium split: -> ~220 KB gzip (-25%)

---

## Resumen de prioridades

### P0 (Impacto alto, riesgo bajo)
| ID | Cambio | Bloque | Esfuerzo |
|----|--------|--------|----------|
| A1 | Feed scroll infinito | Social | 2h |
| B1 | queryCache.ts utilidad | Cache | 1h |
| B2 | Cache en queries criticas | Cache | 2h |
| B3 | Invalidacion en escrituras | Cache | 1h |
| C1 | Lazy-load strava.js | Bundle | 30min |
| C2 | Lazy-load push.js | Bundle | 30min |
| C6 | Verificar minificacion | Bundle | 30min |

### P1 (Impacto medio)
| ID | Cambio | Bloque | Esfuerzo |
|----|--------|--------|----------|
| A2 | Ranking sin COUNT N+1 | Social | 1.5h |
| C3 | Diferir i18n no-default | Bundle | 1h |
| C4 | Premium features split | Bundle | 4h |

### P2 (Mejora incremental)
| ID | Cambio | Bloque | Esfuerzo |
|----|--------|--------|----------|
| A3 | Indice trigram busqueda | Social | 30min |
| A4 | Feed RPC IN->JOIN | Social | 1h |
| B4 | Offline fallback AsyncStorage | Cache | 3h |
| C5 | Eliminar duplicados flags | Bundle | 30min |

**Esfuerzo total estimado**: ~18h
- P0: ~7.5h
- P1: ~6.5h
- P2: ~5h
