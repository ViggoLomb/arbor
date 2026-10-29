import { DataProviderBase, S2GeometryProvider } from 'mapillary-js'
import type { ImageEnt } from 'mapillary-js'
import {
  streetCamera as camera,
  streetCameras,
  getStreetSequence,
} from '../../data/streetCamera'

// Capturas locales: conservan la proyección de perspectiva y calibración reales.
// No consulta Mapillary ni necesita credenciales en el navegador.
export class LocalImageProvider extends DataProviderBase {
  private images: ImageEnt[]
  constructor() {
    super(new S2GeometryProvider())
    const lngLat = ([lng, lat]: number[]) => ({ lng, lat })
    this.images = streetCameras.map((camera) => ({
      id: camera.id,
      geometry: lngLat(camera.geometry.coordinates),
      computed_geometry: lngLat(camera.coordinates),
      sequence: { id: camera.sequence },
      camera_type: camera.camera_type,
      camera_parameters: camera.camera_parameters,
      captured_at: camera.captured_at,
      compass_angle: camera.compass_angle,
      computed_compass_angle: camera.computed_compass_angle,
      computed_rotation: camera.computed_rotation,
      altitude: camera.altitude,
      computed_altitude: camera.computed_altitude,
      exif_orientation: camera.exif_orientation,
      width: camera.local_width,
      height: camera.local_height,
      creator: camera.creator,
      owner: { id: camera.creator.id },
      thumb: { id: camera.id, url: camera.imageUrl },
      cluster: { id: 'local-camera', url: 'local:cluster' },
      mesh: { id: camera.id, url: 'local:mesh' },
    }))
  }
  override getCoreImages(cellId: string) {
    return Promise.resolve({
      cell_id: cellId,
      images: this.images.filter(
        (image) =>
          this.geometry.lngLatToCellId(image.computed_geometry!) === cellId,
      ),
    })
  }
  override getImages(ids: string[]) {
    return Promise.resolve(
      ids.map((id) => {
        const image = this.images.find((image) => image.id === id)
        if (!image) throw new Error('Captura fuera de este recorrido')
        return { node_id: id, node: image }
      }),
    )
  }
  override getSpatialImages(ids: string[]) {
    return this.getImages(ids)
  }
  override getSequence(id: string) {
    return Promise.resolve({
      id,
      image_ids: getStreetSequence(id).map((image) => image.id),
    })
  }
  override async getImageBuffer(url: string) {
    if (!streetCameras.some((image) => image.imageUrl === url))
      throw new Error('Fotografía fuera de este recorrido')
    const response = await fetch(url)
    if (!response.ok) throw new Error('No se pudo cargar la fotografía local')
    return response.arrayBuffer()
  }
  override getMesh() {
    return Promise.resolve({ faces: [], vertices: [] })
  }
  override getCluster() {
    return Promise.resolve({
      id: 'local-camera',
      points: {},
      reference: {
        lng: camera.coordinates[0],
        lat: camera.coordinates[1],
        alt: camera.computed_altitude,
      },
    })
  }
}
