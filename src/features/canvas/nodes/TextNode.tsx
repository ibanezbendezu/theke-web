import {Handle, Position, type NodeProps, type Node} from '@xyflow/react';
import {GripHorizontal} from 'lucide-react';
import {cn} from '../../../lib/utils';
import {useCanvasStore} from '../../../store/useCanvasStore';

// Definimos los datos del nodo
export type TextNodeData = {
    text: string;
    placeholder?: string;
};

export type TextNodeType = Node<TextNodeData, 'text'>;

export function TextNode({id, data, selected}: NodeProps<TextNodeType>) {
    const updateNodeData = useCanvasStore(state => state.updateNodeData);
    const text = data.text ?? '';

    // Calculamos las filas de la caja de texto basándonos en los saltos de línea
    const rows = text.split('\n').length;

    return (
        <div className={cn(
            "relative group min-w-[250px] p-2 rounded-lg transition-colors",
            selected ? "bg-surface-variant/50 ring-1 ring-border" : "hover:bg-surface-variant/30"
        )}>
            <span aria-hidden="true" title="Arrastrar texto"
                  className={`absolute -top-4 left-2 z-10 flex h-5 w-8 cursor-grab items-center justify-center rounded-md bg-surface text-outline transition-opacity group-hover:opacity-100 active:cursor-grabbing ${selected ? 'opacity-100' : 'opacity-0'}`}>
                <GripHorizontal size={14}/>
            </span>
            <textarea
                autoFocus={!data.text} // <--- ¡Esta es la magia UX! Si está vacío, enfoca.
                value={text}
                onChange={(e) => updateNodeData(id, {text: e.target.value})}
                placeholder={data.placeholder || "Escribe algo..."}
                rows={Math.max(1, rows)}
                className="w-full bg-transparent resize-none outline-none text-on-background font-sans text-base leading-relaxed nodrag nopan overflow-hidden"
            />

            {/* Puntos de conexión (Invisibles hasta hacer hover para no ensuciar el texto) */}
            <Handle
                id="left"
                type="target"
                position={Position.Left}
                className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border border-outline"
            />
            <Handle
                id="right"
                type="source"
                position={Position.Right}
                className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border border-outline"
            />
        </div>
    );
}
