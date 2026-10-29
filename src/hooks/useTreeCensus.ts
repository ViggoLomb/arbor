import { useState } from 'react'
import type { CensusFields } from '../types/tree'
import { parseCensus } from '../data/censusStorage'

function readCensus(key: string): Record<string, CensusFields> {
  try {
    return parseCensus(localStorage.getItem(key))
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
