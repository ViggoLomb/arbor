import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Minus, Plus, RotateCcw } from 'lucide-react'
import type { CameraNeighbors, StreetDirection } from '../../data/streetNavigation'
import type { StreetCamera } from '../../data/streetCamera'

const directions = [
  { direction: 'forward', label: 'Avanzar', icon: ChevronUp, placement: 'relative' },
  { direction: 'backward', label: 'Retroceder', icon: ChevronDown, placement: 'relative' },
  { direction: 'left', label: 'Ir a la izquierda', icon: ChevronLeft, placement: 'absolute -left-24 top-1/2 -translate-y-1/2' },
  { direction: 'right', label: 'Ir a la derecha', icon: ChevronRight, placement: 'absolute -right-24 top-1/2 -translate-y-1/2' },
] as const

export default function StreetControls({ ready, loading, neighbors, onNavigate, onZoom, onReset }: {
  ready: boolean
  loading: boolean
  neighbors: CameraNeighbors<StreetCamera>
  onNavigate: (direction: StreetDirection) => void
  onZoom: (delta: number) => void
  onReset: () => void
}) {
  return (
    <>
      <div role="group" aria-label="Cámaras cercanas en cada dirección"
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        {directions.map(({ direction, label, icon: Icon, placement }) => {
          const neighbor = neighbors[direction]
          if (!neighbor && (direction === 'left' || direction === 'right')) return null
          return (
            <button key={direction} type="button" disabled={loading || !neighbor}
              data-street-direction={direction} aria-label={label}
              data-street-target-id={neighbor?.camera.id}
              title={neighbor ? `${label} · cámara a ${neighbor.distanceM.toFixed(1)} m · ${neighbor.camera.dateLabel}` : 'Sin otra cámara cercana en esta dirección'}
              onClick={() => onNavigate(direction)}
              className={`${placement} street-step`}>
              <Icon size={64} strokeWidth={3} aria-hidden="true" />
            </button>
          )
        })}
      </div>
      <div role="group" aria-label="Controles de la vista de calle"
        className="absolute right-5 bottom-6 z-10 flex flex-col rounded-xl border border-slate-200/70 bg-slate-50/95 p-1 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md">
        <button type="button" disabled={!ready} onClick={() => onZoom(.5)} aria-label="Acercar vista de calle" className="street-map-button disabled:opacity-30"><Plus size={20} /></button>
        <button type="button" disabled={!ready} onClick={() => onZoom(-.5)} aria-label="Alejar vista de calle" className="street-map-button disabled:opacity-30"><Minus size={20} /></button>
        <button type="button" disabled={!ready} onClick={onReset} aria-label="Restablecer vista de calle" className="street-map-button disabled:opacity-30"><RotateCcw size={20} /></button>
      </div>
    </>
  )
}
