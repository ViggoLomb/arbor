import type { Map } from 'maplibre-gl'
import { getStreetSequence, type StreetCamera } from '../../data/streetCamera'

export function viewCone(camera: StreetCamera, bearing: number) {
  const [lng, lat] = camera.coordinates
  const edge = (angle: number) => {
    const radians = (angle * Math.PI) / 180
    return [
      lng +
        (Math.sin(radians) * 22) / (111320 * Math.cos((lat * Math.PI) / 180)),
      lat + (Math.cos(radians) * 22) / 111320,
    ]
  }
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [
        [
          camera.coordinates,
          edge(bearing - 30),
          edge(bearing),
          edge(bearing + 30),
          camera.coordinates,
        ],
      ],
    },
  }
}

export function routeData(camera: StreetCamera) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: getStreetSequence(camera.sequence).map(
        (item) => item.coordinates,
      ),
    },
  }
}
export function positionData(camera: StreetCamera) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'Point' as const, coordinates: camera.coordinates },
  }
}
export function addStreetMinimapLayers(
  map: Map,
  camera: StreetCamera,
  bearing: number,
) {
  map.addSource('street-route', { type: 'geojson', data: routeData(camera) })
  map.addLayer({
    id: 'street-line',
    type: 'line',
    source: 'street-route',
    paint: { 'line-color': '#ec4899', 'line-width': 3 },
  })
  map.addSource('street-cone', {
    type: 'geojson',
    data: viewCone(camera, bearing),
  })
  map.addLayer({
    id: 'street-cone',
    type: 'fill',
    source: 'street-cone',
    paint: { 'fill-color': '#f59e0b', 'fill-opacity': 0.35 },
  })
  map.addSource('street-position', {
    type: 'geojson',
    data: positionData(camera),
  })
  map.addLayer({
    id: 'street-position',
    type: 'circle',
    source: 'street-position',
    paint: {
      'circle-radius': 7,
      'circle-color': '#f59e0b',
      'circle-stroke-color': '#f8fafc',
      'circle-stroke-width': 2,
    },
  })
}
