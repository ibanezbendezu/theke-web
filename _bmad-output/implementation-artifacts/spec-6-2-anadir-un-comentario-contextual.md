---
title: 'Añadir un comentario contextual'
type: 'feature'
created: '2026-09-30'
status: 'review'
---

## Intent

Permitir que un visitante comente una posición del mapa, un Recurso o una Relación de un Compartido sin modificar el conocimiento canónico.

## Implementación

- La herramienta visible permite elegir un punto, Recurso o Relación del Canvas. El clic derecho abre la acción «Comentar aquí». La Vista semántica ofrece controles separados para Recursos y Relaciones, y el control inferior permite comentar el centro visible sin precisión de puntero.
- El compositor muestra el contexto elegido, solicita nombre solo cuando falta identidad, anuncia errores y conserva el texto ante fallos. Guarda el borrador de la pestaña en `sessionStorage`; al volver tras recargar ofrece recuperarlo o descartarlo. Al cerrar temporalmente el panel conserva el texto en memoria.
- La API valida que Recursos y Relaciones pertenezcan a la proyección pública del Compartido. Guarda el identificador estable, una etiqueta mínima y la última coordenada conocida. Un punto debe tener coordenadas válidas. Los marcadores numerados abren el comentario en la lista; los destinos sin posición siguen disponibles en la lista.
- Las mutaciones requieren origen permitido, JSON, cookie y CSRF cuando existe identidad. Crear falla con 404 ante enlace revocado o destino no publicado, 409 si se cerraron comentarios y 429 con `Retry-After` al superar los límites. El aviso de límite registra solo la versión de la política, sin texto, token ni cookie. Los umbrales viven en una configuración versionada en Git.
- Se conserva el comentario general de 6.1 para compatibilidad con clientes anteriores. El contrato OpenAPI y el cliente web incluyen los anclajes nuevos.

## Verificación y estado

Pasaron las pruebas focalizadas de API con PostgreSQL para los tres anclajes, destino no publicado, coordenadas inválidas y límite por sesión; las pruebas del controlador para Origin, JSON, cookie y `Retry-After`; y las pruebas de interfaz para compositor, borrador, Vista semántica, menú contextual y marcador. Pasaron build, lint y comprobación de contrato en ambos repositorios. La preferencia del proyecto excluye pruebas E2E.

Pendiente para `done`: revisión de código BMAD y comprobación visual en navegador de un Compartido real, en escritorio y móvil. La edición de comentarios se implementará en la historia 6.3.

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 6.2.
- `theke-api/src/modules/diagrams/public-comments.service.ts`.
- `src/pages/PublicDiagramCanvas.tsx` y `src/pages/PublicCommentsPanel.tsx`.
