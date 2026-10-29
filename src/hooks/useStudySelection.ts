import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { Polygon } from 'geojson'
import type { BlockCatalog, Coordinate, StudyArea, StudyMode } from '../types/study'
import knownBlock from '../data/studyDefaultBlock.json'
import { closestBlockEdge, pointInPolygon, polygonFromPoints, streetArea, validPolygon } from '../data/studyGeometry'

export default function useStudySelection(catalog: BlockCatalog | null) {
  const [draft, setDraft] = useState<StudyArea | null>(null)
  const [mode, setMode] = useState<StudyMode | null>(null)
  const [vertices, setVertices] = useState<Coordinate[]>([])
  const stop = useCallback(() => { setMode(null); setVertices([]) }, [])
  const begin = (area: StudyArea | null) => { setDraft(area); setVertices([]); setMode(area ? null : 'block') }
  const changeMode = (next: StudyMode) => { setDraft(null); setVertices([]); setMode(next) }
  const choose = (geometry: Polygon, name: string, source: string, selectedMode: StudyMode = 'block') => {
    if (!validPolygon(geometry)) { toast.error('No se pudo delimitar esta zona'); return null }
    const next: StudyArea = { id: crypto.randomUUID(), name, source, mode: selectedMode, geometry,
      bufferM: selectedMode === 'block' ? 10 : 0, includedIds: [], excludedIds: [], selectedAt: new Date().toISOString() }
    setDraft(next); stop(); return next
  }
  const chooseBlock = (id: string, point?: Coordinate) => {
    const block = catalog?.features.find((f) => f.properties.id === id)
    if (!block) return null
    if (mode === 'street' && !point) {
      const preview = choose(block.geometry, block.properties.name, 'IDE Tandil · Parcelario municipal')
      changeMode('street')
      toast.info('Ahora elegí el lado de la manzana en el mapa')
      return preview
    }
    if (mode === 'street' && point) {
      const [a, b] = closestBlockEdge(point, block.geometry)
      const ring = block.geometry.coordinates[0]
      const center = ring.reduce((sum, p) => [sum[0] + p[0] / ring.length, sum[1] + p[1] / ring.length], [0, 0])
      const interiorSide = (b[0] - a[0]) * (center[1] - a[1]) - (b[1] - a[1]) * (center[0] - a[0])
      return choose(streetArea(a, b, 20, interiorSide > 0 ? -10 : 10), `Cuadra · ${block.properties.name}`, 'IDE Tandil · Tramo de manzana y franja de 40 m', 'street')
    }
    return choose(block.geometry, block.properties.name, 'IDE Tandil · Parcelario municipal')
  }
  const onPoint = (point: Coordinate, blockId?: string) => {
    if (mode === 'polygon') { setVertices((points) => [...points, point]); return }
    const id = blockId ?? catalog?.features.find((f) => pointInPolygon(point, f.geometry))?.properties.id
    if (id) chooseBlock(id, point)
    else toast.info('Seleccioná el interior de una manzana', { description: 'También podés dibujar tu propia zona.' })
  }
  const finish = () => {
    if (vertices.length < 3) return
    const polygon = polygonFromPoints(vertices)
    if (!validPolygon(polygon)) { toast.error('Revisá el dibujo', { description: 'Los lados no deben cruzarse y el área debe tener al menos 4 m².' }); return }
    choose(polygon, 'Zona de estudio', 'Dibujo sobre el mapa', 'polygon')
  }
  return { draft, mode, vertices, begin, stop, changeMode, setDraft, chooseBlock, onPoint, finish,
    undo: () => setVertices((points) => points.slice(0, -1)),
    chooseKnown: () => choose(knownBlock.geometry as Polygon, knownBlock.name, knownBlock.source) }
}
