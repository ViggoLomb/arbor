import { useEffect, useRef } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { ArrowUpRight, FileImage } from 'lucide-react'
import ImportSteps from '../importer/ImportSteps'
import useSimulatedImport from '../importer/useSimulatedImport'
import ImportDialog from './ImportDialog'
import SimulatedUpload from './SimulatedUpload'

type ModalImportadorProps = {
  open: boolean
  onViewMap: () => void
}

function ImportFlow({ open, onViewMap }: ModalImportadorProps) {
  const { stage, progress, start } = useSimulatedImport(open)
  const viewMapButton = useRef<HTMLButtonElement>(null)
  const idle = stage === 'idle'
  const success = stage === 'success'

  useEffect(() => {
    if (success) viewMapButton.current?.focus()
  }, [success])

  const announcement = {
    idle: 'Listo para importar una imagen.',
    uploading: 'Cargando archivo...',
    validating: 'Validando georreferenciación (CRS)...',
    tiling: 'Generando tiles visuales...',
    success: '¡Importación exitosa!',
  }[stage]

  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
      <SimulatedUpload
        id="import-drop-zone"
        idle={idle}
        success={success}
        onStart={start}
        idleText="Arrastrá el ortomosaico (.tif) aquí"
        filename="ortomosaico_tandil.tif"
        successText="¡Importación exitosa!"
        processingHint="Preparando la imagen"
        successHint="La imagen está lista para visualizarse."
        fileIcon={FileImage}
      />

      <div className="mb-5 h-10">
        {stage === 'uploading' && <div>
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>Cargando archivo...</span><span className="tabular-nums">{progress}%</span>
          </div>
          <div role="progressbar" aria-label="Carga del archivo" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="import-progress h-full origin-left rounded-full bg-slate-700" />
          </div>
        </div>}
      </div>

      <ImportSteps stage={stage} />

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200/80 pt-5">
        <Dialog.Close className="h-11 rounded-full px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600">
          {success ? 'Cerrar' : 'Cancelar'}
        </Dialog.Close>
        {success && (
          <button ref={viewMapButton} type="button" onClick={onViewMap} className="flex h-11 items-center gap-2 rounded-full bg-slate-800 px-5 text-sm font-medium text-slate-50 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600">
            Ver en el mapa <ArrowUpRight size={17} aria-hidden="true" />
          </button>
        )}
      </div>
    </>
  )
}

export default function ModalImportador({ open, onViewMap }: ModalImportadorProps) {
  return (
    <ImportDialog
      title="Importar imagen"
      description="Importá imágenes georreferenciadas para incorporarlas al mapa."
      initialFocusId="import-drop-zone"
      closeLabel="Cerrar importador"
    >
      <ImportFlow open={open} onViewMap={onViewMap} />
    </ImportDialog>
  )
}
