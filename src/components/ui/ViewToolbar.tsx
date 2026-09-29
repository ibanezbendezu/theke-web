import type { ReactNode } from 'react';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ViewToolbarProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  groups?: ReactNode;
  controls?: ReactNode;
  search?: ReactNode;
  onNew?: () => void;
  newLabel?: string;
}

export function ViewToolbar({ viewMode, setViewMode, groups, controls, search, onNew, newLabel = 'Añadir' }: ViewToolbarProps) {
  const control = 'grid h-9 w-9 shrink-0 place-items-center rounded-md text-outline hover:bg-surface-variant hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary';

  return (
    <div className="mb-6 flex min-h-9 flex-wrap items-center gap-2">
      {groups && <div className="flex min-w-0 flex-wrap items-center gap-0.5">{groups}</div>}
      {search && <div className="w-full min-w-0 sm:w-64 lg:w-[340px]">{search}</div>}
      <div className="min-w-0 flex-1" />
      {controls && <div className="flex min-w-0 flex-wrap items-center gap-0.5">{controls}</div>}
      <div className="flex shrink-0 items-center gap-0.5" role="group" aria-label="Vista de la colección">
        <button type="button" className={cn(control, viewMode === 'list' && 'bg-surface-variant text-on-background')} onClick={() => setViewMode('list')} aria-label="Vista de lista" aria-pressed={viewMode === 'list'}><List size={18} /></button>
        <button type="button" className={cn(control, viewMode === 'grid' && 'bg-surface-variant text-on-background')} onClick={() => setViewMode('grid')} aria-label="Vista de galería" aria-pressed={viewMode === 'grid'}><LayoutGrid size={18} /></button>
        {onNew && <button type="button" className={cn(control, 'ml-1')} onClick={onNew} aria-label={newLabel} title={newLabel}><Plus size={20} /></button>}
      </div>
    </div>
  );
}

export function CollectionGroup({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn(
    'min-h-9 rounded-md px-3 text-sm text-outline hover:bg-surface-variant hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary',
    active && 'bg-surface-variant font-medium text-on-background',
  )}>{children}</button>;
}
