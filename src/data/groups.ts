import type { FeatureCollection, Point } from 'geojson'
import records from './generated/tandil-groups.json'
import {
  matchesCampaign,
  type CampaignFilter,
  type PendingGroup,
} from '../types/tree'
export const pendingGroups = records as PendingGroup[]
export const getPendingGroups = (campaign: CampaignFilter) =>
  pendingGroups.filter((group) => matchesCampaign(group.campaign, campaign))
export function groupsGeoJSON(
  campaign: CampaignFilter,
): FeatureCollection<Point, { id: string }> {
  return {
    type: 'FeatureCollection',
    features: getPendingGroups(campaign).map((group) => ({
      type: 'Feature',
      id: group.id,
      properties: { id: group.id },
      geometry: { type: 'Point', coordinates: group.coordinates },
    })),
  }
}
