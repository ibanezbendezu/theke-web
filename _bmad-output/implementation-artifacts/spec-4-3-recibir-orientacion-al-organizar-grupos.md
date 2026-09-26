---
title: 'Recibir orientación al organizar grupos'
type: 'feature'
created: '2026-09-25'
status: 'in-progress'
---

## Intent

Preparar de forma privada el alcance de un grupo visual para futura orientación contextual sin generar resultados ficticios ni alterar el grupo.

## Criterios de aceptación

- Autorización por Cuenta y resolución de miembros desde el Diagrama persistido, no desde listas enviadas por el navegador.
- Recursos analizables deduplicados, con exclusiones de representaciones no analizables, recursos sin texto y límites de tamaño claramente visibles.
- La preparación no llama al proveedor ni consume cuota; el editor manual continúa disponible.
- La orientación inferida y sus decisiones humanas quedan pendientes de integración real del proveedor.

## Estado

Preparación de alcance implementada: `POST /v1/ai/group-guidance/prepare` verifica Cuenta, Diagrama y miembros guardados; deduplica recursos, excluye contenido inaccesible o fuera del límite y devuelve `PROVIDER_PENDING`. `CanvasGroupInspector` muestra los resultados sin cambiar el grupo. Pruebas de API/UI pasan. La orientación inferida y la revisión humana completa siguen pendientes; esta Story continúa `in-progress`.