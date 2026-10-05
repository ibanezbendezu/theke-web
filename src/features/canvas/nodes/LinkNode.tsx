import {Handle, Position, type NodeProps, type Node} from '@xyflow/react';
import {Link as LinkIcon, ExternalLink, MoreHorizontal} from 'lucide-react';
import {cn} from '../../../lib/utils';

export type LinkNodeData = {
    url: string;
    title: string;
    description?: string;
    imageUrl?: string;
};

export type LinkNodeType = Node<LinkNodeData, 'link'>;

export function LinkNode({data, selected}: NodeProps<LinkNodeType>) {
    return (
        <div className={cn(
            "relative group flex w-[360px] h-[100px] bg-background border rounded-xl transition-all overflow-hidden",
            selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-outline/50"
        )}>
            {/* Controles flotantes */}
            <div
                className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-background/90 backdrop-blur border border-border rounded-md text-primary hover:bg-surface-variant nodrag nopan"
                    title="Visitar enlace"
                >
                    <ExternalLink size={14}/>
                </a>
                <button
                    className="p-1.5 bg-background/90 backdrop-blur border border-border rounded-md text-on-surface-variant hover:text-on-background nodrag nopan">
                    <MoreHorizontal size={14}/>
                </button>
            </div>

            {/* Textos */}
            <div className="flex flex-col justify-center flex-1 p-3.5 overflow-hidden">
                <span className="text-sm font-semibold text-on-background line-clamp-1 pr-14 mb-1">{data.title}</span>
                <span
                    className="text-xs text-outline line-clamp-2 mb-2 leading-relaxed">{data.description || 'Sin descripción disponible.'}</span>
                <div className="flex items-center gap-1.5 text-[10px] text-outline mt-auto font-medium">
                    <LinkIcon size={12}/>
                    <span className="truncate">{data.url.replace(/^https?:\/\//, '')}</span>
                </div>
            </div>

            {/* Imagen lateral */}
            {data.imageUrl && (
                <div className="w-[100px] h-full flex-shrink-0 bg-surface-variant border-l border-border relative">
                    <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover"/>
                    {/* Un gradiente sutil para fusionar la imagen con el fondo */}
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-border/20 to-transparent pointer-events-none"/>
                </div>
            )}

            <Handle id="left" type="target" position={Position.Left}
                    className="w-3 h-3 bg-surface border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity"/>
            <Handle id="right" type="source" position={Position.Right}
                    className="w-3 h-3 bg-surface border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity"/>
        </div>
    );
}
