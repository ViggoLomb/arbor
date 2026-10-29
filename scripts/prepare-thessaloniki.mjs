import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { along } from '@turf/along'
import { length } from '@turf/length'
import { lineOffset } from '@turf/line-offset'
import { destination } from '@turf/destination'
import { distance } from '@turf/distance'
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon'
import { lineString, point, polygon, featureCollection } from '@turf/helpers'
import { loadImage, pixelToCoordinate, project, vegetationScore } from './lib/imagery.mjs'

const bounds = [22.936, 40.619, 22.965, 40.640]
const inside = ([x,y]) => x > bounds[0] && x < bounds[2] && y > bounds[1] && y < bounds[3]
let seed = 20261029
const random = () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296 }
const round = n => Math.round(n * 1e7) / 1e7
const coordinate = p => p.map(round)
const pilotImage = loadImage('05-pilot-block')
const images = [pilotImage, loadImage('02-streets-detail'), loadImage('03-waterfront-detail', [22.9505,40.6190,22.9615,40.6265]), loadImage('01-city-overview', [22.925,40.609,22.977,40.650])]
const annotations = JSON.parse(readFileSync('references/thessaloniki/pilot-annotations.json'))
const raw = JSON.parse(readFileSync('references/thessaloniki/street-context.osm.json'))
if (!Array.isArray(raw.elements)) throw new Error('Falta el contexto de calles de OpenStreetMap')
const nodes = new Map(raw.elements.filter(e => e.type === 'node').map(n => [n.id, [n.lon,n.lat]]))
const ways = raw.elements.filter(e => e.type === 'way').map(way => ({ id: way.id, tags: way.tags ?? {}, coordinates: way.geometry?.map(p => [p.lon,p.lat]) ?? way.nodes?.map(id => nodes.get(id)).filter(Boolean) ?? [] })).filter(way => way.coordinates.length > 1)
const excluded = ways.filter(w => (w.tags.building || w.tags.leisure === 'pitch' || w.tags.natural === 'water') && w.coordinates.length > 3 && w.coordinates[0].join() === w.coordinates.at(-1).join()).map(w => {
  const xs=w.coordinates.map(p=>p[0]), ys=w.coordinates.map(p=>p[1])
  return { shape: polygon([w.coordinates]), bbox: [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)] }
})
const isExcluded = p => excluded.some(({shape,bbox:b})=>p[0]>=b[0]&&p[0]<=b[2]&&p[1]>=b[1]&&p[1]<=b[3]&&booleanPointInPolygon(point(p),shape))
const streets = ways.filter(w => /^(primary|secondary|tertiary|residential|unclassified|living_street|pedestrian|footway|path)$/.test(w.tags.highway) && w.tags.access !== 'private' && w.tags.tunnel !== 'yes' && !w.tags.bridge)
const trees = []
const cells = new Map()
function add(coordinates, properties) {
  const c=coordinate(coordinates)
  if (!inside(c)) return false
  const [x,y]=project(c), gx=Math.floor(x/7), gy=Math.floor(y/7)
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const old of cells.get(`${gx+dx}:${gy+dy}`)??[])if(distance(c,old,{units:'meters'})<3.8)return false
  const key=`${gx}:${gy}`
  cells.set(key,[...(cells.get(key)??[]),c])
  const species=['Plátano de sombra','Almez','Olivo','Pino mediterráneo','Ciprés']
  const health=random(), width=properties.copa_m ?? Math.round((2.8+random()*4.8)*10)/10
  const id=properties.id ?? `th-${String(trees.length+1).padStart(4,'0')}`
  trees.push({type:'Feature',id,geometry:{type:'Point',coordinates:c},properties:{id,especie:species[Math.floor(random()*species.length)],estado_sanitario:health<0.72?'Bueno':health<0.92?'Regular':'Malo',origen:'simulado',dap_cm:Math.round(14+random()*48),altura_m:Math.round((4+random()*12)*10)/10,copa_m:width,copa_alto_m:Math.round(width*(0.85+random()*0.3)*10)/10,calle:properties.calle,vereda:properties.vereda,piloto:properties.piloto??false}})
  return true
}

// Primeros 30: una prueba explícita y repetible en las dos veredas del recorte.
for(const side of ['north','south'])for(const [i,[x,y,pixels]] of annotations[side].entries()){
  const c=pixelToCoordinate(pilotImage,x,y)
  const meters=(pilotImage.extent.xmax-pilotImage.extent.xmin)/pilotImage.width*Math.cos(c[1]*Math.PI/180)
  add(c,{id:`piloto-${side==='north'?'n':'s'}-${String(i+1).padStart(2,'0')}`,copa_m:Math.round(pixels*meters*10)/10,calle:'Tramo de prueba · Leoforos Stratou',vereda:side==='north'?'Norte':'Sur',piloto:true})
}

// Calles existentes; las ubicaciones y todos los atributos censales son sintéticos.
const candidates=[]
for(const street of streets.sort((a,b)=>a.id-b.id)){
  const line=lineString(street.coordinates)
  const meters=length(line,{units:'meters'})
  if(meters<25||meters>8000)continue
  const pedestrian=/^(footway|path|pedestrian)$/.test(street.tags.highway)
  const lanes=Number.parseFloat(street.tags.lanes)||(street.tags.oneway==='yes'?2:/^(primary|secondary)$/.test(street.tags.highway)?4:2)
  const roadWidth=Number.parseFloat(street.tags.width)||(pedestrian?2.5:lanes*3+1)
  const sides=pedestrian?[-1.8,1.8]:[-(roadWidth/2+1.8),roadWidth/2+1.8]
  for(const offset of sides){
    const guide=lineOffset(line,offset,{units:'meters'})
    const guideLength=length(guide,{units:'meters'})
    for(let at=12+random()*5;at<guideLength-12;at+=6+random()*6){
      const original=along(guide,at,{units:'meters'}).geometry.coordinates
      if(!inside(original))continue
      let best=original,score=vegetationScore(images,original)
      for(const bearing of [0,90,180,270]){
        const p=destination(original,1.7,bearing,{units:'meters'}).geometry.coordinates
        const next=vegetationScore(images,p)
        if(next>score){best=p;score=next}
      }
      if(score<4.8||isExcluded(best))continue
      candidates.push({coordinates:best,calle:street.tags['name:en']??street.tags.name??'Calle sin nombre',vereda:offset<0?'Izquierda':'Derecha',score,priority:random()})
    }
  }
}
for(const candidate of candidates.sort((a,b)=>a.priority-b.priority)){
  if(trees.length>=1500)break
  add(candidate.coordinates,candidate)
}
if(trees.length<100)throw new Error(`Solo ${trees.length} posiciones; revisar guías e imágenes`)

// Últimos 40: exclusivamente la simulación del conector externo, sin duplicados.
const yolo=trees.splice(-40).map((tree,index)=>({...tree,id:`yolo-${String(index+1).padStart(3,'0')}`,properties:{...tree.properties,id:`yolo-${String(index+1).padStart(3,'0')}`,origen:'yolo-mock',piloto:false}}))
const corners=tree=>{
  const center=tree.geometry.coordinates,p=tree.properties
  const north=destination(center,p.copa_alto_m/2,0,{units:'meters'}).geometry.coordinates
  const south=destination(center,p.copa_alto_m/2,180,{units:'meters'}).geometry.coordinates
  const westNorth=coordinate(destination(north,p.copa_m/2,270,{units:'meters'}).geometry.coordinates),eastNorth=coordinate(destination(north,p.copa_m/2,90,{units:'meters'}).geometry.coordinates)
  const westSouth=coordinate(destination(south,p.copa_m/2,270,{units:'meters'}).geometry.coordinates),eastSouth=coordinate(destination(south,p.copa_m/2,90,{units:'meters'}).geometry.coordinates)
  return [westNorth,westSouth,eastSouth,eastNorth,westNorth]
}
const crowns=list=>featureCollection(list.map(tree=>({type:'Feature',id:tree.properties.id,geometry:{type:'Polygon',coordinates:[corners(tree)]},properties:{id:tree.properties.id}})))
mkdirSync('src/data/generated',{recursive:true});mkdirSync('public/data',{recursive:true})
const save=(name,value)=>writeFileSync(name,JSON.stringify(value)+'\n')
save('src/data/generated/thessaloniki-trees.json',featureCollection(trees))
save('src/data/generated/yolo-demo.json',featureCollection(yolo))
save('public/data/thessaloniki-crowns.geojson',crowns(trees))
save('public/data/yolo-crowns.geojson',crowns(yolo))
const guideFeatures=featureCollection(['north','south'].map(side=>lineString(annotations[side].map(([x,y])=>coordinate(pixelToCoordinate(pilotImage,x,y))),{vereda:side})))
save('references/thessaloniki/pilot-guides.geojson',guideFeatures)
const context=featureCollection(streets.map(street=>lineString(street.coordinates,{osm_id:street.id,highway:street.tags.highway,name:street.tags.name??''})))
save('references/thessaloniki/street-guides.geojson',context)
const summary={seed:20261029,city:'Tesalónica, Grecia',bounds,inventoryCount:trees.length,yoloCount:yolo.length,pilotCount:trees.filter(t=>t.properties.piloto).length,candidateCount:candidates.length,streetCount:streets.length,excludedPolygonCount:excluded.length,imageryDate:'2025-07-03',dataKind:'Inventario sintético. No se ejecutó ningún modelo de detección.',source:'Calles © OpenStreetMap contributors (ODbL); imágenes Esri, Vantor, Earthstar Geographics y GIS User Community',sourceUrl:'https://www.openstreetmap.org/copyright',sha256:createHash('sha256').update(JSON.stringify(trees)).digest('hex')}
save('src/data/generated/thessaloniki-summary.json',summary)
console.log(JSON.stringify(summary,null,2))
