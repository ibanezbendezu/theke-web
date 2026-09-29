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
| `resource-control` | `#FFFFFF0A` | Blanco translúcido al 4 % sobre el fondo Notion para búsqueda y tarjetas discretas. |
| `action-blue` | `#2783DE` | Acción primaria de Theke; muestra aproximada del botón de la captura de Notion. |

Texto principal blanco suave y texto secundario gris, con contrastes AA verificados al aplicar los tokens. Los bordes son líneas tenues que separan filas o paneles; el color azul aparece solo en acciones y selección. Los colores semánticos de Recurso o Relación no reemplazan esta base.

### Tipografía y densidad

Tipografía sans del sistema, próxima a las capturas, con navegación y tablas de tamaño compacto. Las colecciones no repiten el nombre de la pantalla ni una frase introductoria en un encabezado grande. En el marco general no usar JetBrains Sans, franjas de herramientas de IDE, gradientes, cristal decorativo ni sombras elevadas. Nombres de Recursos y acciones mantienen el vocabulario de Theke en español. El contenido se alinea a la izquierda; la anchura de lectura se limita cuando hay texto largo, pero la cuadrícula de archivos aprovecha todo el área disponible.

### Composición del marco general

```text
┌────────────────────────┬────────────────────────────────────────────────────┐
│ Theke / buscar         │ Ruta / página                  Metadatos  Acción   │
│ Inicio                 ├────────────────────────────────────────────────────┤
│ Proyectos              │ Grupos                Lista | Galería  +          │
│ Biblioteca             │                                                    │
│ Recientes              │ Contenido principal: lista o galería               │
│ Proyectos y páginas    │                                                    │
│ Cuenta y tema          │                                                    │
└────────────────────────┴────────────────────────────────────────────────────┘
```

Barra lateral persistente, aproximadamente 260–280 CSS px en escritorio, fondo `app-sidebar`. La búsqueda global va al final, debajo de la cuenta. La topbar compacta de Notion cruza el área principal salvo en Canvas/Diagrama, que usa su encabezado de trabajo propio. La superficie principal usa `app-canvas` y comienza con los controles de la colección y el contenido, sin título o descripción redundantes. El selector Lista/Galería está en la página, con un «+» neutro junto a él. Inicio y Biblioteca comparten padding de 32 px en escritorio y 16 px en móvil. Inicio y Proyectos se presentan como filas o galerías sobrias; los Diagramas siguen mostrando el grafo de Theke como protagonista.

### Composición para recorrer Recursos

```text
┌────────────────────────┬────────────────────────────────────────────────────┐
│ Navegación             │ Ruta / carpeta                    Metadatos          │
│ Biblioteca             ├────────────────────────────────────────────────────┤
│ Carpetas               │ Grupos  Buscar recursos    Lista | Galería  +     │
│ Recientes              │                                                    │
│ Papelera, si aplica    │ [miniatura] [miniatura] [miniatura] [miniatura]    │
│                        │ [miniatura] [miniatura] [miniatura] [miniatura]    │
└────────────────────────┴────────────────────────────────────────────────────┘
```

La Biblioteca, la selección de Recursos para un Diagrama y la exploración de Carpetas comparten el orden de contenido de Drive: ruta visible en la topbar cuando corresponda y una sola fila con grupos, búsqueda y selector Lista/Galería junto a «+». Los controles son los mismos de Inicio, sin contornos; las tarjetas con miniatura grande muestran nombre y tipo arriba. Para notas y enlaces, usar una vista previa textual o icono propio de Theke; para archivos, miniatura real cuando exista. La selección múltiple, vista previa, añadir al Canvas y acciones de Recurso deben permanecer claras y accesibles con teclado.

## Reglas para todos los componentes

- Grupos, búsqueda, selector Lista/Galería y «+»: misma altura aproximada de 35 px, radio de 6 px, sin borde permanente y con fondos translúcidos suaves en hover o selección. El azul se reserva para foco de teclado y acciones de otros contextos que lo requieran.
- Filas de navegación, menús, tablas y diálogos: mismo contraste, espaciado y tipografía de Notion. Los menús flotan por utilidad, no por decoración.
- Recursos en catálogo: tarjetas y miniaturas de Drive, con radio mayor que en las filas de Notion. Esta diferencia expresa el cambio de tarea: navegar una colección visual.
- Recursos dentro del Canvas: conservar su semántica y conexiones, pero usar la misma familia tipográfica, colores de superficie, iconografía y estados de selección.
- Estados vacío, carga, error y foco: ocupan la misma geometría de su contenido final; texto breve y acción concreta. Nada esencial depende solo del hover.
- En móvil, la barra lateral se vuelve temporal y la cuadrícula reduce columnas; la lista sigue disponible. Las acciones mantienen objetivos táctiles accesibles.

## Autocrítica de la propuesta

La tentación genérica sería mezclar todo en tarjetas redondeadas oscuras. Se evita: filas planas para estructura, tarjetas con miniatura solo al recorrer Recursos y Canvas espacial para Diagramas. El elemento distintivo de Theke sigue siendo su grafo de conocimiento; la interfaz de referencia lo enmarca sin sustituirlo.

## Alcances confirmados de topbar y controles

- `referencias/app.notion.topbar.png` fija una topbar horizontal baja y plana: ruta a la izquierda; metadatos y acciones generales a la derecha. Aparece en todas las páginas de Theke salvo la vista de Canvas/Diagrama, que conserva su encabezado de trabajo específico.
- El selector Lista/Galería es un componente compartido para toda colección: Inicio, Proyectos, Proyecto, Biblioteca, Carpetas y selectores de Recursos. Está dentro de la página, junto a un «+» neutro de creación, nunca en la topbar. Cambia la presentación del conjunto actual sin alterar filtros ni selección. Los detalles individuales y formularios no muestran un selector sin función.
- Las colecciones empiezan con sus controles y datos; no presentan un gran título que repita la sección ni un subtítulo como «Todos tus Recursos canónicos». La ruta pequeña de la topbar aporta orientación cuando hace falta.
- La fila de controles de Biblioteca alinea grupos sin borde, búsqueda y vistas con «+». La búsqueda global de la barra lateral se ubica al final, debajo de la cuenta. Todo usa altura, radio y estados translúcidos coherentes; los contornos se reservan para estructura y foco. La búsqueda de Biblioteca puede ser ancha, pero no tiene radio de píldora.
- Drive inspira el orden y la densidad de la exploración de Recursos y sus miniaturas. La barra lateral, topbar, fondo, tipografía y controles pertenecen siempre al sistema visual de Notion.

## Revisión de coherencia con la skill Frontend Design

Plan compacto de esta iteración: `#191919` para el lienzo general, `#202020` para la barra lateral, `#EDEDED` para texto, `#A5A5A5` para texto secundario y blanco al 4–9 % para búsqueda, hover y selección. Sans del sistema en escala compacta; los nombres de proyectos y recursos llevan el peso tipográfico. El contenido se alinea a la izquierda con 32 px de margen en todas las colecciones; la fila de controles distribuye grupos, búsqueda y acciones sobre un mismo eje. La identidad propia de Theke aparece en sus Recursos y el grafo, no en contornos decorativos.

Autocrítica: la versión anterior mezclaba pestañas sin borde con un selector y un «+» contorneados, separaba la búsqueda de Biblioteca en otra línea, cambiaba el margen entre páginas y dejaba la búsqueda global arriba. Esa mezcla parecía formada por dos sistemas. La maqueta se reconstruyó con una única geometría de control y con transparencia tonal moderada; el contenido de lectura, las vistas previas y los diálogos conservan superficies legibles.

## Decisión confirmada

La barra lateral global permanece al estilo Notion en todas las pantallas. La topbar acompaña todas las páginas salvo Canvas/Diagrama. En Biblioteca, Carpetas y otras superficies para navegar Recursos, solo la organización del contenido adopta la composición de Drive; los controles mantienen la geometría de Notion. Confirmado por el usuario el 2026-09-28.
