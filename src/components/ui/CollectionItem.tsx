import { useEffect, useRef, useState } from 'react';
import type { DragEvent, ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface CollectionAction { label: string; onSelect: () => void; destructive?: boolean }

interface CollectionItemProps {
  title: string;
  detail?: string;
  date?: string;
  icon: ReactNode;
  preview?: ReactNode;
  view: 'grid' | 'list';
  onOpen: () => void;
  actions?: CollectionAction[];
  onDragStart?: (event: DragEvent<HTMLElement>) => void;
  onDragOver?: (event: DragEvent<HTMLElement>) => void;
  onDrop?: (event: DragEvent<HTMLElement>) => void;
}

export function CollectionItem({ title, detail, date, icon, preview, view, onOpen, actions = [], onDragStart, onDragOver, onDrop }: CollectionItemProps) {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu) return;
    const close = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node)) setMenu(null); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenu(null); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, [menu]);
  const openMenu = (x: number, y: number) => {
    setMenu({ x: Math.min(x, window.innerWidth - 210), y: Math.min(y, window.innerHeight - actions.length * 38 - 18) });
    requestAnimationFrame(() => menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus());
  };
  const menuButton = <button type="button" aria-label={`Opciones de ${title}`} aria-haspopup="menu" aria-expanded={Boolean(menu)} className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-outline hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary" onClick={event => { event.stopPropagation(); const rect = event.currentTarget.getBoundingClientRect(); openMenu(rect.left, rect.bottom + 4); }}><MoreHorizontal size={19} /></button>;
  return <div draggable={Boolean(onDragStart)} onDragStart={onDragStart} onDragOver={event => { if (onDrop) setDropActive(true); onDragOver?.(event); }} onDragLeave={() => setDropActive(false)} onDrop={event => { setDropActive(false); onDrop?.(event); }} onContextMenu={event => { if (!actions.length) return; event.preventDefault(); openMenu(event.clientX, event.clientY); }} className={`${view === 'grid' ? 'group relative min-w-0 overflow-hidden rounded-lg bg-surface-variant/65 hover:bg-surface-variant' : 'group flex min-w-0 items-center gap-2 border-b border-border/45 px-2 py-1 hover:bg-surface-variant/65'} ${dropActive ? 'bg-primary/10' : ''}`}>
    {view === 'grid' ? <><button type="button" onClick={onOpen} className="block w-full text-left focus-visible:outline-2 focus-visible:outline-primary"><div className="flex aspect-[1.18] items-center justify-center overflow-hidden bg-background/55 text-outline">{preview ?? icon}</div><div className="min-w-0 px-3 pb-3 pt-2"><strong className="block truncate text-sm font-medium text-on-background">{title}</strong>{detail && <span className="mt-0.5 block truncate text-xs text-outline">{detail}</span>}</div></button>{actions.length > 0 && <div className="absolute right-2 top-2 rounded-md bg-background/85 backdrop-blur-sm">{menuButton}</div>}</> : <><button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-primary"><span className="shrink-0 text-outline">{icon}</span><span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span></button>{detail && <span className="hidden max-w-48 truncate text-xs text-outline md:block">{detail}</span>}{date && <time className="hidden w-28 text-right text-xs text-outline sm:block">{date}</time>}{actions.length > 0 && menuButton}</>}
    {menu && createPortal(<div ref={menuRef} role="menu" aria-label={`Opciones de ${title}`} className="fixed z-[90] max-h-[70vh] min-w-48 overflow-auto rounded-lg bg-background p-1 shadow-xl ring-1 ring-black/5 dark:ring-white/10" style={{ left: Math.max(8, menu.x), top: Math.max(8, menu.y) }}>{actions.map(action => <button key={action.label} type="button" role="menuitem" className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary ${action.destructive ? 'text-red-600' : ''}`} onClick={() => { setMenu(null); action.onSelect(); }}>{action.label}</button>)}</div>, document.body)}
  </div>;
}
