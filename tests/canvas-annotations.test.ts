import { describe, expect, it } from 'vitest';
import { useCanvasStore } from '../src/store/useCanvasStore';

describe('anotaciones locales', () => {
  it('crea texto, forma y línea sin recursos ni relaciones, y deshace cambios', () => {
    useCanvasStore.setState({ nodes: [], edges: [], past: [], future: [], gestureSnapshot: null });
    const store = useCanvasStore.getState();
    const textId = store.addAnnotation('text', { x: 20, y: 30 });
    const shapeId = store.addAnnotation('shape', { x: 200, y: 30 });
    const lineId = store.addAnnotation('line', { x: 200, y: 240 });
    const nodes = useCanvasStore.getState().nodes;
    expect(nodes.map(node => node.type)).toEqual(['annotation', 'annotation', 'annotation']);
    expect(nodes.map(node => node.data.kind)).toEqual(['text', 'shape', 'line']);
    expect(nodes.every(node => !('resourceId' in node.data))).toBe(true);
    expect(useCanvasStore.getState().edges).toHaveLength(0);
    store.updateNodeData(textId, { text: 'Idea', fontSize: 20, align: 'center', color: 'primary' });
    store.updateNodeData(lineId, { x1: 0, y1: 100, x2: 100, y2: 0, thickness: 5, dash: 'dashed' });
    store.updateNodeSize(shapeId, 320, 180);
    const copyId = store.duplicateNode(textId)!;
    expect(useCanvasStore.getState().nodes.find(node => node.id === copyId)?.data.text).toBe('Idea');
    store.removeNodes([copyId]); expect(useCanvasStore.getState().nodes.find(node => node.id === copyId)).toBeUndefined();
    store.undo(); expect(useCanvasStore.getState().nodes.find(node => node.id === copyId)).toBeDefined();
    store.redo(); expect(useCanvasStore.getState().nodes.find(node => node.id === copyId)).toBeUndefined();
  });
  it('registra un movimiento como una sola operación', () => {
    useCanvasStore.setState({ nodes: [], edges: [], past: [], future: [], gestureSnapshot: null });
    const store = useCanvasStore.getState(); const id = store.addAnnotation('shape', { x: 10, y: 10 });
    const count = useCanvasStore.getState().past.length;
    store.beginGesture();
    store.onNodesChange([{ id, type: 'position', position: { x: 20, y: 20 } }, { id, type: 'position', position: { x: 30, y: 30 } }]);
    store.endGesture();
    expect(useCanvasStore.getState().past).toHaveLength(count + 1);
    store.undo(); expect(useCanvasStore.getState().nodes.find(node => node.id === id)?.position).toEqual({ x: 10, y: 10 });
  });
  it('copia y corta elementos visuales sin mezclar recursos, y permite deshacer el pegado', () => {
    useCanvasStore.setState({ nodes: [], edges: [], past: [], future: [], gestureSnapshot: null, visualClipboard: null });
    const store = useCanvasStore.getState();
    const text = store.addAnnotation('text', { x: 20, y: 30 });
    const shape = store.addAnnotation('shape', { x: 100, y: 80 });
    expect(store.copyVisualNodes([text, shape])).toBe(true);
    const copies = store.pasteVisualNodes();
    expect(copies).toHaveLength(2);
    expect(useCanvasStore.getState().nodes.find(node => node.id === copies[0])?.position).toEqual({ x: 44, y: 54 });
    expect(useCanvasStore.getState().nodes.find(node => node.id === copies[1])?.position).toEqual({ x: 124, y: 104 });
    store.undo();
    expect(useCanvasStore.getState().nodes).toHaveLength(2);
    expect(store.cutVisualNodes([shape])).toBe(true);
    expect(useCanvasStore.getState().nodes).toHaveLength(1);
    const [pasted] = store.pasteVisualNodes({ x: 300, y: 400 });
    expect(useCanvasStore.getState().nodes.find(node => node.id === pasted)?.position).toEqual({ x: 300, y: 400 });
    store.undo();
    expect(useCanvasStore.getState().nodes).toHaveLength(1);
    store.undo();
    expect(useCanvasStore.getState().nodes).toHaveLength(2);
  });
  it('conserva la posición de texto y línea al cortar y pegar repetidamente', () => {
    useCanvasStore.setState({ nodes: [], edges: [], past: [], future: [], gestureSnapshot: null, visualClipboard: null });
    const store = useCanvasStore.getState();
    const positions = [{ x: 35, y: 70 }, { x: 210, y: 145 }];
    let ids = [store.addAnnotation('text', positions[0]), store.addAnnotation('line', positions[1])];
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(store.cutVisualNodes(ids)).toBe(true);
      ids = store.pasteVisualNodes();
      expect(ids.map(id => useCanvasStore.getState().nodes.find(node => node.id === id)?.position)).toEqual(positions);
    }
    const repeated = store.pasteVisualNodes();
    expect(repeated.map(id => useCanvasStore.getState().nodes.find(node => node.id === id)?.position)).toEqual(positions);
  });
});
