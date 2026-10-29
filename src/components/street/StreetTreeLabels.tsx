import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { Viewer } from 'mapillary-js'
import type { SelectedTree } from '../../types/tree'
import type { StreetCamera } from '../../data/streetCamera'
import { coverImagePoint, layoutTreeLabels, treeImageSamples, treesInCamera, visibleTreeAnchor } from '../../data/streetTrees'
import type { LabelAnchor, ExtraStreetTree } from '../../data/streetTrees'
import extraRecords from '../../data/generated/street-extra-labels.json'
import StreetTreeCard from './StreetTreeCard'

export default function StreetTreeLabels({ camera, trees, viewerRef, ready, fallback, visible }: {
  camera: StreetCamera
  trees: SelectedTree[]
  viewerRef: RefObject<Viewer | null>
  ready: boolean
  fallback: boolean
  visible: boolean
}) {
  const container = useRef<HTMLDivElement>(null)
  const [anchors, setAnchors] = useState<LabelAnchor[]>([])
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const observations = useMemo(() => treesInCamera(trees, camera.id, extraRecords as ExtraStreetTree[]), [trees, camera.id])
  const labels = useMemo(() => layoutTreeLabels(anchors, size.width, size.height), [anchors, size])
  const selected = observations.find(({ tree }) => tree.id === selectedId)?.tree
  const closeCard = useCallback(() => {
    setSelectedId(null)
    container.current?.querySelector<HTMLButtonElement>(`[data-street-tree-id="${selectedId}"]`)?.focus()
  }, [selectedId])

  useEffect(() => {
    const element = container.current
    if (!element || !visible || (!ready && !fallback)) return
    const viewer = viewerRef.current
    let disposed = false, frame = 0, revision = 0
    const update = async () => {
      const version = ++revision
      const { width, height } = element.getBoundingClientRect()
      const points = await Promise.all(observations.map(async ({ tree, observation }) => {
        try {
          const projected = await Promise.all(treeImageSamples(observation).map(async (basic) => {
            const point = fallback
              ? coverImagePoint(basic, camera.local_width, camera.local_height, width, height)
              : await viewer?.projectFromBasic(basic)
            return point?.length === 2 ? point as [number, number] : null
          }))
          const point = visibleTreeAnchor(projected, width, height)
          return point ? { id: tree.id, point } : null
        } catch { return null }
      }))
      if (disposed || version !== revision) return
      setSize({ width, height })
      setAnchors(points.filter((p): p is LabelAnchor => p !== null))
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => void update())
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(element)
    if (ready) {
      viewer?.on('pov', schedule)
      viewer?.on('fov', schedule)
      viewer?.on('moveend', schedule)
    }
    schedule()
    return () => {
      disposed = true
      ++revision
      cancelAnimationFrame(frame)
      observer.disconnect()
      viewer?.off('pov', schedule)
      viewer?.off('fov', schedule)
      viewer?.off('moveend', schedule)
    }
  }, [camera, observations, ready, fallback, visible, viewerRef])

  return (
    <>
      <div ref={container} className="pointer-events-none absolute inset-0 z-5" aria-label="Árboles detectados en la captura">
        {visible && (ready || fallback) && (
          <>
            <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
              {labels.map(({ id, point, x, y }) => (
                <g key={id}>
                  <line x1={point[0]} y1={point[1]} x2={x + 66} y2={y + 18} stroke="#047857" strokeOpacity=".8" strokeWidth="1.5" />
                  <circle cx={point[0]} cy={point[1]} r="4" fill="#047857" stroke="#f8fafc" strokeWidth="2" />
                </g>
              ))}
            </svg>
            {labels.map(({ id, x, y }) => {
              const item = observations.find(({ tree }) => tree.id === id)!
              return (
                <button key={id} type="button" data-street-tree-id={id}
                  aria-label={`Ver información de ${item.tree.label}`}
                  aria-expanded={selectedId === id}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => { event.stopPropagation(); setSelectedId(id) }}
                  style={{ left: x, top: y }}
                  className="pointer-events-auto absolute flex h-9 w-33 items-center justify-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/95 px-2 text-[11px] font-semibold text-slate-700 shadow-md shadow-slate-900/15 backdrop-blur-md hover:bg-emerald-50/95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
                  {item.tree.label}
                </button>
              )
            })}
          </>
        )}
      </div>
      {visible && selected && (ready || fallback) && <StreetTreeCard tree={selected} onClose={closeCard} />}
    </>
  )
}
