import { ArrowUpRight, FolderOpen, Sprout } from 'lucide-react'
import type { Project } from '../../types/project'

export default function HomeIntro({
  currentProject,
  onNew,
  onOpen,
}: {
  currentProject: Project
  onNew: () => void
  onOpen: (project: Project) => void
}) {
  return (
    <>
      {' '}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h2 className="font-brand text-3xl tracking-tight text-slate-100 sm:text-4xl">
            Tu territorio, en perspectiva.
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Censos, imágenes y evaluaciones en un mismo lugar.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-slate-700/70 px-3 py-1.5 text-[11px] text-slate-400">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Escenarios de demostración
        </span>
      </div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onNew}
          className="flex items-center gap-4 rounded-xl border border-slate-700/60 bg-slate-800/40 px-5 py-4 text-left hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-300"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Sprout size={21} />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-200">
              Un nuevo punto de partida
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Creá un proyecto para tu municipio
            </p>
          </div>
          <ArrowUpRight size={16} className="ml-auto shrink-0 text-slate-400" />
        </button>
        <button
          type="button"
          onClick={() => onOpen(currentProject)}
          className="flex items-center gap-4 rounded-xl border border-slate-700/60 bg-slate-800/40 px-5 py-4 text-left hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-300"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-700/50 text-slate-300">
            <FolderOpen size={21} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-200">
              Continuar donde quedaste
            </p>
            <p className="mt-1 truncate text-xs text-slate-400">
              {currentProject.name}
            </p>
          </div>
          <ArrowUpRight size={16} className="ml-auto shrink-0 text-slate-400" />
        </button>
      </div>
    </>
  )
}
