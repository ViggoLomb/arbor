import { useEffect, useRef } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { ArrowUpRight, FileJson } from 'lucide-react'
import useSimulatedYolo from '../importer/useSimulatedYolo'
import { mockDetections } from '../../data/mockData'
import ImportDialog from './ImportDialog'
import ProcessingSteps from './ProcessingSteps'
import SimulatedUpload from './SimulatedUpload'

const steps = [
  { stage: 'analyzing', pending: 'Analizar FeatureCollection', active: 'Analizando FeatureCollection...', done: 'FeatureCollection analizada' },
  { stage: 'metrics', pending: 'Extraer confianza y estado sanitario', active: 'Extrayendo métricas de confianza y estado sanitario...', done: 'Confianza y estado sanitario procesados' },
] as const

type ModalYoloProps = {
  open: boolean
  onVisualize: () => void
}

function YoloFlow({ open, onVisualize }: ModalYoloProps) {
  const { stage, start } = useSimulatedYolo(open)
  const visualizeButton = useRef<HTMLButtonElement>(null)
  const success = stage === 'success'
  const current = success ? steps.length : steps.findIndex((step) => step.stage === stage)
  const successMessage = `¡${mockDetections.features.length} entidades procesadas con éxito!`
  const announcement = stage === 'idle' ? 'Listo para cargar las detecciones del agente YOLO.' : success ? successMessage : steps[current].active

  useEffect(() => {
    if (success) visualizeButton.current?.focus()
  }, [success])

  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
      <SimulatedUpload
        id="yolo-drop-zone"
        idle={stage === 'idle'}
        success={success}
        onStart={start}
        idleText="Arrastrá el GeoJSON de YOLO aquí"
        filename="detecciones_yolo.geojson"
        successText={successMessage}
        processingHint="Preparando las detecciones del agente IA"
        successHint="Las detecciones están listas para visualizarse."
        fileIcon={FileJson}
      />
      <ProcessingSteps steps={steps} current={current} label="Etapas de carga de detecciones IA" />
      <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200/80 pt-5">
        <Dialog.Close className="h-11 rounded-full px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600">
          {success ? 'Cerrar' : 'Cancelar'}
        </Dialog.Close>
        {success && (
          <button ref={visualizeButton} type="button" onClick={onVisualize} className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-800 px-5 py-2 text-sm font-medium text-slate-50 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600">
            Visualizar Detecciones <ArrowUpRight size={17} className="shrink-0" aria-hidden="true" />
          </button>
        )}
      </div>
    </>
  )
}

export default function ModalYolo({ open, onVisualize }: ModalYoloProps) {
  return (
    <ImportDialog
      title="Cargar detecciones IA"
      description="Simulá la conexión con el agente YOLO usando un GeoJSON de ejemplo. No se suben archivos."
      initialFocusId="yolo-drop-zone"
      closeLabel="Cerrar conector YOLO"
    >
      <YoloFlow open={open} onVisualize={onVisualize} />
    </ImportDialog>
  )
}
