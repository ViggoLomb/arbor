# Arbor

Aplicación frontend de censo de arbolado urbano con React, TypeScript, Vite, Tailwind, MapLibre y MapillaryJS. Usa fotografías, detecciones y datos preparados de Tandil, sin backend ni credenciales Mapillary.

## Ejecutar

```sh
npm ci
npm run dev
```

Abrir la dirección indicada por Vite, normalmente http://localhost:5173. Para comprobar el proyecto:

```sh
npm test
npm run build
npm run lint
```

Las pruebas usan Python 3 y Node 22.15 o posterior con eliminación de tipos de TypeScript; no necesitan descargar modelos, fotografías ni librerías de pruebas adicionales.

## Inventario y fichas

El conjunto distribuido contiene 124 candidatos de Grounding DINO Tiny: 88 de 2018 y 36 de 2019. Capas permite consultar todas las campañas o filtrar por año. Los 25 grupos pendientes se muestran aparte y no se suman al inventario individual.

Seleccionar un árbol desde el mapa, la tabla o Ctrl/Cmd K abre su ficha. La foto abre la captura más cercana entre las observaciones vinculadas a ese candidato. Al regresar de Street View se conservan selección, encuadre, foco y campos sin guardar.

Cada registro tiene una altura inicial estable. La ficha permite corregirla y guardarla; vaciar el campo o pulsar «Restablecer altura» recupera el valor inicial. Tabla y análisis comparten el mismo valor. Especie, DAP, estado sanitario, interferencias y notas se guardan por proyecto e ID en `localStorage`, bajo `arbor:census:v1:…`. Las fichas anteriores siguen siendo compatibles. El guardado conserva los campos abiertos si el navegador bloquea el almacenamiento.

## Street View

Las 89 fotografías locales conservan su perspectiva y calibración. Las flechas Chevron eligen la cámara más cercana en cada dirección, dentro de 40 metros, sin filtrar por fecha o secuencia. Las flechas laterales permiten doblar; la fecha de cada captura queda visible. Todas las cámaras son alcanzables desde cualquier punto de entrada.

Las etiquetas se ubican sobre las detecciones de la foto actual, incluso cuando parte de la caja queda fuera del encuadre. Pulsarlas despliega altura y datos censales guardados. El botón Árboles permite ocultarlas. Zoom, desplazamiento y redimensionado actualizan la proyección. Escape cierra primero la tarjeta del árbol y después la vista de calle, sin reemplazar la ficha original.

El índice contiene 314 etiquetas distribuidas entre las 89 fotos: 226 observaciones de candidatos, 79 detecciones individuales adicionales, 8 referencias de arbolado y una anotación de revisión. Se omiten seis cajas de grupo ya cubiertas por detecciones individuales. Las observaciones adicionales tienen su propio ID de fotografía y no se cuentan como nuevos individuos del mapa.

El minimapa muestra círculos en las posiciones de las fotos y destaca la captura actual, sin líneas de conexión. Conserva controles y créditos. Si WebGL falla o el visor interactivo supera el tiempo de carga, la foto estática conserva etiquetas y navegación. Los puntos del minimapa también tienen una representación sin WebGL.

## Área de estudio e informes

1. Abrí **Área de estudio** en la barra. Elegí una manzana haciendo clic en su interior, buscala por código catastral o usá **Manzana del relevamiento** para probar el inventario disponible.
2. **Cuadra** marca el lado más cercano al clic y una franja de 40 m para calle y veredas. **Dibujar** permite marcar un polígono; cerralo con doble clic o **Finalizar dibujo**. Deshacer quita el último vértice. Para reemplazar un contorno usá Redibujar.
3. Ajustá el nombre, la franja exterior de 0 a 30 m y la campaña. **Revisar registros incluidos** permite excluir registros de borde o añadir otros del proyecto.
4. Pulsá **Confirmar área y analizar**. El área se guarda por proyecto en `arbor:study:v1:…`. Sin un área confirmada, Análisis y Generar PDF abren el selector; también desde el menú y Ctrl/Cmd K.
5. Desde **Ver informe** o **Generar PDF**, revisá el mapa y el detalle. Podés incluir hasta seis fotografías de referencia. **Descargar PDF** crea un documento A4 con mapa, estadísticas, registros y créditos.

La superficie y el perímetro se calculan sobre el polígono delimitado; la franja exterior amplía la selección de registros sin alterar esa superficie. La densidad usa solamente registros interiores y se presenta por campaña. Los registros de años distintos pueden corresponder al mismo individuo. Las fichas pendientes se contabilizan como pendientes, sin asignarles especie, DAP o salud. Una zona fuera del inventario informa que no hay relevamiento disponible.

Análisis refleja las fichas guardadas y la campaña activa. Cada informe conserva una instantánea al abrirse; cerrarlo y volverlo a abrir incorpora los últimos cambios. El mapa exportado contiene únicamente el área, los registros seleccionados, leyenda sanitaria, norte, escala y créditos. Si el proveedor de mapas o WebGL no están disponibles, se genera un plano local con las mismas coordenadas y el catálogo de manzanas.

`public/data/tandil-blocks.geojson` contiene 3.515 delimitaciones derivadas de 57.390 parcelas de IDE Tandil. Se agrupan por identificación catastral de manzana y se calcula su envolvente convexa; no constituye una garantía de cobertura completa ni de límites jurídicos exactos, especialmente en manzanas irregulares o incompletas. El dibujo libre permite adaptar la selección. La manzana del relevamiento conserva el polígono preparado desde los cruces de OpenStreetMap. El inventario de árboles sigue limitado al relevamiento distribuido: disponer de cartografía municipal no implica tener censados todos los árboles de Tandil.

Para actualizar el catálogo local (requiere Internet, sin dependencias Python adicionales):

```sh
python3 -B scripts/prepare_tandil_blocks.py
```

`npm run test:study` verifica geometría, catálogo, selección, campañas, persistencia y producción del PDF.

## Preparar recursos

Los archivos distribuidos permiten iniciar la aplicación sin ejecutar agrotech. `src/data/generated/` contiene el inventario y etiquetas; `src/data/streetRoute.json` conserva las cámaras. `public/streetview/` y `public/trees/` contienen fotos y recortes locales.

Para preparar recursos desde otra exportación de agrotech se necesita Python con Pillow:

```sh
python3 -B scripts/prepare-tandil.py /ruta/a/agrotech
```

El preparador lee resultados existentes, copia fotografías, genera recortes e incorpora alturas, grupos y etiquetas. No ejecuta el detector ni modifica agrotech. Para actualizar etapas individuales desde los datos disponibles:

```sh
python3 -B scripts/tree_heights.py
python3 -B scripts/tree_heights.py --check
python3 -B scripts/prepare_street_labels.py /ruta/a/agrotech
```

`height-reviews.json` conserva las asignaciones de altura vinculadas a observaciones. `street-manual-labels.json` conserva las anotaciones revisadas en fotografías. La preparación de etiquetas informa su resumen en la terminal.

## Mapas, proyectos y herramientas

Estándar, Claro y Oscuro usan OpenFreeMap; Satélite usa Esri con etiquetas vectoriales. Los mapas base necesitan Internet y mantienen sus créditos. Cambiarlos conserva capas, selección y encuadre. El mapa principal mantiene escala y controles de navegación; los créditos se ubican abajo a la izquierda.

Inicio conserva el mapa al volver al mismo proyecto. Crear, renombrar, mover y duplicar proyectos modifica la sesión en memoria. Las fichas se guardan por proyecto. Tesalónica se mantiene como un escenario de solo lectura separado del editor de Tandil.

Los conectores de imagen e IA mantienen el flujo frontend con temporizadores; no procesan archivos. Muestreo sigue como Próximamente. La imagen aérea local de Tandil proviene de Esri World Imagery.

## Recursos de terceros

Los recursos conservan sus derechos y condiciones originales. Ver [avisos de terceros](THIRD_PARTY_NOTICES.md), [créditos de fotografías](public/streetview/ATTRIBUTION.md) y [créditos de recortes](public/trees/ATTRIBUTION.md).
