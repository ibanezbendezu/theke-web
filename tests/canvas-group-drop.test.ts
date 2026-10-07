import {describe, expect, it} from 'vitest';
import {groupDropTarget} from '../src/features/canvas/groupDropTarget';
import {useCanvasStore} from '../src/store/useCanvasStore';

describe('entrada visual a grupos', () => {
    const group = {id: 'group', type: 'container', position: {x: 100, y: 100}, width: 200, height: 200, data: {label: 'Grupo'}};
    it('no incorpora por un roce; exige que el centro entre al grupo', () => {
        const node = {id: 'item', type: 'resource', position: {x: 50, y: 130}, width: 80, height: 80, data: {resourceId: 'r1'}};
        expect(groupDropTarget(node, [group, node])).toBeUndefined();
        expect(groupDropTarget({...node, position: {x: 70, y: 130}}, [group, node])?.id).toBe('group');
    });

    it('expande al incorporar y conserva la posición absoluta de los demás miembros', () => {
        useCanvasStore.setState({nodes: [
            group,
            {id: 'existing', type: 'resource', parentId: 'group', position: {x: 40, y: 40}, width: 60, height: 60, data: {resourceId: 'r2'}},
            {id: 'item', type: 'resource', position: {x: 70, y: 130}, width: 80, height: 80, data: {resourceId: 'r1'}}
        ], edges: [], past: [], future: [], gestureSnapshot: null});
        useCanvasStore.getState().setNodeParent('item', 'group', {x: -30, y: 30});
        const nodes = useCanvasStore.getState().nodes;
        const updatedGroup = nodes.find(node => node.id === 'group')!;
        const existing = nodes.find(node => node.id === 'existing')!;
        const item = nodes.find(node => node.id === 'item')!;
        expect(updatedGroup.position.x).toBeLessThan(100);
        expect(updatedGroup.position.x + existing.position.x).toBe(140);
        expect(updatedGroup.position.x + item.position.x).toBe(70);
        expect(item.expandParent).toBe(false);
    });
});
