import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CanvasResourcePanel } from '../src/features/canvas/CanvasResourceBrowser';
import { placeResource } from '../src/features/canvas/placeResource';
import { useCanvasStore } from '../src/store/useCanvasStore';

const loading = vi.hoisted(() => ({ map: false, library: false }));
vi.mock('../src/data/useResources', () => ({ useResources: () => ({ data: { pages: [{ data: [{ id: 'resource-1', title: 'Fuente', type: 'note', updatedAt: '2026-10-01', mediaType: null }] }] }, isPending: loading.library, isError: false, isPlaceholderData: false, hasNextPage: false }) }));
vi.mock('../src/data/useOrganization', () => ({ useOrganization: () => ({ data: { resources: [{ resourceId: 'resource-1', title: 'Fuente', type: 'note', updatedAt: '2026-10-01', archivedAt: null, mediaType: null }] }, isPending: loading.map, isError: false }) }));
vi.mock('../src/data/useLibraryFolders', () => ({ useLibraryFolders: () => ({ data: [], isPending: false, isError: false }) }));
afterEach(() => { cleanup(); loading.map = false; loading.library = false; });

describe('recursos en el canvas', () => {
  it('separa recursos del mapa y Biblioteca y deja la copia como acción secundaria', () => {
    useCanvasStore.setState({ nodes: [], edges: [] });
    useCanvasStore.getState().addResourceRepresentation('resource-1', { x: 0, y: 0 });
    const add = vi.fn(); const another = vi.fn(); const focus = vi.fn();
    render(<CanvasResourcePanel projectId="project-1" onAdd={add} onAddAnother={another} onFocus={focus} onFocusNode={vi.fn()} onSelectFolder={vi.fn()}/>);
    expect(screen.getByRole('tabpanel', { name: 'Recursos del mapa' })).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('tabpanel', { name: 'Recursos del mapa' })).getByRole('button', { name: /^Fuente/ }));
    expect(focus).toHaveBeenCalledWith('resource-1');
    fireEvent.click(screen.getByRole('button', { name: 'Opciones de Fuente' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Añadir otra representación' }));
    expect(another).toHaveBeenCalledWith('resource-1');
    fireEvent.click(screen.getByRole('tab', { name: 'Biblioteca' }));
    expect(screen.getByRole('tabpanel', { name: 'Biblioteca' })).toBeInTheDocument();
    expect(within(screen.getByRole('tabpanel', { name: 'Biblioteca' })).getByRole('button', { name: /^Fuente/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Añadir a Biblioteca' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ordenar recursos' }));
    expect(screen.getByRole('listbox', { name: 'Ordenar recursos' })).toBeInTheDocument();
    expect(add).not.toHaveBeenCalled();
  });
  it('usa skeletons compactos según la vista mientras carga', () => {
    loading.map = true; loading.library = true;
    render(<CanvasResourcePanel projectId="project-1" onAdd={vi.fn()} onAddAnother={vi.fn()} onFocus={vi.fn()} onFocusNode={vi.fn()} onSelectFolder={vi.fn()}/>);
    expect(screen.getByRole('status', { name: 'Cargando recursos' }).querySelectorAll(':scope > [aria-hidden="true"]')).toHaveLength(5);
    fireEvent.click(screen.getByRole('tab', { name: 'Biblioteca' }));
    fireEvent.click(screen.getByRole('button', { name: 'Vista de galería' }));
    expect(screen.getByRole('status', { name: 'Cargando recursos' }).querySelectorAll(':scope > [aria-hidden="true"]')).toHaveLength(4);
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
