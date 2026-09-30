import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { thekeFetch } from '../api/httpClient';
import { Button } from '../components/ui/Button';

type PublicComment = { id: string; displayName: string; content: string; createdAt: string; editable: boolean; anchor: { type: 'diagram' } };
type CommentsData = { identity: { displayName: string } | null; csrfToken: string | null; comments: PublicComment[] };

export function PublicCommentsPanel({ token, enabled, open, onClose }: { token: string; enabled: boolean; open: boolean; onClose: () => void }) {
  const [data, setData] = useState<CommentsData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [nameError, setNameError] = useState('');
  const [contentError, setContentError] = useState('');
  const [publishError, setPublishError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    void thekeFetch<{ data: { data: CommentsData } }>(`/v1/public/shares/${encodeURIComponent(token)}/comments`, { credentials: 'include', cache: 'no-store', signal: controller.signal })
      .then(response => { if (!controller.signal.aborted) { setData(response.data.data); setLoadError(false); } })
      .catch(() => { if (!controller.signal.aborted) setLoadError(true); });
    return () => controller.abort();
  }, [open, token, retry]);

  const publish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data || busy || loadError || (data.identity && !data.csrfToken)) return;
    const nextName = name.trim(); const nextContent = content.trim();
    const invalidName = !data.identity && (!nextName || nextName.length > 60 || /\p{C}/u.test(nextName));
    const invalidContent = !nextContent || nextContent.length > 5000;
    setNameError(invalidName ? 'Escribe un nombre de hasta 60 caracteres.' : '');
    setContentError(invalidContent ? 'Escribe un comentario de hasta 5.000 caracteres.' : '');
    if (invalidName || invalidContent) return;
    setBusy(true); setPublishError('');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (data.csrfToken) headers['X-CSRF-Token'] = data.csrfToken;
      const result = await thekeFetch<{ data: { data: PublicComment } }>(`/v1/public/shares/${encodeURIComponent(token)}/comments`, {
        method: 'POST', credentials: 'include', headers, body: JSON.stringify({ displayName: data.identity?.displayName ?? nextName, content: nextContent }),
      });
      setContent('');
      setData(current => current ? { ...current, identity: { displayName: result.data.data.displayName }, comments: [result.data.data, ...current.comments] } : current);
      try {
        const refreshed = await thekeFetch<{ data: { data: CommentsData } }>(`/v1/public/shares/${encodeURIComponent(token)}/comments`, { credentials: 'include', cache: 'no-store' });
        setData(refreshed.data.data);
      } catch { setLoadError(true); }
    } catch { setPublishError('No se pudo publicar. El texto sigue aquí para que lo intentes de nuevo.'); }
    finally { setBusy(false); }
  };

  return <aside className={`${open ? 'flex' : 'hidden'} absolute inset-x-3 bottom-3 top-20 z-50 min-w-0 flex-col overflow-hidden rounded-xl bg-surface/95 text-on-background backdrop-blur-md sm:left-auto sm:w-[min(23rem,calc(100%-1.5rem))]`} aria-label="Comentarios del mapa">
    <div className="flex items-center justify-between px-4 py-3"><h2 className="text-sm font-semibold">Comentarios</h2><Button size="icon" icon={X} aria-label="Cerrar comentarios" onClick={onClose}/></div>
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 text-sm">
      {loadError && <p role="alert" className="text-red-600 dark:text-red-400">No se pudieron actualizar los comentarios. <button type="button" className="underline" onClick={() => { setLoadError(false); setRetry(value => value + 1); }}>Reintentar</button></p>}
      {!data && !loadError && <p role="status" className="text-outline">Cargando comentarios…</p>}
      {data && <>
        {data.identity && <p className="mb-4 text-xs text-outline">Participas como {data.identity.displayName}.</p>}
        {!data.comments.length && <p className="text-outline">Todavía no hay comentarios.</p>}
        <ol className="space-y-3">{data.comments.map(comment => <li key={comment.id} className="rounded-lg bg-surface-variant/60 p-3"><div className="flex items-center justify-between gap-2"><strong className="truncate text-xs font-medium">{comment.displayName}</strong>{comment.editable && <span className="text-xs text-outline">Tú</span>}</div><p className="mt-2 whitespace-pre-wrap break-words">{comment.content}</p></li>)}</ol>
      </>}
    </div>
    {enabled && <form className="space-y-3 bg-background/70 px-4 py-4" onSubmit={event => void publish(event)}>
      {!data?.identity && <div><label htmlFor="comment-name" className="text-xs font-medium">Nombre visible</label><input id="comment-name" value={name} onChange={event => setName(event.target.value)} maxLength={61} aria-invalid={Boolean(nameError)} aria-describedby={nameError ? 'comment-name-error' : undefined} className="mt-1.5 h-10 w-full rounded-md border-0 bg-surface-variant px-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary" placeholder="Tu nombre"/>{nameError && <p id="comment-name-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{nameError}</p>}</div>}
      <div><label htmlFor="comment-text" className="text-xs font-medium">Comentario sobre el mapa</label><textarea id="comment-text" value={content} onChange={event => setContent(event.target.value)} maxLength={5001} rows={3} aria-invalid={Boolean(contentError)} aria-describedby={contentError ? 'comment-text-error' : undefined} className="mt-1.5 w-full resize-y rounded-md border-0 bg-surface-variant px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary" placeholder="Escribe tu comentario…"/>{contentError && <p id="comment-text-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{contentError}</p>}</div>
      {publishError && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{publishError}</p>}
      <Button type="submit" variant="secondary" disabled={!data || busy || loadError || Boolean(data.identity && !data.csrfToken)}>{busy ? 'Publicando…' : 'Publicar comentario'}</Button>
    </form>}
    {!enabled && <p className="bg-background/70 px-4 py-3 text-xs text-outline">Este enlace no acepta comentarios nuevos.</p>}
  </aside>;
}
