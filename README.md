# Arbor

Prototipo frontend de censo urbano con React, TypeScript, Vite, Tailwind, MapLibre y MapillaryJS. Abre el editor completo sobre Tandil con resultados locales de agrotech. No necesita backend, agrotech en ejecución ni credenciales Mapillary.

## Ejecutar

```sh
npm install
npm run dev
```

```sh
npm run build
npm run lint
```

## Datos e interacción

Hay 124 candidatos activos de Grounding DINO Tiny: 36 de la campaña 2019 y 88 de 2018. Se inicia mostrando los 124 candidatos de ambas campañas. Capas permite consultar todas o filtrar por 2019/2018. Los candidatos de distintas épocas no equivalen a individuos únicos confirmados. Son detecciones con posiciones estimadas, todavía sin validación de individuos únicos; las observaciones repetidas no se suman como árboles nuevos. Los grupos sin resolver de agrotech no se convierten en individuos.

El inventario sintético de Tesalónica y las 40 detecciones falsas anteriores fueron retirados. El mapa muestra puntos/clusters, selección y una única barra con las herramientas habituales. No hay marcadores de cámaras ni activación manual de Street View.

Seleccionar un árbol abre una ficha con su recorte individual. Pulsar la foto abre la captura más cercana entre las observaciones vinculadas a ese mismo candidato. El recorte y la captura inicial corresponden a la misma observación. Se conserva la ficha y cualquier edición sin guardar al volver, junto con el encuadre del mapa. Búsqueda y tabla ofrecen el mismo acceso por ID, calle o especie relevada.

Especie, DAP, estado sanitario e interferencias comienzan pendientes; las interferencias distinguen Sin evaluar, Presenta y No presenta. Guardar conserva campos censales en localStorage por proyecto y árbol. Los cambios aparecen en tabla, búsqueda y análisis; no confirman automáticamente la identidad o posición del candidato. Si el navegador impide guardar, la ficha conserva los campos abiertos y muestra un error.

## Fotografías

`src/data/streetRoute.json` conserva metadata real de 89 capturas y sus posiciones, orientaciones, parámetros de lente, autor, fecha y secuencia. `public/streetview/` contiene las fotos originales sin cajas, copiadas sin modificación. `public/trees/` contiene los recortes individuales desde esos originales. Los archivos funcionan de manera independiente del directorio de agrotech.

MapillaryJS se carga al abrir una foto. El proveedor local no consulta la API ni expone un token. Usa la perspectiva y calibración reales; las fotos no son panoramas 360°. El modo Fill cubre el visor; arrastrar, zoom, restablecer y las flechas permiten explorar capturas reales de la misma secuencia. El minimapa muestra posición, dirección y recorrido, sin puntos de cámaras seleccionables. Mantiene créditos de autor / Mapillary, fecha y enlace a la fuente.

Para preparar otra vez los mismos recursos, usar Python con Pillow instalado:

```sh
python scripts/prepare-tandil.py /ruta/a/agrotech-main
```

El script lee la exportación `resultados/mapeo/exportaciones/manzana_tandil` y los originales/manifest de `resultados/manzana_constitucion_rivadavia_25mayo_alberdi`. Copia fotos y genera recortes con margen, limitados al tamaño original. Elige la observación de cada candidato por distancia geográfica entre cámara y posición estimada del árbol. No modifica agrotech ni vuelve a ejecutar el detector.

## Funciones de demostración

- La barra mantiene Inicio, biblioteca/proyecto, herramientas, búsqueda, PDF, selector cartográfico y perfil. Capas, Análisis y tabla son paneles flotantes. Área de estudio y Muestreo siguen como Próximamente.
- Inicio conserva el mapa al regresar al mismo proyecto. Crear, renombrar, mover y duplicar proyectos modifica la sesión en memoria. Todos usan el escenario de Tandil; sus fichas se guardan por proyecto.
- Importar → Detecciones IA simula dos etapas de un segundo. Confirmar muestra los candidatos existentes de la campaña; no agrega entidades ficticias ni duplica el inventario.
- Importar → Imagen simula tres etapas de 1,5 segundos y publica una muestra aérea local de la misma zona de Tandil, debajo de los árboles y solamente en Satélite. No procesa el archivo elegido. La muestra es Esri World Imagery, no un ortomosaico de dron real.
- Análisis calcula candidatos, estado sanitario pendiente, área del bounding box y distribución sanitaria incluyendo Sin relevar. PDF simula dos segundos y muestra un alert; no produce un documento.

Estándar/Claro/Oscuro usan OpenFreeMap; Satélite usa Esri con etiquetas vectoriales. Requieren Internet y mantienen sus atribuciones. El selector conserva encuadre, capas y selección; Satélite admite hasta zoom 19. La muestra aérea está en `references/tandil/`, con extensión y créditos. Las fotografías y fichas locales no necesitan servicios externos.

## Escenarios separados

`data/scenarios.ts` declara Tandil (inventario funcional) y Tesalónica (ejemplo de solo lectura). Los proyectos tienen scenarioId; el Home muestra los ejemplos fuera de la lista de proyectos. `ExamplePreview` no monta MapEditor ni carga fichas o análisis. Nuevo y duplicar siguen como mocks sobre la plantilla de Tandil. El encuadre de Tandil incluye el área de estudio y todos los candidatos de la campaña, sin eliminar los puntos estimados fuera del rectángulo. La extensión de la imagen aérea sigue siendo independiente. App reinicia el estado durante Fast Refresh para no conservar proyectos de escenarios anteriores en desarrollo.

## Filtro de grupos pendientes

Capas permite mostrar u ocultar 25 grupos pendientes con un switch apagado por defecto. Se dibujan como rombos violetas, separados de los 124 candidatos y excluidos de tabla, búsqueda y estadísticas censales. El filtro de campaña también se aplica a ellos: 19 de 2018 y 6 de 2019. `src/data/generated/tandil-groups.json` proviene de `grupos.geojson` de agrotech, con las mismas coordenadas. La aplicación sigue usando archivos locales; no consulta el servidor 8765. Cámaras e incertidumbre permanecen ocultas.

## Distribución del repositorio

Se incluyen el código y configuración de la aplicación, lockfile de npm, datos preparados de Tandil, fotografías originales, recortes y las dos imágenes aéreas utilizadas por el prototipo. Las dependencias se instalan con `npm ci`; `dist/`, cachés, resultados de pruebas, entornos Python, credenciales y configuraciones locales del asistente quedan fuera de Git. No hace falta ejecutar el preparador de agrotech para iniciar el proyecto.

Los recursos de terceros conservan sus derechos y condiciones originales. Ver [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), [créditos de fotografías](public/streetview/ATTRIBUTION.md) y [créditos de recortes](public/trees/ATTRIBUTION.md). Publicar el repositorio no concede una licencia nueva sobre esos recursos ni sobre el código propio.
