import { useEffect, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Download, LoaderCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import type { BasemapId } from '../../data/basemaps'
import { metric, type StudySummary } from '../../data/studyAnalysis'
import type { BlockCatalog } from '../../types/study'
import { nearestTreeCamera } from '../../data/trees'
import type { SelectedTree } from '../../types/tree'
import Dashboard from '../analysis/Dashboard'
import { renderReportMap, type ReportMapImage } from './renderReportMap'
import { createReportPdf, reportFilename, type ReportPhoto } from './reportPdf'

function photoCredit(tree: SelectedTree) {
  const camera = nearestTreeCamera(tree)
  return `${camera?.creator.username ?? 'Mapillary'} / Mapillary · CC BY-SA 4.0 · Recorte · ${camera?.view_url ?? ''}`
}
async function loadPhoto(tree: SelectedTree): Promise<ReportPhoto> {
  const image = new Image()
  image.src = `${import.meta.env.BASE_URL}${tree.photoPath.replace(/^\//, '')}`
  await image.decode()
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, 1000 / Math.max(image.width, image.height))
  canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale)
  canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height)
  return { label: `${tree.label} · ${tree.campaign}`, url: canvas.toDataURL('image/jpeg', .88), credit: photoCredit(tree) }
}
export default function ReportDialog({ project, summary, basemap, blocks, onClose }: {
  project: string; summary: StudySummary; basemap: BasemapId; blocks: BlockCatalog | null; onClose: () => void
}) {
  const [snapshot] = useState(() => ({ project, summary, generatedAt: new Date().toISOString() }))
  const [map, setMap] = useState<ReportMapImage | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [includePhotos, setIncludePhotos] = useState(false)
  const photos = snapshot.summary.trees.slice(0, 6)
  useEffect(() => {
    const controller = new AbortController()
    renderReportMap(snapshot.summary, basemap, blocks, controller.signal).then((result) => {
      if (!controller.signal.aborted) { setMap(result); setError(false) }
    }).catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [snapshot, basemap, blocks, attempt])
  const download = async () => {
    if (!map || generating) return
    setGenerating(true)
    try {
      const images = includePhotos ? await Promise.all(photos.map(loadPhoto)) : []
      const pdf = await createReportPdf(snapshot, map, images)
      pdf.save(reportFilename(snapshot.summary.area.name))
      toast.success('Informe PDF descargado')
    } catch { toast.error('No se pudo generar el PDF', { description: 'Reintentá la descarga. El informe sigue disponible.' }) }
    finally { setGenerating(false) }
  }
  return <Dialog.Root open onOpenChange={(open) => { if (!open) onClose() }}>
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/25 backdrop-blur-sm" />
      <Dialog.Popup className="fixed inset-3 z-60 mx-auto flex max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/98 text-slate-800 shadow-2xl outline-none sm:inset-6">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0"><Dialog.Title className="font-semibold">Informe de arbolado</Dialog.Title><Dialog.Description className="mt-1 truncate text-xs text-slate-500">{snapshot.project} · {snapshot.summary.area.name}</Dialog.Description></div>
          <button type="button" onClick={download} disabled={!map || generating} className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-medium text-emerald-50 disabled:opacity-50">{generating ? <LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" /> : <Download size={16} />} Descargar PDF</button>
          <Dialog.Close aria-label="Cerrar informe" className="rounded-lg p-2 hover:bg-slate-200/70"><X size={20} /></Dialog.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <p className="mb-4 text-xs text-slate-500">Emitido: {new Date(snapshot.generatedAt).toLocaleString('es-AR')} · Superficie: {metric(snapshot.summary.areaM2 / 10000, 2)} ha</p>
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_18rem]">
            <div className="space-y-5">
              <figure className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {map ? <img src={map.url} alt={`Área seleccionada ${snapshot.summary.area.name}, con los registros incluidos, escala y orientación norte`} className="aspect-[8/5] w-full object-contain" /> : <div role="status" className="flex aspect-[8/5] items-center justify-center gap-2 text-xs text-slate-500">{error ? <button type="button" onClick={() => { setError(false); setAttempt(attempt + 1) }} className="underline">No se pudo preparar el mapa. Reintentar</button> : <><LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" /> Preparando recorte del área…</>}</div>}
                {map && <figcaption className="px-3 py-2 text-[10px] text-slate-500">{map.kind === 'map' ? 'Recorte cartográfico' : 'Plano del área'} · {map.credits}</figcaption>}
              </figure>
              {!!photos.length && <div><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={includePhotos} onChange={(event) => setIncludePhotos(event.target.checked)} /> Incluir fotografías de referencia ({photos.length})</label>{includePhotos && <div className="mt-3 grid grid-cols-3 gap-2">{photos.map((tree) => <figure key={tree.id}><img src={`${import.meta.env.BASE_URL}${tree.photoPath.replace(/^\//, '')}`} alt={`Registro ${tree.label}`} className="h-28 w-full rounded-lg object-cover" /><figcaption className="mt-1 text-[10px] text-slate-500">{tree.label} · {tree.campaign}<span className="mt-1 block break-words">{photoCredit(tree)}</span></figcaption></figure>)}</div>}</div>}
              <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full text-left text-[11px]"><caption className="px-3 py-3 text-left text-sm font-semibold">Detalle de registros ({snapshot.summary.trees.length})</caption><thead className="bg-slate-100 text-slate-600"><tr>{['ID', 'Año', 'Especie', 'Altura', 'DAP', 'Estado'].map((title) => <th key={title} scope="col" className="px-3 py-2 font-medium">{title}</th>)}</tr></thead><tbody>{snapshot.summary.trees.map((tree) => <tr key={tree.id} className="border-t border-slate-200/70"><td className="px-3 py-2">{tree.label}</td><td className="px-3 py-2">{tree.campaign}</td><td className="px-3 py-2">{tree.census.especie || 'Sin relevar'}</td><td className="px-3 py-2">{metric(tree.height.valueM)} m</td><td className="px-3 py-2">{tree.census.dap_cm === null ? '—' : `${metric(tree.census.dap_cm)} cm`}</td><td className="px-3 py-2">{tree.census.estado_sanitario ?? 'Sin relevar'}</td></tr>)}</tbody></table></div>
            </div>
            <Dashboard summary={snapshot.summary} />
          </div>
        </div>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
}
