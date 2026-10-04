import {useCallback, useDeferredValue, useEffect, useRef, useState} from 'react';
import type {FormEvent} from 'react';
import {createPortal} from 'react-dom';
import {
    Download,
    File as FileIcon,
    FileText,
    Folder,
    Image as ImageIcon,
    Info,
    Link as LinkIcon,
    MoreHorizontal,
    Music,
    Pencil,
    Search,
    Video,
    X
} from 'lucide-react';
import {useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {UploadTray} from '../components/uploads/UploadTray';
import {ResourceKnowledgePanel} from '../components/resources/ResourceKnowledgePanel';
import {FileThumbnail} from '../components/resources/FileThumbnail';
import {PdfDocumentViewer} from '../components/resources/PdfDocumentViewer';
import {Button} from '../components/ui/Button';
import {CollectionLoading, InlineLoading} from '../components/ui/LoadingState';
import {CollectionItem} from '../components/ui/CollectionItem';
import {Dialog} from '../components/ui/Dialog';
import {MoveCollectionDialog} from '../components/ui/MoveCollectionDialog';
import {ConfirmDialog, NameDialog} from '../components/ui/NameDialog';
import {ImpactDialog, type ImpactRequest} from '../components/ui/ImpactDialog';
import {CollectionGroup, ViewToolbar} from '../components/ui/ViewToolbar';
import {useToast} from '../components/ui/useToast';
import {useCollectionView} from '../components/ui/useCollectionView';
import {type Note, type NoteInput, useNoteActions} from '../data/useNotes';
import {type LibraryFolder, useLibraryFolderActions, useLibraryFolders} from '../data/useLibraryFolders';
import {useImpactActions} from '../data/useImpacts';
import {
    type ResourceDetail,
    type ResourceSummary,
    useLinkActions,
    useResource,
    useResourceAccess,
    useResourceActions,
    useResources
} from '../data/useResources';

export function Library() {
    const [viewMode, setViewMode] = useCollectionView('library', 'grid');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [impact, setImpact] = useState<ImpactRequest | null>(null);
    const [folderDialog, setFolderDialog] = useState<{ id?: string; name: string } | null>(null);
    const [deletingFolder, setDeletingFolder] = useState<LibraryFolder | null>(null);
    const [collectionMenu, setCollectionMenu] = useState<{ x: number; y: number } | null>(null);
    const [moving, setMoving] = useState<{
        kind: 'folder' | 'resource';
        id: string;
        name: string;
        parentFolderId: string | null
    } | null>(null);
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const resourceId = location.pathname.match(/^\/library\/([^/]+)$/)?.[1];
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') ?? '';
    const deferredQuery = useDeferredValue(query);
    const folderId = searchParams.get('libraryFolderId') ?? '';
    const status = searchParams.get('status') === 'archived' ? 'archived' : 'active';
    const folders = useLibraryFolders();
    const folderActions = useLibraryFolderActions();
    const resources = useResources({
        query: deferredQuery || undefined,
        type: 'file',
        status,
        libraryFolderId: status === 'archived' ? undefined : folderId || 'root'
    });
    const detail = useResource(resourceId);
    const noteActions = useNoteActions();
    const items = resources.data?.pages.flatMap(page => page.data) ?? [];
    const folderItems = folders.data ?? [];
    const visibleFolders = status === 'active' ? folderItems.filter(folder => folder.parentFolderId === (folderId || null)) : [];
    const hasVisibleFolders = visibleFolders.length > 0;
    const collectionError = resources.isError || (status === 'active' && folders.isError);
    const collectionPending = !collectionError && (
        resources.isPending || resources.isPlaceholderData || (status === 'active' && folders.isPending)
    );
    const setFolder = (value: string) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set('libraryFolderId', value); else next.delete('libraryFolderId');
        setSearchParams(next, {replace: true});
    };
    const setStatus = (value: 'active' | 'archived') => {
        const next = new URLSearchParams(searchParams);
        if (value === 'archived') {
            next.set('status', 'archived');
            next.delete('libraryFolderId');
        } else next.delete('status');
        setSearchParams(next, {replace: true});
    };
    const setQuery = (value: string) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set('q', value); else next.delete('q');
        setSearchParams(next, {replace: true});
    };
    const dropIntoFolder = async (event: React.DragEvent<HTMLElement>, destination: string | null) => {
        event.preventDefault();
        const folder = event.dataTransfer.getData('application/x-theke-library-folder');
        const resource = event.dataTransfer.getData('application/x-theke-resource');
        try {
            if (folder) await folderActions.moveFolder.mutateAsync({id: folder, parentFolderId: destination});
            else if (resource) await folderActions.move.mutateAsync({resourceIds: [resource], folderId: destination});
            toast.success('Elemento movido.');
        } catch (reason) {
            toast.error(reason instanceof Error ? reason.message : 'No se pudo mover.');
        }
    };
    const resourceUrl = (id: string) => `/library/${id}${searchParams.size ? `?${searchParams}` : ''}`;
    const listDestination = `/library${searchParams.size ? `?${searchParams}` : ''}`;
    const closeResource = () => navigate(listDestination, {replace: true});
    return <main className="min-h-[calc(100dvh-46px)] w-full px-4 pb-20 pt-7 md:px-8" aria-label="Biblioteca"
                 aria-keyshortcuts="Shift+F10" tabIndex={0} onKeyDown={event => {
        if (status !== 'active' || (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
        event.preventDefault();
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        setCollectionMenu({x: rect.left + 8, y: Math.min(rect.bottom + 4, window.innerHeight - 60)});
    }} onContextMenu={event => {
        if (status !== 'active' || event.defaultPrevented || (event.target instanceof Element && event.target.closest('button, input, textarea, a'))) return;
        event.preventDefault();
        setCollectionMenu({x: event.clientX, y: event.clientY});
    }}>
        <ViewToolbar viewMode={viewMode} setViewMode={setViewMode}
                     onNew={status === 'active' ? () => setUploadOpen(true) : undefined} newLabel="Subir archivos"
                     controls={!folderId && <><CollectionGroup active={status === 'active'}
                                                               onClick={() => setStatus('active')}>Activos</CollectionGroup><CollectionGroup
                         active={status === 'archived'}
                         onClick={() => setStatus('archived')}>Archivados</CollectionGroup></>} search={<label
            className="flex h-9 items-center gap-2 rounded-md bg-surface-variant px-3 text-outline focus-within:outline-2 focus-within:outline-primary"><Search
            size={16}/><input type="search" value={query} onChange={event => setQuery(event.target.value)}
                              placeholder="Buscar archivos" aria-label="Buscar archivos"
                              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-on-background outline-none placeholder:text-outline"/></label>}/>
        {collectionMenu && createPortal(<>
            <button type="button" className="fixed inset-0 z-[89] cursor-default" aria-label="Cerrar menú"
                    onClick={() => setCollectionMenu(null)}/>
            <div role="menu" className="fixed z-[90] rounded-md bg-background p-1 shadow-xl" style={{
                left: Math.max(8, Math.min(collectionMenu.x, window.innerWidth - 190)),
                top: Math.max(8, Math.min(collectionMenu.y, window.innerHeight - 50))
            }}>
                <button type="button" role="menuitem" className="rounded-md px-3 py-2 text-sm hover:bg-surface-variant"
                        onClick={() => {
                            setCollectionMenu(null);
                            setFolderDialog({name: ''});
                        }}>Crear carpeta
                </button>
            </div>
        </>, document.body)}
        {collectionPending && <CollectionLoading view={viewMode} label="Cargando archivos"/>}
        {collectionError && <div role="alert"><p>No se pudieron cargar los archivos o sus carpetas.</p><Button
            onClick={() => {void resources.refetch(); void folders.refetch();}}>Reintentar</Button></div>}
        {!collectionPending && !collectionError && items.length === 0 && !hasVisibleFolders &&
            <div className="py-12 text-center text-sm text-outline"><FileIcon className="mx-auto mb-3" size={36}/>
                <p>{query ? 'No hay resultados.' : status === 'archived' ? 'No hay archivos archivados.' : folderId ? 'Esta carpeta está vacía.' : 'Aún no hay archivos.'}</p>{status === 'active' &&
                    <Button className="mt-3" onClick={() => setUploadOpen(true)}>Subir archivos</Button>}</div>}
        {!collectionPending && !collectionError && (hasVisibleFolders || items.length > 0) && <div
            className={viewMode === 'grid' ? 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,205px),1fr))] gap-3' : ''}>
            {visibleFolders.map(folder => <CollectionItem key={folder.id} view={viewMode} title={folder.name}
                                                          detail="Carpeta de archivos" icon={<Folder size={18}/>}
                                                          preview={<Folder size={44}/>}
                                                          onOpen={() => setFolder(folder.id)} onDragStart={event => {
                event.dataTransfer.setData('application/x-theke-library-folder', folder.id);
                event.dataTransfer.effectAllowed = 'move';
            }} onDragOver={event => event.preventDefault()} onDrop={event => {
                void dropIntoFolder(event, folder.id);
            }} actions={[{
                label: 'Abrir',
                onSelect: () => setFolder(folder.id)
            }, {
                label: 'Mover a…',
                onSelect: () => setMoving({
                    kind: 'folder',
                    id: folder.id,
                    name: folder.name,
                    parentFolderId: folder.parentFolderId
                })
            }, {
                label: 'Renombrar',
                onSelect: () => setFolderDialog({id: folder.id, name: folder.name})
            }, {label: 'Eliminar carpeta', destructive: true, onSelect: () => setDeletingFolder(folder)}]}/>)}
            {items.map(resource => <CollectionItem key={`${resource.id}:${resource.updatedAt}`} view={viewMode}
                                                   title={resource.title} detail={resource.mediaType ?? 'Archivo'}
                                                   date={new Date(resource.updatedAt).toLocaleDateString()}
                                                   icon={<ResourceIcon resource={resource} size={18}/>}
                                                   preview={viewMode === 'grid' ? <FileThumbnail resource={resource}
                                                                                                 fallback={<ResourceIcon
                                                                                                     resource={resource}
                                                                                                     size={40}/>}/> : undefined}
                                                   onOpen={() => navigate(resourceUrl(resource.id))}
                                                   onDragStart={status === 'active' ? event => {
                                                       event.dataTransfer.setData('application/x-theke-resource', resource.id);
                                                       event.dataTransfer.effectAllowed = 'move';
                                                   } : undefined} actions={[{
                label: 'Abrir',
                onSelect: () => navigate(resourceUrl(resource.id))
            }, ...(status === 'active' ? [{
                label: 'Mover a…',
                onSelect: () => setMoving({
                    kind: 'resource',
                    id: resource.id,
                    name: resource.title,
                    parentFolderId: resource.libraryFolderId ?? null
                })
            }, {
                label: 'Archivar',
                onSelect: () => setImpact({entityType: 'resource', id: resource.id, action: 'archive'})
            }] : []), {
                label: 'Eliminar',
                destructive: true,
                onSelect: () => setImpact({entityType: 'resource', id: resource.id, action: 'delete'})
            }]}/>)}
        </div>}
        {!collectionError && resources.hasNextPage &&
            <Button className="mt-5" loading={resources.isFetchingNextPage}
                    onClick={() => resources.fetchNextPage()}>{resources.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}</Button>}
        {resourceId &&
            <Dialog titleId="library-resource-title" onClose={closeResource} scrollable={detail.data?.type !== 'file'}
                    shadow={detail.data?.type !== 'file'}
                    className={detail.data?.type === 'file' ? 'flex h-[min(94dvh,900px)] max-w-[min(96vw,1600px)] flex-col' : 'max-w-5xl'}>
                {detail.data?.type !== 'file' && <div className="flex justify-end"><h2 id="library-resource-title"
                                                                                       className="sr-only">{detail.data?.title ?? 'Archivo'}</h2>
                    <Button onClick={closeResource}>Cerrar</Button></div>}
                {detail.isPending && <div className="mt-5"><InlineLoading label="Abriendo archivo…"/></div>}
                {detail.isError && <p role="alert" className="mt-5 text-red-600">No se pudo abrir el recurso.</p>}
                {detail.data?.type === 'note' && <NoteEditor
                    note={{...detail.data, currentVersion: {id: '', ordinal: 1, content: detail.data.content ?? ''}}}
                    busy={noteActions.update.isPending} onCancel={closeResource} onSave={async body => {
                    const saved = await noteActions.update.mutateAsync({id: detail.data!.id, body});
                    return saved.contentUnchanged;
                }}/>}
                {detail.data?.type === 'file' && <FileResource key={detail.data.id} resource={detail.data}
                                                               folderName={folderItems.find(folder => folder.id === detail.data?.libraryFolderId)?.name ?? null}
                                                               onClose={closeResource}/>}
                {detail.data?.type === 'link' && <LinkResource resource={detail.data}/>}
                {detail.data && detail.data.type !== 'file' &&
                    <ResourceLifecycle resource={detail.data} onArchived={closeResource}/>}
                {detail.data && detail.data.type !== 'file' &&
                    <ResourceKnowledgePanel key={detail.data.id} resource={detail.data}/>}
            </Dialog>}
        {status === 'active' && uploadOpen &&
            <Dialog titleId="library-upload-title" onClose={() => setUploadOpen(false)} className="max-w-lg">
                <div className="flex items-center justify-between"><h2 id="library-upload-title"
                                                                       className="text-lg font-semibold">Subir
                    archivos</h2><Button onClick={() => setUploadOpen(false)}>Cerrar</Button></div>
                <UploadTray folderId={folderId || null}/></Dialog>}
        {moving &&
            <MoveCollectionDialog name={moving.name} folders={folderItems} currentParentId={moving.parentFolderId}
                                  movingFolderId={moving.kind === 'folder' ? moving.id : undefined}
                                  onClose={() => setMoving(null)} onMove={async destination => {
                if (moving.kind === 'folder') await folderActions.moveFolder.mutateAsync({
                    id: moving.id,
                    parentFolderId: destination
                }); else await folderActions.move.mutateAsync({resourceIds: [moving.id], folderId: destination});
                toast.success('Elemento movido.');
            }}/>}
        {impact && <ImpactDialog request={impact} onClose={() => setImpact(null)} onDone={() => setImpact(null)}/>}
        {folderDialog &&
            <NameDialog title={folderDialog.id ? 'Renombrar carpeta' : 'Crear carpeta'} initialValue={folderDialog.name}
                        onClose={() => setFolderDialog(null)} onSave={async name => {
                if (folderDialog.id) await folderActions.rename.mutateAsync({
                    id: folderDialog.id,
                    name
                }); else await folderActions.create.mutateAsync({name, parentFolderId: folderId || null});
                toast.success(folderDialog.id ? 'Carpeta renombrada.' : 'Carpeta creada.');
            }}/>}
        {deletingFolder && <ConfirmDialog title={`Eliminar ${deletingFolder.name}`}
                                          description="Los archivos y las subcarpetas pasarán a la carpeta superior."
                                          onClose={() => setDeletingFolder(null)} onConfirm={async () => {
            await folderActions.remove.mutateAsync(deletingFolder.id);
            if (folderId === deletingFolder.id) setFolder(deletingFolder.parentFolderId ?? '');
            toast.success('Carpeta eliminada.');
        }}/>}
    </main>;
}

function ResourceIcon({resource, size}: { resource: ResourceSummary; size: number }) {
    if (resource.type === 'note') return <FileText size={size}/>;
    if (resource.type === 'link') return <LinkIcon size={size}/>;
    if (resource.mediaType?.startsWith('image/')) return <ImageIcon size={size}/>;
    if (resource.mediaType?.startsWith('audio/')) return <Music size={size}/>;
    if (resource.mediaType?.startsWith('video/')) return <Video size={size}/>;
    return <FileIcon size={size}/>;
}

function ResourceLifecycle({resource, onArchived}: { resource: ResourceDetail; onArchived: () => void }) {
    const [request, setRequest] = useState<ImpactRequest | null>(null);
    const actions = useImpactActions();
    return <section className="mt-5 flex items-center gap-2 rounded-lg bg-surface-variant/55 p-3"
                    aria-label="Ciclo de vida del recurso">{resource.status === 'archived' ? <><p
        className="flex-1 text-sm">Este Recurso está archivado. Sus usos existentes conservan la misma identidad.</p>
        <Button variant="primary" loading={actions.restoreResource.isPending}
                onClick={() => actions.restoreResource.mutate(resource.id)}>Restaurar</Button></> : <><p
        className="flex-1 text-sm">Estas acciones afectan al Recurso canónico en toda tu Cuenta.</p><Button
        variant="outline" onClick={() => setRequest({
        entityType: 'resource',
        id: resource.id,
        action: 'archive'
    })}>Archivar</Button><Button variant="outline" onClick={() => setRequest({
        entityType: 'resource',
        id: resource.id,
        action: 'delete'
    })}>Eliminar</Button></>}{request &&
        <ImpactDialog request={request} onClose={() => setRequest(null)} onDone={() => {
            setRequest(null);
            onArchived();
        }}/>}</section>;
}

function FileResource({resource, folderName, onClose}: {
    resource: ResourceDetail;
    folderName: string | null;
    onClose: () => void
}) {
    const previewable = resource.mediaType === 'application/pdf' || resource.mediaType?.startsWith('image/');
    const media = resource.mediaType?.startsWith('audio/') || resource.mediaType?.startsWith('video/');
    const preview = useResourceAccess(resource.id, Boolean(previewable));
    const actions = useResourceActions();
    const impactActions = useImpactActions();
    const toast = useToast();
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaLoading, setMediaLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [readyPreviewUrl, setReadyPreviewUrl] = useState('');
    const previewContentReady = Boolean(preview.data?.url && readyPreviewUrl === preview.data.url);
    const [previewError, setPreviewError] = useState('');
    const handlePdfReady = useCallback(() => setReadyPreviewUrl(preview.data?.url ?? ''), [preview.data?.url]);
    const handlePdfError = useCallback(() => setPreviewError('El PDF no pudo previsualizarse. El original sigue disponible.'), []);
    const [renaming, setRenaming] = useState(false);
    const [title, setTitle] = useState(resource.title);
    const [nameError, setNameError] = useState('');
    const [infoOpen, setInfoOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [impactRequest, setImpactRequest] = useState<ImpactRequest | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (!menuOpen) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                setMenuOpen(false);
                menuButtonRef.current?.focus();
            }
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown, true);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown, true);
        };
    }, [menuOpen]);
    const download = async () => {
        setDownloadLoading(true);
        try {
            const value = await actions.access(resource.id, 'download');
            window.open(value.url, '_blank', 'noopener,noreferrer');
        } catch {
            toast.error('No se pudo descargar el archivo.');
        } finally {
            setDownloadLoading(false);
        }
    };
    const loadMedia = async () => {
        setMediaLoading(true);
        try {
            setMediaUrl((await actions.access(resource.id, 'inline')).url);
        } catch {
            setPreviewError('No se pudo iniciar la reproducción. El original sigue disponible.');
        } finally {
            setMediaLoading(false);
        }
    };
    const rename = async (event: FormEvent) => {
        event.preventDefault();
        const value = title.trim();
        if (!value || value.length > 160 || value.includes('/') || value.includes('\\') || [...value].some(character => character.charCodeAt(0) < 32)) {
            setNameError('Usa un nombre de 1 a 160 caracteres, sin barras.');
            return;
        }
        if (value === resource.title) {
            setRenaming(false);
            return;
        }
        try {
            await actions.renameFile.mutateAsync({
                id: resource.id,
                title: value,
                expectedUpdatedAt: resource.updatedAt
            });
            setNameError('');
            setRenaming(false);
            toast.success('Archivo renombrado.');
        } catch (error) {
            setNameError(error instanceof Error ? error.message : 'No se pudo renombrar el archivo.');
        }
    };
    const size = resource.byteSize == null ? 'Desconocido' : resource.byteSize < 1024 ? `${resource.byteSize} B` : resource.byteSize < 1024 * 1024 ? `${(resource.byteSize / 1024).toFixed(1)} KiB` : `${(resource.byteSize / 1024 / 1024).toFixed(1)} MiB`;
    return <article className="flex h-full min-h-0 w-full flex-col">
        <header className="relative z-30 flex shrink-0 items-center gap-3 px-4 py-3 sm:px-5"><span
            className="shrink-0 text-outline"><ResourceIcon resource={resource} size={22}/></span>
            <div className="min-w-0 flex-1">{renaming ?
                <form className="flex min-w-0 flex-wrap items-center gap-2" onSubmit={event => void rename(event)}>
                    <input autoFocus aria-label="Nombre del archivo"
                           className="min-w-0 basis-full rounded-md bg-surface-variant px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary sm:flex-1 sm:basis-auto"
                           maxLength={160} value={title} onChange={event => {
                        setTitle(event.target.value);
                        setNameError('');
                    }}/><Button type="submit" loading={actions.renameFile.isPending}>Guardar</Button><Button
                    type="button" onClick={() => {
                    setRenaming(false);
                    setTitle(resource.title);
                    setNameError('');
                }}>Cancelar</Button></form> :
                <h2 id="library-resource-title" className="truncate text-base font-semibold"
                    title={resource.title}>{resource.title}</h2>}</div>
            {!renaming && <><Button size="icon" className="h-10 w-10" icon={Pencil} aria-label="Renombrar archivo"
                                    title="Renombrar archivo" onClick={() => {
                setMenuOpen(false);
                setTitle(resource.title);
                setRenaming(true);
            }}/>
                <div className="relative" ref={menuRef}><Button ref={menuButtonRef} size="icon" className="h-10 w-10"
                                                                icon={MoreHorizontal} aria-label="Opciones del archivo"
                                                                aria-haspopup="menu" aria-expanded={menuOpen}
                                                                onClick={() => setMenuOpen(value => !value)}/>{menuOpen &&
                    <div role="menu" aria-label="Opciones del archivo"
                         className="absolute right-0 top-full z-40 mt-1 min-w-40 rounded-lg bg-surface p-1 ring-1 ring-outline/10">
                        <button type="button" role="menuitem"
                                className="flex w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-variant focus-visible:bg-surface-variant focus-visible:outline-none disabled:opacity-50"
                                disabled={impactActions.restoreResource.isPending} onClick={() => {
                            setMenuOpen(false);
                            if (resource.status === 'archived') impactActions.restoreResource.mutate(resource.id); else setImpactRequest({
                                entityType: 'resource',
                                id: resource.id,
                                action: 'archive'
                            });
                        }}>{resource.status === 'archived' ? 'Restaurar' : 'Archivar'}</button>
                        <button type="button" role="menuitem"
                                className="flex w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-surface-variant focus-visible:bg-surface-variant focus-visible:outline-none"
                                onClick={() => {
                                    setMenuOpen(false);
                                    setImpactRequest({entityType: 'resource', id: resource.id, action: 'delete'});
                                }}>Eliminar
                        </button>
                    </div>}</div>
                <Button className="hidden sm:inline-flex" loading={downloadLoading} onClick={() => void download()}>Descargar</Button><Button
                    size="icon" className="h-10 w-10 sm:hidden" icon={Download} aria-label="Descargar original" loading={downloadLoading}
                    onClick={() => void download()}/></>}
            {!renaming &&
                <Button size="icon" className="h-10 w-10 lg:hidden" icon={Info} aria-label="Mostrar propiedades"
                        aria-expanded={infoOpen} onClick={() => setInfoOpen(value => !value)}/>}<Button size="icon"
                                                                                                        className="h-10 w-10 shrink-0"
                                                                                                        icon={X}
                                                                                                        aria-label="Cerrar"
                                                                                                        onClick={onClose}/>
        </header>
        {renaming && <h2 id="library-resource-title" className="sr-only">{resource.title}</h2>}
        {nameError && <p role="alert" className="shrink-0 px-5 pb-2 text-sm text-red-600">{nameError}</p>}
        <div className="relative flex min-h-0 flex-1">
            <section
                className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-auto bg-surface/70 p-3 sm:p-5"
                aria-label="Vista previa" aria-busy={Boolean(previewable && !preview.isError && (preview.isPending || (preview.data?.url && !previewContentReady && !previewError)))}>
                {preview.isPending && <InlineLoading label="Preparando vista previa…"/>}
                {preview.data?.url && previewable && !previewContentReady && !previewError &&
                    <InlineLoading label="Abriendo vista previa…"/>}
                {preview.isError &&
                    <p role="alert">No se pudo mostrar la vista previa. Puedes descargar el original.</p>}
                {preview.data?.url && resource.mediaType?.startsWith('image/') &&
                    <img className={`absolute inset-0 h-full w-full object-contain ${previewContentReady ? '' : 'opacity-0'}`} src={preview.data.url}
                         alt={resource.accessibilityText || resource.title}
                         onLoad={() => setReadyPreviewUrl(preview.data?.url ?? '')}
                         onError={() => setPreviewError('La imagen no pudo previsualizarse. El original sigue disponible.')}/>}
                {preview.data?.url && resource.mediaType === 'application/pdf' &&
                    <div className={`absolute inset-0 min-h-0 ${previewContentReady ? '' : 'opacity-0'}`}>
                        <PdfDocumentViewer url={preview.data.url} title={resource.title}
                                           onReady={handlePdfReady} onError={handlePdfError}/>
                    </div>}
                {media && !mediaUrl && <Button loading={mediaLoading} onClick={() => void loadMedia()}>Cargar reproductor</Button>}
                {mediaUrl && resource.mediaType?.startsWith('audio/') &&
                    <audio className="w-full max-w-xl" controls preload="none" src={mediaUrl}>Tu navegador no puede
                        reproducir este audio.</audio>}
                {mediaUrl && resource.mediaType?.startsWith('video/') &&
                    <video className="h-full w-full object-contain" controls preload="none" src={mediaUrl}>Tu navegador
                        no puede reproducir este video.</video>}
                {!previewable && !media &&
                    <div className="max-w-sm text-center text-sm text-outline"><FileIcon className="mx-auto mb-3"
                                                                                         size={40}/><p>No hay vista
                        previa para este formato. Puedes descargar el original.</p></div>}
                {previewError && <p role="alert"
                                    className="absolute bottom-3 left-3 rounded-md bg-background/95 px-3 py-2 text-sm text-red-600">{previewError}</p>}
            </section>
            {infoOpen && <button type="button" className="absolute inset-0 z-10 bg-black/20 lg:hidden"
                                 aria-label="Cerrar propiedades" onClick={() => setInfoOpen(false)}/>}
            <aside aria-label="Propiedades del archivo"
                   className={`${infoOpen ? 'absolute inset-y-0 right-0 z-20 block w-[min(22rem,100%)]' : 'hidden'} min-h-0 overflow-y-auto bg-background p-5 lg:relative lg:block lg:w-[min(22rem,32%)] lg:shrink-0`}>
                <div className="mb-5 flex items-center justify-between"><h3 className="font-semibold">Propiedades</h3>
                    <Button size="icon" className="h-9 w-9 lg:hidden" icon={X} aria-label="Cerrar propiedades"
                            onClick={() => setInfoOpen(false)}/></div>
                <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-3 text-sm">
                    <dt className="text-outline">Tipo</dt>
                    <dd className="break-words">{resource.mediaType ?? 'Archivo'}</dd>
                    <dt className="text-outline">Tamaño</dt>
                    <dd>{size}</dd>
                    <dt className="text-outline">Ubicación</dt>
                    <dd className="break-words">{folderName ?? 'Biblioteca'}</dd>
                    <dt className="text-outline">Origen</dt>
                    <dd className="break-words">{resource.origin}</dd>
                    <dt className="text-outline">Modificado</dt>
                    <dd>{new Date(resource.updatedAt).toLocaleString()}</dd>
                    <dt className="text-outline">Estado</dt>
                    <dd>{resource.status === 'archived' ? 'Archivado' : 'Activo'}</dd>
                </dl>
                {resource.description &&
                    <section className="mt-6"><h4 className="text-sm font-medium">Descripción</h4><p
                        className="mt-1 whitespace-pre-wrap break-words text-sm">{resource.description}</p></section>}
                <ResourceKnowledgePanel key={resource.id} resource={resource} compact/>
            </aside>
        </div>
        {impactRequest && <ImpactDialog request={impactRequest} onClose={() => setImpactRequest(null)} onDone={() => {
            setImpactRequest(null);
            onClose();
        }}/>}
    </article>;
}

function LinkResource({resource}: { resource: ResourceDetail }) {
    const actions = useLinkActions();
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(resource.title);
    const [description, setDescription] = useState(resource.description ?? '');
    const toast = useToast();
    const save = async (event: FormEvent) => {
        event.preventDefault();
        try {
            await actions.update.mutateAsync({id: resource.id, title, description});
            setEditing(false);
            toast.success('Enlace actualizado.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'No se pudo guardar.');
        }
    };
    return <article className="mx-auto mt-5 max-w-3xl">
        <div className="flex items-start gap-3"><LinkIcon size={36}/>
            <div className="min-w-0 flex-1"><h1 className="text-2xl font-semibold">{resource.title}</h1><a
                className="block truncate text-sm text-blue-600 underline" href={resource.url ?? '#'} target="_blank"
                rel="noopener noreferrer">{resource.url}</a></div>
            <Button variant="outline" onClick={() => setEditing(value => !value)}>Editar</Button></div>
        {resource.previewImageUrl && <img className="mt-5 max-h-72 rounded-md" src={resource.previewImageUrl} alt=""/>}
        <p className="mt-4">{resource.description || 'Sin descripción.'}</p>{resource.metadataStatus === 'pending' &&
        <p role="status" className="mt-3 text-sm text-outline">Obteniendo
            metadatos…</p>}{resource.metadataStatus === 'failed' &&
        <div role="alert" className="mt-3"><p>No se pudieron obtener los metadatos. El enlace sigue guardado.</p><Button
            className="mt-2" variant="outline" loading={actions.retry.isPending} onClick={async () => {
            try {
                await actions.retry.mutateAsync({id: resource.id});
                toast.info('Reintento iniciado.');
            } catch {
                toast.error('No se pudo reintentar.');
            }
        }}>Reintentar metadatos</Button></div>}{editing &&
        <form className="mt-6 rounded-lg bg-surface-variant/55 p-4" onSubmit={save}><label
            className="block text-sm font-medium">Título<input
            className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
            maxLength={160} value={title} onChange={event => setTitle(event.target.value)}/></label><label
            className="mt-4 block text-sm font-medium">Descripción<textarea
            className="mt-1 min-h-28 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
            maxLength={1000} value={description} onChange={event => setDescription(event.target.value)}/></label><Button
            className="mt-3" type="submit" variant="primary" loading={actions.update.isPending}>Guardar
            cambios</Button></form>}</article>;
}

function NoteEditor({note, busy, onCancel, onSave}: {
    note?: Note;
    busy: boolean;
    onCancel: () => void;
    onSave: (input: NoteInput) => Promise<boolean | undefined>
}) {
    const [title, setTitle] = useState(note?.title ?? '');
    const [description, setDescription] = useState(note?.description ?? '');
    const [content, setContent] = useState(note?.currentVersion.content ?? '');
    const [message, setMessage] = useState('');
    const toast = useToast();
    const [linkQuery, setLinkQuery] = useState('');
    const editor = useRef<HTMLTextAreaElement>(null);
    const matching = useResources({query: linkQuery.trim() || undefined}, Boolean(linkQuery.trim()));
    const insertLink = (id: string, label: string) => {
        const position = editor.current?.selectionStart ?? content.length;
        const link = `[[resource:${id}|${label}]]`;
        setContent(current => current.slice(0, position) + link + current.slice(position));
        setLinkQuery('');
        requestAnimationFrame(() => {
            editor.current?.focus();
            editor.current?.setSelectionRange(position + link.length, position + link.length);
        });
    };
    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!title.trim()) {
            setMessage('El título es obligatorio.');
            return;
        }
        setMessage('');
        try {
            const unchanged = await onSave({title, description, content});
            toast.success(unchanged ? 'El contenido ya estaba actualizado.' : 'Nota guardada.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'No se pudo guardar. Puedes reintentar.');
        }
    };
    return <form className="mx-auto mt-4 max-w-3xl" onSubmit={submit}><label className="block text-sm font-medium">Título<input
        className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary text-xl"
        value={title} maxLength={160} onChange={event => setTitle(event.target.value)}/></label><label
        className="mt-4 block text-sm font-medium">Descripción<input
        className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
        value={description} onChange={event => setDescription(event.target.value)}/></label><label
        className="mt-4 block text-sm font-medium">Contenido<textarea ref={editor}
                                                                      className="mt-1 min-h-80 w-full rounded-md border-0 bg-surface-variant p-3 focus-visible:outline-2 focus-visible:outline-primary"
                                                                      value={content}
                                                                      onChange={event => setContent(event.target.value)}/></label>
        <div className="mt-2 rounded-lg bg-surface-variant/55 p-3 text-sm"><label className="block">Insertar enlace a un
            recurso<input
                className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
                value={linkQuery} onChange={event => setLinkQuery(event.target.value)}
                placeholder="Busca un título o alias"/></label><p className="mt-1 text-xs text-outline">También puedes
            escribir [[Título]] o [[Título#sección|texto]]. Los enlaces insertados desde el buscador mantienen la
            identidad aunque cambie el título.</p>{matching.isError &&
            <p role="alert">No se pudo buscar recursos.</p>}{linkQuery.trim() &&
            <ul className="mt-2 max-h-36 overflow-auto">{matching.data?.pages.flatMap(page => page.data).filter(item => item.id !== note?.id).map(item =>
                <li key={item.id}><Button type="button"
                                          onClick={() => insertLink(item.id, item.title)}>Insertar {item.title}</Button>
                </li>)}</ul>}</div>
        {message && <p role="status" className="mt-3 text-sm">{message}</p>}
        <div className="mt-5 flex gap-2"><Button type="button" onClick={onCancel}>Cancelar</Button><Button type="submit"
                                                                                                           variant="primary"
                                                                                                           loading={busy}>{busy ? 'Guardando…' : 'Guardar'}</Button>
        </div>
    </form>;
}
