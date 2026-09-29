---
name: Theke
description: Sistema visual sereno y centrado en contenido para construir, explorar y compartir conocimiento conectado.
status: draft
preview-theme: dark
created: 2026-09-19
updated: 2026-09-28
sources:
  - ../../briefs/brief-Theke-2026-09-19/brief.md
  - ../../briefs/brief-Theke-2026-09-19/addendum.md
  - ../../prds/prd-Theke-2026-09-19/prd.md
  - ../../prds/prd-Theke-2026-09-19/addendum.md
  - ../../../../AGENTS.md
  - ../../../../src/index.css
  - ../../../../src/app/router.tsx
  - ../../../../src/features/canvas/CanvasEditor.tsx
  - reference-led-direction-2026-09-28.md
colors:
  background: '#FFFFFF'
  foreground: '#37352F'
  foreground-secondary: '#666663'
  surface: '#F7F7F5'
  surface-raised: '#FFFFFF'
  surface-contextual: '#FFFFFFE8'
  surface-contextual-strong: '#FFFFFFF5'
  surface-hover: '#37352F0A'
  surface-active: '#37352F14'
  border: '#37352F29'
  border-strong: '#37352F73'
  control-border: '#666663'
  overlay: '#00000066'
  primary: '#2383E2'
  primary-strong: '#1668A9'
  primary-text: '#1668A9'
  on-primary: '#FFFFFF'
  focus-ring: '#2383E2'
  selection: '#2383E21F'
  relation: '#2383E2'
  ai: '#9065B0'
  comment: '#D9730D'
  on-comment: '#191919'
  success: '#0F7B6C'
  warning: '#CB7B00'
  error: '#C9372C'
  resource-document: '#787774'
  resource-note: '#DFAB01'
  on-resource-note: '#191919'
  resource-image: '#0F7B6C'
  resource-audio: '#9065B0'
  resource-video: '#D9730D'
  resource-link: '#2383E2'
  background-dark: '#191919'
  foreground-dark: '#EDEDED'
  foreground-secondary-dark: '#A5A5A5'
  surface-dark: '#202020'
  surface-raised-dark: '#292929'
  surface-contextual-dark: '#292929E8'
  surface-contextual-strong-dark: '#292929F5'
  resource-background-dark: '#131314'
  resource-card-dark: '#202020'
  resource-control-dark: '#37393B'
  surface-hover-dark: '#FFFFFF0D'
  surface-active-dark: '#3574F033'
  border-dark: '#303030'
  border-strong-dark: '#777777'
  control-border-dark: '#777777'
  overlay-dark: '#00000099'
  primary-dark: '#2783DE'
  primary-strong-dark: '#3264C8'
  primary-text-dark: '#6EA6FF'
  on-primary-dark: '#FFFFFF'
  focus-ring-dark: '#7AB4FF'
  selection-dark: '#2783DE30'
  relation-dark: '#7AB4FF'
  ai-dark: '#9A6DD7'
  comment-dark: '#FFA344'
  on-comment-dark: '#191919'
  success-dark: '#4DAB9A'
  warning-dark: '#FFB84D'
  error-dark: '#FF7369'
  resource-document-dark: '#B4B4B0'
  resource-note-dark: '#FFDC49'
  on-resource-note-dark: '#191919'
  resource-image-dark: '#4DAB9A'
  resource-audio-dark: '#9A6DD7'
  resource-video-dark: '#FFA344'
  resource-link-dark: '#529CCA'
typography:
  display: { fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif", fontSize: 32px, fontWeight: '700', lineHeight: '1.2', letterSpacing: -0.02em }
  heading-lg: { fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif", fontSize: 28px, fontWeight: '650', lineHeight: '1.25', letterSpacing: -0.015em }
  heading-md: { fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif", fontSize: 18px, fontWeight: '600', lineHeight: '1.35' }
  body: { fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif", fontSize: 14px, fontWeight: '400', lineHeight: '1.5' }
  body-strong: { fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif", fontSize: 14px, fontWeight: '600', lineHeight: '1.45' }
  label: { fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif", fontSize: 12px, fontWeight: '600', lineHeight: '1.35' }
  caption: { fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif", fontSize: 12px, fontWeight: '400', lineHeight: '1.4' }
rounded:
  sm: 4px
  md: 6px
  lg: 10px
  xl: 12px
  full: 9999px
  DEFAULT: 6px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
  page-gutter: 24px
  panel-width: 304px
  sidebar-width: 272px
components:
  button-primary: { background: '{colors.primary-strong}', foreground: '{colors.on-primary}', border: '{colors.primary-strong}', radius: '{rounded.md}', focus: '{colors.focus-ring}' }
  button-secondary: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', border: '{colors.control-border}', radius: '{rounded.md}', focus: '{colors.focus-ring}' }
  text-field: { background: '{colors.background}', foreground: '{colors.foreground}', border: '{colors.control-border}', radius: '{rounded.md}', focus: '{colors.focus-ring}', error: '{colors.error}' }
  menu-popover: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.lg}' }
  sheet-dialog: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.xl}' }
  toast: { background: '{colors.foreground}', foreground: '{colors.background}', radius: '{rounded.md}' }
  skeleton: { background: '{colors.surface-active}', radius: '{rounded.md}' }
  media-controls: { background: '{colors.foreground}', foreground: '{colors.background}', focus: '{colors.focus-ring}', radius: '{rounded.md}' }
  app-sidebar: { background: '{colors.surface}', foreground: '{colors.foreground}', border: '{colors.border}', width: '{spacing.sidebar-width}' }
  top-bar: { background: '{colors.background}', foreground: '{colors.foreground}', border: '{colors.border}', height: 40px }
  project-card: { background: '{colors.background}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.md}' }
  resource-row: { background: '{colors.background}', hover: '{colors.surface-hover}', border: '{colors.border}', height: 40px }
  resource-card: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.lg}', selected: '{colors.selection}' }
  resource-browser: { background: '{colors.background}', foreground: '{colors.foreground}', sidebar: '{colors.surface}', search: '{colors.surface-raised}' }
  resource-preview-card: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.lg}', selected: '{colors.selection}' }
  folder-card: { background: '{colors.surface}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.lg}' }
  canvas-toolbar: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.md}' }
  add-menu: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.lg}' }
  group-frame: { background: '{colors.surface-active}', foreground: '{colors.foreground}', border: '{colors.border-strong}', radius: '{rounded.lg}' }
  semantic-relation: { stroke: '{colors.relation}', label-background: '{colors.surface-raised}', label-foreground: '{colors.foreground}' }
  relation-editor: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.md}' }
  context-panel: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', border: '{colors.border}', width: '{spacing.panel-width}' }
  ai-guidance-card: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', accent: '{colors.ai}', radius: '{rounded.md}' }
  save-status: { foreground: '{colors.foreground-secondary}', error: '{colors.error}' }
  upload-batch-tray: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.md}' }
  share-wizard: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.xl}' }
  comment-marker: { background: '{colors.comment}', foreground: '{colors.on-comment}', radius: '{rounded.full}' }
  comment-composer: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.lg}' }
  state-message: { background: '{colors.surface}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.lg}' }
  confirm-dialog: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.xl}' }
  theme-control: { background: '{colors.surface}', foreground: '{colors.foreground}', border: '{colors.border}', radius: '{rounded.md}' }
  semantic-view: { background: '{colors.surface-raised}', foreground: '{colors.foreground}', border: '{colors.control-border}', selected: '{colors.selection}', radius: '{rounded.lg}' }
---

# Theke — Design Spine

> Este archivo es el contrato visual para implementación y futuros mocks. Si un mock, la interfaz actual o un artefacto de exploración entra en conflicto, este spine gana. `.working/color-themes-1.html` fue descartado explícitamente y no es referencia final.

La dirección actual se basa en las capturas aportadas por el usuario: `referencias/app.notion.png` para el marco general y `referencias/drive.google.png` para navegar Recursos. Permanecen en el workspace fuera del repositorio. Los mockups anteriores de Canvas, publicación y comentario móvil documentan flujos, pero su apariencia JetBrains queda reemplazada por este spine. La composición de referencia con contenido propio de Theke está en [mockup del marco y Biblioteca](mockups/theke-notion-drive-direction.html).

## Brand & Style

Theke debe sentirse como una herramienta profesional de estudio: serena, enfocada, exploratoria y confiable. El conocimiento ocupa el primer plano; el cromado se retira. La interfaz no intenta impresionar ni simular inteligencia: presenta estructura, procedencia y acciones con claridad para que la persona siga pensando por sí misma.

La postura visual sigue con máxima fidelidad el marco oscuro de la captura de Notion: barra lateral permanente de `#202020`, área principal plana de `#191919`, tipografía sans del sistema, títulos grandes, navegación discreta y filas separadas por líneas tenues. En Biblioteca y otras pantallas donde se recorren Recursos, la barra lateral permanece igual; el área principal adopta la composición de la captura de Drive: búsqueda prominente, ruta, filtros, alternancia lista/cuadrícula y tarjetas con miniatura grande sobre `#131314`. Theke conserva logotipo, iconografía, contenido y vocabulario propios.

Evitar saturación, tono infantil, rigidez corporativa y “magia” visual. No hay gradientes de marca, cristal decorativo ni animaciones celebratorias. Los controles avanzados aparecen en contexto y desaparecen cuando dejan de ser útiles. Las tarjetas con miniaturas se reservan para navegar Recursos; Inicio y Proyectos conservan filas planas.

## Visual Provenance

- **Marco global:** captura `referencias/app.notion.png`, aportada por el usuario, para barra lateral, fondo, jerarquía de página, tablas, densidad y estados.
- **Navegación de Recursos:** captura `referencias/drive.google.png`, aportada por el usuario, para búsqueda, filtros, rutas, alternancia lista/cuadrícula y miniaturas. La barra lateral global permanece al estilo Notion, decisión confirmada el 2026-09-28.
- **Referencia funcional:** Theke conserva el grafo espacial, las Relaciones, la Biblioteca canónica, la publicación y los comentarios definidos en `EXPERIENCE.md`.
- **Límite de identidad:** Theke conserva marca, iconos, vocabulario y contenido propios; no copia logotipos, nombres, documentos ni fotografías de las capturas.
- **Descartado:** `.working/color-themes-1.html` y sus cuatro paletas no son referencia final.

## Colors

### Superficies y texto

- `{colors.background}` / `{colors.background-dark}` es el plano de páginas y Canvas.
- `{colors.surface}` / `{colors.surface-dark}` separa navegación, paneles secundarios y estados suaves.
- `{colors.surface-raised}` / `{colors.surface-raised-dark}` sostiene tarjetas, menús, paneles flotantes y diálogos.
- `{colors.surface-contextual}` y `{colors.surface-contextual-strong}` —con sus pares oscuros— sostienen controles temporales o capas flotantes. El shell y el contenido canónico permanecen opacos.
- `{colors.foreground}` / `{colors.foreground-dark}` se usa para el texto principal. El texto secundario y los estados persistentes usan `{colors.foreground-secondary}` / `{colors.foreground-secondary-dark}`: valores opacos con contraste mínimo 4.5:1. Los tokens de borde nunca se usan como texto.
- `{colors.border}` separa a baja jerarquía; `{colors.border-strong}` se reserva para foco estructural.
- `{colors.control-border}` / `{colors.control-border-dark}` delimita inputs y controles interactivos con contraste mínimo 3:1.
- En el tema oscuro, `{colors.resource-background-dark}` se usa solo en el área principal de Biblioteca y exploración de Carpetas; `{colors.resource-card-dark}` y `{colors.resource-control-dark}` separan miniaturas y controles. La barra lateral global sigue usando `{colors.surface-dark}`.

### Acción y semántica

- `{colors.primary}` es el azul de acción observado en la referencia para foco e indicadores gráficos. Enlaces de texto usan `{colors.primary-text}` y botones con texto blanco usan `{colors.primary-strong}` para contraste AA.
- `{colors.relation}` identifica Relaciones semánticas; líneas decorativas permanecen neutrales.
- `{colors.ai}` identifica procedencia o guía de IA. Nunca significa “correcto” ni domina una superficie.
- `{colors.comment}` identifica marcadores y modo Comentar. Usa texto `{colors.on-comment}`; número o icono siempre acompaña el color. La combinación debe conservar contraste AA en ambos temas.
- `{colors.success}`, `{colors.warning}` y `{colors.error}` expresan estado en contexto.
- `{colors.warning}` se usa solo en iconos, bordes o texto grande con contraste verificado; para texto normal se acompaña de `{colors.foreground}` y nunca aparece solo sobre blanco.
- Los tokens `resource-*` aparecen en iconos o franjas pequeñas; título e icono mantienen la distinción sin color. Si `{colors.resource-note}` se usa como fondo, su texto usa `{colors.on-resource-note}`.

### Modo y contraste

El tema sigue el sistema por defecto. La persona puede fijar claro u oscuro y la preferencia se guarda por dispositivo. Los pares `*-dark` son decisiones explícitas, no inversiones automáticas.

Los componentes referencian tokens sin sufijo en modo claro. En modo oscuro, el proveedor sustituye cada token por su par `-dark` del mismo nombre semántico; nunca mezcla valores de ambos temas.

Objetivos: 4.5:1 para texto normal y 3:1 para texto grande, iconos funcionales, bordes de foco y controles. `{colors.primary-strong}` + `{colors.on-primary}` se usa en acciones con texto normal; en oscuro, `{colors.primary-strong-dark}` + `{colors.on-primary-dark}`. Un futuro contraste alto debe poder sustituir superficies y bordes sin cambiar semántica ni jerarquía.

### Transparencia semántica

- **Opaco = estable o comprometido:** Recursos, contenido editable, Biblioteca, paneles acoplados, diálogos de confirmación y pasos de publicación usan superficies opacas.
- **Contextual:** menús, `Canvas Toolbar`, `Relation Editor`, selección por lote y halos de comentario pueden usar superficies oscuras elevadas, pero permanecen legibles y opacas cuando contienen texto o controles.
- **Transparente = agrupación o alcance:** `Group Frame`, selección rectangular y zonas de destino usan relleno muy ligero y borde explícito; no parecen un Recurso ni una Carpeta.
- Ningún párrafo, input o acción crítica descansa directamente sobre contenido variable. El shell, paneles y formularios son opacos. La transparencia nunca comunica por sí sola estado, disponibilidad o procedencia.

## Typography

La tipografía usa la pila sans del sistema, próxima a las capturas de referencia, sin descargar fuentes en tiempo de ejecución. El contenido en español mantiene anchos de lectura cómodos; la navegación y las tablas son compactas, mientras la cuadrícula de Recursos aprovecha el ancho disponible.

La jerarquía es estable con cualquier fallback: `{typography.display}` para bienvenida vacía o título excepcional; `{typography.heading-lg}` para página; `{typography.heading-md}` para sección, panel y diálogo; `{typography.body}` para contenido; `{typography.body-strong}` para títulos y acciones; `{typography.label}` para controles; `{typography.caption}` para metadatos, procedencia y estado.

La monoespaciada queda para datos que lo requieran. Evitar mayúsculas sostenidas salvo rótulos muy cortos.

## Layout & Spacing

Escala base de 4 px. La densidad predeterminada se acerca al modo compacto de una herramienta de escritorio: controles frecuentes usan `{spacing.1}`–`{spacing.3}`, tarjetas y paneles `{spacing.3}`–`{spacing.5}`, y solo regiones de contenido usan `{spacing.6}`–`{spacing.10}`.

En escritorio, la barra lateral global de 272 px permanece visible y admite colapso. Contiene marca, búsqueda, Inicio, Proyectos, Biblioteca, accesos recientes y cuenta. El área principal deja un margen amplio alrededor del título y después muestra filas, tabla, Canvas o cuadrícula según la tarea. En Biblioteca se mantiene la misma barra lateral y se usa la composición visual de Drive solo en el contenido principal. El Canvas conserva la mayor superficie y puede abrir un panel contextual derecho sin desplazar las acciones esenciales.

Inicio, Proyectos y Biblioteca usan `{spacing.page-gutter}` en escritorio y 16 px en viewport estrecho. Listas y grillas comparten bordes de alineación. La grilla de puntos del Canvas es una guía espacial de bajo contraste, no una restricción rígida.

## Elevation & Depth

La jerarquía nace de tono, borde y posición: barra lateral `#202020`, área principal `#191919` y área de Recursos `#131314`. Inicio y Proyectos no se llenan de tarjetas; usan filas planas y separadores. En Biblioteca, las tarjetas de miniatura son una parte funcional del explorador. Menús y diálogos pueden usar sombra moderada; las superficies integradas permanecen planas.

Hover cambia tono o borde sin elevar ni mover geometría. No se aplica blur a nodos, paneles acoplados o contenido estable.

## Shapes

`{rounded.sm}` para controles pequeños y filas, `{rounded.md}` para botones e inputs, `{rounded.lg}` para tarjetas de Recursos y paneles, `{rounded.xl}` para diálogos. La búsqueda puede tener radio completo, como en Drive. `{rounded.full}` también se usa en marcadores numerados, avatares e indicadores compactos.

Recursos son tarjetas; Anotaciones no adoptan tarjeta. `Group Frame` es marco tonal con etiqueta exterior. Carpetas son colecciones compactas. Relaciones semánticas usan línea continua y etiqueta; trazos decorativos son neutrales o discontinuos.

## Components

Los controles base usan las entradas homónimas de `components`: `Button Primary`, `Button Secondary`, `Text Field`, `Menu/Popover`, `Sheet/Dialog`, `Toast`, `Skeleton` y `Media Controls`. Conservan foco visible y combinan icono, texto o forma con el color; error y selección nunca dependen solo del tono.

| Componente | Especificación visual |
|---|---|
| **Button Primary / Secondary** | Altura mínima 36 px y objetivo efectivo de 44 × 44 px cuando no existe separación equivalente. Estados de hover, activo y deshabilitado, y foco visible, sin alterar la geometría. |
| **Text Field** | Etiqueta persistente, ayuda y error asociados; borde fuerte y anillo al enfocar. Placeholder nunca sustituye la etiqueta. |
| **Menu / Popover** | Superficie compacta, selección tonal con indicador, borde y sombra mínima. El elemento enfocado permanece visible. |
| **Sheet / Dialog** | Superficie elevada sobre overlay; título y descripción visibles. La hoja móvil conserva esquinas superiores `{rounded.xl}`. |
| **Toast / Skeleton** | Toast de alto contraste para confirmación breve; Skeleton reproduce la forma final sin animación obligatoria. |
| **Media Controls** | Controles de alto contraste, foco visible, estados de reproducción y pausa, volumen, progreso y alternativas textuales. |
| **App Sidebar** | Barra global persistente de 272 px, fondo `#202020`, borde fino a la derecha, búsqueda arriba, navegación y accesos recientes. Se colapsa desde un control visible; en pantalla estrecha se vuelve temporal. Permanece idéntica en Biblioteca. |
| **Top Bar** | Encabezado simple en el área principal con título, ruta o pestañas y acciones contextuales. En Canvas incluye `Save Status` y acciones de Diagrama sin crear una segunda barra de aplicación. |
| **Project Card** | Fila o bloque plano con borde fino, título fuerte y metadatos en caption. Hover tonal; foco visible. Evita una cuadrícula de tarjetas decorativas. |
| **Resource Row** | Alternativa de lista del explorador: mínimo 40 px, icono semántico, nombre, tipo y última edición. Acciones disponibles con foco y hover. |
| **Resource Card** | En Canvas, compacta y reconocible por tipo, título y metadatos. Selección con `{colors.selection}` y anillo; no usa la miniatura grande de Biblioteca. |
| **Resource Browser** | Área principal estilo Drive junto a la barra global estilo Notion: búsqueda ancha, ruta, filtros visibles y alternancia lista/cuadrícula. Fondo oscuro `#131314` en el tema de referencia. |
| **Resource Preview Card** | Tarjeta de exploración con nombre y tipo arriba, miniatura grande debajo y acciones accesibles por foco, clic y teclado. Fondo `#202020`, radio mayor que una fila de navegación; la cuadrícula adapta columnas sin cortar contenido. |
| **Folder Card** | Colección compacta con icono, nombre y conteo. No comparte apariencia con `Group Frame`. |
| **Canvas Toolbar** | Grupo opaco y compacto de acciones para zoom y encuadre, visualmente subordinado al grafo. |
| **Add Menu** | Desde el botón visible Añadir; categorías Biblioteca, Subir, Nota, Carpeta, Grupo y Anotaciones. |
| **Group Frame** | Marco de alcance con relleno transparente muy ligero, borde redimensionable, etiqueta fuera del contenido y handles fuera de `overflow-hidden`. Sin `transition-all`. |
| **Semantic Relation** | Línea continua; flecha solo si es dirigida; etiqueta sobre cápsula neutra. Color `{colors.relation}`. |
| **Relation Editor** | Popover contextual opaco cercano a la conexión con dirección, tipo, etiqueta, Guardar y Pedir sugerencia. |
| **Context Panel** | Tool window derecho de 304 px con encabezado compacto, pestañas o selector de contexto y divisores horizontales. Para Recurso separa “Contenido canónico” de “En este Diagrama”. |
| **AI Guidance Card** | Vista previa contextual opaca con acento lateral `{colors.ai}` y secciones Fundamento, Alcance y Carencias. Nunca modal automático. |
| **Save Status** | Texto pequeño: Guardando…, Guardado o No se pudo guardar. Sin badge ni check dominante. |
| **Upload Batch Tray** | Barra contextual opaca: Distribuir, Crear grupo visual y Deshacer carga. La etiqueta explica que la selección es temporal; no parece Grupo permanente. |
| **Share Wizard** | Tres pasos textuales: Vista previa, Contenido expuesto y Acceso. |
| **Comment Marker** | Círculo numerado `{colors.comment}`; seleccionado refuerza borde. Siempre con nombre accesible. |
| **Comment Composer** | En escritorio dentro de `Context Panel`; en móvil, hoja inferior. Campo y acción Publicar. |
| **State Message** | Dentro de la superficie afectada: título, explicación accionable y, como máximo, una acción principal. |
| **Confirm Dialog** | Solo para reemplazar/eliminar, revocar/republicar o acciones sensibles; muestra impacto concreto. |
| **Theme Control** | Sistema, Claro y Oscuro con texto e icono. Contraste alto queda preparado, aún no expuesto. |
| **Semantic View** | Lista o árbol en superficie elevada, selección sincronizada y jerarquía expresada mediante sangría, icono y texto; nunca depende solo de posición o color. |

## Do's and Don'ts

| Do | Don't |
|---|---|
| Mantener la barra lateral oscura de Notion a través de todas las rutas. | Cambiar a la barra lateral de Drive al entrar en Biblioteca. |
| Reservar la cuadrícula con miniaturas de Drive para explorar Recursos. | Convertir Inicio, Proyectos y Canvas en una cuadrícula uniforme de tarjetas. |
| Dejar que Recursos y Relaciones dominen el Canvas. | Rodear todo de paneles, badges y colores de marca. |
| Usar color para semántica, estado y contenido. | Usar azul como cromado dominante. |
| Usar superficies opacas y diferencias tonales para estructura. | Aplicar cristal o blur decorativo a Recursos, formularios o paneles. |
| Mantener IA discreta, identificable y consultable. | Hacer brillar o pulsar sugerencias. |
| Distinguir Recurso, Carpeta, Grupo, Anotación y comentario por forma y etiqueta. | Depender solo de color. |
| Mostrar acciones avanzadas al seleccionar o pedirlas. | Ocultar la única vía en hover o clic derecho. |
| Transiciones específicas de 120–180 ms con reducción de movimiento. | `transition-all` o animar posiciones del Canvas. |
| Etiqueta de `Group Frame` fuera del contenido. | Handles dentro de `overflow-hidden`. |
| Usar este spine para nuevos componentes. | Copiar estilos del prototipo si contradicen tokens. |
