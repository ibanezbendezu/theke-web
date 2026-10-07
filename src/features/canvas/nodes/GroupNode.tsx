import {Handle, Position, type NodeProps, type Node} from '@xyflow/react';
import {NodeResizer} from '@xyflow/react';
import {MoreHorizontal, Layers} from 'lucide-react';
import {cn} from '../../../lib/utils';
import {useCanvasStore} from '../../../store/useCanvasStore';

export type GroupNodeData = {
    label?: string;
    color?: string;
    dropTarget?: boolean;
};

export type GroupNodeType = Node<GroupNodeData, 'container'>;

export function GroupNode({id, data, selected, width = 350, height = 250}: NodeProps<GroupNodeType>) {
    const openCanvasNode = useCanvasStore(state => state.openCanvasNode);
    const beginGesture = useCanvasStore(state => state.beginGesture);
    const endGesture = useCanvasStore(state => state.endGesture);
    const {label = 'Nuevo grupo', color = 'var(--color-surface-variant)', dropTarget = false} = data;

    return (
        <div className="relative group" style={{width, height}}>
            <NodeResizer
                color="var(--color-primary)"
                isVisible={selected}
                minWidth={250}
                minHeight={150}
                onResizeStart={beginGesture}
                onResizeEnd={endGesture}
            />

            <div
                className={cn(
                    "w-full h-full overflow-hidden rounded-xl border bg-background/15 transition-colors",
                    dropTarget ? "border-primary ring-1 ring-primary bg-primary/10" : selected ? "border-primary ring-1 ring-primary" : "border-outline/35 hover:border-outline/70"
                )}
            >
                <div
                    className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <button type="button" aria-label="Opciones del grupo" onClick={() => openCanvasNode(id)}
                            className="nodrag nopan rounded-md bg-surface/90 p-1.5 text-on-surface-variant backdrop-blur hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary">
                        <MoreHorizontal size={14}/>
                    </button>
                </div>

                <div
                    className="pointer-events-none h-full w-full"
                    style={{backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`}}
                />
            </div>

            {dropTarget && <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-surface/95 px-2 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                Soltar en grupo
            </span>}

            <button type="button" onClick={() => openCanvasNode(id)}
                    aria-label={`Abrir propiedades del grupo ${label}`}
                    className="nodrag nopan absolute left-0 top-full z-50 mt-1 flex max-w-full items-center gap-1.5 rounded-md bg-surface/90 px-2.5 py-1.5 text-xs font-medium text-on-background backdrop-blur-md hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary">
                <Layers size={13} className="shrink-0 text-primary" aria-hidden="true"/>
                <span className="max-w-48 truncate">{label}</span>
            </button>

            <Handle id="left" type="target" position={Position.Left}
                    className="w-3 h-3 bg-surface border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity z-50"/>
            <Handle id="right" type="source" position={Position.Right}
                    className="w-3 h-3 bg-surface border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity z-50"/>
            <Handle type="target" position={Position.Top}
                    className="w-3 h-3 bg-surface border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity z-50"
                    id="top"/>
            <Handle type="source" position={Position.Bottom}
                    className="w-3 h-3 bg-surface border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity z-50"
                    id="bottom"/>
        </div>
    );
}
