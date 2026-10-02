import type {ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {CeratiumMark} from '../../components/ui/CeratiumMark';

export function AuthShell({titleId, title, description, children}: {
    titleId: string;
    title: string;
    description: string;
    children: ReactNode
}) {
    return <main className="h-dvh overflow-y-auto bg-background text-on-background">
        <div className="flex min-h-full w-full flex-col px-5 py-5 sm:px-8 sm:py-7">
            <Link to="/welcome" className="flex items-center gap-2.5 self-start rounded-md text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary">
                <CeratiumMark className="h-7 w-7"/>
                <span>Theke</span>
            </Link>
            <div className="flex flex-1 items-center justify-center py-10">
                <section aria-labelledby={titleId} className="w-full max-w-[400px]">
                    <h1 id={titleId} className="text-[24px] font-semibold leading-tight tracking-tight">{title}</h1>
                    <p className="mb-8 mt-2 text-sm leading-relaxed text-outline">{description}</p>
                    {children}
                </section>
            </div>
        </div>
    </main>;
}
