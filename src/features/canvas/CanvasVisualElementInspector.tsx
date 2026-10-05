import type {Node} from '@xyflow/react';
import {Select} from '../../components/ui/Select';
import {useCanvasStore} from '../../store/useCanvasStore';
import type {AnnotationData} from './nodes/AnnotationNode';
import type {VisualElementPanel} from './CanvasVisualElementToolbar';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const field = 'mt-1 min-h-9 w-full rounded-md border-0 bg-surface-variant/55 px-2.5 text-sm text-on-background focus-visible:outline-2 focus-visible:outline-primary';

function NumberField({label, value, min, max, onCommit}: {label: string; value: number; min: number; max: number; onCommit: (value: number) => void}) {
    return <label className="block min-w-0 flex-1 text-xs text-outline">{label}<input key={value} type="number" inputMode="decimal"
        min={min} max={max} defaultValue={Math.round(value)}
        onBlur={event => {
            const parsed = Number(event.currentTarget.value);
            if (Number.isFinite(parsed)) onCommit(clamp(parsed, min, max));
            else event.currentTarget.value = String(Math.round(value));
        }} onKeyDown={event => {if (event.key === 'Enter') event.currentTarget.blur();}}
        className={field}/></label>;
}

function absolutePosition(node: Node, nodes: Node[]) {
    let x = node.position.x;
    let y = node.position.y;
    let parentId = node.parentId;
    const visited = new Set<string>();
    while (parentId && !visited.has(parentId)) {
        visited.add(parentId);
        const parent = nodes.find(item => item.id === parentId);
        if (!parent) break;
        x += parent.position.x;
        y += parent.position.y;
        parentId = parent.parentId;
    }
    return {x, y};
}

export function CanvasVisualElementInspector({nodeId, section}: {nodeId: string; section: VisualElementPanel}) {
    const nodes = useCanvasStore(state => state.nodes);
    const node = nodes.find(item => item.id === nodeId);
    const updateNodeData = useCanvasStore(state => state.updateNodeData);
    const updateNodeSize = useCanvasStore(state => state.updateNodeSize);
    const setPosition = useCanvasStore(state => state.setNodeAbsolutePosition);
    const setLineEndpoints = useCanvasStore(state => state.setLineEndpoints);
    const alignToViewport = useCanvasStore(state => state.alignNodeToViewport);
    const moveLayer = useCanvasStore(state => state.moveNodeLayer);
    const beginGesture = useCanvasStore(state => state.beginGesture);
    const endGesture = useCanvasStore(state => state.endGesture);
    if (!node) return null;
    const data = node.data as AnnotationData;
    const shape = data.kind === 'shape';
    const position = absolutePosition(node, nodes);
    const width = node.width ?? (shape ? 240 : 220);
    const height = node.height ?? (shape ? 160 : 40);
    const start = {x: position.x + width * (data.x1 ?? 5) / 100, y: position.y + height * (data.y1 ?? 50) / 100};
    const end = {x: position.x + width * (data.x2 ?? 95) / 100, y: position.y + height * (data.y2 ?? 50) / 100};
    const parentOffset = {x: position.x - node.position.x, y: position.y - node.position.y};
    const moveEndpoint = (nextStart: typeof start, nextEnd: typeof end) => setLineEndpoints(nodeId,
        {x: nextStart.x - parentOffset.x, y: nextStart.y - parentOffset.y},
        {x: nextEnd.x - parentOffset.x, y: nextEnd.y - parentOffset.y});
    return <div className="space-y-5 text-sm">
        {section === 'appearance' && shape && <section className="space-y-3" aria-label="Apariencia de la forma">
            <h3 className="text-xs font-semibold text-outline">Apariencia</h3>
            <label className="block text-xs text-outline">Opacidad · {data.opacity ?? 100}%<input type="range" min={0} max={100}
                value={data.opacity ?? 100} onPointerDown={beginGesture} onPointerUp={endGesture} onPointerCancel={endGesture}
                onChange={event => updateNodeData(nodeId, {opacity: Number(event.target.value)})} className="mt-1 w-full accent-primary"/></label>
            {data.shape !== 'ellipse' && <NumberField label="Esquinas (px)" value={data.cornerRadius ?? 8} min={0} max={40}
                onCommit={cornerRadius => updateNodeData(nodeId, {cornerRadius})}/>}
            <label className="block text-xs text-outline">Sombra<Select label="Sombra" value={data.shadow ?? 'none'}
                onValueChange={shadow => updateNodeData(nodeId, {shadow})} className="mt-1">
                <option value="none">Sin sombra</option><option value="soft">Suave</option><option value="strong">Marcada</option>
            </Select></label>
        </section>}
        {section === 'position' && <section className="space-y-3" aria-label={shape ? 'Posición de la forma' : 'Posición de la línea'}>
            <h3 className="text-xs font-semibold text-outline">Posición en el lienzo</h3>
            {shape ? <>
                <div className="flex gap-2"><NumberField label="X" value={position.x} min={-1_000_000} max={1_000_000}
                    onCommit={x => setPosition(nodeId, {x, y: position.y})}/><NumberField label="Y" value={position.y} min={-1_000_000} max={1_000_000}
                    onCommit={y => setPosition(nodeId, {x: position.x, y})}/></div>
                <div className="flex gap-2"><NumberField label="Ancho" value={width} min={40} max={2000}
                    onCommit={next => updateNodeSize(nodeId, next, height)}/><NumberField label="Alto" value={height} min={40} max={2000}
                    onCommit={next => updateNodeSize(nodeId, width, next)}/></div>
                <div role="group" aria-label="Alinear con el área visible" className="grid grid-cols-3 gap-1">{([['x', 'start', 'Izquierda'], ['x', 'center', 'Centro'], ['x', 'end', 'Derecha'], ['y', 'start', 'Arriba'], ['y', 'center', 'Medio'], ['y', 'end', 'Abajo']] as const).map(([axis, place, label]) =>
                    <button key={`${axis}-${place}`} type="button" aria-label={`Alinear ${label.toLowerCase()} con la vista`} data-tooltip={`Alinear ${label.toLowerCase()} con la vista`} onClick={() => alignToViewport(nodeId, axis, place)}
                        className="min-h-8 rounded-md bg-surface-variant/55 px-1 text-xs hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary">{label}</button>)}</div>
            </> : <>
                <div className="grid grid-cols-2 gap-2"><NumberField label="Inicio X" value={start.x} min={-1_000_000} max={1_000_000}
                    onCommit={x => moveEndpoint({...start, x}, end)}/><NumberField label="Inicio Y" value={start.y} min={-1_000_000} max={1_000_000}
                    onCommit={y => moveEndpoint({...start, y}, end)}/><NumberField label="Fin X" value={end.x} min={-1_000_000} max={1_000_000}
                    onCommit={x => moveEndpoint(start, {...end, x})}/><NumberField label="Fin Y" value={end.y} min={-1_000_000} max={1_000_000}
                    onCommit={y => moveEndpoint(start, {...end, y})}/></div>
            </>}
            <div className="flex gap-2"><button type="button" onClick={() => moveLayer(nodeId, 'front')}
                className={`${field} hover:bg-surface-variant`}>Traer al frente</button><button type="button" onClick={() => moveLayer(nodeId, 'back')}
                className={`${field} hover:bg-surface-variant`}>Enviar al fondo</button></div>
        </section>}
    </div>;
}
