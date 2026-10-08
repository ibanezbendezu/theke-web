import {useEffect, useState} from 'react';
import {Copy, ExternalLink, Link2, MoreHorizontal, X} from 'lucide-react';
import {Button} from '../../components/ui/Button';
import {InlineLoading} from '../../components/ui/LoadingState';
import {useSharePreview} from '../../data/useSharePreview';
import {usePublishShare} from '../../data/usePublishShare';
import {useShareManagement} from '../../data/useShareManagement';
import {CanvasDialog} from './CanvasDialog';

export function SharePreviewDialog({diagramId, canPreview, onClose}: {
    diagramId: string;
    canPreview: boolean;
    onClose: () => void;
}) {
    const preview = useSharePreview(diagramId);
    const {mutate: calculatePreview} = preview;
    const publish = usePublishShare(diagramId);
    const management = useShareManagement(diagramId);
    const [operationKey, setOperationKey] = useState(() => crypto.randomUUID());
    const [copied, setCopied] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [confirmRevoke, setConfirmRevoke] = useState(false);
    const [staleFingerprint, setStaleFingerprint] = useState<string | null>(null);

    useEffect(() => {
        if (canPreview && !management.active.isPending && !management.active.isError) calculatePreview();
    }, [canPreview, calculatePreview, management.active.isPending, management.active.isError]);

    const activeShare = management.active.data?.active ? management.active.data : null;
    const relativeUrl = activeShare?.url ?? publish.data?.url;
    const shareUrl = relativeUrl && /^\/share\/[A-Za-z0-9_-]{43}$/.test(relativeUrl)
        ? `${window.location.origin}${relativeUrl}` : null;
    const latest = canPreview && !preview.isPending && !preview.isError ? preview.data : null;
    const outdated = Boolean(activeShare && latest?.ready && latest.fingerprint !== activeShare.fingerprint);
    const blocked = Boolean(activeShare && latest && !latest.ready);
    const staleForLong = outdated && staleFingerprint === latest?.fingerprint;
    useEffect(() => {
        if (!outdated) return;
        const timeout = window.setTimeout(() => setStaleFingerprint(latest?.fingerprint ?? null), 15_000);
        return () => window.clearTimeout(timeout);
    }, [outdated, latest?.fingerprint]);
    const needsAttention = blocked || (outdated && staleForLong);

    return <CanvasDialog titleId="share-title" onClose={onClose} className="max-w-md">
        <div className="flex items-start justify-between gap-3">
            <div>
                <h2 id="share-title" className="text-base font-semibold">Compartir mapa</h2>
                <p className="mt-1 text-sm text-outline">Quien tenga el enlace podrá ver el mapa.</p>
            </div>
            <Button size="icon" icon={X} title="Cerrar" onClick={onClose}/>
        </div>

        {management.active.isPending && <div className="mt-5"><InlineLoading label="Consultando enlace…"/></div>}
        {management.active.isError && <div role="alert" className="mt-5 text-sm">No se pudo consultar el enlace.
            <Button onClick={() => void management.refresh()}>Reintentar</Button></div>}

        {!management.active.isPending && !management.active.isError && !shareUrl && <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-surface-variant/55 p-4">
                <Link2 size={19} className="mt-0.5 shrink-0 text-outline" aria-hidden="true"/>
                <p className="text-sm leading-relaxed">Al crear el enlace, los cambios que guardes en este mapa
                    también serán visibles para quienes lo tengan.</p>
            </div>
            {!canPreview ? <p role="status" className="text-sm text-outline">Espera a que el mapa termine de guardarse.</p>
                : preview.isError ? null
                : preview.isPending || !latest ? <InlineLoading label="Preparando mapa compartido…"/>
                    : !latest.ready ? <div role="alert" className="space-y-2 text-sm">
                        <p>Hay contenido que impide compartir este mapa:</p>
                        <ul className="list-disc space-y-1 pl-5 text-outline">{latest.warnings.map((item, index) =>
                            <li key={`${item.resourceId}-${item.field}-${index}`}>{latest.resources.find(resource => resource.id === item.resourceId)?.title ?? 'Archivo'}: {item.message}</li>)}</ul>
                    </div> : null}
            {preview.isError && <p role="alert" className="text-sm">No se pudo preparar el mapa compartido.
                <Button onClick={() => calculatePreview()}>Reintentar</Button></p>}
            <Button variant="primary" loading={publish.isPending}
                    disabled={!canPreview || !latest?.ready || !latest.fingerprint}
                    onClick={() => {
                        if (!latest?.fingerprint) return;
                        publish.mutate({fingerprint: latest.fingerprint, idempotencyKey: operationKey}, {
                            onSuccess: () => void management.refresh(),
                            onError: () => {
                                setOperationKey(crypto.randomUUID());
                                calculatePreview();
                            }
                        });
                    }}>Crear enlace</Button>
            {publish.isError && <p role="alert" className="text-sm">No se pudo crear el enlace. Revisa el mapa guardado y vuelve a intentarlo.</p>}
        </div>}

        {shareUrl && <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-surface-variant/55 p-2">
                <input aria-label="Enlace para compartir" readOnly value={shareUrl}
                       className="min-w-0 flex-1 bg-transparent px-2 text-sm text-on-background outline-none"
                       onFocus={event => event.target.select()}/>
                <Button size="icon" icon={Copy} title="Copiar enlace" onClick={() => {
                    void navigator.clipboard.writeText(shareUrl).then(() => setCopied(true)).catch(() => setCopied(false));
                }}/>
                <a href={shareUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir enlace compartido"
                   data-tooltip="Abrir enlace compartido"
                   className="inline-flex h-9 w-9 items-center justify-center rounded-md text-outline hover:bg-surface-variant hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary">
                    <ExternalLink size={16} aria-hidden="true"/>
                </a>
            </div>
            {copied && <p role="status" className="text-xs text-outline">Enlace copiado.</p>}
            <p role="status" className="text-sm text-outline">
                {needsAttention ? 'El enlace muestra la última versión pública válida. Hay cambios guardados pendientes.'
                    : !canPreview ? 'Los cambios locales serán visibles cuando terminen de guardarse.'
                        : preview.isError ? 'No se pudo comprobar la versión pública. El enlace conserva la última versión válida.'
                            : preview.isPending ? 'El enlace se actualiza con el mapa guardado.'
                                : 'El enlace muestra el mapa guardado y se actualiza automáticamente.'}
            </p>
            {canPreview && preview.isError && <Button onClick={() => calculatePreview()}>Reintentar comprobación</Button>}
            {needsAttention && <div className="space-y-2 text-sm">
                {blocked && <p role="alert">Corrige los elementos pendientes para actualizar el mapa compartido.</p>}
                {blocked && <ul className="list-disc pl-5 text-outline">{latest?.warnings.map((item, index) =>
                    <li key={`${item.resourceId}-${item.field}-${index}`}>{latest.resources.find(resource => resource.id === item.resourceId)?.title ?? 'Archivo'}: {item.message}</li>)}</ul>}
                {outdated && staleForLong && activeShare && latest?.fingerprint && <Button loading={management.update.isPending}
                    onClick={() => management.update.mutate({fingerprint: latest.fingerprint,
                        expectedPublishedFingerprint: activeShare.fingerprint})}>Reintentar actualización</Button>}
                {management.update.isError && <p role="alert">No se pudo actualizar. El enlace sigue mostrando la última versión pública válida.</p>}
            </div>}
            {activeShare && <div className="flex items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={activeShare.commentsEnabled}
                           disabled={management.comments.isPending}
                           onChange={event => management.comments.mutate({enabled: event.target.checked})}/>
                    Permitir comentarios
                </label>
                <div className="relative">
                    <Button size="icon" icon={MoreHorizontal} title="Opciones del enlace"
                            aria-expanded={menuOpen} onClick={() => {setMenuOpen(value => !value); setConfirmRevoke(false);}}/>
                    {menuOpen && <div className="absolute bottom-full right-0 z-10 mb-1 min-w-48 rounded-lg bg-surface-variant p-1">
                        {!confirmRevoke ? <Button className="w-full justify-start" onClick={() => setConfirmRevoke(true)}>Dejar de compartir</Button>
                            : <div className="space-y-2 p-2 text-sm">
                                <p>El enlace dejará de funcionar. Si vuelves a compartir, se creará otro.</p>
                                <div className="flex gap-1">
                                    <Button onClick={() => setConfirmRevoke(false)}>Cancelar</Button>
                                    <Button loading={management.revoke.isPending} onClick={() => management.revoke.mutate({
                                        expectedPublishedFingerprint: activeShare.fingerprint, confirmation: 'REVOCAR'
                                    }, {onSuccess: () => {setMenuOpen(false); setConfirmRevoke(false); publish.reset();}})}>Confirmar</Button>
                                </div>
                                {management.revoke.isError && <p role="alert">No se pudo quitar el enlace. Vuelve a intentarlo.</p>}
                            </div>}
                    </div>}
                </div>
            </div>}
            {management.comments.isError && <p role="alert" className="text-sm">No se pudo cambiar el estado de los comentarios.</p>}
        </div>}
    </CanvasDialog>;
}
