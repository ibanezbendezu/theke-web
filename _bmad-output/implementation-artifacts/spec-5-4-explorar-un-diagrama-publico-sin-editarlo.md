---
title: 'Explorar un diagrama público sin editarlo'
type: 'feature'
created: '2026-09-28'
status: 'done'
baseline_commit: '24c9d98604c323932b0aeeb578f2a0bc21509aab'
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

Las pruebas focalizadas de proyección pública y vista compartida, lint y build de API y web pasan. El 2026-10-03 se revisó una publicación real en Canvas y vista semántica a 320 px, 768 px y escritorio: selección, inspector, foco al cerrar y etiquetas de Relaciones personalizadas.

El 2026-11-24 se midió una publicación real desde la navegación del producto: el Canvas y sus controles estuvieron disponibles en 1.796 ms en el entorno local. Esta medición valida la ruta y el presupuesto de carga local, pero no sustituye la comprobación con latencia y transferencia de banda ancha en el despliegue pendiente. Se comprobó la inspección de una Relación, la navegación de sus extremos, la vista semántica y la ausencia de herramientas de edición. La carga de medios pesados continúa siendo bajo demanda y está cubierta por las pruebas focalizadas. Las superficies translúcidas públicas ahora se vuelven opacas cuando el navegador no soporta desenfoque, cuando se solicita mayor contraste o cuando está activo el modo de colores forzados; este último también conserva un foco visible con el color del sistema. El movimiento reducido elimina animaciones y transiciones no esenciales. `eslint`, el build de producción y las 15 pruebas de `tests/public-share.test.tsx` pasan.

## Review Triage Log

| Capa | Hallazgo | Veredicto | Evidencia y ruta |
| --- | --- | --- | --- |
| blind-hunter | El estado `in-review` no sería reconocido. | false | `step-04-review.md` exige explícitamente `in-review` en el spec; `review` corresponde al estado separado de `sprint-status.yaml`. |
| blind-hunter | El aplazamiento de la épica 6 usaba `source_spec: none`. | low | La trazabilidad era imprecisa. Se corrigió para apuntar a `epics.md`, historias 6.1–6.5. Ruta: patch. |
| blind-hunter | El tooltip de Relación y el menú contextual seguían translúcidos en contraste aumentado. | medium | Ambos podían aparecer sobre contenido del Canvas sin recibir el fallback opaco. Se añadió `public-share-surface` a las dos superficies. Ruta: patch. |
| blind-hunter | El fallback ignoraba navegadores con soporte exclusivo de `-webkit-backdrop-filter`. | low | La condición trataba soporte prefijado como ausencia total. Ahora prueba la alternativa estándar o prefijada y desactiva ambas propiedades en el fallback. Ruta: patch. |
| blind-hunter | La medición local no demuestra el objetivo en banda ancha. | medium | No hay perfil remoto, caché fría ni latencia de despliegue. Se corrigió el alcance de la evidencia y se registró la comprobación desplegada en `deferred-work.md`. Ruta: defer. |
| blind-hunter | Las reglas de contraste no tenían comprobación ejecutable. | medium | Los 14 tests anteriores no cargaban ni inspeccionaban estas reglas. Se añadió cobertura de las clases aplicadas y de las reglas CSS de soporte, contraste y foco; ahora pasan 15 tests. Ruta: patch. |
| edge-case-hunter | La condición de soporte prefijado podía activar el fallback incorrectamente. | low | Confirma el cuarto hallazgo; quedó corregido con una consulta combinada estándar/prefijada. Ruta: patch. |
| verification-gap | La vista pública podía perder opacidad o foco sin que fallara la suite. | medium | Se añadieron assertions sobre título, navegación, panel semántico, etiqueta de grupo, menú contextual y reglas CSS de contraste/colores forzados. Ruta: patch. |

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 5.4.
- `theke-api/src/modules/diagrams/share-preview.service.ts`.
- `theke-web/src/pages/PublicDiagramCanvas.tsx` y `theke-web/src/pages/PublicShare.tsx`.
