import type {Node} from '@xyflow/react';

const width = 288;
const height = 112;
const gap = 24;

export function placeResource(nodes: Node[], preferred: { x: number; y: number }, size = {width, height}) {
    const occupied = nodes.map(node => ({
        x: node.position.x,
        y: node.position.y,
        width: node.width ?? 288,
        height: node.height ?? 112
    }));
    for (let ring = 0; ring < 30; ring++) {
        for (let row = -ring; row <= ring; row++) for (let column = -ring; column <= ring; column++) {
            if (Math.max(Math.abs(row), Math.abs(column)) !== ring) continue;
            const candidate = {x: preferred.x + column * (width + gap), y: preferred.y + row * (height + gap)};
            if (occupied.every(item => candidate.x + size.width + gap <= item.x || item.x + item.width + gap <= candidate.x || candidate.y + size.height + gap <= item.y || item.y + item.height + gap <= candidate.y)) return candidate;
        }
    }
    return {x: preferred.x + (nodes.length + 1) * (width + gap), y: preferred.y};
}
