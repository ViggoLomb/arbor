import { readFileSync } from 'node:fs'
import jpeg from 'jpeg-js'

const radius = 6378137
export const project = ([lng, lat]) => [radius * lng * Math.PI / 180, radius * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))]
export const unproject = ([x, y]) => [x / radius * 180 / Math.PI, (2 * Math.atan(Math.exp(y / radius)) - Math.PI / 2) * 180 / Math.PI]

export function loadImage(name, fallback) {
  const image = jpeg.decode(readFileSync(`references/thessaloniki/${name}.jpg`), { useTArray: true })
  let extent
  try { extent = JSON.parse(readFileSync(`references/thessaloniki/${name}.extent.json`)).extent } catch { /* La extensión se puede reconstruir del pedido original. */ }
  if (!extent) {
    const [west, south, east, north] = fallback
    const [x1, y1] = project([west, south]), [x2, y2] = project([east, north])
    const scale = Math.max((x2 - x1) / image.width, (y2 - y1) / image.height)
    extent = { xmin: (x1 + x2 - scale * image.width) / 2, xmax: (x1 + x2 + scale * image.width) / 2, ymin: (y1 + y2 - scale * image.height) / 2, ymax: (y1 + y2 + scale * image.height) / 2 }
  }
  return { ...image, extent, name }
}

export function pixelToCoordinate(image, x, y) {
  const e = image.extent
  return unproject([e.xmin + x / image.width * (e.xmax - e.xmin), e.ymax - y / image.height * (e.ymax - e.ymin)])
}

// Filtro visual para ubicar el mock en vegetación: no es un detector de árboles.
export function vegetationScore(images, coordinate) {
  const [x, y] = project(coordinate)
  for (const image of images) {
    const e = image.extent
    if (x <= e.xmin || x >= e.xmax || y <= e.ymin || y >= e.ymax) continue
    const px = Math.round((x - e.xmin) / (e.xmax - e.xmin) * (image.width - 1))
    const py = Math.round((e.ymax - y) / (e.ymax - e.ymin) * (image.height - 1))
    let green = 0, total = 0
    for (const [dx, dy] of [[0,0],[-1,0],[1,0],[0,-1],[0,1]]) {
      const ix = Math.max(0, Math.min(image.width - 1, px + dx)), iy = Math.max(0, Math.min(image.height - 1, py + dy))
      const offset = (iy * image.width + ix) * 4
      const [r, g, b] = image.data.subarray(offset, offset + 3)
      const score = g - Math.max(r, b)
      if (g > 23 && g < 190 && score > 3 && g > r * 1.055 && g > b * 1.045) green += score
      total++
    }
    return green / total
  }
  return 0
}
