import { useRef } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import {
  Clock3,
  Database,
  File,
  FolderOpen,
  Search,
  X,
} from 'lucide-react'
import { libraries } from '../../data/mockProjects'

type HomeSidebarProps = {
  section: string
  onSection: (section: string) => void
  onSearch: () => void
  mobileOpen: boolean
  onClose: () => void
}

function SidebarContent({
  section,
  onSection,
  onSearch,
  onClose,
}: Omit<HomeSidebarProps, 'mobileOpen'>) {
  return (
    <aside
      aria-label="Bibliotecas de Arbor"
      className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-white/[0.08] bg-[#111111] p-4 md:w-64 xl:w-64"
    >
      <div className="mb-8 flex items-center justify-between">
        <span className="font-brand px-2 text-[2.1rem] leading-none tracking-[-0.07em] text-slate-100">
          Arbor
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar bibliotecas"
          className="rounded p-2 text-slate-400 md:hidden"
        >
          <X size={18} />
        </button>
      </div>
      <p className="mb-2 px-3 text-xs font-medium text-slate-400">
        Tu espacio de trabajo
      </p>
      <nav aria-label="Proyectos" className="space-y-1">
        <button
          className="home-nav"
          aria-current={section === 'recent' ? 'page' : undefined}
          onClick={() => onSection('recent')}
        >
          <Clock3 size={17} />
          Recientes
        </button>
        <button className="home-nav" onClick={onSearch}>
          <Search size={17} />
          Buscar
        </button>
        <button
          className="home-nav"
          aria-current={section === 'drafts' ? 'page' : undefined}
          onClick={() => onSection('drafts')}
        >
          <File size={17} />
          Borradores
        </button>
      </nav>
      <p className="mt-5 mb-2 px-3 text-xs font-medium text-slate-400">
        Bibliotecas
      </p>
      <nav aria-label="Bibliotecas" className="space-y-1">
        {libraries.map((library) => (
          <button
            key={library}
            className="home-nav"
            aria-current={section === library ? 'page' : undefined}
            onClick={() => onSection(library)}
          >
            <FolderOpen size={17} />
            {library}
          </button>
        ))}
      </nav>
      <p className="mt-5 mb-2 px-3 text-xs font-medium text-slate-400">
        Fuentes de datos
      </p>
      <button
        className="home-nav"
        aria-current={section === 'sources' ? 'page' : undefined}
        onClick={() => onSection('sources')}
      >
        <Database size={17} />
        Fuentes del proyecto
      </button>
      <div className="mt-auto pt-10">
        <div className="mt-6 flex items-center gap-3 px-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-700 text-xs text-emerald-50">
            M
          </span>
          <div>
            <p className="text-xs font-medium text-slate-300">
              Espacio municipal
            </p>
            <p className="mt-1 text-[10px] text-slate-400">Espacio municipal</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default function HomeSidebar(props: HomeSidebarProps) {
  const focusSearch = useRef(false)
  return (
    <>
      <div className="hidden shrink-0 md:flex">
        <SidebarContent {...props} />
      </div>
      <Dialog.Root
        open={props.mobileOpen}
        onOpenChange={(open) => {
          if (!open) props.onClose()
        }}
        onOpenChangeComplete={(open) => {
          if (open) focusSearch.current = false
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="import-backdrop fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm" />
          <Dialog.Popup
            finalFocus={() =>
              focusSearch.current
                ? document.querySelector<HTMLInputElement>(
                    '[aria-label="Buscar proyectos"]',
                  )
                : document.getElementById('home-nav-trigger')
            }
            className="home-sidebar fixed inset-y-0 left-0 z-60 overflow-y-auto outline-none"
          >
            <Dialog.Title className="sr-only">
              Bibliotecas de Arbor
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Elegí una biblioteca o una sección de tus proyectos.
            </Dialog.Description>
            <SidebarContent
              {...props}
              onSearch={() => {
                focusSearch.current = true
                props.onSearch()
              }}
            />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
