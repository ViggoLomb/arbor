import { useState } from 'react'
import { Expand, ImageOff } from 'lucide-react'
import { nearestTreeCamera, treePhotoUrl } from '../../data/trees'
import type { SelectedTree } from '../../types/tree'
export default function TreePhoto({
  tree,
  onOpen,
}: {
  tree: SelectedTree
  onOpen: () => void
}) {
  const [failed, setFailed] = useState(false)
  const camera = nearestTreeCamera(tree)
  return (
    <div>
      <button
        id="tree-photo"
        type="button"
        disabled={failed}
        onClick={onOpen}
        aria-label={`Abrir vista de calle de ${tree.label}`}
        aria-describedby="tree-photo-hint"
        className="group relative block h-48 w-full cursor-zoom-in overflow-hidden rounded-xl bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-default"
      >
        {failed ? (
          <span className="flex h-full items-center justify-center gap-2 text-xs text-slate-500">
            <ImageOff size={20} /> Fotografía no disponible
          </span>
        ) : (
          <>
            <img
              src={treePhotoUrl(tree)}
              alt={`Recorte de la detección ${tree.label}`}
              onError={() => setFailed(true)}
              className="h-full w-full object-contain"
            />
            <span
              aria-hidden="true"
              className="absolute right-3 bottom-3 rounded-full bg-slate-950/65 p-2 text-slate-50 shadow-sm backdrop-blur-md group-hover:bg-slate-950/85"
            >
              <Expand size={17} />
            </span>
          </>
        )}
      </button>
      <p
        id="tree-photo-hint"
        className="mt-2 text-[11px] leading-4 text-slate-500"
      >
        Tocá la foto para explorar la captura asociada más cercana.
      </p>
      {camera && (
        <p className="mt-1 text-[10px] text-slate-500">
          Foto:{' '}
          <a
            href={camera.view_url}
            target="_blank"
            rel="noreferrer"
            className="underline focus-visible:outline-2"
          >
            {camera.creator.username} / Mapillary
          </a>
          {' · '}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noreferrer"
            className="underline focus-visible:outline-2"
          >
            CC BY-SA 4.0
          </a>{' '}
          · Recorte
        </p>
      )}
    </div>
  )
}
