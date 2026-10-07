import {type Node, type NodeProps} from '@xyflow/react';
import {ArrowUpRight, Folder} from 'lucide-react';
import {useLibraryFolders} from '../../../data/useLibraryFolders';
import {useOrganization} from '../../../data/useOrganization';
import {useCanvasStore} from '../../../store/useCanvasStore';

export type FolderNodeType = Node<{
    libraryFolderId?: string;
    folderId?: string;
    projectId?: string;
    caption?: string;
    accent?: 'default' | 'primary' | 'muted'
}, 'folder'>;

export function FolderNode({id, data, selected, width = 208, height = 72}: NodeProps<FolderNodeType>) {
    const library = useLibraryFolders(Boolean(data.libraryFolderId));
    const organization = useOrganization(data.libraryFolderId ? undefined : data.projectId);
    const openCanvasNode = useCanvasStore(state => state.openCanvasNode);
    const libraryFolder = library.data?.find(item => item.id === data.libraryFolderId);
    const legacyFolder = organization.data?.folders.find(item => item.id === data.folderId);
    const title = data.libraryFolderId
        ? libraryFolder?.name ?? (library.isPending ? 'Cargando carpeta…' : 'Carpeta no disponible')
        : legacyFolder?.name ?? (organization.isPending ? 'Cargando carpeta…' : 'Carpeta no disponible');
    const kind = data.libraryFolderId ? 'Biblioteca' : 'Carpeta de proyecto anterior';
    return <article className="relative flex items-center gap-3 rounded-lg bg-background px-3" style={{width, height,
        outline: `${selected ? 2 : 1}px solid ${selected ? 'var(--color-primary)' : data.accent === 'muted' ? 'var(--color-outline)' : 'var(--color-border)'}`}}
        onDoubleClick={() => openCanvasNode(id)}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-surface-variant text-on-background">
            <Folder size={18} aria-hidden="true"/>
        </span>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{title}</p>
            <p className="truncate text-xs text-outline">{kind}{data.caption ? ` · ${data.caption}` : ''}</p>
        </div>
        <button type="button" className="nodrag nopan grid h-7 w-7 shrink-0 place-items-center rounded-md text-outline hover:bg-surface-variant hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary"
                aria-label={`Abrir carpeta ${title}`} data-tooltip="Explorar carpeta" onClick={() => openCanvasNode(id)}>
            <ArrowUpRight size={15} aria-hidden="true"/>
        </button>
    </article>;
}
