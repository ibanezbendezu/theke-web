import {Button} from '../../components/ui/Button';
import {InlineLoading} from '../../components/ui/LoadingState';
import {useRelation} from '../../data/useRelations';
import {useCanvasStore} from '../../store/useCanvasStore';
import {useQueryClient} from '@tanstack/react-query';
import {useAuth} from '@clerk/clerk-react';
import {thekeFetch} from '../../api/httpClient';
import {useToast} from '../../components/ui/useToast';

const evidenceLabel = {none: 'Sin evidencia citada', needs_evidence: 'Falta evidencia', confirmed: 'Evidencia citada'};

export function CanvasRelationInspector({relationId, edgeId, sourceNodeId, targetNodeId}: {
    relationId: string;
    edgeId: string;
    sourceNodeId: string;
    targetNodeId: string
}) {
    const relation = useRelation(relationId);
    const client = useQueryClient();
    const {getToken} = useAuth();
    const toast = useToast();
    const focusNode = useCanvasStore(state => state.focusNode);
    const requestEdit = useCanvasStore(state => state.requestEditRelation);
    const detail = relation.data;
    return <div className="space-y-4 text-sm">
        <h2 className="font-semibold">Detalle de la Relación</h2>
        {relation.isPending && <InlineLoading label="Cargando relación…"/>}
        {relation.isError && <div role="alert"><p>No se pudo cargar la Relación.</p><Button className="mt-2"
                                                                                            onClick={() => void relation.refetch()}>Reintentar</Button>
        </div>}
        {detail && <>
            <section aria-label="Relación del mapa" className="space-y-2 rounded-md bg-surface-variant/60 p-3">
                <h3 className="font-medium">En este mapa</h3>
                <p className="font-medium">{detail.label || detail.typeLabel}</p>
                <p>{detail.source.title} {detail.direction === 'directed' ? '→' : '↔'} {detail.target.title}</p>
                <p className="text-xs text-outline">{detail.typeLabel} · {detail.direction === 'directed' ? 'Dirigida' : 'No dirigida'} · {evidenceLabel[detail.evidenceStatus]}</p>
                {detail.archivedAt &&
                    <p className="rounded border border-amber-500 p-2 text-amber-700">Relación archivada. Sus usos
                        existentes siguen disponibles.</p>}
                <div className="flex flex-wrap gap-2"><Button onClick={() => focusNode(sourceNodeId)}>Ir al
                    origen</Button><Button onClick={() => focusNode(targetNodeId)}>Ir al destino</Button></div>
                {detail.explanation && <div><h4 className="font-medium">Explicación</h4><p
                    className="whitespace-pre-wrap">{detail.explanation}</p></div>}
                {detail.provenance && <div><h4 className="font-medium">Procedencia</h4><p
                    className="whitespace-pre-wrap">{detail.provenance}</p></div>}
                {detail.evidenceStatus === 'needs_evidence' &&
                    <p className="rounded border border-amber-500 p-2 text-amber-700">Necesita respaldo adicional.</p>}
                <div><h4 className="font-medium">Evidencia</h4>{detail.evidence.length ?
                    <ul className="space-y-2">{detail.evidence.map(item => <li key={item.id}
                                                                               className="rounded-md bg-surface-variant/60 p-2">
                        <a className="text-primary underline" href={`/library/${encodeURIComponent(item.resourceId)}`}
                           target="_blank" rel="noopener noreferrer">{item.title}</a>{item.excerpt &&
                        <p className="mt-1 whitespace-pre-wrap">“{item.excerpt}”</p>}{item.note &&
                        <p className="mt-1 whitespace-pre-wrap text-outline">{item.note}</p>}</li>)}</ul> :
                    <p className="text-outline">Sin citas.</p>}</div>
                {!detail.archivedAt && !detail.deletedAt &&
                    <Button variant="primary" onClick={() => requestEdit(relationId)}>Editar Relación</Button>}
                {(detail.archivedAt || detail.deletedAt) && <Button onClick={() => void (async () => {
                    try {
                        await thekeFetch(`/v1/relations/${relationId}/restore`, {
                            method: 'POST',
                            headers: {Authorization: `Bearer ${await getToken()}`}
                        });
                        await client.invalidateQueries({queryKey: ['private']});
                        toast.success('Relación restaurada.');
                    } catch (error) {
                        toast.error(error instanceof Error ? error.message : 'No se pudo restaurar.');
                    }
                })()}>Restaurar Relación</Button>}
            </section>
            <section aria-label="Presentación local" className="rounded-md bg-surface-variant/60 p-3"><h3
                className="font-medium">Línea en el lienzo</h3><p className="mt-1 text-xs text-outline">Si quitas la última línea de esta Relación, se eliminará del mapa al guardar. Puedes deshacer antes de guardar.</p>
                <div className="mt-3 flex flex-wrap gap-2"><Button
                    onClick={() => useCanvasStore.getState().setEdgeHidden(edgeId, true)}>Ocultar línea</Button><Button
                    onClick={() => {
                        useCanvasStore.getState().removeEdge(edgeId);
                        toast.info('Línea quitada. Si era la última, la Relación se eliminará al guardar.');
                    }}>Quitar relación</Button></div>
            </section>
        </>}
    </div>;
}
