import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { PublicShare as PublicProjection, PublicShareResponse } from '../api/generated/models';
import { thekeFetch } from '../api/httpClient';

function safeLink(value: string | null): string | null {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null; } catch { return null; }
}

export function PublicShare() {
  const { token } = useParams();
  const [view, setView] = useState<{ token: string; data: PublicProjection | null; unavailable: boolean } | null>(null);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    void thekeFetch<{ data: PublicShareResponse }>(`/v1/public/shares/${encodeURIComponent(token)}`, { cache: 'no-store', signal: controller.signal })
      .then(response => { if (!controller.signal.aborted) setView({ token, data: response.data.data, unavailable: false }); })
      .catch(() => { if (!controller.signal.aborted) setView({ token, data: null, unavailable: true }); });
    return () => controller.abort();
  }, [token]);
  const data = view && view.token === token ? view.data : null;
  const unavailable = !token || (view?.token === token && view?.unavailable === true);
  const titles = new Map(data?.resources.map(item => [item.id, item.title]));
  const mediaUrl = (id: string) => `${import.meta.env.VITE_API_URL?.replace(/\/+$/, '')}/v1/public/shares/${encodeURIComponent(token ?? '')}/resources/${encodeURIComponent(id)}/content`;
  return <main className="mx-auto min-h-screen max-w-3xl space-y-5 bg-background p-6 text-on-background">
    {unavailable ? <section role="alert"><h1 className="text-xl font-semibold">Enlace no disponible</h1><p>Este enlace no está disponible. Solicita un enlace vigente a quien lo compartió.</p></section>
      : !data ? <p role="status">Cargando compartido…</p> : <>
        <h1 className="text-xl font-semibold">{data.diagramName}</h1>
        <p className="text-sm text-outline">Vista compartida de solo lectura</p>
        <p className="text-sm text-outline">{data.commentsEnabled ? 'El autor permite nuevos comentarios en este compartido.' : 'El autor desactivó nuevos comentarios en este compartido.'}</p>
        <section aria-label="Recursos compartidos" className="space-y-3">{data.resources.map(item => <article key={item.id} className="rounded border border-border p-4">
          <h2 className="font-semibold">{item.title}</h2>{item.description && <p>{item.description}</p>}
          {item.content && <p className="whitespace-pre-wrap">{item.content}</p>}
          {safeLink(item.url) && <a href={safeLink(item.url)!} target="_blank" rel="noopener noreferrer" className="break-all underline">Abrir enlace</a>}
          {item.mediaType && <p>Formato: {item.mediaType}</p>}
          {item.accessibilityText && <p className="whitespace-pre-wrap">{item.accessibilityText}</p>}
          {item.type === 'file' && item.mediaType?.startsWith('image/') && <img className="mt-3 max-h-96 max-w-full" loading="lazy" src={mediaUrl(item.id)} alt={item.accessibilityText || item.title} />}
          {item.type === 'file' && item.mediaType?.startsWith('audio/') && <audio className="mt-3 w-full" controls preload="none" src={mediaUrl(item.id)}>El navegador no puede reproducir este audio.</audio>}
          {item.type === 'file' && item.mediaType?.startsWith('video/') && <video className="mt-3 max-h-96 max-w-full" controls preload="none" src={mediaUrl(item.id)}>El navegador no puede reproducir este video.</video>}
          {item.type === 'file' && ['application/pdf', 'text/plain'].includes(item.mediaType ?? '') && <a className="mt-3 inline-block underline" href={mediaUrl(item.id)} target="_blank" rel="noopener noreferrer">Abrir archivo</a>}
        </article>)}</section>
        <section aria-label="Relaciones compartidas"><h2 className="font-semibold">Relaciones</h2><ul>{data.relations.map(item => <li key={item.id}>{titles.get(item.sourceResourceId)} {item.direction === 'directed' ? '→' : '↔'} {titles.get(item.targetResourceId)} · {item.label || item.typeKey}{item.explanation && <p>{item.explanation}</p>}</li>)}</ul></section>
      </>}
  </main>;
}
