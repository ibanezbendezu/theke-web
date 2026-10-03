import {useEffect, useRef, useState} from 'react';
import {useParams, useSearchParams} from 'react-router-dom';
import {
    ListTree,
    MessageCircle,
    MessageSquarePlus,
    MoreHorizontal,
    PanelRightClose,
    PanelRightOpen,
    X
} from 'lucide-react';
import type {PublicShare as PublicProjection, PublicShareResponse} from '../api/generated/models';
import {thekeFetch} from '../api/httpClient';
import {Button} from '../components/ui/Button';
import {WorkspaceLoading} from '../components/ui/LoadingState';
import {ThemeToggle} from '../components/ui/ThemeToggle';
import {PublicDiagramCanvas, PublicSemanticList, type PublicSelection} from './PublicDiagramCanvas';
import {PublicResourceDetail} from './PublicResourceDetail';
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
    const [detailsOpen, setDetailsOpen] = useState(true);
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
        if (!selection || !detailsOpen) return;
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
    }, [selection, detailsOpen]);
    const select = (value: PublicSelection) => {
        if (value && !inspector.current?.contains(document.activeElement)) returnFocus.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
        if (value) setDetailsOpen(true);
        setSelection(value);
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
    const closeInspector = () => {
        setSelection(null);
        setDetailsOpen(false);
        restoreFocus();
    };
    const data = view && view.token === token ? view.data : null;
    const unavailable = !token || (view?.token === token && view?.unavailable === true);
    const selectedResource = selection?.kind === 'resource' ? data?.resources.find(item => item.id === selection.id) : null;
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
            <PublicDiagramCanvas data={data} selection={selection} onSelect={select} commentMode={commentMode}
                                 commentsEnabled={data.commentsEnabled} comments={comments}
                                 onCommentTarget={chooseCommentTarget} onCommentOpen={id => {
                setSelectedCommentId(id);
                setCommentsOpen(true);
                setCommentMode(false);
                setSelection(null);
                setDetailsOpen(false);
            }}/>
            <div className="pointer-events-none absolute inset-x-3 top-3 z-40 flex items-start justify-between gap-3">
                <div
                    className="pointer-events-auto flex min-w-0 max-w-[55%] items-center rounded-lg bg-surface/90 px-4 py-3 backdrop-blur-md">
                    <h1 className="truncate text-sm font-semibold" title={data.diagramName}>{data.diagramName}</h1>
                </div>
                <nav aria-label="Opciones del mapa compartido"
                     className="pointer-events-auto flex shrink-0 gap-0.5 rounded-lg bg-surface/90 p-1 backdrop-blur-md">
                    {data.commentsEnabled && <Button size="icon" className="h-10 w-10" icon={MessageSquarePlus}
                                                     aria-label="Añadir comentario" aria-pressed={commentMode}
                                                     onClick={() => {
                                                         setCommentMode(value => !value);
                                                         setCommentsOpen(false);
                                                     }}/>}
                    <Button size="icon" className="h-10 w-10" icon={MessageCircle} aria-label="Comentarios"
                            aria-expanded={commentsOpen} onClick={() => {
                        if (!commentsOpen) {
                            setSelection(null);
                            setDetailsOpen(false);
                        }
                        setCommentsOpen(value => !value);
                        setCommentMode(false);
                        setSemanticOpen(false);
                    }}/>
                    <Button ref={semanticButton} size="icon" className="h-10 w-10" icon={ListTree}
                            aria-label={showSemantic ? 'Ocultar vista semántica' : 'Mostrar vista semántica'}
                            aria-expanded={showSemantic} onClick={() => setSemanticOpen(value => !value)}/>
                    {!detailsOpen &&
                        <Button size="icon" className="h-10 w-10" icon={PanelRightOpen} aria-label="Mostrar detalles"
                                onClick={() => setDetailsOpen(true)}/>}
                    <Button ref={optionsButton} size="icon" className="h-10 w-10" icon={MoreHorizontal}
                            aria-label="Opciones del mapa" aria-expanded={optionsOpen}
                            aria-controls="public-map-options" onClick={() => setOptionsOpen(value => !value)}/>
                </nav>
                {optionsOpen && <div id="public-map-options" role="dialog" aria-label="Opciones del mapa"
                                     className="pointer-events-auto absolute right-0 top-14 w-48 rounded-lg bg-surface p-3"
                                     onClick={() => {
                                         setOptionsOpen(false);
                                         optionsButton.current?.focus();
                                     }}><p className="mb-2 text-sm font-medium">Apariencia</p><ThemeToggle/></div>}
            </div>
            {commentMode &&
                <p role="status" className="absolute left-3 top-20 z-40 rounded-lg bg-surface px-3 py-2 text-xs">Elige
                    un punto, recurso o relación para comentar.</p>}
            {showSemantic && <aside
                className="absolute bottom-3 left-3 top-20 z-40 w-[min(22rem,calc(100%-1.5rem))] overflow-auto rounded-xl bg-surface/95 p-3 backdrop-blur-md"
                aria-label="Panel de vista semántica">
                <div className="mb-2 flex justify-end">{data.layout.nodes.length > 0 &&
                    <Button size="icon" className="h-9 w-9" icon={X} aria-label="Cerrar vista semántica"
                            onClick={() => setSemanticOpen(false)}/>}</div>
                <PublicSemanticList resources={data.resources} relations={data.relations}
                                    visualNodes={data.layout.nodes} selection={selection} onSelect={select}
                                    commentsEnabled={data.commentsEnabled} onCommentTarget={chooseCommentTarget}/>
            </aside>}
            {commentsOpen && <button type="button" tabIndex={-1} aria-hidden="true"
                                     className="absolute inset-0 z-[45] cursor-default bg-black/15 sm:bg-transparent"
                                     onClick={() => setCommentsOpen(false)}/>}
            {token && <PublicCommentsPanel key={token} token={token} enabled={data.commentsEnabled} open={commentsOpen}
                                           onClose={() => setCommentsOpen(false)} target={commentTarget}
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
                               className={`${selection ? 'fixed inset-x-0 bottom-0 z-[80] max-h-[82dvh] overflow-y-auto rounded-t-xl bg-background p-4 md:inset-y-0 md:left-auto md:w-[min(24rem,100vw)] md:max-h-none md:rounded-none' : 'hidden'} min-w-0 space-y-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary lg:relative lg:inset-auto lg:z-0 lg:block lg:h-full lg:w-[304px] lg:shrink-0 lg:overflow-y-auto lg:rounded-none lg:bg-surface-variant/35 lg:p-4 [overflow-wrap:anywhere]`}>
            <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Detalles</h2>
                <Button size="icon" className="h-9 w-9" icon={PanelRightClose}
                        aria-label={selection ? 'Cerrar detalle' : 'Ocultar detalles'} onClick={closeInspector}/></div>
            {!selectedResource && !selectedRelation && !selectedFolder &&
                <p className="text-sm text-outline">Selecciona un recurso o una relación para ver sus detalles.</p>}
            {selectedResource && token &&
                <PublicResourceDetail key={`${token}:${selectedResource.id}`} resource={selectedResource}
                                      token={token}/>}
            {selectedFolder && <div className="space-y-2"><h3
                className="text-lg font-semibold">{selectedFolder.folderName ?? 'Carpeta'}</h3><p
                className="text-sm text-outline">Carpeta representada en el mapa
                · {selectedFolder.folderCount ?? 0} recursos</p>{selectedFolder.caption &&
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
    </main>;
}
