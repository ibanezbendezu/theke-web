import {useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';

type ActiveTooltip = {target: HTMLElement; text: string};

/** One tooltip surface for controls throughout the app, including canvas portals. */
export function TooltipProvider({children}: {children: ReactNode}) {
    const id = useId();
    const [active, setActive] = useState<ActiveTooltip | null>(null);
    const [position, setPosition] = useState<{left: number; top: number} | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!active || !tooltipRef.current) return;
        const rect = active.target.getBoundingClientRect();
        const width = tooltipRef.current.offsetWidth;
        const height = tooltipRef.current.offsetHeight;
        const center = rect.left + rect.width / 2;
        const gap = 8;
        const margin = 8;
        const clampY = (value: number) => Math.max(margin, Math.min(window.innerHeight - height - margin, value));
        if (rect.top - height - gap < margin && rect.bottom + gap + height <= window.innerHeight - margin) {
            setPosition({left: Math.max(margin, Math.min(window.innerWidth - width - margin, center - width / 2)),
                top: rect.bottom + gap});
        } else if (center - width / 2 < margin && rect.right + gap + width <= window.innerWidth - margin) {
            setPosition({left: rect.right + gap, top: clampY(rect.top + rect.height / 2 - height / 2)});
        } else if (center + width / 2 > window.innerWidth - margin && rect.left - gap - width >= margin) {
            setPosition({left: rect.left - gap - width, top: clampY(rect.top + rect.height / 2 - height / 2)});
        } else {
            const left = Math.max(margin, Math.min(window.innerWidth - width - margin, center - width / 2));
            const above = rect.top - height - gap;
            setPosition({left, top: clampY(above >= margin ? above : rect.bottom + gap)});
        }
    }, [active]);

    useEffect(() => {
        let target: HTMLElement | null = null;
        let timer: number | undefined;
        let pointerDownTarget: HTMLElement | null = null;

        const clear = () => {
            window.clearTimeout(timer);
            target = null;
            setActive(null);
        };
        const show = (element: HTMLElement, delay: number) => {
            const text = element.dataset.tooltip?.trim();
            if (!text || element.matches(':disabled')) return clear();
            window.clearTimeout(timer);
            target = element;
            timer = window.setTimeout(() => {
                if (!element.isConnected || target !== element) return;
                setPosition(null);
                setActive({target: element, text});
            }, delay);
        };
        const tooltipTarget = (event: Event) => (event.target instanceof Element
            ? event.target.closest<HTMLElement>('[data-tooltip]') : null);
        const onPointerOver = (event: PointerEvent) => {
            const next = tooltipTarget(event);
            if (next) show(next, 450);
            else clear();
        };
        const onPointerOut = (event: PointerEvent) => {
            if (target && event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return;
            if (target === tooltipTarget(event)) clear();
        };
        const onFocusIn = (event: FocusEvent) => {
            const next = tooltipTarget(event);
            if (next && next !== pointerDownTarget) show(next, 0);
            pointerDownTarget = null;
        };
        const onFocusOut = (event: FocusEvent) => {
            if (target === tooltipTarget(event)) clear();
        };
        const onKeyDown = (event: KeyboardEvent) => {
            pointerDownTarget = null;
            if (event.key === 'Escape') clear();
            else {
                const next = tooltipTarget(event);
                if (next) show(next, 0);
            }
        };
        const onPointerDown = (event: PointerEvent) => {pointerDownTarget = tooltipTarget(event); clear();};
        const onScroll = () => setActive(current => current?.target.isConnected ? {...current} : null);
        document.addEventListener('pointerover', onPointerOver);
        document.addEventListener('pointerout', onPointerOut);
        document.addEventListener('focusin', onFocusIn, true);
        document.addEventListener('focusout', onFocusOut);
        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', clear);
        return () => {
            window.clearTimeout(timer);
            target = null;
            document.removeEventListener('pointerover', onPointerOver);
            document.removeEventListener('pointerout', onPointerOut);
            document.removeEventListener('focusin', onFocusIn, true);
            document.removeEventListener('focusout', onFocusOut);
            document.removeEventListener('keydown', onKeyDown, true);
            document.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', clear);
        };
    }, []);

    useEffect(() => {
        if (!active) return;
        const previous = active.target.getAttribute('aria-describedby');
        active.target.setAttribute('aria-describedby', previous ? `${previous} ${id}` : id);
        return () => {
            if (previous === null) active.target.removeAttribute('aria-describedby');
            else active.target.setAttribute('aria-describedby', previous);
        };
    }, [active, id]);

    return <>{children}{active && createPortal(
        <div ref={tooltipRef} id={id} role="tooltip" className="theke-tooltip"
            style={{left: position?.left ?? 0, top: position?.top ?? 0, visibility: position ? 'visible' : 'hidden'}}>
            {active.text}</div>, document.body)}</>;
}
