# Madrid outreach kit · running clubs

Kit para contactar con 20 running clubs de Madrid y cerrar 2-3 como "Clubs
oficiales" en CorrerJuntos. Meta: tracción real (runners activos) en vez de
descargas dispersas.

---

## Archivos

```
madrid-outreach/
├── README.md                      ← este archivo
├── running-clubs-madrid.csv       ← tu base de datos de clubs
├── email-templates.md             ← 3 plantillas + ejemplos de personalización
├── personalize-emails.cjs         ← genera 20 .txt listos para pegar en Gmail
└── outbox/                        ← se crea automático al correr el script
    ├── _INDEX.txt                 ← lista de todos los emails generados
    └── {slug}.txt                 ← un archivo por club
```

---

## Flujo de 2 horas

### Hora 1 · Research + fill CSV
1. Abre `running-clubs-madrid.csv` en Google Sheets
   - En Google Drive → `New → File Upload → running-clubs-madrid.csv`
   - O: Sheets → `File → Import → Upload`
2. Las 10 primeras filas tienen clubs pre-rellenados (con `⚠ verificar` en el
   campo `ultimo_evento_verificado` porque yo no puedo confirmar si siguen
   activos ahora mismo)
3. Las 10 últimas filas están vacías con guía en `notas` de dónde buscar
4. Para cada club:
   - Verifica IG activo (post en últimos 30 días)
   - Saca el email real del club (web, IG bio, DM)
   - Rellena `email_contacto`
   - Afina `personalization_hook` con algo real (su última quedada, ruta, coach)

### Hora 2 · Generar + enviar
1. Exporta la hoja modificada: `File → Download → CSV` y sobreescribe el
   archivo original
2. Corre el script:
   ```bash
   cd tools/marketing/madrid-outreach
   node personalize-emails.cjs --sender="Tu Nombre" --phone="+34 600 000 000"
   ```
3. Se genera `outbox/` con 20 `.txt`. Cada uno tiene: destinatario, asunto,
   cuerpo personalizado + tus notas internas al pie
4. Abre cada `.txt` → copia-pega a Gmail (cambia `[nombre del organizador]`
   si tienes el nombre concreto)
5. Usa Gmail → "Schedule send" → lunes 10:00 para máxima tasa de apertura
6. Renombra los enviados: `madrid-runners.txt` → `__SENT-madrid-runners.txt`
   (así el `_INDEX` lista solo los pendientes la siguiente vez)

---

## Expectativas realistas (promedios outreach B2B en España)

| Métrica | Rango normal |
|---|---|
| Open rate | 40-55% |
| Reply rate primer email | 10-20% |
| Follow-up converte adicional | +5-8% |
| Reuniones cerradas de 20 emails | 3-5 |
| Clubs que dicen "vamos a probarlo" | 1-2 |

**Si mandas 20 emails personalizados bien** → 1 club activo en CorrerJuntos
con su próxima quedada abierta en la app antes de 2 semanas.

Eso es **50-200 nuevos runners en Madrid en 30 días** con cero spend
publicitario. Es el ROI más alto que puedes conseguir ahora mismo.

---

## Reglas duras para que esto funcione

1. **Personalización no negociable.** Un email con `{HOOK}` genérico es spam,
   acaba en la carpeta de spam y te quema el dominio. Cambia el primer
   párrafo para cada club.
2. **No attaches** en el primer mensaje. PDF, deck, loom — todo para el
   segundo email cuando ya respondieron.
3. **No prometas métricas.** Nada de "100 socios nuevos" ni "triplicamos
   vuestros inscritos". No lo sabes y se nota.
4. **Una ventana de envío:** lunes-miércoles 9-11h o 19-21h. Fuera de eso
   open rate baja 30%.
5. **Máx 2 follow-ups.** Después del tercer mensaje sin respuesta, déjalo.
   Vuelve en 3 meses si el producto ha evolucionado mucho.

---

## Qué hacer cuando un club diga "sí, probamos"

Plan de onboarding manual (primera fase — sin construir features nuevos):

1. **Call 20 min** — les enseñas cómo crear quedada + inscribirse + chat
2. **Les ayudas a publicar SU primera quedada abierta** dentro de la app
   (hazlo tú con su data para que vean el resultado)
3. **Les das un QR propio** → imprimen flyer que reparten en su run
4. **Compartes el post en tu IG @correrjuntosapp** mencionando al club —
   les das visibilidad cruzada
5. **Les envías data semanal** los primeros 30 días: "Esta semana 12 runners
   externos se inscribieron a tu quedada. 3 volvieron a la siguiente."

Después del mes: pregunta si les vale la pena. Si sí → piden el tier Pro
(19€/mes) con analytics dedicadas. Si no → agradeces y pivot.

---

## Troubleshooting

**"El script no corre."**
Verifica Node instalado: `node --version`. El script es puro Node estándar,
sin deps npm.

**"Se me ha olvidado el sender/phone, ¿puedo re-generar sin perder edits?"**
Sí, es idempotente — re-escribe los .txt. Pero si ya renombraste algunos a
`__SENT-` quedan intactos.

**"Gmail me marca mi propio email como spam."**
Estás mandando desde `correrjuntosapp@gmail.com` → warm-up natural si nunca
has mandado emails en volumen. Empieza con 5 el primer día, 10 el segundo,
escala. No mandes los 20 de golpe el primer día.
