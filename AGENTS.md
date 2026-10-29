# Reglas del proyecto

1. UI_CONSTRAINT: Nunca usar colores puros (#000000 o #FFFFFF sin opacidad en contenedores flotantes). Usar siempre la paleta de Tailwind Slate/Gray.
2. UX_CONSTRAINT: En el editor, los paneles contextuales deben ser islas flotantes sobre el mapa. La única barra horizontal superior se superpone de extremo a extremo. El Home es una pantalla independiente con navegación lateral. Usar z-index gestionado, backdrop-blur y padding espacioso (p-4 a p-6).
3. CODE_CONSTRAINT: Mantener componentes pequeños y separados. No meter todo en App.tsx. Separar UI, Mapa y Mock Data.
4. MAP_CONSTRAINT: Evitar controles nativos feos del mapa, reemplazarlos por UI flotante en React.

## Contrato visual y alcance

Mapa MapLibre de 100vw por 100vh como fondo absoluto. Los paneles no deben desplazar el mapa. Inspiración: Felt.com; sin copiar branding ni recursos propietarios.
Usar Inter para la interfaz y Newsreader local para la marca Arbor y títulos editoriales del Home. Usar rounded-lg/xl en herramientas y menús, rounded-2xl en paneles, superficies semitransparentes, backdrop-blur-md y sombras suaves. Mantener accesibilidad, navegación por teclado y etiquetas en controles.
Capas: mapa z-0, controles z-10, paneles z-20, barra z-30, menús z-40, fondos de diálogo z-50, diálogos z-60, tooltips z-70 y toasts z-80. Conservar la atribución exigida por proveedores cartográficos.
MVP frontend para integrar detecciones YOLO, insumos geoespaciales y relevamientos CIAFBA. No agregar backend.
Etapa actual: Arbor tiene un editor con barra superior única y un Home de bibliotecas/proyectos. Header.tsx y Sidebar.tsx se reemplazaron por TopBar y paneles independientes. Capas y Análisis comienzan cerrados. La barra contiene Arbor (menús Inicio, Archivo, Editar, Ver y guía), biblioteca/proyecto, herramientas centrales, búsqueda y PDF. Área de estudio y Muestreo son entradas reservadas «Próximamente»; no implementar sus evaluaciones en esta iteración. El mapa conserva 40 detecciones YOLO mock y clustering. Las detecciones comienzan invisibles y el switch queda deshabilitado hasta confirmar la ingesta simulada. «Cargar Detecciones IA» abre un modal que simula análisis de FeatureCollection y extracción de métricas durante 1 segundo cada etapa. Solamente «Visualizar Detecciones» habilita el switch y muestra puntos, clusters y conteos. Cancelar o cerrar no publica datos.
«Importar» en la barra reúne Imagen y Detecciones IA. «Importar Imagen» abre otro modal de demostración 100% frontend. Simula carga, validación CRS y generación de tiles durante 1,5 segundos cada etapa. No procesar, leer, parsear ni subir archivos ni agregar servicios reales de importación. Ambos conectores comparten componentes visuales y animaciones.
La imagen raster de muestra permanece fuera del mapa hasta que el usuario termina la simulación y pulsa «Ver en el mapa». En ese momento se muestra opaca, debajo de todas las capas YOLO. No restaurar el patrón ilustrado de manzanas ni una superposición semitransparente de mapas. El modal debe permitir cancelar, limpiar temporizadores, conservar el foco y respetar movimiento reducido.
El procesamiento geoespacial real continúa fuera del alcance. Una futura publicación debe consumir una cobertura procesada y unificada, con una única imagen visible por zona.
El clic sobre árboles individuales abre una ficha CIAFBA flotante a la derecha. No abrir fichas al pulsar clusters. Mantener el mapa interactivo, extraer ID, coordenadas, especie y estado desde el punto seleccionado, y reiniciar el formulario al cambiar de árbol. La ficha incluye especie, DAP, estado e interferencias; «Guardar Ficha» solamente cierra el panel y muestra un toast de demostración, sin persistir ni modificar las detecciones. La entrada y salida del panel usan transform y opacity con movimiento reducido.
Capas y Análisis son paneles separados, abiertos desde la barra. Nunca desplazar el mapa ni abrirlos por defecto. El Dashboard resume todos los datos mock: total censados, cantidad con estado Malo, área simulada fija de 12.4 ha y distribución proporcional Bueno/Regular/Malo. Estos indicadores son independientes de la visibilidad del mapa. «Generar PDF» es una simulación frontend: mostrar «Generando...» con spinner durante 2 segundos, restaurar el botón y mostrar el alert «Descarga completada». No crear un PDF real ni agregar backend. Evitar ejecuciones simultáneas y limpiar temporizadores al desmontar.

## Navegación y organización

App coordina Home/editor y mantiene sesiones por proyecto en memoria. MapEditor agrupa mapa, paneles y diálogos; TopBar compone ArborMenu, ProjectBreadcrumb, MapToolbar y ExportButton. Conservar la instancia y encuadre del mapa al visitar Inicio y regresar al mismo proyecto. Al cambiar de proyecto, mantener sus datos de sesión independientes. Los proyectos de mockProjects.ts comparten el escenario geográfico de Buenos Aires; sus miniaturas son ilustrativas, no resultados de cobertura.
Home ofrece recientes, borradores, bibliotecas, fuentes, búsqueda y grilla/lista. Crear, renombrar, mover y duplicar proyectos modifica solamente la sesión; recargar reinicia el demo. Usar Base UI para menús anidados, tooltips, diálogos y navegación móvil con foco y Escape; cmdk dentro de un diálogo Base UI para búsqueda de acciones/proyectos/árboles. Ctrl/Cmd K abre y cierra la búsqueda en el editor; los árboles se buscan solamente después de confirmar YOLO. La tabla abre fichas del mismo mock. No crear autenticación ni colaboración reales.
Los importadores se controlan desde MapEditor y no dependen de que Capas esté montado. BaseMap conserva su ciclo de vida y expone solamente acciones de zoom/encuadre/localización mediante un ref. Los menús y tooltips usan transiciones breves de transform/opacity; la búsqueda de teclado abre instantáneamente. Respetar movimiento reducido.

## Skills locales

- `.agents/skills/web-design-guidelines/SKILL.md`: descargada de vercel-labs/agent-skills.
- `.agents/skills/frontend-ui-engineering/SKILL.md`: copiada de la skill ya disponible en el entorno.

Las decisiones visuales explícitas del usuario tienen prioridad sobre recomendaciones generales de las skills.
