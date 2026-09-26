import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../api/httpClient';
import { AIGuidanceCard } from '../../components/ai/AIGuidanceCard';
import { Button } from '../../components/ui/Button';
import { useRelationSuggestion, type RelationSuggestion } from '../../data/useAi';
import { useResources } from '../../data/useResources';
import { useRelation, useUpdateRelation, type RelationDetail, type UpdateRelationInput } from '../../data/useRelations';
import { CanvasDialog } from './CanvasDialog';

type EvidenceDraft = { resourceId: string; title: string; resourceVersionId?: string; startOffset?: number; endOffset?: number; pageNumber: string; excerpt: string; note: string };
type Draft = Omit<UpdateRelationInput, 'expectedRevision' | 'evidence'> & { evidence: EvidenceDraft[]; expectedRevision: number };
function fromDetail(detail: RelationDetail): Draft {
  return { label: detail.label ?? '', explanation: detail.explanation ?? '', provenance: detail.provenance ?? '', evidenceStatus: detail.evidenceStatus, evidence: detail.evidence.map(item => ({ resourceId: item.resourceId, title: item.title, resourceVersionId: item.resourceVersionId ?? undefined, startOffset: item.startOffset ?? undefined, endOffset: item.endOffset ?? undefined, pageNumber: item.pageNumber?.toString() ?? '', excerpt: item.excerpt ?? '', note: item.note ?? '' })), expectedRevision: detail.revision };
}

export function RelationEditor({ relationId, onClose }: { relationId: string; onClose: () => void }) {
  const relation = useRelation(relationId);
  return <CanvasDialog titleId="relation-editor-title" onClose={onClose} className="max-w-2xl max-h-[90vh] overflow-auto">
    <h2 id="relation-editor-title" className="text-lg font-semibold">Editar Relación</h2>
    {relation.isPending && <p role="status" className="mt-3 text-sm">Cargando Relación…</p>}
    {relation.isError && <div role="alert" className="mt-3 text-sm"><p>No se pudo cargar la Relación.</p><Button className="mt-2" onClick={() => void relation.refetch()}>Reintentar</Button></div>}
    {relation.data && <RelationEditorForm detail={relation.data} reload={relation.refetch} onClose={onClose} />}
  </CanvasDialog>;
}

function RelationEditorForm({ detail, reload, onClose }: { detail: RelationDetail; reload: () => Promise<{ data?: RelationDetail }>; onClose: () => void }) {
  const [draft, setDraft] = useState(() => fromDetail(detail));
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState<RelationSuggestion | null>(null);
  const [humanEdited, setHumanEdited] = useState(false);
  const inference = useRelationSuggestion();
  const resources = useResources({ query: search.trim() });
  const client = useQueryClient();
  const mutation = useUpdateRelation(detail.id);
  const candidates = resources.data?.pages.flatMap(page => page.data).filter(item => !draft.evidence.some(citation => citation.resourceId === item.id)) ?? [];
  const changeEvidence = (index: number, field: 'excerpt' | 'note' | 'pageNumber', value: string) => setDraft(current => ({ ...current, evidence: current.evidence.map((item, position) => position === index ? { ...item, [field]: value, ...(field === 'excerpt' ? { startOffset: undefined, endOffset: undefined } : {}) } : item) }));
  const requestSuggestion = async () => {
    setError(''); setSuggestion(null);
    try { setSuggestion(await inference.mutateAsync(detail.id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo obtener una sugerencia. Puedes seguir editando manualmente.'); }
  };
  const applySuggestion = () => {
    if (!suggestion) return;
    const evidence = suggestion.evidence.map(item => ({ resourceId: item.resourceId, title: item.resourceId === detail.sourceResourceId ? detail.source.title : detail.target.title, excerpt: item.excerpt, note: '', pageNumber: '' }));
    setDraft(current => ({ ...current, label: suggestion.label, explanation: suggestion.explanation, provenance: `Sugerencia de ${suggestion.provider}/${suggestion.model} (${suggestion.createdAt}); insumos: ${detail.source.title}, ${detail.target.title}; revisión humana antes de guardar`, evidence, evidenceStatus: evidence.length ? 'confirmed' : 'needs_evidence' }));
    setHumanEdited(true); setSuggestion(null);
  };
  const save = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const saved = await mutation.update({ ...draft, evidence: draft.evidence.map(({ resourceId, resourceVersionId, startOffset, endOffset, pageNumber, excerpt, note }) => ({ resourceId, resourceVersionId, startOffset, endOffset, ...(pageNumber ? { pageNumber: Number(pageNumber) } : {}), excerpt, note })) });
      client.setQueryData(mutation.queryKey, saved);
      onClose();
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 409) { setConflict(true); setError('La Relación cambió en otra sesión. Tu edición sigue aquí; carga la versión remota cuando quieras revisarla.'); }
      else setError(reason instanceof Error ? reason.message : 'No se pudo guardar la Relación.');
    } finally { setBusy(false); }
  };
  const loadRemote = async () => {
    setBusy(true);
    try { const result = await reload(); if (result.data) { setDraft(fromDetail(result.data)); setConflict(false); setError(''); } }
    catch { setError('No se pudo cargar la versión remota. Tu edición sigue aquí.'); }
    finally { setBusy(false); }
  };
  return <form className="mt-3 space-y-4 text-sm" onSubmit={event => void save(event)}>
    <section aria-label="Identidad canónica" className="rounded border border-border p-3">
      <h3 className="font-medium">Vínculo entre Recursos</h3>
      <p className="mt-1">{detail.source.title} {detail.direction === 'directed' ? '→' : '↔'} {detail.target.title}</p>
      <p className="text-outline">Tipo: {detail.typeLabel} · {detail.direction === 'directed' ? 'Dirigida' : 'No dirigida'}</p>
    </section>
    <section aria-label="Sugerencia de IA" className="space-y-3">
      <AIGuidanceCard selectedResourceIds={[detail.sourceResourceId, detail.targetResourceId]} actionTitle="Sugerir una relación" executeLabel="Solicitar sugerencia" onExecute={() => void requestSuggestion()} isLoading={inference.isPending} />
      {suggestion && <div className="space-y-2 rounded border border-border p-3" aria-label="Sugerencia sin guardar">
        <h3 className="font-medium">Sugerencia sin guardar</h3>
        <p>Tipo: {suggestion.typeKey} · Dirección: {suggestion.direction === 'directed' ? 'Dirigida' : 'No dirigida'}</p>
        <p>Etiqueta: {suggestion.label}</p><p>Explicación: {suggestion.explanation}</p>
        {suggestion.uncertainty && <p role="status">Incertidumbre: {suggestion.uncertainty}</p>}
        <ul aria-label="Citas propuestas">{suggestion.evidence.map((item, index) => <li key={`${item.resourceId}-${index}`}>{item.resourceId === detail.sourceResourceId ? detail.source.title : detail.target.title}: “{item.excerpt}”</li>)}</ul>
        <p className="text-xs text-outline">{suggestion.provider}/{suggestion.model} · {new Date(suggestion.createdAt).toLocaleString()} · insumos: {detail.source.title}, {detail.target.title}. Comprueba cada cita antes de guardar.</p>
        {(suggestion.typeKey !== detail.typeKey || suggestion.direction !== detail.direction) && <p role="status">El tipo o la dirección propuestos difieren de esta relación; no se cambiarán automáticamente. Para usarlos, crea una relación manualmente.</p>}
        <div className="flex gap-2"><Button type="button" onClick={applySuggestion}>Editar y aceptar en borrador</Button><Button type="button" onClick={() => setSuggestion(null)}>Descartar</Button></div>
      </div>}
      {humanEdited && <p role="status">Sugerencia aplicada al borrador; revisa los datos y pulsa Guardar Relación para confirmar.</p>}
    </section>
    <section aria-label="Contenido canónico" className="space-y-3">
      <div><h3 className="font-medium">Datos de la Relación</h3><p className="text-xs text-outline">Estos datos pertenecen a la Cuenta y se comparten entre Diagramas. El estilo y la visibilidad de cada línea son locales.</p></div>
      <label className="block">Etiqueta<input className="mt-1 w-full rounded border border-border bg-background p-2" maxLength={160} value={draft.label} onChange={event => setDraft(value => ({ ...value, label: event.target.value }))} /></label>
      <label className="block">Explicación<textarea className="mt-1 min-h-24 w-full rounded border border-border bg-background p-2" maxLength={10_000} value={draft.explanation} onChange={event => setDraft(value => ({ ...value, explanation: event.target.value }))} /></label>
      <label className="block">Procedencia<textarea className="mt-1 min-h-16 w-full rounded border border-border bg-background p-2" maxLength={2_000} value={draft.provenance} onChange={event => setDraft(value => ({ ...value, provenance: event.target.value }))} placeholder="Cómo se llegó a esta interpretación" /></label>
    </section>
    <section aria-label="Evidencia" className="space-y-3 border-t border-border pt-3">
      <label className="block">Estado de evidencia<select className="mt-1 w-full rounded border border-border bg-background p-2" value={draft.evidenceStatus} onChange={event => setDraft(value => ({ ...value, evidenceStatus: event.target.value as Draft['evidenceStatus'] }))}><option value="none">Sin evidencia citada</option><option value="needs_evidence">Falta evidencia o debe completarse</option><option value="confirmed">Evidencia citada</option></select></label>
      {draft.evidenceStatus === 'needs_evidence' && <p className="rounded border border-amber-500 p-2 text-amber-700" role="status">Esta Relación necesita respaldo adicional.</p>}
      {draft.evidence.map((item, index) => <fieldset key={`${item.resourceId}-${index}`} className="space-y-2 rounded border border-border p-3"><legend className="font-medium">{item.title}</legend><label className="block">Fragmento<input className="mt-1 w-full rounded border border-border bg-background p-2" maxLength={2_000} value={item.excerpt} onChange={event => changeEvidence(index, 'excerpt', event.target.value)} /></label><p className="text-xs text-outline">En notas, un fragmento único se ubica automáticamente en la versión citada.</p><label className="block">Página del documento<input className="mt-1 w-28 rounded border border-border bg-background p-2" type="number" min={1} value={item.pageNumber} onChange={event => changeEvidence(index, 'pageNumber', event.target.value)} /></label>{item.resourceVersionId && <p className="text-xs text-outline">Versión: {item.resourceVersionId}{item.startOffset != null && item.endOffset != null ? ` · caracteres ${item.startOffset}–${item.endOffset}` : ''}</p>}<label className="block">Nota<textarea className="mt-1 w-full rounded border border-border bg-background p-2" maxLength={2_000} value={item.note} onChange={event => changeEvidence(index, 'note', event.target.value)} /></label><Button type="button" onClick={() => setDraft(value => ({ ...value, evidence: value.evidence.filter((_, position) => position !== index) }))}>Quitar cita</Button></fieldset>)}
      <label className="block">Buscar Recurso en Biblioteca<input className="mt-1 w-full rounded border border-border bg-background p-2" value={search} onChange={event => setSearch(event.target.value)} placeholder="Título o palabra clave" /></label>
      {resources.isError && <p role="alert">No se pudo consultar la Biblioteca.</p>}
      <ul className="max-h-32 space-y-1 overflow-auto" aria-label="Recursos para citar">{candidates.map(item => <li key={item.id}><Button type="button" disabled={draft.evidence.length >= 10} onClick={() => setDraft(value => ({ ...value, evidenceStatus: value.evidenceStatus === 'none' ? 'confirmed' : value.evidenceStatus, evidence: [...value.evidence, { resourceId: item.id, title: item.title, excerpt: '', note: '', pageNumber: '' }] }))}>Citar {item.title}</Button></li>)}</ul>
      {resources.hasNextPage && <Button type="button" onClick={() => void resources.fetchNextPage()}>Más Recursos</Button>}
    </section>
    <p className="text-xs text-outline">Última edición: {new Date(detail.updatedAt).toLocaleString()} · revisión {detail.revision}</p>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    <div className="flex flex-wrap justify-end gap-2">{conflict && <Button type="button" disabled={busy} onClick={() => void loadRemote()}>Cargar versión remota</Button>}<Button type="button" onClick={onClose}>Cancelar</Button><Button type="submit" variant="primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar Relación'}</Button></div>
  </form>;
}
