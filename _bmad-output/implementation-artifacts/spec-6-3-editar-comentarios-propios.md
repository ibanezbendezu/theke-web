---
title: 'Editar comentarios propios'
type: 'feature'
created: '2026-10-01'
status: 'done'
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

La revisión BMAD del 2026-11-26 corrigió la pérdida de foco al terminar, la cancelación durante un guardado y la actualización de la lista cuando llegan lecturas antiguas o el servidor informa de un conflicto. Si la identidad se pierde o el Compartido deja de aceptar cambios, el panel explica el bloqueo y conserva el texto para copiarlo. La comprobación visual en escritorio y móvil queda a cargo del usuario.

Pasaron 32 pruebas focalizadas de web, 7 de API y una integración con PostgreSQL que confirma la cuota compartida entre creación y edición. Ambos repositorios pasan lint, build y comprobación de contrato.

## Review Triage Log

| Capa | Hallazgo | Veredicto | Evidencia y ruta |
| --- | --- | --- | --- |
| Ciega | Cancelar durante PATCH borra el borrador anterior cuando llega el éxito. | medium · patch | Cancelar y Escape esperan el desenlace de la edición. La prueba simula un PATCH pendiente con otro borrador en memoria. |
| Ciega | Entrar a Editar durante POST mezcla los dos flujos. | medium · patch | Editar está deshabilitado cuando hay una mutación en curso. |
| Ciega | Un GET anterior revierte una revisión confirmada. | medium · patch | Se conservan los campos de texto de la revisión mayor al aplicar el listado. El GET sigue siendo la fuente de permisos y anclaje. |
| Ciega | El vencimiento anónimo deshabilita Guardar en silencio. | medium · patch | El panel muestra el motivo y mantiene el campo disponible para copiar. |
| Ciega | El 409 de revisión conserva texto obsoleto en la lista. | medium · patch | Se actualiza la fila con la revisión devuelta y el borrador queda intacto hasta que la persona decida. |
| Ciega | Retirar un comentario que sirve de cursor oculta páginas anteriores. | medium · defer | Es el hallazgo de paginación registrado en la 6.2 para moderación en la 6.5. |
| Ciega | El guardado sigue habilitado cuando cambia `enabled`. | medium · patch | La disponibilidad del Compartido también se comprueba al enviar el formulario. |
| Ciega | Guardar el mismo texto incrementa la revisión y consume cuota. | low · defer | El servidor trata cualquier guardado explícito y válido como una edición. Se registra la deduplicación como mejora separada. |
| Ciega | Cancelar deja el foco fuera del diálogo. | medium · patch | El foco vuelve al compositor al terminar y se comprueba en la prueba de cancelación. |
| Casos límite | Una lectura tardía reemplaza contenido recién guardado. | medium · patch | La combinación por revisión conserva el texto confirmado. |
| Casos límite | Cancelar o Escape actúa mientras PATCH está pendiente. | medium · patch | El botón y el manejo de teclado respetan el estado de guardado. |
| Casos límite | Un sondeo sin CSRF oculta la causa del bloqueo. | medium · patch | Una prueba elimina la identidad desde el listado mientras hay un borrador activo. |
| Casos límite | El 409 por comentarios cerrados deja Guardar habilitado. | medium · patch | El editor bloquea el guardado actual y conserva el texto. Un 409 de revisión mantiene el flujo de resolución. |
| Casos límite | Terminar la edición elimina el control enfocado. | medium · patch | El compositor recupera el foco al guardar o cancelar. |
| Verificación | El test de PATCH no observa la URL. | medium · patch | Se comprueba la ruta completa con token e identificador del comentario. |
| Verificación | Falta comprobar «Usar texto vigente». | medium · patch | Se ejecutan ambas decisiones y se comprueba el cuerpo del siguiente PATCH. |
| Verificación | Cancelar se prueba con un compositor vacío. | medium · patch | Se comprueba que vuelve un borrador anterior con texto. |
| Verificación | La integración no comprueba que editar consume la cuota común. | medium · patch | La edición ocupa el quinto cupo y la publicación siguiente recibe 429. |
| Verificación | La integración se omite sin configuración PostgreSQL. | medium · defer | El proceso de prueba permite correr sin base por diseño. En esta revisión se ejecuta de forma explícita con PostgreSQL configurado. |
| Verificación | El refresco puede revertir una revisión más nueva. | medium · patch | Hay una prueba que resuelve el GET viejo después de confirmar el PATCH. |

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 6.3.
- `theke-api/src/modules/diagrams/public-comments.service.ts`.
- `src/pages/PublicCommentsPanel.tsx`.
