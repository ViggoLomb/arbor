import type { Map } from 'maplibre-gl'
import { mockDetections } from '../../data/mockData'

const SOURCE_ID = 'yolo-detections'
export const FIRST_DETECTION_LAYER_ID = 'yolo-clusters'
export const TREE_POINTS_LAYER_ID = 'yolo-points'
const LAYER_IDS = [FIRST_DETECTION_LAYER_ID, 'yolo-cluster-count', TREE_POINTS_LAYER_ID] as const

export function addDetectionLayers(map: Map, visible: boolean) {
  const visibility = visible ? 'visible' : 'none'

  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: mockDetections,
    cluster: true,
    clusterRadius: 50,
    clusterMaxZoom: 16,
  })

  map.addLayer({
    id: LAYER_IDS[0],
    type: 'circle',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    layout: { visibility },
    paint: {
      'circle-color': '#1e293b',
      'circle-radius': ['step', ['get', 'point_count'], 18, 10, 22, 25, 27],
    },
  })

  // MapLibre requiere una capa symbol separada para dibujar texto sobre círculos.
  map.addLayer({
    id: LAYER_IDS[1],
    type: 'symbol',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    layout: {
      visibility,
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': ['Open Sans Bold'],
      'text-size': 12,
      'text-allow-overlap': true,
      'text-ignore-placement': true,
    },
    paint: { 'text-color': '#ffffff' },
  })

  map.addLayer({
    id: LAYER_IDS[2],
    type: 'circle',
    source: SOURCE_ID,
    filter: ['!', ['has', 'point_count']],
    layout: { visibility },
    paint: {
      'circle-radius': 8,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
      // El estado es categórico: match asigna un color a cada valor.
      'circle-color': [
        'match', ['get', 'estado_sanitario'],
        'Bueno', '#10b981',
        'Regular', '#f59e0b',
        'Malo', '#f43f5e',
        '#64748b',
      ],
    },
  })
}

export function setDetectionsVisible(map: Map, visible: boolean) {
  if (!visible) map.getCanvas().style.cursor = ''
  for (const id of LAYER_IDS) {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
    }
  }
}
