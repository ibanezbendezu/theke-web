import {useEffect, useMemo, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {Check, ChevronRight, File, FileText, Folder, Grid2X2, Image, Link2, List, MoreHorizontal, Music2, Search, Video} from 'lucide-react';
import {Button} from '../../components/ui/Button';
import {LoadingLine} from '../../components/ui/LoadingState';
import {Select} from '../../components/ui/Select';
import {useCollectionView} from '../../components/ui/useCollectionView';
import {useLibraryFolders} from '../../data/useLibraryFolders';
import {useOrganization, type ProjectResource} from '../../data/useOrganization';
import {useResources, type ResourceSummary} from '../../data/useResources';
import {useCanvasStore} from '../../store/useCanvasStore';

type Section = 'map' | 'library';
type Sort = 'name' | 'recent' | 'type';
type Entry = {id: string; title: string; type: string; updatedAt: string; icon: ReactNode; folder?: boolean; representationIds?: string[]};

function resourceIcon(item: Pick<ResourceSummary, 'type' | 'mediaType'> | ProjectResource) {
    if (item.type === 'note') return <FileText size={19}/>;
    if (item.type === 'link') return <Link2 size={19}/>;
    if ('mediaType' in item && item.mediaType?.startsWith('image/')) return <Image size={19}/>;
    if ('mediaType' in item && item.mediaType?.startsWith('audio/')) return <Music2 size={19}/>;
    if ('mediaType' in item && item.mediaType?.startsWith('video/')) return <Video size={19}/>;
    return <File size={19}/>;
}

function resourceType(item: Pick<ResourceSummary, 'type' | 'mediaType'> | ProjectResource) {
    if (item.type === 'note') return 'Nota';
    if (item.type === 'link') return 'Enlace';
    if ('mediaType' in item && item.mediaType?.startsWith('image/')) return 'Imagen';
    if ('mediaType' in item && item.mediaType?.startsWith('audio/')) return 'Audio';
    if ('mediaType' in item && item.mediaType?.startsWith('video/')) return 'Video';
    if ('mediaType' in item && item.mediaType && /pdf|word|officedocument|^text\//.test(item.mediaType)) return 'Documento';
    return 'Archivo';
}

function sortEntries(entries: Entry[], sort: Sort) {
    return [...entries].sort((a, b) => {
        if (sort === 'recent') return b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title, 'es');
        if (sort === 'type') return a.type.localeCompare(b.type, 'es') || a.title.localeCompare(b.title, 'es');
        return a.title.localeCompare(b.title, 'es');
    });
}

function CanvasResourceLoading({view}: {view: 'grid' | 'list'}) {
    return <div role="status" aria-label="Cargando recursos" className={view === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-0.5'}>
        <span className="sr-only">Cargando recursos</span>
        {Array.from({length: view === 'grid' ? 4 : 5}, (_, index) => <div key={index} aria-hidden="true"
            className={view === 'grid' ? 'h-[100px] rounded-md bg-surface-variant/45 p-2' : 'flex h-12 items-center gap-2 px-2'}>
            <LoadingLine className={view === 'grid' ? 'mb-2 h-9 w-9' : 'h-8 w-8 shrink-0'}/>
            <div className={`space-y-1.5 ${view === 'grid' ? '' : 'min-w-0 flex-1'}`}>
                <LoadingLine className={`h-3 ${index % 2 ? 'w-3/5' : 'w-4/5'}`}/>
                <LoadingLine className="h-2.5 w-2/5"/>
            </div>
            {view === 'list' && <LoadingLine className="h-3 w-3 shrink-0"/>}
        </div>)}
    </div>;
}

export function CanvasResourcePanel({projectId, initialSection = 'map', onAdd, onAddAnother, onFocus, onFocusNode, onSelectFolder}: {
    projectId: string;
    initialSection?: Section;
    onAdd: (id: string) => void;
    onAddAnother: (id: string) => void;
    onFocus: (id: string) => void;
    onFocusNode: (id: string) => void;
    onSelectFolder: (id: string) => void;
}) {
    const [section, setSection] = useState<Section>(initialSection);
    const [mapSearch, setMapSearch] = useState('');
    const [librarySearch, setLibrarySearch] = useState('');
    const [query, setQuery] = useState('');
    const [folderId, setFolderId] = useState('');
    const [sort, setSort] = useState<Sort>('name');
    const [mapView, setMapView] = useCollectionView('canvas-map-resources', 'list');
    const [libraryView, setLibraryView] = useCollectionView('canvas-library-resources', 'list');
    const [menu, setMenu] = useState<{id: string; x: number; y: number} | null>(null);
    const organization = useOrganization(projectId);
    const folders = useLibraryFolders(section === 'library');
    const nodes = useCanvasStore(state => state.nodes);
    const library = useResources({status: 'active', libraryFolderId: folderId || 'root', query}, section === 'library');

    useEffect(() => {
        const timer = window.setTimeout(() => setQuery(librarySearch.trim()), 250);
        return () => window.clearTimeout(timer);
    }, [librarySearch]);
    useEffect(() => {
        if (!menu) return;
        const close = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setMenu(null);
        };
        document.addEventListener('keydown', close);
        return () => document.removeEventListener('keydown', close);
    }, [menu]);
    const representations = useMemo(() => {
        const byResource = new Map<string, string[]>();
        for (const node of nodes) {
            if (node.type !== 'resource' || typeof node.data?.resourceId !== 'string') continue;
            const ids = byResource.get(node.data.resourceId) ?? [];
            ids.push(node.id);
            byResource.set(node.data.resourceId, ids);
        }
        return byResource;
    }, [nodes]);
    const mapEntries: Entry[] = (organization.data?.resources ?? []).filter(item => !item.archivedAt && item.title.toLocaleLowerCase().includes(mapSearch.toLocaleLowerCase().trim()))
        .map(item => ({id: item.resourceId, title: item.title, type: resourceType(item), updatedAt: item.updatedAt, icon: resourceIcon(item), representationIds: representations.get(item.resourceId) ?? []}));
    const allFolders = folders.data ?? [];
    const currentFolder = allFolders.find(folder => folder.id === folderId);
    const folderPath = [];
    const folderById = new Map(allFolders.map(folder => [folder.id, folder]));
    const visited = new Set<string>();
    for (let cursor = currentFolder; cursor && !visited.has(cursor.id); cursor = cursor.parentFolderId ? folderById.get(cursor.parentFolderId) : undefined) {
        visited.add(cursor.id);
        folderPath.unshift(cursor);
    }
    const libraryEntries: Entry[] = [
        ...allFolders.filter(folder => folder.parentFolderId === (folderId || null) && folder.name.toLocaleLowerCase().includes(librarySearch.toLocaleLowerCase().trim()))
            .map(folder => ({id: folder.id, title: folder.name, type: 'Carpeta', updatedAt: folder.updatedAt, icon: <Folder size={19}/>, folder: true})),
        ...(library.data?.pages.flatMap(page => page.data) ?? []).map(item => ({id: item.id, title: item.title, type: resourceType(item), updatedAt: item.updatedAt, icon: resourceIcon(item), representationIds: representations.get(item.id) ?? []}))
    ];
    const entries = sortEntries(section === 'map' ? mapEntries : libraryEntries, sort);
    const pending = section === 'map' ? organization.isPending : folders.isPending || library.isPending || library.isPlaceholderData || librarySearch.trim() !== query;
    const error = section === 'map' ? organization.isError : folders.isError || library.isError;
    const view = section === 'map' ? mapView : libraryView;
    const setView = section === 'map' ? setMapView : setLibraryView;
    const switchSection = (next: Section) => {setMenu(null); setSection(next);};
    const navigateFolder = (id: string) => {setMenu(null); setFolderId(id); setLibrarySearch('');};
    const openMenu = (id: string, x: number, y: number) => {
        setMenu({id, x: Math.max(8, Math.min(x, window.innerWidth - 196)), y: Math.max(8, Math.min(y, window.innerHeight - 260))});
    };
    const openEntry = (entry: Entry) => {
        setMenu(null);
        if (entry.folder) {navigateFolder(entry.id); return;}
        if (entry.representationIds?.length) onFocus(entry.id);
        else onAdd(entry.id);
    };
    const actionClass = 'flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left text-xs hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary';

    return <aside className="flex h-full min-h-0 w-full flex-col p-3 text-on-background" aria-label="Recursos">
        <h2 className="px-1 pb-3 pr-10 text-sm font-semibold">Recursos</h2>
        <div className="flex rounded-md bg-surface-variant p-0.5" role="tablist" aria-label="Origen de recursos">
            <button type="button" role="tab" aria-selected={section === 'map'} onClick={() => switchSection('map')}
                className={`min-h-8 flex-1 rounded-[5px] px-2 text-xs focus-visible:outline-2 focus-visible:outline-primary ${section === 'map' ? 'bg-background font-medium' : 'text-outline hover:text-on-background'}`}>En el mapa</button>
            <button type="button" role="tab" aria-selected={section === 'library'} onClick={() => switchSection('library')}
                className={`min-h-8 flex-1 rounded-[5px] px-2 text-xs focus-visible:outline-2 focus-visible:outline-primary ${section === 'library' ? 'bg-background font-medium' : 'text-outline hover:text-on-background'}`}>Biblioteca</button>
        </div>
        <label className="mt-3 flex h-9 shrink-0 items-center gap-2 rounded-md bg-surface-variant px-2.5 text-outline focus-within:outline-2 focus-within:outline-primary">
            <Search size={15} aria-hidden="true"/><input type="search" value={section === 'map' ? mapSearch : librarySearch}
                onChange={event => section === 'map' ? setMapSearch(event.target.value) : setLibrarySearch(event.target.value)}
                placeholder={section === 'map' ? 'Buscar en este mapa' : 'Buscar en esta carpeta'}
                aria-label={section === 'map' ? 'Buscar en este mapa' : 'Buscar en esta carpeta'}
                className="min-w-0 flex-1 bg-transparent text-xs text-on-background outline-none placeholder:text-outline"/>
        </label>
        {section === 'library' && <nav aria-label="Carpeta de Biblioteca" className="mt-2 flex min-h-7 items-center gap-1 overflow-hidden px-1 text-xs text-outline">
            <button type="button" onClick={() => navigateFolder('')} className="shrink-0 rounded px-1 py-1 hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary">Biblioteca</button>
            {folderPath.map((folder, index) => <span key={folder.id} className="flex min-w-0 items-center gap-1"><ChevronRight size={13} className="shrink-0"/>
                {index === folderPath.length - 1 ? <span className="min-w-0 truncate text-on-background" title={folder.name}>{folder.name}</span> :
                    <button type="button" onClick={() => navigateFolder(folder.id)} className="max-w-20 truncate rounded px-1 py-1 hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary" title={folder.name}>{folder.name}</button>}</span>)}
        </nav>}
        <div className="mt-2 flex shrink-0 items-center justify-between gap-1 px-1">
            <div className="flex items-center gap-1 text-xs text-outline"><span>Ordenar</span><Select label="Ordenar recursos" value={sort}
                onValueChange={value => setSort(value as Sort)} className="theke-select--toolbar max-w-28 text-xs">
                <option value="name">Nombre</option><option value="recent">Recientes</option><option value="type">Tipo</option>
            </Select></div>
            <div className="flex items-center gap-0.5" aria-label="Vista de recursos">
                <Button size="icon" className={`h-8 w-8 ${view === 'list' ? 'bg-surface-variant text-on-background' : ''}`} icon={List} title="Vista de lista" aria-pressed={view === 'list'} onClick={() => setView('list')}/>
                <Button size="icon" className={`h-8 w-8 ${view === 'grid' ? 'bg-surface-variant text-on-background' : ''}`} icon={Grid2X2} title="Vista de galería" aria-pressed={view === 'grid'} onClick={() => setView('grid')}/>
            </div>
        </div>
        <div role="tabpanel" aria-label={section === 'map' ? 'Recursos del mapa' : 'Biblioteca'} className="mt-2 min-h-0 flex-1 overflow-y-auto pb-2">
            {pending && !error && <CanvasResourceLoading view={view}/>}
            {error && <p role="alert" className="px-2 py-4 text-xs text-outline">No se pudieron cargar los recursos.</p>}
            {!pending && !error && <>
                {entries.length === 0 && <p className="px-2 py-6 text-xs leading-relaxed text-outline">{section === 'map' ? mapSearch ? 'No hay recursos con ese nombre.' : 'Este mapa aún no tiene recursos. Abre Biblioteca para añadir uno.' : librarySearch ? 'No hay resultados en esta carpeta.' : 'Esta carpeta está vacía.'}</p>}
                <div className={view === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-0.5'}>
                    {entries.map(entry => <div key={`${entry.folder ? 'folder' : 'resource'}-${entry.id}`} className={`group relative min-w-0 rounded-md hover:bg-surface-variant/70 ${view === 'grid' ? 'bg-surface-variant/45 p-2' : 'flex items-center'}`}
                        draggable={!entry.folder} onDragStart={event => {event.dataTransfer.setData('application/x-theke-resource', entry.id); event.dataTransfer.effectAllowed = 'copy';}}
                        onContextMenu={event => {event.preventDefault(); openMenu(entry.id, event.clientX, event.clientY);}}>
                        <button type="button" onClick={() => openEntry(entry)} className={`min-w-0 text-left focus-visible:outline-2 focus-visible:outline-primary ${view === 'grid' ? 'block w-full pb-2 pr-4' : 'flex min-h-12 flex-1 items-center gap-2 px-2 py-1'}`}>
                            <span className={`grid shrink-0 place-items-center rounded-md bg-background/75 text-outline ${view === 'grid' ? 'mb-2 h-9 w-9' : 'h-8 w-8'}`}>{entry.icon}</span>
                            <span className="min-w-0"><span className="block truncate text-xs font-medium" title={entry.title}>{entry.title}</span>
                                <span className="block truncate text-[11px] text-outline">{entry.type}{section === 'map' ? entry.representationIds?.length ? ` · ${entry.representationIds.length} ${entry.representationIds.length === 1 ? 'ubicación' : 'ubicaciones'}` : ' · Sin colocar' : entry.representationIds?.length ? ' · En el mapa' : ''}</span></span>
                        </button>
                        {section === 'library' && !entry.folder && Boolean(entry.representationIds?.length) && <Check size={12} className="pointer-events-none absolute right-8 top-3 text-outline" aria-hidden="true"/>}
                        <Button size="icon" icon={MoreHorizontal} title={`Opciones de ${entry.title}`} aria-expanded={menu?.id === entry.id}
                            className={`${view === 'grid' ? 'absolute right-1 top-1' : 'mr-0.5'} h-8 w-8 shrink-0`}
                            onClick={event => {if (menu?.id === entry.id) setMenu(null); else {const rect = event.currentTarget.getBoundingClientRect(); openMenu(entry.id, rect.right - 184, rect.bottom + 4);}}}/>
                        {menu?.id === entry.id && createPortal(<><button type="button" className="fixed inset-0 z-[89] cursor-default" aria-label="Cerrar opciones" onClick={() => setMenu(null)}/>
                            <div role="menu" aria-label={`Opciones de ${entry.title}`} className="fixed z-[90] max-h-[min(60dvh,240px)] min-w-44 overflow-y-auto rounded-md bg-surface p-1 ring-1 ring-border" style={{left: menu.x, top: menu.y}}>
                            {entry.folder ? <><button type="button" role="menuitem" className={actionClass} onClick={() => openEntry(entry)}>Abrir carpeta</button>
                                <button type="button" role="menuitem" className={actionClass} onClick={() => {setMenu(null); onSelectFolder(entry.id);}}>Añadir acceso al mapa</button></> : <>
                                {entry.representationIds?.length ? <>
                                    {entry.representationIds.map((nodeId, index) => <button key={nodeId} type="button" role="menuitem" className={actionClass} onClick={() => {setMenu(null); onFocusNode(nodeId);}}>Ir a ubicación {index + 1}</button>)}
                                    <button type="button" role="menuitem" className={actionClass} onClick={() => {setMenu(null); onAddAnother(entry.id);}}>Añadir otra representación</button>
                                </> : <button type="button" role="menuitem" className={actionClass} onClick={() => {setMenu(null); onAdd(entry.id);}}>Colocar en el mapa</button>}
                            </>}</div></>, document.body)}
                    </div>)}
                </div>
                {section === 'library' && library.hasNextPage && <Button className="mt-2 w-full" loading={library.isFetchingNextPage} onClick={() => void library.fetchNextPage()}>Cargar más</Button>}
            </>}
        </div>
    </aside>;
}
