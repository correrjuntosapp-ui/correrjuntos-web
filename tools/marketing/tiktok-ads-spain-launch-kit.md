# TikTok Ads — CorrerJuntos España launch kit

Pack completo para lanzar el test de 150€ que hablamos. Incluye creativos,
copy de los ads, setup paso a paso de la cuenta, y qué medir.

---

## 1. Creativos listos para subir

| Archivo | Dur. | Tamaño | Cuándo usar |
|---|---|---|---|
| `tiktok-ad-spain-15s.mp4` | 15 s | 1.9 MB | **Ad principal** — sweet spot TikTok (9-15 s) |
| `tiktok-ad-spain-9s.mp4`  |  9 s | 1.3 MB | **A/B twin** — in-feed scroll, hook agresivo |
| `tiktok-kinetic-spain.mp4` | 17 s | 2.5 MB | Backup / para Spark Ad desde post orgánico |

Todos 1080×1920 H.264 yuv420p, compatibles nativos sin reprocesado.

**Diferencia de estructura:**
- **15 s** (principal): Hook ¿Corres solo? → Stat 568+ → Ciudades → CTA 4.5 s
- **9 s** (agresivo): Hook → Stat → CTA. Sin ciudades, sin features.

Subir ambos. TikTok aprende cuál convierte mejor por sí solo en 48 h.

---

## 2. Caption pack — 10 variaciones ES

Las primeras **70 caracteres** son lo único que se ve en el feed antes del
"más…" — el hook va ahí. El resto del texto sí influye en SEO de TikTok
Search.

### Variante A — Pregunta directa (va con video 9s o 15s)
```
¿Sabías que somos +500 runners en España? 🏃 La app que te empareja por ritmo y ciudad. Gratis.

#correr #running #runnersmadrid #runnersbarcelona #correrjuntos
```

### Variante B — Stat-first
```
568 runners ya no corren solos. Encuentra tu compañero de ritmo en Madrid, Barcelona, Valencia, Sevilla o Bilbao.

#running #correr #runnersespaña #runningmadrid #correrjuntos
```

### Variante C — Benefit-led
```
La app que te busca compañero de running por ritmo y zona. 14 días gratis.

#running #correr #runnersmadrid #correbarcelona #runningespaña
```

### Variante D — Objeción directa
```
Correr solo aburre. Correr acompañado aburre menos. Matching por ritmo y ciudad — gratis.

#correr #running #runnerslife #runnersespaña #correrjuntos
```

### Variante E — Comunidad local
```
Buscando grupo de running en Madrid / Barcelona / Valencia? 568+ runners ya están en CorrerJuntos.

#runningmadrid #runningbarcelona #runningvalencia #correr #running
```

### Variante F — Objetivo concreto
```
Preparas tu primer 10K? Coach IA + compañero de tu ritmo. Todo gratis.

#10k #media #maraton #correr #running #runningespaña
```

### Variante G — FOMO
```
Esta semana hay quedadas de running en 5 ciudades de España. Apúntate gratis — es fácil.

#correr #running #runnersmadrid #runningbarcelona #correrjuntos
```

### Variante H — Prueba social
```
568 runners en España encontraron compañero de ritmo aquí. ¿Y tú?

#correr #running #runningmadrid #runnersespaña #correrjuntos
```

### Variante I — Local específica Madrid (ad set Madrid)
```
Runners de Madrid: encuentra compañero de ritmo en tu barrio. App gratis.

#runningmadrid #correrenmadrid #madridrunners #running #correr
```

### Variante J — Local específica Barcelona
```
Runners de Barcelona: tu compañero de ritmo te espera. 14 días gratis.

#runningbarcelona #correrenbarcelona #barcelonarunners #running #correr
```

---

## 3. Hashtag strategy

**Regla TikTok Ads 2026 (aplica también a orgánico):**
3 grandes + 3 medianos + 3 nicho = 9 total. Más que eso el algo penaliza.

**Pack recomendado para ad sets España:**
- Grandes (1-10M posts): `#running` `#correr` `#maraton`
- Medianos (100K-1M): `#runnersespaña` `#empezaracorrer` `#10k`
- Nicho (<100K): `#correrjuntos` + city (`#runningmadrid`, `#runningbarcelona`, etc)

---

## 4. Campaign spec — copia/pega en TikTok Ads Manager

### Campaign level
- **Name**: `CJ-ES-App-Install-Test-V1`
- **Objective**: `App Promotion → App Installs`
- **Optimization**: `Install + Registration` (segundo evento vía SKAN / Install Referrer)
- **Budget**: `€150 total` daily-capped = `€21.43/día × 7 días`
- **Bid strategy**: `Lowest cost` (automático — dejemos que aprenda)

### Ad set 1 — Madrid
- **Placement**: `TikTok feed only` (desactiva Pangle/TopBuzz al principio)
- **Location**: Spain → Madrid + 30 km radius
- **Age**: 25-45
- **Gender**: All
- **Interest**: Running, Fitness, Nike Running, Garmin, Strava users
- **Behaviour**: Interacted with sports video last 15 days
- **Budget**: `€7/día`
- **Creative**: `tiktok-ad-spain-15s.mp4` + caption I (Madrid)

### Ad set 2 — Barcelona
- **Location**: Spain → Barcelona + 30 km
- **Age**: 25-45
- **Interest**: same running bucket
- **Budget**: `€7/día`
- **Creative**: `tiktok-ad-spain-15s.mp4` + caption J (Barcelona)

### Ad set 3 — Rest of Spain (VAL / SEV / BIL + others)
- **Location**: Spain (exclude Madrid + Barcelona cities)
- **Age**: 25-45
- **Interest**: same running bucket
- **Budget**: `€7.43/día`
- **Creative**: `tiktok-ad-spain-9s.mp4` (punchy variant) + caption B or E

### Ad creative fields per ad
- **Display name**: `Correr Juntos`
- **Ad description** (110 char max): usar caption corto (A, C, D, F, H)
- **CTA button**: `Download` (fijo para App Promotion)
- **Landing URL**: `https://www.correrjuntos.com/app?utm_source=tiktok&utm_medium=cpc&utm_campaign=es-launch-v1`

---

## 5. Setup cuenta TikTok Business — 45 min tuyos

### Paso 1 · Crear cuenta TikTok Business (10 min)
1. https://ads.tiktok.com/business/es
2. Click **Create an account** → email `correrjuntosapp@gmail.com` (la que ya tienes)
3. Business name: `Correr Juntos`
4. Industry: `Mobile Apps / Fitness`
5. País: `Spain`

### Paso 2 · Ads Manager (5 min)
1. Una vez dentro → **Ads Manager** del menú
2. Se crea un Ad Account automático. Nombre: `Correr Juntos ES`
3. Timezone: `Europe/Madrid`
4. Moneda: `EUR`

### Paso 3 · Payment (5 min)
1. **Billing → Payment methods** → añade tarjeta
2. Pre-paga 150€ (puedes hacer un top-up inicial en esa cantidad). Si lo dejas en auto-billing, TikTok te cobra según consumo.

### Paso 4 · Añadir app (10 min)
1. **Assets → Apps → Add app**
2. iOS: `6758505910` (App Store ID)
3. Android: `com.correrjuntos.app`
4. TikTok pregunta por MMP (AppsFlyer / Adjust). **Skip por ahora** — usa `SKAN + Install Referrer`.

### Paso 5 · SKAN schema iOS (10 min)
Lo más técnico pero es copia/pega.
1. **Assets → Events → App Events → SKAdNetwork**
2. Activa iOS App Install tracking
3. Schema por defecto de TikTok es suficiente — NO necesitas editar `SKAdNetworkItems` en `app.json` porque TikTok usa su propio ID que ya viene en la lista genérica de SKAN. (Verificar en `app.json`: ya hay ~80 SKAN IDs. Si faltara `238da6jt44.skadnetwork` añadirlo, pero lo normal es que ya esté.)
4. **Asigna eventos**: `Install` (post-install) + `Registration` (app abierta)

### Paso 6 · Android Install Referrer (3 min)
1. Nada que hacer en TikTok — Google Play ya provee Install Referrer automáticamente
2. TikTok detecta instalaciones Android atribuidas con latencia de ~6h

### Paso 7 · Crear la campaña (5 min con este doc al lado)
1. **Campaign → Create** → App Install objective
2. Copia/pega los 3 ad sets del punto 4 arriba
3. Sube los 3 MP4s (15s, 9s, 17s backup)
4. Launch → review queue TikTok (1-4h típico en ES)

---

## 6. Medición semana 1

### Qué mirar en TikTok Ads Manager
- **CPM** (Cost per 1000 impressions) — España running target, espera 4-8€
- **CTR** (Click-through rate) — benchmark >1% para ads en feed
- **CPC** (Cost per click) — target <0.30€
- **CPI** (Cost per install) — **THE NUMBER.** Target <1.50€ España

### Qué mirar en CorrerJuntos GA4
- `first_open` — filtro `traffic_source = tiktok`
- `sign_up` funnel
- `paywall_opened` con `source` param (ya está enviado tras Sprint 1)
- Cohort D7 retention de usuarios tiktok vs usuarios orgánicos

### Umbral de decisión semana 1
- **CPI < 1.20€ y D7 ret > 20%** → escala a 50€/día
- **CPI 1.20-2.00€ y D7 ret > 15%** → mantén 20€/día, optimiza creativo
- **CPI > 2.00€** → pausa, itera creativo antes de volver

---

## 7. Siguientes iteraciones (si el canal convierte)

### Creativos v2 (si v1 funciona)
- Variantes con testimonio real (cuando haya 1 usuario premium ok con aparecer)
- UGC style (alguien del equipo graba 9s con teléfono en una quedada real)
- Sub-ciudad (ad específico "runners de Sevilla" con B-roll de parque local)

### Tracking v2 (si budget >300€/mes)
- Instalar **TikTok SDK** en app via Expo Config Plugin
- Permite event deep tracking: `add_to_cart` (tap paywall), `purchase` (premium)
- Converte optimización de "install" → "purchase value"

### Targeting v2
- **Lookalike audience**: crea uno desde los 2 premium actuales + nuevos trial users
- **Retargeting**: viewers que vieron >75% del ad pero no instalaron → ad #2 con más urgencia

---

## 8. Checklist go/no-go antes de darle al botón

- [ ] Cuenta TikTok Business creada
- [ ] Payment method con 150€ prepagados
- [ ] App añadida (iOS + Android) en Assets
- [ ] SKAN activado iOS + Events asignados (Install, Registration)
- [ ] 3 MP4s subidos al media library
- [ ] 3 ad sets configurados con budget/target
- [ ] Landing URL con UTMs tagged
- [ ] GA4 vista creada filtrada por `utm_source = tiktok`

Todo ✓ → **Launch**. TikTok la aprueba en 1-4 h y empieza a servir.
