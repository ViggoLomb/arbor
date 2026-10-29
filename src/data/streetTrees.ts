import type { SelectedTree, TreeObservation } from '../types/tree'
import { emptyCensus } from '../types/tree'

export type StreetTreeInfo = Pick<SelectedTree, 'id' | 'label' | 'campaign' | 'calle' | 'height' | 'census'> & { kind?: 'tree' | 'group' }
export type ExtraStreetTree = {
  id: string
  label: string
  campaign: '2018' | '2019'
  calle: string
  kind: 'tree' | 'group'
  heightM: number
  observation: TreeObservation
}
export type StreetTree = { tree: StreetTreeInfo; observation: TreeObservation }
export function treesInCamera(trees: SelectedTree[], cameraId: string, extras: ExtraStreetTree[] = []): StreetTree[] {
  const linked: StreetTree[] = trees.flatMap((tree) => {
    const observation = tree.observations.find((item) => item.cameraId === cameraId)
    return observation ? [{ tree, observation }] : []
  })
  for (const item of extras) {
    if (item.observation.cameraId !== cameraId) continue
    linked.push({ tree: {
      id: item.id, label: item.label, campaign: item.campaign,
      calle: item.calle, kind: item.kind, census: emptyCensus,
      height: { valueM: item.heightM, source: 'simulated' },
    }, observation: item.observation })
  }
  return linked
}
export function treeImageAnchor(observation: TreeObservation): [number, number] {
  const [left, top, right, bottom] = observation.bbox
  return [(left + right) / (2 * observation.width),
    (top + (bottom - top) * .15) / observation.height]
}
export type LabelAnchor = { id: string; point: [number, number] }
export function visibleTreeAnchor(
  points: ([number, number] | null)[], width: number, height: number,
): [number, number] | null {
  const valid = points.filter((point): point is [number, number] => !!point && point.every(Number.isFinite))
  const preferred = valid.find(([x, y]) => x >= 4 && x <= width - 4 && y >= 4 && y <= height - 4)
  if (preferred) return preferred
  if (valid.length < 2) return null
  const left = Math.max(4, Math.min(...valid.map((p) => p[0])))
  const right = Math.min(width - 4, Math.max(...valid.map((p) => p[0])))
  const top = Math.max(4, Math.min(...valid.map((p) => p[1])))
  const bottom = Math.min(height - 4, Math.max(...valid.map((p) => p[1])))
  return left <= right && top <= bottom ? [(left + right) / 2, (top + bottom) / 2] : null
}
export function treeImageSamples(observation: TreeObservation): [number, number][] {
  const [left, top, right, bottom] = observation.bbox
  const x = (fraction: number) => (left + (right - left) * fraction) / observation.width
  const y = (fraction: number) => (top + (bottom - top) * fraction) / observation.height
  return [treeImageAnchor(observation), [.5, .5], [.5, .85], [.15, .5], [.85, .5],
    [0, 0], [1, 0], [0, 1], [1, 1]].map((point, i) => i === 0
      ? point as [number, number] : [x(point[0]), y(point[1])])
}
export function layoutTreeLabels(anchors: LabelAnchor[], width: number, height: number) {
  const placed: { id: string; point: [number, number]; x: number; y: number }[] = []
  const labelWidth = 132, labelHeight = 36, padding = 8
  for (const anchor of [...anchors].sort((a, b) => a.point[1] - b.point[1] || a.id.localeCompare(b.id))) {
    const [x, y] = anchor.point
    if (x < 0 || x > width || y < 0 || y > height) continue
    const clampX = (v: number) => Math.max(padding, Math.min(width - labelWidth - padding, v))
    const clampY = (v: number) => Math.max(64, Math.min(height - labelHeight - padding, v))
    const candidates = [0, -44, 44, -88, 88, -132, 132].flatMap((dy) =>
      [0, -140, 140].map((dx) => ({ x: clampX(x - labelWidth / 2 + dx), y: clampY(y - 42 + dy) })),
    )
    const location = candidates.find((candidate) => !placed.some((p) =>
      Math.abs(candidate.x - p.x) < labelWidth + 4 && Math.abs(candidate.y - p.y) < labelHeight + 4,
    )) ?? candidates[0]
    placed.push({ ...anchor, ...location })
  }
  return placed
}

// Exact object-fit:cover projection when the interactive WebGL viewer fails.
export function coverImagePoint(
  point: [number, number], imageWidth: number, imageHeight: number,
  containerWidth: number, containerHeight: number,
): [number, number] {
  const scale = Math.max(containerWidth / imageWidth, containerHeight / imageHeight)
  return [(containerWidth - imageWidth * scale) / 2 + point[0] * imageWidth * scale,
    (containerHeight - imageHeight * scale) / 2 + point[1] * imageHeight * scale]
}
