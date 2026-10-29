import { scenarios } from '../../data/scenarios'
import { streetCamera } from '../../data/streetCamera'
import type { Project } from '../../types/project'
export default function ProjectPreview({
  variant,
}: {
  variant: Project['preview']
}) {
  return (
    <img
      src={
        variant === 'camera' ? streetCamera.imageUrl : scenarios.tandil.image
      }
      alt=""
      className="h-full w-full object-cover"
    />
  )
}
