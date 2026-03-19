# Plan: Virtualización de MapScreen

## Problema

`MapScreen.tsx` usa `ScrollView` + `.map()` para renderizar TODAS las cards de quedadas (hasta 100).
Esto causa:
- **30-40 FPS** en scroll con 50+ cards (debería ser 60fps)
- Todas las cards montadas en memoria simultáneamente
- Mount time alto en pantalla inicial

## Layout actual (líneas 1110-1414)

```
ScrollView
  ├── MapSection: título + radius tabs + MapView + botones
  ├── ContentSection: welcome card + crear btn + stats grid
  ├── Filtros: horario (ScrollView horizontal) + nivel (grid)
  └── Quedadas list: <View>{filteredQuedadas.map(...)}</View>  ← SIN VIRTUALIZACIÓN
```

## Propuesta: FlatList con ListHeaderComponent

```
FlatList
  data={filteredQuedadas}
  ListHeaderComponent={<MapSection /> + <ContentSection /> + <Filtros />}
  renderItem={renderQuedadaCard}   ← ya memoizado con useCallback (P1-02)
  ListEmptyComponent={<EmptyState />}
  refreshControl={<RefreshControl />}
  initialNumToRender={5}
  maxToRenderPerBatch={10}
  windowSize={5}
```

## Alternativa: FlashList

- `@shopify/flash-list@2.0.2` ya bundled en Expo SDK 54
- Mejor recycling que FlatList nativo
- Requiere `estimatedItemSize` (~180px por card)
- Recomendación: empezar con FlatList, migrar a FlashList después

## Conflicto de gestos: MapView vs FlatList

| Opción | Pros | Contras |
|--------|------|---------|
| **MapView dentro de ListHeader** | Una sola lista scroll | Gestos del mapa pueden conflictuar con FlatList |
| **MapView fijo arriba + FlatList debajo** | Sin conflicto de gestos | Menos espacio para cards, layout más complejo |
| **nestedScrollEnabled + scrollEnabled control** | Mantiene layout actual | Requiere lógica de toggle manual |

**Recomendación:** MapView fijo arriba (collapsible) + FlatList debajo. El mapa ya tiene `useMemo` para filteredQuedadas (P1-02).

## Prerequisitos

- Quick wins P1 completados (paginación, memoización)
- `renderQuedadaCard` ya envuelto en `useCallback` (commit 7ed5c64)
- `filteredQuedadas` ya calculado con `useMemo`

## Estimación

- FlatList básico (sin gesture fix): 3-4h
- Gesture handling mapa: 2-3h
- Migración a FlashList: 1h
- Testing iOS + Android: 2h
- **Total: ~8-10h**

## Impacto esperado

- Solo 5-8 cards renderizadas vs 100
- Scroll 60fps constante
- Mount time -70%
