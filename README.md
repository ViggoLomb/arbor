# Arbor

MVP frontend de censo y gestión del arbolado urbano. Interfaz inspirada en Felt, con mapa de pantalla completa y una única barra superior.

## Desarrollo

```sh
npm install
npm run dev
```

```sh
npm run build
npm run lint
npm run preview
```

React + TypeScript + Vite. Tailwind CSS con el plugin de Vite, Inter y Newsreader locales, MapLibre GL, Lucide, Base UI para menús, tooltips y diálogos accesibles, cmdk para búsqueda, Sonner para las confirmaciones, clsx y tailwind-merge.

El worker de MapLibre 6 se importa con `?worker&url` y se configura con `setWorkerUrl`, siguiendo la [instalación oficial para Vite](https://maplibre.org/maplibre-gl-js/docs/#installation). Así queda disponible tanto en desarrollo como en el build de producción.

- `src/screens`: Home y editor del mapa.
- `src/components/navigation`: barra superior, menús, búsqueda y gestión de proyectos.
- `src/components/home`: bibliotecas y tarjetas de proyectos.
- `src/components/panels`: Capas, Análisis y tabla de árboles.
- `src/components/ui`: controles y diálogos reutilizables.
- `src/components/map`: integración MapLibre y módulos de capas.
- `src/components/importer`: estados y etapas de las simulaciones de imágenes y YOLO.
- `src/components/trees`: formulario de relevamiento mock.
- `src/components/analysis`: Dashboard territorial con indicadores del mock.
- `src/data`: proyectos/bibliotecas, detecciones YOLO mock y configuración de la imagen de muestra.

La pantalla inicial muestra el mapa base CARTO Positron centrado en Buenos Aires y la barra horizontal de Arbor. Los paneles comienzan cerrados; Capas y Análisis se abren independientemente desde las herramientas centrales. «Importar» reúne los dos conectores y «Generar PDF» simula la exportación. El mapa base requiere conexión a Internet. Las 40 detecciones YOLO comienzan ocultas, con su switch deshabilitado hasta confirmar la ingesta simulada. Las reglas vigentes están en `AGENTS.md`; las skills están en `.agents/skills/`.

## Conector YOLO de demostración

«Cargar Detecciones IA», en el menú Importar de la barra, abre un modal con el mismo diseño del importador de imágenes. Hacer clic o soltar un archivo en el área ficticia inicia dos etapas de 1 segundo:

1. «Analizando FeatureCollection...».
2. «Extrayendo métricas de confianza y estado sanitario...».

Después se muestra «¡40 entidades procesadas con éxito!». Solamente «Visualizar Detecciones» cierra el modal, habilita y enciende el switch, y muestra puntos, clusters y conteos. El switch permite luego ocultarlos y mostrarlos. Cerrar, cancelar o presionar Escape no modifica la visibilidad; al reabrir se comienza de nuevo. Los datos confirmados se conservan al ocultar y mostrar el panel de capas.

No se lee ni parsea ningún JSON: siempre se usan las 40 entidades de `mockData.ts`, y la extracción de métricas es visual. No se agregan llamadas a un agente ni a un backend. La confirmación YOLO es independiente de la importación de imágenes.

## Importador de demostración

«Importar Imagen» abre un modal. Hacer clic o soltar un archivo en el área indicada inicia tres etapas simuladas de 1,5 segundos: carga con progreso, validación de georreferenciación y generación de tiles. Al finalizar aparece «¡Importación exitosa!» y el botón «Ver en el mapa».

Solamente ese botón activa el raster de muestra. La imagen es opaca y queda debajo de las detecciones YOLO. Cerrar, cancelar o presionar Escape detiene la simulación; al reabrir se comienza de nuevo. No hay lectura, procesamiento ni carga de archivos a un servidor; el archivo soltado no modifica la imagen de muestra. No hay GDAL ni backend.

La muestra local `src/assets/demo-orthomosaic.jpg` contiene imágenes de Buenos Aires obtenidas de [Esri World Imagery](https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer), con crédito a Esri, Vantor, Earthstar Geographics y GIS User Community. Representa el resultado simulado de la importación; no es una captura de dron aportada por el usuario. Las esquinas se derivaron de la extensión del recurso, y están en `src/data/demoImportedImage.ts`. No se llama al servicio de imágenes durante la simulación.

El modal usa transiciones de opacidad y escala de 250 ms, progreso lineal de 1500 ms y una variante de movimiento reducido. Base UI gestiona el foco, el cierre con Escape y el bloqueo del fondo.

## Ficha de relevamiento

Después de cargar y visualizar las detecciones IA, hacer clic sobre un árbol individual abre la ficha contextual CIAFBA a la derecha. Los clusters no abren fichas; acercar el mapa permite ver sus árboles. El cursor cambia al pasar sobre puntos individuales.

La ficha muestra ID, latitud y longitud del punto, un espacio de foto simulado, especie y estado sanitario precargados, DAP en centímetros y checkboxes de interferencias (Cables, Vereda y Luminarias). DAP comienza vacío porque no está incluido en los datos YOLO mock. La ficha conserva el mapa disponible para seleccionar otro árbol y reinicia sus campos al cambiar de ejemplar.

«Guardar Ficha» cierra el panel y muestra una confirmación de demostración. No persiste los campos ni modifica el GeoJSON. Cerrar con la X o Escape descarta la edición; ocultar las detecciones cierra la ficha. El panel tiene scroll interno, un botón de guardado siempre visible y animaciones de entrada/salida de 250 ms, con una variante de movimiento reducido.

## Análisis territorial y exportación

El panel «Análisis» muestra indicadores calculados desde `mockData.ts`: 40 árboles y 8 con estado sanitario Malo. El área cubierta es un valor fijo de demostración: 12.4 ha. La barra sanitaria refleja la distribución del mismo dataset: Bueno 24 (60%), Regular 8 (20%) y Malo 8 (20%), con etiquetas y colores. Los menús se recorren con flechas y se cierran con Escape. Los indicadores resumen el mock completo aunque las detecciones estén ocultas.

«Generar PDF» cambia a «Generando...» con spinner y se deshabilita durante 2 segundos. Después restaura su texto y muestra el alert «Descarga completada». Es una simulación: no genera ni descarga un archivo real, y no invoca un backend. El temporizador se limpia al desmontar la barra.

## Home y navegación de Arbor

Arbor → Inicio abre un Home oscuro con recientes, borradores, bibliotecas General/Arbolado municipal y fuentes del proyecto activo. Permite buscar proyectos, alternar grilla/lista, crear, renombrar, mover a biblioteca y duplicar. Las miniaturas son ilustrativas; todos los proyectos usan el mismo escenario geográfico de Buenos Aires, con una sesión de importaciones independiente. La navegación móvil usa un diálogo accesible.

Volver al mismo proyecto desde Inicio conserva la instancia y el encuadre del mapa, además de las importaciones confirmadas. Las sesiones y metadatos están solamente en memoria: recargar la página restablece la demostración. No hay cuentas, guardado remoto ni persistencia local.

El menú Arbor reúne Archivo, Editar y Ver. Deshacer/Rehacer permanecen deshabilitados porque no existe un historial de edición real. Ver permite abrir capas/leyenda, análisis, tabla de árboles o encuadrar el mapa. La tabla y la búsqueda permiten seleccionar un árbol confirmado y abrir su ficha. La búsqueda se abre con la lupa, Acciones rápidas o Ctrl/Cmd K, y soporta flechas, Enter y Escape.

Área de estudio y Muestreo de cobertura se muestran como «Próximamente» en escritorio: son accesos reservados para una futura iteración de evaluación territorial. Esta reorganización no incorpora cálculos de cobertura, beneficios ambientales ni procesamiento real de archivos.
