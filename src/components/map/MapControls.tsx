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
      className="absolute right-4 bottom-18 z-10 flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-50/90 p-1 shadow-lg shadow-slate-900/10 backdrop-blur-md sm:bottom-14"
    >
      <button
        type="button"
        onClick={onFit}
        aria-label="Encuadrar proyecto"
        title="Encuadrar proyecto"
        className="tool-button"
      >
        <LocateFixed size={18} />
      </button>
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-200" />
      <button
        type="button"
        onClick={onZoomOut}
        aria-label="Alejar mapa"
        title="Alejar mapa"
        className="tool-button"
      >
        <Minus size={19} />
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        aria-label="Acercar mapa"
        title="Acercar mapa"
        className="tool-button"
      >
        <Plus size={19} />
      </button>
    </div>
  )
}
