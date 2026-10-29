import route from './streetRoute.json'
export const streetCameras = route.map((metadata) => ({
  ...metadata,
  coordinates: metadata.computed_geometry.coordinates as [number, number],
  bearing: metadata.computed_compass_angle,
  imageUrl: `${import.meta.env.BASE_URL}${metadata.local_image}`,
  dateLabel: new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(metadata.captured_at),
}))
export const streetCamera = streetCameras.find(
  (camera) => camera.id === '463608934730948',
)!
export type StreetCamera = (typeof streetCameras)[number]

export const getStreetSequence = (sequence: string) =>
  streetCameras
    .filter((camera) => camera.sequence === sequence)
    .sort((a, b) => a.captured_at - b.captured_at)
