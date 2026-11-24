---
title: 'Adoptar una identidad anónima para comentar'
type: 'feature'
created: '2026-09-30'
status: 'done'
---

## Intent

Un visitante puede leer y comentar un Compartido sin registrarse ni completar un nombre. Al publicar el primer comentario recibe un alias científico y una identidad anónima limitada al Compartido. La identidad no concede acceso a comentarios ajenos y deja de ser válida al expirar la cookie.

## Implementación

- La API guarda el primer comentario y la identidad en una sola transacción; si falla la validación no persiste ninguno. La identidad se deriva mediante HMAC de una cookie firmada y del identificador del Compartido. Repetir un nombre no recupera propiedad.
- La cookie `__Host-theke-comment` es `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`, dura 30 días y no se renueva. El nombre no se guarda en ella. Las peticiones posteriores incluyen credenciales y token CSRF; el origen debe pertenecer a `WEB_ORIGINS` y el cuerpo debe ser JSON.
- Los comentarios se listan sin autenticación; la respuesta identifica cuáles pertenecen a la cookie vigente. El servidor asigna un alias científico estable por cookie y Compartido, sin usar el nombre enviado por clientes anteriores. El panel conserva el texto si hay un error. La publicación general prepara la base para los anclajes contextuales de la historia 6.2.
- Desde el 2026-10-01, iniciar sesión con Clerk permite vincular solo los comentarios de la cookie vigente a la cuenta verificada. El nombre público de la cuenta se toma del perfil local; el correo escrito no recupera comentarios. La migración `0027_public_comment_accounts.sql` conserva la autoría registrada incluso después de expirar la cookie.
- Se limita la creación a 5 comentarios/minuto y 30/hora por sesión, 20/minuto y 100/hora por huella IP HMAC, y 100/hora por Compartido. El rechazo devuelve 429 y `Retry-After`.
- La migración `0025_public_share_comments.sql` está aplicada en la base local. Contrato OpenAPI y cliente generado sincronizados.

## Verificación y estado

Pasaron la prueba de integración de PostgreSQL de identidad, aislamiento, CSRF y revocación; la prueba del panel; las ocho pruebas existentes de Compartido público; build y lint de API y web; y la comprobación de contrato. No se ejecutaron pruebas E2E, de acuerdo con la preferencia del proyecto.

La revisión BMAD del 2026-11-24 corrigió el conteo Unicode, la identidad y el reclamo frente a comentarios eliminados, la continuidad de cuotas al vincular una cuenta, la validación del Compartido y el tiempo de reintento. Pasaron 11 pruebas focalizadas, la integración PostgreSQL real, lint, build y contratos de API y web. La topología de proxies, el endurecimiento del runner de migraciones y la validación global de propiedades extra quedan registrados en `deferred-work.md`; no se ejecutó una suite E2E.

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 6.1.
- `theke-api/src/modules/diagrams/public-comments.service.ts`.
- `src/pages/PublicCommentsPanel.tsx`.

## Review Triage Log

| Capa | Hallazgo | Veredicto | Evidencia y ruta |
| --- | --- | --- | --- |
| blind-hunter | Los comentarios anteriores al primero 100 no son accesibles. | false | El código actual pagina 100 elementos con `cursor` y `nextCursor`; fue corregido por trabajo posterior. |
| blind-hunter | Los anclajes de Relación exponen `typeKey`. | false | La proyección actual usa `typeLabel`, etiqueta explícita o el catálogo común antes del fallback “Relación”. |
| blind-hunter | `Retry-After` siempre vale 60 segundos aunque se agote una cuota horaria. | medium · patch | El controlador fija 60 sin distinguir la cuota que produjo el 429. |
| blind-hunter | Reclamar comentarios cambia su propietario pero no el de sus mutaciones. | medium · patch | Las cuotas del propietario registrado omiten el historial anónimo después del reclamo. |
| blind-hunter | El reclamo incluye comentarios eliminados. | medium · patch | La actualización no filtra `deletedAt`. |
| blind-hunter | La identidad anónima puede derivarse solo de comentarios eliminados. | medium · patch | La consulta `own` de `list` no filtra `deletedAt`. |
| blind-hunter | La IP de cuota puede ser la del proxy. | maybe-false · defer | No hay una política de proxies confiables definida; debe resolverse con la configuración del despliegue antes de activar `trustProxy`. |
| blind-hunter | Las claves foráneas impiden eliminar Compartidos o comentarios. | false | El producto usa revocación y borrado suave; la purga elimina mutaciones antes del comentario. No se demostró una eliminación física ordinaria bloqueada. |
| blind-hunter | Una mutación puede declarar un Compartido distinto del comentario. | low · rejected | Solo el servicio interno inserta ambas claves desde el mismo Compartido; endurecerlo exige una clave compuesta y migración desproporcionadas para un estado no alcanzable. |
| blind-hunter | Drizzle no representa el índice parcial y el `check` de migración. | low · defer | Hay deriva de metadatos, pero las migraciones son SQL manuales; se registrará para un endurecimiento de esquema conjunto. |
| blind-hunter | Los sentinelas pueden omitir una migración parcialmente aplicada. | medium · defer | El runner comprueba una tabla/columna, no una migración transaccional registrada; requiere rediseñar la infraestructura de migraciones. |
| blind-hunter | El contrato omite 401 para rutas con autenticación opcional. | low · patch | Un bearer inválido sí puede ser rechazado por `ClerkAuthGuard`; el contrato debe declararlo. |
| blind-hunter | El reclamo puede devolver 415 y acepta propiedades extra pese al contrato. | low · patch | `requireCommentMutation` exige JSON, pero 415 no está documentado y el cuerpo no se valida. |
| blind-hunter | Crear y editar aceptan propiedades extra pese a `additionalProperties: false`. | low · defer | Es una brecha transversal de validación runtime del API, no exclusiva de esta historia; requiere una política global de DTO/validación. |
| blind-hunter | El contrato no permite coordenadas de fallback para Recurso y Relación. | false | El contrato actual ya incluye `x` e `y` en ambas variantes. |
| blind-hunter | La longitud usa unidades UTF-16 y rechaza caracteres astrales válidos. | medium · patch | `content.length` cuenta dos unidades por emoji; JSON Schema cuenta puntos de código. |
| verification-gap | Las cuotas IP, horarias y por Compartido no se verifican aisladamente. | medium · patch | La prueba existente alcanza primero `sessionMinute`; se añadirán escenarios aislados. |
| verification-gap | `OptionalClerkAuthGuard` no tiene prueba de su frontera. | medium · patch | Ninguna prueba ejecuta sus rutas sin header, con bearer válido e inválido. |
| verification-gap | La secuencia de migraciones desde una base vacía no se verifica. | medium · defer | Requiere PostgreSQL temporal y pertenece al endurecimiento del runner registrado en el hallazgo de sentinelas. |
| verification-gap | Reclamar sin cookie valida después el Compartido y devuelve 200 para un token inválido. | medium · patch | `claim` retorna antes de llamar `share`; debe validar primero el token activo. |
| edge-case-hunter | Unicode astral excede el límite por UTF-16. | medium · patch | carried: coincide con el hallazgo de longitud y se corregirá contando puntos de código. |
| edge-case-hunter | Más de 100 comentarios quedan inaccesibles. | false | carried: la paginación actual con cursor lo refuta. |
| edge-case-hunter | Reclamo sin cookie sobre token inválido devuelve 200. | medium · patch | carried: coincide con el hallazgo verificado de `claim`. |
| edge-case-hunter | Se reclaman comentarios eliminados. | medium · patch | carried: coincide con el filtro ausente en `claim`. |
| edge-case-hunter | `Retry-After` es incorrecto para cuotas horarias. | medium · patch | carried: coincide con el header fijo del controlador. |
| edge-case-hunter | Propiedades fuera del esquema se aceptan silenciosamente. | low · defer | carried: la validación global de cuerpos se abordará como deuda transversal. |
| edge-case-hunter | La cuota IP no distingue clientes detrás de proxy. | maybe-false · defer | carried: falta conocer la topología y lista de proxies confiables del despliegue. |
