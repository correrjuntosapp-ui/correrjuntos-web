# Progreso CorrerJuntos - 30 Enero 2026

## Resumen del dia

### Build actual: 7 (enviado a TestFlight, esperando procesamiento de Apple)

---

## Funcionalidades implementadas hoy

### 1. Sistema Social Completo
- **Seguir/Dejar de seguir usuarios**
- **Feed de actividad** de amigos (ver que hacen los runners que sigues)
- **Ranking/Leaderboard** con dos modos:
  - Mensual (puntos del mes)
  - Global (puntos totales)
- **Busqueda de usuarios** para encontrar nuevos runners
- **Usuarios sugeridos** para seguir

### 2. Filtro por Pais en Ranking (Build 7)
- Toggle para ver ranking:
  - "Mi pais" (solo runners de Espana)
  - "Mundial" (ranking global de todos los paises)

### 3. Boton de Seguir en Ranking (Build 7)
- Cada usuario en el ranking tiene un boton `+` para seguirlo
- Si ya lo sigues, muestra `checkmark` y puedes dejar de seguir

### 4. Barra de Navegacion Mejorada (Build 7)
- 4 tabs alineados al mismo nivel: Mapa, Social, Crear, Perfil
- Boton "Crear" mantiene su distintivo naranja con gradiente
- Todos los iconos son SVG premium con gradiente cuando estan activos

---

## Archivos creados/modificados

### Nuevos archivos SQL (ejecutar en Supabase):
1. **`supabase/14_social_system.sql`** - Sistema social completo
   - Tabla `seguidores` (quien sigue a quien)
   - Tabla `actividad_feed` (actividades de los usuarios)
   - Funciones: `seguir_usuario`, `dejar_de_seguir`, `get_feed_amigos`, `get_seguidores`, `get_siguiendo`, `get_ranking_mensual`, `get_ranking_global`, `buscar_usuarios`, `get_usuarios_sugeridos`
   - Triggers automaticos para el feed de actividad
   - **ESTADO: EJECUTADO**

2. **`supabase/15_ranking_por_pais.sql`** - Filtro por pais
   - Agrega columna `pais` a profiles (default 'ES')
   - Actualiza funciones de ranking para aceptar parametro `p_pais`
   - **ESTADO: EJECUTADO**

### Archivos de la app modificados:
1. **`src/screens/SocialScreen.tsx`** - Nueva pantalla social con:
   - 3 tabs: Ranking, Actividad (Feed), Buscar
   - Componentes para cada seccion
   - Manejo de estados de follow/unfollow
   - Modal de seguidores/siguiendo
   - Estilos premium dark mode

2. **`App.tsx`** - Navegacion actualizada:
   - Agregado SocialIcon (icono de trofeo)
   - Agregado tab "Social" en la navegacion
   - Boton Crear alineado pero destacado en naranja
   - CustomTabBar mejorado

3. **`app.json`** - Build number actualizado a 7

---

## Builds de hoy

| Build | Cambios principales | Estado |
|-------|---------------------|--------|
| 6 | Sistema social inicial (fix import supabase) | Completado |
| 7 | Boton seguir en ranking, filtro pais, tabs alineados | Enviado a TestFlight |

---

## Pendiente por probar en Build 7

1. **Boton de seguir (+)** en el ranking - verificar que funciona
2. **Filtro Mi pais / Mundial** - verificar que filtra correctamente
3. **Barra de navegacion** - verificar que los 4 botones estan alineados
4. **Feed de actividad** - verificar que muestra actividad de quienes sigues

---

## Proximos pasos sugeridos

### Mejoras al sistema social:
- [ ] Notificaciones cuando alguien te sigue
- [ ] Perfil publico de otros usuarios (al tocar en el ranking)
- [ ] Estadisticas comparativas con amigos

### Compartir en redes sociales:
- [ ] Compartir logros en Instagram/Twitter
- [ ] Compartir quedadas
- [ ] Imagen generada automaticamente con estadisticas

### Otras funcionalidades pendientes:
- [ ] Sistema de compras in-app (react-native-iap ya esta instalado)
- [ ] Chat entre participantes de quedadas
- [ ] Rutas guardadas/favoritas

---

## Enlaces utiles

- **Build 7 logs**: https://expo.dev/accounts/guetto100/projects/correr-juntos-app/builds/61642bbe-19b0-4ebf-b659-5d1da15b85b9
- **IPA Build 7**: https://expo.dev/artifacts/eas/d2wrTfjLo3xfFZbvKJQGYH.ipa
- **Submission**: https://expo.dev/accounts/guetto100/projects/correr-juntos-app/submissions/84c82d5c-8e2e-4f29-b7dc-1c1ebf474f26
- **App Store Connect**: https://appstoreconnect.apple.com

---

## Notas tecnicas

- Los SQL ya estan ejecutados en Supabase
- El perfil del usuario necesita tener `pais` configurado para el filtro (default: 'ES')
- El sistema de follow usa un Set<string> para lookup rapido de followingIds
- Las funciones RPC de ranking aceptan `p_pais` como parametro opcional (null = mundial)

---

*Ultimo update: 30 Enero 2026, ~22:00*
