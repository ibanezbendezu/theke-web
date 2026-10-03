import {useRef, useState} from 'react';
import {Upload, X} from 'lucide-react';
import {Button} from '../ui/Button';
import {InlineLoading} from '../ui/LoadingState';
import {useUploads} from '../../data/useUploads';
import {transferUpload} from '../../data/uploadTransfer';
import {useLibraryFolderActions} from '../../data/useLibraryFolders';

interface Item {
    localId: string;
    uploadId?: string;
    name: string;
    size: number;
    progress: number;
    status: string;
    error?: string
}

const terminal = new Set(['ready', 'rejected', 'failed', 'cancelled']);
const labels: Record<string, string> = {
    waiting: 'Preparando',
    initiated: 'Pendiente',
    uploading: 'Transfiriendo',
    finalizing: 'Confirmando',
    uploaded: 'En cola',
    scanning: 'Analizando',
    ready: 'Listo',
    rejected: 'Rechazado',
    failed: 'Falló',
    cancelled: 'Cancelado'
};

export function UploadTray({folderId = null}: { folderId?: string | null }) {
    const api = useUploads();
    const folders = useLibraryFolderActions();
    const [items, setItems] = useState<Item[]>([]);
    const requests = useRef(new Map<string, XMLHttpRequest>());
    const localItems = items.map(item => {
        const remote = api.uploads.data?.find(value => value.id === item.uploadId);
        return remote ? {
            ...item,
            status: remote.status,
            progress: remote.status === 'ready' ? 100 : item.progress,
            error: remote.failureReason ?? undefined
        } : item;
    });
    const displayItems = [...localItems, ...(api.uploads.data ?? []).filter(remote => !items.some(item => item.uploadId === remote.id)).map(remote => ({
        localId: `remote-${remote.id}`,
        uploadId: remote.id,
        name: remote.name,
        size: remote.size,
        progress: remote.status === 'ready' ? 100 : 0,
        status: remote.status,
        error: remote.failureReason ?? undefined
    }))];
    const patch = (id: string, value: Partial<Item>) => setItems(current => current.map(item => item.localId === id ? {...item, ...value} : item));
    const start = async (file: File, localId: string) => {
        try {
            const created = await api.create(file, crypto.randomUUID());
            patch(localId, {uploadId: created.id, status: 'uploading'});
            if (folderId) {
                try {
                    await folders.move.mutateAsync({resourceIds: [created.resourceId], folderId});
                } catch {
                    patch(localId, {error: 'No se pudo mover a la carpeta. El archivo quedará en la raíz.'});
                }
            }
            if (!created.uploadUrl) throw new Error('No se recibió una URL de carga.');
            await transferUpload(file, created.uploadUrl, progress => patch(localId, {progress}), request => requests.current.set(localId, request));
            requests.current.delete(localId);
            patch(localId, {status: 'finalizing', progress: 100});
            await api.finalize(created.id);
            patch(localId, {status: 'uploaded'});
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            patch(localId, {status: 'failed', error: error instanceof Error ? error.message : 'No se pudo cargar.'});
        }
    };
    const add = (files: FileList | File[]) => {
        const policy = api.policy.data;
        const selected = [...files].slice(0, policy?.maxBatchSize ?? 20);
        const next = selected.map(file => ({
            localId: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            progress: 0,
            status: 'waiting'
        }));
        setItems(current => [...current, ...next]);
        next.forEach((item, index) => {
            const file = selected[index]!;
            if (policy && (file.size > policy.maxFileSize || !policy.allowedMediaTypes.includes(file.type || 'application/octet-stream'))) patch(item.localId, {
                status: 'failed',
                error: 'Tipo o tamaño no admitido.'
            }); else void start(file, item.localId);
        });
    };
    const cancel = async (item: Item) => {
        requests.current.get(item.localId)?.abort();
        requests.current.delete(item.localId);
        if (item.uploadId) await api.cancel(item.uploadId).catch(() => undefined);
        patch(item.localId, {status: 'cancelled', error: undefined});
    };
    return <section className="mt-5" aria-label="Carga de archivos">{api.policy.isPending ?
        <div className="grid min-h-56 place-items-center rounded-lg bg-surface-variant/60"><InlineLoading label="Preparando carga…"/></div> :
        api.policy.isError ? <div role="alert" className="rounded-lg bg-surface-variant/60 p-5 text-sm">
            <p>No se pudieron consultar los límites de carga.</p>
            <Button className="mt-2" onClick={() => void api.policy.refetch()}>Reintentar</Button>
        </div> : <label
        className="flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg bg-surface-variant/60 p-6 text-center text-sm text-outline hover:bg-surface-variant focus-within:outline-2 focus-within:outline-primary"
        onDragOver={event => event.preventDefault()} onDrop={event => {
        event.preventDefault();
        add(event.dataTransfer.files);
    }}><Upload size={30}/><strong className="text-on-background">Arrastra archivos aquí</strong><span
        className="rounded-md bg-background px-3 py-2 text-on-background">Subir archivos</span><small>Hasta {api.policy.data?.maxBatchSize ?? 20} archivos
        por carga</small><input id="library-upload-input" className="sr-only" aria-label="Seleccionar archivos"
                                type="file" multiple onChange={event => {
        if (event.target.files) add(event.target.files);
        event.target.value = '';
    }}/></label>}{api.uploads.isPending && <div className="mt-3"><InlineLoading label="Consultando cargas…"/></div>}{displayItems.length > 0 && <div className="mt-3 rounded-lg bg-surface-variant/50 p-3"
                                                 aria-label="Progreso de cargas">{displayItems.map(item => <div
        key={item.localId} className="py-2">
        <div className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate">{item.name}</span><span
            className="text-xs text-outline">{(item.size / 1024 / 1024).toFixed(1)} MiB · {labels[item.status] ?? item.status}</span>{!terminal.has(item.status) &&
            <Button size="icon" icon={X} aria-label={`Cancelar ${item.name}`} onClick={() => void cancel(item)}/>}</div>
        <progress className="theke-progress mt-1 w-full" aria-label={`Progreso de ${item.name}`} max={100}
                  value={['uploading', 'ready', 'failed', 'rejected', 'cancelled'].includes(item.status) ? item.progress : undefined}/>
        {item.error && <p role="alert" className="text-sm text-red-600">{item.error}</p>}</div>)}</div>}</section>;
}
