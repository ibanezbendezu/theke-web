import {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Dialog} from '../ui/Dialog';
import {InlineLoading} from '../ui/LoadingState';
import {anchorLabel} from '../../pages/publicCommentTypes';
import {
    useCommentNotifications, useModerateCommentNotification, useReadCommentNotification,
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
    const location = useLocation();
    const currentLocation = useRef(location);
    useEffect(() => {
        currentLocation.current = location;
    }, [location]);
    const [filter, setFilter] = useState<CommentNotificationFilter>('all');
    const [page, setPage] = useState(1);
    const list = useCommentNotifications(page, filter, diagramId);
    const selected = useCommentNotifications(1, 'all', diagramId, selectedId ?? null);
    const rows = list.data?.items ?? [];
    const selectedInPage = rows.find(item => item.commentId === selectedId);
    const selectedItem = selectedInPage ?? selected.data?.items.find(item => item.commentId === selectedId);
    const pinned = selectedItem && !selectedInPage ? selectedItem : null;
    const items = pinned ? [pinned, ...rows] : rows;
    const read = useReadCommentNotification();
    const moderate = useModerateCommentNotification();
    const [deleting, setDeleting] = useState<CommentNotification | null>(null);
    const [actionError, setActionError] = useState('');
    const selectedRef = useRef<HTMLButtonElement>(null);
    const focusedComment = useRef<string | null>(null);
    const readAttempt = useRef<string | null>(null);
    const selectedRowId = selectedItem?.id;
    const selectedReadAt = selectedItem?.readAt;
    const markRead = read.mutate;
    useEffect(() => {
        if (!selectedId) focusedComment.current = null;
        if (!selectedId || !selectedRowId || focusedComment.current === selectedId) return;
        selectedRef.current?.focus();
        focusedComment.current = selectedId;
    }, [selectedId, selectedRowId]);
    useEffect(() => {
        if (!selectedId) {
            readAttempt.current = null;
            return;
        }
        if (!selectedRowId || readAttempt.current === selectedRowId) return;
        readAttempt.current = selectedRowId;
        if (!selectedReadAt) markRead(selectedRowId);
    }, [selectedId, selectedRowId, selectedReadAt, markRead]);
    const open = (item: CommentNotification) => {
        if (onOpen) onOpen(item);
        else navigate(`/projects/${item.projectId}/diagrams/${item.diagramId}?comment=${item.commentId}`);
    };
    const changeStatus = async (item: CommentNotification, action: 'resolve' | 'reopen' | 'delete') => {
        setActionError('');
        try {
            await moderate.mutateAsync({id: item.id, action});
            if (action === 'delete') {
                setDeleting(null);
                const current = currentLocation.current;
                const params = new URLSearchParams(current.search);
                if (current.key === location.key && params.get('comment') === item.commentId) {
                    params.delete('comment');
                    const search = params.toString();
                    navigate({pathname: current.pathname, search: search ? `?${search}` : '', hash: current.hash}, {replace: true});
                }
            }
        } catch {
            setActionError('No se pudo actualizar el comentario. Inténtalo de nuevo.');
        }
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
            {actionError && <p role="alert" className="px-2 py-2 text-xs text-red-600 dark:text-red-400">{actionError}</p>}
            {selectedId && !selectedItem && (selected.isError ?
                <p role="alert" className="px-2 py-2 text-xs">No se pudo cargar el comentario enlazado. <button type="button" className="underline" onClick={() => void selected.refetch()}>Reintentar enlace</button></p>
                : selected.isSuccess ? <p role="status" className="px-2 py-2 text-xs text-outline">El comentario enlazado ya no está disponible.</p> : null)}
            {selectedRowId && !selectedReadAt && read.isError && read.variables === selectedRowId &&
                <p role="alert" className="px-2 py-2 text-xs">No se pudo marcar el aviso como leído. <button type="button" className="underline" onClick={() => markRead(selectedRowId)}>Reintentar lectura</button></p>}
            {list.isPending && <div className="px-2 py-4"><InlineLoading label="Cargando comentarios…"/></div>}
            {list.isError && <p role="alert" className="px-2 py-4">No se pudieron cargar. <button className="underline" onClick={() => void list.refetch()}>Reintentar</button></p>}
            {items.map(item => <div key={item.id} className={`mb-1 rounded-md ${item.commentId === selectedId ? 'bg-surface-variant' : 'hover:bg-surface-variant/60'}`}>
                {item.id === pinned?.id && <p className="px-3 pt-2 text-xs font-medium text-outline">Seleccionado fuera de esta página o filtro</p>}
                <button ref={item.commentId === selectedId ? selectedRef : undefined}
                type="button" aria-current={item.commentId === selectedId ? 'true' : undefined}
                className="w-full rounded-md px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-primary"
                onClick={() => open(item)}>
                <span className="flex items-center justify-between gap-2"><strong className="truncate font-medium">{item.displayName}</strong>
                    {!item.readAt && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-label="Pendiente"/>}</span>
                <span className={`mt-1 block text-xs leading-relaxed ${item.commentId === selectedId ? 'whitespace-pre-wrap break-words' : 'line-clamp-2'}`}>{item.content}</span>
                <span className="mt-1 block text-[11px] text-outline">{item.diagramName} · {item.anchored ? anchorLabel(item.anchor) : `Sin anclaje · Último contexto publicado: ${anchorLabel(item.anchor)}`} · {item.resolvedAt ? 'Resuelto' : item.readAt ? 'Leído' : 'Pendiente'}</span>
                <time className="mt-1 block text-[11px] text-outline" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
            </button><div className="flex gap-1 px-2 pb-2 text-xs">
                <button type="button" disabled={moderate.isPending} className="rounded-md px-2 py-1 hover:bg-background/70 disabled:opacity-50"
                        onClick={() => void changeStatus(item, item.resolvedAt ? 'reopen' : 'resolve')}>{item.resolvedAt ? 'Reabrir' : 'Resolver'}</button>
                <button type="button" disabled={moderate.isPending} className="rounded-md px-2 py-1 text-red-600 hover:bg-background/70 disabled:opacity-50 dark:text-red-400"
                        onClick={() => setDeleting(item)}>Eliminar</button>
            </div></div>)}
            {rows.length === 0 && list.data && <p className="px-2 py-4 text-outline">No hay comentarios en este filtro.</p>}
        </div>
        <div className="flex shrink-0 items-center justify-between px-4 py-3 text-xs text-outline">
            <button type="button" className="rounded-md px-2 py-1 hover:bg-surface-variant disabled:opacity-40" disabled={page === 1}
                    onClick={() => setPage(value => value - 1)}>Anterior</button>
            <span>Página {page}</span>
            <button type="button" className="rounded-md px-2 py-1 hover:bg-surface-variant disabled:opacity-40" disabled={!list.data?.hasMore}
                    onClick={() => setPage(value => value + 1)}>Siguiente</button>
        </div>
        {deleting && <Dialog titleId="delete-comment-title" onClose={() => {
            if (!moderate.isPending) setDeleting(null);
        }} className="max-w-sm" shadow={false}>
            <h2 id="delete-comment-title" className="text-base font-semibold">Eliminar comentario</h2>
            <p className="mt-2 text-sm text-outline">El comentario desaparecerá del mapa compartido y de la lista activa. Su eliminación quedará registrada.</p>
            {actionError && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{actionError}</p>}
            <div className="mt-5 flex justify-end gap-2 text-sm">
                <button type="button" disabled={moderate.isPending} className="rounded-md px-3 py-2 hover:bg-surface-variant" onClick={() => setDeleting(null)}>Cancelar</button>
                <button type="button" disabled={moderate.isPending} className="rounded-md bg-on-background px-3 py-2 text-background disabled:opacity-50"
                        onClick={() => void changeStatus(deleting, 'delete')}>{moderate.isPending ? 'Eliminando…' : 'Eliminar'}</button>
            </div>
        </Dialog>}
    </div>;
}
