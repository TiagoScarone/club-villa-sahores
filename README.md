# Club Villa Sahores

Homepage del Club Social y Deportivo Villa Sahores. Sitio estático: HTML, CSS y JS, sin build.

- `index.html`: contenido
- `css/styles.css`: estilos
- `js/main.js`: menú, fotos del hero, carrusel por espacios, cintas infinitas, copiar alias y CBU, video de Sahores Stream
- `assets/escudo-192.png` / `assets/escudo-512.png`: escudo del club con fondo transparente (también se usa como favicon)
- `assets/fonts/`: Bricolage Grotesque (títulos) y Figtree (texto), licencia SIL Open Font License
- `scripts/descargar-imagenes.sh`: baja las imágenes que hoy se cargan desde el sitio actual a `assets/img/` y reescribe las rutas

## Agregar fotos al carrusel "Así está Sahores hoy"

Cada foto es un `<figure class="slide" data-space="...">`. Los botones de espacios
(Todos, Frente y entrada, Sahores Fitness, etc.) se arman solos a partir de `data-space`:
para sumar un espacio nuevo, agregá fotos con otro valor de `data-space`.
