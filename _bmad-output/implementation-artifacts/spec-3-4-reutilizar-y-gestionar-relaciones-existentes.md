---
title: 'Reutilizar y gestionar relaciones existentes'
type: 'feature'
created: '2026-09-28'
status: 'done'
---

## Intent

Permitir que una Relación canónica se muestre en distintos Diagramas por decisión del autor, mientras su visibilidad y posición siguen siendo locales a cada Canvas.

## Criterios de aceptación

- El Diagrama informa qué Relaciones canónicas ya existen entre sus Recursos representados y no las muestra automáticamente.
- «Mostrar aquí» añade solo una visualización local y conserva la identidad, explicación, evidencia, dirección y procedencia canónicas.
- Ocultar o quitar una línea afecta solo al Diagrama actual.
- Archivar o eliminar una Relación canónica exige revisar sus usos y confirmar el impacto; si los usos cambian, la operación se rechaza y pide una nueva revisión.

## Estado y evidencia

Registro retrospectivo de la Story 3.4, que ya figuraba `done` en `sprint-status.yaml` sin especificación individual. `RelationService.available()` obtiene las Relaciones elegibles que aún no aparecen en el Diagrama. `DiagramWorkspace` presenta «Mostrar aquí»; `CanvasRelationInspector` permite ocultar o quitar la visualización local. El flujo de impacto calcula ubicaciones y versión de impacto para operaciones globales. `tests/relation.service.test.ts` cubre reutilización en un segundo Diagrama, conservación de evidencia, cambios de uso que invalidan una eliminación, archivo, restauración y eliminación sin usos.

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 3.4.
- `theke-api/src/modules/relations/relation.service.ts` y `theke-api/tests/relation.service.test.ts`.
- `theke-web/src/pages/DiagramWorkspace.tsx` y `theke-web/src/features/canvas/CanvasRelationInspector.tsx`.
