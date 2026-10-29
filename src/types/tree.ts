export type Campaign = '2019' | '2018'
export type CampaignFilter = Campaign | 'all'
export const matchesCampaign = (year: Campaign, filter: CampaignFilter) =>
  filter === 'all' || year === filter
export type PendingGroup = {
  id: string
  campaign: Campaign
  coordinates: [number, number]
  reason: string
  observationIds: string[]
}

export type EstadoSanitario = 'Bueno' | 'Regular' | 'Malo'
export type TreeObservation = {
  id: string
  cameraId: string
  score: number
  bbox: [number, number, number, number]
  width: number
  height: number
}
export type TreeRecord = {
  id: string
  label: string
  campaign: Campaign
  coordinates: [number, number]
  calle: string
  identityStatus: string
  positionMethod: string
  primaryObservationId: string
  photoPath: string
  observations: TreeObservation[]
  heightEstimate: {
    valueM: number
    method: 'geometry' | 'visual' | 'fallback'
    isSimulated: true
    observationIds: string[]
    version: string
    cameraHeightM?: number
  }
}
export type CensusFields = {
  especie: string
  dap_cm: number | null
  altura_m: number | null
  estado_sanitario: EstadoSanitario | null
  interferencias: Record<'Cables' | 'Vereda' | 'Luminarias', boolean | null>
  observaciones: string
}
export type TreeHeight = {
  valueM: number
  source: 'simulated' | 'entered'
}
export type SelectedTree = TreeRecord & {
  census: CensusFields
  height: TreeHeight
}
export const emptyCensus: CensusFields = {
  especie: '',
  dap_cm: null,
  altura_m: null,
  estado_sanitario: null,
  interferencias: { Cables: null, Vereda: null, Luminarias: null },
  observaciones: '',
}
