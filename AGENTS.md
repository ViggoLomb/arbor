# Reglas del proyecto

1. UI_CONSTRAINT: En paneles flotantes usar superficies Slate/Gray semitransparentes; evitar blanco o negro puros opacos.
2. UX_CONSTRAINT: Editor de mapa a pantalla completa, una barra horizontal superior y paneles flotantes. Nunca desplazar el mapa. Usar profundidad gestionada, backdrop-blur y padding de 4 a 6 unidades.
3. CODE_CONSTRAINT: Separar UI, mapa, datos preparados y estado. Mantener componentes pequeños.
4. MAP_CONSTRAINT: Controles React flotantes, conservando los créditos de los proveedores.

## Diseño y alcance

Arbor es un prototipo frontend con React, TypeScript, Vite, Tailwind, MapLibre y MapillaryJS. No agregar backend ni ejecutar modelos desde la aplicación. Inter para UI y Newsreader para Arbor. Conservar el diseño inspirado en Felt: barra única, superficies suaves, bordes redondeados y paneles independientes.

Usar las skills frontend-ui-engineering y web-design-guidelines cuando estén disponibles en el entorno local. `.agents/` no se distribuye con la aplicación. Las instrucciones explícitas del usuario tienen prioridad. Usar Base UI para menús, diálogos, tooltips y foco; cmdk para búsqueda y Sonner para avisos. Conservar Escape, teclado, etiquetas accesibles y movimiento reducido. Reutilizar las transiciones de opacity/transform existentes.

Mapa z-0, controles z-10, paneles z-20, barra z-30, vista de calle z-40, diálogos/menús superiores z-50/60 y toasts z-80.

## Editor y navegación

`App` coordina Inicio/editor, bibliotecas, proyectos y sesiones en memoria. `MapEditor` es el único editor, con la barra completa `TopBar`/`MapToolbar`. No restaurar `CameraTestEditor`, la variante cameraOnly, tarjetas de prueba ni accesos manuales a cámaras.

La barra conserva Arbor, biblioteca/proyecto, Explorar, Área de estudio, Capas, Importar, Muestreo, Análisis, búsqueda, PDF, selector de mapa base y perfil. Área de estudio y Muestreo siguen como «Próximamente». Capas, Análisis y tabla comienzan cerrados. Mantener crear/renombrar/mover/duplicar, grilla/lista, búsquedas, Ctrl/Cmd K y conservación del mapa al ir a Inicio.

Todos los proyectos de esta demostración usan el conjunto real de Tandil. No reintroducir árboles sintéticos de Grecia, las 40 detecciones falsas ni sus estadísticas. Los datos del proyecto se pasan a tabla, búsqueda y análisis; no importar un inventario independiente desde esos componentes.

## Datos de Tandil

`scripts/prepare-tandil.py` prepara la exportación ya generada de agrotech sin modificar sus archivos ni ejecutar el modelo. `src/data/generated/tandil-trees.json` contiene 124 candidatos activos de IA con coordenadas estimadas: 36 de 2019 y 88 de 2018. Se inicia mostrando los 124 candidatos de ambas campañas; Capas permite consultar todas o filtrar por 2019/2018. El total representa candidatos de distintas épocas, no individuos únicos confirmados. No contar observaciones repetidas como individuos distintos ni presentar candidatos como árboles confirmados.

`src/data/streetRoute.json` y `public/streetview/` contienen metadata y 89 fotos originales locales, sin anotaciones. `public/trees/` contiene 124 recortes individuales generados desde originales. Cada recorte usa la observación asociada cuya cámara está más cerca de la posición estimada del candidato. Mantener IDs de árbol, observaciones, imagen, recorte y coordenadas vinculados. El detector es Grounding DINO Tiny; sus puntajes no son probabilidades calibradas.

`data/trees.ts` adapta datos y construye GeoJSON; `BaseMap` agrega puntos/clusters y selección sin sofisticar la representación de copas. No inferir tamaños reales de copa desde las cajas. Capas permite ocultar detecciones. La búsqueda y tabla siguen accesibles aunque la capa esté oculta y seleccionarlas vuelve a mostrarla.

## Ficha y vista de calle

Seleccionar árbol abre la ficha flotante con recorte, ID corto, calle, campaña, procedencia, puntaje y ubicación estimada. La fotografía es un botón accesible y el único punto de entrada al visor. No agregar un botón «Ver en calle», puntos de cámaras, interruptores Street View ni marcadores grandes de prueba.

Al pulsar la foto abrir la captura más cercana entre las que reconocieron ese candidato; nunca una cámara cercana sin observación vinculada. El recorte y el visor inicial deben corresponder a la misma observación. Mantener la ficha y sus campos sin guardar al volver del visor, restaurar foco a la foto y conservar encuadre/selección del mapa.

Especie, DAP, estado sanitario, interferencias y observaciones comienzan pendientes. No atribuirlos al detector. Interferencias tiene tres valores (sin evaluar/presenta/no presenta). `useTreeCensus` guarda solamente campos censales en localStorage por proyecto/ID; reflejar ediciones en tabla, búsqueda y análisis. Guardar no valida identidad ni precisión geográfica.

`StreetView` se carga de forma diferida y conserva MapillaryJS durante la navegación. `LocalImageProvider` usa fotos y calibración locales, sin token ni API remota. No inventar un panorama 360°: las fotos son de perspectiva. Usar RenderMode.Fill, zoom mínimo cero y dimensiones explícitas del contenedor interno. Flechas recorren capturas reales de la misma secuencia. Minimap muestra recorrido, posición/orientación y créditos, con ampliar/ocultar/zoom; no mostrar puntos de capturas seleccionables. Conservar el encuadre aprobado y el crédito de autor / Mapillary, fecha y fuente.

## Importadores y análisis

Los importadores siguen siendo teatro de UI con temporizadores limpiados al cancelar/desmontar. IA simula dos etapas de 1 segundo, muestra la cantidad de candidatos de la campaña y activa la misma capa real al confirmar; no generar 40 puntos ni diagnósticos. Imagen simula carga/CRS/tiles de 1,5 segundos, luego publica una muestra aérea local de Tandil debajo de los árboles y visible solamente en Satélite. No leer/procesar/subir archivos ni agregar GDAL. La muestra proviene de Esri y conserva créditos; no presentarla como un dron real.

Análisis usa la campaña activa y los campos censales guardados: candidatos, estado sanitario pendiente, área del bounding box y distribución incluyendo Sin relevar. No inventar salud ni riesgo. PDF sigue simulado (2 segundos, spinner, alert), sin documento real.

## Mapas base y comprobación

El selector a la izquierda del perfil conserva Estándar/Satélite/Claro/Oscuro y Mostrar etiquetas, por proyecto. OpenFreeMap para vectores y Esri para satélite. Sustituir exclusivamente capas con prefijo basemap- sin recrear mapa o borrar overlays. Satélite máximo zoom 19, otros 21. Mantener atribuciones; no restaurar CARTO con marca de API key.

Verificar build/lint y el recorrido en navegador: árboles al inicio, barra completa, selección por mapa/tabla/búsqueda, foto individual y captura asociada más cercana, navegación, foco/encuadre al volver, guardado/recarga, campañas y ausencia de árboles artificiales/cámaras visibles. No hacer commit hasta la confirmación del usuario.

## Escenarios separados

`data/scenarios.ts` declara Tandil (inventario funcional) y Tesalónica (ejemplo de solo lectura). Los proyectos tienen scenarioId; el Home muestra los ejemplos fuera de la lista de proyectos. `ExamplePreview` no monta MapEditor ni carga fichas o análisis. Nuevo y duplicar siguen como mocks sobre la plantilla de Tandil. El encuadre de Tandil incluye el área de estudio y todos los candidatos de la campaña, sin eliminar los puntos estimados fuera del rectángulo. La extensión de la imagen aérea sigue siendo independiente. App reinicia el estado durante Fast Refresh para no conservar proyectos de escenarios anteriores en desarrollo.

## Todos los candidatos y grupos pendientes

La sesión inicia con campaign=all y groupsVisible=false. `data/groups.ts` consume los 25 grupos activos de la exportación local de agrotech (19 de 2018 y 6 de 2019), en una fuente independiente. Capas ofrece un switch Grupos pendientes; mostrar rombos violetas sin sumarlos a candidatos, tabla, búsqueda ni estadísticas censales. El filtro por año afecta árboles y grupos. El encuadre inicial y Encuadrar proyecto incluyen todos los candidatos del filtro activo, y los grupos cuando se habilitan. No consultar el servidor 8765 ni dibujar cámaras o incertidumbre. Mantener las coordenadas exportadas sin recalcularlas.
