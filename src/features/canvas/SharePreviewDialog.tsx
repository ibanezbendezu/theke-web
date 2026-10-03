import {useState} from 'react';
import type {SharePreview} from '../../api/generated/models';
import {Button} from '../../components/ui/Button';
import {useSharePreview} from '../../data/useSharePreview';
import {usePublishShare} from '../../data/usePublishShare';
import {useShareManagement} from '../../data/useShareManagement';
import {CanvasDialog} from './CanvasDialog';
import {PublicDiagramCanvas} from '../../pages/PublicDiagramCanvas';
import {publicRelationLabel} from '../../pages/publicRelationLabel';

export function SharePreviewDialog({diagramId, canPreview, onClose}: {
    diagramId: string;
    canPreview: boolean;
    onClose: () => void
}) {
    const preview = useSharePreview(diagramId);
    const publish = usePublishShare(diagramId);
    const management = useShareManagement(diagramId);
    const [previous, setPrevious] = useState<SharePreview | null>(null);
    const [operationKey, setOperationKey] = useState(() => crypto.randomUUID());
    const [approved, setApproved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [revokeConfirmation, setRevokeConfirmation] = useState('');
    const calculate = () => {
        if (!canPreview) return;
        setPrevious(preview.data ?? null);
        publish.reset();
        setApproved(false);
        setOperationKey(crypto.randomUUID());
        preview.reset();
        preview.mutate();
    };
    const data = canPreview && !preview.isPending && !preview.isError ? preview.data : null;
    const fingerprint = data?.fingerprint;
    const activeShare = management.active.data?.active ? management.active.data : null;
    const relativeUrl = activeShare?.url ?? publish.data?.url;
    const shareUrl = relativeUrl && /^\/share\/[A-Za-z0-9_-]{43}$/.test(relativeUrl) ? `${window.location.origin}${relativeUrl}` : null;
    const titles = new Map(data?.resources.map(item => [item.id, item.title]));
    const differences: string[] = [];
    if (previous && data) {
        if (previous.revision !== data.revision) differences.push(`Revisión: ${previous.revision} → ${data.revision}`);
        for (const [before, after, name] of [[previous.resources, data.resources, 'Recurso'], [previous.relations, data.relations, 'Relación']] as const) {
            const prior = new Map(before.map(item => [item.id, item]));
            const current = new Map(after.map(item => [item.id, item]));
            for (const item of after) if (!prior.has(item.id)) differences.push(`${name} añadido: ${'title' in item ? item.title : publicRelationLabel(item)}`);
            for (const item of before) if (!current.has(item.id)) differences.push(`${name} retirado: ${'title' in item ? item.title : publicRelationLabel(item)}`);
            for (const item of after) if (prior.has(item.id) && JSON.stringify(prior.get(item.id)) !== JSON.stringify(item)) differences.push(`${name} modificado: ${'title' in item ? item.title : publicRelationLabel(item)}`);
        }
        if (JSON.stringify(previous.layout) !== JSON.stringify(data.layout)) differences.push('Posiciones o conexiones del Diagrama modificadas');
    }
    return <CanvasDialog titleId="share-preview-title" onClose={onClose} className="max-w-3xl">
        <h2 id="share-preview-title" className="font-semibold">Previsualización privada para compartir</h2>
        <p className="mt-2 text-sm text-outline">Solo se calcula desde el Diagrama guardado. El enlace público se activa
            únicamente al confirmar Publicar. Guarda los cambios y vuelve a calcular para revisar una versión nueva.</p>
        <div className="mt-3 flex flex-wrap gap-2"><Button disabled={!canPreview || preview.isPending}
                                                           onClick={calculate}>{data ? 'Recalcular inventario' : 'Calcular inventario guardado'}</Button><Button
            onClick={onClose}>Volver al editor</Button></div>
        {!canPreview &&
            <p role="status" className="mt-3">Hay cambios locales pendientes o el Canvas no está listo. Espera a que
                aparezca «Guardado» antes de calcular.</p>}
        {preview.isPending && <p role="status">Calculando previsualización…</p>}
        {preview.isError &&
            <p role="alert" className="mt-3">No se pudo calcular la previsualización. Revisa el Diagrama guardado y
                vuelve a intentarlo.</p>}
        {data && <section aria-label="Inventario de publicación"
                          className="mt-4 max-h-[65vh] space-y-4 overflow-auto text-sm">
            <p role="status">{data.diagramName} · revisión
                guardada {data.revision}. {data.ready ? 'Sin bloqueos detectados.' : 'La publicación estaría bloqueada hasta corregir las advertencias.'}</p>
            {previous &&
                <section aria-label="Cambios desde la última revisión"><h3 className="font-semibold">Cambios desde la
                    revisión anterior</h3>{differences.length ?
                    <ul>{differences.map((change, index) => <li key={index}>{change}</li>)}</ul> :
                    <p>Sin cambios en los campos compartibles.</p>}</section>}
            <p className="text-xs text-outline">Campos visibles: contenido autorizado de Recursos y Relaciones;
                posiciones, tamaños, grupos, anotaciones, carpetas representadas, fondo y conexiones del mapa. La
                previsualización incluye los elementos visuales que verá el visitante.</p>
            <section aria-label="Composición pública"><h3 className="font-semibold">Composición pública
                ({data.layout.nodes.length} elementos, {data.layout.edges.length} líneas)</h3>
                <ul>{data.layout.nodes.map(node => <li
                    key={node.id}>{node.resourceId ? titles.get(node.resourceId) : node.folderName ?? node.label ?? node.text ?? node.type ?? 'Elemento visual'} ·
                    posición {Math.round(node.x)}, {Math.round(node.y)}</li>)}</ul>
            </section>
            <section aria-label="Vista previa del mapa"><h3 className="mb-2 font-semibold">Así se verá el mapa
                compartido</h3>
                <div className="h-96 overflow-hidden rounded-lg bg-background"><PublicDiagramCanvas
                    data={{...data, commentsEnabled: activeShare?.commentsEnabled ?? false}} selection={null}
                    onSelect={() => {
                    }}/></div>
            </section>
            <section aria-label="Experiencia de lectura"><h3 className="font-semibold">Vista de lectura del
                visitante</h3>
                {data.resources.length === 0 && <p>Sin Recursos representados.</p>}
                {data.resources.map(item => <article key={item.id}
                                                     className="mt-2 rounded-md bg-surface-variant/60 p-3"><h4
                    className="font-medium">{item.title}</h4><p>Tipo: {item.type}</p>{item.description &&
                    <p>{item.description}</p>}{item.content &&
                    <p className="whitespace-pre-wrap">{item.content}</p>}{item.url &&
                    <p className="break-all">URL: {item.url}</p>}{item.mediaType &&
                    <p>Formato: {item.mediaType}</p>}{item.accessibilityText &&
                    <p className="whitespace-pre-wrap">Texto accesible: {item.accessibilityText}</p>}</article>)}
            </section>
            <section aria-label="Relaciones expuestas"><h3 className="font-semibold">Relaciones
                ({data.relations.length})</h3>
                <ul>{data.relations.map(item => <li key={item.id}
                                                    className="mt-2 rounded-md bg-surface-variant/60 p-2">{titles.get(item.sourceResourceId)} {item.direction === 'directed' ? '→' : '↔'} {titles.get(item.targetResourceId)} · {publicRelationLabel(item)}{item.explanation &&
                    <p>{item.explanation}</p>}{item.evidence?.map((evidence, index) => <p key={index}>Evidencia
                    de {titles.get(evidence.resourceId)}{evidence.pageNumber ? ` · página ${evidence.pageNumber}` : ''}: {evidence.excerpt || evidence.note || 'Sin texto adicional'}</p>)}</li>)}</ul>
            </section>
            <section aria-label="Advertencias de accesibilidad"><h3 className="font-semibold">Advertencias
                ({data.warnings.length})</h3>
                <ul>{data.warnings.map((item, index) => <li
                    key={`${item.resourceId}-${item.field}-${index}`}>{titles.get(item.resourceId) ?? 'Recurso no disponible'} · {item.field}: {item.message}</li>)}</ul>
            </section>
            {data.ready && fingerprint && !activeShare && !shareUrl &&
                <div className="space-y-2 border-t border-border pt-3">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={approved}
                                                                      onChange={event => setApproved(event.target.checked)}/>He
                        revisado los Recursos, Relaciones y elementos visuales que se harán públicos.</label>
                    <Button variant="primary"
                            disabled={!canPreview || !approved || publish.isPending || management.active.isPending}
                            onClick={() => publish.mutate({
                                fingerprint,
                                idempotencyKey: operationKey
                            }, {onSuccess: () => void management.refresh()})}>Publicar enlace no listado</Button>
                </div>}
            {publish.isError &&
                <p role="alert">No se pudo publicar. Si cambió el contenido, recalcula el inventario y vuelve a
                    confirmarlo.</p>}
            {publish.data && !shareUrl && <p role="alert">No se pudo verificar el enlace devuelto. No lo compartas.</p>}
        </section>}
        {management.active.isError &&
            <p role="alert">No se pudo consultar el Compartido activo. Vuelve a abrir este panel.</p>}
        {shareUrl &&
            <section aria-label="Enlace compartido" className="space-y-3 rounded-md bg-surface-variant/60 p-4 text-sm">
                <h3 className="font-semibold">Enlace no listado activo</h3><p>Quien tenga este enlace podrá leer la
                revisión pública {activeShare?.revision ?? data?.revision}.</p><input aria-label="Enlace para compartir"
                                                                                      readOnly
                                                                                      className="w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
                                                                                      value={shareUrl}
                                                                                      onFocus={event => event.target.select()}/><Button
                onClick={() => void navigator.clipboard.writeText(shareUrl).then(() => setCopied(true)).catch(() => setCopied(false))}>Copiar
                enlace</Button>{copied && <p role="status">Enlace copiado.</p>}
                {activeShare && <>
                    <label className="flex items-center gap-2"><input type="checkbox"
                                                                      checked={activeShare.commentsEnabled}
                                                                      disabled={management.comments.isPending}
                                                                      onChange={event => management.comments.mutate({enabled: event.target.checked})}/>Permitir
                        nuevos comentarios en este enlace</label>
                    {management.comments.isError &&
                        <p role="alert">No se pudo cambiar la configuración de comentarios. Inténtalo de nuevo.</p>}
                    <div className="space-y-2 border-t border-border pt-3"><p>La actualización reemplaza el contenido
                        público completo y conserva este enlace. Guarda el Canvas, calcula el inventario y revisa los
                        cambios antes de actualizar.</p>
                        <Button
                            disabled={!canPreview || !data?.ready || !fingerprint || fingerprint === activeShare.fingerprint || management.update.isPending}
                            onClick={() => {
                                if (fingerprint) management.update.mutate({
                                    fingerprint,
                                    expectedPublishedFingerprint: activeShare.fingerprint
                                });
                            }}>Actualizar revisión pública</Button>
                        {management.update.isError &&
                            <p role="alert">No se pudo actualizar. La revisión pública anterior sigue disponible;
                                recalcula el inventario y vuelve a intentarlo.</p>}
                    </div>
                    <div className="space-y-2 border-t border-border pt-3"><p>Revocar invalida este enlace y cierra su
                        hilo de comentarios. El Diagrama privado y su historial permanecen intactos. Si publicas de
                        nuevo se creará otro enlace.</p>
                        <label className="block">Escribe REVOCAR para confirmar<input aria-label="Confirmar revocación"
                                                                                      className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
                                                                                      value={revokeConfirmation}
                                                                                      onChange={event => setRevokeConfirmation(event.target.value)}/></label>
                        <Button disabled={revokeConfirmation !== 'REVOCAR' || management.revoke.isPending}
                                onClick={() => management.revoke.mutate({
                                    expectedPublishedFingerprint: activeShare.fingerprint,
                                    confirmation: 'REVOCAR'
                                }, {
                                    onSuccess: () => {
                                        publish.reset();
                                        setOperationKey(crypto.randomUUID());
                                        setApproved(false);
                                        setCopied(false);
                                        setRevokeConfirmation('');
                                    }
                                })}>Revocar enlace</Button>
                        {management.revoke.isError &&
                            <p role="alert">No se pudo revocar. Consulta el estado actualizado antes de reintentar.</p>}
                    </div>
                </>}
            </section>}
    </CanvasDialog>;
}
