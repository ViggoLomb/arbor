import { Scan, TreePine, TriangleAlert } from 'lucide-react'
import { mockDetections } from '../../data/mockData'

const trees = mockDetections.features
const total = trees.length
const critical = trees.filter((tree) => tree.properties.estado_sanitario === 'Malo').length
const distribution = [
  { state: 'Bueno', color: 'bg-emerald-500' },
  { state: 'Regular', color: 'bg-amber-500' },
  { state: 'Malo', color: 'bg-rose-500' },
].map((segment) => {
  const count = trees.filter((tree) => tree.properties.estado_sanitario === segment.state).length
  return { ...segment, count, percentage: total > 0 ? count / total * 100 : 0 }
})

export default function Dashboard() {
  return (
    <section aria-labelledby="dashboard-title" className="space-y-4">
      <div>
        <h3 id="dashboard-title" className="text-sm font-semibold text-slate-800">Resumen territorial</h3>
        <p className="mt-1 text-xs text-slate-500">Datos simulados del censo</p>
      </div>

      <dl className="space-y-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <dt className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
            Total Censados <TreePine size={17} className="text-slate-400" aria-hidden="true" />
          </dt>
          <dd className="mt-2 text-2xl font-semibold tracking-tight text-slate-800 tabular-nums">{total}</dd>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <dt className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
            Riesgo Crítico <TriangleAlert size={17} className="text-rose-500" aria-hidden="true" />
          </dt>
          <dd className="mt-2 text-2xl font-semibold tracking-tight text-rose-600 tabular-nums">{critical}</dd>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <dt className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
            Área Cubierta <Scan size={17} className="text-slate-400" aria-hidden="true" />
          </dt>
          <dd className="mt-2 text-2xl font-semibold tracking-tight text-slate-800 tabular-nums">12.4 <span className="text-sm font-medium text-slate-500">ha</span></dd>
        </div>
      </dl>

      <div className="border-t border-slate-200/80 pt-4">
        <h4 className="mb-3 text-xs font-medium text-slate-700">Estado sanitario</h4>
        <div
          role="img"
          aria-label={`Distribución sanitaria: ${distribution.map((segment) => `${segment.state}, ${segment.count} árboles (${Math.round(segment.percentage)}%)`).join('; ')}.`}
          className="flex h-3 overflow-hidden rounded-full bg-slate-200"
        >
          {distribution.map((segment) => (
            <div key={segment.state} aria-hidden="true" title={`${segment.state}: ${segment.percentage}%`} className={`h-full basis-0 ${segment.color}`} style={{ flexGrow: segment.count }} />
          ))}
        </div>
        <ul aria-label="Detalle del estado sanitario" className="mt-3 space-y-2 text-xs text-slate-600">
          {distribution.map((segment) => (
            <li key={segment.state} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2"><span aria-hidden="true" className={`size-2.5 rounded-full ${segment.color}`} />{segment.state}</span>
              <span className="font-medium tabular-nums">{segment.count} · {Math.round(segment.percentage)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
