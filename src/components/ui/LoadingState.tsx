import {LoaderCircle} from 'lucide-react';
import {CeratiumMark} from './CeratiumMark';
import {cn} from '../../lib/utils';

export function LoadingLine({className}: {className?: string}) {
    return <span aria-hidden="true" className={cn('theke-loading-block block rounded-md bg-surface-variant', className)}/>;
}

export function InlineLoading({label, className}: {label: string; className?: string}) {
    return <span role="status" className={cn('inline-flex items-center gap-2 text-sm text-outline', className)}>
        <LoaderCircle size={16} aria-hidden="true" className="shrink-0 motion-safe:animate-spin"/>{label}
    </span>;
}

export function CollectionLoading({view, label}: {view: 'grid' | 'list'; label: string}) {
    return <div role="status" aria-label={label}>
        <span className="sr-only">{label}</span>
        <div aria-hidden="true" className={view === 'grid'
            ? 'theke-loading-gallery grid grid-cols-[repeat(auto-fill,minmax(min(100%,205px),1fr))] gap-3'
            : 'space-y-0.5'}>
            {Array.from({length: view === 'grid' ? 6 : 7}, (_, index) => view === 'grid'
                ? <div key={index} className="overflow-hidden rounded-lg bg-surface-variant/65">
                    <LoadingLine className="aspect-[1.18] rounded-none bg-background/55"/>
                    <div className="space-y-2 px-3 pb-3 pt-2">
                        <LoadingLine className={index % 3 === 0 ? 'h-4 w-2/3' : 'h-4 w-4/5'}/>
                        <LoadingLine className="h-3 w-2/5"/>
                    </div>
                </div>
                : <div key={index} className="flex min-h-12 items-center gap-3 px-2">
                    <LoadingLine className="h-5 w-5 shrink-0"/>
                    <LoadingLine className={index % 3 === 0 ? 'h-4 w-1/3' : 'h-4 w-1/2'}/>
                    <LoadingLine className="ml-auto hidden h-3 w-20 sm:block"/>
                </div>)}
        </div>
    </div>;
}

export function WorkspaceLoading({label, fullscreen = false}: {label: string; fullscreen?: boolean}) {
    return <main role="status"
                 className={cn('grid min-h-72 place-items-center bg-background px-6 text-on-background', fullscreen && 'h-dvh min-h-0')}>
        <div className="flex flex-col items-center gap-3 text-center">
            <CeratiumMark className="theke-loading-mark h-10 w-12 text-outline"/>
            <span className="text-sm text-outline">{label}</span>
        </div>
    </main>;
}
