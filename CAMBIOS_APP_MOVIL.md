# CorrerJuntos App - Cambios Implementados

## Resumen de Funcionalidades Implementadas

### 1. Push Notifications (Expo Push + Supabase)
- **Archivos modificados:**
  - `src/services/notifications.ts` - Servicio de notificaciones
  - `src/context/AuthContext.tsx` - Setup automático al login
  - `supabase/functions/send-push-notification/index.ts` - Edge Function

- **Funcionalidades:**
  - Registro automático de push token al iniciar sesión
  - Notificaciones cuando alguien se une a tu quedada
  - Recordatorios 24h y 1h antes de quedadas
  - Notificaciones de nuevas quedadas en tu ciudad
  - Preferencias de notificación sincronizadas con Supabase

### 2. Filtro de Quedadas por Ubicación (Haversine)
- **Archivo:** `src/screens/MapScreen.tsx`
- **Funcionalidades:**
  - Botón "Mi ubicación" que filtra quedadas en un radio de 50km
  - Fórmula de Haversine para calcular distancias precisas
  - Muestra distancia desde el usuario en cada tarjeta de quedada
  - Ordenación por proximidad cuando está activo el filtro

### 3. Auto-fill Punto de Encuentro
- **Archivo:** `src/screens/CreateQuedadaScreen.tsx`
- **Funcionalidades:**
  - Al tocar el mapa, se hace reverse geocoding
  - Autorellena el campo "Punto de encuentro" con la dirección
  - Indicador de carga mientras obtiene la dirección
  - Soporte para arrastrar el marcador

### 4. Botón "Crear Quedada" en Header
- **Archivo:** `src/screens/MapScreen.tsx`
- **Cambio:** Reemplazado "Hola, {nombre}" por un botón visual con gradiente naranja para crear quedadas

### 5. Perfil Mejorado

#### 5.1 Lista Completa de Países (195+)
- **Archivo:** `src/screens/ProfileScreen.tsx`
- Todos los países del mundo ordenados alfabéticamente en español
- Con banderas emoji

#### 5.2 Redes Sociales con Logos SVG Oficiales
- **Archivo:** `src/screens/ProfileScreen.tsx`
- **Instagram:** Icono SVG con degradado oficial
- **Strava:** Icono SVG naranja oficial
- **X (Twitter):** Icono SVG del nuevo logo

#### 5.3 Campo de Teléfono con Selector de Prefijo
- **Archivo:** `src/screens/ProfileScreen.tsx`
- 64 prefijos telefónicos de países principales
- Modal selector con bandera + prefijo + nombre
- Separación visual entre prefijo y número

#### 5.4 Subida de Foto de Perfil
- **Archivo:** `src/screens/ProfileScreen.tsx`
- **Dependencia:** `expo-image-picker`
- Avatar clickeable con indicador de edición
- Subida a Supabase Storage (bucket: avatars)
- Indicador de carga durante subida

### 6. Correcciones de Bugs

#### 6.1 Creación de Quedadas
- Corregidos nombres de campos: `lat`/`lng` (no `latitud`/`longitud`)
- Campo `distancia` como texto con "km" (no `distancia_km` numérico)

#### 6.2 Teclado en iOS
- Añadido `returnKeyType="done"` en campos
- `onSubmitEditing={Keyboard.dismiss}` para cerrar teclado
- `TouchableWithoutFeedback` para cerrar al tocar fuera

#### 6.3 Scroll en Perfil
- Aumentado `paddingBottom: 120` para llegar al final

---

## Archivos SQL para Supabase

### Ejecutar en orden:
1. `supabase/00_quedadas_rls.sql` - Tablas y RLS de quedadas
2. `supabase/11_notificacion_preferencias.sql` - Preferencias de notificaciones
3. `supabase/12_notificaciones_enviadas.sql` - Historial de notificaciones
4. `supabase/13_avatars_storage.sql` - Storage para fotos de perfil

### Configuración Manual Necesaria:

#### Bucket de Avatars (Supabase Storage)
1. Dashboard > Storage > New bucket
2. Nombre: `avatars`
3. Marcar: "Public bucket"
4. Crear bucket
5. Ejecutar `13_avatars_storage.sql` para las políticas

---

## Dependencias Instaladas

```bash
npx expo install expo-image-picker
```

---

## Estructura de Archivos Modificados

```
correr-juntos-app/
├── src/
│   ├── screens/
│   │   ├── MapScreen.tsx          # Filtro ubicación, botón crear
│   │   ├── CreateQuedadaScreen.tsx # Auto-fill, teclado
│   │   └── ProfileScreen.tsx       # Países, redes, teléfono, foto
│   ├── services/
│   │   └── notifications.ts        # Push notifications
│   └── context/
│       └── AuthContext.tsx         # Setup push al login
│
supabase/
├── functions/
│   └── send-push-notification/
│       └── index.ts                # Edge Function push
├── 00_quedadas_rls.sql
├── 11_notificacion_preferencias.sql
├── 12_notificaciones_enviadas.sql
└── 13_avatars_storage.sql          # Storage avatars
```

---

## Próximos Pasos Sugeridos

1. **App Store / Play Store:**
   - Crear cuenta de Apple Developer ($99/año)
   - Crear cuenta de Google Play Console ($25 único)
   - Configurar EAS Build para generar binarios
   - Preparar assets (iconos, screenshots, descripciones)

2. **Mejoras opcionales:**
   - Chat entre participantes de quedada
   - Historial de quedadas asistidas
   - Sistema de valoraciones entre runners
   - Integración con Strava API

---

## Notas Importantes

- La app usa **Expo Go** para desarrollo
- Base de datos: **Supabase**
- Push notifications: **Expo Push Notifications**
- Mapas: **react-native-maps**
- Estilos: Tema oscuro/claro dinámico

---

*Última actualización: Enero 2026*
