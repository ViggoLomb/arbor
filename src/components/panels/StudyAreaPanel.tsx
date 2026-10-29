import { useState } from 'react'
import { Check, MapPin, Pencil, Trash2, Undo2 } from 'lucide-react'
import type { BlockCatalog, Coordinate, StudyArea, StudyMode } from '../../types/study'
import type { CampaignFilter, SelectedTree } from '../../types/tree'
import { containsStudyPoint, polygonAreaM2, distanceToBoundary } from '../../data/studyGeometry'
import { selectStudyTrees, metric } from '../../data/studyAnalysis'
import PanelFrame from './PanelFrame'

const field = 'mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-600'
export default function StudyAreaPanel({ area, mode, vertices, catalog, catalogError, campaign, trees, onMode, onKnown, onChooseBlock, onUndo, onFinish, onChange, onConfirm, onRemove, onClose, onCampaign, onRetry }: {
  area: StudyArea | null; mode: StudyMode | null; vertices: Coordinate[]
  catalog: BlockCatalog | null; catalogError: boolean; campaign: CampaignFilter; trees: SelectedTree[]
  onMode: (mode: StudyMode) => void; onKnown: () => void; onChooseBlock: (id: string) => void
  onUndo: () => void; onFinish: () => void; onChange: (area: StudyArea) => void
  onConfirm: () => void; onRemove: () => void; onClose: () => void
  onCampaign: (campaign: CampaignFilter) => void; onRetry: () => void
}) {
  const [query, setQuery] = useState('')
  const [review, setReview] = useState(false)
  const selected = area ? selectStudyTrees(area, trees) : []
  const eligible = area ? trees.filter((tree) => containsStudyPoint(area, tree.coordinates) || area.includedIds.includes(tree.id)) : []
  const matches = query.trim() ? catalog?.features.filter((f) => `${f.properties.name} ${f.properties.code}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : []
  return (
    <PanelFrame id="study-panel" title="Área de estudio" onClose={onClose}>
      <p className="mb-3 text-xs leading-5 text-slate-500">Elegí una manzana, una cuadra o dibujá la zona que querés analizar.</p>
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
        {([['block', 'Manzana'], ['street', 'Cuadra'], ['polygon', 'Dibujar']] as const).map(([value, label]) => (
          <button key={value} type="button" aria-pressed={mode === value} onClick={() => onMode(value)}
            className={`rounded-lg px-1 py-2 text-[11px] font-medium focus-visible:outline-2 focus-visible:outline-emerald-600 ${mode === value ? 'bg-slate-50 text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'}`}>{label}</button>
        ))}
      </div>
      {mode && <p role="status" className="mt-3 rounded-xl bg-emerald-50/80 p-3 text-xs leading-5 text-emerald-800">
        {mode === 'polygon' ? `Marcá los vértices en el mapa. ${vertices.length} puntos. Cerrá con doble clic o Finalizar.` : mode === 'street' ? 'Hacé clic dentro de una manzana, cerca del lado que querés estudiar. Se marca ese tramo y una franja de 40 m para calle y veredas.' : 'Hacé clic dentro de una manzana para marcarla.'}
      </p>}
      {mode === 'polygon' && <div className="mt-2 flex gap-2">
        <button type="button" onClick={onUndo} disabled={!vertices.length} className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-2 text-xs disabled:opacity-40"><Undo2 size={14} /> Deshacer</button>
        <button type="button" onClick={onFinish} disabled={vertices.length < 3} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-medium text-emerald-50 disabled:opacity-40">Finalizar dibujo</button>
      </div>}
      <button type="button" onClick={onKnown} className="mt-4 flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-left text-xs font-medium text-slate-700 hover:bg-slate-100">
        <MapPin size={16} className="shrink-0 text-emerald-700" /> Manzana del relevamiento
      </button>
      {catalogError ? <p className="mt-2 text-xs leading-5 text-slate-500">No se pudo cargar el catálogo. Podés dibujar la zona o <button type="button" onClick={onRetry} className="text-emerald-700 underline">reintentar</button>.</p> :
        <p className="mt-2 text-[10px] leading-4 text-slate-500">{catalog ? `${catalog.features.length.toLocaleString('es-AR')} manzanas · IDE Tandil` : 'Cargando cartografía de Tandil…'}</p>}
      <p className="mt-1 text-[10px] leading-4 text-slate-500">Límites construidos desde el parcelario municipal. Para ajustar el contorno, usá Dibujar.</p>
      <label className="mt-3 block text-xs text-slate-600" htmlFor="block-search">Buscar manzana o código catastral</label>
      <input id="block-search" className={field} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej.: Manzana 30" />
      {!!matches?.length && <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200">{matches.map((f) => <button key={f.properties.id} type="button" onClick={() => { onChooseBlock(f.properties.id); setQuery('') }} className="block w-full border-b border-slate-100 px-2 py-2 text-left text-[11px] hover:bg-emerald-50">{f.properties.name}<span className="block text-[9px] text-slate-400">{f.properties.code}</span></button>)}</div>}
      {area && <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
        <label className="block text-xs font-medium text-slate-700" htmlFor="study-name">Nombre del área
          <input id="study-name" className={field} key={area.id} defaultValue={area.name} maxLength={160} onBlur={(event) => onChange({ ...area, name: event.target.value.trim() || area.name })} />
        </label>
        <div className="flex justify-between text-xs"><span className="text-slate-500">Superficie delimitada</span><strong>{metric(polygonAreaM2(area.geometry) / 10000, 2)} ha</strong></div>
        <label className="block text-xs text-slate-600" htmlFor="study-buffer">Franja exterior para veredas (m)
          <input id="study-buffer" className={field} type="number" min={0} max={30} step={1} value={area.bufferM} onChange={(event) => {
            const value = Number(event.target.value); if (Number.isFinite(value) && value >= 0 && value <= 30) onChange({ ...area, bufferM: value })
          }} />
        </label>
        <label className="block text-xs text-slate-600" htmlFor="study-campaign">Campaña del análisis
          <select id="study-campaign" className={field} value={campaign} onChange={(event) => onCampaign(event.target.value as CampaignFilter)}><option value="all">Todas · Separadas por año</option><option value="2019">2019</option><option value="2018">2018</option></select>
        </label>
        <button type="button" onClick={() => setReview(!review)} aria-expanded={review} className="flex w-full items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700"><span>Revisar registros incluidos</span><span>{selected.length}</span></button>
        {review && <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-2">
          {!eligible.length && <p className="text-[11px] text-slate-500">Sin registros en esta selección.</p>}
          {eligible.map((tree) => <label key={tree.id} className="flex items-center gap-2 text-[11px]"><input type="checkbox" checked={!area.excludedIds.includes(tree.id)} onChange={(event) => onChange({ ...area, excludedIds: event.target.checked ? area.excludedIds.filter((id) => id !== tree.id) : [...area.excludedIds, tree.id] })} /><span>{tree.label}</span><span className="ml-auto text-[9px] text-slate-400">{distanceToBoundary(tree.coordinates, area.geometry) < area.bufferM + 3 ? 'Borde' : ''}</span></label>)}
          <label className="block text-[10px] text-slate-500" htmlFor="study-add-tree">Añadir registro a la zona</label>
          <select id="study-add-tree" className={field} value="" onChange={(event) => { if (event.target.value) onChange({ ...area, includedIds: [...area.includedIds, event.target.value], excludedIds: area.excludedIds.filter((id) => id !== event.target.value) }) }}><option value="">Seleccionar registro…</option>{trees.filter((t) => !eligible.some((e) => e.id === t.id)).map((t) => <option key={t.id} value={t.id}>{t.label} · {t.calle}</option>)}</select>
        </div>}
        <button type="button" onClick={onConfirm} className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-slate-800 text-xs font-medium text-slate-50 hover:bg-slate-700"><Check size={16} /> Confirmar área y analizar</button>
        <div className="flex justify-between gap-2"><button type="button" onClick={() => onMode('polygon')} className="flex items-center gap-1 text-[11px] text-slate-600"><Pencil size={13} /> Redibujar</button><button type="button" onClick={onRemove} className="flex items-center gap-1 text-[11px] text-slate-600"><Trash2 size={13} /> Quitar área</button></div>
      </div>}
    </PanelFrame>
  )
}
