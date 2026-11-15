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
- Proyectos y mapa abre las fichas de LIM Chile, Balanza y SeizureWatch o guía hacia sus estaciones.
- Activa Jugada rápida para lanzar con Espacio o con el botón de pase y esquivar a los defensores en un 4 contra 4. Usa Q o Receptor para cambiar el destinatario. Después de un tackle, Siguiente jugada reanuda desde el punto de detención. Tras la recepción, el control y la cámara siguen al portador. Cruza una línea de gol con el balón para anotar 6. En rango, usa K o Patear para activar la mira y vuelve a pulsar al centrarla. Un gol de campo suma 3. Después de un touchdown puedes patear por 1, intentar otro cruce por 2 o seguir jugando. Puedes abrir voluntariamente los proyectos del sector desde el resultado del touchdown. La cámara se acerca temporalmente cuando el túnel, el camarín o la estructura del estadio limitan su distancia. El sonido y la nieve empiezan apagados. La calidad gráfica se ajusta automáticamente.

## Avatar externo opcional

Colocar el modelo autónomo en `public/models/packer-player.glb`. Debe mirar hacia +Z, con el origen a los pies. La clase `PlayerAvatar` adapta su altura y usa los clips Idle, Run, Sprint, Throw y Celebration cuando están disponibles. El avatar procedural está disponible sin el GLB.
