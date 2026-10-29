import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { test } from 'node:test'

// Node strips TypeScript; resolve Vite's extensionless imports for these tests.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier))
      return next(`${specifier}.ts`, context)
    return next(specifier, context)
  },
})
const { parseCensus } = await import('../src/data/censusStorage.ts')
const { resolveTreeHeight, isValidHeight } = await import('../src/data/treeHeight.ts')

const legacy = {
  especie: 'Relevada por usuario', dap_cm: 24.5, estado_sanitario: 'Regular',
  interferencias: { Cables: false, Vereda: true, Luminarias: null },
  observaciones: 'Conservar esta ficha',
}
const tree = { heightEstimate: { valueM: 6.5 } }

test('legacy records preserve every census field and receive no manual height', () => {
  const census = parseCensus(JSON.stringify({ tree: legacy })).tree
  assert.deepEqual(census, { ...legacy, altura_m: null })
  assert.deepEqual(resolveTreeHeight(tree, census), { valueM: 6.5, source: 'simulated' })
})
test('manual height survives a storage round trip and overrides simulation', () => {
  const census = parseCensus(JSON.stringify({ tree: { ...legacy, altura_m: 9.2 } })).tree
  assert.deepEqual(resolveTreeHeight(tree, census), { valueM: 9.2, source: 'entered' })
  assert.deepEqual(resolveTreeHeight(tree, { ...census, altura_m: null }),
    { valueM: 6.5, source: 'simulated' })
})
test('invalid height cannot erase the rest of a valid saved census', () => {
  for (const altura_m of [0, -2, '9', {}, [], true, null]) {
    const saved = parseCensus(JSON.stringify({ tree: { ...legacy, altura_m } })).tree
    assert.deepEqual(saved, { ...legacy, altura_m: null })
  }
  for (const invalid of [NaN, Infinity, -Infinity, 0, -1, '8', null, undefined])
    assert.equal(isValidHeight(invalid), false)
})
test('malformed storage and structurally invalid records are ignored', () => {
  for (const raw of ['not json', '[]', 'null', '{"tree":false}', '{"tree":{}}'])
    assert.deepEqual(parseCensus(raw), {})
})
test('different projects retain their own override of the shared default', () => {
  const projectA = parseCensus(JSON.stringify({ tree: { ...legacy, altura_m: 9 } }))
  const projectB = parseCensus(JSON.stringify({ tree: legacy }))
  assert.equal(resolveTreeHeight(tree, projectA.tree).valueM, 9)
  assert.equal(resolveTreeHeight(tree, projectB.tree).valueM, 6.5)
})
