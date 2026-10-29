import { useRef, useState } from 'react'
import { LayoutGrid, List, Menu, Plus, Search } from 'lucide-react'
import type { Project, ProjectSession } from '../types/project'
import HomeSidebar from '../components/home/HomeSidebar'
import ProjectCard from '../components/home/ProjectCard'
import ProjectSources from '../components/home/ProjectSources'

type HomeProps = {
  projects: Project[]
  currentProject: Project
  session: ProjectSession
  section: string
  onSection: (section: string) => void
  onOpen: (project: Project) => void
  onNew: () => void
}

export default function Home({
  projects,
  currentProject,
  session,
  section,
  onSection,
  onOpen,
  onNew,
}: HomeProps) {
  const [query, setQuery] = useState('')
  const [list, setList] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const searchInput = useRef<HTMLInputElement>(null)
  const title =
    section === 'recent'
      ? 'Proyectos recientes'
      : section === 'drafts'
        ? 'Borradores'
        : section === 'sources'
          ? 'Fuentes de datos'
          : section
  const filtered = projects.filter(
    (project) =>
      (section === 'recent' ||
        (section === 'drafts' ? project.draft : project.library === section)) &&
      `${project.name} ${project.description} ${project.library}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  )
  const selectSection = (next: string) => {
    onSection(next)
    setQuery('')
    setMobileNav(false)
  }

  return (
    <main
      aria-label="Inicio de Arbor"
      className="flex h-dvh overflow-hidden bg-[#1c1c1c] text-[#f3f3f3]"
    >
      <HomeSidebar
        section={section}
        onSection={selectSection}
        onSearch={() => {
          selectSection('recent')
          requestAnimationFrame(() => searchInput.current?.focus())
        }}
        mobileOpen={mobileNav}
        onClose={() => setMobileNav(false)}
      />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <header className="flex min-h-16 items-center justify-between gap-3 border-b border-white/[0.08] bg-[#141414] px-5 py-3 sm:px-9 xl:px-12">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              id="home-nav-trigger"
              onClick={() => setMobileNav(true)}
              aria-label="Abrir bibliotecas"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 md:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-medium">{title}</h1>
            </div>
          </div>
          <button
            type="button"
            aria-label="Nuevo proyecto"
            onClick={onNew}
            className="flex min-h-9 shrink-0 items-center gap-2 rounded-md bg-emerald-400 px-3 text-xs font-semibold text-emerald-950 hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 sm:px-4"
          >
            <Plus size={17} />
            <span className="sm:hidden">Nuevo</span>
            <span className="hidden sm:inline">Nuevo proyecto</span>
          </button>
        </header>
        <div className="mx-auto max-w-[1800px] px-5 py-5 sm:px-9 sm:py-6 xl:px-10">
          {section === 'sources' ? (
            <ProjectSources
              currentProject={currentProject}
              session={session}
              onOpen={onOpen}
            />
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between gap-3">
                <label className="flex h-9 w-full max-w-80 items-center gap-2 rounded-md border border-white/[0.10] bg-[#242424] px-3 focus-within:border-white/25">
                  <Search size={16} className="shrink-0 text-slate-400" />
                  <input
                    ref={searchInput}
                    type="search"
                    aria-label="Buscar proyectos"
                    placeholder="Buscar un proyecto…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-xs text-[#f3f3f3] outline-none placeholder:text-[#a0a0a0]"
                  />
                </label>
                <div
                  role="group"
                  aria-label="Vista de proyectos"
                  className="flex shrink-0 rounded-md border border-white/[0.10] bg-[#242424] p-1"
                >
                  <button
                    type="button"
                    aria-label="Vista de grilla"
                    aria-pressed={!list}
                    onClick={() => setList(false)}
                    className={`rounded p-1.5 ${!list ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Vista de lista"
                    aria-pressed={list}
                    onClick={() => setList(true)}
                    className={`rounded p-1.5 ${list ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
              {filtered.length ? (
                <div
                  className={
                    list
                      ? 'space-y-3'
                      : 'grid grid-cols-1 gap-x-6 gap-y-7 min-[520px]:grid-cols-2 min-[780px]:grid-cols-3 min-[1120px]:grid-cols-4'
                  }
                >
                  {filtered.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      list={list}
                      onOpen={() => onOpen(project)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-700 px-6 py-14 text-center">
                  <Search size={23} className="mx-auto text-slate-400" />
                  <h2 className="mt-4 text-sm font-medium text-slate-300">
                    No encontramos proyectos
                  </h2>
                  <p className="mt-2 text-xs text-slate-400">
                    Probá otro nombre o creá un proyecto en esta biblioteca.
                  </p>
                </div>
              )}
              <p className="mt-10 border-t border-slate-800 pt-5 text-[11px] leading-5 text-slate-400">
                {filtered.length} proyectos · Sesión de demostración. Las
                miniaturas son ilustrativas y los proyectos comparten un
                escenario de Buenos Aires.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
