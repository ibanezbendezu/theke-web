---
title: 'Publicar mediante un enlace no listado'
type: 'feature'
created: '2026-09-26'
status: 'review'
---

## Intent

Permitir que el autor confirme el inventario guardado de la Story 5.1 y comparta una proyección explícita mediante un enlace no enumerable, sin exponer su Biblioteca privada.

## Criterios de aceptación

- La publicación autenticada exige la huella de la previsualización vigente y una clave idempotente; el servidor compara de forma atómica contenido, relaciones y revisión antes de crear el único Compartido activo del Diagrama.
- La respuesta entrega un enlace copiable; reintentos con la misma clave no crean otro enlace y se registran sin incluir contenido privado.
- La ruta pública no requiere sesión, obtiene solamente la proyección allowlist asociada al token y da idéntica respuesta neutra para enlaces desconocidos o revocados; no permite edición ni transmite metadatos privados.
- Contenido sensible no llega a la respuesta pública por un filtrado en el navegador. Los archivos nunca exponen claves de almacenamiento ni enlaces privados; el acceso temporal a medios solo se activa tras una política de validación y entrega autorizada.
- La respuesta no se almacena en caché; se aplican cabeceras de seguridad. Queda pendiente la actualización viva y revocación desde la interfaz de la Story 5.3.

## Estado

En revisión. Se implementó el enlace no listado con confirmación explícita, huella de la previsualización vigente, creación serializable e idempotente y una proyección pública de solo lectura sin claves de almacenamiento ni metadatos privados. El servidor entrega los bytes de los archivos de la versión fijada mediante un endpoint que valida el token y el recurso publicado; la respuesta no incluye la clave de almacenamiento ni una URL del bucket. La publicación y cada reintento quedan registrados por actor sin contenido privado. Las respuestas públicas no usan caché y aplican cabeceras de seguridad; la ruta web no requiere una sesión del autor.

Las migraciones `0017_diagram_shares.sql` y `0018_diagram_share_media_audit.sql` se aplicaron al PostgreSQL de desarrollo. Una prueba de integración con PostgreSQL verificó previsualización obsoleta, proyección fija, reintento idempotente, auditoría y acceso al archivo publicado. Las pruebas focalizadas de API y web, compilaciones y contrato pasaron.

Se generó un `SHARE_TOKEN_SECRET` aleatorio de 48 bytes para el entorno local en `theke-api/.env`, ignorado por Git. Pendiente para marcarla `done`: configurar ese secreto de forma estable en el despliegue y verificar TLS y el flujo real con Clerk y un navegador sin sesión. La vista interactiva del Canvas corresponde a la Story 5.4; la administración y revocación desde Share Wizard, a la 5.3.
