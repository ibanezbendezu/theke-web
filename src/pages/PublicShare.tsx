import {useEffect, useRef, useState} from 'react';
import {useParams, useSearchParams} from 'react-router-dom';
import {
    ListTree,
    MessageCircle,
    MessageSquarePlus,
    MoreHorizontal,
    Info,
    Maximize2,
    X
} from 'lucide-react';
import type {PublicShare as PublicProjection, PublicShareResponse} from '../api/generated/models';
import {thekeFetch} from '../api/httpClient';
import {Button} from '../components/ui/Button';
import {WorkspaceLoading} from '../components/ui/LoadingState';
import {ThemeToggle} from '../components/ui/ThemeToggle';
import {PublicDiagramCanvas, PublicSemanticList, type PublicSelection} from './PublicDiagramCanvas';
import {ResourceViewerDialog} from '../components/resources/ResourceViewerDialog';
import {PublicCommentsPanel} from './PublicCommentsPanel';
import {publicRelationLabel} from './publicRelationLabel';
import type {CommentTarget, PublicComment} from './publicCommentTypes';

export function PublicShare() {
    const {token} = useParams();
    return <PublicShareView key={token ?? 'missing'} token={token}/>;
}

function PublicShareView({token}: { token: string | undefined }) {
    const [searchParams] = useSearchParams();
    const [view, setView] = useState<{
        token: string;
        data: PublicProjection | null;
        unavailable: boolean
    } | null>(null);
    const [selection, setSelection] = useState<PublicSelection>(null);
    const [semanticOpen, setSemanticOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [viewerResourceId, setViewerResourceId] = useState<string | null>(null);
    const [viewerRequest, setViewerRequest] = useState(0);
    const [optionsOpen, setOptionsOpen] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(() => searchParams.get('comments') === '1');
    const [commentMode, setCommentMode] = useState(false);
    const [commentTarget, setCommentTarget] = useState<CommentTarget | null>(null);
    const [comments, setComments] = useState<PublicComment[]>([]);
    const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
    const inspector = useRef<HTMLElement>(null);
    const semanticButton = useRef<HTMLButtonElement>(null);
    const optionsButton = useRef<HTMLButtonElement>(null);
    const returnFocus = useRef<HTMLElement | null>(null);
    const restoreFocus = () => requestAnimationFrame(() => {
        const target = returnFocus.current?.isConnected ? returnFocus.current : semanticButton.current;
        target?.focus();
    });
    useEffect(() => {
        if (!token) return;
        const controller = new AbortController();
        void thekeFetch<{
            data: PublicShareResponse
        }>(`/v1/public/shares/${encodeURIComponent(token)}`, {cache: 'no-store', signal: controller.signal})
            .then(response => {
                if (!controller.signal.aborted) setView({token, data: response.data.data, unavailable: false});
            })
            .catch(() => {
                if (!controller.signal.aborted) setView({token, data: null, unavailable: true});
            });
        return () => controller.abort();
    }, [token]);
    useEffect(() => {
        if (selection && detailsOpen) inspector.current?.focus();
    }, [selection, detailsOpen]);
    useEffect(() => {
        if (!selection || !detailsOpen || viewerResourceId) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Tab' && window.matchMedia?.('(max-width: 1023px)').matches) {
                const items = [...(inspector.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]') ?? [])];
                if (items.length && event.shiftKey && (document.activeElement === items[0] || document.activeElement === inspector.current)) {
                    event.preventDefault();
                    items.at(-1)?.focus();
                } else if (items.length && !event.shiftKey && document.activeElement === items.at(-1)) {
                    event.preventDefault();
                    items[0]?.focus();
                }
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                setSelection(null);
                setDetailsOpen(false);
                restoreFocus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [selection, detailsOpen, viewerResourceId]);
    const select = (value: PublicSelection) => {
        if (value && !inspector.current?.contains(document.activeElement)) returnFocus.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
        if (value) setDetailsOpen(value.kind !== 'resource');
        setSelection(value);
    };
    const openResource = (id: string) => {
        setViewerRequest(0);
        setViewerResourceId(id);
    };
    const chooseCommentTarget = (target: CommentTarget) => {
        setCommentTarget(target);
        setSelectedCommentId(null);
        setCommentsOpen(true);
        setCommentMode(false);
        setSemanticOpen(false);
        setSelection(null);
        setDetailsOpen(false);
    };
    const closeComments = () => {
        setCommentsOpen(false);
        setSelectedCommentId(null);
    };
    const closeInspector = () => {
        setSelection(null);
        setDetailsOpen(false);
        restoreFocus();
    };
    const data = view && view.token === token ? view.data : null;
    const unavailable = !token || (view?.token === token && view?.unavailable === true);
    const selectedResource = selection?.kind === 'resource' ? data?.resources.find(item => item.id === selection.id) : null;
    const viewerResource = data?.resources.find(item => item.id === viewerResourceId);
    const viewerUrl = token && viewerResource
        ? `${import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ?? ''}/v1/public/shares/${encodeURIComponent(token)}/resources/${encodeURIComponent(viewerResource.id)}/content`
        : undefined;
    const selectedRelation = selection?.kind === 'relation' ? data?.relations.find(item => item.id === selection.id) : null;
    const selectedFolder = selection?.kind === 'folder' ? data?.layout.nodes.find(item => item.id === selection.id && item.type === 'folder') : null;
    const titles = new Map(data?.resources.map(item => [item.id, item.title]));
    const showSemantic = semanticOpen || data?.layout.nodes.length === 0;

    if (unavailable) return <main
        className="flex min-h-dvh items-center justify-center bg-background px-6 text-on-background">
        <section role="alert" className="max-w-md text-center"><h1 className="text-xl font-semibold">Enlace no
            disponible</h1><p className="mt-2 text-sm text-outline">Solicita un enlace vigente a quien compartió este
            mapa.</p></section>
    </main>;
    if (!data) return <WorkspaceLoading fullscreen label="Abriendo mapa compartido…"/>;
    return <main className="public-share relative flex h-dvh min-h-0 bg-background text-on-background">
        <section className="relative min-w-0 flex-1" aria-label="Lienzo compartido">
            <PublicDiagramCanvas data={data} token={token ?? ''} selection={selection} onSelect={select} onOpenResource={openResource} commentMode={commentMode}
                                 commentsEnabled={data.commentsEnabled} comments={comments} selectedCommentId={selectedCommentId}
                                 onCommentTarget={chooseCommentTarget} onCommentOpen={id => {
                setSelectedCommentId(id);
                setCommentsOpen(true);
                setCommentMode(false);
                setSelection(null);
                setDetailsOpen(false);
            }}/>
            <div className="pointer-events-none absolute inset-x-3 top-3 z-40 flex items-start justify-between gap-3">
                <div
                    className="public-share-surface pointer-events-auto flex min-w-0 max-w-[55%] items-center rounded-lg bg-surface/90 px-4 py-3 backdrop-blur-md">
                    <h1 className="truncate text-sm font-semibold" data-tooltip={data.diagramName}>{data.diagramName}</h1>
                </div>
                <nav aria-label="Opciones del mapa compartido"
                     className="public-share-surface pointer-events-auto flex shrink-0 gap-0.5 rounded-lg bg-surface/90 p-1 backdrop-blur-md">
                    {data.commentsEnabled && <Button size="icon" className="h-10 w-10" icon={MessageSquarePlus}
                                                     aria-label="Añadir comentario" aria-pressed={commentMode}
                                                     onClick={() => {
                                                         setCommentMode(value => !value);
                                                         closeComments();
                                                     }}/>}
                    <Button size="icon" className="h-10 w-10" icon={MessageCircle} aria-label="Comentarios"
                            aria-expanded={commentsOpen} onClick={() => {
                        if (!commentsOpen) {
                            setSelection(null);
                            setDetailsOpen(false);
                        }
                        if (commentsOpen) closeComments();
                        else setCommentsOpen(true);
                        setCommentMode(false);
                        setSemanticOpen(false);
                    }}/>
                    <Button ref={semanticButton} size="icon" className="h-10 w-10" icon={ListTree}
                            aria-label={showSemantic ? 'Ocultar vista semántica' : 'Mostrar vista semántica'}
                            aria-expanded={showSemantic} onClick={() => setSemanticOpen(value => !value)}/>
                    {selection &&
                        <Button size="icon" className="h-10 w-10" icon={Info} aria-label={detailsOpen ? 'Ocultar contexto' : 'Ver contexto'}
                                title={detailsOpen ? 'Ocultar contexto' : 'Ver contexto'} aria-expanded={detailsOpen}
                                onClick={() => detailsOpen ? closeInspector() : setDetailsOpen(true)}/>}
                    {selectedResource && <Button size="icon" className="h-10 w-10" icon={Maximize2}
                        title="Abrir recurso" aria-label={`Abrir recurso ${selectedResource.title}`}
                        onClick={() => openResource(selectedResource.id)}/>}
                    <Button ref={optionsButton} size="icon" className="h-10 w-10" icon={MoreHorizontal}
                            aria-label="Opciones del mapa" aria-expanded={optionsOpen}
                            aria-controls="public-map-options" onClick={() => setOptionsOpen(value => !value)}/>
                </nav>
                {optionsOpen && <div id="public-map-options" role="dialog" aria-label="Opciones del mapa"
                                     className="pointer-events-auto absolute right-0 top-14 w-48 rounded-lg bg-surface p-3"
                                     onClick={() => {
                                         setOptionsOpen(false);
                                         optionsButton.current?.focus();
                                     }}><p className="mb-2 text-sm font-medium">Apariencia</p><ThemeToggle variant="menu"/></div>}
            </div>
            {commentMode &&
                <p role="status" className="absolute left-3 top-20 z-40 rounded-lg bg-surface px-3 py-2 text-xs">Elige
                    un punto, recurso o relación para comentar.</p>}
            {showSemantic && <aside
                className="public-share-surface absolute bottom-3 left-3 top-20 z-40 w-[min(20rem,calc(100%-1.5rem))] overflow-auto rounded-xl bg-surface/95 p-3 backdrop-blur-md"
                aria-label="Panel de vista semántica">
                {data.layout.nodes.length > 0 &&
                    <Button size="icon" className="absolute right-3 top-3 z-10 h-9 w-9" icon={X} aria-label="Cerrar vista semántica"
                            onClick={() => setSemanticOpen(false)}/>}
                <PublicSemanticList resources={data.resources} relations={data.relations}
                                    visualNodes={data.layout.nodes} selection={selection} onSelect={value => {
                                        select(value);
                                        if (value?.kind === 'resource') openResource(value.id);
                                    }}
                                    commentsEnabled={data.commentsEnabled} onCommentTarget={chooseCommentTarget}/>
            </aside>}
            {commentsOpen && <button type="button" tabIndex={-1} aria-hidden="true"
                                     className="absolute inset-0 z-[45] cursor-default bg-black/15 sm:bg-transparent"
                                     onClick={closeComments}/>}
            {token && <PublicCommentsPanel key={token} token={token} enabled={data.commentsEnabled} open={commentsOpen}
                                           onClose={closeComments} target={commentTarget}
                                           onTargetChange={setCommentTarget}
                                           targetLabel={commentTarget?.type === 'resource' ? data.resources.find(item => item.id === commentTarget.resourceId)?.title ?? 'Recurso' : commentTarget?.type === 'relation' ? publicRelationLabel(data.relations.find(item => item.id === commentTarget.relationId) ?? {label: null}) : commentTarget ? 'Punto del mapa' : 'Mapa completo'}
                                           onCommentsChange={setComments} selectedCommentId={selectedCommentId}/>}
        </section>
        {selection && detailsOpen &&
            <button type="button" className="fixed inset-0 z-[79] bg-black/40 backdrop-blur-sm lg:hidden"
                    aria-label="Cerrar detalles" onClick={closeInspector}/>}
        {detailsOpen && <aside ref={inspector} tabIndex={-1} role={selection ? 'dialog' : undefined}
                               aria-modal={selection ? window.matchMedia?.('(max-width: 1023px)').matches : undefined}
                               aria-label="Detalles del mapa"
                               className={`${selection ? 'fixed inset-x-0 bottom-0 z-[80] max-h-[82dvh] overflow-y-auto rounded-t-xl bg-surface/95 p-4 backdrop-blur-md' : 'hidden'} min-w-0 space-y-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary lg:absolute lg:bottom-20 lg:left-auto lg:right-3 lg:top-20 lg:z-50 lg:block lg:max-h-none lg:w-76 lg:rounded-xl [overflow-wrap:anywhere]`}>
            <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Detalles</h2>
                <Button size="icon" className="h-9 w-9" icon={X}
                        aria-label={selection ? 'Cerrar detalle' : 'Ocultar detalles'} onClick={closeInspector}/></div>
            {!selectedResource && !selectedRelation && !selectedFolder &&
                <p className="text-sm text-outline">Selecciona un recurso o una relación para ver sus detalles.</p>}
            {selectedResource && <div className="space-y-4">
                <h3 className="text-base font-semibold">{selectedResource.title}</h3>
                {selectedResource.description && <p className="whitespace-pre-wrap text-sm">{selectedResource.description}</p>}
                {data.layout.nodes.filter(node => node.resourceId === selectedResource.id && node.caption).map(node =>
                    <p key={node.id} className="text-sm text-outline">{node.caption}</p>)}
                <Button icon={Maximize2} className="justify-start" onClick={() => openResource(selectedResource.id)}>Abrir recurso</Button>
                <section className="space-y-2"><h4 className="text-sm font-medium">Relaciones en este mapa</h4>
                    {data.relations.filter(relation => relation.sourceResourceId === selectedResource.id || relation.targetResourceId === selectedResource.id)
                        .map(relation => <button key={relation.id} type="button"
                            className="block min-h-11 w-full rounded-md px-2 py-2 text-left text-sm hover:bg-surface-variant"
                            onClick={() => select({kind: 'relation', id: relation.id})}>{publicRelationLabel(relation)}</button>)}
                </section>
            </div>}
            {selectedFolder && <div className="space-y-2"><h3
                className="text-lg font-semibold">{selectedFolder.folderName ?? 'Carpeta'}</h3><p
                className="text-sm text-outline">Acceso a carpeta · {selectedFolder.folderCount ?? 0} recursos. Su contenido no se comparte automáticamente.</p>{selectedFolder.caption &&
                <p>{selectedFolder.caption}</p>}</div>}
            {selectedRelation && <div className="space-y-3"><h3
                className="text-lg font-semibold">{publicRelationLabel(selectedRelation)}</h3><p
                className="text-sm text-outline">{selectedRelation.direction === 'directed' ? 'Relación dirigida' : 'Relación no dirigida'}</p>{selectedRelation.explanation &&
                <p className="whitespace-pre-wrap">{selectedRelation.explanation}</p>}
                <div className="flex flex-wrap gap-2"><Button
                    onClick={() => select({kind: 'resource', id: selectedRelation.sourceResourceId})}>Ir
                    a {titles.get(selectedRelation.sourceResourceId)}</Button><Button
                    onClick={() => select({kind: 'resource', id: selectedRelation.targetResourceId})}>Ir
                    a {titles.get(selectedRelation.targetResourceId)}</Button></div>
                <h4 className="font-semibold">Evidencia publicada</h4>{!selectedRelation.evidence?.length &&
                    <p className="text-sm text-outline">No se publicó evidencia para esta relación.</p>}
                <ul className="space-y-2">{selectedRelation.evidence?.map((item, index) => <li
                    key={`${item.resourceId}-${index}`} className="rounded-md bg-background/65 p-2 text-sm">
                    <p>{titles.get(item.resourceId) ?? 'Recurso publicado'}{item.pageNumber ? ` · página ${item.pageNumber}` : ''}</p>{item.excerpt &&
                    <blockquote className="border-l-2 border-outline pl-2">{item.excerpt}</blockquote>}{item.note &&
                    <p>{item.note}</p>}</li>)}</ul>
            </div>}
        </aside>}
        {viewerResource && <ResourceViewerDialog key={`${token}:${viewerResource.id}:${viewerRequest}`}
            resource={viewerResource} url={viewerRequest ? `${viewerUrl}?retry=${viewerRequest}` : viewerUrl}
            downloadUrl={viewerUrl ? `${viewerUrl}?download=1` : undefined}
            onRetry={() => setViewerRequest(value => value + 1)} onClose={() => setViewerResourceId(null)}/>}
    </main>;
}
