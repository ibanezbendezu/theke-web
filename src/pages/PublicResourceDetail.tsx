import { useState } from 'react';
import type { SharePreviewResource } from '../api/generated/models';

function safeLink(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch { return null; }
}

export function PublicResourceDetail({ resource, token }: { resource: SharePreviewResource; token: string }) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const [requestNumber, setRequestNumber] = useState(0);
  const baseUrl = `${import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ?? ''}/v1/public/shares/${encodeURIComponent(token)}/resources/${encodeURIComponent(resource.id)}/content`;
  const previewUrl = requestNumber ? `${baseUrl}?retry=${requestNumber}` : baseUrl;
  const externalUrl = safeLink(resource.url);
  const file = resource.type === 'file';
  const image = file && resource.mediaType?.startsWith('image/');
  const audio = file && resource.mediaType?.startsWith('audio/');
  const video = file && resource.mediaType?.startsWith('video/');
  const document = file && ['application/pdf', 'text/plain'].includes(resource.mediaType ?? '');
  const previewable = image || audio || video;
  return <div className="min-w-0 space-y-3 [overflow-wrap:anywhere]">
    <h2 className="text-lg font-semibold">{resource.title}</h2>
    {resource.description && <p>{resource.description}</p>}
    {resource.content && <p className="whitespace-pre-wrap">{resource.content}</p>}
    {resource.type === 'link' && (externalUrl
      ? <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="underline focus-visible:outline-2 focus-visible:outline-primary">Abrir enlace</a>
      : <p>Este enlace no tiene una dirección web compatible.</p>)}
    {resource.mediaType && <p>Formato: {resource.mediaType}</p>}
    {resource.accessibilityText && <p className="whitespace-pre-wrap">{resource.accessibilityText}</p>}
    {file && <>
      {previewFailed && <p role="alert">No se pudo cargar la vista previa. Puedes volver a intentar, abrir el archivo o descargarlo.</p>}
      {!previewFailed && image && <img className="max-h-96 max-w-full" loading="lazy" src={previewUrl} alt={resource.accessibilityText || resource.title} referrerPolicy="no-referrer" onError={() => setPreviewFailed(true)} />}
      {!previewFailed && audio && <audio aria-label={`Reproducir ${resource.title}`} className="w-full" controls preload="none" src={previewUrl} onError={() => setPreviewFailed(true)}>El navegador no puede reproducir este audio.</audio>}
      {!previewFailed && video && <video aria-label={`Reproducir ${resource.title}`} className="max-h-96 max-w-full" controls preload="none" src={previewUrl} onError={() => setPreviewFailed(true)}>El navegador no puede reproducir este video.</video>}
      {!previewable && !document && <p>Este formato no tiene vista previa en el navegador.</p>}
      <div className="flex flex-wrap gap-3">
        {previewFailed && <button className="rounded border border-border bg-background px-3 py-2 focus-visible:outline-2 focus-visible:outline-primary" onClick={() => { setRequestNumber(value => value + 1); setPreviewFailed(false); }}>Reintentar vista previa</button>}
        <a className="rounded border border-border bg-background px-3 py-2 underline focus-visible:outline-2 focus-visible:outline-primary" href={baseUrl} target="_blank" rel="noopener noreferrer">Abrir archivo</a>
        <a className="rounded border border-border bg-background px-3 py-2 underline focus-visible:outline-2 focus-visible:outline-primary" href={`${baseUrl}?download=1`} rel="noreferrer">Descargar archivo</a>
      </div>
    </>}
  </div>;
}
