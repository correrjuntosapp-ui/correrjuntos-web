# Plan Tecnico P1 — Performance CorrerJuntos

**Fecha:** 2026-03-09
**Scope:** Web + Mobile
**Objetivo:** Reducir tiempo de carga inicial, mejorar scroll performance, eliminar dead code.

---

## 1. Modularizacion de js/app.js

**Estado actual:** 12,299 lineas en un unico archivo monolitico. 50+ variables globales. Todo se carga upfront.

### Archivos afectados
- `js/app.js` (12,299 lineas) — se divide en modulos
- `index.html` — actualizar `<script>` tags con `type="module"` o carga lazy
- Nuevo directorio `js/modules/` con ~16 modulos

### Modulos propuestos (orden de extraccion)

| Fase | Modulo | Lineas | Dependencias | Dificultad |
|------|--------|--------|--------------|------------|
| **1** | `toast.js` | ~47 | Ninguna (DOM puro) | Baja |
| **1** | `confetti.js` | ~23 | Ninguna | Baja |
| **1** | `darkmode.js` | ~34 | localStorage | Baja |
| **1** | `skeletons.js` | ~18 | Ninguna | Baja |
| **1** | `badges.js` | ~30 | Configuracion estatica | Baja |
| **2** | `weather.js` | ~60 | Open-Meteo API | Baja |
| **2** | `share.js` | ~98 | Web Share API | Baja |
| **2** | `newsletter.js` | ~42 | Brevo API | Baja |
| **2** | `cookie-consent.js` | ~88 | GA4, Meta Pixel | Media |
| **2** | `qrcode.js` | ~64 | Libreria QR | Baja |
| **3** | `referral.js` | ~269 | Supabase (light) | Media |
| **3** | `chat.js` | ~190 | Supabase real-time | Media |
| **3** | `geocoding.js` | ~112 | Nominatim API | Media |
| **3** | `crear-quedada.js` | ~339 | Supabase + Leaflet | Alta |
| **4** | `quedada-detail.js` | ~334 | Supabase + Leaflet | Alta |
| **4** | `filters.js` | ~175 | Estado global filtros | Alta |

### Impacto esperado
- **Carga inicial:** -40-50% de JS parseado al arranque (lazy load modulos Fase 2-4)
- **TTI (Time to Interactive):** -1-2s en movil 3G
- **Mantenibilidad:** Cada modulo testeable de forma independiente
- **Tree-shaking:** Posible si se migra a ES modules

### Riesgos
| Riesgo | Severidad | Mitigacion |
|--------|-----------|------------|
| Variables globales compartidas entre modulos | Alta | Crear `state.js` centralizado con getters/setters |
| Orden de carga de scripts | Media | Usar `defer` + dependency graph explicito |
| Funciones llamadas desde HTML inline (`onclick`) | Media | Exponer API publica en `window.CJ = {}` namespace |
| Regresiones en flujos criticos (crear, unirse, pagar) | Alta | Smoke test manual de cada flujo tras cada fase |

### Dificultad estimada
- **Fase 1:** 2-3 horas (modulos sin dependencias)
- **Fase 2:** 3-4 horas (modulos con APIs externas)
- **Fase 3:** 4-6 horas (modulos con Supabase)
- **Fase 4:** 6-8 horas (modulos con estado complejo)
- **Total:** ~15-20 horas

---

## 2. Paginacion y limites en consultas

**Estado actual:** `.limit(100)` en quedadas (ya aplicado en P1-03). Pero otras queries no tienen limites.

### Archivos afectados
- `js/app.js` — queries de ranking, stats, participantes, comentarios
- `correr-juntos-app/src/services/api.ts` — queries mobile
- `correr-juntos-app/src/screens/SocialScreen.tsx` — feed sin paginacion
- `correr-juntos-app/src/screens/MapScreen.tsx` — ya tiene `useMemo` para filteredQuedadas

### Mejoras propuestas

| Query | Archivo | Limite actual | Limite propuesto | Tipo |
|-------|---------|---------------|------------------|------|
| Quedadas (web) | `app.js:7370` | 100 | 100 (OK) | Ya hecho |
| Quedadas (mobile) | `api.ts:getQuedadas` | Sin limite | `.limit(100)` | Cursor-based si >100 |
| Ranking semanal | `app.js:10372` | Sin limite | `.limit(50)` | Top 50 suficiente |
| Feed social | `SocialScreen.tsx` | Sin limite | `.limit(30)` + infinite scroll | FlatList `onEndReached` |
| Comentarios | `app.js:1828` | Sin limite | `.limit(50)` + "ver mas" | Paginacion offset |
| Participantes modal | `MapScreen.tsx:612` | Sin limite | `.limit(30)` | Raro tener >30 |
| Historial runs | `RunHistoryScreen.tsx` | Sin limite | `.limit(20)` + infinite scroll | Cursor-based |
| Notificaciones enviadas | Edge function | Sin limite | Batch de 50 | Rate limiting |

### Impacto esperado
- **Supabase:** -30-50% de datos transferidos por sesion
- **Tiempo de respuesta:** -200-500ms en queries grandes
- **Memoria cliente:** Reduccion significativa en listas largas

### Riesgos
| Riesgo | Severidad | Mitigacion |
|--------|-----------|------------|
| UX de "faltan datos" si limite muy bajo | Baja | Botones "Cargar mas" / infinite scroll |
| Inconsistencia entre web y mobile | Media | Mismos limites en ambas plataformas |
| Cursor-based pagination mas complejo | Baja | Solo donde haya >100 items reales |

### Dificultad estimada
- **Limites simples (.limit):** 1 hora
- **Infinite scroll en SocialScreen:** 2-3 horas
- **Cursor-based en RunHistory:** 2 horas
- **Total:** ~5-6 horas

---

## 3. Virtualizacion de listas en MapScreen

**Estado actual:** `ScrollView` + `.map()` renderiza TODAS las cards (hasta 100). Sin virtualizacion.

### Archivos afectados
- `correr-juntos-app/src/screens/MapScreen.tsx` (lineas 1110-1414)

### Layout actual (dentro del ScrollView)
```
ScrollView (linea 1110)
  +-- MapSection: titulo + radius tabs + MapView + botones
  +-- ContentSection: welcome card + crear btn + stats grid
  +-- Filtros: horario (ScrollView horizontal) + nivel (grid)
  +-- Quedadas list: <View>{filteredQuedadas.map(...)}</View>  <-- SIN VIRTUALIZACION
```

### Propuesta: FlatList con ListHeaderComponent

```
FlatList
  data={filteredQuedadas}
  ListHeaderComponent={
    <MapSection /> + <ContentSection /> + <Filtros />
  }
  renderItem={renderQuedadaCard}
  ListEmptyComponent={<EmptyState />}
  refreshControl={<RefreshControl />}
```

### Alternativa: FlashList (ya disponible)
- `@shopify/flash-list@2.0.2` ya esta bundled en Expo SDK 54
- Mejor recycling que FlatList nativo
- Requiere `estimatedItemSize` (card ~180px)

### Impacto esperado
- **Memoria:** Solo 5-8 cards renderizadas vs 100 completas
- **Scroll FPS:** 60fps constante (vs drops a 30-40fps con 50+ cards)
- **Mount time:** -70% en pantalla inicial (solo visible cards)

### Riesgos
| Riesgo | Severidad | Mitigacion |
|--------|-----------|------------|
| **Conflicto de gestos MapView vs FlatList** | **Alta** | `nestedScrollEnabled`, o sacar mapa fuera del FlatList como header fijo |
| ScrollViews horizontales dentro de FlatList | Media | Funciona pero testear en Android low-end |
| Pull-to-refresh cambia de comportamiento | Baja | FlatList soporta `refreshControl` nativo |
| Scroll position reset al cambiar filtros | Media | `scrollToOffset(0)` al cambiar filtros |
| FlashList bugs con layout complejo | Media | Usar FlatList primero, migrar a FlashList despues |

### Dificultad estimada
- **FlatList basico (sin gesture fix):** 3-4 horas
- **Gesture handling mapa:** 2-3 horas adicionales
- **Migracion a FlashList:** 1 hora adicional
- **Testing iOS + Android:** 2 horas
- **Total:** ~8-10 horas

### Nota
SocialScreen.tsx **ya usa FlatList** correctamente. El patron esta validado en el codebase.

---

## 4. Eliminacion de duplicados i18n y reduccion de bundle

**Estado actual:**
- 2 locale files: `es.ts` (24KB, 546 keys) + `en.ts` (22KB, 546 keys) = **46KB**
- Ambos cargados eagerly al inicio (sin lazy loading)
- 409 llamadas a `t()` en screens (buena adopcion)
- **20+ strings hardcodeados en espanol** que bypasean i18n
- Codigo duplicado de push subscription en `push.js` + `deeplink.js`

### Archivos afectados
- `correr-juntos-app/src/i18n/index.ts` — lazy loading
- `correr-juntos-app/src/i18n/locales/es.ts` — limpiar keys no usados
- `correr-juntos-app/src/i18n/locales/en.ts` — idem
- `correr-juntos-app/src/screens/CreateQuedadaScreen.tsx` — 7 strings hardcodeados
- `correr-juntos-app/src/screens/ProfileScreen.tsx` — 6 strings hardcodeados
- `correr-juntos-app/src/screens/CreateEventScreen.tsx` — 3 strings hardcodeados
- `correr-juntos-app/src/screens/RunSummaryScreen.tsx` — 2 strings hardcodeados
- `correr-juntos-app/src/screens/UserProfileScreen.tsx` — 2 strings hardcodeados
- `js/push.js` + `js/deeplink.js` — deduplicar codigo push

### Mejoras propuestas

| Mejora | Impacto bundle | Dificultad |
|--------|----------------|------------|
| **Lazy load locale no activo** | -22KB (50% de i18n) | Media |
| **Mover hardcoded strings a i18n** | +0 (ya existen keys similares) | Baja |
| **Deduplicar push.js/deeplink.js** | -3KB | Baja |
| **Audit de keys no usados** | -2-5KB estimado | Media |

#### 4a. Lazy loading de locales
```typescript
// Antes (eager — 46KB siempre)
import es from './locales/es';
import en from './locales/en';
const translations = { es, en };

// Despues (lazy — 24KB inicial, +22KB solo si cambia idioma)
const translations: Record<string, any> = {};
translations.es = (await import('./locales/es')).default; // carga inmediata
// en.ts solo se carga cuando el usuario cambia a ingles
async function loadLocale(lang: string) {
  if (!translations[lang]) {
    translations[lang] = (await import(`./locales/${lang}`)).default;
  }
}
```

#### 4b. Strings hardcodeados a migrar
```
CreateQuedadaScreen: 7 Alert.alert() con texto en espanol
ProfileScreen: 6 Alert.alert() con texto en espanol
CreateEventScreen: 3 Alert.alert() con texto en espanol
RunSummaryScreen: 2 Alert.alert() con texto en espanol
UserProfileScreen: 2 Alert.alert() con texto en espanol
```
Todos son `Alert.alert('Error', '...')` — crear key `common.errors.{tipo}` reutilizable.

#### 4c. Deduplicar push subscription
`deeplink.js` tiene ~80 lineas de codigo push que duplican `push.js`. Extraer a un unico `push.js` e importar desde deeplink.

### Impacto esperado
- **Bundle inicial:** -22KB (lazy locale) -3KB (dedup push) = **-25KB**
- **Cobertura i18n:** 100% (vs ~95% actual)
- **DX:** Menos confusion sobre donde estan las traducciones

### Riesgos
| Riesgo | Severidad | Mitigacion |
|--------|-----------|------------|
| Flash de texto sin traducir durante lazy load | Media | Precargar locale activo sync, lazy solo el alternativo |
| Dynamic import no soportado en algun bundler | Baja | Expo/Metro lo soporta desde SDK 50 |
| Romper cambio de idioma en runtime | Media | Test manual ES->EN->ES |

### Dificultad estimada
- **Lazy loading locales:** 2 horas
- **Migrar 20 hardcoded strings:** 1-2 horas
- **Deduplicar push code:** 1 hora
- **Audit keys no usados:** 2-3 horas
- **Total:** ~6-8 horas

---

## Orden recomendado de implementacion

| Prioridad | Mejora | Esfuerzo | Impacto | ROI |
|-----------|--------|----------|---------|-----|
| **1** | Paginacion queries (limites simples) | 1h | Alto | Mejor |
| **2** | Deduplicar push.js/deeplink.js | 1h | Medio | Alto |
| **3** | Migrar hardcoded strings a i18n | 1-2h | Medio | Alto |
| **4** | Lazy loading locales | 2h | Medio | Alto |
| **5** | Modularizacion app.js Fase 1 (sin deps) | 2-3h | Alto | Alto |
| **6** | FlatList en MapScreen | 8-10h | Alto | Medio |
| **7** | Modularizacion app.js Fase 2 (APIs) | 3-4h | Alto | Medio |
| **8** | Infinite scroll SocialScreen | 2-3h | Medio | Medio |
| **9** | Modularizacion app.js Fase 3-4 | 10-14h | Alto | Medio |
| **10** | Audit i18n keys no usados | 2-3h | Bajo | Bajo |

**Esfuerzo total estimado:** ~35-50 horas
**Quick wins (prioridad 1-5):** ~7-9 horas para 60% del impacto

---

## Metricas de exito

| Metrica | Actual (estimado) | Objetivo |
|---------|-------------------|----------|
| JS parseado al inicio (web) | ~350KB | <200KB |
| TTI movil 3G (web) | ~5s | <3s |
| Scroll FPS MapScreen (100 cards) | 30-40fps | 60fps |
| Datos transferidos por sesion | ~500KB | <300KB |
| Bundle i18n cargado al inicio | 46KB | 24KB |
| Cobertura i18n mobile | ~95% | 100% |
| TypeScript errors | 0 | 0 |
