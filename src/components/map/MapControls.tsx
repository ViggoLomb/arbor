import { LocateFixed, Minus, Plus } from 'lucide-react'

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onFit,
}: {
  onZoomIn: () => void
  onZoomOut: () => void
  onFit: () => void
}) {
  return (
    <div
      role="group"
      aria-label="Navegación del mapa"
      className="map-navigation absolute right-4 bottom-6 z-10 flex items-center gap-1"
    >
      <button
        type="button"
        onClick={onFit}
        aria-label="Encuadrar proyecto"
        title="Encuadrar proyecto"
        className="map-navigation-button"
      >
        <LocateFixed size={18} />
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        aria-label="Alejar mapa"
        title="Alejar mapa"
        className="map-navigation-button"
      >
        <Minus size={19} />
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        aria-label="Acercar mapa"
        title="Acercar mapa"
        className="map-navigation-button"
      >
        <Plus size={19} />
      </button>
    </div>
  )
}
