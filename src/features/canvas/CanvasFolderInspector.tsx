import {useDeferredValue, useState} from 'react';
import {Button} from '../../components/ui/Button';
import {InlineLoading} from '../../components/ui/LoadingState';
import {useOrganization} from '../../data/useOrganization';
import {useResources} from '../../data/useResources';
import {useCanvasStore} from '../../store/useCanvasStore';
import {CanvasPresentationInspector} from './CanvasPresentationInspector';

export function CanvasFolderInspector({nodeId, projectId, folderId, caption = '', onAddResource}: {
    nodeId: string;
    projectId: string;
    folderId: string;
    caption?: string;
    onAddResource: (id: string) => void
}) {
    const organization = useOrganization(projectId);
    const [search, setSearch] = useState('');
    const query = useDeferredValue(search.trim());
    const folder = organization.data?.folders.find(item => item.id === folderId);
    const available = Boolean(folder && !folder.archivedAt);
    const resources = useResources({projectId, folderId, query}, available);
    const updateNodeData = useCanvasStore(state => state.updateNodeData);
    const items = resources.data?.pages.flatMap(page => page.data) ?? [];
    return <div className="space-y-4 text-sm">
        <h2 className="font-semibold">Carpeta del proyecto</h2>
        {organization.isPending && <InlineLoading label="Cargando carpeta…"/>}
        {organization.isError &&
            <p role="alert">No se pudo consultar la carpeta. Puedes reintentar desde el proyecto.</p>}
        {!organization.isPending && !organization.isError && !folder &&
            <p role="alert">Esta carpeta ya no está disponible en el proyecto. La tarjeta permanece en el diagrama.</p>}
        {folder && <section aria-label="Datos de la carpeta" className="rounded-md bg-surface-variant/60 p-3"><h3
            className="font-medium">{folder.name}</h3><p
            className="mt-1 text-xs text-outline">{organization.data?.resources.filter(item => item.folderId === folderId && !item.archivedAt).length ?? 0} recursos
            · {folder.archivedAt ? 'Archivada' : 'Activa'}</p>{folder.archivedAt &&
            <p className="mt-2">La carpeta está archivada; sus recursos no se despliegan automáticamente.</p>}
        </section>}
        <a className="inline-block text-primary underline" href={`/projects/${encodeURIComponent(projectId)}`}
           target="_blank" rel="noopener noreferrer">Administrar en el proyecto</a>
        {available && <section aria-label="Recursos de la carpeta" className="rounded-md bg-surface-variant/60 p-3"><h3
            className="font-medium">Explorar recursos</h3><label className="mt-2 block">Buscar<input type="search"
                                                                                                     className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
                                                                                                     value={search}
                                                                                                     onChange={event => setSearch(event.target.value)}/></label>{resources.isPending &&
            <div className="mt-2"><InlineLoading label="Buscando recursos…"/></div>}{resources.isError &&
            <p role="alert" className="mt-2">No se pudieron cargar los
                recursos.</p>}{!resources.isPending && !resources.isError && items.length === 0 &&
            <p className="mt-2 text-outline">No hay recursos en esta carpeta.</p>}
            <div className="mt-2 space-y-2">{items.map(item => <div key={item.id}
                                                                    className="flex items-center gap-2 border-t border-border pt-2">
                <span className="min-w-0 flex-1 truncate" data-tooltip={item.title}>{item.title}</span><Button
                onClick={() => onAddResource(item.id)}>Añadir</Button></div>)}</div>
            {resources.hasNextPage && <Button className="mt-3" disabled={resources.isFetchingNextPage}
                                              onClick={() => void resources.fetchNextPage()}>Cargar más</Button>}
        </section>}
        <section aria-label="Propiedades de la representación" className="rounded-md bg-surface-variant/60 p-3"><h3
            className="font-medium">Solo en este diagrama</h3><label className="mt-2 block">Etiqueta local<input
            className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
            value={caption} maxLength={120} onChange={event => updateNodeData(nodeId, {caption: event.target.value})}/></label>
        </section>
        <CanvasPresentationInspector nodeId={nodeId}/>
    </div>;
}
