# Integración visual compartida — Theke

Estado: **en curso**. Trabajo transversal de implementación previo a la épica 6. Fuente normativa: [Design Spine](../planning-artifacts/ux-designs/ux-Theke-2026-09-19/DESIGN.md), [Experience Spine](../planning-artifacts/ux-designs/ux-Theke-2026-09-19/EXPERIENCE.md) y [maqueta aprobada](../planning-artifacts/ux-designs/ux-Theke-2026-09-19/mockups/theke-notion-drive-direction.html).

## Criterios de aceptación

- Barra lateral Notion estable en rutas privadas: 272 px en escritorio, navegación sin contornos, cuenta y búsqueda global al pie; el menú móvil se puede abrir y cerrar por teclado.
- Topbar compacta en todas las páginas privadas salvo Canvas/Diagrama, que conserva su encabezado de trabajo. La ruta muestra nombres legibles, no identificadores internos.
- Inicio, Proyectos y Biblioteca comparten 32 px de margen interior en escritorio y 16 px en móvil. Las colecciones empiezan con grupos, búsqueda cuando corresponde, Lista/Galería y «+» en la misma fila cuando cabe.
- Grupos, selector y «+» no llevan borde permanente. Hover y selección usan fondos tonales translúcidos; foco visible para teclado. Las líneas se reservan para estructura de tabla o grafo.
- Inicio muestra proyectos reales y mantiene acceso a crear; Proyectos conserva renombrar, archivar, restaurar y eliminar; Biblioteca conserva búsqueda, filtros avanzados, carga, creación y detalle de Recursos.
- Las vistas de lista y galería conservan la colección y sus filtros. El contenido no repite el nombre de la pantalla como encabezado descriptivo.

## Entrega por etapas

1. Base compartida y colecciones privadas: **implementada; pendiente revisión visual en navegador**.
2. Proyecto detallado, otras pantallas privadas, Canvas y vista compartida: **implementada; pendiente revisión visual en navegador**. El detalle de Proyecto ofrece lista/galería de Diagramas con los controles compartidos; el detalle de Biblioteca, sus metadatos, los inspectores del Canvas y la vista pública usan superficies tonales.
3. Verificación de recorridos y tamaños de pantalla; cierre de los criterios abiertos de las historias 5.2–5.5.
4. Inicio de la épica 6 de comentarios contextuales.

## Verificación de la primera etapa

- `npm run build`: correcto.
- ESLint sobre todos los archivos de código modificados: correcto.
- Lint global: mantiene 3 errores y 2 advertencias anteriores en `src/components/ai/AIConsentDialog.tsx`, `AIGuidanceCard.tsx` y `AISettingsDialog.tsx`.
- Revisión visual: pendiente porque @Browser no expone navegador en esta sesión.

El estado de las historias de las épicas 4 y 5 permanece como figura en `sprint-status.yaml`; este trabajo visual no las marca como terminadas.

## Correcciones previas a la épica 6

- Inicio, Proyectos, Biblioteca y las colecciones dentro del Proyecto comparten filas y tarjetas casi cuadradas. Cada elemento ofrece «…» y menú por clic derecho.
- Biblioteca muestra archivos y carpetas de la Cuenta, sin filtros de Proyecto. El «+» abre el diálogo de carga con zona de arrastre y botón central. La franja de carga permanente salió de la página.
- Las carpetas de Biblioteca son independientes de las carpetas de la colección de Proyectos y de las carpetas internas de cada Proyecto. La migración `theke-api/drizzle/0020_collection_folders.sql` y los endpoints están implementados; **la migración no se ha aplicado** a la base remota configurada en este workspace.
- En la lista de Proyectos, los proyectos se pueden mover a carpetas por arrastre o menú en lista y galería. Crear carpeta está en el menú contextual del área. Dentro de cada Proyecto, los Recursos conservan sus propias carpetas y también se pueden arrastrar. La pantalla de Proyectos no incorpora carga de archivos.
- Diálogos privados y del Canvas usan fondo desenfocado y superficies sin contorno exterior.
- Pendiente: comprobar flujos con datos reales y revisar la composición visual en navegador. @Browser no expone navegador en esta sesión.

## Verificación de la segunda etapa parcial

- `npm run build`: correcto.
- ESLint sobre los cuatro archivos modificados: correcto.
- Lint global: conserva los mismos 3 errores y 2 advertencias previos en componentes de IA.
- Navegador: pendiente, porque @Browser no expone una pestaña en esta sesión.
