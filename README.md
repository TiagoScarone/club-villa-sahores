# Club Villa Sahores

Homepage del Club Social y Deportivo Villa Sahores. Sitio estático: HTML, CSS y JS, sin build.

- `index.html`: homepage
- `natacion.html`, `voleibol.html`, `basquetbol.html`, `futbol.html`, `fitness.html`: páginas de actividades (horarios, aranceles, contacto y video)
- `vercel.json`: `cleanUrls` para que las páginas se vean como `/natacion` y `/voleibol`
- `css/styles.css`: estilos
- `js/main.js`: menú, escudo-moneda 3D del hero, galería por espacios, cintas infinitas, videos, copiar alias y CBU

El sitio es solo oscuro. Natación usa una variante azul de la misma paleta (clase `sport--pool`).
- `assets/escudo-192.png` / `assets/escudo-512.png`: escudo del club con fondo transparente (también se usa como favicon)
- `assets/fonts/`: Bricolage Grotesque (títulos) y Figtree (texto), licencia SIL Open Font License
- `scripts/descargar-imagenes.sh`: baja las imágenes que hoy se cargan desde el sitio actual a `assets/img/` y reescribe las rutas

## Fotos de "Así está Sahores hoy"

Están en el JSON `<script type="application/json" id="gal-data">` al final de esa sección de `index.html`.
Cada espacio tiene `name`, `icon` (front, pool, court, gym3, gym4, fitness, salon, grill) y su lista de `photos`
con el `id` del archivo en Wix y un `alt`. Para sumar un espacio o una foto, editá ese JSON.

## Páginas de actividades

Cada página tiene la cabecera y el footer copiados de `index.html`. El header de cada deporte usa
el ícono de la actividad; solo Natación tiene foto de fondo.
