import {ArrowUpRight, File as FileIcon, FileText, Image, Link as LinkIcon, Music, Video} from 'lucide-react';
import {FileThumbnail} from '../../components/resources/FileThumbnail';
import {LoadingLine} from '../../components/ui/LoadingState';
import type {ResourceDetail} from '../../data/useResources';

import type {ResourceDisplayMode} from './resourceCardSizing';

export type CardResource = Pick<ResourceDetail, 'id' | 'title' | 'type' | 'mediaType'> & Partial<Pick<ResourceDetail, 'content' | 'description' | 'url' | 'previewImageUrl' | 'updatedAt'>>;

export function ResourceCard({resource, mode, caption, selected, accent, onOpen, directUrl}: {
    resource?: CardResource;
    mode: ResourceDisplayMode;
    caption?: string;
    selected?: boolean;
    accent?: string;
    onOpen: () => void;
    directUrl?: string;
}) {
    const media = resource?.mediaType;
    const Icon = resource?.type === 'note' ? FileText : resource?.type === 'link' ? LinkIcon : media?.startsWith('image/') ? Image : media?.startsWith('video/') ? Video : media?.startsWith('audio/') ? Music : FileIcon;
    const kind = resource?.type === 'note' ? 'Nota' : resource?.type === 'link' ? 'Enlace' : media?.startsWith('image/') ? 'Imagen' : media?.startsWith('video/') ? 'Vídeo' : media?.startsWith('audio/') ? 'Audio' : media === 'application/pdf' ? 'Documento PDF' : 'Archivo';
    const previewable = Boolean(resource?.type === 'file' && (media?.startsWith('image/') || media?.startsWith('video/') || media === 'application/pdf'));
    const excerpt = resource?.type === 'note' ? resource.content?.trim() || 'Nota vacía' : resource?.description;
    const domain = (() => {
        if (!resource?.url) return 'Enlace web';
        try { return new URL(resource.url).hostname.replace(/^www\./, ''); } catch { return 'Enlace web'; }
    })();
    const border = accent === 'primary' ? 'var(--color-primary)' : accent === 'muted' ? 'var(--color-outline)' : 'var(--color-border)';
    if (!resource) return <article aria-busy="true" aria-label="Cargando recurso"
                                  className="relative flex h-full w-full flex-col overflow-hidden rounded-lg bg-background"
                                  style={{outline: `1px solid ${border}`}}>
        <div className="flex min-h-[72px] items-center gap-3 px-3">
            <LoadingLine className="h-9 w-9 shrink-0"/>
            <div className="min-w-0 flex-1 space-y-2">
                <LoadingLine className="h-3.5 w-3/5"/>
                <LoadingLine className="h-2.5 w-2/5"/>
            </div>
        </div>
        {mode === 'normal' && <div className="min-h-0 flex-1 px-2 pb-2">
            <LoadingLine className="h-full w-full"/>
        </div>}
    </article>;
    return <article className="relative flex h-full w-full flex-col overflow-hidden rounded-lg bg-background"
                    style={{outline: `${selected ? 2 : 1}px solid ${selected ? 'var(--color-primary)' : border}`}} onDoubleClick={onOpen}>
        <div key={resource?.id ?? 'loading'} className={`${resource ? 'theke-resource-content-arrive ' : ''}flex h-full min-h-0 w-full flex-col`}>
        <div className="flex min-h-[72px] items-center gap-3 px-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-surface-variant text-on-background"><Icon size={18} aria-hidden="true"/></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{resource?.title ?? 'Cargando recurso…'}</p>
                <p className="truncate text-xs text-outline">{kind}{caption ? ` · ${caption}` : ''}</p></div>
            <button type="button" className="nodrag nopan grid h-7 w-7 shrink-0 place-items-center rounded-md text-outline hover:bg-surface-variant hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary"
                    aria-label={`Abrir detalle de ${resource?.title ?? 'recurso'}`} title="Abrir detalle" onClick={onOpen}>
                <ArrowUpRight size={15} aria-hidden="true"/>
            </button>
        </div>
        {mode === 'normal' && <div className="min-h-0 flex-1 px-2 pb-2">
            {resource?.type === 'link' ? <div className="flex h-full flex-col overflow-hidden rounded-md bg-surface-variant/50">
                {resource.previewImageUrl ? <img className="h-20 w-full shrink-0 object-cover" src={resource.previewImageUrl}
                                                 alt="" referrerPolicy="no-referrer" loading="lazy"/>
                    : <div className="flex h-20 shrink-0 items-center gap-2 px-3 text-on-background/70"><LinkIcon size={20} aria-hidden="true"/>
                        <span className="truncate text-sm font-medium">{domain}</span></div>}
                <div className="min-h-0 flex-1 px-3 py-2">
                    {resource.previewImageUrl && <p className="truncate text-xs font-medium">{domain}</p>}
                    <p className="line-clamp-2 break-words text-xs leading-relaxed text-outline">{resource.description || resource.url || 'Sin descripción.'}</p>
                </div>
            </div> : previewable && resource ? <div className="h-full overflow-hidden rounded-md bg-surface-variant/50">
                <FileThumbnail resource={{id: resource.id, type: resource.type, mediaType: resource.mediaType, previewImageUrl: resource.previewImageUrl, updatedAt: resource.updatedAt ?? 'public'}}
                               directUrl={directUrl} fallback={<Icon size={32} className="text-outline" aria-hidden="true"/>}/>
            </div> : media?.startsWith('audio/') ? <div className="flex h-full flex-col justify-center gap-3 rounded-md bg-surface-variant/50 px-3">
                <div className="flex items-center gap-2 text-xs text-outline"><Music size={16} aria-hidden="true"/> Audio</div>
                {directUrl ? <audio className="nodrag nopan w-full" controls preload="none" src={directUrl} onPointerDown={event => event.stopPropagation()}/> : <p className="text-xs text-outline">Abre el recurso para reproducirlo.</p>}
            </div> : <div className="h-full overflow-hidden rounded-md bg-surface-variant/50 px-3 py-3 text-sm leading-relaxed text-on-background">
                <p className="line-clamp-6 whitespace-pre-wrap break-words">{excerpt || (resource?.type === 'note' ? 'Nota vacía' : 'Abre el recurso para ver su contenido.')}</p>
            </div>}
        </div>}
        </div>
    </article>;
}
