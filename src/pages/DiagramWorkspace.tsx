import {useAuth} from '@clerk/clerk-react';
import {useQueryClient} from '@tanstack/react-query';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {MarkerType} from '@xyflow/react';
import {Link2, LoaderCircle, X} from 'lucide-react';
import {ApiError} from '../api/httpClient';
import {Button} from '../components/ui/Button';
import {deleteCanvasDraft, readCanvasDraft, writeCanvasDraft, type CanvasDraft} from '../data/canvasJournal';
import {migrateCanvasDocument} from '../data/canvasDocument';
import {type Diagram, type DiagramDocument, useSaveDiagramDocument} from '../data/useDiagrams';
import {CanvasEditor, type RelationEdgeGeometry} from '../features/canvas/CanvasEditor';
import {RelationCreateDialog} from '../features/canvas/RelationCreateDialog';
import {mergeCreatedRelation} from '../features/canvas/mergeCreatedRelation';
import {RelationEditor} from '../features/canvas/RelationEditor';
import {
    useAvailableRelations,
    useCreateRelation,
    type CreateRelationInput,
    type AvailableRelation
} from '../data/useRelations';
import {useCanvasStore} from '../store/useCanvasStore';
import type {CommentNotification} from '../data/useCommentNotifications';

function snapshot(): DiagramDocument {
    const state = useCanvasStore.getState();
    const nodes = JSON.parse(JSON.stringify(state.nodes)) as DiagramDocument['nodes'];
    const edges = JSON.parse(JSON.stringify(state.edges)) as DiagramDocument['edges'];
    for (const node of nodes) {
        const transient = node as unknown as Record<string, unknown>;
        delete transient.selected;
        delete transient.dragging;
        delete transient.measured;
        delete transient.internals;
    }
    for (const edge of edges) delete (edge as unknown as Record<string, unknown>).selected;
    return {schemaVersion: 1, nodes, edges, viewport: state.viewport, background: state.background};
}

const fingerprint = (document: DiagramDocument) => JSON.stringify(document);
type SaveStatus = 'saved' | 'saving' | 'offline' | 'conflict' | 'storage-error';

export function DiagramWorkspace({
                                     diagram,
                                     refetch,
                                     onAddResource,
                                     onDropResource,
                                     onDropFiles,
                                     onPickFiles,
                                     onCanvasReady,
                                     onSaveStateChange,
                                     commentNotifications,
                                     selectedCommentId,
                                     onCommentOpen
                                 }: {
    diagram: Diagram;
    refetch: () => Promise<{ data?: Diagram }>;
    onAddResource: (position?: { x: number; y: number }) => void;
    onDropResource: (resourceId: string, position: { x: number; y: number }) => void;
    onDropFiles?: (files: File[], position: { x: number; y: number }) => void;
    onPickFiles?: (position?: { x: number; y: number }) => void;
    onCanvasReady?: () => void;
    onSaveStateChange?: (saved: boolean) => void;
    commentNotifications?: CommentNotification[];
    selectedCommentId?: string | null;
    onCommentOpen?: (item: CommentNotification) => void;
}) {
    const {userId} = useAuth();
    const client = useQueryClient();
    const draftKey = `${userId}:${diagram.id}`;
    const save = useSaveDiagramDocument(diagram.id);
    const saveRef = useRef(save);
    const createRelation = useCreateRelation(diagram.id);
    const available = useAvailableRelations(diagram.id);
    const canvasNodes = useCanvasStore(state => state.nodes);
    const canvasEdges = useCanvasStore(state => state.edges);
    const [relationInitial, setRelationInitial] = useState<{ source?: string; target?: string; replaceEdgeId?: string; geometry?: RelationEdgeGeometry } | null>(null);
    const [availableOpen, setAvailableOpen] = useState(false);
    const relationRequest = useCanvasStore(state => state.relationRequest);
    const [dismissedRelationNonce, setDismissedRelationNonce] = useState(() => useCanvasStore.getState().relationRequest?.nonce ?? null);
    const activeRelation = relationInitial ?? (relationRequest && relationRequest.nonce !== dismissedRelationNonce ? relationRequest : null);
    const closeRelation = () => {
        setRelationInitial(null);
        setDismissedRelationNonce(relationRequest?.nonce ?? null);
    };
    const editRelationRequest = useCanvasStore(state => state.editRelationRequest);
    const [dismissedEditNonce, setDismissedEditNonce] = useState(() => useCanvasStore.getState().editRelationRequest?.nonce ?? null);
    const activeEditRelation = editRelationRequest?.nonce !== dismissedEditNonce ? editRelationRequest : null;
    useEffect(() => {
        saveRef.current = save;
    }, [save]);
    const remote = useMemo(() => {
        try {
            return {document: migrateCanvasDocument(diagram.document), error: ''};
        } catch (error) {
            return {document: null, error: error instanceof Error ? error.message : 'No se pudo abrir el documento.'};
        }
    }, [diagram.document]);
    const initialRemote = useRef(remote);
    const initialRevision = useRef(diagram.revision);
    const [choice, setChoice] = useState<'checking' | 'draft' | 'ready'>('checking');
    const [document, setDocument] = useState<DiagramDocument | null>(null);
    const [status, setStatus] = useState<SaveStatus>('saved');
    const [conflict, setConflict] = useState(false);
    useEffect(() => {
        onSaveStateChange?.(choice === 'ready' && status === 'saved');
        return () => onSaveStateChange?.(false);
    }, [choice, status, onSaveStateChange]);
    const revisionRef = useRef(diagram.revision);
    const confirmedRef = useRef(remote.document ? fingerprint(remote.document) : '');
    const latestRef = useRef<CanvasDraft | null>(null);
    const retryRef = useRef<CanvasDraft | null>(null);
    const savingRef = useRef(false);
    const blockedRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const journalQueue = useRef<Promise<unknown>>(Promise.resolve());
    const pumpRef = useRef<() => Promise<void>>(async () => {
    });
    const queueWrite = useCallback((draft: CanvasDraft) => {
        journalQueue.current = journalQueue.current.catch(() => {
        }).then(() => writeCanvasDraft(draft)).catch(() => setStatus('storage-error'));
    }, []);
    const schedule = useCallback((delay = 700) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => void pumpRef.current(), delay);
    }, []);
    const markChanged = useCallback(() => {
        const next = snapshot();
        if (fingerprint(next) === confirmedRef.current) return;
        if (latestRef.current && fingerprint(latestRef.current.document) === fingerprint(next)) return;
        const draft = {
            key: draftKey,
            document: next,
            baseRevision: revisionRef.current,
            operationId: crypto.randomUUID()
        };
        latestRef.current = draft;
        queueWrite(draft);
        if (!blockedRef.current) {
            setStatus('saving');
            schedule();
        }
    }, [draftKey, queueWrite, schedule]);
    const pump = useCallback(async () => {
        if (savingRef.current || blockedRef.current) return;
        const draft = retryRef.current ?? latestRef.current;
        if (!draft) return;
        savingRef.current = true;
        setStatus('saving');
        try {
            await journalQueue.current;
            const saved = await saveRef.current(draft.document, draft.baseRevision, draft.operationId);
            revisionRef.current = saved.revision;
            confirmedRef.current = fingerprint(saved.document);
            retryRef.current = null;
            client.setQueryData<Diagram>(['private', 'diagram', userId, diagram.id], current => current ? {
                ...current,
                document: saved.document,
                revision: saved.revision,
                updatedAt: saved.updatedAt
            } : current);
            void client.invalidateQueries({queryKey: ['private', 'available-relations', userId, diagram.id]});
            if (latestRef.current?.operationId === draft.operationId) {
                latestRef.current = null;
                journalQueue.current = journalQueue.current.catch(() => {
                }).then(() => deleteCanvasDraft(draftKey));
                await journalQueue.current;
                setStatus('saved');
            } else if (latestRef.current) {
                latestRef.current = {...latestRef.current, baseRevision: saved.revision};
                queueWrite(latestRef.current);
                schedule(0);
            }
        } catch (error) {
            retryRef.current = draft;
            if (error instanceof ApiError && error.status === 409) {
                blockedRef.current = true;
                setConflict(true);
                setStatus('conflict');
            } else {
                setStatus('offline');
                schedule(3000);
            }
        } finally {
            savingRef.current = false;
        }
    }, [client, diagram.id, draftKey, queueWrite, schedule, userId]);
    useEffect(() => {
        pumpRef.current = pump;
    }, [pump]);
    useEffect(() => {
        let active = true;
        const opening = initialRemote.current.document;
        if (!opening) return;
        readCanvasDraft(draftKey).then(draft => {
            if (!active) return;
            let recovered: DiagramDocument | null = null;
            if (draft) {
                try {
                    recovered = migrateCanvasDocument(draft.document);
                } catch {
                    latestRef.current = draft;
                    setChoice('draft');
                    return;
                }
            }
            if (!draft || (recovered && fingerprint(recovered) === fingerprint(opening))) {
                if (draft) void deleteCanvasDraft(draftKey);
                setDocument(opening);
                setChoice('ready');
            } else if (draft.baseRevision === initialRevision.current && recovered) {
                latestRef.current = {...draft, document: recovered};
                setDocument(recovered);
                setStatus('saving');
                setChoice('ready');
                schedule(0);
            } else {
                latestRef.current = draft;
                setChoice('draft');
            }
        }).catch(() => {
            if (active) {
                setDocument(opening);
                setChoice('ready');
                setStatus('storage-error');
            }
        });
        return () => {
            active = false;
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [draftKey, schedule]);
    useEffect(() => {
        if (choice !== 'ready') return;
        const unsubscribe = useCanvasStore.subscribe(markChanged);
        markChanged();
        return unsubscribe;
    }, [choice, markChanged]);
    useEffect(() => {
        const online = () => {
            if (status === 'offline') schedule(0);
        };
        window.addEventListener('online', online);
        return () => window.removeEventListener('online', online);
    }, [schedule, status]);
    const ready = useCallback(() => {
        markChanged();
        onCanvasReady?.();
    }, [markChanged, onCanvasReady]);
    const discard = async () => {
        await journalQueue.current;
        await deleteCanvasDraft(draftKey);
        latestRef.current = null;
        retryRef.current = null;
        blockedRef.current = false;
        setConflict(false);
        revisionRef.current = diagram.revision;
        if (remote.document) {
            confirmedRef.current = fingerprint(remote.document);
            setDocument(remote.document);
        }
        setStatus('saved');
        setChoice('ready');
    };
    const restore = () => {
        const draft = latestRef.current;
        if (!draft) return;
        try {
            const migrated = migrateCanvasDocument(draft.document);
            latestRef.current = {
                ...draft,
                document: migrated,
                baseRevision: diagram.revision,
                operationId: crypto.randomUUID()
            };
            queueWrite(latestRef.current);
            setDocument(migrated);
            setChoice('ready');
            setStatus('saving');
            schedule();
        } catch {
            setStatus('storage-error');
        }
    };
    const reloadRemote = async () => {
        const result = await refetch();
        if (!result.data) return;
        const migrated = migrateCanvasDocument(result.data.document);
        blockedRef.current = true;
        await journalQueue.current;
        await deleteCanvasDraft(draftKey);
        latestRef.current = null;
        retryRef.current = null;
        revisionRef.current = result.data.revision;
        confirmedRef.current = fingerprint(migrated);
        setDocument(migrated);
        setConflict(false);
        setStatus('saved');
        blockedRef.current = false;
    };
    const recoverLocal = async () => {
        const result = await refetch();
        if (!result.data || !latestRef.current) return;
        revisionRef.current = result.data.revision;
        retryRef.current = null;
        latestRef.current = {
            ...latestRef.current,
            baseRevision: result.data.revision,
            operationId: crypto.randomUUID()
        };
        queueWrite(latestRef.current);
        blockedRef.current = false;
        setConflict(false);
        schedule(0);
    };
    const createCanonicalRelation = async (input: Omit<CreateRelationInput, 'expectedRevision'>) => {
        if (status !== 'saved' || latestRef.current || savingRef.current) throw new Error('Espera a que el diagrama termine de guardarse.');
        const currentDocument = snapshot();
        const result = await createRelation({...input, expectedRevision: revisionRef.current});
        const gestureGeometry = relationInitial?.source === input.sourceNodeId && relationInitial?.target === input.targetNodeId
            ? relationInitial.geometry : undefined;
        const nextDocument = mergeCreatedRelation(currentDocument, result, relationInitial?.replaceEdgeId, gestureGeometry);
        revisionRef.current = result.revision;
        confirmedRef.current = fingerprint(result.document);
        client.setQueryData<Diagram>(['private', 'diagram', userId, diagram.id], current => current ? {
            ...current,
            document: nextDocument,
            revision: result.revision
        } : current);
        void client.invalidateQueries({queryKey: ['private', 'relation-types', userId, diagram.projectId]});
        void client.invalidateQueries({queryKey: ['private', 'available-relations', userId, diagram.id]});
        useCanvasStore.getState().replaceRelationEdges(nextDocument.edges);
        closeRelation();
    };
    const suggestions = (available.data ?? []).filter(item => !canvasEdges.some(edge => edge.data?.relationId === item.relationId) && canvasNodes.some(node => node.id === item.sourceNodeId && node.data?.resourceId === item.sourceResourceId) && canvasNodes.some(node => node.id === item.targetNodeId && node.data?.resourceId === item.targetResourceId));
    const showRelation = (item: AvailableRelation) => {
        if (status !== 'saved') return;
        useCanvasStore.getState().addRelationEdge({
            id: crypto.randomUUID(),
            source: item.sourceNodeId,
            target: item.targetNodeId,
            type: 'editable', ...(item.direction === 'directed' ? {markerEnd: {type: MarkerType.ArrowClosed}} : {}),
            data: {
                relationId: item.relationId,
                typeKey: item.typeKey,
                typeLabel: item.typeLabel,
                direction: item.direction
            }
        });
    };
    if (remote.error) return <p role="alert" className="p-6 text-red-600">{remote.error}</p>;
    if (choice === 'checking') return <p role="status" className="p-6">Buscando cambios pendientes…</p>;
    if (choice === 'draft') return <div className="m-6 max-w-xl rounded-lg border border-border bg-background p-5"><h2
        className="font-semibold">Hay cambios sin confirmar</h2><p className="mt-2 text-sm text-outline">Encontramos un
        borrador local. Puedes recuperarlo sobre la revisión remota {diagram.revision} o descartarlo.</p>
        <div className="mt-4 flex gap-2"><Button variant="primary" onClick={restore}>Recuperar cambios</Button><Button
            variant="outline" onClick={() => void discard()}>Descartar borrador</Button></div>
    </div>;
    return <div className="relative h-full w-full">
        <div role="status" aria-live="polite"
             className="absolute right-3 top-20 z-30 inline-flex items-center gap-2 rounded-md bg-surface/90 px-3 py-2 text-xs backdrop-blur-md">
            {status === 'saving' && <LoaderCircle size={13} aria-hidden="true" className="motion-safe:animate-spin"/>}{{
            saved: 'Guardado en servidor',
            saving: 'Guardando…',
            offline: 'Sin conexión: cambios pendientes',
            conflict: 'Conflicto de revisión',
            'storage-error': 'No se pudo proteger el borrador local'
        }[status]}</div>
        {suggestions.length > 0 && <div className="absolute left-20 top-20 z-30 w-[min(20rem,calc(100%-6rem))] text-sm">
            {!availableOpen ? <button type="button" aria-expanded={false}
                                      onClick={() => setAvailableOpen(true)}
                                      className="inline-flex items-center gap-2 rounded-lg bg-surface/90 px-3 py-2 text-xs text-on-background backdrop-blur-md hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary">
                <Link2 size={14} aria-hidden="true"/>Relaciones disponibles <span className="text-outline">{suggestions.length}</span>
            </button> : <section id="available-relations" aria-label="Relaciones existentes"
                                 className="max-h-[min(24rem,calc(100dvh-8rem))] overflow-auto rounded-lg bg-surface/95 p-3 backdrop-blur-md">
                <div className="flex items-start justify-between gap-2"><h2 className="font-semibold">Relaciones existentes ({suggestions.length})</h2>
                    <button type="button" aria-label="Cerrar relaciones existentes" onClick={() => setAvailableOpen(false)}
                            className="rounded-md p-1 text-outline hover:bg-surface-variant hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary"><X size={16}/></button></div>
                <p className="mt-1 text-xs text-outline">Relaciones de este mapa que no tienen una línea visible. Elige cuáles mostrar.</p>
                <ul className="mt-2 space-y-2">{suggestions.map(item => <li key={item.relationId}
                                                                            className="rounded-md bg-surface-variant/55 p-2">
                    <p className="font-medium">{item.label || item.typeLabel}</p><p
                    className="text-xs">{item.sourceTitle} {item.direction === 'directed' ? '→' : '↔'} {item.targetTitle}</p>
                    <Button className="mt-2" disabled={status !== 'saved'} onClick={() => showRelation(item)}>Mostrar aquí</Button></li>)}</ul>
            </section>}
        </div>}
        {document && <CanvasEditor document={document} onReady={ready} onAddResource={onAddResource}
                                   onDropResource={onDropResource} onDropFiles={onDropFiles} onPickFiles={onPickFiles}
                                   commentNotifications={commentNotifications} selectedCommentId={selectedCommentId} onCommentOpen={onCommentOpen}
                                   onCreateRelation={(source, target, replaceEdgeId, geometry) => setRelationInitial({source, target, replaceEdgeId, geometry})}/>}
        {activeRelation && <RelationCreateDialog projectId={diagram.projectId} nodes={useCanvasStore.getState().nodes}
                                                 availableRelations={available.data ?? []}
                                                 initial={activeRelation} canSave={status === 'saved'}
                                                 onCreate={createCanonicalRelation} onVisualAlternative={() => {
            useCanvasStore.getState().addAnnotation('line');
            closeRelation();
        }} onClose={closeRelation}/>}
        {activeEditRelation && <RelationEditor relationId={activeEditRelation.id}
                                               onClose={() => setDismissedEditNonce(editRelationRequest?.nonce ?? null)}/>}
        {conflict && <div role="dialog" aria-modal="true" aria-labelledby="canvas-conflict-title"
                          className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-w-md rounded-lg border border-border bg-background p-5"><h2 id="canvas-conflict-title"
                                                                                            className="font-semibold">El
                diagrama cambió en otra sesión</h2><p className="mt-2 text-sm">Tus cambios locales siguen protegidos.
                Carga la versión remota o recupera los tuyos sobre ella.</p>
                <div className="mt-4 flex gap-2"><Button onClick={() => void reloadRemote()}>Cargar versión
                    remota</Button><Button variant="primary" onClick={() => void recoverLocal()}>Recuperar mis
                    cambios</Button></div>
            </div>
        </div>}
    </div>;
}
