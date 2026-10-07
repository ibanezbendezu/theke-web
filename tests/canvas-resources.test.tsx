import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CanvasResourcePicker } from '../src/features/canvas/CanvasResources';
import { placeResource } from '../src/features/canvas/placeResource';
import { useCanvasStore } from '../src/store/useCanvasStore';

vi.mock('../src/data/useResources', () => ({ useResources: () => ({ data: { pages: [{ data: [{ id: 'resource-1', title: 'Fuente', type: 'note' }] }] }, isPending: false, isError: false, hasNextPage: false }), useLinkActions: () => ({ create: { mutateAsync: vi.fn(), isPending: false } }) }));
afterEach(() => cleanup());

describe('recursos en el canvas', () => {
  it('distingue un recurso ya usado y ofrece navegar o añadir otra representación', () => {
    const select = vi.fn(); const focus = vi.fn();
    render(<CanvasResourcePicker projectId="project-1" usedIds={new Set(['resource-1'])} onClose={vi.fn()} onSelect={select} onFocus={focus} />);
    expect(screen.getByText(/Ya representado/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ir al uso' })); expect(focus).toHaveBeenCalledWith('resource-1');
    fireEvent.click(screen.getByRole('button', { name: 'Añadir otra' })); expect(select).toHaveBeenCalledWith('resource-1');
  });
  it('ubica sin solapar y deshace un lote sin tocar recursos canónicos', () => {
    useCanvasStore.setState({ nodes: [], edges: [] });
    const store = useCanvasStore.getState(); const first = store.addResourceRepresentation('resource-1', { x: 0, y: 0 });
    expect(placeResource(useCanvasStore.getState().nodes, { x: 0, y: 0 })).not.toEqual({ x: 0, y: 0 });
    const one = store.addUploadedResource('resource-2', 'batch-1', { x: 0, y: 0 }, 2);
    const two = store.addUploadedResource('resource-3', 'batch-1', { x: 0, y: 0 }, 2);
    const before = useCanvasStore.getState().nodes; expect(before.filter(node => node.type === 'container')).toHaveLength(0);
    expect(before.filter(node => node.parentId)).toHaveLength(0);
    store.removeNodes([...one, ...two]); expect(useCanvasStore.getState().nodes.map(node => node.id)).toEqual([first]);
  });
});
