import {ArrowDown, ArrowUp, LayoutGrid, List, Layers3, X} from 'lucide-react';
import {Button} from '../../components/ui/Button';
import {Select} from '../../components/ui/Select';
import {useOrganization} from '../../data/useOrganization';
import {useCanvasStore} from '../../store/useCanvasStore';
import type {CollectionDisplayMode} from './collectionTypes';

export function CanvasCollectionInspector({nodeId, projectId}: {nodeId: string; projectId: string}) {
    const node = useCanvasStore(state => state.nodes.find(item => item.id === nodeId));
    const update = useCanvasStore(state => state.updateNodeData);
    const setMode = useCanvasStore(state => state.setCollectionDisplayMode);
    const split = useCanvasStore(state => state.splitCollection);
    const remove = useCanvasStore(state => state.removeNodes);
    const organization = useOrganization(projectId);
    if (!node || node.type !== 'collection') return null;
    const ids = Array.isArray(node.data.resourceIds) ? node.data.resourceIds.filter((id): id is string => typeof id === 'string') : [];
    const mode: CollectionDisplayMode = node.data.displayMode === 'gallery' || node.data.displayMode === 'list' ? node.data.displayMode : 'stack';
    const move = (from: number, to: number) => {
        if (to < 0 || to >= ids.length) return;
        const next = [...ids];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        update(nodeId, {resourceIds: next});
    };
    return <div className="space-y-5 text-sm">
        <div><h2 className="font-semibold">Colección</h2><p className="mt-1 text-xs text-outline">Una vista del mapa; los recursos permanecen en Biblioteca.</p></div>
        <label className="block font-medium">Nombre
            <input className="mt-1.5 w-full rounded-md border-0 bg-surface-variant px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-primary"
                value={typeof node.data.label === 'string' ? node.data.label : ''} maxLength={120} placeholder="Colección"
                onChange={event => update(nodeId, {label: event.target.value})}/>
        </label>
        <div><p className="mb-1.5 font-medium">Presentación</p><Select value={mode} label="Presentación de la colección"
            onValueChange={value => setMode(nodeId, value as CollectionDisplayMode)}>
            <option value="stack">Pila compacta</option><option value="gallery">Galería</option><option value="list">Lista</option>
        </Select></div>
        <section><h3 className="mb-2 font-medium">Recursos ({ids.length})</h3>
            <ul className="space-y-1">{ids.map((resourceId, index) => {
                const resource = organization.data?.resources.find(item => item.resourceId === resourceId);
                return <li key={resourceId} className="flex min-h-10 items-center gap-1 rounded-md px-2 hover:bg-surface-variant/60">
                    <span className="min-w-0 flex-1 truncate" title={resource?.title}>{resource?.title ?? 'Cargando recurso…'}</span>
                    <Button size="icon" className="h-8 w-8" icon={ArrowUp} title="Mover antes" aria-label="Mover antes" disabled={index === 0} onClick={() => move(index, index - 1)}/>
                    <Button size="icon" className="h-8 w-8" icon={ArrowDown} title="Mover después" aria-label="Mover después" disabled={index === ids.length - 1} onClick={() => move(index, index + 1)}/>
                    <Button size="icon" className="h-8 w-8" icon={X} title="Quitar de la colección" aria-label="Quitar de la colección" onClick={() => update(nodeId, {resourceIds: ids.filter(id => id !== resourceId)})}/>
                </li>;
            })}</ul>
        </section>
        <Button variant="outline" className="w-full" icon={mode === 'gallery' ? LayoutGrid : mode === 'list' ? List : Layers3} onClick={() => split(nodeId)}>Separar en nodos</Button>
        <details className="rounded-md px-3 py-2 text-outline"><summary className="cursor-pointer text-xs">Más acciones</summary>
            <Button className="mt-2 text-red-500 hover:text-red-500" onClick={() => remove([nodeId])}>Quitar colección del mapa</Button>
        </details>
    </div>;
}
