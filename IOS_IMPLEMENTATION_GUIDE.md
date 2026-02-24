# CorrerJuntos - Guía de Implementación iOS (Expo/React Native)

## 📋 RESUMEN DEL PROYECTO
App de running social donde los usuarios pueden encontrar compañeros para correr.
- **Modelo de negocio:** Freemium con suscripción Premium a €4.99/mes
- **Tecnología:** Expo / React Native
- **Build actual:** 17 en TestFlight
- **Bundle ID:** `com.correrjuntos.app`

---

## ⚡ MEJORAS A IMPLEMENTAR (31 Enero 2025)

### ✅ Ya funcionando en WEB - Falta en APP:

| Funcionalidad | Prioridad | Estado Web | Estado App |
|---------------|-----------|------------|------------|
| Sistema Premium €4.99/mes | 🔴 ALTA | ✅ Listo | ❌ Pendiente |
| Stripe checkout | 🔴 ALTA | ✅ Listo | ❌ Pendiente |
| Webhook activación Premium | 🔴 ALTA | ✅ Listo | ✅ Compartido |
| Integración Strava | 🟡 MEDIA | ✅ Listo | ❌ Pendiente |
| Notificaciones Premium | 🟡 MEDIA | ✅ Listo | ❌ Pendiente |
| UI Premium bloqueada | 🟢 BAJA | ✅ Listo | ❌ Pendiente |

---

## 🔴 TAREA 1: SISTEMA PREMIUM

### 1.1 Crear contexto Premium
```typescript
// src/context/PremiumContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface PremiumContextType {
  isPremium: boolean;
  loading: boolean;
  checkPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkPremiumStatus = async () => {
    if (!user) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('es_premium')
        .eq('id', user.id)
        .single();

      if (data) {
        setIsPremium(data.es_premium || false);
      }
    } catch (error) {
      console.error('Error checking premium:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPremiumStatus();
  }, [user]);

  return (
    <PremiumContext.Provider value={{ isPremium, loading, checkPremiumStatus }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) throw new Error('usePremium must be used within PremiumProvider');
  return context;
};
```

### 1.2 Botón "Hazte Premium"
```typescript
// src/components/PremiumButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Linking } from 'react-native';
import { usePremium } from '../context/PremiumContext';

const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/8wM17O5my5S31gs8ww';

export const PremiumButton: React.FC = () => {
  const { isPremium } = usePremium();

  const handlePress = () => {
    Linking.openURL(STRIPE_CHECKOUT_URL);
  };

  if (isPremium) {
    return (
      <TouchableOpacity style={[styles.button, styles.premiumActive]} disabled>
        <Text style={styles.text}>⭐ Premium Activo</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.text}>⭐ Hazte Premium - 4,99€/mes</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  premiumActive: {
    backgroundColor: '#4CAF50',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
```

### 1.3 Componente de feature bloqueada
```typescript
// src/components/PremiumLock.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/8wM17O5my5S31gs8ww';

interface PremiumLockProps {
  title: string;
  children: React.ReactNode;
  isPremium: boolean;
}

export const PremiumLock: React.FC<PremiumLockProps> = ({ title, children, isPremium }) => {
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.lockedOverlay}>
        <Ionicons name="lock-closed" size={40} color="#FFD700" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Función Premium</Text>
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={() => Linking.openURL(STRIPE_CHECKOUT_URL)}
        >
          <Text style={styles.unlockText}>🔓 Desbloquear - 4,99€/mes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
  },
  lockedOverlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 5,
  },
  unlockButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  unlockText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
```

---

## 🟠 TAREA 2: INTEGRACIÓN STRAVA

### 2.1 Configuración Strava
```typescript
// src/config/strava.ts
export const STRAVA_CONFIG = {
  CLIENT_ID: '199454',
  CLIENT_SECRET: 'f176cbe4a5c51e9ba48b423406758f31e8451ca2',
  REDIRECT_URI: 'correrjuntos://strava-callback',
  AUTH_URL: 'https://www.strava.com/oauth/authorize',
  SCOPES: 'read,activity:read_all',
  API_AUTH_ENDPOINT: 'https://www.correrjuntos.com/api/strava-auth',
  API_REFRESH_ENDPOINT: 'https://www.correrjuntos.com/api/strava-refresh',
};
```

### 2.2 Hook de Strava
```typescript
// src/hooks/useStrava.ts
import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { STRAVA_CONFIG } from '../config/strava';

interface StravaConnection {
  strava_athlete_id: number;
  athlete_data: {
    firstname: string;
    lastname: string;
    profile: string;
  };
}

export const useStrava = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [athleteData, setAthleteData] = useState<any>(null);

  // Verificar conexión existente
  const checkConnection = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('strava_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setIsConnected(true);
        setAthleteData(data.athlete_data);
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Conectar con Strava
  const connectStrava = async () => {
    const authUrl = `${STRAVA_CONFIG.AUTH_URL}?` +
      `client_id=${STRAVA_CONFIG.CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(STRAVA_CONFIG.REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${STRAVA_CONFIG.SCOPES}`;

    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      STRAVA_CONFIG.REDIRECT_URI
    );

    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);
      const code = url.searchParams.get('code');

      if (code) {
        await exchangeCodeForToken(code);
      }
    }
  };

  // Intercambiar código por token
  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await fetch(STRAVA_CONFIG.API_AUTH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.access_token) {
        // Guardar en Supabase
        await supabase.from('strava_connections').upsert({
          user_id: user?.id,
          strava_athlete_id: data.athlete.id,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          athlete_data: data.athlete,
        });

        setIsConnected(true);
        setAthleteData(data.athlete);
      }
    } catch (error) {
      console.error('Error exchanging Strava code:', error);
    }
  };

  // Desconectar Strava
  const disconnectStrava = async () => {
    if (!user) return;

    await supabase
      .from('strava_connections')
      .delete()
      .eq('user_id', user.id);

    setIsConnected(false);
    setAthleteData(null);
  };

  useEffect(() => {
    checkConnection();
  }, [user]);

  return {
    isConnected,
    loading,
    athleteData,
    connectStrava,
    disconnectStrava,
  };
};
```

### 2.3 Componente Strava UI
```typescript
// src/components/StravaSection.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useStrava } from '../hooks/useStrava';
import { usePremium } from '../context/PremiumContext';
import { PremiumLock } from './PremiumLock';

export const StravaSection: React.FC = () => {
  const { isPremium } = usePremium();
  const { isConnected, loading, athleteData, connectStrava, disconnectStrava } = useStrava();

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/strava-logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Strava</Text>
      </View>

      {loading ? (
        <Text style={styles.loading}>Cargando...</Text>
      ) : isConnected ? (
        <View style={styles.connected}>
          <Text style={styles.connectedText}>
            ✅ Conectado como {athleteData?.firstname} {athleteData?.lastname}
          </Text>
          <TouchableOpacity style={styles.disconnectBtn} onPress={disconnectStrava}>
            <Text style={styles.disconnectText}>Desconectar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.connectBtn} onPress={connectStrava}>
          <Text style={styles.connectText}>Conectar con Strava</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <PremiumLock title="Integración Strava" isPremium={isPremium}>
      {content}
    </PremiumLock>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FC4C02',
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loading: {
    color: '#fff',
  },
  connected: {
    alignItems: 'center',
  },
  connectedText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  disconnectBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 5,
  },
  disconnectText: {
    color: '#fff',
  },
  connectBtn: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  connectText: {
    color: '#FC4C02',
    fontWeight: 'bold',
  },
});
```

---

## 🟢 TAREA 3: NOTIFICACIONES PREMIUM

### 3.1 Pantalla de configuración
```typescript
// src/screens/NotificationSettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { usePremium } from '../context/PremiumContext';
import { PremiumLock } from '../components/PremiumLock';

export const NotificationSettingsScreen: React.FC = () => {
  const { isPremium } = usePremium();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [zona, setZona] = useState('todas');
  const [nivel, setNivel] = useState('todos');
  const [horarioInicio, setHorarioInicio] = useState('07:00');
  const [horarioFin, setHorarioFin] = useState('22:00');

  return (
    <View style={styles.container}>
      {/* Notificaciones básicas - para todos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <View style={styles.row}>
          <Text>Recibir notificaciones</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
      </View>

      {/* Notificaciones avanzadas - PREMIUM */}
      <PremiumLock title="Filtros Avanzados" isPremium={isPremium}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Filtros Premium</Text>

          <Text style={styles.label}>Zona</Text>
          <Picker selectedValue={zona} onValueChange={setZona}>
            <Picker.Item label="Todas las zonas" value="todas" />
            <Picker.Item label="Solo mi zona" value="mi_zona" />
            <Picker.Item label="Radio 5km" value="5km" />
            <Picker.Item label="Radio 10km" value="10km" />
          </Picker>

          <Text style={styles.label}>Nivel</Text>
          <Picker selectedValue={nivel} onValueChange={setNivel}>
            <Picker.Item label="Todos los niveles" value="todos" />
            <Picker.Item label="Solo mi nivel" value="mi_nivel" />
          </Picker>

          <Text style={styles.label}>Horario de notificaciones</Text>
          <View style={styles.row}>
            <Text>De {horarioInicio} a {horarioFin}</Text>
          </View>
        </View>
      </PremiumLock>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
});
```

---

## 📱 CONFIGURACIÓN EXPO

### app.json - Deep Links para Strava
```json
{
  "expo": {
    "scheme": "correrjuntos",
    "ios": {
      "bundleIdentifier": "com.correrjuntos.app",
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": ["correrjuntos"]
          }
        ]
      }
    }
  }
}
```

### Dependencias necesarias
```bash
npx expo install expo-web-browser expo-linking @react-native-picker/picker
```

---

## 🔗 ENDPOINTS Y CREDENCIALES

### URLs Producción
| Servicio | URL |
|----------|-----|
| Web | https://www.correrjuntos.com |
| Stripe Checkout | https://buy.stripe.com/8wM17O5my5S31gs8ww |
| API Strava Auth | https://www.correrjuntos.com/api/strava-auth |
| API Strava Refresh | https://www.correrjuntos.com/api/strava-refresh |
| Supabase | https://waihiwdbtcbdazmaxdor.supabase.co |

### Credenciales Strava
- **Client ID:** `199454`
- **Client Secret:** `f176cbe4a5c51e9ba48b423406758f31e8451ca2`
- **Estado:** ⏳ Pendiente verificación (7-10 días)

### Credenciales Stripe
- **Webhook Secret:** `whsec_DoARY4RGFMVbpE3QpgdHWPuzgLZcL107`
- **Modo:** TEST (cambiar a producción cuando esté listo)

---

## ✅ CHECKLIST IMPLEMENTACIÓN

### Fase 1 - Premium (Prioridad ALTA)
- [ ] Crear `PremiumContext.tsx`
- [ ] Crear `PremiumButton.tsx`
- [ ] Crear `PremiumLock.tsx`
- [ ] Añadir botón Premium en ProfileScreen
- [ ] Probar flujo de pago

### Fase 2 - Strava (Prioridad MEDIA)
- [ ] Crear `strava.ts` config
- [ ] Crear `useStrava.ts` hook
- [ ] Crear `StravaSection.tsx`
- [ ] Configurar deep links en app.json
- [ ] Añadir logo Strava en assets
- [ ] Probar conexión OAuth

### Fase 3 - Notificaciones Premium (Prioridad BAJA)
- [ ] Crear `NotificationSettingsScreen.tsx`
- [ ] Añadir filtros premium
- [ ] Guardar preferencias en Supabase

### Fase 4 - Build y Deploy
- [ ] Testear todo localmente
- [ ] Build 18: `eas build --platform ios`
- [ ] Subir a TestFlight
- [ ] Testing QA

---

## 📊 ESTRUCTURA DE ARCHIVOS A CREAR

```
correr-juntos-app/
├── src/
│   ├── config/
│   │   └── strava.ts          ← NUEVO
│   ├── context/
│   │   ├── AuthContext.tsx    (existente)
│   │   └── PremiumContext.tsx ← NUEVO
│   ├── hooks/
│   │   └── useStrava.ts       ← NUEVO
│   ├── components/
│   │   ├── PremiumButton.tsx  ← NUEVO
│   │   ├── PremiumLock.tsx    ← NUEVO
│   │   └── StravaSection.tsx  ← NUEVO
│   └── screens/
│       ├── ProfileScreen.tsx  (modificar)
│       └── NotificationSettingsScreen.tsx ← NUEVO
└── assets/
    └── strava-logo.png        ← NUEVO
```

---

## 🚀 COMANDOS ÚTILES

```bash
# Directorio del proyecto
cd "C:\Users\guett\OneDrive\Escritorio\correrjuntosV2\correr-juntos-app"

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npx expo start

# Build iOS
eas build --platform ios --profile production

# Subir a TestFlight
eas submit --platform ios --latest
```

---

## 📝 NOTAS IMPORTANTES

1. **Strava está pendiente de verificación** - No funcionará con más de 1 usuario hasta que aprueben la app (7-10 días)

2. **Stripe está en modo TEST** - Los pagos son de prueba. Cambiar a producción cuando todo esté verificado.

3. **El webhook de Stripe ya funciona** - Cuando alguien paga, se activa `es_premium = true` automáticamente en Supabase.

4. **Deep links** - Asegúrate de que `correrjuntos://` esté configurado en app.json para el callback de Strava.

---

**Última actualización:** 31 Enero 2025
**Build actual:** 17
**Próximo build:** 18 (con Premium + Strava)
**Web:** ✅ LIVE y operativa
