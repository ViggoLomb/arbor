import { Menu } from '@base-ui/react/menu'
import { Check } from 'lucide-react'
import { basemaps } from '../../data/basemaps'
import type { BasemapId } from '../../data/basemaps'
import BasemapThumbnail from './BasemapThumbnail'

type BasemapMenuProps = {
  value: BasemapId
  labels: boolean
  onChange: (value: BasemapId) => void
  onLabelsChange: (labels: boolean) => void
}
export default function BasemapMenu({
  value,
  labels,
  onChange,
  onLabelsChange,
}: BasemapMenuProps) {
  const selected = basemaps.find((item) => item.id === value)!
  return (
    <Menu.Root>
      <Menu.Trigger
        id="basemap-trigger"
        aria-label={`Mapa base: ${selected.label}`}
        title="Cambiar mapa base"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-100/70 p-1.5 outline-none hover:bg-slate-200/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 data-[popup-open]:bg-slate-200/80"
      >
        <span className="block size-7 overflow-hidden rounded-md border border-slate-500/40">
          <BasemapThumbnail id={value} />
        </span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={12}
          className="z-40 outline-none"
        >
          <Menu.Popup
            aria-label="Mapa base"
            className="menu-surface w-68 max-w-[calc(100vw-1rem)] rounded-2xl border border-slate-200/80 bg-slate-50/95 p-3 text-sm text-slate-800 shadow-xl shadow-slate-900/15 outline-none backdrop-blur-xl"
          >
            <p className="px-2 pt-1 pb-3 text-sm font-semibold">Mapa base</p>
            <Menu.RadioGroup
              value={value}
              onValueChange={(next) => onChange(next as BasemapId)}
              aria-label="Estilo del mapa"
            >
              {basemaps.map((item) => (
                <Menu.RadioItem
                  key={item.id}
                  value={item.id}
                  closeOnClick={false}
                  className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 outline-none data-[highlighted]:bg-slate-200/60 data-[checked]:text-rose-600"
                >
                  <span className="size-13 shrink-0 overflow-hidden rounded-xl border border-slate-300/60 shadow-sm group-data-[checked]:border-rose-500 group-data-[checked]:ring-1 group-data-[checked]:ring-rose-500">
                    <BasemapThumbnail id={item.id} />
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  <Menu.RadioItemIndicator>
                    <Check size={16} aria-hidden="true" />
                  </Menu.RadioItemIndicator>
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
            <Menu.Separator className="mx-1 my-3 h-px bg-slate-200/80" />
            <Menu.CheckboxItem
              checked={labels}
              onCheckedChange={onLabelsChange}
              closeOnClick={false}
              className="group flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl px-2 outline-none data-[highlighted]:bg-slate-200/60"
            >
              <span>Mostrar etiquetas</span>
              <span
                aria-hidden="true"
                className="flex h-5 w-8 items-center rounded-full bg-slate-300 p-0.5 group-data-[checked]:bg-slate-800"
              >
                <span className="size-4 rounded-full bg-slate-50 transition-transform duration-150 ease-[var(--ease-out)] group-data-[checked]:translate-x-3 motion-reduce:transition-none" />
              </span>
            </Menu.CheckboxItem>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
