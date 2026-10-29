import { useState } from 'react'
import type { SelectedTree } from '../../types/tree'
import {
  formatHeight,
  isValidHeight,
} from '../../data/treeHeight'

export default function TreeHeightField({ tree }: { tree: SelectedTree }) {
  const [entered, setEntered] = useState(tree.census.altura_m?.toString() ?? '')
  const value = entered.trim() ? Number(entered) : null
  const height = isValidHeight(value)
    ? { valueM: value, source: 'entered' as const }
    : { valueM: tree.heightEstimate.valueM, source: 'simulated' as const }
  return (
    <fieldset className="rounded-xl border border-slate-200/70 bg-slate-100/70 p-3">
      <legend className="px-1 text-xs font-medium text-slate-700">
        Altura del árbol
      </legend>
      <div aria-live="polite" className="mb-3 flex items-baseline justify-between gap-2">
        <span className="text-lg font-semibold text-slate-800 tabular-nums">
          {formatHeight(height.valueM)}
        </span>
      </div>
      <label htmlFor="tree-height" className="text-xs text-slate-700">
        Corregir altura (m)
      </label>
      <input
        id="tree-height"
        name="altura"
        type="number"
        min="0.1"
        step="0.1"
        value={entered}
        onChange={(event) => setEntered(event.target.value)}
        placeholder={formatHeight(tree.heightEstimate.valueM)}
        aria-describedby="tree-height-help"
        className="mt-2 h-10 w-full rounded-xl border border-slate-200/60 bg-slate-50 px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-600"
      />
      {entered !== '' && (
        <button
          type="button"
          onClick={() => setEntered('')}
          className="mt-2 rounded text-xs font-medium text-emerald-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-emerald-600"
        >
          Restablecer altura
        </button>
      )}
      <p id="tree-height-help" className="mt-2 text-[11px] leading-5 text-slate-500">
        Guardá la ficha para conservar los cambios. Dejá el campo vacío para usar la altura registrada.
      </p>
    </fieldset>
  )
}
