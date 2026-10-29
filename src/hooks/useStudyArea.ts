import { useState } from 'react'
import type { StudyArea } from '../types/study'
import { validPolygon } from '../data/studyGeometry'

export function parseStudyArea(raw: string | null): StudyArea | null {
  try {
    const a = JSON.parse(raw ?? 'null') as StudyArea | null
    if (!a || typeof a.id !== 'string' || typeof a.name !== 'string' || !a.name.trim() || !['block', 'polygon', 'street'].includes(a.mode) || !validPolygon(a.geometry) || !Number.isFinite(a.bufferM) || a.bufferM < 0 || a.bufferM > 30 || !Array.isArray(a.excludedIds) || !Array.isArray(a.includedIds) || ![...a.excludedIds, ...a.includedIds].every((id) => typeof id === 'string') || typeof a.source !== 'string' || typeof a.selectedAt !== 'string') return null
    return a
  } catch { return null }
}
export default function useStudyArea(projectId: string) {
  const key = `arbor:study:v1:${projectId}`
  const [area, setArea] = useState<StudyArea | null>(() => {
    try { return parseStudyArea(localStorage.getItem(key)) } catch { return null }
  })
  const saveArea = (next: StudyArea | null) => {
    if (next) localStorage.setItem(key, JSON.stringify(next))
    else localStorage.removeItem(key)
    setArea(next)
  }
  return { area, saveArea }
}
