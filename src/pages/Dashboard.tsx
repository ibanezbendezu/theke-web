import { useState } from 'react';
import { Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CollectionGroup, ViewToolbar } from '../components/ui/ViewToolbar';
import { useCollectionView } from '../components/ui/useCollectionView';
import { useProjects } from '../data/useProjects';

export function Dashboard() {
  const navigate = useNavigate();
  const projects = useProjects('active');
  const [viewMode, setViewMode] = useCollectionView('home', 'list');
  const [group, setGroup] = useState<'projects' | 'recent'>('projects');
  const all = projects.data?.pages.flatMap(page => page.data) ?? [];
  const items = group === 'recent' ? [...all].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5) : all;

  return <section className="w-full px-4 pb-20 pt-7 md:px-8" aria-label="Inicio">
    <ViewToolbar
      viewMode={viewMode}
      setViewMode={setViewMode}
      groups={<><CollectionGroup active={group === 'projects'} onClick={() => setGroup('projects')}>Proyectos</CollectionGroup><CollectionGroup active={group === 'recent'} onClick={() => setGroup('recent')}>Recientes</CollectionGroup></>}
      onNew={() => navigate('/projects?create=1')}
      newLabel="Crear proyecto"
    />
    {projects.isPending && <p role="status" className="text-sm text-outline">Cargando proyectos…</p>}
    {projects.isError && <div role="alert" className="text-sm"><p>No se pudieron cargar los proyectos.</p><Button className="mt-2" onClick={() => projects.refetch()}>Reintentar</Button></div>}
    {!projects.isPending && !projects.isError && items.length === 0 && <div className="py-14 text-sm text-outline"><p>Aún no tienes proyectos.</p><Button className="mt-2" onClick={() => navigate('/projects?create=1')}>Crear proyecto</Button></div>}
    {items.length > 0 && (viewMode === 'grid' ?
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{items.map(project => <Card key={project.id} title={project.name} subtitle={`Editado ${new Date(project.updatedAt).toLocaleDateString()}`} icon={<Folder size={17} />} onClick={() => navigate(`/projects/${project.id}`)} />)}</div>
      : <div className="w-full overflow-x-auto"><table className="w-full min-w-[520px] border-collapse text-left text-sm"><thead><tr className="border-b border-border text-xs font-normal text-outline"><th className="px-3 py-2 font-medium">Nombre</th><th className="px-3 py-2 font-medium">Última actividad</th></tr></thead><tbody>{items.map(project => <tr key={project.id} className="border-b border-border/50 hover:bg-surface-variant"><td className="p-0"><button className="flex w-full items-center gap-2 px-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-primary" onClick={() => navigate(`/projects/${project.id}`)}><Folder size={17} className="text-outline" />{project.name}</button></td><td className="px-3 py-3 text-outline">{new Date(project.updatedAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>
    )}
    {group === 'projects' && projects.hasNextPage && <Button className="mt-5" disabled={projects.isFetchingNextPage} onClick={() => projects.fetchNextPage()}>{projects.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}</Button>}
  </section>;
}
