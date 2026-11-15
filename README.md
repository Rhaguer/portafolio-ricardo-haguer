# Ricardo Haguer · Portafolio 3D

Portafolio estático en español con un estadio de fútbol americano inspirado en Lambeau Field, construido con Three.js, cannon-es y Vite. La vista clásica ofrece los mismos 13 proyectos, perfil, metodología, contacto e impresión.

## Desarrollo

Requiere Node.js 22.12 o superior.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

GitHub Actions compila en `build/` y publica ese directorio en GitHub Pages desde `main`. La configuración `base: './'` permite servir las dos vistas bajo `/portafolio-ricardo-haguer/`. El sitio no requiere credenciales, servidor ni WebAssembly.

## Catálogo y controles

Las dos vistas usan `dist/projects.json`, el catálogo editorial preexistente. Conserva las categorías, el buscador, las fichas, sus URLs y el enlace de respaldo a GitHub. Las fichas se pueden leer públicamente. Sus repositorios requieren acceso autorizado. `python build_assets.py` regenera el JSON y las ilustraciones desde los datos editoriales.

- WASD o flechas: mover. Shift: sprint. Espacio: pase o interacción. Enter: abrir zona. Esc: cerrar panel.
- En móvil, usar el joystick y PASE / ABRIR. Las zonas también se pueden consultar desde el HUD.
- Nieve y sonido se controlan desde el HUD. El sonido empieza apagado. El movimiento reducido desactiva la nieve por defecto y acorta la celebración.

## Avatar externo opcional

Colocar el modelo autónomo en `public/models/packer-player.glb`. Debe mirar hacia +Z, con el origen a los pies. La clase `PlayerAvatar` adapta su altura y usa los clips Idle, Run, Sprint, Throw y Celebration cuando están disponibles. El avatar procedural está disponible sin el GLB.
