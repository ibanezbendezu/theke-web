import type {Node} from '@xyflow/react';

export function absoluteNodePosition(node: Node, nodes: Node[]) {
    let x = node.position.x;
    let y = node.position.y;
    let parentId = node.parentId;
    const seen = new Set<string>();
    while (parentId && !seen.has(parentId)) {
        seen.add(parentId);
        const parent = nodes.find(item => item.id === parentId);
        if (!parent) break;
        x += parent.position.x;
        y += parent.position.y;
        parentId = parent.parentId;
    }
    return {x, y};
}

export function groupDropTarget(node: Node, nodes: Node[]): Node | undefined {
    if (node.type === 'container') return undefined;
    const position = absoluteNodePosition(node, nodes);
    const center = {
        x: position.x + (node.measured?.width ?? node.width ?? 0) / 2,
        y: position.y + (node.measured?.height ?? node.height ?? 0) / 2
    };
    return nodes.filter(group => group.type === 'container' && group.id !== node.id)
        .filter(group => {
            const origin = absoluteNodePosition(group, nodes);
            const width = group.measured?.width ?? group.width ?? 350;
            const height = group.measured?.height ?? group.height ?? 250;
            return center.x >= origin.x && center.x <= origin.x + width &&
                center.y >= origin.y && center.y <= origin.y + height;
        })
        .sort((a, b) => (a.width ?? 350) * (a.height ?? 250) - (b.width ?? 350) * (b.height ?? 250))[0];
}
