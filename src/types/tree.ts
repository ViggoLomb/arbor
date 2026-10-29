import type { TreeProperties } from '../data/mockData'

export type SelectedTree = TreeProperties & {
  coordinates: [longitude: number, latitude: number]
}
