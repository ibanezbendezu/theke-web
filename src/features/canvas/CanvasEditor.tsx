import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    ReactFlow,
    ConnectionMode,
    type NodeTypes,
    ReactFlowProvider,
    ViewportPortal,
    useReactFlow,
    type Node as FlowNode,
    type Edge as FlowEdge,
    type OnConnectStart,
    type OnConnectEnd,
    type OnNodeDrag
} from '@xyflow/react';
import {
    Type,
    Image as ImageIcon,
    Square,
    FileText,
    Minus,
    UploadCloud,
    ClipboardPaste,
    Layers
} from 'lucide-react';
import {MessageCircle} from 'lucide-react';
import type {CommentNotification} from '../../data/useCommentNotifications';
import {useCanvasStore} from '../../store/useCanvasStore';
import {MediaNode} from './nodes/MediaNode';
import {TextNode} from './nodes/TextNode';
import {CanvasToolbar} from './CanvasToolbar';
import {EditableEdge} from './edges/EditableEdge';
import {ShapeNode} from './nodes/ShapeNode';
import {LinkNode} from "./nodes/LinkNode";
import {DocumentNode} from './nodes/DocumentNode';
import {AudioNode} from './nodes/AudioNode';
import {GroupNode} from './nodes/GroupNode';
import {ResourceNode} from './nodes/ResourceNode';
import {FolderNode} from './nodes/FolderNode';
import {AnnotationNode} from './nodes/AnnotationNode';
import type {DiagramDocument} from '../../data/useDiagrams';
import {useToast} from '../../components/ui/useToast';
import {RelationConnectionLine} from './RelationConnectionLine';
import {absoluteNodePosition, groupDropTarget} from './groupDropTarget';
import {CanvasNodeContextMenu, type CanvasNodeMenuTarget} from './CanvasNodeContextMenu';
import {CanvasBackgroundPattern} from './CanvasBackgroundPattern';

const nodeTypes: NodeTypes = {
    media: MediaNode,
    text: TextNode,
    shape: ShapeNode,
    link: LinkNode,
    container: GroupNode, // Nuestro nodo está mapeado a 'container'
    document: DocumentNode,
    audio: AudioNode,
    resource: ResourceNode,
    folder: FolderNode,
    annotation: AnnotationNode,
};

const edgeTypes = {
    editable: EditableEdge,
};

export type RelationEdgeGeometry = {
    sourceHandle?: string | null;
    targetHandle?: string | null;
    offset?: { x: number; y: number };
};

function CanvasCore({viewport, onAddResource, onDropResource, onDropFiles, onPickFiles, onCreateRelation, commentNotifications, selectedCommentId, onCommentOpen}: {
    viewport?: DiagramDocument['viewport'];
    onAddResource?: (position?: { x: number; y: number }) => void;
    onDropResource?: (resourceId: string, position: { x: number; y: number }) => void;
    onDropFiles?: (files: File[], position: { x: number; y: number }) => void;
    onPickFiles?: (position?: { x: number; y: number }) => void;
    onCreateRelation?: (source?: string, target?: string, replaceEdgeId?: string, geometry?: RelationEdgeGeometry) => void;
    commentNotifications?: CommentNotification[];
    selectedCommentId?: string | null;
    onCommentOpen?: (item: CommentNotification) => void;
}) {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        reconnectEdge,
        addNode,
        addAnnotation,
        setNodeParent,
        beginGesture,
        endGesture
    } = useCanvasStore();
    const toast = useToast();
    const canvasRef = useRef<HTMLDivElement>(null);
    const setCanvasSize = useCanvasStore(state => state.setCanvasSize);
    const {screenToFlowPosition, setViewport, setCenter, getZoom} = useReactFlow();
    const [dropGroupId, setDropGroupId] = useState<string | null>(null);
    const saveViewport = useCanvasStore(state => state.setViewport);
    const background = useCanvasStore(state => state.background);
    const focusRequest = useCanvasStore(state => state.focusRequest);
    const focusEdgeRequest = useCanvasStore(state => state.focusEdgeRequest);
    const selectedComment = commentNotifications?.find(item => item.commentId === selectedCommentId);
    const selectedCommentX = selectedComment?.anchored && typeof selectedComment.anchor.x === 'number' ? selectedComment.anchor.x : null;
    const selectedCommentY = selectedComment?.anchored && typeof selectedComment.anchor.y === 'number' ? selectedComment.anchor.y : null;
    useEffect(() => {
        if (!canvasRef.current) return;
        const observer = new ResizeObserver(entries => {
            const size = entries[0]?.contentRect;
            if (size) setCanvasSize(size.width, size.height);
        });
        observer.observe(canvasRef.current);
        return () => observer.disconnect();
    }, [setCanvasSize]);
    const visibleEdges = useMemo<FlowEdge[]>(() => {
        const center = (id: string) => {
            const node = nodes.find(item => item.id === id);
            if (!node) return null;
            let x = node.position.x + (node.width ?? 288) / 2;
            let y = node.position.y + (node.height ?? 112) / 2;
            let parentId = node.parentId;
            while (parentId) {
                const parent = nodes.find(item => item.id === parentId);
                if (!parent) break;
                x += parent.position.x;
                y += parent.position.y;
                parentId = parent.parentId;
            }
            return {x, y};
        };
        const groups = new Map<string, typeof edges>();
        for (const edge of edges.filter(item => !item.hidden)) {
            const key = [edge.source, edge.target].sort().join(':');
            groups.set(key, [...(groups.get(key) ?? []), edge]);
        }
        return edges.map(edge => {
            const group = groups.get([edge.source, edge.target].sort().join(':')) ?? [];
            const a = center([edge.source, edge.target].sort()[0]);
            const b = center([edge.source, edge.target].sort()[1]);
            const distance = a && b ? Math.hypot(b.x - a.x, b.y - a.y) : 0;
            const lane = group.length > 1 ? group.indexOf(edge) - (group.length - 1) / 2 : 0;
            const offset = distance > 0 ? {
                x: -(b!.y - a!.y) / distance * lane * 160,
                y: (b!.x - a!.x) / distance * lane * 160
            } : {x: 0, y: 0};
            const source = center(edge.source);
            const target = center(edge.target);
            const dx = target && source ? target.x - source.x : 0;
            const dy = target && source ? target.y - source.y : 0;
            const vertical = Math.abs(dy) > Math.abs(dx);
            return {
                ...edge,
                sourceHandle: edge.sourceHandle ?? (vertical ? (dy > 0 ? 'bottom' : 'top') : (dx < 0 ? 'left' : 'right')),
                targetHandle: edge.targetHandle ?? (vertical ? (dy > 0 ? 'top' : 'bottom') : (dx < 0 ? 'right' : 'left')),
                data: {...edge.data, offset: edge.data?.offset ?? offset} as Record<string, unknown>
            };
        });
    }, [edges, nodes]);
    useEffect(() => {
        if (selectedCommentX === null || selectedCommentY === null) return;
        void setCenter(selectedCommentX, selectedCommentY, {
            zoom: getZoom(),
            duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300
        });
    }, [selectedCommentId, selectedCommentX, selectedCommentY, getZoom, setCenter]);
    useEffect(() => {
        if (viewport) void setViewport(viewport);
    }, [viewport, setViewport]);
    useEffect(() => {
        if (!focusRequest) return;
        const nodes = useCanvasStore.getState().nodes;
        const node = nodes.find(item => item.id === focusRequest.id);
        if (!node) return;
        let x = node.position.x;
        let y = node.position.y;
        let parentId = node.parentId;
        while (parentId) {
            const parent = nodes.find(item => item.id === parentId);
            if (!parent) break;
            x += parent.position.x;
            y += parent.position.y;
            parentId = parent.parentId;
        }
        void setCenter(x + (node.width ?? 288) / 2, y + (node.height ?? 112) / 2, {
            zoom: 1,
            duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300
        });
    }, [focusRequest, setCenter]);
    useEffect(() => {
        if (!focusEdgeRequest) return;
        const state = useCanvasStore.getState();
        const edge = state.edges.find(item => item.id === focusEdgeRequest.id);
        if (!edge) return;
        const center = (id: string) => {
            const node = state.nodes.find(item => item.id === id);
            if (!node) return null;
            let x = node.position.x;
            let y = node.position.y;
            let parentId = node.parentId;
            while (parentId) {
                const parent = state.nodes.find(item => item.id === parentId);
                if (!parent) break;
                x += parent.position.x;
                y += parent.position.y;
                parentId = parent.parentId;
            }
            return {x: x + (node.width ?? 288) / 2, y: y + (node.height ?? 112) / 2};
        };
        const source = center(edge.source);
        const target = center(edge.target);
        if (source && target) void setCenter((source.x + target.x) / 2, (source.y + target.y) / 2, {
            zoom: 1,
            duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300
        });
    }, [focusEdgeRequest, setCenter]);

    const connectingNodeId = useRef<string | null>(null);
    const reconnectingEdge = useRef(false);

    const [menu, setMenu] = useState<{
        isOpen: boolean;
        x: number;
        y: number;
        flowPosition: { x: number; y: number } | null;
    }>({isOpen: false, x: 0, y: 0, flowPosition: null});
    const [contextMenu, setContextMenu] = useState<{
        isOpen: boolean;
        x: number;
        y: number;
        flowPosition: { x: number; y: number };
    } | null>(null);
    const [nodeMenu, setNodeMenu] = useState<CanvasNodeMenuTarget | null>(null);
    const closeNodeMenu = useCallback((restoreFocus = false) => {
        setNodeMenu(null);
        if (restoreFocus) canvasRef.current?.closest<HTMLElement>('[role="region"]')?.focus();
    }, []);
    const canPasteVisual = useCanvasStore(state => Boolean(state.visualClipboard?.nodes.length));

    const onPaneClick = useCallback((event: React.MouseEvent) => {
        setMenu((m) => ({...m, isOpen: false}));
        setContextMenu(null);
        setNodeMenu(null);
        if (event.detail === 2) {
            addAnnotation('text', screenToFlowPosition({x: event.clientX, y: event.clientY}));
        }
    }, [screenToFlowPosition, addAnnotation]);

    const onPaneContextMenu = useCallback((event: React.MouseEvent | MouseEvent) => {
        event.preventDefault();
        setNodeMenu(null);
        const e = event as MouseEvent;
        setContextMenu({
            isOpen: true,
            x: e.clientX,
            y: e.clientY,
            flowPosition: screenToFlowPosition({x: e.clientX, y: e.clientY})
        });
    }, [screenToFlowPosition]);

    const onNodeContextMenu = useCallback((event: React.MouseEvent, node: FlowNode) => {
        if ((event.target as Element).closest('input, textarea, select, [contenteditable="true"], audio, video')) return;
        event.preventDefault();
        event.stopPropagation();
        setContextMenu(null);
        setMenu(current => ({...current, isOpen: false}));
        const state = useCanvasStore.getState();
        state.onNodesChange(state.nodes.map(item => ({id: item.id, type: 'select' as const, selected: item.id === node.id})));
        state.onEdgesChange(state.edges.filter(item => item.selected).map(item => ({id: item.id, type: 'select' as const, selected: false})));
        setNodeMenu({id: node.id, x: event.clientX, y: event.clientY});
    }, []);

    const onNodeDrag: OnNodeDrag = useCallback((_, node: FlowNode) => {
        const target = groupDropTarget(node, useCanvasStore.getState().nodes);
        const nextId = target?.id !== node.parentId ? target?.id ?? null : null;
        setDropGroupId(current => current === nextId ? current : nextId);
    }, []);

    const onNodeDragStop: OnNodeDrag = useCallback((_, node: FlowNode) => {
        const currentNodes = useCanvasStore.getState().nodes;
        const dropContainer = groupDropTarget(node, currentNodes);
        const nodeAbs = absoluteNodePosition(node, currentNodes);
        setDropGroupId(null);

        if (dropContainer) {
            if (node.parentId !== dropContainer.id) {
                const containerAbs = absoluteNodePosition(dropContainer, currentNodes);
                setNodeParent(node.id, dropContainer.id, {
                    x: nodeAbs.x - containerAbs.x,
                    y: nodeAbs.y - containerAbs.y
                });
            }
        } else if (node.parentId) {
            setNodeParent(node.id, undefined, nodeAbs);
        }
        endGesture();
    }, [setNodeParent, endGesture]);

    const onConnectStart: OnConnectStart = useCallback((_, {nodeId}) => {
        connectingNodeId.current = nodeId;
    }, []);

    const onConnectEnd: OnConnectEnd = useCallback((event) => {
        if (reconnectingEdge.current) {
            reconnectingEdge.current = false;
            connectingNodeId.current = null;
            return;
        }
        const target = event.target as Element;
        if (!target.classList.contains('react-flow__pane')) {
            connectingNodeId.current = null;
            return;
        }
        if (onCreateRelation && connectingNodeId.current) {
            onCreateRelation(connectingNodeId.current);
            connectingNodeId.current = null;
            return;
        }
        if (connectingNodeId.current) {
            const {clientX, clientY} = 'touches' in event ? event.touches[0] : event;
            setMenu({
                isOpen: true,
                x: clientX,
                y: clientY,
                flowPosition: screenToFlowPosition({x: clientX, y: clientY})
            });
        }
    }, [screenToFlowPosition, onCreateRelation]);

    const handleCreateNode = (type: string, targetPos?: { x: number, y: number }) => {
        const pos = targetPos || menu.flowPosition;
        if (!pos) return;

        const newNodeId = crypto.randomUUID();
        let newData = {};

        switch (type) {
            case 'text':
                newData = {text: ''};
                break;
            case 'media':
                newData = {
                    label: 'Nueva Imagen',
                    type: 'image',
                    url: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=600'
                };
                break;
            case 'shape':
                newData = {shapeType: 'rectangle', color: 'var(--color-surface-variant)', borderRadius: 16};
                break;
            case 'document':
                newData = {filename: 'Documento_Nuevo', extension: 'pdf', size: '1.2 MB'};
                break;
            case 'audio':
                newData = {
                    title: 'Pista de Audio',
                    type: 'music',
                    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
                };
                break;
            // CORRECCIÓN: Casamos la opción con 'container'
            case 'container':
                newData = {label: 'Nuevo grupo', color: 'var(--color-surface-variant)'};
                break;
        }

        addNode({
            id: newNodeId,
            type,
            position: pos,
            data: newData,
            // CORRECCIÓN: Ajustamos el tamaño basándonos en 'container'
            width: type === 'container' ? 350 : (type === 'shape' ? 150 : undefined),
            height: type === 'container' ? 250 : (type === 'shape' ? 150 : undefined),
        });

        if (connectingNodeId.current) {
            onConnect({source: connectingNodeId.current, target: newNodeId, sourceHandle: null, targetHandle: null});
            connectingNodeId.current = null;
        }

        setMenu({isOpen: false, x: 0, y: 0, flowPosition: null});
        setContextMenu(null);
    };

    return (
        <div ref={canvasRef} className="w-full h-full" onDragOver={event => {
            if (event.dataTransfer.types.includes('application/x-theke-resource') || event.dataTransfer.types.includes('Files')) event.preventDefault();
        }} onDrop={event => {
            const id = event.dataTransfer.getData('application/x-theke-resource');
            const position = screenToFlowPosition({x: event.clientX, y: event.clientY});
            if (id && onDropResource) {
                event.preventDefault();
                onDropResource(id, position);
            } else if (event.dataTransfer.files.length && onDropFiles) {
                event.preventDefault();
                onDropFiles([...event.dataTransfer.files], position);
            }
        }}>
            <ReactFlow
                nodes={dropGroupId ? nodes.map(node => node.id === dropGroupId ? {...node, data: {...node.data, dropTarget: true}} : node) : nodes}
                elevateNodesOnSelect={false}
                edges={visibleEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                connectionLineComponent={RelationConnectionLine}
                connectionMode={ConnectionMode.Loose}
                reconnectRadius={18}
                edgesReconnectable
                isValidConnection={connection => {
                    const current = useCanvasStore.getState().nodes;
                    return connection.source !== connection.target &&
                        current.some(node => node.id === connection.source && node.type === 'resource') &&
                        current.some(node => node.id === connection.target && node.type === 'resource');
                }}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onBeforeDelete={({nodes: deleting}) => Promise.resolve(!deleting.some(node => node.type === 'container'))}
                onEdgesDelete={deleted => {
                    if (deleted.some(edge => typeof edge.data?.relationId === 'string')) {
                        toast.info('Línea quitada. Si era la última, la Relación se eliminará al guardar.');
                    }
                }}
                onReconnectStart={() => {
                    reconnectingEdge.current = true;
                }}
                onReconnectEnd={() => {
                    reconnectingEdge.current = false;
                    connectingNodeId.current = null;
                }}
                onReconnect={(edge, connection) => {
                    connectingNodeId.current = null;
                    const current = useCanvasStore.getState().nodes;
                    const resourceId = (nodeId: string) => current.find(node => node.id === nodeId)?.data?.resourceId;
                    if (typeof edge.data?.relationId === 'string' &&
                        (resourceId(edge.source) !== resourceId(connection.source) ||
                            resourceId(edge.target) !== resourceId(connection.target))) {
                        const offset = edge.data?.offset;
                        onCreateRelation?.(connection.source, connection.target, edge.id, {
                            sourceHandle: connection.sourceHandle,
                            targetHandle: connection.targetHandle,
                            ...(offset && typeof offset === 'object' && 'x' in offset && 'y' in offset &&
                            typeof offset.x === 'number' && typeof offset.y === 'number'
                                ? {offset: {x: offset.x, y: offset.y}} : {})
                        });
                    } else reconnectEdge(edge.id, connection);
                }}
                onConnect={connection => {
                    if (onCreateRelation) {
                        onCreateRelation(connection.source, connection.target, undefined, {
                            sourceHandle: connection.sourceHandle,
                            targetHandle: connection.targetHandle,
                            offset: {x: 0, y: 0}
                        });
                    } else onConnect(connection);
                    connectingNodeId.current = null;
                }}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onPaneClick={onPaneClick}
                onPaneContextMenu={onPaneContextMenu}
                onNodeContextMenu={onNodeContextMenu}
                onNodeDragStart={() => { setDropGroupId(null); beginGesture(); }}
                onNodeDrag={onNodeDrag}
                onNodeDragStop={onNodeDragStop}
                onMoveEnd={(_, next) => saveViewport(next)}
                proOptions={{hideAttribution: true}}
                fitView={!viewport}
                onlyRenderVisibleElements
                className="theke-canvas bg-background"
                style={{backgroundColor: background.tone === 'surface' ? 'var(--color-surface)' : 'var(--color-background)'}}
                minZoom={0.1}
            >
                {commentNotifications && <ViewportPortal>{commentNotifications.map((item, index) =>
                    item.anchored && typeof item.anchor.x === 'number' && typeof item.anchor.y === 'number' ?
                        <button key={item.id} type="button" data-tooltip={item.displayName}
                                aria-label={`Comentario de ${item.displayName}: ${item.content}`}
                                aria-pressed={item.commentId === selectedCommentId}
                                className={`nodrag nopan absolute z-10 flex h-8 min-w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 rounded-full px-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${item.commentId === selectedCommentId ? 'bg-on-background text-background ring-2 ring-background' : 'bg-surface/90 text-outline ring-1 ring-border hover:bg-surface hover:text-on-background'}`}
                                style={{left: item.anchor.x, top: item.anchor.y}}
                                onClick={() => onCommentOpen?.(item)}><MessageCircle size={12}/>{index + 1}</button>
                        : null)}</ViewportPortal>}
                <CanvasBackgroundPattern variant={background.variant}/>
            </ReactFlow>

            {menu.isOpen && (
                <div className="fixed z-50 w-48 overflow-hidden rounded-lg bg-surface p-1"
                     style={{top: menu.y, left: menu.x}}>
                    <span className="text-[10px] font-bold text-outline px-2 py-2 uppercase tracking-wider">Conectar a...</span>
                    <button onClick={() => handleCreateNode('text')}
                            className="flex items-center gap-2 px-2 py-2 text-sm text-on-background hover:bg-surface-variant rounded-md transition-colors">
                        <Type size={16} className="text-primary"/> Texto
                    </button>
                    <button onClick={() => handleCreateNode('media')}
                            className="flex items-center gap-2 px-2 py-2 text-sm text-on-background hover:bg-surface-variant rounded-md transition-colors">
                        <ImageIcon size={16} className="text-note-green"/> Media
                    </button>
                </div>
            )}

            {contextMenu && (
                <div className="fixed z-[100] flex w-46 flex-col overflow-hidden rounded-lg bg-surface"
                     style={{top: contextMenu.y, left: contextMenu.x}}>
                    {canPasteVisual && <button onClick={() => {
                        useCanvasStore.getState().pasteVisualNodes(contextMenu.flowPosition);
                        setContextMenu(null);
                        canvasRef.current?.closest<HTMLElement>('[role="region"]')?.focus();
                    }} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-on-background hover:bg-surface-variant">
                        <ClipboardPaste size={16}/> Pegar elemento visual
                    </button>}
                    {onPickFiles && <button onClick={() => {
                        onPickFiles(contextMenu.flowPosition);
                        setContextMenu(null);
                    }}
                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-on-background font-medium hover:bg-surface-variant rounded-md transition-colors">
                        <div className="p-1.5 bg-primary/10 rounded-md text-primary"><UploadCloud size={16}/></div>
                        Subir archivo...
                    </button>}
                    {onAddResource && <button onClick={() => {
                        onAddResource(contextMenu.flowPosition);
                        setContextMenu(null);
                    }}
                                              className="flex items-center gap-2 px-3 py-2 text-sm text-on-background hover:bg-surface-variant rounded-md">
                        <FileText size={16}/> Añadir recurso</button>}
                    <div className="h-px bg-border my-1.5 mx-2"/>
                    <button onClick={() => {
                        addAnnotation('text', contextMenu.flowPosition);
                        setContextMenu(null);
                    }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-on-background hover:bg-surface-variant rounded-md transition-colors">
                        <Type size={16} className="text-outline"/> Texto visual
                    </button>
                    <button onClick={() => {
                        addAnnotation('shape', contextMenu.flowPosition);
                        setContextMenu(null);
                    }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-on-background hover:bg-surface-variant rounded-md transition-colors">
                        <Square size={16} className="text-outline"/> Forma visual
                    </button>
                    <button onClick={() => {
                        addAnnotation('line', contextMenu.flowPosition);
                        setContextMenu(null);
                    }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-on-background hover:bg-surface-variant rounded-md transition-colors">
                        <Minus size={16} className="text-outline"/> Línea visual
                    </button>

                    {/* CORRECCIÓN: El botón dispara la orden 'container' */}
                    <button onClick={() => handleCreateNode('container', contextMenu.flowPosition)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-on-background hover:bg-surface-variant rounded-md transition-colors">
                        <Layers size={16} className="text-outline"/> Contenedor / Grupo
                    </button>

                </div>
            )}

            {nodeMenu && <CanvasNodeContextMenu target={nodeMenu} onClose={closeNodeMenu}/>}

        </div>
    );
}

export function CanvasEditor({
                                 document,
                                 onReady,
                                 onAddResource,
                                 onDropResource,
                                 onDropFiles,
                                 onPickFiles,
                                 onCreateRelation,
                                 commentNotifications,
                                 selectedCommentId,
                                 onCommentOpen
                             }: {
    document?: DiagramDocument;
    onReady?: () => void;
    onAddResource?: (position?: { x: number; y: number }) => void;
    onDropResource?: (resourceId: string, position: { x: number; y: number }) => void;
    onDropFiles?: (files: File[], position: { x: number; y: number }) => void;
    onPickFiles?: (position?: { x: number; y: number }) => void;
    onCreateRelation?: (source?: string, target?: string, replaceEdgeId?: string, geometry?: RelationEdgeGeometry) => void;
    commentNotifications?: CommentNotification[];
    selectedCommentId?: string | null;
    onCommentOpen?: (item: CommentNotification) => void;
}) {
    const loadDocument = useCanvasStore(state => state.loadDocument);
    useEffect(() => {
        if (document) {
            loadDocument(document.nodes, document.edges, document.viewport, document.background);
            onReady?.();
        }
    }, [document, loadDocument, onReady]);
    const onShortcut = (event: React.KeyboardEvent) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement || (event.target as HTMLElement).isContentEditable) return;
        const store = useCanvasStore.getState();
        const key = event.key.toLowerCase();
        const modifier = event.ctrlKey || event.metaKey;
        if (event.target === event.currentTarget && store.nodes.length && ['arrowdown', 'arrowright', 'arrowup', 'arrowleft', 'home', 'end'].includes(key)) {
            event.preventDefault();
            const current = store.nodes.findIndex(node => node.selected);
            const next = key === 'home' ? 0 : key === 'end' ? store.nodes.length - 1 : (current + (key === 'arrowdown' || key === 'arrowright' ? 1 : -1) + store.nodes.length) % store.nodes.length;
            store.focusNode(store.nodes[next].id);
            return;
        }
        if (key === 'enter' && event.target === event.currentTarget) {
            const selected = store.nodes.find(node => node.selected);
            if (selected) {
                event.preventDefault();
                store.openCanvasNode(selected.id);
                store.setInspectorOpen(true);
            }
            return;
        }
        if (modifier && key === 'z') {
            event.preventDefault();
            if (event.shiftKey) store.redo(); else store.undo();
            return;
        }
        if (modifier && key === 'y') {
            event.preventDefault();
            store.redo();
            return;
        }
        if (modifier && (key === 'c' || key === 'x')) {
            const selected = store.nodes.filter(node => node.selected && node.type === 'annotation');
            if (selected.length) {
                const copied = key === 'x'
                    ? store.cutVisualNodes(selected.map(node => node.id))
                    : store.copyVisualNodes(selected.map(node => node.id));
                if (copied) {
                    event.preventDefault();
                    if (key === 'x' && event.currentTarget instanceof HTMLElement) event.currentTarget.focus();
                }
            }
            return;
        }
        if (modifier && key === 'v') {
            if (store.visualClipboard?.nodes.length) {
                event.preventDefault();
                store.pasteVisualNodes();
            }
            return;
        }
        if (modifier && key === 'd') {
            const selected = store.nodes.find(node => node.selected && node.type === 'annotation');
            if (selected) {
                event.preventDefault();
                store.duplicateNode(selected.id);
            }
            return;
        }
        if ((event.key === 'Delete' || event.key === 'Backspace') && onAddResource) {
            const selected = store.nodes.filter(node => node.selected);
            if (selected.length) {
                event.preventDefault();
                store.removeNodes(selected.map(node => node.id));
            }
            return;
        }
        if (modifier || event.altKey) return;
        if (key === 'a' && onAddResource) {
            event.preventDefault();
            onAddResource();
        } else if (key === 'u' && onPickFiles) {
            event.preventDefault();
            onPickFiles();
        } else if (onAddResource && ['t', 's', 'l'].includes(key)) {
            event.preventDefault();
            store.addAnnotation(key === 't' ? 'text' : key === 's' ? 'shape' : 'line');
        }
    };
    return (
        <div className="w-full h-full relative focus-visible:outline-2 focus-visible:outline-primary" tabIndex={0}
             role="region"
             aria-label="Lienzo interactivo. Usa flechas para recorrer elementos, Intro para abrir detalle y Suprimir para quitar la representación."
             onKeyDown={onShortcut}>
            <ReactFlowProvider>
                <CanvasCore viewport={document?.viewport} onAddResource={onAddResource} onDropResource={onDropResource}
                            onDropFiles={onDropFiles} onPickFiles={onPickFiles} onCreateRelation={onCreateRelation}
                            commentNotifications={commentNotifications} selectedCommentId={selectedCommentId} onCommentOpen={onCommentOpen}/>
                <CanvasToolbar onAddResource={onAddResource}
                               onCreateRelation={onCreateRelation ? () => onCreateRelation() : undefined}/>
            </ReactFlowProvider>
        </div>
    );
}
