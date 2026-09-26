import { useState } from 'react';
import type { SharePreview } from '../../api/generated/models';
import { Button } from '../../components/ui/Button';
import { useSharePreview } from '../../data/useSharePreview';
import { CanvasDialog } from './CanvasDialog';

export function SharePreviewDialog({ diagramId, canPreview, onClose }: { diagramId: string; canPreview: boolean; onClose: () => void }) {
  const preview = useSharePreview(diagramId);
  const [previous, setPrevious] = useState<SharePreview | null>(null);
  const calculate = () => { if (!canPreview) return; setPrevious(preview.data ?? null); preview.reset(); preview.mutate(); };
  const data = canPreview && !preview.isPending && !preview.isError ? preview.data : null;
  const titles = new Map(data?.resources.map(item => [item.id, item.title]));
  const differences: string[] = [];
  if (previous && data) {
    if (previous.revision !== data.revision) differences.push(`Revisión: ${previous.revision} → ${data.revision}`);
    for (const [before, after, name] of [[previous.resources, data.resources, 'Recurso'], [previous.relations, data.relations, 'Relación']] as const) {
      const prior = new Map(before.map(item => [item.id, item]));
      const current = new Map(after.map(item => [item.id, item]));
      for (const item of after) if (!prior.has(item.id)) differences.push(`${name} añadido: ${'title' in item ? item.title : item.label || item.typeKey}`);
      for (const item of before) if (!current.has(item.id)) differences.push(`${name} retirado: ${'title' in item ? item.title : item.label || item.typeKey}`);
      for (const item of after) if (prior.has(item.id) && JSON.stringify(prior.get(item.id)) !== JSON.stringify(item)) differences.push(`${name} modificado: ${'title' in item ? item.title : item.label || item.typeKey}`);
    }
  }
  return <CanvasDialog titleId="share-preview-title" onClose={onClose} className="max-w-3xl">
    <h2 id="share-preview-title" className="font-semibold">Previsualización privada para compartir</h2>
    <p className="mt-2 text-sm text-outline">Solo se calcula desde el Diagrama guardado. Ningún enlace público se activa. Guarda los cambios y vuelve a calcular para revisar una versión nueva.</p>
    <div className="mt-3 flex flex-wrap gap-2"><Button disabled={!canPreview || preview.isPending} onClick={calculate}>{data ? 'Recalcular inventario' : 'Calcular inventario guardado'}</Button><Button onClick={onClose}>Volver al editor</Button></div>
    {!canPreview && <p role="status" className="mt-3">Hay cambios locales pendientes o el Canvas no está listo. Espera a que aparezca «Guardado» antes de calcular.</p>}
    {preview.isPending && <p role="status">Calculando previsualización…</p>}
    {preview.isError && <p role="alert" className="mt-3">No se pudo calcular la previsualización. Revisa el Diagrama guardado y vuelve a intentarlo.</p>}
    {data && <section aria-label="Inventario de publicación" className="mt-4 max-h-[65vh] space-y-4 overflow-auto text-sm">
      <p role="status">{data.diagramName} · revisión guardada {data.revision}. {data.ready ? 'Sin bloqueos detectados.' : 'La publicación estaría bloqueada hasta corregir las advertencias.'}</p>
      {previous && <section aria-label="Cambios desde la última revisión"><h3 className="font-semibold">Cambios desde la revisión anterior</h3>{differences.length ? <ul>{differences.map((change, index) => <li key={index}>{change}</li>)}</ul> : <p>Sin cambios en los campos compartibles.</p>}</section>}
      <p className="text-xs text-outline">Campos visibles: título, descripción y contenido de notas; URL y texto accesible de enlaces; tipo, formato y texto accesible de archivos; tipo, dirección, etiqueta y explicación de Relaciones representadas. No se incluyen Carpetas, Proyectos ni otros Recursos.</p>
      <section aria-label="Experiencia de lectura"><h3 className="font-semibold">Vista de lectura del visitante</h3>
        {data.resources.length === 0 && <p>Sin Recursos representados.</p>}
        {data.resources.map(item => <article key={item.id} className="mt-2 rounded border border-border p-3"><h4 className="font-medium">{item.title}</h4><p>Tipo: {item.type}</p>{item.description && <p>{item.description}</p>}{item.content && <p className="whitespace-pre-wrap">{item.content}</p>}{item.url && <p className="break-all">URL: {item.url}</p>}{item.mediaType && <p>Formato: {item.mediaType}</p>}{item.accessibilityText && <p className="whitespace-pre-wrap">Texto accesible: {item.accessibilityText}</p>}</article>)}
      </section>
      <section aria-label="Relaciones expuestas"><h3 className="font-semibold">Relaciones ({data.relations.length})</h3><ul>{data.relations.map(item => <li key={item.id} className="mt-2 rounded border border-border p-2">{titles.get(item.sourceResourceId)} {item.direction === 'directed' ? '→' : '↔'} {titles.get(item.targetResourceId)} · {item.label || item.typeKey}{item.explanation && <p>{item.explanation}</p>}</li>)}</ul></section>
      <section aria-label="Advertencias de accesibilidad"><h3 className="font-semibold">Advertencias ({data.warnings.length})</h3><ul>{data.warnings.map((item, index) => <li key={`${item.resourceId}-${item.field}-${index}`}>{titles.get(item.resourceId) ?? 'Recurso no disponible'} · {item.field}: {item.message}</li>)}</ul></section>
    </section>}
  </CanvasDialog>;
}