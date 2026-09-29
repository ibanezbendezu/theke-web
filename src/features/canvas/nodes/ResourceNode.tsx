import { Handle, NodeResizer, Position, type Node, type NodeProps } from '@xyflow/react';
import { File as FileIcon, FileText, Image, Link as LinkIcon, Music, Video } from 'lucide-react';
import { useResource } from '../../../data/useResources';
import { useCanvasStore } from '../../../store/useCanvasStore';

export type ResourceNodeType = Node<{ resourceId: string; caption?: string; accent?: 'default' | 'primary' | 'muted' }, 'resource'>;
export function ResourceNode({ id, data, selected, width = 288, height = 112 }: NodeProps<ResourceNodeType>) {
  const resource = useResource(data.resourceId);
  const openCanvasNode = useCanvasStore(state => state.openCanvasNode);
  const beginGesture = useCanvasStore(state => state.beginGesture); const endGesture = useCanvasStore(state => state.endGesture);
  const type = resource.data?.type;
  const mediaType = resource.data?.mediaType;
  const Icon = type === 'note' ? FileText : type === 'link' ? LinkIcon : mediaType?.startsWith('image/') ? Image : mediaType?.startsWith('video/') ? Video : mediaType?.startsWith('audio/') ? Music : FileIcon;
  const kind = type === 'note' ? 'Nota' : type === 'link' ? 'Enlace' : mediaType?.startsWith('image/') ? 'Imagen' : mediaType?.startsWith('video/') ? 'Video' : mediaType?.startsWith('audio/') ? 'Audio' : mediaType === 'application/pdf' ? 'Documento PDF' : 'Archivo';
  return <div className="relative" style={{ width, height }}><NodeResizer isVisible={selected} minWidth={160} minHeight={80} color="var(--color-primary)" onResizeStart={beginGesture} onResizeEnd={endGesture}/><article className={`flex h-full w-full items-center gap-3 rounded-lg border bg-background p-3 ${selected ? 'ring-1 ring-primary' : ''}`} style={{ borderColor: data.accent === 'primary' ? 'var(--color-primary)' : data.accent === 'muted' ? 'var(--color-outline)' : 'var(--color-border)' }}>
    <Icon size={20} className="shrink-0 text-primary" aria-hidden="true" />
    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{resource.data?.title ?? (resource.isError ? 'Recurso no disponible' : 'Cargando recurso…')}</p><p className="text-xs text-outline">{kind}{data.caption ? ` · ${data.caption}` : ''}</p></div>
    <button type="button" className="nodrag nopan rounded border border-border px-2 py-1 text-xs hover:bg-surface-variant" onClick={() => openCanvasNode(id)} aria-label={`Abrir detalle de ${resource.data?.title ?? 'recurso'}`}>Abrir</button>
    <Handle type="target" position={Position.Left} className="bg-primary"/><Handle type="source" position={Position.Right} className="bg-primary"/>
  </article></div>;
}
