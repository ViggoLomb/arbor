import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { test } from 'node:test'
registerHooks({ resolve(specifier, context, next) {
  return next(specifier.startsWith('.') && !context.parentURL?.includes('/node_modules/') && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context)
} })
const geometry = await import('../src/data/studyGeometry.ts')
const { selectStudyTrees, summarizeStudy } = await import('../src/data/studyAnalysis.ts')
const { parseStudyArea } = await import('../src/hooks/useStudyArea.ts')
const { emptyCensus } = await import('../src/types/tree.ts')
const { resolveTreeHeight } = await import('../src/data/treeHeight.ts')
const { createReportPdf, reportFilename } = await import('../src/components/reports/reportPdf.ts')
const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url)))
const known = read('../src/data/studyDefaultBlock.json')
const records = read('../src/data/generated/tandil-trees.json').map((tree) => ({ ...tree, census: { ...emptyCensus }, height: resolveTreeHeight(tree, emptyCensus) }))
const area = { id: 'study-test', name: known.name, mode: 'block', geometry: known.geometry, bufferM: 10, includedIds: [], excludedIds: [], source: known.source, selectedAt: new Date().toISOString() }

test('actual block surface is about 1.98 ha, independent of the inventory bounding box', () => {
  assert.equal(geometry.validPolygon(area.geometry), true)
  assert.ok(Math.abs(geometry.polygonAreaM2(area.geometry) - 19800) < 300)
  assert.ok(geometry.polygonPerimeterM(area.geometry) > 500)
  assert.equal(geometry.pointInPolygon(area.geometry.coordinates[0][0], area.geometry), true)
})
test('invalid, open, degenerate and self crossing polygons are rejected', () => {
  for (const points of [[], [[0,0],[1,1]], [[0,0],[1,1],[0,1],[1,0]], [[0,0],[0,0],[1,1]], [[0,0],[1,0],[2,0]]]) {
    assert.equal(geometry.validPolygon(geometry.polygonFromPoints(points)), false)
  }
  assert.equal(geometry.validPolygon({ type: 'Polygon', coordinates: [[[0,0],[1,0],[0,1],[3,4]]] }), false)
})
test('boundary and exterior buffer membership use meters', () => {
  const geometryValue = geometry.polygonFromPoints([[0,0],[.001,0],[.001,.001],[0,.001]])
  const a = { ...area, geometry: geometryValue, bufferM: 10 }
  assert.equal(geometry.containsStudyPoint(a, [-.00008,.0005]), true)
  assert.equal(geometry.containsStudyPoint(a, [-.00011,.0005]), false)
  assert.equal(geometry.containsStudyPoint({ ...a, bufferM: 0 }, [-.00001,.0005]), false)
  assert.equal(geometry.pointInPolygon([.0005,.0005], { ...geometryValue, coordinates: [...geometryValue.coordinates, geometry.polygonFromPoints([[.0004,.0004],[.0006,.0004],[.0006,.0006],[.0004,.0006]]).coordinates[0]] }), false)
})
test('all prepared municipal blocks are selectable closed polygons with unique IDs', () => {
  const catalog = read('../public/data/tandil-blocks.geojson')
  assert.ok(catalog.features.length > 3000)
  assert.equal(new Set(catalog.features.map((f) => f.properties.id)).size, catalog.features.length)
  for (const f of catalog.features) assert.equal(geometry.validPolygon(f.geometry), true, f.properties.id)
})
test('a street corridor is a valid area and selects its segment', () => {
  const a = [-59.141, -37.335], b = [-59.140, -37.335]
  const polygon = geometry.streetArea(a, b)
  assert.equal(geometry.validPolygon(polygon), true)
  assert.equal(geometry.pointInPolygon(a, polygon), true)
  assert.ok(geometry.polygonAreaM2(polygon) > 1700)
})
test('manual exclusions win over inclusions and a record is never counted twice', () => {
  const selected = selectStudyTrees(area, records)
  assert.ok(selected.length > 0 && selected.length < 124)
  const outside = records.find((t) => !selected.some((s) => s.id === t.id))
  const changed = { ...area, includedIds: [selected[0].id, outside.id, outside.id], excludedIds: [selected[0].id] }
  const result = selectStudyTrees(changed, records)
  assert.equal(result.length, selected.length)
  assert.ok(result.some((t) => t.id === outside.id))
  assert.ok(!result.some((t) => t.id === selected[0].id))
})
test('campaign totals, missing fields and manual measurements are reflected without zero imputation', () => {
  const first = selectStudyTrees(area, records)[0]
  const census = { ...emptyCensus, especie: 'Fresno', dap_cm: 34, altura_m: 12, estado_sanitario: 'Bueno', interferencias: { Cables: false, Vereda: true, Luminarias: false } }
  const updated = records.map((t) => t.id === first.id ? { ...t, census, height: resolveTreeHeight(t, census) } : t)
  const summary = summarizeStudy(area, updated, 'all')
  assert.equal(summary.complete, 1)
  assert.equal(summary.dap.count, 1)
  assert.equal(summary.dap.mean, 34)
  assert.equal(summary.heights.count, summary.trees.length)
  assert.equal(summary.health.find(([state]) => state === 'Sin relevar')[1], summary.trees.length - 1)
  assert.equal(summary.byCampaign.reduce((sum, c) => sum + c.count, 0), summary.trees.length)
  for (const year of ['2018', '2019']) {
    const filtered = summarizeStudy(area, updated.filter((t) => t.campaign === year), year)
    assert.equal(filtered.byCampaign.length, 1)
    assert.ok(filtered.trees.every((t) => t.campaign === year))
  }
  assert.equal(summarizeStudy(area, records, 'all').dap, null)
})
test('empty areas outside inventory explicitly report unavailable coverage', () => {
  const other = { ...area, geometry: geometry.polygonFromPoints([[-59,-37],[-58.999,-37],[-58.999,-36.999],[-59,-36.999]]) }
  assert.equal(summarizeStudy(other, records, 'all').coverage, 'unavailable')
  assert.equal(summarizeStudy(other, records, 'all').heights, null)
})
test('study persistence rejects corrupted data and preserves selection plus exceptions', () => {
  assert.deepEqual(parseStudyArea(JSON.stringify(area)), area)
  for (const invalid of ['bad json', 'null', '[]', JSON.stringify({ ...area, bufferM: 31 }), JSON.stringify({ ...area, includedIds: [2] }), JSON.stringify({ ...area, geometry: null })]) assert.equal(parseStudyArea(invalid), null)
})
test('the report produces a paginated PDF with the selected records and a safe filename', async () => {
  const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg=='
  const pdf = await createReportPdf({ project: 'Tandil', summary: summarizeStudy(area, records, 'all'), generatedAt: new Date().toISOString() }, { url, kind: 'plan', credits: 'IDE Tandil' })
  assert.ok(pdf.getNumberOfPages() >= 3)
  assert.ok(Buffer.from(pdf.output('arraybuffer')).toString().startsWith('%PDF-'))
  assert.equal(reportFilename('../Área / Constitución'), 'arbor-informe-Area-Constitucion.pdf')
})
