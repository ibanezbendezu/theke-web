---
title: 'Revisar una selección o un diagrama bajo demanda'
type: 'feature'
created: '2026-09-25'
status: 'in-progress'
---

## Intent

Mostrar bajo demanda el alcance real de una selección o Diagrama para revisión, con exclusiones y acceso a exploración manual mientras la integración de IA está pendiente.

## Criterios de aceptación

- El servidor autentica la Cuenta y deriva la pertenencia de nodos del Diagrama persistido; rechaza nodos solicitados que no existen allí.
- Recursos sin texto, repetidos o fuera del límite se excluyen sin exponer contenidos ni efectuar llamadas al proveedor.
- Preparar o descartar no altera el Diagrama ni registra consumo de inferencia.
- Hallazgos, sugerencias y streaming siguen pendientes hasta habilitar y verificar el proveedor real.

## Estado

Preparación de alcance implementada: `POST /v1/ai/diagram-review/prepare` comprueba que la selección pertenece al documento guardado y reutiliza exclusiones y límites por Cuenta; sin selección procesa el Diagrama entero. `DiagramEditor` ofrece alcance y vuelta a exploración manual sin generar hallazgos ni mutar datos. Pruebas de API/UI pasan. Inferencia fundamentada, streaming, auditoría y revisión humana siguen pendientes; esta Story continúa `in-progress`.