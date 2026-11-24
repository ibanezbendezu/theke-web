import {type Node, type NodeProps} from '@xyflow/react';
import {File, FileText, Image, Layers3, Link as LinkIcon, Music, Video} from 'lucide-react';
import {useOrganization} from '../../../data/useOrganization';
import {useCanvasStore} from '../../../store/useCanvasStore';
import {collectionSize, type CollectionDisplayMode} from '../collectionTypes';

export type CollectionNodeType = Node<{
    label?: string;
    resourceIds: string[];
    projectId: string;
    displayMode?: CollectionDisplayMode;
}, 'collection'>;

const resourceKind = (type?: string, media?: string | null) => type === 'note' ? ['Nota', FileText] as const
    : type === 'link' ? ['Enlace', LinkIcon] as const
        : media?.startsWith('image/') ? ['Imagen', Image] as const
            : media?.startsWith('video/') ? ['Vídeo', Video] as const
                : media?.startsWith('audio/') ? ['Audio', Music] as const
                    : ['Archivo', File] as const;

export function CollectionNode({id, data, selected}: NodeProps<CollectionNodeType>) {
    const organization = useOrganization(data.projectId);
    const open = useCanvasStore(state => state.openCanvasNode);
    const mode = data.displayMode === 'gallery' || data.displayMode === 'list' ? data.displayMode : 'stack';
    const resources = data.resourceIds.map(resourceId => organization.data?.resources.find(item => item.resourceId === resourceId));
    const label = data.label?.trim() || 'Colección';
    const frame = `${selected ? 2 : 1}px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`;
    const row = (resource: typeof resources[number], index: number) => {
        const [kind, Icon] = resourceKind(resource?.type, resource?.mediaType);
        return <div key={data.resourceIds[index]} className="flex min-w-0 items-center gap-2 rounded-md bg-surface-variant/55 px-2 py-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-background text-outline"><Icon size={14} aria-hidden="true"/></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{resource?.title ?? 'Cargando recurso…'}</span>
                <span className="block truncate text-[10px] text-outline">{kind}</span></span>
        </div>;
    };
    return <article className="relative h-full w-full overflow-hidden rounded-lg bg-background" style={{...collectionSize[mode], outline: frame}}
                    aria-label={`${label}, ${data.resourceIds.length} recursos`} onDoubleClick={() => open(id)}>
        <header className="flex h-12 items-center gap-2 px-3">
            <Layers3 size={16} className="shrink-0 text-outline" aria-hidden="true"/>
            <p className="min-w-0 flex-1 truncate text-sm font-medium">{label}</p>
            <span className="rounded-md bg-surface-variant px-1.5 py-0.5 text-[10px] text-outline">{data.resourceIds.length}</span>
        </header>
        {mode === 'stack' ? <div className="relative mx-3 h-[68px]">
            {resources.slice(0, 3).map((resource, index) => {
                const [, Icon] = resourceKind(resource?.type, resource?.mediaType);
                return <div key={data.resourceIds[index]} className="absolute flex h-12 w-[calc(100%-1rem)] items-center gap-2 rounded-md bg-surface-variant px-3"
                    style={{left: index * 8, top: index * 7, zIndex: 3 - index, outline: '1px solid var(--color-border)'}}>
                    <Icon size={15} className="shrink-0 text-outline" aria-hidden="true"/><span className="truncate text-xs">{resource?.title ?? 'Cargando recurso…'}</span>
                </div>;
            })}
        </div> : mode === 'gallery' ? <div className="grid grid-cols-2 gap-2 px-3 pb-3">{resources.slice(0, 6).map(row)}</div>
            : <div className="space-y-1.5 px-3 pb-3">{resources.slice(0, 5).map(row)}</div>}
    </article>;
}

