# Revisión UI/UX previa a la épica 6

Fecha: 2026-09-28. Alcance: comparación estática entre los spines UX aprobados y la implementación actual de publicación y vista compartida. No sustituye una inspección visual en navegador.

## Decisión de secuencia

Corregir primero las diferencias de estructura y comportamiento detectables en código. Después comprobar en Browser los recorridos reales en escritorio, tablet y 320 CSS px, y ajustar el resultado antes de iniciar los comentarios de la épica 6.

## Hallazgos priorizados

1. **Sistema visual:** `DESIGN.md` define tema oscuro frío (`background-dark #1E1F22`, `surface-dark #2B2D30`, `primary-dark #3574F0`). `src/index.css` aún usa el tema oscuro anterior (`#191919`, `#202020`, `#2383E2`) y solo una parte de los tokens aprobados. Unificar tokens semánticos antes de pulir pantallas individuales para evitar inconsistencias de contraste y estados.
2. **Estructura del compartido:** `EXPERIENCE.md` pide Canvas y panel derecho simultáneos en escritorio, panel superpuesto y cerrable en tablet y hoja inferior en móvil. `PublicShare.tsx` apila Canvas, lista semántica e inspector en una sola columna. Convertir el detalle en panel adaptable, con cierre y retorno de foco; conservar la lista semántica como alternativa de navegación.
3. **Publicación:** el `Share Wizard` aprobado tiene tres pasos (Vista previa → Contenido expuesto → Acceso), permite retroceder y conserva opciones al cancelar. `SharePreviewDialog.tsx` reúne inventario, confirmación, enlace y administración en un diálogo largo. Separar el flujo de creación de la administración del enlace y hacer visible qué se expone antes de publicar.
4. **Alternativas multimedia:** la guía exige transcripción para audio y subtítulos sincronizados más alternativa visual para video. La proyección actual publica `accessibilityText` como texto único y el visor no recibe pistas de subtítulos. Definir modelo, carga y validación por Recurso antes de considerar completo el criterio multimedia de la Story 5.5.

## Validación posterior en Browser

- Recorrer publicar → abrir enlace → seleccionar Recurso y Relación → abrir/descargar archivo → revocar enlace.
- Revisar 320 CSS px, tablet y escritorio, zoom del navegador al 200 %, teclado, foco al abrir/cerrar panel y controles táctiles de al menos 44 CSS px.
- Probar archivo sin vista previa, vista previa fallida, audio/video con alternativas, tema claro/oscuro, contraste alto y movimiento reducido.
- Medir tiempo hasta contenido útil del compartido en conexión de banda ancha, como requiere la Story 5.4.

Referencias: `_bmad-output/planning-artifacts/ux-designs/ux-Theke-2026-09-19/DESIGN.md`, `EXPERIENCE.md`, `mockups/key-share-wizard.html` y `mockups/key-shared-mobile-comment.html`.
