import { useState } from 'react';
import { Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CollectionItem } from '../components/ui/CollectionItem';
import { ImpactDialog, type ImpactRequest } from '../components/ui/ImpactDialog';
import { NameDialog } from '../components/ui/NameDialog';
import { Button } from '../components/ui/Button';
import { CollectionGroup, ViewToolbar } from '../components/ui/ViewToolbar';
import { useCollectionView } from '../components/ui/useCollectionView';
import { type Project, useProjectActions, useProjects } from '../data/useProjects';

export function Dashboard() {
  const navigate = useNavigate();
  const projects = useProjects('active');
  const [viewMode, setViewMode] = useCollectionView('home', 'list');
  const [group, setGroup] = useState<'projects' | 'recent'>('projects');
  const [impact, setImpact] = useState<ImpactRequest | null>(null);
  const [renaming, setRenaming] = useState<Project | null>(null);
  const actions = useProjectActions();
  const all = projects.data?.pages.flatMap(page => page.data) ?? [];
  const items = group === 'recent' ? [...all].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5) : all;

  return <section className="w-full px-4 pb-20 pt-7 md:px-8" aria-label="Inicio">
    <ViewToolbar
      viewMode={viewMode}
      setViewMode={setViewMode}
      groups={<><CollectionGroup active={group === 'projects'} onClick={() => setGroup('projects')}>Proyectos</CollectionGroup><CollectionGroup active={group === 'recent'} onClick={() => setGroup('recent')}>Recientes</CollectionGroup></>}
      onNew={() => navigate('/projects?create=1')}
      newLabel="Crear mapa"
    />
    {projects.isPending && <p role="status" className="text-sm text-outline">Cargando proyectosÃ¢â‚¬Â¦</p>}
    {projects.isError && <div role="alert" className="text-sm"><p>No se pudieron cargar los proyectos.</p><Button className="mt-2" onClick={() => projects.refetch()}>Reintentar</Button></div>}
    {!projects.isPending && !projects.isError && items.length === 0 && <div className="py-14 text-sm text-outline"><p>AÃƒÂºn no tienes mapas.</p><Button className="mt-2" onClick={() => navigate('/projects?create=1')}>Crear mapa</Button></div>}
    {items.length > 0 && <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : ''}>{items.map(project => <CollectionItem key={project.id} view={viewMode} title={project.name} detail="Mapa" date={new Date(project.updatedAt).toLocaleDateString()} icon={<Network size={18} />} preview={<Network size={42} />} onOpen={() => navigate(`/projects/${project.id}`)} actions={[{ label: 'Abrir', onSelect: () => navigate(`/projects/${project.id}`) }, { label: 'Renombrar', onSelect: () => setRenaming(project) }, { label: 'Archivar', onSelect: () => setImpact({ entityType: 'project', id: project.id, action: 'archive' }) }, { label: 'Eliminar', destructive: true, onSelect: () => setImpact({ entityType: 'project', id: project.id, action: 'delete' }) }]} />)}</div>}
    {group === 'projects' && projects.hasNextPage && <Button className="mt-5" disabled={projects.isFetchingNextPage} onClick={() => projects.fetchNextPage()}>{projects.isFetchingNextPage ? 'CargandoÃ¢â‚¬Â¦' : 'Cargar mÃƒÂ¡s'}</Button>}
    {impact && <ImpactDialog request={impact} onClose={() => setImpact(null)} onDone={() => setImpact(null)} />}
    {renaming && <NameDialog title="Renombrar mapa" initialValue={renaming.name} onClose={() => setRenaming(null)} onSave={name => actions.rename.mutateAsync({ id: renaming.id, name }).then(() => undefined)} />}
  </section>;
}
