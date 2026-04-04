# Post Nike Vomero 18 Review — 25 marzo 2026

## Estado publicacion

| Canal | Estado | Nota |
|-------|--------|------|
| Canva design | CREADO | Exportado PNG 1080x1080 |
| Buffer API | FALLO | v1 REST devuelve 500, GraphQL (graph.bufferapp.com) no resuelve DNS |
| Instagram | PENDIENTE | Publicar manualmente con el diseno + caption de abajo |
| Twitter/X | PENDIENTE | Publicar manualmente |
| TikTok | PENDIENTE | Usar reel/posts-hoy.md |

## Diseno Canva

- **Titulo**: Post de Instagram - 281g de pura nube
- **Design ID**: DAHE9FfpIhY
- **Editar**: https://www.canva.com/d/5TjtDgDqjx351Er
- **Ver**: https://www.canva.com/d/5gE0vNNgnNm8Mmb
- **PNG exportado**: https://export-download.canva.com/fpIhY/DAHE9FfpIhY/-1/0/0001-9125916773954749026.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20260324%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260324T181014Z&X-Amz-Expires=72200&X-Amz-Signature=4f4f1592250d88a713cc5c2d996cde3c6c9accf9379527552d225e0b8e6221bd&X-Amz-SignedHeaders=host%3Bx-amz-expected-bucket-owner&response-expires=Wed%2C%2025%20Mar%202026%2014%3A13%3A34%20GMT
  - Nota: URL temporal, expira en ~20h. Descargar o re-exportar si expira.

## Caption Instagram (copiar y pegar)

```
281 gramos de pura comodidad. Hemos probado las Nike Vomero 18 durante 300 km y esto es lo que pensamos.

La nueva mediasuela ZoomX de doble densidad cambia las reglas: amortiguacion de Hoka con el rebote de Nike. La version 18 es, sin duda, la mejor Vomero que Nike ha hecho jamas.

Para quien: rodajes largos, corredores de +75 kg, y cualquiera que priorice proteger sus articulaciones sin renunciar al rendimiento.

700-900 km de durabilidad estimada. 159,99 EUR. Eso son muchos domingos de tirada larga.

Y tu, team Nike o team Hoka? Cuentanoslo abajo.

Link en bio -> correrjuntos.com/blog/nike-vomero-18-review

#running #correr #correrjuntos #nikerunning #nikevomero18 #zapatillasrunning #runners #runningcommunity #runningreview #zapatillas2026 #entrenamientoRunning #correrEsSalud #runningTips #runnersOfInstagram #comunidadRunner
```

## Tweet (copiar y pegar, 277 chars)

```
Las Nike Vomero 18 son la mejor zapatilla de rodaje que ha hecho Nike. 300 km de test, ZoomX de doble densidad y 700+ km de durabilidad.

Review completa:
correrjuntos.com/blog/nike-vomero-18-review

#NikeRunning #Vomero18 #running
```

## Buffer API — Diagnostico

- `graph.bufferapp.com`: DNS NXDOMAIN (dominio no existe)
- `api.bufferapp.com/1/user.json?access_token=...`: HTTP 500
- `api.bufferapp.com/1/user.json` + `Authorization: Bearer`: HTTP 500
- `api.bufferapp.com/1/user.json` + `X-Access-Token`: HTTP 401

**Conclusion**: La API v1 de Buffer esta devolviendo errores de servidor (500). El endpoint GraphQL que teniamos documentado ya no existe. Es probable que Buffer haya migrado a una nueva API o que el token necesite regenerarse desde el dashboard de Buffer.

**Accion requerida**:
1. Entrar en buffer.com/manage → Settings → API → verificar token
2. Comprobar si hay nueva documentacion de API en buffer.com/developers
3. Actualizar el token en .env si es necesario
4. Mientras tanto, publicar manualmente usando el diseno Canva + caption de arriba
