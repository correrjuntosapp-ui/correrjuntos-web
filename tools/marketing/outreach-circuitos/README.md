# Outreach Circuitos Populares Running España

Campaña de outreach a circuitos populares de running en España para conseguir partnerships editoriales / backlinks / co-promoción.

## Estado actual (29 abril 2026)

- ⏳ Programado para enviar el **viernes 1 mayo 2026 a las 9:00 AM**
- ❌ Agent `outreach-circuitos` está DESACTIVADO hasta que el user dé OK explícito
- 📋 Lista preparada: 30 targets identificados

## Honest reality check sobre la lista

**Solo 2 emails están 100% verificados** (`confianza_email: verified`):
1. Onupolis (Huelva) — `marketing@onupolis.es`
2. UCBM Madrid — `carrerasdebarrio@gmail.com`

**Los otros 23 son emails inferidos** (`confianza_email: inferred`) usando el patrón institucional típico (`deportes@dipucordoba.es`, `info@circuitocarrerasdiputacioncuenca.com`, etc). Esto significa:

- ⚠️ **Bounce rate esperado: 30-50%** — muchos formatos institucionales no son los reales
- ⚠️ **Sender score impact**: si Brevo detecta muchos bounces, baja la reputación
- ✅ **Mitigación**: el agent está configurado para parar si bounce > 20% en primer batch

**5 entradas son `web-form-only`** (sin email, requieren rellenar formulario):
- Sportmaniacs, Crono4Sports
- 4 circuitos Comunidad Valenciana sin web pública identificada

Estos 5 NO los envía el agent. Quedan para envío manual de Abraham si decide.

## Recomendaciones de uso

### Opción honesta A — Solo verificados (más seguro)

Filtra el CSV a solo los 2 con `confianza_email: verified` y manda esos primero.
Mide reply rate. Si responden → escalar el approach con más confianza.

```bash
# Filtrar solo verificados
awk -F',' '$7=="verified"' tools/marketing/outreach-circuitos/lista-targets.csv
```

### Opción honesta B — Verificar emails antes de enviar

Antes del 1 mayo, verifica los emails inferidos:
- Visita web oficial de cada Diputación
- Busca página "Contacto" o "Deportes"
- Confirma email correcto
- Actualiza CSV cambiando `inferred` → `verified` en los confirmados

Esto es 1-2h de trabajo adicional pero **sube la calidad del envío**.

### Opción C — Enviar a todos asumiendo el bounce

Mandar a los 25 con email (verified + inferred). Asumir que ~12-15 bouncearán.
Ventaja: rápido. Desventaja: sender score Brevo afectado.

## Estructura de archivos

```
tools/marketing/outreach-circuitos/
├── lista-targets.csv         # Los 30 targets identificados
├── template-email.md          # 3 versiones (A/B/C según tipo)
├── README.md                  # Este archivo
└── log-envios.jsonl           # (se crea al ejecutar) Tracking de envíos
```

## Cómo activar el envío (cuando Abraham decida)

```
"Activa outreach-circuitos para enviar el 1 mayo a las 9:00"
```

Esto:
1. Verifica que CSV + template existan
2. Programa la task para el 1 mayo 9:00
3. Pasa enabled: true
4. El día 1 ejecuta sola, manda emails en lotes de 10 con 60s entre cada uno

## Cómo cancelar / pausar

```
"Cancela outreach-circuitos"
```

## Siguientes pasos sugeridos antes del 1 mayo

1. ✅ Lista creada (este archivo)
2. ✅ Template creado
3. ⏳ **Verificar 5-10 emails clave manualmente** (para subir confianza)
4. ⏳ Decidir si enviar Versión A/B/C según tipo de target
5. ⏳ Confirmar Brevo `BREVO_API_KEY` en `.env` está activo
6. ⏳ Activar la task el 1 mayo

## KPIs esperados

Math realista basado en cold outreach B2B:
- Open rate: 15-30% (es low-volume B2B con asunto personalizado)
- Reply rate: 3-8%
- Partnership rate (de las replies): 30-50%

Por tanto:
- 25 emails enviados → 4-7 replies → 1-3 partnerships reales

**1-3 partnerships = 1-3 backlinks de autoridad local + cobertura cruzada + acceso a audiencias específicas**.

ROI vs paid ads: incomparable. Cada backlink local equivale a meses de SEO orgánico
en términos de subir posición Google.
