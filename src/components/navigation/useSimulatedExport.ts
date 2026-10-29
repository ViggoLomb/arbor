import { useEffect, useState } from 'react'

export default function useSimulatedExport() {
  const [generating, setGenerating] = useState(false)
  useEffect(() => {
    if (!generating) return
    const timer = window.setTimeout(() => {
      setGenerating(false)
      window.alert('Descarga completada')
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [generating])
  return { generating, generate: () => setGenerating(true) }
}
