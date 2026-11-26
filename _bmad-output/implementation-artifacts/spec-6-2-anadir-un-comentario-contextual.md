---
title: 'Añadir un comentario contextual'
type: 'feature'
created: '2026-09-30'
status: 'done'
---

## Intent

Permitir que un visitante comente una posición del mapa, un Recurso o una Relación de un Compartido sin modificar el conocimiento canónico.

## Implementación

- La herramienta visible permite elegir un punto, Recurso o Relación del Canvas. El clic derecho abre la acción «Comentar aquí». La Vista semántica ofrece controles separados para Recursos y Relaciones, y el control inferior permite comentar el centro visible sin precisión de puntero.
- El compositor muestra el contexto elegido, usa la identidad de la 6.1, anuncia errores y conserva el texto ante fallos. Guarda el borrador de la pestaña en `sessionStorage`; al volver tras recargar ofrece recuperarlo o descartarlo. Al cerrar temporalmente el panel conserva el texto en memoria.
- La API valida que Recursos y Relaciones pertenezcan a la proyección pública del Compartido. Guarda el identificador estable, una etiqueta mínima y la última coordenada conocida. Un punto debe tener coordenadas válidas. Los marcadores numerados abren el comentario en la lista; los destinos sin posición siguen disponibles en la lista.
- Las mutaciones requieren origen permitido, JSON, cookie y CSRF cuando existe identidad. Crear falla con 404 ante enlace revocado o destino no publicado, 409 si se cerraron comentarios y 429 con `Retry-After` al superar los límites. El aviso de límite registra solo la versión de la política, sin texto, token ni cookie. Los umbrales viven en una configuración versionada en Git.
- Se conserva el comentario general de 6.1 para compatibilidad con clientes anteriores. El contrato OpenAPI y el cliente web incluyen los anclajes nuevos.

## Verificación y estado

Pasaron las pruebas focalizadas de API con PostgreSQL para los tres anclajes, destino no publicado, coordenadas inválidas y límite por sesión; las pruebas del controlador para Origin, JSON, cookie y `Retry-After`; y las pruebas de interfaz para compositor, borrador, Vista semántica, menú contextual y marcador. Pasaron build, lint y comprobación de contrato en ambos repositorios. La preferencia del proyecto excluye pruebas E2E.

Revisión BMAD del 2026-11-26: el botón de la Relación respeta el modo de comentario y el menú contextual. El marcador de un comentario nuevo sobre una Relación se calcula con los conectores y la curvatura publicados. Los marcadores coincidentes se separan y quedan sobre los nodos. El compositor conserva las páginas cargadas al publicar, elimina borradores vaciados y valida el límite Unicode como la API. Pasaron 29 pruebas focalizadas web, 7 comprobaciones focalizadas de API y una integración real con PostgreSQL. La comprobación visual en un Compartido real queda a cargo del usuario.

## Review Triage Log

| Capa | Hallazgo | Veredicto | Evidencia y ruta |
| --- | --- | --- | --- |
| Ciega | Marcadores coincidentes se tapan. | medium · patch | Los nodos compartían posición exacta. Se distribuyen verticalmente a partir del anclaje. |
| Ciega | Capa fija de marcador inferior a la de algunos nodos. | medium · patch | Se usa el nivel inmediatamente superior al mayor nivel del contenido del lienzo. |
| Ciega | Marcador fuera de la curva de Relación. | medium · patch | La API incorpora conectores y desplazamiento de la arista pública. |
| Ciega | Republicar conserva coordenadas antiguas. | medium · defer | La actualización de la proyección no reubica anclajes existentes. Se registra para el ciclo de vida de 6.5. |
| Ciega | Un destino restaurado continúa huérfano. | medium · defer | El refresco omite filas ya huérfanas. Se registra junto con la reubicación de la 6.5. |
| Ciega | El botón de Relación ignora la herramienta de comentario. | medium · patch | El botón y la arista convergen en la misma selección contextual. |
| Ciega | Navegar entre enlaces mezcla estados. | false | `PublicShareView` se monta con una clave distinta por token y la carga aborta al desmontar. |
| Ciega | Publicar deja seleccionado el destino anterior. | medium · patch | El éxito del POST limpia el destino y el borrador. |
| Ciega | Después de publicar desaparecen las páginas ya cargadas. | medium · patch | Se vuelve a consultar el mismo número de páginas. |
| Ciega | Panel de solo lectura conserva el foco fuera. | medium · patch | El contenedor enfocable recibe foco al faltar el compositor. |
| Ciega | Menú contextual sin foco ni Escape. | medium · patch | Se enfoca la acción al abrir y Escape cierra el menú y restaura el foco. |
| Ciega | Borrador vacío reaparece al volver. | medium · patch | Vaciar el campo elimina el valor guardado y hay una prueba de regresión. |
| Casos límite | Marcadores con coordenadas idénticas. | medium · patch | Confirmado. Se comprueba que las posiciones de dos marcadores difieran. |
| Casos límite | Marcadores bajo nodos con capa superior a 10. | medium · patch | Confirmado. La capa se obtiene de las capas publicadas. |
| Casos límite | El portal de Relación ignora el modo y menú contextual. | medium · patch | Usa el selector y el menú del lienzo. |
| Casos límite | La geometría guardada no sigue la Relación curva. | medium · patch | Se usa la arista pública y se verifica con conectores distintos y desplazamiento. |
| Casos límite | Pulsar un elemento visual ancla en su esquina. | medium · patch | Se transforma la posición pulsada a coordenadas del lienzo. |
| Casos límite | El retiro del comentario que sirve de cursor interrumpe la paginación. | medium · defer | La subconsulta del cursor excluye retirados. Se registra para la revisión de moderación de 6.5. |
| Casos límite | PATCH repone una lista desactualizada. | medium · patch | Se aplica a la lista vigente y se conserva una revisión posterior ya cargada. |
| Casos límite | POST vuelve a la primera página. | medium · patch | El refresco mantiene la paginación expandida. |
| Casos límite | Elegir otro destino conserva el texto previo. | medium · defer | El destino nuevo es visible, pero cambiarlo puede reasignar texto de un borrador previo. Queda por definir si debe pedir confirmación o mantener borradores por destino. |
| Casos límite | Un texto borrado queda en almacenamiento. | medium · patch | Se retira el borrador al vaciar su contenido. |
| Casos límite | Sin textarea el diálogo no toma el foco. | medium · patch | Se enfoca el panel o el comentario seleccionado. |
| Casos límite | El límite UTF-16 rechaza texto admitido por la API. | medium · patch | Publicar y recuperar cuentan puntos de código en web. |
| Verificación | La integración no observa marcadores para los tres anclajes. | medium · patch | El fixture incorpora una arista y compara `anchor` y `anchored` en creación y listado. |
| Verificación | La prueba del marcador ya tenía el panel abierto. | medium · patch | Cierra el panel, pulsa uno de dos marcadores y comprueba cuál queda seleccionado. |
| Verificación | El recorrido del botón de Relación no se prueba directamente en React Flow. | medium · defer | El montaje focalizado no mide puertos ni aristas. Se incorpora a la comprobación visual del Compartido real. |
| Verificación | La prueba no cubre reintentar tras un POST 429. | medium · patch | El test observa aviso, texto, destino y reenvío del mismo anclaje. |
| Verificación | El compositor general omite el anclaje. | false | El alcance preserva el comentario general de 6.1 y el campo es opcional en el contrato. El flujo contextual siempre envía su anclaje. |
| Verificación | La Relación curva se dibuja lejos del marcador. | medium · patch | Confirmado y cubierto del lado de la API con una arista desplazada. |
| Verificación | Una capa alta puede cubrir el marcador. | medium · patch | La capa del marcador escala con la del lienzo. |
| Verificación | Falta acceso al centro visible. | medium · patch | El modo Añadir comentario ofrece la acción accesible para el centro mientras está activo. |
| Verificación | La interfaz aplica un límite distinto del servidor. | medium · patch | El límite semántico es de 5.000 puntos de código en ambos lados. |

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 6.2.
- `theke-api/src/modules/diagrams/public-comments.service.ts`.
- `src/pages/PublicDiagramCanvas.tsx` y `src/pages/PublicCommentsPanel.tsx`.
