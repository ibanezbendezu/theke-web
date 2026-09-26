import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { SharePreviewDialog } from '../src/features/canvas/SharePreviewDialog';

const state = vi.hoisted(() => ({ requested: vi.fn(), changed: false }));
vi.mock('../src/features/canvas/CanvasDialog', () => ({ CanvasDialog: ({ children }: { children: React.ReactNode }) => <div role="dialog">{children}</div> }));
vi.mock('../src/data/useSharePreview', () => ({ useSharePreview: () => {
  const [data, setData] = useState<unknown>();
  return { data, isPending: false, isError: false, reset: () => setData(undefined), mutate: () => { state.requested(); setData({
    diagramName: 'Mapa', revision: 4,
    resources: [{ id: 'one', title: 'Nota visible', type: 'note', description: 'Resumen', content: state.changed ? 'Texto corregido' : 'Texto publicado', url: null, mediaType: null, accessibilityText: null }, { id: 'two', title: 'Audio', type: 'file', description: null, content: null, url: null, mediaType: 'audio/mpeg', accessibilityText: null }],
    relations: [{ id: 'rel', sourceResourceId: 'one', targetResourceId: 'two', direction: 'directed', typeKey: 'supports', label: 'Sustenta', explanation: 'Referencia visible' }],
    warnings: [{ resourceId: 'two', field: 'accessibilityText', message: 'Falta descripción.' }], ready: false,
  }); } };
} }));

afterEach(() => { cleanup(); vi.clearAllMocks(); state.changed = false; });

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