#!/usr/bin/env bash
# Baja a assets/img/ todas las imágenes que hoy se cargan desde el CDN de Wix
# y reescribe index.html y css/styles.css para que usen las copias locales.
# Correr una vez desde la raíz del proyecto:  bash scripts/descargar-imagenes.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/img
grep -ohE 'https://static\.wixstatic\.com/media/[^")]+' index.html css/styles.css | sort -u | while read -r url; do
  file="assets/img/$(basename "$url" | sed 's/~mv2//')"
  echo "Descargando $file"
  curl -fsSL "$url" -o "$file"
  sed -i.bak "s#$url#$file#g" index.html
  sed -i.bak "s#$url#../$file#g" css/styles.css
done
rm -f index.html.bak css/styles.css.bak
echo "Listo."
