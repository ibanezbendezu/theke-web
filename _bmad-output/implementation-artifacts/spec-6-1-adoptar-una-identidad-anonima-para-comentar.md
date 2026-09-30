---
title: 'Adoptar una identidad anónima para comentar'
type: 'feature'
created: '2026-09-30'
status: 'review'
---

## Intent

Un visitante puede leer un Compartido y sus comentarios sin identificarse. Al publicar el primer comentario, elige un nombre visible y obtiene una identidad anónima limitada a ese Compartido. La identidad no concede acceso a comentarios ajenos y deja de ser válida al expirar la cookie.

## Implementación

- La API guarda el primer comentario y la identidad en una sola transacción; si falla la validación no persiste ninguno. La identidad se deriva mediante HMAC de una cookie firmada y del identificador del Compartido. Repetir un nombre no recupera propiedad.
- La cookie `__Host-theke-comment` es `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`, dura 30 días y no se renueva. El nombre no se guarda en ella. Las peticiones posteriores incluyen credenciales y token CSRF; el origen debe pertenecer a `WEB_ORIGINS` y el cuerpo debe ser JSON.
- Los comentarios se listan sin autenticación; la respuesta identifica cuáles pertenecen a la cookie vigente. El panel público solicita nombre solo al publicar y conserva el texto si hay un error. La publicación general prepara la base para los anclajes contextuales de la historia 6.2.
- Se limita la creación a 5 comentarios/minuto y 30/hora por sesión, 20/minuto y 100/hora por huella IP HMAC, y 100/hora por Compartido. El rechazo devuelve 429 y `Retry-After`.
- La migración `0025_public_share_comments.sql` está aplicada en la base local. Contrato OpenAPI y cliente generado sincronizados.

## Verificación y estado

Pasaron la prueba de integración de PostgreSQL de identidad, aislamiento, CSRF y revocación; la prueba del panel; las ocho pruebas existentes de Compartido público; build y lint de API y web; y la comprobación de contrato. No se ejecutaron pruebas E2E, de acuerdo con la preferencia del proyecto.

Pendiente para `done`: revisión de código BMAD y comprobación visual del panel en un Compartido real. La revisión visual de las historias 5.4 y 5.5 sigue registrada por separado.

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 6.1.
- `theke-api/src/modules/diagrams/public-comments.service.ts`.
- `src/pages/PublicCommentsPanel.tsx`.
