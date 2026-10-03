import {
    ArrowLeft,
    FolderOpen,
    ListTree,
    MoreHorizontal,
    MessageCircle,
    PanelRightClose,
    PanelRightOpen,
    ScanSearch,
    Share2,
    Upload,
    X
} from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {Button} from '../components/ui/Button';
import {AIGuidanceCard} from '../components/ai/AIGuidanceCard';
import {usePrepareDiagramReview} from '../data/useAi';
import type {AiScopePreparation} from '../api/generated/models';
import {ThemeToggle} from '../components/ui/ThemeToggle';
import {useDiagram} from '../data/useDiagrams';
import {useOrganizationActions} from '../data/useOrganization';
import {DiagramWorkspace} from './DiagramWorkspace';
import {CanvasEditor} from '../features/canvas/CanvasEditor';
import {CanvasResourcePanel, CanvasResourcePicker} from '../features/canvas/CanvasResources';
import {useCanvasStore} from '../store/useCanvasStore';
import {useCanvasUploadBatches} from '../features/canvas/useCanvasUploadBatches';
import {CanvasUploadTray} from '../features/canvas/CanvasUploadTray';
import {CanvasDialog} from '../features/canvas/CanvasDialog';
import {CanvasResourceInspector} from '../features/canvas/CanvasResourceInspector';
import {CanvasFolderInspector} from '../features/canvas/CanvasFolderInspector';
import {CanvasGroupInspector} from '../features/canvas/CanvasGroupInspector';
import {CanvasAnnotationInspector} from '../features/canvas/CanvasAnnotationInspector';
import {CanvasBackgroundInspector} from '../features/canvas/CanvasPresentationInspector';
import {CanvasSemanticView} from '../features/canvas/CanvasSemanticView';
import {CanvasRelationInspector} from '../features/canvas/CanvasRelationInspector';
import {SharePreviewDialog} from '../features/canvas/SharePreviewDialog';
import {CommentNotificationsPanel} from '../components/comments/CommentNotificationsPanel';
import {useCommentNotifications, useCommentNotificationStream, useReadCommentNotification, type CommentNotification} from '../data/useCommentNotifications';

export function DiagramEditor() {
    const {diagramId} = useParams();
    return <DiagramEditorCore key={diagramId}/>;
}

function DiagramEditorCore() {
    const {projectId, diagramId} = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const selectedCommentId = new URLSearchParams(location.search).get('comment');
    const diagram = useDiagram(diagramId);
    const organization = useOrganizationActions(projectId ?? '');
    const [leftPanel, setLeftPanel] = useState<'resources' | 'semantic' | 'comments' | null>(selectedCommentId ? 'comments' : null);
    const commentPage = useCommentNotifications(1, 'all', diagramId);
    useCommentNotificationStream();
    const readComment = useReadCommentNotification();
    const selectedCommentPage = useCommentNotifications(1, 'all', diagramId, selectedCommentId ?? undefined);
    const commentNotifications = [...(commentPage.data?.items ?? [])];
    const linkedComment = selectedCommentPage.data?.items[0];
    if (linkedComment && !commentNotifications.some(item => item.id === linkedComment.id)) commentNotifications.push(linkedComment);
    const openComment = (item: CommentNotification) => {
        if (!item.readAt) readComment.mutate(item.id);
        setLeftPanel('comments');
        navigate(`${location.pathname}?comment=${item.commentId}`, {replace: true});
    };
    const rightOpen = useCanvasStore(state => state.inspectorOpen);
    const setRightOpen = useCanvasStore(state => state.setInspectorOpen);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [preferred, setPreferred] = useState<{ x: number; y: number } | undefined>();
    const [duplicate, setDuplicate] = useState<{
        resourceId: string;
        position?: { x: number; y: number }
    } | null>(null);
    const [readyDiagramId, setReadyDiagramId] = useState<string | null>(null);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [sharePreviewOpen, setSharePreviewOpen] = useState(false);
    const [optionsOpen, setOptionsOpen] = useState(false);
    const optionsButton = useRef<HTMLButtonElement>(null);
    const optionsPanel = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!optionsOpen) return;
        optionsPanel.current?.querySelector<HTMLButtonElement>('button')?.focus();
        const onPointerDown = (event: PointerEvent) => {
            if (!optionsPanel.current?.contains(event.target as Node) && !optionsButton.current?.contains(event.target as Node)) setOptionsOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOptionsOpen(false);
                optionsButton.current?.focus();
            }
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [optionsOpen]);
    const [canvasSaved, setCanvasSaved] = useState(false);
    const [previewEpoch, setPreviewEpoch] = useState(0);
    const savedRef = useRef(false);
    const onSaveStateChange = useCallback((saved: boolean) => {
        if (savedRef.current && !saved) setPreviewEpoch(epoch => epoch + 1);
        savedRef.current = saved;
        setCanvasSaved(saved);
    }, []);
    const [reviewScope, setReviewScope] = useState<AiScopePreparation | null>(null);
    const [reviewError, setReviewError] = useState('');
    const [resourceError, setResourceError] = useState('');
    const review = usePrepareDiagramReview();
    const [uploadPickerOpen, setUploadPickerOpen] = useState(false);
    const [uploadPosition, setUploadPosition] = useState({x: 0, y: 0});
    const canvasReady = useCallback(() => setReadyDiagramId(diagramId ?? null), [diagramId]);
    const uploads = useCanvasUploadBatches(projectId ?? '');
    const fileInput = useRef<HTMLInputElement>(null);
    const pickFiles = (position?: { x: number; y: number }) => {
        const viewport = useCanvasStore.getState().viewport;
        setUploadPosition(position ?? {
            x: Math.round((window.innerWidth / 2 - viewport.x) / viewport.zoom),
            y: Math.round((window.innerHeight / 2 - viewport.y) / viewport.zoom)
        });
        setUploadPickerOpen(true);
    };
    const uploadAt = (files: File[], position?: { x: number; y: number }) => {
        const viewport = useCanvasStore.getState().viewport;
        uploads.addFiles(files, position ?? {
            x: (window.innerWidth / 2 - viewport.x) / viewport.zoom,
            y: (window.innerHeight / 2 - viewport.y) / viewport.zoom
        });
    };
    const nodes = useCanvasStore(state => state.nodes);
    const edges = useCanvasStore(state => state.edges);
    const usedIds = new Set(nodes.map(node => node.data?.resourceId).filter((id): id is string => typeof id === 'string'));
    const selectedRelationEdge = readyDiagramId === diagramId ? edges.find(edge => edge.selected && typeof edge.data?.relationId === 'string') : undefined;
    const selectedResource = readyDiagramId === diagramId ? nodes.find(node => node.selected && node.type === 'resource' && typeof node.data?.resourceId === 'string') : undefined;
    const selectedFolder = readyDiagramId === diagramId ? nodes.find(node => node.selected && node.type === 'folder' && typeof node.data?.folderId === 'string') : undefined;
    const selectedGroup = readyDiagramId === diagramId ? nodes.find(node => node.selected && node.type === 'container') : undefined;
    const selectedAnnotation = readyDiagramId === diagramId ? nodes.find(node => node.selected && node.type === 'annotation') : undefined;
    const openPicker = (position?: { x: number; y: number }) => {
        setPreferred(position);
        setPickerOpen(true);
    };
    const addDirect = (resourceId: string, position?: { x: number; y: number }) => {
        void organization.addResources.mutateAsync([resourceId]).then(() => {
            useCanvasStore.getState().addResourceRepresentation(resourceId, position);
            setResourceError('');
            setDuplicate(null);
            setPickerOpen(false);
        }).catch(() => setResourceError('No se pudo añadir el recurso al mapa.'));
    };
    const tryAdd = (resourceId: string, position?: { x: number; y: number }) => {
        if (usedIds.has(resourceId)) setDuplicate({resourceId, position}); else addDirect(resourceId, position);
    };
    const focusExisting = (resourceId: string) => {
        const existing = useCanvasStore.getState().nodes.find(node => node.data?.resourceId === resourceId);
        if (existing) useCanvasStore.getState().focusNode(existing.id);
        setDuplicate(null);
        setPickerOpen(false);
    };
    const addFolder = (folderId: string) => {
        const existing = useCanvasStore.getState().nodes.find(node => node.type === 'folder' && node.data?.folderId === folderId);
        if (existing) {
            useCanvasStore.getState().focusNode(existing.id);
            useCanvasStore.getState().setInspectorOpen(true);
        } else if (diagram.data) useCanvasStore.getState().addFolderRepresentation(folderId, diagram.data.projectId);
    };
    if (diagram.isPending) return <p role="status" className="p-6">Cargando diagrama…</p>;
    if (diagram.isError || !diagram.data) return <div role="alert" className="p-6"><p>No se pudo abrir el diagrama.</p>
        <Button className="mt-3" onClick={() => diagram.refetch()}>Reintentar</Button></div>;
    return <main className="relative flex h-dvh min-h-0 bg-background text-on-background">
        <section className="relative min-w-0 flex-1" aria-label="Lienzo">{diagram.data.archivedAt ?
            <div className="relative h-full">
                <div className="pointer-events-none h-full"><CanvasEditor document={diagram.data.document}/></div>
                <p role="status"
                   className="absolute right-3 top-20 rounded-lg bg-surface/90 px-3 py-2 text-sm backdrop-blur-md">Diagrama
                    archivado. Restáuralo desde proyectos para editar.</p></div> :
            <DiagramWorkspace diagram={diagram.data} refetch={diagram.refetch} onAddResource={openPicker}
                              onDropResource={tryAdd} onDropFiles={uploadAt} onPickFiles={pickFiles}
                              commentNotifications={commentNotifications} selectedCommentId={selectedCommentId} onCommentOpen={openComment}
                              onCanvasReady={canvasReady} onSaveStateChange={onSaveStateChange}/>}
            <div className="pointer-events-none absolute inset-x-3 top-3 z-40 flex items-start justify-between gap-3">
                <div
                    className="pointer-events-auto flex min-w-0 max-w-[45%] items-center gap-1 rounded-lg bg-surface/90 p-1 backdrop-blur-md">
                    <Button size="icon" className="h-10 w-10 shrink-0" title="Volver a proyectos"
                            aria-label="Volver a proyectos" icon={ArrowLeft} onClick={() => navigate('/projects')}/>
                    <h1 className="min-w-0 truncate px-2 text-sm font-semibold"
                        title={diagram.data.name}>{diagram.data.name}</h1>
                </div>
                <nav aria-label="Acciones del mapa"
                     className="pointer-events-auto flex min-w-0 max-w-[55%] shrink-0 items-center gap-0.5 rounded-lg bg-surface/90 p-1 backdrop-blur-md">
                    <div className="flex min-w-0 gap-0.5 overflow-x-auto">
                        <Button size="icon" className="h-10 w-10 shrink-0"
                                title={leftPanel === 'resources' ? 'Ocultar recursos' : 'Mostrar recursos'}
                                aria-label={leftPanel === 'resources' ? 'Ocultar recursos' : 'Mostrar recursos'}
                                aria-expanded={leftPanel === 'resources'} icon={FolderOpen}
                                onClick={() => setLeftPanel(value => value === 'resources' ? null : 'resources')}/>
                        <Button size="icon" className="h-10 w-10 shrink-0"
                                title={leftPanel === 'semantic' ? 'Ocultar vista semántica' : 'Mostrar vista semántica'}
                                aria-label={leftPanel === 'semantic' ? 'Ocultar vista semántica' : 'Mostrar vista semántica'}
                                aria-pressed={leftPanel === 'semantic'} icon={ListTree}
                                onClick={() => setLeftPanel(value => value === 'semantic' ? null : 'semantic')}/>
                        <span className="relative shrink-0"><Button size="icon" className="h-10 w-10"
                                title={leftPanel === 'comments' ? 'Ocultar comentarios' : 'Mostrar comentarios'}
                                aria-label={`${leftPanel === 'comments' ? 'Ocultar' : 'Mostrar'} comentarios, ${commentPage.data?.unreadCount ?? 0} pendientes`}
                                aria-expanded={leftPanel === 'comments'} icon={MessageCircle}
                                onClick={() => setLeftPanel(value => value === 'comments' ? null : 'comments')}/>
                            {Boolean(commentPage.data?.unreadCount) && <span className="pointer-events-none absolute -right-1 -top-1 min-w-4 rounded-full bg-primary px-0.5 text-center text-[10px] leading-4 text-on-primary">{Math.min(commentPage.data!.unreadCount, 99)}{commentPage.data!.unreadCount > 99 ? '+' : ''}</span>}
                        </span>
                        <Button size="icon" className="h-10 w-10 shrink-0" title="Revisar alcance de IA"
                                aria-label="Revisar alcance de IA" icon={ScanSearch} onClick={() => {
                            setReviewOpen(true);
                            setReviewScope(null);
                            setReviewError('');
                        }}/>
                        {!diagram.data.archivedAt && <Button size="icon" className="h-10 w-10 shrink-0"
                                                             title="Previsualizar contenido compartible"
                                                             aria-label="Previsualizar contenido compartible"
                                                             icon={Share2} onClick={() => setSharePreviewOpen(true)}/>}
                        {!diagram.data.archivedAt &&
                            <Button size="icon" className="h-10 w-10 shrink-0" title="Cargar archivos en el canvas"
                                    aria-label="Cargar archivos en el canvas" icon={Upload}
                                    onClick={() => pickFiles()}/>}
                        {!rightOpen && <Button size="icon" className="h-10 w-10 shrink-0" title="Mostrar propiedades"
                                               aria-label="Mostrar propiedades" icon={PanelRightOpen}
                                               onClick={() => setRightOpen(true)}/>}
                    </div>
                    <Button ref={optionsButton} size="icon" className="h-10 w-10 shrink-0" title="Opciones del mapa"
                            aria-label="Opciones del mapa" aria-expanded={optionsOpen} aria-controls="map-options"
                            icon={MoreHorizontal} onClick={() => setOptionsOpen(value => !value)}/>
                </nav>
                {optionsOpen && <div id="map-options" ref={optionsPanel} role="dialog" aria-label="Opciones del mapa"
                                     className="pointer-events-auto absolute right-0 top-14 w-48 rounded-lg bg-surface p-3"
                                     onClick={() => {
                                         setOptionsOpen(false);
                                         optionsButton.current?.focus();
                                     }}><p className="mb-2 text-sm font-medium">Apariencia</p><ThemeToggle/></div>}
            </div>
            {resourceError && <p role="alert"
                                 className="absolute left-3 top-20 z-50 rounded-md bg-surface/95 px-3 py-2 text-xs text-red-600">{resourceError}</p>}
            {leftPanel && <div
                className="absolute bottom-3 left-3 top-20 z-50 w-[min(19rem,calc(100%-1.5rem))] overflow-hidden rounded-xl bg-surface/95 backdrop-blur-md"
                aria-label={leftPanel === 'resources' ? 'Panel de recursos' : leftPanel === 'comments' ? 'Panel de comentarios' : 'Panel de vista semántica'}>
                <Button size="icon" className="absolute right-2 top-2 z-10 h-9 w-9" title="Cerrar panel"
                        aria-label="Cerrar panel" icon={X} onClick={() => setLeftPanel(null)}/>
                {leftPanel === 'comments' ? <CommentNotificationsPanel diagramId={diagram.data.id}
                                                                          selectedId={selectedCommentId} onOpen={openComment}/> : leftPanel === 'resources' ? diagram.data.archivedAt ?
                    <p className="p-4 text-sm text-outline">Los recursos del mapa archivado están disponibles al
                        restaurarlo.</p> : readyDiagramId === diagram.data.id ?
                        <CanvasResourcePanel projectId={diagram.data.projectId} onAdd={() => openPicker()}
                                             onSelect={id => tryAdd(id)} onSelectFolder={addFolder}/> :
                        <p className="p-4 text-sm text-outline">Cargando recursos del
                            mapa…</p> : readyDiagramId === diagram.data.id ?
                    <CanvasSemanticView projectId={diagram.data.projectId}/> :
                    <p className="p-4 text-sm text-outline">Cargando vista semántica…</p>}
            </div>}
        </section>
        {rightOpen && <aside
            className="absolute inset-y-0 right-0 z-50 w-[min(304px,100vw)] overflow-auto bg-surface/95 p-4 backdrop-blur-md lg:relative lg:z-0 lg:shrink-0 lg:bg-surface-variant/35"
            aria-label="Propiedades">
            <div className="mb-3 flex items-center justify-between"><h2
                className="text-sm font-semibold">Propiedades</h2><Button size="icon" className="h-9 w-9"
                                                                          title="Ocultar propiedades"
                                                                          aria-label="Ocultar propiedades"
                                                                          icon={PanelRightClose}
                                                                          onClick={() => setRightOpen(false)}/></div>
            {selectedRelationEdge ? <CanvasRelationInspector key={selectedRelationEdge.id}
                                                             relationId={selectedRelationEdge.data!.relationId as string}
                                                             edgeId={selectedRelationEdge.id}
                                                             sourceNodeId={selectedRelationEdge.source}
                                                             targetNodeId={selectedRelationEdge.target}/> : selectedResource ?
                <CanvasResourceInspector key={selectedResource.id} nodeId={selectedResource.id}
                                         resourceId={selectedResource.data.resourceId as string}
                                         caption={typeof selectedResource.data.caption === 'string' ? selectedResource.data.caption : ''}/> : selectedFolder ?
                    <CanvasFolderInspector key={selectedFolder.id} nodeId={selectedFolder.id}
                                           projectId={diagram.data.projectId}
                                           folderId={selectedFolder.data.folderId as string}
                                           caption={typeof selectedFolder.data.caption === 'string' ? selectedFolder.data.caption : ''}
                                           onAddResource={id => tryAdd(id)}/> : selectedGroup ?
                        <CanvasGroupInspector key={selectedGroup.id} groupId={selectedGroup.id}
                                              diagramId={diagram.data.id}/> : selectedAnnotation ?
                            <CanvasAnnotationInspector nodeId={selectedAnnotation.id}/> : <><CanvasBackgroundInspector/>
                                <p className="mt-3 text-xs text-outline">Selecciona un elemento para editarlo.</p></>}
        </aside>}
        {pickerOpen && <CanvasResourcePicker projectId={diagram.data.projectId} usedIds={usedIds}
                                             onClose={() => setPickerOpen(false)} onSelect={id => tryAdd(id, preferred)}
                                             onFocus={focusExisting}/>}
        {duplicate &&
            <CanvasDialog titleId="duplicate-resource-title" onClose={() => setDuplicate(null)} className="max-w-md"><h2
                id="duplicate-resource-title" className="font-semibold">Este recurso ya está en el diagrama</h2><p
                className="mt-2 text-sm text-outline">Puedes ir a su representación o añadir otra independiente.</p>
                <div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => focusExisting(duplicate.resourceId)}>Ir
                    al uso</Button><Button variant="primary"
                                           onClick={() => addDirect(duplicate.resourceId, duplicate.position)}>Añadir
                    otra representación</Button><Button onClick={() => setDuplicate(null)}>Cancelar</Button></div>
            </CanvasDialog>}
        {reviewOpen &&
            <CanvasDialog titleId="diagram-review-title" onClose={() => setReviewOpen(false)} className="max-w-lg">
                <h2 id="diagram-review-title" className="font-semibold">Revisión del Diagrama bajo demanda</h2>
                <p className="mt-2 text-sm text-outline">Se comprobarán los nodos seleccionados o, si no hay selección,
                    el Diagrama completo en su última versión guardada. Guarda los cambios antes de preparar un alcance
                    nuevo.</p>
                <div className="mt-3 flex gap-2"><Button disabled={review.isPending} onClick={() => {
                    setReviewError('');
                    setReviewScope(null);
                    const selected = readyDiagramId === diagramId ? nodes.filter(node => node.selected).map(node => node.id) : [];
                    review.mutate({diagramId: diagram.data.id, ...(selected.length ? {nodeIds: selected} : {})}, {
                        onSuccess: setReviewScope,
                        onError: () => setReviewError('No se pudo revisar el alcance del Diagrama guardado. Comprueba la selección y vuelve a intentar.')
                    });
                }}>Preparar alcance guardado</Button><Button onClick={() => setReviewOpen(false)}>Seguir explorando
                    manualmente</Button></div>
                {reviewError && <p role="alert">{reviewError}</p>}
                {reviewScope &&
                    <section aria-label="Resultado del alcance" className="mt-4 space-y-2"><p role="status">Proveedor
                        pendiente: {reviewScope.resourceIds.length} recursos elegibles, sin hallazgos generados.</p>
                        {reviewScope.excluded.length > 0 &&
                            <ul aria-label="Nodos excluidos">{reviewScope.excluded.map((item, index) => <li
                                key={`${item.nodeId}-${index}`}>{item.nodeId}: {item.reason}</li>)}</ul>}
                        {reviewScope.limitations.map(item => <p key={item} className="text-xs text-outline">{item}</p>)}
                        <AIGuidanceCard actionTitle="Revisión pendiente" selectedResourceIds={reviewScope.resourceIds}/>
                    </section>}
            </CanvasDialog>}
        {sharePreviewOpen && <SharePreviewDialog key={previewEpoch} diagramId={diagram.data.id}
                                                 canPreview={canvasSaved && readyDiagramId === diagramId}
                                                 onClose={() => setSharePreviewOpen(false)}/>}
        {uploadPickerOpen && <CanvasDialog titleId="upload-position-title" onClose={() => setUploadPickerOpen(false)}
                                           className="max-w-sm"><h2 id="upload-position-title"
                                                                    className="font-semibold">Cargar en el canvas</h2><p
            className="mt-2 text-sm text-outline">Indica la ubicación inicial o usa el centro visible.</p>
            <div className="mt-4 flex gap-2"><label className="text-sm">X<input type="number"
                                                                                className="mt-1 w-full rounded border border-border bg-background p-2"
                                                                                value={uploadPosition.x}
                                                                                onChange={event => setUploadPosition(value => ({
                                                                                    ...value,
                                                                                    x: Number(event.target.value)
                                                                                }))}/></label><label
                className="text-sm">Y<input type="number"
                                            className="mt-1 w-full rounded border border-border bg-background p-2"
                                            value={uploadPosition.y} onChange={event => setUploadPosition(value => ({
                ...value,
                y: Number(event.target.value)
            }))}/></label></div>
            <div className="mt-4 flex justify-end gap-2"><Button
                onClick={() => setUploadPickerOpen(false)}>Cancelar</Button><Button variant="primary"
                                                                                    onClick={() => fileInput.current?.click()}>Seleccionar
                archivos</Button></div>
        </CanvasDialog>}
        <input ref={fileInput} className="sr-only" type="file" multiple aria-label="Seleccionar archivos para el canvas"
               onChange={event => {
                   if (event.target.files?.length) {
                       uploadAt([...event.target.files], uploadPosition);
                       setUploadPickerOpen(false);
                   }
                   event.target.value = '';
               }}/>
        <CanvasUploadTray batches={uploads.batches} retry={uploads.retry} undo={uploads.undo}
                          createGroup={uploads.createGroup}/>
    </main>;
}
