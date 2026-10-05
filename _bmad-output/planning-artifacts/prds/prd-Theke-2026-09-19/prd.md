---
title: "PRD: Theke"
status: final
created: 2026-09-19
updated: 2026-10-04
---

# PRD: Theke

## Resumen

Theke es un espacio de trabajo visual para transformar fuentes dispersas en conocimiento conectado. El MVP permite crear proyectos de estudio, conservar recursos reutilizables, representarlos en diagramas de grafo, establecer relaciones explicadas, recibir orientación opcional de IA y publicar vistas interactivas que otras personas puedan explorar y comentar.

El caso inicial de diseño es un estudiante de teología que investiga un tema acotado. El modelo debe ser aplicable a otras disciplinas sin diluir el foco del MVP.

## Estado actual y brecha

El repositorio ya contiene un editor de grafo funcional basado en React, TypeScript, React Flow y Zustand, con nodos personalizados, conexiones, agrupación visual, arrastre estable y datos demostrativos. El MVP todavía requiere persistencia real, cuentas, una Biblioteca canónica, gestión del ciclo de vida entre Proyectos, carga y almacenamiento de Recursos, asistencia de IA, publicación segura y comentarios. `AGENTS.md` conserva las invariantes técnicas verificadas del prototipo y es una entrada obligatoria para arquitectura y construcción, no una fuente de requisitos de producto.

## Objetivos del MVP

- Convertir fuentes dispersas en una visualización ordenada y persistente.
- Permitir reutilizar Recursos entre mapas independientes y expresar en cada mapa sus propias Relaciones.
- Preservar la construcción manual como parte del aprendizaje.
- Ofrecer asistencia de IA explicable, opcional y controlada por el usuario.
- Compartir un diagrama interactivo sin conceder edición de su composición.
- Recibir y moderar retroalimentación contextual sin incorporarla automáticamente al conocimiento global.

## Alcance del MVP

### Must — demostración esencial

- Cuenta de autor y persistencia.
- Biblioteca canónica de cuenta y Proyectos con Diagramas de grafo.
- Notas, PDF, imagen y enlace como Recursos canónicos reutilizables, con sus Representaciones y Relaciones.
- Edición visual básica, Grupos y persistencia del Canvas.
- Publicación viva mediante enlace no listado.
- Comentarios anónimos contextualizados y moderación del autor.

### Should — completar el MVP validable

- Carpetas de Proyecto y su representación compacta en el Diagrama.
- Audio, video y archivo genérico.
- Anotaciones visuales y personalización de presentación.
- Asistencia de IA limitada y bajo demanda para Relaciones, Grupos y revisión solicitada.

Los elementos `Should` pertenecen al alcance objetivo, pero no bloquean la primera demostración integrada de biblioteca, grafo, publicación y comentarios. Se incorporan después de validar el recorrido esencial y antes de declarar completo el MVP.

### Diferido / fuera del MVP

- Otras gramáticas visuales, comenzando por línea de tiempo; deberán reutilizar la misma Biblioteca y los mismos Recursos, conservando las Relaciones propias de cada mapa.
- Coedición de diagramas.
- Plataforma pública para descubrir contenido.
- Generación automática de diagramas completos.
- Automatizaciones complejas y componentes derivados avanzados.
- Reemplazar servicios externos de almacenamiento.
- Integraciones y sincronización con Drive u otros proveedores.
- Permisos por usuario y aplicación móvil de autoría.
- Análisis permanente de toda la Biblioteca y búsqueda web autónoma de fuentes.

## Hipótesis de negocio

El producto visual básico debe producir valor sin IA. La hipótesis comercial inicial, todavía no validada y fuera del criterio de finalización técnica del MVP, es que capacidades de IA más amplias o frecuentes podrían justificar una suscripción. El piloto debe distinguir entre el valor del espacio visual manual y el valor incremental de la asistencia; no se definirán precios ni se bloquearán funciones esenciales hasta contar con evidencia de uso y disposición a pagar. También se mantendrá abierta la búsqueda de propuestas de pago no dependientes de IA.

## Usuario objetivo y trabajos por realizar

El usuario primario es una persona que estudia en profundidad un tema acotado y necesita convertir fuentes heterogéneas en una estructura comprensible. El caso de referencia es un estudiante de teología, pero los requisitos no deben depender de contenido religioso.

El usuario necesita:

- Reunir fuentes sin perder su ubicación ni identidad.
- Observar un tema completo sin abrir numerosos archivos por separado.
- Expresar y justificar relaciones entre recursos.
- Detectar vacíos, contradicciones y conexiones no evidentes.
- Reorganizar el conocimiento sin duplicarlo.
- Comunicar lo comprendido mediante una experiencia visual interactiva.
- Recibir retroalimentación sin ceder control editorial.

## Conceptos del producto

- **Biblioteca:** catálogo canónico de Recursos de una cuenta. Un Recurso mantiene la misma identidad cuando se utiliza en distintos Proyectos.
- **Proyecto:** mapa independiente con su propia selección y organización de Recursos de la Biblioteca. Cada Proyecto tiene un Diagrama; dos mapas pueden usar exactamente las mismas fuentes sin pertenecer al mismo Proyecto.
- **Diagrama:** composición guardada del mapa de un Proyecto. El MVP admite grafos.
- **Canvas:** superficie de edición de un diagrama.
- **Recurso:** contenido canónico almacenado en la biblioteca.
- **Representación:** aparición de un recurso dentro de un diagrama, con posición y presentación propias.
- **Relación:** conexión semántica reutilizable entre recursos.
- **Carpeta:** colección de recursos de la biblioteca que puede representarse de forma compacta en un diagrama.
- **Grupo:** organización visual local de representaciones ya colocadas en un diagrama.
- **Anotación visual:** texto, forma o línea decorativa local que no pertenece al conocimiento global.
- **Compartido:** publicación interactiva de un diagrama con permisos propios y comentarios separados del conocimiento.

## Recorridos de usuario

### UJ-1 — Daniel construye un mapa de estudio

Daniel crea “Estudio de Juan 1”, incorpora fuentes y construye un grafo sin duplicar los Recursos que ya conserva en su Biblioteca. Distingue conocimiento canónico, composición visual y elementos decorativos mientras organiza, conecta y agrupa sus fuentes.

Theke puede orientarlo con sugerencias explicadas y acotadas a los Recursos implicados, pero Daniel decide si amplía el análisis y si edita, acepta o descarta cada propuesta. Retoma después el mismo trabajo, reutiliza conocimiento en otros contextos y prepara una publicación cuando el mapa comunica lo que ha comprendido. FR-1 a FR-31 especifican las capacidades y controles de este recorrido.

### UJ-2 — María explora y comenta un diagrama

Daniel previsualiza y publica el Diagrama mediante un enlace no listado y revocable. María lo abre sin cuenta, explora Recursos y conexiones sin alterar la composición y deja comentarios contextualizados con un alias científico anónimo que puede volver a editar mientras conserva la cookie. Si inicia sesión con Clerk, puede vincular los comentarios de esa cookie vigente a su cuenta.

Daniel recibe la retroalimentación en contexto y en una lista, la resuelve o elimina sin reescribir texto ajeno y conserva el control de comentarios y acceso público. FR-32 a FR-40 especifican permisos, interacción y ciclo de vida.

## Principios e invariantes

- **Conocimiento canónico (revisión 2026-10-04):** los Recursos conservan identidad a nivel de cuenta; las Relaciones pertenecen al mapa que interpreta esos Recursos. FR-3, FR-9 y FR-19 a FR-23.
- **Presentación local:** posición, tamaño, estilo y visibilidad pertenecen al Diagrama; quitar una Representación no elimina su Recurso. FR-20 y FR-23.
- **Cambios globales seguros:** editar un Recurso actualiza sus usos y eliminarlo exige mostrar impacto. Quitar la última línea de una Relación elimina esa interpretación solo en su mapa, con recuperación temporal. FR-19 y FR-23; NFR-7.
- **Importación con procedencia:** Theke administra una copia de cada archivo y registra origen, tipo, fecha y método; las URL siguen siendo referencias externas y no existe sincronización bidireccional en el MVP. FR-6 a FR-8.
- **Privacidad y publicación mínima:** el contenido es privado por defecto y cada Compartido expone solo los Recursos incluidos, después de una previsualización explícita. FR-32 a FR-34; NFR-8 a NFR-13.
- **Comentarios separados:** los comentarios pertenecen al Compartido, no al conocimiento canónico; si pierden su objetivo permanecen sin anclaje hasta resolverse o eliminarse. FR-36 a FR-40.

## Requisitos funcionales

### Gestión de cuenta, proyectos y biblioteca

- **FR-1 — Cuenta de autor:** una persona puede crear una cuenta, autenticarse, cerrar sesión y recuperar el acceso para conservar su trabajo. Cada operación comunica éxito o error sin perder trabajo ya guardado. Realiza UJ-1.
- **FR-2 — Proyecto:** el autor puede crear, renombrar, abrir, archivar y eliminar un Proyecto. Crear genera su Diagrama en la misma operación y abrir lleva directamente al editor. Archivar lo retira de las vistas activas sin borrar contenido; eliminar exige mostrar el Diagrama, referencias a Recursos y Compartidos afectados y solicitar confirmación.
- **FR-3 — Biblioteca:** cada cuenta dispone de una Biblioteca canónica persistente, accesible sin abrir un Diagrama. Cada Proyecto mantiene una selección y organización propia de Recursos de esa Biblioteca.
- **FR-4 — Carpetas:** el autor puede crear, renombrar, mover y archivar Carpetas dentro de un Proyecto, y organizar en ellas referencias a Recursos sin cambiar ni duplicar la identidad canónica de estos.
- **FR-5 — Búsqueda y filtrado:** el autor puede localizar Recursos por nombre, tipo y Carpeta.
- **FR-6 — Carga de archivos:** el autor puede incorporar uno o varios archivos desde el dispositivo. Theke crea un Recurso independiente por archivo y comunica progreso, éxito o fallo individual.
- **FR-7 — Tipos de recurso:** el MVP admite notas editables, PDF, imágenes, audio, video, enlaces web y archivos genéricos. Cada tipo conserva sus metadatos y ofrece las acciones compatibles pertinentes: editar, previsualizar, reproducir, abrir o descargar. Un formato no previsualizable sigue siendo accesible como archivo genérico.
- **FR-8 — Enlaces web:** el autor puede crear un Recurso desde una URL; Theke conserva la URL y, cuando sea posible, obtiene título, descripción e imagen de vista previa sin bloquear la creación si esa obtención falla.
- **FR-9 — Reutilización:** el autor puede utilizar un Recurso de su Biblioteca en varios Proyectos y Diagramas sin volver a cargarlo ni crear una copia del contenido.

### Diagramas y edición visual

- **FR-10 — Mapa y Diagrama:** cada Proyecto contiene exactamente un Diagrama de grafo. Duplicar un Diagrama crea otro Proyecto independiente; ambos pueden reutilizar los mismos Recursos canónicos. Renombrar o archivar el mapa mantiene sincronizados Proyecto y Diagrama.
- **FR-11 — Persistencia del canvas:** Theke conserva automáticamente Representaciones, posiciones, tamaños, estilos, Relaciones visibles, Grupos y Anotaciones visuales para retomarlos en otra sesión.
- **FR-12 — Incorporación al canvas:** el autor puede añadir Recursos mediante arrastre desde la Biblioteca, carga directa sobre el Canvas o controles visibles. El menú contextual actúa como atajo, no como única vía.
- **FR-13 — Carga directa:** al soltar archivos externos sobre el Canvas, Theke crea los Recursos y sus Representaciones. Una carga múltiple evita solapamientos y no crea Relaciones implícitas.
- **FR-14 — Representación por tipo:** cada Recurso obtiene una tarjeta compacta reconocible por tipo. La tarjeta permite abrir la acción compatible definida en FR-7 y, si esa acción falla o no está disponible, conserva acceso a los metadatos y al archivo o URL original.
- **FR-15 — Carpeta en diagrama:** el autor puede representar una Carpeta como acceso compacto, abrirla y seleccionar Recursos individuales sin expandir automáticamente toda la colección.
- **FR-16 — Grupos:** el autor puede agrupar Representaciones localmente, nombrar el Grupo, moverlo y modificar su presentación sin alterar Carpetas ni crear Relaciones globales.
- **FR-17 — Anotaciones visuales:** el autor puede añadir y editar texto decorativo, formas y líneas libres que pertenecen únicamente al Diagrama y se distinguen de Recursos y Relaciones.
- **FR-18 — Presentación:** el autor puede modificar colores de elementos y fondo del Diagrama sin cambiar el contenido canónico de los Recursos.

### Recursos y relaciones canónicas

- **FR-19 — Edición de recurso:** el autor puede editar metadatos y, cuando el tipo lo permite, contenido del Recurso. El cambio se refleja en todas sus Representaciones y Compartidos vivos.
- **FR-20 — Representación local:** mover, redimensionar, estilizar, mostrar u ocultar una Representación afecta solamente su Diagrama.
- **FR-21 — Relación explicada:** el autor puede crear una Relación dirigida o no dirigida cuyos extremos sean Recursos. Puede elegir un tipo común sugerido por Theke o crear un tipo personalizado reutilizable dentro del Proyecto. En ambos casos, puede añadir una etiqueta, una explicación, evidencia y procedencia. Carpetas, Grupos y Anotaciones visuales no pueden ser extremos de una Relación en el MVP.
- **FR-22 — Independencia de relaciones por mapa (revisión 2026-10-04):** cada mapa conserva sus propias Relaciones, aunque use los mismos Recursos que otro. Una Relación equivalente puede reutilizarse para varias líneas dentro del mismo mapa. La reutilización entre mapas requiere una acción explícita futura.
- **FR-23 — Ciclo de vida seguro (revisión 2026-10-04):** quitar una Representación no elimina su Recurso. Quitar la última línea de una Relación y guardar el mapa la elimina de forma recuperable; archivar o eliminar un Recurso compartido exige revisar sus usos y consecuencias.

### Asistencia de IA

- **FR-24 — Disponibilidad opcional:** todas las funciones manuales del MVP permanecen utilizables cuando la IA está desactivada, no disponible o alcanza un límite.
- **FR-25 — Alcance visible:** antes de analizar, Theke muestra qué Recursos utilizará. De forma predeterminada, limita el análisis a los Recursos implicados en la acción y requiere autorización para ampliarlo.
- **FR-26 — Ayuda en relaciones:** al crear o editar una Relación, Theke puede sugerir tipo, etiqueta, explicación, evidencia ya presente en la Biblioteca o una necesidad de búsqueda que el autor debe investigar. En el MVP no localiza ni importa fuentes externas autónomamente.
- **FR-27 — Ayuda en grupos:** al crear o modificar un Grupo, Theke puede sugerir un nombre o tema, señalar elementos atípicos y proponer Recursos relacionados.
- **FR-28 — Revisión solicitada:** el autor puede pedir una revisión de una selección o Diagrama para detectar vacíos, duplicados, contradicciones o Recursos aislados.
- **FR-29 — Decisión humana:** cada sugerencia muestra la acción propuesta, el fundamento, los Recursos utilizados y los límites. El autor puede editarla, aceptarla o descartarla; ninguna sugerencia modifica conocimiento sin confirmación.
- **FR-30 — Procedencia:** las Relaciones o contenidos aceptados a partir de una sugerencia conservan su origen, evidencia, fecha y distinción respecto del contenido creado manualmente. El autor puede consultar esa procedencia después de aceptar la sugerencia.
- **FR-31 — Retroalimentación:** el autor puede informar de una sugerencia incorrecta. Theke no presenta inferencias sin evidencia como hechos ni inventa citas cuando falta sustento.

### Publicación y comentarios

- **FR-32 — Previsualización:** antes de publicar, el autor puede revisar la experiencia del visitante y la lista exacta de Recursos expuestos.
- **FR-33 — Enlace compartido:** el autor puede generar un enlace no listado, vivo y revocable para un Diagrama. `[ASSUMPTION: el MVP admite un Compartido activo por Diagrama; volver a publicar después de revocarlo crea un enlace y un hilo de comentarios nuevos, conservando el historial anterior solo para el autor.]` Realiza UJ-2.
- **FR-34 — Controles de publicación:** el autor puede permitir o impedir nuevos comentarios sin cambiar el enlace y puede revocar el acceso sin eliminar contenido interno.
- **FR-35 — Exploración pública:** el visitante puede usar zoom y paneo, abrir el detalle de cada Recurso y, cuando su tipo lo admite, previsualizarlo o reproducirlo; también puede explorar Relaciones sin editar composición ni contenido. Los controles no disponibles por formato o dispositivo se muestran deshabilitados o se sustituyen por abrir o descargar, sin bloquear el resto del Compartido.
- **FR-36 — Identidad de comentario:** el visitante puede ver y comentar un Compartido sin registrarse; Theke le asigna un alias científico anónimo y una cookie de identidad. Puede iniciar sesión con Clerk y vincular los comentarios de esa cookie vigente a su cuenta verificada. El correo ingresado no basta para atribuir autoría.
- **FR-37 — Comentario contextual:** el visitante puede anclar un comentario a una coordenada, Recurso o Relación mediante una herramienta visible y mediante el menú contextual.
- **FR-38 — Gestión del visitante:** el visitante puede editar sus propios comentarios durante la vigencia de su identidad de sesión.
- **FR-39 — Moderación del autor:** el autor recibe una notificación interna por comentario nuevo, consulta los comentarios mediante marcadores y una lista, y navega a su contexto. Al resolver un comentario, este se conserva y se retira de pendientes; al eliminarlo, se quita del Compartido y del listado activo sin permitir editar texto ajeno.
- **FR-40 — Anclaje perdido:** si desaparece el objetivo de un comentario, este permanece en la lista como comentario sin anclaje hasta que se resuelve o elimina.

## Requisitos no funcionales

### Rendimiento y escalabilidad

- **NFR-1:** pan, zoom, selección y arrastre deben responder de forma fluida en el escenario de referencia del MVP. `[ASSUMPTION: validar con 200 Representaciones visibles y 300 Relaciones en hardware de gama media.]`
- **NFR-2:** la Vista compartida debe mostrar contenido útil en menos de 3 segundos con una conexión de banda ancha para el escenario de referencia, cargando multimedia pesada bajo demanda.
- **NFR-3:** Biblioteca, Carpetas y Canvas deben utilizar carga progresiva para no materializar colecciones completas innecesariamente.

### Fiabilidad e integridad

- **NFR-4:** los cambios del autor se guardan automáticamente y la interfaz indica si está guardando, si el cambio se guardó o si ocurrió un error. `[ASSUMPTION: persistencia remota confirmada dentro de 2 segundos en condiciones normales.]`
- **NFR-5:** una interrupción o fallo de IA no debe perder ni bloquear el trabajo manual.
- **NFR-6:** Recursos, Relaciones y Representaciones conservan identidad estable entre sesiones, Diagramas y Compartidos.
- **NFR-7:** las operaciones globales destructivas requieren confirmación e informan el impacto antes de ejecutarse.

### Seguridad y privacidad

- **NFR-8:** toda comunicación usa cifrado en tránsito y los archivos administrados se cifran en reposo.
- **NFR-9:** el sistema aplica aislamiento entre cuentas y acceso privado por defecto a Proyectos, Bibliotecas y Recursos.
- **NFR-10:** los enlaces no listados usan identificadores no predecibles y su revocación impide nuevo acceso sin demora perceptible.
- **NFR-11:** Theke calcula una vista segura de cada Compartido y no revela nombres, metadatos ni referencias de Recursos privados no incluidos.
- **NFR-12:** las cargas de archivos se validan y analizan antes de quedar disponibles públicamente.
- **NFR-13:** los comentarios anónimos tienen límites de frecuencia y mecanismos básicos de moderación y prevención del abuso.

### IA responsable y datos

- **NFR-14:** Theke informa finalidad, alcance, proveedor, retención y uso para entrenamiento antes del primer análisis y cuando cambien estas condiciones.
- **NFR-15:** el contenido privado no se utiliza para entrenar modelos generales salvo consentimiento separado y explícito.
- **NFR-16:** los límites de formato, tamaño o contexto se informan antes de ejecutar el análisis; Theke nunca omite silenciosamente parte de una fuente.
- **NFR-17:** toda sugerencia distingue evidencia de fuentes, inferencia de Theke y necesidad de evidencia adicional.
- **NFR-18:** desactivar IA no elimina Recursos, Diagramas ni Relaciones manuales.

### Accesibilidad y compatibilidad

- **NFR-19:** navegación, gestión de recursos, controles y comentarios cumplen WCAG 2.2 AA; la edición espacial avanzada documenta cualquier limitación restante.
- **NFR-20:** las acciones esenciales pueden realizarse sin arrastrar, usar el clic derecho ni depender exclusivamente del puntero.
- **NFR-21:** el editor admite versiones actuales de los principales navegadores de escritorio. La Vista compartida es adaptable a escritorio, tablet y móvil.
- **NFR-22:** en móvil, el visitante puede navegar, abrir Recursos y comentar; la edición completa del Canvas no forma parte del MVP.

## Métricas de éxito

El primer protocolo será un piloto moderado con `[ASSUMPTION: al menos 10 autores y un visitante invitado por autor]`. Los eventos del producto medirán finalización, retorno y reutilización; una tarea observada medirá ejecución sin ayuda; una encuesta posterior con una escala de 1 a 5 medirá comprensión y utilidad. Los umbrales son provisionales hasta el primer piloto.

- **SM-1 — Finalización del recorrido:** `[ASSUMPTION: al menos 80 %]` de los autores piloto crea un Proyecto, incorpora Recursos, construye un Grafo persistente y lo comparte sin asistencia del moderador durante una sesión. Valida FR-1 a FR-18 y FR-32 a FR-35.
- **SM-2 — Retorno al trabajo:** `[ASSUMPTION: al menos 50 %]` de los autores piloto vuelve al mismo Proyecto dentro de siete días del primer uso. Valida FR-3, FR-9 y FR-11.
- **SM-3 — Reutilización:** `[ASSUMPTION: al menos 50 %]` de los autores que crean un segundo Proyecto o Diagrama reutiliza al menos un Recurso o Relación existente durante el piloto extendido. Valida FR-9 y FR-22.
- **SM-4 — Comprensión percibida:** `[ASSUMPTION: al menos 70 %]` de los autores puntúa con 4 o 5 que el Diagrama mejora su comprensión de la estructura del tema frente a su método anterior.
- **SM-5 — IA controlada y útil:** el 100 % de las sugerencias muestra alcance y fundamento y ninguna modifica conocimiento sin confirmación; además, `[ASSUMPTION: al menos 50 %]` de los autores que reciben una sugerencia realiza una acción cualificada —investigar, añadir evidencia, reorganizar, conectar, editar o descartar justificadamente— y menos de `[ASSUMPTION: 10 %]` informa de una afirmación factual falsa presentada como cierta. Valida FR-25 a FR-31.
- **SM-6 — Compartido útil:** `[ASSUMPTION: al menos 80 %]` de los visitantes completa sin ayuda la apertura, exploración y comentario contextual, y `[ASSUMPTION: al menos 70 %]` de los autores que recibe comentarios puntúa con 4 o 5 su utilidad para revisar o comprender el Diagrama. Valida FR-33 a FR-40.
- **SM-C1 — No maximizar aceptación de IA:** una tasa alta de aceptación no constituye éxito por sí sola; se observarán también ediciones, descartes y reportes para evitar empujar sugerencias poco críticas.
- **SM-C2 — No maximizar densidad:** más nodos o conexiones no implican mejor comprensión; se observará claridad y capacidad de navegación.

## Decisiones diferidas y gates

Ninguna de estas decisiones bloquea UX conceptual. Deben cerrarse en el momento indicado antes de convertir la capacidad afectada en historias listas para desarrollo:

1. **Almacenamiento — resuelto para el piloto:** 20 archivos por lote, 250 MiB por archivo y 5 GiB por Cuenta; preview de audio hasta 120 minutos y video hasta 30 minutos. Arquitectura y las historias conservan el detalle de formatos, cuarentena y ClamAV.
2. **Identidad — resuelto para el piloto:** Clerk usa código de un solo uso por correo y Google; la identidad anónima usa una cookie no renovable de 30 días limitada al Compartido.
3. **Notificaciones:** Producto decidirá si existen canales adicionales antes de implementar notificaciones; el MVP solo exige bandeja interna.
4. **Gobierno de datos — resuelto para el piloto:** ventana recuperable de 30 días, historial de Compartidos revocados por 90 días, export ZIP previa a eliminación de Cuenta, backup externo en Backblaze B2 con Object Lock de 30 días, RPO 24 horas y RTO 4 horas.
5. **Edad y consentimiento:** el piloto inicial queda limitado a adultos invitados; un lanzamiento abierto continúa bloqueado hasta revisión de Producto/legal.
6. **Proveedor de IA — resuelto para el MVP:** OpenAI Responses API con `gpt-5.6-terra`, `store:false` y esfuerzo medio; máximo 50.000 tokens de entrada, 4.000 de salida, 10 ejecuciones diarias y USD 5 mensuales por Cuenta. Se informa la retención del proveedor y el recorrido manual sigue siendo entregable.
7. **Rendimiento y métricas:** Ingeniería y Producto sustituirán los umbrales provisionales después de medir el prototipo y completar el primer piloto, antes de declarar el MVP completo.

## Índice de supuestos

- NFR-1: escenario de rendimiento con 200 Representaciones y 300 Relaciones.
- NFR-4: confirmación de guardado remoto dentro de 2 segundos.
- FR-33: un Compartido activo por Diagrama y un hilo nuevo después de revocar y republicar.
- Protocolo: al menos 10 autores y un visitante invitado por autor.
- SM-1: tasa de finalización piloto de 80 %.
- SM-2: retorno de 50 % dentro de siete días.
- SM-3: reutilización por 50 % de los autores elegibles.
- SM-4: comprensión mejorada para 70 % de los autores.
- SM-5: acción cualificada para 50 % de autores expuestos y menos de 10 % de reportes de afirmaciones factuales falsas.
- SM-6: finalización por 80 % de visitantes y utilidad percibida por 70 % de autores con comentarios.
