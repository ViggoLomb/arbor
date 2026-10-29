import type { Polygon, FeatureCollection } from 'geojson'

export type Coordinate = [number, number]
export type StudyMode = 'block' | 'polygon' | 'street'
export type StudyArea = {
  id: string
  name: string
  mode: StudyMode
  geometry: Polygon
  bufferM: number
  excludedIds: string[]
  includedIds: string[]
  source: string
  selectedAt: string
  streetLengthM?: number
}
export type BlockProperties = { id: string; name: string; code: string }
export type BlockCatalog = FeatureCollection<Polygon, BlockProperties> & {
  metadata: { source: string; attribution: string; preparedAt: string; parcelCount: number }
}
export type StudyMapState = {
  area: StudyArea | null
  mode: StudyMode | null
  vertices: Coordinate[]
  blocks: BlockCatalog | null
  onPoint: (point: Coordinate, blockId?: string) => void
  onFinish: () => void
}
