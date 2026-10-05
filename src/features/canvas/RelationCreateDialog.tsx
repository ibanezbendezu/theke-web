import {useState, type FormEvent} from 'react';
import type {Node} from '@xyflow/react';
import {Button} from '../../components/ui/Button';
import {Select} from '../../components/ui/Select';
import {useOrganization} from '../../data/useOrganization';
import {useRelationTypes, type AvailableRelation, type CreateRelationInput} from '../../data/useRelations';
import {CanvasDialog} from './CanvasDialog';

export function RelationCreateDialog({projectId, nodes, availableRelations, initial, canSave, onCreate, onVisualAlternative, onClose}: {
    projectId: string;
    nodes: Node[];
    availableRelations: AvailableRelation[];
    initial: { source?: string; target?: string; replaceEdgeId?: string };
    canSave: boolean;
    onCreate: (input: Omit<CreateRelationInput, 'expectedRevision'>) => Promise<void>;
    onVisualAlternative: () => void;
    onClose: () => void;
}) {
    const resources = nodes.filter(node => node.type === 'resource' && typeof node.data?.resourceId === 'string');
    const organization = useOrganization(projectId);
    const types = useRelationTypes(projectId);
    const valid = (id?: string) => resources.some(node => node.id === id) ? id! : '';
    const [sourceNodeId, setSourceNodeId] = useState(valid(initial.source));
    const [targetNodeId, setTargetNodeId] = useState(valid(initial.target));
    const [direction, setDirection] = useState<'directed' | 'undirected'>('directed');
    const [typeKey, setTypeKey] = useState('related_to');
    const [customTypeName, setCustomTypeName] = useState('');
    const [operationId, setOperationId] = useState(() => crypto.randomUUID());
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(initial.source && !valid(initial.source) || initial.target && !valid(initial.target) ? 'Las Relaciones del MVP solo conectan Recursos. Puedes usar una línea visual para otros elementos.' : '');
    const label = (node: Node) => {
        const caption = node.data?.caption;
        const title = organization.data?.resources.find(item => item.resourceId === node.data?.resourceId)?.title;
        return `${typeof caption === 'string' && caption.trim() ? caption : title ?? 'Recurso'} (${node.id.slice(0, 8)})`;
    };
    const sourceResourceId = resources.find(node => node.id === sourceNodeId)?.data?.resourceId;
    const targetResourceId = resources.find(node => node.id === targetNodeId)?.data?.resourceId;
    const existing = availableRelations.find(item => item.typeKey === typeKey && item.direction === direction &&
        (item.sourceResourceId === sourceResourceId && item.targetResourceId === targetResourceId ||
            direction === 'undirected' && item.sourceResourceId === targetResourceId && item.targetResourceId === sourceResourceId));
    const reset = () => {
        setError('');
        setOperationId(crypto.randomUUID());
    };
    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!canSave) {
            setError('Espera a que el diagrama termine de guardarse antes de crear la Relación.');
            return;
        }
        if (!sourceNodeId || !targetNodeId || sourceNodeId === targetNodeId) {
            setError('Elige dos representaciones de Recursos diferentes.');
            return;
        }
        setBusy(true);
        setError('');
        try {
            await onCreate({
                sourceNodeId,
                targetNodeId,
                direction,
                typeKey, ...(typeKey === 'custom' ? {customTypeName} : {}),
                idempotencyKey: operationId,
                reuseExisting: true
            });
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'No se pudo crear la Relación.');
        } finally {
            setBusy(false);
        }
    };
    return <CanvasDialog titleId="create-relation-title" onClose={onClose} className="max-w-md">
        <h2 id="create-relation-title" className="text-lg font-semibold">Crear Relación</h2>
        <p className="mt-1 text-sm text-outline">Esta Relación pertenece a este mapa. Otros mapas pueden interpretar los mismos Recursos de otra forma.</p>
        {initial.replaceEdgeId && <p className="mt-2 text-sm text-outline">Al conectar otro Recurso se creará una Relación nueva. Si la anterior queda sin líneas, se eliminará al guardar.</p>}
        <form className="mt-4 space-y-3" onSubmit={event => void submit(event)}>
            <label className="block text-sm">Origen<Select label="Origen"
                className="mt-1" value={sourceNodeId}
                onValueChange={value => {
                    setSourceNodeId(value);
                    reset();
                }}>
                <option value="">Selecciona un Recurso</option>
                {resources.map(node => <option key={node.id} value={node.id}>{label(node)}</option>)}</Select></label>
            <label className="block text-sm">Destino<Select label="Destino"
                className="mt-1" value={targetNodeId}
                onValueChange={value => {
                    setTargetNodeId(value);
                    reset();
                }}>
                <option value="">Selecciona un Recurso</option>
                {resources.map(node => <option key={node.id} value={node.id}>{label(node)}</option>)}</Select></label>
            <label className="block text-sm">Dirección<Select label="Dirección"
                className="mt-1" value={direction}
                onValueChange={value => {
                    setDirection(value as 'directed' | 'undirected');
                    reset();
                }}>
                <option value="directed">Dirigida: origen → destino</option>
                <option value="undirected">No dirigida: ambos sentidos</option>
            </Select></label>
            <label className="block text-sm">Tipo<Select label="Tipo"
                className="mt-1" value={typeKey}
                onValueChange={value => {
                    setTypeKey(value);
                    reset();
                }}>{(types.data ?? [{key: 'related_to', label: 'Se relaciona con'}]).map(item => <option key={item.key}
                                                                                                         value={item.key}>{item.label}</option>)}
                <option value="custom">Crear tipo personalizado…</option>
            </Select></label>
            {typeKey === 'custom' && <label className="block text-sm">Nombre del tipo<input
                className="mt-1 w-full rounded border border-border bg-background p-2" maxLength={60}
                value={customTypeName} onChange={event => {
                setCustomTypeName(event.target.value);
                reset();
            }} placeholder="Por ejemplo: contextualiza"/></label>}
            {types.isError &&
                <p role="alert" className="text-sm text-red-600">No se pudo cargar el catálogo de tipos.</p>}
            {existing && <p role="status" className="text-sm text-outline">Esta Relación ya existe en este mapa. Se añadirá otra línea sin duplicarla.</p>}
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            {!canSave && <p className="text-xs text-outline">El diagrama tiene cambios pendientes de guardar.</p>}
            <div className="flex flex-wrap justify-end gap-2"><Button type="button" onClick={onVisualAlternative}>Añadir
                línea visual</Button><Button type="button" onClick={onClose}>Cancelar</Button>
                <Button type="submit" variant="primary"
                        loading={busy} disabled={!canSave || !sourceNodeId || !targetNodeId || (typeKey === 'custom' && customTypeName.trim().length < 2)}>{busy ? 'Guardando…' : existing ? 'Mostrar en el mapa' : 'Guardar Relación'}</Button>
            </div>
        </form>
    </CanvasDialog>;
}
