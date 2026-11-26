---
title: 'Consultar recursos desde el mapa'
type: 'feature'
created: '2026-11-26'
status: 'in-review'
route: 'dispatch'
baseline_commit: '43df9e145b4a3e197ee62b34dec3d87f8b34ca25'
---

## Intent

Implementar la propuesta aprobada por el usuario: abrir recursos desde nodos en un visor amplio con la apariencia de Biblioteca. El editor conserva propiedades locales del nodo en su inspector. El mapa público ofrece apertura del contenido y contexto por separado.

## Code Map

- `src/components/resources/PdfDocumentViewer.tsx` proporciona el PDF de Biblioteca.
- `src/features/canvas/CanvasResourceInspector.tsx` mezcla vista previa y edición local.
- `src/pages/PublicShare.tsx` abre detalles automáticamente al seleccionar.
- `src/pages/PublicDiagramCanvas.tsx` usa ResourceCard con acciones de apertura.
- `src/store/useCanvasStore.ts` centraliza apertura de nodos.

## Tasks & Acceptance

- Crear visor compartido para archivo, nota y enlace con PDF, imagen y multimedia, errores recuperables, cierre y foco.
- Conectar apertura del nodo del editor por botón, doble clic y teclado al visor privado.
- Conservar etiqueta, tamaño, acento y visibilidad en Propiedades, con acceso explícito a Biblioteca.
- En público, seleccionar recurso mantiene detalles cerrados. Abrir muestra visor y Ver contexto abre descripción publicada y relaciones.
- Given un mapa abierto, when se cierra el visor, then permanece el mismo mapa y encuadre.
- Given un visitante, when abre un recurso, then se usan exclusivamente la proyección y rutas públicas.

## Design Notes

Reutilizar tipografía y tokens del tema Theke. Cabecera compacta, contenido central extendido, fondo desenfocado y scroll dentro del contenido. Propiedades del visor en columna lateral, sin sombras adicionales.

## Verification

Ejecutar pruebas focalizadas relevantes, lint y build. Se revisaron en Browser las pestañas del editor y del mapa compartido, por solicitud del usuario.

## Implementation Notes

Se incorporaron ResourceViewerDialog y su adaptador privado. El store abre recursos en el visor, con acceso desde nodos, teclado y menús. La vista pública conserva consulta de contexto separada de la apertura. El inspector privado mantiene propiedades locales y Biblioteca. La revisión cruzada corrigió propagación de teclado, foco y limpieza del visor entre documentos. Pasaron 24 pruebas focalizadas de visor público, inspector y vista semántica. El trabajo se realiza en la rama second, que era la rama activa al retomar.

Los paneles derechos se superponen al lienzo debajo de la barra superior, sin reducir su ancho ni desplazar los controles. Propiedades usa un icono de ajustes, Contexto uno de información y ambos paneles cierran con X. La apertura del recurso público usa un icono compacto de ampliar y tooltip. En móvil, el contexto público conserva la presentación modal inferior.
