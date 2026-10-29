import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export default function PanelFrame({
  id,
  title,
  children,
  onClose,
}: {
  id: string
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <aside
      id={id}
      aria-labelledby={`${id}-title`}
      className="floating-panel absolute top-19 bottom-auto left-3 z-20 max-h-[calc(100dvh-7rem)] w-72 max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl border border-slate-200/70 bg-slate-50/95 shadow-xl shadow-slate-900/10 backdrop-blur-xl sm:left-4"
    >
      <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-3">
        <h2 id={`${id}-title`} className="text-sm font-semibold text-slate-800">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Cerrar ${title.toLowerCase()}`}
          className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-emerald-700"
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </aside>
  )
}
