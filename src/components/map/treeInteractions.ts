import type { Map, MapLayerMouseEvent, GeoJSONSource } from 'maplibre-gl'
import { treeById } from '../../data/trees'
import {
  FIRST_DETECTION_LAYER_ID,
  TREE_POINTS_LAYER_ID,
  TREE_SOURCE,
} from './detectionLayers'
export function bindTreeInteractions(map: Map, onSelect: (id: string) => void, canSelect: () => boolean = () => true) {
  let active = true
  const handleClick = (event: MapLayerMouseEvent) => {
    if (!canSelect()) return
    const id = event.features?.[0]?.properties?.id
    if (id && treeById.has(id)) onSelect(id)
  }
  const clusterClick = async (event: MapLayerMouseEvent) => {
    if (!canSelect()) return
    const feature = event.features?.[0]
    if (!feature || feature.geometry.type !== 'Point') return
    const zoom = await (
      map.getSource(TREE_SOURCE) as GeoJSONSource
    ).getClusterExpansionZoom(feature.properties.cluster_id)
    // A pending expansion may resolve after the editor has been removed.
    if (active && canSelect())
      map.jumpTo({
        center: feature.geometry.coordinates as [number, number],
        zoom,
      })
  }
  const enter = () => {
    map.getCanvas().style.cursor = canSelect() ? 'pointer' : 'crosshair'
  }
  const leave = () => {
    map.getCanvas().style.cursor = canSelect() ? '' : 'crosshair'
  }
  map.on('click', TREE_POINTS_LAYER_ID, handleClick)
  map.on('click', FIRST_DETECTION_LAYER_ID, clusterClick)
  for (const layer of [TREE_POINTS_LAYER_ID, FIRST_DETECTION_LAYER_ID]) {
    map.on('mouseenter', layer, enter)
    map.on('mouseleave', layer, leave)
  }
  return () => {
    active = false
    map.off('click', TREE_POINTS_LAYER_ID, handleClick)
    map.off('click', FIRST_DETECTION_LAYER_ID, clusterClick)
    for (const layer of [TREE_POINTS_LAYER_ID, FIRST_DETECTION_LAYER_ID]) {
      map.off('mouseenter', layer, enter)
      map.off('mouseleave', layer, leave)
    }
  }
}
