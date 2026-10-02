import {Handle, Position, type NodeProps, type Node} from '@xyflow/react';
import {MoreHorizontal, PlaySquare, Image as ImageIcon} from 'lucide-react';
import {cn} from '../../../lib/utils';

// Definimos qué datos espera recibir este nodo
export type MediaNodeData = {
    label: string;
    type: 'video' | 'image';
    url: string;
};

// Le decimos a React Flow exactamente cómo es nuestro nodo "media"
export type MediaNodeType = Node<MediaNodeData, 'media'>;

// Usamos MediaNodeType en lugar de "any"
export function MediaNode({data, selected}: NodeProps<MediaNodeType>) {
    return (
        <div className={cn(
            "relative group bg-background border rounded-xl overflow-hidden transition-all min-w-[280px]",
            selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-outline/50"
        )}>
            <div
                className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    className="p-1.5 bg-background/90 backdrop-blur border border-border rounded-md text-on-surface-variant hover:text-on-background">
                    <MoreHorizontal size={14}/>
                </button>
            </div>

            <div className="w-full h-40 bg-surface-variant flex items-center justify-center relative overflow-hidden">
                {data.type === 'video' ? (
                    <>
                        <video
                            src={data.url}
                            className="w-full h-full object-cover opacity-80"
                            controls={selected}
                        />
                        {!selected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/10">
                                <PlaySquare size={32} className="text-on-background/70"/>
                            </div>
                        )}
                    </>
                ) : (
                    <img src={data.url} alt={data.label} className="w-full h-full object-cover"/>
                )}
            </div>

            <div className="px-3 py-2 flex items-center gap-2 border-t border-border bg-surface/30">
                {data.type === 'video' ? <PlaySquare size={14} className="text-note-purple"/> :
                    <ImageIcon size={14} className="text-note-green"/>}
                <span className="text-sm font-medium text-on-background truncate">{data.label}</span>
            </div>

            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-surface border-2 border-primary"/>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-surface border-2 border-primary"/>
        </div>
    );
}