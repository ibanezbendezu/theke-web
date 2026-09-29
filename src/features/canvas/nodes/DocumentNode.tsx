import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { FileText, Download, MoreHorizontal } from 'lucide-react';
import { cn } from '../../../lib/utils';

export type DocumentNodeData = {
    filename: string;
    extension: string;
    size?: string;
    url?: string;
};

export type DocumentNodeType = Node<DocumentNodeData, 'document'>;

export function DocumentNode({ data, selected }: NodeProps<DocumentNodeType>) {
    return (
        <div className={cn(
            "relative group flex items-center gap-3 p-3 min-w-[260px] bg-background border rounded-xl transition-all",
            selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-outline/50"
        )}>
            {/* Menú de opciones (Consistente con MediaNode) */}
            <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 bg-background/90 backdrop-blur border border-border rounded-md text-on-surface-variant hover:text-on-background nodrag nopan">
                    <Download size={14} />
                </button>
                <button className="p-1 bg-background/90 backdrop-blur border border-border rounded-md text-on-surface-variant hover:text-on-background nodrag nopan">
                    <MoreHorizontal size={14} />
                </button>
            </div>

            {/* Icono del documento */}
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-surface-variant border border-border text-outline">
                <FileText size={24} strokeWidth={1.5} />
            </div>

            {/* Información del archivo */}
            <div className="flex flex-col flex-grow overflow-hidden pr-12">
                <span className="text-sm font-semibold text-on-background truncate">{data.filename}</span>
                <span className="text-xs font-medium text-outline uppercase tracking-wider">{data.extension} • {data.size || '?? MB'}</span>
            </div>

            {/* Puntos de conexión estandarizados */}
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-surface border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-surface border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}