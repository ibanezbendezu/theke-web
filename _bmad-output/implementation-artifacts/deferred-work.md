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
  evidence: El 2026-10-03 el usuario decidió mantener aplazado el proveedor. `AI_PROVIDER_ENABLED` sigue cerrado por defecto; las Stories 4.2–4.4 continúan abiertas y las preparaciones no envían recursos ni generan sugerencias.
- source_spec: `_bmad-output/implementation-artifacts/spec-5-2-publicar-mediante-un-enlace-no-listado.md`
  summary: Configurar `SHARE_TOKEN_SECRET` de forma estable en el despliegue y verificar TLS, Clerk y apertura pública real sin sesión.
  evidence: El 2026-10-03 el usuario confirmó que todavía no existe un entorno desplegado. El secreto local permanece ignorado por Git; la prueba de integración real con PostgreSQL pasó y GET público sin credenciales respondió 200 con `no-store`, pero esto no verifica TLS ni un navegador anónimo aislado.
- source_spec: `_bmad-output/implementation-artifacts/spec-5-3-administrar-un-compartido-vivo-y-revocable.md`
  summary: Revisar el flujo de actualización y revocación de un Compartido real en una publicación de prueba aislada.
  evidence: El endpoint de comentarios ya exige `commentsEnabled`. El 2026-10-03 se desactivó y reactivó la opción en el navegador: la lista histórica permaneció y POST respondió 409 mientras estaba cerrada. Actualización y revocación pasaron con PostgreSQL, pero no se ejercieron sobre el enlace activo del usuario.
- source_spec: `_bmad-output/implementation-artifacts/spec-5-4-explorar-un-diagrama-publico-sin-editarlo.md`
  summary: Medir tiempo de contenido útil en banda ancha y comprobar preferencias de alto contraste y movimiento reducido.
  evidence: El 2026-10-03 se revisó una publicación real en Canvas y vista semántica a 320 px, 768 px y escritorio, con selección, inspector y retorno de foco. La Story 5.4 permanece in-progress por los criterios de medición y preferencias visuales.
- source_spec: `_bmad-output/implementation-artifacts/spec-5-5-abrir-recursos-publicos-en-cualquier-dispositivo.md`
  summary: Probar archivos y multimedia en una publicación real y decidir cómo representar subtítulos sincronizados para video.
  evidence: El 2026-10-03 se revisó una nota pública en escritorio, tablet y 320 px, incluido el foco de la hoja inferior móvil. El Compartido de prueba no contiene archivos; las pruebas de API con PostgreSQL cubren apertura y revocación de medios. El modelo publicado solo contiene alternativa textual para video, mientras UX exige subtítulos sincronizados.
