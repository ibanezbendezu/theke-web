---
title: 'Abrir recursos públicos en cualquier dispositivo'
type: 'feature'
created: '2026-09-28'
status: 'done'
baseline_commit: 'c4f03189b2015a5a74f0d9ba05b0170d14daa34d'
---

## Intent

Permitir que un visitante consulte cada Recurso de la proyección pública desde pantallas pequeñas o grandes, con controles accesibles y alternativas cuando su navegador no pueda mostrar el archivo.

## Implementación

- El inspector usa exclusivamente la proyección pública. Muestra texto y metadatos autorizados, y abre enlaces solo con esquemas HTTP(S).
- Los archivos admiten abrir y descargar por rutas públicas separadas por `download=1`. Imagen, audio y video se cargan al seleccionar el Recurso; audio y video usan `preload=none`. PDF y texto se abren en otra pestaña. Un formato sin vista previa conserva abrir y descargar.
- Un fallo de imagen, audio o video muestra una explicación y permite reintentar mediante una solicitud nueva, sin bloquear el resto del Diagrama.
- La API entrega `no-store` y revalida token activo y pertenencia del Recurso en **cada** apertura, descarga o reintento. No emite URLs temporales de almacenamiento; una URL antigua de la API tampoco elude la revocación.
- Títulos, detalles, listas y controles pueden envolver contenido largo. El Canvas conserva zoom, ajuste y navegación semántica.
- Las acciones de abrir, descargar y reintentar usan controles tonales sin contorno permanente y objetivos de al menos 44 px; el detalle se presenta junto al Canvas en escritorio, superpuesto en tablet y como hoja inferior en móvil.

## Verificación y estado

Pasaron las pruebas focalizadas del visor público y controlador, build y lint de API y web, y la verificación de contrato de ambos repositorios.

El 2026-10-03 se revisó una nota publicada en escritorio, tablet y 320 CSS px; el inspector móvil y el retorno de foco funcionaron. La publicación local no contiene archivos multimedia, así que siguen pendientes su apertura, descarga, reintento y alternativas en navegador real. La política UX pide subtítulos sincronizados para video, mientras el modelo publicado ofrece una alternativa textual; ese desfase requiere una decisión de producto. Véase `smoke-review-2026-10-03.md`.

El 2026-11-24 se añadieron casos automatizados para enlaces HTTP(S), imagen, audio, video, PDF, texto y formatos sin vista previa. Comprueban carga diferida, `preload="none"`, apertura en otra pestaña, descarga, error y reintento con una URL nueva, además de objetivos táctiles de 44 px. Pasan las 20 pruebas focalizadas de `tests/public-share.test.tsx`, lint, build y contrato web. La revisión visual con archivos multimedia reales y la decisión sobre subtítulos sincronizados permanecen registradas en `deferred-work.md`.

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 5.5.
- `_bmad-output/planning-artifacts/ux-designs/ux-Theke-2026-09-19/EXPERIENCE.md`.
- `src/pages/PublicResourceDetail.tsx` y `theke-api/src/interfaces/http/public-shares.controller.ts`.

## Review Triage Log

| Capa | Hallazgo | Veredicto | Evidencia y ruta |
| --- | --- | --- | --- |
| blind-hunter | La normalización de `zIndex` elimina el orden relativo entre elementos no contenedores. | medium · patch | El editor genera niveles cero y negativos; `Math.max(..., 1)` los iguala. Se conservará el orden relativo desplazando el conjunto sobre el fondo de los grupos. |
| blind-hunter | La vista semántica omite tipos visuales admitidos por el contrato. | medium · patch | `PublicLayoutNodeType` incluye `collection`, `shape`, `link`, `media`, `document` y `audio`, pero el filtro actual no los incorpora. |
| blind-hunter | Una anotación sin tipo se anuncia como línea aunque el Canvas la representa como texto. | low · patch | El fallback de `publicVisualMeta` contradice la rama final del renderizador de anotaciones. |
| blind-hunter | Acciones de comentario y cierre afectadas miden 36–40 px. | medium · patch | Los controles nuevos o modificados usan `h-9/w-9` o `h-10/w-10`; se ajustarán a 44 px. |
| blind-hunter | “Mostrar detalles” aparece sin selección y en móvil no puede mostrar contenido. | medium · patch | `detailsOpen` cambia, pero el panel conserva `hidden` mientras `selection` sea nula. El control se condicionará a una selección. |
| blind-hunter | Una carpeta seleccionada no comunica estado activo. | low · patch | Su botón no tiene `aria-pressed` ni estilo tonal, a diferencia de Recursos y Relaciones. |
| blind-hunter | No se comprueba con una interacción la selección de un Recurso dentro de un grupo. | medium · patch | La prueba solo observa `pointer-events`; se añadirá un clic sobre el nodo de Recurso y se observará su detalle. |
| blind-hunter | La nota de verificación afirma objetivos de 44 px de forma general. | false | La frase enumera lo comprobado por los nuevos casos del visor de Recursos; no afirma que audite cada control del mapa público. |
| edge-case-hunter | Un `mediaType` en mayúsculas se clasifica como Archivo. | low · patch | La API valida MIME sin distinguir mayúsculas, pero `publicResourceMeta` usa `startsWith` y comparación sensibles a ellas. |
| edge-case-hunter | Una anotación sin tipo o desconocida se clasifica como Línea. | low · patch | Confirmado por el fallback de `publicVisualMeta`; coincide con el tercer hallazgo y se corrige conjuntamente. |
| edge-case-hunter | Los botones de comentario bajaron de 44 a 36 px. | medium · patch | Confirmado en las filas de Recursos y Relaciones de `PublicSemanticList`; coincide con el cuarto hallazgo. |
| edge-case-hunter | El abridor de detalles inicial mide 40 px. | medium · patch | La ruta por defecto usa `h-10/w-10`; cuando exista selección será un objetivo de 44 px. |
| verification-gap | No hay fixture público con niveles de capa explícitos y conflictivos. | medium · patch | La prueba actual omite `zIndex`; se añadirá una combinación que compruebe fondo de grupo y orden relativo de contenido. |
| verification-gap | La representación semántica de elementos visuales carece de aserciones observables. | medium · patch | Las pruebas no verifican títulos, tipos localizados ni contador; se añadirá cobertura focalizada. |
