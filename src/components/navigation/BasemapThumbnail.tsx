import satellite from '../../../references/tandil/aerial.jpg'
import type { BasemapId } from '../../data/basemaps'

export default function BasemapThumbnail({ id }: { id: BasemapId }) {
  if (id === 'satellite')
    return <img src={satellite} alt="" className="h-full w-full object-cover" />
  const palette =
    id === 'dark'
      ? {
          land: '#232a32',
          water: '#151c26',
          park: '#344c43',
          road: '#646e79',
          block: '#333c46',
        }
      : id === 'light'
        ? {
            land: '#e9edef',
            water: '#cddce4',
            park: '#d5ded7',
            road: '#fafbfc',
            block: '#dce1e5',
          }
        : {
            land: '#f0eee7',
            water: '#acd4e6',
            park: '#b5d4ac',
            road: '#fcfaf4',
            block: '#e0ddd5',
          }
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-full w-full">
      <rect width="64" height="64" fill={palette.land} />
      <path d="M0 42 18 51 32 64H0Z" fill={palette.water} />
      <path d="m43 0 21 0v28L45 20 36 7Z" fill={palette.park} />
      <path
        d="M4 5h12v11H4zm19 0h10v11H23zM5 24h11v12H5zm19 1h12v13H24zm21 7h13v12H45zm-9 16h13v12H36z"
        fill={palette.block}
      />
      <path
        d="M-5 18 69 49M19-5 19 51M39-5 39 69M-3 40 67 13M-2 1 67 60"
        fill="none"
        stroke={palette.road}
        strokeWidth="3"
      />
    </svg>
  )
}
