import {useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent} from 'react';
import {NodeResizeControl, NodeResizer, useViewport, type Node, type NodeProps, type OnResize, type OnResizeStart} from '@xyflow/react';
import {useCanvasStore} from '../../../store/useCanvasStore';
import {VisualTextContent} from '../VisualTextContent';
import {visualTextStyle, visualFonts} from '../visualTextStyle';

export type AnnotationData = {
    kind: 'text' | 'shape' | 'line';
    text?: string;
    fontSize?: number;
    align?: 'left' | 'center' | 'right' | 'justify';
    fontFamily?: keyof typeof visualFonts;
    textColor?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    textCase?: 'normal' | 'upper' | 'lower';
    listStyle?: 'none' | 'bullet' | 'number';
    letterSpacing?: number;
    lineHeight?: number;
    opacity?: number;
    shadow?: 'none' | 'soft' | 'strong';
    outlineWidth?: number;
    outlineColor?: string;
    backgroundColor?: string;
    cornerRadius?: number;
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
const emptyText = 'Escribe una anotación';

export function AnnotationNode({id, data, selected, width = 240, height = 100}: NodeProps<AnnotationNodeType>) {
    const updateNodeData = useCanvasStore(state => state.updateNodeData);
    const setLineEndpoints = useCanvasStore(state => state.setLineEndpoints);
    const beginGesture = useCanvasStore(state => state.beginGesture);
    const endGesture = useCanvasStore(state => state.endGesture);
    const fitTextNodeHeight = useCanvasStore(state => state.fitTextNodeHeight);
    const {zoom} = useViewport();
    const stopDragging = useRef<(() => void) | null>(null);
    const scaleStart = useRef<{width: number; fontSize: number} | null>(null);
    const [editingText, setEditingText] = useState(false);
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    useEffect(() => () => stopDragging.current?.(), []);
    useEffect(() => { if (editingText && selected) editorRef.current?.focus(); }, [editingText, selected]);
    const measureText = useCallback(() => {
        if (scaleStart.current || !contentRef.current) return;
        const contentHeight = contentRef.current.offsetHeight;
        const editorHeight = editingText ? editorRef.current?.scrollHeight ?? 0 : 0;
        fitTextNodeHeight(id, Math.max(contentHeight, editorHeight));
    }, [editingText, fitTextNodeHeight, id]);
    useEffect(() => {
        if (data.kind !== 'text' || !contentRef.current) return;
        const observer = new ResizeObserver(measureText);
        observer.observe(contentRef.current);
        return () => observer.disconnect();
    }, [data.kind, measureText]);
    useEffect(() => { if (data.kind === 'text') measureText(); });
    const startScale = useCallback<OnResizeStart>((_, params) => {
        const node = useCanvasStore.getState().nodes.find(item => item.id === id);
        scaleStart.current = {width: params.width, fontSize: Number(node?.data.fontSize) || 16};
        beginGesture();
    }, [beginGesture, id]);
    const scaleText = useCallback<OnResize>((_, params) => {
        const start = scaleStart.current;
        if (!start || start.width <= 0) return;
        const fontSize = Math.max(8, Math.min(144, Math.round(start.fontSize * params.width / start.width)));
        const node = useCanvasStore.getState().nodes.find(item => item.id === id);
        if (node?.data.fontSize !== fontSize) updateNodeData(id, {fontSize});
    }, [id, updateNodeData]);
    const finishResize = useCallback(() => {
        scaleStart.current = null;
        endGesture();
        requestAnimationFrame(measureText);
    }, [endGesture, measureText]);
    const startEditing = () => {
        beginGesture();
        setEditingText(true);
    };
    const finishEditing = () => {
        const node = useCanvasStore.getState().nodes.find(item => item.id === id);
        if (!String(node?.data.text ?? '').trim()) updateNodeData(id, {text: emptyText});
        setEditingText(false);
        endGesture();
    };
    const color = annotationColor(data.color);
    const stroke = data.outlineColor && /^#[0-9a-f]{6}$/i.test(data.outlineColor) ? data.outlineColor : color;
    const shadow = data.shadow === 'soft' ? '0 2px 8px rgb(0 0 0 / 18%)' : data.shadow === 'strong' ? '0 8px 24px rgb(0 0 0 / 28%)' : undefined;
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
                className={`group relative ${selected && data.kind !== 'line' ? 'ring-1 ring-primary' : ''}`}
                style={data.kind === 'text' ? {width: '100%', height: '100%'} : {width, height}}>
        {data.kind === 'shape' && <NodeResizer isVisible={selected} color="var(--color-primary)" minWidth={40}
                                              minHeight={40} onResizeStart={beginGesture}
                                              onResizeEnd={endGesture}/>}
        {data.kind === 'text' && <>
            {selected && !editingText && <>
                {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(position =>
                    <NodeResizeControl key={position} position={position} color="var(--color-primary)"
                        minWidth={40} minHeight={40} keepAspectRatio
                        onResizeStart={startScale} onResize={scaleText} onResizeEnd={finishResize}/>)}
                {(['left', 'right'] as const).map(position =>
                    <NodeResizeControl key={position} position={position} color="var(--color-primary)"
                        minWidth={40} resizeDirection="horizontal"
                        onResizeStart={beginGesture} onResizeEnd={finishResize}/>)}
            </>}
            <div ref={contentRef} role="textbox" aria-label="Texto visual" aria-readonly="true" tabIndex={editingText ? -1 : 0}
                title="Doble clic para editar"
                onDoubleClick={event => { event.stopPropagation(); startEditing(); }}
                onKeyDown={event => { if (event.key === 'Enter') {event.stopPropagation(); startEditing();} }}
                className={`min-h-10 w-full cursor-move select-none p-2 ${editingText ? 'invisible' : ''}`}
                style={visualTextStyle(data)}><VisualTextContent text={data.text?.trim() ? data.text : emptyText} listStyle={data.listStyle}/></div>
            {editingText && selected && <textarea ref={editorRef}
                className="nodrag nopan absolute inset-0 h-full w-full resize-none overflow-hidden bg-transparent p-2 outline-none focus-visible:ring-1 focus-visible:ring-primary"
                aria-label="Texto de anotación" value={data.text ?? ''}
                onChange={event => updateNodeData(id, {text: event.target.value})}
                onBlur={finishEditing}
                style={{...visualTextStyle(data), opacity: 1}}
                placeholder={emptyText}/>}
        </>}
        {data.kind === 'shape' && <div aria-label={`Forma ${data.shape === 'ellipse' ? 'elipse' : 'rectángulo'}`}
                                       className="h-full w-full" style={{
            backgroundColor: data.backgroundColor ?? 'var(--color-surface-variant)',
            border: `${data.thickness ?? 2}px ${data.dash ?? 'solid'} ${stroke}`,
            borderRadius: data.shape === 'ellipse' ? '50%' : data.cornerRadius ?? 8,
            opacity: (data.opacity ?? 100) / 100,
            boxShadow: shadow
        }}/>}
        {data.kind === 'line' &&
            <svg aria-label="Línea decorativa" role="img" className="h-full w-full overflow-visible">
                <line x1={`${data.x1 ?? 5}%`} y1={`${data.y1 ?? 50}%`} x2={`${data.x2 ?? 95}%`} y2={`${data.y2 ?? 50}%`}
                      stroke="transparent" strokeWidth={Math.max(18, data.thickness ?? 3)} className="cursor-move"/>
                <line x1={`${data.x1 ?? 5}%`} y1={`${data.y1 ?? 50}%`} x2={`${data.x2 ?? 95}%`} y2={`${data.y2 ?? 50}%`}
                      stroke={stroke} strokeWidth={data.thickness ?? 3} strokeLinecap="round" pointerEvents="none"
                      opacity={(data.opacity ?? 100) / 100} strokeDasharray={data.dash === 'dashed' ? '8 5' : undefined}/>
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
