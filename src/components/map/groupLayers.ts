import type { GeoJSONSource, Map } from 'maplibre-gl'
import { groupsGeoJSON } from '../../data/groups'
import type { CampaignFilter } from '../../types/tree'
export const GROUP_SOURCE = 'agrotech-pending-groups'
export const GROUP_LAYER = 'pending-groups'
export function addGroupLayers(
  map: Map,
  campaign: CampaignFilter,
  visible: boolean,
) {
  // A single reusable symbol keeps groups distinct from individual candidates.
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 40
  const context = canvas.getContext('2d')!
  context.beginPath()
  context.moveTo(20, 3)
  context.lineTo(37, 20)
  context.lineTo(20, 37)
  context.lineTo(3, 20)
  context.closePath()
  context.fillStyle = '#9333ea'
  context.fill()
  context.strokeStyle = '#f8fafc'
  context.lineWidth = 3
  context.stroke()
  map.addImage('pending-group-diamond', context.getImageData(0, 0, 40, 40), {
    pixelRatio: 2,
  })
  map.addSource(GROUP_SOURCE, {
    type: 'geojson',
    data: groupsGeoJSON(campaign),
  })
  map.addLayer({
    id: GROUP_LAYER,
    type: 'symbol',
    source: GROUP_SOURCE,
    layout: {
      'icon-image': 'pending-group-diamond',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      visibility: visible ? 'visible' : 'none',
    },
  })
}
export function setGroupsCampaign(map: Map, campaign: CampaignFilter) {
  ;(map.getSource(GROUP_SOURCE) as GeoJSONSource | undefined)?.setData(
    groupsGeoJSON(campaign),
  )
}
export function setGroupsVisible(map: Map, visible: boolean) {
  if (map.getLayer(GROUP_LAYER))
    map.setLayoutProperty(
      GROUP_LAYER,
      'visibility',
      visible ? 'visible' : 'none',
    )
}
