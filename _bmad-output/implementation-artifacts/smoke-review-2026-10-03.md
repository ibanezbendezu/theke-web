# Revisión smoke de Theke — 2026-10-03

Entorno: aplicación y API locales, mapa «Mapa de prueba 3.1», Compartido activo de la revisión 219. La revisión se hizo con la sesión del autor en el navegador integrado; además se consultó el endpoint público mediante una petición sin credenciales. No se usó una sesión anónima de navegador independiente. No se cambió la revisión pública ni se revocó el enlace.

## Recorridos comprobados

| Historia | Evidencia del recorrido | Estado de smoke |
| --- | --- | --- |
| 5.2, enlace público | GET sin credenciales: 200, proyección de solo lectura sin documento privado y `Cache-Control: no-store`. El enlace existente abre el Canvas público. | Parcial: falta sesión anónima aislada, TLS y secreto estable en despliegue. |
| 5.3, administración | El autor desactivó y reactivó nuevos comentarios. Con la opción desactivada, el formulario público desapareció, los comentarios previos permanecieron y el servidor rechazó un POST con 409. | Parcial: no se sustituyó ni revocó la publicación activa. |
| 5.4, exploración | Canvas y vista semántica muestran Recursos, Relaciones y etiquetas personalizadas legibles. Inspector y cierre con Escape devuelven el foco al invocador. Se revisó a 320 px, 768 px y escritorio. | Parcial: faltan medición de contenido útil en banda ancha y revisión de alto contraste y movimiento reducido. |
| 5.5, Recursos | El inspector de una nota abre en escritorio y como hoja inferior en móvil; el recorrido de foco funciona. | Parcial: la publicación usada no incluye un archivo, audio ni video para probar apertura, descarga, errores o subtítulos. |
| 6.1–6.3, comentarios | Con cuenta iniciada se creó un comentario sobre una Relación, se editó y se recuperó un borrador tras recargar. El borrador temporal se limpió. | Parcial: falta el primer comentario con cookie anónima en un navegador aislado y el conflicto de edición visual. |
| 6.4, avisos del autor | El comentario nuevo aumentó el contador, el aviso abrió el mapa y enfocó el marcador; al leerlo bajó el contador. Panel y filtros se revisaron en escritorio y móvil. | Recorrido principal comprobado. |
| 6.5, moderación | Se resolvió, reabrió y volvió a resolver el comentario de prueba. Un comentario anterior sin anclaje sigue visible con su último contexto seguro. Se inspeccionó la confirmación de eliminación y se canceló. | Parcial: no se eliminó un comentario ni se reconstruyó el Compartido para provocar un nuevo anclaje perdido. |

## Fallos corregidos durante la revisión

1. Una Relación personalizada de un Compartido anterior mostraba `custom:<id>` en el Canvas, la vista semántica, el inspector y la previsualización. La API ahora proyecta y reconstruye su etiqueta pública; la web comparte una función de presentación para esos lugares.
2. «Publicar comentario» y «Guardar cambios» quedaban deshabilitados para una cuenta iniciada sin token CSRF anónimo. La sesión verificada ya puede crear y editar sin exigir esa cookie.
3. A 320 px, Propiedades tapaba el panel de comentarios del autor. Ahora Propiedades se oculta mientras haya un panel izquierdo abierto en tamaños inferiores a `lg`; reaparece al cerrar ese panel.

El comentario de prueba permanece **resuelto** en el mapa. Su texto empieza por `SMOKE 2026-10-03` para distinguirlo del contenido real. La opción de nuevos comentarios quedó **activada** al terminar.

## Puertas que siguen abiertas

- Las historias 5.2–5.5 y 6.1–6.5 aún requieren revisión de código BMAD y los criterios parciales indicados arriba antes de cambiar su estado a `done`.
- La integración visual transversal aún necesita recorridos completos con datos reales en Inicio, Proyectos y Biblioteca. El otro mapa local mostraba cambios sin confirmar; no se usó como fixture.
- Las historias 4.2–4.4 siguen en desarrollo con el proveedor de IA aplazado; esta revisión no valida inferencia real.
- La política UX solicita subtítulos sincronizados para video, mientras la publicación implementa alternativa textual. Se requiere decisión de producto antes de cerrar 5.5.

## Seguimiento BMAD del 2026-10-03

- El usuario confirmó que aún no hay entorno desplegado y que la IA debe permanecer aplazada. Las historias 4.2–4.4 y el control operativo de 5.2 siguen abiertos por esas decisiones; no se habilitó el proveedor ni se publicó un entorno.
- La prueba de integración de Compartidos y la de comentarios pasaron con PostgreSQL real (2/2). La suite completa de web pasó (81/81) después de actualizar cuatro archivos de pruebas que montaban interfaces anteriores. API pasó 79 pruebas unitarias, 4 E2E con dobles, lint, build y contrato; web pasó lint, build y contrato.
- `sprint-status.yaml` tenía `last_updated` sin hora y una acción pendiente fuera del esquema. Se corrigieron ambos y la validación BMAD informa `valid: true`.

## Revisión de código y cierre local

- Los Compartidos antiguos ya no consultan etiquetas privadas de Relaciones al abrirse: la migración `0030` congela la etiqueta visible en la proyección publicada. Se aplicó a PostgreSQL local y pasó la integración de Compartidos y comentarios.
- La lista de comentarios públicos usa cursor estable y páginas de 100; el panel permite cargar los anteriores. La integración comprobó más de 100 comentarios, continuidad sin duplicados y rechazo de un cursor inválido.
- Los marcadores de comentarios se cargan aunque el panel esté cerrado o Clerk siga inicializando. Las imágenes externas de nodos visuales se solicitan solo tras «Mostrar imagen».
- Puertas finales locales: API lint, build, contrato, 79 pruebas unitarias y 4 E2E con dobles; PostgreSQL real 2/2. Web lint, build, contrato y 84/84 pruebas con dos workers. Se actualizaron pruebas obsoletas de autenticación, proyectos e IA. La ejecución web con workers ilimitados produjo esperas por carga de la máquina; la repetición acotada pasó completa.
- Permanecen abiertos los criterios que requieren entorno desplegado, proveedor de IA, contenido multimedia real o decisiones de producto. Ninguna de esas historias se marcó `done` sin evidencia.
