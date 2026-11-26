import {useCallback, useId, useState} from 'react';
import {Download, Info, X} from 'lucide-react';
import {Dialog} from '../ui/Dialog';
import {Button} from '../ui/Button';
import {InlineLoading} from '../ui/LoadingState';
import {PdfDocumentViewer} from './PdfDocumentViewer';

export type ViewerResource = {
    id: string;
    title: string;
    type: 'file' | 'note' | 'link';
    description?: string | null;
    content?: string | null;
    url?: string | null;
    mediaType?: string | null;
    accessibilityText?: string | null;
    byteSize?: number | null;
};

export function ResourceViewerDialog({resource, url, downloadUrl, onDownload, loading, error, onRetry, onClose}: {
    resource?: ViewerResource;
    url?: string;
    downloadUrl?: string;
    onDownload?: () => void;
    loading?: boolean;
    error?: string;
    onRetry?: () => void;
    onClose: () => void;
}) {
    const titleId = useId();
    const [infoOpen, setInfoOpen] = useState(false);
    const [failed, setFailed] = useState(false);
    const [ready, setReady] = useState(false);
    const onReady = useCallback(() => setReady(true), []);
    const onError = useCallback(() => setFailed(true), []);
    const media = resource?.mediaType?.toLowerCase() ?? '';
    const pdf = media === 'application/pdf';
    const image = media.startsWith('image/');
    const audio = media.startsWith('audio/');
    const video = media.startsWith('video/');
    const link = (() => {
        try {
            const value = new URL(resource?.url ?? '');
            return ['http:', 'https:'].includes(value.protocol) ? value.href : null;
        } catch { return null; }
    })();
    return <Dialog titleId={titleId} onClose={onClose} scrollable={false} shadow={false} className="flex h-[92dvh] max-w-[96rem] flex-col">
        <header className="flex shrink-0 items-center gap-2 px-4 py-3">
            <h2 id={titleId} className="min-w-0 flex-1 truncate text-base font-semibold">{resource?.title ?? 'Abriendo recurso…'}</h2>
            {downloadUrl && <a href={downloadUrl} target="_blank" rel="noopener noreferrer" aria-label="Descargar archivo"
                className="grid h-11 w-11 place-items-center rounded-md hover:bg-surface-variant"><Download size={17}/></a>}
            {onDownload && <Button size="icon" className="h-11 w-11" icon={Download} aria-label="Descargar original" onClick={onDownload}/>}
            <Button size="icon" className="h-11 w-11 lg:hidden" icon={Info} aria-label="Mostrar propiedades del recurso"
                aria-expanded={infoOpen} onClick={() => setInfoOpen(value => !value)}/>
            <Button size="icon" className="h-11 w-11" icon={X} aria-label="Cerrar visor" onClick={onClose}/>
        </header>
        <div className="relative flex min-h-0 flex-1">
            <section aria-label="Contenido del recurso" className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-surface/70">
                {loading && <InlineLoading label="Preparando recurso…"/>}
                {(error || failed) ? <div role="alert" className="max-w-sm p-6 text-center text-sm">
                    <p>{error || 'No se pudo mostrar el contenido. Puedes volver a intentarlo o descargar el archivo.'}</p>
                    {onRetry && <Button className="mt-3" onClick={onRetry}>Reintentar vista previa</Button>}
                </div> : resource?.type === 'note' ? <article tabIndex={0}
                    className="h-full w-full overflow-auto overscroll-contain p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl whitespace-pre-wrap break-words text-base leading-relaxed">{resource.content || 'Nota vacía.'}</div>
                </article> : resource?.type === 'link' ? <article className="max-h-full w-full overflow-auto p-6 sm:p-10">
                    <div className="mx-auto max-w-3xl space-y-5">
                        {resource.description && <p className="whitespace-pre-wrap break-words">{resource.description}</p>}
                        {link ? <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-md bg-surface-variant px-3 py-2 break-all">Abrir enlace</a>
                            : <p>Este enlace no tiene una dirección web compatible.</p>}
                    </div>
                </article> : url && pdf ? <PdfDocumentViewer url={url} title={resource?.title ?? 'Documento'} onReady={onReady} onError={onError}/>
                : url && image ? <><img src={url} alt={resource?.accessibilityText || resource?.title || 'Imagen'}
                    className={`h-full w-full object-contain ${ready ? '' : 'opacity-0'}`} onLoad={onReady} onError={onError}/>
                    {!ready && <div className="absolute inset-0 grid place-items-center"><InlineLoading label="Abriendo imagen…"/></div>}</>
                : url && audio ? <audio aria-label={`Reproducir ${resource?.title}`} className="w-full max-w-xl px-5" controls preload="none" src={url} onError={onError}/>
                : url && video ? <video aria-label={`Reproducir ${resource?.title}`} className="h-full w-full object-contain" controls preload="none" src={url} onError={onError}/>
                : !loading && resource?.type === 'file' ? <div className="max-w-sm p-6 text-center text-sm text-outline">
                    <p>Este formato no tiene vista previa.</p>{url && <a className="mt-3 inline-flex min-h-11 items-center underline" href={url} target="_blank" rel="noopener noreferrer">Abrir archivo</a>}
                </div> : null}
            </section>
            {infoOpen && <button type="button" aria-label="Cerrar propiedades del recurso" className="absolute inset-0 z-10 bg-black/20 lg:hidden" onClick={() => setInfoOpen(false)}/>}
            <aside aria-label="Propiedades del recurso" className={`${infoOpen ? 'absolute inset-y-0 right-0 z-20 block w-[min(20rem,100%)]' : 'hidden'} overflow-y-auto bg-background p-5 lg:relative lg:block lg:w-72 lg:shrink-0`}>
                <div className="mb-5 flex items-center justify-between"><h3 className="text-sm font-semibold">Propiedades</h3>
                    <Button size="icon" className="lg:hidden" icon={X} aria-label="Ocultar propiedades del recurso" onClick={() => setInfoOpen(false)}/></div>
                <dl className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 text-sm">
                    <dt className="text-outline">Tipo</dt><dd className="break-words">{resource?.type === 'note' ? 'Nota' : resource?.type === 'link' ? 'Enlace' : resource?.mediaType ?? 'Archivo'}</dd>
                    {resource?.byteSize != null && <><dt className="text-outline">Tamaño</dt><dd>{(resource.byteSize / 1024 / 1024).toFixed(1)} MiB</dd></>}
                </dl>
                {resource?.description && resource.type !== 'link' && <section className="mt-6"><h4 className="text-sm font-medium">Descripción</h4><p className="mt-2 whitespace-pre-wrap break-words text-sm">{resource.description}</p></section>}
            </aside>
        </div>
    </Dialog>;
}
