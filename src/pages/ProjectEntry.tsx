import {Navigate, useParams} from 'react-router-dom';
import {Button} from '../components/ui/Button';
import {useDiagrams} from '../data/useDiagrams';
import {useProject} from '../data/useProjects';

export function ProjectEntry() {
    const {projectId} = useParams();
    const project = useProject(projectId);
    const active = useDiagrams(projectId, 'active');
    const archived = useDiagrams(projectId, 'archived');

    if (project.isPending || active.isPending || archived.isPending) return <main className="px-4 py-7 md:px-8"
                                                                                  role="status">Abriendo mapa…</main>;
    if (project.isError || active.isError || archived.isError) return <main className="px-4 py-7 md:px-8" role="alert">
        <p>No se pudo abrir el mapa.</p><Button className="mt-3" onClick={() => {
        void project.refetch();
        void active.refetch();
        void archived.refetch();
    }}>Reintentar</Button></main>;
    const diagram = active.data?.[0] ?? archived.data?.[0];
    if (!diagram) return <main className="px-4 py-7 md:px-8" role="alert">Este mapa no tiene un diagrama
        disponible.</main>;
    return <Navigate to={`/projects/${projectId}/diagrams/${diagram.id}`} replace/>;
}
