import {useDeferredValue, useState} from 'react';
import {Button} from '../../components/ui/Button';
import {InlineLoading} from '../../components/ui/LoadingState';
import {Select} from '../../components/ui/Select';
import {useLibraryFolders} from '../../data/useLibraryFolders';
import {useOrganization} from '../../data/useOrganization';
import {useResources} from '../../data/useResources';
import {useCanvasStore} from '../../store/useCanvasStore';
import {CanvasPresentationInspector} from './CanvasPresentationInspector';

export function CanvasFolderInspector({nodeId, projectId, libraryFolderId, folderId, caption = '', onAddResource}: {
    nodeId: string;
    projectId: string;
    libraryFolderId?: string;
    folderId?: string;
    caption?: string;
    onAddResource: (id: string) => void
}) {
    const library = useLibraryFolders();
    const organization = useOrganization(libraryFolderId ? undefined : projectId);
    const [search, setSearch] = useState('');
    const [replacement, setReplacement] = useState('');
    const query = useDeferredValue(search.trim());
    const libraryFolder = library.data?.find(item => item.id === libraryFolderId);
    const legacyFolder = organization.data?.folders.find(item => item.id === folderId);
    const available = Boolean(libraryFolderId ? libraryFolder : legacyFolder && !legacyFolder.archivedAt);
    const libraryResources = useResources({libraryFolderId, query}, Boolean(libraryFolderId && available));
    const legacyResources = useResources({projectId, folderId, query}, Boolean(!libraryFolderId && folderId && available));
    const resources = libraryFolderId ? libraryResources : legacyResources;
    const updateNodeData = useCanvasStore(state => state.updateNodeData);
    const items = resources.data?.pages.flatMap(page => page.data) ?? [];
    const folder = libraryFolderId ? libraryFolder : legacyFolder;

    return <div className="space-y-5 text-sm">
        <div><h2 className="font-semibold">Acceso a carpeta</h2>
            <p className="mt-1 text-xs text-outline">{libraryFolderId ? 'Muestra el contenido actual de la Biblioteca.' : 'Referencia anterior a una carpeta del proyecto.'}</p>
        </div>
        {(libraryFolderId ? library.isPending : organization.isPending) && <InlineLoading label="Cargando carpeta…"/>}
        {(libraryFolderId ? library.isError : organization.isError) && <p role="alert">No se pudo consultar la carpeta.</p>}
        {folder ? <>
            <div className="rounded-md bg-surface-variant/50 p-3"><p className="font-medium">{folder.name}</p>
                <p className="mt-1 text-xs text-outline">{libraryFolderId ? 'Biblioteca' : legacyFolder?.archivedAt ? 'Carpeta de proyecto archivada' : 'Carpeta de proyecto anterior'}</p>
            </div>
            {libraryFolderId && <a className="inline-block text-xs text-primary underline" href={`/library?libraryFolderId=${encodeURIComponent(libraryFolderId)}`}
                                   target="_blank" rel="noopener noreferrer">Abrir en Biblioteca</a>}
        </> : !(libraryFolderId ? library.isPending : organization.isPending) &&
            <p role="alert" className="text-xs text-outline">La carpeta original ya no está disponible. El acceso permanece en el mapa para que puedas elegir otra.</p>}
        {available && <section aria-label="Contenido de la carpeta" className="space-y-2">
            <h3 className="font-medium">Contenido</h3>
            <label className="block text-xs text-outline">Buscar<input type="search"
                className="mt-1 w-full rounded-md bg-surface-variant px-3 py-2 text-sm text-on-background focus-visible:outline-2 focus-visible:outline-primary"
                value={search} onChange={event => setSearch(event.target.value)}/></label>
            {resources.isPending && <InlineLoading label="Buscando recursos…"/>}
            {resources.isError && <p role="alert">No se pudieron cargar los recursos.</p>}
            {!resources.isPending && !resources.isError && items.length === 0 &&
                <p className="text-xs text-outline">No hay recursos en esta carpeta.</p>}
            <ul className="max-h-64 space-y-1 overflow-auto">{items.map(item => <li key={item.id}
                className="flex min-h-9 items-center gap-2 rounded-md px-2 hover:bg-surface-variant/60">
                <span className="min-w-0 flex-1 truncate" title={item.title}>{item.title}</span>
                <Button title={`Añadir ${item.title} al mapa`} onClick={() => onAddResource(item.id)}>Añadir</Button>
            </li>)}</ul>
            {resources.hasNextPage && <Button disabled={resources.isFetchingNextPage}
                onClick={() => void resources.fetchNextPage()}>Cargar más</Button>}
        </section>}
        {library.data && library.data.length > 0 && <details className="rounded-md bg-surface-variant/40 px-3 py-2">
            <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-primary">
                {libraryFolderId ? 'Cambiar carpeta' : 'Convertir en acceso a Biblioteca'}
            </summary>
            <div className="mt-3 space-y-2"><Select label="Carpeta de Biblioteca" value={replacement}
                onValueChange={setReplacement}><option value="">Selecciona una carpeta</option>
                {library.data.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
                <Button variant="secondary" disabled={!replacement} onClick={() => updateNodeData(nodeId, {
                    libraryFolderId: replacement, folderId: undefined, projectId: undefined
                })}>Usar carpeta</Button>
            </div>
        </details>}
        <label className="block text-xs text-outline">Etiqueta local<input value={caption} maxLength={120}
            onChange={event => updateNodeData(nodeId, {caption: event.target.value})}
            className="mt-1 w-full rounded-md bg-surface-variant px-3 py-2 text-sm text-on-background focus-visible:outline-2 focus-visible:outline-primary"/>
        </label>
        <CanvasPresentationInspector nodeId={nodeId}/>
    </div>;
}
