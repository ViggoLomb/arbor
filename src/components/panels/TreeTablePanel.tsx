import { useState } from 'react'
import type { SelectedTree } from '../../types/tree'
import PanelFrame from './PanelFrame'
export default function TreeTablePanel({
  trees,
  onSelect,
  onClose,
}: {
  trees: SelectedTree[]
  onSelect: (tree: SelectedTree) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const matching = trees.filter((tree) =>
    `${tree.label} ${tree.census.especie} ${tree.calle}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase()),
  )
  const pages = Math.max(1, Math.ceil(matching.length / 50))
  const current = Math.min(page, pages - 1)
  return (
    <PanelFrame
      id="tree-table-panel"
      title="Tabla de árboles"
      onClose={onClose}
    >
      <p className="mb-4 text-xs text-slate-600">
        {trees.length} candidatos ·{' '}
        {new Set(trees.map((tree) => tree.campaign)).size > 1
          ? 'Todas las campañas'
          : `Campaña ${trees[0]?.campaign ?? 'sin datos'}`}
      </p>
      <label className="text-xs text-slate-600" htmlFor="tree-filter">
        Buscar por ID, especie o calle
      </label>
      <input
        id="tree-filter"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setPage(0)
        }}
        className="mt-2 mb-4 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"
      />
      <table className="w-full text-left text-xs">
        <caption className="sr-only">
          Detecciones del arbolado de Tandil
        </caption>
        <thead>
          <tr>
            <th className="pb-2">ID</th>
            <th className="pb-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {matching.slice(current * 50, (current + 1) * 50).map((tree) => (
            <tr key={tree.id} className="border-t border-slate-200/70">
              <td className="py-2">
                <button
                  type="button"
                  onClick={() => onSelect(tree)}
                  className="rounded py-1 font-medium text-emerald-700 hover:underline focus-visible:outline-2"
                >
                  {tree.label}
                </button>
              </td>
              <td className="text-slate-600">
                {tree.census.estado_sanitario ?? 'Sin relevar'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!matching.length && (
        <p role="status" className="py-5 text-xs text-slate-600">
          Sin resultados.
        </p>
      )}
      <nav
        aria-label="Paginación del inventario"
        className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-700"
      >
        <button
          type="button"
          disabled={current === 0}
          onClick={() => setPage(current - 1)}
          className="rounded-lg bg-slate-100 p-2 disabled:opacity-40"
        >
          Anterior
        </button>
        <span>
          {current + 1} / {pages}
        </span>
        <button
          type="button"
          disabled={current + 1 === pages}
          onClick={() => setPage(current + 1)}
          className="rounded-lg bg-slate-100 p-2 disabled:opacity-40"
        >
          Siguiente
        </button>
      </nav>
    </PanelFrame>
  )
}
