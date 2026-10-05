import type {DiagramDocument} from '../../data/useDiagrams';
import type {CreatedRelation} from '../../data/useRelations';

export function mergeCreatedRelation(current: DiagramDocument, result: CreatedRelation, replaceEdgeId?: string,
                                     geometry?: {sourceHandle?: string | null; targetHandle?: string | null; offset?: {x: number; y: number}}): DiagramDocument {
    const createdEdge = result.document.edges.find(edge => edge.id === result.edgeId);
    if (!createdEdge) throw new Error('La respuesta no incluyó la línea de la Relación. Recarga el diagrama.');
    const offset = geometry?.offset ?? (result.reused ? createdEdge.data?.offset : {x: 0, y: 0});
    const visualEdge = {
        ...createdEdge,
        ...(geometry?.sourceHandle ? {sourceHandle: geometry.sourceHandle} : {}),
        ...(geometry?.targetHandle ? {targetHandle: geometry.targetHandle} : {}),
        data: {...createdEdge.data, ...(offset ? {offset} : {})}
    };

    const sameRelation = (edge: DiagramDocument['edges'][number]) =>
        edge.data?.relationId === result.relationId && edge.source === visualEdge.source && edge.target === visualEdge.target;
    const retained = current.edges.filter(edge => edge.id !== replaceEdgeId || edge.id === result.edgeId);
    const alreadyPresent = retained.some(sameRelation);

    return {
        ...current,
        edges: [
            ...retained.map(edge => ({
                ...edge,
                ...(sameRelation(edge) && edge.hidden ? {hidden: false} : {}),
                ...(edge.id === result.edgeId ? {
                    ...(visualEdge.sourceHandle ? {sourceHandle: visualEdge.sourceHandle} : {}),
                    ...(visualEdge.targetHandle ? {targetHandle: visualEdge.targetHandle} : {}),
                    data: {...edge.data, ...visualEdge.data}
                } : {})
            })),
            ...(!alreadyPresent ? [visualEdge.hidden ? {...visualEdge, hidden: false} : visualEdge] : [])
        ]
    };
}
