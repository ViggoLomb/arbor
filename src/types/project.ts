export type Project = {
  id: string
  name: string
  library: string
  description: string
  updated: string
  preview: 'census' | 'coverage' | 'imagery'
  draft: boolean
}

export type ProjectSession = {
  detectionsLoaded: boolean
  detectionsVisible: boolean
  imageImported: boolean
}

export type EditorPanel = 'layers' | 'analysis' | 'table' | null
export type ProjectAction = 'new' | 'rename' | 'move' | 'duplicate'

export const emptySession: ProjectSession = {
  detectionsLoaded: false,
  detectionsVisible: false,
  imageImported: false,
}
