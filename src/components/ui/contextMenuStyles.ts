// Shared visual language for right-click menus and compact action menus.
export const contextMenuSurfaceClass = 'rounded-lg bg-surface/95 p-1.5 text-on-background ring-1 ring-outline/15 backdrop-blur-xl';
export const contextMenuItemClass = 'flex min-h-9 w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm text-on-background hover:bg-surface-variant/60 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-default disabled:opacity-50';
export const contextMenuDestructiveItemClass = `${contextMenuItemClass} !text-red-500`;
export const contextMenuDividerClass = 'mx-2 my-1 h-px bg-outline/15';
