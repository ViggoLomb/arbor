import type { Polygon } from 'geojson'
import type { Coordinate, StudyArea } from '../types/study'

const R = 6371008.8, rad = Math.PI / 180
const cross = (a: number[], b: number[], c: number[]) =>
  (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
const onSegment = (p: number[], a: number[], b: number[]) =>
  Math.abs(cross(a, b, p)) < 1e-12 && p[0] >= Math.min(a[0], b[0]) - 1e-10 &&
  p[0] <= Math.max(a[0], b[0]) + 1e-10 && p[1] >= Math.min(a[1], b[1]) - 1e-10 && p[1] <= Math.max(a[1], b[1]) + 1e-10
function intersects(a: number[], b: number[], c: number[], d: number[]) {
  return (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) ||
    onSegment(a, c, d) || onSegment(b, c, d) || onSegment(c, a, b) || onSegment(d, a, b)
}
function insideRing(point: number[], ring: number[][]) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j]
    if (onSegment(point, a, b)) return true
    if ((a[1] > point[1]) !== (b[1] > point[1]) &&
      point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside
  }
  return inside
}
export const pointInPolygon = (point: number[], polygon: Polygon) =>
  insideRing(point, polygon.coordinates[0]) && !polygon.coordinates.slice(1).some((ring) => insideRing(point, ring))
export function polygonAreaM2(polygon: Polygon) {
  return polygon.coordinates.reduce((sum, ring, i) => {
    let value = 0
    for (let j = 0; j < ring.length - 1; j++)
      value += (ring[j + 1][0] - ring[j][0]) * rad * (2 + Math.sin(ring[j][1] * rad) + Math.sin(ring[j + 1][1] * rad))
    return sum + Math.abs(value * R * R / 2) * (i === 0 ? 1 : -1)
  }, 0)
}
export function distanceToSegment(point: number[], a: number[], b: number[]) {
  const sx = R * rad * Math.cos(point[1] * rad), sy = R * rad
  const dx = (b[0] - a[0]) * sx, dy = (b[1] - a[1]) * sy
  const px = (point[0] - a[0]) * sx, py = (point[1] - a[1]) * sy
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy || 1)))
  return Math.hypot(px - t * dx, py - t * dy)
}
export function distanceToBoundary(point: number[], polygon: Polygon) {
  return Math.min(...polygon.coordinates.flatMap((ring) => ring.slice(0, -1).map((p, i) => distanceToSegment(point, p, ring[i + 1]))))
}
export function polygonPerimeterM(polygon: Polygon) {
  return polygon.coordinates[0].slice(0, -1).reduce((sum, p, i) => {
    const q = polygon.coordinates[0][i + 1]
    return sum + Math.hypot((q[0] - p[0]) * R * rad * Math.cos((p[1] + q[1]) / 2 * rad), (q[1] - p[1]) * R * rad)
  }, 0)
}
export function validPolygon(value: unknown): value is Polygon {
  if (!value || typeof value !== 'object') return false
  const polygon = value as Polygon
  if (polygon.type !== 'Polygon' || !Array.isArray(polygon.coordinates) || polygon.coordinates.length !== 1) return false
  const ring = polygon.coordinates[0]
  if (!Array.isArray(ring) || ring.length < 4 || ring.length > 2000 || ring.some((p) => !Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite) || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 85)) return false
  if (ring[0][0] !== ring.at(-1)![0] || ring[0][1] !== ring.at(-1)![1]) return false
  for (let i = 0; i < ring.length - 1; i++) {
    if (ring[i][0] === ring[i + 1][0] && ring[i][1] === ring[i + 1][1]) return false
    for (let j = i + 2; j < ring.length - 1; j++) {
      if (i === 0 && j === ring.length - 2) continue
      if (intersects(ring[i], ring[i + 1], ring[j], ring[j + 1])) return false
    }
  }
  return polygonAreaM2(polygon) >= 4
}
export function polygonFromPoints(points: Coordinate[]): Polygon {
  return { type: 'Polygon', coordinates: [[...points, points[0]]] }
}
export function studyBounds(area: StudyArea): [Coordinate, Coordinate] {
  const points = area.geometry.coordinates[0]
  const lat = points.reduce((sum, p) => sum + p[1], 0) / points.length
  const dy = area.bufferM / (R * rad), dx = dy / Math.cos(lat * rad)
  return [[Math.min(...points.map((p) => p[0])) - dx, Math.min(...points.map((p) => p[1])) - dy],
    [Math.max(...points.map((p) => p[0])) + dx, Math.max(...points.map((p) => p[1])) + dy]]
}
export function containsStudyPoint(area: StudyArea, point: number[]) {
  return pointInPolygon(point, area.geometry) || (area.bufferM > 0 && distanceToBoundary(point, area.geometry) <= area.bufferM)
}
export function streetArea(a: Coordinate, b: Coordinate, halfWidthM = 10, offsetM = 0): Polygon {
  const sx = R * rad * Math.cos((a[1] + b[1]) / 2 * rad), sy = R * rad
  const dx = (b[0] - a[0]) * sx, dy = (b[1] - a[1]) * sy, length = Math.hypot(dx, dy)
  const nx = -dy / length / sx, ny = dx / length / sy
  return polygonFromPoints([[a[0] + nx * (offsetM + halfWidthM), a[1] + ny * (offsetM + halfWidthM)],
    [b[0] + nx * (offsetM + halfWidthM), b[1] + ny * (offsetM + halfWidthM)],
    [b[0] + nx * (offsetM - halfWidthM), b[1] + ny * (offsetM - halfWidthM)],
    [a[0] + nx * (offsetM - halfWidthM), a[1] + ny * (offsetM - halfWidthM)]])
}
export function closestBlockEdge(point: Coordinate, polygon: Polygon): [Coordinate, Coordinate] {
  const ring = polygon.coordinates[0] as Coordinate[]
  let index = 0, distance = Infinity
  ring.slice(0, -1).forEach((a, i) => {
    const d = distanceToSegment(point, a, ring[i + 1])
    if (d < distance) { index = i; distance = d }
  })
  return [ring[index], ring[index + 1]]
}
