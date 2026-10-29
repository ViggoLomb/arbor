import type { Map, MapLayerMouseEvent } from 'maplibre-gl'
import type { SelectedTree } from '../../types/tree'
import { TREE_POINTS_LAYER_ID } from './detectionLayers'

export function bindTreeInteractions(map: Map, onSelect: (tree: SelectedTree) => void) {
  function handleClick(event: MapLayerMouseEvent) {
    const feature = event.features?.[0]
    if (!feature || feature.geometry.type !== 'Point' || !feature.properties) return

    const { id, especie, estado_sanitario } = feature.properties
    if (typeof id !== 'string' || typeof especie !== 'string') return
    if (estado_sanitario !== 'Bueno' && estado_sanitario !== 'Regular' && estado_sanitario !== 'Malo') return

    const [longitude, latitude] = feature.geometry.coordinates
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return

    onSelect({ id, especie, estado_sanitario, coordinates: [longitude, latitude] })
  }

  function handleEnter() {
    map.getCanvas().style.cursor = 'pointer'
  }

  function handleLeave() {
    map.getCanvas().style.cursor = ''
  }

  map.on('click', TREE_POINTS_LAYER_ID, handleClick)
  map.on('mouseenter', TREE_POINTS_LAYER_ID, handleEnter)
  map.on('mouseleave', TREE_POINTS_LAYER_ID, handleLeave)

  return () => {
    map.off('click', TREE_POINTS_LAYER_ID, handleClick)
    map.off('mouseenter', TREE_POINTS_LAYER_ID, handleEnter)
    map.off('mouseleave', TREE_POINTS_LAYER_ID, handleLeave)
    handleLeave()
  }
}
