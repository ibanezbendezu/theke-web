---
title: 'Abrir recursos públicos en cualquier dispositivo'
type: 'feature'
created: '2026-09-28'
status: 'in-progress'
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

Pasaron las pruebas focalizadas del visor público y controlador, build y lint de los archivos modificados, y la verificación de contrato de API y web. El lint global web conserva tres errores previos en los componentes de IA.

Pendiente antes de pasar a `review`: comprobar visualmente una publicación real en 320 CSS px, tablet y escritorio; revisar controles táctiles, foco y alternativas multimedia en navegadores reales. El navegador de automatización no estuvo disponible en esta sesión. La política UX también pide subtítulos sincronizados para video, mientras el modelo publicado ofrece una alternativa textual; ese desfase requiere decisión durante la revisión UI/UX previa a la épica 6.

## Referencias

- `_bmad-output/planning-artifacts/epics.md`, Story 5.5.
- `_bmad-output/planning-artifacts/ux-designs/ux-Theke-2026-09-19/EXPERIENCE.md`.
- `src/pages/PublicResourceDetail.tsx` y `theke-api/src/interfaces/http/public-shares.controller.ts`.
