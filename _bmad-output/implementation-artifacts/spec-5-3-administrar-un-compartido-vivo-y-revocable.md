---
title: 'Administrar un compartido vivo y revocable'
type: 'feature'
created: '2026-09-28'
status: 'review'
---

## Intent

Dar al autor control explícito sobre comentarios, revisión pública y revocación del enlace activo sin cambiar su Diagrama privado ni exponer contenido que no haya revisado.

## Criterios de aceptación

- El autor consulta el estado y enlace del Compartido activo desde su Cuenta; cambia la opción de nuevos comentarios sin cambiar el token ni borrar comentarios históricos.
- Una actualización exige previsualización vigente y la huella de la versión pública esperada. Proyección, archivos fijados y huella se sustituyen dentro de una transacción; si falla, permanece la versión pública anterior íntegra.
- La revocación exige confirmar `REVOCAR` y la huella publicada esperada. El token deja de servir nuevas lecturas; el Diagrama privado no cambia.
- Una nueva publicación tras revocar genera un token distinto y conserva el registro histórico anterior para el autor. La configuración de comentarios se expone en la respuesta pública para que la futura interfaz de comentarios la respete.

## Estado

En revisión. Se añadieron los endpoints autenticados para consultar, cambiar comentarios, actualizar y revocar el Compartido activo; `diagram_shares.comments_enabled` y auditoría de esas decisiones. El diálogo de previsualización muestra el enlace, el control de comentarios, la actualización desde un inventario guardado y la confirmación de revocación. La vista pública indica si se permiten nuevos comentarios. La migración `0019_diagram_share_management.sql` se aplicó al PostgreSQL de desarrollo.

Una prueba de integración con PostgreSQL cubre actualización íntegra, rechazo de huellas obsoletas, cambios de comentarios, revocación, indisponibilidad del token anterior, republicación con otro token y auditoría. API: lint, build y contrato pasaron; web: build, contrato y pruebas focalizadas pasaron. El lint global de web conserva tres errores previos en componentes de IA ajenos a esta historia.

Pendiente antes de `done`: revisión de código y flujo real con Clerk y navegador tras cerrar el control de despliegue de 5.2. La Story 6.2 debe comprobar `commentsEnabled` en el servidor antes de aceptar nuevos comentarios; todavía no existe un endpoint de comentarios. La interfaz pública interactiva del Canvas corresponde a 5.4.

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 5.3.
- `theke-api/src/modules/diagrams/diagram-share.service.ts` y `theke-api/tests/diagram-share.integration.test.ts`.
- `theke-web/src/features/canvas/SharePreviewDialog.tsx` y `theke-web/src/pages/PublicShare.tsx`.
