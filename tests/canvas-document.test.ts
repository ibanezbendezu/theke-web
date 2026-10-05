import { describe, expect, it } from 'vitest';
import { migrateCanvasDocument } from '../src/data/canvasDocument';
import { useCanvasStore } from '../src/store/useCanvasStore';

describe('migración de documentos del canvas', () => {
  it('convierte el esquema anterior de forma determinista', () => {
    const old = { schemaVersion: 0, nodes: [], edges: [] };
    expect(migrateCanvasDocument(old)).toEqual({ schemaVersion: 1, nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 }, background: { variant: 'dots', tone: 'default' } });
    expect(old).toEqual({ schemaVersion: 0, nodes: [], edges: [] });
  });
  it('mantiene fondo y presentaciones locales independientes, con deshacer', () => {
    const nodes = [
      { id: 'a', type: 'resource', position: { x: 0, y: 0 }, data: { resourceId: 'same' } },
      { id: 'b', type: 'resource', position: { x: 300, y: 0 }, data: { resourceId: 'same' } },
    ];
    useCanvasStore.getState().loadDocument(nodes, [], undefined, { variant: 'grid', tone: 'surface' });
    const store = useCanvasStore.getState();
    store.updateNodePresentation('a', { width: 400, accent: 'primary', hidden: true });
    expect(useCanvasStore.getState().nodes[1]).toEqual(nodes[1]);
    expect(useCanvasStore.getState().nodes[0]).toMatchObject({ width: 400, hidden: true, data: { accent: 'primary' } });
    store.setBackground({ variant: 'plain', tone: 'default' });
    store.undo();
    expect(useCanvasStore.getState().background).toEqual({ variant: 'grid', tone: 'surface' });
    store.undo();
    expect(useCanvasStore.getState().nodes[0]).toEqual(nodes[0]);
    expect(migrateCanvasDocument({ schemaVersion: 1, nodes, edges: [], viewport: { x: 0, y: 0, zoom: 1 }, background: { variant: 'grid', tone: 'surface' } }).background).toEqual({ variant: 'grid', tone: 'surface' });
  });
  it('rechaza documentos incompletos sin migrarlos parcialmente', () => {
    expect(() => migrateCanvasDocument({ schemaVersion: 0, nodes: [] })).toThrow('incompleto');
    expect(() => migrateCanvasDocument({ schemaVersion: 2, nodes: [], edges: [] })).toThrow('compatible');
  });
  it('restaura dimensiones de representaciones antiguas para que sigan visibles', () => {
    const node = { id: 'resource-1', type: 'resource', position: { x: 10, y: 20 }, data: { resourceId: 'resource-id' } };
    const migrated = migrateCanvasDocument({ schemaVersion: 1, nodes: [node], edges: [], viewport: { x: 0, y: 0, zoom: 1 } });
    expect(migrated.nodes[0]).toMatchObject({ width: 288, height: 112 });
    expect(node).not.toHaveProperty('width');
  });
  it('conserva la relación al cambiar el punto visual de conexión y permite deshacer', () => {
    const edge = {id: 'edge-1', source: 'a', target: 'b', type: 'editable', data: {relationId: 'relation-1'}};
    useCanvasStore.getState().loadDocument([
      {id: 'a', type: 'resource', position: {x: 0, y: 0}, data: {resourceId: 'resource-a'}},
      {id: 'b', type: 'resource', position: {x: 300, y: 0}, data: {resourceId: 'resource-b'}}
    ], [edge]);
    useCanvasStore.getState().reconnectEdge('edge-1', {
      source: 'a', target: 'b', sourceHandle: 'bottom', targetHandle: 'top'
    });
    expect(useCanvasStore.getState().edges[0]).toMatchObject({
      sourceHandle: 'bottom', targetHandle: 'top', data: {relationId: 'relation-1'}
    });
    useCanvasStore.getState().undo();
    expect(useCanvasStore.getState().edges[0]).toEqual(edge);
  });
});
