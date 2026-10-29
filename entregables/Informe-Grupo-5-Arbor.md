**Arbor**  
   
 Relevamiento asistido del arbolado urbano  
   
 **Informe del Trabajo.**  
   
 Hackaton Agro 2026 · Desafío 05  
   
    
   
  28 y 29 de octubre · Biblioteca Central UNICEN  
   
 **El desafío**  
   
 La consigna propone desarrollar un método para cuantificar y mapear el arbolado de una ciudad a partir de imágenes satelitales, de drones o de vistas de calle. El objetivo es aportar información para conocer la situación, organizar el relevamiento y planificar el trabajo, con un método replicable en otras ciudades.  
   
 **Problema abordado**  
   
 La guía señala la falta de censos o su antigüedad en municipios de la provincia de Buenos Aires. También distingue dos tareas: medir cobertura vegetal e identificar individuos. El antecedente de Balcarce informa un 37 % de cobertura vegetal sobre 21 km²; ese dato pertenece al estudio citado por la organización y no es un resultado de Arbor.  
   
 **Nuestra propuesta**  
   
 Elegimos trabajar sobre imágenes de calle. Arbor reúne detecciones de árboles, posiciones estimadas y evidencia fotográfica en una interfaz de revisión. La propuesta es preparar un inventario preliminar que una persona pueda consultar y completar antes de consolidar un censo.  
   
 **Alcance del prototipo**  
   
 La demostración utiliza un sector de Tandil y fotografías de 2018 y 2019. Integra resultados de un procesamiento previo con un editor cartográfico. No constituye un censo completo de la ciudad ni permite conocer su situación actual a partir de esas imágenes históricas.  
   
 **Método**  
   
 De la imagen a un registro revisable  
   
 **1. Fotografías y metadatos**  
   
 Se utilizan 89 fotografías locales de Mapillary, con sus identificadores, fechas y datos de cámara. Las imágenes conservan su perspectiva original.  
   
 **2. Detección previa**  
   
 El procesamiento de agrotech utiliza Grounding DINO Tiny para localizar posibles árboles mediante cajas en las fotografías. Arbor consume los resultados ya generados: el navegador no ejecuta el modelo. El puntaje del detector expresa una puntuación del modelo, no una probabilidad calibrada de acierto.  
   
 **3. Asociación y ubicación**  
   
 Las observaciones fotográficas se vinculan a candidatos con identificadores persistentes y coordenadas estimadas. Una detección en una foto no equivale por sí sola a un individuo nuevo. Las ambigüedades se conservan como grupos pendientes, separados del inventario individual. Las coordenadas de la cámara tampoco equivalen a la posición del árbol.  
   
 **4. Evidencia accesible**  
   
 Cada candidato cuenta con un recorte vinculado a una observación. La ficha abre la captura asociada más cercana a su posición estimada. El mapa, la tabla, la búsqueda y el visor permiten revisar los registros conservando el vínculo entre candidato, observación y fotografía.  
   
 **5. Revisión censal**  
   
 La ficha permite completar especie, diámetro a la altura del pecho (DAP), estado sanitario, interferencias y notas. Estos campos requieren relevamiento humano. En un futuro esto se podria automatizar mediante entrenamiento de modelos.  
   
 **Resultados**  
   
 Qué entrega la demostración  
   
 **Conjunto preparado**  
   
 124 candidatos activos: 88 de la campaña 2018 y 36 de 2019.  
   
    
   
  25 grupos pendientes: 19 de 2018 y 6 de 2019.  
   
    
   
  89 fotografías originales locales y 124 recortes individuales.  
   
 **Interpretación de los conteos**  
   
 Los 124 registros son candidatos de distintas épocas, no 124 individuos únicos confirmados. No se deben sumar observaciones repetidas ni interpretar diferencias entre campañas como cambios de población. Los grupos pendientes no se agregan a candidatos, tabla ni estadísticas censales.  
   
 **Límites de los atributos**  
   
 No se infieren especie, sanidad ni riesgo a partir del detector. Las alturas disponibles son valores de demostración derivados de supuestos y referencias de imagen; no son mediciones de campo. No se estima el tamaño real de copa a partir de las cajas. Tampoco se informa un porcentaje de precisión: falta una referencia independiente para calcularlo.  
   
 **Continuidad**  
   
 Validación y posible uso municipal  
   
 **Validar antes de ampliar**  
   
 El siguiente paso es contrastar una muestra con revisión manual y trabajo de campo. Debe incluir imágenes sin árboles, oclusiones y copas superpuestas. Se necesitan referencias de identidad y posición para medir omisiones, falsos positivos, duplicados y error de ubicación, separando las campañas. Todos estos datos permitirian entrenar los modelos usados para la deteccion, agregando mas precision.  
   
 **Replicar el flujo**  
   
 Para otra ciudad se requieren imágenes utilizables con metadatos, se podria evaluar el uso de capturas propias con vehiculos equipados con camaras 360, permitiendo elegir el momento en que se hacen y evitar los altos costos de plataformas como Google.  
   
 **Aporte del Grupo**  
   
 Desarrollamos un prototipo que detecta posibles árboles en imágenes de calle, estima su ubicación y permite revisarlos en un mapa junto con sus fotografías. Lo aplicamos a un sector de Tandil y reunimos los resultados en Arbor, donde se pueden consultar y completar las fichas de cada candidato. Nuestro aporte es una primera herramienta para apoyar el censo de arbolado, que requiere de mejores imagenes y el entrenamiento de IA.  
