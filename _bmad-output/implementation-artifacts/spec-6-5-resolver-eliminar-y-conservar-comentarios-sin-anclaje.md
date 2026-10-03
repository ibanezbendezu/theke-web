---
title: 'Resolver, eliminar y conservar comentarios sin anclaje'
type: 'feature'
created: '2026-10-03'
status: 'review'
---

## Intent

Permitir al autor moderar comentarios sin modificar el texto del visitante y conservar el contexto seguro de los comentarios cuyo objetivo desaparece al reconstruir el Compartido.

## Implementación

- La API permite resolver, reabrir y eliminar comentarios desde avisos autenticados del autor. La eliminación requiere confirmación en la interfaz, oculta inmediatamente el comentario de las listas activas y del Compartido, y conserva un evento de moderación sin guardar el texto ajeno en ese registro.
- La migración `0029_comment_moderation.sql` añade estado de anclaje, vencimiento de retención y auditoría. Los comentarios eliminados se purgan después de 30 días mediante el worker. Las acciones de moderación tienen límites por minuto y por hora.
- Al reconstruir un Compartido, se cotejan los objetivos con la proyección pública. Los comentarios que pierden su objetivo quedan visibles en la lista como «sin anclaje», sin marcador espacial. Se conserva la descripción publicada que ya tenía el comentario; no se consulta el recurso privado para reconstruirla.
- El panel del autor muestra pendientes, resueltos y comentarios sin anclaje, con acciones de resolver, reabrir y eliminar. El panel público actualiza la lista periódicamente mientras está abierto para reflejar las eliminaciones.

## Verificación y estado

La migración se aplicó en la base local. Pasaron las pruebas focalizadas de API y web, así como build y lint de ambos repositorios y la comprobación de contratos. No se ejecutaron pruebas E2E por preferencia del usuario.

Pendiente para `done`: revisión de código BMAD y comprobación visual en navegador de moderación y comentarios sin anclaje.

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 6.5.
- `theke-api/src/modules/diagrams/comment-notifications.service.ts`.
- `theke-api/src/modules/diagrams/comment-anchor.ts`.
- `src/components/comments/CommentNotificationsPanel.tsx`.
