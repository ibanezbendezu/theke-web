import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Archive, Copy, FileText, Folder, MoreHorizontal, Network, RotateCcw, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ImpactDialog, type ImpactRequest } from '../components/ui/ImpactDialog';
import { CollectionGroup, ViewToolbar } from '../components/ui/ViewToolbar';
import { useCollectionView } from '../components/ui/useCollectionView';
import { type Project, useProject, useProjectActions, useProjects } from '../data/useProjects';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.pathname.match(/^\/projects\/([^/]+)$/)?.[1];
  const detail = useProject(projectId);
  const query = useProjects(status);
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
      if (editing === 'new') await actions.create.mutateAsync(value);
      else if (editing) await actions.rename.mutateAsync({ id: editing.id, name: value });
      close();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo guardar.'); }
  };

  if (projectId) return <section className="w-full px-4 py-7 md:px-8">
    <Button onClick={() => navigate('/projects')}>← Proyectos</Button>
    {detail.isPending && <p role="status" className="mt-5 text-outline">Cargando proyecto…</p>}
    {detail.isError && <div role="alert" className="mt-5"><p className="text-red-600">No se pudo abrir el proyecto.</p><Button variant="outline" onClick={() => detail.refetch()}>Reintentar</Button></div>}
    {detail.data && <><h1 className="mt-5 text-2xl font-semibold">{detail.data.name}</h1><div className="mt-3 flex gap-2"><Button variant="outline" onClick={() => edit(detail.data)}>Renombrar</Button><Button variant="outline" onClick={() => setImpactRequest({ entityType: 'project', id: detail.data.id, action: 'archive' })}>Archivar</Button><Button variant="outline" onClick={() => setImpactRequest({ entityType: 'project', id: detail.data.id, action: 'delete' })}>Eliminar</Button></div><ProjectWorkspace projectId={detail.data.id} openImpact={setImpactRequest} /></>}
    {editing && <Editor name={name} setName={setName} error={error} busy={actions.rename.isPending} inputRef={inputRef} save={save} close={close} />}
    {impactRequest && (
      <ImpactDialog request={impactRequest} onClose={() => setImpactRequest(null)} onDone={() => { const projectChanged = impactRequest.entityType === 'project'; setImpactRequest(null); if (projectChanged) navigate('/projects'); }}/>
    )}
  </section>;

  return <section className="w-full px-4 pb-20 pt-7 md:px-8" aria-label="Proyectos">
    <ViewToolbar viewMode={viewMode} setViewMode={setViewMode} onNew={() => edit('new')} newLabel="Crear proyecto" groups={<><CollectionGroup active={status === 'active'} onClick={() => setStatus('active')}>Activos</CollectionGroup><CollectionGroup active={status === 'archived'} onClick={() => setStatus('archived')}>Archivados</CollectionGroup></>} />
    {query.isPending && <p role="status" className="text-outline">Cargando proyectos…</p>}
    {query.isError && <div role="alert"><p className="text-red-600">No se pudieron cargar los proyectos.</p><Button variant="outline" onClick={() => query.refetch()}>Reintentar</Button></div>}
    {!query.isPending && !query.isError && items.length === 0 && <div className="py-14 text-center">
      <Folder className="mx-auto text-outline" size={36} /><h2 className="mt-3 font-medium">{status === 'active' ? 'Aún no tienes proyectos' : 'No hay proyectos archivados'}</h2>
      <p className="mt-1 text-sm text-outline">{status === 'active' ? 'Un proyecto reúne el trabajo de un tema en un solo lugar.' : 'Los proyectos que archives aparecerán aquí.'}</p>
      {status === 'active' && <Button className="mt-4" onClick={() => edit('new')}>Crear primer proyecto</Button>}
    </div>}
    {items.length > 0 && (viewMode === 'grid' ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(project => <div key={project.id}><Card title={project.name} subtitle={new Date(project.updatedAt).toLocaleDateString()} icon={<Folder size={17} />} onClick={() => navigate(`/projects/${project.id}`)} /><Actions project={project} status={status} rename={() => edit(project)} archive={() => setImpactRequest({ entityType: 'project', id: project.id, action: 'archive' })} remove={() => setImpactRequest({ entityType: 'project', id: project.id, action: 'delete' })} restore={() => actions.restore.mutate(project.id)} /></div>)}
    </div> : <div className="divide-y divide-border border-y border-border">
      {items.map(project => <div key={project.id} className="flex items-center gap-3 py-2"><button className="flex flex-1 items-center gap-2 text-left hover:underline focus-visible:outline-2" onClick={() => navigate(`/projects/${project.id}`)}><Folder size={18} />{project.name}</button><Actions project={project} status={status} rename={() => edit(project)} archive={() => setImpactRequest({ entityType: 'project', id: project.id, action: 'archive' })} remove={() => setImpactRequest({ entityType: 'project', id: project.id, action: 'delete' })} restore={() => actions.restore.mutate(project.id)} /></div>)}
    </div>)}
    {query.hasNextPage && <Button className="mt-5" variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}</Button>}
    {editing && <Editor name={name} setName={setName} error={error} busy={actions.create.isPending || actions.rename.isPending} inputRef={inputRef} save={save} close={close} />}
    {impactRequest && <ImpactDialog request={impactRequest} onClose={() => setImpactRequest(null)} onDone={() => setImpactRequest(null)} />}
  </section>;
}

function Actions({ project, status, rename, archive, remove, restore }: { project: Project; status: 'active' | 'archived'; rename: () => void; archive: () => void; remove: () => void; restore: () => void }) {
  return <div className="flex justify-end gap-1 mt-1"><Button size="icon" title={`Renombrar ${project.name}`} aria-label={`Renombrar ${project.name}`} icon={MoreHorizontal} onClick={rename} />{status === 'active' ? <><Button size="icon" title={`Archivar ${project.name}`} aria-label={`Archivar ${project.name}`} icon={Archive} onClick={archive} /><Button size="icon" title={`Eliminar ${project.name}`} aria-label={`Eliminar ${project.name}`} icon={Trash2} onClick={remove} /></> : <Button size="icon" title={`Restaurar ${project.name}`} aria-label={`Restaurar ${project.name}`} icon={RotateCcw} onClick={restore} />}</div>;
}

function Editor({ name, setName, error, busy, inputRef, save, close }: { name: string; setName: (value: string) => void; error: string; busy: boolean; inputRef: React.RefObject<HTMLInputElement | null>; save: (event: FormEvent) => void; close: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}><div role="dialog" aria-modal="true" aria-labelledby="project-editor-title" className="w-full max-w-md rounded-lg border border-border bg-background p-5 shadow-xl"><h2 id="project-editor-title" className="text-lg font-semibold">Nombre del proyecto</h2><form className="mt-4" onSubmit={save}><Input ref={inputRef} icon={undefined} value={name} maxLength={MAX_NAME_LENGTH + 1} aria-invalid={Boolean(error)} aria-describedby={error ? 'project-name-error' : undefined} onChange={event => setName(event.target.value)} />{error && <p id="project-name-error" role="alert" className="mt-2 text-sm text-red-600">{error}</p>}<div className="mt-5 flex justify-end gap-2"><Button type="button" onClick={close}>Cancelar</Button><Button type="submit" variant="primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</Button></div></form></div></div>;
}

function ProjectWorkspace({ projectId, openImpact }: { projectId: string; openImpact: (request: ImpactRequest) => void }) {
  const organization = useOrganization(projectId); const actions = useOrganizationActions(projectId); const library = useNotes(); const navigate = useNavigate();
  const [folderName, setFolderName] = useState(''); const [showLibrary, setShowLibrary] = useState(false); const [diagramName, setDiagramName] = useState(''); const [diagramStatus, setDiagramStatus] = useState<'active' | 'archived'>('active');
  const [diagramView, setDiagramView] = useCollectionView('project-diagrams', 'list');
  const diagramNameInput = useRef<HTMLInputElement>(null);
  const diagramQuery = useDiagrams(projectId, diagramStatus); const diagramActions = useDiagramActions(projectId);
  if (organization.isPending) return <p role="status" className="mt-6">Cargando organización…</p>;
  if (organization.isError || !organization.data) return <p role="alert" className="mt-6 text-red-600">No se pudo cargar la organización.</p>;
  const activeFolders = organization.data.folders.filter(folder => !folder.archivedAt); const archivedFolders = organization.data.folders.filter(folder => folder.archivedAt); const available = (library.data?.pages.flatMap(page => page.data) ?? []).filter(note => !organization.data.resources.some(item => item.resourceId === note.id));
  return <div className="mt-8">
    <section aria-labelledby="diagrams-title"><h2 id="diagrams-title" className="mb-3 text-sm font-semibold text-outline">Diagramas</h2><ViewToolbar viewMode={diagramView} setViewMode={setDiagramView} onNew={() => { setDiagramStatus('active'); requestAnimationFrame(() => diagramNameInput.current?.focus()); }} newLabel="Crear diagrama" groups={<><CollectionGroup active={diagramStatus === 'active'} onClick={() => setDiagramStatus('active')}>Activos</CollectionGroup><CollectionGroup active={diagramStatus === 'archived'} onClick={() => setDiagramStatus('archived')}>Archivados</CollectionGroup></>} />
      {diagramStatus === 'active' && <form className="mt-4 flex gap-2" onSubmit={async event => { event.preventDefault(); if (!diagramName.trim()) return; const created = await diagramActions.create.mutateAsync(diagramName.trim()); setDiagramName(''); navigate(`/projects/${projectId}/diagrams/${created.id}`); }}><Input ref={diagramNameInput} aria-label="Nombre del diagrama" value={diagramName} maxLength={120} onChange={event => setDiagramName(event.target.value)} /><Button type="submit" variant="secondary" disabled={!diagramName.trim() || diagramActions.create.isPending}>Crear diagrama</Button></form>}
      {diagramQuery.isPending && <p role="status" className="mt-4 text-sm">Cargando diagramas…</p>}
      {diagramQuery.isError && <p role="alert" className="mt-4 text-sm text-red-600">No se pudieron cargar los diagramas.</p>}
      {!diagramQuery.isPending && !diagramQuery.isError && diagramQuery.data?.length === 0 && <div className="py-10 text-center"><Network className="mx-auto text-outline"/><h3 className="mt-2 font-medium">{diagramStatus === 'active' ? 'Aún no hay diagramas' : 'No hay diagramas archivados'}</h3><p className="mt-1 text-sm text-outline">Crea un lienzo para organizar visualmente el contenido de este proyecto.</p></div>}
      <div className={diagramView === 'grid' ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3' : 'divide-y divide-border border-y border-border'}>{diagramQuery.data?.map(diagram => <div key={diagram.id} className={diagramView === 'grid' ? 'flex min-w-0 flex-col gap-2 rounded-lg bg-surface-variant/55 p-3' : 'flex min-w-0 flex-wrap items-center gap-2 py-2'}><button className="flex min-w-0 flex-1 items-center gap-2 text-left hover:underline focus-visible:outline-2 focus-visible:outline-primary" onClick={() => navigate(`/projects/${projectId}/diagrams/${diagram.id}`)}><Network size={18}/><span className="truncate">{diagram.name}</span></button><div className="flex shrink-0 items-center">{diagramStatus === 'active' ? <><Button onClick={() => { const name = window.prompt('Nuevo nombre', diagram.name); if (name?.trim()) diagramActions.rename.mutate({ id: diagram.id, name }); }}>Renombrar</Button><Button size="icon" title={`Duplicar ${diagram.name}`} aria-label={`Duplicar ${diagram.name}`} icon={Copy} onClick={() => diagramActions.duplicate.mutate(diagram.id)}/><Button size="icon" title={`Archivar ${diagram.name}`} aria-label={`Archivar ${diagram.name}`} icon={Archive} onClick={() => openImpact({ entityType: 'diagram', id: diagram.id, action: 'archive' })}/><Button size="icon" title={`Eliminar ${diagram.name}`} aria-label={`Eliminar ${diagram.name}`} icon={Trash2} onClick={() => openImpact({ entityType: 'diagram', id: diagram.id, action: 'delete' })}/></> : <Button onClick={() => diagramActions.restore.mutate(diagram.id)}>Restaurar</Button>}</div></div>)}</div>
    </section>
    <div className="mt-8 flex flex-wrap gap-2"><div className="w-48"><Input aria-label="Nombre de carpeta" icon={undefined} value={folderName} onChange={event => setFolderName(event.target.value)} /></div><Button variant="secondary" onClick={async () => { if (folderName.trim()) { await actions.createFolder.mutateAsync(folderName); setFolderName(''); } }}>Crear carpeta</Button><Button variant="secondary" onClick={() => setShowLibrary(value => !value)}>Añadir desde Biblioteca</Button></div>
    {showLibrary && <section className="mt-4 rounded-lg bg-surface-variant/55 p-3" aria-label="Selector de Biblioteca">{available.length === 0 ? <p className="text-sm text-outline">No hay recursos disponibles.</p> : available.map(note => <div key={note.id} className="flex items-center justify-between py-2"><span>{note.title}</span><Button onClick={() => actions.addResources.mutate([note.id])}>Añadir</Button></div>)}</section>}
    <h2 className="mt-7 font-semibold">Carpetas</h2>{activeFolders.length === 0 && <p className="text-sm text-outline">Los recursos están en la raíz.</p>}{activeFolders.map(folder => <div key={folder.id} className="mt-2 flex items-center gap-2"><Folder size={18}/><span className="flex-1">{folder.name}</span><Button onClick={() => { const value = window.prompt('Nuevo nombre', folder.name); if (value) actions.renameFolder.mutate({ id: folder.id, name: value }); }}>Renombrar</Button><Button onClick={() => openImpact({ entityType: 'folder', id: folder.id, action: 'archive' })}>Archivar</Button></div>)}
    <h2 className="mt-7 font-semibold">Recursos</h2>{organization.data.resources.length === 0 ? <p className="text-sm text-outline">Todavía no añadiste recursos.</p> : organization.data.resources.map(resource => <div key={resource.id} className="mt-2 flex items-center gap-3 border-b border-border py-2"><FileText size={18}/><span className="flex-1">{resource.title}{resource.archivedAt && <small className="ml-2 text-outline">Archivado</small>}</span><label className="text-sm">Ubicación <select className="ml-2 rounded-md border-0 bg-surface-variant p-1 focus-visible:outline-2 focus-visible:outline-primary" value={resource.folderId ?? ''} onChange={event => actions.moveResources.mutate({ resourceIds: [resource.resourceId], folderId: event.target.value || null })}><option value="">Raíz</option>{activeFolders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></label></div>)}
    {archivedFolders.length > 0 && <><h2 className="mt-7 font-semibold">Carpetas archivadas</h2>{archivedFolders.map(folder => <div key={folder.id} className="mt-2 flex items-center gap-2"><span className="flex-1">{folder.name}</span><Button onClick={() => actions.restoreFolder.mutate(folder.id)}>Restaurar</Button></div>)}</>}
  </div>;
}
