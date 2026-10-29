import { Menu } from '@base-ui/react/menu'
import { Search } from 'lucide-react'
import type { EditorPanel, Project, ProjectAction } from '../../types/project'
import ArborMenu from './ArborMenu'
import ProjectBreadcrumb from './ProjectBreadcrumb'
import MapToolbar from './MapToolbar'
import ExportButton from './ExportButton'
import useSimulatedExport from './useSimulatedExport'
import ToolButton from '../ui/ToolButton'
import BasemapMenu from './BasemapMenu'
import type { BasemapId } from '../../data/basemaps'
import MenuSurface from '../ui/MenuSurface'

type TopBarProps = {
  basemap: BasemapId
  basemapLabels: boolean
  onBasemap: (value: BasemapId) => void
  onBasemapLabels: (value: boolean) => void
  project: Project
  panel: EditorPanel
  onHome: (library?: string) => void
  onSearch: () => void
  onProjectAction: (action: ProjectAction) => void
  onPanel: (panel: EditorPanel) => void
  onImport: (type: 'image' | 'yolo') => void
  onFit: () => void
}

export default function TopBar({
  basemap,
  basemapLabels,
  onBasemap,
  onBasemapLabels,
  project,
  panel,
  onHome,
  onSearch,
  onProjectAction,
  onPanel,
  onImport,
  onFit,
}: TopBarProps) {
  const { generating, generate } = useSimulatedExport()
  return (
    <header
      aria-label="Barra principal de Arbor"
      className="absolute inset-x-0 top-0 z-30 grid h-15 grid-cols-[1fr_auto_1fr] items-center gap-1 border-b border-slate-300/60 bg-slate-50/95 px-2 shadow-sm shadow-slate-900/5 backdrop-blur-xl sm:gap-3 sm:px-4"
    >
      <div className="flex min-w-0 items-center">
        <ArborMenu
          onHome={() => onHome()}
          onSearch={onSearch}
          onProjectAction={onProjectAction}
          onImport={() => onImport('image')}
          onPanel={onPanel}
          onFit={onFit}
          onExport={generate}
          exporting={generating}
        />
        <ProjectBreadcrumb
          project={project}
          onLibrary={() => onHome(project.library)}
          onRename={() => onProjectAction('rename')}
        />
      </div>
      <MapToolbar panel={panel} onPanel={onPanel} onImport={onImport} />
      <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-3">
        <ToolButton
          id="search-tools-trigger"
          label="Buscar en Arbor"
          icon={Search}
          onClick={onSearch}
          className="hidden sm:flex"
        />
        <ExportButton generating={generating} onGenerate={generate} />
        <BasemapMenu
          value={basemap}
          labels={basemapLabels}
          onChange={onBasemap}
          onLabelsChange={onBasemapLabels}
        />
        <Menu.Root>
          <Menu.Trigger
            aria-label="Espacio municipal"
            className="hidden size-8 shrink-0 items-center justify-center rounded-full border border-emerald-700/20 bg-emerald-700 text-xs font-medium text-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:flex"
          >
            M
          </Menu.Trigger>
          <MenuSurface>
            <p className="px-3 py-2 text-xs text-slate-500">
              Espacio municipal
            </p>
            <Menu.Item className="menu-item" onClick={() => onHome()}>
              Ver mis proyectos
            </Menu.Item>
          </MenuSurface>
        </Menu.Root>
      </div>
    </header>
  )
}
