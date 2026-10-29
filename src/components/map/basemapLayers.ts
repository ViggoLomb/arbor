import type { Map } from 'maplibre-gl'
import { BASEMAP_PREFIX, createBasemapStyle, getBasemapMaxZoom } from '../../data/basemaps'
import type { BasemapId } from '../../data/basemaps'

// Cambiar solamente el fondo mantiene fuentes de árboles, eventos y encuadre.
export function setBasemap(map: Map, id: BasemapId, labels: boolean) {
  map.setMaxZoom(getBasemapMaxZoom(id))
  const current = map.getStyle().layers
  const firstOverlay = current.find(
    (layer) => !layer.id.startsWith(BASEMAP_PREFIX),
  )?.id
  for (const layer of current)
    if (layer.id.startsWith(BASEMAP_PREFIX)) map.removeLayer(layer.id)
  for (const layer of createBasemapStyle(id, labels).layers)
    map.addLayer(layer, firstOverlay)
  if (map.getLayer('imported-demo-raster'))
    map.setLayoutProperty(
      'imported-demo-raster',
      'visibility',
      id === 'satellite' ? 'visible' : 'none',
    )
}
