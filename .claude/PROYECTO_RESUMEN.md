# CorrerJuntos - Resumen Completo del Proyecto

**Última actualización**: 31 Enero 2026

---

## 🏗️ ESTRUCTURA DE PROYECTOS (¡SEPARADOS!)

### 1. WEB (Landing Page)
- **URL**: https://correrjuntos.com
- **Carpeta**: `C:\Users\guett\OneDrive\Escritorio\correrjuntosV2\` (raíz)
- **Archivos**: `index.html`, `privacy.html`, `sw.js`, `manifest.json`
- **Deploy**: `vercel --prod` desde carpeta raíz
- **Vercel Project**: `correrjuntos` (NO conectar a Git)

### 2. APP MÓVIL (iOS/Android)
- **Carpeta**: `C:\Users\guett\OneDrive\Escritorio\correrjuntosV2\correr-juntos-app\`
- **Tecnología**: React Native + Expo
- **Bundle ID**: `com.correrjuntos.app`
- **App Store ID**: `6758505910`

---

## 📱 APP iOS - ESTADO ACTUAL

### Versión Actual
- **Version**: 1.0.0
- **BuildNumber**: 13 (próximo: 14)
- **TestFlight**: https://appstoreconnect.apple.com/apps/6758505910/testflight/ios

### Funcionalidades Implementadas ✅
| Funcionalidad | Estado | Archivo Principal |
|---------------|--------|-------------------|
| Multi-idioma ES/EN | ✅ | `src/i18n/index.ts` |
| Detección idioma iOS | ✅ | `expo-localization` |
| Mapa mundial | ✅ | `src/screens/MapScreen.tsx` |
| Registro Email | ✅ | `src/context/AuthContext.tsx` |
| Registro Google | ✅ | OAuth con Supabase |
| Registro Apple | ✅ | `expo-apple-authentication` |
| Fotos de perfil | ✅ | `src/screens/ProfileScreen.tsx` |
| Geolocalización | ✅ | `expo-location` |
| Push Notifications | ✅ | `src/services/notifications.ts` |

### Comandos para Build iOS
```bash
cd "C:\Users\guett\OneDrive\Escritorio\correrjuntosV2\correr-juntos-app"

# Build
eas build --platform ios --profile production

# Subir a TestFlight
eas submit --platform ios --latest

# Gestionar credenciales (interactivo)
eas credentials
```

---

## 🍎 APPLE SIGN IN - CONFIGURACIÓN

### Supabase (Authentication > Providers > Apple)
- **Enable Sign in with Apple**: ✅ Activado
- **Client IDs**: `com.correrjuntos.app`
- **Secret Key**: JWT generado (expira cada 6 meses)

### Apple Developer
- **Team ID**: `4AVU63B7Q4`
- **Key ID**: `5ZXFD6J24N`
- **Key File**: `AuthKey_5ZXFD6J24N.p8` (guardado en Downloads)

### Generar nuevo JWT Secret (cuando expire)
```javascript
// Ejecutar con Node.js
const crypto = require('crypto');
const fs = require('fs');

const teamId = '4AVU63B7Q4';
const keyId = '5ZXFD6J24N';
const clientId = 'com.correrjuntos.app';
const privateKey = fs.readFileSync('AuthKey_5ZXFD6J24N.p8', 'utf8');

const header = { alg: 'ES256', kid: keyId, typ: 'JWT' };
const now = Math.floor(Date.now() / 1000);
const payload = {
  iss: teamId,
  iat: now,
  exp: now + (86400 * 180), // 180 días
  aud: 'https://appleid.apple.com',
  sub: clientId
};

// Base64url encode y firmar...
```

---

## 🌐 WEB - CONFIGURACIÓN

### Características
- Multi-idioma (ES/EN)
- Disponible mundialmente (cualquier país)
- Búsqueda global con Nominatim API
- Google OAuth configurado
- Sistema Premium con popup cada 7 días (solo usuarios FREE)

### Deploy Web
```bash
cd "C:\Users\guett\OneDrive\Escritorio\correrjuntosV2"
vercel --prod --yes
```

### Sistema Premium (Web)
- **Popup**: Cada 7 días para usuarios FREE
- **Usuarios Premium**: NUNCA ven el popup
- **Función**: `maybeShowPremiumPromo()` (línea ~6233 en index.html)
- **LocalStorage**: `cj_premium_promo_last`

---

## 🗄️ SUPABASE

### URL del Proyecto
`https://waihiwdbtcbdazmaxdor.supabase.co`

### Tablas Principales
| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfiles de usuario (nombre, ciudad, nivel, foto) |
| `quedadas` | Eventos/quedadas creados |
| `participantes` | Relación usuarios-quedadas |
| `subscriptions` | Suscripciones premium |
| `push_tokens` | Tokens de notificaciones push |
| `avatars` (bucket) | Fotos de perfil |

### Verificar Usuario Premium
```sql
SELECT * FROM subscriptions
WHERE user_id = 'USER_ID'
AND status = 'active'
AND current_period_end > NOW();
```

---

## 🔧 ARCHIVOS MODIFICADOS (Compatibilidad Web)

Estos archivos tienen imports condicionales `Platform.OS !== 'web'`:

1. **`src/services/notifications.ts`**
   - expo-notifications, expo-device, expo-constants

2. **`src/context/AuthContext.tsx`**
   - SecureStore → localStorage en web
   - AppleAuthentication (solo iOS)
   - expo-location

3. **`src/screens/OnboardingScreen.tsx`**
   - Browser Geolocation API en web

4. **`src/screens/CreateQuedadaScreen.tsx`**
   - Browser Geolocation + Nominatim en web
   - Botón publicar dentro del scroll (fix build 13)

5. **`src/screens/MapScreen.tsx`**
   - Browser Geolocation API en web

---

## ⚠️ PROBLEMAS CONOCIDOS Y SOLUCIONES

### 1. Apple Sign In no funciona
**Causa**: JWT Secret expirado o Apple no configurado en Supabase
**Solución**:
1. Supabase > Authentication > Providers > Apple
2. Verificar que esté activado
3. Client IDs = `com.correrjuntos.app`
4. Regenerar JWT si expiró

### 2. Provisioning Profile sin Sign in with Apple
**Causa**: Profile creado antes de añadir la capability
**Solución**:
1. https://expo.dev/accounts/guetto100/projects/correr-juntos-app/credentials
2. iOS > Eliminar Provisioning Profile
3. Ejecutar `eas build --platform ios --profile production`
4. Decir "Y" cuando pregunte por nuevo profile

### 3. Botón Publicar no visible (CreateQuedadaScreen)
**Causa**: Footer con position absolute se ocultaba
**Solución**: Build 13 - botón ahora dentro del ScrollView

### 4. Web muestra app en lugar de landing
**Causa**: Vercel conectado al repo de la app
**Solución**:
1. Vercel > Project Settings > Git > Disconnect
2. `cd correrjuntosV2 && vercel --prod`

---

## 📋 CHECKLIST ANTES DE NUEVO BUILD

- [ ] Incrementar `buildNumber` en `app.json`
- [ ] Verificar que `com.correrjuntos.app` es el Bundle ID
- [ ] Apple Sign In configurado en Supabase (no expirado)
- [ ] Provisioning Profile tiene Sign in with Apple capability
- [ ] Probar en TestFlight antes de enviar a App Store

---

## 🚀 PRÓXIMOS PASOS PENDIENTES

1. **Compras In-App**: Funcionan solo cuando la app esté en App Store (no en TestFlight)
2. **Android**: Build pendiente (`eas build --platform android`)
3. **App Store Review**: Enviar a revisión cuando esté lista

---

## 📞 CREDENCIALES Y ACCESOS

### Expo
- **Owner**: guetto100
- **Project ID**: `236bbb35-24f6-47d4-8f1e-f43d79dded3d`

### Apple Developer
- **Team**: Abraham Marquez (Individual)
- **Team ID**: `4AVU63B7Q4`

### App Store Connect
- **App ID**: `6758505910`
- **Bundle ID**: `com.correrjuntos.app`

---

## 📝 NOTAS IMPORTANTES

1. **NUNCA mezclar** web y app en Vercel
2. **Web** = archivos estáticos en raíz
3. **App** = proyecto Expo en subcarpeta `correr-juntos-app`
4. JWT de Apple expira cada 6 meses - regenerar antes
5. La app detecta automáticamente el idioma del iPhone
6. Usuarios de cualquier país pueden usar la app
