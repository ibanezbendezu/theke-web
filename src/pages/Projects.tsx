import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Folder, Network } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CollectionItem } from '../components/ui/CollectionItem';
import { Dialog } from '../components/ui/Dialog';
import { ConfirmDialog, NameDialog } from '../components/ui/NameDialog';
import { Input } from '../components/ui/Input';
import { MoveCollectionDialog } from '../components/ui/MoveCollectionDialog';
import { ImpactDialog, type ImpactRequest } from '../components/ui/ImpactDialog';
import { CollectionGroup, ViewToolbar } from '../components/ui/ViewToolbar';
import { useToast } from '../components/ui/useToast';
import { useCollectionView } from '../components/ui/useCollectionView';
import { type Project, useProjectActions, useProjects } from '../data/useProjects';
import { type ProjectFolder, useProjectFolderActions, useProjectFolders } from '../data/useProjectFolders';

const MAX_NAME_LENGTH = 120;

export function Projects() {
  const [viewMode, setViewMode] = useCollectionView('projects', 'list');
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [editing, setEditing] = useState<Project | 'new' | null>(() => new URLSearchParams(window.location.search).has('create') ? 'new' : null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [impactRequest, setImpactRequest] = useState<ImpactRequest | null>(null);
  const [folderDialog, setFolderDialog] = useState<ProjectFolder | 'new' | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<ProjectFolder | null>(null);
  const [collectionMenu, setCollectionMenu] = useState<{ x: number; y: number } | null>(null);
  const [moving, setMoving] = useState<{ kind: 'folder' | 'project'; id: string; name: string; parentFolderId: string | null } | null>(null);
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const folderId = new URLSearchParams(location.search).get('folder') ?? '';
  const setFolder = (value: string) => navigate(value ? `/projects?folder=${value}` : '/projects', { replace: true });
  const query = useProjects(status, status === 'archived' ? undefined : folderId || 'root');
  const folders = useProjectFolders();
  const folderActions = useProjectFolderActions();
  const actions = useProjectActions();
  const items = query.data?.pages.flatMap(page => page.data) ?? [];
  const folderItems = folders.data ?? [];
  const visibleFolders = status === 'active' ? folderItems.filter(folder => folder.parentFolderId === (folderId || null)) : [];
  const hasVisibleFolders = visibleFolders.length > 0;
  const dropIntoFolder = async (event: React.DragEvent<HTMLElement>, destination: string | null) => {
    event.preventDefault();
    const folder = event.dataTransfer.getData('application/x-theke-project-folder');
    const project = event.dataTransfer.getData('application/x-theke-project');
    try {
      if (folder) await folderActions.moveFolder.mutateAsync({ id: folder, parentFolderId: destination });
      else if (project) await folderActions.move.mutateAsync({ projectIds: [project], folderId: destination });
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : 'No se pudo mover.'); }
  };

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  const edit = (project: Project | 'new') => { setEditing(project); setName(project === 'new' ? '' : project.name); setError(''); };
  const close = () => { setEditing(null); setError(''); if (new URLSearchParams(location.search).has('create')) navigate('/projects', { replace: true }); };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    const value = name.trim();
    if (!value || value.length > MAX_NAME_LENGTH) { setError(`Usa entre 1 y ${MAX_NAME_LENGTH} caracteres.`); return; }
    try {
      if (editing === 'new') {
        const created = await actions.create.mutateAsync({ name: value, ...(folderId ? { collectionFolderId: folderId } : {}) });
        setEditing(null);
        navigate(`/projects/${created.id}`, { replace: true });
      } else if (editing) {
        await actions.rename.mutateAsync({ id: editing.id, name: value });
        close();
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo guardar.'); }
  };

  return <section className="min-h-[calc(100dvh-46px)] w-full px-4 pb-20 pt-7 md:px-8" aria-label="Proyectos" aria-keyshortcuts="Shift+F10" tabIndex={0} onKeyDown={event => { if (status !== 'active' || (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return; event.preventDefault(); const rect = (event.target as HTMLElement).getBoundingClientRect(); setCollectionMenu({ x: rect.left + 8, y: Math.min(rect.bottom + 4, window.innerHeight - 60) }); }} onContextMenu={event => { if (status === 'active' && !event.defaultPrevented && !(event.target instanceof Element && event.target.closest('button, input, textarea, a'))) { event.preventDefault(); setCollectionMenu({ x: event.clientX, y: event.clientY }); } }}>
    <ViewToolbar viewMode={viewMode} setViewMode={setViewMode} onNew={status === 'active' ? () => edit('new') : undefined} newLabel="Crear mapa" controls={!folderId && <><CollectionGroup active={status === 'active'} onClick={() => setStatus('active')}>Activos</CollectionGroup><CollectionGroup active={status === 'archived'} onClick={() => setStatus('archived')}>Archivados</CollectionGroup></>} />
    {collectionMenu && createPortal(<><button type="button" className="fixed inset-0 z-[89] cursor-default" aria-label="Cerrar menÃº" onClick={() => setCollectionMenu(null)}/><div role="menu" className="fixed z-[90] rounded-md bg-background p-1 shadow-xl" style={{ left: Math.min(collectionMenu.x, window.innerWidth - 190), top: Math.min(collectionMenu.y, window.innerHeight - 50) }}><button type="button" role="menuitem" className="rounded-md px-3 py-2 text-sm hover:bg-surface-variant" onClick={() => { setCollectionMenu(null); setFolderDialog('new'); }}>Crear carpeta</button></div></>, document.body)}
    {query.isPending && <p role="status" className="text-outline">Cargando proyectosâ€¦</p>}
    {query.isError && <div role="alert"><p className="text-red-600">No se pudieron cargar los proyectos.</p><Button variant="outline" onClick={() => query.refetch()}>Reintentar</Button></div>}
    {!query.isPending && !query.isError && items.length === 0 && !hasVisibleFolders && <div className="py-14 text-center"><Network className="mx-auto text-outline" size={36}/><h2 className="mt-3 font-medium">{status === 'active' ? folderId ? 'Esta carpeta está vacía' : 'Aún no tienes mapas en la raíz' : 'No hay mapas archivados'}</h2><p className="mt-1 text-sm text-outline">{status === 'active' ? 'Crea un mapa para organizar tu trabajo.' : 'Los mapas que archives aparecerán aquí.'}</p>{status === 'active' && <Button className="mt-4" onClick={() => edit('new')}>Crear mapa</Button>}</div>}
    {(hasVisibleFolders || items.length > 0) && <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}>
      {visibleFolders.map(folder => <CollectionItem key={folder.id} view={viewMode} title={folder.name} detail="Carpeta de mapas" icon={<Folder size={18}/>} preview={<Folder size={44}/>} onOpen={() => setFolder(folder.id)} onDragStart={event => { event.dataTransfer.setData('application/x-theke-project-folder', folder.id); event.dataTransfer.effectAllowed = 'move'; }} onDragOver={event => event.preventDefault()} onDrop={event => { void dropIntoFolder(event, folder.id); }} actions={[{ label: 'Abrir', onSelect: () => setFolder(folder.id) }, { label: 'Mover a…', onSelect: () => setMoving({ kind: 'folder', id: folder.id, name: folder.name, parentFolderId: folder.parentFolderId }) }, { label: 'Renombrar', onSelect: () => setFolderDialog(folder) }, { label: 'Eliminar carpeta', destructive: true, onSelect: () => setDeletingFolder(folder) }]} />)}
      {items.map(project => <CollectionItem key={project.id} view={viewMode} title={project.name} detail="Mapa" date={new Date(project.updatedAt).toLocaleDateString()} icon={<Network size={18}/>} preview={<Network size={42}/>} onOpen={() => navigate(`/projects/${project.id}`)} onDragStart={status === 'active' ? event => { event.dataTransfer.setData('application/x-theke-project', project.id); event.dataTransfer.effectAllowed = 'move'; } : undefined} actions={status === 'active' ? [{ label: 'Abrir', onSelect: () => navigate(`/projects/${project.id}`) }, { label: 'Mover a…', onSelect: () => setMoving({ kind: 'project', id: project.id, name: project.name, parentFolderId: project.collectionFolderId ?? null }) }, { label: 'Renombrar', onSelect: () => edit(project) }, { label: 'Archivar', onSelect: () => setImpactRequest({ entityType: 'project', id: project.id, action: 'archive' }) }, { label: 'Eliminar', destructive: true, onSelect: () => setImpactRequest({ entityType: 'project', id: project.id, action: 'delete' }) }] : [{ label: 'Restaurar', onSelect: () => actions.restore.mutate(project.id) }]} />)}
    </div>}
    {query.hasNextPage && <Button className="mt-5" variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? 'Cargandoâ€¦' : 'Cargar mÃ¡s'}</Button>}
    {moving && <MoveCollectionDialog name={moving.name} folders={folderItems} currentParentId={moving.parentFolderId} movingFolderId={moving.kind === 'folder' ? moving.id : undefined} onClose={() => setMoving(null)} onMove={async destination => { if (moving.kind === 'folder') await folderActions.moveFolder.mutateAsync({ id: moving.id, parentFolderId: destination }); else await folderActions.move.mutateAsync({ projectIds: [moving.id], folderId: destination }); toast.success('Elemento movido.'); }} />}
    {editing && <Editor name={name} setName={setName} error={error} busy={actions.create.isPending || actions.rename.isPending} inputRef={inputRef} save={save} close={close}/>}
    {impactRequest && <ImpactDialog request={impactRequest} onClose={() => setImpactRequest(null)} onDone={() => setImpactRequest(null)}/>}
    {folderDialog && <NameDialog title={folderDialog === 'new' ? 'Crear carpeta' : 'Renombrar carpeta'} initialValue={folderDialog === 'new' ? '' : folderDialog.name} onClose={() => setFolderDialog(null)} onSave={async value => { if (folderDialog === 'new') await folderActions.create.mutateAsync({ name: value, parentFolderId: folderId || null }); else await folderActions.rename.mutateAsync({ id: folderDialog.id, name: value }); }} />}
    {deletingFolder && <ConfirmDialog title={`Eliminar ${deletingFolder.name}`} description="Los mapas y las subcarpetas pasarán a la carpeta superior." onClose={() => setDeletingFolder(null)} onConfirm={async () => { await folderActions.remove.mutateAsync(deletingFolder.id); if (folderId === deletingFolder.id) setFolder(deletingFolder.parentFolderId ?? ''); }} />}
  </section>;
}

function Editor({ name, setName, error, busy, inputRef, save, close }: { name: string; setName: (value: string) => void; error: string; busy: boolean; inputRef: React.RefObject<HTMLInputElement | null>; save: (event: FormEvent) => void; close: () => void }) {
  return <Dialog titleId="project-editor-title" onClose={close} className="max-w-md"><h2 id="project-editor-title" className="text-lg font-semibold">Nombre del mapa</h2><form className="mt-4" onSubmit={save}><Input ref={inputRef} icon={undefined} value={name} maxLength={MAX_NAME_LENGTH + 1} aria-invalid={Boolean(error)} aria-describedby={error ? 'project-name-error' : undefined} onChange={event => setName(event.target.value)}/>{error && <p id="project-name-error" role="alert" className="mt-2 text-sm text-red-600">{error}</p>}<div className="mt-5 flex justify-end gap-2"><Button type="button" onClick={close}>Cancelar</Button><Button type="submit" variant="primary" disabled={busy}>{busy ? 'Guardandoâ€¦' : 'Guardar'}</Button></div></form></Dialog>;
}
