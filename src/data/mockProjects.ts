import type { Project } from '../types/project'

export const libraries = ['General', 'Arbolado municipal']

// Todos los proyectos usan el mismo escenario geográfico de demostración.
export const mockProjects: Project[] = [
  {
    id: 'urban-census',
    name: 'Plataforma de Arbolado',
    library: 'General',
    description: 'Censo y relevamiento del arbolado urbano',
    updated: 'Hace unos momentos',
    preview: 'census',
    draft: true,
  },
  {
    id: 'canopy-center',
    name: 'Cobertura · Centro',
    library: 'Arbolado municipal',
    description: 'Proyecto de evaluación de cobertura',
    updated: 'Hace 2 horas',
    preview: 'coverage',
    draft: false,
  },
  {
    id: 'aerial-survey',
    name: 'Relevamiento aéreo',
    library: 'Arbolado municipal',
    description: 'Imágenes y detecciones del área de estudio',
    updated: 'Ayer',
    preview: 'imagery',
    draft: false,
  },
  {
    id: 'field-work',
    name: 'Relevamiento de campo',
    library: 'General',
    description: 'Fichas y estado sanitario de los ejemplares',
    updated: 'Ayer',
    preview: 'census',
    draft: true,
  },
]
