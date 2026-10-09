import {type Node, type NodeProps} from '@xyflow/react';
import {LoaderCircle, Maximize2, Minimize2} from 'lucide-react';
import {ResourceConnectionHandles} from '../../../components/ui/ResourceConnectionHandles';
import {useResource, useResourceAccess} from '../../../data/useResources';
import {useCanvasStore} from '../../../store/useCanvasStore';
import {ResourceCard} from '../ResourceCard';
import {resourceCardSize, type ResourceDisplayMode} from '../resourceCardSizing';

export type ResourceNodeType = Node<{
    resourceId: string;
    caption?: string;
    accent?: 'default' | 'primary' | 'muted';
    displayMode?: ResourceDisplayMode
    uploadStatus?: string;
    uploadProgress?: number;
    pendingTitle?: string;
    pendingMediaType?: string;
    uploadError?: string;
}, 'resource'>;

export function ResourceNode({id, data, selected}: NodeProps<ResourceNodeType>) {
    const resource = useResource(data.resourceId);
    const mode = data.displayMode === 'normal' ? 'normal' : 'mini';
    const pending = Boolean(data.uploadStatus);
    const audio = resource.data?.mediaType?.startsWith('audio/');
    const access = useResourceAccess(data.resourceId, !pending && mode === 'normal' && Boolean(audio));
    const openCanvasNode = useCanvasStore(state => state.openCanvasNode);
    const setMode = useCanvasStore(state => state.setResourceDisplayMode);
    const cardResource = resource.data ?? (pending ? {id: data.resourceId, title: data.pendingTitle ?? 'Archivo nuevo',
        type: 'file' as const, mediaType: data.pendingMediaType ?? null} : undefined);
    const visibleResource = pending && cardResource ? {...cardResource, mediaType: null, previewImageUrl: null} : cardResource;
    const analyzing = data.uploadStatus === 'scanning' || data.uploadStatus === 'uploaded' || data.uploadStatus === 'finalizing';
    const uploadLabel = data.uploadStatus === 'failed' ? 'Carga fallida' : analyzing ? 'Analizando' : 'Subiendo';
    return <div className="group/resource relative" style={{...resourceCardSize[mode], pointerEvents: pending ? 'none' : undefined}}>
        <ResourceCard resource={visibleResource} mode={mode} caption={data.caption} accent={data.accent}
                      selected={selected} onOpen={() => openCanvasNode(id)}
                      directUrl={audio ? access.data?.url : undefined}/>
        {pending && <div role="status" aria-label={`${uploadLabel}: ${data.pendingTitle ?? cardResource?.title ?? 'archivo'}`}
                           className="absolute inset-x-1 bottom-1 z-10 flex items-center gap-2 rounded-md bg-surface/95 px-2 py-1 text-[10px] text-on-background ring-1 ring-outline/15 backdrop-blur">
            {data.uploadStatus === 'failed' ? <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden="true"/> : analyzing
                ? <LoaderCircle size={12} className="shrink-0 motion-safe:animate-spin text-primary" aria-hidden="true"/>
                : <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true"/>}
            <span className="min-w-0 flex-1 truncate" data-tooltip={data.uploadError}>{uploadLabel}</span>
            {typeof data.uploadProgress === 'number' && <span>{Math.round(data.uploadProgress)}%</span>}
        </div>}
        {selected && <button type="button" className="nodrag nopan absolute -right-2 -top-2 z-20 grid h-7 w-7 place-items-center rounded-md bg-surface text-on-background ring-1 ring-border hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary"
                             aria-label={mode === 'normal' ? 'Mostrar recurso en tamaño mini' : 'Mostrar recurso en tamaño normal'}
                             title={mode === 'normal' ? 'Tamaño mini' : 'Tamaño normal'}
                             onClick={() => setMode(id, mode === 'normal' ? 'mini' : 'normal')}>
            {mode === 'normal' ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
        </button>}
        <ResourceConnectionHandles editable/>
    </div>;
}
