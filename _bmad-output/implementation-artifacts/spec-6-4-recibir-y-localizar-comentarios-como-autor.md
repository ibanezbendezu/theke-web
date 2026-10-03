---
title: 'Recibir y localizar comentarios como autor'
type: 'feature'
created: '2026-10-03'
status: 'review'
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

Pendiente para `done`: revisión de código BMAD y comprobación visual en navegador del recorrido autor → aviso → mapa en escritorio y móvil.

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 6.4.
- `theke-api/src/modules/diagrams/comment-notifications.service.ts`.
- `src/components/comments/CommentNotificationsPanel.tsx`.
