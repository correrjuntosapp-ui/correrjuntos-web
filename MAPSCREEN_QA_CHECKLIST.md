# QA Manual — MapScreen Performance

Ejecutar en iOS + Android (emulador o dispositivo físico).

## 1. Scroll con 50+ cards
- [ ] Abrir MapScreen con radio "Todo el país" (máx cards)
- [ ] Scroll rápido arriba/abajo — debe sentirse 60fps, sin saltos
- [ ] Scroll lento — cards aparecen sin parpadeo ni huecos blancos
- [ ] Volver arriba rápido — header (mapa + filtros) renderiza correctamente

## 2. Pan/zoom del mapa
- [ ] Pan (arrastrar) dentro del mapa — no interfiere con scroll de la lista
- [ ] Zoom pinch dentro del mapa — funciona sin que la lista se mueva
- [ ] Scroll vertical fuera del mapa — la lista scrollea, el mapa no captura el gesto
- [ ] Pan rápido en mapa — markers aparecen en <300ms (viewport culling + buffer)

## 3. Interacción marker → modal/card
- [ ] Tocar marker — modal detalle se abre con datos correctos (título, hora, nivel, participantes)
- [ ] Cerrar modal — vuelve al estado anterior sin crash
- [ ] Tocar "Ver más" en card — modal se abre correctamente
- [ ] Tocar icono "centrar" en card — mapa anima a la ubicación de la quedada

## 4. Filtros horario/nivel
- [ ] Activar filtro "Mañana" — solo cards con hora 6-12h
- [ ] Activar filtro "Noche" — solo cards con hora 20-6h
- [ ] Combinar 2+ filtros horario — unión correcta
- [ ] Activar filtro nivel "Principiante" — solo cards nivel principiante
- [ ] Combinar horario + nivel — intersección correcta
- [ ] Desactivar todos — vuelve la lista completa
- [ ] Contador badge actualiza en cada cambio de filtro

## 5. Pull-to-refresh
- [ ] Desde top de la lista, pull down — spinner naranja aparece
- [ ] Datos se recargan (verificar con Supabase log o cambio visible)
- [ ] No se puede pull-to-refresh desde medio de la lista (comportamiento estándar FlatList)

## 6. Render sin regresiones
- [ ] Weather badges aparecen en cards (sol/nube/lluvia)
- [ ] Botón "Unirme" funciona — solo esa card re-renderiza (verificar con React DevTools si posible)
- [ ] Botón "Salir" funciona — alerta + actualización correcta
- [ ] Heatmap toggle funciona (botón fuego)
- [ ] Botón "Centrar en mi ubicación" funciona
- [ ] Dark mode toggle — toda la pantalla cambia sin crash
- [ ] Cambio de radio (5km/20km/50km/país) filtra correctamente
- [ ] Empty state aparece si filtros no devuelven resultados

## Criterio de aceptación
Todos los checks marcados en **ambas plataformas**. Si algún gesto mapa/scroll conflictúa en Android específico, documentar modelo y versión.

## Cambios implementados (referencia)

| Fase | Archivo | Descripción |
|------|---------|-------------|
| 1 | `src/components/QuedadaCard.tsx` (nuevo) | Card memoizada con React.memo + comparador custom |
| 2 | `src/screens/MapScreen.tsx` | ScrollView + .map() → FlatList virtualizada |
| 3 | `src/components/QuedadaMarker.tsx` (nuevo) | Marker memoizado + tracksViewChanges={false} |
| 4 | `src/screens/MapScreen.tsx` | Viewport culling con onRegionChangeComplete + debounce 150ms |
| 5 | `src/screens/MapScreen.tsx` | Set para filtros O(1), cleanup timeout unmount |
