import type { BlockCatalog } from '../../types/study'
import type { StudySummary } from '../../data/studyAnalysis'
import { studyBounds } from '../../data/studyGeometry'
import { createBasemapStyle, type BasemapId } from '../../data/basemaps'

export type ReportMapImage = { url: string; kind: 'map' | 'plan'; credits: string }
const colors: Record<string, string> = { Bueno: '#059669', Regular: '#d97706', Malo: '#e11d48', 'Sin relevar': '#64748b' }
export function reportCanvas(summary: StudySummary, blocks: BlockCatalog | null) {
  const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 1000
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#f1f5f9'; ctx.fillRect(0, 0, 1600, 1000)
  const bounds = studyBounds(summary.area)
  const mercator = (point: number[]) => [point[0] * Math.PI / 180, Math.log(Math.tan(Math.PI / 4 + point[1] * Math.PI / 360))]
  const lo = mercator(bounds[0]), hi = mercator(bounds[1])
  const scale = Math.min(1400 / (hi[0] - lo[0]), 760 / (hi[1] - lo[1]))
  const project = (point: number[]) => {
    const p = mercator(point)
    return [800 + (p[0] - (hi[0] + lo[0]) / 2) * scale, 460 - (p[1] - (hi[1] + lo[1]) / 2) * scale]
  }
  const ring = (coordinates: number[][]) => {
    ctx.beginPath(); coordinates.forEach((p, i) => { const [x, y] = project(p); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y) }); ctx.closePath()
  }
  for (const block of blocks?.features ?? []) {
    if (!block.geometry.coordinates[0].some((p) => p[0] >= bounds[0][0] - .003 && p[0] <= bounds[1][0] + .003 && p[1] >= bounds[0][1] - .003 && p[1] <= bounds[1][1] + .003)) continue
    ring(block.geometry.coordinates[0]); ctx.fillStyle = '#e2e8f0'; ctx.fill(); ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke()
  }
  ring(summary.area.geometry.coordinates[0]); ctx.fillStyle = '#d1fae5'; ctx.fill(); ctx.strokeStyle = '#047857'; ctx.lineWidth = 5; ctx.stroke()
  for (const tree of summary.trees) {
    const [x, y] = project(tree.coordinates)
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fillStyle = colors[tree.census.estado_sanitario ?? 'Sin relevar']; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()
  }
  decorate(canvas, summary, 'Cartografía: IDE Tandil · Municipalidad de Tandil. Registros: agrotech.')
  const metersPerPixel = 6371008.8 * Math.cos((bounds[0][1] + bounds[1][1]) / 2 * Math.PI / 180) / scale
  drawScale(canvas, metersPerPixel)
  return canvas
}
function decorate(canvas: HTMLCanvasElement, summary: StudySummary, credits: string) {
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgba(248,250,252,.96)'; ctx.fillRect(0, 910, 1600, 90)
  ctx.font = '18px sans-serif'; ctx.textBaseline = 'middle'
  Object.entries(colors).forEach(([label, color], i) => {
    ctx.beginPath(); ctx.arc(40 + i * 240, 938, 7, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill()
    ctx.fillStyle = '#334155'; ctx.fillText(label, 57 + i * 240, 938)
  })
  ctx.font = '15px sans-serif'; ctx.fillText(credits, 30, 978)
  ctx.fillStyle = 'rgba(248,250,252,.95)'; ctx.fillRect(1500, 20, 75, 95)
  ctx.fillStyle = '#334155'; ctx.font = 'bold 25px sans-serif'; ctx.fillText('N', 1527, 45)
  ctx.beginPath(); ctx.moveTo(1537, 59); ctx.lineTo(1525, 94); ctx.lineTo(1537, 87); ctx.lineTo(1549, 94); ctx.closePath(); ctx.fill()
  ctx.font = '16px sans-serif'; ctx.fillStyle = '#475569'; ctx.fillText(`Zona: ${(summary.areaM2 / 10000).toLocaleString('es-AR', { maximumFractionDigits: 2 })} ha`, 1200, 938)
}
function drawScale(canvas: HTMLCanvasElement, metersPerPixel: number) {
  const ctx = canvas.getContext('2d')!
  const target = metersPerPixel * 200, power = 10 ** Math.floor(Math.log10(target))
  const nice = [1, 2, 5, 10].map((n) => n * power).reduce((a, b) => Math.abs(a - target) < Math.abs(b - target) ? a : b)
  const pixels = nice / metersPerPixel
  ctx.fillStyle = '#f8fafc'; ctx.fillRect(25, 820, pixels + 35, 70); ctx.strokeStyle = '#334155'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(40, 840); ctx.lineTo(40, 850); ctx.lineTo(40 + pixels, 850); ctx.lineTo(40 + pixels, 840); ctx.stroke()
  ctx.font = '18px sans-serif'; ctx.fillStyle = '#334155'; ctx.fillText(`${nice} m`, 40, 875)
}
export async function renderReportMap(summary: StudySummary, basemap: BasemapId, blocks: BlockCatalog | null, signal: AbortSignal): Promise<ReportMapImage> {
  const fallback = () => ({ url: reportCanvas(summary, blocks).toDataURL('image/png'), kind: 'plan' as const, credits: 'IDE Tandil · agrotech' })
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
  const { Map } = await import('maplibre-gl')
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
  return new Promise((resolve, reject) => {
    let map: InstanceType<typeof Map> | undefined, done = false
    const container = document.createElement('div')
    Object.assign(container.style, { position: 'fixed', left: '-10000px', top: '0', width: '1600px', height: '1000px' })
    document.body.append(container)
    const cleanup = () => { window.clearTimeout(timer); signal.removeEventListener('abort', abort); map?.remove(); container.remove() }
    const finish = (result: ReportMapImage) => { if (done) return; done = true; cleanup(); resolve(result) }
    const abort = () => { if (done) return; done = true; cleanup(); reject(new DOMException('Aborted', 'AbortError')) }
    const timer = window.setTimeout(() => finish(fallback()), 9000)
    signal.addEventListener('abort', abort, { once: true })
    try {
      map = new Map({ container, style: createBasemapStyle(basemap, true), bounds: studyBounds(summary.area),
        fitBoundsOptions: { padding: { top: 70, right: 70, bottom: 130, left: 70 } },
        maxZoom: 19, pixelRatio: 1, interactive: false, attributionControl: false,
        canvasContextAttributes: { preserveDrawingBuffer: true } })
      map.on('webglcontextlost', () => finish(fallback()))
      map.on('load', () => {
        if (done || !map) return
        map.addSource('report-zone', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: summary.area.geometry } })
        map.addLayer({ id: 'report-zone-fill', type: 'fill', source: 'report-zone', paint: { 'fill-color': '#059669', 'fill-opacity': .12 } })
        map.addLayer({ id: 'report-zone-line', type: 'line', source: 'report-zone', paint: { 'line-color': '#047857', 'line-width': 3 } })
        map.addSource('report-trees', { type: 'geojson', data: { type: 'FeatureCollection', features: summary.trees.map((tree) => ({ type: 'Feature', properties: { color: colors[tree.census.estado_sanitario ?? 'Sin relevar'] }, geometry: { type: 'Point', coordinates: tree.coordinates } })) } })
        map.addLayer({ id: 'report-trees', type: 'circle', source: 'report-trees', paint: { 'circle-radius': 5, 'circle-color': ['get', 'color'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 1 } })
        map.once('idle', () => {
          if (done || !map) return
          try {
            const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 1000
            const ctx = canvas.getContext('2d')!; ctx.drawImage(map.getCanvas(), 0, 0, 1600, 1000)
            const credits = basemap === 'satellite' ? 'Imágenes: Esri, Vantor, Earthstar Geographics y GIS User Community. Registros: agrotech.' : 'Mapa: OpenFreeMap · © OpenMapTiles · © OpenStreetMap contributors. Registros: agrotech.'
            decorate(canvas, summary, credits)
            const meters = map.unproject([300, 850]).distanceTo(map.unproject([500, 850]))
            drawScale(canvas, meters / 200)
            finish({ url: canvas.toDataURL('image/png'), kind: 'map', credits })
          } catch { finish(fallback()) }
        })
      })
    } catch { finish(fallback()) }
  })
}
