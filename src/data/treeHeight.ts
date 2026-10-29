import type { CensusFields, TreeHeight, TreeRecord } from '../types/tree'

export const isValidHeight = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

export function resolveTreeHeight(
  tree: TreeRecord,
  census: CensusFields,
): TreeHeight {
  return isValidHeight(census.altura_m)
    ? { valueM: census.altura_m, source: 'entered' }
    : { valueM: tree.heightEstimate.valueM, source: 'simulated' }
}

const numberFormat = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 1,
})
export const formatHeight = (valueM: number) =>
  `${numberFormat.format(valueM)} m`
