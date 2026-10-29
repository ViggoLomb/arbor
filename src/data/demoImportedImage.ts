import type { ImageSourceSpecification } from 'maplibre-gl'
import imageUrl from '../../references/tandil/aerial.jpg'
import metadata from '../../references/tandil/aerial.extent.json'
export const demoImportedImage: ImageSourceSpecification = {
  type: 'image',
  url: imageUrl,
  coordinates: metadata.coordinates as ImageSourceSpecification['coordinates'],
}
