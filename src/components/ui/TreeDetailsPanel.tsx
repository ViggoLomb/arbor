import { Dialog } from '@base-ui/react/dialog'
import { Save, X } from 'lucide-react'
import type { CensusFields, SelectedTree } from '../../types/tree'
import TreeDetailsForm from '../trees/TreeDetailsForm'
import TreePhoto from '../trees/TreePhoto'
export default function TreeDetailsPanel({
  tree,
  open,
  onClose,
  onSave,
  onStreetView,
}: {
  tree: SelectedTree | null
  open: boolean
  onClose: () => void
  onSave: (id: string, census: CensusFields) => void
  onStreetView: () => void
}) {
  const observation = tree?.observations.find(
    (item) => item.id === tree.primaryObservationId,
  )
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      modal={false}
      disablePointerDismissal
    >
      <Dialog.Portal>
        <Dialog.Popup
          initialFocus={() => document.getElementById('tree-photo')}
          finalFocus={() => {
            const active = document.activeElement
            if (
              active &&
              active !== document.body &&
              !active.closest('[data-tree-details]')
            )
              return false
            return document.querySelector<HTMLCanvasElement>(
              '.maplibregl-canvas',
            )
          }}
          data-tree-details=""
          className="tree-details-panel fixed top-19 right-4 bottom-8 z-20 flex w-96 max-w-[calc(100%-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50/95 text-slate-800 shadow-lg shadow-slate-900/15 outline-none backdrop-blur-md"
        >
          {tree && (
            <>
              <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200/70 px-5 py-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                    Ficha de relevamiento
                  </p>
                  <Dialog.Title className="mt-1 text-lg font-semibold tracking-tight">
                    {tree.label}
                  </Dialog.Title>
                  <p className="mt-1 text-xs text-slate-500">
                    {tree.calle} · Tandil · {tree.campaign}
                  </p>
                </div>
                <Dialog.Close
                  aria-label="Cerrar ficha del árbol"
                  className="tool-button"
                >
                  <X size={19} aria-hidden="true" />
                </Dialog.Close>
              </header>
              <Dialog.Description className="sr-only">
                Ficha censal del árbol seleccionado. Su fotografía abre la vista
                de calle asociada. Incluye la altura y los datos del relevamiento.
                Los demás datos no relevados permanecen vacíos.
              </Dialog.Description>
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
                <TreePhoto
                  key={`photo-${tree.id}`}
                  tree={tree}
                  onOpen={onStreetView}
                />
                <details className="rounded-xl bg-slate-100/80 p-3 text-[11px] text-slate-600">
                  <summary className="cursor-pointer font-medium">
                    Detección IA · Ubicación
                  </summary>
                  <dl className="mt-3 space-y-2">
                    <div className="flex justify-between">
                      <dt>Fuente</dt>
                      <dd>agrotech · Grounding DINO Tiny</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Puntaje del detector</dt>
                      <dd>{observation?.score.toFixed(3)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Capturas asociadas</dt>
                      <dd>
                        {
                          new Set(
                            tree.observations.map((item) => item.cameraId),
                          ).size
                        }
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Lat. / Lng.</dt>
                      <dd>
                        {tree.coordinates[1].toFixed(6)},{' '}
                        {tree.coordinates[0].toFixed(6)}
                      </dd>
                    </div>
                  </dl>
                </details>
                <TreeDetailsForm
                  key={`form-${tree.id}`}
                  tree={tree}
                  onSave={onSave}
                />
              </div>
              <footer className="shrink-0 border-t border-slate-200/70 bg-slate-50/95 px-5 py-4">
                <button
                  type="submit"
                  form="tree-census-form"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-800 px-5 text-sm font-medium text-slate-50 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  <Save size={17} aria-hidden="true" /> Guardar Ficha
                </button>
              </footer>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
