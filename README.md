# Portafolio profesional de Ricardo Haguer

Sitio estático reconstruido a partir de los 13 repositorios públicos de [Rhaguer](https://github.com/Rhaguer), revisados el 13 de noviembre de 2026.

## Ejecución local

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Abrir `http://127.0.0.1:8765`. No requiere instalación de dependencias ni compilación.

## Organización

- `dist/index.html`: presentación, perfil, navegación y contacto.
- `dist/styles.css`: diseño adaptable, accesibilidad y presentación para impresión.
- `dist/portfolio.js`: búsqueda, categorías, fichas de proyecto y copia del enlace público de GitHub.
- `dist/projects.json`: catálogo editorial.
- `dist/assets/`: trece ilustraciones vectoriales originales, una por repositorio.
- `build_assets.py`: fuente del catálogo y de las ilustraciones; ejecutar `python build_assets.py` tras editar los proyectos.

## Contenido y atribución

El nombre **Ricardo Haguer** fue confirmado por el usuario. La formación en INACAP Puente Alto y la práctica en Eknow se conservaron del portafolio anterior. No se añadieron títulos profesionales, empresas, recomendaciones ni resultados comerciales nuevos.

Las fichas se basan en los README y el código público. Distinguen aplicaciones, demostraciones y líneas de investigación. Las imágenes son ilustraciones conceptuales, no capturas de aplicaciones ejecutadas.

El repositorio `CINEMATICA` acredita su página a **Lorenzo Haguer Raggi**. Se mantiene esa atribución y no se presenta como autoría exclusiva de Ricardo. `RegistroEmpleados01` contiene modelos y vistas de estudiantes; el catálogo describe su código efectivo.

La investigación SeizureWatch se describe con su alcance experimental y sus límites, sin promesas clínicas. Las demostraciones de e-commerce no se presentan como plataformas de pago en producción.

## Mantenimiento

Al añadir o retirar repositorios públicos, actualizar `projects` en `build_assets.py`, volver a generar los recursos y corregir el total y fecha en `dist/index.html`. Comprobar la búsqueda y las categorías antes de publicar.

La impresión se abre desde el navegador y utiliza una hoja de estilos propia. No se simula una descarga de currículum ni se incluye un correo o teléfono no confirmado.

## Verificación realizada

- Trece repositorios únicos incluidos, contrastados con la API pública de GitHub.
- Recursos estáticos disponibles por HTTP y sintaxis JavaScript comprobada.
- Filtros, búsqueda por tecnología, estado sin resultados, reinicio y diálogo de detalle probados en navegador.
- Revisión visual a 1280 px y 390 px, sin desbordamiento horizontal.
