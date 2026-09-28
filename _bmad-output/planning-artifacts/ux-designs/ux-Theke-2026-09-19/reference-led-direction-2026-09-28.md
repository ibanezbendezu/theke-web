# Propuesta visual para el Design Spine de Theke

Estado: propuesta para conversar; no reemplaza todavía `DESIGN.md`.

## Encargo y referencias

El usuario quiere que el marco de Theke siga con máxima fidelidad la imagen local `referencias/app.notion.png` y que las pantallas para recorrer Recursos sigan `referencias/drive.google.png`. Las dos capturas están en el workspace, fuera del repositorio web. Theke conserva sus funciones, nombre, iconos y datos; los productos fotografiados solo fijan composición, densidad, color y comportamiento visual.

Este rumbo reemplaza la anterior inspiración JetBrains del Design Spine. La diferencia es relevante: Notion emplea una barra lateral ancha y persistente, un área principal casi negra sin marcos flotantes y controles discretos; Drive reserva la cuadrícula de miniaturas para explorar archivos y filtrar.

## Plan visual compacto

### Colores base de la referencia oscura

| Token propuesto | Valor | Uso |
|---|---:|---|
| `app-canvas` | `#191919` | Área principal, páginas y fondo del Canvas de Theke; muestreado en la captura de Notion. |
| `app-sidebar` | `#202020` | Barra lateral global; muestreado en la captura de Notion. |
| `resource-canvas` | `#131314` | Área de navegación de Recursos; muestreado en la captura de Drive. |
| `resource-sidebar` | `#1B1B1B` | Superficie de navegación de Recursos si se adopta la pantalla completa de Drive. |
| `resource-control` | `#37393B` | Controles y botón principal oscuro de la captura de Drive. |
| `action-blue` | `#2783DE` | Acción primaria de Theke; muestra aproximada del botón de la captura de Notion. |

Texto principal blanco suave y texto secundario gris, con contrastes AA verificados al aplicar los tokens. Los bordes son líneas tenues que separan filas o paneles; el color azul aparece solo en acciones y selección. Los colores semánticos de Recurso o Relación no reemplazan esta base.

### Tipografía y densidad

Tipografía sans del sistema, próxima a las capturas, con títulos de página grandes y claros; navegación y tablas de tamaño compacto. En el marco general no usar JetBrains Sans, franjas de herramientas de IDE, gradientes, cristal decorativo ni sombras elevadas. Títulos, nombres de Recursos y acciones mantienen el vocabulario de Theke en español. El contenido se alinea a la izquierda; la anchura de lectura se limita cuando hay texto largo, pero la cuadrícula de archivos aprovecha todo el área disponible.

### Composición del marco general

```text
┌────────────────────────┬────────────────────────────────────────────────────┐
│ Theke / buscar         │ Título de página                         Acción     │
│ Inicio                 │ Pestañas o vistas del contexto                     │
│ Proyectos              │ Encabezados o filtros discretos                     │
│ Biblioteca             │                                                    │
│ Recientes              │ Contenido principal: filas, tabla o Canvas         │
│ Proyectos y páginas    │                                                    │
│ Cuenta y tema          │                                                    │
└────────────────────────┴────────────────────────────────────────────────────┘
```

Barra lateral persistente, aproximadamente 260–280 CSS px en escritorio, fondo `app-sidebar` y borde fino. La superficie principal usa `app-canvas`, respiración generosa alrededor del título y controles compactos. Inicio y Proyectos se presentan como filas o tablas claras, similares a la captura de Notion; los Diagramas siguen mostrando el grafo de Theke como protagonista.

### Composición para recorrer Recursos

```text
┌────────────────────────┬────────────────────────────────────────────────────┐
│ Navegación             │ Buscar Recursos                                     │
│ Biblioteca             │ Ruta / carpeta                  Lista | Cuadrícula   │
│ Carpetas               │ Tipo  ·  Proyecto  ·  Modificado  ·  Etiquetas      │
│ Recientes              │                                                    │
│ Papelera, si aplica    │ [miniatura] [miniatura] [miniatura] [miniatura]    │
│                        │ [miniatura] [miniatura] [miniatura] [miniatura]    │
└────────────────────────┴────────────────────────────────────────────────────┘
```

La Biblioteca, la selección de Recursos para un Diagrama y la exploración de Carpetas comparten el mismo patrón de Drive: búsqueda ancha, ruta visible, filtros en una fila, alternancia lista/cuadrícula, tarjetas con miniatura grande y nombre/tipo arriba. Para notas y enlaces, usar una vista previa textual o icono propio de Theke; para archivos, miniatura real cuando exista. La selección múltiple, vista previa, añadir al Canvas y acciones de Recurso deben permanecer claras y accesibles con teclado.

## Reglas para todos los componentes

- Botones y campos de marco general: geometría contenida, fondos oscuros tonales, radios pequeños o medianos; el azul se reserva para la acción primaria.
- Filas de navegación, menús, tablas y diálogos: mismo contraste, espaciado y tipografía de Notion. Los menús flotan por utilidad, no por decoración.
- Recursos en catálogo: tarjetas y miniaturas de Drive, con radio mayor que en las filas de Notion. Esta diferencia expresa el cambio de tarea: navegar una colección visual.
- Recursos dentro del Canvas: conservar su semántica y conexiones, pero usar la misma familia tipográfica, colores de superficie, iconografía y estados de selección.
- Estados vacío, carga, error y foco: ocupan la misma geometría de su contenido final; texto breve y acción concreta. Nada esencial depende solo del hover.
- En móvil, la barra lateral se vuelve temporal y la cuadrícula reduce columnas; la lista sigue disponible. Las acciones mantienen objetivos táctiles accesibles.

## Autocrítica de la propuesta

La tentación genérica sería mezclar todo en tarjetas redondeadas oscuras. Se evita: filas planas para estructura, tarjetas con miniatura solo al recorrer Recursos y Canvas espacial para Diagramas. El elemento distintivo de Theke sigue siendo su grafo de conocimiento; la interfaz de referencia lo enmarca sin sustituirlo.

## Decisión abierta

En las pantallas de Recursos, confirmar si la barra lateral global de Notion permanece mientras el contenido adopta Drive, o si la pantalla completa, incluida su navegación lateral, adopta Drive. La primera opción mantiene continuidad entre rutas; la segunda maximiza fidelidad literal a la segunda captura.
