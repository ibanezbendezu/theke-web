import { describe, expect, it } from 'vitest';
import { useCanvasStore } from '../src/store/useCanvasStore';

describe('grupos visuales', () => {
  it('conserva posiciones absolutas al agrupar, añadir, quitar y desagrupar', () => {
    useCanvasStore.setState({ nodes: [
      { id: 'one', type: 'resource', position: { x: 100, y: 200 }, data: { resourceId: 'resource-1' }, selected: true },
      { id: 'two', type: 'folder', position: { x: 450, y: 200 }, data: { folderId: 'folder-1', projectId: 'project-1' }, selected: true },
      { id: 'three', type: 'resource', position: { x: 800, y: 300 }, data: { resourceId: 'resource-2' } },
    ], edges: [] });
    const store = useCanvasStore.getState(); const groupId = store.groupNodes(['one', 'two']); expect(groupId).toBeTruthy();
    const grouped = useCanvasStore.getState().nodes; const group = grouped.find(node => node.id === groupId)!;
    expect(grouped.findIndex(node => node.id === groupId)).toBeLessThan(grouped.findIndex(node => node.id === 'one'));
    expect(grouped.find(node => node.id === 'one')!.position.x + group.position.x).toBe(100);
    expect(grouped.find(node => node.id === 'two')!.position.x + group.position.x).toBe(450);
    store.moveNodeToGroup('three', groupId!);
    expect(useCanvasStore.getState().nodes.find(node => node.id === 'three')!.position.x + group.position.x).toBe(800);
    store.moveNodeToGroup('three'); expect(useCanvasStore.getState().nodes.find(node => node.id === 'three')!.position.x).toBe(800);
    store.ungroupNode(groupId!);
    expect(useCanvasStore.getState().nodes.map(node => node.id).sort()).toEqual(['one', 'three', 'two']);
    expect(useCanvasStore.getState().nodes.find(node => node.id === 'one')!.position).toEqual({ x: 100, y: 200 });
  });
  it('al quitar un grupo conserva sus miembros, sus relaciones y sus posiciones', () => {
    useCanvasStore.setState({ nodes: [
      { id: 'group', type: 'container', position: { x: 80, y: 120 }, data: { label: 'Grupo' } },
      { id: 'one', type: 'resource', parentId: 'group', position: { x: 20, y: 30 }, data: { resourceId: 'resource-1' } },
      { id: 'two', type: 'resource', parentId: 'group', position: { x: 100, y: 90 }, data: { resourceId: 'resource-2' } },
    ], edges: [{ id: 'relation', source: 'one', target: 'two' }] });
    useCanvasStore.getState().removeNodes(['group']);
    const current = useCanvasStore.getState();
    expect(current.nodes.map(node => node.id)).toEqual(['one', 'two']);
    expect(current.nodes.find(node => node.id === 'one')).toMatchObject({ position: { x: 100, y: 150 }, parentId: undefined });
    expect(current.nodes.find(node => node.id === 'two')).toMatchObject({ position: { x: 180, y: 210 }, parentId: undefined });
    expect(current.edges.map(edge => edge.id)).toEqual(['relation']);
    current.undo();
    expect(useCanvasStore.getState().nodes.find(node => node.id === 'one')?.parentId).toBe('group');
  });
  it('puede quitar explícitamente el grupo y sus elementos', () => {
    useCanvasStore.setState({ nodes: [
      { id: 'group', type: 'container', position: { x: 80, y: 120 }, data: { label: 'Grupo' } },
      { id: 'one', type: 'resource', parentId: 'group', position: { x: 20, y: 30 }, data: { resourceId: 'resource-1' } },
    ], edges: [] });
    useCanvasStore.getState().removeNodes(['group', 'one']);
    expect(useCanvasStore.getState().nodes).toHaveLength(0);
  });
});
