import {useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {useResourceAccess, type ResourceSummary} from '../../data/useResources';

const thumbnailCache = new Map<string, string>();

function remember(key: string, image: string) {
    if (thumbnailCache.size >= 40) thumbnailCache.delete(thumbnailCache.keys().next().value!);
    thumbnailCache.set(key, image);
}

async function firstPdfPage(url: string) {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    const task = pdfjs.getDocument({url, disableRange: true, disableStream: true});
    try {
        const document = await task.promise;
        const page = await document.getPage(1);
        const original = page.getViewport({scale: 1});
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const scale = (320 / original.width) * pixelRatio;
        const viewport = page.getViewport({scale});
        const canvas = window.document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas no disponible.');
        await page.render({canvas, canvasContext: context, viewport}).promise;
        return canvas.toDataURL('image/webp', 0.82);
    } finally {
        await task.destroy();
    }
}

export function FileThumbnail({resource, fallback}: { resource: ResourceSummary; fallback: ReactNode }) {
    const image = resource.mediaType?.startsWith('image/');
    const video = resource.mediaType?.startsWith('video/');
    const pdf = resource.mediaType === 'application/pdf';
    const previewable = resource.type === 'file' && Boolean(image || video || pdf);
    const cacheKey = `${resource.id}:${resource.updatedAt}`;
    const [visible, setVisible] = useState(() => !('IntersectionObserver' in window));
    const [thumbnail, setThumbnail] = useState(() => thumbnailCache.get(cacheKey) ?? '');
    const [failed, setFailed] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!previewable || !('IntersectionObserver' in window)) return;
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                setVisible(true);
                observer.disconnect();
            }
        }, {rootMargin: '120px'});
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [previewable]);

    const access = useResourceAccess(resource.id, visible && previewable && !thumbnail && !failed);
    const url = access.data?.url;

    useEffect(() => {
        if (!pdf || !url || thumbnail || failed) return;
        let active = true;
        void firstPdfPage(url).then(value => {
            if (active) {
                remember(cacheKey, value);
                setThumbnail(value);
            }
        }).catch(() => {
            if (active) setFailed(true);
        });
        return () => {
            active = false;
        };
    }, [cacheKey, failed, pdf, thumbnail, url]);

    const captureVideo = (element: HTMLVideoElement) => {
        if (!element.videoWidth || !element.videoHeight) return;
        try {
            const scale = Math.min(400 / element.videoWidth, 240 / element.videoHeight);
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(element.videoWidth * scale));
            canvas.height = Math.max(1, Math.round(element.videoHeight * scale));
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Canvas no disponible.');
            context.drawImage(element, 0, 0, canvas.width, canvas.height);
            const value = canvas.toDataURL('image/webp', 0.8);
            remember(cacheKey, value);
            setThumbnail(value);
        } catch {
            setFailed(true);
        }
    };

    const loadingPreview = previewable && visible && !failed && !thumbnail && !imageLoaded;
    return <div ref={ref} className={`relative flex h-full w-full items-center justify-center overflow-hidden ${loadingPreview ? 'theke-loading-block' : ''}`}>
        {thumbnail ? <img src={thumbnail} alt=""
                          className={pdf ? 'absolute left-0 top-0 h-auto w-full' : 'h-full w-full object-cover'}/> : resource.previewImageUrl && !failed ?
            <img src={resource.previewImageUrl} alt="" className="h-full w-full object-cover" loading="lazy"
                 onLoad={() => setImageLoaded(true)}
                 onError={() => setFailed(true)}/> : image && url && !failed ?
                <img src={url} alt="" className="h-full w-full object-cover" loading="lazy"
                     onLoad={() => setImageLoaded(true)}
                     onError={() => setFailed(true)}/> : fallback}
        {video && url && !thumbnail && !failed &&
            <video crossOrigin="anonymous" src={url} preload="auto" muted playsInline aria-hidden="true" tabIndex={-1}
                   className="pointer-events-none absolute h-px w-px opacity-0" onLoadedMetadata={event => {
                const duration = event.currentTarget.duration;
                event.currentTarget.currentTime = Number.isFinite(duration) ? Math.min(0.5, duration / 2) : 0;
            }} onSeeked={event => captureVideo(event.currentTarget)} onLoadedData={event => {
                if (event.currentTarget.currentTime === 0) captureVideo(event.currentTarget);
            }} onError={() => setFailed(true)}/>}
    </div>;
}
