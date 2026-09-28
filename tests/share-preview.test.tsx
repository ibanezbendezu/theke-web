import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { SharePreviewDialog } from '../src/features/canvas/SharePreviewDialog';

const state = vi.hoisted(() => ({ requested: vi.fn(), published: vi.fn(), comments: vi.fn(), updated: vi.fn(), revoked: vi.fn(), changed: false, ready: false,
  activeShare: null as null | { active: true; url: string; fingerprint: string; revision: number; commentsEnabled: boolean } }));
vi.mock('../src/features/canvas/CanvasDialog', () => ({ CanvasDialog: ({ children }: { children: React.ReactNode }) => <div role="dialog">{children}</div> }));
vi.mock('../src/data/useShareManagement', () => ({ useShareManagement: () => ({ active: { data: state.activeShare, isPending: false, isError: false },
  comments: { isPending: false, isError: false, mutate: state.comments }, update: { isPending: false, isError: false, mutate: state.updated },
  revoke: { isPending: false, isError: false, mutate: state.revoked }, refresh: vi.fn() }) }));
vi.mock('../src/data/usePublishShare', () => ({ usePublishShare: () => {
  const [data, setData] = useState<unknown>();
  return { data, isError: false, isPending: false, reset: () => setData(undefined), mutate: (body: unknown) => { state.published(body); setData({ token: 'a'.repeat(43), url: `/share/${'a'.repeat(43)}` }); } };
} }));
vi.mock('../src/data/useSharePreview', () => ({ useSharePreview: () => {
  const [data, setData] = useState<unknown>();
  return { data, isPending: false, isError: false, reset: () => setData(undefined), mutate: () => { state.requested(); setData({
    diagramName: 'Mapa', revision: 4, fingerprint: 'reviewed-digest',
    resources: [{ id: 'one', title: 'Nota visible', type: 'note', description: 'Resumen', content: state.changed ? 'Texto corregido' : 'Texto publicado', url: null, mediaType: null, accessibilityText: null }, { id: 'two', title: 'Audio', type: 'file', description: null, content: null, url: null, mediaType: 'audio/mpeg', accessibilityText: null }],
    relations: [{ id: 'rel', sourceResourceId: 'one', targetResourceId: 'two', direction: 'directed', typeKey: 'supports', label: 'Sustenta', explanation: 'Referencia visible' }],
    warnings: state.ready ? [] : [{ resourceId: 'two', field: 'accessibilityText', message: 'Falta descripción.' }], ready: state.ready,
  }); } };
} }));

afterEach(() => { cleanup(); vi.clearAllMocks(); state.changed = false; state.ready = false; state.activeShare = null; });

it('muestra solo el inventario guardado y bloqueos sin activar un enlace público', () => {
  const onClose = vi.fn();
  render(<SharePreviewDialog diagramId="diagram-1" canPreview onClose={onClose} />);
  expect(screen.queryByText('Texto publicado')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Calcular inventario guardado' }));
  expect(state.requested).toHaveBeenCalledOnce();
  expect(screen.getByText(/Mapa · revisión guardada 4/)).toHaveTextContent('publicación estaría bloqueada');
  expect(screen.getByText('Texto publicado')).toBeInTheDocument();
  expect(screen.getByText(/Audio · accessibilityText: Falta descripción/)).toBeInTheDocument();
  expect(screen.getByText(/Sustenta/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Publicar/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Volver al editor' }));
  expect(onClose).toHaveBeenCalledOnce();
});

it('espera a que el diagrama esté guardado y compara cada nuevo inventario', () => {
  const { rerender } = render(<SharePreviewDialog diagramId="diagram-1" canPreview={false} onClose={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Calcular inventario guardado' })).toBeDisabled();
  rerender(<SharePreviewDialog diagramId="diagram-1" canPreview onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Calcular inventario guardado' }));
  state.changed = true;
  fireEvent.click(screen.getByRole('button', { name: 'Recalcular inventario' }));
  expect(screen.getByRole('region', { name: 'Cambios desde la última revisión' })).toHaveTextContent('Recurso modificado: Nota visible');
  rerender(<SharePreviewDialog diagramId="diagram-1" canPreview={false} onClose={vi.fn()} />);
  expect(screen.queryByText('Texto corregido')).not.toBeInTheDocument();
});

it('exige revisión explícita y no publica una vista obsoleta', () => {
  state.ready = true;
  const { rerender } = render(<SharePreviewDialog diagramId="diagram-1" canPreview onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Calcular inventario guardado' }));
  expect(screen.getByRole('button', { name: 'Publicar enlace no listado' })).toBeDisabled();
  fireEvent.click(screen.getByRole('checkbox', { name: /He revisado/ }));
  rerender(<SharePreviewDialog diagramId="diagram-1" canPreview={false} onClose={vi.fn()} />);
  expect(screen.queryByRole('button', { name: 'Publicar enlace no listado' })).not.toBeInTheDocument();
  rerender(<SharePreviewDialog diagramId="diagram-1" canPreview onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Publicar enlace no listado' }));
  expect(state.published).toHaveBeenCalledWith({ fingerprint: 'reviewed-digest', idempotencyKey: expect.any(String) });
  expect(screen.getByRole('textbox', { name: 'Enlace para compartir' })).toHaveValue(`${window.location.origin}/share/${'a'.repeat(43)}`);
  fireEvent.click(screen.getByRole('button', { name: 'Recalcular inventario' }));
  expect(screen.queryByRole('textbox', { name: 'Enlace para compartir' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Publicar enlace no listado' })).toBeDisabled();
});

it('administra comentarios, actualización y revocación con confirmación', () => {
  state.ready = true;
  state.activeShare = { active: true, url: `/share/${'a'.repeat(43)}`, fingerprint: 'old-digest', revision: 3, commentsEnabled: true };
  render(<SharePreviewDialog diagramId="diagram-1" canPreview onClose={vi.fn()} />);
  expect(screen.getByRole('textbox', { name: 'Enlace para compartir' })).toHaveValue(`${window.location.origin}/share/${'a'.repeat(43)}`);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Permitir nuevos comentarios en este enlace' }));
  expect(state.comments).toHaveBeenCalledWith({ enabled: false });
  fireEvent.click(screen.getByRole('button', { name: 'Calcular inventario guardado' }));
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar revisión pública' }));
  expect(state.updated).toHaveBeenCalledWith({ fingerprint: 'reviewed-digest', expectedPublishedFingerprint: 'old-digest' });
  expect(screen.getByRole('button', { name: 'Revocar enlace' })).toBeDisabled();
  fireEvent.change(screen.getByRole('textbox', { name: 'Confirmar revocación' }), { target: { value: 'REVOCAR' } });
  fireEvent.click(screen.getByRole('button', { name: 'Revocar enlace' }));
  expect(state.revoked).toHaveBeenCalledWith({ expectedPublishedFingerprint: 'old-digest', confirmation: 'REVOCAR' }, expect.any(Object));
});
