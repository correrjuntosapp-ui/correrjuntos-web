# Informe Brevo LATAM - 26 marzo 2026

## Resumen Ejecutivo

Se han creado 3 listas segmentadas y 3 campanas de email para usuarios LATAM en Brevo.
Total usuarios LATAM: **67 contactos** (17% de la base total de 390 usuarios).

---

## 1. Usuarios LATAM por pais (datos Supabase)

| Pais | Codigo | Usuarios | % LATAM |
|------|--------|----------|---------|
| Mexico | MX | 30 | 44.8% |
| Peru | PE | 10 | 14.9% |
| Chile | CL | 6 | 9.0% |
| Ecuador | EC | 6 | 9.0% |
| Colombia | CO | 4 | 6.0% |
| Uruguay | UY | 4 | 6.0% |
| Argentina | AR | 3 | 4.5% |
| Brasil | BR | 1 | 1.5% |
| Costa Rica | CR | 1 | 1.5% |
| Panama | PA | 1 | 1.5% |
| Venezuela | VE | 1 | 1.5% |
| **TOTAL LATAM** | | **67** | **100%** |

### Distribucion geografica Espana vs LATAM vs otros
- Espana (ES): 272 usuarios (69.7%)
- LATAM: 67 usuarios (17.2%)
- USA: 10 usuarios (2.6%)
- Europa otros (NL, IE, CH, DE, PT, FR, AT, FI): 9 usuarios (2.3%)
- Otros: 1 usuario

### Nota sobre segmentacion
- El campo `pais` en la tabla `profiles` de Supabase tiene datos para todos los usuarios
- Segmentacion por pais es confiable y directa
- 4 emails de Apple Private Relay (@privaterelay.appleid.com) en MX fueron excluidos de Brevo (no reciben marketing)

---

## 2. Listas creadas en Brevo

| Lista ID | Nombre | Contactos | Paises |
|----------|--------|-----------|--------|
| 8 | LATAM - Mexico (30) | 26 | MX |
| 9 | LATAM - Andinos PE+EC+CO (20) | 20 | PE, EC, CO |
| 10 | LATAM - Cono Sur AR+CL+UY+otros (17) | 16 | AR, CL, UY, BR, CR, PA, VE |

**Nota:** 5 emails de Apple Private Relay fueron excluidos (no entregables para marketing).
Total contactos importados: **62 de 67**.

---

## 3. Campanas creadas (estado: DRAFT)

### Campana 8: LATAM MX - Bienvenida runners Mexico
- **Lista destino:** 8 (Mexico, 26 contactos)
- **Asunto:** "Runners en Mexico: entrena acompanado con CorrerJuntos"
- **Contenido:**
  - Saludo personalizado con {{params.NOMBRE}}
  - 30 runners en Mexico como social proof
  - 4 features de la app
  - CTA: Descarga la App Gratis (App Store)
  - Dato runner motivacional
  - 3 articulos del blog
- **Estado:** Draft - listo para enviar

### Campana 9: LATAM Andinos - Bienvenida runners PE+EC+CO
- **Lista destino:** 9 (Andinos, 20 contactos)
- **Asunto:** "Runners en tu ciudad: entrena acompanado con CorrerJuntos"
- **Contenido:**
  - Saludo personalizado
  - Crecimiento en Peru, Ecuador y Colombia
  - 4 features de la app
  - CTAs: App Store + Google Play
  - 2 articulos del blog
- **Estado:** Draft - listo para enviar

### Campana 10: LATAM Cono Sur - Bienvenida runners AR+CL+UY
- **Lista destino:** 10 (Cono Sur, 16 contactos)
- **Asunto:** "Runners en el Cono Sur: corre acompanado con CorrerJuntos"
- **Contenido:**
  - Saludo personalizado
  - Argentina, Chile, Uruguay como foco
  - Quedadas en Buenos Aires como gancho
  - CTAs: App Store + Google Play
  - 2 articulos del blog
- **Estado:** Draft - listo para enviar

---

## 4. Diseno del email

- Header naranja #FF6B00 con logo CorrerJuntos
- Body blanco con tipografia Arial
- Iconos emoji para features
- Boton CTA naranja con border-radius 30px
- Caja "dato runner" en fondo FFF5EB
- Links al blog en naranja
- Footer gris claro
- Responsive (table layout 600px max)
- Personalizacion: {{params.NOMBRE}} y {{params.CIUDAD}}

---

## 5. Proximos pasos

### Inmediatos (esta semana)
1. **Enviar test** de cada campana a hola@correrjuntos.com para revisar
2. **Programar envio** escalonado:
   - Campana MX: viernes 28 marzo 10:00 AM CST (hora Mexico)
   - Campana Andinos: sabado 29 marzo 10:00 AM PET (hora Peru)
   - Campana Cono Sur: sabado 29 marzo 10:00 AM ART (hora Argentina)
3. **Monitorear** open rate y click rate las primeras 24h

### Semana proxima
4. Crear campana de **follow-up** para quienes abran pero no descarguen la app
5. Crear campana especifica para **quedadas LATAM** cuando se activen
6. Segmentar por **nivel** (principiante/intermedio/avanzado) para contenido mas relevante

### Abril 2026
7. Integrar con **OneSignal** para push notifications geolocalizados
8. Crear **quedadas seed** en CDMX y Lima (las ciudades con mas usuarios)
9. Campana de **planes de entrenamiento** cuando se activen en la app
10. A/B test de asuntos para mejorar open rate

---

## 6. Metricas a monitorear

| Metrica | Objetivo | Benchmark email marketing |
|---------|----------|--------------------------|
| Open Rate | >25% | 20-25% (fitness) |
| Click Rate | >5% | 2-5% (fitness) |
| Unsubscribe Rate | <1% | <0.5% |
| App Downloads (via UTM) | >10% de clicks | - |

---

## 7. Resumen Brevo completo

| Lista | ID | Contactos | Campana |
|-------|-----|-----------|---------|
| Reactivacion Marzo 2026 | 6 | 29 | Campana 7 (enviada) |
| Espana Reactivacion Completa | 7 | 182 | - |
| LATAM - Mexico | 8 | 26 | Campana 8 (draft) |
| LATAM - Andinos PE+EC+CO | 9 | 20 | Campana 9 (draft) |
| LATAM - Cono Sur AR+CL+UY+otros | 10 | 16 | Campana 10 (draft) |

**Total contactos email marketing: ~273 activos**

---

*Generado automaticamente el 26 marzo 2026 por el agente de Email Marketing*
