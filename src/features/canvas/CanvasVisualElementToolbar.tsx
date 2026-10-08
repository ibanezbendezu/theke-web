import {useEffect, useRef, useState} from 'react';
import {Blend, Circle, ClipboardPaste, Copy, Eye, EyeOff, Layers, MoreHorizontal, Scissors, Square, Trash2} from 'lucide-react';
import {useCanvasStore} from '../../store/useCanvasStore';
import {contextMenuDestructiveItemClass, contextMenuDividerClass, contextMenuItemClass, contextMenuSurfaceClass} from '../../components/ui/contextMenuStyles';
import {visualTextPalette} from './visualTextStyle';
import type {AnnotationData} from './nodes/AnnotationNode';
import {TransparentSwatch} from './TransparentSwatch';
import {CanvasContextTool as Tool, canvasContextInputClass, canvasContextToolbarClass} from './CanvasContextTool';

export type VisualElementPanel = 'appearance' | 'position';
type Popover = 'fill' | 'stroke' | 'opacity' | 'more' | null;

function ColorChoices({value, label, onChange, allowNone = false}: {value?: string; label: string; onChange: (value?: string) => void; allowNone?: boolean}) {
    return <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
        <button type="button" aria-label="Color del tema" data-tooltip="Color del tema" aria-pressed={!value}
            onClick={() => onChange(undefined)}
            className="h-7 rounded-md bg-surface-variant/60 px-2 text-xs text-on-background focus-visible:outline-2 focus-visible:outline-primary">Tema</button>
        {allowNone && <button type="button" aria-label="Ninguno, fondo transparente" data-tooltip="Ninguno" aria-pressed={value === 'transparent'}
            onClick={() => onChange('transparent')}
            className={`flex h-7 w-7 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-primary ${value === 'transparent' ? 'bg-surface-variant ring-1 ring-primary' : 'hover:bg-surface-variant/55'}`}>
            <TransparentSwatch className="h-5 w-5"/>
        </button>}
        {visualTextPalette.map(item => <button key={item.value} type="button" data-tooltip={item.name} aria-label={`Color ${item.name}`}
            aria-pressed={value === item.value} onClick={() => onChange(item.value)}
            style={{backgroundColor: item.value}}
            className={`h-6 w-6 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${value === item.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}/>)}
        <label data-tooltip="Color personalizado" className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full bg-surface-variant/60">
            <input type="color" aria-label={`Color personalizado: ${label.toLowerCase()}`} value={value && /^#[0-9a-f]{6}$/i.test(value) ? value : '#787774'}
                onChange={event => onChange(event.target.value)} className="absolute -inset-2 h-12 w-12 cursor-pointer"/>
        </label>
    </div>;
}

export function CanvasVisualElementToolbar({nodeId, activePanel, onPanelToggle}: {
    nodeId: string;
    activePanel: VisualElementPanel | null;
    onPanelToggle: (panel: VisualElementPanel) => void;
}) {
    const node = useCanvasStore(state => state.nodes.find(item => item.id === nodeId));
    const updateNodeData = useCanvasStore(state => state.updateNodeData);
    const updateNodePresentation = useCanvasStore(state => state.updateNodePresentation);
    const duplicateNode = useCanvasStore(state => state.duplicateNode);
    const copyVisualNodes = useCanvasStore(state => state.copyVisualNodes);
    const cutVisualNodes = useCanvasStore(state => state.cutVisualNodes);
    const pasteVisualNodes = useCanvasStore(state => state.pasteVisualNodes);
    const canPaste = useCanvasStore(state => Boolean(state.visualClipboard?.nodes.length));
    const removeNodes = useCanvasStore(state => state.removeNodes);
    const beginGesture = useCanvasStore(state => state.beginGesture);
    const endGesture = useCanvasStore(state => state.endGesture);
    const [popover, setPopover] = useState<Popover>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const finishClipboardAction = () => {
        setPopover(null);
        document.querySelector<HTMLElement>('[role="region"][aria-label^="Lienzo interactivo"]')?.focus();
    };
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
    const shape = data.kind === 'shape';
    const strokeColor = data.outlineColor ?? (data.color === 'primary' ? 'var(--color-primary)' : data.color === 'muted' ? 'var(--color-outline)' : 'var(--color-on-background)');
    const set = (value: Partial<AnnotationData>) => updateNodeData(nodeId, value);
    const toggle = (next: Popover) => setPopover(current => current === next ? null : next);
    return <div ref={toolbarRef} role="toolbar" aria-label={shape ? 'Formato de la forma visual' : 'Formato de la línea visual'}
        className={canvasContextToolbarClass}>
        {shape && <>
            <Tool label="Rectángulo" active={(data.shape ?? 'rectangle') === 'rectangle'} onClick={() => set({shape: 'rectangle'})}><Square size={17}/></Tool>
            <Tool label="Elipse" active={data.shape === 'ellipse'} onClick={() => set({shape: 'ellipse'})}><Circle size={17}/></Tool>
            <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-outline/20"/>
            <div className="relative shrink-0"><Tool label="Relleno" active={popover === 'fill'} onClick={() => toggle('fill')}>
                {data.backgroundColor === 'transparent' ? <TransparentSwatch/> :
                    <span className="h-4 w-4 rounded-sm" style={{backgroundColor: data.backgroundColor ?? 'var(--color-surface-variant)'}}/>}
            </Tool>{popover === 'fill' && <div className="absolute bottom-full left-0 z-50 mb-2 w-52 rounded-lg bg-surface/95 p-2.5 backdrop-blur-xl">
                <ColorChoices value={data.backgroundColor} label="Relleno" allowNone onChange={backgroundColor => set({backgroundColor})}/>
            </div>}</div>
        </>}
        <div className="relative shrink-0"><Tool label={shape ? 'Color del contorno' : 'Color de la línea'} active={popover === 'stroke'} onClick={() => toggle('stroke')}>
            {shape ? <span className="h-4 w-4 rounded-sm border-[2.5px] bg-transparent" style={{borderColor: strokeColor}}/> :
                <span className="w-5 border-t-[3px]" style={{borderColor: strokeColor}}/>}
        </Tool>{popover === 'stroke' && <div className="absolute bottom-full left-0 z-50 mb-2 w-52 rounded-lg bg-surface/95 p-2.5 backdrop-blur-xl">
            <ColorChoices value={data.outlineColor} label={shape ? 'Contorno' : 'Línea'} onChange={outlineColor => set({outlineColor, color: 'default'})}/>
        </div>}</div>
        <input key={`${nodeId}-${data.thickness ?? (shape ? 2 : 3)}`} type="number" inputMode="numeric" min={shape ? 0 : 1} max={16}
            defaultValue={data.thickness ?? (shape ? 2 : 3)} aria-label={shape ? 'Grosor del contorno' : 'Grosor de la línea'} data-tooltip={shape ? 'Grosor del contorno' : 'Grosor de la línea'}
            onBlur={event => {
                const value = Number(event.currentTarget.value);
                if (Number.isFinite(value)) set({thickness: Math.max(shape ? 0 : 1, Math.min(16, Math.round(value)))});
            }} onKeyDown={event => {if (event.key === 'Enter') event.currentTarget.blur();}}
            className={`${canvasContextInputClass} w-12`}/>
        <Tool label={data.dash === 'dashed' ? 'Línea continua' : 'Línea discontinua'} active={data.dash === 'dashed'}
            onClick={() => set({dash: data.dash === 'dashed' ? 'solid' : 'dashed'})}>
            <span aria-hidden="true" className="w-5 border-t-2 border-dashed border-current"/>
        </Tool>
        <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-outline/20"/>
        {shape ? <Tool label="Apariencia" active={activePanel === 'appearance'} onClick={() => {setPopover(null); onPanelToggle('appearance');}}><Blend size={17}/></Tool> :
            <div className="relative shrink-0"><Tool label="Opacidad" active={popover === 'opacity'} onClick={() => toggle('opacity')}><Blend size={17}/></Tool>
                {popover === 'opacity' && <div className="absolute bottom-full right-0 z-50 mb-2 w-48 rounded-lg bg-surface/95 p-3 text-xs backdrop-blur-xl">
                    <label className="text-outline">Opacidad · {data.opacity ?? 100}%<input type="range" min={0} max={100}
                        value={data.opacity ?? 100} onPointerDown={beginGesture} onPointerUp={endGesture} onPointerCancel={endGesture}
                        onChange={event => set({opacity: Number(event.target.value)})} className="mt-2 w-full accent-primary"/></label>
                </div>}</div>}
        <Tool label="Posición" active={activePanel === 'position'} onClick={() => {setPopover(null); onPanelToggle('position');}}><Layers size={17}/></Tool>
        <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-outline/20"/>
        <div className="relative shrink-0"><Tool label={shape ? 'Más opciones de la forma' : 'Más opciones de la línea'} active={popover === 'more'} onClick={() => toggle('more')}><MoreHorizontal size={18}/></Tool>
            {popover === 'more' && <div role="menu" aria-label="Opciones del elemento visual"
                className={`absolute bottom-full right-0 z-50 mb-2 min-w-44 ${contextMenuSurfaceClass}`}>
                <button role="menuitem" type="button" onClick={() => {copyVisualNodes([nodeId]); finishClipboardAction();}}
                    className={contextMenuItemClass}><Copy size={16}/>Copiar</button>
                <button role="menuitem" type="button" onClick={() => {cutVisualNodes([nodeId]); finishClipboardAction();}}
                    className={contextMenuItemClass}><Scissors size={16}/>Cortar</button>
                {canPaste && <button role="menuitem" type="button" onClick={() => {pasteVisualNodes(); finishClipboardAction();}}
                    className={contextMenuItemClass}><ClipboardPaste size={16}/>Pegar</button>}
                <div className={contextMenuDividerClass}/>
                <button role="menuitem" type="button" onClick={() => {duplicateNode(nodeId); setPopover(null);}}
                    className={contextMenuItemClass}><Copy size={16}/>Duplicar</button>
                <button role="menuitem" type="button" onClick={() => {updateNodePresentation(nodeId, {hidden: !node.hidden}); setPopover(null);}}
                    className={contextMenuItemClass}>
                    {node.hidden ? <Eye size={16}/> : <EyeOff size={16}/>}{node.hidden ? 'Mostrar' : 'Ocultar'}</button>
                <button role="menuitem" type="button" onClick={() => {removeNodes([nodeId]); setPopover(null);}}
                    className={contextMenuDestructiveItemClass}><Trash2 size={16}/>Eliminar</button>
            </div>}
        </div>
    </div>;
}
