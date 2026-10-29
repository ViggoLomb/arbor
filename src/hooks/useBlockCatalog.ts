import { useEffect, useState } from 'react'
import type { BlockCatalog } from '../types/study'

let cached: BlockCatalog | null = null
export default function useBlockCatalog(enabled: boolean) {
  const [catalog, setCatalog] = useState(cached)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    const request = cached ? Promise.resolve(cached) : fetch(`${import.meta.env.BASE_URL}data/tandil-blocks.geojson`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Catalog unavailable'); return response.json() })
    request
      .then((data: BlockCatalog) => {
        if (controller.signal.aborted) return
        if (data.type !== 'FeatureCollection' || !data.features.length) throw new Error('Empty catalog')
        cached = data; setCatalog(data); setError(false)
      }).catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [enabled, attempt])
  return { catalog, error, retry: () => { setError(false); setAttempt((n) => n + 1) } }
}
