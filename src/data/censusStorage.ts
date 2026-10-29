import type { CensusFields } from '../types/tree'
import { isValidHeight } from './treeHeight'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

// Preserve v1 census records: absence or corruption of the new optional height
// must never discard existing species, DAP, health, interferences or notes.
export function parseCensus(raw: string | null): Record<string, CensusFields> {
  try {
    const parsed: unknown = JSON.parse(raw ?? '{}')
    if (!isRecord(parsed)) return {}
    const records: Record<string, CensusFields> = {}
    for (const [id, value] of Object.entries(parsed)) {
      if (!isRecord(value)) continue
      const interferences = value.interferencias
      if (
        typeof value.especie !== 'string' ||
        !(value.dap_cm === null || isValidHeight(value.dap_cm)) ||
        ![null, 'Bueno', 'Regular', 'Malo'].includes(value.estado_sanitario as string | null) ||
        typeof value.observaciones !== 'string' ||
        !isRecord(interferences) ||
        !['Cables', 'Vereda', 'Luminarias'].every((name) =>
          [null, true, false].includes(interferences[name] as boolean | null),
        )
      ) continue
      records[id] = {
        ...(value as unknown as CensusFields),
        altura_m: isValidHeight(value.altura_m) ? value.altura_m : null,
      }
    }
    return records
  } catch {
    return {}
  }
}
