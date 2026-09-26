---
title: 'Activar IA con consentimiento y alcance explícitos'
type: 'feature'
created: '2026-09-25'
status: 'done'
---

## Intent

Permitir al autor configurar el proveedor de IA, otorgar o revocar consentimiento explícito y acotar el alcance exacto de recursos enviados, asegurando el control humano, la transparencia en el uso de datos y la disponibilidad constante de las alternativas manuales.

## Criterios de aceptación

1. **Consentimiento informado y versionado**: Antes de cualquier análisis, Theke presenta las condiciones (OpenAI Responses con gpt-5.6-terra, store:false, reasoning effort medium, sin retención permanente ni entrenamiento de modelos, retención de logs de abuso por el proveedor hasta 30 días). No se envía ningún dato sin consentimiento explícito.
2. **Invalidación ante cambios**: Si cambian las condiciones o el proveedor materialmente, se invalida el consentimiento previo y se solicita nueva aceptación sin interrumpir el flujo manual.
3. **Control de cuotas y costes**: Validación pre-flight de cuotas (máx. 50.000 tokens de entrada, 4.000 tokens de salida, 10 ejecuciones diarias y USD $5 mensuales por Cuenta). Si se excede un límite, se deniega la petición explicando la causa y ofreciendo la vía manual.
4. **Alcance explícito (AI Guidance Card)**: La interfaz muestra con precisión los Recursos incluidos en el análisis por defecto (los seleccionados). La ampliación del alcance requiere acción explícita del autor.
5. **Detección de límites de contenido**: Si un recurso supera límites de tamaño o formato, se avisa explícitamente antes de ejecutar; nunca se omiten recursos o páginas de forma silenciosa.
6. **Desactivación y resiliencia**: El autor puede desactivar la IA en cualquier momento. Si la IA está desactivada o indisponible, las funciones manuales permanecen 100% operativas y el conocimiento previo permanece intacto.

## Tareas

- [x] Modelo de datos y migración para configuración de IA, registro de consentimiento versionado y consumo de cuotas por Cuenta.
- [x] Endpoints de configuración, estado de consentimiento, verificación de cuotas y alcance de IA en `theke-api`.
- [x] Componente `AIGuidanceCard` y modal de consentimiento informado en `theke-web`.
- [x] Panel de configuración de IA (activar/desactivar, estado de cuota, revocación de consentimiento) en `theke-web`.
- [x] Pruebas unitarias y de integración en API y Web para validación de consentimiento, cuotas y flujos degradados.

## Alcance y continuidad

Esta historia establece la infraestructura base de gobernanza, seguridad y consentimiento de IA. Las sugerencias automáticas de relaciones (Story 4.2), sugerencias de grupos (Story 4.3) y análisis de selecciones (Story 4.4) se construirán sobre este marco seguro.

## Verificación

- API: lint, build, pruebas con PostgreSQL de control de cuotas y consentimiento.
- Web: lint, build y validación de UI de AI Guidance Card y consentimiento.

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 4.1.
- Requisitos: FR-24, FR-25, NFR-5, NFR-14, NFR-15, NFR-16, NFR-18.
