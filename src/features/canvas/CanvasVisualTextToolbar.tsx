import {useEffect, useRef, useState, type ReactNode} from 'react';
import {AlignLeft, Bold, Copy, Eye, EyeOff, Italic, Layers, MoreHorizontal, Palette, SlidersHorizontal, Strikethrough, Trash2, Underline} from 'lucide-react';
import {useCanvasStore} from '../../store/useCanvasStore';
import {Select} from '../../components/ui/Select';
import {visualFonts, visualTextPalette} from './visualTextStyle';
import type {AnnotationData} from './nodes/AnnotationNode';
import type {VisualTextPanel} from './CanvasVisualTextInspector';
import {CanvasContextTool as Tool, canvasContextInputClass, canvasContextToolbarClass} from './CanvasContextTool';

export function CanvasVisualTextToolbar({nodeId, activePanel, onPanelToggle}: {
    nodeId: string;
    activePanel: VisualTextPanel | null;
    onPanelToggle: (panel: VisualTextPanel) => void;
}) {
    const node = useCanvasStore(state => state.nodes.find(item => item.id === nodeId));
    const updateNodeData = useCanvasStore(state => state.updateNodeData);
    const updateNodePresentation = useCanvasStore(state => state.updateNodePresentation);
    const duplicateNode = useCanvasStore(state => state.duplicateNode);
    const removeNodes = useCanvasStore(state => state.removeNodes);
    const [popover, setPopover] = useState<'color' | 'more' | null>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!popover) return;
        const close = (event: PointerEvent) => {if (!toolbarRef.current?.contains(event.target as Node)) setPopover(null);};
        const escape = (event: KeyboardEvent) => {if (event.key === 'Escape') setPopover(null);};
        document.addEventListener('pointerdown', close);
        document.addEventListener('keydown', escape);
        return () => {document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape);};
    }, [popover]);
    if (!node) return null;
    const data = node.data as AnnotationData;
    const set = (value: Partial<AnnotationData>) => updateNodeData(nodeId, value);
    const cycleCase = () => set({textCase: data.textCase === 'upper' ? 'lower' : data.textCase === 'lower' ? 'normal' : 'upper'});
    const panelTool = (panel: VisualTextPanel, label: string, icon: ReactNode) =>
        <Tool label={label} active={activePanel === panel} onClick={() => {setPopover(null); onPanelToggle(panel);}}>{icon}</Tool>;
    return <div ref={toolbarRef} role="toolbar" aria-label="Formato del texto visual"
        className={canvasContextToolbarClass}>
        <Select label="Fuente del texto visual" title="Fuente" value={data.fontFamily ?? 'system'}
            onValueChange={value => set({fontFamily: value as AnnotationData['fontFamily']})}
            className="theke-select--toolbar shrink-0 text-sm">
            {Object.entries(visualFonts).map(([key, font]) => <option key={key} value={key}>{font.label}</option>)}
        </Select>
        <input key={`${nodeId}-${data.fontSize ?? 16}`} type="number" inputMode="numeric" min={8} max={144}
            defaultValue={data.fontSize ?? 16} aria-label="Tamaño de letra" data-tooltip="Tamaño de letra"
            onBlur={event => {
                const size = Number(event.currentTarget.value);
                if (Number.isFinite(size)) set({fontSize: Math.max(8, Math.min(144, Math.round(size)))});
            }} onKeyDown={event => {if (event.key === 'Enter') event.currentTarget.blur();}}
            className={`${canvasContextInputClass} w-12`}/>
        <div className="relative shrink-0">
            <Tool label="Color del texto" active={popover === 'color'} onClick={() => setPopover(value => value === 'color' ? null : 'color')}>
                <Palette size={17} color={data.textColor ?? 'currentColor'}/>
            </Tool>
            {popover === 'color' && <div role="group" aria-label="Color del texto"
                className="absolute bottom-full left-0 z-50 mb-2 w-52 rounded-lg bg-surface/95 p-2.5 backdrop-blur-xl">
                <div className="flex flex-wrap items-center gap-2">
                    <button type="button" aria-label="Color del tema" data-tooltip="Color del tema" aria-pressed={!data.textColor}
                        onClick={() => set({textColor: undefined, color: 'default'})}
                        className="h-7 rounded-md bg-surface-variant/60 px-2 text-xs text-on-background focus-visible:outline-2 focus-visible:outline-primary">Tema</button>
                    {visualTextPalette.map(item => <button key={item.value} type="button" data-tooltip={item.name} aria-label={`Color ${item.name}`}
                        aria-pressed={data.textColor === item.value} onClick={() => set({textColor: item.value})}
                        style={{backgroundColor: item.value}}
                        className={`h-6 w-6 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${data.textColor === item.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}/>)}
                    <label data-tooltip="Color personalizado" className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full bg-surface-variant/60">
                        <input type="color" aria-label="Color personalizado del texto" value={data.textColor ?? '#37352f'}
                            onChange={event => set({textColor: event.target.value})} className="absolute -inset-2 h-12 w-12 cursor-pointer"/>
                    </label>
                </div>
            </div>}
        </div>
        <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-outline/20"/>
        <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto">
            <Tool label="Negrita" active={Boolean(data.bold)} onClick={() => set({bold: !data.bold})}><Bold size={16}/></Tool>
            <Tool label="Cursiva" active={Boolean(data.italic)} onClick={() => set({italic: !data.italic})}><Italic size={16}/></Tool>
            <Tool label="Subrayado" active={Boolean(data.underline)} onClick={() => set({underline: !data.underline})}><Underline size={16}/></Tool>
            <Tool label="Tachado" active={Boolean(data.strike)} onClick={() => set({strike: !data.strike})}><Strikethrough size={16}/></Tool>
            <Tool label="Alternar mayúsculas y minúsculas" active={Boolean(data.textCase && data.textCase !== 'normal')} onClick={cycleCase}>
                <span className="text-xs font-semibold">{data.textCase === 'upper' ? 'AA' : data.textCase === 'lower' ? 'aa' : 'Aa'}</span>
            </Tool>
            <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-outline/20"/>
            {panelTool('paragraph', 'Párrafo', <AlignLeft size={17}/>)}
            {panelTool('appearance', 'Apariencia', <SlidersHorizontal size={17}/>)}
            {panelTool('position', 'Posición', <Layers size={17}/>)}
        </div>
        <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-outline/20"/>
        <div className="relative shrink-0">
            <Tool label="Más opciones del texto" active={popover === 'more'} onClick={() => setPopover(value => value === 'more' ? null : 'more')}><MoreHorizontal size={18}/></Tool>
            {popover === 'more' && <div role="menu" aria-label="Opciones del texto visual"
                className="absolute bottom-full right-0 z-50 mb-2 min-w-44 rounded-lg bg-surface/95 p-1 text-sm backdrop-blur-xl">
                <button role="menuitem" type="button" onClick={() => {duplicateNode(nodeId); setPopover(null);}}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-surface-variant/55"><Copy size={16}/>Duplicar</button>
                <button role="menuitem" type="button" onClick={() => {updateNodePresentation(nodeId, {hidden: !node.hidden}); setPopover(null);}}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-surface-variant/55">
                    {node.hidden ? <Eye size={16}/> : <EyeOff size={16}/>}{node.hidden ? 'Mostrar' : 'Ocultar'}</button>
                <button role="menuitem" type="button" onClick={() => {removeNodes([nodeId]); setPopover(null);}}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-surface-variant/55"><Trash2 size={16}/>Eliminar</button>
            </div>}
        </div>
    </div>;
}
