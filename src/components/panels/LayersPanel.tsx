import { Cpu, Image, Layers, Diamond } from 'lucide-react'
import { basemaps } from '../../data/basemaps'
import { getAvailableTrees } from '../../data/trees'
import { getPendingGroups } from '../../data/groups'
import type { ProjectSession } from '../../types/project'
import type { CampaignFilter } from '../../types/tree'
import LayerSwitch from '../ui/LayerSwitch'
import PanelFrame from './PanelFrame'
export default function LayersPanel({
  session,
  onToggle,
  onCampaign,
  onGroupsToggle,
  onClose,
}: {
  session: ProjectSession
  onToggle: () => void
  onGroupsToggle: () => void
  onCampaign: (campaign: CampaignFilter) => void
  onClose: () => void
}) {
  const count = getAvailableTrees(session.campaign).length
  const groupCount = getPendingGroups(session.campaign).length
  return (
    <PanelFrame id="layers-panel" title="Capas" onClose={onClose}>
      <p className="mb-4 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
        Contenido del proyecto
      </p>
      <label
        htmlFor="tree-campaign"
        className="text-xs font-medium text-slate-700"
      >
        Campaña de captura
      </label>
      <select
        id="tree-campaign"
        value={session.campaign}
        onChange={(event) => onCampaign(event.target.value as CampaignFilter)}
        className="mt-2 mb-5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700"
      >
        <option value="all">Todas las campañas</option>
        <option value="2019">2019 · 25 de Mayo</option>
        <option value="2018">2018 · Manzana completa</option>
      </select>
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700">
          <Cpu size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p
            id="detections-label"
            className="text-xs font-medium text-slate-700"
          >
            Detecciones IA
          </p>
          <p
            id="detections-description"
            className="mt-1 text-[11px] text-slate-500"
          >
            {count} candidatos · agrotech
          </p>
        </div>
        <LayerSwitch
          checked={session.detectionsVisible}
          onToggle={onToggle}
          labelledBy="detections-label"
          describedBy="detections-description"
        />
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        Grounding DINO Tiny. Podés consultar todas las
        campañas o filtrar por año.
      </p>
      <div className="mt-5 border-t border-slate-200/80 pt-5">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-100/70 text-purple-700">
            <Diamond size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p id="groups-label" className="text-xs font-medium text-slate-700">
              Grupos pendientes
            </p>
            <p
              id="groups-description"
              className="mt-1 text-[11px] text-slate-500"
            >
              {groupCount} asociaciones sin resolver
            </p>
          </div>
          <LayerSwitch
            checked={session.groupsVisible}
            onToggle={onGroupsToggle}
            labelledBy="groups-label"
            describedBy="groups-description"
          />
        </div>
        <p className="mt-3 text-[11px] leading-5 text-slate-500">
          Rombos violetas · No se suman a los candidatos del censo.
        </p>
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-slate-200/80 pt-5">
        <Image size={18} className="ml-2 text-slate-500" />
        <div>
          <p className="text-xs font-medium text-slate-700">Imagen aérea</p>
          <p className="mt-1 text-[11px] text-slate-500">
            {session.imageImported
              ? 'Imagen de Tandil publicada'
              : 'Sin imágenes importadas'}
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-slate-200/80 pt-5">
        <Layers size={18} className="ml-2 text-slate-500" />
        <div>
          <p className="text-xs font-medium text-slate-700">Mapa base</p>
          <p className="mt-1 text-[11px] text-slate-500">
            {basemaps.find((item) => item.id === session.basemap)?.provider}
          </p>
        </div>
      </div>
    </PanelFrame>
  )
}
