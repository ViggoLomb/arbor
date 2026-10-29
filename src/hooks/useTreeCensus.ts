import { useState } from 'react'
import type { CensusFields } from '../types/tree'

function readCensus(key: string): Record<string, CensusFields> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      return {}
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([, value]) =>
          value &&
          typeof value.especie === 'string' &&
          (value.dap_cm === null ||
            (Number.isFinite(value.dap_cm) && value.dap_cm > 0)) &&
          [null, 'Bueno', 'Regular', 'Malo'].includes(value.estado_sanitario) &&
          typeof value.observaciones === 'string' &&
          value.interferencias &&
          ['Cables', 'Vereda', 'Luminarias'].every((name) =>
            [null, true, false].includes(value.interferencias[name]),
          ),
      ),
    )
  } catch {
    return {}
  }
}
export default function useTreeCensus(projectId: string) {
  const key = `arbor:census:v1:${projectId}`
  const [saved, setSaved] = useState(() => readCensus(key))
  const save = (id: string, census: CensusFields) => {
    const next = { ...saved, [id]: census }
    localStorage.setItem(key, JSON.stringify(next))
    setSaved(next)
  }
  return { saved, save }
}
