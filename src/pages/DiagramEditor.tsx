import { ChevronLeft, ListTree, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, ScanSearch, Share2, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AIGuidanceCard } from '../components/ai/AIGuidanceCard';
import { usePrepareDiagramReview } from '../data/useAi';
import type { AiScopePreparation } from '../api/generated/models';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useDiagram } from '../data/useDiagrams';
import { DiagramWorkspace } from './DiagramWorkspace';
import { CanvasEditor } from '../features/canvas/CanvasEditor';
import { CanvasResourcePanel, CanvasResourcePicker } from '../features/canvas/CanvasResources';
import { useCanvasStore } from '../store/useCanvasStore';
import { useCanvasUploadBatches } from '../features/canvas/useCanvasUploadBatches';
import { CanvasUploadTray } from '../features/canvas/CanvasUploadTray';
import { CanvasDialog } from '../features/canvas/CanvasDialog';
import { CanvasResourceInspector } from '../features/canvas/CanvasResourceInspector';
import { CanvasFolderInspector } from '../features/canvas/CanvasFolderInspector';
import { CanvasGroupInspector } from '../features/canvas/CanvasGroupInspector';
import { CanvasAnnotationInspector } from '../features/canvas/CanvasAnnotationInspector';
import { CanvasBackgroundInspector } from '../features/canvas/CanvasPresentationInspector';
import { CanvasSemanticView } from '../features/canvas/CanvasSemanticView';
import { CanvasRelationInspector } from '../features/canvas/CanvasRelationInspector';
import { SharePreviewDialog } from '../features/canvas/SharePreviewDialog';

export function DiagramEditor() {
  const { diagramId } = useParams();
  return <DiagramEditorCore key={diagramId} />;
}

function DiagramEditorCore() {
  const { projectId, diagramId } = useParams(); const navigate = useNavigate(); const diagram = useDiagram(diagramId); const [leftOpen, setLeftOpen] = useState(true); const [semanticOpen, setSemanticOpen] = useState(false); const rightOpen = useCanvasStore(state => state.inspectorOpen); const setRightOpen = useCanvasStore(state => state.setInspectorOpen);
  const [pickerOpen, setPickerOpen] = useState(false); const [preferred, setPreferred] = useState<{ x: number; y: number } | undefined>(); const [duplicate, setDuplicate] = useState<{ resourceId: string; position?: { x: number; y: number } } | null>(null);
  const [readyDiagramId, setReadyDiagramId] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [sharePreviewOpen, setSharePreviewOpen] = useState(false);
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
  const review = usePrepareDiagramReview();
  const [uploadPickerOpen, setUploadPickerOpen] = useState(false); const [uploadPosition, setUploadPosition] = useState({ x: 0, y: 0 });
  const canvasReady = useCallback(() => setReadyDiagramId(diagramId ?? null), [diagramId]);
  const uploads = useCanvasUploadBatches(); const fileInput = useRef<HTMLInputElement>(null);
  const pickFiles = (position?: { x: number; y: number }) => { const viewport = useCanvasStore.getState().viewport; setUploadPosition(position ?? { x: Math.round((window.innerWidth / 2 - viewport.x) / viewport.zoom), y: Math.round((window.innerHeight / 2 - viewport.y) / viewport.zoom) }); setUploadPickerOpen(true); };
  const uploadAt = (files: File[], position?: { x: number; y: number }) => { const viewport = useCanvasStore.getState().viewport; uploads.addFiles(files, position ?? { x: (window.innerWidth / 2 - viewport.x) / viewport.zoom, y: (window.innerHeight / 2 - viewport.y) / viewport.zoom }); };
  const nodes = useCanvasStore(state => state.nodes); const edges = useCanvasStore(state => state.edges); const usedIds = new Set(nodes.map(node => node.data?.resourceId).filter((id): id is string => typeof id === 'string'));
  const selectedRelationEdge = readyDiagramId === diagramId ? edges.find(edge => edge.selected && typeof edge.data?.relationId === 'string') : undefined;
  const selectedResource = readyDiagramId === diagramId ? nodes.find(node => node.selected && node.type === 'resource' && typeof node.data?.resourceId === 'string') : undefined;
  const selectedFolder = readyDiagramId === diagramId ? nodes.find(node => node.selected && node.type === 'folder' && typeof node.data?.folderId === 'string') : undefined;
  const selectedGroup = readyDiagramId === diagramId ? nodes.find(node => node.selected && node.type === 'container') : undefined;
  const selectedAnnotation = readyDiagramId === diagramId ? nodes.find(node => node.selected && node.type === 'annotation') : undefined;
  const openPicker = (position?: { x: number; y: number }) => { setPreferred(position); setPickerOpen(true); };
  const addDirect = (resourceId: string, position?: { x: number; y: number }) => { useCanvasStore.getState().addResourceRepresentation(resourceId, position); setDuplicate(null); setPickerOpen(false); };
  const tryAdd = (resourceId: string, position?: { x: number; y: number }) => { if (usedIds.has(resourceId)) setDuplicate({ resourceId, position }); else addDirect(resourceId, position); };
  const focusExisting = (resourceId: string) => { const existing = useCanvasStore.getState().nodes.find(node => node.data?.resourceId === resourceId); if (existing) useCanvasStore.getState().focusNode(existing.id); setDuplicate(null); setPickerOpen(false); };
  const addFolder = (folderId: string) => { const existing = useCanvasStore.getState().nodes.find(node => node.type === 'folder' && node.data?.folderId === folderId); if (existing) { useCanvasStore.getState().focusNode(existing.id); useCanvasStore.getState().setInspectorOpen(true); } else if (diagram.data) useCanvasStore.getState().addFolderRepresentation(folderId, diagram.data.projectId); };
  if (diagram.isPending) return <p role="status" className="p-6">Cargando diagrama…</p>;
  if (diagram.isError || !diagram.data) return <div role="alert" className="p-6"><p>No se pudo abrir el diagrama.</p><Button className="mt-3" onClick={() => diagram.refetch()}>Reintentar</Button></div>;
  return <main className="flex h-screen min-h-0 flex-col bg-background text-on-background">
    <header className="flex h-[46px] shrink-0 items-center gap-2 bg-background/90 px-3">
      <Button size="icon" title="Volver al proyecto" aria-label="Volver al proyecto" icon={ChevronLeft} onClick={() => navigate(`/projects/${projectId}`)} />
      <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">{diagram.data.name}</h1><ThemeToggle />
    </header>
    <div className="flex min-h-0 flex-1">
      <nav aria-label="Herramientas del editor" className="flex w-11 shrink-0 flex-col items-center gap-1 bg-surface-variant/55 py-1">
        <Button size="icon" title={leftOpen ? 'Ocultar recursos' : 'Mostrar recursos'} aria-label={leftOpen ? 'Ocultar recursos' : 'Mostrar recursos'} icon={leftOpen ? PanelLeftClose : PanelLeftOpen} onClick={() => setLeftOpen(value => !value)} />
        <Button size="icon" title={semanticOpen ? 'Ocultar vista semántica' : 'Mostrar vista semántica'} aria-label={semanticOpen ? 'Ocultar vista semántica' : 'Mostrar vista semántica'} aria-pressed={semanticOpen} icon={ListTree} onClick={() => setSemanticOpen(value => !value)} />
        <Button size="icon" title="Revisar alcance de IA" aria-label="Revisar alcance de IA" icon={ScanSearch} onClick={() => { setReviewOpen(true); setReviewScope(null); setReviewError(''); }} />
        {!diagram.data.archivedAt && <Button size="icon" title="Previsualizar contenido compartible" aria-label="Previsualizar contenido compartible" icon={Share2} onClick={() => setSharePreviewOpen(true)} />}
        <Button size="icon" title={rightOpen ? 'Ocultar propiedades' : 'Mostrar propiedades'} aria-label={rightOpen ? 'Ocultar propiedades' : 'Mostrar propiedades'} icon={rightOpen ? PanelRightClose : PanelRightOpen} onClick={() => setRightOpen(!rightOpen)} />
        {!diagram.data.archivedAt && <Button size="icon" title="Cargar archivos en el canvas" aria-label="Cargar archivos en el canvas" icon={Upload} onClick={() => pickFiles()} />}
      </nav>
      {leftOpen && (diagram.data.archivedAt ? <aside className="w-56 shrink-0 bg-surface-variant/35 p-3">Recursos</aside> : readyDiagramId === diagram.data.id ? <CanvasResourcePanel projectId={diagram.data.projectId} onAdd={() => openPicker()} onSelect={id => tryAdd(id)} onSelectFolder={addFolder} /> : <aside className="w-56 shrink-0 bg-surface-variant/35 p-3 text-xs text-outline">Cargando recursos del canvas…</aside>)}
      {semanticOpen && readyDiagramId === diagram.data.id && <CanvasSemanticView projectId={diagram.data.projectId} />}
      <section className="min-w-0 flex-1" aria-label="Lienzo">{diagram.data.archivedAt ? <div className="relative h-full"><div className="pointer-events-none h-full"><CanvasEditor document={diagram.data.document} /></div><p role="status" className="absolute right-3 top-3 rounded border border-border bg-background px-3 py-2 text-sm">Diagrama archivado. Restáuralo desde el proyecto para editar.</p></div> : <DiagramWorkspace diagram={diagram.data} refetch={diagram.refetch} onAddResource={openPicker} onDropResource={tryAdd} onDropFiles={uploadAt} onPickFiles={pickFiles} onCanvasReady={canvasReady} onSaveStateChange={onSaveStateChange} />}</section>
      {rightOpen && <aside className="w-[304px] shrink-0 overflow-auto bg-surface-variant/35 p-3" aria-label="Propiedades">{selectedRelationEdge ? <CanvasRelationInspector key={selectedRelationEdge.id} relationId={selectedRelationEdge.data!.relationId as string} edgeId={selectedRelationEdge.id} sourceNodeId={selectedRelationEdge.source} targetNodeId={selectedRelationEdge.target} /> : selectedResource ? <CanvasResourceInspector key={selectedResource.id} nodeId={selectedResource.id} resourceId={selectedResource.data.resourceId as string} caption={typeof selectedResource.data.caption === 'string' ? selectedResource.data.caption : ''} /> : selectedFolder ? <CanvasFolderInspector key={selectedFolder.id} nodeId={selectedFolder.id} projectId={diagram.data.projectId} folderId={selectedFolder.data.folderId as string} caption={typeof selectedFolder.data.caption === 'string' ? selectedFolder.data.caption : ''} onAddResource={id => tryAdd(id)} /> : selectedGroup ? <CanvasGroupInspector key={selectedGroup.id} groupId={selectedGroup.id} diagramId={diagram.data.id} /> : selectedAnnotation ? <CanvasAnnotationInspector nodeId={selectedAnnotation.id} /> : <><CanvasBackgroundInspector/><p className="mt-3 text-xs text-outline">Selecciona un elemento para editarlo.</p></>}</aside>}
    </div>
    {pickerOpen && <CanvasResourcePicker projectId={diagram.data.projectId} usedIds={usedIds} onClose={() => setPickerOpen(false)} onSelect={id => tryAdd(id, preferred)} onFocus={focusExisting} />}
    {duplicate && <CanvasDialog titleId="duplicate-resource-title" onClose={() => setDuplicate(null)} className="max-w-md"><h2 id="duplicate-resource-title" className="font-semibold">Este recurso ya está en el diagrama</h2><p className="mt-2 text-sm text-outline">Puedes ir a su representación o añadir otra independiente.</p><div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => focusExisting(duplicate.resourceId)}>Ir al uso</Button><Button variant="primary" onClick={() => addDirect(duplicate.resourceId, duplicate.position)}>Añadir otra representación</Button><Button onClick={() => setDuplicate(null)}>Cancelar</Button></div></CanvasDialog>}
    {reviewOpen && <CanvasDialog titleId="diagram-review-title" onClose={() => setReviewOpen(false)} className="max-w-lg">
      <h2 id="diagram-review-title" className="font-semibold">Revisión del Diagrama bajo demanda</h2>
      <p className="mt-2 text-sm text-outline">Se comprobarán los nodos seleccionados o, si no hay selección, el Diagrama completo en su última versión guardada. Guarda los cambios antes de preparar un alcance nuevo.</p>
      <div className="mt-3 flex gap-2"><Button disabled={review.isPending} onClick={() => { setReviewError(''); setReviewScope(null); const selected = readyDiagramId === diagramId ? nodes.filter(node => node.selected).map(node => node.id) : []; review.mutate({ diagramId: diagram.data.id, ...(selected.length ? { nodeIds: selected } : {}) }, { onSuccess: setReviewScope, onError: () => setReviewError('No se pudo revisar el alcance del Diagrama guardado. Comprueba la selección y vuelve a intentar.') }); }}>Preparar alcance guardado</Button><Button onClick={() => setReviewOpen(false)}>Seguir explorando manualmente</Button></div>
      {reviewError && <p role="alert">{reviewError}</p>}
      {reviewScope && <section aria-label="Resultado del alcance" className="mt-4 space-y-2"><p role="status">Proveedor pendiente: {reviewScope.resourceIds.length} recursos elegibles, sin hallazgos generados.</p>
        {reviewScope.excluded.length > 0 && <ul aria-label="Nodos excluidos">{reviewScope.excluded.map((item, index) => <li key={`${item.nodeId}-${index}`}>{item.nodeId}: {item.reason}</li>)}</ul>}
        {reviewScope.limitations.map(item => <p key={item} className="text-xs text-outline">{item}</p>)}
        <AIGuidanceCard actionTitle="Revisión pendiente" selectedResourceIds={reviewScope.resourceIds} />
      </section>}
    </CanvasDialog>}
    {sharePreviewOpen && <SharePreviewDialog key={previewEpoch} diagramId={diagram.data.id} canPreview={canvasSaved && readyDiagramId === diagramId} onClose={() => setSharePreviewOpen(false)} />}
    {uploadPickerOpen && <CanvasDialog titleId="upload-position-title" onClose={() => setUploadPickerOpen(false)} className="max-w-sm"><h2 id="upload-position-title" className="font-semibold">Cargar en el canvas</h2><p className="mt-2 text-sm text-outline">Indica la ubicación inicial o usa el centro visible.</p><div className="mt-4 flex gap-2"><label className="text-sm">X<input type="number" className="mt-1 w-full rounded border border-border bg-background p-2" value={uploadPosition.x} onChange={event => setUploadPosition(value => ({ ...value, x: Number(event.target.value) }))}/></label><label className="text-sm">Y<input type="number" className="mt-1 w-full rounded border border-border bg-background p-2" value={uploadPosition.y} onChange={event => setUploadPosition(value => ({ ...value, y: Number(event.target.value) }))}/></label></div><div className="mt-4 flex justify-end gap-2"><Button onClick={() => setUploadPickerOpen(false)}>Cancelar</Button><Button variant="primary" onClick={() => fileInput.current?.click()}>Seleccionar archivos</Button></div></CanvasDialog>}
    <input ref={fileInput} className="sr-only" type="file" multiple aria-label="Seleccionar archivos para el canvas" onChange={event => { if (event.target.files?.length) { uploadAt([...event.target.files], uploadPosition); setUploadPickerOpen(false); } event.target.value = ''; }} />
    <CanvasUploadTray batches={uploads.batches} retry={uploads.retry} undo={uploads.undo} createGroup={uploads.createGroup} />
  </main>;
}
