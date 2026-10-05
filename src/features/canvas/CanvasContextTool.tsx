import type {ReactNode} from 'react';

export const canvasContextToolbarClass = 'relative flex max-w-full items-center gap-0.5 rounded-lg bg-surface/60 p-1 backdrop-blur-xl';
export const canvasContextInputClass = 'h-9 shrink-0 rounded-md border-0 bg-transparent px-1 text-center text-sm text-on-background hover:bg-surface-variant/50 focus-visible:outline-2 focus-visible:outline-primary';

export function CanvasContextTool({label, active, onClick, children}: {
    label: string;
    active?: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return <button type="button" aria-label={label} data-tooltip={label} aria-pressed={active} onClick={onClick}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-primary ${active ? 'bg-surface-variant/85 text-on-background' : 'text-outline hover:bg-surface-variant/55 hover:text-on-background'}`}>
        {children}
    </button>;
}
