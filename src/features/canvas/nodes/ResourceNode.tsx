import {type Node, type NodeProps} from '@xyflow/react';
import {Maximize2, Minimize2} from 'lucide-react';
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
}, 'resource'>;

export function ResourceNode({id, data, selected}: NodeProps<ResourceNodeType>) {
    const resource = useResource(data.resourceId);
    const mode = data.displayMode === 'normal' ? 'normal' : 'mini';
    const audio = resource.data?.mediaType?.startsWith('audio/');
    const access = useResourceAccess(data.resourceId, mode === 'normal' && Boolean(audio));
    const openCanvasNode = useCanvasStore(state => state.openCanvasNode);
    const setMode = useCanvasStore(state => state.setResourceDisplayMode);
    return <div className="group/resource relative" style={resourceCardSize[mode]}>
        <ResourceCard resource={resource.data} mode={mode} caption={data.caption} accent={data.accent}
                      selected={selected} onOpen={() => openCanvasNode(id)}
                      directUrl={audio ? access.data?.url : undefined}/>
        {selected && <button type="button" className="nodrag nopan absolute -right-2 -top-2 z-20 grid h-7 w-7 place-items-center rounded-md bg-surface text-on-background ring-1 ring-border hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary"
                             aria-label={mode === 'normal' ? 'Mostrar recurso en tamaño mini' : 'Mostrar recurso en tamaño normal'}
                             title={mode === 'normal' ? 'Tamaño mini' : 'Tamaño normal'}
                             onClick={() => setMode(id, mode === 'normal' ? 'mini' : 'normal')}>
            {mode === 'normal' ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
        </button>}
        <ResourceConnectionHandles editable/>
    </div>;
}
