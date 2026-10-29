import { useCallback, useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import type { Viewer } from 'mapillary-js'
import 'mapillary-js/dist/mapillary.css'
import StreetImage from './StreetImage'
import StreetMinimap from './StreetMinimap'
import StreetControls from './StreetControls'
import { getStreetSequence, type StreetCamera } from '../../data/streetCamera'

export default function StreetView({
  camera,
  onCameraChange,
  onClose,
}: {
  camera: StreetCamera
  onCameraChange: (camera: StreetCamera) => void
  onClose: () => void
}) {
  const viewerRef = useRef<Viewer | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [bearing, setBearing] = useState(camera.bearing)
  const sequence = getStreetSequence(camera.sequence)
  const index = sequence.findIndex((item) => item.id === camera.id)
  const navigate = useCallback(
    (id: string) => {
      const next = sequence.find((item) => item.id === id)
      if (!next || next.id === camera.id || !ready) return
      setReady(false)
      setError(false)
      setBearing(next.bearing)
      onCameraChange(next)
    },
    [camera.id, ready, onCameraChange, sequence],
  )
  const zoom = async (delta: number) => {
    const viewer = viewerRef.current
    if (!viewer || !ready) return
    const value = await viewer.getZoom()
    if (viewerRef.current === viewer)
      viewer.setZoom(Math.max(0, Math.min(3, value + delta)))
  }
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-x-0 top-15 bottom-0 z-40 bg-slate-950/50" />
        <Dialog.Popup
          initialFocus={() => document.getElementById('street-back')}
          finalFocus={() => document.getElementById('tree-photo')}
          className="street-view fixed inset-x-0 top-15 bottom-0 z-40 overflow-hidden bg-slate-950 text-slate-100 outline-none"
        >
          <Dialog.Title className="sr-only">
            Vista de calle de {camera.block_selection.street}, Tandil
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Fotografías parciales de perspectiva. Arrastrá para mirar dentro del
            encuadre disponible. Las flechas recorren capturas reales de la
            misma secuencia. Escape vuelve al mapa y a la ficha del árbol.
          </Dialog.Description>
          <StreetImage
            key={attempt}
            cameraId={camera.id}
            viewerRef={viewerRef}
            onReady={setReady}
            onError={setError}
            onBearing={setBearing}
          />
          {!ready && (
            <img
              src={camera.imageUrl}
              alt={`${camera.block_selection.street}, Tandil`}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
            />
          )}
          <Dialog.Close
            id="street-back"
            className="absolute top-4 left-4 z-10 flex h-11 items-center gap-2 rounded-full border border-slate-200/30 bg-slate-900/80 px-4 text-xs font-medium text-slate-100 shadow-lg outline-none backdrop-blur-md hover:bg-slate-800/90 focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <ArrowLeft size={17} /> Volver al mapa
          </Dialog.Close>
          {!ready && (
            <div
              role={error ? 'alert' : 'status'}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-slate-900/90 p-5 text-center text-sm shadow-xl"
            >
              {error ? (
                <>
                  <p>No se pudo cargar esta captura.</p>
                  <button
                    type="button"
                    className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-slate-800"
                    onClick={() => {
                      setError(false)
                      setAttempt((value) => value + 1)
                    }}
                  >
                    Reintentar
                  </button>
                </>
              ) : (
                <p className="flex items-center gap-3">
                  <LoaderCircle
                    className="animate-spin motion-reduce:animate-none"
                    size={19}
                  />{' '}
                  Preparando vista de calle…
                </p>
              )}
            </div>
          )}
          <StreetMinimap camera={camera} bearing={bearing} />
          <StreetControls
            ready={ready}
            index={index}
            total={sequence.length}
            onNavigate={(next) => {
              if (sequence[next]) navigate(sequence[next].id)
            }}
            onZoom={(delta) => void zoom(delta)}
            onReset={() => {
              viewerRef.current?.setZoom(0)
              viewerRef.current?.setCenter([0.5, 0.5])
            }}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
