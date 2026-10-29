import { useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Command } from 'cmdk'
import {
  ChartNoAxesColumn,
  Cpu,
  House,
  Image,
  Layers,
  Map,
  Search,
  TreePine,
  X,
} from 'lucide-react'
import type { Project } from '../../types/project'
import type { SelectedTree } from '../../types/tree'

type CommandDialogProps = {
  open: boolean
  onClose: () => void
  projects: Project[]
  trees: SelectedTree[]
  onAction: (action: 'home' | 'image' | 'yolo' | 'layers' | 'analysis') => void
  onProject: (project: Project) => void
  onTree: (tree: SelectedTree) => void
}

export default function CommandDialog({
  open,
  onClose,
  projects,
  trees,
  onAction,
  onProject,
  onTree,
}: CommandDialogProps) {
  const [query, setQuery] = useState('')
  const matchingTrees = trees
    .filter((tree) =>
      `${tree.label} ${tree.census.especie} ${tree.calle}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
    )
    .slice(0, 40)
  const searchInput = useRef<HTMLInputElement>(null)
  const actions = [
    { id: 'home', label: 'Ir al Inicio', icon: House },
    { id: 'image', label: 'Importar Imagen', icon: Image },
    { id: 'yolo', label: 'Cargar Detecciones IA', icon: Cpu },
    { id: 'layers', label: 'Abrir capas y leyenda', icon: Layers },
    {
      id: 'analysis',
      label: 'Ver análisis territorial',
      icon: ChartNoAxesColumn,
    },
  ] as const
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/25 backdrop-blur-sm" />
        <Dialog.Popup
          initialFocus={searchInput}
          finalFocus={() => document.getElementById('arbor-menu-trigger')}
          className="fixed top-[min(15vh,8rem)] left-1/2 z-60 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/95 text-slate-800 shadow-2xl outline-none backdrop-blur-xl"
        >
          <Dialog.Title className="sr-only">Buscar en Arbor</Dialog.Title>
          <Dialog.Description className="sr-only">
            Buscá acciones, proyectos o árboles. Usá las flechas para elegir y
            Enter para abrir.
          </Dialog.Description>
          <Command label="Acciones y proyectos" className="text-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 px-4">
              <Search size={19} className="shrink-0 text-slate-500" />
              <Command.Input
                ref={searchInput}
                value={query}
                onValueChange={setQuery}
                data-arbor-search=""
                placeholder="Buscá un proyecto, árbol o acción…"
                className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
              <Dialog.Close
                aria-label="Cerrar búsqueda"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-200/60"
              >
                <X size={17} />
              </Dialog.Close>
            </div>
            <Command.List className="max-h-[min(60dvh,28rem)] overflow-y-auto p-2">
              <Command.Empty className="px-4 py-10 text-center text-xs text-slate-500">
                No encontramos resultados.
              </Command.Empty>
              <Command.Group heading="Acciones">
                {actions.map(({ id, label, icon: Icon }) => (
                  <Command.Item
                    key={id}
                    value={label}
                    onSelect={() => {
                      onClose()
                      onAction(id)
                    }}
                    className="command-item"
                  >
                    <Icon size={17} />
                    {label}
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="Proyectos">
                {projects.map((project) => (
                  <Command.Item
                    key={project.id}
                    value={`${project.name} ${project.library}`}
                    onSelect={() => {
                      onClose()
                      onProject(project)
                    }}
                    className="command-item"
                  >
                    <Map size={17} />
                    <span className="truncate">{project.name}</span>
                    <span className="ml-auto text-[10px] text-slate-500">
                      {project.library}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
              {open && (
                <Command.Group heading="Árboles del proyecto">
                  {matchingTrees.map((tree) => (
                    <Command.Item
                      key={tree.label}
                      value={`Árbol ${tree.label} ${tree.census.especie} ${tree.calle}`}
                      onSelect={() => {
                        onClose()
                        onTree(tree)
                      }}
                      className="command-item"
                    >
                      <TreePine size={17} />
                      Árbol {tree.label}
                      <span className="ml-auto text-[10px] text-slate-500">
                        {tree.census.estado_sanitario ?? 'Sin relevar'}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
            <div className="flex justify-between border-t border-slate-200 px-4 py-3 text-[10px] text-slate-500">
              <span>↑ ↓ navegar · ↵ abrir</span>
              <span>Esc cerrar</span>
            </div>
          </Command>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
