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
}
export type CensusFields = {
  especie: string
  dap_cm: number | null
  estado_sanitario: EstadoSanitario | null
  interferencias: Record<'Cables' | 'Vereda' | 'Luminarias', boolean | null>
  observaciones: string
}
export type SelectedTree = TreeRecord & { census: CensusFields }
export const emptyCensus: CensusFields = {
  especie: '',
  dap_cm: null,
  estado_sanitario: null,
  interferencias: { Cables: null, Vereda: null, Luminarias: null },
  observaciones: '',
}
