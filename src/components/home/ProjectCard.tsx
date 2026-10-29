import { Map } from 'lucide-react'
import type { Project } from '../../types/project'
import ProjectPreview from './ProjectPreview'

export default function ProjectCard({
  project,
  list,
  onOpen,
}: {
  project: Project
  list: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group min-w-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#1c1c1c] ${list ? 'flex items-center gap-5 rounded-md border border-white/[0.08] bg-[#242424] p-3 hover:bg-[#2a2a2a]' : ''}`}
    >
      <div
        className={`relative overflow-hidden rounded-md ${list ? 'h-20 w-32 shrink-0' : 'aspect-video'}`}
      >
        <ProjectPreview variant={project.preview} />
      </div>
      <div className={list ? 'min-w-0 flex-1' : 'pt-2.5'}>
        <h2 className="truncate text-[15px] font-medium text-[#f3f3f3] group-hover:text-emerald-300">
          {project.name}
        </h2>
        <p className="mt-1 truncate text-xs text-[#a0a0a0]">
          {project.description}
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#a0a0a0]">
          <Map size={12} aria-hidden="true" />
          {project.library}
          <span aria-hidden="true">·</span>
          {project.updated}
          <span aria-hidden="true">·</span>
          {project.draft ? 'Borrador' : 'Proyecto demo'}
        </p>
      </div>
    </button>
  )
}
