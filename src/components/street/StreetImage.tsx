import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { Viewer, RenderMode } from 'mapillary-js'
import { LocalImageProvider } from './LocalImageProvider'

export type StreetImageStatus = { cameraId: string; phase: 'loading' | 'ready' | 'error' }
export default function StreetImage({ viewerRef, cameraId, onBearing, onStatus }: {
  viewerRef: RefObject<Viewer | null>
  cameraId: string
  onBearing: (bearing: number) => void
  onStatus: (status: StreetImageStatus) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const currentId = useRef(cameraId)
  useEffect(() => {
    if (!container.current) return
    const element = container.current
    let viewer: Viewer | undefined
    let disposed = false
    const lost = () => onStatus({ cameraId: currentId.current, phase: 'error' })
    // Mapillary can create its canvas asynchronously. Capture context loss on
    // the container so later canvases are covered too (the event does not bubble).
    element.addEventListener('webglcontextlost', lost, true)
    try {
      viewer = new Viewer({
        container: container.current,
        dataProvider: new LocalImageProvider(), imageTiling: false,
        renderMode: RenderMode.Fill,
        component: {
          bearing: false, cover: false, direction: false, sequence: false,
          zoom: false, attribution: false, spatial: false,
          keyboard: { keyPlay: false, keySequenceNavigation: false, keySpatialNavigation: false },
        },
      })
      viewerRef.current = viewer
      viewer.on('bearing', (event) => onBearing(event.bearing))
    } catch {
      queueMicrotask(() => { if (!disposed) lost() })
    }
    return () => {
      disposed = true
      element.removeEventListener('webglcontextlost', lost, true)
      viewerRef.current = null
      viewer?.remove()
    }
  }, [viewerRef, onBearing, onStatus])
  useEffect(() => {
    currentId.current = cameraId
    const viewer = viewerRef.current
    let disposed = false, settled = false
    const finish = (phase: 'ready' | 'error') => {
      if (disposed || settled) return
      settled = true
      onStatus({ cameraId, phase })
    }
    const timeout = window.setTimeout(() => finish('error'), 10000)
    if (viewer) {
      viewer.moveTo(cameraId).then(() => {
        if (disposed || settled) return
        viewer.setZoom(0)
        viewer.setCenter([.5, .5])
        finish('ready')
      }).catch(() => finish('error'))
    } else queueMicrotask(() => finish('error'))
    return () => { disposed = true; window.clearTimeout(timeout) }
  }, [cameraId, viewerRef, onStatus])
  return <div className="absolute inset-0"><div ref={container} className="h-full w-full" role="region" aria-label="Visor interactivo de fotografías de Tandil" /></div>
}
