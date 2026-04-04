# OnboardingGoalScreen - Guia de integracion

## Problema
Activacion 1.1%. Los usuarios se registran y no saben que hacer.

## Solucion
Pantalla post-onboarding "Que buscas?" con 3 opciones que llevan
al usuario directamente a la feature que necesita.

## Archivo creado
`correr-juntos-app/src/screens/OnboardingGoalScreen.tsx`

## Wireframe

```
┌──────────────────────────────┐
│                              │
│             🏃               │
│                              │
│       ¿Qué buscas?          │
│   Personaliza tu experiencia │
│                              │
│  ┌────────────────────────┐  │
│  │ 👥  Correr acompañado  >│  │
│  │     Quedadas y runners  │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 🏃  Empezar a correr   >│  │
│  │     Plan 0→5K gratis    │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 📈  Mejorar mi marca   >│  │
│  │     Planes 5K a maraton │  │
│  └────────────────────────┘  │
│                              │
│     Explorar por mi cuenta   │
│                              │
└──────────────────────────────┘
```

## Flujo de navegacion

```
Registro → OnboardingScreen (nombre, ubicacion, nivel)
         → OnboardingGoalScreen (que buscas?)
           ├─ "Correr acompañado"  → MainTabs > Map
           ├─ "Empezar a correr"   → MainTabs > Feed > PlanOverview (0→5K)
           ├─ "Mejorar mi marca"   → MainTabs > Feed > PlanWizard
           └─ "Explorar por mi cuenta" → MainTabs > Feed
```

## Pasos para integrar en App.tsx

### Paso 1: Importar la pantalla
Añadir al bloque de imports en App.tsx (linea ~70):
```typescript
import OnboardingGoalScreen from './src/screens/OnboardingGoalScreen';
```

### Paso 2: Añadir al RootStackParamList
Añadir a la lista de tipos (linea ~105):
```typescript
OnboardingGoal: undefined;
```

### Paso 3: Añadir estado en AuthContext
En `src/context/AuthContext.tsx`, añadir un flag `needsGoalSelection`:
```typescript
const [needsGoalSelection, setNeedsGoalSelection] = useState(false);
```

### Paso 4: Modificar flujo en OnboardingScreen
En OnboardingScreen, al hacer `onComplete()`, en vez de ir a MainTabs,
navegar a OnboardingGoalScreen:
```typescript
// ANTES (en OnboardingScreen handleSave):
onComplete();

// DESPUES:
navigation.navigate('OnboardingGoal');
```

### Paso 5: Registrar screen en Stack Navigator
En App.tsx, despues del screen de Onboarding (linea ~462):
```typescript
<Stack.Screen
  name="OnboardingGoal"
  component={OnboardingGoalScreen}
  options={{ headerShown: false, gestureEnabled: false }}
/>
```

### Alternativa simple (sin tocar AuthContext)
Si no queremos tocar AuthContext, podemos hacer que OnboardingScreen
NO llame a completeOnboarding() hasta que el usuario elija goal.
Flujo:
1. OnboardingScreen guarda perfil en Supabase
2. OnboardingScreen navega a OnboardingGoalScreen (sin completar onboarding)
3. OnboardingGoalScreen llama a completeOnboarding() + navega a destino

Esta alternativa es mas simple y no require cambios en AuthContext.

## Design tokens usados
- Background: theme.bg (blanco en light mode)
- Cards: theme.cardBg + theme.cardBorder + shadow
- Texto: theme.text, theme.textSecondary, theme.textMuted
- Icono fondo: theme.primary con 15% opacidad
- Spacing: SPACING.lg (20px) horizontal
- Border radius: RADIUS.lg (16px) cards, RADIUS.md (12px) icon wrap
- Animaciones: fade in header + stagger 120ms cards slide up
- Touch targets: minimo 56px height en cards (supera 44px minimo)

## i18n keys a añadir (es.ts + en.ts)

### es.ts
```typescript
onboardingGoal: {
  title: '¿Qué buscas?',
  subtitle: 'Personaliza tu experiencia en CorrerJuntos',
  group: {
    title: 'Correr acompañado',
    desc: 'Encuentra quedadas y runners cerca de ti',
  },
  start: {
    title: 'Empezar a correr',
    desc: 'Plan 0→5K gratuito para principiantes',
  },
  improve: {
    title: 'Mejorar mi marca',
    desc: 'Planes de 5K a maratón con entrenamientos guiados',
  },
  skip: 'Explorar por mi cuenta',
},
```

### en.ts
```typescript
onboardingGoal: {
  title: 'What are you looking for?',
  subtitle: 'Personalize your CorrerJuntos experience',
  group: {
    title: 'Run with others',
    desc: 'Find group runs and runners near you',
  },
  start: {
    title: 'Start running',
    desc: 'Free 0→5K plan for beginners',
  },
  improve: {
    title: 'Improve my time',
    desc: '5K to marathon plans with guided workouts',
  },
  skip: 'Explore on my own',
},
```

## Metrica esperada
- Activacion (1+ run en 7 dias): 1.1% → 10%+
- Los usuarios que eligen "Empezar a correr" van directo al plan gratis
- Los usuarios que eligen "Correr acompañado" ven quedadas inmediatamente
- Los usuarios que eligen "Mejorar" entran al wizard de planes
