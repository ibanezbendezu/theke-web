import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CanvasSemanticView } from '../src/features/canvas/CanvasSemanticView';
import { useCanvasStore } from '../src/store/useCanvasStore';

vi.mock('../src/data/useOrganization', () => ({ useOrganization: () => ({ data: { folders: [], resources: [{ resourceId: 'r1', title: 'Documento' }] } }) }));
vi.mock('../src/data/useLibraryFolders', () => ({ useLibraryFolders: () => ({ data: [] }) }));
afterEach(() => cleanup());

describe('vista semántica del canvas', () => {
  it('sincroniza selección y permite mover, agrupar, quitar y deshacer', () => {
    useCanvasStore.setState({ nodes: [
      { id: 'group', type: 'container', position: { x: 0, y: 0 }, data: { label: 'Grupo A' } },
      { id: 'one', type: 'resource', position: { x: 10, y: 10 }, data: { resourceId: 'r1' } },
      { id: 'two', type: 'annotation', position: { x: 30, y: 30 }, data: { kind: 'text', text: 'Idea' }, hidden: true },
    ], edges: [], past: [], future: [], gestureSnapshot: null });
    render(<CanvasSemanticView projectId="p1" />);
    expect(screen.getByRole('list').textContent).toContain('Documento');
    expect(screen.getByRole('list').textContent).toContain('Oculto');
    fireEvent.click(screen.getByRole('button', { name: /Documento — Recurso/ }));
    expect(useCanvasStore.getState().nodes.find(node => node.id === 'one')?.selected).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Opciones de Documento' }));
    expect(screen.getByRole('button', { name: 'Abrir detalle' })).toHaveFocus();
    fireEvent.click(screen.getByText('Mover en el lienzo'));
    fireEvent.click(screen.getByRole('button', { name: 'Mover derecha' }));
    expect(useCanvasStore.getState().nodes.find(node => node.id === 'one')?.position.x).toBe(30);
    fireEvent.click(screen.getByRole('button', { name: 'Grupo visual del elemento' }));
    fireEvent.click(screen.getByRole('option', { name: 'Grupo A' }));
    expect(useCanvasStore.getState().nodes.find(node => node.id === 'one')?.parentId).toBe('group');
    fireEvent.click(screen.getByRole('button', { name: 'Quitar representación del diagrama' }));
    expect(useCanvasStore.getState().nodes.find(node => node.id === 'one')).toBeUndefined();
    expect(screen.getByRole('button', { name: /Idea — Anotación/ })).toHaveFocus();
    useCanvasStore.getState().undo();
    expect(useCanvasStore.getState().nodes.find(node => node.id === 'one')).toBeDefined();
  });

  it('ordena capas al arrastrar y permite deshacer el cambio', () => {
    useCanvasStore.setState({ nodes: [
      { id: 'one', type: 'resource', position: { x: 0, y: 0 }, data: { resourceId: 'r1' } },
      { id: 'two', type: 'annotation', position: { x: 0, y: 0 }, data: { kind: 'text', text: 'Idea' } },
    ], edges: [], past: [], future: [], gestureSnapshot: null });
    render(<CanvasSemanticView projectId="p1" />);
    const source = screen.getByRole('button', { name: /Documento — Recurso/ }).closest('li')!;
    const target = screen.getByRole('button', { name: /Idea — Anotación/ }).closest('li')!;
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({ top: 0, height: 100 } as DOMRect);
    const dataTransfer = { effectAllowed: 'move', dropEffect: 'move', setData: vi.fn(), getData: () => 'one' };
    fireEvent.dragStart(source, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'one');
    const dragOver = new Event('dragover', { bubbles: true, cancelable: true });
    Object.defineProperties(dragOver, { dataTransfer: { value: dataTransfer }, clientY: { value: 1 } });
    fireEvent(target, dragOver);
    expect(target.firstElementChild?.className).toContain('border-t-2');
    fireEvent.drop(target, { dataTransfer });
    expect(useCanvasStore.getState().past).toHaveLength(1);
    expect(useCanvasStore.getState().nodes.find(node => node.id === 'one')?.zIndex).toBeGreaterThan(useCanvasStore.getState().nodes.find(node => node.id === 'two')?.zIndex ?? 0);
    expect(screen.getByRole('list').firstElementChild?.textContent).toContain('Documento');
    useCanvasStore.getState().undo();
    expect(useCanvasStore.getState().nodes.find(node => node.id === 'one')?.zIndex).toBeUndefined();
  });
});
