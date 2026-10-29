import { FileDown, LoaderCircle } from 'lucide-react'

export default function ExportButton({
  generating,
  onGenerate,
}: {
  generating: boolean
  onGenerate: () => void
}) {
  return (
    <button
      type="button"
      aria-label={generating ? 'Generando...' : 'Generar PDF'}
      aria-busy={generating}
      disabled={generating}
      onClick={onGenerate}
      className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300/70 bg-slate-50/80 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-200/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-60 sm:min-w-32 sm:px-3"
    >
      {generating ? (
        <LoaderCircle
          size={17}
          className="animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : (
        <FileDown size={17} aria-hidden="true" />
      )}
      <span className="hidden sm:inline" aria-live="polite">
        {generating ? 'Generando...' : 'Generar PDF'}
      </span>
    </button>
  )
}
