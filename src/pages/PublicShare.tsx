import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import type { PublicShare as PublicProjection, PublicShareResponse } from '../api/generated/models';
import { thekeFetch } from '../api/httpClient';
import { PublicDiagramCanvas, PublicSemanticList, type PublicSelection } from './PublicDiagramCanvas';
import { PublicResourceDetail } from './PublicResourceDetail';

export function PublicShare() {
  const { token } = useParams();
  const [view, setView] = useState<{ token: string; data: PublicProjection | null; unavailable: boolean } | null>(null);
  const [selection, setSelection] = useState<PublicSelection>(null);
  const [semanticOpen, setSemanticOpen] = useState(false);
  const inspector = useRef<HTMLElement>(null);
  const semanticButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const restoreFocus = () => requestAnimationFrame(() => {
    const target = returnFocus.current?.isConnected ? returnFocus.current : semanticButton.current ?? document.querySelector<HTMLElement>('[aria-label="Vista semántica"] button');
    target?.focus();
  });
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    void thekeFetch<{ data: PublicShareResponse }>(`/v1/public/shares/${encodeURIComponent(token)}`, { cache: 'no-store', signal: controller.signal })
      .then(response => { if (!controller.signal.aborted) setView({ token, data: response.data.data, unavailable: false }); })
      .catch(() => { if (!controller.signal.aborted) setView({ token, data: null, unavailable: true }); });
    return () => controller.abort();
  }, [token]);
  useEffect(() => { if (selection) inspector.current?.focus(); }, [selection]);
  useEffect(() => {
    if (!selection) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && window.matchMedia?.('(max-width: 1279px)').matches) {
        const items = [...(inspector.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]') ?? [])];
        if (items.length && event.shiftKey && (document.activeElement === items[0] || document.activeElement === inspector.current)) { event.preventDefault(); items.at(-1)?.focus(); }
        else if (items.length && !event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus(); }
      }
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setSelection(null);
      restoreFocus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selection]);
  const select = (value: PublicSelection) => {
    if (value && !inspector.current?.contains(document.activeElement)) returnFocus.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    setSelection(value);
  };
  const closeInspector = () => {
    setSelection(null);
    restoreFocus();
  };
  const data = view && view.token === token ? view.data : null;
  const unavailable = !token || (view?.token === token && view?.unavailable === true);
  const selectedResource = selection?.kind === 'resource' ? data?.resources.find(item => item.id === selection.id) : null;
  const selectedRelation = selection?.kind === 'relation' ? data?.relations.find(item => item.id === selection.id) : null;
  const titles = new Map(data?.resources.map(item => [item.id, item.title]));
  const showSemantic = semanticOpen || data?.layout.nodes.length === 0;
  return <main className="public-share min-h-dvh bg-background text-on-background">
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-7 md:px-8">
      {unavailable ? <section role="alert"><h1 className="text-xl font-semibold">Enlace no disponible</h1><p>Este enlace no está disponible. Solicita un enlace vigente a quien lo compartió.</p></section>
        : !data ? <p role="status">Cargando compartido…</p> : <>
          <header className="min-w-0 space-y-1 [overflow-wrap:anywhere]"><h1 className="text-2xl font-semibold">{data.diagramName}</h1>
            <p className="text-sm text-outline">Vista compartida de solo lectura · revisión {data.revision}</p>
            <p className="text-sm text-outline">{data.commentsEnabled ? 'El autor permite nuevos comentarios en este compartido.' : 'El autor desactivó nuevos comentarios en este compartido.'}</p>
          </header>
          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] xl:items-start">
            <div className="min-w-0 space-y-4">
              {data.layout.nodes.length > 0 && <button ref={semanticButton} className="min-h-11 rounded-md bg-surface-variant px-3 py-2 text-sm hover:bg-surface-variant/75 focus-visible:outline-2 focus-visible:outline-primary" aria-expanded={semanticOpen} onClick={() => setSemanticOpen(value => !value)}>{semanticOpen ? 'Ocultar vista semántica' : 'Mostrar vista semántica'}</button>}
              <PublicDiagramCanvas data={data} selection={selection} onSelect={select} />
              {showSemantic && <PublicSemanticList resources={data.resources} relations={data.relations} selection={selection} onSelect={select} />}
            </div>
            {selection && <button type="button" className="fixed inset-0 z-[79] bg-black/40 backdrop-blur-sm xl:hidden" aria-label="Cerrar detalles" onClick={closeInspector} />}
            <section ref={inspector} tabIndex={-1} role={selection ? 'dialog' : undefined} aria-modal={selection ? window.matchMedia?.('(max-width: 1279px)').matches : undefined} aria-label="Elemento seleccionado" className={`${selection ? 'fixed inset-x-0 bottom-0 z-[80] max-h-[82dvh] overflow-y-auto rounded-t-xl bg-background p-4 shadow-2xl md:inset-y-0 md:left-auto md:w-[min(24rem,100vw)] md:max-h-none md:rounded-none' : 'hidden'} min-w-0 space-y-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary [overflow-wrap:anywhere] xl:sticky xl:inset-x-auto xl:bottom-auto xl:top-4 xl:block xl:w-full xl:max-h-[calc(100dvh-2rem)] xl:overflow-y-auto xl:rounded-xl xl:bg-surface-variant/55 xl:p-4 xl:shadow-none` }>
            {selection && <div className="flex justify-end"><button type="button" className="grid h-11 w-11 place-items-center rounded-md text-outline hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary" aria-label="Cerrar detalle" onClick={closeInspector}><X size={18} /></button></div>}
            {!selectedResource && !selectedRelation && <p>Selecciona un Recurso o una Relación en el Diagrama o en la vista semántica para leer sus detalles.</p>}
            {selectedResource && token && <PublicResourceDetail key={`${token}:${selectedResource.id}`} resource={selectedResource} token={token} />}
            {selectedRelation && <>
              <h2 className="text-lg font-semibold">{selectedRelation.label || selectedRelation.typeKey}</h2>
              <p>Tipo: {selectedRelation.typeKey} · dirección: {selectedRelation.direction === 'directed' ? 'dirigida' : 'no dirigida'}</p>
              {selectedRelation.explanation && <p className="whitespace-pre-wrap">{selectedRelation.explanation}</p>}
              <div className="flex flex-wrap gap-2"><button className="rounded-md bg-surface-variant px-3 py-2 hover:bg-border/50 focus-visible:outline-2 focus-visible:outline-primary" onClick={() => setSelection({ kind: 'resource', id: selectedRelation.sourceResourceId })}>Ir a {titles.get(selectedRelation.sourceResourceId)}</button>
                <button className="rounded-md bg-surface-variant px-3 py-2 hover:bg-border/50 focus-visible:outline-2 focus-visible:outline-primary" onClick={() => setSelection({ kind: 'resource', id: selectedRelation.targetResourceId })}>Ir a {titles.get(selectedRelation.targetResourceId)}</button></div>
              <h3 className="font-semibold">Evidencia publicada</h3>
              {!selectedRelation.evidence?.length && <p>No se publicó evidencia para esta Relación.</p>}
              <ul className="space-y-2">{selectedRelation.evidence?.map((item, index) => <li key={`${item.resourceId}-${index}`} className="rounded-md bg-background/65 p-2"><p>{titles.get(item.resourceId) ?? 'Recurso publicado'}{item.pageNumber ? ` · página ${item.pageNumber}` : ''}</p>{item.excerpt && <blockquote className="border-l-2 border-outline pl-2">{item.excerpt}</blockquote>}{item.note && <p>{item.note}</p>}</li>)}</ul>
            </>}
            </section>
          </div>
        </>}
    </div>
  </main>;
}
