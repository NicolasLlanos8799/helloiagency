# Changelog

## [Unreleased]
### Added
- Sección "Nuestros productos" en `index.html` con cuatro tarjetas (FAQ, Pedidos, Turnos, Reservas) y demos de chat inline.
- Estilos específicos para la grilla de productos y la UI de chat en `css/styles+v2.css`.
- Lógica de demos conversacionales con sesiones persistentes y envío al webhook en `js/ia-products-demos.js`.

### Cómo probar las demos
1. Abrí `index.html` en el navegador y desplazate a la sección "Nuestros productos".
2. En cada tarjeta, hacé clic en "Probar demo" para desplegar el chat embebido.
3. Probá las chips rápidas o escribí un mensaje y presioná Enter o el botón "Enviar".
4. Verificá que cada módulo envía al webhook con su `module` correspondiente y usa el `session_id` persistente en localStorage.
