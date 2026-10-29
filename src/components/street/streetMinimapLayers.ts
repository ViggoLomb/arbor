import type { Map } from 'maplibre-gl'
import { streetCameras, type StreetCamera } from '../../data/streetCamera'
import { photoPointsData } from '../../data/streetNavigation'

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
  map.addSource('street-photos', { type: 'geojson', data: photoPointsData(streetCameras) })
  map.addLayer({
    id: 'street-photos', type: 'circle', source: 'street-photos',
    paint: {
      'circle-radius': 4, 'circle-color': '#64748b', 'circle-opacity': .8,
      'circle-stroke-color': '#f8fafc', 'circle-stroke-width': 1.5,
    },
  })
  map.addSource('street-cone', {
    type: 'geojson',
    data: viewCone(camera, bearing),
  })
  map.addLayer({
    id: 'street-cone',
    type: 'fill',
    source: 'street-cone',
    paint: { 'fill-color': '#059669', 'fill-opacity': 0.12 },
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
      'circle-color': '#059669',
      'circle-stroke-color': '#f8fafc',
      'circle-stroke-width': 2,
    },
  })
}
