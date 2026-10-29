import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { Viewer, RenderMode } from 'mapillary-js'
import { LocalImageProvider } from './LocalImageProvider'

export default function StreetImage({
  viewerRef,
  cameraId,
  onBearing,
  onReady,
  onError,
}: {
  viewerRef: RefObject<Viewer | null>
  cameraId: string
  onBearing: (bearing: number) => void
  onReady: (value: boolean) => void
  onError: (value: boolean) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!container.current) return
    let disposed = false
    let viewer: Viewer | undefined
    try {
      viewer = new Viewer({
        container: container.current,
        dataProvider: new LocalImageProvider(),
        imageTiling: false,
        renderMode: RenderMode.Fill,
        component: {
          bearing: false,
          cover: false,
          direction: false,
          sequence: false,
          zoom: false,
          attribution: false,
          spatial: false,
          keyboard: {
            keyPlay: false,
            keySequenceNavigation: false,
            keySpatialNavigation: false,
          },
        },
      })
      viewerRef.current = viewer
      viewer.on('bearing', (event) => onBearing(event.bearing))
    } catch {
      queueMicrotask(() => {
        if (!disposed) onError(true)
      })
    }
    return () => {
      disposed = true
      viewerRef.current = null
      viewer?.remove()
    }
  }, [viewerRef, onBearing, onError])
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    let disposed = false
    viewer
      .moveTo(cameraId)
      .then(() => {
        if (disposed) return
        viewer.setZoom(0)
        viewer.setCenter([0.5, 0.5])
        onReady(true)
      })
      .catch(() => {
        if (!disposed) onError(true)
      })
    return () => {
      disposed = true
    }
  }, [cameraId, viewerRef, onReady, onError])
  return (
    <div className="absolute inset-0">
      <div
        ref={container}
        className="h-full w-full"
        role="region"
        aria-label="Visor interactivo de la fotografía de 25 de Mayo"
      />
    </div>
  )
}
