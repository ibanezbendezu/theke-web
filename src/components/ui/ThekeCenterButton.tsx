import {useEffect, useRef, useState} from 'react';
import {X} from 'lucide-react';
import {CeratiumMark} from './CeratiumMark';

export function ThekeCenterButton() {
    const [open, setOpen] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        closeButton.current?.focus();
        const onPointerDown = (event: PointerEvent) => {
            if (!root.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
                trigger.current?.focus();
            }
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    return <div ref={root} className="fixed bottom-5 right-5 z-50 sm:bottom-7 sm:right-7">
        {open && <section id="theke-center" role="dialog" aria-label="Centro de Theke"
                          className="mb-3 w-[min(20rem,calc(100vw-2.5rem))] rounded-xl bg-surface p-5 text-on-background ring-1 ring-border">
            <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold">
                    Centro de Theke
                </h2>
                <button ref={closeButton} type="button"
                        className="-mr-1 -mt-1 grid h-9 w-9 place-items-center rounded-md text-outline hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary"
                        aria-label="Cerrar centro de Theke" onClick={() => {
                    setOpen(false);
                    trigger.current?.focus();
                }}><X size={17}/></button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-outline">Aquí reuniremos novedades, preguntas frecuentes y
                una forma de enviarnos tus comentarios.</p>
            <p className="mt-4 text-xs font-medium text-outline">Próximamente</p>
        </section>}
        <button ref={trigger} type="button" aria-label={open ? 'Cerrar centro de Theke' : 'Abrir centro de Theke'}
                aria-controls="theke-center" aria-expanded={open} onClick={() => setOpen(value => !value)}
                className="theke-center-float grid h-14 w-14 place-items-center rounded-full bg-on-background text-background ring-2 ring-background hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-background motion-reduce:animate-none">
            <CeratiumMark className="h-8 w-8"/>
        </button>
    </div>;
}
