import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useResource, useResourceActions } from '../../data/useResources';
import { useCanvasStore } from '../../store/useCanvasStore';
import { CanvasPresentationInspector } from './CanvasPresentationInspector';

export function CanvasResourceInspector({ nodeId, resourceId, caption = '' }: { nodeId: string; resourceId: string; caption?: string }) {
  const resource = useResource(resourceId);
  const actions = useResourceActions();
  const updateNodeData = useCanvasStore(state => state.updateNodeData);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const item = resource.data;
  const libraryUrl = `/library/${encodeURIComponent(resourceId)}`;
  const openOriginal = async (mode: 'inline' | 'download') => {
    setError(''); setLoading(true);
    try {
      const access = await actions.access(resourceId, mode);
      if (mode === 'inline') setPreviewUrl(access.url);
      else window.open(access.url, '_blank', 'noopener,noreferrer');
    } catch { setError('No se pudo abrir el archivo. Puedes reintentar o abrirlo desde la Biblioteca.'); }
    finally { setLoading(false); }
  };
  const previewable = item?.type === 'file' && (item.mediaType === 'application/pdf' || item.mediaType?.startsWith('image/') || item.mediaType?.startsWith('audio/') || item.mediaType?.startsWith('video/'));
  return <div className="space-y-4 text-sm">
    <h2 className="font-semibold">Detalle del recurso</h2>
    {resource.isPending && <p role="status">Cargando recurso…</p>}
    {resource.isError && <div role="alert"><p>Recurso no disponible. El resto del diagrama sigue accesible.</p><Button className="mt-2" onClick={() => void resource.refetch()}>Reintentar</Button></div>}
    {item && <>
      <section aria-label="Datos del recurso" className="space-y-2 rounded-md bg-surface-variant/60 p-3">
        <h3 className="font-medium">Recurso canónico</h3>
        <p className="break-words font-medium">{item.title}</p>
        <p className="text-xs text-outline">{item.type === 'note' ? 'Nota' : item.type === 'link' ? 'Enlace' : item.mediaType || 'Archivo'} · {item.status === 'archived' ? 'Archivado' : 'Activo'}</p>
        {item.description && <p className="whitespace-pre-wrap">{item.description}</p>}
        {item.type === 'file' && <p className="text-xs text-outline">{item.byteSize == null ? 'Tamaño desconocido' : `${(item.byteSize / 1024 / 1024).toFixed(1)} MiB`}</p>}
        {item.type === 'note' && <p className="max-h-40 overflow-auto whitespace-pre-wrap">{item.content || 'Nota vacía.'}</p>}
        {item.type === 'link' && item.url && <a className="block break-all text-primary underline" href={item.url} target="_blank" rel="noopener noreferrer">Abrir enlace</a>}
        <a className="inline-block text-primary underline" href={libraryUrl} target="_blank" rel="noopener noreferrer">Abrir en Biblioteca</a>
        {item.type === 'file' && <div className="flex flex-wrap gap-2">{previewable && <Button disabled={loading} onClick={() => void openOriginal('inline')}>Vista previa</Button>}<Button disabled={loading} onClick={() => void openOriginal('download')}>Descargar original</Button></div>}
        {previewUrl && item.mediaType?.startsWith('image/') && <img className="max-h-72 max-w-full" src={previewUrl} alt={item.accessibilityText || item.title} onError={() => setError('No se pudo mostrar la imagen. El original sigue disponible.')} />}
        {previewUrl && item.mediaType === 'application/pdf' && <iframe className="h-72 w-full" src={previewUrl} title={`Vista previa de ${item.title}`} onError={() => setError('No se pudo mostrar el PDF. El original sigue disponible.')} />}
        {previewUrl && item.mediaType?.startsWith('audio/') && <audio className="w-full" controls preload="none" src={previewUrl}>Audio no disponible.</audio>}
        {previewUrl && item.mediaType?.startsWith('video/') && <video className="max-h-72 w-full" controls preload="none" src={previewUrl}>Video no disponible.</video>}
        {error && <p role="alert" className="text-red-600">{error}</p>}
      </section>
    </>}
    <section aria-label="Propiedades de la representación" className="rounded-md bg-surface-variant/60 p-3">
      <h3 className="font-medium">Solo en este diagrama</h3>
      <label className="mt-2 block">Etiqueta local<input className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary" value={caption} maxLength={120} onChange={event => updateNodeData(nodeId, { caption: event.target.value })} /></label>
      <p className="mt-2 text-xs text-outline">Esta etiqueta no cambia el recurso de la Biblioteca.</p>
    </section>
    <CanvasPresentationInspector nodeId={nodeId} />
  </div>;
}
