import type {ReactNode} from 'react';
import {AlignCenter, AlignJustify, AlignLeft, AlignRight, List, ListOrdered} from 'lucide-react';
import type {Node} from '@xyflow/react';
import {useCanvasStore} from '../../store/useCanvasStore';
import type {AnnotationData} from './nodes/AnnotationNode';

export type VisualTextPanel = 'paragraph' | 'appearance' | 'position';

const surface = 'min-h-9 w-full rounded-md border-0 bg-surface-variant/55 px-2.5 text-sm text-on-background focus-visible:outline-2 focus-visible:outline-primary';
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function Option({label, pressed, onClick, children}: {label: string; pressed?: boolean; onClick: () => void; children: ReactNode}) {
    return <button type="button" aria-label={label} title={label} aria-pressed={pressed}
                   onClick={onClick}
                   className={`flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm focus-visible:outline-2 focus-visible:outline-primary ${pressed ? 'bg-surface-variant text-on-background' : 'text-outline hover:bg-surface-variant/55 hover:text-on-background'}`}>{children}</button>;
}

function NumberField({label, value, min, max, step = 1, onCommit}: {label: string; value: number; min: number; max: number; step?: number; onCommit: (value: number) => void}) {
    return <label className="block min-w-0 flex-1 text-xs text-outline">{label}<input key={value} type="number" inputMode="decimal"
        min={min} max={max} step={step} defaultValue={value}
        onBlur={event => {
            const parsed = Number(event.currentTarget.value);
            if (Number.isFinite(parsed)) onCommit(clamp(parsed, min, max));
            else event.currentTarget.value = String(value);
        }} onKeyDown={event => {if (event.key === 'Enter') event.currentTarget.blur();}}
        className={`mt-1 ${surface}`}/></label>;
}

function Section({title, children}: {title: string; children: ReactNode}) {
    return <section className="space-y-2.5"><h3 className="text-xs font-semibold text-outline">{title}</h3>{children}</section>;
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

export function CanvasVisualTextInspector({nodeId, section}: {nodeId: string; section: VisualTextPanel}) {
    const nodes = useCanvasStore(state => state.nodes);
    const node = nodes.find(item => item.id === nodeId);
    const updateNodeData = useCanvasStore(state => state.updateNodeData);
    const updateNodeSize = useCanvasStore(state => state.updateNodeSize);
    const setPosition = useCanvasStore(state => state.setNodeAbsolutePosition);
    const alignToViewport = useCanvasStore(state => state.alignNodeToViewport);
    const moveLayer = useCanvasStore(state => state.moveNodeLayer);
    const beginGesture = useCanvasStore(state => state.beginGesture);
    const endGesture = useCanvasStore(state => state.endGesture);
    if (!node) return null;
    const data = node.data as AnnotationData;
    const set = (value: Partial<AnnotationData>) => updateNodeData(nodeId, value);
    const position = absolutePosition(node, nodes);
    return <div className="space-y-5">
        {section === 'paragraph' && <Section title="Párrafo">
            <div className="flex flex-wrap gap-1 rounded-lg bg-surface-variant/25 p-1">
                {([['left', AlignLeft, 'Alinear a la izquierda'], ['center', AlignCenter, 'Centrar texto'], ['right', AlignRight, 'Alinear a la derecha'], ['justify', AlignJustify, 'Justificar texto']] as const).map(([value, Icon, label]) =>
                    <Option key={value} label={label} pressed={(data.align ?? 'left') === value} onClick={() => set({align: value})}><Icon size={16}/></Option>)}
            </div>
            <div className="flex gap-1 rounded-lg bg-surface-variant/25 p-1">
                <Option label="Sin lista" pressed={!data.listStyle || data.listStyle === 'none'} onClick={() => set({listStyle: 'none'})}>Texto</Option>
                <Option label="Lista con viñetas. Cada línea será un elemento" pressed={data.listStyle === 'bullet'} onClick={() => set({listStyle: 'bullet'})}><List size={16}/></Option>
                <Option label="Lista numerada. Cada línea será un elemento" pressed={data.listStyle === 'number'} onClick={() => set({listStyle: 'number'})}><ListOrdered size={16}/></Option>
            </div>
            <div className="flex gap-2"><NumberField label="Interletraje (px)" value={data.letterSpacing ?? 0} min={-3} max={20} step={0.1}
                onCommit={letterSpacing => set({letterSpacing})}/><NumberField label="Interlineado" value={data.lineHeight ?? 1.4} min={0.8} max={3} step={0.1}
                onCommit={lineHeight => set({lineHeight})}/></div>
        </Section>}
        {section === 'appearance' && <Section title="Apariencia">
            <label className="block text-xs text-outline">Opacidad · {data.opacity ?? 100}%<input type="range" min={0} max={100}
                value={data.opacity ?? 100} onPointerDown={beginGesture} onPointerUp={endGesture} onPointerCancel={endGesture}
                onChange={event => set({opacity: Number(event.target.value)})} className="mt-1 w-full accent-primary"/></label>
            <label className="block text-xs text-outline">Sombra<select value={data.shadow ?? 'none'}
                onChange={event => set({shadow: event.target.value as AnnotationData['shadow']})} className={`mt-1 ${surface}`}>
                <option value="none">Sin sombra</option><option value="soft">Suave</option><option value="strong">Marcada</option>
            </select></label>
            <div className="flex items-end gap-2"><NumberField label="Contorno (px)" value={data.outlineWidth ?? 0} min={0} max={12}
                onCommit={outlineWidth => set({outlineWidth})}/><label className="text-xs text-outline">Color<input type="color"
                aria-label="Color del contorno" value={data.outlineColor ?? '#787774'} onChange={event => set({outlineColor: event.target.value})}
                className="mt-1 block h-9 w-12 cursor-pointer rounded-md border-0 bg-surface-variant p-1"/></label></div>
            <div className="flex items-end gap-2"><label className="min-w-0 flex-1 text-xs text-outline">Fondo<input type="color"
                aria-label="Color de fondo" value={data.backgroundColor ?? '#ffffff'} onChange={event => set({backgroundColor: event.target.value})}
                className="mt-1 block h-9 w-12 cursor-pointer rounded-md border-0 bg-surface-variant/55 p-1"/></label>
                <Option label="Sin fondo" pressed={!data.backgroundColor} onClick={() => set({backgroundColor: undefined})}>Ninguno</Option></div>
            <div className="flex items-end gap-2"><NumberField label="Esquinas (px)" value={data.cornerRadius ?? 0} min={0} max={40}
                onCommit={cornerRadius => set({cornerRadius})}/><Option label="Puntas rectas" pressed={!data.cornerRadius} onClick={() => set({cornerRadius: 0})}>Rectas</Option><Option label="Puntas curvas" pressed={Boolean(data.cornerRadius)} onClick={() => set({cornerRadius: 12})}>Curvas</Option></div>
        </Section>}
        {section === 'position' && <Section title="Posición en el lienzo">
            <div className="flex gap-2"><NumberField label="X" value={Math.round(position.x)} min={-1_000_000} max={1_000_000}
                onCommit={x => setPosition(nodeId, {x, y: position.y})}/><NumberField label="Y" value={Math.round(position.y)} min={-1_000_000} max={1_000_000}
                onCommit={y => setPosition(nodeId, {x: position.x, y})}/></div>
            <NumberField label="Ancho" value={Math.round(node.width ?? 240)} min={40} max={2000}
                onCommit={width => updateNodeSize(nodeId, width, node.height ?? 40)}/>
            <div role="group" aria-label="Alinear con el área visible" className="grid grid-cols-3 gap-1">{([['x', 'start', 'Izquierda'], ['x', 'center', 'Centro'], ['x', 'end', 'Derecha'], ['y', 'start', 'Arriba'], ['y', 'center', 'Medio'], ['y', 'end', 'Abajo']] as const).map(([axis, place, label]) =>
                <button key={`${axis}-${place}`} type="button" title={`Alinear ${label.toLowerCase()} con la vista`} onClick={() => alignToViewport(nodeId, axis, place)}
                    className="min-h-8 rounded-md bg-surface-variant/55 px-1 text-xs hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary">{label}</button>)}</div>
            <div className="flex gap-2"><button type="button" onClick={() => moveLayer(nodeId, 'front')}
                className={`${surface} hover:bg-outline/15`}>Traer al frente</button><button type="button" onClick={() => moveLayer(nodeId, 'back')}
                className={`${surface} hover:bg-outline/15`}>Enviar al fondo</button></div>
        </Section>}
    </div>;
}
