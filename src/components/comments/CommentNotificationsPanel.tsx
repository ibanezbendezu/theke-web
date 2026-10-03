import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {anchorLabel} from '../../pages/publicCommentTypes';
import {
    useCommentNotifications, useReadCommentNotification,
    type CommentNotification, type CommentNotificationFilter
} from '../../data/useCommentNotifications';

const filters: {value: CommentNotificationFilter; label: string}[] = [
    {value: 'all', label: 'Todos'}, {value: 'pending', label: 'Pendientes'},
    {value: 'resolved', label: 'Resueltos'}, {value: 'anchored', label: 'Anclados'},
    {value: 'unanchored', label: 'Sin anclaje'}
];

export function CommentNotificationsPanel({diagramId, selectedId, onOpen}: {
    diagramId?: string;
    selectedId?: string | null;
    onOpen?: (item: CommentNotification) => void;
}) {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<CommentNotificationFilter>('all');
    const [page, setPage] = useState(1);
    const list = useCommentNotifications(page, filter, diagramId);
    const selected = useCommentNotifications(1, 'all', diagramId, selectedId ?? undefined);
    const items = [...(list.data?.items ?? [])];
    const selectedItem = selectedId ? selected.data?.items[0] : undefined;
    if (selectedItem && !items.some(item => item.id === selectedItem.id)) items.unshift(selectedItem);
    const read = useReadCommentNotification();
    const selectedRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (selectedId) selectedRef.current?.focus();
    }, [selectedId, selectedItem]);
    const open = (item: CommentNotification) => {
        if (!item.readAt) read.mutate(item.id);
        if (onOpen) onOpen(item);
        else navigate(`/projects/${item.projectId}/diagrams/${item.diagramId}?comment=${item.commentId}`);
    };
    return <div className="flex h-full min-h-0 flex-col text-sm">
        <div className="shrink-0 px-4 pb-3 pt-4">
            <h2 className="font-semibold">Comentarios{list.data?.unreadCount ? ` · ${list.data.unreadCount} pendientes` : ''}</h2>
            <div className="mt-3 flex flex-wrap gap-1" aria-label="Filtrar comentarios">{filters.map(option =>
                <button key={option.value} type="button" aria-pressed={filter === option.value}
                        className={`rounded-md px-2 py-1 text-xs ${filter === option.value ? 'bg-surface-variant text-on-background' : 'text-outline hover:bg-surface-variant'}`}
                        onClick={() => {setFilter(option.value); setPage(1);}}>{option.label}</button>)}</div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2" aria-live="polite">
            {list.isPending && <p className="px-2 py-4 text-outline">Cargando comentarios…</p>}
            {list.isError && <p role="alert" className="px-2 py-4">No se pudieron cargar. <button className="underline" onClick={() => void list.refetch()}>Reintentar</button></p>}
            {items.length === 0 && list.data && <p className="px-2 py-4 text-outline">No hay comentarios en este filtro.</p>}
            {items.map(item => <button key={item.id} ref={item.commentId === selectedId ? selectedRef : undefined}
                type="button" aria-current={item.commentId === selectedId ? 'true' : undefined}
                className={`mb-1 w-full rounded-md px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-primary ${item.commentId === selectedId ? 'bg-surface-variant' : 'hover:bg-surface-variant/60'}`}
                onClick={() => open(item)}>
                <span className="flex items-center justify-between gap-2"><strong className="truncate font-medium">{item.displayName}</strong>
                    {!item.readAt && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-label="Pendiente"/>}</span>
                <span className="mt-1 block line-clamp-2 text-xs leading-relaxed">{item.content}</span>
                <span className="mt-1 block text-[11px] text-outline">{item.diagramName} · {anchorLabel(item.anchor)} · {item.resolvedAt ? 'Resuelto' : item.readAt ? 'Leído' : 'Pendiente'}</span>
                <time className="mt-1 block text-[11px] text-outline" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
            </button>)}
        </div>
        <div className="flex shrink-0 items-center justify-between px-4 py-3 text-xs text-outline">
            <button type="button" className="rounded-md px-2 py-1 hover:bg-surface-variant disabled:opacity-40" disabled={page === 1}
                    onClick={() => setPage(value => value - 1)}>Anterior</button>
            <span>Página {page}</span>
            <button type="button" className="rounded-md px-2 py-1 hover:bg-surface-variant disabled:opacity-40" disabled={!list.data?.hasMore}
                    onClick={() => setPage(value => value + 1)}>Siguiente</button>
        </div>
    </div>;
}
