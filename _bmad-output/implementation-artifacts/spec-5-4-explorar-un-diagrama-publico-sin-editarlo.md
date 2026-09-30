---
title: 'Explorar un diagrama público sin editarlo'
type: 'feature'
created: '2026-09-28'
status: 'in-progress'
---

## Intent

Permitir al visitante recorrer una proyección pública del Diagrama mediante un Canvas de solo lectura y una vista semántica accesible, sin recibir el documento privado del editor.

## Criterios de aceptación

- El autor revisa antes de publicar las posiciones y conexiones visibles; la huella cambia si cambia la composición pública.
- El visitante puede hacer zoom, paneo y seleccionar tarjetas y Relaciones, mientras la composición y los Recursos permanecen sin controles de edición.
- La vista semántica ofrece botones navegables por teclado para seleccionar Recursos y Relaciones; el inspector muestra extremos, dirección, explicación y evidencia publicada.
- Medios pesados se solicitan solo al seleccionar el Recurso; el enlace conserva respuesta neutra si no está disponible.
- Se respetan foco visible, movimiento reducido y colores de alto contraste.

## Estado

En desarrollo. La API genera una proyección pública explícita de los elementos visibles del mapa: recursos, carpetas representadas, grupos, anotaciones, elementos visuales heredados, conexiones y fondo. Convierte las posiciones de los hijos de grupos a coordenadas absolutas y no publica el documento privado ni las claves de almacenamiento. La evidencia de Relación se limita a Recursos incluidos en la publicación. La huella incluye toda esta composición y la evidencia. Los Compartidos anteriores conservan su revisión publicada hasta que el autor recalcule y confirme «Actualizar revisión pública».

La web presenta el mapa público en un lienzo a pantalla completa con el fondo, tarjetas, grupos, anotaciones, conexiones y panel de detalles del editor, sin herramientas de edición ni mutaciones. La previsualización privada muestra también el mapa antes de publicar. La vista semántica permite recorrer el contenido con controles nativos de teclado. El inspector carga archivos solo al seleccionarlos. Se añadieron estilos para foco, movimiento reducido y alto contraste.

Revisión de composición: el Canvas y el inspector ahora coexisten en escritorio amplio. En tablet el detalle aparece como panel superpuesto cerrable y en móvil como hoja inferior; `Escape` y el botón de cierre devuelven el foco al elemento invocador. Cuando una publicación carece de posiciones visuales, la vista semántica aparece directamente. Los controles y filas públicas usan superficies tonales del Design Spine y objetivos táctiles de al menos 44 px.

Las pruebas focalizadas de proyección pública y vista compartida, lint y build de API y web pasan. Pendiente para pasar a `review`: smoke visual en navegador con una publicación real y una comprobación de tiempo de contenido útil en banda ancha. `@Browser` no estuvo disponible en esta sesión; las pruebas de componentes no sustituyen esa verificación.

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 5.4.
- `theke-api/src/modules/diagrams/share-preview.service.ts`.
- `theke-web/src/pages/PublicDiagramCanvas.tsx` y `theke-web/src/pages/PublicShare.tsx`.
