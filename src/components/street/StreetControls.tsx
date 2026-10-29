import { ChevronDown, ChevronUp, Minus, Plus, RotateCcw } from 'lucide-react'

export default function StreetControls({
  ready,
  index,
  total,
  onNavigate,
  onZoom,
  onReset,
}: {
  ready: boolean
  index: number
  total: number
  onNavigate: (index: number) => void
  onZoom: (delta: number) => void
  onReset: () => void
}) {
  return (
    <>
      <div
        role="group"
        aria-label="Recorrer 25 de Mayo"
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <button
          type="button"
          disabled={!ready || index === total - 1}
          onClick={() => onNavigate(index + 1)}
          className="street-step"
          aria-label="Siguiente captura"
          title="Siguiente captura"
        >
          <ChevronUp size={64} strokeWidth={3} />
        </button>
        <p
          role="status"
          aria-live="polite"
          className="rounded-full bg-slate-950/55 px-3 py-1 text-[11px] font-medium text-slate-100 backdrop-blur-md"
        >
          {index + 1} / {total}
        </p>
        <button
          type="button"
          disabled={!ready || index === 0}
          onClick={() => onNavigate(index - 1)}
          className="street-step"
          aria-label="Captura anterior"
          title="Captura anterior"
        >
          <ChevronDown size={64} strokeWidth={3} />
        </button>
      </div>
      <div
        role="group"
        aria-label="Controles de la vista de calle"
        className="absolute right-5 bottom-6 z-10 flex flex-col overflow-hidden rounded-xl border border-slate-200/20 bg-slate-900/80 p-1 text-slate-100 shadow-lg backdrop-blur-md"
      >
        <button
          type="button"
          disabled={!ready}
          onClick={() => onZoom(0.5)}
          aria-label="Acercar vista de calle"
          className="tool-button text-slate-100 hover:bg-slate-700 hover:text-slate-50 focus-visible:outline-emerald-300 disabled:opacity-40"
        >
          <Plus size={20} />
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => onZoom(-0.5)}
          aria-label="Alejar vista de calle"
          className="tool-button text-slate-100 hover:bg-slate-700 hover:text-slate-50 focus-visible:outline-emerald-300 disabled:opacity-40"
        >
          <Minus size={20} />
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={onReset}
          aria-label="Restablecer vista de calle"
          className="tool-button text-slate-100 hover:bg-slate-700 hover:text-slate-50 focus-visible:outline-emerald-300 disabled:opacity-40"
        >
          <RotateCcw size={17} />
        </button>
      </div>
    </>
  )
}
