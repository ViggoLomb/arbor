import type { GeoJSONSource, Map, MapMouseEvent } from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'
import type { StudyMapState } from '../../types/study'

const empty: FeatureCollection = { type: 'FeatureCollection', features: [] }
const blockData = new WeakMap<Map, StudyMapState['blocks']>()
export function updateStudyLayers(map: Map, state: StudyMapState) {
  if (!map.getSource('study-selected')) return
  if (blockData.get(map) !== state.blocks) {
    ;(map.getSource('study-blocks') as GeoJSONSource).setData(state.blocks ?? empty)
    blockData.set(map, state.blocks)
  }
  ;(map.getSource('study-selected') as GeoJSONSource).setData(state.area
    ? { type: 'Feature', properties: {}, geometry: state.area.geometry } : empty)
  ;(map.getSource('study-draft') as GeoJSONSource).setData({
    type: 'FeatureCollection', features: [
      ...(state.vertices.length > 1 ? [{ type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: state.vertices } }] : []),
      ...state.vertices.map((point, index) => ({ type: 'Feature' as const, properties: { index }, geometry: { type: 'Point' as const, coordinates: point } })),
    ],
  })
  for (const layer of ['study-block-fill', 'study-block-line'])
    map.setLayoutProperty(layer, 'visibility', state.mode === 'block' || state.mode === 'street' ? 'visible' : 'none')
  if (state.mode) map.doubleClickZoom.disable()
  else map.doubleClickZoom.enable()
  map.getCanvas().style.cursor = state.mode ? 'crosshair' : ''
}
export function addStudyLayers(map: Map, getState: () => StudyMapState) {
  for (const name of ['study-blocks', 'study-selected', 'study-draft']) map.addSource(name, { type: 'geojson', data: empty })
  map.addLayer({ id: 'study-block-fill', type: 'fill', source: 'study-blocks', minzoom: 13,
    paint: { 'fill-color': '#64748b', 'fill-opacity': .05 } })
  map.addLayer({ id: 'study-block-line', type: 'line', source: 'study-blocks', minzoom: 13,
    paint: { 'line-color': '#475569', 'line-width': 1, 'line-opacity': .5 } })
  map.addLayer({ id: 'study-selected-fill', type: 'fill', source: 'study-selected',
    paint: { 'fill-color': '#059669', 'fill-opacity': .12 } })
  map.addLayer({ id: 'study-selected-line', type: 'line', source: 'study-selected',
    paint: { 'line-color': '#047857', 'line-width': 3 } })
  map.addLayer({ id: 'study-draft-line', type: 'line', source: 'study-draft', filter: ['==', '$type', 'LineString'],
    paint: { 'line-color': '#059669', 'line-width': 3, 'line-dasharray': [2, 1] } })
  map.addLayer({ id: 'study-draft-points', type: 'circle', source: 'study-draft', filter: ['==', '$type', 'Point'],
    paint: { 'circle-radius': 5, 'circle-color': '#059669', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } })
  const click = (event: MapMouseEvent) => {
    const state = getState()
    if (!state.mode || event.originalEvent.detail > 1) return
    const block = state.mode !== 'polygon'
      ? map.queryRenderedFeatures(event.point, { layers: ['study-block-fill'] })[0] : undefined
    state.onPoint([event.lngLat.lng, event.lngLat.lat], block?.properties.id)
  }
  const doubleClick = (event: MapMouseEvent) => {
    if (getState().mode !== 'polygon') return
    event.preventDefault(); getState().onFinish()
  }
  map.on('click', click); map.on('dblclick', doubleClick)
  updateStudyLayers(map, getState())
  return () => { map.off('click', click); map.off('dblclick', doubleClick) }
}
