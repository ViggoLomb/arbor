import type { ImageSourceSpecification } from 'maplibre-gl'
import imageUrl from '../assets/demo-orthomosaic.jpg'

// Imagen de ejemplo de Buenos Aires, no corresponde al archivo soltado por el usuario.
// Fuente: Esri World Imagery. La importación y sus metadatos son simulados.
export const demoImportedImage: ImageSourceSpecification = {
  type: 'image',
  url: imageUrl,
  coordinates: [
    [-58.407, -34.59399796385374],
    [-58.393, -34.59399796385374],
    [-58.393, -34.60600203585204],
    [-58.407, -34.60600203585204],
  ],
}
