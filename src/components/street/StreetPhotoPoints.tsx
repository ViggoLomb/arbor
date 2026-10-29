import { streetCameras, type StreetCamera } from '../../data/streetCamera'

const longitude = streetCameras.map((c) => c.coordinates[0])
const latitude = streetCameras.map((c) => c.coordinates[1])
const origin = [Math.min(...longitude), Math.min(...latitude)]
const cosine = Math.cos(origin[1] * Math.PI / 180)
const extentX = (Math.max(...longitude) - origin[0]) * cosine
const extentY = Math.max(...latitude) - origin[1]
const scale = Math.min(340 / extentX, 200 / extentY)
const x = (camera: StreetCamera) => 200 + ((camera.coordinates[0] - origin[0]) * cosine - extentX / 2) * scale
const y = (camera: StreetCamera) => 120 - (camera.coordinates[1] - origin[1] - extentY / 2) * scale

// Photograph positions remain usable while the basemap is loading or when the
// browser cannot draw WebGL. This is the same local camera dataset as MapLibre.
export default function StreetPhotoPoints({ camera }: { camera: StreetCamera }) {
  return (
    <svg viewBox="0 0 400 240" role="img" aria-label="Posiciones de las 89 fotografías"
      className="pointer-events-none absolute inset-0 h-full w-full bg-slate-100">
      {streetCameras.map((item) => (
        <circle key={item.id} data-photo-position={item.id} cx={x(item)} cy={y(item)} r={3.5}
          fill="#64748b" fillOpacity=".75" stroke="#f8fafc" strokeWidth="1.3" />
      ))}
      <circle data-current-photo={camera.id} cx={x(camera)} cy={y(camera)} r={6}
        fill="#059669" stroke="#f8fafc" strokeWidth="2" />
    </svg>
  )
}
