# Pre-Build Audit · v1.3.3 (20 abril 2026)

> Checklist maestro para validar la app pantalla por pantalla ANTES del build nativo.
> Columna **Estado**: 🟢 OK · 🟡 requiere polish · 🔴 bug · ⚪ sin revisar · ✅ fixed esta sesión

## Cómo usar este doc

- **Usuario (visual)**: abre cada pantalla en su device → screenshot si hay algo que no te gusta → frase corta de qué falla.
- **Claude (código)**: lee cada pantalla en código → detecta bugs estructurales → aplica fixes → actualiza columna Estado.
- Al terminar todos: verificamos que no queda nada 🔴/🟡/⚪ → build nativo.

---

## Fase 1 — Auth (must work)

| # | Pantalla | Archivo | Estado | Issues detectados |
|---|----------|---------|--------|-------------------|
| 1 | Login (email/pass) | `Auth/LoginScreen.tsx` | ✅ | Icono naranja fuera, título display, línea ember acento, submitting state local |
| 2 | Registro (misma pantalla, mode=register) | `Auth/LoginScreen.tsx` | 🔴 | signUp cuelga en bundle viejo · OTA fix pendiente verificar en build |
| 3 | Forgot password modal | `Auth/LoginScreen.tsx` | ⚪ | Sin revisar |
| 4 | Apple Sign In | `AuthContext.tsx` | ⚪ | Flow nativo, no UI propia |
| 5 | Google Sign In | `AuthContext.tsx` | ⚪ | OAuth browser |

## Fase 2 — Onboarding (6 pasos tras signup)

| # | Pantalla | Archivo | Estado | Issues |
|---|----------|---------|--------|--------|
| 6 | 1/6 Hook (bienvenida) | `OnboardingHookScreen.tsx` | ✅ | Radar rediseñado, stat dinámico en titular, sin link login |
| 7 | 2/6 Perfil (wizard datos) | `OnboardingScreen.tsx` | 🟡 | C2 fixed (GPS no bloquea + sticky CTA). Pendiente revisar visual |
| 8 | 3/6 Notificaciones | `OnboardingNotificationsScreen.tsx` | 🟡 | OneSignal request. Revisar copy y progress bar |
| 9 | 4/6 Foto | `OnboardingPhotoScreen.tsx` | ⚪ | Sin revisar |
| 10 | 5/6 Objetivo | `OnboardingGoalScreen.tsx` | ✅ | C1 fixed (botón dead → persist AsyncStorage) |
| 11 | 6/6 Bienvenida final | `OnboardingWelcomeScreen.tsx` | ⚪ | Sin revisar |

## Fase 3 — Tabs principales

| # | Pantalla | Archivo | Estado | Issues |
|---|----------|---------|--------|--------|
| 12 | Tab Inicio / Home | `HomeScreen.tsx` | ⚪ | Sin revisar |
| 13 | Tab Mapa | `MapScreen.tsx` | ⚪ | Sin revisar |
| 14 | Tab Correr (RunTracker) | `RunTrackerScreen.tsx` | ⚪ | Sin revisar |
| 15 | Tab Social | `SocialScreen.tsx` | ⚪ | Sin revisar |
| 16 | Tab Perfil | `ProfileScreen.tsx` | ⚪ | Sin revisar |
| 17 | Feed (dentro de Social o Inicio) | `FeedScreen.tsx` | ⚪ | Empty state: "Tu feed está vacío" (poco profesional según usuario) |

## Fase 4 — Quedadas

| # | Pantalla | Archivo | Estado | Issues |
|---|----------|---------|--------|--------|
| 18 | Detalle quedada | `EventDetailsScreen.tsx` | ⚪ | Sin revisar |
| 19 | Crear quedada | `CreateQuedadaScreen.tsx` | ⚪ | Sin revisar |
| 20 | Crear evento (legacy?) | `CreateEventScreen.tsx` | ⚪ | Verificar si aún se usa |

## Fase 5 — Entrenamiento

| # | Pantalla | Archivo | Estado | Issues |
|---|----------|---------|--------|--------|
| 21 | Lista planes | `PlansScreen.tsx` | ⚪ | Sin revisar |
| 22 | Detalle plan activo | `PlanScreen.tsx` | 🟡 | Session previa: resume paused plan, progress fix |
| 23 | Wizard crear plan | `PlanWizardScreen.tsx` | 🟡 | Session previa: fixes aplicados |
| 24 | Detalle workout/sesión | `WorkoutDetailScreen.tsx` | ⚪ | Sin revisar |
| 25 | Plan completion | `PlanCompletionScreen.tsx` | ⚪ | Sin revisar |
| 26 | Tips running | `TipsScreen.tsx` | ⚪ | Sin revisar |

## Fase 6 — Actividad / Running

| # | Pantalla | Archivo | Estado | Issues |
|---|----------|---------|--------|--------|
| 27 | Tracker activo (Run Tracker) | `RunTrackerScreen.tsx` | ⚪ | Crítico. GPS, audio, stats en vivo |
| 28 | Completion de actividad | `ActivityCompletionScreen.tsx` | 🟡 | Session previa: store review integration |
| 29 | Summary actividad | `ActivitySummaryScreen.tsx` | ⚪ | Sin revisar |
| 30 | Detalle run histórico | `RunDetailScreen.tsx` | ⚪ | Sin revisar |
| 31 | Historial carreras | `RunHistoryScreen.tsx` | ⚪ | Empty state mejorado en sesión previa |
| 32 | Pairing sensores BLE | `SensorPairingScreen.tsx` | ⚪ | Sin revisar |
| 33 | Audio settings | `AudioSettingsScreen.tsx` | ⚪ | Sin revisar |

## Fase 7 — Social / Matching

| # | Pantalla | Archivo | Estado | Issues |
|---|----------|---------|--------|--------|
| 34 | Matching (explorar) | `MatchingScreen.tsx` | ⚪ | Sin revisar |
| 35 | Matching modal perfil | `MatchingProfileModal.tsx` | ⚪ | Sin revisar |
| 36 | Perfil otro runner | `UserProfileScreen.tsx` | ⚪ | Sin revisar |
| 37 | Perfil runner (detail) | `RunnerProfileScreen.tsx` | ⚪ | Sin revisar |
| 38 | Chat (match messages) | `ChatScreen.tsx` | ⚪ | Sin revisar |
| 39 | Coach IA José chat | `CoachChatScreen.tsx` | ⚪ | Nuevo, revisar |
| 40 | Notificaciones (inbox) | `NotificationsScreen.tsx` | ⚪ | Sin revisar |

## Fase 8 — Perfil / Settings / Premium

| # | Pantalla | Archivo | Estado | Issues |
|---|----------|---------|--------|--------|
| 41 | Stats del usuario | `StatsScreen.tsx` | 🟡 | Empty state mejorado en sesión previa |
| 42 | Logros | `AchievementsScreen.tsx` | ⚪ | 33 achievements nuevos, revisar |
| 43 | Progress | `ProgressScreen.tsx` | ⚪ | Sin revisar |
| 44 | Paywall | `PaywallScreen.tsx` | 🟡 | 6 CRO improvements aplicados, revisar copy |
| 45 | Premium success | `PremiumSuccessScreen.tsx` | ⚪ | Sin revisar |
| 46 | Ajustes | `SettingsScreen.tsx` | ✅ | Emojis → SVG monocromo; iconos normalizados; section headers +presencia; row height 60px |
| 47 | Verificación identidad | `VerificationScreen.tsx` | ⚪ | Sin revisar |
| 48 | Apps conectadas (Strava) | `ConnectedAppsScreen.tsx` | ⚪ | Sin revisar |
| 49 | Usuarios bloqueados | `BlockedUsersScreen.tsx` | ⚪ | Sin revisar |
| 50 | Article reader (blog) | `ArticleReaderScreen.tsx` | ⚪ | Sin revisar |

## Fase 9 — Otras

| # | Pantalla | Archivo | Estado | Issues |
|---|----------|---------|--------|--------|
| 51 | Landing (pre-auth) | `LandingScreen.tsx` | ⚪ | Sin revisar |

---

## Fixes aplicados en esta sesión

| ID | Descripción | Archivo | OTA |
|----|-------------|---------|-----|
| F1 | signIn no cuelga (no setLoading true) + watchdog 6s | `AuthContext.tsx` | `d9a58035` (runtime 1.3.2) + `762bd2f2` (1.3.1) |
| F2 | loadProfile try/finally garantiza setLoading(false) | `AuthContext.tsx` | `d9a58035` + `762bd2f2` |
| F3 | LoginScreen sin icono, título display, línea ember, submitting local | `Auth/LoginScreen.tsx` | `d9a58035` + `762bd2f2` |
| F4 | OnboardingHook rediseño: radar + stat dinámico + sin link login | `OnboardingHookScreen.tsx` | `1cfc7d00` + `762bd2f2` |
| F5 | Onboarding gate: persiste mientras profile incompleto (no 30min) | `AuthContext.tsx` | `be628e16` + `762bd2f2` |
| F6 | SettingsScreen: 4 emojis → SVG monocromo, section headers más presencia, row 60px | `SettingsScreen.tsx` | pendiente build nativo |
| F7 | Onboarding pasos 2/4/5/6: emojis ✅📍📊🏃 → SVG inline; step 5 progress bar + titleAccent consistente | `OnboardingScreen/Photo/Goal/Welcome` | pendiente build |
| F8 | **Fix crítico**: refreshProfile ahora invalida cache antes de loadProfile — sino el save del onboarding no se detectaba y re-entraba al wizard | `AuthContext.tsx` | `4318a30a` (1.3.2) + `615de09d` (1.3.1) |

## Issues técnicos detectados pero no arreglados aún

| ID | Descripción | Severidad |
|----|-------------|-----------|
| T1 | OTAs runtime 1.3.2 no llegan a device (probable build en 1.3.1) → republicados a 1.3.1 pero sin verificar | ALTA |
| T2 | Trigger `handle_new_user` solo inserta id+email, no nombre → perfiles nacen con nombre="" | MEDIA |
| T3 | signUp upsert usa `ignoreDuplicates: true` → si trigger creó row primero, upsert se ignora y nombre queda "" | MEDIA |
| T4 | SettingsScreen usa emojis 📊 ⚡ 🚫 ⏳ mezclados con SVG → inconsistente | MEDIA |
| T5 | AsyncStorage cache de profile persiste entre logouts → puede devolver datos viejos en loadProfile | BAJA |
| T6 | Todos los `navigation.navigate('X' as any)` → sin tipos, riesgo de route no existente | BAJA |

---

## Acciones pendientes antes del build

- [ ] Revisar cada pantalla ⚪ visualmente (usuario + screenshots)
- [ ] Arreglar Settings (T4) → SVG icons monocromo consistentes
- [ ] Auditoría de empty states (Feed, Stats, RunHistory, Notifications)
- [ ] Verificar que SKAdNetwork IDs están (ya añadidos en app.json)
- [ ] Verificar que runtimeVersion del build próximo coincidirá con OTAs futuros
- [ ] Typescript check completo (hay stack overflow → posiblemente usar babel transform check)
- [ ] Lint check
- [ ] Final build nativo + submit stores
