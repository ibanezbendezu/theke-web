# Integración visual compartida — Theke

Estado: **en curso**. Trabajo transversal de implementación previo a la épica 6. Fuente normativa: [Design Spine](../planning-artifacts/ux-designs/ux-Theke-2026-09-19/DESIGN.md), [Experience Spine](../planning-artifacts/ux-designs/ux-Theke-2026-09-19/EXPERIENCE.md) y [maqueta aprobada](../planning-artifacts/ux-designs/ux-Theke-2026-09-19/mockups/theke-notion-drive-direction.html).

## Criterios de aceptación

- Barra lateral Notion estable en rutas privadas: 272 px en escritorio, navegación sin contornos, cuenta y búsqueda global al pie; el menú móvil se puede abrir y cerrar por teclado.
- Topbar compacta en todas las páginas privadas salvo Canvas/Diagrama, que conserva su encabezado de trabajo. La ruta muestra nombres legibles, no identificadores internos.
- Inicio, Proyectos y Biblioteca comparten 32 px de margen interior en escritorio y 16 px en móvil. En Biblioteca la búsqueda ocupa el extremo izquierdo de la fila; Activos/Archivados aparece junto a Lista/Galería solo en la raíz de Biblioteca y Proyectos. «+» permanece junto al selector de vista cuando corresponde.
- Grupos, selector y «+» no llevan borde permanente. Hover y selección usan fondos tonales translúcidos; foco visible para teclado. Las líneas se reservan para estructura de tabla o grafo.
- Inicio muestra proyectos reales y mantiene acceso a crear; Proyectos conserva renombrar, archivar, restaurar y eliminar; Biblioteca conserva búsqueda, filtros avanzados, carga, creación y detalle de Recursos.
- Las vistas de lista y galería conservan la colección y sus filtros. El contenido no repite el nombre de la pantalla como encabezado descriptivo.

## Entrega por etapas

1. Base compartida y colecciones privadas: **implementada; pendiente revisión visual en navegador**.
2. Otras pantallas privadas, Canvas y vista compartida: **implementada; pendiente revisión visual en navegador**. Proyectos abre directamente el Diagrama único de cada mapa; el detalle de Biblioteca, sus metadatos, los inspectores del Canvas y la vista pública usan superficies tonales.
3. Verificación de recorridos y tamaños de pantalla; cierre de los criterios abiertos de las historias 5.2–5.5.
4. Inicio de la épica 6 de comentarios contextuales.

## Verificación de la primera etapa

- `npm run build`: correcto.
- ESLint sobre todos los archivos de código modificados: correcto.
- Lint global: correcto tras ajustar los efectos de los componentes de IA.
- Revisión visual: pendiente porque @Browser no expone navegador en esta sesión.

El estado de las historias de las épicas 4 y 5 permanece como figura en `sprint-status.yaml`; este trabajo visual no las marca como terminadas.

## Correcciones previas a la épica 6

- Inicio, Proyectos, Biblioteca y las colecciones dentro del Proyecto comparten filas y tarjetas casi cuadradas. Cada elemento ofrece «…» y menú por clic derecho.
- Biblioteca muestra archivos y carpetas de la Cuenta, sin filtros de Proyecto. El «+» abre el diálogo de carga con zona de arrastre y botón central. La franja de carga permanente salió de la página.
- Las carpetas de Biblioteca son independientes de las carpetas de la colección de Proyectos y de las carpetas internas de cada Proyecto. La migración `theke-api/drizzle/0020_collection_folders.sql` y los endpoints están implementados y aplicados a la base configurada.
- En la lista de Proyectos, los proyectos se pueden mover a carpetas por arrastre o menú en lista y galería. Crear carpeta está en el menú contextual del área. Dentro de cada mapa, el panel izquierdo del Canvas organiza Recursos y Carpetas. La pantalla de Proyectos no incorpora carga de archivos.
- Diálogos privados y del Canvas usan fondo desenfocado y superficies sin contorno exterior.
- Pendiente: comprobar flujos con datos reales y revisar la composición visual en navegador. @Browser no expone navegador en esta sesión.

## Un mapa por Proyecto

- Proyecto y Diagrama se crean juntos. Al abrir un Proyecto desde Inicio, Proyectos o recientes se entra directamente a su editor.
- Cada mapa conserva selección y carpetas propias aunque comparta los mismos Recursos canónicos con otro mapa. La migración `theke-api/drizzle/0021_one_map_per_project.sql` separó los diagramas anteriores y estableció un Diagrama no eliminado por Proyecto.
- El panel izquierdo del editor contiene Recursos y Carpetas; el panel derecho contiene propiedades de la selección.

## Verificación de la segunda etapa parcial

- `npm run build`: correcto.
- ESLint sobre los cuatro archivos modificados: correcto.
- Lint global: correcto.
- Navegador: pendiente, porque @Browser no expone una pestaña en esta sesión.

La vista pública del mapa se ajustó al editor: lienzo a pantalla completa, fondo y componentes del diagrama, panel de detalles y controles de navegación. La proyección ahora incluye grupos, anotaciones y conexiones además de recursos; la previsualización anterior a publicar presenta la misma composición. La comparación con una publicación real en @Browser sigue pendiente porque el navegador integrado no está disponible.

## Ajustes de colecciones y avisos (2026-09-29)

- Las carpetas de Proyectos y las de Biblioteca forman árboles independientes. Cada carpeta muestra solo sus hijos directos y comparte la misma lista o galería con mapas o archivos. Los elementos y las carpetas se pueden mover por menú o arrastre, incluso hacia carpetas del breadcrumb; la API rechaza ciclos y nombres duplicados entre hermanos.
- El breadcrumb presenta la ruta de carpetas. Los archivos se consultan en un diálogo de vista previa, sin añadir el archivo al breadcrumb. Activos/Archivados solo se muestra en la raíz; la búsqueda de Biblioteca queda al extremo izquierdo de la barra. Se eliminó el botón de opciones junto a Archivados en Proyectos; Crear carpeta sigue en el menú contextual, accesible también con Shift+F10 o la tecla de menú contextual.
- Los avisos de resultado de acciones usan alertas cerrables en la esquina inferior derecha. Los errores de validación y los estados que requieren una acción local permanecen junto al control afectado.
- Las migraciones `0023_nested_collection_folders.sql` y `0024_nested_folder_names.sql`, el contrato OpenAPI y el cliente generado forman una sola entrega con estos cambios.
- Revisión de código: se corrigieron descripciones obsoletas de eliminación de carpetas en OpenAPI y se actualizaron las pruebas de Biblioteca y Proyectos para los recorridos actuales. Lint, builds, contrato API/web, prueba de carpetas con PostgreSQL y pruebas focalizadas de colecciones pasaron. Las pruebas E2E se omitieron según la preferencia del usuario.
- Esta entrega corrige la base visual y de navegación previa a la épica 6. No cambia el estado de las historias 4.2–4.4 ni 5.2–5.5; siguen pendientes sus criterios propios y la revisión visual en navegador.

## Cuenta y acceso previos a la épica 6

- El nombre del espacio ocupa la cabecera de la barra lateral y abre el menú de cuenta. La identidad usa nombre, correo y avatar de Clerk, con datos locales de respaldo; el nombre del espacio sigue siendo el de Theke. El menú reúne perfil administrado por Clerk, apariencia, configuración de IA, información sobre Theke y cierre de sesión.
- Acceso y registro comparten una composición compacta con las superficies y la tipografía del Design Spine. La pantalla de acceso usa un formulario propio para correo con código y Google; Clerk envía y verifica el código, gestiona OAuth y activa la sesión. El registro permanece en el componente de Clerk. Los destinos `returnTo` conservan su validación.
- Queda pendiente una revisión visual en navegador porque `@Browser` no está disponible en esta sesión. Este ajuste no modifica el estado de las épicas.
