import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
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
import useStudyArea from '../hooks/useStudyArea'
import useBlockCatalog from '../hooks/useBlockCatalog'
import useStudySelection from '../hooks/useStudySelection'
import { summarizeStudy } from '../data/studyAnalysis'
import StudyAreaPanel from '../components/panels/StudyAreaPanel'
import type { StudyArea } from '../types/study'
import type { CensusFields, SelectedTree } from '../types/tree'
import type {
  EditorPanel,
  Project,
  ProjectAction,
  ProjectSession,
} from '../types/project'
const StreetView = lazy(() => import('../components/street/StreetView'))
const ReportDialog = lazy(() => import('../components/reports/ReportDialog'))
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
  const trees = useMemo(() => getAvailableTrees(session.campaign, saved), [session.campaign, saved])
  const streetTrees = useMemo(() => getAvailableTrees('all', saved), [saved])
  const { area, saveArea } = useStudyArea(project.id)
  const { catalog, error: catalogError, retry } = useBlockCatalog(panel === 'study' || !!area)
  const selection = useStudySelection(catalog)
  const stopStudy = selection.stop
  const [reportOpen, setReportOpen] = useState(false)
  const summary = useMemo(() => area ? summarizeStudy(area, trees, session.campaign) : null, [area, trees, session.campaign])
  const selectedTree = trees.find((tree) => tree.id === selectedId) ?? null
  useEffect(() => {
    if (!active) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && panel === 'study' && !document.querySelector('[role="dialog"]')) {
        event.preventDefault()
        stopStudy()
        setPanel(null)
        return
      }
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
  }, [active, panel, stopStudy])
  const closeTree = () => setTreeOpen(false)
  const openPanel = (next: EditorPanel) => {
    closeTree()
    if (next === 'analysis' && (!area || (panel === 'study' && (selection.mode || selection.draft !== area)))) {
      if (panel !== 'study') selection.begin(area)
      setPanel('study')
      toast.info('Seleccioná y confirmá un área de estudio para analizarla')
      return
    }
    selection.stop()
    if (next === 'study') selection.begin(area)
    setPanel(next)
  }
  const openReport = () => {
    if (!area || (panel === 'study' && (selection.mode || selection.draft !== area))) {
      openPanel('analysis')
      return
    }
    setReportOpen(true)
  }
  const confirmArea = () => {
    if (!selection.draft || selection.mode) return
    try {
      saveArea(selection.draft)
      selection.stop()
      setPanel('analysis')
      map.current?.fitStudy(selection.draft)
    } catch { toast.error('No se pudo guardar el área', { description: 'El almacenamiento del navegador no está disponible. La selección sigue abierta.' }) }
  }
  const removeArea = () => {
    try { saveArea(null); selection.begin(null) }
    catch { toast.error('No se pudo quitar el área guardada') }
  }
  const fitSelection = (next: StudyArea | null) => { if (next) map.current?.fitStudy(next) }
  const showTree = (tree: SelectedTree, locate = false) => {
    setSelectedId(tree.id)
    setTreeOpen(true)
    selection.stop()
    setPanel(null)
    if (locate) {
      onSession({ detectionsVisible: true })
      map.current?.locateTree(tree.coordinates)
    }
  }
  const goHome = (library?: string) => {
    closeTree()
    selection.stop()
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
        study={{ area: panel === 'study' ? selection.draft : area, mode: panel === 'study' ? selection.mode : null,
          vertices: selection.vertices, blocks: catalog, onPoint: selection.onPoint, onFinish: selection.finish }}
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
            onReport={openReport}
          />
          {panel === 'study' && <StudyAreaPanel
            area={selection.draft} mode={selection.mode} vertices={selection.vertices}
            catalog={catalog} catalogError={catalogError} campaign={session.campaign} trees={trees}
            onMode={selection.changeMode} onKnown={() => fitSelection(selection.chooseKnown())}
            onChooseBlock={(id) => fitSelection(selection.chooseBlock(id))}
            onUndo={selection.undo} onFinish={selection.finish} onChange={selection.setDraft}
            onConfirm={confirmArea} onRemove={removeArea} onClose={() => openPanel(null)}
            onCampaign={(campaign) => onSession({ campaign })} onRetry={retry}
          />}
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
          {panel === 'analysis' && summary && (
            <AnalysisPanel summary={summary} onClose={() => openPanel(null)} onReport={openReport} onEditArea={() => openPanel('study')} />
          )}
          {reportOpen && summary && <Suspense fallback={<p role="status" className="absolute bottom-6 left-4 z-40 rounded-xl bg-slate-50/95 p-3 text-sm">Abriendo informe…</p>}>
            <ReportDialog project={project.name} summary={summary} basemap={session.basemap} blocks={catalog} onClose={() => setReportOpen(false)} />
          </Suspense>}
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
              className="absolute left-3 bottom-24 z-10 max-w-[min(26rem,calc(100%-1.5rem))] rounded-lg bg-slate-100/70 px-2 py-1 text-[11px] text-slate-700 backdrop-blur-md"
            >
              Imagen: Esri, Vantor, Earthstar Geographics y GIS User
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
              else if (action === 'report') openReport()
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
                trees={streetTrees}
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
