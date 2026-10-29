import { useState } from 'react'
import { Check, CloudUpload } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type SimulatedUploadProps = {
  id: string
  idle: boolean
  success: boolean
  onStart: () => void
  idleText: string
  filename: string
  successText: string
  processingHint: string
  successHint: string
  fileIcon: LucideIcon
}

export default function SimulatedUpload({
  id, idle, success, onStart, idleText, filename, successText, processingHint, successHint, fileIcon: FileIcon,
}: SimulatedUploadProps) {
  const [dragging, setDragging] = useState(false)

  return (
    <button
      id={id}
      type="button"
      disabled={!idle}
      onClick={onStart}
      onDragOver={(event) => { event.preventDefault(); if (idle) setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); if (idle) onStart() }}
      className={`my-6 flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-5 py-6 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-600 ${dragging ? 'border-slate-500 bg-slate-100/90' : 'border-slate-300/90 bg-slate-50/70'} ${idle ? 'cursor-pointer hover:border-slate-400 hover:bg-slate-100/70' : 'cursor-default'}`}
    >
      <span className={`flex size-12 items-center justify-center rounded-2xl ${success ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200/60 text-slate-600'}`}>
        {success ? <Check size={25} aria-hidden="true" /> : idle ? <CloudUpload size={25} aria-hidden="true" /> : <FileIcon size={25} aria-hidden="true" />}
      </span>
      <span className="text-sm font-semibold text-slate-800">{idle ? idleText : success ? successText : filename}</span>
      <span className="text-xs leading-5 text-slate-500">
        {idle ? 'o hacé clic para probar la importación' : success ? successHint : processingHint}
      </span>
    </button>
  )
}
