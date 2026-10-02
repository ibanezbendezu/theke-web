import {NodeResizer, type Node, type NodeProps} from '@xyflow/react';
import {useCanvasStore} from '../../../store/useCanvasStore';

export type AnnotationData = {
    kind: 'text' | 'shape' | 'line';
    text?: string;
    fontSize?: number;
    align?: 'left' | 'center' | 'right';
    shape?: 'rectangle' | 'ellipse';
    color?: 'default' | 'primary' | 'muted';
    thickness?: number;
    dash?: 'solid' | 'dashed';
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number
};
export type AnnotationNodeType = Node<AnnotationData, 'annotation'>;
const annotationColor = (value?: AnnotationData['color']) => value === 'primary' ? 'var(--color-primary)' : value === 'muted' ? 'var(--color-outline)' : 'var(--color-on-background)';

export function AnnotationNode({id, data, selected, width = 240, height = 100}: NodeProps<AnnotationNodeType>) {
    const updateNodeData = useCanvasStore(state => state.updateNodeData);
    const beginGesture = useCanvasStore(state => state.beginGesture);
    const endGesture = useCanvasStore(state => state.endGesture);
    const color = annotationColor(data.color);
    return <div role="group"
                aria-label={`Anotación visual: ${data.kind === 'text' ? 'texto' : data.kind === 'line' ? 'línea' : 'forma'}`}
                className={`relative ${selected ? 'ring-1 ring-primary' : ''}`} style={{width, height}}>
        {data.kind !== 'text' && <NodeResizer isVisible={selected} color="var(--color-primary)" minWidth={40}
                                              minHeight={data.kind === 'line' ? 24 : 40} onResizeStart={beginGesture}
                                              onResizeEnd={endGesture}/>}
        {data.kind === 'text' && <textarea
            className="nodrag nopan h-full w-full resize-none rounded border border-border bg-background/90 p-2 outline-none"
            aria-label="Texto de anotación" value={data.text ?? ''}
            onChange={event => updateNodeData(id, {text: event.target.value})}
            style={{fontSize: data.fontSize ?? 16, textAlign: data.align ?? 'left', color}}
            placeholder="Escribe una anotación…"/>}
        {data.kind === 'shape' && <div aria-label={`Forma ${data.shape === 'ellipse' ? 'elipse' : 'rectángulo'}`}
                                       className="h-full w-full bg-surface-variant" style={{
            border: `${data.thickness ?? 2}px ${data.dash ?? 'solid'} ${color}`,
            borderRadius: data.shape === 'ellipse' ? '50%' : 8
        }}/>}
        {data.kind === 'line' &&
            <svg aria-label="Línea decorativa" role="img" className="h-full w-full overflow-visible">
                <line x1={`${data.x1 ?? 5}%`} y1={`${data.y1 ?? 50}%`} x2={`${data.x2 ?? 95}%`} y2={`${data.y2 ?? 50}%`}
                      stroke={color} strokeWidth={data.thickness ?? 3}
                      strokeDasharray={data.dash === 'dashed' ? '8 5' : undefined}/>
            </svg>}
    </div>;
}
