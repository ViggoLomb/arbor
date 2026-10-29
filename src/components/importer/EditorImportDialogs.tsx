import { Dialog } from '@base-ui/react/dialog'
import ModalImportador from '../ui/ModalImportador'
import ModalYolo from '../ui/ModalYolo'
export default function EditorImportDialogs({
  type,
  count,
  onClose,
  onImage,
  onDetections,
}: {
  type: 'image' | 'yolo' | null
  count: number
  onClose: () => void
  onImage: () => void
  onDetections: () => void
}) {
  return (
    <>
      <Dialog.Root
        open={type === 'image'}
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <ModalImportador open={type === 'image'} onViewMap={onImage} />
      </Dialog.Root>
      <Dialog.Root
        open={type === 'yolo'}
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <ModalYolo
          open={type === 'yolo'}
          count={count}
          onVisualize={onDetections}
        />
      </Dialog.Root>
    </>
  )
}
