import { useMemo } from 'react';
import { Background, BackgroundVariant, MarkerType, ReactFlow, ReactFlowProvider, useReactFlow, type Edge, type Node } from '@xyflow/react';
import type { PublicShare, SharePreviewRelation, SharePreviewResource } from '../api/generated/models';

export type PublicSelection = { kind: 'resource' | 'relation'; id: string } | null;

function CanvasButtons() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return <div className="flex flex-wrap gap-2" aria-label="Controles del diagrama">
    <button className="rounded border border-border bg-surface px-3 py-1.5 hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary" onClick={() => void zoomIn({ duration: 0 })}>Acercar</button>
    <button className="rounded border border-border bg-surface px-3 py-1.5 hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary" onClick={() => void zoomOut({ duration: 0 })}>Alejar</button>
    <button className="rounded border border-border bg-surface px-3 py-1.5 hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary" onClick={() => void fitView({ duration: 0, padding: 0.2 })}>Ajustar vista</button>
  </div>;
}

function PublicCanvas({ data, selection, onSelect }: { data: PublicShare; selection: PublicSelection; onSelect: (value: PublicSelection) => void }) {
  const resourceById = useMemo(() => new Map(data.resources.map(resource => [resource.id, resource])), [data.resources]);
  const relationById = useMemo(() => new Map(data.relations.map(relation => [relation.id, relation])), [data.relations]);
  const nodeById = useMemo(() => new Map(data.layout.nodes.map(node => [node.id, node])), [data.layout.nodes]);
  const nodes = useMemo<Node[]>(() => data.layout.nodes.flatMap(item => {
    const resource = resourceById.get(item.resourceId);
    if (!resource) return [];
    return [{ id: item.id, position: { x: item.x, y: item.y }, data: { label: resource.title },
      selected: selection?.kind === 'resource' && selection.id === resource.id,
      style: { background: 'var(--surface)', color: 'var(--on-background)', border: '1px solid var(--outline)', borderRadius: 8, padding: 12, minWidth: 140, maxWidth: 240, overflowWrap: 'anywhere' } }];
  }), [data.layout.nodes, resourceById, selection]);
  const edges = useMemo<Edge[]>(() => data.layout.edges.flatMap(item => {
    const relation = relationById.get(item.relationId);
    if (!relation || !nodeById.has(item.source) || !nodeById.has(item.target)) return [];
    return [{ id: item.id, source: item.source, target: item.target, type: 'smoothstep',
      label: relation.label || relation.typeKey, selected: selection?.kind === 'relation' && selection.id === relation.id,
      markerEnd: relation.direction === 'directed' ? { type: MarkerType.ArrowClosed, color: 'var(--on-background)' } : undefined,
      style: { stroke: 'var(--on-background)', strokeWidth: 2 }, labelStyle: { fill: 'var(--on-background)', fontWeight: 600 },
      labelBgStyle: { fill: 'var(--surface)' }, labelBgPadding: [5, 3] }];
  }), [data.layout.edges, nodeById, relationById, selection]);
  if (nodes.length === 0) return <p className="rounded border border-border bg-surface p-4">Esta publicación no incluye posiciones visuales. Usa la vista semántica para recorrer el contenido.</p>;
  return <div className="space-y-2"><CanvasButtons />
    <div className="h-[min(62vh,640px)] min-h-80 overflow-hidden rounded border border-border bg-surface" aria-label="Diagrama público">
      <ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: 0.2 }} minZoom={0.2} maxZoom={2}
        nodesDraggable={false} nodesConnectable={false} elementsSelectable deleteKeyCode={null} selectionOnDrag={false}
        onNodeClick={(_, node) => { const resourceId = nodeById.get(node.id)?.resourceId; if (resourceId) onSelect({ kind: 'resource', id: resourceId }); }}
        onEdgeClick={(_, edge) => { const relationId = data.layout.edges.find(item => item.id === edge.id)?.relationId; if (relationId) onSelect({ kind: 'relation', id: relationId }); }}>
        <Background variant={BackgroundVariant.Dots} color="var(--outline)" gap={24} size={1} />
      </ReactFlow>
    </div>
  </div>;
}

export function PublicDiagramCanvas({ data, selection, onSelect }: { data: PublicShare; selection: PublicSelection; onSelect: (value: PublicSelection) => void }) {
  return <ReactFlowProvider><PublicCanvas data={data} selection={selection} onSelect={onSelect} /></ReactFlowProvider>;
}

export function PublicSemanticList({ resources, relations, selection, onSelect }: { resources: SharePreviewResource[]; relations: SharePreviewRelation[]; selection: PublicSelection; onSelect: (value: PublicSelection) => void }) {
  const titles = new Map(resources.map(item => [item.id, item.title]));
  return <section aria-label="Vista semántica" className="min-w-0 space-y-3 rounded border border-border bg-surface p-4 [overflow-wrap:anywhere]">
    <h2 className="font-semibold">Vista semántica</h2>
    <h3 className="text-sm font-semibold">Recursos</h3>
    {resources.length === 0 && <p>Sin recursos publicados.</p>}
    <ul className="space-y-1">{resources.map(item => <li key={item.id}><button className="w-full break-words rounded border border-border bg-background p-2 text-left focus-visible:outline-2 focus-visible:outline-primary" aria-pressed={selection?.kind === 'resource' && selection.id === item.id} onClick={() => onSelect({ kind: 'resource', id: item.id })}>{item.title} · {item.type}</button></li>)}</ul>
    <h3 className="text-sm font-semibold">Relaciones</h3>
    {relations.length === 0 && <p>Sin relaciones publicadas.</p>}
    <ul className="space-y-1">{relations.map(item => <li key={item.id}><button className="w-full break-words rounded border border-border bg-background p-2 text-left focus-visible:outline-2 focus-visible:outline-primary" aria-pressed={selection?.kind === 'relation' && selection.id === item.id} onClick={() => onSelect({ kind: 'relation', id: item.id })}>{titles.get(item.sourceResourceId)} {item.direction === 'directed' ? '→' : '↔'} {titles.get(item.targetResourceId)} · {item.label || item.typeKey}</button></li>)}</ul>
  </section>;
}
