export type LocatedCamera = { id: string; coordinates: [number, number]; bearing: number }
export type StreetDirection = 'forward' | 'right' | 'backward' | 'left'
export type CameraNeighbor<T> = { camera: T; distanceM: number }
export type CameraNeighbors<T> = Record<StreetDirection, CameraNeighbor<T> | null>
export const streetDirections: StreetDirection[] = ['forward', 'right', 'backward', 'left']

export function cameraOffset(a: LocatedCamera, b: LocatedCamera) {
  const radians = Math.PI / 180
  return [
    (b.coordinates[0] - a.coordinates[0]) * radians * 6371008.8 *
      Math.cos((a.coordinates[1] + b.coordinates[1]) / 2 * radians),
    (b.coordinates[1] - a.coordinates[1]) * radians * 6371008.8,
  ]
}
export const cameraDistance = (a: LocatedCamera, b: LocatedCamera) => Math.hypot(...cameraOffset(a, b))

export function photoPointsData<T extends LocatedCamera>(cameras: T[]) {
  return {
    type: 'FeatureCollection' as const,
    features: cameras.map((camera) => ({
      type: 'Feature' as const,
      properties: { id: camera.id },
      geometry: { type: 'Point' as const, coordinates: camera.coordinates },
    })),
  }
}

// Nearest camera in each viewing sector. Date, campaign and sequence never rank
// or exclude destinations. Short spatial edges avoid teleporting across a block.
export function nearestStreetCameras<T extends LocatedCamera>(
  current: T, cameras: T[], bearing = current.bearing, maxDistanceM = 40,
): CameraNeighbors<T> {
  const result: CameraNeighbors<T> = { forward: null, right: null, backward: null, left: null }
  for (const camera of cameras) {
    if (camera.id === current.id) continue
    const [east, north] = cameraOffset(current, camera)
    const distanceM = Math.hypot(east, north)
    if (!Number.isFinite(distanceM) || distanceM > maxDistanceM || distanceM < .01) continue
    const relative = ((Math.atan2(east, north) * 180 / Math.PI - bearing) % 360 + 360) % 360
    const direction = streetDirections[Math.floor(((relative + 45) % 360) / 90)]
    const previous = result[direction]
    if (!previous || distanceM < previous.distanceM ||
      (distanceM === previous.distanceM && camera.id < previous.camera.id))
      result[direction] = { camera, distanceM }
  }
  return result
}

