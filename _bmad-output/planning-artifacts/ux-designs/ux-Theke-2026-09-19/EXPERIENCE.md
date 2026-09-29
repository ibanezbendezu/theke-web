---
name: Theke
status: draft
created: 2026-09-19
updated: 2026-09-28
sources:
  - ../../briefs/brief-Theke-2026-09-19/brief.md
  - ../../briefs/brief-Theke-2026-09-19/addendum.md
  - ../../prds/prd-Theke-2026-09-19/prd.md
  - ../../prds/prd-Theke-2026-09-19/addendum.md
  - ../../../../AGENTS.md
  - ../../../../src/app/router.tsx
  - ../../../../src/features/canvas/CanvasEditor.tsx
  - reference-led-direction-2026-09-28.md
---

# Theke — Experience Spine

> Este archivo es el contrato conductual para arquitectura, historias, implementación y futuros mocks. `DESIGN.md` gobierna identidad visual; este spine gobierna navegación, estados, interacción y flujos. Si un mock o la interfaz actual entra en conflicto, los spines ganan.

## Foundation

Theke es una aplicación web de autoría espacial, optimizada para escritorio, y una experiencia compartida adaptable a escritorio, tablet y móvil. La persona construye conocimiento manualmente mediante Recursos y Relaciones canónicas; la IA puede orientar bajo petición, pero nunca es requisito para crear, conectar, ordenar, compartir o comentar.

La interfaz utiliza una barra lateral global estable al estilo de la captura de Notion aportada por el usuario. Inicio y Proyectos muestran estructura mediante filas; el Canvas ocupa el área principal y conserva paneles contextuales cuando se necesitan. Biblioteca y las superficies para recorrer Recursos mantienen la misma barra lateral, mientras el contenido principal sigue el patrón de la captura de Drive: búsqueda, ruta, filtros, lista/cuadrícula y miniaturas. La complejidad se revela al seleccionar o invocar una acción, sin esconder la única vía detrás del hover.

Principios de experiencia:

1. **Contenido primero.** El Canvas y los Recursos dominan; el cromado permanece quieto.
2. **Manual siempre disponible.** Toda sugerencia tiene alternativa manual completa.
3. **Global y local son visibles.** Editar un Recurso o Relación canónica es distinto de modificar su Representación en un Diagrama.
4. **Consecuencias antes de confirmar.** Publicación, reemplazo, eliminación y cambios globales muestran su alcance.
5. **Ayuda en contexto.** Controles avanzados, IA y comentarios aparecen donde se necesitan.
6. **Persistencia comprensible.** `Save Status` expresa el estado remoto; nunca se promete guardado que el backend no confirmó.

El frontend actual es punto de partida, no contrato completo. Arquitectura debe definir autenticación, persistencia, archivos, publicaciones, comentarios e IA. Las invariantes de React Flow y Zustand de `AGENTS.md` son obligatorias durante implementación.

## Information Architecture

### Navegación global

| Superficie | Se alcanza desde | Propósito |
|---|---|---|
| **Inicio** | Apertura autenticada / `App Sidebar` | Trabajo reciente y continuación rápida. |
| **Proyectos** | `App Sidebar` | Temas activos y archivados; crear y administrar Proyectos. |
| **Proyecto** | `Project Card` o fila | Diagramas, Carpetas y Recursos usados en un tema. |
| **Biblioteca** | `App Sidebar` | Catálogo canónico de Recursos de la cuenta, búsqueda y filtros. |
| **Canvas** | Diagrama dentro de Proyecto | Construcción del grafo, composición y anotación. |
| **Vista compartida** | Enlace no listado | Explorar el Diagrama, abrir Recursos y comentar sin editar la composición. |
| **Cuenta y apariencia** | Menú de cuenta / `Theme Control` | Sesión, recuperación y preferencia Sistema/Claro/Oscuro. |

Explorar/Comunidad queda fuera del MVP y no aparece como destino inactivo.

### Arquitectura del Canvas

- `App Sidebar`: navegación global persistente estilo Notion, con Inicio, Proyectos, Biblioteca, búsqueda, accesos recientes y cuenta. No cambia al entrar en Biblioteca ni en un Proyecto; puede colapsarse para ampliar el Canvas.
- `Top Bar` del Diagrama: volver al Proyecto, nombre del Diagrama, `Save Status`, previsualizar/publicar y acciones propias del Diagrama, integrado en el área principal.
- Panel contextual de Biblioteca: al abrir una Carpeta desde el Canvas muestra ruta, búsqueda, conteo, filtros de tipo, lista compacta e incorporación individual o múltiple; puede colapsar sin perder contexto y no sustituye la barra global.
- Centro: Canvas de grafo, `Canvas Toolbar`, botón visible Añadir, Recursos, Carpetas, Grupos, Relaciones y Anotaciones.
- Panel derecho: `Context Panel` acoplable. Cambia entre detalle de Recurso, edición local, guía de IA y comentarios; solo muestra un contexto principal a la vez y puede colapsar para maximizar el Canvas.
- Canvas vacío: bienvenida discreta con Subir recursos, Añadir desde la Biblioteca y Crear una nota, además de indicar arrastre. Desaparece tras la primera acción, puede recuperarse y no crea ejemplos.

### Exploración de Recursos

- Biblioteca, Carpetas y el selector de Recursos comparten búsqueda ancha y visible, ruta o contexto actual, filtros que expresan el criterio aplicado y controles Lista/Cuadrícula.
- La cuadrícula muestra una miniatura grande para archivos compatibles; notas y enlaces usan vista textual o icono propio de Theke. El nombre y el tipo permanecen visibles aunque no haya miniatura.
- La lista conserva columnas útiles y lectura rápida para colecciones grandes. La vista elegida no cambia la selección ni el resultado de los filtros.
- Un clic selecciona y abre detalles cuando corresponde; doble clic o menú pueden ofrecer la apertura rápida, pero nunca son la única vía. Selección múltiple y acciones de añadir al Canvas siguen disponibles por teclado.
- En búsquedas vacías o filtros sin coincidencias, la ruta, búsqueda, filtros y cambio de vista permanecen visibles para poder corregir la consulta.

### Profundidad del Recurso

1. `Resource Card` compacta en Canvas.
2. Estado expandido local al Diagrama, sin alterar otras Representaciones.
3. Detalle completo en `Context Panel`, separado en **Contenido canónico** y **En este Diagrama**.

La Vista compartida conserva expansión y detalle sin permitir cambios de composición.

## Voice and Tone

La voz es clara, breve, serena y orientada a acciones. Respeta autonomía, comunica incertidumbre y evita entusiasmo artificial. La IA habla como guía: propone, muestra evidencia y reconoce carencias; no afirma certeza que no puede sustentar.

| Situación | Usar | Evitar |
|---|---|---|
| Canvas vacío | “Empieza con un recurso o una nota.” | “¡Crea algo increíble!” |
| Guardado | “Guardando…” / “Guardado” | “¡Todo listo! ✓” |
| Error recuperable | “No se pudo guardar. Tus cambios siguen aquí. Reintentar.” | “Error 500.” |
| Carga parcial | “3 recursos añadidos; 1 no se pudo cargar.” | “Carga fallida.” |
| IA con evidencia | “Esta fuente puede respaldar la relación. Revisa Juan 1:3.” | “Encontré la respuesta correcta.” |
| IA sin sustento | “Falta evidencia para sostener esta conexión.” | “Esta relación es falsa.” |
| Cambio global | “Actualizará 3 diagramas y 1 compartido.” | “¿Continuar?” |
| Publicación viva | “Los cambios guardados también aparecerán en este enlace.” | “Tu página está sincronizada mágicamente.” |
| Revocación | “El enlace dejará de abrirse. El Diagrama y los comentarios internos se conservan.” | “Borrar publicación.” |
| Sin resultados | “No hay recursos con estos filtros.” | “Ups, nada por aquí.” |

Mensajes temporales confirman acciones breves. Errores accionables permanecen junto a la acción. Comentarios notifican sin interrumpir. No usar exclamaciones, infantilización, culpa, rachas ni antropomorfismo de IA.

## Component Patterns

Las especificaciones visuales viven en `DESIGN.md.Components`; los nombres siguientes son canónicos.

| Componente | Uso | Reglas conductuales |
|---|---|---|
| **Button Primary / Secondary** | Acciones globales y contextuales | `Enter` o `Space` activa; estado ocupado evita doble envío y conserva etiqueta; deshabilitado explica la condición cuando no es evidente. |
| **Text Field** | Formularios, búsqueda y comentarios | Etiqueta persistente, ayuda y error asociados; no borra el valor ante fallo. `Enter` envía solo cuando el contexto lo anuncia. |
| **Menu / Popover** | Acciones secundarias y edición cercana | Foco inicial en la primera acción pertinente, navegación por flechas, `Esc` cierra y devuelve foco al invocador. No contiene otro modal. |
| **Sheet / Dialog** | Panel temporal móvil y confirmación | Foco inicial en título o control seguro, foco contenido mientras está abierto, `Esc` cancela cuando es seguro y el cierre devuelve foco al invocador. |
| **Toast / Skeleton** | Confirmación breve y carga | Toast no toma foco y deduplica mensajes repetidos; Skeleton no se anuncia como contenido ni reemplaza controles ya disponibles. |
| **Media Controls** | Audio y video | Operables por teclado, exponen nombre/valor/estado y ofrecen subtítulos, transcripción o alternativa equivalente según el medio. |
| **App Sidebar** | Global | Inicio, Proyectos y Biblioteca con la misma barra estilo Notion en todas las rutas. Se colapsa sin perder el destino activo; en viewport estrecho se abre como panel temporal. |
| **Top Bar** | Global y Canvas | Mantiene orientación, nombre, `Save Status` y acciones contextuales. Breadcrumb no sustituye el botón de retorno. |
| **Project Card** | Inicio y Proyectos | Activar abre Proyecto. Menú secundario permite renombrar, archivar o eliminar mostrando impacto. |
| **Resource Row** | Biblioteca y panel izquierdo | Activar abre detalle; selección múltiple habilita añadir al Diagrama. Acciones no dependen solo de hover. |
| **Resource Browser** | Biblioteca, Carpetas y selección de Recursos | Buscar, filtrar, recorrer ruta y alternar Lista/Cuadrícula sin perder contexto ni selección; mantiene la barra global estilo Notion. |
| **Resource Preview Card** | Cuadrícula de Recursos | Muestra nombre, tipo y miniatura o alternativa textual. Selección, apertura, detalle y acciones tienen control accesible sin hover. |
| **Resource Card** | Canvas y compartido | Un clic selecciona; abrir expande localmente o lleva detalle al panel. Arrastrar cambia Representación, no Recurso. Controles internos usan `nodrag`/`nopan`. |
| **Folder Card** | Canvas | Abre la Carpeta en panel izquierdo; nunca materializa todos sus Recursos ni actúa como extremo semántico. |
| **Canvas Toolbar** | Canvas | Zoom, alejar y encuadrar. No contiene creación: Añadir sigue visible por separado. |
| **Add Menu** | Canvas | Vía principal para Biblioteca, carga, Nota, Carpeta, Grupo y Anotaciones. Menú contextual y atajos replican; sin coordenada, crea en centro visible. |
| **Group Frame** | Canvas | Agrupa Representaciones visualmente; al moverlo, arrastra a sus hijos. No crea Carpeta ni Relación. Reparentado respeta invariantes de `AGENTS.md`. |
| **Semantic Relation** | Canvas y compartido | Conecta solo Recursos. Selección abre detalle; dirección, etiqueta y tipo se exponen también sin depender del color. |
| **Relation Editor** | Canvas | Al conectar dos Recursos, aparece cerca de la conexión. Permite guardar manualmente; Pedir sugerencia abre `AI Guidance Card` sin bloquear. |
| **Context Panel** | Canvas y compartido | Un contexto principal; cerrar devuelve ancho al Canvas. Al editar Recurso separa global/local y muestra usos afectados. Su apariencia usa las superficies opacas del marco Notion. |
| **AI Guidance Card** | `Context Panel` | Muestra acción, Fundamento, Alcance, Recursos usados, Carencias y procedencia. Permite editar, aceptar, descartar o reportar. |
| **Save Status** | `Top Bar` | Persistente; estados Guardando…, Guardado y error. Error conserva cambios y ofrece reintento. |
| **Upload Batch Tray** | Canvas | Tras carga múltiple mantiene selección temporal con Distribuir, Crear grupo visual y Deshacer carga. Clic fuera termina la selección. |
| **Share Wizard** | Canvas | Tres pasos: Vista previa → Contenido expuesto → Acceso. Permite retroceder sin perder opciones. |
| **Comment Marker** | Compartido y vista del autor | Numerado; activar centra el anclaje y abre hilo. Si pierde anclaje sigue accesible desde la lista. |
| **Comment Composer** | Compartido | Solicita el nombre la primera vez si no hay una identidad anónima disponible. Los campos de nombre y comentario tienen etiquetas asociadas, y sus errores permanecen vinculados al campo correspondiente. Conserva el borrador ante error. Mientras la identidad siga vigente, Theke reconoce al visitante y le permite editar solo sus propios comentarios. Si expira o se pierde, informa el cambio de estado antes de publicar: los comentarios anteriores continúan visibles, pero no se atribuyen ni quedan editables por la identidad nueva. |
| **State Message** | Cualquier superficie | Explica estado y siguiente acción; no reemplaza contenido existente durante actualizaciones de fondo. |
| **Confirm Dialog** | Acciones sensibles | Solo reemplazar/eliminar, revocar/republicar o impacto público. Foco atrapado; cancelar es seguro. |
| **Theme Control** | Cuenta/apariencia | Sistema por defecto; Claro u Oscuro se guardan por dispositivo. Cambio inmediato sin recarga. |
| **Semantic View** | Canvas | Vista sincronizada, en forma de árbol o lista, de Grupos, Recursos y Relaciones. Permite buscar, seleccionar, abrir, mover por incrementos, agrupar, conectar, mostrar/ocultar y saltar al equivalente visual sin exigir navegación espacial. |

## AI Assistance

### Postura y entrada

- IA está desactivable y nunca bloquea funciones manuales.
- No analiza de forma permanente la Biblioteca.
- Se invoca desde `Relation Editor`, Grupo, selección, revisión del Diagrama o preparación para compartir.
- Señales discretas pueden indicar que hay una posibilidad; no abren panel, conversación ni cambios por sí solas.

### Consentimiento y alcance

Antes de cada análisis, `AI Guidance Card` enumera los Recursos incluidos. El alcance inicial comprende los elementos implicados en la acción. Ampliarlo a una selección, una Carpeta o un Diagrama requiere una decisión explícita. Los límites de formato, tamaño o contexto se comunican antes de ejecutar; una fuente nunca se omite silenciosamente.

El MVP puede usar evidencia ya presente en la Biblioteca o formular una necesidad que Daniel debe investigar. No busca ni importa fuentes web autónomamente.

### Resultado y control

Cada sugerencia separa:

1. **Acción propuesta** — qué podría hacer Daniel.
2. **Fundamento** — por qué aparece.
3. **Evidencia** — fragmentos o Recursos que la sostienen.
4. **Inferencia** — interpretación de Theke, rotulada como tal.
5. **Carencias** — evidencia adicional necesaria.
6. **Alcance y límites** — qué se analizó y qué no.

Daniel puede editar, aceptar, descartar o reportar. Aceptar nunca ejecuta más de la acción mostrada y conserva origen, evidencia y fecha consultables. Descartar no penaliza ni insiste. Reportar conserva el trabajo manual.

### Estados de IA

- Desactivada: control explica que el trabajo manual sigue disponible.
- Sin proveedor/límite alcanzado: mensaje contextual; ninguna función manual se deshabilita.
- Preparando alcance: selección editable antes de enviar.
- Analizando: progreso no bloqueante y cancelar cuando sea técnicamente posible.
- Resultado con evidencia / resultado con carencias / sin hallazgos: tratamientos distintos y literales.
- Error, desconexión o contenido no admitido: conservar contexto y permitir reintento o continuar manualmente.

## State Patterns

| Estado | Superficie | Tratamiento |
|---|---|---|
| Carga fría autenticada | Inicio | Estructura skeleton breve; luego recientes. Error usa `State Message` y acceso a Proyectos/Biblioteca si están disponibles. |
| Cuenta cargando/error/recuperación enviada | Cuenta | Conserva identificador escrito, asocia error al campo o formulario y confirma el envío sin revelar si una cuenta existe. |
| Superficie autenticada cargando | Inicio/Proyectos/Proyecto/Biblioteca | Skeleton con la geometría esperada; navegación disponible no desaparece. |
| Superficie autenticada con error | Inicio/Proyectos/Proyecto/Biblioteca | `State Message` persistente con Reintentar; conserva contenido anterior si existe. |
| Acceso autenticado denegado | Proyecto/Recurso/Diagrama | Explica falta de acceso sin revelar metadatos privados y ofrece volver a una superficie segura. |
| Sin Proyectos | Proyectos | Una explicación y acción Crear Proyecto. Sin contenido de ejemplo. |
| Proyecto vacío | Proyecto | Crear Diagrama o añadir Recursos existentes. |
| Biblioteca vacía | Biblioteca | Subir recurso, crear Nota o añadir Enlace; explica que la Biblioteca es global. |
| Búsqueda sin coincidencias | Biblioteca/panel izquierdo | Mantiene filtros visibles, indica “No hay recursos con estos filtros” y permite limpiarlos. |
| Canvas vacío | Canvas | Bienvenida discreta acordada; recuperable desde ayuda, nunca modal obligatoria. |
| Foco de Canvas | Canvas | Selección y teclado quedan en el Canvas; controles internos no arrastran/panean. `Esc` abandona contexto superior. |
| Carga individual | Biblioteca/Canvas | Progreso por archivo, éxito o error individual. Fallo no retira cargas correctas. |
| Archivo externo soltado en Biblioteca | Biblioteca | Crea el Recurso canónico y lo incorpora a la organización actual sin crear Representación. |
| Archivo externo soltado en Canvas | Canvas | Crea el Recurso canónico y una Representación en la coordenada de destino. |
| Carga múltiple completa | Canvas | Cuadrícula sin solapamiento + `Upload Batch Tray`; no crea Grupo ni Relaciones. |
| Archivo sin preview | Recurso | Metadatos y abrir/descargar permanecen disponibles. |
| Metadatos web no disponibles | Recurso enlace | Conserva la URL y permite editar el título o la descripción manualmente. |
| Guardando | Global autor | `Save Status` persistente, sin toast repetitivo. |
| Guardado | Global autor | Estado estable y discreto. |
| Error de guardado/offline | Global autor | Cambios permanecen visibles; estado persistente con Reintentar. IA no bloquea recuperación. |
| Permiso denegado | URL privada/revocada | No revela título, autor ni Recursos; explica que el enlace no está disponible. |
| Recurso global en uso | `Context Panel` | Muestra cantidad y permite revisar usos antes de reemplazar, archivar o eliminar. |
| Relación existente | Canvas | Informa existencia y permite Mostrar aquí o mantener oculta. |
| IA desactivada/error/límite | `Context Panel` | Ver sección IA; el editor manual permanece activo. |
| Compartido no publicado | `Share Wizard` | Requiere completar los tres pasos; cancelar conserva borrador. |
| Compartido publicado | Canvas | Indicador de enlace vivo; cambios sensibles advierten impacto público. |
| Compartido revocado | Autor/visitante | Autor conserva historial; visitante recibe permiso denegado sin datos privados. |
| Compartido republicado | Autor/visitante | Crea un nuevo enlace y un nuevo hilo de comentarios. El hilo revocado permanece visible solo para el autor como historial. |
| Comentarios cerrados | Compartido | Lectura preservada; compositor se sustituye por explicación breve. |
| Comentario sin anclaje | Lista del autor | Mantiene autor, texto y contexto previo; puede resolverse o eliminarse. |
| Comentario limitado por antiabuso | Compartido | Conserva borrador, identifica el límite sin culpar al visitante, anuncia cuándo puede reintentar y ofrece una vía accesible de contacto o reporte si el bloqueo persiste. |
| Móvil compartido | Compartido | Panel lateral se convierte en hoja inferior; Canvas mantiene paneo/zoom. |

## Interaction Primitives

- **Puntero:** clic selecciona; arrastre mueve Representaciones; rueda/gesto navega; controles internos cancelan drag/pan.
- **Creación:** botón visible Añadir es primario. Clic derecho, doble clic o atajos nunca son la única vía.
- **Teclado:** `Tab` recorre controles visibles, `Enter` activa, `Space` activa controles estándar, `Esc` cierra el nivel superior o limpia selección contextual. El mapa exacto de atajos de creación debe ser visible dentro del producto antes de habilitarse.
- **Selección múltiple:** carga por lote o selección explícita; una barra contextual declara el alcance. Clic fuera limpia la selección temporal.
- **Paneles:** la barra lateral global permanece estable; el panel contextual izquierdo explora y el derecho inspecciona/guía/comenta. Pueden estar acoplados o colapsados. No apilar dos paneles derechos ni más de un diálogo modal.
- **Densidad:** barras y paneles usan espaciado compacto y separación tonal. En acciones solo con icono, el nombre aparece mediante tooltip y nombre accesible; la acción primaria de cada tarea conserva texto visible.
- **Superficies:** el shell oscuro y el contenido usan superficies opacas tomadas de las referencias. Menús y capas temporales se separan por tono, borde y sombra moderada. El estado provisional se anuncia con texto e icono, no con transparencia.
- **Foco en capas:** panel temporal, popover o diálogo recibe foco inicial significativo, evita que `Tab` alcance contenido oculto, cierra con `Esc` cuando es seguro y devuelve foco al invocador. Un panel persistente participa en el orden normal sin atrapar foco.
- **Operaciones espaciales sin arrastre:** al seleccionar una Representación, acciones visibles permiten Mover, Redimensionar, Agrupar o Sacar del grupo mediante campos, incrementos y comandos. Seleccionar dos Recursos habilita Conectar; una selección múltiple habilita Distribuir. Cada operación anuncia el resultado y puede deshacerse.
- **Movimiento:** transiciones de 120–180 ms para opacidad/color. Nunca interpolar posiciones de nodos durante drag, resize o reparentado. `prefers-reduced-motion` elimina desplazamientos, animación de cámara/centrado, hojas deslizantes, fades no esenciales y pulso de Skeleton; el estado final aparece inmediatamente.
- **Confirmación:** ediciones normales guardan sin confirmar. Los reemplazos o eliminaciones globales, las revocaciones o republicaciones y las acciones con impacto público usan `Confirm Dialog`.
- **Notificación:** acciones breves usan mensaje temporal; errores accionables permanecen en contexto; comentarios nuevos notifican sin tomar foco.

## Accessibility Floor

- WCAG 2.2 AA en navegación, gestión de Recursos, Canvas esencial, publicación y comentarios.
- Cada acción esencial tiene una alternativa visible y operable por teclado que no depende del arrastre, el clic derecho, el doble clic, el hover, el gesto de pinza ni handles pequeños. Mover, redimensionar, agrupar, conectar y distribuir cumplen la regla de Operaciones espaciales sin arrastre.
- Orden de foco coincide con lectura. Foco visible usa `{colors.focus-ring}` o `{colors.focus-ring-dark}` y no queda oculto por paneles.
- Objetivos de puntero de al menos 44 × 44 CSS px cuando el control no está espaciado de forma equivalente; handles pequeños ofrecen alternativa por `Relation Editor`.
- `App Sidebar`, `Top Bar`, paneles, Canvas, nodos y Relaciones exponen nombre, rol, estado y acciones a tecnología asistiva.
- El Canvas ofrece una **Vista semántica** sincronizada que presenta primero un árbol o una lista de Grupos y Recursos y, después, las Relaciones. Permite buscar, seleccionar, abrir detalle, mover por incrementos, agrupar, conectar, mostrar/ocultar y saltar al equivalente visual. La selección y el foco se reflejan entre Vista semántica y Canvas sin mover la cámara inesperadamente.
- El zoom del navegador hasta el 200 % no oculta tareas esenciales; los textos no se truncan sin un nombre accesible completo.
- El color nunca es único indicador de tipo, selección, relación, IA, comentario o error.
- Multimedia respeta controles de teclado. Para publicar audio se exige transcripción o alternativa textual equivalente; para video, subtítulos sincronizados y una descripción o alternativa para información visual necesaria. Si faltan, `Share Wizard` identifica el Recurso y bloquea solo su exposición, no la publicación del resto. Descargar no sustituye estas alternativas.
- `aria-live="polite"` anuncia guardado, progreso resumido y comentarios sin repetir mensajes idénticos; `role="alert"` se reserva para fallos que requieren acción inmediata. Cada anuncio es atómico y los errores de campo permanecen asociados al control; movimiento continuo de nodos no se anuncia.
- La reducción de movimiento aplica la regla de Interaction Primitives sin alterar el estado ni la orientación.
- Preferencias de contraste alto, agentes de usuario sin `backdrop-filter` y fondos visualmente complejos reciben superficies contextuales opacas. El contraste se calcula contra la composición resultante, no solo contra el valor RGBA del token.
- Los temas Sistema, Claro y Oscuro mantienen el contraste; el contraste alto se prepara para una fase posterior de validación.

## Responsive & Platform

| Contexto | Autoría | Compartido |
|---|---|---|
| Escritorio amplio | `App Sidebar`, Biblioteca contextual, Canvas y `Context Panel` pueden coexistir. | Canvas y panel derecho simultáneos. |
| Escritorio compacto / tablet horizontal | En navegador de escritorio, `App Sidebar` colapsa y solo un panel lateral queda abierto junto al Canvas. El MVP no incluye la autoría táctil completa en tablet. | Panel de detalle/comentarios superpuesto y cerrable. |
| Móvil | Edición completa del Canvas no forma parte del MVP; permitir acceso informativo sin prometer autoría. | Navegación, zoom, apertura de Recursos y comentarios; `Comment Composer` como hoja inferior. |

La web de escritorio es la plataforma de autoría. La vista compartida es adaptable; no se define una aplicación móvil nativa. La interacción táctil no depende del hover ni del clic derecho. Cuando la vista previa o la reproducción no sean compatibles, las opciones de abrir o descargar conservan el acceso.

Fuera del Canvas bidimensional, todas las superficies y paneles deben refluir sin desplazamiento horizontal a 320 CSS px en orientación vertical u horizontal, salvo contenido que por naturaleza requiera dos dimensiones. El Canvas puede conservar paneo bidimensional, pero navegación, Vista semántica, controles, diálogos, comentarios y contenido de Recursos cumplen reflow.

## Behavioral Boundaries

- **Conservado del frontend actual:** navegación Inicio/Proyectos/Biblioteca, tema claro/oscuro, React Flow, tarjetas por tipo, Grupos, Relaciones editables y herramientas de zoom.
- **Rechazado:** IA que genera un diagrama final, chat obligatorio, relaciones automáticas, carga múltiple que agrupa semánticamente, tutorial bloqueante, contenido de ejemplo, Comunidad en MVP, acciones esenciales solo en hover/clic derecho y cromado saturado.
- Los tres mockups anteriores ilustran flujos, pero su apariencia visual ha sido reemplazada por la dirección Notion/Drive. La [nueva maqueta del marco y Biblioteca](mockups/theke-notion-drive-direction.html) muestra la composición propuesta; `DESIGN.md` conserva la procedencia visual normativa.

## Key Flows

### Flow 0 — Daniel accede y recupera su espacio de estudio

1. Daniel crea su cuenta e inicia sesión.
2. Inicio muestra sus Proyectos recientes y el acceso persistente a Proyectos y Biblioteca.
3. Elige tema Sistema; al volver desde el mismo dispositivo se conserva la preferencia.
4. Cierra sesión y más tarde utiliza Recuperar acceso.
5. Regresa a Inicio con su Biblioteca y Proyectos intactos.
6. **Clímax:** Daniel reconoce que Theke es un espacio persistente, no una sesión desechable del Canvas.

Fallo: si fallan la autenticación o la recuperación, `State Message` conserva el identificador ya escrito, explica el siguiente paso y nunca afirma que el trabajo privado se perdió.

### Flow 1 — UJ-1: Daniel construye un mapa de estudio

Referencia de flujo: [Canvas de autoría anterior](mockups/key-canvas-authoring.html). Su apariencia está pendiente de adaptación al nuevo Design Spine.

1. Daniel abre Proyectos y crea “Estudio de Juan 1”.
2. Crea un Diagrama de grafo; el Canvas vacío ofrece Subir recursos, Añadir desde Biblioteca y Crear una nota.
3. Usa Añadir → Subir recursos y selecciona varios PDF e imágenes.
4. Theke crea Recursos canónicos y dispone sus `Resource Card` en cuadrícula sin solaparlos.
5. `Upload Batch Tray` mantiene el lote seleccionado. Daniel elige Distribuir y después hace clic fuera; no se crean Relaciones ni Grupo.
6. Abre una Carpeta desde el Canvas, busca una nota y un Enlace previos en el panel izquierdo y los incorpora sin duplicarlos.
7. Crea un `Group Frame`, mueve tarjetas dentro, añade una Anotación visual y cambia el fondo únicamente de este Diagrama.
8. **Clímax:** Daniel aleja el Canvas y ve fuentes dispersas convertidas en una estructura legible que puede retomar; `Save Status` confirma “Guardado”.

Fallo: un archivo falla → los demás permanecen; `State Message` identifica el archivo, conserva el lote y permite Reintentar o continuar.

### Flow 2 — Daniel edita conocimiento global sin perder el contexto local

1. Daniel selecciona una nota usada en dos Proyectos.
2. `Context Panel` muestra Contenido canónico y En este Diagrama.
3. Cambia el color y tamaño en En este Diagrama; solo esta Representación cambia.
4. Corrige una frase en Contenido canónico; el panel indica cuántos usos se actualizarán y permite revisarlos.
5. Guarda la edición normal sin diálogo adicional.
6. Intenta reemplazar el archivo fuente; `Confirm Dialog` enumera Diagramas y Compartidos afectados.
7. **Clímax:** Daniel confirma con comprensión del alcance; todos los usos muestran el contenido corregido y este Diagrama conserva su composición.

Fallo: el guardado remoto falla → el contenido editado permanece local y visible, `Save Status` ofrece Reintentar y no revierte silenciosamente.

### Flow 3 — Daniel crea una relación y pide orientación de IA

1. Daniel conecta dos `Resource Card`.
2. `Relation Editor` aparece cerca de la conexión con dirección, tipo y etiqueta.
3. Puede guardar manualmente; decide Pedir sugerencia.
4. `AI Guidance Card` se abre en el panel derecho con los dos Recursos como alcance inicial.
5. Theke propone “sustenta”, muestra fragmento de evidencia y señala que falta una fuente adicional; Daniel no autoriza ampliar el alcance al Diagrama.
6. Daniel edita la explicación y acepta. La Relación conserva marca de procedencia consultable.
7. Sobre un Grupo, pide una revisión de la selección; Theke propone un nombre y señala un Recurso atípico. Daniel descarta la reorganización y conserva el nombre útil.
8. Antes de compartir, solicita una revisión del Diagrama y recibe una lista de vacíos y Recursos aislados, sin cambios automáticos.
9. Otra sugerencia contiene una afirmación incorrecta; Daniel la descarta e informa del problema conservando su trabajo manual.
10. **Clímax:** la conexión y el Grupo representan decisiones comprendidas y revisadas por Daniel, no una estructura automática.

Fallo: IA no disponible o límite alcanzado → mensaje contextual; `Relation Editor` conserva todos los campos y Daniel guarda manualmente.

### Flow 4 — Daniel publica una vista viva con alcance explícito

Referencia de flujo: [asistente de publicación anterior](mockups/key-share-wizard.html). Su apariencia está pendiente de adaptación al nuevo Design Spine.

1. Daniel selecciona Compartir desde `Top Bar`.
2. `Share Wizard` se abre en el paso Vista previa; Daniel recorre el Diagrama como visitante.
3. En Contenido expuesto revisa Recursos, URLs y archivos accesibles.
4. En Acceso habilita comentarios y confirma el enlace no listado.
5. Regresa al Canvas; un indicador explica que los cambios guardados afectarán el enlace vivo.
6. **Clímax:** Daniel copia el enlace sabiendo exactamente qué expone y conserva el control para cerrar comentarios o revocar.

Fallo: un Recurso privado no puede publicarse → `Share Wizard` identifica el elemento y bloquea solo la confirmación; Daniel vuelve a Contenido expuesto para retirarlo o resolverlo.

### Flow 5 — UJ-2: María explora y comenta un diagrama

Referencia de flujo: [comentario móvil anterior](mockups/key-shared-mobile-comment.html). Su apariencia está pendiente de adaptación al nuevo Design Spine.

1. María abre el enlace sin cuenta desde su teléfono.
2. El Compartido encuadra el grafo; usa zoom y paneo y abre una `Resource Card`.
3. La hoja inferior muestra detalle y permite previsualizar el PDF; la composición no cambia.
4. Activa Comentar, elige una `Semantic Relation` y proporciona su nombre visible por primera vez.
5. `Comment Composer` muestra el contexto; María escribe y publica.
6. `Comment Marker` numerado aparece en la Relación. María lo abre y corrige su propio texto.
7. **Clímax:** María aporta una observación exactamente donde surge, sin editar ni desordenar el trabajo de Daniel.

Fallo: pierde conexión al publicar → el texto permanece en el compositor, se anuncia el error y Reintentar no duplica el comentario. Si su identidad expiró antes de editar, Theke informa que el comentario anterior queda visible pero ya no puede atribuirse a la identidad nueva.

### Flow 6 — Daniel revisa y modera retroalimentación

1. Daniel recibe una notificación interna no interruptiva.
2. Abre la lista de comentarios en `Context Panel`.
3. Selecciona el comentario de María; el Canvas centra su `Comment Marker` y muestra el hilo.
4. Daniel revisa la observación y marca el comentario como resuelto; no puede editar el texto de María.
5. Encuentra otro comentario abusivo y lo elimina mediante `Confirm Dialog`.
6. Decide cerrar nuevos comentarios sin revocar el enlace.
7. **Clímax:** Daniel integra la retroalimentación útil y conserva control editorial sin convertir comentarios en conocimiento global.

Fallo: el Recurso comentado fue retirado → el comentario aparece “Sin anclaje” en la lista con su contexto previo y puede resolverse o eliminarse.

### Flow 7 — Daniel reutiliza y mantiene conocimiento canónico

1. Daniel abre un segundo Proyecto sobre “Cristología”.
2. Desde la Biblioteca global encuentra un Recurso usado en “Estudio de Juan 1” y lo añade sin duplicarlo.
3. Al incorporar otro Recurso, Theke informa que ambos ya tienen una Relación y ofrece Mostrar aquí o mantenerla oculta.
4. Daniel muestra la Relación y ajusta únicamente la presentación de sus Representaciones.
5. Renombra una Carpeta, mueve allí una referencia y comprueba que el Recurso canónico no cambió.
6. Duplica un Diagrama para explorar otra composición; luego archiva el original. Al intentar eliminarlo, revisa el impacto y cancela.
7. Archiva el primer Proyecto; sus Recursos canónicos continúan disponibles en la Biblioteca y en el segundo Proyecto. Una eliminación definitiva enumera Diagramas y Compartidos afectados antes de confirmar.
8. Intenta eliminar el Recurso compartido; `Confirm Dialog` enumera Proyectos, Diagramas, Relaciones y Compartidos afectados y recomienda archivarlo.
9. **Clímax:** Daniel archiva el Recurso y conserva una sola identidad de conocimiento, sus usos y su procedencia.

Fallo: no puede calcularse el impacto completo → la eliminación definitiva queda bloqueada; el archivo y la navegación a usos siguen disponibles.

### Flow 8 — Daniel revoca y republica una vista

1. Daniel abre los controles de un Compartido activo y revisa sus comentarios.
2. Selecciona Revocar; `Confirm Dialog` explica que el enlace dejará de funcionar y que el historial seguirá disponible para él.
3. Confirma y verifica el estado Revocado sin perder Diagrama ni comentarios internos.
4. Decide publicar nuevamente; `Share Wizard` repite la revisión de contenido expuesto y acceso.
5. Theke genera un nuevo enlace y un nuevo hilo de comentarios; el historial anterior queda separado y solo visible para Daniel.
6. **Clímax:** Daniel comparte la nueva URL sabiendo que la audiencia anterior no recuperó acceso y que los dos hilos no se mezclaron.

Fallo: la nueva publicación falla → el Compartido anterior continúa revocado; no se reactiva su enlace ni se crea un hilo parcial.

### Requirement-to-flow coverage

| Requisitos del PRD | Flujo principal |
|---|---|
| FR-1 Cuenta de autor | Flow 0. |
| FR-2 Proyecto; FR-3 Biblioteca; FR-4 Carpetas; FR-5 Búsqueda y filtrado | Flow 1 y Flow 7. |
| FR-6 Carga de archivos; FR-7 Tipos de recurso; FR-8 Enlaces web; FR-9 Reutilización | Flow 1, Flow 7 y sus fallos. |
| FR-10 Creación de diagrama; FR-11 Persistencia del canvas; FR-12 Incorporación al canvas; FR-13 Carga directa; FR-14 Representación por tipo | Flow 1 y Flow 7. |
| FR-15 Carpeta en diagrama; FR-16 Grupos; FR-17 Anotaciones visuales; FR-18 Presentación | Flow 1. |
| FR-19 Edición de recurso; FR-20 Representación local; FR-23 Ciclo de vida seguro | Flow 2 y Flow 7. |
| FR-21 Relación explicada; FR-22 Reutilización de relación | Flow 3 y Flow 7. |
| FR-24 Disponibilidad opcional; FR-25 Alcance visible; FR-26 Ayuda en relaciones; FR-27 Ayuda en grupos; FR-28 Revisión solicitada | Flow 3 y sección AI Assistance. |
| FR-29 Decisión humana; FR-30 Procedencia; FR-31 Retroalimentación | Flow 3. |
| FR-32 Previsualización; FR-33 Enlace compartido; FR-34 Controles de publicación | Flow 4 y Flow 8. |
| FR-35 Exploración pública; FR-36 Identidad de comentario; FR-37 Comentario contextual; FR-38 Gestión del visitante | Flow 5. |
| FR-39 Moderación del autor; FR-40 Anclaje perdido | Flow 6. |
