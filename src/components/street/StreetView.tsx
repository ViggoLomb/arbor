import { useCallback, useMemo, useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { ArrowLeft, LoaderCircle, Tags } from 'lucide-react'
import type { Viewer } from 'mapillary-js'
import 'mapillary-js/dist/mapillary.css'
import StreetImage from './StreetImage'
import type { StreetImageStatus } from './StreetImage'
import StreetMinimap from './StreetMinimap'
import StreetControls from './StreetControls'
import StreetTreeLabels from './StreetTreeLabels'
import { nearestStreetCameras } from '../../data/streetNavigation'
import type { StreetDirection } from '../../data/streetNavigation'
import { streetCameras, type StreetCamera } from '../../data/streetCamera'
import type { SelectedTree } from '../../types/tree'

export default function StreetView({ camera, trees, onCameraChange, onClose }: {
  camera: StreetCamera
  trees: SelectedTree[]
  onCameraChange: (camera: StreetCamera) => void
  onClose: () => void
}) {
  const viewerRef = useRef<Viewer | null>(null)
  const [status, setStatus] = useState<StreetImageStatus | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [bearing, setBearing] = useState(camera.bearing)
  const [labelsVisible, setLabelsVisible] = useState(true)
  const [photoLoaded, setPhotoLoaded] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [transition, setTransition] = useState('')
  const phase = status?.cameraId === camera.id ? status.phase : 'loading'
  const ready = phase === 'ready'
  const loading = phase === 'loading'
  const fallback = phase === 'error' && photoLoaded === camera.id && photoError !== camera.id
  const onStatus = useCallback((next: StreetImageStatus) => setStatus(next), [])
  const neighbors = useMemo(() => nearestStreetCameras(camera, streetCameras, bearing), [camera, bearing])
  const navigate = (direction: StreetDirection) => {
    const neighbor = neighbors[direction]
    if (!neighbor || loading) return
    const next = neighbor.camera
    setBearing(next.bearing)
    setTransition(new Date(next.captured_at).toDateString() !== new Date(camera.captured_at).toDateString()
      ? `Cambio de fecha: ${next.dateLabel}` : '')
    onCameraChange(next)
  }
  const zoom = async (delta: number) => {
    const viewer = viewerRef.current
    if (!viewer || !ready) return
    const value = await viewer.getZoom()
    if (viewerRef.current === viewer) viewer.setZoom(Math.max(0, Math.min(3, value + delta)))
  }
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-x-0 top-15 bottom-0 z-40 bg-slate-950/50" />
        <Dialog.Popup initialFocus={() => document.getElementById('street-back')} finalFocus={() => document.getElementById('tree-photo')}
          data-street-camera-id={camera.id}
          data-street-phase={phase}
          className="street-view fixed inset-x-0 top-15 bottom-0 z-40 overflow-hidden bg-slate-100 text-slate-800 outline-none">
          <Dialog.Title className="sr-only">Vista de calle de {camera.block_selection.street}, Tandil</Dialog.Title>
          <Dialog.Description className="sr-only">Las flechas llevan a la cámara más cercana en cada dirección, sin filtrar por fecha. Las etiquetas de árboles abren su información. Escape vuelve al mapa.</Dialog.Description>
          <StreetImage key={attempt} cameraId={camera.id} viewerRef={viewerRef} onStatus={onStatus} onBearing={setBearing} />
          {!ready && <img key={`photo-${camera.id}`} src={camera.imageUrl} alt={`Captura de ${camera.block_selection.street}, Tandil`}
            onLoad={() => setPhotoLoaded(camera.id)} onError={() => setPhotoError(camera.id)}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover" />}
          <StreetTreeLabels key={`labels-${camera.id}`} camera={camera} trees={trees} viewerRef={viewerRef} ready={ready} fallback={fallback} visible={labelsVisible} />
          <Dialog.Close id="street-back" className="absolute top-4 left-4 z-10 flex h-11 items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/95 px-4 text-xs font-medium text-slate-700 shadow-lg backdrop-blur-md hover:bg-slate-100/95 focus-visible:outline-2 focus-visible:outline-emerald-700"><ArrowLeft size={17} /> Volver al mapa</Dialog.Close>
          <div className="absolute top-4 left-1/2 z-10 max-w-[calc(100%-24rem)] -translate-x-1/2 rounded-2xl border border-slate-200/80 bg-slate-50/95 px-5 py-2 text-center shadow-lg backdrop-blur-md">
            <p className="text-xs font-semibold">{camera.block_selection.street} · Tandil</p>
            <p className="mt-1 text-[11px] text-slate-500">{camera.dateLabel} · Cámaras por proximidad</p>
            <p role="status" aria-live="polite" className="text-[10px] text-slate-500">{transition}</p>
          </div>
          <button type="button" aria-label={labelsVisible ? 'Ocultar etiquetas de árboles' : 'Mostrar etiquetas de árboles'} aria-pressed={labelsVisible} onClick={() => setLabelsVisible(!labelsVisible)}
            className="absolute top-4 right-4 z-10 flex h-11 items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/95 px-4 text-xs font-medium text-slate-700 shadow-lg backdrop-blur-md hover:bg-slate-100/95 focus-visible:outline-2 focus-visible:outline-emerald-700"><Tags size={17} /> Árboles</button>
          {loading && <div role="status" className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-2xl bg-slate-50/95 p-5 text-sm text-slate-700"><LoaderCircle className="animate-spin motion-reduce:animate-none" size={19} /> Cargando captura…</div>}
          {phase === 'error' && <div role="status" className="absolute top-20 left-4 z-10 max-w-70 rounded-xl border border-slate-200/80 bg-slate-50/95 p-3 text-[11px] leading-5 shadow-lg backdrop-blur-md">
            <p>{photoError === camera.id ? 'No se pudo cargar la fotografía. Podés continuar a otra cámara.' : 'Fotografía estática. El visor interactivo no está disponible; podés seguir recorriendo y consultar árboles.'}</p>
            <button type="button" className="mt-1 rounded font-medium text-emerald-700 underline focus-visible:outline-2" onClick={() => { setStatus(null); setAttempt((v) => v + 1) }}>Reintentar visor</button>
          </div>}
          <StreetMinimap camera={camera} bearing={bearing} />
          <StreetControls ready={ready} loading={loading} neighbors={neighbors} onNavigate={navigate} onZoom={(delta) => void zoom(delta)} onReset={() => { viewerRef.current?.setZoom(0); viewerRef.current?.setCenter([.5, .5]) }} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
