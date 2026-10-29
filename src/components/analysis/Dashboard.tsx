import { metric, type StudySummary } from '../../data/studyAnalysis'

export default function Dashboard({ summary: s }: { summary: StudySummary }) {
  const total = s.trees.length
  return <section aria-label="Resumen territorial" className="space-y-4 text-xs text-slate-600">
    <div><h3 className="text-sm font-semibold text-slate-800">{s.area.name}</h3><p className="mt-1">{s.campaign === 'all' ? 'Campañas 2018 y 2019' : `Campaña ${s.campaign}`}</p></div>
    {s.coverage !== 'records' && <p role="status" className="rounded-xl bg-amber-50 p-3 leading-5 text-amber-900">{s.coverage === 'unavailable' ? 'Sin relevamiento disponible para esta zona.' : 'Sin registros en el área para la campaña seleccionada.'}</p>}
    <dl className="grid grid-cols-2 gap-2">
      {[
        ['Registros incluidos', total], ['Superficie delimitada', `${metric(s.areaM2 / 10000, 2)} ha`],
        ['Fichas completas', s.complete], ['Fichas pendientes', total - s.complete],
      ].map(([name, value]) => <div key={name} className="rounded-xl border border-slate-200/60 bg-slate-100/70 p-3"><dt className="text-[10px] text-slate-500">{name}</dt><dd className="mt-2 text-xl font-semibold text-slate-800 tabular-nums">{value}</dd></div>)}
    </dl>
    <p className="text-[11px] leading-5">Perímetro: {metric(s.perimeterM, 0)} m · Franja exterior: {s.area.bufferM} m. {s.interiorCount} registros dentro del polígono y {total - s.interiorCount} en la franja o incluidos manualmente.</p>
    <div className="space-y-2 border-t border-slate-200 pt-3"><h4 className="font-semibold text-slate-700">Por campaña</h4>
      {s.byCampaign.map((year) => <p key={year.year}>{year.year}: <strong>{year.count}</strong> registros · {metric(year.perHa)} interiores/ha</p>)}
      <p className="text-[10px] leading-4 text-slate-500">Cada año se analiza por separado. Los registros de distintas campañas pueden corresponder al mismo árbol.</p>
    </div>
    <div className="space-y-2 border-t border-slate-200 pt-3"><h4 className="font-semibold text-slate-700">Alturas y DAP</h4>
      <p>{s.heights ? `Altura media: ${metric(s.heights.mean)} m · mín. ${metric(s.heights.min)} · máx. ${metric(s.heights.max)} (${s.heights.count} registros)` : 'Alturas: sin registros.'}</p>
      <p>{s.dap ? `DAP medio: ${metric(s.dap.mean)} cm · mín. ${metric(s.dap.min)} · máx. ${metric(s.dap.max)} (${s.dap.count} mediciones)` : 'DAP: sin mediciones registradas.'}</p>
    </div>
    {([['Estado sanitario', s.health], ['Especies', s.species]] as const).map(([title, entries]) => <div key={title} className="border-t border-slate-200 pt-3"><h4 className="mb-2 font-semibold text-slate-700">{title}</h4>
      {!entries.length && <p>Sin registros.</p>}
      <ul className="space-y-2">{entries.map(([name, count]) => <li key={name}><div className="flex justify-between gap-3"><span className="break-words">{name}</span><span className="shrink-0 tabular-nums">{count} · {metric(count / total * 100, 0)}%</span></div><div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-emerald-600/70" style={{ width: `${count / total * 100}%` }} /></div></li>)}</ul>
    </div>)}
    <div className="space-y-2 border-t border-slate-200 pt-3"><h4 className="font-semibold text-slate-700">Interferencias</h4>{s.interference.map((item) => <p key={item.name}><strong>{item.name}</strong>: {item.present} presentan · {item.absent} no presentan · {item.pending} sin evaluar</p>)}</div>
  </section>
}
