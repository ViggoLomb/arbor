import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { registerHooks } from 'node:module'
registerHooks({ resolve(specifier, context, next) {
  return next(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context)
} })
const { nearestStreetCameras, cameraDistance, photoPointsData } = await import('../src/data/streetNavigation.ts')
const { treesInCamera, treeImageAnchor, layoutTreeLabels, coverImagePoint, visibleTreeAnchor } = await import('../src/data/streetTrees.ts')
const route = JSON.parse(readFileSync(new URL('../src/data/streetRoute.json', import.meta.url)))
const trees = JSON.parse(readFileSync(new URL('../src/data/generated/tandil-trees.json', import.meta.url)))
const extras = JSON.parse(readFileSync(new URL('../src/data/generated/street-extra-labels.json', import.meta.url)))
const cameras = route.map((c) => ({ ...c, coordinates: c.computed_geometry.coordinates, bearing: c.computed_compass_angle }))

test('all 89 cameras are reachable from every entry, without date or sequence barriers', () => {
  for (const start of cameras) {
    const seen = new Set([start.id]), pending = [start]
    while (pending.length) {
      const current = pending.pop()
      for (const neighbor of Object.values(nearestStreetCameras(current, cameras))) {
        if (!neighbor || seen.has(neighbor.camera.id)) continue
        assert.ok(neighbor.distanceM <= 40)
        assert.notEqual(neighbor.camera.id, current.id)
        seen.add(neighbor.camera.id)
        pending.push(neighbor.camera)
      }
    }
    assert.equal(seen.size, 89, `Unreachable camera from ${start.id}`)
  }
})
test('the closest camera wins even when its date and sequence differ', () => {
  const origin = { id: 'origin', coordinates: [0, 0], bearing: 0, captured_at: 200, sequence: 'one' }
  const older = { ...origin, id: 'older', coordinates: [0, .00001], captured_at: 100, sequence: 'other' }
  const newer = { ...origin, id: 'newer', coordinates: [0, .00002] }
  assert.equal(nearestStreetCameras(origin, [origin, older, newer]).forward.camera.id, 'older')
  assert.equal(nearestStreetCameras(origin, [origin, newer, older]).forward.camera.id, 'older')
  assert.equal(nearestStreetCameras(origin, [origin, older], 90).left.camera.id, 'older')
})
test('nearest options never ignore a closer photo in the same viewing sector', () => {
  for (const origin of cameras) {
    const selected = nearestStreetCameras(origin, cameras)
    for (const camera of cameras) {
      if (camera.id === origin.id) continue
      const single = nearestStreetCameras(origin, [camera])
      for (const [direction, neighbor] of Object.entries(single))
        if (neighbor) assert.ok(selected[direction].distanceM <= cameraDistance(origin, camera) + 1e-8)
    }
  }
})
test('all 226 labels use this exact photo and preserve their tree association', () => {
  let photos = 0, observations = 0
  for (const camera of cameras) {
    const visible = treesInCamera(trees, camera.id)
    if (visible.length) photos++
    observations += visible.length
    assert.equal(new Set(visible.map((v) => v.tree.id)).size, visible.length)
    for (const { tree, observation } of visible) {
      assert.equal(observation.cameraId, camera.id)
      assert.ok(tree.observations.some((o) => o.id === observation.id))
      assert.ok(treeImageAnchor(observation).every((n) => n >= 0 && n <= 1))
    }
  }
  assert.equal(photos, 79)
  assert.equal(observations, 226)
})
test('nearby labels are separated and offscreen detections are hidden', () => {
  const labels = layoutTreeLabels([
    { id: 'a', point: [500, 400] }, { id: 'b', point: [505, 405] },
    { id: 'c', point: [510, 410] }, { id: 'offscreen', point: [-5, 100] },
  ], 1200, 800)
  assert.equal(labels.length, 3)
  for (const a of labels) for (const b of labels) {
    if (a.id === b.id) continue
    assert.ok(Math.abs(a.x-b.x) >= 132 || Math.abs(a.y-b.y) >= 36)
  }
})
test('static-image labels follow the same centered cover crop as the photograph', () => {
  assert.deepEqual(coverImagePoint([.5, .5], 800, 600, 1600, 900), [800, 450])
  assert.deepEqual(coverImagePoint([0, 0], 800, 600, 1600, 900), [0, -150])
  assert.deepEqual(coverImagePoint([.5, .5], 800, 600, 400, 800), [200, 400])
})
test('additional local observations and image review cover all 89 photos without changing census identities', () => {
  const before = structuredClone(trees)
  let photos = 0, total = 0
  for (const camera of cameras) {
    const labels = treesInCamera(trees, camera.id, extras)
    if (labels.length) photos++
    total += labels.length
    assert.equal(new Set(labels.map((item) => item.tree.id)).size, labels.length)
    assert.ok(labels.every((item) => item.observation.cameraId === camera.id))
  }
  assert.equal(photos, 89)
  assert.equal(total, 314)
  assert.equal(extras.filter((item) => item.kind === 'tree').length, 80)
  assert.equal(extras.filter((item) => item.observation.annotationSource === 'manual').length, 1)
  assert.equal(extras.filter((item) => item.kind === 'group').length, 8)
  assert.deepEqual(trees, before)
})
test('partially visible trees keep labels even when their crown anchor is cropped', () => {
  assert.deepEqual(visibleTreeAnchor([[200, -20], [200, 140], [200, 300]], 800, 600), [200, 140])
  assert.deepEqual(visibleTreeAnchor([[-20, -20], [900, 700]], 800, 600), [400, 300])
  assert.equal(visibleTreeAnchor([[-20, -20], [-10, -10]], 800, 600), null)
})
test('minimap data contains the 89 photograph positions as circles rather than a connected route', () => {
  const points = photoPointsData(cameras)
  assert.equal(points.features.length, 89)
  assert.deepEqual(points.features.map((f) => f.geometry.coordinates), cameras.map((c) => c.coordinates))
  assert.ok(points.features.every((f) => f.geometry.type === 'Point'))
})
