# Implementation — Next Session

> **Last update: 21 abril 2026 (sesión 5).**
> Backend 100% deployed. **6 de 6 componentes UI DONE.** FeedScreen + ProfileScreen + Settings integrados.
> **Signup flow bug arreglado** (gate saltaba pasos 3-6 → fix con `onboarding_completed` flag).
> **Build v1.3.4 build 82 submitted a TestFlight** (en cola de compilación al cerrar sesión).
> Pendiente: 5 pantallas de polish (LoginScreen signup v2, PaywallScreen, RunDetail v2, Onboarding 2+3 v2).

---

## ✅ LO QUE YA ESTÁ HECHO

### Backend Supabase (deployed, tested)

**Migración 1 — `notifications_system_v1_3_3`**
- Tabla `notifications` + RLS
- 3 RPCs: `get_notificaciones`, `get_unread_count`, `mark_notifications_read`
- 4 triggers: quedada_join, match_request_received, match_request_accepted, welcome_on_signup
- 594 users backfilled con welcome notification

**Migración 2 — `privacy_and_shoes_v1_3_3`**
- Tabla `privacy_settings` + RLS + auto-create trigger on signup
- Tabla `user_shoes` + RLS
- Column `runs.shoe_id` + auto-assign trigger
- RPC `get_active_shoe(p_user_id)`
- 595 users con privacy defaults sembrados

**Migración 3 — `compatibility_and_feed_rpc_v1_3_3`**
- Function `compatibility_score(user_a, user_b)` → 0-100 (level 30 + pace 30 + location 30 + active boost 10)
- RPC `get_feed_with_compatible(p_limit, p_offset)` → feed Strava-style con 3 tipos de relation: follow / known / compatible
- Índices de performance en runs, seguidores, participantes

### Código app (sin OTA, aplicado)

- `AuthContext.tsx` — signUp usa UPDATE (no upsert ignoreDuplicates) → nombre se guarda
- `AuthContext.tsx` — Google/Apple setLoading watchdog 6s
- `AuthContext.tsx` — loadProfile try/finally garantiza setLoading(false)
- `AuthContext.tsx` — refreshProfile invalida cache antes de loadProfile
- `LoginScreen.tsx` — icono naranja fuera, título display 34px, línea ember
- `OnboardingScreen.tsx` — emojis ✅📍 → SVG inline
- `OnboardingHookScreen.tsx` — rediseñado: radar + stat dinámico
- `OnboardingNotificationsScreen.tsx` — OneSignal flow
- `OnboardingGoalScreen.tsx` — progress bar + título display, emoji 🏃 fuera
- `OnboardingPhotoScreen.tsx` — emoji 📊 → SVG trending
- `OnboardingWelcomeScreen.tsx` — emoji 📍 → SVG pin
- `SettingsScreen.tsx` — emojis 📊⚡🚫⏳ → SVG monocromo, row 60px, section headers polish
- `FeedScreen.tsx` — emojis ⚡🔥 → SVG bolt/flame
- `MapScreen.tsx` — emojis 📍🕐📅📏📌🏃 → SVG micro-icons

### OTAs pushed (runtime 1.3.1 + 1.3.2)

Todos los cambios arriba están pushed en OTAs (branch production). Solo falta aplicarse en device siguiente cold start.

---

## 🔴 LO QUE FALTA POR HACER MAÑANA

### Orden sugerido (por dependencia + impacto)

### 1 · Nuevos componentes reutilizables

Crear en `src/components/home/`:

#### ✅ `FeedActivityCard.tsx` — DONE (sesión 20 abril)
Archivo: `correr-juntos-app/src/components/home/FeedActivityCard.tsx`
Tipo export: `FeedItemV2` (también disponible desde `services/api.ts`)
Helper RPC: `getFeedWithCompatible(limit, offset)` en `api.ts`
Status: probado, RPC retorna filas correctamente estructuradas.

#### ✅ `HeroQuedadaCard.tsx` — DONE (sesión 20 abril)
Archivo: `correr-juntos-app/src/components/home/HeroQuedadaCard.tsx`
Tipo export: `HeroQuedada`
Features: live pill adaptativo, distancia haversine, avatar stack, CTA urgency-aware.

#### ✅ `ShoesTrackingCard.tsx` — DONE (sesión 21 abril)
Archivo: `src/components/home/ShoesTrackingCard.tsx`
Consume RPC `get_active_shoe`. Estado empty + loaded con status-aware colors (ok/warning/retire) + affiliate CTA que abre blog/Amazon si hay affiliate_url.

#### ✅ `ConsistencyHeatmap.tsx` — DONE (sesión 21 abril)
Archivo: `src/components/home/ConsistencyHeatmap.tsx`
Grid 16×7 GitHub-style. Query directa a `runs` table + aggregation client-side. Thresholds auto-normalizan al max_km del usuario con piso de 10km.

#### ✅ `AchievementsRow.tsx` — DONE (sesión 21 abril)
Archivo: `src/components/home/AchievementsRow.tsx`
Scroll horizontal. Consume `achievements` + `user_achievements` (LEFT JOIN). Muestra unlocked primero + locked teasers. Tier-aware colors (gold/silver/bronze).

#### ✅ `PrivacySettingsScreen.tsx` — DONE (sesión 21 abril)
Archivo: `src/screens/PrivacySettingsScreen.tsx`
Pantalla entera **registrada en App.tsx Stack** como ruta `PrivacySettings` (línea `<Stack.Screen name="PrivacySettings" ... />`). Consume `privacy_settings` table con optimistic UI (patch local + UPDATE background, revert en error). Toggle "hide_start_end_meters" mapea a 0/500.

### 2 · Refactor pantallas existentes

#### ✅ `FeedScreen.tsx` — Home v3 (DONE sesión 21 abril)
Integrados HeroQuedadaCard (top) + FeedActivityCard (sección "Actividad reciente" con tags contextuales). Las secciones legacy (coach, training, upsell, quedadas, feed_activities, challenges) se mantienen para compatibility durante el rollout.

#### ✅ `components/profile/ProgresoTab.tsx` — Profile v2.1 (DONE sesión 21 abril)
Integrados ConsistencyHeatmap + ShoesTrackingCard + AchievementsRow después de renderHeader, antes de los bloques Strava-style existentes. Settings linkea a PrivacySettings.

#### 🔴 PENDIENTE: `Auth/LoginScreen.tsx` — signup UI v2
Mockup: `tools/qa/signup-v2-preview.png`
Cambios: subtitle "Empieza en 30 segundos. Sin tarjeta.", social proof strip, trust line en email, password strength bar, terms simplificado, CTA "Crear cuenta gratis", progress dots.

#### `OnboardingScreen.tsx` — paso 2 v2
Mockup: `tools/qa/onboarding-profile-v2-preview.png`
Cambios: header "Háblanos de ti", niveles monocromo + ritmo típico (7:00 / 5:30 / 4:30 / 3:30), trust footer 🔒.

#### `OnboardingNotificationsScreen.tsx` — v2
Mockup: `tools/qa/onboarding-notifs-v2-preview.png`
Cambios: título "Nunca te pierdas una quedada", 3 benefits específicos, frequency promise verde, trust footer.

#### `FeedScreen.tsx` — Home v3 completo
Mockup: `tools/qa/home-v3-preview.png`
Reescribir el render:
1. `HomeHeader` (mantener)
2. `HeroQuedadaCard` (primera quedada cercana no cursada)
3. Week progress compact (refactor del renderWeekSummary actual)
4. `{feed.map(item => <FeedActivityCard {...item} />)}` ← consume `get_feed_with_compatible`
5. Quedadas cerca list compacta

Eliminar: renderEmptyState con "Tu feed está vacío" (nunca se llega porque feed siempre tiene gente compatible).

#### `RunDetailScreen.tsx` — Activity Detail v2
Mockup: `tools/qa/activity-detail-v2-preview.png`
Añadir secciones:
- Owner header con avatar + tag + seguir
- Big map (ya existe)
- Stats grid 4x1 con deltas
- Parciales por km (bars + PR badge)
- Pace chart
- Sección bloqueada HR si `hr_visibility` privacy check
- Kudos row + comments (usan APIs existentes)

Privacy check: leer `privacy_settings` del owner + saber si yo sigo al owner → decidir qué sections render.

#### `PaywallScreen.tsx` — v2
Mockup: `tools/qa/paywall-v2-preview.png`
Reescribir totalmente con:
- Crown icon gold
- Hero "Corre con todos los que quieras. Sin límites."
- Social proof strip (★4.6 · 180+ · cancela cuando quieras)
- Tabla comparativa Free vs Premium (7 rows)
- Pricing cards Monthly + Annual (featured "Ahorra 50%")
- Trial CTA "Empezar prueba gratis de 7 días"
- Testimonial María G.
- FAQ accordion (3 items)

Source prop: `manual` | `match_limit` | `quedada_limit` | `plan_locked` | `strava_locked` | `post_first_quedada` | `stats_locked` — cambia hero copy según source.

#### `ProfileScreen.tsx` — v2.1
Mockup: `tools/qa/profile-v21-preview.png`
Reescribir con:
- `ProfileHeader` (cover + avatar + name + meta + bio + sports chips)
- Followers row (3 stats clickable)
- Action buttons (Editar perfil + Compartir QR)
- Lifetime stats grid 4x1
- `ConsistencyHeatmap` (16 semanas)
- Period toggle + monthly summary
- `AchievementsRow`
- `ShoesTrackingCard`
- PRs list
- Recent activities list
- Settings shortcut footer

Eliminar: "Nivel X — 35% para Intermedio" gamification.

### 3 · Integrations + polish (2-3h)

- `ActivityCompletionScreen.tsx` — añadir quick privacy selector después de guardar actividad
- Navegación: añadir route `PrivacySettings` en App.tsx Stack
- Settings row "Privacidad" → navigate('PrivacySettings')
- i18n en en.ts + es.ts para todos los nuevos strings

### 4 · Testing (1-2h)

- TypeScript check: `npx tsc --noEmit` (tiene bug stack overflow conocido, usar `--incremental false`)
- Maestro E2E: `correr-juntos-app/maestro/test-onboarding.yaml` (actualizar si cambian screens)
- Test manual: signup email → signup Google → signup Apple, los 3 deben llegar al onboarding paso 2

### 5 · Build (1h)

```bash
cd correr-juntos-app
# Bump versión
# app.json: version "1.3.4", iOS buildNumber "82", Android versionCode 81

# Build
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit (en paralelo)
eas submit --platform ios --latest
# Android: subir AAB manual a Google Play Console
```

---

## 📂 ARCHIVOS DE REFERENCIA EN EL REPO

**Mockups PNG** (`tools/qa/`):
- `landing-v2-preview.png`
- `signup-v2-preview.png`
- `onboarding-profile-v2-preview.png`
- `onboarding-notifs-v2-preview.png`
- `home-v3-preview.png`
- `activity-detail-v2-preview.png`
- `privacy-settings-v2-preview.png`
- `paywall-v2-preview.png`
- `profile-v21-preview.png`

**HTMLs fuente** (para color/spacing exactos):
- Mismo nombre base `.html` en la misma carpeta

**Audit original:**
- `tools/qa/pre-build-audit.md` (45 pantallas)
- `tools/qa/audit-2026-04-20.md` (audit inicial)

---

## 🎯 COMANDO PARA MAÑANA

Copia esto al nuevo chat de Claude:

> Sigo el plan de `tools/qa/IMPLEMENTATION-NEXT.md`. Backend v1.3.3 ya está deployed. Los 6 componentes UI nuevos ya están creados (FeedActivityCard, HeroQuedadaCard, ShoesTrackingCard, ConsistencyHeatmap, AchievementsRow, PrivacySettingsScreen). Arrancamos ahora con la **Fase 3 — refactor de las 7 pantallas existentes** según el plan. Empezar por `FeedScreen.tsx` (el Home v3 que usa FeedActivityCard + HeroQuedadaCard). Patrón: mirar los componentes ya creados en `src/components/home/*` para conventions (tipos exportados, props con theme, SVGs monocromo, gradientes ember).

---

## ⚡ QUICK REFERENCE — RPCs DISPONIBLES

```ts
// Feed Strava-style (Home v3)
const { data } = await supabase.rpc('get_feed_with_compatible', {
  p_limit: 20, p_offset: 0
});
// Returns: array of { run_id, user_id, user_nombre, user_photo, relation, compat_score, distance_km_from_me, titulo, deporte, distancia_km, duracion_segundos, ritmo_promedio, ciudad, polyline_encoded, map_visible, fecha, created_at }

// Zapatilla activa (Profile v2.1)
const { data } = await supabase.rpc('get_active_shoe');
// Returns: { id, brand, model, nickname, recommended_km, accumulated_km, percent_used, status, affiliate_url, photo_url }

// Score compatibilidad (debug / ad-hoc)
const { data } = await supabase.rpc('compatibility_score', {
  p_user_a: 'uuid-a', p_user_b: 'uuid-b'
});
// Returns: int 0-100

// Notificaciones (ya integrado en la app actual)
const { data } = await supabase.rpc('get_notificaciones', { p_limit: 50, p_offset: 0 });
const { data } = await supabase.rpc('get_unread_count');
await supabase.rpc('mark_notifications_read');

// Privacy settings (leer y actualizar directamente la tabla)
const { data } = await supabase.from('privacy_settings').select('*').single();
await supabase.from('privacy_settings').update({ activity_visibility: 'public' }).eq('user_id', userId);
```

---

Listo para mañana. Tiempo estimado para cerrar todo: **2-3 jornadas de trabajo** (15-20h). Al final, UN SOLO BUILD nativo con todo.
