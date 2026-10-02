import {useEffect, useRef, useState} from 'react';
import {useUploads} from '../../data/useUploads';
import {transferUpload} from '../../data/uploadTransfer';
import {useCanvasStore} from '../../store/useCanvasStore';
import {useOrganizationActions} from '../../data/useOrganization';

interface Entry {
    id: string;
    file: File;
    uploadId?: string;
    status: string;
    progress: number;
    error?: string;
    represented?: boolean
}

export interface CanvasUploadBatch {
    id: string;
    position: { x: number; y: number };
    entries: Entry[];
    nodeIds: string[];
    groupId?: string;
    undone: boolean
}

const finished = new Set(['ready', 'rejected', 'failed', 'cancelled']);

export function useCanvasUploadBatches(projectId: string) {
    const api = useUploads();
    const organization = useOrganizationActions(projectId);
    const [batches, setBatches] = useState<CanvasUploadBatch[]>([]);
    const represented = useRef(new Set<string>());
    const patch = (batchId: string, entryId: string, value: Partial<Entry>) => setBatches(current => current.map(batch => batch.id === batchId ? {
        ...batch,
        entries: batch.entries.map(entry => entry.id === entryId ? {...entry, ...value} : entry)
    } : batch));
    const start = async (batchId: string, entry: Entry) => {
        try {
            patch(batchId, entry.id, {uploadId: undefined, status: 'initiated', progress: 0, error: undefined});
            const created = await api.create(entry.file, crypto.randomUUID());
            await organization.addResources.mutateAsync([created.resourceId]);
            patch(batchId, entry.id, {uploadId: created.id, status: 'uploading'});
            if (!created.uploadUrl) throw new Error('No se recibió una URL de carga.');
            await transferUpload(entry.file, created.uploadUrl, progress => patch(batchId, entry.id, {progress}));
            patch(batchId, entry.id, {status: 'finalizing', progress: 100});
            await api.finalize(created.id);
            patch(batchId, entry.id, {status: 'uploaded'});
        } catch (error) {
            patch(batchId, entry.id, {
                status: 'failed',
                error: error instanceof Error ? error.message : 'No se pudo cargar.'
            });
        }
    };
    const addFiles = (files: File[], position: { x: number; y: number }) => {
        if (!files.length) return;
        const id = crypto.randomUUID();
        const policy = api.policy.data;
        const entries = files.map((file, index): Entry => ({
            id: crypto.randomUUID(),
            file,
            status: index >= (policy?.maxBatchSize ?? 20) || (policy && (file.size > policy.maxFileSize || !policy.allowedMediaTypes.includes(file.type || 'application/octet-stream'))) ? 'failed' : 'waiting',
            progress: 0,
            error: index >= (policy?.maxBatchSize ?? 20) ? 'Supera el máximo del lote.' : policy && (file.size > policy.maxFileSize || !policy.allowedMediaTypes.includes(file.type || 'application/octet-stream')) ? 'Tipo o tamaño no admitido.' : undefined
        }));
        setBatches(current => [...current, {id, position, entries, nodeIds: [], undone: false}]);
        entries.filter(entry => entry.status === 'waiting').forEach(entry => void start(id, entry));
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            for (const batch of batches) for (const entry of batch.entries) {
                const remote = api.uploads.data?.find(item => item.id === entry.uploadId);
                if (!remote) continue;
                if (remote.status === 'ready' && !batch.undone && !entry.represented && !represented.current.has(remote.id)) {
                    represented.current.add(remote.id);
                    const nodeIds = useCanvasStore.getState().addUploadedResource(remote.resourceId, batch.id, batch.position, batch.entries.length);
                    setBatches(current => current.map(item => item.id === batch.id ? {
                        ...item,
                        nodeIds: [...item.nodeIds, ...nodeIds],
                        entries: item.entries.map(value => value.id === entry.id ? {
                            ...value,
                            status: 'ready',
                            represented: true
                        } : value)
                    } : item));
                } else if (remote.status !== entry.status && (finished.has(remote.status) || remote.status === 'scanning')) patch(batch.id, entry.id, {
                    status: remote.status,
                    error: remote.failureReason ?? undefined
                });
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [api.uploads.data, batches]);
    const undo = (batchId: string) => {
        const batch = batches.find(item => item.id === batchId);
        if (!batch) return;
        useCanvasStore.getState().removeNodes([...batch.nodeIds, ...(batch.groupId ? [batch.groupId] : [])]);
        setBatches(current => current.map(item => item.id === batchId ? {
            ...item,
            undone: true,
            nodeIds: [],
            groupId: undefined
        } : item));
    };
    const createGroup = (batchId: string) => {
        const batch = batches.find(item => item.id === batchId);
        if (!batch || batch.undone || batch.groupId) return;
        const groupId = useCanvasStore.getState().groupNodes(batch.nodeIds);
        if (groupId) setBatches(current => current.map(item => item.id === batchId ? {...item, groupId} : item));
    };
    const retry = (batchId: string, entryId: string) => {
        const entry = batches.find(item => item.id === batchId)?.entries.find(item => item.id === entryId);
        if (entry) void start(batchId, entry);
    };
    return {batches, addFiles, retry, undo, createGroup, policy: api.policy};
}
