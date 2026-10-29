import type { FeatureCollection, Point } from 'geojson'
import records from './generated/tandil-trees.json'
import type {
  CampaignFilter,
  CensusFields,
  SelectedTree,
  TreeRecord,
} from '../types/tree'
import { emptyCensus, matchesCampaign } from '../types/tree'
import { streetCameras } from './streetCamera'
import { resolveTreeHeight } from './treeHeight'

export const treeRecords = records as unknown as TreeRecord[]
export const treeById = new Map(treeRecords.map((tree) => [tree.id, tree]))
export function getAvailableTrees(
  campaign: CampaignFilter,
  saved: Record<string, CensusFields> = {},
): SelectedTree[] {
  return treeRecords
    .filter((tree) => matchesCampaign(tree.campaign, campaign))
    .map((tree) => {
      const census = saved[tree.id] ?? emptyCensus
      return { ...tree, census, height: resolveTreeHeight(tree, census) }
    })
}
export function treesGeoJSON(
  campaign: CampaignFilter,
): FeatureCollection<Point, { id: string }> {
  return {
    type: 'FeatureCollection',
    features: treeRecords
      .filter((tree) => matchesCampaign(tree.campaign, campaign))
      .map((tree) => ({
        type: 'Feature',
        id: tree.id,
        geometry: { type: 'Point', coordinates: tree.coordinates },
        properties: { id: tree.id },
      })),
  }
}
export function nearestTreeCamera(tree: TreeRecord) {
  // Primary observation is selected by geographic distance among this tree's
  // own detections during preparation, never among unrelated camera locations.
  const observation = tree.observations.find(
    (item) => item.id === tree.primaryObservationId,
  )
  return streetCameras.find((camera) => camera.id === observation?.cameraId)
}
export const treePhotoUrl = (tree: TreeRecord) =>
  `${import.meta.env.BASE_URL}${tree.photoPath}`
