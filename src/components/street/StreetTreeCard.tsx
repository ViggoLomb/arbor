import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { StreetTreeInfo } from '../../data/streetTrees'
import { formatHeight } from '../../data/treeHeight'

export default function StreetTreeCard({ tree, onClose }: { tree: StreetTreeInfo; onClose: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus()
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener('keydown', escape, true)
    return () => window.removeEventListener('keydown', escape, true)
  }, [onClose])
  return (
    <section aria-labelledby="street-tree-title" data-street-tree-card={tree.id}
      className="absolute top-22 right-4 z-20 max-h-[calc(100%-17rem)] w-80 max-w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-slate-200/70 bg-slate-50/95 p-5 text-slate-800 shadow-xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">{tree.kind === 'group' ? 'Arbolado en esta captura' : 'Árbol en esta captura'}</p>
          <h2 ref={heading} id="street-tree-title" tabIndex={-1} className="mt-1 rounded text-lg font-semibold outline-none">{tree.label}</h2>
          <p className="mt-1 text-xs text-slate-500">{tree.calle} · Campaña {tree.campaign}</p>
        </div>
        <button type="button" aria-label="Cerrar información del árbol" onClick={onClose} className="tool-button"><X size={18} /></button>
      </div>
      {tree.kind !== 'group' && <dl className="mt-4 space-y-3 text-xs">
        {[
          ['Altura', formatHeight(tree.height.valueM)],
          ['Especie', tree.census.especie || 'Sin relevar'],
          ['DAP', tree.census.dap_cm === null ? 'Sin medir' : `${tree.census.dap_cm} cm`],
          ['Estado sanitario', tree.census.estado_sanitario ?? 'Sin relevar'],
          ...Object.entries(tree.census.interferencias).map(([name, value]) =>
            [name, value === null ? 'Sin evaluar' : value ? 'Presenta interferencia' : 'Sin interferencia']),
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-slate-200/60 pb-2">
            <dt className="text-slate-500">{label}</dt><dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>}
      {tree.census.observaciones && <p className="mt-3 whitespace-pre-wrap text-xs leading-5">{tree.census.observaciones}</p>}
    </section>
  )
}
