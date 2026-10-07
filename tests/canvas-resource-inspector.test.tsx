import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CanvasResourceInspector } from '../src/features/canvas/CanvasResourceInspector';
import { useCanvasStore } from '../src/store/useCanvasStore';

const mocks = vi.hoisted(() => ({ resource: { current: { id: 'resource-1', title: 'Fuente actualizada', type: 'note', status: 'ready', content: 'Contenido canónico', mediaType: null } as { id: string; title: string; type: string; status: string; content?: string; mediaType: string | null } }, access: vi.fn() }));
vi.mock('../src/data/useResources', () => ({ useResource: () => ({ data: mocks.resource.current, isPending: false, isError: false }), useResourceActions: () => ({ access: mocks.access }) }));
vi.mock('../src/data/useNotes', () => ({ useNoteActions: () => ({ update: { mutateAsync: vi.fn(), isPending: false } }) }));
afterEach(() => cleanup());
beforeEach(() => { mocks.resource.current = { id: 'resource-1', title: 'Fuente actualizada', type: 'note', status: 'ready', content: 'Contenido canónico', mediaType: null }; mocks.access.mockReset(); });

describe('detalle de recursos en el canvas', () => {
  it('separa contenido canónico de la etiqueta local y abre el panel al solicitarlo', () => {
    useCanvasStore.setState({ nodes: [{ id: 'node-1', type: 'resource', position: { x: 5, y: 9 }, data: { resourceId: 'resource-1' } }], inspectorOpen: false });
    useCanvasStore.getState().openCanvasNode('node-1');
    expect(useCanvasStore.getState().inspectorOpen).toBe(true);
    expect(useCanvasStore.getState().nodes[0].selected).toBe(true);
    render(<CanvasResourceInspector nodeId="node-1" resourceId="resource-1" />);
    expect(screen.getByRole('region', { name: 'Datos del recurso' })).toHaveTextContent('Fuente actualizada');
    expect(screen.getByText('Contenido canónico')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Etiqueta local'), { target: { value: 'Mi etiqueta' } });
    expect(useCanvasStore.getState().nodes[0].data).toEqual({ resourceId: 'resource-1', caption: 'Mi etiqueta' });
    expect(useCanvasStore.getState().nodes[0].position).toEqual({ x: 5, y: 9 });
  });
  it('conserva acceso al original y a la Biblioteca si falla la vista previa', async () => {
    mocks.resource.current = { id: 'resource-1', title: 'Imagen', type: 'file', status: 'ready', mediaType: 'image/png' };
    mocks.access.mockRejectedValueOnce(new Error('sin conexión'));
    render(<CanvasResourceInspector nodeId="node-1" resourceId="resource-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Vista previa' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('No se pudo abrir el archivo'));
    expect(screen.getByRole('button', { name: 'Descargar original' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir en Biblioteca' })).toHaveAttribute('href', '/library/resource-1');
  });
});
