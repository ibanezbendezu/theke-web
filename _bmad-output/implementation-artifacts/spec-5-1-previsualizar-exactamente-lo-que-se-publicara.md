---
title: 'Previsualizar exactamente lo que se publicará'
type: 'feature'
created: '2026-09-26'
status: 'done'
---

## Intent

Revisar privadamente la proyección de contenido compartible de un Diagrama y detectar datos sensibles o problemas de accesibilidad antes de cualquier publicación. La Story 5.2, no esta historia, habilitará enlaces públicos.

## Criterios de aceptación

- Una ruta autenticada por Cuenta construye la previsualización desde la revisión guardada y devuelve únicamente campos de una lista explícita de Recursos representados y Relaciones visibles; nunca serializa el documento JSONB, Carpetas, Proyectos, propiedades privadas ni recursos relacionados que no estén representados.
- El autor ve la revisión, el inventario de campos y la experiencia de lectura correspondiente a esa proyección, con advertencias de accesibilidad para multimedia sin texto alternativo. Si hay referencias retiradas o ajenas, la preparación falla cerrada.
- Si modifica representaciones o contenido, debe guardar, recalcular y revisar una nueva previsualización. No hay opción de publicar en esta fase; la publicación futura deberá verificar de forma atómica tanto la revisión del Diagrama como los cambios en contenido y relaciones desde la confirmación.
- El acceso sigue siendo privado, no se crea token ni se altera el Diagrama o los Recursos; se comprueba con pruebas de aislamiento de Cuenta, campos omitidos y contenido inaccesible.

## Estado

Completada la previsualización privada de la revisión guardada. El endpoint autenticado aplica una lista estricta de campos, omite representaciones ocultas, falla cerrado para referencias privadas o retiradas y señala problemas de accesibilidad antes de compartir. La interfaz exige un guardado completo, muestra el inventario, permite recalcular y comparar cambios sin publicar ni modificar conocimiento.

Publicación, enlace público, instantánea transaccional/versionada del inventario y experiencia pública interactiva permanecen fuera de esta historia y pendientes de la 5.2–5.5. Antes de habilitar un enlace público, la Story 5.2 deberá verificar atómicamente revisión y versiones de Recursos y Relaciones y reutilizar esta misma política de proyección, sin entregar referencias privadas ni URLs de almacenamiento.

## Verificación

- API: build, lint, contrato sincronizado y 53 pruebas aprobadas; 13 dependientes de infraestructura local omitidas por su configuración existente.
- Web: build, contrato sincronizado y 53 pruebas aprobadas, incluidas previsualización y comparación de inventarios. La lint global mantiene tres errores previos en componentes de IA ajenos a esta historia.

## Ajuste de producto (2026-10-07)

Se conserva la proyección privada y su validación de campos permitidos. La interfaz de Compartir ya no exige revisar un inventario extenso: informa una sola vez que los cambios guardados se harán públicos, bloquea la creación si la proyección no está lista y verifica la huella al crear el enlace. El inventario anterior describe la implementación histórica de esta historia.
