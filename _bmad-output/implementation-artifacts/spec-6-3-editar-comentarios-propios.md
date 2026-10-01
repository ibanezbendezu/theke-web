---
title: 'Editar comentarios propios'
type: 'feature'
created: '2026-10-01'
status: 'review'
---

## Intent

Permitir que un visitante corrija sus comentarios en un Compartido mientras conserve su identidad anónima, sin alterar el anclaje ni los comentarios de otras personas.

## Implementación

- La lista ofrece Editar solo en comentarios propios cuando el Compartido acepta cambios. El compositor carga el texto vigente y muestra el contexto original. Guardar actualiza el comentario; Cancelar restaura el borrador de un comentario nuevo que hubiera en el compositor.
- La API exige cookie de identidad vigente, CSRF y origen permitido. Comprueba la propiedad con un hash vinculado al Compartido y responde 404 cuando el comentario no existe, fue eliminado o pertenece a otra identidad, sin revelar datos de esta última.
- Cada comentario tiene una revisión y fecha de edición. PATCH recibe la revisión esperada; ante un conflicto devuelve el texto vigente solo a su propietario. La interfaz conserva el borrador y pide elegir entre usar el texto vigente o conservar el borrador antes de volver a guardar.
- Un Compartido revocado o con comentarios deshabilitados, la identidad expirada y los límites de frecuencia impiden la mutación. El compositor conserva el texto local para copiarlo. Las creaciones y ediciones cuentan en la misma política de límites mediante un registro de mutaciones.
- La migración `0026_public_comment_edits.sql` agrega las columnas y el registro de mutaciones; el contrato OpenAPI y el cliente generado incluyen PATCH, revisión y fecha de edición.
- Extensión de identidad acordada el 2026-10-01: un comentario anónimo recibe un alias científico estable por cookie sin solicitar nombre. La migración `0027_public_comment_accounts.sql` permite vincular solo los comentarios de la cookie vigente a una cuenta Clerk verificada. Los comentarios firmados pueden editarse desde otra sesión de esa cuenta; cerrar sesión no devuelve su edición a la cookie anónima. Los marcadores muestran el nombre público del autor al pasar el puntero o recibir foco.

## Verificación y estado

Pasaron las pruebas focalizadas de API con PostgreSQL para edición propia, conflicto de revisión, identidad expirada, otra identidad, comentario eliminado y comentarios deshabilitados; y las pruebas del controlador para Origin, JSON y cookie. Pasaron las pruebas focalizadas de interfaz para edición, cancelación y conflicto. Pasaron build, lint y comprobación de contrato en ambos repositorios. La migración se aplicó localmente. La preferencia del proyecto excluye pruebas E2E.

La extensión de identidad se verificó con PostgreSQL para asignación de alias, aislamiento entre Compartidos, vinculación con CSRF, rechazo de reclamo por otra cuenta y edición posterior con cuenta verificada. Las pruebas de interfaz cubren publicación sin nombre, vinculación tras iniciar sesión y nombre accesible del marcador.

Pendiente para `done`: revisión de código BMAD y comprobación visual en navegador de un Compartido real, en escritorio y móvil.

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 6.3.
- `theke-api/src/modules/diagrams/public-comments.service.ts`.
- `src/pages/PublicCommentsPanel.tsx`.
