import { useMemo } from 'react';
import { Background, BackgroundVariant, BaseEdge, EdgeLabelRenderer, Handle, MarkerType, Position, ReactFlow, ReactFlowProvider, useReactFlow, type Edge, type EdgeProps, type Node, type NodeProps, type NodeTypes } from '@xyflow/react';
import { File as FileIcon, FileText, Folder, Image, Layers, Link as LinkIcon, Maximize, Music, PlaySquare, Video, ZoomIn, ZoomOut } from 'lucide-react';
import type { PublicLayoutNode, PublicShare, SharePreviewRelation, SharePreviewResource } from '../api/generated/models';
import { Button } from '../components/ui/Button';

export type PublicSelection = { kind: 'resource' | 'relation' | 'folder'; id: string } | null;
type PublicNodeData = { item: PublicLayoutNode; resource?: SharePreviewResource; onSelect: (value: PublicSelection) => void };
type PublicEdgeData = { label: string; direction?: string; offsetX?: number; offsetY?: number; relationId?: string; onSelect: (value: PublicSelection) => void };

function CanvasButtons() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return <nav className="absolute bottom-3 right-3 z-30 flex gap-0.5 rounded-lg bg-surface/90 p-1 backdrop-blur-md" aria-label="Controles del diagrama">
    <Button size="icon" className="h-11 w-11" icon={ZoomOut} aria-label="Alejar" onClick={() => void zoomOut({ duration: 0 })}/>
    <Button size="icon" className="h-11 w-11" icon={ZoomIn} aria-label="Acercar" onClick={() => void zoomIn({ duration: 0 })}/>
    <Button size="icon" className="h-11 w-11" icon={Maximize} aria-label="Ajustar vista" onClick={() => void fitView({ duration: 0, padding: 0.2 })}/>
  </nav>;
}

function NodeHandles({ group = false }: { group?: boolean }) {
  return <><Handle type="target" position={Position.Left} className="!border-0 !bg-primary !opacity-0"/><Handle type="source" position={Position.Right} className="!border-0 !bg-primary !opacity-0"/>
    {group && <><Handle id="top" type="target" position={Position.Top} className="!border-0 !bg-primary !opacity-0"/><Handle id="bottom" type="source" position={Position.Bottom} className="!border-0 !bg-primary !opacity-0"/></>}
  </>;
}

function PublicCanvasNode({ data, selected }: NodeProps<Node<PublicNodeData, 'public'>>) {
  const { item, resource, onSelect } = data;
  const width = item.width ?? (item.type === 'container' ? 350 : item.type === 'annotation' ? 240 : 288);
  const height = item.height ?? (item.type === 'container' ? 250 : item.type === 'annotation' ? 100 : 112);
  if (!item.type || item.type === 'resource') {
    const media = resource?.mediaType;
    const Icon = resource?.type === 'note' ? FileText : resource?.type === 'link' ? LinkIcon : media?.startsWith('image/') ? Image : media?.startsWith('video/') ? Video : media?.startsWith('audio/') ? Music : FileIcon;
    const kind = resource?.type === 'note' ? 'Nota' : resource?.type === 'link' ? 'Enlace' : media?.startsWith('image/') ? 'Imagen' : media?.startsWith('video/') ? 'Video' : media?.startsWith('audio/') ? 'Audio' : media === 'application/pdf' ? 'Documento PDF' : 'Archivo';
    return <div className="relative" style={{ width, height }}><article className={`flex h-full w-full items-center gap-3 rounded-lg border bg-background p-3 ${selected ? 'ring-1 ring-primary' : ''}`} style={{ borderColor: item.accent === 'primary' ? 'var(--color-primary)' : item.accent === 'muted' ? 'var(--color-outline)' : 'var(--color-border)' }}>
      <Icon size={20} className="shrink-0 text-primary" aria-hidden="true"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{resource?.title ?? 'Recurso no disponible'}</p><p className="truncate text-xs text-outline">{kind}{item.caption ? ` · ${item.caption}` : ''}</p></div>
      <button type="button" className="nodrag nopan rounded border border-border px-2 py-1 text-xs hover:bg-surface-variant" onClick={() => item.resourceId && onSelect({ kind: 'resource', id: item.resourceId })} aria-label={`Abrir detalle de ${resource?.title ?? 'recurso'}`}>Abrir</button><NodeHandles/>
    </article></div>;
  }
  if (item.type === 'folder') return <div className="relative" style={{ width, height }}><article className={`flex h-full w-full items-center gap-3 rounded-lg border bg-background p-3 ${selected ? 'ring-1 ring-primary' : ''}`} style={{ borderColor: item.accent === 'primary' ? 'var(--color-primary)' : item.accent === 'muted' ? 'var(--color-outline)' : 'var(--color-border)' }}><Folder size={20} className="shrink-0 text-primary"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.folderName ?? 'Carpeta'}</p><p className="truncate text-xs text-outline">Carpeta · {item.folderCount ?? 0} recursos{item.caption ? ` · ${item.caption}` : ''}</p></div><button type="button" className="nodrag nopan rounded border border-border px-2 py-1 text-xs hover:bg-surface-variant" onClick={() => onSelect({ kind: 'folder', id: item.id })}>Abrir</button><NodeHandles/></article></div>;
  if (item.type === 'container') return <div className="relative" style={{ width, height }}><div className="h-full w-full overflow-hidden rounded-xl border border-border bg-background"><div className="h-full w-full" style={{ backgroundColor: item.color ?? 'var(--color-surface-variant)', opacity: 0.3 }}/></div><div className="absolute left-0 top-full z-50 mt-2 flex w-full items-center gap-2 rounded-lg border border-border bg-surface/90 px-3 py-2 backdrop-blur-md"><Layers size={14} className="shrink-0 text-primary"/><span className="truncate text-sm font-medium">{item.label ?? 'Grupo'}</span></div><NodeHandles group/></div>;
  if (item.type === 'annotation') {
    const color = item.color === 'primary' ? 'var(--color-primary)' : item.color === 'muted' ? 'var(--color-outline)' : 'var(--color-on-background)';
    return <div role="group" aria-label="Anotación visual" className="relative" style={{ width, height }}>
      {item.annotationKind === 'shape' ? <div className="h-full w-full bg-surface-variant" style={{ border: `${item.thickness ?? 2}px ${item.dash ?? 'solid'} ${color}`, borderRadius: item.shape === 'ellipse' ? '50%' : 8 }}/> : item.annotationKind === 'line' ? <svg role="img" aria-label="Línea decorativa" className="h-full w-full overflow-visible"><line x1={`${item.x1 ?? 5}%`} y1={`${item.y1 ?? 50}%`} x2={`${item.x2 ?? 95}%`} y2={`${item.y2 ?? 50}%`} stroke={color} strokeWidth={item.thickness ?? 3} strokeDasharray={item.dash === 'dashed' ? '8 5' : undefined}/></svg> : <div className="h-full w-full overflow-hidden whitespace-pre-wrap rounded border border-border bg-background/90 p-2" style={{ fontSize: item.fontSize ?? 16, textAlign: (item.align as 'left' | 'center' | 'right') ?? 'left', color }}>{item.text}</div>}<NodeHandles/>
    </div>;
  }
  if (item.type === 'text') return <div className="relative min-w-[250px] whitespace-pre-wrap rounded-lg p-2 text-base leading-relaxed" style={{ width: item.width ?? 250 }}>{item.text}<NodeHandles/></div>;
  if (item.type === 'shape') {
    const shapeWidth = item.width ?? 100; const shapeHeight = item.height ?? 100;
    const sides = item.sides ?? 3;
    const points = Array.from({ length: sides }, (_, index) => {
      const angle = index * 2 * Math.PI / sides - Math.PI / 2;
      const radius = Math.min(shapeWidth, shapeHeight) / 2;
      return `${shapeWidth / 2 + radius * Math.cos(angle)},${shapeHeight / 2 + radius * Math.sin(angle)}`;
    }).join(' ');
    return <div className="relative" style={{ width: shapeWidth, height: shapeHeight }}>
      {item.shapeType === 'line' ? <div className="flex h-full w-full items-center"><div className="h-1 w-full rounded bg-outline"/></div> : item.shapeType === 'polygon' ? <svg className="h-full w-full overflow-visible"><polygon points={points} fill={item.color ?? 'var(--color-surface)'} stroke="var(--color-outline)" strokeOpacity="0.5" strokeWidth={2}/></svg> : <div className="h-full w-full border-2 border-outline/50" style={{ backgroundColor: item.color ?? 'var(--color-surface)', borderRadius: item.shapeType === 'circle' ? '50%' : item.borderRadius ?? 8 }}/>}<NodeHandles/>
    </div>;
  }
  if (item.type === 'link') return <div className="relative flex h-[100px] w-[360px] overflow-hidden rounded-xl border border-border bg-background"><div className="flex min-w-0 flex-1 flex-col justify-center p-3.5"><p className="truncate text-sm font-semibold">{item.title}</p><p className="line-clamp-2 text-xs text-outline">{item.description}</p><p className="truncate text-[10px] text-outline">{item.url}</p></div>{item.imageUrl && <img src={item.imageUrl} alt="" className="h-full w-[100px] object-cover"/>}<NodeHandles/></div>;
  if (item.type === 'media') return <div className="relative w-[280px] overflow-hidden rounded-xl border border-border bg-background"><div className="flex h-40 items-center justify-center bg-surface-variant">{item.mediaType === 'image' && item.url ? <img src={item.url} alt="" className="h-full w-full object-cover"/> : <PlaySquare size={32}/>}</div><p className="truncate px-3 py-2 text-sm font-medium">{item.label}</p><NodeHandles/></div>;
  if (item.type === 'document') return <div className="relative flex w-[260px] items-center gap-3 rounded-xl border border-border bg-background p-3"><FileText size={24} className="text-outline"/><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.filename}</p><p className="text-xs text-outline">{item.extension} · {item.size}</p></div><NodeHandles/></div>;
  return <div className="relative w-[320px] rounded-xl border border-border bg-background p-3"><p className="flex items-center gap-2 text-sm font-semibold"><Music size={16} className="text-primary"/>{item.title}</p><div className="mt-3 rounded-lg bg-surface-variant/50 p-3 text-xs text-outline">Audio del mapa</div><NodeHandles/></div>;
}

function PublicCanvasEdge({ sourceX, sourceY, targetX, targetY, markerEnd, data, selected }: EdgeProps<Edge<PublicEdgeData, 'public'>>) {
  const midX = (sourceX + targetX) / 2; const midY = (sourceY + targetY) / 2;
  const offsetX = data?.offsetX ?? 0; const offsetY = data?.offsetY ?? 0;
  const path = `M ${sourceX} ${sourceY} Q ${midX + offsetX} ${midY + offsetY} ${targetX} ${targetY}`;
  const labelX = midX + offsetX * 0.5; const labelY = midY + offsetY * 0.5;
  return <><BaseEdge path={path} markerEnd={markerEnd} style={{ stroke: selected ? 'var(--color-primary)' : 'var(--color-outline)', strokeWidth: selected ? 3 : 2 }}/>
    {data?.label && <EdgeLabelRenderer><button type="button" className="nodrag nopan absolute flex max-w-48 items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-primary" style={{ left: labelX, top: labelY, transform: 'translate(-50%, -50%)', pointerEvents: 'all' }} onClick={() => data.relationId && data.onSelect({ kind: 'relation', id: data.relationId })}>{data.label}{data.relationId && <span aria-hidden="true">{data.direction === 'directed' ? '→' : '↔'}</span>}</button></EdgeLabelRenderer>}
  </>;
}

const nodeTypes: NodeTypes = { public: PublicCanvasNode };
const edgeTypes = { public: PublicCanvasEdge };

function PublicCanvas({ data, selection, onSelect }: { data: PublicShare; selection: PublicSelection; onSelect: (value: PublicSelection) => void }) {
  const resources = useMemo(() => new Map(data.resources.map(resource => [resource.id, resource])), [data.resources]);
  const relations = useMemo(() => new Map(data.relations.map(relation => [relation.id, relation])), [data.relations]);
  const nodes = useMemo<Node<PublicNodeData, 'public'>[]>(() => data.layout.nodes.map(item => ({ id: item.id, type: 'public', position: { x: item.x, y: item.y }, data: { item, resource: item.resourceId ? resources.get(item.resourceId) : undefined, onSelect }, selected: selection?.kind === 'folder' ? item.type === 'folder' && selection.id === item.id : selection?.kind === 'resource' && selection.id === item.resourceId, zIndex: item.type === 'container' ? 0 : 1, draggable: false, connectable: false })), [data.layout.nodes, onSelect, resources, selection]);
  const edges = useMemo<Edge<PublicEdgeData, 'public'>[]>(() => data.layout.edges.map(item => {
    const relation = item.relationId ? relations.get(item.relationId) : undefined;
    return { id: item.id, type: 'public', source: item.source, target: item.target, sourceHandle: item.sourceHandle, targetHandle: item.targetHandle,
      data: { label: relation?.label || relation?.typeKey || item.label || '', direction: relation?.direction, offsetX: item.offsetX, offsetY: item.offsetY, relationId: item.relationId, onSelect },
      selected: selection?.kind === 'relation' && selection.id === item.relationId,
      markerEnd: relation?.direction === 'directed' ? { type: MarkerType.ArrowClosed, color: 'var(--color-outline)' } : undefined };
  }), [data.layout.edges, onSelect, relations, selection]);
  const background = data.layout.background ?? { variant: 'dots', tone: 'default' };
  if (nodes.length === 0) return <div className="flex h-full items-center justify-center text-sm text-outline">Esta publicación no incluye elementos visuales. Usa la vista semántica para recorrer el contenido.</div>;
  return <><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView fitViewOptions={{ padding: 0.2 }} minZoom={0.1} maxZoom={2} proOptions={{ hideAttribution: true }}
    nodesDraggable={false} nodesConnectable={false} selectionOnDrag={false} deleteKeyCode={null} onlyRenderVisibleElements className="bg-background" style={{ backgroundColor: background.tone === 'surface' ? 'var(--color-surface)' : 'var(--color-background)' }}
    onNodeClick={(_, node) => { const item = node.data.item; if (item.resourceId) onSelect({ kind: 'resource', id: item.resourceId }); else if (item.type === 'folder') onSelect({ kind: 'folder', id: item.id }); }}
    onEdgeClick={(_, edge) => { if (edge.data?.relationId) onSelect({ kind: 'relation', id: edge.data.relationId }); }}>
    {background.variant !== 'plain' && <Background variant={background.variant === 'grid' ? BackgroundVariant.Lines : BackgroundVariant.Dots} color="var(--color-outline)" gap={24} size={background.variant === 'dots' ? 2 : undefined}/>}
  </ReactFlow><CanvasButtons/></>;
}

export function PublicDiagramCanvas({ data, selection, onSelect }: { data: PublicShare; selection: PublicSelection; onSelect: (value: PublicSelection) => void }) {
  return <div className="h-full w-full" aria-label="Diagrama público"><ReactFlowProvider><PublicCanvas data={data} selection={selection} onSelect={onSelect}/></ReactFlowProvider></div>;
}

export function PublicSemanticList({ resources, relations, visualNodes = [], selection, onSelect }: { resources: SharePreviewResource[]; relations: SharePreviewRelation[]; visualNodes?: PublicLayoutNode[]; selection: PublicSelection; onSelect: (value: PublicSelection) => void }) {
  const titles = new Map(resources.map(item => [item.id, item.title]));
  const readableVisuals = visualNodes.filter(item => item.type === 'folder' || item.type === 'container' || item.type === 'annotation' || item.type === 'text');
  return <section aria-label="Vista semántica" className="min-w-0 space-y-3 rounded-lg bg-surface-variant/55 p-4 [overflow-wrap:anywhere]">
    <h2 className="font-semibold">Vista semántica</h2><h3 className="text-sm font-semibold">Recursos</h3>
    {resources.length === 0 && <p>Sin recursos publicados.</p>}
    <ul className="space-y-1">{resources.map(item => <li key={item.id}><button className="min-h-11 w-full break-words rounded-md bg-background/60 px-3 py-2 text-left hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary" aria-pressed={selection?.kind === 'resource' && selection.id === item.id} onClick={() => onSelect({ kind: 'resource', id: item.id })}>{item.title} · {item.type}</button></li>)}</ul>
    <h3 className="text-sm font-semibold">Relaciones</h3>{relations.length === 0 && <p>Sin relaciones publicadas.</p>}
    <ul className="space-y-1">{relations.map(item => <li key={item.id}><button className="min-h-11 w-full break-words rounded-md bg-background/60 px-3 py-2 text-left hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary" aria-pressed={selection?.kind === 'relation' && selection.id === item.id} onClick={() => onSelect({ kind: 'relation', id: item.id })}>{titles.get(item.sourceResourceId)} {item.direction === 'directed' ? '→' : '↔'} {titles.get(item.targetResourceId)} · {item.label || item.typeKey}</button></li>)}</ul>
    {readableVisuals.length > 0 && <><h3 className="text-sm font-semibold">Elementos visuales</h3><ul className="space-y-1">{readableVisuals.map(item => <li key={item.id} className="rounded-md bg-background/60 px-3 py-2 text-sm">{item.type === 'folder' ? <button className="w-full text-left focus-visible:outline-2 focus-visible:outline-primary" onClick={() => onSelect({ kind: 'folder', id: item.id })}>{item.folderName ?? 'Carpeta'} · Carpeta</button> : item.label ?? item.text ?? (item.annotationKind === 'shape' ? 'Forma visual' : item.annotationKind === 'line' ? 'Línea visual' : 'Anotación visual')}</li>)}</ul></>}
  </section>;
}
