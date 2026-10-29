import ProcessingSteps from '../ui/ProcessingSteps'
import type { ImportStage } from './useSimulatedImport'

const steps = [
  { stage: 'uploading', pending: 'Cargar archivo', active: 'Cargando archivo...', done: 'Archivo cargado' },
  { stage: 'validating', pending: 'Validar georreferenciación (CRS)', active: 'Validando georreferenciación (CRS)...', done: 'Georreferenciación validada' },
  { stage: 'tiling', pending: 'Generar tiles visuales', active: 'Generando tiles visuales...', done: 'Tiles visuales generados' },
] as const

export default function ImportSteps({ stage }: { stage: ImportStage }) {
  const current = stage === 'success' ? steps.length : steps.findIndex((step) => step.stage === stage)

  return <ProcessingSteps steps={steps} current={current} label="Etapas de importación" />
}
