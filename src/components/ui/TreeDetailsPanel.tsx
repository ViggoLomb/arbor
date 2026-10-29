import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import type { SelectedTree } from '../../types/tree'
import TreeDetailsForm from '../trees/TreeDetailsForm'

type TreeDetailsPanelProps = {
  tree: SelectedTree | null
  open: boolean
  onClose: () => void
  onSave: (id: string) => void
}

export default function TreeDetailsPanel({
  tree,
  open,
  onClose,
  onSave,
}: TreeDetailsPanelProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
      modal={false}
      disablePointerDismissal
    >
      <Dialog.Portal>
        <Dialog.Popup
          initialFocus={() => document.getElementById('tree-species')}
          finalFocus={() =>
            document.querySelector<HTMLCanvasElement>('.maplibregl-canvas')
          }
          className="tree-details-panel fixed top-19 right-3 bottom-8 z-20 flex w-96 max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 text-slate-800 shadow-lg shadow-slate-900/15 outline-none backdrop-blur-md sm:right-4"
        >
          {tree && (
            <>
              <header className="shrink-0 border-b border-slate-200/80 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-500">
                      Relevamiento CIAFBA
                    </p>
                    <Dialog.Title className="text-lg font-semibold tracking-tight">
                      Árbol {tree.id}
                    </Dialog.Title>
                  </div>
                  <Dialog.Close
                    aria-label="Cerrar ficha del árbol"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
                  >
                    <X size={19} aria-hidden="true" />
                  </Dialog.Close>
                </div>
                <Dialog.Description className="sr-only">
                  Ficha de demostración. Completá los datos de relevamiento del
                  árbol seleccionado.
                </Dialog.Description>
                <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <div className="flex gap-1">
                    <dt>Lat.</dt>
                    <dd className="tabular-nums">
                      {tree.coordinates[1].toFixed(6)}
                    </dd>
                  </div>
                  <div className="flex gap-1">
                    <dt>Lng.</dt>
                    <dd className="tabular-nums">
                      {tree.coordinates[0].toFixed(6)}
                    </dd>
                  </div>
                </dl>
              </header>
              <TreeDetailsForm key={tree.id} tree={tree} onSave={onSave} />
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
