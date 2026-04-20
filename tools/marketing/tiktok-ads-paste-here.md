# TikTok Ads — paste-here guide (10-15 min)

> Cada campo del TikTok Ads Manager con el valor EXACTO a pegar. Abre esto
> en pestaña al lado del dashboard.

---

## 0. Preflight (2 min)

### Verifica que @correrjuntosapp es cuenta **Business**
Por defecto es personal → TikTok Ads NO permite Spark Ads desde cuenta personal.

**Cómo cambiarla:**
1. App TikTok → perfil → ☰ → Settings and privacy → Manage account → **Switch to Business Account**
2. Category: **Sports & Fitness**
3. Contact email: `correrjuntosapp@gmail.com`
4. Website: `https://www.correrjuntos.com`

Listo. No afecta el perfil visible para followers.

---

## 1. Crear cuenta Business Center + Ads Account (5 min)

### URL
https://business.tiktok.com → **Create a Business Account**

### Campos a rellenar
| Campo | Valor exacto |
|---|---|
| Email | `correrjuntosapp@gmail.com` |
| Business name | `Correr Juntos` |
| Industry | `Mobile Apps` → subcategoría `Sports & Fitness Apps` |
| Country/Region | `Spain` |
| Currency | `EUR` |
| Timezone | `(GMT+01:00) Europe/Madrid` |

Después de crear → pide crear **Ad Account**. Dale:
- Ad Account name: `Correr Juntos ES · Launch`
- Mismo country/currency/timezone

### Billing (3 min)
1. Business Center → Billing → **Add payment method**
2. Opción recomendada: **Manual top-up** (no auto-bill mientras testas)
3. Pre-carga **150€** — TikTok cobra IVA aparte si aplica

---

## 2. Conectar la app (3 min)

### URL
Ads Manager → **Assets → Apps → Add app**

### Pega estos valores
| Campo | Valor |
|---|---|
| App platform iOS | Seleccionar `iOS` |
| App Store URL | `https://apps.apple.com/es/app/correr-juntos/id6758505910` |
| (se auto-rellena) Bundle ID | `com.correrjuntos.app` |
| (se auto-rellena) App ID | `6758505910` |

Repite para Android:
| Campo | Valor |
|---|---|
| App platform Android | Seleccionar `Android` |
| Google Play URL | `https://play.google.com/store/apps/details?id=com.correrjuntos.app` |
| Package name | `com.correrjuntos.app` |

### MMP (Mobile Measurement Partner)
Skip — dice "SKAN Only" o "Direct install reporting". Para este test NO instalas AppsFlyer/Adjust.

---

## 3. SKAN events iOS (2 min)

### URL
Assets → Events → **App Events (SKAN)** → selecciona la app iOS

### Eventos a configurar
| Conversion event | Tier | Mapping |
|---|---|---|
| `install` | Install (Tier 0) | automático |
| `registration` | Registration | Tier 1, count once |
| `purchase` | Purchase | Tier 2, revenue |

TikTok te da un JSON de config — NO hace falta tocar el app.json porque ya
añadí los SKAN IDs de TikTok (`238da6jt44.skadnetwork`) en el commit
actual. Surtirán efecto en el próximo EAS build.

**Si ves warning "SKAdNetwork ID missing"**: ignora por ahora. Sigue
funcionando para este test; el próximo build lo resuelve permanentemente.

---

## 4. Publicar post orgánico → luego Spark Ad (3 min)

**POR QUÉ esto antes que Ads tradicionales:** Spark Ads (anuncios que
parten de un post orgánico tuyo) convierten **40-50% mejor** que ads
nuevos. Los users ven tu cuenta con historia, followers, otros posts —
cero fricción tipo "anuncio".

### Paso 1 — Sube el post en @correrjuntosapp (app TikTok)
Sube el archivo: **`tools/marketing/tiktok-ad-spain-15s.mp4`**

**Caption exacta (copia esto):**
```
¿Corres solo? 🏃 En España somos +500 runners que ya se han emparejado por ritmo y ciudad. Matching por tu pace, quedadas en Madrid, Barcelona, Valencia, Sevilla, Bilbao. Descarga gratis — correrjuntos.com

#correr #running #runnersespaña #runningmadrid #runnersbarcelona #correrjuntos #empezaracorrer #10k #maraton
```

**IMPORTANTE — en las opciones del post ANTES de publicar:**
- ✅ Activa **"Allow ads"** (o "Permitir anuncios") — sin esto no puedes hacer Spark Ad
- ✅ Activa **"Allow comments"** y **"Allow duet"** — engagement natural
- Hora sugerida: **martes 20:30 CEST** (post-entreno, peak running audience)

### Paso 2 — Autoriza el post para Ads (1 min)
Después de publicar:
1. App TikTok → el post → ⋯ → **Ad settings** → **Allow authorization**
2. Te da un **código de autorización** (6 caracteres) — cópialo

### Paso 3 — En Ads Manager añádelo como Spark Ad (luego, al crear campaña)
Campaign → Ad level → seleccionar **Use TikTok account to deliver Spark
Ads** → pegar el código de autorización → auto-importa el post.

---

## 5. Crear la campaña (5 min)

### URL
Ads Manager → Campaign → **Create**

### Campaign level
| Campo | Valor |
|---|---|
| Advertising objective | `App Promotion` |
| Mobile app | `Correr Juntos` (la que añadiste en paso 2) |
| Promotion type | `App install` |
| Campaign name | `CJ-ES-App-Install-V1` |
| Budget type | `Daily budget` |
| Daily budget | `21 EUR` |

### Ad Group 1 — Madrid
| Campo | Valor |
|---|---|
| Ad group name | `ES-Madrid-25-45-Running` |
| Placement | **Select placement** → ONLY `TikTok` (desmarca Pangle, Global App Bundle, TopBuzz) |
| Location | Spain → City → `Madrid` (incluye 30km radio automático) |
| Language | `Spanish` |
| Age | `25-34, 35-44` (marca ambos) |
| Gender | `All` |
| Interests (Categories) | `Sports & Outdoors → Running`, `Health & Fitness` |
| Behaviours → Video interactions | `Liked, Commented: Sports > Running` (últimos 15 días) |
| Daily budget (ad group) | `7 EUR` |
| Schedule | `Run continuously from tomorrow 08:00` |
| Bid strategy | `Lowest cost` |
| Optimization goal | `Install` |

### Ad Group 2 — Barcelona
**Duplica** el anterior y cambia:
- Name: `ES-Barcelona-25-45-Running`
- Location: `Barcelona` (30km radio)
- Daily budget: `7 EUR`

### Ad Group 3 — Resto España (VAL + SEV + BIL + otras)
**Duplica** y cambia:
- Name: `ES-Resto-25-45-Running`
- Location: Spain → **exclude** `Madrid`, `Barcelona`
- Daily budget: `7 EUR`

---

## 6. Configurar los Ads dentro de cada Ad Group

### Ad 1 (en cada Ad Group) — Spark Ad desde el post orgánico
| Campo | Valor |
|---|---|
| Ad name | `Spark-Ad-SpainKinetic-15s` |
| Identity | `Use TikTok account to deliver Spark Ads` |
| Authorization code | *(el que obtuviste en paso 4)* |
| Text / Caption | *(se hereda del post orgánico, no tocar)* |
| CTA button | `Download` |
| Landing URL | `https://www.correrjuntos.com/app?utm_source=tiktok&utm_medium=cpc&utm_campaign=es-launch-v1&utm_content=spark15` |

### Ad 2 (en cada Ad Group) — In-feed nuevo con 9s
| Campo | Valor |
|---|---|
| Ad name | `InFeed-9s-Punchy` |
| Identity | `Custom Identity → Correr Juntos` (identity por defecto) |
| Upload video | `tools/marketing/tiktok-ad-spain-9s.mp4` |
| Text (descripción) | pega la variante según ad group: |

**Text por ad group:**

Madrid:
```
Runners de Madrid: encuentra compañero de ritmo en tu barrio. App gratis.
```

Barcelona:
```
Runners de Barcelona: tu compañero de ritmo te espera. 14 días gratis.
```

Resto España:
```
568 runners ya no corren solos. Encuentra tu compañero de ritmo en España.
```

| Campo | Valor |
|---|---|
| CTA button | `Download` |
| Landing URL | `https://www.correrjuntos.com/app?utm_source=tiktok&utm_medium=cpc&utm_campaign=es-launch-v1&utm_content=infeed9s` |

### Ad 3 (solo en Madrid + Barcelona) — In-feed 15s
| Campo | Valor |
|---|---|
| Ad name | `InFeed-15s-Kinetic` |
| Upload video | `tools/marketing/tiktok-ad-spain-15s.mp4` |
| Text | ver caption pack (variantes A, B, H, I, J en `tiktok-ads-spain-launch-kit.md`) |
| CTA | `Download` |
| Landing URL | `https://www.correrjuntos.com/app?utm_source=tiktok&utm_medium=cpc&utm_campaign=es-launch-v1&utm_content=infeed15` |

---

## 7. Antes de darle a "Launch"

Checklist final:
- [ ] Ad account creado + 150€ pre-pagados
- [ ] App iOS + Android añadida en Assets
- [ ] SKAN events configurados (install, registration, purchase)
- [ ] Post orgánico en @correrjuntosapp con "Allow ads" activado + código authorizado
- [ ] 3 Ad Groups creados (Madrid, BCN, Resto ES) con budget 7€/día cada uno
- [ ] Placement = TikTok only (sin Pangle/TopBuzz)
- [ ] 2-3 ads por grupo (Spark Ad + In-feed 9s + In-feed 15s)
- [ ] Todas las URLs llevan UTMs (`utm_source=tiktok&utm_medium=cpc&utm_campaign=es-launch-v1`)

Todo ✓ → **Submit for review**. TikTok aprueba en 1-4 horas en España.

---

## 8. Día 1-2 después del launch

### Dónde ver los datos
1. **TikTok Ads Manager → Reporting → Campaign level**
   - Mira: Impressions, CTR, CPC, CPI (Cost per Install)
2. **GA4 → Acquisition → Traffic acquisition**
   - Filtro: `session_source = tiktok`
   - Mira: `first_open`, `sign_up`, `paywall_opened`
3. **Expo Dashboard** (installs crudos)
   - https://expo.dev/accounts/guetto100/projects/correr-juntos-app

### Red flags (pausa inmediata)
- CTR <0.5% en 48h → creativo no engancha, cambia hook
- CPI >3€ en 72h → targeting demasiado frío
- 0 installs atribuidos en Android a 48h → problema de Install Referrer (contacta soporte)

### Green lights (escala)
- CTR >1.2% → el creativo funciona
- CPI <1.50€ → hay señal
- Si ambos → **sube budget a 40€/día** en el ad group top performer al día 4

---

## 9. Cuando termine la semana 1 (7 días)

Dime los 4 números por ad group y te doy la recomendación:
- Spend
- Installs
- Signups (GA4)
- Paywall_opened con source=first_quedada (GA4)

Con eso decidimos: escalar, iterar creativo, o pivot target.
