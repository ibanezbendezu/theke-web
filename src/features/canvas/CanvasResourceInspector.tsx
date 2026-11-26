import {Button} from '../../components/ui/Button';
import {InlineLoading} from '../../components/ui/LoadingState';
import {useResource} from '../../data/useResources';
import {useCanvasStore} from '../../store/useCanvasStore';
import {CanvasPresentationInspector} from './CanvasPresentationInspector';

export function CanvasResourceInspector({nodeId, resourceId, caption = ''}: {nodeId: string; resourceId: string; caption?: string}) {
    const resource = useResource(resourceId);
    const updateNodeData = useCanvasStore(state => state.updateNodeData);
    const open = useCanvasStore(state => state.openCanvasNode);
    return <div className="space-y-5 text-sm">
        {resource.isPending && <InlineLoading label="Cargando recurso…"/>}
        {resource.isError && <div role="alert"><p>No se pudo cargar el recurso.</p>
            <Button onClick={() => void resource.refetch()}>Reintentar</Button></div>}
        {resource.data && <section aria-label="Datos del recurso" className="space-y-3">
            <h3 className="break-words font-medium">{resource.data.title}</h3>
            <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" onClick={() => open(nodeId)}>Abrir recurso</Button>
                <a className="inline-flex min-h-11 items-center underline underline-offset-4" href={`/library/${encodeURIComponent(resourceId)}`}
                    target="_blank" rel="noopener noreferrer">Abrir en Biblioteca</a>
            </div>
        </section>}
        <section aria-label="Propiedades de la representación">
            <label className="block">Etiqueta local<input value={caption} maxLength={120}
                className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
                onChange={event => updateNodeData(nodeId, {caption: event.target.value})}/></label>
        </section>
        <CanvasPresentationInspector nodeId={nodeId}/>
    </div>;
}
