import { useEffect, useState } from 'react'

export type YoloStage = 'idle' | 'analyzing' | 'metrics' | 'success'

const nextStage = { analyzing: 'metrics', metrics: 'success' } as const

export default function useSimulatedYolo(active: boolean) {
  const [stage, setStage] = useState<YoloStage>('idle')

  useEffect(() => {
    if (!active || stage === 'idle' || stage === 'success') return

    const timer = window.setTimeout(() => setStage(nextStage[stage]), 1000)
    return () => window.clearTimeout(timer)
  }, [active, stage])

  function start() {
    if (stage === 'idle') setStage('analyzing')
  }

  return { stage, start }
}
