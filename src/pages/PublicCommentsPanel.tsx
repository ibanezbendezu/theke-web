import {useEffect, useRef, useState, type FormEvent, type KeyboardEvent} from 'react';
import {X} from 'lucide-react';
import {useAuth} from '@clerk/clerk-react';
import {ApiError, thekeFetch} from '../api/httpClient';
import {Button} from '../components/ui/Button';
import {anchorLabel, type CommentTarget, type PublicComment} from './publicCommentTypes';

type CommentsData = { identity: { displayName: string } | null; csrfToken: string | null; comments: PublicComment[] };
type Draft = { name: string; content: string; target: CommentTarget | null };
type EditConflict = { content: string; revision: number; editedAt: string | null };
type Props = {
    token: string;
    enabled: boolean;
    open: boolean;
    onClose: () => void;
    target?: CommentTarget | null;
    targetLabel?: string;
    onTargetChange?: (target: CommentTarget | null) => void;
    onCommentsChange?: (comments: PublicComment[]) => void;
    selectedCommentId?: string | null
};
const noTargetChange = () => {
};
const noCommentsChange = () => {
};

export function PublicCommentsPanel({
                                        token,
                                        enabled,
                                        open,
                                        onClose,
                                        target = null,
                                        targetLabel,
                                        onTargetChange = noTargetChange,
                                        onCommentsChange = noCommentsChange,
                                        selectedCommentId = null
                                    }: Props) {
    const {isLoaded: authLoaded, isSignedIn, getToken} = useAuth();
    const [data, setData] = useState<CommentsData | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [content, setContent] = useState('');
    const [contentError, setContentError] = useState('');
    const [publishError, setPublishError] = useState('');
    const [busy, setBusy] = useState(false);
    const [retry, setRetry] = useState(0);
    const [draftAvailable, setDraftAvailable] = useState(() => {
        try {
            return Boolean(sessionStorage.getItem(`theke:comment-draft:${token}`));
        } catch {
            return false;
        }
    });
    const [announcement, setAnnouncement] = useState('');
    const [editing, setEditing] = useState<PublicComment | null>(null);
    const [conflict, setConflict] = useState<EditConflict | null>(null);
    const previousComposer = useRef('');
    const panelRef = useRef<HTMLElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const returnFocus = useRef<HTMLElement | null>(null);
    const wasOpen = useRef(false);
    const draftKey = `theke:comment-draft:${token}`;

    const saveDraft = (value: Draft) => {
        if (!value.content.trim()) return;
        try {
            sessionStorage.setItem(draftKey, JSON.stringify(value));
        } catch { /* The in-memory text remains available. */
        }
    };

    useEffect(() => {
        if (wasOpen.current && !open) {
            if (content.trim() && !editing) {
                try {
                    sessionStorage.setItem(draftKey, JSON.stringify({name: '', content, target}));
                } catch { /* The in-memory text remains available. */
                }
            }
            returnFocus.current?.focus();
        }
        if (open && !wasOpen.current) {
            returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            requestAnimationFrame(() => textareaRef.current?.focus());
        }
        wasOpen.current = open;
    }, [open, content, target, draftKey, editing]);
    useEffect(() => {
        if (!open || !authLoaded) return;
        const controller = new AbortController();
        const load = async () => {
            const bearer = isSignedIn ? await getToken() : null;
            if (isSignedIn && !bearer) throw new Error('No se pudo verificar la sesión.');
            const headers = bearer ? {Authorization: `Bearer ${bearer}`} : undefined;
            const path = `/v1/public/shares/${encodeURIComponent(token)}/comments`;
            let response = await thekeFetch<{ data: { data: CommentsData } }>(path, {
                credentials: 'include',
                headers,
                cache: 'no-store',
                signal: controller.signal
            });
            if (bearer && response.data.data.csrfToken) {
                await thekeFetch(`${path}/claim`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': response.data.data.csrfToken
                    },
                    body: '{}',
                    signal: controller.signal
                });
                response = await thekeFetch<{ data: { data: CommentsData } }>(path, {
                    credentials: 'include',
                    headers,
                    cache: 'no-store',
                    signal: controller.signal
                });
            }
            if (!controller.signal.aborted) {
                setData(response.data.data);
                onCommentsChange(response.data.data.comments);
                setLoadError(false);
            }
        };
        void load().catch(() => {
            if (!controller.signal.aborted) setLoadError(true);
        });
        return () => controller.abort();
    }, [open, token, retry, onCommentsChange, authLoaded, isSignedIn, getToken]);
    useEffect(() => {
        if (!open) return;
        const timer = window.setInterval(() => setRetry(value => value + 1), 20_000);
        return () => window.clearInterval(timer);
    }, [open]);
    useEffect(() => {
        if (open && selectedCommentId) document.getElementById(`public-comment-${selectedCommentId}`)?.scrollIntoView?.({block: 'nearest'});
    }, [open, selectedCommentId, data]);

    const recoverDraft = () => {
        try {
            const saved = JSON.parse(sessionStorage.getItem(draftKey) ?? 'null') as Draft | null;
            if (saved && typeof saved.content === 'string' && saved.content.length <= 5000) {
                setContent(saved.content);
                onTargetChange(saved.target);
                textareaRef.current?.focus();
            }
            sessionStorage.removeItem(draftKey);
        } catch { /* Keep the current composer usable. */
        }
        setDraftAvailable(false);
    };
    const discardDraft = () => {
        try {
            sessionStorage.removeItem(draftKey);
        } catch { /* Storage may be disabled. */
        }
        setDraftAvailable(false);
    };
    const startEditing = (comment: PublicComment) => {
        if (content.trim()) saveDraft({name: '', content, target});
        previousComposer.current = content;
        setEditing(comment);
        setConflict(null);
        setContent(comment.content);
        setContentError('');
        setPublishError('');
        requestAnimationFrame(() => textareaRef.current?.focus());
    };
    const cancelEditing = () => {
        setEditing(null);
        setConflict(null);
        setContent(previousComposer.current);
        previousComposer.current = '';
        setPublishError('');
        setContentError('');
    };
    const conflictFrom = (value: unknown): EditConflict | null => {
        if (!value || typeof value !== 'object' || !('current' in value) || !value.current || typeof value.current !== 'object') return null;
        const current = value.current as Record<string, unknown>;
        return typeof current.content === 'string' && typeof current.revision === 'number' && Number.isSafeInteger(current.revision)
            ? {
                content: current.content,
                revision: current.revision,
                editedAt: typeof current.editedAt === 'string' ? current.editedAt : null
            } : null;
    };

    const publish = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!data || busy || loadError || (!isSignedIn && (data.identity || editing) && !data.csrfToken)) return;
        const nextContent = content.trim();
        const invalidContent = !nextContent || nextContent.length > 5000;
        setContentError(invalidContent ? 'Escribe un comentario de hasta 5.000 caracteres.' : '');
        if (invalidContent) return;
        setBusy(true);
        setPublishError('');
        try {
            const headers: Record<string, string> = {'Content-Type': 'application/json'};
            if (data.csrfToken) headers['X-CSRF-Token'] = data.csrfToken;
            const bearer = isSignedIn ? await getToken() : null;
            if (isSignedIn && !bearer) throw new Error('No se pudo verificar la sesión.');
            if (bearer) headers.Authorization = `Bearer ${bearer}`;
            if (editing) {
                const result = await thekeFetch<{
                    data: { data: PublicComment }
                }>(`/v1/public/shares/${encodeURIComponent(token)}/comments/${encodeURIComponent(editing.id)}`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers,
                    body: JSON.stringify({content: nextContent, expectedRevision: editing.revision}),
                });
                const next = data.comments.map(comment => comment.id === editing.id ? result.data.data : comment);
                setData(current => current ? {...current, comments: next} : current);
                onCommentsChange(next);
                setAnnouncement('Comentario actualizado.');
                setEditing(null);
                setConflict(null);
                setContent(previousComposer.current);
                previousComposer.current = '';
                return;
            }
            const result = await thekeFetch<{
                data: { data: PublicComment }
            }>(`/v1/public/shares/${encodeURIComponent(token)}/comments`, {
                method: 'POST',
                credentials: 'include',
                headers,
                body: JSON.stringify({content: nextContent, ...(target ? {anchor: target} : {})}),
            });
            const next = [result.data.data, ...data.comments];
            setContent('');
            onCommentsChange(next);
            setAnnouncement('Comentario publicado.');
            discardDraft();
            setData(current => current ? {
                ...current,
                identity: {displayName: result.data.data.displayName},
                comments: next
            } : current);
            try {
                const refreshed = await thekeFetch<{
                    data: { data: CommentsData }
                }>(`/v1/public/shares/${encodeURIComponent(token)}/comments`, {
                    credentials: 'include',
                    headers: bearer ? {Authorization: `Bearer ${bearer}`} : undefined,
                    cache: 'no-store'
                });
                setData(refreshed.data.data);
                onCommentsChange(refreshed.data.data.comments);
            } catch {
                setLoadError(true);
            }
        } catch (error) {
            const current = editing && error instanceof ApiError && error.status === 409 ? conflictFrom(error.payload.error.details) : null;
            if (current) {
                setConflict(current);
                setPublishError('Este comentario cambió en otra pestaña. Compara ambos textos antes de guardar.');
            } else {
                setPublishError(error instanceof ApiError && error.status === 429 ? 'Se alcanzó el límite de comentarios. Inténtalo más tarde; tu texto sigue aquí.' : error instanceof ApiError && error.status === 403 && editing ? 'Tu identidad de comentario expiró o no pudo verificarse. Copia tu texto antes de salir.' : error instanceof ApiError && error.status === 409 ? 'Este enlace ya no acepta cambios. Tu texto sigue aquí.' : error instanceof ApiError && error.status === 404 && editing ? 'El comentario o el enlace ya no está disponible. Copia tu texto antes de salir.' : error instanceof ApiError && error.status === 404 ? 'El enlace o el destino ya no está disponible. Tu texto sigue aquí.' : 'No se pudo guardar. Tu texto sigue aquí para intentarlo de nuevo.');
                if (editing && error instanceof ApiError && (error.status === 403 || error.status === 404)) setRetry(value => value + 1);
            }
        } finally {
            setBusy(false);
        }
    };
    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            if (editing) cancelEditing(); else onClose();
            return;
        }
        if (event.key !== 'Tab') return;
        const items = [...(panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),[tabindex="0"]') ?? [])].filter(item => item.offsetParent !== null);
        if (!items.length) return;
        if (event.shiftKey && document.activeElement === items[0]) {
            event.preventDefault();
            items.at(-1)?.focus();
        }
        if (!event.shiftKey && document.activeElement === items.at(-1)) {
            event.preventDefault();
            items[0]?.focus();
        }
    };

    return <aside ref={panelRef} role="dialog" aria-modal={open} aria-label="Comentarios del mapa" onKeyDown={onKeyDown}
                  className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 bottom-0 top-[16dvh] z-50 min-w-0 flex-col overflow-hidden rounded-t-xl bg-surface/95 text-on-background sm:inset-x-3 sm:bottom-3 sm:top-20 sm:left-auto sm:w-[min(23rem,calc(100%-1.5rem))] sm:rounded-xl`}>
        <div className="flex items-center justify-between px-4 py-3"><h2
            className="text-sm font-semibold">Comentarios</h2><Button size="icon" icon={X}
                                                                      aria-label="Cerrar comentarios"
                                                                      onClick={onClose}/></div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 text-sm">
            {loadError && <p role="alert" className="text-red-600 dark:text-red-400">No se pudieron actualizar los
                comentarios. <button type="button" className="underline" onClick={() => {
                    setLoadError(false);
                    setRetry(value => value + 1);
                }}>Reintentar</button></p>}
            {!data && !loadError && <p role="status" className="text-outline">Cargando comentarios…</p>}
            {data && <>
                <div className="mb-4 text-xs text-outline">{data.identity ?
                    <p>Participas como {data.identity.displayName}.</p> :
                    <p>Publicarás con un alias científico anónimo.</p>}{!isSignedIn &&
                    <a className="mt-1 inline-block font-medium text-on-background underline underline-offset-4"
                       href={`/access?returnTo=${encodeURIComponent(`/share/${token}?comments=1`)}`}>Iniciar sesión y
                        firmar mis comentarios</a>}</div>
                {!data.comments.length && <p className="text-outline">Todavía no hay comentarios.</p>}
                <ol className="space-y-3">{data.comments.map((comment, index) => <li id={`public-comment-${comment.id}`}
                                                                                     key={comment.id}
                                                                                     className={`rounded-lg bg-surface-variant/60 p-3 ${selectedCommentId === comment.id ? 'ring-2 ring-primary' : ''}`}>
                    <div className="flex items-center justify-between gap-2"><strong
                        className="truncate text-xs font-medium">{comment.displayName}</strong><span
                        className="text-xs text-outline">{comment.editable ? `Tú · #${index + 1}` : `#${index + 1}`}</span>
                    </div>
                    <p className="mt-1 text-xs text-outline">{comment.anchored ? anchorLabel(comment.anchor) : `Sin anclaje · ${anchorLabel(comment.anchor)}`}{comment.editedAt &&
                        <span> · Editado {new Date(comment.editedAt).toLocaleString('es-CL')}</span>}</p><p
                    className="mt-2 whitespace-pre-wrap break-words">{comment.content}</p>{comment.editable && enabled &&
                    <button type="button"
                            className="mt-2 min-h-11 rounded-md px-2 text-xs font-medium hover:bg-background/70 focus-visible:outline-2 focus-visible:outline-primary"
                            disabled={Boolean(editing)} onClick={() => startEditing(comment)}>Editar
                        comentario</button>}</li>)}</ol>
            </>}
        </div>
        {(enabled || editing) &&
            <form className="space-y-3 bg-background/70 px-4 py-4" onSubmit={event => void publish(event)}>
                {draftAvailable && !editing &&
                    <div className="flex flex-wrap items-center gap-2 rounded-md bg-surface-variant px-3 py-2 text-xs">
                        <span className="mr-auto">Hay un borrador sin publicar.</span>
                        <button type="button" className="underline" onClick={recoverDraft}>Recuperar</button>
                        <button type="button" className="underline" onClick={discardDraft}>Descartar</button>
                    </div>}
                <p className="text-xs font-medium">{editing ? 'Editando · ' : 'Sobre: '}{editing ? anchorLabel(editing.anchor) : targetLabel ?? anchorLabel(target)}</p>
                <div><label htmlFor="comment-text" className="text-xs font-medium">Comentario</label><textarea
                    ref={textareaRef} id="comment-text" value={content} onChange={event => {
                    setContent(event.target.value);
                    if (!editing) saveDraft({name: '', content: event.target.value, target});
                }} maxLength={5001} rows={3} aria-invalid={Boolean(contentError)}
                    aria-describedby={contentError ? 'comment-text-error' : undefined}
                    className="mt-1.5 w-full resize-y rounded-md border-0 bg-surface-variant px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary"
                    placeholder="Escribe tu comentario…"/>{contentError && <p id="comment-text-error"
                                                                              className="mt-1 text-xs text-red-600 dark:text-red-400">{contentError}</p>}
                </div>
                {conflict && <section aria-label="Conflicto de edición"
                                      className="space-y-2 rounded-md bg-surface-variant p-3 text-xs"><p
                    className="font-medium">Texto vigente (revisión {conflict.revision})</p><p
                    className="max-h-28 overflow-y-auto whitespace-pre-wrap break-words">{conflict.content}</p><p>Tu
                    borrador sigue en el campo de comentario.</p>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" className="min-h-11 rounded-md px-2 hover:bg-background" onClick={() => {
                            setContent(conflict.content);
                            setEditing(current => current ? {...current, revision: conflict.revision} : null);
                            setConflict(null);
                            setPublishError('');
                        }}>Usar texto vigente
                        </button>
                        <button type="button" className="min-h-11 rounded-md px-2 hover:bg-background" onClick={() => {
                            setEditing(current => current ? {...current, revision: conflict.revision} : null);
                            setConflict(null);
                            setPublishError('');
                        }}>Conservar mi borrador
                        </button>
                    </div>
                </section>}
                {publishError && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{publishError}</p>}
                <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
                <div className="flex flex-wrap items-center gap-2"><Button type="submit" variant="secondary"
                                                                           disabled={!data || busy || loadError || Boolean(!isSignedIn && (data.identity || editing) && !data.csrfToken) || Boolean(conflict)}>{busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Publicar comentario'}</Button>{editing &&
                    <Button type="button" onClick={cancelEditing}>Cancelar</Button>}</div>
            </form>}
        {!enabled && !editing &&
            <p className="bg-background/70 px-4 py-3 text-xs text-outline">Este enlace no acepta comentarios
                nuevos.</p>}
    </aside>;
}
