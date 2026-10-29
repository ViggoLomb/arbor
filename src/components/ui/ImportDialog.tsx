import type { ReactNode } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'

type ImportDialogProps = {
  title: string
  description: string
  initialFocusId: string
  closeLabel: string
  children: ReactNode
}

export default function ImportDialog({
  title,
  description,
  initialFocusId,
  closeLabel,
  children,
}: ImportDialogProps) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="import-backdrop fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm" />
      <Dialog.Popup
        initialFocus={() => document.getElementById(initialFocusId)}
        finalFocus={() => document.getElementById('import-tools-trigger')}
        className="import-modal fixed top-1/2 left-1/2 z-60 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-slate-200/80 bg-white/90 p-5 text-slate-800 shadow-2xl shadow-slate-900/15 outline-none backdrop-blur-md sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="mb-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
              Demostración
            </span>
            <Dialog.Title className="text-xl font-semibold tracking-tight">
              {title}
            </Dialog.Title>
          </div>
          <Dialog.Close
            aria-label={closeLabel}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
          >
            <X size={19} aria-hidden="true" />
          </Dialog.Close>
        </div>
        <Dialog.Description className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </Dialog.Description>
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  )
}
