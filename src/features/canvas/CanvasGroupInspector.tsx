import { useState } from 'react';
import { AIGuidanceCard } from '../../components/ai/AIGuidanceCard';
import { Button } from '../../components/ui/Button';
import { usePrepareGroupGuidance } from '../../data/useAi';
import type { AiScopePreparation } from '../../api/generated/models';
import { useCanvasStore } from '../../store/useCanvasStore';

export function CanvasGroupInspector({ groupId, diagramId }: { groupId: string; diagramId: string }) {
  const prepare = usePrepareGroupGuidance();
  const [scope, setScope] = useState<AiScopePreparation | null>(null);
  const [scopeError, setScopeError] = useState('');
  const nodes = useCanvasStore(state => state.nodes);
  const updateNodeData = useCanvasStore(state => state.updateNodeData);
  const moveNodeToGroup = useCanvasStore(state => state.moveNodeToGroup);
  const ungroupNode = useCanvasStore(state => state.ungroupNode);
  const group = nodes.find(node => node.id === groupId);
  if (!group) return null;
  const members = nodes.filter(node => node.parentId === groupId);
  const available = nodes.filter(node => !node.parentId && node.id !== groupId && node.type !== 'container');
  const name = (node: typeof nodes[number]) => typeof node.data.caption === 'string' && node.data.caption ? node.data.caption : typeof node.data.label === 'string' ? node.data.label : `${node.type ?? 'Elemento'} ${node.id.slice(0, 8)}`;
  return <div className="space-y-4 text-sm"><h2 className="font-semibold">Grupo visual</h2><p className="text-xs text-outline">Solo organiza representaciones en este diagrama; no crea una Carpeta ni una Relación.</p>
    <label className="block">Nombre<input className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary" value={typeof group.data.label === 'string' ? group.data.label : ''} maxLength={120} onChange={event => updateNodeData(groupId, { label: event.target.value })}/></label>
    <section aria-label="Miembros del grupo"><h3 className="font-medium">Miembros ({members.length})</h3>{members.map(node => <div key={node.id} className="mt-2 flex items-center gap-2"><span className="min-w-0 flex-1 truncate">{name(node)}</span><Button onClick={() => moveNodeToGroup(node.id)}>Quitar</Button></div>)}</section>
    {available.length > 0 && <section aria-label="Añadir al grupo"><h3 className="font-medium">Añadir elemento</h3>{available.map(node => <div key={node.id} className="mt-2 flex items-center gap-2"><span className="min-w-0 flex-1 truncate">{name(node)}</span><Button onClick={() => moveNodeToGroup(node.id, groupId)}>Añadir</Button></div>)}</section>}
    <section aria-label="Alcance de orientación" className="space-y-2">
      <h3 className="font-medium">Preparar orientación del grupo</h3>
      <p className="text-xs text-outline">Se usa la última versión guardada del Diagrama. Guarda tus cambios para actualizar el alcance.</p>
      <Button type="button" disabled={prepare.isPending} onClick={() => { setScope(null); setScopeError(''); prepare.mutate({ diagramId, groupId }, { onSuccess: setScope, onError: () => setScopeError('No se pudo preparar el alcance. Revisa el Diagrama guardado.') }); }}>Revisar alcance guardado</Button>
      {scopeError && <p role="alert">{scopeError}</p>}
      {scope && <><p role="status">Integración de IA pendiente. {scope.resourceIds.length} recurso(s) elegible(s); no se han generado sugerencias.</p>
        {scope.excluded.length > 0 && <ul aria-label="Miembros excluidos">{scope.excluded.map((item, index) => <li key={`${item.nodeId}-${index}`}>{item.nodeId}: {item.reason}</li>)}</ul>}
        {scope.limitations.map(item => <p key={item} className="text-xs text-outline">{item}</p>)}
        <AIGuidanceCard actionTitle="Orientación del grupo pendiente" selectedResourceIds={scope.resourceIds} />
      </>}
    </section>
    <Button variant="outline" onClick={() => ungroupNode(groupId)}>Desagrupar sin mover elementos</Button>
  </div>;
}
