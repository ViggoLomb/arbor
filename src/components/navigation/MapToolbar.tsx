import { Menu } from '@base-ui/react/menu'
import {
  CloudUpload,
  Cpu,
  Crosshair,
  Image,
  Layers,
  MousePointer2,
  Pentagon,
  ChartNoAxesColumn,
} from 'lucide-react'
import { toast } from 'sonner'
import type { EditorPanel } from '../../types/project'
import ToolButton from '../ui/ToolButton'
import MenuSurface from '../ui/MenuSurface'

type MapToolbarProps = {
  panel: EditorPanel
  onPanel: (panel: EditorPanel) => void
  onImport: (type: 'image' | 'yolo') => void
}

export default function MapToolbar({
  panel,
  onPanel,
  onImport,
}: MapToolbarProps) {
  const upcoming = (name: string) =>
    toast.info(`${name} · Próximamente`, {
      description:
        'Esta herramienta formará parte de la evaluación de cobertura de Arbor.',
    })
  return (
    <nav
      aria-label="Herramientas del mapa"
      className="flex items-center gap-0.5 sm:gap-1"
    >
      <ToolButton
        label="Explorar"
        icon={MousePointer2}
        active={panel === null}
        onClick={() => onPanel(null)}
        className="hidden lg:flex"
      />
      <ToolButton
        label="Área de estudio · Próximamente"
        icon={Pentagon}
        onClick={() => upcoming('Área de estudio')}
        className="hidden text-slate-500 lg:flex"
      />
      <span
        className="mx-1 hidden h-5 w-px bg-slate-200 lg:block"
        aria-hidden="true"
      />
      <ToolButton
        label="Capas"
        icon={Layers}
        active={panel === 'layers'}
        aria-expanded={panel === 'layers'}
        aria-controls="layers-panel"
        onClick={() => onPanel(panel === 'layers' ? null : 'layers')}
      />
      <Menu.Root>
        <Menu.Trigger
          id="import-tools-trigger"
          aria-label="Importar datos"
          className="tool-button data-[popup-open]:bg-slate-200/70"
          title="Importar datos"
        >
          <CloudUpload size={20} strokeWidth={1.7} aria-hidden="true" />
        </Menu.Trigger>
        <MenuSurface>
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
            Conectar fuentes
          </p>
          <Menu.Item className="menu-item" onClick={() => onImport('image')}>
            <Image size={18} />
            <span>
              Importar Imagen
              <span className="block text-xs font-normal text-slate-500">
                Ortomosaico · .tif
              </span>
            </span>
          </Menu.Item>
          <Menu.Item className="menu-item" onClick={() => onImport('yolo')}>
            <Cpu size={18} />
            <span>
              Cargar Detecciones IA
              <span className="block text-xs font-normal text-slate-500">
                agrotech · GeoJSON
              </span>
            </span>
          </Menu.Item>
          <p className="border-t border-slate-200/80 px-3 pt-2 pb-1 text-[11px] text-slate-500">
            Conectores de demostración
          </p>
        </MenuSurface>
      </Menu.Root>
      <ToolButton
        label="Muestreo de cobertura · Próximamente"
        icon={Crosshair}
        onClick={() => upcoming('Muestreo de cobertura')}
        className="hidden text-slate-500 lg:flex"
      />
      <ToolButton
        label="Análisis"
        icon={ChartNoAxesColumn}
        active={panel === 'analysis'}
        aria-expanded={panel === 'analysis'}
        aria-controls="analysis-panel"
        onClick={() => onPanel(panel === 'analysis' ? null : 'analysis')}
      />
    </nav>
  )
}
