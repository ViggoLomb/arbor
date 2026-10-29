import Dashboard from '../analysis/Dashboard'
import PanelFrame from './PanelFrame'

export default function AnalysisPanel({ onClose }: { onClose: () => void }) {
  return (
    <PanelFrame id="analysis-panel" title="Análisis" onClose={onClose}>
      <Dashboard />
    </PanelFrame>
  )
}
