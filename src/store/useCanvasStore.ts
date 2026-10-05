import {create} from 'zustand';
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    type Connection,
    type Edge,
    type EdgeChange,
    type Node as FlowNode,
    type NodeChange,
} from '@xyflow/react';
import {initialNodes, initialEdges} from '../mock/initialState';
import {placeResource} from '../features/canvas/placeResource';
import type {CanvasBackground} from '../data/useDiagrams';

type CanvasSnapshot = {
    nodes: FlowNode[];
    edges: Edge[];
    viewport: { x: number; y: number; zoom: number };
    background: CanvasBackground
};
const snapshot = (state: CanvasState): CanvasSnapshot => structuredClone({
    nodes: state.nodes,
    edges: state.edges,
    viewport: state.viewport,
    background: state.background
});
const history = (state: CanvasState) => state.gestureSnapshot ? {} : {
    past: [...state.past, snapshot(state)].slice(-50),
    future: []
};

interface CanvasState {
    nodes: FlowNode[];
    edges: Edge[];
    viewport: { x: number; y: number; zoom: number };
    background: CanvasBackground;
    setBackground: (background: CanvasBackground) => void;
    past: CanvasSnapshot[];
    future: CanvasSnapshot[];
    gestureSnapshot: CanvasSnapshot | null;
    beginGesture: () => void;
    endGesture: () => void;
    undo: () => void;
    redo: () => void;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    reconnectEdge: (edgeId: string, connection: Connection) => void;
    addNode: (node: FlowNode) => void;
    addAnnotation: (kind: 'text' | 'shape' | 'line', preferred?: { x: number; y: number }) => string;
    duplicateNode: (id: string) => string | null;
    addResourceRepresentation: (resourceId: string, preferred?: { x: number; y: number }) => string;
    addFolderRepresentation: (folderId: string, projectId: string, preferred?: { x: number; y: number }) => string;
    addUploadedResource: (resourceId: string, batchId: string, preferred: {
        x: number;
        y: number
    }, total: number) => string[];
    groupNodes: (ids: string[]) => string | null;
    ungroupNode: (groupId: string) => void;
    moveNodeToGroup: (nodeId: string, groupId?: string) => void;
    removeNodes: (ids: string[]) => void;
    focusRequest: { id: string; nonce: string } | null;
    focusNode: (id: string) => void;
    focusEdgeRequest: { id: string; nonce: string } | null;
    focusEdge: (id: string) => void;
    relationRequest: { source?: string; target?: string; nonce: string } | null;
    requestRelation: (source?: string, target?: string) => void;
    editRelationRequest: { id: string; nonce: string } | null;
    requestEditRelation: (id: string) => void;
    inspectorOpen: boolean;
    setInspectorOpen: (open: boolean) => void;
    openCanvasNode: (id: string) => void;
    updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
    setLineEndpoints: (nodeId: string, start: { x: number; y: number }, end: { x: number; y: number }) => void;
    updateNodeSize: (nodeId: string, width: number, height: number) => void;
    updateNodePresentation: (nodeId: string, value: {
        width?: number;
        height?: number;
        accent?: 'default' | 'primary' | 'muted';
        hidden?: boolean
    }) => void;
    loadDocument: (nodes: FlowNode[], edges: Edge[], viewport?: {
        x: number;
        y: number;
        zoom: number
    }, background?: CanvasBackground) => void;
    setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
    updateEdgeData: (edgeId: string, newData: Record<string, unknown>) => void;
    addRelationEdge: (edge: Edge) => void;
    setEdgeHidden: (edgeId: string, hidden: boolean) => void;
    removeEdge: (edgeId: string) => void;
    // Función para manejar el agrupamiento
    setNodeParent: (nodeId: string, parentId: string | undefined, position: { x: number, y: number }) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,
    viewport: {x: 0, y: 0, zoom: 1},
    background: {variant: 'dots', tone: 'default'},
    setBackground: background => set(state => ({...history(state), background})),
    past: [], future: [], gestureSnapshot: null,
    beginGesture: () => set(state => state.gestureSnapshot ? state : {gestureSnapshot: snapshot(state)}),
    endGesture: () => set(state => {
        const before = state.gestureSnapshot;
        if (!before) return state;
        const changed = JSON.stringify(before.nodes) !== JSON.stringify(state.nodes) || JSON.stringify(before.edges) !== JSON.stringify(state.edges) || JSON.stringify(before.background) !== JSON.stringify(state.background);
        return {gestureSnapshot: null, ...(changed ? {past: [...state.past, before].slice(-50), future: []} : {})};
    }),
    undo: () => set(state => {
        const previous = state.past.at(-1);
        if (!previous) return state;
        return {
            ...structuredClone(previous),
            past: state.past.slice(0, -1),
            future: [snapshot(state), ...state.future].slice(0, 50),
            gestureSnapshot: null
        };
    }),
    redo: () => set(state => {
        const next = state.future[0];
        if (!next) return state;
        return {
            ...structuredClone(next),
            past: [...state.past, snapshot(state)].slice(-50),
            future: state.future.slice(1),
            gestureSnapshot: null
        };
    }),
    focusRequest: null,
    focusEdgeRequest: null,
    relationRequest: null,
    requestRelation: (source, target) => set({relationRequest: {source, target, nonce: crypto.randomUUID()}}),
    editRelationRequest: null,
    requestEditRelation: id => set({editRelationRequest: {id, nonce: crypto.randomUUID()}}),
    inspectorOpen: true,

    onNodesChange: changes => set(state => ({
        ...(changes.some(change => change.type !== 'select' && change.type !== 'dimensions') ? history(state) : {}),
        nodes: applyNodeChanges(changes, state.nodes)
    })),

    onEdgesChange: changes => set(state => ({
        ...(changes.some(change => change.type !== 'select') ? history(state) : {}),
        edges: applyEdgeChanges(changes, state.edges)
    })),

    onConnect: (connection) => {
        const newEdge: Edge = {
            id: `e-${connection.source}-${connection.target}`,
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
            type: 'editable',
            data: {label: '', controlPoint: null},
        };
        set(state => ({...history(state), edges: addEdge(newEdge, state.edges)}));
    },
    reconnectEdge: (edgeId, connection) => set(state => ({
        ...history(state),
        edges: state.edges.map(edge => edge.id === edgeId ? {
            ...edge,
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle
        } : edge)
    })),

    addNode: node => set(state => ({...history(state), nodes: [...state.nodes, node]})),
    addAnnotation: (kind, preferred) => {
        const id = crypto.randomUUID();
        const viewport = get().viewport;
        const position = preferred ?? {
            x: (window.innerWidth / 2 - viewport.x) / viewport.zoom,
            y: (window.innerHeight / 2 - viewport.y) / viewport.zoom
        };
        const data = kind === 'text' ? {
            kind,
            text: '',
            fontSize: 16,
            align: 'left',
            color: 'default'
        } : kind === 'line' ? {kind, color: 'default', thickness: 3, dash: 'solid'} : {
            kind,
            shape: 'rectangle',
            color: 'default',
            thickness: 2,
            dash: 'solid'
        };
        set(state => ({
            ...history(state),
            nodes: [...state.nodes.map(node => ({...node, selected: false})), {
                id,
                type: 'annotation',
                position,
                width: kind === 'line' ? 220 : 240,
                height: kind === 'line' ? 40 : kind === 'text' ? 100 : 160,
                data,
                selected: true
            }]
        }));
        return id;
    },
    duplicateNode: id => {
        const node = get().nodes.find(item => item.id === id);
        if (!node) return null;
        const copyId = crypto.randomUUID();
        const copy = {
            ...structuredClone(node),
            id: copyId,
            position: {x: node.position.x + 24, y: node.position.y + 24},
            selected: true
        };
        set(state => ({...history(state), nodes: [...state.nodes.map(item => ({...item, selected: false})), copy]}));
        return copyId;
    },
    addResourceRepresentation: (resourceId, preferred) => {
        const id = crypto.randomUUID();
        const viewport = get().viewport;
        const origin = preferred ?? {
            x: (window.innerWidth / 2 - viewport.x) / viewport.zoom,
            y: (window.innerHeight / 2 - viewport.y) / viewport.zoom
        };
        const position = placeResource(get().nodes, origin);
        set(state => ({
            ...history(state),
            nodes: [...state.nodes, {
                id,
                type: 'resource',
                position,
                width: 288,
                height: 112,
                data: {resourceId},
                selected: true
            }]
        }));
        return id;
    },
    addFolderRepresentation: (folderId, projectId, preferred) => {
        const id = crypto.randomUUID();
        const viewport = get().viewport;
        const origin = preferred ?? {
            x: (window.innerWidth / 2 - viewport.x) / viewport.zoom,
            y: (window.innerHeight / 2 - viewport.y) / viewport.zoom
        };
        const position = placeResource(get().nodes, origin);
        set(state => ({
            ...history(state),
            nodes: [...state.nodes, {
                id,
                type: 'folder',
                position,
                width: 288,
                height: 112,
                data: {folderId, projectId},
                selected: true
            }]
        }));
        return id;
    },
    addUploadedResource: (resourceId, batchId, preferred, total) => {
        void batchId;
        void total;
        return [get().addResourceRepresentation(resourceId, preferred)];
    },
    groupNodes: ids => {
        const current = get().nodes;
        const chosen = current.filter(node => ids.includes(node.id) && !node.parentId && node.type !== 'container');
        if (chosen.length < 2) return null;
        const left = Math.min(...chosen.map(node => node.position.x)) - 32;
        const top = Math.min(...chosen.map(node => node.position.y)) - 32;
        const right = Math.max(...chosen.map(node => node.position.x + (node.width ?? 288))) + 32;
        const bottom = Math.max(...chosen.map(node => node.position.y + (node.height ?? 112))) + 32;
        const id = crypto.randomUUID();
        const group: FlowNode = {
            id,
            type: 'container',
            position: {x: left, y: top},
            width: Math.max(350, right - left),
            height: Math.max(250, bottom - top),
            data: {label: 'Nuevo Grupo', color: 'var(--color-surface-variant)'},
            selected: true
        };
        const chosenIds = new Set(chosen.map(node => node.id));
        set(state => ({
            ...history(state),
            nodes: [...current.filter(node => !chosenIds.has(node.id)).map(node => ({
                ...node,
                selected: false
            })), group, ...chosen.map(node => ({
                ...node,
                parentId: id,
                expandParent: true,
                position: {x: node.position.x - left, y: node.position.y - top},
                selected: false
            }))]
        }));
        return id;
    },
    ungroupNode: groupId => set(state => {
        const group = state.nodes.find(node => node.id === groupId && node.type === 'container');
        if (!group) return state;
        return {
            ...history(state),
            nodes: state.nodes.filter(node => node.id !== groupId).map(node => node.parentId === groupId ? {
                ...node,
                parentId: undefined,
                expandParent: undefined,
                position: {x: node.position.x + group.position.x, y: node.position.y + group.position.y}
            } : node),
            edges: state.edges.filter(edge => edge.source !== groupId && edge.target !== groupId)
        };
    }),
    moveNodeToGroup: (nodeId, groupId) => set(state => {
        const nodes = state.nodes;
        const node = nodes.find(item => item.id === nodeId);
        const target = groupId ? nodes.find(item => item.id === groupId && item.type === 'container') : undefined;
        if (!node || (groupId && !target) || node.id === groupId || node.type === 'container') return state;
        const priorParent = nodes.find(item => item.id === node.parentId);
        const absolute = {
            x: node.position.x + (priorParent?.position.x ?? 0),
            y: node.position.y + (priorParent?.position.y ?? 0)
        };
        const moved = {
            ...node,
            parentId: target?.id,
            expandParent: target ? true : undefined,
            position: {x: absolute.x - (target?.position.x ?? 0), y: absolute.y - (target?.position.y ?? 0)}
        };
        return {...history(state), nodes: [...nodes.filter(item => item.id !== nodeId), moved]};
    }),
    removeNodes: ids => set(state => {
        const removing = new Set(ids);
        for (let changed = true; changed;) {
            changed = false;
            for (const node of state.nodes) if (node.parentId && removing.has(node.parentId) && !removing.has(node.id)) {
                removing.add(node.id);
                changed = true;
            }
        }
        return {
            ...history(state),
            nodes: state.nodes.filter(node => !removing.has(node.id)),
            edges: state.edges.filter(edge => !removing.has(edge.source) && !removing.has(edge.target))
        };
    }),
    focusNode: id => set(state => ({
        focusRequest: {id, nonce: crypto.randomUUID()},
        nodes: state.nodes.map(node => ({...node, selected: node.id === id})),
        edges: state.edges.map(edge => ({...edge, selected: false}))
    })),
    focusEdge: id => set(state => ({
        focusEdgeRequest: {id, nonce: crypto.randomUUID()},
        inspectorOpen: true,
        nodes: state.nodes.map(node => ({...node, selected: false})),
        edges: state.edges.map(edge => ({...edge, selected: edge.id === id}))
    })),
    setInspectorOpen: inspectorOpen => set({inspectorOpen}),
    openCanvasNode: id => set(state => ({
        inspectorOpen: true,
        nodes: state.nodes.map(node => ({...node, selected: node.id === id})),
        edges: state.edges.map(edge => ({...edge, selected: false}))
    })),
    updateNodeData: (nodeId, data) => set(state => ({
        ...history(state),
        nodes: state.nodes.map(node => node.id === nodeId ? {...node, data: {...node.data, ...data}} : node)
    })),
    setLineEndpoints: (nodeId, start, end) => set(state => ({
        ...history(state),
        nodes: state.nodes.map(node => {
            if (node.id !== nodeId || node.type !== 'annotation' || node.data.kind !== 'line') return node;
            const left = Math.min(start.x, end.x) - 12;
            const top = Math.min(start.y, end.y) - 12;
            const width = Math.max(24, Math.abs(end.x - start.x) + 24);
            const height = Math.max(24, Math.abs(end.y - start.y) + 24);
            return {
                ...node,
                position: {x: left, y: top},
                width,
                height,
                data: {
                    ...node.data,
                    x1: (start.x - left) / width * 100,
                    y1: (start.y - top) / height * 100,
                    x2: (end.x - left) / width * 100,
                    y2: (end.y - top) / height * 100
                }
            };
        })
    })),
    updateNodeSize: (nodeId, width, height) => set(state => ({
        ...history(state),
        nodes: state.nodes.map(node => node.id === nodeId ? {
            ...node,
            width: Math.max(40, width),
            height: Math.max(24, height)
        } : node)
    })),
    updateNodePresentation: (nodeId, value) => set(state => ({
        ...history(state),
        nodes: state.nodes.map(node => node.id === nodeId ? {
            ...node,
            width: value.width === undefined || !Number.isFinite(value.width) ? node.width : Math.min(2000, Math.max(160, value.width)),
            height: value.height === undefined || !Number.isFinite(value.height) ? node.height : Math.min(2000, Math.max(80, value.height)),
            hidden: value.hidden ?? node.hidden,
            data: {...node.data, ...(value.accent ? {accent: value.accent} : {})}
        } : node)
    })),

    loadDocument: (nodes, edges, viewport, background) => set({
        nodes,
        edges, ...(viewport ? {viewport} : {}),
        background: background ?? {variant: 'dots', tone: 'default'},
        past: [],
        future: [],
        gestureSnapshot: null
    }),
    setViewport: viewport => set({viewport}),

    updateEdgeData: (edgeId, newData) => {
        set(state => ({
            ...history(state),
            edges: state.edges.map((e) =>
                e.id === edgeId ? {...e, data: {...e.data, ...newData}} : e
            )
        }));
    },
    addRelationEdge: edge => set(state => state.edges.some(item => item.data?.relationId === edge.data?.relationId) ? state : {
        ...history(state),
        edges: [...state.edges, edge]
    }),
    setEdgeHidden: (edgeId, hidden) => set(state => ({
        ...history(state),
        edges: state.edges.map(edge => edge.id === edgeId ? {...edge, hidden, selected: false} : edge)
    })),
    removeEdge: edgeId => set(state => ({...history(state), edges: state.edges.filter(edge => edge.id !== edgeId)})),

    setNodeParent: (nodeId, parentId, position) => {
        set((state) => {
            const node = state.nodes.find(item => item.id === nodeId);
            if (!node || node.type === 'container' || nodeId === parentId || (parentId && !state.nodes.some(item => item.id === parentId && item.type === 'container'))) return state;
            // 1. Asignamos el padre y las coordenadas relativas
            const updatedNodes = state.nodes.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        parentId,
                        position,
                        expandParent: parentId ? true : undefined,
                    };
                }
                return node;
            });

            // 2. REORDENAMIENTO CRÍTICO: Movemos el hijo al final del arreglo
            // Esto asegura que React Flow lo procese *después* del padre y no se rompa el drag conjunto
            const childIndex = updatedNodes.findIndex(n => n.id === nodeId);
            if (childIndex !== -1) {
                const [childNode] = updatedNodes.splice(childIndex, 1);
                updatedNodes.push(childNode);
            }

            return {...history(state), nodes: updatedNodes};
        });
    },
}));
