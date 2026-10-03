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
