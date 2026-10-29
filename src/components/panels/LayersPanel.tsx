import { Circle, Image, Layers } from 'lucide-react'
import type { ProjectSession } from '../../types/project'
import { mockDetections } from '../../data/mockData'
import LayerSwitch from '../ui/LayerSwitch'
import PanelFrame from './PanelFrame'

export default function LayersPanel({
  session,
  onToggle,
  onClose,
}: {
  session: ProjectSession
  onToggle: () => void
  onClose: () => void
}) {
  return (
    <PanelFrame id="layers-panel" title="Capas" onClose={onClose}>
      <p className="mb-4 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
        Contenido del proyecto
      </p>
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700">
          <Circle size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p
            id="detections-label"
            className="text-xs font-medium text-slate-700"
          >
            Detecciones YOLO
          </p>
          <p
            id="detections-description"
            className="mt-1 text-[11px] text-slate-500"
          >
            {session.detectionsLoaded
              ? `${mockDetections.features.length} árboles · Datos simulados`
              : 'Sin detecciones importadas'}
          </p>
        </div>
        <LayerSwitch
          checked={session.detectionsVisible}
          disabled={!session.detectionsLoaded}
          onToggle={onToggle}
          labelledBy="detections-label"
          describedBy="detections-description"
        />
      </div>
      {session.detectionsLoaded && (
        <ul
          aria-label="Estado sanitario"
          className="mt-4 ml-12 space-y-2 text-xs text-slate-500"
        >
          <li className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            Bueno
          </li>
          <li className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-500" />
            Regular
          </li>
          <li className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-rose-500" />
            Malo
          </li>
        </ul>
      )}
      <div className="mt-5 flex items-center gap-3 border-t border-slate-200/80 pt-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-200/60 text-slate-500">
          <Image size={17} />
        </span>
        <div>
          <p className="text-xs font-medium text-slate-700">Imagen aérea</p>
          <p className="mt-1 text-[11px] text-slate-500">
            {session.imageImported
              ? 'Imagen de muestra publicada'
              : 'Sin imágenes importadas'}
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-slate-200/80 pt-5">
        <Layers size={17} className="ml-2 text-slate-500" />
        <div>
          <p className="text-xs font-medium text-slate-600">Mapa base</p>
          <p className="mt-1 text-[11px] text-slate-500">CARTO · Claro</p>
        </div>
      </div>
      {!session.detectionsLoaded && (
        <p className="mt-5 rounded-xl bg-slate-100 px-3 py-3 text-xs leading-5 text-slate-600">
          Conectá una fuente desde{' '}
          <span className="font-medium text-slate-700">Importar</span> en la
          barra superior.
        </p>
      )}
    </PanelFrame>
  )
}
