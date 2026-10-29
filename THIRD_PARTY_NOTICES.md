# Recursos de terceros

Este documento identifica los recursos de terceros utilizados por Arbor. No concede una licencia global sobre ellos ni sobre el código propio del proyecto. Los titulares originales conservan sus derechos.

## Fotografías de Mapillary

Las 89 fotografías de `public/streetview/` y los 124 recortes de `public/trees/` conservan la licencia CC BY-SA 4.0 de sus autores originales (paprika y gabriel_tandil). Los enlaces de origen y la descripción de modificaciones están en los archivos ATTRIBUTION.md de cada carpeta.

- [Condiciones oficiales de Mapillary](https://help.mapillary.com/hc/en-us/articles/115001770409-CC-BY-SA-license-for-open-data)
- [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

## Imágenes aéreas y mapas

`references/tandil/aerial.jpg` y `references/thessaloniki/01-city-overview.jpg` son ilustraciones estáticas de demostración procedentes de Esri World Imagery. Créditos: Esri, Vantor, Earthstar Geographics y GIS User Community. Las extensiones y fuentes se conservan junto a cada imagen. No son ortomosaicos de dron propios y no se ofrecen bajo una licencia abierta del proyecto. El material histórico de Esri conservado en commits anteriores mantiene las mismas condiciones de sus titulares.

- [World Imagery: fuente y condiciones](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9)
- [Atribuciones y términos de Esri](https://www.esri.com/en-us/legal/terms/data-attributions)

Los mapas vectoriales y los estilos JSON de `src/data/basemapStyles/` proceden de OpenFreeMap. Sus datos incluyen OpenStreetMap/OpenMapTiles; se conservan las atribuciones del mapa y las condiciones de sus proveedores.

- [OpenFreeMap](https://openfreemap.org/attribution/)
- [OpenStreetMap copyright / ODbL](https://www.openstreetmap.org/copyright)

## Parcelario municipal

`public/data/tandil-blocks.geojson` se deriva de la capa `ws_10_catastro:parcelario_urbano` del [servicio WFS de IDE Tandil](https://mapa.tandil.gov.ar/geoserver/ows), Municipalidad de Tandil. El preparador agrupa parcelas por identificación de manzana y calcula envolventes convexas. Se conserva la fuente, fecha, método y atribución en los metadatos del archivo. Esta preparación no modifica los derechos ni las condiciones de la fuente municipal.

`src/data/studyDefaultBlock.json` conserva la delimitación preparada desde cruces de calles de OpenStreetMap; se mantienen sus condiciones y créditos indicados arriba.

## Datos preparados

`src/data/generated/tandil-trees.json` y `tandil-groups.json` se prepararon a partir de la exportación local de agrotech. Representan candidatos y asociaciones sin validación definitiva. `src/data/streetRoute.json` conserva los metadatos de procedencia de Mapillary. Estos archivos no otorgan derechos adicionales sobre fuentes, fotografías o información de terceros.

## Bibliotecas y tipografías

Las dependencias no se copian como node_modules al repositorio; se instalan desde el lockfile y conservan sus licencias originales. Inter y Newsreader se distribuyen mediante Fontsource; sus textos de licencia están en `LICENSES/`.

| Dependencia instalada | Versión | Licencia declarada |
|---|---|---|
| `@base-ui/react` | 1.9.0 | MIT |
| `@fontsource-variable/inter` | 5.3.0 | OFL-1.1 |
| `@fontsource-variable/newsreader` | 5.3.0 | OFL-1.1 |
| `clsx` | 2.1.1 | MIT |
| `cmdk` | 1.1.1 | MIT |
| `jspdf` | 4.2.1 | MIT |
| `lucide-react` | 1.63.0 | ISC |
| `mapillary-js` | 4.1.2 | MIT |
| `maplibre-gl` | 6.16.0 | BSD-3-Clause |
| `react` | 19.3.1 | MIT |
| `react-dom` | 19.3.1 | MIT |
| `sonner` | 2.0.8 | MIT |
| `tailwind-merge` | 3.7.0 | MIT |
