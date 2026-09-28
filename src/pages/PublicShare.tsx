import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { PublicShare as PublicProjection, PublicShareResponse } from '../api/generated/models';
import { thekeFetch } from '../api/httpClient';
import { PublicDiagramCanvas, PublicSemanticList, type PublicSelection } from './PublicDiagramCanvas';

function safeLink(value: string | null): string | null {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null; } catch { return null; }
}

export function PublicShare() {
  const { token } = useParams();
  const [view, setView] = useState<{ token: string; data: PublicProjection | null; unavailable: boolean } | null>(null);
  const [selection, setSelection] = useState<PublicSelection>(null);
  const [semanticOpen, setSemanticOpen] = useState(false);
  const inspector = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    void thekeFetch<{ data: PublicShareResponse }>(`/v1/public/shares/${encodeURIComponent(token)}`, { cache: 'no-store', signal: controller.signal })
      .then(response => { if (!controller.signal.aborted) setView({ token, data: response.data.data, unavailable: false }); })
      .catch(() => { if (!controller.signal.aborted) setView({ token, data: null, unavailable: true }); });
    return () => controller.abort();
  }, [token]);
  useEffect(() => { if (selection) inspector.current?.focus(); }, [selection]);
  const data = view && view.token === token ? view.data : null;
  const unavailable = !token || (view?.token === token && view?.unavailable === true);
  const selectedResource = selection?.kind === 'resource' ? data?.resources.find(item => item.id === selection.id) : null;
  const selectedRelation = selection?.kind === 'relation' ? data?.relations.find(item => item.id === selection.id) : null;
  const titles = new Map(data?.resources.map(item => [item.id, item.title]));
  const mediaUrl = (id: string) => `${import.meta.env.VITE_API_URL?.replace(/\/+$/, '')}/v1/public/shares/${encodeURIComponent(token ?? '')}/resources/${encodeURIComponent(id)}/content`;
  return <main className="public-share h-screen overflow-y-auto bg-background text-on-background">
    <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      {unavailable ? <section role="alert"><h1 className="text-xl font-semibold">Enlace no disponible</h1><p>Este enlace no está disponible. Solicita un enlace vigente a quien lo compartió.</p></section>
        : !data ? <p role="status">Cargando compartido…</p> : <>
          <header className="space-y-1"><h1 className="text-2xl font-semibold">{data.diagramName}</h1>
            <p className="text-sm text-outline">Vista compartida de solo lectura · revisión {data.revision}</p>
            <p className="text-sm text-outline">{data.commentsEnabled ? 'El autor permite nuevos comentarios en este compartido.' : 'El autor desactivó nuevos comentarios en este compartido.'}</p>
          </header>
          <button className="rounded border border-border bg-surface px-3 py-2 focus-visible:outline-2 focus-visible:outline-primary" aria-expanded={semanticOpen} onClick={() => setSemanticOpen(value => !value)}>{semanticOpen ? 'Ocultar vista semántica' : 'Mostrar vista semántica'}</button>
          <PublicDiagramCanvas data={data} selection={selection} onSelect={setSelection} />
          {semanticOpen && <PublicSemanticList resources={data.resources} relations={data.relations} selection={selection} onSelect={setSelection} />}
          <section ref={inspector} tabIndex={-1} aria-label="Elemento seleccionado" className="min-h-32 space-y-3 rounded border border-border bg-surface p-4 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary">
            {!selectedResource && !selectedRelation && <p>Selecciona un Recurso o una Relación en el Diagrama o en la vista semántica para leer sus detalles.</p>}
            {selectedResource && <>
              <h2 className="text-lg font-semibold">{selectedResource.title}</h2>
              {selectedResource.description && <p>{selectedResource.description}</p>}
              {selectedResource.content && <p className="whitespace-pre-wrap">{selectedResource.content}</p>}
              {safeLink(selectedResource.url) && <a href={safeLink(selectedResource.url)!} target="_blank" rel="noopener noreferrer" className="break-all underline focus-visible:outline-2 focus-visible:outline-primary">Abrir enlace</a>}
              {selectedResource.mediaType && <p>Formato: {selectedResource.mediaType}</p>}
              {selectedResource.accessibilityText && <p className="whitespace-pre-wrap">{selectedResource.accessibilityText}</p>}
              {selectedResource.type === 'file' && selectedResource.mediaType?.startsWith('image/') && <img className="max-h-96 max-w-full" loading="lazy" src={mediaUrl(selectedResource.id)} alt={selectedResource.accessibilityText || selectedResource.title} />}
              {selectedResource.type === 'file' && selectedResource.mediaType?.startsWith('audio/') && <audio className="w-full" controls preload="none" src={mediaUrl(selectedResource.id)}>El navegador no puede reproducir este audio.</audio>}
              {selectedResource.type === 'file' && selectedResource.mediaType?.startsWith('video/') && <video className="max-h-96 max-w-full" controls preload="none" src={mediaUrl(selectedResource.id)}>El navegador no puede reproducir este video.</video>}
              {selectedResource.type === 'file' && ['application/pdf', 'text/plain'].includes(selectedResource.mediaType ?? '') && <a className="inline-block underline" href={mediaUrl(selectedResource.id)} target="_blank" rel="noopener noreferrer">Abrir archivo</a>}
            </>}
            {selectedRelation && <>
              <h2 className="text-lg font-semibold">{selectedRelation.label || selectedRelation.typeKey}</h2>
              <p>Tipo: {selectedRelation.typeKey} · dirección: {selectedRelation.direction === 'directed' ? 'dirigida' : 'no dirigida'}</p>
              {selectedRelation.explanation && <p className="whitespace-pre-wrap">{selectedRelation.explanation}</p>}
              <div className="flex flex-wrap gap-2"><button className="rounded border border-border bg-background px-3 py-2 focus-visible:outline-2 focus-visible:outline-primary" onClick={() => setSelection({ kind: 'resource', id: selectedRelation.sourceResourceId })}>Ir a {titles.get(selectedRelation.sourceResourceId)}</button>
                <button className="rounded border border-border bg-background px-3 py-2 focus-visible:outline-2 focus-visible:outline-primary" onClick={() => setSelection({ kind: 'resource', id: selectedRelation.targetResourceId })}>Ir a {titles.get(selectedRelation.targetResourceId)}</button></div>
              <h3 className="font-semibold">Evidencia publicada</h3>
              {!selectedRelation.evidence?.length && <p>No se publicó evidencia para esta Relación.</p>}
              <ul className="space-y-2">{selectedRelation.evidence?.map((item, index) => <li key={`${item.resourceId}-${index}`} className="rounded border border-border bg-background p-2"><p>{titles.get(item.resourceId) ?? 'Recurso publicado'}{item.pageNumber ? ` · página ${item.pageNumber}` : ''}</p>{item.excerpt && <blockquote className="border-l-2 border-outline pl-2">{item.excerpt}</blockquote>}{item.note && <p>{item.note}</p>}</li>)}</ul>
            </>}
          </section>
        </>}
    </div>
  </main>;
}
