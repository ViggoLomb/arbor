import type { Map } from 'maplibre-gl'
import { demoImportedImage } from '../../data/demoImportedImage'
import { FIRST_DETECTION_LAYER_ID } from './detectionLayers'

const SOURCE_ID = 'imported-demo-image'
const LAYER_ID = 'imported-demo-raster'

export function showImportedImage(map: Map) {
  // Si la simulación termina antes de load, BaseMap vuelve a aplicar la selección al cargar.
  if (!map.getLayer(FIRST_DETECTION_LAYER_ID) || map.getLayer(LAYER_ID)) return

  map.addSource(SOURCE_ID, demoImportedImage)
  map.addLayer({
    id: LAYER_ID,
    type: 'raster',
    source: SOURCE_ID,
    paint: { 'raster-opacity': 1, 'raster-fade-duration': 0 },
  }, FIRST_DETECTION_LAYER_ID)
}
