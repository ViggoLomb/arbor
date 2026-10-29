import tandil from '../../references/tandil/aerial.jpg'
import thessaloniki from '../../references/thessaloniki/01-city-overview.jpg'
import { projectCenter, projectBounds } from './geography'
export const scenarios = {
  tandil: {
    id: 'tandil',
    kind: 'inventory',
    name: 'Tandil',
    image: tandil,
    center: projectCenter,
    bounds: projectBounds,
  },
  thessaloniki: {
    id: 'thessaloniki',
    kind: 'example',
    name: 'Tesalónica',
    image: thessaloniki,
    center: [22.951, 40.6295],
    bounds: [
      [22.923989, 40.609],
      [22.978011, 40.65],
    ],
  },
} as const
