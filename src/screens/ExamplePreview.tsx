import { ArrowLeft } from 'lucide-react'
import { scenarios } from '../data/scenarios'
export default function ExamplePreview({ onClose }: { onClose: () => void }) {
  const scenario = scenarios.thessaloniki
  return (
    <main className="relative h-dvh bg-slate-900 text-slate-100">
      <img
        src={scenario.image}
        alt="Vista satelital de Tesalónica"
        className="h-full w-full object-contain"
      />
      <div className="absolute top-5 left-5 rounded-2xl bg-slate-900/90 p-5 shadow-lg backdrop-blur-md">
        <button
          onClick={onClose}
          className="flex items-center gap-2 rounded-lg p-2 hover:bg-slate-700 focus-visible:outline-2"
        >
          <ArrowLeft size={18} />
          Volver a Inicio
        </button>
        <h1 className="mt-3 text-lg font-semibold">Tesalónica</h1>
        <p className="mt-2 text-sm">Previsualización de solo lectura</p>
        <p className="mt-2 text-xs">
          Imágenes © Esri, Vantor, Earthstar Geographics y GIS User Community
        </p>
      </div>
    </main>
  )
}
