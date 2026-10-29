import type { ReactNode } from 'react'
import { Menu } from '@base-ui/react/menu'

export default function MenuSurface({
  children,
  submenu = false,
}: {
  children: ReactNode
  submenu?: boolean
}) {
  return (
    <Menu.Portal>
      <Menu.Positioner
        side={submenu ? 'right' : 'bottom'}
        align="start"
        sideOffset={submenu ? 4 : 8}
        className="z-40 outline-none"
      >
        <Menu.Popup className="menu-surface max-h-[var(--available-height)] min-w-56 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-xl border border-slate-200/80 bg-slate-50/95 p-1.5 text-sm text-slate-700 shadow-xl shadow-slate-900/10 outline-none backdrop-blur-xl">
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}
