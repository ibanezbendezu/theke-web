- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-acceder-al-espacio-privado.md`
  summary: Evitar que breadcrumbs con percent-encoding malformado rompan el shell.
  evidence: `decodeURIComponent` puede lanzar; el comportamiento ya existía antes de la historia 1.1.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-acceder-al-espacio-privado.md`
  summary: Endurecer `onConnectEnd` cuando el target no sea un Element.
  evidence: El cast permite `classList` sobre targets incompatibles; el comportamiento es preexistente.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-acceder-al-espacio-privado.md`
  summary: Endurecer conexiones táctiles sin un primer touch disponible.
  evidence: El acceso a `touches[0]` puede producir coordenadas indefinidas; el comportamiento es preexistente.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-acceder-al-espacio-privado.md`
  summary: Limpiar `connectingNodeId` al cancelar el menú de conexión.
  evidence: Cerrar el menú sin crear un nodo conserva la referencia; el comportamiento es preexistente.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-9-archivar-o-eliminar-con-impacto-visible.md`
  summary: Cerrar el gate operativo del piloto: Railway snapshots/PITR, backup nocturno PostgreSQL/objetos en Backblaze B2 con Object Lock, restore drill mensual y export ZIP previa a eliminación de contenido o cuenta.
  evidence: Requiere cuentas, credenciales, política aprobada y ejecución en infraestructura externa; `theke-api/docs/data-retention-and-recovery.md` define el checklist y prohíbe declarar el piloto listo antes de cerrarlo.
- source_spec: `_bmad-output/implementation-artifacts/spec-4-2-recibir-y-decidir-sugerencias-para-relaciones.md`
  summary: Habilitar deliberadamente el proveedor de IA tras verificar credenciales y privacidad; implementar SSE, aceptación de tipo/dirección con auditoría y prueba de inferencia real.
  evidence: La inferencia permanece cerrada por defecto mediante `AI_PROVIDER_ENABLED`; las Stories 4.2–4.4 siguen abiertas y las preparaciones no envían recursos ni generan sugerencias.
- source_spec: `_bmad-output/implementation-artifacts/spec-5-2-publicar-mediante-un-enlace-no-listado.md`
  summary: Configurar `SHARE_TOKEN_SECRET` de forma estable en el despliegue y verificar TLS, Clerk y apertura pública real sin sesión.
  evidence: Se generó un secreto local aleatorio de 48 bytes en `theke-api/.env`, ignorado por Git. El servidor ya entrega archivos con token validado sin exponer el bucket, audita publicación y reintentos, y las migraciones 0017/0018 se aplicaron al PostgreSQL de desarrollo. La prueba de integración usa PostgreSQL; queda pendiente la comprobación operativa de la Story 5.2 antes de marcarla done.
- source_spec: `_bmad-output/implementation-artifacts/spec-5-3-administrar-un-compartido-vivo-y-revocable.md`
  summary: En la Story 6.2, exigir `commentsEnabled` del Compartido activo antes de aceptar nuevos comentarios y conservar los comentarios anteriores al desactivarlo.
  evidence: La Story 5.3 guarda y publica la configuración, pero todavía no existe el endpoint de comentarios. La Story 5.3 queda en review hasta revisar también el flujo real con Clerk y navegador.
- source_spec: `_bmad-output/implementation-artifacts/spec-5-4-explorar-un-diagrama-publico-sin-editarlo.md`
  summary: Verificar el Canvas público con una publicación real en navegador, navegación por teclado, alto contraste, movimiento reducido y tiempo de contenido útil en banda ancha.
  evidence: La proyección y la UI están implementadas con pruebas focalizadas, pero el navegador de automatización no estuvo disponible en esta sesión. La Story 5.4 permanece in-progress.
