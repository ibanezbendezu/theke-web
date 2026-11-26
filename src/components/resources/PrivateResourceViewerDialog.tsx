import {useState} from 'react';
import {useResource, useResourceAccess, useResourceActions} from '../../data/useResources';
import {ResourceViewerDialog} from './ResourceViewerDialog';

export function PrivateResourceViewerDialog({resourceId, onClose}: {resourceId: string; onClose: () => void}) {
    const resource = useResource(resourceId);
    const access = useResourceAccess(resourceId, resource.data?.type === 'file');
    const actions = useResourceActions();
    const [downloadError, setDownloadError] = useState('');
    const [attempt, setAttempt] = useState(0);
    return <div onClick={event => event.stopPropagation()}>
        <ResourceViewerDialog key={`${resourceId}:${access.data?.url ?? ''}:${attempt}`} resource={resource.data} url={access.data?.url}
            onDownload={resource.data?.type === 'file' ? () => {
                void actions.access(resourceId, 'download').then(value => window.open(value.url, '_blank', 'noopener,noreferrer'))
                    .catch(() => setDownloadError('No se pudo descargar el archivo. Inténtalo de nuevo.'));
            } : undefined}
            loading={resource.isPending || (resource.data?.type === 'file' && access.isPending)}
            error={resource.isError || access.isError ? 'No se pudo abrir el recurso. Inténtalo de nuevo.' : downloadError}
            onRetry={() => {
                setDownloadError('');
                setAttempt(value => value + 1);
                void resource.refetch();
                if (resource.data?.type === 'file') void access.refetch();
            }} onClose={onClose}/>
    </div>;
}
