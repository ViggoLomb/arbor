import { Menu } from '@base-ui/react/menu'
import {
  ChevronDown,
  ChevronRight,
  CircleHelp,
  File,
  House,
  Pencil,
  Search,
  Undo2,
  Redo2,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import type { EditorPanel, ProjectAction } from '../../types/project'
import MenuSurface from '../ui/MenuSurface'

type ArborMenuProps = {
  onHome: () => void
  onSearch: () => void
  onProjectAction: (action: ProjectAction) => void
  onImport: () => void
  onPanel: (panel: EditorPanel) => void
  onFit: () => void
  onExport: () => void
  exporting: boolean
}

export default function ArborMenu({
  onHome,
  onSearch,
  onProjectAction,
  onImport,
  onPanel,
  onFit,
  onExport,
  exporting,
}: ArborMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        id="arbor-menu-trigger"
        aria-label="Menú Arbor"
        className="flex h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-slate-900 hover:bg-slate-200/60 data-[popup-open]:bg-slate-200/60 focus-visible:outline-2 focus-visible:outline-emerald-700"
      >
        <span className="font-brand text-[2rem] leading-none tracking-[-0.07em]">
          Arbor
        </span>
        <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
      </Menu.Trigger>
      <MenuSurface>
        <Menu.Item className="menu-item" onClick={onHome}>
          <House size={16} />
          Inicio
        </Menu.Item>
        <Menu.Item className="menu-item" onClick={onSearch}>
          <Search size={16} />
          Acciones rápidas{' '}
          <kbd className="ml-auto text-[10px] text-slate-400">Ctrl K</kbd>
        </Menu.Item>
        <Menu.Separator className="menu-separator" />
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger className="menu-item">
            <File size={16} />
            Archivo
            <ChevronRight size={15} className="ml-auto" />
          </Menu.SubmenuTrigger>
          <MenuSurface submenu>
            <Menu.Item
              className="menu-item"
              onClick={() => onProjectAction('new')}
            >
              Nuevo proyecto
            </Menu.Item>
            <Menu.Item
              className="menu-item"
              onClick={() => onProjectAction('rename')}
            >
              Renombrar proyecto
            </Menu.Item>
            <Menu.Item
              className="menu-item"
              onClick={() => onProjectAction('move')}
            >
              Mover a biblioteca
            </Menu.Item>
            <Menu.Item
              className="menu-item"
              onClick={() => onProjectAction('duplicate')}
            >
              Duplicar proyecto
            </Menu.Item>
            <Menu.Separator className="menu-separator" />
            <Menu.Item className="menu-item" onClick={onImport}>
              Importar datos…
            </Menu.Item>
            <Menu.Item
              className="menu-item"
              disabled={exporting}
              onClick={onExport}
            >
              Generar PDF
            </Menu.Item>
          </MenuSurface>
        </Menu.SubmenuRoot>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger className="menu-item">
            <Pencil size={16} />
            Editar
            <ChevronRight size={15} className="ml-auto" />
          </Menu.SubmenuTrigger>
          <MenuSurface submenu>
            <Menu.Item disabled className="menu-item">
              <Undo2 size={16} />
              Deshacer
            </Menu.Item>
            <Menu.Item disabled className="menu-item">
              <Redo2 size={16} />
              Rehacer
            </Menu.Item>
            <Menu.Separator className="menu-separator" />
            <p className="max-w-56 px-3 py-2 text-xs leading-5 text-slate-400">
              Seleccioná un árbol en el mapa para abrir su ficha de
              relevamiento.
            </p>
          </MenuSurface>
        </Menu.SubmenuRoot>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger className="menu-item">
            <Eye size={16} />
            Ver
            <ChevronRight size={15} className="ml-auto" />
          </Menu.SubmenuTrigger>
          <MenuSurface submenu>
            <Menu.Item className="menu-item" onClick={() => onPanel('study')}>
              Área de estudio
            </Menu.Item>
            <Menu.Item className="menu-item" onClick={() => onPanel('layers')}>
              Capas y leyenda
            </Menu.Item>
            <Menu.Item
              className="menu-item"
              onClick={() => onPanel('analysis')}
            >
              Análisis territorial
            </Menu.Item>
            <Menu.Item className="menu-item" onClick={() => onPanel('table')}>
              Tabla de árboles
            </Menu.Item>
            <Menu.Separator className="menu-separator" />
            <Menu.Item className="menu-item" onClick={onFit}>
              Encuadrar proyecto
            </Menu.Item>
            <Menu.Item className="menu-item" onClick={() => onPanel(null)}>
              Cerrar paneles
            </Menu.Item>
          </MenuSurface>
        </Menu.SubmenuRoot>
        <Menu.Separator className="menu-separator" />
        <Menu.Item
          className="menu-item"
          onClick={() =>
            toast.info('Tu recorrido por Arbor', {
              description:
                'Importá una imagen o detecciones IA. Después explorá los árboles, sus fichas y el análisis territorial.',
              duration: 8000,
            })
          }
        >
          <CircleHelp size={16} />
          Guía de Arbor
        </Menu.Item>
      </MenuSurface>
    </Menu.Root>
  )
}
