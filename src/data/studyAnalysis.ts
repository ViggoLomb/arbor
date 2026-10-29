import type { StudyArea } from '../types/study'
import type { SelectedTree, CampaignFilter } from '../types/tree'
import { containsStudyPoint, pointInPolygon, polygonAreaM2, polygonPerimeterM } from './studyGeometry'
import { projectBounds } from './geography'

export function selectStudyTrees(area: StudyArea, trees: SelectedTree[]) {
  return trees.filter((tree) => !area.excludedIds.includes(tree.id) &&
    (area.includedIds.includes(tree.id) || containsStudyPoint(area, tree.coordinates)))
}
export function numberSummary(values: number[]) {
  return values.length ? { count: values.length, mean: values.reduce((sum, n) => sum + n, 0) / values.length, min: Math.min(...values), max: Math.max(...values) } : null
}
export function summarizeStudy(area: StudyArea, available: SelectedTree[], campaign: CampaignFilter) {
  const trees = selectStudyTrees(area, available)
  const counts = (values: string[]) => Object.entries(values.reduce<Record<string, number>>((sum, name) => ({ ...sum, [name]: (sum[name] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const areaM2 = polygonAreaM2(area.geometry)
  const interior = trees.filter((t) => pointInPolygon(t.coordinates, area.geometry))
  const points = area.geometry.coordinates[0]
  const overlapsInventory = Math.min(...points.map((p) => p[0])) <= projectBounds[1][0] && Math.max(...points.map((p) => p[0])) >= projectBounds[0][0] && Math.min(...points.map((p) => p[1])) <= projectBounds[1][1] && Math.max(...points.map((p) => p[1])) >= projectBounds[0][1]
  return {
    area, campaign, trees, areaM2, perimeterM: polygonPerimeterM(area.geometry),
    coverage: trees.length ? 'records' as const : overlapsInventory ? 'empty' as const : 'unavailable' as const,
    interiorCount: interior.length,
    campaignCounts: counts(trees.map((t) => t.campaign)),
    health: counts(trees.map((t) => t.census.estado_sanitario ?? 'Sin relevar')),
    species: counts(trees.map((t) => t.census.especie.trim() || 'Sin relevar')),
    heights: numberSummary(trees.map((t) => t.height.valueM)),
    dap: numberSummary(trees.flatMap((t) => t.census.dap_cm === null ? [] : [t.census.dap_cm])),
    complete: trees.filter((t) => t.census.especie.trim() && t.census.dap_cm !== null && t.census.estado_sanitario !== null && Object.values(t.census.interferencias).every((v) => v !== null)).length,
    interference: (['Cables', 'Vereda', 'Luminarias'] as const).map((name) => ({
      name, present: trees.filter((t) => t.census.interferencias[name] === true).length,
      absent: trees.filter((t) => t.census.interferencias[name] === false).length,
      pending: trees.filter((t) => t.census.interferencias[name] === null).length,
    })),
    byCampaign: (['2018', '2019'] as const).filter((year) => campaign === 'all' || campaign === year).map((year) => {
      const records = trees.filter((t) => t.campaign === year)
      return { year, count: records.length, heights: numberSummary(records.map((t) => t.height.valueM)),
        perHa: interior.filter((t) => t.campaign === year).length / (areaM2 / 10000) }
    }),
  }
}
export type StudySummary = ReturnType<typeof summarizeStudy>
export const metric = (value: number, decimals = 1) => value.toLocaleString('es-AR', { maximumFractionDigits: decimals })
