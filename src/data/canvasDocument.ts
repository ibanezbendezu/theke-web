import type {DiagramDocument} from './useDiagrams';
import {resourceCardSize} from '../features/canvas/resourceCardSizing';
import {collectionSize} from '../features/canvas/collectionTypes';

export function migrateCanvasDocument(value: unknown): DiagramDocument {
    if (!value || typeof value !== 'object') throw new Error('El documento del diagrama está dañado.');
    const source = value as Partial<DiagramDocument>;
    if (source.schemaVersion !== 0 && source.schemaVersion !== 1) throw new Error('La versión del documento no es compatible.');
    if (!Array.isArray(source.nodes) || !Array.isArray(source.edges)) throw new Error('El documento del diagrama está incompleto.');
    const viewport = source.viewport ?? (source.schemaVersion === 0 ? {x: 0, y: 0, zoom: 1} : undefined);
    if (!viewport || ![viewport.x, viewport.y, viewport.zoom].every(value => typeof value === 'number' && Number.isFinite(value)) || viewport.zoom <= 0) throw new Error('La vista del diagrama está dañada.');
    const background = source.background ?? {variant: 'dots', tone: 'default'};
    if (!['plain', 'dots', 'grid'].includes(background.variant) || !['default', 'surface'].includes(background.tone)) throw new Error('El fondo del diagrama está dañado.');
    const nodes = source.nodes.map(node => node.type === 'resource' ? {
        ...node,
        ...resourceCardSize[node.data?.displayMode === 'normal' ? 'normal' : 'mini'],
        data: {...node.data, displayMode: node.data?.displayMode === 'normal' ? 'normal' : 'mini'}
    } : node.type === 'collection' ? (() => {
        const displayMode = node.data?.displayMode === 'gallery' || node.data?.displayMode === 'list' ? node.data.displayMode : 'stack';
        return {...node, ...collectionSize[displayMode], data: {...node.data, displayMode,
            resourceIds: Array.isArray(node.data?.resourceIds) ? node.data.resourceIds.filter(id => typeof id === 'string') : []}};
    })() : node.type === 'folder' ? {
        ...node,
        width: node.width ?? 288,
        height: node.height ?? 112
    } : node);
    return {schemaVersion: 1, nodes, edges: source.edges, viewport, background};
}
