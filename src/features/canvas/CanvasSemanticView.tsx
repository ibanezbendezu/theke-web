import { useEffect, useMemo, useRef, useState } from 'react';
import { useOrganization } from '../../data/useOrganization';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useRelation } from '../../data/useRelations';

const evidenceLabel = { none: 'sin evidencia citada', needs_evidence: 'falta evidencia', confirmed: 'evidencia citada' };
function SemanticRelationItem({ relationId, edgeId, otherTitle, hidden }: { relationId: string; edgeId: string; otherTitle: string; hidden: boolean }) {
  const relation = useRelation(relationId);
  const detail = relation.data;
  const label = detail?.label || detail?.typeLabel || 'Relación';
  const announcement = detail ? `${detail.source.title} ${detail.direction === 'directed' ? 'hacia' : 'con'} ${detail.target.title}, ${label}, ${detail.direction === 'directed' ? 'dirigida' : 'no dirigida'}, ${evidenceLabel[detail.evidenceStatus]}` : `Relación con ${otherTitle}`;
  return <li><button type="button" className="w-full rounded-md bg-surface-variant/60 p-2 text-left focus-visible:outline-2 focus-visible:outline-primary" aria-label={`Seleccionar ${announcement}${hidden ? ', oculta' : ''}`} onClick={() => hidden ? useCanvasStore.getState().setEdgeHidden(edgeId, false) : useCanvasStore.getState().focusEdge(edgeId)}><span className="block font-medium">{label} · {otherTitle}</span><span className="text-xs text-outline">{hidden ? 'Oculta · Mostrar línea' : detail ? evidenceLabel[detail.evidenceStatus] : 'Cargando detalle…'}</span></button></li>;
}

export function CanvasSemanticView({ projectId }: { projectId: string }) {
  const nodes = useCanvasStore(state => state.nodes);
  const edges = useCanvasStore(state => state.edges);
  const organization = useOrganization(projectId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const focusAfterDelete = useRef<string | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const selected = nodes.find(node => node.selected) ?? nodes.find(node => node.id === selectedId);
  const groups = nodes.filter(node => node.type === 'container');
  const ordered = useMemo(() => {
    const byId = new Map(nodes.map(node => [node.id, node]));
    const index = new Map(nodes.map((node, position) => [node.id, position]));
    const depth = (id: string) => { let count = 0; let current = byId.get(id); const seen = new Set<string>(); while (current?.parentId && !seen.has(current.parentId)) { seen.add(current.parentId); count++; current = byId.get(current.parentId); } return count; };
    const seen = new Set<string>();
    const visit = (parent?: string): typeof nodes => nodes.filter(node => node.parentId === parent && !seen.has(node.id)).sort((a, b) => (index.get(a.id) ?? 0) - (index.get(b.id) ?? 0)).flatMap(node => { seen.add(node.id); return [node, ...visit(node.id)]; });
    const visited = visit(); const ids = new Set(visited.map(node => node.id));
    return [...visited, ...nodes.filter(node => !ids.has(node.id))].map(node => ({ node, depth: Math.min(depth(node.id), 8) }));
  }, [nodes]);
  const title = (node: typeof nodes[number]) => {
    const local = node.data.caption || node.data.label || node.data.text;
    if (typeof local === 'string' && local.trim()) return local;
    if (node.type === 'resource') return organization.data?.resources.find(item => item.resourceId === node.data.resourceId)?.title ?? 'Recurso';
    if (node.type === 'folder') return organization.data?.folders.find(item => item.id === node.data.folderId)?.name ?? 'Carpeta';
    return node.type === 'container' ? 'Grupo visual' : node.type === 'annotation' ? 'Anotación visual' : 'Elemento visual';
  };
  const type = (node: typeof nodes[number]) => node.type === 'resource' ? 'Recurso' : node.type === 'folder' ? 'Carpeta' : node.type === 'container' ? 'Grupo' : node.type === 'annotation' ? 'Anotación' : 'Elemento';
  const relationEdges = selected?.type === 'resource' ? edges.filter(edge => typeof edge.data?.relationId === 'string' && (edge.source === selected.id || edge.target === selected.id)) : [];
  const relationSections = [
    { title: 'Relaciones salientes', items: relationEdges.filter(edge => edge.data?.direction === 'directed' && edge.source === selected?.id) },
    { title: 'Relaciones entrantes', items: relationEdges.filter(edge => edge.data?.direction === 'directed' && edge.target === selected?.id) },
    { title: 'Relaciones no dirigidas', items: relationEdges.filter(edge => edge.data?.direction !== 'directed') },
  ];
  const select = (id: string) => { setSelectedId(id); useCanvasStore.getState().focusNode(id); };
  useEffect(() => { if (focusAfterDelete.current) { buttons.current.get(focusAfterDelete.current)?.focus(); focusAfterDelete.current = null; } }, [nodes]);
  const remove = () => { if (!selected) return; const removed = new Set([selected.id]); for (let changed = true; changed;) { changed = false; for (const node of nodes) if (node.parentId && removed.has(node.parentId) && !removed.has(node.id)) { removed.add(node.id); changed = true; } } const next = ordered.find(item => !removed.has(item.node.id))?.node; if (next) focusAfterDelete.current = next.id; useCanvasStore.getState().removeNodes([selected.id]); if (next) select(next.id); };
  const move = (axis: 'x' | 'y', amount: number) => {
    if (!selected) return; const position = { ...selected.position, [axis]: selected.position[axis] + amount };
    useCanvasStore.getState().onNodesChange([{ id: selected.id, type: 'position', position }]);
  };
  return <aside className="h-full w-full overflow-auto p-4 text-sm" aria-label="Vista semántica">
    <h2 className="font-semibold">Vista semántica</h2><p className="mt-1 text-xs text-outline">Orden del documento; los elementos ocultos también aparecen aquí.</p>
    <ol className="mt-3 space-y-1">{ordered.map(({ node, depth }) => <li key={node.id} style={{ paddingLeft: depth * 12 }}><button ref={element => { if (element) buttons.current.set(node.id, element); else buttons.current.delete(node.id); }} type="button" aria-label={`${title(node)} — ${type(node)}${node.hidden ? ', oculto' : ''}`} aria-current={selected?.id === node.id ? 'true' : undefined} onClick={() => select(node.id)} className={`w-full rounded border p-2 text-left focus-visible:outline-2 focus-visible:outline-primary ${selected?.id === node.id ? 'border-primary bg-surface-variant' : 'border-border'}`}><span className="block truncate font-medium">{title(node)}</span><span className="text-xs text-outline">{type(node)}{node.hidden ? ' · Oculto' : ''}</span></button></li>)}</ol>
    {ordered.length === 0 && <p className="mt-3 text-xs text-outline">No hay elementos en el diagrama.</p>}
    {selected && <section className="mt-4 space-y-2 border-t border-border pt-3" aria-label="Acciones del elemento"><h3 className="font-medium">{title(selected)}</h3><button type="button" className="w-full rounded-md bg-surface-variant/60 p-2 text-left" onClick={() => { useCanvasStore.getState().openCanvasNode(selected.id); useCanvasStore.getState().setInspectorOpen(true); }}>Abrir detalle</button>
      <button type="button" className="w-full rounded-md bg-surface-variant/60 p-2 text-left" onClick={() => useCanvasStore.getState().requestRelation(selected.id)}>{selected.type === 'resource' ? 'Conectar con otro Recurso' : 'Conectar elemento…'}</button>
      {selected.type === 'resource' && <div className="space-y-2" aria-label="Relaciones del Recurso">{relationSections.map(section => <details key={section.title} open className="rounded-md bg-surface-variant/60 p-2"><summary className="cursor-pointer font-medium">{section.title} ({section.items.length})</summary>{section.items.length ? <ul className="mt-2 space-y-1">{section.items.map(edge => { const other = nodes.find(node => node.id === (edge.source === selected.id ? edge.target : edge.source)); return <SemanticRelationItem key={edge.id} relationId={edge.data!.relationId as string} edgeId={edge.id} otherTitle={other ? title(other) : 'Recurso'} hidden={Boolean(edge.hidden)} />; })}</ul> : <p className="mt-1 text-xs text-outline">Ninguna.</p>}</details>)}</div>}
      <div className="grid grid-cols-2 gap-1" aria-label="Mover elemento">{([['Izquierda', 'x', -20], ['Derecha', 'x', 20], ['Arriba', 'y', -20], ['Abajo', 'y', 20]] as const).map(([label, axis, amount]) => <button key={label} type="button" className="rounded-md bg-surface-variant/60 p-2" onClick={() => move(axis, amount)}>Mover {label.toLowerCase()}</button>)}</div>
      {selected.type !== 'container' && <label className="block">Grupo<select aria-label="Grupo visual del elemento" className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary" value={selected.parentId ?? ''} onChange={event => useCanvasStore.getState().moveNodeToGroup(selected.id, event.target.value || undefined)}><option value="">Sin grupo</option>{groups.map(group => <option key={group.id} value={group.id}>{title(group)}</option>)}</select></label>}
      <button type="button" className="w-full rounded-md bg-surface-variant/60 p-2 text-left" onClick={remove}>Quitar representación del diagrama</button>
      <button type="button" className="w-full rounded-md bg-surface-variant/60 p-2 text-left" disabled={useCanvasStore.getState().past.length === 0} onClick={() => useCanvasStore.getState().undo()}>Deshacer</button>
    </section>}
  </aside>;
}
