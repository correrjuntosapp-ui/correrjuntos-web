# CorrerJuntos — Estrategia de Email Marketing

## Resumen

Campanas de email para activar, retener y hacer crecer la base de usuarios de CorrerJuntos. Todos los templates estan listos para copiar en cualquier plataforma (Brevo, Mailchimp, Resend, SendGrid, etc.).

---

## 1. Flujos de Email (Automations)

### Flujo 1: Bienvenida (Welcome Sequence)
**Trigger:** Usuario se registra
**Objetivo:** Activar al usuario (que asista a su primera quedada)

| Email | Cuando | Asunto | Objetivo |
|-------|--------|--------|----------|
| W1 | Inmediato | Bienvenido a CorrerJuntos - tu grupo te espera | Confirmar registro + primer CTA |
| W2 | Dia 2 | Hay [X] quedadas esta semana cerca de ti | Mostrar valor inmediato |
| W3 | Dia 5 | 3 consejos para tu primera quedada | Reducir friccion/nervios |
| W4 | Dia 10 | ¿Todavia no has corrido con nosotros? | Urgencia suave |

### Flujo 2: Reactivacion (Win-back)
**Trigger:** Usuario no abre la app en 14 dias
**Objetivo:** Traer de vuelta al usuario inactivo

| Email | Cuando | Asunto | Objetivo |
|-------|--------|--------|----------|
| R1 | Dia 14 inactivo | Te echamos de menos en la carrera | Recordatorio emocional |
| R2 | Dia 21 inactivo | Hay [X] runners nuevos en tu ciudad | FOMO social |
| R3 | Dia 30 inactivo | ¿Dejamos de escribirte? | Ultimo intento + opcion de unsub |

### Flujo 3: Post-Primera-Quedada
**Trigger:** Usuario asiste a su primera quedada
**Objetivo:** Convertir en usuario recurrente

| Email | Cuando | Asunto | Objetivo |
|-------|--------|--------|----------|
| P1 | 1h despues | ¡Lo hiciste! Tu primera quedada con CorrerJuntos | Celebrar + pedir feedback |
| P2 | Dia 3 | La proxima quedada en [ciudad] es el [dia] | Crear habito (segunda quedada) |
| P3 | Dia 7 | Invita a un amigo — correis gratis juntos | Activar referidos |

### Flujo 4: Referidos
**Trigger:** Usuario invita a alguien / alguien se registra con su codigo
**Objetivo:** Potenciar el crecimiento viral

| Email | Cuando | Asunto | Objetivo |
|-------|--------|--------|----------|
| REF1 | Al invitar | Tu enlace esta listo — comparte y gana | Confirmar + motivar a compartir |
| REF2 | Alguien se registra | ¡[Nombre] se unio gracias a ti! | Dopamina + motivar mas invitaciones |
| REF3 | 3 referidos | Desbloqueaste el badge Community Builder | Celebrar hito |

### Flujo 5: Digest Semanal
**Trigger:** Todos los lunes a las 8:00 AM (hora local)
**Objetivo:** Mantener engagement y trafico recurrente

| Email | Frecuencia | Asunto | Contenido |
|-------|-----------|--------|-----------|
| D1 | Semanal | Esta semana en [Ciudad]: [X] quedadas | Quedadas de la semana + tip + blog post |

---

## 2. Segmentos de Usuarios

| Segmento | Criterio | Emails que recibe |
|----------|----------|-------------------|
| Nuevo | Registro < 7 dias | Welcome sequence |
| Activo | Asistio a quedada < 14 dias | Digest semanal, Post-quedada |
| Dormido | No abre app 14-30 dias | Reactivacion |
| Perdido | No abre app > 30 dias | Win-back final |
| Referidor | Ha invitado a 1+ persona | Flujo referidos |
| Organizador | Ha creado 1+ quedada | Digest + tips para organizadores |

---

## 3. Templates de Email (Listos para Usar)

---

### EMAIL W1: Bienvenida

**Asunto:** Bienvenido a CorrerJuntos — tu grupo te espera
**Preview:** Encuentra runners cerca de ti. Es gratis.

```
¡Hola [nombre]!

Bienvenido a CorrerJuntos. Acabas de unirte a una comunidad de runners
que creen en algo simple: correr es mejor en compania.

¿Que puedes hacer ahora?

1. Busca quedadas en tu ciudad
   Hay grupos para todos los niveles: principiante, intermedio y avanzado.

2. Unete a una quedada
   Elige la que encaje con tu horario y ritmo. Es gratis.

3. Corre y repite
   Despues de tu primera quedada, no querras parar.

[BOTON: Ver quedadas en mi ciudad]
(enlace a correrjuntos.com)

¿Tienes dudas? Responde a este email y te ayudamos.

Un saludo,
El equipo de CorrerJuntos

---
CorrerJuntos | correrjuntos.com
Darse de baja: [link unsub]
```

---

### EMAIL W2: Quedadas Esta Semana

**Asunto:** Hay [X] quedadas esta semana en [ciudad]
**Preview:** Martes, jueves y sabado — todos los niveles.
**Enviar:** Dia 2 despues del registro

```
¡Hola [nombre]!

Esta semana hay [X] quedadas de running en [ciudad].
Aqui tienes algunas que encajan contigo:

---------------------------------------------
[Dia] [hora] — [lugar]
[distancia] km · Nivel: [nivel]
[X] runners apuntados
[BOTON: Apuntarme]
---------------------------------------------

[Dia] [hora] — [lugar]
[distancia] km · Nivel: [nivel]
[X] runners apuntados
[BOTON: Apuntarme]
---------------------------------------------

[Dia] [hora] — [lugar]
[distancia] km · Nivel: [nivel]
[X] runners apuntados
[BOTON: Apuntarme]
---------------------------------------------

No necesitas ser rapido. Solo necesitas aparecer.
El grupo hace el resto.

[BOTON: Ver todas las quedadas]

Un saludo,
El equipo de CorrerJuntos
```

---

### EMAIL W3: Consejos Primera Quedada

**Asunto:** 3 consejos para tu primera quedada (no te preocupes)
**Preview:** Todo el mundo fue nuevo alguna vez.
**Enviar:** Dia 5

```
¡Hola [nombre]!

¿Todavia no te has animado a ir a una quedada?
Es normal. Todos nos sentimos asi la primera vez.

Aqui van 3 cosas que nos habria gustado saber antes
de nuestra primera quedada:

1. No hace falta ser rapido
   Hay gente de todos los niveles. Nadie te juzga
   por tu ritmo. Ve a tu paso y disfruta.

2. Llegaras nervioso, te iras sonriendo
   La mayoria de runners recuerdan su primera
   quedada como el dia que "se engancharon".

3. La gente es increible
   Los grupos de running son de las comunidades
   mas acogedoras que existen. Te van a recibir
   como si te conocieran de siempre.

¿Nuestro consejo? No lo pienses mas. Elige una quedada
y presentate. Lo peor que puede pasar es que hagas
amigos nuevos.

[BOTON: Buscar mi primera quedada]

Lee mas: Guia para empezar a correr desde cero
(enlace a /blog/empezar-a-correr-guia-principiantes.html)

Un saludo,
El equipo de CorrerJuntos
```

---

### EMAIL W4: Recordatorio Suave

**Asunto:** ¿Todavia no has corrido con nosotros?
**Preview:** Tu grupo te esta esperando.
**Enviar:** Dia 10

```
¡Hola [nombre]!

Hace 10 dias que te registraste en CorrerJuntos
y todavia no has asistido a una quedada.

Sin presion. Pero queremos que sepas que hay
[X] runners en [ciudad] que estarian encantados
de correr contigo.

Esta semana hay quedadas:
- [Dia] a las [hora] en [lugar]
- [Dia] a las [hora] en [lugar]

Solo tienes que aparecer. El primer paso es el
mas dificil. El segundo ya es inercia.

[BOTON: Ver quedadas esta semana]

Si tienes alguna pregunta o necesitas ayuda,
responde a este email. Estamos aqui.

Un saludo,
El equipo de CorrerJuntos
```

---

### EMAIL R1: Te Echamos de Menos

**Asunto:** Te echamos de menos en la carrera
**Preview:** [Ciudad] sigue corriendo. ¿Te unes?
**Enviar:** 14 dias inactivo

```
¡Hola [nombre]!

Hace un tiempo que no te vemos por CorrerJuntos.
¿Todo bien?

Mientras tanto, en [ciudad]:
- [X] runners nuevos se han unido
- [X] quedadas se han celebrado
- [X] kilometros se han corrido juntos

Tu grupo sigue ahi. Y hay quedadas esta semana
que encajan contigo.

[BOTON: Volver a correr]

¿Ya no quieres recibir estos emails?
Darse de baja: [link]

Un saludo,
El equipo de CorrerJuntos
```

---

### EMAIL R2: FOMO Social

**Asunto:** [X] runners nuevos en [ciudad] esta semana
**Preview:** La comunidad crece. No te quedes fuera.
**Enviar:** 21 dias inactivo

```
¡Hola [nombre]!

La comunidad de running en [ciudad] no para de crecer.

Solo esta semana:
- [X] personas nuevas se han unido
- [X] quedadas organizadas
- La quedada mas popular: [lugar] el [dia] con [X] runners

Hay gente nueva que todavia no conoces.
Y quedadas que no te puedes perder.

[BOTON: Ver que me he perdido]

Un saludo,
El equipo de CorrerJuntos
```

---

### EMAIL R3: Ultimo Intento

**Asunto:** ¿Dejamos de escribirte?
**Preview:** Sin rencores. Pero antes de irte...
**Enviar:** 30 dias inactivo

```
¡Hola [nombre]!

Llevamos un mes sin verte y no queremos ser pesados.

Si ya no te interesa CorrerJuntos, lo entendemos.
Puedes darte de baja aqui: [link unsub]

Pero si simplemente se te ha pasado el tiempo...
tu grupo sigue ahi. Y siempre hay sitio para ti.

[BOTON: Quiero seguir — ver quedadas]
[LINK: Darme de baja]

Pase lo que pase, gracias por haber sido parte
de la comunidad. Y si algun dia quieres volver,
aqui estaremos.

Un saludo,
El equipo de CorrerJuntos
```

---

### EMAIL P1: Post-Primera-Quedada

**Asunto:** ¡Lo hiciste! Tu primera quedada con CorrerJuntos
**Preview:** Bienvenido al club. Esto solo acaba de empezar.
**Enviar:** 1 hora despues de la quedada

```
¡Hola [nombre]!

¡Lo has hecho! Has completado tu primera quedada
con CorrerJuntos. Bienvenido al club.

¿Como te ha ido? Nos encantaria saberlo.
(Responde a este email o dejanos una valoracion)

[BOTON: ¡Me ha encantado!]
[BOTON: Bien, pero tengo sugerencias]
[BOTON: No ha sido lo mio]

Dato: el 80% de runners que van a una segunda
quedada se convierten en habituales.

¿Repetimos?

[BOTON: Ver proximas quedadas]

Un saludo,
El equipo de CorrerJuntos
```

---

### EMAIL P3: Invita a un Amigo

**Asunto:** Invita a un amigo — correis gratis juntos
**Preview:** Compartir es mejor. Y tiene premio.
**Enviar:** 7 dias despues de primera quedada

```
¡Hola [nombre]!

Ya sabes lo que se siente al correr en grupo.
¿Conoces a alguien que tambien lo necesite?

Comparte tu enlace personal y cuando tu amigo
se registre, ambos ganais:

Tu enlace: correrjuntos.com?ref=[CODIGO]

Recompensas:
- 3 amigos invitados → Badge "Community Builder"
- 5 amigos invitados → 1 mes Premium gratis
- 10 amigos invitados → Badge "Ambassador"

[BOTON: Copiar mi enlace]
[BOTON: Compartir por WhatsApp]

La mejor publicidad es la de un amigo.
Gracias por ayudarnos a crecer.

Un saludo,
El equipo de CorrerJuntos
```

---

### EMAIL D1: Digest Semanal

**Asunto:** Esta semana en [Ciudad]: [X] quedadas te esperan
**Preview:** Lunes, miercoles, sabado... ¿a cual vienes?
**Enviar:** Lunes 8:00 AM

```
¡Hola [nombre]!

Tu resumen semanal de running en [ciudad]:

QUEDADAS DE LA SEMANA
---------------------------------------------
[Dia] [hora] — [lugar]
[distancia] km · [nivel] · [X] apuntados
[BOTON: Me apunto]
---------------------------------------------
[Dia] [hora] — [lugar]
[distancia] km · [nivel] · [X] apuntados
[BOTON: Me apunto]
---------------------------------------------
[Dia] [hora] — [lugar]
[distancia] km · [nivel] · [X] apuntados
[BOTON: Me apunto]
---------------------------------------------

[Ver todas las quedadas →]

TIP DE LA SEMANA
[Titulo del tip — 2-3 lineas de consejo practico]

DEL BLOG
[Titulo del articulo] — [1 linea de descripcion]
[Leer articulo →]

¡Buen running esta semana!

El equipo de CorrerJuntos
```

---

### EMAIL REF2: Alguien se Unio

**Asunto:** ¡[Nombre] se unio a CorrerJuntos gracias a ti!
**Preview:** Tu invitacion funciono. Sigue asi.
**Enviar:** Inmediato cuando el referido se registra

```
¡Hola [nombre]!

¡Buenas noticias! [Nombre del referido] acaba de
registrarse en CorrerJuntos gracias a tu invitacion.

Tu contador de referidos: [X] / [siguiente hito]
[Barra de progreso visual]

Siguiente recompensa:
[Descripcion de la siguiente recompensa]

Sigue compartiendo tu enlace:
correrjuntos.com?ref=[CODIGO]

[BOTON: Invitar a mas amigos]

Gracias por hacer crecer la comunidad.

Un saludo,
El equipo de CorrerJuntos
```

---

## 4. Metricas y KPIs

### Objetivos por Flujo

| Flujo | Metrica clave | Objetivo |
|-------|--------------|----------|
| Welcome | Tasa de apertura | >50% |
| Welcome | Click-through rate | >15% |
| Welcome | Asistencia a primera quedada (30 dias) | >20% |
| Reactivacion | Tasa de reactivacion | >10% |
| Post-Quedada | Asistencia a segunda quedada | >50% |
| Referidos | Invitaciones enviadas por usuario | >2 |
| Digest | Tasa de apertura semanal | >35% |
| Digest | Clicks a quedadas | >10% |
| Global | Tasa de unsub | <1% por email |

### Metricas a Trackear

- **Deliverability rate** (>95%)
- **Open rate** por email y por segmento
- **Click-through rate** por email
- **Conversion rate** (click → accion)
- **Unsubscribe rate** por email
- **Revenue attribution** (referidos → registros)

---

## 5. Recomendacion de Herramienta

### Para Empezar (Gratis)

**Brevo (antes Sendinblue)** — Recomendado
- Plan gratis: 300 emails/dia (9.000/mes)
- Automations incluidas en plan gratis
- Segmentacion avanzada
- API + integracion con Supabase posible
- Servidor SMTP incluido

**Alternativa: Mailchimp**
- Plan gratis: 500 contactos, 1.000 emails/mes
- Mas limitado en automations gratis
- Buena interfaz visual

### Para Escalar (Cuando Crezcas)

**Resend + React Email**
- Pago por uso ($0.80/1000 emails)
- API moderna, facil integracion con Supabase Edge Functions
- Templates en React (codigo, no drag-and-drop)
- Ideal para developers

---

## 6. Checklist de Implementacion

- [ ] Elegir herramienta de email (Brevo recomendado para empezar)
- [ ] Crear cuenta y verificar dominio (correrjuntos.com)
- [ ] Configurar SPF, DKIM y DMARC en DNS
- [ ] Importar lista de usuarios desde Supabase
- [ ] Crear segmentos (nuevo, activo, dormido, perdido)
- [ ] Configurar flujo Welcome (4 emails)
- [ ] Configurar flujo Reactivacion (3 emails)
- [ ] Configurar flujo Post-Quedada (3 emails)
- [ ] Crear template del Digest semanal
- [ ] Conectar triggers desde la app (registro, asistencia, inactividad)
- [ ] Probar todos los flujos con email de test
- [ ] Lanzar Welcome sequence para nuevos registros
- [ ] Lanzar Digest semanal
- [ ] Monitorear metricas la primera semana
