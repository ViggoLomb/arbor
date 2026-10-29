import { Camera, Save } from 'lucide-react'
import type { SelectedTree } from '../../types/tree'

type TreeDetailsFormProps = {
  tree: SelectedTree
  onSave: (id: string) => void
}

const fieldClassName = 'mt-2 h-11 w-full rounded-xl border border-slate-200/60 bg-slate-50 px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600'

export default function TreeDetailsForm({ tree, onSave }: TreeDetailsFormProps) {
  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => { event.preventDefault(); onSave(tree.id) }}
    >
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
        <div role="img" aria-label="Foto de demostración del árbol, sin imagen disponible" className="flex h-28 flex-col items-center justify-center gap-2 rounded-2xl bg-slate-200/70 text-slate-500">
          <Camera size={28} strokeWidth={1.5} aria-hidden="true" />
          <span className="text-xs">Foto del ejemplar · Demostración</span>
        </div>

        <div>
          <label htmlFor="tree-species" className="text-sm font-medium text-slate-700">Especie</label>
          <input id="tree-species" name="especie" type="text" required defaultValue={tree.especie} placeholder="Ej.: Jacarandá" className={fieldClassName} />
        </div>

        <div>
          <label htmlFor="tree-dap" className="text-sm font-medium text-slate-700">DAP (cm)</label>
          <input id="tree-dap" name="dap" type="number" min="0.1" step="0.1" inputMode="decimal" placeholder="Ej.: 32" className={fieldClassName} />
        </div>

        <div>
          <label htmlFor="tree-health" className="text-sm font-medium text-slate-700">Estado Sanitario</label>
          <select id="tree-health" name="estado_sanitario" defaultValue={tree.estado_sanitario} className={fieldClassName}>
            <option value="Bueno">Bueno</option>
            <option value="Regular">Regular</option>
            <option value="Malo">Malo</option>
          </select>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Interferencias</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {['Cables', 'Vereda', 'Luminarias'].map((interference) => (
              <label key={interference} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <input type="checkbox" name="interferencias" value={interference} className="size-4 rounded accent-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600" />
                {interference}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <footer className="shrink-0 border-t border-slate-200/80 p-4">
        <button type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-800 px-5 text-sm font-medium text-slate-50 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600">
          <Save size={17} aria-hidden="true" /> Guardar Ficha
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">Guardado de demostración</p>
      </footer>
    </form>
  )
}
