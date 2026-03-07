# helloiagency

## Cómo hacer que funcione `/portfolio` sin `portfolio.html`

Tu sitio ya tiene ruteo SPA en `index.html`, así que el problema normal es el **servidor**:
cuando entrás directo a `https://helloiagency.com/portfolio`, el hosting intenta buscar un archivo físico `/portfolio` y da 404.

La solución es configurar un **rewrite/fallback** para que **todas las rutas** sirvan `index.html`.

### Vercel
Este repo incluye `vercel.json` con rewrite global a `index.html`.

### Netlify
Este repo incluye `netlify.toml` con redirect 200 (SPA fallback) a `index.html`.

### Si usás otro servidor (Nginx/Apache)
Tenés que configurar lo mismo: cualquier ruta desconocida debe devolver `index.html`.

### Apache / cPanel
Este repo también incluye `.htaccess` con fallback SPA listo para usar (sin tocar configuración manual del panel).

Ejemplo Nginx:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

Con eso:
- `helloiagency.com/` muestra Home
- `helloiagency.com/portfolio` muestra Portfolio (simulado por JS, sin archivo HTML extra)
- back/forward del navegador funciona con `history.pushState`
