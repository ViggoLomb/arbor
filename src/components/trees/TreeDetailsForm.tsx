import type {
  CensusFields,
  SelectedTree,
  EstadoSanitario,
} from '../../types/tree'
const fieldClass =
  'mt-2 h-10 w-full rounded-xl border border-slate-200/60 bg-slate-50 px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-600'
export default function TreeDetailsForm({
  tree,
  onSave,
}: {
  tree: SelectedTree
  onSave: (id: string, census: CensusFields) => void
}) {
  const census = tree.census
  return (
    <form
      id="tree-census-form"
      autoComplete="off"
      onSubmit={(event) => {
        event.preventDefault()
        const fields = new FormData(event.currentTarget)
        const dap = String(fields.get('dap') ?? '').trim()
        const interference = (name: string) =>
          fields.get(name) === '' ? null : fields.get(name) === 'yes'
        onSave(tree.id, {
          especie: String(fields.get('especie') ?? '').trim(),
          dap_cm: dap ? Number(dap) : null,
          estado_sanitario: (fields.get('estado') ||
            null) as EstadoSanitario | null,
          interferencias: {
            Cables: interference('Cables'),
            Vereda: interference('Vereda'),
            Luminarias: interference('Luminarias'),
          },
          observaciones: String(fields.get('observaciones') ?? '').trim(),
        })
      }}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="tree-species"
          className="text-xs font-medium text-slate-700"
        >
          Especie
        </label>
        <input
          id="tree-species"
          name="especie"
          type="text"
          defaultValue={census.especie}
          placeholder="Sin relevar"
          className={fieldClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="tree-dap"
            className="text-xs font-medium text-slate-700"
          >
            DAP (cm)
          </label>
          <input
            id="tree-dap"
            name="dap"
            type="number"
            min="0.1"
            step="0.1"
            defaultValue={census.dap_cm ?? ''}
            placeholder="Sin medir"
            className={fieldClass}
          />
        </div>
        <div>
          <label
            htmlFor="tree-health"
            className="text-xs font-medium text-slate-700"
          >
            Estado sanitario
          </label>
          <select
            id="tree-health"
            name="estado"
            defaultValue={census.estado_sanitario ?? ''}
            className={fieldClass}
          >
            <option value="">Sin relevar</option>
            <option value="Bueno">Bueno</option>
            <option value="Regular">Regular</option>
            <option value="Malo">Malo</option>
          </select>
        </div>
      </div>
      <fieldset>
        <legend className="mb-2 text-xs font-medium text-slate-700">
          Interferencias
        </legend>
        <div className="space-y-2">
          {(['Cables', 'Vereda', 'Luminarias'] as const).map((name) => (
            <div
              key={name}
              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2"
            >
              <label
                htmlFor={`tree-${name}`}
                className="text-xs text-slate-600"
              >
                {name}
              </label>
              <select
                id={`tree-${name}`}
                name={name}
                defaultValue={
                  census.interferencias[name] === null
                    ? ''
                    : census.interferencias[name]
                      ? 'yes'
                      : 'no'
                }
                className="h-8 rounded-lg border border-slate-200/60 bg-slate-50 px-2 text-xs text-slate-700 focus-visible:outline-2 focus-visible:outline-emerald-600"
              >
                <option value="">Sin evaluar</option>
                <option value="yes">Presenta</option>
                <option value="no">No presenta</option>
              </select>
            </div>
          ))}
        </div>
      </fieldset>
      <div>
        <label
          htmlFor="tree-notes"
          className="text-xs font-medium text-slate-700"
        >
          Observaciones
        </label>
        <textarea
          id="tree-notes"
          name="observaciones"
          defaultValue={census.observaciones}
          placeholder="Agregá notas del relevamiento…"
          className={`${fieldClass} h-20 resize-y py-3`}
        />
      </div>
      <p className="text-[11px] leading-5 text-slate-500">
        Los campos pendientes requieren relevamiento. La detección no determina
        especie, DAP ni diagnóstico sanitario.
      </p>
    </form>
  )
}
