import { useEffect, useImperativeHandle, useRef } from 'react'
import type { Ref } from 'react'
import { Map, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { addDetectionLayers, setDetectionsVisible } from './detectionLayers'
import { showImportedImage } from './importedImageLayer'
import { bindTreeInteractions } from './treeInteractions'
import type { SelectedTree } from '../../types/tree'

// MapLibre 6 requiere una URL de worker que Vite pueda empaquetar.
setWorkerUrl(workerUrl)

export type MapActions = {
  zoomIn: () => void
  zoomOut: () => void
  fitProject: () => void
  locateTree: (coordinates: [number, number]) => void
}

type BaseMapProps = {
  ref?: Ref<MapActions>
  detectionsVisible: boolean
  imageImported: boolean
  onTreeSelect: (tree: SelectedTree) => void
}

export default function BaseMap({
  ref,
  detectionsVisible,
  imageImported,
  onTreeSelect,
}: BaseMapProps) {
  const mapRef = useRef<Map | null>(null)
  const visibilityRef = useRef(detectionsVisible)
  const imageImportedRef = useRef(imageImported)
  const treeSelectRef = useRef(onTreeSelect)

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () =>
        mapRef.current?.zoomIn({
          duration: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 0
            : 150,
        }),
      zoomOut: () =>
        mapRef.current?.zoomOut({
          duration: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 0
            : 150,
        }),
      fitProject: () =>
        mapRef.current?.jumpTo({
          center: [-58.4, -34.6],
          zoom: 14,
          bearing: 0,
          pitch: 0,
        }),
      locateTree: (coordinates) =>
        mapRef.current?.jumpTo({ center: coordinates, zoom: 18 }),
    }),
    [],
  )

  useEffect(() => {
    treeSelectRef.current = onTreeSelect
  }, [onTreeSelect])

  useEffect(() => {
    visibilityRef.current = detectionsVisible
    if (mapRef.current) setDetectionsVisible(mapRef.current, detectionsVisible)
  }, [detectionsVisible])

  useEffect(() => {
    imageImportedRef.current = imageImported
    if (imageImported && mapRef.current) showImportedImage(mapRef.current)
  }, [imageImported])

  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return

    const map = new Map({
      container: container.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [-58.4, -34.6],
      zoom: 14,
      trackResize: true,
      attributionControl: { compact: false },
    })
    mapRef.current = map
    let removeTreeInteractions: (() => void) | undefined
    map.on('load', () => {
      addDetectionLayers(map, visibilityRef.current)
      removeTreeInteractions = bindTreeInteractions(map, (tree) =>
        treeSelectRef.current(tree),
      )
      if (imageImportedRef.current) showImportedImage(map)
    })

    const observer = new ResizeObserver(() => map.resize())
    observer.observe(container.current)

    return () => {
      removeTreeInteractions?.()
      observer.disconnect()
      mapRef.current = null
      map.remove()
    }
  }, [])

  return (
    <div className="absolute inset-0 z-0">
      <div
        ref={container}
        role="region"
        aria-label="Mapa interactivo de Buenos Aires"
        className="h-full w-full"
      />
    </div>
  )
}
