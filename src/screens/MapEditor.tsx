import { useEffect, useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { toast } from 'sonner'
import BaseMap from '../components/map/BaseMap'
import type { MapActions } from '../components/map/BaseMap'
import MapControls from '../components/map/MapControls'
import TopBar from '../components/navigation/TopBar'
import CommandDialog from '../components/navigation/CommandDialog'
import LayersPanel from '../components/panels/LayersPanel'
import AnalysisPanel from '../components/panels/AnalysisPanel'
import TreeTablePanel from '../components/panels/TreeTablePanel'
import ModalImportador from '../components/ui/ModalImportador'
import ModalYolo from '../components/ui/ModalYolo'
import TreeDetailsPanel from '../components/ui/TreeDetailsPanel'
import type { SelectedTree } from '../types/tree'
import type {
  EditorPanel,
  Project,
  ProjectAction,
  ProjectSession,
} from '../types/project'

type MapEditorProps = {
  active: boolean
  project: Project
  projects: Project[]
  session: ProjectSession
  onSession: (changes: Partial<ProjectSession>) => void
  onHome: (library?: string) => void
  onOpen: (project: Project) => void
  onProjectAction: (action: ProjectAction) => void
}

export default function MapEditor({
  active,
  project,
  projects,
  session,
  onSession,
  onHome,
  onOpen,
  onProjectAction,
}: MapEditorProps) {
  const map = useRef<MapActions>(null)
  const [panel, setPanel] = useState<EditorPanel>(null)
  const [importType, setImportType] = useState<'image' | 'yolo' | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedTree, setSelectedTree] = useState<SelectedTree | null>(null)
  const [treeOpen, setTreeOpen] = useState(false)

  useEffect(() => {
    if (!active) return
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (
          document.querySelector('[role="dialog"][aria-modal="true"]') &&
          !document.querySelector('[data-arbor-search]')
        )
          return
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [active])

  const closeTree = () => setTreeOpen(false)
  const openPanel = (next: EditorPanel) => {
    closeTree()
    setPanel(next)
  }
  const showTree = (tree: SelectedTree, locate = false) => {
    setSelectedTree(tree)
    setTreeOpen(true)
    setPanel(null)
    if (locate) {
      onSession({ detectionsVisible: true })
      map.current?.locateTree(tree.coordinates)
    }
  }
  const goHome = (library?: string) => {
    closeTree()
    setPanel(null)
    onHome(library)
  }
  const openImport = (type: 'image' | 'yolo') => {
    closeTree()
    setImportType(type)
  }

  return (
    <main
      aria-label={`Editor de Arbor: ${project.name}`}
      className="relative h-dvh w-screen overflow-hidden bg-slate-50"
    >
      <h1 className="sr-only">{project.name}</h1>
      <BaseMap
        ref={map}
        detectionsVisible={session.detectionsVisible}
        imageImported={session.imageImported}
        onTreeSelect={(tree) => showTree(tree)}
      />
      {active && (
        <>
          <TopBar
            project={project}
            panel={panel}
            onHome={goHome}
            onSearch={() => setSearchOpen(true)}
            onProjectAction={onProjectAction}
            onPanel={openPanel}
            onImport={openImport}
            onFit={() => map.current?.fitProject()}
          />
          {panel === 'layers' && (
            <LayersPanel
              session={session}
              onToggle={() => {
                onSession({ detectionsVisible: !session.detectionsVisible })
                closeTree()
              }}
              onClose={() => setPanel(null)}
            />
          )}
          {panel === 'analysis' && (
            <AnalysisPanel onClose={() => setPanel(null)} />
          )}
          {panel === 'table' && (
            <TreeTablePanel
              loaded={session.detectionsLoaded}
              onSelect={(tree) => showTree(tree, true)}
              onClose={() => setPanel(null)}
            />
          )}
          <MapControls
            onZoomIn={() => map.current?.zoomIn()}
            onZoomOut={() => map.current?.zoomOut()}
            onFit={() => map.current?.fitProject()}
          />
          {session.imageImported && (
            <a
              href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
              target="_blank"
              rel="noreferrer"
              className="absolute right-2 bottom-10 z-10 max-w-[calc(100%-1rem)] rounded-lg bg-slate-50/90 px-2 py-1 text-right text-[10px] text-slate-500 backdrop-blur-md focus-visible:outline-2 focus-visible:outline-slate-600"
            >
              Imagen de muestra: Esri, Vantor, Earthstar Geographics y GIS User
              Community
            </a>
          )}
          <Dialog.Root
            open={importType === 'image'}
            onOpenChange={(open) => {
              if (!open) setImportType(null)
            }}
          >
            <ModalImportador
              open={importType === 'image'}
              onViewMap={() => {
                onSession({ imageImported: true })
                setImportType(null)
              }}
            />
          </Dialog.Root>
          <Dialog.Root
            open={importType === 'yolo'}
            onOpenChange={(open) => {
              if (!open) setImportType(null)
            }}
          >
            <ModalYolo
              open={importType === 'yolo'}
              onVisualize={() => {
                onSession({ detectionsLoaded: true, detectionsVisible: true })
                setImportType(null)
              }}
            />
          </Dialog.Root>
          <TreeDetailsPanel
            tree={selectedTree}
            open={treeOpen}
            onClose={closeTree}
            onSave={(id) => {
              closeTree()
              toast.success('Ficha guardada correctamente', {
                description: `Árbol ${id} · Demostración`,
              })
            }}
          />
          <CommandDialog
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            projects={projects}
            loaded={session.detectionsLoaded}
            onProject={onOpen}
            onTree={(tree) => showTree(tree, true)}
            onAction={(action) => {
              if (action === 'home') goHome()
              else if (action === 'image' || action === 'yolo')
                openImport(action)
              else openPanel(action)
            }}
          />
        </>
      )}
    </main>
  )
}
