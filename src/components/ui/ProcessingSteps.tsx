import { Check, LoaderCircle } from 'lucide-react'

export type ProcessingStep = {
  stage: string
  pending: string
  active: string
  done: string
}

type ProcessingStepsProps = {
  steps: readonly ProcessingStep[]
  current: number
  label: string
}

export default function ProcessingSteps({ steps, current, label }: ProcessingStepsProps) {
  return (
    <ol aria-label={label} className="space-y-3">
      {steps.map((step, index) => {
        const done = current > index
        const active = current === index

        return (
          <li key={step.stage} aria-current={active ? 'step' : undefined} className="flex items-center gap-3 text-sm">
            <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${done ? 'bg-emerald-50 text-emerald-700' : active ? 'bg-slate-800 text-slate-50' : 'bg-slate-100 text-slate-500'}`}>
              {done ? <Check size={15} aria-hidden="true" /> : active ? <LoaderCircle size={15} className="import-spinner" aria-hidden="true" /> : <span className="text-xs">{index + 1}</span>}
            </span>
            <span className={active ? 'font-medium text-slate-800' : done ? 'text-slate-600' : 'text-slate-500'}>
              {done ? step.done : active ? step.active : step.pending}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
