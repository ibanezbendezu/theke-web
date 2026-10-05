import type {ReactNode} from 'react';
import {AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Italic, List, ListOrdered, Strikethrough, Underline} from 'lucide-react';
import type {Node} from '@xyflow/react';
import {useCanvasStore} from '../../store/useCanvasStore';
import {visualFonts} from './visualTextStyle';
import type {AnnotationData} from './nodes/AnnotationNode';

const surface = 'min-h-9 w-full rounded-md border-0 bg-surface-variant px-2.5 text-sm text-on-background focus-visible:outline-2 focus-visible:outline-primary';
const palette = [
    {name: 'Negro', value: '#222222'}, {name: 'Blanco', value: '#ffffff'},
    {name: 'Gris', value: '#787774'}, {name: 'Rojo', value: '#d44c47'},
    {name: 'Naranja', value: '#d9730d'}, {name: 'Amarillo', value: '#b88700'},
    {name: 'Verde', value: '#448361'}, {name: 'Azul', value: '#337ea9'},
    {name: 'Morado', value: '#9065b0'}
];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function Option({label, pressed, onClick, children}: {label: string; pressed?: boolean; onClick: () => void; children: ReactNode}) {
    return <button type="button" aria-label={label} title={label} aria-pressed={pressed}
                   onClick={onClick}
                   className={`flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm focus-visible:outline-2 focus-visible:outline-primary ${pressed ? 'bg-on-background text-background' : 'text-on-background hover:bg-surface-variant'}`}>{children}</button>;
}

function NumberField({label, value, min, max, step = 1, onCommit}: {label: string; value: number; min: number; max: number; step?: number; onCommit: (value: number) => void}) {
    return <label className="min-w-0 flex-1 text-xs text-outline">{label}<input key={value} type="number" inputMode="decimal"
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

export function CanvasVisualTextInspector({nodeId}: {nodeId: string}) {
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
    const cycleCase = () => set({textCase: data.textCase === 'upper' ? 'lower' : data.textCase === 'lower' ? 'normal' : 'upper'});
    return <div className="space-y-5">
        <Section title="Contenido">
            <textarea aria-label="Contenido del texto visual" value={data.text ?? ''}
                      onChange={event => set({text: event.target.value})}
                      onBlur={event => {if (!event.currentTarget.value.trim()) set({text: 'Escribe una anotación'});}}
                      className="min-h-24 w-full resize-y rounded-md border-0 bg-surface-variant p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-primary"
                      placeholder="Escribe aquí o haz doble clic en el texto del mapa"/>
            <p className="text-xs text-outline">Cada línea se convierte en un elemento al activar una lista.</p>
        </Section>
        <Section title="Tipografía">
            <div className="flex gap-2"><label className="min-w-0 flex-[2] text-xs text-outline">Fuente<select
                value={data.fontFamily ?? 'system'} onChange={event => set({fontFamily: event.target.value as AnnotationData['fontFamily']})}
                className={`mt-1 ${surface}`}>
                {Object.entries(visualFonts).map(([key, font]) => <option key={key} value={key}>{font.label}</option>)}
            </select></label><NumberField label="Tamaño" value={data.fontSize ?? 16} min={8} max={144}
                onCommit={fontSize => set({fontSize})}/></div>
            <div><span className="text-xs text-outline">Color del texto</span><div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Option label="Color del tema" pressed={!data.textColor && (!data.color || data.color === 'default')}
                        onClick={() => set({textColor: undefined, color: 'default'})}>Tema</Option>
                {palette.map(item => <button key={item.value} type="button" title={item.name} aria-label={`Color ${item.name}`}
                    aria-pressed={data.textColor === item.value} onClick={() => set({textColor: item.value})}
                    style={{backgroundColor: item.value}}
                    className={`h-6 w-6 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${data.textColor === item.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}/>)}
                <label title="Color personalizado" aria-label="Color personalizado" className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full bg-surface-variant ring-1 ring-border">
                    <input type="color" aria-label="Color personalizado del texto" value={data.textColor ?? '#37352f'}
                        onChange={event => set({textColor: event.target.value})} className="absolute -inset-2 h-12 w-12 cursor-pointer"/>
                </label>
            </div></div>
        </Section>
        <Section title="Formato">
            <div className="flex flex-wrap gap-1 rounded-lg bg-surface/60 p-1">
                <Option label="Negrita" pressed={Boolean(data.bold)} onClick={() => set({bold: !data.bold})}><Bold size={16}/></Option>
                <Option label="Cursiva" pressed={Boolean(data.italic)} onClick={() => set({italic: !data.italic})}><Italic size={16}/></Option>
                <Option label="Subrayado" pressed={Boolean(data.underline)} onClick={() => set({underline: !data.underline})}><Underline size={16}/></Option>
                <Option label="Tachado" pressed={Boolean(data.strike)} onClick={() => set({strike: !data.strike})}><Strikethrough size={16}/></Option>
                <Option label="Alternar mayúsculas y minúsculas" pressed={data.textCase !== undefined && data.textCase !== 'normal'} onClick={cycleCase}>{data.textCase === 'upper' ? 'AA' : data.textCase === 'lower' ? 'aa' : 'Aa'}</Option>
            </div>
        </Section>
        <Section title="Párrafo">
            <div className="flex flex-wrap gap-1 rounded-lg bg-surface/60 p-1">
                {([['left', AlignLeft, 'Alinear a la izquierda'], ['center', AlignCenter, 'Centrar texto'], ['right', AlignRight, 'Alinear a la derecha'], ['justify', AlignJustify, 'Justificar texto']] as const).map(([value, Icon, label]) =>
                    <Option key={value} label={label} pressed={(data.align ?? 'left') === value} onClick={() => set({align: value})}><Icon size={16}/></Option>)}
            </div>
            <div className="flex gap-1 rounded-lg bg-surface/60 p-1">
                <Option label="Sin lista" pressed={!data.listStyle || data.listStyle === 'none'} onClick={() => set({listStyle: 'none'})}>Texto</Option>
                <Option label="Lista con viñetas" pressed={data.listStyle === 'bullet'} onClick={() => set({listStyle: 'bullet'})}><List size={16}/></Option>
                <Option label="Lista numerada" pressed={data.listStyle === 'number'} onClick={() => set({listStyle: 'number'})}><ListOrdered size={16}/></Option>
            </div>
            <div className="flex gap-2"><NumberField label="Interletraje (px)" value={data.letterSpacing ?? 0} min={-3} max={20} step={0.1}
                onCommit={letterSpacing => set({letterSpacing})}/><NumberField label="Interlineado" value={data.lineHeight ?? 1.4} min={0.8} max={3} step={0.1}
                onCommit={lineHeight => set({lineHeight})}/></div>
        </Section>
        <Section title="Apariencia">
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
                className="mt-1 block h-9 w-full cursor-pointer rounded-md border-0 bg-surface-variant p-1"/></label>
                <Option label="Sin fondo" pressed={!data.backgroundColor} onClick={() => set({backgroundColor: undefined})}>Ninguno</Option></div>
            <div className="flex items-end gap-2"><NumberField label="Esquinas (px)" value={data.cornerRadius ?? 0} min={0} max={40}
                onCommit={cornerRadius => set({cornerRadius})}/><Option label="Puntas rectas" pressed={!data.cornerRadius} onClick={() => set({cornerRadius: 0})}>Rectas</Option><Option label="Puntas curvas" pressed={Boolean(data.cornerRadius)} onClick={() => set({cornerRadius: 12})}>Curvas</Option></div>
        </Section>
        <Section title="Posición en el lienzo">
            <div className="flex gap-2"><NumberField label="X" value={Math.round(position.x)} min={-1_000_000} max={1_000_000}
                onCommit={x => setPosition(nodeId, {x, y: position.y})}/><NumberField label="Y" value={Math.round(position.y)} min={-1_000_000} max={1_000_000}
                onCommit={y => setPosition(nodeId, {x: position.x, y})}/></div>
            <div className="flex items-end gap-2"><NumberField label="Ancho" value={Math.round(node.width ?? 240)} min={40} max={2000}
                onCommit={width => updateNodeSize(nodeId, width, node.height ?? 40)}/>
                <span className="flex-1 pb-2 text-xs text-outline">Alto automático · {Math.round(node.height ?? 40)} px</span></div>
            <p className="text-xs text-outline">Alinear con el área visible</p>
            <div className="grid grid-cols-3 gap-1">{([['x', 'start', 'Izquierda'], ['x', 'center', 'Centro'], ['x', 'end', 'Derecha'], ['y', 'start', 'Arriba'], ['y', 'center', 'Medio'], ['y', 'end', 'Abajo']] as const).map(([axis, place, label]) =>
                <button key={`${axis}-${place}`} type="button" onClick={() => alignToViewport(nodeId, axis, place)}
                    className="min-h-8 rounded-md bg-surface-variant px-1 text-xs hover:bg-outline/15 focus-visible:outline-2 focus-visible:outline-primary">{label}</button>)}</div>
            <div className="flex gap-2"><button type="button" onClick={() => moveLayer(nodeId, 'front')}
                className={`${surface} hover:bg-outline/15`}>Traer al frente</button><button type="button" onClick={() => moveLayer(nodeId, 'back')}
                className={`${surface} hover:bg-outline/15`}>Enviar al fondo</button></div>
        </Section>
    </div>;
}
