import { ArrowUpRight, Cpu, FilePlus2, Image } from 'lucide-react'
import { getAvailableTrees } from '../../data/trees'
import type { Project, ProjectSession } from '../../types/project'

export default function ProjectSources({
  currentProject,
  session,
  onOpen,
}: {
  currentProject: Project
  session: ProjectSession
  onOpen: (project: Project) => void
}) {
  return (
    <>
      <p className="text-sm text-slate-400">
        Fuentes de{' '}
        <span className="font-medium text-slate-200">
          {currentProject.name}
        </span>
      </p>
      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        {[
          {
            name: 'Imágenes aéreas',
            detail: session.imageImported
              ? 'Imagen publicada'
              : 'Sin imágenes importadas',
            icon: Image,
          },
          {
            name: 'Detecciones IA',
            detail: `${getAvailableTrees(session.campaign).length} candidatos · agrotech · ${session.campaign === 'all' ? 'Todas las campañas' : session.campaign}`,
            icon: Cpu,
          },
          {
            name: 'Relevamientos',
            detail: 'Fichas CIAFBA',
            icon: FilePlus2,
          },
        ].map(({ name, detail, icon: Icon }) => (
          <button
            key={name}
            type="button"
            onClick={() => onOpen(currentProject)}
            className="rounded-xl border border-slate-700/70 bg-slate-800/40 p-6 text-left hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-300"
          >
            <Icon size={23} className="text-emerald-300" />
            <h2 className="mt-6 text-sm font-medium">{name}</h2>
            <p className="mt-2 text-xs text-slate-400">{detail}</p>
            <span className="mt-6 flex items-center gap-2 text-xs text-emerald-300">
              Abrir proyecto
              <ArrowUpRight size={14} />
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
