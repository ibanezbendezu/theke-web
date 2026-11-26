import {useCallback, useMemo, useRef, useState} from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    Handle,
    MarkerType,
    Position,
    ReactFlow,
    ReactFlowProvider,
    useReactFlow,
    type Edge,
    type EdgeProps,
    type Node,
    type NodeProps,
    type NodeTypes
} from '@xyflow/react';
import {
    ArrowLeftRight,
    ArrowRight,
    ArrowUpRight,
    File,
    FileText,
    Folder,
    Image,
    Layers,
    Link2,
    Maximize,
    MessageCircle,
    Minus,
    Music,
    PlaySquare,
    Shapes,
    Type,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import type {PublicLayoutNode, PublicShare, SharePreviewRelation, SharePreviewResource} from '../api/generated/models';
import {Button} from '../components/ui/Button';
import {contextMenuItemClass, contextMenuSurfaceClass} from '../components/ui/contextMenuStyles';
import {ResourceConnectionHandles} from '../components/ui/ResourceConnectionHandles';
import {ResourceCard} from '../features/canvas/ResourceCard';
import {CanvasBackgroundPattern} from '../features/canvas/CanvasBackgroundPattern';
import {VisualTextContent} from '../features/canvas/VisualTextContent';
import {visualTextStyle} from '../features/canvas/visualTextStyle';
import type {AnnotationData} from '../features/canvas/nodes/AnnotationNode';
import type {CommentTarget, PublicComment} from './publicCommentTypes';
import {publicRelationLabel} from './publicRelationLabel';

export type PublicSelection = { kind: 'resource' | 'relation' | 'folder'; id: string } | null;
type PublicNodeData = {
    item: PublicLayoutNode;
    resource?: SharePreviewResource;
    resources?: SharePreviewResource[];
    token: string;
    revision: number;
    onOpenResource: (id: string) => void;
    onSelect: (value: PublicSelection) => void
};
type PublicEdgeData = {
    label: string;
    direction?: string;
    offsetX?: number;
    offsetY?: number;
    relationId?: string;
    commenting: boolean;
    onContextMenu: (event: CommentMenuEvent) => void;
    onSelect: (value: PublicSelection) => void
};
type CommentMenuEvent = {preventDefault(): void; clientX: number; clientY: number};

function publicResourceMeta(resource: SharePreviewResource) {
    const mediaType = resource.mediaType?.toLowerCase();
    if (resource.type === 'note') return {label: 'Nota', Icon: FileText};
    if (resource.type === 'link') return {label: 'Enlace', Icon: Link2};
    if (mediaType?.startsWith('image/')) return {label: 'Imagen', Icon: Image};
    if (mediaType?.startsWith('video/')) return {label: 'Vídeo', Icon: PlaySquare};
    if (mediaType?.startsWith('audio/')) return {label: 'Audio', Icon: Music};
    if (mediaType === 'application/pdf') return {label: 'Documento', Icon: FileText};
    return {label: 'Archivo', Icon: File};
}

function publicVisualMeta(item: PublicLayoutNode) {
    if (item.type === 'folder') return {label: 'Carpeta', Icon: Folder, title: item.folderName ?? 'Carpeta'};
    if (item.type === 'container') return {label: 'Grupo', Icon: Layers, title: item.label ?? 'Grupo visual'};
    if (item.type === 'collection') return {label: 'Colección', Icon: Layers, title: item.label ?? 'Colección'};
    if (item.type === 'annotation') {
        if (item.annotationKind === 'shape') return {label: 'Forma', Icon: Shapes, title: item.label ?? 'Forma visual'};
        if (item.annotationKind === 'line') return {label: 'Línea', Icon: Minus, title: item.label ?? 'Línea visual'};
        return {label: 'Texto', Icon: Type, title: item.text ?? item.label ?? 'Texto visual'};
    }
    if (item.type === 'text') return {label: 'Texto', Icon: Type, title: item.text ?? 'Texto visual'};
    if (item.type === 'shape') return item.shapeType === 'line'
        ? {label: 'Línea', Icon: Minus, title: item.label ?? 'Línea visual'}
        : {label: 'Forma', Icon: Shapes, title: item.label ?? 'Forma visual'};
    if (item.type === 'link') return {label: 'Enlace', Icon: Link2, title: item.title ?? item.label ?? 'Enlace visual'};
    if (item.type === 'document') return {label: 'Documento', Icon: FileText, title: item.filename ?? item.label ?? 'Documento'};
    if (item.type === 'audio') return {label: 'Audio', Icon: Music, title: item.title ?? item.label ?? 'Audio'};
    if (item.type === 'media') {
        const mediaType = item.mediaType?.toLowerCase();
        if (mediaType === 'image') return {label: 'Imagen', Icon: Image, title: item.label ?? 'Imagen visual'};
        if (mediaType === 'audio') return {label: 'Audio', Icon: Music, title: item.label ?? 'Audio visual'};
        if (mediaType === 'video') return {label: 'Vídeo', Icon: PlaySquare, title: item.label ?? 'Vídeo visual'};
        return {label: 'Multimedia', Icon: PlaySquare, title: item.label ?? 'Elemento multimedia'};
    }
    return {label: 'Elemento visual', Icon: Shapes, title: item.label ?? 'Elemento visual'};
}
type PublicMarkerData = { number: number; commentId: string; author: string; active: boolean; onOpen: (id: string) => void };

function PublicCommentMarker({data}: NodeProps<Node<PublicMarkerData, 'comment'>>) {
    return <button type="button"
                   className={`nodrag nopan group relative flex h-8 min-w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${data.active ? 'bg-on-background text-background ring-2 ring-background' : 'bg-surface/90 text-outline ring-1 ring-border hover:bg-surface hover:text-on-background'}`}
                   aria-label={`Abrir comentario ${data.number} de ${data.author}`}
                   aria-pressed={data.active}
                   onClick={() => data.onOpen(data.commentId)}><MessageCircle size={13} aria-hidden="true"/><span
        className="ml-0.5">{data.number}</span><span aria-hidden="true"
                                                     className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden max-w-48 -translate-x-1/2 whitespace-nowrap rounded-md bg-on-background px-2.5 py-1.5 text-xs font-medium text-background group-hover:block group-focus-visible:block">{data.author}</span>
    </button>;
}

function CanvasButtons({onCommentCenter}: { onCommentCenter?: () => void }) {
    const {zoomIn, zoomOut, fitView} = useReactFlow();
    return <nav className="public-share-surface absolute bottom-3 right-3 z-30 flex gap-0.5 rounded-lg bg-surface/90 p-1 backdrop-blur-md"
                aria-label="Controles del diagrama">
        {onCommentCenter && <Button size="icon" className="h-11 w-11" icon={MessageCircle}
                                    aria-label="Comentar el centro de la vista" onClick={onCommentCenter}/>}
        <Button size="icon" className="h-11 w-11" icon={ZoomOut} aria-label="Alejar"
                onClick={() => void zoomOut({duration: 0})}/>
        <Button size="icon" className="h-11 w-11" icon={ZoomIn} aria-label="Acercar"
                onClick={() => void zoomIn({duration: 0})}/>
        <Button size="icon" className="h-11 w-11" icon={Maximize} aria-label="Ajustar vista"
                onClick={() => void fitView({duration: 0, padding: 0.2})}/>
    </nav>;
}

function NodeHandles({group = false}: { group?: boolean }) {
    return <><Handle id="left" type="target" position={Position.Left} className="!border-0 !bg-primary !opacity-0"/><Handle
        id="right" type="source" position={Position.Right} className="!border-0 !bg-primary !opacity-0"/>
        {group && <><Handle id="top" type="target" position={Position.Top}
                            className="!border-0 !bg-primary !opacity-0"/><Handle id="bottom" type="source"
                                                                                  position={Position.Bottom}
                                                                                  className="!border-0 !bg-primary !opacity-0"/></>}
    </>;
}

function PublicCanvasNode({data, selected}: NodeProps<Node<PublicNodeData, 'public'>>) {
    const {item, resource, onSelect} = data;
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewFailed, setPreviewFailed] = useState(false);
    const width = item.width ?? (item.type === 'container' ? 350 : item.type === 'folder' ? 208 : item.type === 'annotation' ? 240 : 288);
    const height = item.height ?? (item.type === 'container' ? 250 : item.type === 'folder' ? 72 : item.type === 'annotation' ? 100 : 112);
    if (!item.type || item.type === 'resource') {
        const directUrl = data.token && resource?.type === 'file' ? `${import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ?? ''}/v1/public/shares/${encodeURIComponent(data.token)}/resources/${encodeURIComponent(resource.id)}/content` : undefined;
        return <div className="relative" style={{width, height}}>
            <ResourceCard resource={resource ? {...resource, content: resource.content ?? undefined, description: resource.description ?? undefined, url: resource.url ?? undefined, updatedAt: String(data.revision)} : undefined}
                          mode={height < 160 ? 'mini' : 'normal'} caption={item.caption} accent={item.accent}
                          selected={selected} directUrl={directUrl}
                          onOpen={() => item.resourceId && data.onOpenResource(item.resourceId)}/>
            <ResourceConnectionHandles/>
        </div>;
    }
    if (item.type === 'collection') {
        const collectionResources = data.resources ?? [];
        const mode = item.displayMode === 'gallery' || item.displayMode === 'list' ? item.displayMode : 'stack';
        const resourceIcon = (resource?: SharePreviewResource) => {
            const mediaType = resource?.mediaType?.toLowerCase();
            return resource?.type === 'note' ? FileText
                : resource?.type === 'link' ? ArrowUpRight : mediaType?.startsWith('image/') ? Image
                    : mediaType?.startsWith('video/') ? PlaySquare : mediaType?.startsWith('audio/') ? Music : FileText;
        };
        const row = (resource: SharePreviewResource, index: number) => {
            const Icon = resourceIcon(resource);
            return <div key={`${resource.id}-${index}`} className="flex min-w-0 items-center gap-2 rounded-md bg-surface-variant/55 px-2 py-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-background text-outline"><Icon size={14} aria-hidden="true"/></span>
                <span className="min-w-0 flex-1 truncate text-xs font-medium">{resource.title}</span>
            </div>;
        };
        return <article className="relative h-full w-full overflow-hidden rounded-lg bg-background" style={{width, height, outline: '1px solid var(--color-border)'}}>
            <header className="flex h-12 items-center gap-2 px-3"><Layers size={16} className="text-outline" aria-hidden="true"/>
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{item.label || 'Colección'}</p>
                <span className="rounded-md bg-surface-variant px-1.5 py-0.5 text-[10px] text-outline">{collectionResources.length}</span></header>
            {mode === 'stack' ? <div className="relative mx-3 h-[68px]">{collectionResources.slice(0, 3).map((resource, index) => {
                const Icon = resourceIcon(resource);
                return <div key={resource.id} className="absolute flex h-12 w-[calc(100%-1rem)] items-center gap-2 rounded-md bg-surface-variant px-3"
                    style={{left: index * 8, top: index * 7, zIndex: 3 - index, outline: '1px solid var(--color-border)'}}>
                    <Icon size={15} className="text-outline" aria-hidden="true"/><span className="truncate text-xs">{resource.title}</span>
                </div>;
            })}</div> : mode === 'gallery' ? <div className="grid grid-cols-2 gap-2 px-3 pb-3">{collectionResources.slice(0, 6).map(row)}</div>
                : <div className="space-y-1.5 px-3 pb-3">{collectionResources.slice(0, 5).map(row)}</div>}
        </article>;
    }
    if (item.type === 'folder') return <article className="relative flex items-center gap-3 rounded-lg bg-background px-3"
        style={{width, height, outline: `${selected ? 2 : 1}px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`}}
        onDoubleClick={() => onSelect({kind: 'folder', id: item.id})}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-surface-variant text-on-background">
            <Folder size={18} aria-hidden="true"/>
        </span>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.folderName ?? 'Carpeta'}</p>
            <p className="truncate text-xs text-outline">Carpeta{item.caption ? ` · ${item.caption}` : ''}</p></div>
        <button type="button" className="nodrag nopan grid h-7 w-7 shrink-0 place-items-center rounded-md text-outline hover:bg-surface-variant hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary"
            aria-label={`Ver carpeta ${item.folderName ?? ''}`} onClick={() => onSelect({kind: 'folder', id: item.id})}>
            <ArrowUpRight size={15} aria-hidden="true"/>
        </button>
        <NodeHandles/>
    </article>;
    if (item.type === 'container') return <div className="relative" style={{width, height}}>
        <div className="h-full w-full overflow-hidden rounded-xl border border-outline/35 bg-background/15">
            <div className="h-full w-full" style={{backgroundColor: `color-mix(in srgb, ${item.color ?? 'var(--color-surface-variant)'} 12%, transparent)`}}/>
        </div>
        <div
            className="public-share-surface absolute left-0 top-full z-50 mt-1 flex max-w-full items-center gap-1.5 rounded-md bg-surface/90 px-2.5 py-1.5 text-xs font-medium text-on-background backdrop-blur-md">
            <Layers size={13} className="shrink-0 text-primary" aria-hidden="true"/><span
            className="max-w-48 truncate">{item.label ?? 'Grupo visual'}</span></div>
        <NodeHandles group/></div>;
    if (item.type === 'annotation') {
        const color = item.color === 'primary' ? 'var(--color-primary)' : item.color === 'muted' ? 'var(--color-outline)' : 'var(--color-on-background)';
        const stroke = item.outlineColor && /^#[0-9a-f]{6}$/i.test(item.outlineColor) ? item.outlineColor : color;
        const shadow = item.shadow === 'soft' ? '0 2px 8px rgb(0 0 0 / 18%)' : item.shadow === 'strong' ? '0 8px 24px rgb(0 0 0 / 28%)' : undefined;
        return <div role="group" aria-label="Anotación visual" className="relative" style={{width, height}}>
            {item.annotationKind === 'shape' ? <div className="h-full w-full" style={{
                backgroundColor: item.backgroundColor ?? 'var(--color-surface-variant)',
                border: `${item.thickness ?? 2}px ${item.dash ?? 'solid'} ${stroke}`,
                borderRadius: item.shape === 'ellipse' ? '50%' : item.cornerRadius ?? 8,
                opacity: (item.opacity ?? 100) / 100,
                boxShadow: shadow,
                transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined
            }}/> : item.annotationKind === 'line' ?
                <svg role="img" aria-label="Línea decorativa" className="h-full w-full overflow-visible">
                    <line x1={`${item.x1 ?? 5}%`} y1={`${item.y1 ?? 50}%`} x2={`${item.x2 ?? 95}%`}
                          y2={`${item.y2 ?? 50}%`} stroke={stroke} strokeWidth={item.thickness ?? 3}
                          strokeLinecap="round" opacity={(item.opacity ?? 100) / 100}
                          strokeDasharray={item.dash === 'dashed' ? '8 5' : undefined}/>
                </svg> : <div
                    className="h-full w-full overflow-visible p-2"
                    style={visualTextStyle(item as unknown as AnnotationData)}>
                    <VisualTextContent text={item.text ?? ''} listStyle={item.listStyle as AnnotationData['listStyle']}/>
                </div>}<NodeHandles/>
        </div>;
    }
    if (item.type === 'text') return <div
        className="relative min-w-[250px] whitespace-pre-wrap rounded-lg p-2 text-base leading-relaxed"
        style={{width: item.width ?? 250}}>{item.text}<NodeHandles/></div>;
    if (item.type === 'shape') {
        const shapeWidth = item.width ?? 100;
        const shapeHeight = item.height ?? 100;
        const sides = item.sides ?? 3;
        const points = Array.from({length: sides}, (_, index) => {
            const angle = index * 2 * Math.PI / sides - Math.PI / 2;
            const radius = Math.min(shapeWidth, shapeHeight) / 2;
            return `${shapeWidth / 2 + radius * Math.cos(angle)},${shapeHeight / 2 + radius * Math.sin(angle)}`;
        }).join(' ');
        return <div className="relative" style={{width: shapeWidth, height: shapeHeight}}>
            {item.shapeType === 'line' ? <div className="flex h-full w-full items-center">
                <div className="h-1 w-full rounded bg-outline"/>
            </div> : item.shapeType === 'polygon' ? <svg className="h-full w-full overflow-visible">
                <polygon points={points} fill={item.color ?? 'var(--color-surface)'} stroke="var(--color-outline)"
                         strokeOpacity="0.5" strokeWidth={2}/>
            </svg> : <div className="h-full w-full border-2 border-outline/50" style={{
                backgroundColor: item.color ?? 'var(--color-surface)',
                borderRadius: item.shapeType === 'circle' ? '50%' : item.borderRadius ?? 8
            }}/>}<NodeHandles/>
        </div>;
    }
    if (item.type === 'link') return <div
        className="relative flex h-[100px] w-[360px] overflow-hidden rounded-xl border border-border bg-background">
        <div className="flex min-w-0 flex-1 flex-col justify-center p-3.5"><p
            className="truncate text-sm font-semibold">{item.title}</p><p
            className="line-clamp-2 text-xs text-outline">{item.description}</p><p
            className="truncate text-[10px] text-outline">{item.url}</p></div>
        {item.imageUrl && (previewOpen && !previewFailed
            ? <img src={item.imageUrl} alt="" referrerPolicy="no-referrer" className="h-full w-[100px] object-cover"
                   onError={() => setPreviewFailed(true)}/>
            : <button type="button" className="nodrag nopan flex h-full w-[100px] shrink-0 flex-col items-center justify-center gap-1 bg-surface-variant px-2 text-center text-xs focus-visible:outline-2 focus-visible:outline-primary"
                      onClick={() => {setPreviewFailed(false); setPreviewOpen(true);}}>
                <Image size={20} aria-hidden="true"/>{previewFailed ? 'Reintentar imagen' : 'Mostrar imagen'}
            </button>)}<NodeHandles/>
    </div>;
    if (item.type === 'media') return <div
        className="relative w-[280px] overflow-hidden rounded-xl border border-border bg-background">
        <div
            className="flex h-40 items-center justify-center bg-surface-variant">{item.mediaType === 'image' && item.url
            ? previewOpen && !previewFailed
                ? <img src={item.url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover"
                       onError={() => setPreviewFailed(true)}/>
                : <button type="button" className="nodrag nopan flex h-full w-full flex-col items-center justify-center gap-2 text-xs focus-visible:outline-2 focus-visible:outline-primary"
                          onClick={() => {setPreviewFailed(false); setPreviewOpen(true);}}>
                    <Image size={32} aria-hidden="true"/>{previewFailed ? 'Reintentar imagen' : 'Mostrar imagen'}
                </button>
            : <PlaySquare size={32}/>}</div>
        <p className="truncate px-3 py-2 text-sm font-medium">{item.label}</p><NodeHandles/></div>;
    if (item.type === 'document') return <div
        className="relative flex w-[260px] items-center gap-3 rounded-xl border border-border bg-background p-3">
        <FileText size={24} className="text-outline"/>
        <div className="min-w-0"><p className="truncate text-sm font-semibold">{item.filename}</p><p
            className="text-xs text-outline">{item.extension} · {item.size}</p></div>
        <NodeHandles/></div>;
    return <div className="relative w-[320px] rounded-xl border border-border bg-background p-3"><p
        className="flex items-center gap-2 text-sm font-semibold"><Music size={16}
                                                                         className="text-primary"/>{item.title}</p>
        <div className="mt-3 rounded-lg bg-surface-variant/50 p-3 text-xs text-outline">Audio del mapa</div>
        <NodeHandles/></div>;
}

function PublicCanvasEdge({
                              sourceX,
                              sourceY,
                              targetX,
                              targetY,
                              markerEnd,
                              data,
                              selected
                          }: EdgeProps<Edge<PublicEdgeData, 'public'>>) {
    const [hovered, setHovered] = useState(false);
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    const offsetX = data?.offsetX ?? 0;
    const offsetY = data?.offsetY ?? 0;
    const path = `M ${sourceX} ${sourceY} Q ${midX + offsetX} ${midY + offsetY} ${targetX} ${targetY}`;
    const labelX = midX + offsetX * 0.5;
    const labelY = midY + offsetY * 0.5;
    return <><BaseEdge path={path} markerEnd={markerEnd} style={{
        stroke: selected ? 'var(--color-primary)' : 'var(--color-outline)',
        strokeWidth: selected ? 3 : 2
    }}/>
        <path d={path} fill="none" strokeOpacity={0} strokeWidth={25} className="cursor-pointer"
              onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}/>
        {data?.label && <>
            <circle cx={labelX} cy={labelY} r={8} fill="var(--color-background)"
                    pointerEvents="none" aria-hidden="true"/>
            <circle cx={labelX} cy={labelY} r={4.5}
                    fill={selected || hovered ? 'var(--color-primary)' : 'var(--color-background)'}
                    stroke={selected || hovered ? 'var(--color-primary)' : 'var(--color-outline)'}
                    strokeWidth={1.5} pointerEvents="none" aria-hidden="true"/>
        </>}
        {data?.label && <EdgeLabelRenderer>
            <button type="button"
                    className="nodrag nopan absolute flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    style={{left: labelX, top: labelY, transform: 'translate(-50%, -50%)', pointerEvents: 'all'}}
                    aria-label={`${data.commenting ? 'Comentar relación' : 'Ver relación'} ${data.label}`}
                    onContextMenu={data.onContextMenu}
                    onFocus={() => setHovered(true)} onBlur={() => setHovered(false)}
                    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
                    onClick={() => data.relationId && data.onSelect({
                        kind: 'relation',
                        id: data.relationId
                    })}>
                <span aria-hidden="true"
                      className={`public-share-surface pointer-events-none absolute bottom-full left-1/2 mb-1 max-w-52 -translate-x-1/2 truncate whitespace-nowrap rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-medium text-on-background backdrop-blur-sm ${selected || hovered ? 'block' : 'hidden'}`}>
                    {data.label}
                </span>
            </button>
        </EdgeLabelRenderer>}
    </>;
}

const nodeTypes: NodeTypes = {public: PublicCanvasNode, comment: PublicCommentMarker};
const edgeTypes = {public: PublicCanvasEdge};

function PublicCanvas({
                          data,
                          token,
                          selection,
                          onSelect,
                          onOpenResource,
                          commentMode,
                          commentsEnabled,
                          comments,
                          selectedCommentId,
                          onCommentTarget,
                          onCommentOpen
                      }: {
    data: PublicShare;
    token: string;
    selection: PublicSelection;
    onSelect: (value: PublicSelection) => void;
    onOpenResource: (id: string) => void;
    commentMode: boolean;
    commentsEnabled: boolean;
    comments: PublicComment[];
    selectedCommentId: string | null;
    onCommentTarget: (target: CommentTarget) => void;
    onCommentOpen: (id: string) => void
}) {
    const {screenToFlowPosition} = useReactFlow();
    const canvasRef = useRef<HTMLDivElement>(null);
    const [menu, setMenu] = useState<{ x: number; y: number; target: CommentTarget; trigger: HTMLElement | null } | null>(null);
    const resources = useMemo(() => new Map(data.resources.map(resource => [resource.id, resource])), [data.resources]);
    const relations = useMemo(() => new Map(data.relations.map(relation => [relation.id, relation])), [data.relations]);
    const commenting = commentMode && commentsEnabled;
    const selectOnCanvas = useCallback((value: PublicSelection) => {
        if (commenting && value?.kind === 'relation') onCommentTarget({type: 'relation', relationId: value.id});
        else if (commenting && value?.kind === 'resource') onCommentTarget({type: 'resource', resourceId: value.id});
        else onSelect(value);
    }, [commenting, onCommentTarget, onSelect]);
    const pointAt = useCallback((clientX: number, clientY: number): CommentTarget => ({
        type: 'diagram', ...screenToFlowPosition({x: clientX, y: clientY})
    }), [screenToFlowPosition]);
    const showMenu = useCallback((event: CommentMenuEvent, target: CommentTarget) => {
        if (!commentsEnabled) return;
        event.preventDefault();
        setMenu({
            x: Math.max(8, Math.min(event.clientX, window.innerWidth - 180)),
            y: Math.max(8, Math.min(event.clientY, window.innerHeight - 56)),
            target,
            trigger: document.activeElement instanceof HTMLElement ? document.activeElement : null
        });
    }, [commentsEnabled]);
    const nodes = useMemo<(Node<PublicNodeData, 'public'> | Node<PublicMarkerData, 'comment'>)[]>(() => {
        const publicZIndexes = data.layout.nodes.filter(item => item.type !== 'container').map(item => item.zIndex ?? 1);
        const publicLayerFloor = publicZIndexes.length ? Math.min(...publicZIndexes) : 0;
        const markerLayer = publicZIndexes.length ? Math.max(...publicZIndexes) - publicLayerFloor + 2 : 1;
        const markersByPoint = new Map<string, number>();
        return [
        ...data.layout.nodes.map(item => ({
            id: item.id,
            type: 'public' as const,
            position: {x: item.x, y: item.y},
            data: {item, resource: item.resourceId ? resources.get(item.resourceId) : undefined,
                resources: item.resourceIds?.map(id => resources.get(id)).filter((resource): resource is SharePreviewResource => Boolean(resource)),
                onSelect: selectOnCanvas, onOpenResource: (id: string) => {
                    if (commenting) onCommentTarget({type: 'resource', resourceId: id});
                    else onOpenResource(id);
                }, token, revision: data.revision},
            selected: selection?.kind === 'folder' ? item.type === 'folder' && selection.id === item.id : selection?.kind === 'resource' && selection.id === item.resourceId,
            zIndex: item.type === 'container' ? 0 : (item.zIndex ?? 1) - publicLayerFloor + 1,
            draggable: false,
            connectable: false,
            selectable: item.type !== 'container',
            style: item.type === 'container' ? {pointerEvents: 'none' as const} : undefined
        })),
        ...comments.flatMap((comment, index) => {
            const {x, y} = comment.anchor;
            if (!comment.anchored || typeof x !== 'number' || typeof y !== 'number') return [];
            const point = `${x}:${y}`;
            const offset = markersByPoint.get(point) ?? 0;
            markersByPoint.set(point, offset + 1);
            return [{
            id: `comment:${comment.id}`,
            type: 'comment' as const,
            position: {x, y: y + offset * 36},
            data: {number: index + 1, commentId: comment.id, author: comment.displayName, active: comment.id === selectedCommentId, onOpen: onCommentOpen},
            zIndex: markerLayer,
            draggable: false,
            connectable: false,
            selectable: false
            }];
        }),
    ];
    }, [comments, data.layout.nodes, data.revision, onCommentOpen, selectOnCanvas, onOpenResource, commenting, onCommentTarget, resources, selectedCommentId, selection, token]);
    const edges = useMemo<Edge<PublicEdgeData, 'public'>[]>(() => data.layout.edges.map(item => {
        const relation = item.relationId ? relations.get(item.relationId) : undefined;
        return {
            id: item.id,
            type: 'public',
            source: item.source,
            target: item.target,
            sourceHandle: item.sourceHandle ?? 'right',
            targetHandle: item.targetHandle ?? 'left',
            data: {
                label: relation ? publicRelationLabel(relation) : item.label || '',
                direction: relation?.direction,
                offsetX: item.offsetX,
                offsetY: item.offsetY,
                relationId: item.relationId,
                commenting,
                onContextMenu: event => showMenu(event, item.relationId
                    ? {type: 'relation', relationId: item.relationId}
                    : pointAt(event.clientX, event.clientY)),
                onSelect: selectOnCanvas
            },
            selected: selection?.kind === 'relation' && selection.id === item.relationId,
            markerEnd: relation?.direction === 'directed' ? {
                type: MarkerType.ArrowClosed,
                color: 'var(--color-outline)'
            } : undefined
        };
    }), [commenting, data.layout.edges, pointAt, relations, selection, selectOnCanvas, showMenu]);
    const background = data.layout.background ?? {variant: 'dots', tone: 'default'};
    if (data.layout.nodes.length === 0) return <div
        className="flex h-full items-center justify-center text-sm text-outline">Esta publicación no incluye elementos
        visuales. Usa la vista semántica para recorrer el contenido.</div>;
    return <><ReactFlow ref={canvasRef} nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView
                        fitViewOptions={{padding: 0.2}} minZoom={0.1} maxZoom={2} proOptions={{hideAttribution: true}}
                        nodesDraggable={false} nodesConnectable={false} selectionOnDrag={false} deleteKeyCode={null}
                        onlyRenderVisibleElements className="bg-background"
                        style={{backgroundColor: background.tone === 'surface' ? 'var(--color-surface)' : 'var(--color-background)'}}
                        onPaneClick={event => {
                            setMenu(null);
                            if (commentMode && commentsEnabled) onCommentTarget(pointAt(event.clientX, event.clientY));
                        }}
                        onPaneContextMenu={event => showMenu(event, pointAt(event.clientX, event.clientY))}
                        onNodeContextMenu={(event, node) => {
                            if (node.type === 'comment') return;
                            const item = node.data.item;
                            showMenu(event, item.resourceId ? {
                                type: 'resource',
                                resourceId: item.resourceId
                            } : pointAt(event.clientX, event.clientY));
                        }}
                        onEdgeContextMenu={(event, edge) => showMenu(event, edge.data?.relationId ? {
                            type: 'relation',
                            relationId: edge.data.relationId
                        } : pointAt(event.clientX, event.clientY))}
                        onNodeClick={(event, node) => {
                            if (node.type === 'comment') return;
                            const item = node.data.item;
                            if (commentMode && commentsEnabled) {
                                onCommentTarget(item.resourceId ? {
                                    type: 'resource',
                                    resourceId: item.resourceId
                                } : pointAt(event.clientX, event.clientY));
                                return;
                            }
                            if (item.resourceId) onSelect({
                                kind: 'resource',
                                id: item.resourceId
                            }); else if (item.type === 'folder') onSelect({kind: 'folder', id: item.id});
                        }}
                        onEdgeClick={(_, edge) => {
                            if (edge.data?.relationId) {
                                if (commentMode && commentsEnabled) onCommentTarget({
                                    type: 'relation',
                                    relationId: edge.data.relationId
                                }); else onSelect({kind: 'relation', id: edge.data.relationId});
                            }
                        }}>
        <CanvasBackgroundPattern variant={background.variant}/>
    </ReactFlow><CanvasButtons onCommentCenter={commenting ? () => {
        const bounds = canvasRef.current?.getBoundingClientRect();
        if (bounds) onCommentTarget(pointAt(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2));
    } : undefined}/>{menu &&
        <div className={`public-share-surface fixed z-[60] min-w-40 ${contextMenuSurfaceClass}`}
             style={{left: menu.x, top: menu.y}} role="menu" onKeyDown={event => {
                if (event.key !== 'Escape') return;
                event.stopPropagation();
                setMenu(null);
                menu.trigger?.focus();
            }}>
            <button type="button" role="menuitem" autoFocus
                    className={contextMenuItemClass}
                    onClick={() => {
                        onCommentTarget(menu.target);
                        setMenu(null);
                    }}>Comentar aquí
            </button>
        </div>}</>;
}

export function PublicDiagramCanvas({
                                        data,
                                        token = '',
                                        selection,
                                        onSelect,
                                        onOpenResource = () => {},
                                        commentMode = false,
                                        commentsEnabled = false,
                                        comments = [],
                                        selectedCommentId = null,
                                        onCommentTarget = () => {
                                        },
                                        onCommentOpen = () => {
                                        }
                                    }: {
    data: PublicShare;
    token?: string;
    selection: PublicSelection;
    onSelect: (value: PublicSelection) => void;
    onOpenResource?: (id: string) => void;
    commentMode?: boolean;
    commentsEnabled?: boolean;
    comments?: PublicComment[];
    selectedCommentId?: string | null;
    onCommentTarget?: (target: CommentTarget) => void;
    onCommentOpen?: (id: string) => void
}) {
    return <div className="h-full w-full" aria-label="Diagrama público"><ReactFlowProvider><PublicCanvas data={data} token={token}
                                                                                                         selection={selection}
                                                                                                         onSelect={onSelect}
                                                                                                         onOpenResource={onOpenResource}
                                                                                                         commentMode={commentMode}
                                                                                                         commentsEnabled={commentsEnabled}
                                                                                                         comments={comments}
                                                                                                         selectedCommentId={selectedCommentId}
                                                                                                         onCommentTarget={onCommentTarget}
                                                                                                         onCommentOpen={onCommentOpen}/></ReactFlowProvider>
    </div>;
}

export function PublicSemanticList({
                                       resources,
                                       relations,
                                       visualNodes = [],
                                       selection,
                                       onSelect,
                                       commentsEnabled = false,
                                       onCommentTarget = () => {
                                       }
                                   }: {
    resources: SharePreviewResource[];
    relations: SharePreviewRelation[];
    visualNodes?: PublicLayoutNode[];
    selection: PublicSelection;
    onSelect: (value: PublicSelection) => void;
    commentsEnabled?: boolean;
    onCommentTarget?: (target: CommentTarget) => void
}) {
    const titles = new Map(resources.map(item => [item.id, item.title]));
    const readableVisuals = visualNodes.filter(item => item.type && item.type !== 'resource');
    return <section aria-label="Vista semántica" className="min-w-0 [overflow-wrap:anywhere]">
        <header className="px-1 pb-4 pr-10">
            <h2 className="text-sm font-semibold">Vista semántica</h2>
            <p className="mt-1 text-xs text-outline">Recorre el contenido sin depender de su posición.</p>
        </header>
        <div className="space-y-5">
            <section aria-labelledby="public-semantic-resources">
                <div className="flex items-center justify-between px-2">
                    <h3 id="public-semantic-resources" className="text-xs font-medium text-outline">Recursos</h3>
                    <span className="text-xs tabular-nums text-outline">{resources.length}</span>
                </div>
                {resources.length === 0 && <p className="px-2 py-3 text-sm text-outline">No hay recursos publicados.</p>}
                <ul className="mt-1 space-y-0.5">{resources.map(item => {
                    const {label, Icon} = publicResourceMeta(item);
                    const active = selection?.kind === 'resource' && selection.id === item.id;
                    return <li key={item.id} className={`group flex min-w-0 items-center rounded-md ${active ? 'bg-surface-variant' : 'hover:bg-surface-variant/65'}`}>
                        <button className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-md px-2.5 py-2 text-left focus-visible:outline-2 focus-visible:outline-primary"
                                aria-label={`${item.title} · ${label}`} aria-pressed={active}
                                onClick={() => onSelect({kind: 'resource', id: item.id})}>
                            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${active ? 'bg-background text-on-background' : 'bg-surface-variant/70 text-outline'}`}>
                                <Icon size={14} aria-hidden="true"/>
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>
                            <span className="shrink-0 text-xs text-outline">{label}</span>
                        </button>
                        {commentsEnabled && <Button size="icon" className="mr-1 h-11 w-11 shrink-0" icon={MessageCircle}
                                                    aria-label={`Comentar ${item.title}`}
                                                    onClick={() => onCommentTarget({type: 'resource', resourceId: item.id})}/>}
                    </li>;
                })}</ul>
            </section>
            <section aria-labelledby="public-semantic-relations">
                <div className="flex items-center justify-between px-2">
                    <h3 id="public-semantic-relations" className="text-xs font-medium text-outline">Relaciones</h3>
                    <span className="text-xs tabular-nums text-outline">{relations.length}</span>
                </div>
                {relations.length === 0 && <p className="px-2 py-3 text-sm text-outline">No hay relaciones publicadas.</p>}
                <ul className="mt-1 space-y-0.5">{relations.map(item => {
                    const source = titles.get(item.sourceResourceId) ?? 'Recurso no disponible';
                    const target = titles.get(item.targetResourceId) ?? 'Recurso no disponible';
                    const label = publicRelationLabel(item);
                    const active = selection?.kind === 'relation' && selection.id === item.id;
                    const DirectionIcon = item.direction === 'directed' ? ArrowRight : ArrowLeftRight;
                    return <li key={item.id} className={`group flex min-w-0 items-center rounded-md ${active ? 'bg-surface-variant' : 'hover:bg-surface-variant/65'}`}>
                        <button className="flex min-h-12 min-w-0 flex-1 items-center gap-2.5 rounded-md px-2.5 py-2 text-left focus-visible:outline-2 focus-visible:outline-primary"
                                aria-label={`${source} ${item.direction === 'directed' ? 'hacia' : 'con'} ${target} · ${label}`}
                                aria-pressed={active} onClick={() => onSelect({kind: 'relation', id: item.id})}>
                            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${active ? 'bg-background text-on-background' : 'bg-surface-variant/70 text-outline'}`}>
                                <DirectionIcon size={14} aria-hidden="true"/>
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium">{source} {item.direction === 'directed' ? '→' : '↔'} {target}</span>
                                <span className="block truncate text-xs text-outline">{label}</span>
                            </span>
                        </button>
                        {commentsEnabled && <Button size="icon" className="mr-1 h-11 w-11 shrink-0" icon={MessageCircle}
                                                    aria-label={`Comentar relación ${label}`}
                                                    onClick={() => onCommentTarget({type: 'relation', relationId: item.id})}/>}
                    </li>;
                })}</ul>
            </section>
            {readableVisuals.length > 0 && <section aria-labelledby="public-semantic-visuals">
                <div className="flex items-center justify-between px-2">
                    <h3 id="public-semantic-visuals" className="text-xs font-medium text-outline">Elementos visuales</h3>
                    <span className="text-xs tabular-nums text-outline">{readableVisuals.length}</span>
                </div>
                <ul className="mt-1 space-y-0.5">{readableVisuals.map(item => {
                    const {label, Icon, title} = publicVisualMeta(item);
                    const content = <><span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-surface-variant/70 text-outline"><Icon size={14} aria-hidden="true"/></span>
                        <span className="min-w-0 flex-1 truncate text-sm">{title}</span><span className="shrink-0 text-xs text-outline">{label}</span></>;
                    const active = item.type === 'folder' && selection?.kind === 'folder' && selection.id === item.id;
                    return <li key={item.id}>{item.type === 'folder' ?
                        <button className={`flex min-h-11 w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left focus-visible:outline-2 focus-visible:outline-primary ${active ? 'bg-surface-variant' : 'hover:bg-surface-variant/65'}`}
                                aria-label={`${title} · ${label}`} aria-pressed={active}
                                onClick={() => onSelect({kind: 'folder', id: item.id})}>{content}</button> :
                        <div aria-label={`${title} · ${label}`} className="flex min-h-11 items-center gap-2.5 px-2.5 py-2">{content}</div>}</li>;
                })}</ul>
            </section>}
        </div>
    </section>;
}
