import {useEffect, useRef, useState} from 'react';
import type {PDFDocumentProxy, PDFPageProxy, RenderTask} from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {ExternalLink, Minus, Plus} from 'lucide-react';

interface PdfDocumentViewerProps {
    url: string;
    title: string;
    onReady: () => void;
    onError: () => void;
}

export function PdfDocumentViewer({url, title, onReady, onError}: PdfDocumentViewerProps) {
    const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
    const [zoom, setZoom] = useState(1);
    const [viewportWidth, setViewportWidth] = useState(0);
    const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        let active = true;
        let loadingTask: ReturnType<typeof import('pdfjs-dist')['getDocument']> | null = null;
        void import('pdfjs-dist').then(pdfjs => {
            if (!active) return null;
            pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
            loadingTask = pdfjs.getDocument({url, disableRange: true, disableStream: true});
            return loadingTask.promise;
        }).then(document => {
            if (active && document) setPdf(document);
        }).catch(() => {
            if (active) onError();
        });
        return () => {
            active = false;
            void loadingTask?.destroy();
        };
    }, [url, onError]);

    useEffect(() => {
        const element = scrollElement;
        if (!element) return;
        const observer = new ResizeObserver(() => setViewportWidth(element.clientWidth));
        observer.observe(element);
        return () => observer.disconnect();
    }, [scrollElement]);

    const pageWidth = Math.round(Math.min(Math.max(viewportWidth - 48, 240), 880) * zoom);
    return <div className="flex h-full min-h-0 w-full flex-col" aria-label={`Documento ${title}`}>
        <div className="flex shrink-0 items-center justify-between gap-3 bg-background/70 px-4 py-2 text-xs text-outline">
            <span>{pdf ? `${pdf.numPages} ${pdf.numPages === 1 ? 'página' : 'páginas'}` : 'Preparando documento…'}</span>
            <div className="flex items-center gap-1" aria-label="Opciones del documento">
                <button type="button" aria-label="Reducir zoom" disabled={zoom <= 0.75}
                        className="grid h-8 w-8 place-items-center rounded-md hover:bg-surface-variant disabled:opacity-35"
                        onClick={() => setZoom(value => Math.max(0.75, Number((value - 0.25).toFixed(2))))}><Minus size={16}/></button>
                <button type="button" className="min-w-12 rounded-md px-1 py-1.5 text-center hover:bg-surface-variant"
                        aria-label="Restablecer zoom" data-tooltip="Ajustar al ancho"
                        onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
                <button type="button" aria-label="Ampliar zoom" disabled={zoom >= 2}
                        className="grid h-8 w-8 place-items-center rounded-md hover:bg-surface-variant disabled:opacity-35"
                        onClick={() => setZoom(value => Math.min(2, Number((value + 0.25).toFixed(2))))}><Plus size={16}/></button>
                <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Abrir PDF original"
                   data-tooltip="Abrir PDF original" className="ml-1 grid h-8 w-8 place-items-center rounded-md hover:bg-surface-variant">
                    <ExternalLink size={15}/>
                </a>
            </div>
        </div>
        <div ref={setScrollElement} className="min-h-0 flex-1 overflow-auto overscroll-contain" tabIndex={0}
             aria-label="Páginas del documento">
            {pdf && viewportWidth > 0 && <div className="flex flex-col items-center gap-5 px-6 py-5"
                                             style={{minWidth: pageWidth + 48}}>
                {Array.from({length: pdf.numPages}, (_, index) =>
                    <PdfPage key={index} pdf={pdf} number={index + 1} width={pageWidth}
                             scrollRoot={scrollElement} onReady={index === 0 ? onReady : undefined}
                             onError={index === 0 ? onError : undefined}/>) }
            </div>}
        </div>
    </div>;
}

function PdfPage({pdf, number, width, scrollRoot, onReady, onError}: {
    pdf: PDFDocumentProxy;
    number: number;
    width: number;
    scrollRoot: HTMLDivElement | null;
    onReady?: () => void;
    onError?: () => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [visible, setVisible] = useState(number === 1);
    const [page, setPage] = useState<PDFPageProxy | null>(null);
    const [renderedWidth, setRenderedWidth] = useState(0);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const element = containerRef.current;
        if (!element || !scrollRoot || visible) return;
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                setVisible(true);
                observer.disconnect();
            }
        }, {root: scrollRoot, rootMargin: '700px'});
        observer.observe(element);
        return () => observer.disconnect();
    }, [scrollRoot, visible]);

    useEffect(() => {
        if (!visible) return;
        let active = true;
        void pdf.getPage(number).then(value => {
            if (active) setPage(value);
        }).catch(() => {
            if (active) {
                setFailed(true);
                onError?.();
            }
        });
        return () => { active = false; };
    }, [pdf, number, visible, onError]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!page || !canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        const original = page.getViewport({scale: 1});
        const viewport = page.getViewport({scale: width / original.width});
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.ceil(viewport.width * pixelRatio);
        canvas.height = Math.ceil(viewport.height * pixelRatio);
        canvas.style.width = `${Math.round(viewport.width)}px`;
        canvas.style.height = `${Math.round(viewport.height)}px`;
        const renderTask: RenderTask = page.render({
            canvas,
            canvasContext: context,
            viewport,
            transform: [pixelRatio, 0, 0, pixelRatio, 0, 0]
        });
        void renderTask.promise.then(() => {
            setRenderedWidth(width);
            onReady?.();
        }).catch(error => {
            if (error?.name !== 'RenderingCancelledException') {
                setFailed(true);
                onError?.();
            }
        });
        return () => { renderTask.cancel(); };
    }, [page, width, onReady, onError]);

    const ratio = page ? page.getViewport({scale: 1}).height / page.getViewport({scale: 1}).width : 1.414;
    return <div ref={containerRef} className="relative bg-white" style={{width, minHeight: width * ratio}}
                aria-label={`Página ${number}`}>
        {failed ? <p className="p-6 text-sm text-red-600">No se pudo mostrar la página {number}.</p> :
            <canvas ref={canvasRef} className={renderedWidth === width ? 'block' : 'block opacity-0'}/>}
    </div>;
}
