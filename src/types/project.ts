import type { BasemapId } from '../data/basemaps'
import type { CampaignFilter } from './tree'
export type Project = {
  scenarioId: 'tandil'
  id: string
  name: string
  library: string
  description: string
  updated: string
  preview: 'census' | 'coverage' | 'imagery' | 'camera'
  draft: boolean
}
export type ProjectSession = {
  basemap: BasemapId
  basemapLabels: boolean
  campaign: CampaignFilter
  detectionsVisible: boolean
  groupsVisible: boolean
  imageImported: boolean
}
export type EditorPanel = 'layers' | 'analysis' | 'table' | null
export type ProjectAction = 'new' | 'rename' | 'move' | 'duplicate'
export const emptySession: ProjectSession = {
  basemap: 'standard',
  basemapLabels: true,
  campaign: 'all',
  detectionsVisible: true,
  groupsVisible: false,
  imageImported: false,
}
