---
title: 'Reutilizar y gestionar relaciones existentes'
type: 'feature'
created: '2026-09-28'
status: 'done'
---

## Revisión de producto (2026-10-04)

Esta decisión sustituye los criterios originales de reutilización global que figuran debajo. Cada proyecto contiene un mapa independiente. Los Recursos de la Biblioteca son reutilizables, mientras que la interpretación que los conecta (tipo, etiqueta, explicación, procedencia y evidencia) pertenece al mapa. Dos mapas pueden usar las mismas fuentes y expresar relaciones distintas sin compartir identidad ni cambios.

- Crear una Relación en un mapa no la propone en otros. Dentro del mismo mapa, una Relación equivalente puede reutilizarse para otra línea.
- Quitar la última línea y guardar el mapa marca la Relación como eliminada y recuperable durante 30 días. Ocultar una línea conserva la Relación. Deshacer antes de guardar evita la eliminación; volver a guardar una revisión que la contiene puede restaurarla.
- Duplicar un mapa copia sus Relaciones y evidencias con nuevas identidades.
- Las migraciones `0031_map_scoped_relations.sql` y `0032_retire_unshown_relations.sql` separan las Relaciones antiguas compartidas entre mapas, conservan las referencias en documentos y revisiones y retiran de las sugerencias las Relaciones presentes solo en el historial. Los registros antiguos sin mapa quedan heredados y fuera de las sugerencias.
- Compartir Relaciones entre mapas sería una función futura explícita, con su propia política de edición e impacto.

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
