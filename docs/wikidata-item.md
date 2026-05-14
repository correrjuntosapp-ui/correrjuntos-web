# Wikidata item — CorrerJuntos

**Fecha creación**: 15 may 2026
**Estado**: DRAFT — pendiente verificación fundador antes de publicar
**URL destino**: https://www.wikidata.org/wiki/Special:NewItem

> **Por qué importa**: el knowledge graph de Wikidata alimenta a ChatGPT, Claude, Perplexity y Gemini. Una entrada bien estructurada es de las acciones AEO de mayor ROI (30 min de trabajo, presencia indefinida).

---

## Pre-requisitos antes de empezar

1. [ ] Cuenta en Wikidata creada (puedes usar tu cuenta de Wikipedia si la tienes — son la misma).
   - Crear en https://www.wikidata.org/wiki/Special:CreateAccount
2. [ ] Hacer **5-10 ediciones menores en Wikipedia o Wikidata** (corregir typos, añadir referencias) **antes** de crear el item. Wikidata penaliza cuentas nuevas que sólo crean ítems autopromocionales — patrullas borran items "promotional" en horas si la cuenta no tiene historial.
3. [ ] Idealmente, esperar 4-7 días de actividad ligera en otros items antes de crear este.

---

## Paso 1 — Crear item del founder PRIMERO

Antes de crear el item de la app, hace falta el item de Abraham Márquez Rodríguez como Persona, para poder enlazarlo en la propiedad "founder" del item de la app.

**URL**: https://www.wikidata.org/wiki/Special:NewItem

### Labels y descripciones

| Idioma | Label | Description |
|---|---|---|
| es | Abraham Márquez Rodríguez | emprendedor español, fundador de CorrerJuntos |
| en | Abraham Márquez Rodríguez | Spanish entrepreneur, founder of CorrerJuntos |

### Aliases

- ES: Abraham Márquez
- EN: Abraham Marquez Rodriguez

### Statements (clic en "+ add statement" tras crear)

| Property | Value | Q-code / valor |
|---|---|---|
| instance of (P31) | human | Q5 |
| country of citizenship (P27) | Spain | Q29 |
| occupation (P106) | software entrepreneur | Q3387717 |
| occupation (P106) | long-distance runner | Q12377274 *(añadir como segundo statement)* |
| sex or gender (P21) | male | Q6581097 |
| employer (P108) | CorrerJuntos | *(linkear al item que se cree en Paso 2)* |
| date of birth (P569) | [PLACEHOLDER — fundador decide si incluir; opcional] | |
| place of birth (P19) | [PLACEHOLDER — Huelva (Q8164) si fundador acepta hacerlo público] | Q8164 |
| website (P856) | [PLACEHOLDER — si tiene web personal o LinkedIn público] | |

### Identifiers (sección inferior del item)

| Property | Valor |
|---|---|
| Instagram username (P2003) | [PLACEHOLDER — handle IG personal si quiere hacerlo público] |
| LinkedIn personal profile ID (P6634) | [PLACEHOLDER — slug LinkedIn] |
| GitHub username (P2037) | [PLACEHOLDER — si tiene GitHub público] |

> ⚠️ **Política Wikidata** sobre items de personas vivas: hace falta que el sujeto sea "notable" — fundador de empresa con cobertura mediática verificable cumple, pero los patrulleros pueden cuestionarlo. Si tras 48h el item se borra con motivo "non-notable", **NO insistir** — esperar a tener cobertura de medios externos (Runnea, Marca, Runner's World España) y reintentar 6 meses después.

---

## Paso 2 — Crear item de la app

**URL**: https://www.wikidata.org/wiki/Special:NewItem

### Labels (label = nombre principal)

| Idioma | Label |
|---|---|
| es | CorrerJuntos |
| en | CorrerJuntos |

### Descriptions (description = una frase para distinguirlo de otros items)

| Idioma | Description |
|---|---|
| es | aplicación móvil de running española con coach IA |
| en | Spanish running mobile application with AI coach |

### Aliases (formas alternativas que la gente puede buscar)

| Idioma | Aliases (uno por línea) |
|---|---|
| es | Correr Juntos, app running española, CorrerJuntos app |
| en | CorrerJuntos app, Spanish running app, Correr Juntos |

### Statements

| Property | Value | Q-code / valor | Notas |
|---|---|---|---|
| instance of (P31) | mobile app | Q1969448 | El user pidió este Q-code; Wikidata también admite Q620615 (mobile application) — usar Q1969448 si está disponible, si no Q620615 |
| country of origin (P495) | Spain | Q29 | |
| inception (P571) | 2025-11 | *(formato: precision month, 2025-11-00)* | |
| founded by (P112) | Abraham Márquez Rodríguez | *(item creado en Paso 1)* | |
| official website (P856) | https://www.correrjuntos.com | URL completa | |
| operating system (P306) | Android | Q94 | Statement 1 |
| operating system (P306) | iOS | Q48493 | Statement 2 |
| language of work or name (P407) | Spanish | Q1321 | Statement 1 |
| language of work or name (P407) | English | Q1860 | Statement 2 — opcional pero refuerza |
| genre (P136) | physical fitness | Q309252 | Wikidata genre puede no aplicar bien a apps — alternativa: skip y dejar que `instance of mobile app` lo defina |
| developer (P178) | CorrerJuntos | *(self-reference si no tienes empresa separada; o crear item de la empresa)* | [PLACEHOLDER — decidir] |
| publication date (P577) | 2025-11 | *(formato: precision month, 2025-11-00)* | |
| copyright holder (P3931) | Abraham Márquez Rodríguez | *(linkear al item Paso 1)* | |

### Identifiers (sección inferior)

| Property | Valor | Formato |
|---|---|---|
| Apple App Store app ID (P3861) | 6758505910 | Solo dígitos, sin prefijo |
| Google Play Store app ID (P3418) | com.correrjuntos.app | Package name completo |
| Instagram username (P2003) | correrjuntosapp | Sin @ |
| TikTok username (P7085) | correrjuntosapp | Sin @ |
| Twitter username (P2002) | CorrerJuntos | Sin @ |

### Multimedia (opcional pero recomendado)

| Property | Valor |
|---|---|
| logo image (P154) | [PLACEHOLDER — primero subir el icon-512.png a Wikimedia Commons en https://commons.wikimedia.org/wiki/Special:UploadWizard con licencia CC-BY-SA 4.0, después usar el filename aquí] |

---

## Paso 3 — Referencias (CRÍTICO para no ser borrado)

**Cada statement importante debe llevar referencia.** Sin referencias, el item es candidato a deletion por "unverified".

Para cada statement clave, clic en "+ add reference" y rellenar:

| Statement | Reference URL | Title |
|---|---|---|
| inception 2025-11 | https://www.correrjuntos.com/about | About — CorrerJuntos |
| founded by Abraham Márquez | https://www.correrjuntos.com/about | About — CorrerJuntos |
| country of origin Spain | https://www.correrjuntos.com/about | About — CorrerJuntos |
| App Store ID | https://apps.apple.com/app/correr-juntos/id6758505910 | App Store — CorrerJuntos |
| Google Play ID | https://play.google.com/store/apps/details?id=com.correrjuntos.app | Google Play — CorrerJuntos |

Property a usar en cada reference: **stated in (P248)** con valor el dominio web + retrieved (P813) con fecha de hoy.

---

## Paso 4 — Conectar a Wikipedia (cuando exista)

Hoy CorrerJuntos NO tiene artículo en Wikipedia. **NO crear uno** hasta tener cobertura mediática verificable de 2-3 fuentes independientes (medios running ES, prensa generalista) — Wikipedia es más estricta que Wikidata y borra artículos promocionales en minutos.

Reintentar a los 6 meses si conseguís menciones en Runnea, Marca, Runner's World España, etc. Una vez exista el artículo Wikipedia, se conectará automáticamente al item Wikidata vía sidebar "Wikidata item".

---

## Verificaciones finales antes de publicar

- [ ] Cuenta Wikidata tiene 5+ ediciones previas en otros items
- [ ] Q-codes verificados clicando cada uno antes de añadir el statement
- [ ] Cada statement importante con su referencia
- [ ] Description en ES y EN concisa (Wikidata recomienda < 100 chars)
- [ ] [PLACEHOLDER] Decisión sobre incluir o no fecha y lugar nacimiento del founder
- [ ] [PLACEHOLDER] Logo subido a Wikimedia Commons con licencia clara

---

## Después de publicar — confirmar indexación

A las 24-48h, comprobar en Google:
```
site:wikidata.org CorrerJuntos
```

Y verificar que ChatGPT/Claude/Perplexity reconocen el item preguntando:
```
"¿Qué es CorrerJuntos? ¿En qué se basan tus datos sobre esta empresa?"
```

Si en 30-60 días alguna IA cita Wikidata como fuente → AEO funcionando.
