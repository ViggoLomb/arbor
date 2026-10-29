import type { StudySummary } from '../../data/studyAnalysis'
import type { ReportMapImage } from './renderReportMap'
import { metric } from '../../data/studyAnalysis'

export type ReportSnapshot = { project: string; summary: StudySummary; generatedAt: string }
export type ReportPhoto = { label: string; url: string; credit: string }
export async function createReportPdf(snapshot: ReportSnapshot, map: ReportMapImage, photos: ReportPhoto[] = []) {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const { summary: s } = snapshot
  let y = 20
  const title = (text: string) => { if (y > 260) { pdf.addPage(); y = 20 } pdf.setFont('helvetica', 'bold'); pdf.setFontSize(14); pdf.setTextColor(15, 80, 65); const lines = pdf.splitTextToSize(text, 178); pdf.text(lines, 16, y); y += lines.length * 7 + 2 }
  const line = (text: string, size = 10) => {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(size)
    const wrapped = pdf.splitTextToSize(text, 178) as string[]
    pdf.setTextColor(51, 65, 85)
    for (const row of wrapped) {
      if (y > 278) { pdf.addPage(); y = 20 }
      pdf.text(row, 16, y); y += 5
    }
    y += 2
  }
  pdf.setProperties({ title: `Informe de arbolado · ${s.area.name}`, subject: snapshot.project, author: 'Arbor', creator: 'Arbor' })
  title('Arbor · Informe de arbolado urbano')
  line(snapshot.project, 12); line(s.area.name, 12)
  line(`Emitido: ${new Date(snapshot.generatedAt).toLocaleString('es-AR')} · Campaña: ${s.campaign === 'all' ? '2018 y 2019' : s.campaign}`)
  line(`Superficie: ${metric(s.areaM2 / 10000, 2)} ha · Perímetro: ${metric(s.perimeterM, 0)} m · Franja exterior: ${s.area.bufferM} m`)
  line(`Delimitación: ${s.area.source}`, 8)
  pdf.addImage(map.url, 'PNG', 16, y, 178, 111.25); y += 119
  line(map.kind === 'map' ? 'Recorte cartográfico del área seleccionada' : 'Plano del área seleccionada')
  line(map.credits, 8)
  title('Resumen del área')
  if (s.coverage === 'unavailable') line('Sin relevamiento disponible para esta zona en el inventario del proyecto.')
  else if (!s.trees.length) line('Sin registros en la zona para la campaña seleccionada.')
  line(`Registros incluidos: ${s.trees.length} · Fichas completas: ${s.complete} · Fichas pendientes: ${s.trees.length - s.complete}`)
  line('Los registros de diferentes campañas pueden corresponder al mismo árbol.', 8)
  if (s.heights) line(`Alturas: promedio ${metric(s.heights.mean)} m · mínima ${metric(s.heights.min)} m · máxima ${metric(s.heights.max)} m`)
  if (s.dap) line(`DAP: ${s.dap.count} registros · promedio ${metric(s.dap.mean)} cm · mínimo ${metric(s.dap.min)} cm · máximo ${metric(s.dap.max)} cm`)
  else line('DAP: sin mediciones registradas.')
  pdf.addPage(); y = 20
  title('Distribución por campaña')
  for (const year of s.byCampaign) line(`${year.year}: ${year.count} registros · ${metric(year.perHa)} registros interiores/ha${year.heights ? ` · altura promedio ${metric(year.heights.mean)} m` : ''}`)
  title('Especies')
  for (const [name, count] of s.species) line(`${name}: ${count}`)
  title('Estado sanitario')
  for (const [name, count] of s.health) line(`${name}: ${count} (${metric(s.trees.length ? count / s.trees.length * 100 : 0)}%)`)
  title('Interferencias')
  for (const item of s.interference) line(`${item.name}: ${item.present} presentan · ${item.absent} no presentan · ${item.pending} sin evaluar`)
  pdf.addPage(); y = 20
  title('Detalle de registros')
  for (const tree of s.trees) {
    if (y > 250) { pdf.addPage(); y = 20; title('Detalle de registros · Continuación') }
    pdf.setDrawColor(226, 232, 240); pdf.line(16, y, 194, y); y += 6
    line(`${tree.label} · ${tree.calle} · ${tree.campaign}`)
    line(`${tree.census.especie || 'Sin relevar'} · Altura ${metric(tree.height.valueM)} m · DAP ${tree.census.dap_cm === null ? 'Sin medir' : metric(tree.census.dap_cm) + ' cm'} · Estado ${tree.census.estado_sanitario ?? 'Sin relevar'}`, 9)
    if (tree.census.observaciones) line(tree.census.observaciones, 9)
  }
  for (const photo of photos) {
    if (y > 150) { pdf.addPage(); y = 20 }
    title(`Fotografía · ${photo.label}`)
    const image = pdf.getImageProperties(photo.url)
    const width = Math.min(178, 100 * image.width / image.height), height = width * image.height / image.width
    pdf.addImage(photo.url, image.fileType, 16, y, width, height); y += height + 8
    line(photo.credit, 8)
  }
  const pages = pdf.getNumberOfPages()
  for (let page = 1; page <= pages; page++) { pdf.setPage(page); pdf.setFontSize(8); pdf.setTextColor(100, 116, 139); pdf.text(`Arbor · ${page} / ${pages}`, 194, 289, { align: 'right' }) }
  return pdf
}
export function reportFilename(areaName: string) {
  const slug = areaName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90)
  return `arbor-informe-${slug || 'area-de-estudio'}.pdf`
}
