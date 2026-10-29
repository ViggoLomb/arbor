import { mockDetections } from '../../data/mockData'
import type { SelectedTree } from '../../types/tree'
import PanelFrame from './PanelFrame'

export default function TreeTablePanel({
  loaded,
  onSelect,
  onClose,
}: {
  loaded: boolean
  onSelect: (tree: SelectedTree) => void
  onClose: () => void
}) {
  return (
    <PanelFrame
      id="tree-table-panel"
      title="Tabla de árboles"
      onClose={onClose}
    >
      {!loaded ? (
        <p className="text-xs leading-5 text-slate-500">
          Importá y confirmá las detecciones IA para consultar los árboles.
        </p>
      ) : (
        <>
          <p className="mb-4 text-xs text-slate-500">
            40 ejemplares · Escenario de demostración
          </p>
          <table className="w-full text-left text-xs">
            <caption className="sr-only">Árboles detectados por IA</caption>
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {mockDetections.features.map((tree) => (
                <tr
                  key={tree.properties.id}
                  className="border-t border-slate-200/70"
                >
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() =>
                        onSelect({
                          ...tree.properties,
                          coordinates: tree.geometry.coordinates as [
                            number,
                            number,
                          ],
                        })
                      }
                      className="rounded py-1 font-medium text-emerald-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-700"
                    >
                      {tree.properties.id}
                    </button>
                  </td>
                  <td className="text-slate-500">
                    {tree.properties.estado_sanitario}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </PanelFrame>
  )
}
