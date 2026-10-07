import {useState} from 'react';
import type {Node} from '@xyflow/react';
import {AIGuidanceCard} from '../../components/ai/AIGuidanceCard';
import {Button} from '../../components/ui/Button';
import {usePrepareGroupGuidance} from '../../data/useAi';
import {useLibraryFolders} from '../../data/useLibraryFolders';
import {useOrganization} from '../../data/useOrganization';
import type {AiScopePreparation} from '../../api/generated/models';
import {useCanvasStore} from '../../store/useCanvasStore';

export function CanvasGroupInspector({groupId, diagramId, projectId}: {
    groupId: string;
    diagramId: string;
    projectId?: string;
}) {
    const prepare = usePrepareGroupGuidance();
    const organization = useOrganization(projectId);
    const libraryFolders = useLibraryFolders();
    const [scope, setScope] = useState<AiScopePreparation | null>(null);
    const [scopeError, setScopeError] = useState('');
    const nodes = useCanvasStore(state => state.nodes);
    const updateNodeData = useCanvasStore(state => state.updateNodeData);
    const moveNodeToGroup = useCanvasStore(state => state.moveNodeToGroup);
    const ungroupNode = useCanvasStore(state => state.ungroupNode);
    const removeNodes = useCanvasStore(state => state.removeNodes);
    const group = nodes.find(node => node.id === groupId);
    if (!group) return null;

    const members = nodes.filter(node => node.parentId === groupId);
    const available = nodes.filter(node => !node.parentId && node.id !== groupId && node.type !== 'container');
    const name = (node: Node) => {
        const local = node.data.caption || node.data.label || node.data.text;
        if (typeof local === 'string' && local.trim()) return local.trim();
        if (node.type === 'resource') {
            return organization.data?.resources.find(item => item.resourceId === node.data.resourceId)?.title ??
                (organization.isPending ? 'Cargando recurso…' : 'Recurso no disponible');
        }
        if (node.type === 'folder') {
            if (typeof node.data.libraryFolderId === 'string') return libraryFolders.data?.find(item => item.id === node.data.libraryFolderId)?.name ??
                (libraryFolders.isPending ? 'Cargando carpeta…' : 'Carpeta no disponible');
            return organization.data?.folders.find(item => item.id === node.data.folderId)?.name ??
                (organization.isPending ? 'Cargando carpeta…' : 'Carpeta no disponible');
        }
        if (node.type === 'annotation') {
            return node.data.kind === 'shape' ? 'Forma visual' : node.data.kind === 'line' ? 'Línea visual' : 'Texto visual';
        }
        return 'Elemento visual';
    };

    return <div className="space-y-5 text-sm">
        <div>
            <h2 className="font-semibold">Grupo visual</h2>
            <p className="mt-1 text-xs text-outline">Organiza elementos de este mapa.</p>
        </div>
        <label className="block font-medium">Nombre
            <input className="mt-1.5 w-full rounded-md border-0 bg-surface-variant px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-primary"
                   value={typeof group.data.label === 'string' ? group.data.label : ''} maxLength={120}
                   onChange={event => updateNodeData(groupId, {label: event.target.value})}/>
        </label>
        <section aria-label="Miembros del grupo">
            <h3 className="mb-2 font-medium">Elementos ({members.length})</h3>
            {members.length ? <ul className="space-y-1">{members.map(node => <li key={node.id}
                className="flex min-h-9 items-center gap-2 rounded-md px-2 hover:bg-surface-variant/60">
                <span className="min-w-0 flex-1 truncate" title={name(node)}>{name(node)}</span>
                <Button className="shrink-0" title={`Quitar ${name(node)} del grupo`}
                        onClick={() => moveNodeToGroup(node.id)}>Quitar</Button>
            </li>)}</ul> : <p className="text-xs text-outline">Arrastra elementos al grupo para añadirlos.</p>}
        </section>
        {available.length > 0 && <details className="rounded-md bg-surface-variant/40 px-3 py-2">
            <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-primary">Añadir elemento</summary>
            <ul className="mt-2 max-h-52 space-y-1 overflow-auto">{available.map(node => <li key={node.id}
                className="flex min-h-9 items-center gap-2 rounded-md px-1 hover:bg-surface-variant/60">
                <span className="min-w-0 flex-1 truncate" title={name(node)}>{name(node)}</span>
                <Button className="shrink-0" title={`Añadir ${name(node)} al grupo`}
                        onClick={() => moveNodeToGroup(node.id, groupId)}>Añadir</Button>
            </li>)}</ul>
        </details>}
        <details className="rounded-md bg-surface-variant/40 px-3 py-2">
            <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-primary">Orientación con IA</summary>
            <div className="mt-3 space-y-2">
                <p className="text-xs text-outline">El alcance usa la última versión guardada del mapa.</p>
                <Button type="button" loading={prepare.isPending} onClick={() => {
                    setScope(null);
                    setScopeError('');
                    prepare.mutate({diagramId, groupId}, {
                        onSuccess: setScope,
                        onError: () => setScopeError('No se pudo preparar el alcance. Revisa el mapa guardado.')
                    });
                }}>Revisar alcance guardado</Button>
                {scopeError && <p role="alert">{scopeError}</p>}
                {scope && <><p role="status">Integración de IA pendiente. {scope.resourceIds.length} recurso(s) elegible(s);
                    no se han generado sugerencias.</p>
                    {scope.excluded.length > 0 && <ul aria-label="Miembros excluidos">{scope.excluded.map((item, index) => <li
                        key={`${item.nodeId}-${index}`}>{item.nodeId}: {item.reason}</li>)}</ul>}
                    {scope.limitations.map(item => <p key={item} className="text-xs text-outline">{item}</p>)}
                    <AIGuidanceCard actionTitle="Orientación del grupo pendiente" selectedResourceIds={scope.resourceIds}/>
                </>}
            </div>
        </details>
        <Button variant="outline" className="w-full" onClick={() => ungroupNode(groupId)}>Quitar grupo y conservar elementos</Button>
        <details className="rounded-md px-3 py-2 text-outline">
            <summary className="cursor-pointer text-xs focus-visible:outline-2 focus-visible:outline-primary">Más acciones</summary>
            <Button className="mt-2 text-red-500 hover:text-red-500"
                    onClick={() => removeNodes([groupId, ...members.map(node => node.id)])}>
                Quitar grupo y elementos del mapa
            </Button>
        </details>
    </div>;
}
