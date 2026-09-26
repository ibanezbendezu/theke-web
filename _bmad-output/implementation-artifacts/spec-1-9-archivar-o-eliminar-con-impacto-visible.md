---
title: 'Archivar o eliminar con impacto visible'
type: 'feature'
created: '2026-09-24'
status: 'done'
---

## Intent

Evitar pérdidas accidentales mostrando el impacto real de archivar o eliminar y exigiendo una confirmación informada y vigente.

## Constraints

- El impacto siempre se calcula y autoriza dentro de la Cuenta.
- Una confirmación obsoleta se rechaza y devuelve el impacto actualizado.
- Las operaciones usan transacción serializable, frase exacta e idempotencia.
- Los Recursos con usos activos no se eliminan; se recomienda archivarlos.
- La eliminación es recuperable durante 30 días y no elimina Recursos canónicos al retirar un Proyecto.

## Tasks

- [x] Impacto de Recurso, Proyecto y Carpeta calculado en servidor.
- [x] Archivo/restauración de Recursos con identidad conservada en usos existentes.
- [x] Eliminación diferida 30 días e idempotente de Recursos sin usos y Proyectos.
- [x] Confirmación obsoleta rechazada dentro de una transacción serializable.
- [x] Reintento acotado de la transacción completa ante conflicto serializable PostgreSQL `40001`.
- [x] Diálogo accesible con foco contenido/restaurado y lenguaje explícito.
- [x] Contrato, migración, cliente y pruebas focalizadas con PostgreSQL real.
- [ ] Gate externo del piloto y export ZIP completa, registrado en `deferred-work.md`.
