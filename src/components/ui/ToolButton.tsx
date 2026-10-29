import type { ComponentProps } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Tooltip } from '@base-ui/react/tooltip'
import clsx from 'clsx'

type ToolButtonProps = ComponentProps<'button'> & {
  label: string
  icon: LucideIcon
  active?: boolean
}

export default function ToolButton({
  label,
  icon: Icon,
  active,
  className,
  ...props
}: ToolButtonProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={<button type="button" {...props} />}
        aria-label={label}
        className={clsx(
          'tool-button',
          active && 'tool-button-active',
          className,
        )}
      >
        <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={10} className="z-70">
          <Tooltip.Popup className="tool-tip rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-50 shadow-lg">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
