import { useState } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'
import { Toaster, toast } from 'sonner'
import Home from './screens/Home'
import MapEditor from './screens/MapEditor'
import ProjectDialog from './components/navigation/ProjectDialog'
import { libraries, mockProjects } from './data/mockProjects'
import { emptySession } from './types/project'
import type { Project, ProjectAction, ProjectSession } from './types/project'

export default function App() {
  const [screen, setScreen] = useState<'home' | 'editor'>('editor')
  const [projects, setProjects] = useState(mockProjects)
  const [projectId, setProjectId] = useState(mockProjects[0].id)
  const [sessions, setSessions] = useState<Record<string, ProjectSession>>({})
  const [homeSection, setHomeSection] = useState('recent')
  const [projectAction, setProjectAction] = useState<ProjectAction | null>(null)
  const project = projects.find((item) => item.id === projectId)!
  const session = sessions[projectId] ?? emptySession

  const openProject = (next: Project) => {
    setProjectId(next.id)
    setScreen('editor')
  }
  const updateSession = (changes: Partial<ProjectSession>) =>
    setSessions((current) => ({
      ...current,
      [projectId]: { ...(current[projectId] ?? emptySession), ...changes },
    }))
  const saveProject = (name: string, library: string) => {
    if (!name || !libraries.includes(library)) return
    if (projectAction === 'new' || projectAction === 'duplicate') {
      const next: Project = {
        ...project,
        id: crypto.randomUUID(),
        name,
        library,
        description:
          projectAction === 'new'
            ? 'Nuevo proyecto de arbolado urbano'
            : project.description,
        updated: 'Hace unos momentos',
        draft: true,
      }
      setProjects((current) => [next, ...current])
      if (projectAction === 'duplicate')
        setSessions((current) => ({ ...current, [next.id]: { ...session } }))
      openProject(next)
    } else {
      setProjects((current) =>
        current.map((item) =>
          item.id === projectId
            ? { ...item, name, library, updated: 'Hace unos momentos' }
            : item,
        ),
      )
    }
    setProjectAction(null)
    toast.success(
      projectAction === 'new'
        ? 'Proyecto creado'
        : projectAction === 'duplicate'
          ? 'Copia creada'
          : 'Proyecto actualizado',
    )
  }

  return (
    <Tooltip.Provider delay={450}>
      {/* Ocultar el editor conserva el mapa, su encuadre y la sesión al visitar Inicio. */}
      <div hidden={screen !== 'editor'} inert={screen !== 'editor'}>
        <MapEditor
          key={projectId}
          active={screen === 'editor'}
          project={project}
          projects={projects}
          session={session}
          onSession={updateSession}
          onHome={(library) => {
            setHomeSection(library ?? 'recent')
            setScreen('home')
          }}
          onOpen={openProject}
          onProjectAction={setProjectAction}
        />
      </div>
      {screen === 'home' && (
        <Home
          projects={projects}
          currentProject={project}
          session={session}
          section={homeSection}
          onSection={setHomeSection}
          onOpen={openProject}
          onNew={() => setProjectAction('new')}
        />
      )}
      <ProjectDialog
        action={projectAction}
        project={project}
        defaultLibrary={
          libraries.includes(homeSection) ? homeSection : project.library
        }
        onClose={() => setProjectAction(null)}
        onSubmit={saveProject}
      />
      <Toaster
        position="bottom-center"
        closeButton
        duration={3500}
        className="app-toaster"
        toastOptions={{ className: 'app-toast' }}
      />
    </Tooltip.Provider>
  )
}
