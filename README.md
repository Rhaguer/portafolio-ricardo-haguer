# Ricardo Haguer · Portafolio 3D

Portafolio estático en español con un estadio de fútbol americano inspirado en Lambeau Field, construido con Three.js y Vite, con WebGPU cuando está disponible y WebGL 2 como respaldo. La vista clásica ofrece los mismos 13 proyectos, perfil, metodología, contacto e impresión.

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

- Proyectos abre el catálogo desde la portada o la cancha. Cada ficha admite un enlace compartible con el fragmento `#proyecto/<repositorio>`.
- WASD, flechas o joystick para moverse. Arrastrar para girar la cámara. Enter abre un destino. Esc cierra los paneles.
- En Recorrido libre se pueden abrir proyectos y cruzar a pie el túnel al camarín. Contacto lleva a la entrada del túnel desde la cancha. En la vista clásica abre el contacto directamente.
- Activa Jugada rápida en el menú para lanzar con Espacio y esquivar a los defensores. El sonido y la nieve empiezan apagados. La calidad gráfica se ajusta automáticamente.

## Avatar externo opcional

Colocar el modelo autónomo en `public/models/packer-player.glb`. Debe mirar hacia +Z, con el origen a los pies. La clase `PlayerAvatar` adapta su altura y usa los clips Idle, Run, Sprint, Throw y Celebration cuando están disponibles. El avatar procedural está disponible sin el GLB.
