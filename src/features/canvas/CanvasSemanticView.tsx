import {useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {GripVertical, MoreHorizontal} from 'lucide-react';
import {Select} from '../../components/ui/Select';
import {useOrganization} from '../../data/useOrganization';
import {useLibraryFolders} from '../../data/useLibraryFolders';
import {useCanvasStore} from '../../store/useCanvasStore';
import {useRelation} from '../../data/useRelations';

const evidenceLabel = {none: 'sin evidencia citada', needs_evidence: 'falta evidencia', confirmed: 'evidencia citada'};

function SemanticRelationItem({relationId, edgeId, otherTitle, hidden}: {
    relationId: string;
    edgeId: string;
    otherTitle: string;
    hidden: boolean
}) {
    const relation = useRelation(relationId);
    const detail = relation.data;
    const label = detail?.label || detail?.typeLabel || 'Relación';
    const announcement = detail ? `${detail.source.title} ${detail.direction === 'directed' ? 'hacia' : 'con'} ${detail.target.title}, ${label}, ${detail.direction === 'directed' ? 'dirigida' : 'no dirigida'}, ${evidenceLabel[detail.evidenceStatus]}` : `Relación con ${otherTitle}`;
    return <li>
        <button type="button"
                className="w-full rounded-md bg-surface-variant/60 p-2 text-left focus-visible:outline-2 focus-visible:outline-primary"
                aria-label={`Seleccionar ${announcement}${hidden ? ', oculta' : ''}`}
                onClick={() => hidden ? useCanvasStore.getState().setEdgeHidden(edgeId, false) : useCanvasStore.getState().focusEdge(edgeId)}>
            <span className="block font-medium">{label} · {otherTitle}</span><span
            className="text-xs text-outline">{hidden ? 'Oculta · Mostrar línea' : detail ? evidenceLabel[detail.evidenceStatus] : 'Cargando detalle…'}</span>
        </button>
    </li>;
}

export function CanvasSemanticView({projectId}: { projectId: string }) {
    const nodes = useCanvasStore(state => state.nodes);
    const edges = useCanvasStore(state => state.edges);
    const organization = useOrganization(projectId);
    const libraryFolders = useLibraryFolders();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<{id: string; placement: 'before' | 'after'} | null>(null);
    const [menu, setMenu] = useState<{id: string; left: number; top?: number; bottom?: number} | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const firstMenuAction = useRef<HTMLButtonElement>(null);
    const menuButtons = useRef(new Map<string, HTMLButtonElement>());
    const focusAfterDelete = useRef<string | null>(null);
    const buttons = useRef(new Map<string, HTMLButtonElement>());
    const selected = nodes.find(node => node.selected) ?? nodes.find(node => node.id === selectedId);
    const menuNode = nodes.find(node => node.id === menu?.id);
    const groups = nodes.filter(node => node.type === 'container');
    const ordered = useMemo(() => {
        const byId = new Map(nodes.map(node => [node.id, node]));
        const index = new Map(nodes.map((node, position) => [node.id, position]));
        const depth = (id: string) => {
            let count = 0;
            let current = byId.get(id);
            const seen = new Set<string>();
            while (current?.parentId && !seen.has(current.parentId)) {
                seen.add(current.parentId);
                count++;
                current = byId.get(current.parentId);
            }
            return count;
        };
        const seen = new Set<string>();
        const visit = (parent?: string): typeof nodes => nodes.filter(node => node.parentId === parent && !seen.has(node.id)).sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0) || (index.get(b.id) ?? 0) - (index.get(a.id) ?? 0)).flatMap(node => {
            seen.add(node.id);
            return [node, ...visit(node.id)];
        });
        const visited = visit();
        const ids = new Set(visited.map(node => node.id));
        return [...visited, ...nodes.filter(node => !ids.has(node.id))].map(node => ({
            node,
            depth: Math.min(depth(node.id), 8)
        }));
    }, [nodes]);
    const title = (node: typeof nodes[number]) => {
        const local = node.data.caption || node.data.label || node.data.text;
        if (typeof local === 'string' && local.trim()) return local;
        if (node.type === 'resource') return organization.data?.resources.find(item => item.resourceId === node.data.resourceId)?.title ?? 'Recurso';
        if (node.type === 'folder') return typeof node.data.libraryFolderId === 'string'
            ? libraryFolders.data?.find(item => item.id === node.data.libraryFolderId)?.name ?? 'Carpeta de Biblioteca'
            : organization.data?.folders.find(item => item.id === node.data.folderId)?.name ?? 'Carpeta de proyecto';
        return node.type === 'container' ? 'Grupo visual' : node.type === 'annotation' ? 'Anotación visual' : 'Elemento visual';
    };
    const type = (node: typeof nodes[number]) => node.type === 'resource' ? 'Recurso' : node.type === 'folder' ? 'Carpeta' : node.type === 'container' ? 'Grupo' : node.type === 'annotation' ? 'Anotación' : 'Elemento';
    const relationEdges = menuNode?.type === 'resource' ? edges.filter(edge => typeof edge.data?.relationId === 'string' && (edge.source === menuNode.id || edge.target === menuNode.id)) : [];
    const relationSections = [
        {
            title: 'Relaciones salientes',
            items: relationEdges.filter(edge => edge.data?.direction === 'directed' && edge.source === menuNode?.id)
        },
        {
            title: 'Relaciones entrantes',
            items: relationEdges.filter(edge => edge.data?.direction === 'directed' && edge.target === menuNode?.id)
        },
        {title: 'Relaciones no dirigidas', items: relationEdges.filter(edge => edge.data?.direction !== 'directed')},
    ];
    const select = (id: string) => {
        setSelectedId(id);
        useCanvasStore.getState().focusNode(id);
    };
    useEffect(() => {
        if (focusAfterDelete.current) {
            buttons.current.get(focusAfterDelete.current)?.focus();
            focusAfterDelete.current = null;
        }
    }, [nodes]);
    const remove = (id: string) => {
        const next = ordered.find(item => item.node.id !== id)?.node;
        if (next) focusAfterDelete.current = next.id;
        useCanvasStore.getState().removeNodes([id]);
        if (next) select(next.id);
        setMenu(null);
    };
    const move = (id: string, axis: 'x' | 'y', amount: number) => {
        const node = nodes.find(item => item.id === id);
        if (!node) return;
        const position = {...node.position, [axis]: node.position[axis] + amount};
        useCanvasStore.getState().onNodesChange([{id, type: 'position', position}]);
    };
    const moveLayerStep = (id: string, direction: 'front' | 'back') => {
        const node = nodes.find(item => item.id === id);
        if (!node) return;
        const siblings = ordered.filter(item => item.node.parentId === node.parentId).map(item => item.node.id);
        const index = siblings.indexOf(id);
        const neighbor = siblings[index + (direction === 'front' ? -1 : 1)];
        if (neighbor) useCanvasStore.getState().reorderNodeLayer(id, neighbor, direction === 'front' ? 'before' : 'after');
    };
    const closeMenu = (restoreFocus = true) => {
        if (restoreFocus && menu) menuButtons.current.get(menu.id)?.focus();
        setMenu(null);
    };
    useEffect(() => {
        if (!menu) return;
        firstMenuAction.current?.focus();
        const pointerDown = (event: PointerEvent) => {
            if (!menuRef.current?.contains(event.target as Node) && !menuButtons.current.get(menu.id)?.contains(event.target as Node)) setMenu(null);
        };
        const keyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                menuButtons.current.get(menu.id)?.focus();
                setMenu(null);
            }
        };
        const scroll = (event: Event) => {if (!menuRef.current?.contains(event.target as Node)) setMenu(null);};
        document.addEventListener('pointerdown', pointerDown);
        document.addEventListener('keydown', keyDown);
        document.addEventListener('scroll', scroll, true);
        return () => {
            document.removeEventListener('pointerdown', pointerDown);
            document.removeEventListener('keydown', keyDown);
            document.removeEventListener('scroll', scroll, true);
        };
    }, [menu]);
    const canDrop = (sourceId: string | null, targetId: string) => {
        const source = nodes.find(node => node.id === sourceId);
        const target = nodes.find(node => node.id === targetId);
        return Boolean(source && target && source.id !== target.id && source.parentId === target.parentId);
    };
    return <><aside className="h-full w-full overflow-auto p-4 text-sm" aria-label="Vista semántica">
        <h2 className="font-semibold">Vista semántica</h2><p className="mt-1 text-xs text-outline">Arrastra para ordenar capas. Arriba queda delante.</p>
        <ol className="mt-3 space-y-1">{ordered.map(({node, depth}) => <li key={node.id}
                                                                           style={{paddingLeft: depth * 12}}
                                                                           draggable
                                                                           className="cursor-grab active:cursor-grabbing"
                                                                           onDragStart={event => {
                                                                               setDraggedId(node.id);
                                                                               event.dataTransfer.effectAllowed = 'move';
                                                                               event.dataTransfer.setData('text/plain', node.id);
                                                                           }}
                                                                           onDragOver={event => {
                                                                               const sourceId = draggedId || event.dataTransfer.getData('text/plain');
                                                                               if (!canDrop(sourceId, node.id)) {
                                                                                   setDropTarget(null);
                                                                                   return;
                                                                               }
                                                                               event.preventDefault();
                                                                               event.dataTransfer.dropEffect = 'move';
                                                                               const placement = event.clientY < event.currentTarget.getBoundingClientRect().top + event.currentTarget.getBoundingClientRect().height / 2 ? 'before' : 'after';
                                                                               setDropTarget(current => current?.id === node.id && current.placement === placement ? current : {id: node.id, placement});
                                                                           }}
                                                                           onDrop={event => {
                                                                               event.preventDefault();
                                                                               const sourceId = draggedId || event.dataTransfer.getData('text/plain');
                                                                               if (canDrop(sourceId, node.id) && sourceId) useCanvasStore.getState().reorderNodeLayer(sourceId, node.id, dropTarget?.id === node.id ? dropTarget.placement : 'before');
                                                                               setDraggedId(null);
                                                                               setDropTarget(null);
                                                                           }}
                                                                           onDragEnd={() => { setDraggedId(null); setDropTarget(null); }}>
            <div className={`flex items-center gap-1 rounded-md ${dropTarget?.id === node.id ? dropTarget.placement === 'before' ? 'border-t-2 border-primary' : 'border-b-2 border-primary' : ''} ${draggedId === node.id ? 'opacity-50' : ''}`}>
            <GripVertical aria-hidden="true" size={15} className="shrink-0 text-outline"/>
            <button ref={element => {
                if (element) buttons.current.set(node.id, element); else buttons.current.delete(node.id);
            }} type="button" aria-label={`${title(node)} — ${type(node)}${node.hidden ? ', oculto' : ''}`}
                    aria-current={selected?.id === node.id ? 'true' : undefined} onClick={() => select(node.id)}
                    className={`min-w-0 flex-1 rounded-md p-2 text-left focus-visible:outline-2 focus-visible:outline-primary ${selected?.id === node.id ? 'bg-surface-variant' : 'hover:bg-surface-variant/60'}`}>
                <span className="block truncate font-medium">{title(node)}</span><span
                className="text-xs text-outline">{type(node)}{node.hidden ? ' · Oculto' : ''}</span></button>
                <button ref={element => {if (element) menuButtons.current.set(node.id, element); else menuButtons.current.delete(node.id);}}
                        type="button" aria-label={`Opciones de ${title(node)}`} aria-expanded={menu?.id === node.id}
                        className="shrink-0 rounded-md p-1.5 text-outline hover:bg-surface-variant hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary"
                        onClick={event => {
                            if (menu?.id === node.id) {setMenu(null); return;}
                            const rect = event.currentTarget.getBoundingClientRect();
                            const above = window.innerHeight - rect.bottom < 320 && rect.top > window.innerHeight - rect.bottom;
                            setMenu({id: node.id, left: Math.max(8, Math.min(rect.right - 256, window.innerWidth - 264)),
                                ...(above ? {bottom: window.innerHeight - rect.top + 4} : {top: rect.bottom + 4})});
                        }}><MoreHorizontal size={17}/></button></div>
        </li>)}</ol>
        {ordered.length === 0 && <p className="mt-3 text-xs text-outline">No hay elementos en el diagrama.</p>}
    </aside>
    {menu && menuNode && createPortal(<div ref={menuRef} role="dialog" aria-label={`Opciones de ${title(menuNode)}`}
        className="fixed z-[90] w-64 max-h-[min(26rem,calc(100dvh-1rem))] overflow-auto rounded-xl bg-surface/95 p-2 text-sm text-on-background ring-1 ring-outline/15 backdrop-blur-md"
        style={{left: menu.left, ...(menu.top === undefined ? {bottom: menu.bottom} : {top: menu.top})}}>
        <p className="truncate px-2 py-1.5 font-medium">{title(menuNode)}</p>
        <button ref={firstMenuAction} type="button" className="w-full rounded-md px-2 py-2 text-left hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary"
                onClick={() => {useCanvasStore.getState().openCanvasNode(menuNode.id); useCanvasStore.getState().setInspectorOpen(true); closeMenu();}}>Abrir detalle</button>
        <button type="button" className="w-full rounded-md px-2 py-2 text-left hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary"
                onClick={() => {useCanvasStore.getState().requestRelation(menuNode.id); closeMenu();}}>{menuNode.type === 'resource' ? 'Conectar con otro recurso' : 'Conectar elemento…'}</button>
        {menuNode.type === 'resource' && <details className="rounded-md px-2 py-2">
            <summary className="cursor-pointer focus-visible:outline-2 focus-visible:outline-primary">Relaciones ({relationEdges.length})</summary>
            <div className="mt-2 space-y-2">{relationSections.map(section => <div key={section.title}>
                <p className="mb-1 text-xs text-outline">{section.title} ({section.items.length})</p>
                {section.items.length ? <ul className="space-y-1">{section.items.map(edge => {
                    const other = nodes.find(node => node.id === (edge.source === menuNode.id ? edge.target : edge.source));
                    return <SemanticRelationItem key={edge.id} relationId={edge.data!.relationId as string} edgeId={edge.id}
                        otherTitle={other ? title(other) : 'Recurso'} hidden={Boolean(edge.hidden)}/>;
                })}</ul> : <p className="text-xs text-outline">Ninguna.</p>}</div>)}</div>
        </details>}
        <div className="my-1 h-px bg-outline/15"/>
        <button type="button" className="w-full rounded-md px-2 py-2 text-left hover:bg-surface-variant disabled:opacity-40"
                disabled={!ordered.some((item, index) => item.node.id === menuNode.id && ordered.slice(0, index).some(previous => previous.node.parentId === menuNode.parentId))}
                onClick={() => moveLayerStep(menuNode.id, 'front')}>Traer adelante</button>
        <button type="button" className="w-full rounded-md px-2 py-2 text-left hover:bg-surface-variant disabled:opacity-40"
                disabled={!ordered.some((item, index) => item.node.id === menuNode.id && ordered.slice(index + 1).some(next => next.node.parentId === menuNode.parentId))}
                onClick={() => moveLayerStep(menuNode.id, 'back')}>Enviar atrás</button>
        <details className="rounded-md px-2 py-2"><summary className="cursor-pointer focus-visible:outline-2 focus-visible:outline-primary">Mover en el lienzo</summary>
            <div className="mt-2 grid grid-cols-2 gap-1" aria-label="Mover elemento">{([['Izquierda', 'x', -20], ['Derecha', 'x', 20], ['Arriba', 'y', -20], ['Abajo', 'y', 20]] as const).map(([label, axis, amount]) =>
                <button key={label} type="button" className="rounded-md bg-surface-variant/60 p-2 hover:bg-surface-variant"
                    onClick={() => move(menuNode.id, axis, amount)}>Mover {label.toLowerCase()}</button>)}</div>
        </details>
        {menuNode.type !== 'container' && <label className="block px-2 py-2">Grupo<Select label="Grupo visual del elemento" className="mt-1"
            value={menuNode.parentId ?? ''} onValueChange={value => useCanvasStore.getState().moveNodeToGroup(menuNode.id, value || undefined)}>
            <option value="">Sin grupo</option>{groups.map(group => <option key={group.id} value={group.id}>{title(group)}</option>)}
        </Select></label>}
        <div className="my-1 h-px bg-outline/15"/>
        <button type="button" className="w-full rounded-md px-2 py-2 text-left text-red-600 hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary"
                onClick={() => remove(menuNode.id)}>{menuNode.type === 'container' ? 'Quitar grupo y conservar elementos' : 'Quitar representación del diagrama'}</button>
        <button type="button" className="w-full rounded-md px-2 py-2 text-left hover:bg-surface-variant disabled:opacity-40"
                disabled={useCanvasStore.getState().past.length === 0}
                onClick={() => {useCanvasStore.getState().undo(); closeMenu();}}>Deshacer</button>
    </div>, document.body)}
    </>;
}
