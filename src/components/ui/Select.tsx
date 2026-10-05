import {Children, isValidElement, useEffect, useId, useRef, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {Check, ChevronDown} from 'lucide-react';

type Option = {value: string; label: ReactNode; disabled: boolean};

export function Select({value, onValueChange, children, className = '', label, title, disabled = false}: {
    value: string;
    onValueChange: (value: string) => void;
    children: ReactNode;
    className?: string;
    label: string;
    title?: string;
    disabled?: boolean;
}) {
    const options: Option[] = Children.toArray(children).filter(isValidElement).map(child => {
        const props = child.props as {value?: string; children?: ReactNode; disabled?: boolean};
        return {value: String(props.value ?? ''), label: props.children, disabled: Boolean(props.disabled)};
    });
    const selected = options.find(option => option.value === value);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const [position, setPosition] = useState({top: 0, left: 0, width: 0, maxHeight: 240});
    const trigger = useRef<HTMLButtonElement>(null);
    const menu = useRef<HTMLDivElement>(null);
    const menuId = useId();

    useEffect(() => {
        if (!open) return;
        menu.current?.focus();
        const closeOutside = (event: PointerEvent) => {
            if (!trigger.current?.contains(event.target as Node) && !menu.current?.contains(event.target as Node)) setOpen(false);
        };
        const closeOnScroll = (event: Event) => {
            if (!menu.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener('pointerdown', closeOutside);
        window.addEventListener('scroll', closeOnScroll, true);
        window.addEventListener('resize', closeOnScroll);
        return () => {
            document.removeEventListener('pointerdown', closeOutside);
            window.removeEventListener('scroll', closeOnScroll, true);
            window.removeEventListener('resize', closeOnScroll);
        };
    }, [open]);

    const show = (direction: 'first' | 'last' | 'selected' = 'selected') => {
        if (disabled || !options.length) return;
        const rect = trigger.current?.getBoundingClientRect();
        if (!rect) return;
        const height = Math.min(240, options.length * 38 + 8);
        const above = window.innerHeight - rect.bottom < Math.min(height, 160) && rect.top > window.innerHeight - rect.bottom;
        const width = Math.min(Math.max(rect.width, 176), window.innerWidth - 16);
        setPosition({top: above ? Math.max(8, rect.top - height - 4) : rect.bottom + 4,
            left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)), width,
            maxHeight: above ? Math.max(80, rect.top - 12) : Math.max(80, window.innerHeight - rect.bottom - 12)});
        const enabled = options.map((option, index) => !option.disabled ? index : -1).filter(index => index >= 0);
        setActive(direction === 'first' ? enabled[0] : direction === 'last' ? enabled.at(-1)! :
            Math.max(0, options.findIndex(option => option.value === value && !option.disabled)));
        setOpen(true);
    };
    const choose = (option?: Option) => {
        if (!option || option.disabled) return;
        onValueChange(option.value);
        setOpen(false);
        trigger.current?.focus();
    };
    const move = (step: number) => {
        const enabled = options.map((option, index) => !option.disabled ? index : -1).filter(index => index >= 0);
        if (enabled.length) setActive(current => enabled[(enabled.indexOf(current) + step + enabled.length) % enabled.length] ?? enabled[0]);
    };
    return <>
        <button ref={trigger} type="button" title={title} aria-label={label} aria-haspopup="listbox"
            aria-expanded={open} aria-controls={open ? menuId : undefined} disabled={disabled}
            onClick={() => open ? setOpen(false) : show()}
            onKeyDown={event => {
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {event.preventDefault(); show(event.key === 'ArrowDown' ? 'first' : 'last');}
            }} className={`theke-select ${className}`}>
            <span className="min-w-0 truncate text-left">{selected?.label ?? options[0]?.label}</span>
            <ChevronDown aria-hidden="true" size={15} className="ml-auto shrink-0 text-outline"/>
        </button>
        {open && createPortal(<div ref={menu} id={menuId} role="listbox" aria-label={label} tabIndex={-1}
            aria-activedescendant={`${menuId}-${active}`}
            onKeyDown={event => {
                if (event.key === 'Escape' || event.key === 'Tab') {setOpen(false); event.preventDefault(); trigger.current?.focus();}
                else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {event.preventDefault(); move(event.key === 'ArrowDown' ? 1 : -1);}
                else if (event.key === 'Home' || event.key === 'End') {event.preventDefault(); setActive(event.key === 'Home' ? options.findIndex(option => !option.disabled) : options.findLastIndex(option => !option.disabled));}
                else if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); choose(options[active]);}
            }}
            style={{position: 'fixed', top: position.top, left: position.left, width: position.width, maxHeight: position.maxHeight}}
            className="z-[100] overflow-y-auto rounded-lg bg-surface/95 p-1 text-sm text-on-background backdrop-blur-xl focus:outline-none">
            {options.map((option, index) => <button key={`${option.value}-${index}`} id={`${menuId}-${index}`}
                type="button" role="option" tabIndex={-1} aria-selected={option.value === value} disabled={option.disabled}
                onMouseEnter={() => setActive(index)} onClick={() => choose(option)}
                className={`flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left focus:outline-none disabled:opacity-40 ${active === index || option.value === value ? 'bg-surface-variant' : 'hover:bg-surface-variant/70'}`}>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.value === value && <Check size={15} aria-hidden="true" className="shrink-0"/>}
            </button>)}
        </div>, document.body)}
    </>;
}
