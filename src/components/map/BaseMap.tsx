import { useEffect, useImperativeHandle, useRef } from 'react'
import type { Ref } from 'react'
import { AttributionControl, Map, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  addDetectionLayers,
  setDetectionsVisible,
  setTreeCampaign,
  setTreeSelection,
} from './detectionLayers'
import { showImportedImage } from './importedImageLayer'
import { bindTreeInteractions } from './treeInteractions'
import { scenarios } from '../../data/scenarios'
import { treeRecords } from '../../data/trees'
import { getPendingGroups } from '../../data/groups'
import { matchesCampaign } from '../../types/tree'
import {
  addGroupLayers,
  setGroupsCampaign,
  setGroupsVisible,
} from './groupLayers'
const { bounds: projectBounds } = scenarios.tandil
function campaignBounds(
  campaign: CampaignFilter,
  includeGroups = false,
): [[number, number], [number, number]] {
  const points = [
    ...projectBounds,
    ...(includeGroups
      ? getPendingGroups(campaign).map((group) => group.coordinates)
      : []),
    ...treeRecords
      .filter((t) => matchesCampaign(t.campaign, campaign))
      .map((t) => t.coordinates),
  ]
  return [
    [
      Math.min(...points.map((p) => p[0])),
      Math.min(...points.map((p) => p[1])),
    ],
    [
      Math.max(...points.map((p) => p[0])),
      Math.max(...points.map((p) => p[1])),
    ],
  ]
}
import {
  createBasemapStyle,
  getBasemapMaxZoom,
  type BasemapId,
} from '../../data/basemaps'
import { setBasemap } from './basemapLayers'
import type { CampaignFilter } from '../../types/tree'
setWorkerUrl(workerUrl)
export type MapActions = {
  zoomIn: () => void
  zoomOut: () => void
  fitProject: () => void
  locateTree: (coordinates: [number, number]) => void
}
type BaseMapProps = {
  scenario: typeof scenarios.tandil
  basemap: BasemapId
  basemapLabels: boolean
  ref?: Ref<MapActions>
  campaign: CampaignFilter
  selectedId: string | null
  groupsVisible: boolean
  detectionsVisible: boolean
  imageImported: boolean
  onTreeSelect: (id: string) => void
}
export default function BaseMap({
  scenario,
  ref,
  basemap,
  basemapLabels,
  campaign,
  selectedId,
  detectionsVisible,
  groupsVisible,
  imageImported,
  onTreeSelect,
}: BaseMapProps) {
  const mapRef = useRef<Map | null>(null)
  const readyRef = useRef(false)
  const initial = useRef({
    center: scenario.center,
    basemap,
    basemapLabels,
    campaign,
    selectedId,
    detectionsVisible,
    groupsVisible,
    imageImported,
    onTreeSelect,
  })
  const container = useRef<HTMLDivElement>(null)
  const duration = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 150
  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => mapRef.current?.zoomIn({ duration: duration() }),
      zoomOut: () => mapRef.current?.zoomOut({ duration: duration() }),
      fitProject: () =>
        mapRef.current?.fitBounds(
          campaignBounds(
            initial.current.campaign,
            initial.current.groupsVisible,
          ),
          {
            padding: { top: 100, bottom: 60, left: 40, right: 40 },
            duration: 0,
          },
        ),
      locateTree: (coordinates) =>
        mapRef.current?.jumpTo({ center: coordinates, zoom: 18.5 }),
    }),
    [],
  )
  useEffect(() => {
    initial.current.onTreeSelect = onTreeSelect
  }, [onTreeSelect])
  useEffect(() => {
    initial.current.basemap = basemap
    initial.current.basemapLabels = basemapLabels
    if (mapRef.current && readyRef.current)
      setBasemap(mapRef.current, basemap, basemapLabels)
  }, [basemap, basemapLabels])
  useEffect(() => {
    initial.current.campaign = campaign
    if (mapRef.current && readyRef.current) {
      setTreeCampaign(mapRef.current, campaign)
      setGroupsCampaign(mapRef.current, campaign)
      mapRef.current.fitBounds(
        campaignBounds(campaign, initial.current.groupsVisible),
        { padding: { top: 100, bottom: 60, left: 40, right: 40 }, duration: 0 },
      )
    }
  }, [campaign])
  useEffect(() => {
    initial.current.groupsVisible = groupsVisible
    if (mapRef.current && readyRef.current)
      setGroupsVisible(mapRef.current, groupsVisible)
  }, [groupsVisible])
  useEffect(() => {
    initial.current.selectedId = selectedId
    if (mapRef.current && readyRef.current)
      setTreeSelection(mapRef.current, selectedId)
  }, [selectedId])
  useEffect(() => {
    initial.current.detectionsVisible = detectionsVisible
    if (mapRef.current && readyRef.current)
      setDetectionsVisible(mapRef.current, detectionsVisible)
  }, [detectionsVisible])
  useEffect(() => {
    initial.current.imageImported = imageImported
    if (imageImported && mapRef.current && readyRef.current)
      showImportedImage(mapRef.current)
  }, [imageImported])
  useEffect(() => {
    if (!container.current) return
    const props = initial.current
    const map = new Map({
      container: container.current,
      style: createBasemapStyle(props.basemap, props.basemapLabels),
      center: props.center,
      bounds: campaignBounds(props.campaign, props.groupsVisible),
      fitBoundsOptions: {
        padding: { top: 100, bottom: 60, left: 40, right: 40 },
      },
      maxZoom: getBasemapMaxZoom(props.basemap),
      trackResize: true,
      attributionControl: false,
    })
    map.addControl(new AttributionControl({ compact: false }), 'bottom-left')
    const scale = document.createElement('div')
    scale.className = 'arbor-map-scale'
    scale.setAttribute('role', 'img')
    const updateScale = () => {
      const y = map.getContainer().clientHeight / 2
      const x = map.getContainer().clientWidth / 2
      const targetWidth = Math.min(240, map.getContainer().clientWidth * 0.45)
      const meters = map.unproject([x, y]).distanceTo(map.unproject([x + targetWidth, y]))
      if (!Number.isFinite(meters) || meters <= 0) return
      const magnitude = 10 ** Math.floor(Math.log10(meters))
      const distance = [1, 2, 2.5, 5, 10]
        .map((n) => n * magnitude)
        .reduce((closest, n) => Math.abs(n - meters) < Math.abs(closest - meters) ? n : closest)
      const label = (n: number) => n >= 1000 ? `${n / 1000} km` : `${n} m`
      scale.style.width = `${targetWidth * distance / meters}px`
      scale.innerHTML = `<span>0</span><span>${label(distance / 2)}</span><span>${label(distance)}</span><i></i><i></i>`
      scale.setAttribute('aria-label', `Escala: ${label(distance)}`)
    }
    map.getContainer().append(scale)
    map.on('move', updateScale)
    map.on('resize', updateScale)
    updateScale()
    mapRef.current = map
    let removeInteractions: (() => void) | undefined
    map.on('load', () => {
      readyRef.current = true
      const current = initial.current
      setBasemap(map, current.basemap, current.basemapLabels)
      addDetectionLayers(
        map,
        current.campaign,
        current.detectionsVisible,
        current.selectedId,
      )
      addGroupLayers(map, current.campaign, current.groupsVisible)
      removeInteractions = bindTreeInteractions(map, (id) =>
        initial.current.onTreeSelect(id),
      )
      if (current.imageImported) showImportedImage(map)
    })
    const observer = new ResizeObserver(() => map.resize())
    observer.observe(container.current)
    return () => {
      observer.disconnect()
      map.off('move', updateScale)
      map.off('resize', updateScale)
      scale.remove()
      removeInteractions?.()
      readyRef.current = false
      mapRef.current = null
      map.remove()
    }
  }, [])
  return (
    <div className="absolute inset-0 z-0">
      <div
        ref={container}
        role="region"
        aria-label="Mapa del arbolado de Tandil"
        className="h-full w-full"
      />
    </div>
  )
}
