---
title: 'Recibir y localizar comentarios como autor'
type: 'feature'
created: '2026-10-03'
status: 'done'
---

## Intent

Mostrar al autor los comentarios recibidos en sus mapas y llevarlo desde cada aviso al marcador y al texto en el editor correspondiente.

## Implementación

- `0028_comment_notifications.sql` agrega avisos internos, uno por comentario mediante índice único, y `resolved_at` para el estado de la historia 6.5. La creación del comentario y del aviso ocurre en la misma transacción. La migración incorpora comentarios existentes no eliminados.
- La API autenticada lista avisos por cuenta con páginas de 20, filtros, contador pendiente y alcance opcional por diagrama o comentario. Abrir un aviso marca su lectura de forma idempotente. SSE comunica cambios de contador o nuevos avisos; la lista paginada sigue siendo la fuente de verdad.
- La barra superior muestra el acceso a avisos. El editor incluye lista lateral, filtros y marcadores en el canvas. Un enlace a un comentario abre el mapa correcto, centra su punto y muestra la fila seleccionada, incluso si está fuera de la primera página. La selección usa `aria-current` y foco visible.
- La lista se recupera al volver a la ventana y periódicamente, por lo que el flujo sigue disponible cuando SSE se interrumpe.

## Verificación y estado

La migración se aplicó en la base local. Pasaron build y lint de ambos repositorios, las comprobaciones de contrato y la prueba focalizada de comentarios con PostgreSQL. El proyecto excluye pruebas E2E por preferencia del usuario.

La revisión BMAD del 2026-11-26 sincronizó el comentario enlazado con el panel y el marcador, incluso fuera de la página actual o en un mapa archivado. El aviso se marca como leído al abrir su selección y se puede reintentar si falla. El listado y el contador excluyen mapas eliminados. En móvil, el panel de comentarios pasa al borde inferior para dejar disponible el contexto del lienzo. La comprobación visual en escritorio y móvil queda a cargo del usuario.

Pasaron 38 pruebas web focalizadas, la integración PostgreSQL, lint, build y contratos de ambos repositorios.

## Review Triage Log

| Capa | Hallazgo | Veredicto | Evidencia y ruta |
| --- | --- | --- | --- |
| Ciega | Los botones del portal heredan `pointer-events: none`. | medium · patch | El elemento de React Flow deshabilita eventos de puntero. Los marcadores habilitan sus propios eventos. |
| Ciega | El panel móvil tapa el centro del mapa. | medium · patch | La hoja inferior ocupa hasta el 42 % de la altura y conserva visible el centro. |
| Ciega | El encuadre guardado puede sobrescribir el centrado inicial. | medium · patch | El centrado espera la inicialización de React Flow y se aplica después de restaurar el encuadre. |
| Ciega | CORS omite el método DELETE. | medium · defer | Afecta a la eliminación de comentarios de la historia 6.5. |
| Ciega | Los anclajes de un destino movido siguen en su antigua posición. | medium · defer | El ciclo de vida de anclajes existentes al republicar está registrado para 6.5. |
| Ciega | Avisos de mapas eliminados cuentan y llevan a un enlace inválido. | medium · patch | Listado y contador excluyen diagramas y proyectos eliminados. |
| Ciega | Incluir el aviso seleccionado altera los resultados del filtro. | medium · patch | La fila enlazada fuera de los resultados aparece identificada por separado y el estado vacío describe el filtro. |
| Casos límite | Los mapas eliminados siguen en lista y contador. | medium · patch | Una prueba con PostgreSQL verifica las exclusiones por proyecto y diagrama. |
| Casos límite | Un comentario enlazado ausente o con error no muestra su estado. | medium · patch | El panel distingue ausencia de un error de carga y permite reintentar este último. |
| Casos límite | Un refresco puede robar el foco de otro control. | medium · patch | Se enfoca cada selección una vez y se comprueba que un filtro mantiene el foco. |
| Casos límite | La lectura puede fallar sin indicación y los enlaces directos no registran lectura. | medium · patch | La lectura ocurre al mostrar la fila seleccionada en el editor y ofrece reintento. |
| Casos límite | El valor literal `all` comparte clave de caché con la lista general. | medium · patch | Se usa `null` en claves sin identificador y se omite la consulta individual cuando no hay selección. |
| Casos límite | Inserciones o eliminaciones entre páginas afectan el offset. | medium · defer | Corregir con un cursor estable requiere cambiar y desplegar el contrato paginado. Se cubre la paginación del listado estable. |
| Casos límite | Un sondeo SSE lento nunca concluye si el siguiente lo sustituye. | medium · patch | El sondeo activo termina antes de aceptar otro. |
| Casos límite | El mapa archivado no recibe la selección ni los marcadores. | medium · patch | El lienzo archivado recibe los avisos y el identificador seleccionado. |
| Verificación | El enlace a un aviso antiguo puede perder el marcador. | medium · patch | La prueba cubre el enlace, las coordenadas que recibe el editor, la lectura y el foco de la fila. El encuadre real queda en la comprobación visual. |
| Verificación | Un evento SSE puede no actualizar el contador. | medium · patch | Se prueba la invalidación y actualización del contador con un evento partido entre fragmentos. |
| Verificación | La segunda página puede repetir la primera sin que fallen los tests. | medium · patch | PostgreSQL comprueba dos páginas y que no compartan filas. |
| Verificación | No hay prueba de migración con comentarios históricos preexistentes. | medium · defer | Se añade al pendiente de verificar el runner desde esquemas anteriores sobre una base aislada. |

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 6.4.
- `theke-api/src/modules/diagrams/comment-notifications.service.ts`.
- `src/components/comments/CommentNotificationsPanel.tsx`.
