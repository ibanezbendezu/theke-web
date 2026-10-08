import {useEffect, useRef} from 'react';
import {ClipboardPaste, Copy, EyeOff, FolderOpen, Link2, Maximize2, Minimize2, Scissors, Settings2, Trash2, Ungroup} from 'lucide-react';
import {useCanvasStore} from '../../store/useCanvasStore';

export type CanvasNodeMenuTarget = {id: string; x: number; y: number};
type VisualKind = 'text' | 'shape' | 'line';

export function CanvasNodeContextMenu({target, onClose}: {
    target: CanvasNodeMenuTarget;
    onClose: (restoreFocus?: boolean) => void;
}) {
    const node = useCanvasStore(state => state.nodes.find(item => item.id === target.id));
    const canPaste = useCanvasStore(state => Boolean(state.visualClipboard?.nodes.length));
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
        const outside = (event: PointerEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) onClose();
        };
        const escape = (event: KeyboardEvent) => {if (event.key === 'Escape') onClose(true);};
        const scroll = (event: Event) => {if (!menuRef.current?.contains(event.target as Node)) onClose();};
        document.addEventListener('pointerdown', outside);
        document.addEventListener('keydown', escape);
        document.addEventListener('scroll', scroll, true);
        return () => {
            document.removeEventListener('pointerdown', outside);
            document.removeEventListener('keydown', escape);
            document.removeEventListener('scroll', scroll, true);
        };
    }, [onClose]);
    if (!node) return null;

    const kind = node.type === 'annotation' && ['text', 'shape', 'line'].includes(String(node.data.kind))
        ? node.data.kind as VisualKind : null;
    const mode = node.data.displayMode === 'normal' ? 'normal' : 'mini';
    const store = useCanvasStore.getState();
    const action = (label: string, Icon: typeof Copy, run: () => void, destructive = false) =>
        <button key={label} type="button" role="menuitem" onClick={() => {run(); onClose(true);}}
                className={`flex min-h-9 w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-surface-variant/60 focus-visible:outline-2 focus-visible:outline-primary ${destructive ? 'text-red-500' : 'text-on-background'}`}>
            <Icon size={16} className="shrink-0" aria-hidden="true"/>{label}
        </button>;
    const removeLabel = kind ? 'Eliminar elemento' : 'Quitar del mapa';
    const left = Math.max(8, Math.min(target.x, window.innerWidth - 216));
    const top = Math.max(8, Math.min(target.y, window.innerHeight - (kind ? canPaste ? 288 : 252 : 232)));

    return <div ref={menuRef} role="menu" aria-label={kind ? `Opciones de ${kind === 'text' ? 'texto' : kind === 'shape' ? 'forma' : 'línea'} visual` : `Opciones de ${node.type === 'resource' ? 'recurso' : node.type === 'folder' ? 'carpeta' : 'grupo'}`}
                className="fixed z-[100] w-52 max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-lg bg-surface/95 p-1.5 text-on-background ring-1 ring-outline/15 backdrop-blur-xl"
                style={{left, top}} onContextMenu={event => event.preventDefault()}>
        {kind ? <>
            {action('Copiar', Copy, () => store.copyVisualNodes([node.id]))}
            {action('Cortar', Scissors, () => store.cutVisualNodes([node.id]))}
            {canPaste && action('Pegar', ClipboardPaste, () => store.pasteVisualNodes())}
            <div className="mx-2 my-1 h-px bg-outline/15"/>
            {action('Duplicar', Copy, () => store.duplicateNode(node.id))}
            {action('Ocultar', EyeOff, () => {
                store.updateNodePresentation(node.id, {hidden: true});
                store.onNodesChange([{id: node.id, type: 'select', selected: false}]);
            })}
            <div className="mx-2 my-1 h-px bg-outline/15"/>
            {action(removeLabel, Trash2, () => store.removeNodes([node.id]), true)}
        </> : node.type === 'resource' ? <>
            {action('Abrir detalle', FolderOpen, () => store.openCanvasNode(node.id))}
            {action(mode === 'normal' ? 'Tamaño mini' : 'Tamaño normal', mode === 'normal' ? Minimize2 : Maximize2,
                () => store.setResourceDisplayMode(node.id, mode === 'normal' ? 'mini' : 'normal'))}
            {action('Crear relación', Link2, () => store.requestRelation(node.id))}
            <div className="mx-2 my-1 h-px bg-outline/15"/>
            {action(removeLabel, Trash2, () => store.removeNodes([node.id]), true)}
        </> : node.type === 'folder' ? <>
            {action('Explorar carpeta', FolderOpen, () => store.openCanvasNode(node.id))}
            {action(removeLabel, Trash2, () => store.removeNodes([node.id]), true)}
        </> : node.type === 'container' ? <>
            {action('Abrir propiedades', Settings2, () => store.openCanvasNode(node.id))}
            {action('Quitar grupo', Ungroup, () => store.ungroupNode(node.id))}
        </> : action('Abrir detalle', Settings2, () => store.openCanvasNode(node.id))}
    </div>;
}
