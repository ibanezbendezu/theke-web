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
