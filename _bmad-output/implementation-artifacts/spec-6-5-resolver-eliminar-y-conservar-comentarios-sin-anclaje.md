---
title: 'Resolver, eliminar y conservar comentarios sin anclaje'
type: 'feature'
created: '2026-10-03'
status: 'done'
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

La revisión BMAD del 2026-11-26 unificó la reconciliación de anclajes en el refresco manual y automático. Un comentario sin destino mantiene el texto y la última etiqueta publicada. Si ese destino vuelve a aparecer, se calcula la posición desde la proyección pública. La reapertura conserva el estado pendiente, la eliminación respeta el resto de la URL y el cursor sigue funcionando después de una eliminación lógica. La comprobación visual queda a cargo del usuario.

## Review Triage Log

| Capa | Hallazgo | Veredicto | Evidencia y ruta |
| --- | --- | --- |
| Ciega | Los anclajes no identifican instancias múltiples del mismo recurso. | medium · defer | El contrato actual guarda identidad de recurso o relación. Distinguir instancias requiere un identificador público estable y una política para comentarios previos. |
| Ciega | El cursor deja de funcionar tras eliminar la fila de frontera. | medium · patch | El cursor lee la clave de orden de la fila retirada y la lista sigue ocultando su texto. Persiste la limitación tras una purga física. |
| Ciega | La migración no comprueba destinos históricos que tenían coordenadas. | medium · defer | Una proyección con la misma huella no se reconstruye. Se requiere backfill de datos ya migrados. |
| Ciega | Reabrir el aviso seleccionado puede marcarlo leído otra vez. | medium · patch | Se registra la selección inicial aunque ya estuviera leída y se añade una prueba de reapertura. |
| Ciega | Las coordenadas no cambian al mover un destino publicado. | medium · patch | El refresco calcula la geometría pública actual y conserva la etiqueta histórica. |
| Ciega | La purga retira como máximo cien comentarios por hora. | medium · patch | La tarea continúa por lotes ordenados, sin solapar ciclos. |
| Ciega | Eliminar un comentario borra toda la consulta y el fragmento. | medium · patch | Se elimina solo `comment` si sigue vigente la misma navegación. |
| Casos límite | La reapertura se vuelve a marcar como leída. | medium · patch | El efecto solo registra una lectura por selección. |
| Casos límite | Una reapertura concurrente puede dejar `readAt` nulo entre dos sentencias. | medium · patch | El marcado idempotente de lectura usa una sola sentencia con `coalesce`. |
| Casos límite | Moderar la frontera invalida el cursor. | medium · patch | El cursor UUID sigue funcionando mientras exista el registro retenido. El cursor independiente de la fila queda diferido. |
| Casos límite | La actualización inicial deja anclados destinos históricos retirados. | medium · defer | La reconciliación se realiza al publicar una nueva proyección. Se registra el backfill histórico. |
| Casos límite | Una relación o recurso desplazado conserva la posición anterior. | medium · patch | Se comparte el cálculo de posición con el alta de comentarios. |
| Casos límite | Una cola no disponible puede omitir una actualización del Compartido. | medium · defer | El guardado privado y el encolado no son atómicos. Un registro durable de sincronización es trabajo aparte. |
| Casos límite | Una eliminación tardía puede navegar con una ubicación anterior. | medium · patch | Se compara la clave de ubicación antes de limpiar la selección. |
| Casos límite | La purga no drena vencimientos acumulados. | medium · patch | El worker sigue mientras el lote esté completo. |
| Verificación | Faltaba observar la reconciliación al actualizar automáticamente. | medium · patch | La integración ejecuta `syncAfterSave` para retirar y `refresh` para restaurar el destino en otra posición. |
| Verificación | Faltaba ejecutar la migración con datos de antes de 0029. | medium · defer | Se agrega al pendiente de backfill y verificación de migraciones en un entorno aislado. |
| Verificación | La auditoría podía omitirse sin fallar las pruebas. | medium · patch | Se comprueban las tres acciones y que la auditoría sobrevive a la purga. |
| Verificación | La prueba de purga no comprobaba los treinta días ni una fila aún vigente. | medium · patch | Se verifica el intervalo y que una eliminación dentro del período se conserva. La transacción de prueba se revierte. |
| Verificación | Faltaba verificar la confirmación del borrado en el panel. | medium · patch | La prueba comprueba Cancelar, el DELETE confirmado y que conserva el resto de la URL. |

La revisión retoma también el pendiente de 6.4 sobre CORS y permite `DELETE` desde los orígenes web configurados.

Pasaron 39 pruebas web focalizadas, 23 de API y la integración PostgreSQL. Ambos repositorios pasaron lint, build y comprobación de contrato.

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 6.5.
- `theke-api/src/modules/diagrams/comment-notifications.service.ts`.
- `theke-api/src/modules/diagrams/comment-anchor.ts`.
- `src/components/comments/CommentNotificationsPanel.tsx`.
