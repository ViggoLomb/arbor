import { useEffect, useState } from 'react'

export type ImportStage = 'idle' | 'uploading' | 'validating' | 'tiling' | 'success'

export const IMPORT_STEP_DURATION = 1500

const nextStage = {
  uploading: 'validating',
  validating: 'tiling',
  tiling: 'success',
} as const

export default function useSimulatedImport(active: boolean) {
  const [stage, setStage] = useState<ImportStage>('idle')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!active || stage === 'idle' || stage === 'success') return

    const timers = [window.setTimeout(() => setStage(nextStage[stage]), IMPORT_STEP_DURATION)]

    if (stage === 'uploading') {
      for (let step = 1; step <= 15; step += 1) {
        timers.push(window.setTimeout(() => setProgress(Math.round(step / 15 * 100)), step * 100))
      }
    }

    return () => timers.forEach(window.clearTimeout)
  }, [active, stage])

  function start() {
    if (stage !== 'idle') return
    setProgress(0)
    setStage('uploading')
  }

  return { stage, progress, start }
}
