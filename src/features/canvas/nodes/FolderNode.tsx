import { Handle, NodeResizer, Position, type Node, type NodeProps } from '@xyflow/react';
import { Folder } from 'lucide-react';
import { useOrganization } from '../../../data/useOrganization';
import { useCanvasStore } from '../../../store/useCanvasStore';

export type FolderNodeType = Node<{ folderId: string; projectId: string; caption?: string; accent?: 'default' | 'primary' | 'muted' }, 'folder'>;
export function FolderNode({ id, data, selected, width = 288, height = 112 }: NodeProps<FolderNodeType>) {
  const organization = useOrganization(data.projectId);
  const openCanvasNode = useCanvasStore(state => state.openCanvasNode);
  const beginGesture = useCanvasStore(state => state.beginGesture); const endGesture = useCanvasStore(state => state.endGesture);
  const folder = organization.data?.folders.find(item => item.id === data.folderId);
  const count = organization.data?.resources.filter(item => item.folderId === data.folderId && !item.archivedAt).length ?? 0;
  return <div className="relative" style={{ width, height }}><NodeResizer isVisible={selected} minWidth={160} minHeight={80} color="var(--color-primary)" onResizeStart={beginGesture} onResizeEnd={endGesture}/><article className={`flex h-full w-full items-center gap-3 rounded-lg border bg-background p-3 ${selected ? 'ring-1 ring-primary' : ''}`} style={{ borderColor: data.accent === 'primary' ? 'var(--color-primary)' : data.accent === 'muted' ? 'var(--color-outline)' : 'var(--color-border)' }}>
    <Folder size={20} className="shrink-0 text-primary" aria-hidden="true" />
    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{folder?.name ?? (organization.isPending ? 'Cargando carpeta…' : 'Carpeta no disponible')}</p><p className="text-xs text-outline">Carpeta · {count} {count === 1 ? 'recurso' : 'recursos'}{folder?.archivedAt ? ' · Archivada' : ''}{data.caption ? ` · ${data.caption}` : ''}</p></div>
    <button type="button" className="nodrag nopan rounded border border-border px-2 py-1 text-xs hover:bg-surface-variant" onClick={() => openCanvasNode(id)} aria-label={`Abrir carpeta ${folder?.name ?? ''}`}>Abrir</button>
    <Handle type="target" position={Position.Left} className="bg-primary"/><Handle type="source" position={Position.Right} className="bg-primary"/>
  </article></div>;
}
