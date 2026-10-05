import {useEffect, useRef, type PointerEvent as ReactPointerEvent} from 'react';
import {NodeResizer, useViewport, type Node, type NodeProps} from '@xyflow/react';
import {GripHorizontal} from 'lucide-react';
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
    const setLineEndpoints = useCanvasStore(state => state.setLineEndpoints);
    const beginGesture = useCanvasStore(state => state.beginGesture);
    const endGesture = useCanvasStore(state => state.endGesture);
    const {zoom} = useViewport();
    const stopDragging = useRef<(() => void) | null>(null);
    useEffect(() => () => stopDragging.current?.(), []);
    const color = annotationColor(data.color);
    const startEndpointDrag = (event: ReactPointerEvent<SVGCircleElement>, endpoint: 'start' | 'end') => {
        event.preventDefault();
        event.stopPropagation();
        const node = useCanvasStore.getState().nodes.find(item => item.id === id);
        if (!node) return;
        const line = node.data as AnnotationData;
        const nodeWidth = node.width ?? width;
        const nodeHeight = node.height ?? height;
        const start = {
            x: node.position.x + nodeWidth * (line.x1 ?? 5) / 100,
            y: node.position.y + nodeHeight * (line.y1 ?? 50) / 100
        };
        const end = {
            x: node.position.x + nodeWidth * (line.x2 ?? 95) / 100,
            y: node.position.y + nodeHeight * (line.y2 ?? 50) / 100
        };
        const origin = endpoint === 'start' ? start : end;
        const pointerId = event.pointerId;
        const pointerX = event.clientX;
        const pointerY = event.clientY;
        beginGesture();
        const onMove = (move: PointerEvent) => {
            if (move.pointerId !== pointerId) return;
            const moved = {
                x: origin.x + (move.clientX - pointerX) / zoom,
                y: origin.y + (move.clientY - pointerY) / zoom
            };
            setLineEndpoints(id, endpoint === 'start' ? moved : start, endpoint === 'end' ? moved : end);
        };
        const cleanup = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onStop);
            window.removeEventListener('pointercancel', onStop);
            stopDragging.current = null;
            endGesture();
        };
        const onStop = (stop: PointerEvent) => {
            if (stop.pointerId === pointerId) cleanup();
        };
        stopDragging.current?.();
        stopDragging.current = cleanup;
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onStop);
        window.addEventListener('pointercancel', onStop);
    };
    return <div role="group"
                aria-label={`Anotación visual: ${data.kind === 'text' ? 'texto' : data.kind === 'line' ? 'línea' : 'forma'}`}
                className={`group relative ${selected && data.kind !== 'line' ? 'ring-1 ring-primary' : ''}`} style={{width, height}}>
        {data.kind === 'shape' && <NodeResizer isVisible={selected} color="var(--color-primary)" minWidth={40}
                                              minHeight={40} onResizeStart={beginGesture}
                                              onResizeEnd={endGesture}/>}
        {data.kind === 'text' && <>
            <span aria-hidden="true" title="Arrastrar anotación"
                  className={`absolute -top-4 left-2 z-10 flex h-5 w-8 cursor-grab items-center justify-center rounded-md bg-surface text-outline transition-opacity hover:text-on-background group-hover:opacity-100 active:cursor-grabbing ${selected ? 'opacity-100' : 'opacity-0'}`}
            ><GripHorizontal size={14}/></span>
            <textarea
                className="nodrag nopan h-full w-full resize-none rounded border border-border bg-background/90 p-2 outline-none"
                aria-label="Texto de anotación" value={data.text ?? ''}
                onChange={event => updateNodeData(id, {text: event.target.value})}
                style={{fontSize: data.fontSize ?? 16, textAlign: data.align ?? 'left', color}}
                placeholder="Escribe una anotación…"/>
        </>}
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
                {selected && <>
                    <circle className="nodrag nopan cursor-crosshair touch-none" cx={`${data.x1 ?? 5}%`}
                            cy={`${data.y1 ?? 50}%`} r={7} fill="var(--color-background)" stroke="var(--color-primary)"
                            strokeWidth={2} onPointerDown={event => startEndpointDrag(event, 'start')}/>
                    <circle className="nodrag nopan cursor-crosshair touch-none" cx={`${data.x2 ?? 95}%`}
                            cy={`${data.y2 ?? 50}%`} r={7} fill="var(--color-background)" stroke="var(--color-primary)"
                            strokeWidth={2} onPointerDown={event => startEndpointDrag(event, 'end')}/>
                </>}
            </svg>}
    </div>;
}
