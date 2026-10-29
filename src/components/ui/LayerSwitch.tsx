type LayerSwitchProps = {
  checked: boolean
  onToggle: () => void
  labelledBy: string
  describedBy: string
  disabled?: boolean
}

export default function LayerSwitch({ checked, onToggle, labelledBy, describedBy, disabled = false }: LayerSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      disabled={disabled}
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={onToggle}
      className="group flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="relative block h-6 w-11 rounded-full bg-slate-300 group-aria-checked:bg-slate-800">
        <span className="absolute top-1 left-1 size-4 rounded-full bg-slate-50 shadow-sm group-aria-checked:translate-x-5" />
      </span>
    </button>
  )
}
