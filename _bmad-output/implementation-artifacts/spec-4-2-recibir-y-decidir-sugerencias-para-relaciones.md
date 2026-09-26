---
title: 'Recibir y decidir sugerencias para relaciones'
type: 'feature'
created: '2026-09-25'
status: 'in-progress'
---

## Intent

Permitir al autor solicitar asistencia de IA fundamentada al relacionar dos recursos, recibiendo propuestas con tipo, dirección, etiqueta, explicación y evidencia citada, manteniendo siempre la decisión humana (aceptar, editar, descartar o reportar error) antes de alterar el conocimiento canónico.

## Criterios de aceptación

1. **Sugerencias fundamentadas y delimitadas**: Con dos recursos en el alcance autorizado, Theke propone tipo, dirección, etiqueta, explicación y evidencia de la Biblioteca, diferenciando claramente evidencia citada, inferencias y vacíos a investigar.
2. **Honestidad epistémica ante vacíos**: Si falta evidencia suficiente, la IA señala incertidumbre o necesidad de búsqueda en lugar de inventar citas o fuentes.
3. **Flujo incremental y resiliente (SSE)**: Transmisión mediante Server-Sent Events (SSE) autenticado; ante desconexiones, se preserva el flujo manual.
4. **AI Guidance Card con decisión humana**: Opciones accesibles para Aceptar, Editar y Aceptar, Descartar o Informar error, mostrando procedencia (proveedor, modelo, fecha, insumos y edición humana).
5. **No mutación automática**: Descartar o rechazar no altera el grafo canónico; aceptar ejecuta el comando explícito registrando la auditoría.

## Tareas

- [x] Endpoint y servicio de inferencia de relaciones con OpenAI Responses (`gpt-5.6-terra`) respetando el consentimiento y alcance.
- [ ] Transmisión streaming de sugerencias estructuradas (tipo, dirección, etiqueta, explicación, citas y dudas).
- [ ] Integración en `RelationEditor` y `AIGuidanceCard` con controles interactivos de Aceptar/Editar/Descartar/Informar error (borrador, edición y descarte implementados; falta informe de error y aceptación explícita de tipo/dirección).
- [ ] Registro de procedencia y trazabilidad en el modelo canónico de Relaciones.
- [ ] Pruebas unitarias, de streaming y de componentes de UI.

## Avance de implementación

- Endpoint no streaming con verificación de consentimiento, alcance por Cuenta, citas literales y registro de consumo; pruebas unitarias de bloqueo y respuesta malformada.
- Tarjeta con preflight obligatorio y revisión separada del conocimiento canónico: aplicar una sugerencia solo rellena un borrador que debe guardarse manualmente.
- Pendiente antes de declarar `done`: SSE autenticado y recuperación de desconexión, informe de errores, aceptación explícita de tipo/dirección y pruebas de interacción del editor y de streaming.

## Verificación

- Backend: pruebas de validación de prompts, cuotas y respuestas estructuradas sin alucinación.
- Frontend: pruebas de interacción en `RelationEditor` con sugerencias de IA y modo manual.

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 4.2.
- Requisitos: FR-26, FR-29, FR-30, FR-31, NFR-5, NFR-16, NFR-17.
