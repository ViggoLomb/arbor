import type { GeoJSONSource, Map } from 'maplibre-gl'
import { treesGeoJSON } from '../../data/trees'
import type { CampaignFilter } from '../../types/tree'
export const TREE_SOURCE = 'agrotech-trees'
export const TREE_POINTS_LAYER_ID = 'tree-points'
export const FIRST_DETECTION_LAYER_ID = 'tree-clusters'
const layers = [
  FIRST_DETECTION_LAYER_ID,
  'tree-cluster-count',
  TREE_POINTS_LAYER_ID,
  'tree-selection',
]
export function addDetectionLayers(
  map: Map,
  campaign: CampaignFilter,
  visible: boolean,
  selectedId: string | null,
) {
  map.addSource(TREE_SOURCE, {
    type: 'geojson',
    data: treesGeoJSON(campaign),
    cluster: true,
    clusterRadius: 50,
    clusterMaxZoom: 16,
  })
  map.addLayer({
    id: FIRST_DETECTION_LAYER_ID,
    type: 'circle',
    source: TREE_SOURCE,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#1e293b',
      'circle-radius': ['step', ['get', 'point_count'], 18, 10, 22, 25, 27],
    },
  })
  map.addLayer({
    id: 'tree-cluster-count',
    type: 'symbol',
    source: TREE_SOURCE,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': ['Noto Sans Bold'],
      'text-size': 12,
      'text-allow-overlap': true,
    },
    paint: { 'text-color': '#f8fafc' },
  })
  map.addLayer({
    id: TREE_POINTS_LAYER_ID,
    type: 'circle',
    source: TREE_SOURCE,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-radius': 7,
      'circle-color': '#10b981',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#f8fafc',
    },
  })
  map.addLayer({
    id: 'tree-selection',
    type: 'circle',
    source: TREE_SOURCE,
    filter: ['==', ['get', 'id'], selectedId ?? ''],
    paint: {
      'circle-radius': 12,
      'circle-color': '#10b981',
      'circle-opacity': 0.15,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#065f46',
    },
  })
  setDetectionsVisible(map, visible)
}
export function setTreeCampaign(map: Map, campaign: CampaignFilter) {
  ;(map.getSource(TREE_SOURCE) as GeoJSONSource | undefined)?.setData(
    treesGeoJSON(campaign),
  )
}
export function setTreeSelection(map: Map, id: string | null) {
  if (map.getLayer('tree-selection'))
    map.setFilter('tree-selection', ['==', ['get', 'id'], id ?? ''])
}
export function setDetectionsVisible(map: Map, visible: boolean) {
  if (!visible) map.getCanvas().style.cursor = ''
  for (const id of layers)
    if (map.getLayer(id))
      map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
}
