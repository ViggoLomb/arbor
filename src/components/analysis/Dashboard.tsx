import { ClipboardList, Scan, TreePine } from 'lucide-react'
import { studyAreaHa } from '../../data/geography'
import type { SelectedTree } from '../../types/tree'
export default function Dashboard({ trees }: { trees: SelectedTree[] }) {
  const total = trees.length
  const averageHeight = total ? trees.reduce((sum, tree) => sum + tree.height.valueM, 0) / total : null
  const pending = trees.filter(
    (tree) => tree.census.estado_sanitario === null,
  ).length
  const distribution = [
    { state: 'Bueno', color: 'bg-emerald-500' },
    { state: 'Regular', color: 'bg-amber-500' },
    { state: 'Malo', color: 'bg-rose-500' },
    { state: 'Sin relevar', color: 'bg-slate-300' },
  ].map((segment) => {
    const count = trees.filter(
      (tree) =>
        (tree.census.estado_sanitario ?? 'Sin relevar') === segment.state,
    ).length
    return { ...segment, count, percentage: total ? (count / total) * 100 : 0 }
  })
  return (
    <section aria-labelledby="dashboard-title" className="space-y-4">
      <div>
        <h3
          id="dashboard-title"
          className="text-sm font-semibold text-slate-800"
        >
          Resumen territorial
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          agrotech ·{' '}
          {new Set(trees.map((tree) => tree.campaign)).size > 1
            ? 'Todas las campañas'
            : `Campaña ${trees[0]?.campaign ?? 'sin datos'}`}
        </p>
      </div>
      <dl className="space-y-3">
        {[
          { name: 'Candidatos detectados', value: total, Icon: TreePine },
          {
            name: 'Estado sanitario pendiente',
            value: pending,
            Icon: ClipboardList,
          },
          { name: 'Área de estudio', value: `${studyAreaHa} ha`, Icon: Scan },
        ].map(({ name, value, Icon }) => (
          <div
            key={name}
            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <dt className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
              {name}
              <Icon size={17} className="text-slate-400" aria-hidden="true" />
            </dt>
            <dd className="mt-2 text-2xl font-semibold tracking-tight text-slate-800 tabular-nums">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-slate-200/80 pt-4">
        <h4 className="mb-2 text-xs font-medium text-slate-700">Alturas</h4>
        <p className="text-xs leading-5 text-slate-600">
          {total} alturas registradas · Promedio {averageHeight === null ? '—' : `${averageHeight.toLocaleString('es-AR', { maximumFractionDigits: 1 })} m`}
        </p>
      </div>
      <div className="border-t border-slate-200/80 pt-4">
        <h4 className="mb-3 text-xs font-medium text-slate-700">
          Estado sanitario
        </h4>
        <div
          role="img"
          aria-label={`Distribución sanitaria: ${distribution.map((segment) => `${segment.state}, ${segment.count}`).join('; ')}`}
          className="flex h-3 overflow-hidden rounded-full bg-slate-200"
        >
          {distribution.map((segment) => (
            <div
              key={segment.state}
              aria-hidden="true"
              className={`h-full basis-0 ${segment.color}`}
              style={{ flexGrow: segment.count }}
            />
          ))}
        </div>
        <ul
          aria-label="Detalle del estado sanitario"
          className="mt-3 space-y-2 text-xs text-slate-600"
        >
          {distribution.map((segment) => (
            <li
              key={segment.state}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`size-2.5 rounded-full ${segment.color}`}
                />
                {segment.state}
              </span>
              <span className="font-medium tabular-nums">
                {segment.count} · {Math.round(segment.percentage)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
