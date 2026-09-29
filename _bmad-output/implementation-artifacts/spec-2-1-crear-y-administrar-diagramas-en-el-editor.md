---
title: 'Crear y administrar diagramas en el editor'
type: 'feature'
created: '2026-09-24'
status: 'done'
---

## Intent

Crear un mapa independiente por Proyecto y abrir su único Diagrama directamente en un editor de escritorio claro, recuperable y consistente con el tema elegido. Distintos mapas pueden reutilizar las mismas fuentes canónicas.

## Tasks

- [x] Crear un Diagrama de identidad estable y lienzo vacío junto con cada Proyecto.
- [x] Renombrar el mapa y duplicarlo en otro Proyecto sin duplicar Recursos canónicos.
- [x] Archivar, eliminar y restaurar después de revisar el impacto.
- [x] Editor con cabecera de 40 px, franja de 40 px y paneles de 224/304 px plegables.
- [x] Tema claro, oscuro o de sistema persistente y tokens semánticos.
- [x] Contrato, migración y pruebas focalizadas sincronizados.

## Ajuste de producto posterior

- Crear Proyecto y Diagrama en una sola transacción; abrir el Proyecto lleva directamente al editor.
- El panel izquierdo del editor organiza Recursos y Carpetas del mapa; el panel derecho conserva propiedades contextuales.
- Duplicar un Diagrama crea otro Proyecto. La migración `0021_one_map_per_project.sql` separa diagramas históricos y aplica unicidad a los no eliminados.
