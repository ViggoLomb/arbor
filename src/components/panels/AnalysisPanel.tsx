import Dashboard from '../analysis/Dashboard'
import type { StudySummary } from '../../data/studyAnalysis'
import PanelFrame from './PanelFrame'
export default function AnalysisPanel({ summary, onClose, onReport, onEditArea }: {
  summary: StudySummary; onClose: () => void; onReport: () => void; onEditArea: () => void
}) {
  return <PanelFrame id="analysis-panel" title="Análisis" onClose={onClose}>
    <div className="mb-4 flex gap-2 text-xs"><button type="button" onClick={onEditArea} className="flex-1 rounded-lg border border-slate-200 bg-slate-100 px-2 py-2 text-slate-700">Editar área</button><button type="button" onClick={onReport} className="flex-1 rounded-lg bg-emerald-700 px-2 py-2 font-medium text-emerald-50">Ver informe</button></div>
    <Dashboard summary={summary} />
  </PanelFrame>
}
