import {Handle, Position, type NodeProps, type Node} from '@xyflow/react';
import {NodeResizer} from '@xyflow/react';
import {MoreHorizontal, Layers} from 'lucide-react';
import {cn} from '../../../lib/utils';
import {useCanvasStore} from '../../../store/useCanvasStore';

export type GroupNodeData = {
    label?: string;
    color?: string;
};

export type GroupNodeType = Node<GroupNodeData, 'container'>;

export function GroupNode({id, data, selected, width = 350, height = 250}: NodeProps<GroupNodeType>) {
    const updateNodeData = useCanvasStore(state => state.updateNodeData);
    const openCanvasNode = useCanvasStore(state => state.openCanvasNode);
    const beginGesture = useCanvasStore(state => state.beginGesture);
    const endGesture = useCanvasStore(state => state.endGesture);
    const {label = 'Nuevo Grupo', color = 'var(--color-surface-variant)'} = data;

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
                    "w-full h-full flex flex-col bg-background border rounded-xl overflow-hidden transition-colors",
                    selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-outline/50"
                )}
            >
                <div
                    className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" aria-label="Opciones del grupo" onClick={() => openCanvasNode(id)}
                            className="p-1.5 bg-background/90 backdrop-blur border border-border rounded-md text-on-surface-variant hover:text-on-background nodrag nopan">
                        <MoreHorizontal size={14}/>
                    </button>
                </div>

                <div
                    className="flex-1 w-full h-full"
                    style={{backgroundColor: color, opacity: 0.3}}
                />
            </div>

            <div
                className="absolute top-full left-0 w-full mt-2 px-3 py-2 flex items-center gap-2 border border-border bg-surface/90 backdrop-blur-md rounded-lg z-50">
                <Layers size={14} className="text-primary flex-shrink-0"/>
                <input
                    value={label}
                    onChange={event => updateNodeData(id, {label: event.target.value})}
                    className="bg-transparent text-sm font-medium text-on-background outline-none truncate w-full nodrag"
                    placeholder="Nombre del contenedor..."
                />
            </div>

            <Handle type="target" position={Position.Left}
                    className="w-3 h-3 bg-surface border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity z-50"/>
            <Handle type="source" position={Position.Right}
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
