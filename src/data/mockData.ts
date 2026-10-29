import type { FeatureCollection, Point } from 'geojson'

export type EstadoSanitario = 'Bueno' | 'Regular' | 'Malo'

export type TreeProperties = {
  id: string
  especie: string
  estado_sanitario: EstadoSanitario
}

const estados: EstadoSanitario[] = ['Bueno', 'Bueno', 'Regular', 'Bueno', 'Malo']

// Datos deterministas: 40 detecciones simuladas alrededor de Buenos Aires.
export const mockDetections: FeatureCollection<Point, TreeProperties> = {
  type: 'FeatureCollection',
  features: Array.from({ length: 40 }, (_, index) => ({
    type: 'Feature',
    id: `yolo-${String(index + 1).padStart(3, '0')}`,
    geometry: {
      type: 'Point',
      coordinates: [
        -58.4 + ((index % 8) - 3.5) * 0.0015 + Math.sin(index * 2.4) * 0.0003,
        -34.6 + (Math.floor(index / 8) - 2) * 0.0018 + Math.cos(index * 1.7) * 0.0003,
      ],
    },
    properties: {
      id: `yolo-${String(index + 1).padStart(3, '0')}`,
      especie: 'Árbol urbano sin identificar',
      estado_sanitario: estados[index % estados.length],
    },
  })),
}
