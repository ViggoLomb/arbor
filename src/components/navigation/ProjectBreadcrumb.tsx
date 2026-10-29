import { ChevronRight } from 'lucide-react'
import type { Project } from '../../types/project'

export default function ProjectBreadcrumb({
  project,
  onLibrary,
  onRename,
}: {
  project: Project
  onLibrary: () => void
  onRename: () => void
}) {
  return (
    <nav
      aria-label="Ubicación del proyecto"
      className="ml-2 hidden min-w-0 items-center gap-1.5 text-sm md:flex"
    >
      <button
        type="button"
        onClick={onLibrary}
        className="hidden max-w-32 truncate rounded px-1 py-2 text-slate-400 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-emerald-700 xl:block"
      >
        {project.library}
      </button>
      <ChevronRight
        size={15}
        className="hidden shrink-0 text-slate-300 xl:block"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={onRename}
        title={project.name}
        aria-label={`Renombrar proyecto: ${project.name}`}
        className="max-w-44 truncate rounded px-1 py-2 font-medium text-slate-700 hover:bg-slate-200/50 focus-visible:outline-2 focus-visible:outline-emerald-700"
      >
        {project.name}
      </button>
    </nav>
  )
}
