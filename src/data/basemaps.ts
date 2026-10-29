import type { StyleSpecification } from 'maplibre-gl'
import standard from './basemapStyles/standard.json'
import light from './basemapStyles/light.json'
import dark from './basemapStyles/dark.json'

export type BasemapId = 'standard' | 'satellite' | 'light' | 'dark'
export const getBasemapMaxZoom = (id: BasemapId) =>
  id === 'satellite' ? 19 : 21
export const basemaps: { id: BasemapId; label: string; provider: string }[] = [
  { id: 'standard', label: 'Estándar', provider: 'OpenFreeMap · Liberty' },
  { id: 'satellite', label: 'Satélite', provider: 'Esri · World Imagery' },
  { id: 'light', label: 'Claro', provider: 'OpenFreeMap · Positron' },
  { id: 'dark', label: 'Oscuro', provider: 'OpenFreeMap · Dark' },
]
const styles = { standard, light, dark } as unknown as Record<
  Exclude<BasemapId, 'satellite'>,
  StyleSpecification
>
export const BASEMAP_PREFIX = 'basemap-'
export function createBasemapStyle(
  id: BasemapId,
  labels: boolean,
): StyleSpecification {
  const style = styles[id === 'satellite' ? 'dark' : id]
  const layers =
    id === 'satellite'
      ? [
          {
            id: 'satellite',
            type: 'raster' as const,
            source: 'satellite',
            paint: { 'raster-fade-duration': 0 },
          },
          ...style.layers.filter((layer) => layer.type === 'symbol'),
        ]
      : style.layers
  return {
    version: 8,
    sprite: style.sprite,
    glyphs: style.glyphs,
    sources: {
      ...style.sources,
      satellite: {
        type: 'raster',
        tiles: [
          'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        // Tandil has imagery through native level 17. Overzoom those tiles
        // up to the viewer's limit instead of requesting the no-data tiles.
        maxzoom: 17,
        attribution:
          'Imágenes © Esri, Vantor, Earthstar Geographics y GIS User Community',
      },
    },
    layers: layers
      .filter((layer) => layer.type !== 'fill-extrusion')
      .map((layer) => {
        if (id === 'standard' && layer.id === 'building')
          layer = { ...layer, maxzoom: 24 }
        if (id === 'satellite' && layer.type === 'symbol')
          layer = {
            ...layer,
            paint: {
              ...layer.paint,
              'text-color': '#f8fafc',
              'text-halo-color': '#1e293b',
              'text-halo-width': 1.4,
              'text-halo-blur': 0.5,
            },
          }
        return {
          ...layer,
          id: `${BASEMAP_PREFIX}${layer.id}`,
          layout: {
            ...layer.layout,
            ...(layer.type === 'symbol'
              ? {
                  visibility: labels ? ('visible' as const) : ('none' as const),
                }
              : {}),
          },
        }
      }),
  }
}
