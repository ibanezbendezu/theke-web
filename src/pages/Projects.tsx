import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { FileText, Folder, MoreHorizontal, Network } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Button } from '../components/ui/Button';
import { CollectionItem } from '../components/ui/CollectionItem';
import { Dialog } from '../components/ui/Dialog';
import { ConfirmDialog, NameDialog } from '../components/ui/NameDialog';
import { Input } from '../components/ui/Input';
import { ImpactDialog, type ImpactRequest } from '../components/ui/ImpactDialog';
import { CollectionGroup, ViewToolbar } from '../components/ui/ViewToolbar';
import { useCollectionView } from '../components/ui/useCollectionView';
import { type Project, useProject, useProjectActions, useProjects } from '../data/useProjects';
import { type ProjectFolder, useProjectFolderActions, useProjectFolders } from '../data/useProjectFolders';
import { useOrganization, useOrganizationActions } from '../data/useOrganization';
import { useNotes } from '../data/useNotes';
import { useDiagramActions, useDiagrams } from '../data/useDiagrams';

const MAX_NAME_LENGTH = 120;

export function Projects() {
  const [viewMode, setViewMode] = useCollectionView('projects', 'list');
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [editing, setEditing] = useState<Project | 'new' | null>(() => new URLSearchParams(window.location.search).has('create') ? 'new' : null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [impactRequest, setImpactRequest] = useState<ImpactRequest | null>(null);
  const [collectionFolderDialog, setCollectionFolderDialog] = useState<ProjectFolder | 'new' | null>(null);
  const [deletingCollectionFolder, setDeletingCollectionFolder] = useState<ProjectFolder | null>(null);
  const [collectionMenu, setCollectionMenu] = useState<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.pathname.match(/^\/projects\/([^/]+)$/)?.[1];
  const folderId = new URLSearchParams(location.search).get('folder') ?? '';
  const setFolder = (value: string) => navigate(value ? `/projects?folder=${value}` : '/projects', { replace: true });
  const detail = useProject(projectId);
  const query = useProjects(status, folderId || 'root');
  const folders = useProjectFolders(); const folderActions = useProjectFolderActions();
  const actions = useProjectActions();
  const items = query.data?.pages.flatMap(page => page.data) ?? [];

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  const edit = (project: Project | 'new') => { setEditing(project); setName(project === 'new' ? '' : project.name); setError(''); };
  const close = () => { setEditing(null); setError(''); if (new URLSearchParams(location.search).has('create')) navigate('/projects', { replace: true }); };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    const value = name.trim();
    if (!value || value.length > MAX_NAME_LENGTH) { setError(`Usa entre 1 y ${MAX_NAME_LENGTH} caracteres.`); return; }
    try {
      if (editing === 'new') await actions.create.mutateAsync({ name: value, ...(folderId ? { collectionFolderId: folderId } : {}) });
      else if (editing) await actions.rename.mutateAsync({ id: editing.id, name: value });
      close();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo guardar.'); }
  };

  if (projectId) return <section className="w-full px-4 py-7 md:px-8">
    {detail.isPending && <p role="status" className="mt-5 text-outline">Cargando proyecto…</p>}
    {detail.isError && <div role="alert" className="mt-5"><p className="text-red-600">No se pudo abrir el proyecto.</p><Button variant="outline" onClick={() => detail.refetch()}>Reintentar</Button></div>}
    {detail.data && <><h1 className="mt-5 text-2xl font-semibold">{detail.data.name}</h1><div className="mt-3 flex gap-2"><Button variant="outline" onClick={() => edit(detail.data)}>Renombrar</Button><Button variant="outline" onClick={() => setImpactRequest({ entityType: 'project', id: detail.data.id, action: 'archive' })}>Archivar</Button><Button variant="outline" onClick={() => setImpactRequest({ entityType: 'project', id: detail.data.id, action: 'delete' })}>Eliminar</Button></div><ProjectWorkspace projectId={detail.data.id} openImpact={setImpactRequest} /></>}
    {editing && <Editor name={name} setName={setName} error={error} busy={actions.rename.isPending} inputRef={inputRef} save={save} close={close} />}
    {impactRequest && (
      <ImpactDialog request={impactRequest} onClose={() => setImpactRequest(null)} onDone={() => { const projectChanged = impactRequest.entityType === 'project'; setImpactRequest(null); if (projectChanged) navigate('/projects'); }}/>
    )}
  </section>;

  return <section className="w-full px-4 pb-20 pt-7 md:px-8" aria-label="Proyectos" onContextMenu={event => { if (!event.defaultPrevented) { event.preventDefault(); setCollectionMenu({ x: event.clientX, y: event.clientY }); } }}>
    <ViewToolbar viewMode={viewMode} setViewMode={setViewMode} onNew={() => edit('new')} newLabel="Crear proyecto" groups={<><CollectionGroup active={status === 'active'} onClick={() => setStatus('active')}>Activos</CollectionGroup><CollectionGroup active={status === 'archived'} onClick={() => setStatus('archived')}>Archivados</CollectionGroup><button type="button" className="grid h-9 w-9 place-items-center rounded-md text-outline hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary" aria-label="Opciones de proyectos" onClick={event => { const rect = event.currentTarget.getBoundingClientRect(); setCollectionMenu({ x: rect.left, y: rect.bottom + 4 }); }}><MoreHorizontal size={18}/></button></>} />
    {collectionMenu && createPortal(<><button type="button" className="fixed inset-0 z-[89] cursor-default" aria-label="Cerrar menú" onClick={() => setCollectionMenu(null)}/><div role="menu" className="fixed z-[90] rounded-md bg-background p-1 shadow-xl" style={{ left: Math.min(collectionMenu.x, window.innerWidth - 190), top: Math.min(collectionMenu.y, window.innerHeight - 50) }}><button type="button" role="menuitem" className="rounded-md px-3 py-2 text-sm hover:bg-surface-variant" onClick={() => { setCollectionMenu(null); setCollectionFolderDialog('new'); }}>Crear carpeta</button></div></>, document.body)}
    {folderId && <Button className="mb-4" onClick={() => setFolder('')}>← Todas las carpetas</Button>}
    {status === 'active' && folders.data && folders.data.length > 0 && <div className={viewMode === 'grid' ? 'mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'mb-6'}>{folders.data.map(folder => <CollectionItem key={folder.id} view={viewMode} title={folder.name} detail="Carpeta" icon={<Folder size={18}/>} preview={<Folder size={44}/>} onOpen={() => setFolder(folder.id)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData('application/x-theke-project'); if (id) folderActions.move.mutate({ projectIds: [id], folderId: folder.id }); }} actions={[{ label: 'Abrir', onSelect: () => setFolder(folder.id) }, { label: 'Renombrar', onSelect: () => setCollectionFolderDialog(folder) }, { label: 'Eliminar carpeta', destructive: true, onSelect: () => setDeletingCollectionFolder(folder) }]} />)}</div>}
    {query.isPending && <p role="status" className="text-outline">Cargando proyectos…</p>}
    {query.isError && <div role="alert"><p className="text-red-600">No se pudieron cargar los proyectos.</p><Button variant="outline" onClick={() => query.refetch()}>Reintentar</Button></div>}
    {!query.isPending && !query.isError && items.length === 0 && <div className="py-14 text-center">
      <Folder className="mx-auto text-outline" size={36} /><h2 className="mt-3 font-medium">{status === 'active' ? folderId ? 'Esta carpeta está vacía' : 'Aún no tienes proyectos en la raíz' : 'No hay proyectos archivados'}</h2>
      <p className="mt-1 text-sm text-outline">{status === 'active' ? 'Crea un proyecto para organizar tu trabajo.' : 'Los proyectos que archives aparecerán aquí.'}</p>
      {status === 'active' && <Button className="mt-4" onClick={() => edit('new')}>Crear proyecto</Button>}
    </div>}
    {items.length > 0 && <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}>{items.map(project => <CollectionItem key={project.id} view={viewMode} title={project.name} detail="Proyecto" date={new Date(project.updatedAt).toLocaleDateString()} icon={<Folder size={18} />} preview={<Folder size={42} />} onOpen={() => navigate(`/projects/${project.id}`)} onDragStart={status === 'active' ? event => { event.dataTransfer.setData('application/x-theke-project', project.id); event.dataTransfer.effectAllowed = 'move'; } : undefined} actions={status === 'active' ? [{ label: 'Abrir', onSelect: () => navigate(`/projects/${project.id}`) }, { label: 'Renombrar', onSelect: () => edit(project) }, ...((folders.data ?? []).map(folder => ({ label: `Mover a ${folder.name}`, onSelect: () => folderActions.move.mutate({ projectIds: [project.id], folderId: folder.id }) }))), ...(project.collectionFolderId ? [{ label: 'Mover fuera de carpeta', onSelect: () => folderActions.move.mutate({ projectIds: [project.id], folderId: null }) }] : []), { label: 'Archivar', onSelect: () => setImpactRequest({ entityType: 'project', id: project.id, action: 'archive' }) }, { label: 'Eliminar', destructive: true, onSelect: () => setImpactRequest({ entityType: 'project', id: project.id, action: 'delete' }) }] : [{ label: 'Restaurar', onSelect: () => actions.restore.mutate(project.id) }]} />)}</div>}
    {folderId && <div className="mt-4 rounded-md bg-surface-variant/45 p-3 text-xs text-outline" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData('application/x-theke-project'); if (id) folderActions.move.mutate({ projectIds: [id], folderId: null }); }}>Suelta aquí para mover a la raíz</div>}
    {query.hasNextPage && <Button className="mt-5" variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}</Button>}
    {editing && <Editor name={name} setName={setName} error={error} busy={actions.create.isPending || actions.rename.isPending} inputRef={inputRef} save={save} close={close} />}
    {impactRequest && <ImpactDialog request={impactRequest} onClose={() => setImpactRequest(null)} onDone={() => setImpactRequest(null)} />}
    {collectionFolderDialog && <NameDialog title={collectionFolderDialog === 'new' ? 'Crear carpeta' : 'Renombrar carpeta'} initialValue={collectionFolderDialog === 'new' ? '' : collectionFolderDialog.name} onClose={() => setCollectionFolderDialog(null)} onSave={async value => { if (collectionFolderDialog === 'new') await folderActions.create.mutateAsync(value); else await folderActions.rename.mutateAsync({ id: collectionFolderDialog.id, name: value }); }} />}
    {deletingCollectionFolder && <ConfirmDialog title={`Eliminar ${deletingCollectionFolder.name}`} description="Los proyectos quedarán en la raíz de Proyectos." onClose={() => setDeletingCollectionFolder(null)} onConfirm={async () => { await folderActions.remove.mutateAsync(deletingCollectionFolder.id); if (folderId === deletingCollectionFolder.id) setFolder(''); }} />}
  </section>;
}

function Editor({ name, setName, error, busy, inputRef, save, close }: { name: string; setName: (value: string) => void; error: string; busy: boolean; inputRef: React.RefObject<HTMLInputElement | null>; save: (event: FormEvent) => void; close: () => void }) {
  return <Dialog titleId="project-editor-title" onClose={close} className="max-w-md"><h2 id="project-editor-title" className="text-lg font-semibold">Nombre del proyecto</h2><form className="mt-4" onSubmit={save}><Input ref={inputRef} icon={undefined} value={name} maxLength={MAX_NAME_LENGTH + 1} aria-invalid={Boolean(error)} aria-describedby={error ? 'project-name-error' : undefined} onChange={event => setName(event.target.value)} />{error && <p id="project-name-error" role="alert" className="mt-2 text-sm text-red-600">{error}</p>}<div className="mt-5 flex justify-end gap-2"><Button type="button" onClick={close}>Cancelar</Button><Button type="submit" variant="primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</Button></div></form></Dialog>;
}

function ProjectWorkspace({ projectId, openImpact }: { projectId: string; openImpact: (request: ImpactRequest) => void }) {
  const organization = useOrganization(projectId); const actions = useOrganizationActions(projectId); const library = useNotes(); const navigate = useNavigate();
  const [showLibrary, setShowLibrary] = useState(false); const [diagramName, setDiagramName] = useState(''); const [diagramStatus, setDiagramStatus] = useState<'active' | 'archived'>('active');
  const [diagramView, setDiagramView] = useCollectionView('project-diagrams', 'list');
  const [resourceView, setResourceView] = useCollectionView('project-resources', 'list');
  const [folderMenu, setFolderMenu] = useState<{ x: number; y: number } | null>(null);
  const [folderEditorOpen, setFolderEditorOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [renamingItem, setRenamingItem] = useState<{ kind: 'diagram' | 'folder'; id: string; name: string } | null>(null);
  useEffect(() => { if (!folderMenu) return; const close = (event: PointerEvent) => { const target = event.target as HTMLElement; if (!target.closest('[role="menu"], [aria-label="Opciones de carpetas"]')) setFolderMenu(null); }; const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setFolderMenu(null); }; document.addEventListener('pointerdown', close); document.addEventListener('keydown', escape); return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); }; }, [folderMenu]);
  const diagramNameInput = useRef<HTMLInputElement>(null);
  const diagramQuery = useDiagrams(projectId, diagramStatus); const diagramActions = useDiagramActions(projectId);
  if (organization.isPending) return <p role="status" className="mt-6">Cargando organización…</p>;
  if (organization.isError || !organization.data) return <p role="alert" className="mt-6 text-red-600">No se pudo cargar la organización.</p>;
  const activeFolders = organization.data.folders.filter(folder => !folder.archivedAt); const archivedFolders = organization.data.folders.filter(folder => folder.archivedAt); const available = (library.data?.pages.flatMap(page => page.data) ?? []).filter(note => !organization.data.resources.some(item => item.resourceId === note.id)); const visibleResources = organization.data.resources.filter(resource => resource.folderId === selectedFolder);
  return <div className="mt-8">
    <section aria-labelledby="diagrams-title"><h2 id="diagrams-title" className="mb-3 text-sm font-semibold text-outline">Diagramas</h2><ViewToolbar viewMode={diagramView} setViewMode={setDiagramView} onNew={() => { setDiagramStatus('active'); requestAnimationFrame(() => diagramNameInput.current?.focus()); }} newLabel="Crear diagrama" groups={<><CollectionGroup active={diagramStatus === 'active'} onClick={() => setDiagramStatus('active')}>Activos</CollectionGroup><CollectionGroup active={diagramStatus === 'archived'} onClick={() => setDiagramStatus('archived')}>Archivados</CollectionGroup></>} />
      {diagramStatus === 'active' && <form className="mt-4 flex gap-2" onSubmit={async event => { event.preventDefault(); if (!diagramName.trim()) return; const created = await diagramActions.create.mutateAsync(diagramName.trim()); setDiagramName(''); navigate(`/projects/${projectId}/diagrams/${created.id}`); }}><Input ref={diagramNameInput} aria-label="Nombre del diagrama" value={diagramName} maxLength={120} onChange={event => setDiagramName(event.target.value)} /><Button type="submit" variant="secondary" disabled={!diagramName.trim() || diagramActions.create.isPending}>Crear diagrama</Button></form>}
      {diagramQuery.isPending && <p role="status" className="mt-4 text-sm">Cargando diagramas…</p>}
      {diagramQuery.isError && <p role="alert" className="mt-4 text-sm text-red-600">No se pudieron cargar los diagramas.</p>}
      {!diagramQuery.isPending && !diagramQuery.isError && diagramQuery.data?.length === 0 && <div className="py-10 text-center"><Network className="mx-auto text-outline"/><h3 className="mt-2 font-medium">{diagramStatus === 'active' ? 'Aún no hay diagramas' : 'No hay diagramas archivados'}</h3><p className="mt-1 text-sm text-outline">Crea un lienzo para organizar visualmente el contenido de este proyecto.</p></div>}
      <div className={diagramView === 'grid' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}>{diagramQuery.data?.map(diagram => <CollectionItem key={diagram.id} view={diagramView} title={diagram.name} detail="Diagrama" icon={<Network size={18}/>} preview={<Network size={44}/>} onOpen={() => navigate(`/projects/${projectId}/diagrams/${diagram.id}`)} actions={diagramStatus === 'active' ? [{ label: 'Abrir', onSelect: () => navigate(`/projects/${projectId}/diagrams/${diagram.id}`) }, { label: 'Renombrar', onSelect: () => setRenamingItem({ kind: 'diagram', id: diagram.id, name: diagram.name }) }, { label: 'Duplicar', onSelect: () => diagramActions.duplicate.mutate(diagram.id) }, { label: 'Archivar', onSelect: () => openImpact({ entityType: 'diagram', id: diagram.id, action: 'archive' }) }, { label: 'Eliminar', destructive: true, onSelect: () => openImpact({ entityType: 'diagram', id: diagram.id, action: 'delete' }) }] : [{ label: 'Restaurar', onSelect: () => diagramActions.restore.mutate(diagram.id) }]} />)}</div>
    </section>
    <div className="mt-8"><Button variant="secondary" onClick={() => setShowLibrary(value => !value)}>Añadir desde Biblioteca</Button></div>
    {showLibrary && <section className="mt-4 rounded-lg bg-surface-variant/55 p-3" aria-label="Selector de Biblioteca">{available.length === 0 ? <p className="text-sm text-outline">No hay recursos disponibles.</p> : available.map(note => <div key={note.id} className="flex items-center justify-between py-2"><span>{note.title}</span><Button onClick={() => actions.addResources.mutate([note.id])}>Añadir</Button></div>)}</section>}
    <section className="mt-7" aria-label="Carpetas del proyecto" onContextMenu={event => { if (!event.defaultPrevented) { event.preventDefault(); setFolderMenu({ x: event.clientX, y: event.clientY }); } }}><div className="flex items-center gap-1"><h2 className="font-semibold">Carpetas</h2><button type="button" className="grid h-8 w-8 place-items-center rounded-md text-outline hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary" aria-label="Opciones de carpetas" aria-expanded={Boolean(folderMenu)} onClick={event => { const rect = event.currentTarget.getBoundingClientRect(); setFolderMenu(folderMenu ? null : { x: rect.left, y: rect.bottom + 4 }); }}><MoreHorizontal size={18}/></button>{folderMenu && createPortal(<div role="menu" className="fixed z-[90] rounded-md bg-background p-1 shadow-xl" style={{ left: folderMenu.x, top: folderMenu.y }}><button role="menuitem" className="rounded-md px-3 py-1.5 text-sm hover:bg-background" onClick={() => { setFolderMenu(null); setFolderEditorOpen(true); }}>Crear carpeta</button></div>, document.body)}</div>{activeFolders.length === 0 && <p className="text-sm text-outline">Los recursos están en la raíz.</p>}<div className={resourceView === 'grid' ? 'mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'mt-3'}>{activeFolders.map(folder => <CollectionItem key={folder.id} view={resourceView} title={folder.name} detail="Carpeta" icon={<Folder size={18}/>} preview={<Folder size={44}/>} onOpen={() => setSelectedFolder(folder.id)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData('application/x-theke-resource'); if (id) actions.moveResources.mutate({ resourceIds: [id], folderId: folder.id }); }} actions={[{ label: 'Renombrar', onSelect: () => setRenamingItem({ kind: 'folder', id: folder.id, name: folder.name }) }, { label: 'Archivar', onSelect: () => openImpact({ entityType: 'folder', id: folder.id, action: 'archive' }) }]} />)}</div></section>
    <section className="mt-7" aria-label="Recursos del proyecto"><h2 className="mb-3 font-semibold">Recursos{selectedFolder ? ` / ${activeFolders.find(folder => folder.id === selectedFolder)?.name ?? "Carpeta"}` : ""}</h2>{selectedFolder && <Button onClick={() => setSelectedFolder(null)}>← Raíz</Button>}<ViewToolbar viewMode={resourceView} setViewMode={setResourceView}/>{visibleResources.length === 0 ? <p className="text-sm text-outline">Todavía no añadiste recursos.</p> : <div className={resourceView === 'grid' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}>{visibleResources.map(resource => <CollectionItem key={resource.id} view={resourceView} title={resource.title} detail={resource.type} icon={<FileText size={18}/>} preview={<FileText size={44}/>} onOpen={() => navigate(`/library/${resource.resourceId}`)} onDragStart={event => { event.dataTransfer.setData('application/x-theke-resource', resource.resourceId); event.dataTransfer.effectAllowed = 'move'; }} actions={[{ label: 'Abrir en Biblioteca', onSelect: () => navigate(`/library/${resource.resourceId}`) }, ...activeFolders.map(folder => ({ label: `Mover a ${folder.name}`, onSelect: () => actions.moveResources.mutate({ resourceIds: [resource.resourceId], folderId: folder.id }) })), { label: 'Mover a la raíz', onSelect: () => actions.moveResources.mutate({ resourceIds: [resource.resourceId], folderId: null }) }]} />)}</div>}<div className="mt-3 rounded-md bg-surface-variant/45 p-3 text-xs text-outline" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData('application/x-theke-resource'); if (id) actions.moveResources.mutate({ resourceIds: [id], folderId: null }); }}>Suelta aquí para mover a la raíz</div></section>
    {archivedFolders.length > 0 && <><h2 className="mt-7 font-semibold">Carpetas archivadas</h2>{archivedFolders.map(folder => <div key={folder.id} className="mt-2 flex items-center gap-2"><span className="flex-1">{folder.name}</span><Button onClick={() => actions.restoreFolder.mutate(folder.id)}>Restaurar</Button></div>)}</>}
    {folderEditorOpen && <NameDialog title="Crear carpeta" onClose={() => setFolderEditorOpen(false)} onSave={name => actions.createFolder.mutateAsync(name).then(() => undefined)} />}
    {renamingItem && <NameDialog title={renamingItem.kind === 'diagram' ? 'Renombrar diagrama' : 'Renombrar carpeta'} initialValue={renamingItem.name} onClose={() => setRenamingItem(null)} onSave={async name => { if (renamingItem.kind === 'diagram') await diagramActions.rename.mutateAsync({ id: renamingItem.id, name }); else await actions.renameFolder.mutateAsync({ id: renamingItem.id, name }); }} />}
  </div>;
}
