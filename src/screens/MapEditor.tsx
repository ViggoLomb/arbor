import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { scenarios } from '../data/scenarios'
import BaseMap, { type MapActions } from '../components/map/BaseMap'
import MapControls from '../components/map/MapControls'
import TopBar from '../components/navigation/TopBar'
import CommandDialog from '../components/navigation/CommandDialog'
import LayersPanel from '../components/panels/LayersPanel'
import AnalysisPanel from '../components/panels/AnalysisPanel'
import TreeTablePanel from '../components/panels/TreeTablePanel'
import EditorImportDialogs from '../components/importer/EditorImportDialogs'
import TreeDetailsPanel from '../components/ui/TreeDetailsPanel'
import { getAvailableTrees, nearestTreeCamera } from '../data/trees'
import type { StreetCamera } from '../data/streetCamera'
import useTreeCensus from '../hooks/useTreeCensus'
import type { CensusFields, SelectedTree } from '../types/tree'
import type {
  EditorPanel,
  Project,
  ProjectAction,
  ProjectSession,
} from '../types/project'
const StreetView = lazy(() => import('../components/street/StreetView'))
type Props = {
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
}: Props) {
  const map = useRef<MapActions>(null)
  const [panel, setPanel] = useState<EditorPanel>(null)
  const [importType, setImportType] = useState<'image' | 'yolo' | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [treeOpen, setTreeOpen] = useState(false)
  const [camera, setCamera] = useState<StreetCamera | null>(null)
  const { saved, save } = useTreeCensus(project.id)
  const trees = getAvailableTrees(session.campaign, saved)
  const selectedTree = trees.find((tree) => tree.id === selectedId) ?? null
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
    setSelectedId(tree.id)
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
  const saveTree = (id: string, census: CensusFields) => {
    try {
      save(id, census)
      closeTree()
      toast.success('Ficha guardada correctamente', {
        description: 'Los cambios quedan guardados en este navegador.',
      })
    } catch {
      toast.error('No se pudo guardar la ficha', {
        description:
          'El almacenamiento del navegador no está disponible. Los campos siguen abiertos.',
      })
    }
  }
  return (
    <main
      aria-label={`Editor de Arbor: ${project.name}`}
      className="relative h-dvh w-screen overflow-hidden bg-slate-50"
    >
      <h1 className="sr-only">{project.name}</h1>
      <BaseMap
        scenario={scenarios[project.scenarioId]}
        ref={map}
        basemap={session.basemap}
        basemapLabels={session.basemapLabels}
        campaign={session.campaign}
        selectedId={selectedId}
        detectionsVisible={session.detectionsVisible}
        groupsVisible={session.groupsVisible}
        imageImported={session.imageImported}
        onTreeSelect={(id) => {
          const tree = trees.find((tree) => tree.id === id)
          if (tree) showTree(tree)
        }}
      />
      {active && (
        <>
          <TopBar
            basemap={session.basemap}
            basemapLabels={session.basemapLabels}
            onBasemap={(basemap) => onSession({ basemap })}
            onBasemapLabels={(basemapLabels) => onSession({ basemapLabels })}
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
              onGroupsToggle={() =>
                onSession({ groupsVisible: !session.groupsVisible })
              }
              onToggle={() => {
                onSession({ detectionsVisible: !session.detectionsVisible })
                closeTree()
              }}
              onCampaign={(campaign) => {
                onSession({ campaign })
                closeTree()
                setSelectedId(null)
              }}
              onClose={() => setPanel(null)}
            />
          )}
          {panel === 'analysis' && (
            <AnalysisPanel trees={trees} onClose={() => setPanel(null)} />
          )}
          {panel === 'table' && (
            <TreeTablePanel
              trees={trees}
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
              className="absolute right-2 bottom-10 z-10 rounded-lg bg-slate-50/90 px-2 py-1 text-[10px] text-slate-500 backdrop-blur-md"
            >
              Imagen de muestra: Esri, Vantor, Earthstar Geographics y GIS User
              Community
            </a>
          )}
          <EditorImportDialogs
            type={importType}
            count={trees.length}
            onClose={() => setImportType(null)}
            onImage={() => {
              onSession({ imageImported: true })
              setImportType(null)
            }}
            onDetections={() => {
              onSession({ detectionsVisible: true })
              setImportType(null)
            }}
          />
          <TreeDetailsPanel
            tree={selectedTree}
            open={treeOpen && !!selectedTree}
            onClose={closeTree}
            onSave={saveTree}
            onStreetView={() => {
              if (selectedTree)
                setCamera(nearestTreeCamera(selectedTree) ?? null)
            }}
          />
          <CommandDialog
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            projects={projects}
            trees={trees}
            onProject={onOpen}
            onTree={(tree) => showTree(tree, true)}
            onAction={(action) => {
              if (action === 'home') goHome()
              else if (action === 'image' || action === 'yolo')
                openImport(action)
              else openPanel(action)
            }}
          />
          {camera && (
            <Suspense
              fallback={
                <p
                  role="status"
                  className="absolute bottom-6 left-4 z-40 rounded-xl bg-slate-50/95 p-3 text-sm text-slate-700"
                >
                  Abriendo vista de calle…
                </p>
              }
            >
              <StreetView
                camera={camera}
                onCameraChange={setCamera}
                onClose={() => setCamera(null)}
              />
            </Suspense>
          )}
        </>
      )}
    </main>
  )
}
