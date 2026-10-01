---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-Theke-2026-09-19/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-Theke-2026-09-20/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Theke-2026-09-19/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Theke-2026-09-19/EXPERIENCE.md
---

# Theke - Epic Breakdown

## Overview

Este documento descompone los requisitos de Theke en epics e historias implementables a partir del PRD, la especificación UX y el spine de arquitectura.

## Requirements Inventory

### Functional Requirements

- **FR-1 — Cuenta de autor:** una persona puede crear una cuenta, autenticarse, cerrar sesión y recuperar el acceso para conservar su trabajo. Cada operación comunica éxito o error sin perder trabajo ya guardado.
- **FR-2 — Proyecto:** el autor puede crear, renombrar, abrir, archivar y eliminar un Proyecto. Archivar lo retira de las vistas activas sin borrar contenido; eliminar exige mostrar Diagramas, referencias a Recursos y Compartidos afectados y solicitar confirmación.
- **FR-3 — Biblioteca:** cada cuenta dispone de una Biblioteca canónica persistente, accesible sin abrir un Diagrama. Cada Proyecto mantiene una selección y organización propia de Recursos de esa Biblioteca.
- **FR-4 — Carpetas:** el autor puede crear, renombrar, mover y archivar Carpetas dentro de un Proyecto, y organizar en ellas referencias a Recursos sin cambiar ni duplicar la identidad canónica de estos.
- **FR-5 — Búsqueda y filtrado:** el autor puede localizar Recursos por nombre, tipo y Carpeta.
- **FR-6 — Carga de archivos:** el autor puede incorporar uno o varios archivos desde el dispositivo. Theke crea un Recurso independiente por archivo y comunica progreso, éxito o fallo individual.
- **FR-7 — Tipos de recurso:** el MVP admite notas editables, PDF, imágenes, audio, video, enlaces web y archivos genéricos. Cada tipo conserva sus metadatos y ofrece las acciones compatibles pertinentes: editar, previsualizar, reproducir, abrir o descargar. Un formato no previsualizable sigue siendo accesible como archivo genérico.
- **FR-8 — Enlaces web:** el autor puede crear un Recurso desde una URL; Theke conserva la URL y, cuando sea posible, obtiene título, descripción e imagen de vista previa sin bloquear la creación si esa obtención falla.
- **FR-9 — Reutilización:** el autor puede utilizar un Recurso de su Biblioteca en varios Proyectos y Diagramas sin volver a cargarlo ni crear una copia del contenido.
- **FR-10 — Creación de diagrama:** el autor puede crear, renombrar, abrir, duplicar, archivar y eliminar un Diagrama de grafo dentro de un Proyecto.
- **FR-11 — Persistencia del canvas:** Theke conserva automáticamente Representaciones, posiciones, tamaños, estilos, Relaciones visibles, Grupos y Anotaciones visuales para retomarlos en otra sesión.
- **FR-12 — Incorporación al canvas:** el autor puede añadir Recursos mediante arrastre desde la Biblioteca, carga directa sobre el Canvas o controles visibles. El menú contextual actúa como atajo, no como única vía.
- **FR-13 — Carga directa:** al soltar archivos externos sobre el Canvas, Theke crea los Recursos y sus Representaciones. Una carga múltiple evita solapamientos y no crea Relaciones implícitas.
- **FR-14 — Representación por tipo:** cada Recurso obtiene una tarjeta compacta reconocible por tipo. La tarjeta permite abrir la acción compatible definida en FR-7 y, si esa acción falla o no está disponible, conserva acceso a los metadatos y al archivo o URL original.
- **FR-15 — Carpeta en diagrama:** el autor puede representar una Carpeta como acceso compacto, abrirla y seleccionar Recursos individuales sin expandir automáticamente toda la colección.
- **FR-16 — Grupos:** el autor puede agrupar Representaciones localmente, nombrar el Grupo, moverlo y modificar su presentación sin alterar Carpetas ni crear Relaciones globales.
- **FR-17 — Anotaciones visuales:** el autor puede añadir y editar texto decorativo, formas y líneas libres que pertenecen únicamente al Diagrama y se distinguen de Recursos y Relaciones.
- **FR-18 — Presentación:** el autor puede modificar colores de elementos y fondo del Diagrama sin cambiar el contenido canónico de los Recursos.
- **FR-19 — Edición de recurso:** el autor puede editar metadatos y, cuando el tipo lo permite, contenido del Recurso. El cambio se refleja en todas sus Representaciones y Compartidos vivos.
- **FR-20 — Representación local:** mover, redimensionar, estilizar, mostrar u ocultar una Representación afecta solamente su Diagrama.
- **FR-21 — Relación explicada:** el autor puede crear una Relación dirigida o no dirigida cuyos extremos sean Recursos. Puede elegir un tipo común sugerido por Theke o crear un tipo personalizado reutilizable dentro del Proyecto. En ambos casos, puede añadir una etiqueta, una explicación, evidencia y procedencia. Carpetas, Grupos y Anotaciones visuales no pueden ser extremos de una Relación en el MVP.
- **FR-22 — Reutilización de relación:** al utilizar Recursos relacionados en otro Diagrama, Theke informa que existe la Relación y permite decidir si se muestra allí.
- **FR-23 — Ciclo de vida seguro:** quitar una Representación no elimina su Recurso. Antes de eliminar o archivar un Recurso o Relación global, Theke muestra sus usos y consecuencias.
- **FR-24 — Disponibilidad opcional:** todas las funciones manuales del MVP permanecen utilizables cuando la IA está desactivada, no disponible o alcanza un límite.
- **FR-25 — Alcance visible:** antes de analizar, Theke muestra qué Recursos utilizará. De forma predeterminada, limita el análisis a los Recursos implicados en la acción y requiere autorización para ampliarlo.
- **FR-26 — Ayuda en relaciones:** al crear o editar una Relación, Theke puede sugerir tipo, etiqueta, explicación, evidencia ya presente en la Biblioteca o una necesidad de búsqueda que el autor debe investigar. En el MVP no localiza ni importa fuentes externas autónomamente.
- **FR-27 — Ayuda en grupos:** al crear o modificar un Grupo, Theke puede sugerir un nombre o tema, señalar elementos atípicos y proponer Recursos relacionados.
- **FR-28 — Revisión solicitada:** el autor puede pedir una revisión de una selección o Diagrama para detectar vacíos, duplicados, contradicciones o Recursos aislados.
- **FR-29 — Decisión humana:** cada sugerencia muestra la acción propuesta, el fundamento, los Recursos utilizados y los límites. El autor puede editarla, aceptarla o descartarla; ninguna sugerencia modifica conocimiento sin confirmación.
- **FR-30 — Procedencia:** las Relaciones o contenidos aceptados a partir de una sugerencia conservan su origen, evidencia, fecha y distinción respecto del contenido creado manualmente. El autor puede consultar esa procedencia después de aceptar la sugerencia.
- **FR-31 — Retroalimentación:** el autor puede informar de una sugerencia incorrecta. Theke no presenta inferencias sin evidencia como hechos ni inventa citas cuando falta sustento.
- **FR-32 — Previsualización:** antes de publicar, el autor puede revisar la experiencia del visitante y la lista exacta de Recursos expuestos.
- **FR-33 — Enlace compartido:** el autor puede generar un enlace no listado, vivo y revocable para un Diagrama. En el MVP existe un Compartido activo por Diagrama; republicar después de revocarlo crea un enlace y un hilo de comentarios nuevos, conservando el historial anterior solo para el autor.
- **FR-34 — Controles de publicación:** el autor puede permitir o impedir nuevos comentarios sin cambiar el enlace y puede revocar el acceso sin eliminar contenido interno.
- **FR-35 — Exploración pública:** el visitante puede usar zoom y paneo, abrir el detalle de cada Recurso y, cuando su tipo lo admite, previsualizarlo o reproducirlo; también puede explorar Relaciones sin editar composición ni contenido. Los controles no disponibles se deshabilitan o sustituyen por abrir o descargar sin bloquear el resto del Compartido.
- **FR-36 — Identidad de comentario:** el visitante puede ver y comentar un Compartido sin registrarse, con un alias científico anónimo asignado por Theke. Puede iniciar sesión con Clerk y vincular los comentarios de su cookie anónima vigente a su cuenta; el identificador de cuenta verificado, nunca el correo escrito, determina la autoría.
- **FR-37 — Comentario contextual:** el visitante puede anclar un comentario a una coordenada, Recurso o Relación mediante una herramienta visible y mediante el menú contextual.
- **FR-38 — Gestión del visitante:** el visitante puede editar sus propios comentarios durante la vigencia de su identidad de sesión.
- **FR-39 — Moderación del autor:** el autor recibe una notificación interna por comentario nuevo, consulta los comentarios mediante marcadores y una lista, y navega a su contexto. Al resolver un comentario, este se conserva y se retira de pendientes; al eliminarlo, se quita del Compartido y del listado activo sin permitir editar texto ajeno.
- **FR-40 — Anclaje perdido:** si desaparece el objetivo de un comentario, este permanece en la lista como comentario sin anclaje hasta que se resuelve o elimina.

### NonFunctional Requirements

- **NFR-1:** pan, zoom, selección y arrastre deben responder de forma fluida en el escenario de referencia del MVP: 200 Representaciones visibles y 300 Relaciones en hardware de gama media.
- **NFR-2:** la Vista compartida debe mostrar contenido útil en menos de 3 segundos con banda ancha para el escenario de referencia, cargando multimedia pesada bajo demanda.
- **NFR-3:** Biblioteca, Carpetas y Canvas deben utilizar carga progresiva para no materializar colecciones completas innecesariamente.
- **NFR-4:** los cambios del autor se guardan automáticamente y la interfaz indica si está guardando, si se guardó o si ocurrió un error; la persistencia remota debe confirmarse dentro de 2 segundos en condiciones normales.
- **NFR-5:** una interrupción o fallo de IA no debe perder ni bloquear el trabajo manual.
- **NFR-6:** Recursos, Relaciones y Representaciones conservan identidad estable entre sesiones, Diagramas y Compartidos.
- **NFR-7:** las operaciones globales destructivas requieren confirmación e informan el impacto antes de ejecutarse.
- **NFR-8:** toda comunicación usa cifrado en tránsito y los archivos administrados se cifran en reposo.
- **NFR-9:** el sistema aplica aislamiento entre cuentas y acceso privado por defecto a Proyectos, Bibliotecas y Recursos.
- **NFR-10:** los enlaces no listados usan identificadores no predecibles y su revocación impide nuevo acceso sin demora perceptible.
- **NFR-11:** Theke calcula una vista segura de cada Compartido y no revela nombres, metadatos ni referencias de Recursos privados no incluidos.
- **NFR-12:** las cargas de archivos se validan y analizan antes de quedar disponibles públicamente.
- **NFR-13:** los comentarios anónimos tienen límites de frecuencia y mecanismos básicos de moderación y prevención del abuso.
- **NFR-14:** Theke informa finalidad, alcance, proveedor, retención y uso para entrenamiento antes del primer análisis y cuando cambien estas condiciones.
- **NFR-15:** el contenido privado no se utiliza para entrenar modelos generales salvo consentimiento separado y explícito.
- **NFR-16:** los límites de formato, tamaño o contexto se informan antes del análisis; Theke nunca omite silenciosamente parte de una fuente.
- **NFR-17:** toda sugerencia distingue evidencia de fuentes, inferencia de Theke y necesidad de evidencia adicional.
- **NFR-18:** desactivar IA no elimina Recursos, Diagramas ni Relaciones manuales.
- **NFR-19:** navegación, gestión de recursos, controles y comentarios cumplen WCAG 2.2 AA; la edición espacial avanzada documenta cualquier limitación restante.
- **NFR-20:** las acciones esenciales pueden realizarse sin arrastrar, usar clic derecho ni depender exclusivamente del puntero.
- **NFR-21:** el editor admite versiones actuales de los principales navegadores de escritorio. La Vista compartida es adaptable a escritorio, tablet y móvil.
- **NFR-22:** en móvil, el visitante puede navegar, abrir Recursos y comentar; la edición completa del Canvas no forma parte del MVP.

### Additional Requirements

- **AR-1 — Separación de sistemas:** mantener `theke-web` y `theke-api` como repositorios y despliegues independientes; el frontend no accede directamente a PostgreSQL, almacenamiento ni colas.
- **AR-2 — Runtime y framework:** el backend usa Node.js 24 LTS, TypeScript estricto y un monolito modular NestJS sobre Fastify; el frontend debe actualizarse desde Node.js 22.15 al runtime acordado.
- **AR-3 — Integración pública:** el contrato cliente-servidor usa REST versionado bajo `/v1`, OpenAPI como fuente contractual y SSE únicamente para invalidaciones y progreso en tiempo real.
- **AR-4 — Contratos compartidos:** `@theke/contracts` se publica como paquete inmutable y versionado desde el backend e incluye OpenAPI generado, esquemas/versiones del Canvas y sobres SSE; el frontend genera su cliente mediante Orval.
- **AR-5 — Compatibilidad de despliegue:** backend y frontend deben mantener compatibilidad con la versión actual y la inmediatamente anterior del contrato para permitir despliegues independientes y rollback seguro.
- **AR-6 — Modelo canónico:** PostgreSQL conserva Recursos, Versiones de Recurso, Relaciones y permisos normalizados; el documento del Canvas se conserva como JSONB versionado y referencia identidades canónicas sin duplicar contenido.
- **AR-7 — Versiones de recurso:** las ediciones de contenido compatible crean versiones estables, conservan procedencia y permiten que representaciones y compartidos vivos resuelvan la versión vigente según reglas explícitas.
- **AR-8 — Identidad y autorización:** Clerk autentica; Theke mantiene usuarios locales, cuentas, membresías y autorización propia. Cada solicitud deriva un `AuthContext` y toda consulta privada se limita por cuenta mediante repositorios y restricciones de integridad compuestas.
- **AR-9 — Persistencia del Canvas:** el guardado usa documento completo con revisión esperada e idempotencia; conflictos y reintentos no deben sobrescribir silenciosamente cambios más recientes.
- **AR-10 — Recuperación local:** el editor mantiene un journal local en IndexedDB para recuperar cambios no confirmados después de desconexión, cierre o fallo del navegador.
- **AR-11 — Invariantes React Flow:** `container` es el único discriminador de GroupNode; al reparentar se calcula posición absoluta reciente, se convierte a relativa, se activa `expandParent` y el hijo queda después del padre en `nodes`.
- **AR-12 — Rendimiento del Canvas:** no se muta estado directamente dentro de `onNodesChange`; los nodos con `NodeResizer` no usan `transition-all`; la etiqueta de GroupNode permanece fuera del contenido y sus handles fuera del panel recortado.
- **AR-13 — Proyección pública:** publicar crea de forma atómica una proyección explícita y permitida del Diagrama; la API pública nunca serializa entidades privadas para luego filtrarlas en el cliente.
- **AR-14 — Endurecimiento público:** enlaces compartidos tienen tokens no enumerables, cabeceras seguras, revocación efectiva, protección antiabuso y controles de caché coherentes con contenido vivo.
- **AR-15 — Comentarios anónimos seguros:** la identidad anónima usa cookie protegida y las mutaciones incorporan protección CSRF, límites de frecuencia y moderación básica.
- **AR-16 — Pipeline de archivos:** las cargas usan URLs firmadas hacia cuarentena privada; el servidor valida tamaño, tipo declarado, tipo detectado y hash, ejecuta análisis antimalware y solo después promueve el objeto para uso o publicación.
- **AR-17 — Procesamiento asíncrono:** trabajos duraderos usan pg-boss sobre PostgreSQL, se crean dentro de la misma transacción que el cambio de dominio y poseen política de reintentos, idempotencia y dead-letter queue.
- **AR-18 — Enlaces externos seguros:** la obtención de metadatos de URL aplica mitigación SSRF, allow/deny de protocolos y destinos, límites de redirección, tiempo y tamaño, y no bloquea la creación del Recurso si falla.
- **AR-19 — IA desacoplada:** toda IA pasa por un puerto de aplicación independiente del proveedor, registra alcance, insumos, proveedor/modelo, resultado, decisión humana y procedencia; ninguna ejecución modifica conocimiento sin una orden confirmada.
- **AR-20 — Streaming de IA:** cuando se use salida incremental, SSE viaja sobre una solicitud `fetch` autenticada; progreso, finalización, error e invalidación usan sobres explícitamente versionados.
- **AR-21 — Despliegue:** Vercel aloja el frontend; Railway aloja API, worker, PostgreSQL y bucket privado compatible con S3. Los entornos de preview deben emparejar versiones compatibles y no compartir datos productivos.
- **AR-22 — Migraciones:** los cambios de esquema siguen despliegues expand/contract; ninguna migración destructiva se ejecuta antes de que las versiones de aplicación dependientes hayan sido retiradas.
- **AR-23 — Observabilidad:** API, worker y frontend propagan identificadores de correlación; se registran errores, latencia, colas, guardados, publicaciones y operaciones de IA sin exponer contenido privado ni secretos.
- **AR-24 — Verificación:** antes de integrar se exigen lint, build, pruebas unitarias/de integración del dominio y contratos, y E2E de los recorridos críticos; se agregan pruebas específicas de aislamiento entre cuentas y proyección pública.
- **AR-25 — Respaldo y recuperación:** PostgreSQL y objetos requieren backups verificados, restauraciones ensayadas y objetivos RPO/RTO definidos antes del piloto externo.
- **AR-26 — Ciclo de vida:** archivo, eliminación definitiva, retención y exportación de Proyectos, Recursos, versiones, Compartidos y comentarios deben definirse y aplicarse coherentemente antes de persistencia productiva.
- **AR-27 — Paginación:** listados de proyectos, biblioteca, carpetas, comentarios y notificaciones usan paginación estable y carga incremental.
- **AR-28 — Baseline operativo del piloto:** acceso mediante código por correo y Google; archivos de hasta 250 MiB, lotes de 20 y cuota de 5 GiB por cuenta; ClamAV aislado; OpenAI Responses con gpt-5.6-terra y store:false; límites antiabuso configurados por sesión, IP HMAC y Compartido; backups externos inmutables en Backblaze B2; retención y exportación definidas; piloto limitado a adultos invitados.

### UX Design Requirements

- **UX-DR-1 — Lenguaje visual:** la interfaz de autor adopta una composición oscura, sobria y densa inspirada en IntelliJ IDEA 2026, sin copiar marca o activos propietarios; los colores semánticos siguen la familiaridad de Notion.
- **UX-DR-2 — Temas:** existe un sistema explícito de tokens para claro y oscuro, con preferencia inicial del sistema, control manual y persistencia por dispositivo.
- **UX-DR-3 — Tipografía:** usar JetBrains Sans solo si su licencia y distribución quedan verificadas; de lo contrario usar Inter o la pila del sistema, sin descargar fuentes de terceros durante la ejecución.
- **UX-DR-4 — Estructura del editor:** el shell de escritorio usa header de ventana de 40 px, franja de herramientas de 40 px, panel izquierdo de 224 px, Canvas central y panel contextual derecho de 304 px, todos colapsables donde corresponda.
- **UX-DR-5 — Densidad:** usar una retícula base de 4 px, controles compactos y jerarquía de IDE, reservando espacio amplio para el Canvas.
- **UX-DR-6 — Transparencia semántica:** la translucidez se limita a superficies temporales o flotantes; navegación y contenido persistente mantienen opacidad legible. Debe existir fallback opaco para falta de `backdrop-filter` y alto contraste.
- **UX-DR-7 — Navegación:** las superficies principales son Inicio, Proyectos, Proyecto, Biblioteca, Canvas, Vista compartida y Cuenta/Apariencia; el MVP no incluye una sección Comunidad.
- **UX-DR-8 — Estado vacío del Canvas:** un Canvas nuevo explica la diferencia entre Recursos, Grupos y anotaciones y ofrece acciones visibles para cargar, reutilizar o crear, sin depender del clic derecho.
- **UX-DR-9 — Biblioteca jerárquica:** paneles y tarjetas distinguen Biblioteca global, organización por Proyecto, Carpetas y Recursos, con búsqueda, filtros, carga progresiva y contexto suficiente para reutilizar sin duplicar.
- **UX-DR-10 — Incorporación multimodal:** cargar o añadir funciona mediante botón, selector, arrastre y teclado; las cargas múltiples muestran un tray de lote con progreso y resultado por archivo y una disposición inicial sin solapamiento.
- **UX-DR-11 — Tarjetas de recurso:** cada tipo es reconocible por icono, nombre, metadatos y acción primaria; estados no compatibles o fallidos ofrecen abrir, descargar o inspeccionar metadatos.
- **UX-DR-12 — Carpeta en Canvas:** Folder Card es compacta, revela cantidad y contexto y abre un selector o panel; nunca expande automáticamente todos sus Recursos sobre el Canvas.
- **UX-DR-13 — Group Frame:** el Grupo se diferencia visual y semánticamente de una Carpeta y una Relación, mantiene el título fuera del contenido y permite nombrar, mover, redimensionar y gestionar miembros sin alterar conocimiento global.
- **UX-DR-14 — Relaciones:** la conexión muestra dirección cuando aplica, tipo y etiqueta legibles, estados de selección/foco y acceso al Relation Editor con explicación, evidencia y procedencia.
- **UX-DR-15 — Panel contextual:** la inspección y edición ocurre preferentemente en el panel derecho, diferenciando con claridad propiedades globales del Recurso o Relación y propiedades locales de su Representación.
- **UX-DR-16 — Guardado:** un Save Status persistente y no intrusivo comunica guardando, guardado, sin conexión, conflicto y error, y ofrece recuperación o reintento cuando procede.
- **UX-DR-17 — IA guiada:** AI Guidance Card muestra acción propuesta, fundamento, Recursos usados, alcance, límites y distinción entre evidencia, inferencia y carencia; ofrece editar, aceptar, descartar e informar error.
- **UX-DR-18 — Consentimiento de IA:** antes del primer análisis y ante cambios materiales se presenta finalidad, proveedor, retención y entrenamiento; ampliar el alcance exige una acción explícita.
- **UX-DR-19 — IA opcional:** indisponibilidad, límite o desactivación de IA usa estados claros y deja visibles las alternativas manuales sin bloquear el flujo.
- **UX-DR-20 — Publicación:** Share Wizard conduce por previsualización, inventario exacto de Recursos expuestos, permisos de comentarios y confirmación del enlace; permite volver atrás sin perder configuración.
- **UX-DR-21 — Vista pública:** el visitante recibe una experiencia de lectura limpia y adaptable con zoom, paneo, apertura de Recursos y exploración de Relaciones, pero sin controles de edición.
- **UX-DR-22 — Comentarios:** una herramienta visible y el menú contextual permiten crear marcadores anclados; Comment Composer solicita nombre cuando corresponde, conserva borradores razonables y distingue pendiente, resuelto y sin anclaje.
- **UX-DR-23 — Moderación:** el autor consulta comentarios en marcadores y lista lateral, navega al contexto, resuelve o elimina, pero nunca edita texto ajeno; las notificaciones internas conducen al comentario relevante.
- **UX-DR-24 — Estados estándar:** listas, paneles, Canvas, cargas, publicación y comentarios incluyen estados de carga, vacío, error, reintento y permiso insuficiente con mensajes y siguientes acciones específicos.
- **UX-DR-25 — Confirmaciones:** Confirm Dialog explica entidad, alcance e impacto antes de archivo, revocación o eliminación global y diferencia claramente una Representación local del Recurso canónico.
- **UX-DR-26 — Operación por teclado:** menús, diálogos, paneles, selección, conexión, incorporación y comentarios poseen recorridos de teclado, foco visible, orden lógico y restauración del foco al cerrar.
- **UX-DR-27 — Alternativas al gesto:** ninguna función esencial depende exclusivamente de arrastre, clic derecho, hover o precisión del puntero; siempre existe una acción visible o comando equivalente.
- **UX-DR-28 — Vista semántica:** una representación no espacial sincronizada permite recorrer Recursos, Relaciones, Grupos y comentarios mediante estructura accesible y ejecutar las acciones esenciales.
- **UX-DR-29 — Accesibilidad visual:** contraste, foco y estados cumplen WCAG 2.2 AA; color nunca es la única señal; controles táctiles esenciales alcanzan aproximadamente 44 × 44 px en superficies móviles.
- **UX-DR-30 — Anuncios y errores:** cambios asíncronos importantes, carga, guardado, publicación y comentarios se anuncian con regiones vivas apropiadas sin saturar al usuario; los errores se asocian al control afectado.
- **UX-DR-31 — Movimiento:** las transiciones se limitan normalmente a 120–180 ms y a propiedades específicas; se respeta `prefers-reduced-motion` y no se interpola movimiento espacial que distorsione posiciones del Canvas.
- **UX-DR-32 — Multimedia accesible:** los Recursos multimedia presentan alternativas compatibles y el flujo de publicación advierte o impide publicar elementos sin los datos mínimos de accesibilidad definidos.
- **UX-DR-33 — Responsive:** la autoría completa se optimiza para escritorio; el shell reduce o apila paneles en anchos menores. La Vista compartida debe refluir hasta 320 CSS px y mantener navegación, apertura y comentarios en móvil.
- **UX-DR-34 — Microcopy:** la voz es breve, directa y pedagógica; usa términos del dominio de forma consistente, explica consecuencias antes de acciones irreversibles y evita presentar sugerencias de IA como certezas.
- **UX-DR-35 — Componentes previstos:** la implementación contempla primitivas base y los componentes Window Header, Tool Window Stripe, App Sidebar, Top Bar, Resource/Folder Card, Canvas Toolbar, Add Menu, Group Frame, Semantic Relation, Relation Editor, Context Panel, AI Guidance Card, Save Status, Upload Batch Tray, Share Wizard, Comment Marker/Composer, State Message, Confirm Dialog, Theme Control y Semantic View.

### FR Coverage Map

FR-1: Epic 1 — Acceso al espacio privado del autor.
FR-2: Epic 1 — Administración del ciclo de vida de Proyectos.
FR-3: Epic 1 — Biblioteca canónica y selección por Proyecto.
FR-4: Epic 1 — Organización de referencias mediante Carpetas.
FR-5: Epic 1 — Búsqueda y filtrado de Recursos.
FR-6: Epic 1 — Carga individual y múltiple de archivos.
FR-7: Epic 1 — Soporte y acciones por tipo de Recurso.
FR-8: Epic 1 — Creación de Recursos desde enlaces web.
FR-9: Epic 1 — Reutilización de Recursos sin duplicación.
FR-10: Epic 2 — Administración del ciclo de vida de Diagramas.
FR-11: Epic 2 — Persistencia automática de la composición visual.
FR-12: Epic 2 — Incorporación accesible de Recursos al Canvas.
FR-13: Epic 2 — Carga directa y disposición múltiple en el Canvas.
FR-14: Epic 2 — Representaciones interactivas según tipo.
FR-15: Epic 2 — Representación compacta de Carpetas.
FR-16: Epic 2 — Agrupación visual local de Representaciones.
FR-17: Epic 2 — Anotaciones visuales no canónicas.
FR-18: Epic 2 — Personalización visual del Diagrama.
FR-19: Epic 1 — Edición canónica propagada a sus usos.
FR-20: Epic 2 — Propiedades locales de cada Representación.
FR-21: Epic 3 — Relaciones semánticas explicadas y reutilizables.
FR-22: Epic 3 — Descubrimiento y visualización optativa de Relaciones existentes.
FR-23: Epic 1 — Ciclo de vida seguro de entidades canónicas y representaciones locales.
FR-24: Epic 4 — Continuidad completa del producto sin IA.
FR-25: Epic 4 — Alcance de análisis visible y autorizado.
FR-26: Epic 4 — Asistencia de IA para construir Relaciones.
FR-27: Epic 4 — Asistencia de IA para revisar Grupos.
FR-28: Epic 4 — Revisión solicitada de selecciones y Diagramas.
FR-29: Epic 4 — Decisión humana previa a cualquier modificación.
FR-30: Epic 4 — Procedencia persistente de contribuciones asistidas.
FR-31: Epic 4 — Reporte de sugerencias y límites de veracidad.
FR-32: Epic 5 — Previsualización e inventario previo a publicar.
FR-33: Epic 5 — Enlace no listado, vivo y revocable.
FR-34: Epic 5 — Controles de publicación y comentarios.
FR-35: Epic 5 — Exploración pública interactiva y de solo lectura.
FR-36: Epic 6 — Identidad anónima para comentar.
FR-37: Epic 6 — Comentarios contextuales mediante herramienta visible o atajo.
FR-38: Epic 6 — Edición de comentarios propios por el visitante.
FR-39: Epic 6 — Notificación, navegación y moderación por el autor.
FR-40: Epic 6 — Conservación gestionable de comentarios sin anclaje.

## Epic List

### Epic 1: Biblioteca privada y reutilizable

El autor puede acceder a un espacio privado, administrar Proyectos y organizar, cargar, editar, buscar y reutilizar Recursos canónicos con un ciclo de vida seguro.

**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9, FR-19, FR-23.

**Consideraciones de implementación:** esta épica establece el primer recorrido vertical completo con Clerk, autorización por cuenta, API y PostgreSQL; incorpora la carga segura de archivos y distingue desde el inicio identidad canónica de organización local. Las decisiones pendientes sobre cuotas, formatos, antimalware, retención y eliminación deben cerrarse antes de declarar listas sus historias afectadas.

### Epic 2: Diagramas visuales persistentes

El autor puede convertir Recursos de su Biblioteca en Diagramas interactivos, persistentes y personalizables mediante tarjetas, Carpetas, Grupos y Anotaciones visuales.

**FRs covered:** FR-10, FR-11, FR-12, FR-13, FR-14, FR-15, FR-16, FR-17, FR-18, FR-20.

**Consideraciones de implementación:** construye sobre la Biblioteca sin depender de Relaciones, IA o publicación. Incluye el contrato versionado del Canvas, autosave con revisión e idempotencia, recuperación local, accesibilidad espacial y semántica, y todos los invariantes documentados de React Flow y `container`.

### Epic 3: Relaciones de conocimiento explicadas

El autor puede expresar conexiones semánticas entre Recursos con dirección, tipo, explicación, evidencia y procedencia, y reutilizarlas selectivamente en otros Diagramas.

**FRs covered:** FR-21, FR-22.

**Consideraciones de implementación:** extiende el modelo canónico y el Canvas como una capacidad completa, reutilizando el mecanismo de impacto y ciclo de vida de la Epic 1. Debe conservar la diferencia entre Relación global y su visualización local y ofrecer operación equivalente sin arrastre.

### Epic 4: Guía de IA bajo control humano

El autor puede recibir sugerencias fundamentadas sobre Relaciones, Grupos y vacíos sin entregar a la IA el control de su conocimiento ni perder el flujo manual.

**FRs covered:** FR-24, FR-25, FR-26, FR-27, FR-28, FR-29, FR-30, FR-31.

**Consideraciones de implementación:** se apoya en las capacidades manuales completas de las épicas anteriores, pero no es requisito para usarlas. Usa un puerto desacoplado del proveedor, alcance y consentimiento explícitos, auditoría y procedencia. Proveedor, retención contractual, límites de contexto y coste deben cerrarse antes de implementar sus historias.

### Epic 5: Publicación y exploración interactiva

El autor puede previsualizar y publicar un Diagrama de forma segura; un visitante puede explorarlo y abrir sus Recursos sin registrarse ni editarlo.

**FRs covered:** FR-32, FR-33, FR-34, FR-35.

**Consideraciones de implementación:** introduce una proyección pública allowlist y atómica, tokens no enumerables, revocación y una experiencia responsive de solo lectura. Debe cargar multimedia bajo demanda y nunca depender de filtrar datos privados ya entregados al cliente.

### Epic 6: Retroalimentación contextual del visitante

El visitante puede comentar puntos, Recursos y Relaciones; el autor puede recibir, localizar, resolver y moderar esa retroalimentación sin alterar el conocimiento canónico.

**FRs covered:** FR-36, FR-37, FR-38, FR-39, FR-40.

**Consideraciones de implementación:** extiende un Compartido ya útil y mantiene los comentarios ligados a ese Compartido, no a la Biblioteca. Incorpora identidad anónima protegida, CSRF, límites antiabuso, lista y marcadores sincronizados, adaptación móvil y conservación explícita de comentarios sin anclaje.

**Secuencia natural:** Biblioteca → Diagramas → Relaciones; desde Diagramas y Relaciones se habilitan de forma independiente IA guiada y Publicación; Comentarios extiende Publicación.

## Epic 1: Biblioteca privada y reutilizable

El autor puede acceder a un espacio privado, administrar Proyectos y organizar, cargar, editar, buscar y reutilizar Recursos canónicos con un ciclo de vida seguro.

### Story 1.1: Acceder al espacio privado

Como autor,
quiero crear una cuenta, iniciar y cerrar sesión y recuperar mi acceso,
para conservar mi trabajo en un espacio privado.

**Requirements:** FR-1; NFR-8, NFR-9, NFR-19.

**Acceptance Criteria:**

**Given** que una persona no tiene una sesión activa
**When** intenta abrir una ruta privada
**Then** Theke muestra el acceso de Clerk
**And** permite autenticarse mediante código de un solo uso enviado por correo o mediante Google.

**Given** que la persona completa correctamente su primer acceso
**When** Theke valida su identidad con Clerk
**Then** crea de manera idempotente su usuario, cuenta y membresía local
**And** abre su espacio privado sin solicitar nuevamente sus datos.

**Given** que un usuario existente vuelve a Theke
**When** se autentica con la misma identidad
**Then** se vincula con su cuenta local existente
**And** no se duplican el usuario, la cuenta ni la membresía.

**Given** que el código expiró, el proveedor rechazó el acceso o la autenticación fue cancelada
**When** Clerk devuelve el fallo
**Then** Theke presenta un mensaje comprensible con una acción para reintentar
**And** no crea registros locales incompletos.

**Given** que el usuario perdió acceso a una sesión anterior
**When** solicita un nuevo código válido en su correo
**Then** puede volver a entrar en la misma cuenta
**And** conserva todo el trabajo previamente guardado.

**Given** que existe una sesión válida
**When** el usuario recarga o vuelve a abrir la aplicación
**Then** Theke restaura la sesión y muestra el espacio privado
**And** comunica un estado de carga accesible mientras resuelve la identidad.

**Given** que el usuario selecciona cerrar sesión
**When** la operación finaliza
**Then** se elimina la sesión local y se muestra la pantalla de acceso
**And** volver a una ruta privada no expone información de la cuenta anterior.

**Given** una solicitud a cualquier endpoint privado
**When** falta un token válido de Clerk
**Then** la API la rechaza sin revelar datos
**And** cuando el token es válido deriva la cuenta desde el contexto autenticado, nunca desde un `accountId` confiado al cliente.

**Given** los controles de autenticación y sesión
**When** se utilizan con teclado o lector de pantalla
**Then** conservan foco visible, etiquetas accesibles, orden lógico y mensajes de error asociados
**And** respetan el tema oscuro, claro o del sistema elegido.

**Given** que esta historia establece el primer corte vertical
**When** se implementa la integración autenticada
**Then** theke-web permanece separado de theke-api y la API usa Node.js 24, TypeScript estricto y NestJS sobre Fastify
**And** el frontend consume /v1/me mediante el cliente generado desde OpenAPI y nunca accede directamente a PostgreSQL, Storage o APIs administrativas de Clerk.

**Given** el contrato entre ambos repositorios
**When** se publica una versión de @theke/contracts
**Then** es inmutable, versionada y consumible por el cliente generado
**And** el despliegue conserva compatibilidad con la versión actual y la inmediatamente anterior.

**Given** el primer despliegue integrado
**When** se promueve a un entorno
**Then** la SPA se ejecuta en Vercel y la API y PostgreSQL en Railway con secretos aislados por entorno
**And** las solicitudes propagan un requestId sin registrar tokens ni contenido privado.

### Story 1.2: Crear y administrar proyectos

Como autor,
quiero crear, abrir, renombrar, archivar y restaurar proyectos,
para separar y retomar mis distintos temas de trabajo.

**Requirements:** FR-2; NFR-7, NFR-9, NFR-19.

**Acceptance Criteria:**

**Given** que el autor todavía no tiene proyectos activos
**When** abre la sección Proyectos
**Then** Theke muestra un estado vacío que explica para qué sirve un Proyecto
**And** ofrece una acción visible para crear el primero.

**Given** que el autor crea un Proyecto con un nombre válido
**When** confirma la operación
**Then** Theke crea el Proyecto dentro de su cuenta y lo muestra en la lista activa
**And** permite abrirlo inmediatamente.

**Given** que el nombre está vacío, contiene solo espacios o supera el límite admitido
**When** el autor intenta guardarlo
**Then** Theke no crea ni modifica el Proyecto
**And** muestra el problema junto al campo conservando el texto introducido.

**Given** un Proyecto existente
**When** el autor cambia su nombre
**Then** la lista y la vista del Proyecto muestran el nuevo nombre
**And** un fallo de persistencia conserva el nombre anterior y permite reintentar.

**Given** un Proyecto activo
**When** el autor confirma archivarlo
**Then** desaparece de la lista activa sin eliminar su contenido
**And** queda disponible en la vista de proyectos archivados.

**Given** un Proyecto archivado
**When** el autor selecciona restaurarlo
**Then** vuelve a la lista activa con la misma identidad y contenido
**And** puede abrirse normalmente.

**Given** que la cuenta contiene más proyectos de los que caben en una página
**When** el autor navega por la lista
**Then** Theke usa paginación estable y conserva la sección y filtros actuales
**And** muestra estados diferenciados de carga, lista vacía y error recuperable.

**Given** que un usuario intenta consultar o modificar un Proyecto perteneciente a otra cuenta
**When** la API recibe el identificador
**Then** no revela si el Proyecto existe y rechaza la operación
**And** todas las consultas aplican el ámbito obtenido del contexto autenticado.

**Given** la lista y las acciones de Proyecto
**When** el autor utiliza únicamente el teclado
**Then** puede crear, abrir, renombrar, archivar y restaurar
**And** el foco permanece visible y vuelve a un lugar lógico después de cerrar menús o diálogos.

### Story 1.3: Crear y editar notas canónicas

Como autor,
quiero crear y editar notas en una Biblioteca global,
para conservar conocimiento reutilizable sin ligarlo a un único Proyecto o Diagrama.

**Requirements:** FR-3, FR-7, FR-19; NFR-4, NFR-6, NFR-9.

**Acceptance Criteria:**

**Given** una cuenta sin Recursos
**When** el autor abre la Biblioteca
**Then** Theke muestra un estado vacío con una acción visible para crear una nota
**And** explica que los Recursos pueden reutilizarse en distintos contextos.

**Given** un título válido y contenido de texto
**When** el autor guarda una nota
**Then** Theke crea un Recurso canónico estable con su primera versión
**And** registra autor, fecha, tipo y método de creación.

**Given** una nota existente
**When** el autor modifica su título, descripción o contenido
**Then** Theke conserva la identidad del Recurso y crea la versión correspondiente cuando cambia su contenido
**And** la Biblioteca muestra la versión vigente sin duplicar el Recurso.

**Given** una edición sin cambios materiales
**When** el autor vuelve a guardar
**Then** Theke no crea versiones redundantes
**And** comunica que el contenido ya está actualizado.

**Given** que la persistencia falla
**When** el autor intenta guardar la nota
**Then** Theke conserva el texto local y muestra un estado de error recuperable
**And** permite reintentar sin crear versiones duplicadas.

**Given** cualquier lectura o modificación de un Recurso
**When** la API procesa la solicitud
**Then** restringe la operación a la cuenta autenticada mediante repositorios acotados
**And** mantiene identidad y versiones mediante restricciones de integridad en PostgreSQL.

**Given** un cambio de esquema requerido por Recursos o sus versiones
**When** se despliega con versiones de aplicación coexistentes
**Then** la migración sigue el patrón expand/contract y mantiene compatibilidad durante el rollout
**And** ninguna columna o estructura anterior se elimina antes de retirar sus consumidores.

### Story 1.4: Organizar y reutilizar recursos en proyectos

Como autor,
quiero seleccionar Recursos de mi Biblioteca y organizarlos en Carpetas de distintos Proyectos,
para reutilizar el mismo conocimiento sin duplicarlo.

**Requirements:** FR-3, FR-4, FR-9; NFR-6, NFR-19, NFR-20.

**Acceptance Criteria:**

**Given** un Recurso existente en la Biblioteca
**When** el autor lo añade a un Proyecto
**Then** Theke crea una referencia de Proyecto al mismo Recurso canónico
**And** no copia su contenido ni cambia su identidad.

**Given** que el mismo Recurso ya pertenece al Proyecto
**When** el autor intenta añadirlo nuevamente
**Then** Theke evita una referencia duplicada
**And** conduce al autor a su ubicación existente.

**Given** un Proyecto abierto
**When** el autor crea, renombra o mueve una Carpeta válida
**Then** Theke actualiza la organización del Proyecto
**And** no modifica la Biblioteca global ni otros Proyectos.

**Given** Recursos seleccionados dentro de un Proyecto
**When** el autor los mueve a una Carpeta o a la raíz
**Then** su organización cambia de forma atómica
**And** los Recursos conservan metadatos, versiones y referencias externas.

**Given** una Carpeta archivada
**When** el autor consulta la organización activa
**Then** la Carpeta deja de aparecer sin eliminar sus Recursos canónicos
**And** puede restaurarse con su organización previa.

**Given** la Biblioteca o el selector de Recursos del Proyecto
**When** se opera sin arrastrar
**Then** todas las acciones de añadir, mover y organizar están disponibles mediante botones, menús y teclado
**And** el foco y los anuncios de resultado son accesibles.

### Story 1.5: Cargar uno o varios archivos de forma segura

Como autor,
quiero cargar archivos individuales o en lote,
para incorporarlos a mi Biblioteca con información clara sobre el resultado de cada uno.

**Requirements:** FR-6, FR-7; NFR-8, NFR-12, NFR-19.

**Acceptance Criteria:**

**Given** uno o varios archivos seleccionados o soltados sobre una zona de carga
**When** comienza la incorporación
**Then** Theke muestra un elemento por archivo con nombre, tamaño, progreso y opción de cancelar cuando sea posible
**And** procesa cada archivo de forma independiente sin ocultar fallos parciales.

**Given** un archivo admitido dentro de los límites configurados
**When** el cliente solicita la carga
**Then** la API crea un registro pendiente y entrega una URL firmada hacia cuarentena privada
**And** el objeto no puede abrirse ni publicarse mientras siga pendiente.

**Given** que finaliza la transferencia
**When** el worker procesa el archivo
**Then** valida tamaño, tipo declarado, tipo detectado y hash y ejecuta análisis antimalware
**And** solo promueve el objeto y activa el Recurso si supera todas las comprobaciones.

**Given** el scanner del MVP
**When** el worker envía el snapshot de cuarentena a ClamAV clamd mediante INSTREAM en la red privada
**Then** usa firmas actualizadas por freshclam, no expone el socket a Internet y falla cerrado si el scanner o sus firmas no están saludables
**And** configura MaxFileSize y MaxScanSize para cubrir el límite de 250 MiB sin tratar archivos omitidos como limpios.

**Given** un archivo rechazado, infectado, cancelado o con transferencia fallida
**When** termina su procesamiento
**Then** Theke indica la causa y las acciones posibles sin habilitar el objeto
**And** el resto del lote continúa y conserva sus propios resultados.

**Given** un reintento o notificación duplicada del proceso
**When** el backend vuelve a recibir el mismo identificador idempotente
**Then** no crea Recursos ni objetos duplicados
**And** conserva un único estado final auditable.

**Given** que la API confirma una carga para procesamiento
**When** cambia el estado del Upload dentro de una transacción Drizzle
**Then** encola el trabajo de pg-boss dentro de esa misma transacción y un worker separado lo procesa idempotentemente
**And** los fallos agotados llegan a una dead-letter queue con alerta y procedimiento de redrive.

**Given** la configuración del MVP
**When** cambia un límite de tamaño, tipo o cuota
**Then** el cliente obtiene esa política desde el backend y la informa antes de transferir
**And** la validación definitiva sigue ocurriendo en el servidor.

**Given** el baseline del piloto
**When** el autor selecciona archivos
**Then** admite hasta 20 por lote, 250 MiB por archivo y 5 GiB totales por cuenta
**And** audio de hasta 120 minutos y video de hasta 30 minutos reciben preview; contenido más largo dentro del límite se conserva como archivo genérico sin análisis multimedia.

**Given** los formatos del MVP
**When** el servidor valida la carga
**Then** permite texto y Markdown, PDF, JPEG, PNG, WebP, GIF, MP3, M4A/AAC, OGG, WAV, MP4 H.264/AAC, WebM y documentos ofimáticos comunes como archivo genérico
**And** rechaza ejecutables, scripts activos y archivos cifrados que no puedan inspeccionarse.

### Story 1.6: Consultar recursos según su tipo

Como autor,
quiero previsualizar, reproducir, abrir o descargar mis Recursos según su formato,
para trabajar con ellos sin perder acceso cuando una vista previa no esté disponible.

**Requirements:** FR-7; NFR-3, NFR-19.

**Acceptance Criteria:**

**Given** un PDF o una imagen procesados correctamente
**When** el autor abre el Recurso
**Then** Theke presenta una vista previa compatible con sus metadatos esenciales
**And** mantiene disponible la acción de abrir o descargar el archivo original.

**Given** un Recurso de audio o video procesado correctamente
**When** el autor lo abre
**Then** puede reproducirlo con controles accesibles de teclado, estado y volumen
**And** la reproducción pesada comienza bajo demanda, no al cargar la lista.

**Given** un archivo genérico o un formato sin previsualización
**When** el autor consulta el Recurso
**Then** Theke muestra nombre, tipo, tamaño, procedencia y estado
**And** permite abrirlo o descargarlo si la política de seguridad lo autoriza.

**Given** que una previsualización falla
**When** el componente recibe el error
**Then** la tarjeta conserva metadatos y acceso al original
**And** muestra una alternativa específica sin bloquear el resto de la Biblioteca.

**Given** un Recurso multimedia
**When** el autor revisa sus datos de accesibilidad
**Then** puede registrar texto alternativo, descripción o información equivalente según el tipo
**And** Theke identifica claramente cualquier dato requerido que falte.

**Given** una tarjeta de Recurso
**When** recibe foco o se usa con alto contraste
**Then** el tipo, estado y acción principal siguen siendo distinguibles sin depender solo del color
**And** todos los controles poseen nombre accesible y foco visible.

### Story 1.7: Guardar enlaces web como recursos

Como autor,
quiero crear un Recurso a partir de una dirección web,
para conservar y reutilizar fuentes externas junto con mis archivos y notas.

**Requirements:** FR-8; NFR-5, NFR-8.

**Acceptance Criteria:**

**Given** una URL HTTP o HTTPS válida
**When** el autor confirma su creación
**Then** Theke guarda inmediatamente un Recurso con la URL y procedencia originales
**And** inicia la obtención de metadatos sin bloquear la creación.

**Given** que el sitio permite obtener metadatos
**When** finaliza el trabajo asíncrono
**Then** Theke incorpora título, descripción e imagen de vista previa disponibles
**And** no sustituye una edición manual más reciente del autor.

**Given** que la obtención falla, vence o devuelve datos inválidos
**When** termina el intento
**Then** el Recurso continúa disponible con su URL original
**And** el autor puede editar manualmente título y descripción o reintentar.

**Given** una URL con protocolo prohibido, destino privado o redirección insegura
**When** el servicio intenta consultarla
**Then** la rechaza mediante las reglas SSRF sin acceder al destino
**And** registra el motivo técnico sin exponer detalles sensibles al cliente.

**Given** la obtención remota
**When** procesa redirecciones o contenido
**Then** aplica límites de tiempo, tamaño, protocolo y cantidad de redirecciones
**And** nunca ejecuta contenido remoto dentro del backend.

### Story 1.8: Buscar y filtrar la biblioteca

Como autor,
quiero encontrar Recursos por nombre, tipo y Carpeta,
para recuperar rápidamente una fuente aunque mi Biblioteca crezca.

**Requirements:** FR-5; NFR-3, NFR-19, NFR-20.

**Acceptance Criteria:**

**Given** Recursos existentes
**When** el autor introduce un término de búsqueda
**Then** Theke devuelve coincidencias por nombre dentro de su cuenta
**And** comunica que no hay resultados cuando corresponda sin confundirlo con una Biblioteca vacía.

**Given** filtros de tipo, Proyecto o Carpeta
**When** el autor los aplica o combina
**Then** la lista muestra únicamente Recursos que cumplen todos los criterios activos
**And** presenta los filtros de forma visible y permite limpiarlos individualmente o en conjunto.

**Given** más resultados que el límite de página
**When** el autor avanza, retrocede o carga más
**Then** Theke usa un cursor estable y no repite ni omite Recursos
**And** conserva búsqueda, filtros y posición razonable al abrir y regresar desde un detalle.

**Given** una consulta en curso o fallida
**When** cambia el estado
**Then** la interfaz diferencia carga, resultados anteriores, error recuperable y ausencia de coincidencias
**And** anuncia el número de resultados sin interrumpir innecesariamente al lector de pantalla.

**Given** el campo y los filtros de búsqueda
**When** el autor usa teclado
**Then** puede recorrer, activar y retirar filtros y abrir un resultado
**And** ninguna acción depende de hover, arrastre o clic derecho.

### Story 1.9: Archivar o eliminar con impacto visible

Como autor,
quiero conocer las consecuencias antes de archivar o eliminar conocimiento global,
para evitar perder trabajo reutilizado en otros contextos.

**Requirements:** FR-2, FR-23; NFR-6, NFR-7, NFR-19.

**Acceptance Criteria:**

**Given** un Recurso, una Carpeta o un Proyecto
**When** el autor solicita archivarlo o eliminarlo
**Then** Theke calcula en el servidor sus usos y entidades afectadas dentro de la cuenta
**And** muestra un resumen específico antes de ejecutar la operación.

**Given** un Recurso que todavía posee referencias activas
**When** el autor solicita eliminarlo
**Then** Theke recomienda archivarlo y explica dónde seguirá apareciendo o qué dejaría de funcionar
**And** no ejecuta la eliminación definitiva mediante una confirmación genérica o accidental.

**Given** una operación destructiva habilitada por la política vigente
**When** el autor confirma escribiendo o seleccionando la confirmación requerida
**Then** la API vuelve a comprobar permisos e impacto dentro de la transacción
**And** ejecuta una sola vez la acción aunque el cliente reintente.

**Given** que el impacto cambió desde que se abrió el diálogo
**When** llega la confirmación
**Then** Theke detiene la operación y muestra el impacto actualizado
**And** exige una nueva confirmación informada.

**Given** que el autor elimina un Proyecto
**When** la operación termina
**Then** desaparecen su organización y datos locales conforme a la política de retención
**And** los Recursos canónicos reutilizados por otros Proyectos permanecen intactos.

**Given** un Recurso archivado
**When** se consulta desde un uso existente
**Then** Theke conserva su identidad y comunica su estado sin crear una copia
**And** permite restaurarlo si la política de retención todavía lo admite.

**Given** cualquier diálogo de impacto
**When** se usa con teclado o lector de pantalla
**Then** anuncia entidad, alcance, consecuencias y acción irreversible, mantiene el foco contenido y lo restaura al cerrar
**And** distingue con lenguaje explícito archivar, quitar una referencia y eliminar el Recurso canónico.

**Given** que Theke se prepara para un piloto externo
**When** se habilita persistencia productiva
**Then** habilita snapshots diarios y PITR disponible de Railway y ejecuta cada noche un pg_dump y una copia incremental de objetos hacia Backblaze B2 con Object Lock de 30 días
**And** están documentadas y aprobadas las políticas de retención, exportación, borrado definitivo y eliminación de cuenta.

**Given** el objetivo de recuperación del piloto
**When** ocurre una pérdida de datos o falla el proveedor primario
**Then** el runbook persigue RPO de 24 horas y RTO de 4 horas
**And** un restore drill mensual verifica PostgreSQL, objetos y referencias cruzadas en un entorno aislado.

**Given** la política inicial de ciclo de vida
**When** el autor solicita borrar contenido o su cuenta
**Then** Theke mantiene una ventana recuperable de 30 días antes del purgado definitivo y conserva Compartidos revocados con sus comentarios durante 90 días para el autor
**And** ofrece antes un export ZIP con manifiesto JSON, notas Markdown y archivos originales que le pertenezcan.

**Given** datos incluidos en backups inmutables
**When** vence la retención primaria o se confirma un borrado
**Then** desaparecen de los sistemas activos según la política y expiran de backups dentro de 30 días sin restaurarse al servicio ordinario
**And** cualquier restauración operativa reaplica la lista de borrados pendientes antes de reabrir acceso.

## Epic 2: Diagramas visuales persistentes

El autor puede convertir Recursos de su Biblioteca en Diagramas interactivos, persistentes y personalizables mediante tarjetas, Carpetas, Grupos y Anotaciones visuales.

### Story 2.1: Crear y administrar diagramas en el editor

Como autor,
quiero crear, abrir, renombrar, duplicar, archivar y eliminar Diagramas,
para mantener distintas visualizaciones de un tema dentro de un Proyecto.

**Requirements:** FR-10; NFR-7, NFR-19, NFR-21.

**Acceptance Criteria:**

**Given** un Proyecto sin Diagramas
**When** el autor abre su espacio de trabajo
**Then** Theke muestra un estado vacío con una acción visible para crear un Diagrama de grafo
**And** explica brevemente qué puede incorporar al Canvas.

**Given** un nombre válido
**When** el autor crea un Diagrama
**Then** Theke lo asocia al Proyecto, abre un Canvas vacío y conserva una identidad estable
**And** lo muestra en la navegación del Proyecto.

**Given** un Diagrama existente
**When** el autor lo renombra o duplica
**Then** el cambio se refleja en la navegación y la copia obtiene identidad propia con la misma composición inicial
**And** ninguna de las dos operaciones duplica Recursos canónicos.

**Given** que el autor solicita archivar o eliminar un Diagrama
**When** confirma después de revisar el impacto
**Then** Theke aplica la operación elegida sin eliminar los Recursos canónicos representados
**And** informa el impacto calculable con las capacidades existentes antes de ejecutar la eliminación.

**Given** el editor de escritorio
**When** se renderiza en ancho suficiente
**Then** presenta header de 40 px, franja de herramientas de 40 px, panel izquierdo de 224 px, Canvas central y panel derecho de 304 px
**And** permite colapsar los paneles sin perder el estado del Diagrama.

**Given** el shell visual
**When** cambia entre tema oscuro, claro o del sistema
**Then** usa tokens semánticos persistidos por dispositivo, densidad basada en 4 px y tipografía licenciada o su fallback local
**And** aplica transparencia solo a superficies temporales con fallback opaco accesible.

### Story 2.2: Guardar y recuperar la composición del Canvas

Como autor,
quiero que mis cambios visuales se guarden automáticamente y puedan recuperarse,
para continuar trabajando sin perder la composición del Diagrama.

**Requirements:** FR-11; NFR-4, NFR-6.

**Acceptance Criteria:**

**Given** cambios en Representaciones, posiciones, tamaños, estilos, Grupos o Anotaciones
**When** el autor deja de interactuar durante el intervalo de guardado
**Then** Theke envía el documento completo del Canvas con versión de esquema, revisión esperada e idempotency key
**And** muestra el estado Guardando hasta recibir confirmación remota.

**Given** una respuesta de guardado correcta
**When** el servidor confirma la nueva revisión
**Then** la interfaz muestra Guardado dentro del objetivo normal de dos segundos
**And** elimina del journal local únicamente las operaciones confirmadas.

**Given** pérdida de red o cierre antes de confirmar
**When** el autor vuelve a abrir el mismo Diagrama
**Then** Theke recupera el último documento remoto y detecta cambios pendientes en IndexedDB
**And** permite restaurarlos o descartarlos sin aplicarlos silenciosamente.

**Given** que la revisión remota cambió desde la última lectura
**When** el cliente intenta guardar una revisión antigua
**Then** el servidor rechaza la sobrescritura con un conflicto explícito
**And** el editor conserva ambas versiones necesarias y ofrece recargar o recuperar los cambios locales.

**Given** un reintento con la misma idempotency key
**When** el servidor ya procesó la operación
**Then** devuelve el mismo resultado sin crear una revisión adicional
**And** conserva una secuencia de revisiones auditable.

**Given** un documento con una versión anterior soportada
**When** el editor lo abre
**Then** aplica una migración determinista hacia el esquema actual
**And** nunca guarda un documento parcialmente migrado si la conversión falla.

### Story 2.3: Añadir recursos existentes al Canvas

Como autor,
quiero incorporar Recursos de mi Biblioteca mediante controles visibles, teclado o arrastre,
para construir el Diagrama de la forma que me resulte más natural.

**Requirements:** FR-12; NFR-19, NFR-20.

**Acceptance Criteria:**

**Given** un Canvas vacío
**When** el autor selecciona Añadir recurso
**Then** Theke abre un selector buscable de la Biblioteca del Proyecto y global
**And** diferencia Recursos ya usados de los todavía no representados.

**Given** un Recurso seleccionado desde el selector
**When** el autor confirma una posición o acepta la ubicación propuesta
**Then** Theke crea una Representación local que referencia el Recurso canónico
**And** evita solaparla con elementos cercanos siempre que exista espacio disponible.

**Given** un Recurso visible en el panel de Biblioteca
**When** el autor lo arrastra sobre el Canvas
**Then** obtiene la misma Representación que mediante el selector en la coordenada soltada
**And** cancelar o soltar fuera de una zona válida no modifica el Diagrama.

**Given** que el Recurso ya posee una Representación en el Diagrama
**When** el autor intenta añadirlo otra vez
**Then** Theke informa del uso existente y permite navegar hasta él
**And** solo crea otra Representación si la política del Diagrama lo permite y el autor lo confirma.

**Given** que el menú contextual está disponible
**When** se abre sobre el Canvas
**Then** ofrece Añadir como atajo
**And** las mismas capacidades permanecen accesibles mediante Canvas Toolbar, Add Menu y teclado.

### Story 2.4: Cargar archivos directamente sobre el Canvas

Como autor,
quiero soltar uno o varios archivos sobre el Canvas,
para crear sus Recursos y Representaciones en una sola operación comprensible.

**Requirements:** FR-13; NFR-4, NFR-12, NFR-20.

**Acceptance Criteria:**

**Given** archivos externos admitidos
**When** el autor los suelta sobre el Canvas
**Then** Theke inicia el mismo pipeline seguro de carga de la Biblioteca y crea una entrada de lote
**And** no crea una Relación implícita entre los archivos.

**Given** una carga individual completada
**When** el Recurso queda activo
**Then** Theke crea su Representación cerca del punto de entrega
**And** conserva el vínculo canónico con la Biblioteca.

**Given** una carga múltiple completada total o parcialmente
**When** se crean las Representaciones exitosas
**Then** Theke las distribuye sin solapamiento y mantiene seleccionadas las Representaciones creadas
**And** mantiene visibles en el tray los archivos fallidos con opción de reintentar.

**Given** que el autor deshace la incorporación visual
**When** ejecuta Deshacer
**Then** elimina del Diagrama las Representaciones y el Grupo creados
**And** explica que los Recursos cargados permanecen en la Biblioteca para evitar una eliminación global accidental.

**Given** que se usa teclado o selector de archivos
**When** el autor elige Cargar en el Canvas
**Then** puede indicar una ubicación inicial sin arrastrar
**And** recibe los mismos estados y resultados que en drop.

### Story 2.5: Interactuar con tarjetas de recursos en el Canvas

Como autor,
quiero reconocer y abrir cada Recurso desde su tarjeta visual,
para explorar información sin perder mi contexto en el Diagrama.

**Requirements:** FR-14, FR-19, FR-20; NFR-3, NFR-6, NFR-19.

**Acceptance Criteria:**

**Given** una Representación de nota, imagen, video, audio, documento, enlace o archivo genérico
**When** se renderiza en el Canvas
**Then** usa el tipo de nodo y componente coherentes con su discriminador y muestra icono, nombre, tipo y acción primaria
**And** obtiene los datos canónicos mediante resourceId sin duplicarlos en el documento visual.

**Given** una tarjeta seleccionada
**When** el autor abre su detalle
**Then** el panel contextual muestra metadatos globales y propiedades locales en secciones claramente diferenciadas
**And** editar una propiedad local no modifica el Recurso canónico.

**Given** una acción compatible de previsualización, reproducción, apertura o descarga
**When** el autor la activa
**Then** Theke ejecuta la experiencia definida para el tipo sin iniciar un drag involuntario
**And** los controles internos están marcados como nodrag y, cuando corresponde, nopan.

**Given** que el contenido o los metadatos canónicos cambian
**When** el Diagrama vuelve a resolver el Recurso
**Then** todas sus Representaciones muestran la versión vigente
**And** mantienen posición, tamaño, estilo y visibilidad locales.

**Given** una vista previa no disponible o fallida
**When** el autor abre la tarjeta
**Then** conserva acceso al detalle, metadatos y original
**And** el error de un nodo no impide interactuar con el resto del Canvas.

### Story 2.6: Representar carpetas sin desplegar todos sus recursos

Como autor,
quiero añadir una Carpeta como acceso compacto al Diagrama,
para navegar colecciones grandes sin saturar el Canvas.

**Requirements:** FR-15; NFR-3, NFR-19, NFR-20.

**Acceptance Criteria:**

**Given** una Carpeta de Proyecto
**When** el autor la añade al Canvas
**Then** Theke crea una Folder Card con nombre, cantidad y contexto
**And** no crea automáticamente Representaciones para sus Recursos.

**Given** una Folder Card
**When** el autor la abre
**Then** un panel o selector lista sus Recursos con búsqueda y carga progresiva
**And** permite añadir elementos individuales al Canvas.

**Given** que cambia el contenido o nombre de la Carpeta
**When** el Diagrama se actualiza
**Then** la tarjeta refleja nombre y cantidad vigentes
**And** conserva sus propiedades de Representación local.

**Given** que la Carpeta se archiva o deja de pertenecer al Proyecto
**When** el autor abre la tarjeta
**Then** Theke comunica su estado y ofrece una acción válida
**And** no sustituye silenciosamente la Carpeta por sus Recursos.

**Given** una Folder Card enfocada
**When** se usa teclado
**Then** puede abrirse, inspeccionarse y usarse para añadir un Recurso
**And** se distingue semánticamente de un Grupo visual.

### Story 2.7: Agrupar representaciones visualmente

Como autor,
quiero agrupar Representaciones y moverlas como un conjunto local,
para expresar una organización visual sin alterar Carpetas ni crear conocimiento global.

**Requirements:** FR-16; NFR-1, NFR-6, NFR-20.

**Acceptance Criteria:**

**Given** una selección de Representaciones
**When** el autor crea un Grupo
**Then** Theke crea un nodo de tipo container, mueve los elementos dentro y conserva sus posiciones absolutas percibidas
**And** coloca cada hijo después de su padre en el arreglo de nodos.

**Given** una Representación soltada sobre un container válido
**When** termina el drag
**Then** Theke obtiene su posición absoluta reciente, la convierte a coordenadas relativas y asigna parentId con expandParent
**And** no usa una mutación de colisión dentro de onNodesChange.

**Given** un Group Frame
**When** el autor lo nombra, mueve o redimensiona
**Then** los hijos permanecen vinculados y el título se mantiene fuera del área de contenido mediante su disposición prevista
**And** los handles no quedan recortados por el panel interior.

**Given** un Grupo seleccionado
**When** el autor añade, retira o desagrupa miembros mediante el panel contextual
**Then** Theke ofrece una alternativa completa al arrastre
**And** las coordenadas visuales permanecen estables durante la operación.

**Given** el redimensionamiento de un container
**When** cambia a 60 FPS
**Then** no existe transition-all ni interpolación que compita con React Flow
**And** solo se aplican transiciones específicas de color u opacidad.

**Given** una carga múltiple previa que creó varias Representaciones
**When** termina correctamente la incorporación al Canvas
**Then** Theke mantiene seleccionadas las Representaciones exitosas y ofrece la acción Crear grupo visual
**And** solo crea el Grupo si el autor activa esa acción; nunca agrupa automáticamente ni crea Relaciones implícitas.

### Story 2.8: Añadir anotaciones y trazos no semánticos

Como autor,
quiero añadir texto decorativo, formas y líneas libres,
para separar, señalar o explicar visualmente sin crear Recursos ni Relaciones.

**Requirements:** FR-17; NFR-4, NFR-19, NFR-20.

**Acceptance Criteria:**

**Given** el Add Menu o la Canvas Toolbar
**When** el autor elige texto, forma o línea
**Then** Theke crea una Anotación perteneciente únicamente al Diagrama
**And** la presenta con apariencia y nombre accesible distintos de un Recurso o Relación.

**Given** una anotación de texto
**When** el autor la edita
**Then** puede cambiar contenido, tamaño, alineación y color localmente
**And** el texto no aparece en la Biblioteca canónica.

**Given** una forma o línea libre
**When** el autor modifica geometría, grosor, estilo o color
**Then** el Canvas persiste los cambios como presentación local
**And** la línea no adquiere handles ni comportamiento de Relación.

**Given** una anotación seleccionada
**When** el autor la mueve, duplica, elimina, deshace o rehace
**Then** la operación afecta solo al Diagrama actual
**And** el historial restaura un estado coherente.

**Given** el editor operado por teclado
**When** el autor usa Añadir y el panel contextual
**Then** puede crear y configurar cada anotación sin dibujar con precisión de puntero
**And** la vista semántica la identifica como anotación visual.

### Story 2.9: Personalizar representaciones y fondo

Como autor,
quiero cambiar la presentación local de elementos y del fondo,
para adaptar el Diagrama a la estructura visual del tema sin modificar los Recursos.

**Requirements:** FR-18, FR-20; NFR-1, NFR-4, NFR-19.

**Acceptance Criteria:**

**Given** una Representación seleccionada
**When** el autor cambia tamaño, estilo, color o visibilidad
**Then** Theke guarda el valor en el documento del Diagrama
**And** ninguna otra Representación del mismo Recurso cambia.

**Given** el fondo del Diagrama
**When** el autor elige un color o variante admitida
**Then** el Canvas actualiza la superficie manteniendo contraste suficiente para nodos, conexiones, foco y controles
**And** el cambio no altera el tema general de la aplicación.

**Given** un color semántico
**When** se aplica a un elemento
**Then** su significado no depende exclusivamente del color y permanece legible en tema claro, oscuro y alto contraste
**And** Theke usa tokens de la paleta definida, no valores aislados inconsistentes.

**Given** un usuario con movimiento reducido
**When** selecciona, abre paneles o cambia estilo
**Then** Theke elimina movimiento no esencial y evita interpolar posiciones espaciales
**And** conserva retroalimentación inmediata mediante estados estáticos.

**Given** cualquier nodo con NodeResizer
**When** se redimensiona
**Then** responde directamente al puntero o teclado sin transition-all
**And** el cambio final queda disponible para deshacer y guardar.

### Story 2.10: Recorrer y editar el diagrama sin depender del espacio visual

Como autor,
quiero una vista semántica y comandos de teclado sincronizados con el Canvas,
para comprender y operar el Diagrama aunque no pueda usar gestos espaciales precisos.

**Requirements:** FR-12, FR-14, FR-15, FR-16, FR-17, FR-20; NFR-1, NFR-19, NFR-20.

**Acceptance Criteria:**

**Given** un Diagrama con Recursos, Carpetas, Grupos y Anotaciones
**When** el autor abre la Vista semántica
**Then** Theke presenta una estructura navegable con nombres, tipos, agrupación y orden estable
**And** mantiene la selección sincronizada con el elemento correspondiente del Canvas.

**Given** un elemento seleccionado en la Vista semántica
**When** el autor activa mover, añadir a Grupo, quitar, abrir detalle o eliminar Representación
**Then** ejecuta la misma operación de dominio que la interacción espacial
**And** ofrece deshacer cuando corresponde.

**Given** el Canvas enfocado
**When** el autor navega y selecciona mediante teclado
**Then** puede recorrer elementos, abrir el panel contextual y ejecutar acciones esenciales
**And** no necesita clic derecho, hover ni drag.

**Given** cambios realizados en cualquiera de las dos vistas
**When** se confirma la mutación
**Then** Canvas y Vista semántica reflejan el mismo documento
**And** el foco se conserva o se traslada de forma predecible al elemento afectado.

**Given** 200 Representaciones y 300 conexiones en el escenario de referencia
**When** el autor navega, selecciona, hace pan o zoom
**Then** la interacción mantiene el objetivo de fluidez medido para hardware de gama media
**And** Biblioteca, paneles y elementos fuera de vista usan carga o renderizado progresivo.

## Epic 3: Relaciones de conocimiento explicadas

El autor puede expresar conexiones semánticas entre Recursos con dirección, tipo, explicación, evidencia y procedencia, y reutilizarlas selectivamente en otros Diagramas.

### Story 3.1: Crear una relación semántica entre recursos

Como autor,
quiero conectar dos Recursos mediante una Relación dirigida o no dirigida,
para expresar qué vínculo de conocimiento existe entre ellos.

**Requirements:** FR-21; NFR-6, NFR-19, NFR-20.

**Acceptance Criteria:**

**Given** dos Representaciones que referencian Recursos de la misma cuenta
**When** el autor completa una conexión y elige su dirección y tipo
**Then** Theke crea una Relación canónica entre ambos Recursos y una visualización local en el Diagrama
**And** conserva identidades separadas para la Relación y su visualización.

**Given** que uno de los extremos es una Carpeta, Grupo o Anotación
**When** el autor intenta crear la conexión semántica
**Then** Theke impide la operación y explica que las Relaciones del MVP solo conectan Recursos
**And** ofrece una alternativa visual cuando resulte aplicable.

**Given** los tipos comunes disponibles
**When** el autor selecciona uno
**Then** Theke guarda un identificador estable y una etiqueta legible
**And** permite distinguir claramente una conexión dirigida de una no dirigida.

**Given** que ningún tipo común describe el vínculo
**When** el autor crea un tipo personalizado válido
**Then** Theke crea un RelationType canónico de la Cuenta con originProjectId y lo incorpora al catálogo del Proyecto actual
**And** no lo muestra en catálogos de otros Proyectos hasta que una acción explícita lo reutilice allí.

**Given** una Relación equivalente ya existente entre los mismos Recursos
**When** el autor intenta crear otra con el mismo tipo y dirección
**Then** Theke informa de la coincidencia y permite mostrar la existente
**And** evita duplicarla salvo que exista una diferencia semántica explícita admitida.

**Given** que el autor no puede o no desea arrastrar entre handles
**When** usa el Add Menu, panel contextual o Vista semántica
**Then** puede elegir origen, destino, dirección y tipo mediante controles accesibles
**And** obtiene el mismo resultado canónico y visual.

### Story 3.2: Explicar y documentar una relación

Como autor,
quiero añadir etiqueta, explicación, evidencia y procedencia a una Relación,
para recordar por qué considero válido el vínculo.

**Requirements:** FR-21; NFR-4, NFR-6.

**Acceptance Criteria:**

**Given** una Relación seleccionada
**When** el autor abre Relation Editor
**Then** ve extremos, dirección, tipo, etiqueta, explicación, evidencia y procedencia
**And** distingue propiedades canónicas de estilo o visibilidad local.

**Given** una edición válida de los datos canónicos
**When** el autor guarda
**Then** todas las visualizaciones de esa Relación resuelven la información actualizada
**And** la API registra autor y fecha del cambio sin duplicar la Relación.

**Given** que el autor cita evidencia ya presente en su Biblioteca
**When** la asocia a la Relación
**Then** Theke conserva la identidad del Recurso citado y el fragmento o nota explicativa disponible
**And** comprueba que la evidencia pertenece a la misma cuenta.

**Given** que la evidencia es insuficiente o todavía debe buscarse
**When** el autor guarda la explicación
**Then** puede marcar explícitamente esa carencia sin inventar una cita
**And** la interfaz la diferencia de evidencia confirmada.

**Given** una modificación fallida o concurrente
**When** la API detecta error o revisión incompatible
**Then** Theke conserva la edición local y muestra el conflicto
**And** no sobrescribe silenciosamente el contenido más reciente.

### Story 3.3: Explorar relaciones en el Canvas y la vista semántica

Como autor,
quiero reconocer, seleccionar y recorrer Relaciones de forma visual y estructurada,
para comprender las conexiones sin depender únicamente de líneas o colores.

**Requirements:** FR-21; NFR-1, NFR-19, NFR-20.

**Acceptance Criteria:**

**Given** una Relación visible
**When** se renderiza en el Canvas
**Then** muestra dirección cuando aplica, tipo o etiqueta legible y estados diferenciados de foco, selección y hover
**And** ningún significado depende exclusivamente del color.

**Given** una Relación seleccionada
**When** el autor abre su detalle
**Then** el panel contextual permite leer la explicación, evidencia y procedencia
**And** ofrece navegar a cualquiera de sus Recursos extremos.

**Given** múltiples conexiones cercanas
**When** el autor hace zoom, pan o selecciona una conexión
**Then** Theke mantiene una zona interactiva razonable sin alterar la geometría semántica
**And** evita que etiquetas y líneas bloqueen los controles de los nodos.

**Given** la Vista semántica
**When** el autor recorre un Recurso
**Then** puede expandir Relaciones entrantes y salientes con tipo, dirección y destino
**And** seleccionar una centra el mismo vínculo en el Canvas.

**Given** operación mediante teclado o lector de pantalla
**When** el autor navega por las Relaciones
**Then** cada una anuncia origen, destino, dirección, tipo y estado de evidencia
**And** permite abrir y editar sin apuntar a una línea.

### Story 3.4: Reutilizar y gestionar relaciones existentes

Como autor,
quiero decidir si una Relación existente aparece en otro Diagrama,
para reutilizar conocimiento sin imponer la misma composición visual en todos lados.

**Requirements:** FR-22, FR-23; NFR-6, NFR-7.

**Acceptance Criteria:**

**Given** dos Recursos relacionados que están representados en otro Diagrama
**When** el segundo Recurso se incorpora o el Diagrama se revisa
**Then** Theke informa que existe una Relación canónica entre ellos
**And** no la muestra automáticamente sin decisión del autor.

**Given** una Relación existente sugerida para el Diagrama
**When** el autor selecciona Mostrar aquí
**Then** Theke crea únicamente su visualización local
**And** conserva explicación, evidencia, dirección y procedencia canónicas.

**Given** una visualización de Relación
**When** el autor elige Ocultar o Quitar del Diagrama
**Then** desaparece solo de ese Diagrama
**And** la Relación canónica y sus visualizaciones en otros Diagramas permanecen intactas.

**Given** que el autor solicita archivar o eliminar la Relación canónica
**When** Theke calcula sus usos
**Then** muestra todos los Diagramas y contextos afectados y recomienda archivar cuando corresponda
**And** exige una confirmación informada antes de la operación global.

**Given** que los usos cambian antes de confirmar
**When** llega la solicitud destructiva
**Then** la API rechaza el impacto obsoleto y devuelve el inventario actualizado
**And** ninguna visualización queda apuntando silenciosamente a una identidad inexistente.

### Story 3.5: Estructurar metadatos y enlaces de conocimiento

Como autor,
quiero describir Recursos con propiedades y conectar notas mediante enlaces navegables,
para explorar el conocimiento y ofrecer contexto verificable a la futura asistencia de IA.

**Requirements:** ampliación solicitada de FR-7, FR-21, FR-22 y preparación de FR-25 a FR-31; NFR-5, NFR-6, NFR-7, NFR-14, NFR-19.

**Acceptance Criteria:**

**Given** un Recurso de cualquier tipo
**When** el autor edita alias, etiquetas y propiedades
**Then** Theke valida tipos texto, lista, número, casilla, fecha y fecha y hora y mantiene un tipo consistente por nombre de propiedad en la Cuenta
**And** permite buscar por alias o contenido de nota y filtrar por etiqueta.

**Given** una nota con enlaces `[[Título]]`, `[[Título#sección|texto]]` o `[[resource:UUID|texto]]`
**When** se guarda una nueva versión
**Then** Theke indexa las menciones con posición y versión, resuelve el destino único dentro de la Cuenta y muestra enlaces salientes y referencias entrantes de versiones actuales
**And** informa enlaces sin resolver o ambiguos sin crear una Relación semántica automáticamente.

**Given** un destino renombrado o un alias que se vuelve ambiguo
**When** el autor edita la nota
**Then** los enlaces ya resueltos conservan su identidad mientras el destino siga disponible
**And** el selector inserta enlaces por identificador estable para nuevas referencias.

**Given** evidencia de una Relación
**When** el autor cita un Recurso
**Then** la cita conserva la versión del contenido y, cuando corresponde, el fragmento exacto, su posición o la página
**And** la API comprueba que la versión y la posición pertenecen al Recurso citado.

**Given** una futura solicitud de análisis de IA
**When** se construya su alcance
**Then** estas propiedades, enlaces y citas podrán aportar contexto con identidad y procedencia explícitas
**And** ninguna mención se tratará por sí sola como afirmación semántica confirmada.

## Epic 4: Guía de IA bajo control humano

El autor puede recibir sugerencias fundamentadas sobre Relaciones, Grupos y vacíos sin entregar a la IA el control de su conocimiento ni perder el flujo manual.

### Story 4.1: Activar IA con consentimiento y alcance explícitos

Como autor,
quiero saber cómo se usarán mis datos y controlar qué Recursos analiza la IA,
para decidir conscientemente si utilizo la asistencia.

**Requirements:** FR-24, FR-25; NFR-5, NFR-14, NFR-15, NFR-16, NFR-18.

**Acceptance Criteria:**

**Given** que el autor nunca aceptó las condiciones de IA vigentes
**When** solicita su primer análisis
**Then** Theke informa que el baseline usa OpenAI Responses con gpt-5.6-terra, finalidad, retención, uso para entrenamiento y tratamiento del contenido privado
**And** no envía ningún Recurso hasta recibir consentimiento explícito.

**Given** una ejecución de IA del piloto
**When** el backend llama al proveedor
**Then** usa Responses API con store:false, reasoning effort medium, sin Conversations, Files, File Search ni herramientas web del proveedor
**And** envía solo el texto y las imágenes exactas del alcance autorizado, informa que los logs de abuso del proveedor pueden conservar contenido hasta 30 días y no habilita entrenamiento voluntario.

**Given** las cuotas iniciales de IA
**When** una ejecución superaría 50.000 tokens de entrada, 4.000 de salida, 10 ejecuciones diarias o USD 5 mensuales para la Cuenta
**Then** Theke no envía la solicitud y explica cuál límite se alcanzó
**And** mantiene disponible la alternativa manual y permite ajustar los límites mediante configuración versionada.

**Given** que cambia materialmente el proveedor o una condición informada
**When** el autor vuelve a solicitar IA
**Then** Theke invalida el consentimiento anterior para ese uso y presenta las nuevas condiciones
**And** mantiene disponibles todas las funciones manuales mientras decide.

**Given** una acción sobre dos Recursos o una selección
**When** se prepara el análisis
**Then** AI Guidance Card enumera exactamente los Recursos incluidos y limita el alcance a ellos por defecto
**And** ampliar el alcance requiere seleccionar o autorizar fuentes adicionales.

**Given** un Recurso o selección que excede límites de formato, tamaño o contexto
**When** el autor intenta analizarla
**Then** Theke informa el límite y qué contenido no puede incluir antes de ejecutar
**And** nunca omite silenciosamente páginas, fragmentos o Recursos.

**Given** que la IA está desactivada, no configurada, sin cuota o temporalmente indisponible
**When** el autor llega a una acción asistida
**Then** Theke explica el estado sin bloquear ni esconder la acción manual equivalente
**And** no elimina ni altera conocimiento creado previamente.

**Given** la configuración de IA
**When** el autor la desactiva
**Then** cesan nuevos análisis y se mantiene el acceso a procedencia y decisiones ya registradas
**And** Recursos, Diagramas y Relaciones manuales continúan operativos.

### Story 4.2: Recibir y decidir sugerencias para relaciones

Como autor,
quiero recibir sugerencias explicadas al crear o revisar una Relación,
para mejorar mi razonamiento sin aceptar automáticamente una conclusión de la IA.

**Requirements:** FR-26, FR-29, FR-30, FR-31; NFR-5, NFR-16, NFR-17.

**Acceptance Criteria:**

**Given** dos Recursos dentro del alcance autorizado
**When** el autor solicita ayuda para relacionarlos
**Then** Theke puede proponer tipo, dirección, etiqueta, explicación y evidencia ya presente en la Biblioteca
**And** separa visualmente evidencia citada, inferencia y carencia que el autor debe investigar.

**Given** que falta sustento suficiente
**When** la IA formula el resultado
**Then** presenta una necesidad de búsqueda o una incertidumbre en vez de inventar una cita
**And** no busca ni importa fuentes externas autónomamente en el MVP.

**Given** una sugerencia recibida de forma incremental
**When** el backend transmite progreso o contenido
**Then** usa sobres SSE versionados sobre una solicitud fetch autenticada
**And** un corte conserva la Relación manual y permite reintentar sin duplicar resultados.

**Given** una sugerencia completa
**When** el autor la revisa
**Then** AI Guidance Card muestra acción propuesta, fundamento, Recursos usados, alcance, límites y datos de procedencia
**And** ofrece Editar, Aceptar, Descartar e Informar error con foco y nombres accesibles.

**Given** que el autor acepta o edita y acepta
**When** confirma la acción final
**Then** Theke ejecuta un comando explícito que crea o modifica la Relación
**And** registra proveedor, modelo, fecha, insumos, resultado original, edición humana y evidencia asociada.

**Given** que el autor descarta o informa una sugerencia incorrecta
**When** confirma esa decisión
**Then** ningún conocimiento canónico cambia
**And** Theke conserva únicamente el evento de auditoría y el reporte necesarios conforme a la política informada.

### Story 4.3: Recibir orientación al organizar grupos

Como autor,
quiero pedir sugerencias sobre el contenido de un Grupo,
para detectar un tema común, elementos atípicos o Recursos relacionados sin delegar su organización.

**Requirements:** FR-27, FR-29, FR-30; NFR-5, NFR-17.

**Acceptance Criteria:**

**Given** un Grupo con Representaciones de Recursos
**When** el autor solicita orientación
**Then** Theke muestra el alcance exacto y puede sugerir un nombre o tema fundamentado en esos Recursos
**And** no incluye automáticamente Recursos fuera del Grupo.

**Given** un elemento que parece atípico
**When** la IA lo señala
**Then** explica la comparación que motivó la observación y su nivel de incertidumbre
**And** no lo mueve ni lo elimina sin una acción posterior del autor.

**Given** Recursos relacionados disponibles en la Biblioteca
**When** la IA propone considerarlos
**Then** identifica los Recursos canónicos y explica por qué podrían ser pertinentes
**And** permite abrirlos o añadirlos mediante los flujos manuales existentes.

**Given** una propuesta de nombre o reorganización
**When** el autor la edita, acepta o descarta
**Then** solo la aceptación confirmada modifica propiedades locales del Grupo
**And** la acción no crea Carpetas, Relaciones ni cambios canónicos implícitos.

**Given** que falla o se interrumpe el análisis
**When** termina el intento
**Then** el Grupo mantiene exactamente su estado manual anterior
**And** Theke ofrece reintentar o continuar organizándolo sin IA.

### Story 4.4: Revisar una selección o un diagrama bajo demanda

Como autor,
quiero solicitar una revisión de mi selección o Diagrama,
para descubrir vacíos, duplicados, contradicciones y Recursos aislados que debo evaluar.

**Requirements:** FR-28, FR-29, FR-30, FR-31; NFR-5, NFR-16, NFR-17.

**Acceptance Criteria:**

**Given** una selección o Diagrama dentro de los límites informados
**When** el autor solicita Revisar
**Then** Theke enumera el alcance y analiza únicamente los Recursos autorizados y sus Relaciones disponibles
**And** no modifica la composición durante el análisis.

**Given** resultados de revisión
**When** se presentan
**Then** cada hallazgo se clasifica como posible vacío, duplicado, contradicción o aislamiento y muestra fundamento y fuentes implicadas
**And** se expresa como sugerencia o pregunta, no como hecho cuando depende de inferencia.

**Given** un hallazgo accionable
**When** el autor lo selecciona
**Then** puede navegar a los elementos, investigar manualmente, iniciar una Relación o reorganizar una selección
**And** cada acción requiere los mismos controles y confirmaciones que su flujo manual.

**Given** contexto incompleto o fuentes no analizables
**When** se genera la revisión
**Then** Theke identifica explícitamente las limitaciones y los Recursos excluidos
**And** no presenta el resultado como revisión exhaustiva.

**Given** que el autor informa un hallazgo incorrecto
**When** envía el reporte
**Then** puede indicar el motivo sin alterar sus Recursos
**And** queda registrada la versión exacta de la sugerencia necesaria para evaluar el problema.

**Given** que el servicio falla, agota cuota o se desactiva durante la revisión
**When** el autor vuelve al Diagrama
**Then** todo el trabajo manual permanece disponible e intacto
**And** la interfaz ofrece una lista de comprobaciones manuales equivalente como siguiente paso.

## Epic 5: Publicación y exploración interactiva

El autor puede previsualizar y publicar un Diagrama de forma segura; un visitante puede explorarlo y abrir sus Recursos sin registrarse ni editarlo.

### Story 5.1: Previsualizar exactamente lo que se publicará

Como autor,
quiero revisar la experiencia pública y el inventario de contenido expuesto,
para detectar información privada o problemas antes de compartir el Diagrama.

**Requirements:** FR-32; NFR-11, NFR-12, NFR-19.

**Acceptance Criteria:**

**Given** un Diagrama privado
**When** el autor inicia Share Wizard
**Then** Theke genera una previsualización de visitante sin activar acceso público
**And** muestra una lista exacta de Recursos, Relaciones y campos que quedarían expuestos.

**Given** un Recurso canónico usado en otros contextos pero no representado en el Diagrama
**When** se calcula el inventario
**Then** no aparece ni se serializa en la previsualización
**And** tampoco se revelan nombres de Carpetas, Proyectos o referencias privadas no incluidas.

**Given** una nota o Recurso que el autor no desea publicar
**When** lo identifica en el inventario
**Then** puede volver al editor, ocultar o retirar su Representación y recalcular la previsualización
**And** Share Wizard conserva las opciones ya elegidas cuando siguen siendo válidas.

**Given** un Recurso multimedia sin los datos mínimos de accesibilidad definidos
**When** el autor intenta avanzar
**Then** Theke identifica el Recurso y el dato faltante y ofrece corregirlo
**And** bloquea o advierte la publicación según la severidad configurada de la política.

**Given** que el inventario cambia mientras la previsualización está abierta
**When** el autor intenta publicar una revisión anterior
**Then** Theke exige recalcular y revisar las diferencias
**And** nunca publica contenido añadido después sin que aparezca en la confirmación.

### Story 5.2: Publicar mediante un enlace no listado

Como autor,
quiero generar un enlace no listado para mi Diagrama,
para compartir una experiencia interactiva sin abrir mi espacio privado.

**Requirements:** FR-33; NFR-8, NFR-9, NFR-10, NFR-11.

**Acceptance Criteria:**

**Given** una previsualización vigente y aprobada
**When** el autor confirma Publicar
**Then** la API crea atómicamente un Compartido, un token no enumerable y una proyección pública allowlist
**And** devuelve un enlace que el autor puede copiar.

**Given** un Compartido activo
**When** una persona abre el enlace sin sesión de Theke
**Then** puede acceder únicamente a la proyección pública asociada al token
**And** no recibe identificadores, metadatos ni referencias privadas no requeridos por la experiencia.

**Given** un token inexistente, alterado o revocado
**When** se solicita la Vista compartida
**Then** Theke responde con una pantalla pública neutra sin revelar si existió o quién era el autor
**And** no entrega fragmentos cacheados del contenido revocado.

**Given** una publicación repetida por reintento
**When** llega la misma clave idempotente
**Then** Theke devuelve el mismo Compartido sin crear enlaces adicionales
**And** registra la operación de forma auditable.

**Given** la respuesta pública
**When** se entrega al navegador
**Then** aplica cifrado en tránsito, políticas de caché, CSP y cabeceras seguras apropiadas
**And** los objetos se sirven mediante acceso temporal autorizado sin exponer el bucket privado.

### Story 5.3: Administrar un compartido vivo y revocable

Como autor,
quiero controlar comentarios, actualizaciones y revocación de mi Compartido,
para mantener el enlace útil sin perder control del acceso.

**Requirements:** FR-19, FR-33, FR-34; NFR-4, NFR-10, NFR-11.

**Acceptance Criteria:**

**Given** un Compartido activo
**When** el autor activa o desactiva nuevos comentarios
**Then** la configuración cambia sin modificar el enlace
**And** la Vista compartida refleja el control sin afectar comentarios ya existentes.

**Given** que cambia contenido canónico o composición incluida
**When** se confirma una nueva revisión del Diagrama
**Then** Theke reconstruye y sustituye atómicamente la proyección pública viva
**And** un visitante nunca recibe una mezcla parcial entre revisiones.

**Given** que el autor solicita revocar
**When** confirma la consecuencia en Share Wizard
**Then** el token deja de permitir nuevas lecturas sin demora perceptible
**And** el Diagrama y su historial interno permanecen intactos.

**Given** un Compartido revocado
**When** el autor vuelve a publicar el Diagrama
**Then** Theke crea un token y un hilo de comentarios nuevos
**And** conserva el historial anterior únicamente para el autor según la política de retención.

**Given** fallos durante la regeneración pública
**When** no puede completarse la nueva proyección
**Then** permanece disponible la última revisión pública íntegra o se muestra una indisponibilidad segura según la operación
**And** el autor recibe un estado y una acción de reintento sin perder cambios privados.

### Story 5.4: Explorar un diagrama público sin editarlo

Como visitante,
quiero navegar por un Diagrama compartido mediante zoom, paneo y selección,
para comprender su estructura sin alterar el trabajo del autor.

**Requirements:** FR-35; NFR-1, NFR-2, NFR-19, NFR-20, NFR-21.

**Acceptance Criteria:**

**Given** un enlace activo
**When** el visitante abre la Vista compartida
**Then** ve contenido útil dentro del objetivo de tres segundos en el escenario de referencia y conexión de banda ancha
**And** los recursos pesados se cargan únicamente bajo demanda.

**Given** el Diagrama público
**When** el visitante hace zoom, paneo o selecciona un elemento
**Then** la interacción mantiene posiciones publicadas y permite inspeccionar su información
**And** no ofrece ni acepta operaciones de edición de composición o contenido.

**Given** una Relación pública
**When** el visitante la selecciona
**Then** puede leer tipo, dirección, explicación, evidencia publicada y extremos
**And** navegar hacia los Recursos relacionados.

**Given** un dispositivo con movimiento reducido o alto contraste
**When** carga la vista
**Then** Theke elimina movimiento no esencial, mantiene foco visible y no depende exclusivamente del color
**And** utiliza superficies opacas cuando la transparencia no conserva legibilidad.

**Given** navegación solo con teclado
**When** el visitante recorre el Compartido
**Then** puede usar controles visibles, abrir la Vista semántica y seleccionar Recursos y Relaciones
**And** no necesita drag, clic derecho ni hover.

### Story 5.5: Abrir recursos públicos en cualquier dispositivo

Como visitante,
quiero consultar los Recursos incluidos desde escritorio, tablet o móvil,
para interactuar con las fuentes que sustentan el Diagrama.

**Requirements:** FR-35; NFR-2, NFR-11, NFR-19, NFR-21, NFR-22.

**Acceptance Criteria:**

**Given** un Recurso publicado
**When** el visitante abre su tarjeta
**Then** Theke muestra únicamente los metadatos y contenido autorizados por la proyección
**And** ofrece previsualizar, reproducir, abrir o descargar según tipo y dispositivo.

**Given** una capacidad no compatible o una vista previa fallida
**When** el visitante intenta usarla
**Then** el control se deshabilita con explicación o se sustituye por abrir o descargar
**And** el resto del Compartido continúa operativo.

**Given** audio, video, imagen o documento publicado
**When** el visitante lo consulta
**Then** dispone de las alternativas de accesibilidad incluidas y controles con nombres y foco visibles
**And** la carga multimedia ocurre bajo demanda.

**Given** una pantalla de 320 CSS px o mayor
**When** se abre la Vista compartida
**Then** contenido, panel de detalle y controles refluyen sin pérdida bidimensional de información esencial
**And** zoom, navegación y apertura de Recursos permanecen utilizables.

**Given** una URL temporal expirada mientras la página sigue abierta
**When** el visitante vuelve a solicitar el objeto
**Then** Theke renueva el acceso solo si el Compartido sigue activo y el Recurso continúa incluido
**And** una revocación nunca se elude reutilizando una URL anterior.

## Epic 6: Retroalimentación contextual del visitante

El visitante puede comentar puntos, Recursos y Relaciones; el autor puede recibir, localizar, resolver y moderar esa retroalimentación sin alterar el conocimiento canónico.

### Story 6.1: Adoptar una identidad anónima para comentar

Como visitante,
quiero comentar sin completar un nombre ni crear una cuenta,
para participar en un Compartido manteniendo control sobre mis propios comentarios.

**Requirements:** FR-36; NFR-9, NFR-13, NFR-19.

**Acceptance Criteria:**

**Given** un visitante sin identidad de comentario
**When** abre un Compartido activo
**Then** puede explorarlo sin identificarse
**And** se le explica que al publicar recibirá un alias científico anónimo.

**Given** un comentario válido
**When** el visitante confirma su primer comentario
**Then** Theke asigna un alias científico estable a su cookie anónima y vincula la identidad al comentario
**And** entrega una cookie Secure, HttpOnly y SameSite no renovable con vigencia de 30 días.

**Given** texto vacío, excesivo o inválido
**When** el visitante intenta publicar
**Then** Theke muestra el error asociado al comentario y conserva el borrador
**And** no crea identidad ni comentario parcial.

**Given** que la cookie anónima continúa vigente
**When** el visitante vuelve al mismo Compartido
**Then** reconoce su nombre y sus comentarios editables
**And** no obtiene permisos sobre comentarios de otras identidades o Compartidos.

**Given** que la identidad expiró o se perdió
**When** el visitante abre nuevamente el enlace
**Then** puede seguir viendo el Compartido y sus comentarios públicos
**And** no puede editar comentarios anteriores solo por repetir el mismo nombre visible.

**Given** una cookie anónima vigente y una cuenta autenticada mediante Clerk
**When** el visitante inicia sesión desde ese navegador en el Compartido
**Then** Theke vincula a la cuenta únicamente los comentarios que esa cookie creó en ese Compartido y muestra el nombre de perfil de la cuenta
**And** permite editar esos comentarios con la sesión verificada, incluso después de cerrar la sesión anónima.

**Given** un marcador de comentario visible en el Canvas
**When** recibe foco o el puntero se posa sobre él
**Then** muestra el nombre público del autor, sea alias anónimo o perfil autenticado
**And** su nombre accesible anuncia el mismo autor.

### Story 6.2: Añadir un comentario contextual

Como visitante,
quiero comentar un punto, Recurso o Relación del Diagrama,
para que mi observación conserve el contexto al que se refiere.

**Requirements:** FR-37; NFR-13, NFR-19, NFR-20, NFR-22.

**Acceptance Criteria:**

**Given** que el Compartido permite nuevos comentarios
**When** el visitante activa la herramienta visible de comentario y elige una coordenada, Recurso o Relación
**Then** Theke abre Comment Composer con el objetivo identificado
**And** ofrece la misma capacidad desde el menú contextual como atajo.

**Given** un comentario no vacío y una identidad válida
**When** el visitante lo publica
**Then** Theke crea el comentario dentro del Compartido y muestra un marcador en el contexto correcto
**And** no lo incorpora a la Biblioteca, al Recurso ni a la Relación canónica.

**Given** texto escrito pero todavía no publicado
**When** el visitante cierra accidentalmente el compositor o cambia temporalmente de vista
**Then** Theke conserva un borrador local razonable y ofrece recuperarlo
**And** permite descartarlo explícitamente.

**Given** que los comentarios están desactivados, el Compartido fue revocado o el límite de frecuencia fue superado
**When** el visitante intenta publicar
**Then** la API rechaza la operación con un estado específico y no crea el comentario
**And** la interfaz conserva el texto cuando reintentar pueda ser válido.

**Given** cualquier mutación anónima
**When** llega a la API pública
**Then** valida token del Compartido, cookie de identidad, protección CSRF y límites antiabuso
**And** registra señales de abuso sin incluir contenido privado innecesario.

**Given** los límites iniciales del piloto
**When** una identidad crea o edita comentarios
**Then** admite texto de hasta 5.000 caracteres y aplica 5 mutaciones por minuto y 30 por hora por sesión, 20 por minuto y 100 por hora por huella IP HMAC, y 100 por hora por Compartido
**And** al superar un límite responde 429 con Retry-After, conserva el borrador y permite ajustar los umbrales mediante configuración auditada.

**Given** un dispositivo móvil o navegación por teclado
**When** el visitante crea un comentario
**Then** puede seleccionar contexto desde controles y Vista semántica sin precisión de puntero
**And** el compositor mantiene controles táctiles suficientes, foco contenido y errores anunciados.

### Story 6.3: Editar comentarios propios

Como visitante,
quiero corregir mis propios comentarios mientras mi identidad esté vigente,
para aclarar lo que quise comunicar sin alterar aportes ajenos.

**Requirements:** FR-38; NFR-9, NFR-13, NFR-19.

**Acceptance Criteria:**

**Given** un comentario creado por la identidad anónima vigente
**When** el visitante selecciona Editar
**Then** Comment Composer carga el texto actual y conserva el mismo anclaje
**And** permite guardar o cancelar sin crear un comentario nuevo.

**Given** una edición válida
**When** el visitante la confirma
**Then** Theke actualiza el comentario y registra su fecha de edición
**And** el marcador y la lista muestran el texto vigente.

**Given** un comentario de otra identidad
**When** el visitante intenta editarlo desde la interfaz o API
**Then** la acción no está disponible y el servidor la rechaza
**And** no revela credenciales ni detalles de la identidad propietaria.

**Given** que la identidad expiró, el comentario fue eliminado o el Compartido dejó de aceptar mutaciones
**When** se intenta guardar una edición
**Then** Theke explica por qué no puede aplicarse y conserva el texto local para copiarlo
**And** no restaura permisos basándose únicamente en el nombre visible.

**Given** una edición concurrente desde la misma identidad
**When** la revisión ya no coincide
**Then** Theke impide sobrescribir silenciosamente y muestra el texto vigente junto al borrador
**And** permite al visitante decidir cómo continuar si todavía tiene permiso.

### Story 6.4: Recibir y localizar comentarios como autor

Como autor,
quiero recibir avisos y recorrer los comentarios en su contexto,
para revisar la retroalimentación sin buscar manualmente por todo el Diagrama.

**Requirements:** FR-39; NFR-3, NFR-6, NFR-19.

**Acceptance Criteria:**

**Given** un comentario nuevo en un Compartido activo
**When** se confirma su creación
**Then** Theke genera una notificación interna idempotente para el autor
**And** actualiza el contador de pendientes sin exigir un canal externo en el MVP.

**Given** que el autor abre una notificación
**When** el comentario conserva un anclaje válido
**Then** Theke abre el Proyecto y Diagrama correctos, centra el contexto y selecciona el marcador
**And** muestra el texto en la lista lateral.

**Given** varios comentarios
**When** el autor abre el panel de comentarios
**Then** puede paginar y filtrar por pendiente, resuelto, anclado o sin anclaje
**And** cada fila identifica autor visible, fecha, contexto y estado.

**Given** un marcador o elemento de la lista seleccionado
**When** cambia la selección
**Then** marcador, Canvas y panel lateral permanecen sincronizados
**And** el foco se mueve de forma predecible sin depender solo de color o posición.

**Given** que la entrega en tiempo real se interrumpe
**When** el autor vuelve a la aplicación o refresca
**Then** recupera notificaciones y comentarios desde la API paginada
**And** SSE actúa como invalidación, no como única fuente de verdad.

### Story 6.5: Resolver, eliminar y conservar comentarios sin anclaje

Como autor,
quiero resolver o eliminar comentarios y reconocer los que perdieron su objetivo,
para moderar el Compartido sin reescribir las palabras del visitante.

**Requirements:** FR-39, FR-40; NFR-7, NFR-11, NFR-13, NFR-19.

**Acceptance Criteria:**

**Given** un comentario pendiente
**When** el autor lo marca como resuelto
**Then** Theke conserva texto, autor, contexto disponible e historial y lo retira de pendientes
**And** permite volver a consultarlo en la vista de resueltos.

**Given** un comentario visible
**When** el autor solicita eliminarlo y confirma
**Then** desaparece del Compartido y del listado activo conforme a la política de retención
**And** la operación queda registrada para moderación sin permitir editar el texto ajeno.

**Given** que desaparece una coordenada válida, una Representación o una visualización de Relación objetivo
**When** se reconstruye el Compartido
**Then** el comentario permanece en la lista marcado como sin anclaje
**And** puede resolverse o eliminarse aunque ya no exista marcador espacial.

**Given** un comentario sin anclaje
**When** el autor lo abre
**Then** Theke muestra la última descripción de contexto segura que conserva el Compartido
**And** no vuelve a exponer contenido privado retirado para reconstruir el objetivo.

**Given** que el autor intenta modificar el texto de un visitante
**When** usa la interfaz o API
**Then** Theke no ofrece ni acepta esa operación
**And** limita sus acciones a navegar, resolver, reabrir cuando se admita o eliminar.

**Given** actividad abusiva o repetitiva
**When** supera los umbrales configurados
**Then** Theke aplica límites y herramientas básicas de moderación sin bloquear la exploración legítima del Compartido
**And** evita revelar al visitante reglas internas que faciliten evadirlas.
