# Template Email Outreach Circuitos Populares

Versión founder-to-founder authentic. Sustituye `{{PLACEHOLDERS}}` con datos del CSV.

---

## VERSIÓN A — Estándar (para circuitos provinciales/municipales con email institucional)

**Asunto**: Propuesta media partner · CorrerJuntos × {{NOMBRE_CIRCUITO}}

**Cuerpo**:

```
Hola,

Me llamo Abraham, soy el fundador de CorrerJuntos (correrjuntos.com), una app social
de running con base en Huelva. Os escribo porque he visto el {{NOMBRE_CIRCUITO}} en
{{COMUNIDAD}} y creo que tenemos una oportunidad de colaboración win-win.

QUÉ HACE CORRERJUNTOS

Somos una app gratuita que conecta runners por pace, zona y horario. Más de 600
runners ya activos en España. Hub editorial en correrjuntos.com con 88 visitas/día
y creciendo desde Google (datos GSC abril 2026).

QUÉ OS PROPONGO

1. Cobertura editorial gratuita del circuito en correrjuntos.com:
   - Una página dedicada al circuito {{NOMBRE_CIRCUITO}} con calendario completo,
     localización, distancias y enlace a vuestras inscripciones
   - Un artículo por prueba según se acerquen las fechas
   - Schema markup Event para que aparezcáis en Google con rich snippets

2. Integración en la app:
   - Vuestras pruebas visibles a los runners de {{COMUNIDAD}} dentro de CorrerJuntos
   - Los runners pueden formar grupos de entrenamiento previos a cada carrera
   - Distribución automática a la comunidad cercana

3. A cambio solo pido:
   - Un enlace desde vuestra web a la página dedicada en correrjuntos.com
   - Posibilidad de hacer foto/vídeo en las pruebas para nuestro contenido
   - Mención en redes cuando publiquemos sobre el circuito

NO os pido dinero, ni inscripciones gratis, ni acceso especial. Es media partnership
clásica: vosotros ganáis visibilidad SEO + audiencia de runners activos, nosotros
ganamos contenido auténtico y backlink local.

Si os interesa hablar 15 minutos por Zoom o teléfono, decidme cuándo os va bien.
Si no, sin problema, gracias por leer hasta aquí.

Un saludo,
Abraham
Fundador, CorrerJuntos
correrjuntos.com
hola@correrjuntos.com
```

---

## VERSIÓN B — Plataforma comercial (Sportmaniacs / Crono4Sports / Dorsalchip)

**Asunto**: CorrerJuntos × {{NOMBRE_CIRCUITO}} · audiencia compartida runners España

**Cuerpo**:

```
Hola,

Soy Abraham, fundador de CorrerJuntos (correrjuntos.com), app social de running
con +600 runners en España y blog que genera 88 visitas/día desde Google.

Os escribo desde un sitio diferente al de los circuitos públicos — vosotros sois
plataforma de inscripciones, nosotros plataforma de comunidad. Audiencias
complementarias.

PROPUESTA CONCRETA

1. Embed/link de vuestras pruebas en correrjuntos.com cuando coincidan con la
   geografía y nivel de nuestros runners
2. Cuando un runner se registra en una carrera vuestra, podemos sugerirle grupos
   de entrenamiento previos en CorrerJuntos
3. Cross-promo en redes en lanzamientos puntuales

A cambio: enlace desde vuestra web a la sección de comunidad de correrjuntos.com,
o integración de un widget de quedadas locales en vuestras páginas de evento.

¿Os encaja una llamada de 15 min para explorar?

Un saludo,
Abraham
Fundador, CorrerJuntos
correrjuntos.com · hola@correrjuntos.com
```

---

## VERSIÓN C — Federaciones (FAA, etc) más formal

**Asunto**: Solicitud colaboración informativa · CorrerJuntos · contenido oficial circuitos {{COMUNIDAD}}

**Cuerpo**:

```
Estimados,

Me dirijo a ustedes en representación de CorrerJuntos (correrjuntos.com), proyecto
de comunidad runner con base en Huelva y blog editorial sobre running con cobertura
de 88 visitas/día desde Google y +600 runners registrados en la app.

Estamos preparando contenido editorial sobre los circuitos provinciales de
atletismo en {{COMUNIDAD}} (foco running popular, no alta competición) para nuestra
audiencia. La idea es publicar guías por circuito explicando calendario, localidades
y distancias, con todos los enlaces oficiales hacia vuestras webs e inscripciones.

¿Podríais facilitarnos:
1. Calendario oficial 2026 confirmado del circuito provincial
2. Contacto del organizador en cada provincia (si distinto)
3. Cualquier material gráfico con autorización de uso editorial

A cambio, en cada artículo publicaremos enlaces directos a vuestra web oficial,
schema markup Event para Google, y mención de la federación como fuente.

Gracias por adelantado,

Abraham
Fundador, CorrerJuntos
correrjuntos.com · hola@correrjuntos.com
```

---

## NOTAS DE USO PARA EL AGENT

1. **Asignar versión por confianza_email del CSV**:
   - Tier 1 (verified) → Versión A o C según tipo
   - Tier 2 (inferred institucional) → Versión A o C
   - Tier 3 (web-form-only) → NO email automático, registrar para envío manual

2. **NO enviar a `web-form-only`** — el agent solo envía donde hay email confirmado o inferido razonable. Los formularios web los rellena Abraham manualmente.

3. **Personalización mínima obligatoria**:
   - {{NOMBRE_CIRCUITO}} sustituido literal
   - {{COMUNIDAD}} sustituido literal
   - Si patrocinadores en CSV → mencionarlos en cuerpo (versión A párrafo 2)
   - Si numero_pruebas conocido → mencionarlo

4. **Tono**: directo, transparente, founder-to-founder. NO B2B clásico ("estimados clientes potenciales"). NO growth hacking.

5. **Asunto**: corto, claro, identifica QUÉ es. NO clickbait.

6. **Cierre**: Abraham firma, NO empresa. Personal genera más respuesta.

7. **Si rebound (bounce)**: marcar en log como invalid_email, no reintentar.
