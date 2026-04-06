# Plan de Desarrollo CorrerJuntos — De 6.5 a 10/10

## Estado actual: 6.5/10 | Target: 10/10 | Timeline: 6 meses

---

## FASE 1 — CIMIENTOS (Semanas 1-4)
> **Objetivo: Arreglar todo lo que pierde usuarios o dinero HOY**
> **De 6.5 a 7.5**

### 1.1 Monetizacion — De 5 a 7 (Semana 1)

**Trial 7 dias (Dia 1-2)**
- Activar free trial en RevenueCat dashboard para plan mensual y anual
- Modificar PaywallScreen: CTA cambia de "Activar Premium — 4,99/mes" a "Prueba 7 dias gratis"
- Texto legal: "Despues del trial: 4,99/mes. Cancela cuando quieras."
- Impacto estimado: conversion de 0.5% a 2-3%

**Plan anual activo (Dia 2)**
- Completar metadatos en App Store Connect para yearly (29,99/ano)
- El codigo ya esta listo en PaywallScreen

**Compra individual de planes activa (Dia 3)**
- Los 5 productos ya estan creados en App Store Connect + Google Play + RevenueCat
- Solo falta seleccionarlos en la version 1.3.1 al enviar a revision
- El PaywallScreen rediseñado ya los muestra correctamente

**Build 77 + Submit (Dia 4-5)**
- Splash screen profesional (ya hecho)
- PaywallScreen rediseñado (ya hecho)
- Todos los fixes de esta sesion (25 archivos, +2500 lineas)
- Submit iOS + Android

### 1.2 Observabilidad — De 0 a 8 (Semana 2)

**Sentry (Dia 1-2)**
```bash
npx expo install @sentry/react-native
```
- Envolver App.tsx con Sentry.wrap()
- Capturar: crashes, errores JS, errores de red, errores de compra IAP
- Dashboard: errores por pantalla, por version, por dispositivo
- Coste: gratis hasta 5K eventos/mes

**Analytics backend real (Dia 3-4)**
- El sistema trackEvent() ya existe con buffer en AsyncStorage
- Conectarlo a Supabase: tabla `analytics_events` (user_id, event, params, timestamp)
- Edge function que ingesta el buffer cada 5 minutos
- Dashboard: funnel onboarding → primer run → paywall → compra

**Metricas clave a medir desde dia 1:**
| Metrica | Formula | Target |
|---------|---------|--------|
| D1 Retention | users_active_day_1 / installs | > 40% |
| D7 Retention | users_active_day_7 / installs | > 20% |
| Trial → Paid | paid_after_trial / trial_starts | > 15% |
| Paywall → Purchase | purchases / paywall_opened | > 5% |
| First Run Rate | users_with_1_run / total_users | > 30% |

### 1.3 Tests criticos (Semana 3-4)

**Maestro E2E para flujos de dinero (4 tests):**
```yaml
# test-purchase-flow.yaml
- launchApp
- tapOn: "Planes"
- tapOn: "Plan 5K"
- assertVisible: "3,99"
- tapOn: "Comprar Plan 5K"
# Verificar que no crashea

# test-onboarding.yaml
- launchApp
- assertVisible: "CORRERJUNTOS"
- tapOn: "Crear cuenta"
# ...flujo completo hasta Feed

# test-run-tracking.yaml
# test-paywall-display.yaml
```

**TypeScript CI (GitHub Action):**
```yaml
name: Type Check
on: [push, pull_request]
jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx tsc --noEmit
```

---

## FASE 2 — MOTOR DE CRECIMIENTO (Semanas 5-10)
> **Objetivo: Pasar de 390 a 2.000 usuarios**
> **De 7.5 a 8.5**

### 2.1 Funnel de retencion — Push sequences (Semana 5)

**Secuencia automatica OneSignal (7 mensajes):**

| Dia | Push | Objetivo |
|-----|------|----------|
| 0 | "Bienvenido a CorrerJuntos. Tu primer entreno te espera." | Activar |
| 1 | "3 runners cerca de ti quieren correr manana. Mira quienes son." | Social |
| 3 | "Aun no has registrado tu primera carrera. Empieza hoy?" | Primer run |
| 5 | "Tu plan 5K gratis esta listo. 8 semanas para tu primera carrera." | Plan gratuito |
| 7 | "Ya llevas una semana. Aqui tu resumen semanal." | Retencion |
| 14 | "50 runners se unieron esta semana. Tu ya eres parte." | Social proof |
| 21 | "Prueba Premium 7 dias gratis. Desbloquea tu entrenador." | Conversion |

**Implementacion:**
- OneSignal ya esta instalado (onesignal-expo-plugin)
- Crear segmentos por first_session_date
- Configurar Journeys en OneSignal dashboard
- Deep links a pantallas especificas (correrjuntos://plan-wizard, correrjuntos://social)

### 2.2 Referral program (Semana 6)

**Mecanica:**
- "Invita a un amigo → ambos 1 mes Premium gratis"
- Generar codigo unico por usuario (ej: CORRER-JUAN-7K)
- ShareScreen con boton nativo + link: correrjuntos.com/invite/CORRER-JUAN-7K
- Tracking en Supabase: tabla `referrals` (inviter_id, invited_id, status, rewarded_at)
- Al registrarse con codigo → flag `referred_by` en profile
- Webhook RevenueCat → conceder 30 dias premium a ambos

**UI:**
- Nuevo tab en ProfileScreen: "Invita amigos" con codigo copiable
- Share sheet nativo con mensaje: "Estoy entrenando con CorrerJuntos. Usa mi codigo CORRER-JUAN-7K y ambos tenemos 1 mes Premium."
- Contador: "Has invitado a 3 amigos. 2 se han unido."

### 2.3 Deep links blog → app (Semana 7)

**Problema actual:** 264 articulos generan trafico web pero no convierten a app.

**Solucion:**
- CTA contextual en cada articulo: "Empieza tu plan 5K gratis" → deep link `correrjuntos://plan-wizard?goal=5k`
- Smart banner iOS/Android en el header del blog (ya existe el meta tag, falta el deep link)
- Paginas de destino por objetivo:
  - correrjuntos.com/empezar-5k → app store con deeplink a PlanWizard(5k)
  - correrjuntos.com/empezar-10k → app store con deeplink a PlanWizard(10k)
- Tracking: utm_source=blog, utm_campaign=articulo-slug

**Impacto estimado:** Con 10K visitas/mes al blog, 1% conversion = 100 descargas/mes organicas.

### 2.4 Apple Search Ads (Semana 8)

**Presupuesto:** 300 EUR/mes (minimo viable)

**Keywords target:**
| Keyword | CPA estimado | Volumen |
|---------|-------------|---------|
| correr | 0.80 EUR | Alto |
| plan entrenamiento 5k | 0.50 EUR | Medio |
| app correr gratis | 0.60 EUR | Alto |
| running grupo | 0.40 EUR | Bajo |
| entrenar maraton | 0.70 EUR | Medio |

**300 EUR / 0.60 CPA medio = ~500 instalaciones/mes**

**Setup:**
- Cuenta Apple Search Ads (ads.apple.com)
- Campaña Discovery (automatica) + Campaña Exact Match (keywords manuales)
- Tracking: SKAdNetwork attribution → RevenueCat → ROI por keyword

### 2.5 Google UAC (Semana 9)

**Presupuesto:** 200 EUR/mes

**Campana:** Universal App Campaign optimizada a instalaciones
- Assets: 5 headlines, 5 descriptions, 3 imagenes, 1 video (15s)
- Target: ES, MX, AR, CO, CL — idioma espanol — interes: fitness, running
- CPI target: 0.50 EUR

**200 EUR / 0.50 CPI = ~400 instalaciones/mes**

### 2.6 Contenido video (Semana 10)

**YouTube Shorts + TikTok + Reels (3 videos/semana):**

Formato 1: "Entrenamiento de la semana" (30s)
- Pantalla grabada de la app mostrando el plan
- Voz en off: "Esta semana: 3 sesiones. Martes rodaje suave, jueves intervalos, domingo tirada larga."
- CTA: "Plan completo gratis en CorrerJuntos"

Formato 2: "Dato runner" (15s)
- Dato curioso de running + pantalla de la app
- "Sabias que correr 5km quema las mismas calorias que 1h de yoga?"

Formato 3: "Antes/despues" (30s)
- Testimonial real de usuario
- Screenshot del progreso en la app

**Herramientas:** Canva Pro (ya usado) + CapCut gratis

---

## FASE 3 — PRODUCTO PREMIUM (Semanas 11-16)
> **Objetivo: Producto que justifica 4,99/mes sin dudas**
> **De 8.5 a 9.0**

### 3.1 Onboarding profesional (Semana 11-12)

**De 4 pantallas a 7:**

| Screen | Contenido | Permiso |
|--------|-----------|---------|
| 1. Hook | "Correr es mejor acompañado" + animacion runners | - |
| 2. Objetivo | "Cual es tu objetivo?" (5K/10K/21K/Trail/42K/Social) | - |
| 3. Nivel | "Cuanto corres ahora?" (Nada/1-2x/3-4x/5+) | - |
| 4. Ubicacion | "Encuentra runners cerca de ti" | Location |
| 5. Notificaciones | "No te pierdas ningun entreno" | Push |
| 6. Plan sugerido | "Tu plan personalizado: 5K en 8 semanas" | - |
| 7. Trial | "Prueba Premium 7 dias gratis" (con skip) | - |

**Por que 7 screens:** Cada paso aumenta el compromiso psicologico. Un usuario que ha invertido 60 segundos configurando su plan tiene 3x mas probabilidad de volver al dia siguiente.

### 3.2 Empty states con CTA (Semana 13)

**Pantallas que necesitan empty state:**

| Pantalla | Estado vacio actual | Nuevo empty state |
|----------|--------------------|--------------------|
| FeedScreen | Lista vacia | "Tu feed esta vacio. Registra tu primera carrera." + CTA "Empezar a correr" |
| RunHistoryScreen | Sin runs | "Aun no tienes carreras. Tu primer 1km te esta esperando." + CTA |
| SocialScreen | Sin matches | "0 matches... por ahora. Completa tu perfil para encontrar runners." + CTA |
| PlanScreen | Sin plan activo | "No tienes plan activo. Te recomendamos el Plan 5K." + CTA |
| StatsScreen | Sin datos | "Tus estadisticas apareceran aqui despues de tu primera carrera." + ilustracion |

### 3.3 Tipografia custom (Semana 13)

**Font: Inter (Google Fonts, gratuita, .otf)**
- Usada por: Linear, Vercel, Notion, Figma
- Pesos: 400 (body), 600 (semibold), 700 (bold), 900 (black para numeros)

```typescript
// expo-font setup
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_900Black } from '@expo-google-fonts/inter';
```

### 3.4 Garmin + Apple Watch sync (Semana 14-15)

**Apple Watch (WorkoutKit — sin aprobacion):**
- SDK publico desde iOS 17+ / watchOS 10+
- Push workout templates al Apple Watch
- El usuario ejecuta el workout en el reloj
- Sync automatica via HealthKit al volver

**Garmin Connect API (pendiente aprobacion):**
- Si aprobado: push plan completo al reloj Garmin
- Si no aprobado: exportar .FIT files que el usuario importa manualmente

**COROS API (pendiente):**
- Webhook `/api/coros/webhook` ya creado
- Push workouts via API cuando aprueben

### 3.5 Gamificacion (Semana 16)

**Sistema de badges/logros:**

| Badge | Condicion | Icono |
|-------|-----------|-------|
| Primer Paso | Completar primera carrera | Zapatilla |
| Kilometro 50 | Acumular 50km | Medalla bronce |
| Kilometro 100 | Acumular 100km | Medalla plata |
| Kilometro 500 | Acumular 500km | Medalla oro |
| Social Runner | Participar en 5 quedadas | Grupo |
| Plan Completo | Terminar un plan de entrenamiento | Trofeo |
| PR Hunter | Conseguir 3 records personales | Rayo |
| Constancia | Correr 4 semanas seguidas | Calendario |

**Tabla Supabase:** `user_badges (user_id, badge_slug, earned_at)`
**UI:** Grid de badges en ProfileScreen (ganados en color, no ganados en gris)
**Push:** "Has desbloqueado: Kilometro 100! Comparte tu logro."

---

## FASE 4 — ESCALA (Semanas 17-24)
> **Objetivo: De 2.000 a 10.000 usuarios. Modelo de negocio probado.**
> **De 9.0 a 9.5**

### 4.1 Web → Next.js (Semana 17-19)

**Migracion del monolito (index.html 6K lineas) a Next.js:**

```
correrjuntos-web/
├── app/
│   ├── page.tsx              (landing)
│   ├── blog/[slug]/page.tsx  (articulos)
│   ├── cities/[city]/page.tsx
│   ├── places/[place]/page.tsx
│   ├── planes/[plan]/page.tsx
│   └── layout.tsx
├── components/
├── lib/supabase.ts
└── next.config.js
```

**Beneficios:**
- SSG para blog (build-time, 0ms TTFB)
- ISR para contenido dinamico (revalidate: 3600)
- Image optimization automatica
- Lighthouse 95+ garantizado
- Tailwind sigue funcionando igual

**Riesgo:** Perder SEO durante migracion. Mitigar con redirects 301 exactos en Vercel.

### 4.2 A/B testing (Semana 20)

**Implementar feature flags con Supabase:**

```sql
CREATE TABLE feature_flags (
  flag_key TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  percentage INTEGER DEFAULT 0, -- 0-100 rollout
  payload JSONB DEFAULT '{}'
);
```

**Tests prioritarios:**
| Test | Variante A | Variante B | Metrica |
|------|-----------|-----------|---------|
| Paywall CTA | "Prueba 7 dias gratis" | "Empieza gratis" | trial_starts |
| Onboarding length | 4 screens | 7 screens | d7_retention |
| Plan price 5K | 3,99 | 2,99 | purchases |
| Push timing | 9:00 AM | 7:00 PM | open_rate |

### 4.3 Comunidad real en 8 ciudades (Semana 21-22)

**Programa Embajadores:**

| Ciudad | Embajador | Rol |
|--------|-----------|-----|
| Madrid | Runner local | 2 quedadas/semana + stories |
| Barcelona | Runner local | 2 quedadas/semana + stories |
| Valencia | Runner local | 1 quedada/semana |
| CDMX | Runner local | 2 quedadas/semana |
| Buenos Aires | Runner local | 1 quedada/semana |

**Compensacion:** Premium gratis + merchandise CorrerJuntos + 20% revenue share de referidos
**KPI:** Cada embajador debe traer 50 usuarios activos en 30 dias
**Coste:** ~0 EUR (premium gratis no tiene coste marginal)

### 4.4 Integracion Strava (Semana 23)

**Strava API v3:**
- OAuth2 flow: usuario conecta su cuenta Strava
- Import: actividades de Strava → feed de CorrerJuntos
- Export: carreras de CorrerJuntos → Strava
- Social: "Tambien en CorrerJuntos" badge en actividades de Strava

**Impacto:** Strava tiene 120M usuarios. Si el 0.001% descubre CorrerJuntos via la integracion = 1.200 usuarios potenciales.

### 4.5 Staging environment (Semana 24)

**Supabase staging project:**
- Nuevo proyecto Supabase (gratis) para staging
- Variables de entorno separadas: `.env.staging` vs `.env.production`
- EAS Build profile `staging` que apunta al proyecto staging
- Branch `develop` → staging, `master` → production
- Migraciones SQL probadas en staging antes de production

---

## FASE 5 — EXCELENCIA (Semanas 25-30)
> **Objetivo: App de referencia en running en espanol**
> **De 9.5 a 10**

### 5.1 IA / Coach personal (Semana 25-27)

**Ajuste automatico de planes:**
- Si el usuario completa sesiones mas rapido que el ritmo base → subir intensidad
- Si el usuario falla 2 sesiones seguidas → bajar carga + push motivacional
- Si el usuario mejora VO2max → sugerir objetivo mas ambicioso

**Implementacion:**
```sql
-- Edge function que evalua cada lunes
SELECT user_id,
  avg(resultado_ritmo) as avg_pace,
  count(*) filter (where estado = 'completed') as completed,
  count(*) filter (where estado = 'skipped') as skipped
FROM user_workouts
WHERE created_at > now() - interval '7 days'
GROUP BY user_id;
```

- Si completed/total > 0.8 AND avg_pace < ritmo_base * 0.95 → UPDATE plan SET intensidad = intensidad + 1
- Si skipped/total > 0.4 → UPDATE plan SET intensidad = intensidad - 1 + push "No pasa nada, ajustamos tu plan"

### 5.2 Social features avanzados (Semana 28)

**Feed enriquecido:**
- Fotos de carrera (camera durante run)
- Segmentos compartidos ("Mira mi km 5 a 4:30/km")
- Challenges entre amigos ("Quien hace mas km esta semana?")
- Leaderboard semanal por ciudad

**Grupos de entrenamiento:**
- Crear grupo (ej: "Runners Retiro Madrid")
- Plan compartido: todos hacen el mismo plan
- Chat de grupo
- Clasificacion interna

### 5.3 Monetizacion avanzada (Semana 29)

**Tier structure:**

| Tier | Precio | Incluye |
|------|--------|---------|
| Free | 0 | GPS tracking, 1 plan gratuito, 3 matches/dia, stats basicas |
| Plan individual | 3,99-9,99 | 1 plan completo + calendario + coach |
| Premium | 4,99/mes | Todo: 5 planes + social ilimitado + BLE + stats avanzadas |
| Premium Anual | 29,99/ano | Todo Premium + 40% descuento |
| Team | 9,99/mes | Premium + 5 miembros + plan compartido + chat grupal |

**Marketplace de entrenadores (futuro):**
- Entrenadores crean planes custom en la plataforma
- Revenue share 70/30 (entrenador/plataforma)
- Usuarios contratan entrenador via la app

### 5.4 Internacionalizacion completa (Semana 30)

**Idiomas prioritarios:**
| Idioma | Mercado | Usuarios potenciales |
|--------|---------|---------------------|
| Espanol | ES, LATAM | 500M hablantes |
| Portugues | BR, PT | 260M hablantes |
| Frances | FR, BE, CA | 300M hablantes |
| Italiano | IT | 60M hablantes |

**Implementacion:**
- i18n ya soporta ES + EN
- Añadir PT, FR, IT con misma estructura
- Blog: generar articulos en PT y FR (herramienta de generacion ya existe)
- ASO: App Store metadata en 4+ idiomas

---

## RESUMEN FINANCIERO

### Inversion necesaria (6 meses)

| Concepto | Mes 1-2 | Mes 3-4 | Mes 5-6 | Total |
|----------|---------|---------|---------|-------|
| Apple Search Ads | 300 | 300 | 500 | 1.100 |
| Google UAC | 200 | 200 | 300 | 700 |
| Sentry (gratis) | 0 | 0 | 0 | 0 |
| Supabase staging (gratis) | 0 | 0 | 0 | 0 |
| Dominio/hosting (ya pagado) | 0 | 0 | 0 | 0 |
| Embajadores (premium gratis) | 0 | 0 | 0 | 0 |
| **Total** | **500** | **500** | **800** | **1.800** |

### Proyeccion de ingresos

| Mes | Usuarios | Premium (3%) | Individual (2%) | MRR |
|-----|----------|-------------|-----------------|-----|
| 1 | 500 | 15 | 10 | 125 |
| 2 | 900 | 27 | 18 | 225 |
| 3 | 1.500 | 45 | 30 | 375 |
| 4 | 2.500 | 75 | 50 | 625 |
| 5 | 4.000 | 120 | 80 | 1.000 |
| 6 | 6.000 | 180 | 120 | 1.500 |

**Breakeven estimado: Mes 4 (625 EUR MRR vs 500 EUR gasto)**
**Mes 6: 1.500 EUR MRR = 18.000 EUR ARR**

### Target nota por fase

| Fase | Timeline | Nota |
|------|----------|------|
| Actual | Hoy | 6.5 |
| Fase 1 | Semana 1-4 | 7.5 |
| Fase 2 | Semana 5-10 | 8.5 |
| Fase 3 | Semana 11-16 | 9.0 |
| Fase 4 | Semana 17-24 | 9.5 |
| Fase 5 | Semana 25-30 | 10.0 |

---

## LAS 3 ACCIONES DE MANANA

Si solo puedes hacer 3 cosas manana, haz estas:

1. **Activar trial 7 dias en RevenueCat dashboard** (15 minutos, impacto inmediato en conversion)
2. **Instalar Sentry** (30 minutos, empiezas a ver errores reales)
3. **Enviar build 77 a TestFlight** (ya esta listo, 25 archivos cambiados)

Todo lo demas puede esperar. Estas 3 no.
