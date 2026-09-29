# Propuesta visual para el Design Spine de Theke

Estado: dirección confirmada para el marco global y la Biblioteca; incorporada a `DESIGN.md` y `EXPERIENCE.md`.

## Encargo y referencias

El usuario quiere que el marco de Theke siga con máxima fidelidad las imágenes locales `referencias/app.notion.png` y `referencias/app.notion.topbar.png`, y que las pantallas para recorrer Recursos sigan `referencias/drive.google.png`. Las tres capturas están en el workspace, fuera del repositorio web. Theke conserva sus funciones, nombre, iconos y datos; los productos fotografiados solo fijan composición, densidad, color y comportamiento visual.

Este rumbo reemplaza la anterior inspiración JetBrains del Design Spine. La diferencia es relevante: Notion emplea una barra lateral ancha y persistente, un área principal casi negra sin marcos flotantes y controles discretos; Drive reserva la cuadrícula de miniaturas para explorar archivos y filtrar.

## Plan visual compacto

### Colores base de la referencia oscura

| Token propuesto | Valor | Uso |
|---|---:|---|
| `app-canvas` | `#191919` | Área principal, páginas y fondo del Canvas de Theke; muestreado en la captura de Notion. |
| `app-sidebar` | `#202020` | Barra lateral global; muestreado en la captura de Notion. |
| `resource-canvas` | `#191919` | Área de navegación de Recursos; conserva el fondo de Notion. |
| `resource-control` | `#292929` | Controles discretos de la familia Notion, también en Biblioteca. |
| `action-blue` | `#2783DE` | Acción primaria de Theke; muestra aproximada del botón de la captura de Notion. |

Texto principal blanco suave y texto secundario gris, con contrastes AA verificados al aplicar los tokens. Los bordes son líneas tenues que separan filas o paneles; el color azul aparece solo en acciones y selección. Los colores semánticos de Recurso o Relación no reemplazan esta base.

### Tipografía y densidad

Tipografía sans del sistema, próxima a las capturas, con títulos de página grandes y claros; navegación y tablas de tamaño compacto. En el marco general no usar JetBrains Sans, franjas de herramientas de IDE, gradientes, cristal decorativo ni sombras elevadas. Títulos, nombres de Recursos y acciones mantienen el vocabulario de Theke en español. El contenido se alinea a la izquierda; la anchura de lectura se limita cuando hay texto largo, pero la cuadrícula de archivos aprovecha todo el área disponible.

### Composición del marco general

```text
┌────────────────────────┬────────────────────────────────────────────────────┐
│ Theke / buscar         │ Ruta / página              Lista | Galería  Acción │
│ Inicio                 ├────────────────────────────────────────────────────┤
│ Proyectos              │ Título y vistas de la colección                    │
│ Biblioteca             │                                                    │
│ Recientes              │ Contenido principal: lista o galería               │
│ Proyectos y páginas    │                                                    │
│ Cuenta y tema          │                                                    │
└────────────────────────┴────────────────────────────────────────────────────┘
```

Barra lateral persistente, aproximadamente 260–280 CSS px en escritorio, fondo `app-sidebar` y borde fino. La topbar compacta de Notion cruza el área principal salvo en Canvas/Diagrama, que usa su encabezado de trabajo propio. La superficie principal usa `app-canvas`, respiración generosa alrededor del título y controles compactos. Inicio y Proyectos se presentan como filas o galerías sobrias; los Diagramas siguen mostrando el grafo de Theke como protagonista.

### Composición para recorrer Recursos

```text
┌────────────────────────┬────────────────────────────────────────────────────┐
│ Navegación             │ Ruta / carpeta                 Lista | Galería      │
│ Biblioteca             ├────────────────────────────────────────────────────┤
│ Carpetas               │ Buscar Recursos · Tipo · Proyecto · Etiquetas      │
│ Recientes              │                                                    │
│ Papelera, si aplica    │ [miniatura] [miniatura] [miniatura] [miniatura]    │
│                        │ [miniatura] [miniatura] [miniatura] [miniatura]    │
└────────────────────────┴────────────────────────────────────────────────────┘
```

La Biblioteca, la selección de Recursos para un Diagrama y la exploración de Carpetas comparten el orden de contenido de Drive: búsqueda ancha con radio moderado, ruta visible en la topbar cuando corresponda, filtros en una fila, selector Lista/Galería compartido y tarjetas con miniatura grande y nombre/tipo arriba. Para notas y enlaces, usar una vista previa textual o icono propio de Theke; para archivos, miniatura real cuando exista. La selección múltiple, vista previa, añadir al Canvas y acciones de Recurso deben permanecer claras y accesibles con teclado.

## Reglas para todos los componentes

- Botones, campos de búsqueda, filtros y selector Lista/Galería: geometría contenida de Notion, fondos oscuros tonales y radios pequeños o medianos; el azul se reserva para la acción primaria.
- Filas de navegación, menús, tablas y diálogos: mismo contraste, espaciado y tipografía de Notion. Los menús flotan por utilidad, no por decoración.
- Recursos en catálogo: tarjetas y miniaturas de Drive, con radio mayor que en las filas de Notion. Esta diferencia expresa el cambio de tarea: navegar una colección visual.
- Recursos dentro del Canvas: conservar su semántica y conexiones, pero usar la misma familia tipográfica, colores de superficie, iconografía y estados de selección.
- Estados vacío, carga, error y foco: ocupan la misma geometría de su contenido final; texto breve y acción concreta. Nada esencial depende solo del hover.
- En móvil, la barra lateral se vuelve temporal y la cuadrícula reduce columnas; la lista sigue disponible. Las acciones mantienen objetivos táctiles accesibles.

## Autocrítica de la propuesta

La tentación genérica sería mezclar todo en tarjetas redondeadas oscuras. Se evita: filas planas para estructura, tarjetas con miniatura solo al recorrer Recursos y Canvas espacial para Diagramas. El elemento distintivo de Theke sigue siendo su grafo de conocimiento; la interfaz de referencia lo enmarca sin sustituirlo.

## Alcances confirmados de topbar y controles

- `referencias/app.notion.topbar.png` fija una topbar horizontal baja y plana: ruta a la izquierda; metadatos y acciones a la derecha. Aparece en todas las páginas de Theke salvo la vista de Canvas/Diagrama, que conserva su encabezado de trabajo específico.
- El selector Lista/Galería es un componente compartido para toda colección: Inicio, Proyectos, Proyecto, Biblioteca, Carpetas y selectores de Recursos. Cambia la presentación del conjunto actual sin alterar filtros ni selección. Los detalles individuales y formularios no muestran un selector sin función.
- Búsqueda, filtros y selector conservan el lenguaje de Notion: radios pequeños o medianos, fondos tonales, bordes discretos y altura compacta. La búsqueda de Biblioteca puede ser ancha, pero no tiene radio de píldora. El selector no usa cápsula ni relleno azul permanente.
- Drive inspira el orden y la densidad de la exploración de Recursos y sus miniaturas. La barra lateral, topbar, fondo, tipografía y controles pertenecen siempre al sistema visual de Notion.

## Decisión confirmada

La barra lateral global permanece al estilo Notion en todas las pantallas. La topbar acompaña todas las páginas salvo Canvas/Diagrama. En Biblioteca, Carpetas y otras superficies para navegar Recursos, solo la organización del contenido adopta la composición de Drive; los controles mantienen la geometría de Notion. Confirmado por el usuario el 2026-09-28.
