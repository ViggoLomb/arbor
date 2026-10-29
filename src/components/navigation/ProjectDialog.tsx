import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { libraries } from '../../data/mockProjects'
import type { Project, ProjectAction } from '../../types/project'

type ProjectDialogProps = {
  action: ProjectAction | null
  project: Project
  defaultLibrary: string
  onClose: () => void
  onSubmit: (name: string, library: string) => void
}
const titles = {
  new: 'Nuevo proyecto',
  rename: 'Renombrar proyecto',
  move: 'Mover a biblioteca',
  duplicate: 'Duplicar proyecto',
}

export default function ProjectDialog({
  action,
  project,
  defaultLibrary,
  onClose,
  onSubmit,
}: ProjectDialogProps) {
  return (
    <Dialog.Root
      open={action !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="import-backdrop fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm" />
        <Dialog.Popup
          initialFocus={() =>
            document.getElementById(
              action === 'move' ? 'project-library' : 'project-name',
            )
          }
          className="import-modal fixed top-1/2 left-1/2 z-60 w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200/80 bg-slate-50/95 p-6 text-slate-800 shadow-2xl outline-none backdrop-blur-xl"
        >
          {action && (
            <>
              <div className="flex items-center justify-between gap-3">
                <Dialog.Title className="text-lg font-semibold tracking-tight">
                  {titles[action]}
                </Dialog.Title>
                <Dialog.Close
                  aria-label="Cerrar configuración del proyecto"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60"
                >
                  <X size={18} />
                </Dialog.Close>
              </div>
              <Dialog.Description className="mt-2 text-xs leading-5 text-slate-600">
                Los cambios se conservan durante esta sesión de demostración.
              </Dialog.Description>
              <form
                key={`${action}-${project.id}`}
                onSubmit={(event) => {
                  event.preventDefault()
                  const data = new FormData(event.currentTarget)
                  onSubmit(
                    String(data.get('name') ?? project.name).trim(),
                    String(data.get('library')),
                  )
                }}
                className="mt-6 space-y-5"
              >
                {action !== 'move' && (
                  <label className="block text-xs font-medium text-slate-600">
                    Nombre del proyecto
                    <input
                      id="project-name"
                      name="name"
                      required
                      maxLength={80}
                      pattern=".*\S.*"
                      defaultValue={
                        action === 'new'
                          ? ''
                          : action === 'duplicate'
                            ? `${project.name} · Copia`
                            : project.name
                      }
                      placeholder="Ej. Censo de arbolado 2026"
                      className="mt-2 block h-11 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm outline-none focus:border-emerald-600"
                    />
                  </label>
                )}
                <label className="block text-xs font-medium text-slate-600">
                  Biblioteca
                  <select
                    id="project-library"
                    name="library"
                    defaultValue={
                      action === 'new' ? defaultLibrary : project.library
                    }
                    className="mt-2 block h-11 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm outline-none focus:border-emerald-600"
                  >
                    {libraries.map((library) => (
                      <option key={library}>{library}</option>
                    ))}
                  </select>
                </label>
                <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
                  <Dialog.Close className="rounded-lg px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-200/50">
                    Cancelar
                  </Dialog.Close>
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-800 px-4 py-2.5 text-xs font-medium text-slate-50 hover:bg-slate-700"
                  >
                    {action === 'new'
                      ? 'Crear proyecto'
                      : action === 'duplicate'
                        ? 'Crear copia'
                        : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
