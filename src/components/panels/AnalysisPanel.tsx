import Dashboard from '../analysis/Dashboard'
import type { SelectedTree } from '../../types/tree'
import PanelFrame from './PanelFrame'
export default function AnalysisPanel({
  trees,
  onClose,
}: {
  trees: SelectedTree[]
  onClose: () => void
}) {
  return (
    <PanelFrame id="analysis-panel" title="Análisis" onClose={onClose}>
      <Dashboard trees={trees} />
    </PanelFrame>
  )
}
