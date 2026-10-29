import { useEffect, useRef, useState } from 'react'
import { Map, type GeoJSONSource } from 'maplibre-gl'
import { Expand, MapPinned, Minus, Plus, Shrink } from 'lucide-react'
import { createBasemapStyle } from '../../data/basemaps'
import type { StreetCamera } from '../../data/streetCamera'
import {
  addStreetMinimapLayers,
  viewCone,
  routeData,
  positionData,
} from './streetMinimapLayers'

export default function StreetMinimap({
  camera,
  bearing,
}: {
  camera: StreetCamera
  bearing: number
}) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const current = useRef({ camera, bearing })
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    current.current = { camera, bearing }
    const map = mapRef.current
    if (!map?.getSource('street-route')) return
    ;(map.getSource('street-cone') as GeoJSONSource).setData(
      viewCone(camera, bearing),
    )
    ;(map.getSource('street-route') as GeoJSONSource).setData(routeData(camera))
    ;(map.getSource('street-position') as GeoJSONSource).setData(
      positionData(camera),
    )
    if (!map.getBounds().contains(camera.coordinates))
      map.jumpTo({ center: camera.coordinates })
  }, [camera, bearing])
  useEffect(() => {
    if (!container.current) return
    const map = new Map({
      container: container.current,
      style: createBasemapStyle('standard', true),
      center: current.current.camera.coordinates,
      zoom: 17,
      minZoom: 15,
      maxZoom: 20,
      attributionControl: false,
    })
    mapRef.current = map
    map.on('load', () => {
      addStreetMinimapLayers(
        map,
        current.current.camera,
        current.current.bearing,
      )
    })
    const observer = new ResizeObserver(() => map.resize())
    observer.observe(container.current)
    return () => {
      observer.disconnect()
      mapRef.current = null
      map.remove()
    }
  }, [])
  return (
    <section
      aria-label="Minimapa del recorrido"
      className="absolute bottom-5 left-5 z-10 overflow-hidden rounded-xl border border-slate-200/30 bg-slate-900/90 shadow-xl backdrop-blur-md"
    >
      <div className={collapsed ? 'hidden' : 'relative'}>
        <div
          ref={container}
          role="region"
          aria-label="Ubicación y orientación en Tandil"
          className={expanded ? 'h-80 w-128' : 'h-64 w-96'}
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            type="button"
            className="street-map-button"
            aria-label={expanded ? 'Reducir minimapa' : 'Ampliar minimapa'}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <Shrink size={16} /> : <Expand size={16} />}
          </button>
        </div>
        <div className="absolute right-2 bottom-6 flex flex-col gap-1">
          <button
            type="button"
            className="street-map-button"
            aria-label="Acercar minimapa"
            onClick={() => mapRef.current?.zoomIn()}
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            className="street-map-button"
            aria-label="Alejar minimapa"
            onClick={() => mapRef.current?.zoomOut()}
          >
            <Minus size={16} />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-slate-50/90 px-2 text-right text-[10px] leading-5 text-slate-700">
          <a href="https://openfreemap.org" target="_blank" rel="noreferrer">
            OpenFreeMap
          </a>{' '}
          · ©{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            OpenStreetMap
          </a>
        </div>
      </div>
      <div className="flex items-center gap-3 px-3 py-2 text-[11px] text-slate-100">
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Mostrar minimapa' : 'Ocultar minimapa'}
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-1 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-emerald-300"
        >
          {collapsed ? <MapPinned size={16} /> : <Minus size={16} />}
        </button>
        <a
          href={camera.view_url}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-between gap-5 rounded focus-visible:outline-2 focus-visible:outline-emerald-300"
        >
          <span>{camera.creator.username} · Mapillary</span>
          <span>
            {new Date(camera.captured_at).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              timeZone: 'America/Argentina/Buenos_Aires',
            })}
          </span>
        </a>
      </div>
      <a
        href="https://creativecommons.org/licenses/by-sa/4.0/"
        target="_blank"
        rel="noreferrer"
        className="block px-3 pb-2 text-right text-[10px] text-slate-300 underline focus-visible:outline-2 focus-visible:outline-emerald-300"
      >
        Fotografías · CC BY-SA 4.0
      </a>
    </section>
  )
}
