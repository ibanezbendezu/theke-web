import { useState } from 'react';
import { Folder, LayoutGrid, LibraryBig, PanelLeftClose, Search } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '../../data/useCurrentAccount';
import { useProjects } from '../../data/useProjects';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../ui/ThemeToggle';

const destinations = [
  { to: '/', label: 'Inicio', icon: LayoutGrid, end: true },
  { to: '/projects', label: 'Proyectos', icon: Folder, end: false },
  { to: '/library', label: 'Biblioteca', icon: LibraryBig, end: false },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (value: boolean) => void }) {
  const account = useCurrentAccount();
  const projects = useProjects('active');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const recent = (projects.data?.pages.flatMap(page => page.data) ?? []).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);

  return (
    <>
      {isOpen && <button type="button" className="fixed inset-0 z-30 bg-black/50 md:hidden" aria-label="Cerrar navegación" onClick={() => setIsOpen(false)} />}
      <aside className={cn(
        'z-40 flex h-full shrink-0 flex-col overflow-hidden bg-surface transition-[width,transform] duration-150 md:relative',
        'fixed inset-y-0 left-0 w-[272px] md:translate-x-0',
        isOpen ? 'translate-x-0 md:w-[272px]' : '-translate-x-full md:w-0',
      )} aria-label="Navegación principal">
        <div className="flex min-w-[272px] items-center justify-between px-5 pb-5 pt-4">
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-surface-variant text-xs" aria-hidden="true">T</span>
            <span>Theke</span>
          </div>
          <button type="button" onClick={() => setIsOpen(false)} className="grid h-9 w-9 place-items-center rounded-md text-outline hover:bg-surface-variant hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary" aria-label="Cerrar barra lateral"><PanelLeftClose size={17} /></button>
        </div>

        <nav className="min-w-[272px] space-y-0.5 px-3" aria-label="Secciones">
          {destinations.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }} className={({ isActive }) => cn(
              'flex min-h-9 items-center gap-3 rounded-md px-3 text-sm text-outline hover:bg-surface-variant hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary',
              isActive && 'bg-surface-variant font-medium text-on-background',
            )}><Icon size={17} aria-hidden="true" /><span>{label}</span></NavLink>
          ))}
        </nav>

        {recent.length > 0 && <><div className="mt-7 min-w-[272px] px-6 text-xs font-medium text-outline">Recientes</div>
          <div className="mt-2 min-w-[272px] px-3 text-sm text-outline">
            {recent.map(project => <NavLink key={project.id} to={`/projects/${project.id}`} onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }} className="block truncate rounded-md px-3 py-1.5 hover:bg-surface-variant hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary">{project.name}</NavLink>)}
          </div></>}

        <div className="min-h-6 flex-1" />
        <div className="min-w-[272px] px-3 pb-2">
          <div className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-on-background">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-surface-variant text-xs font-semibold" aria-hidden="true">{(account.data?.account.name ?? 'T').charAt(0).toUpperCase()}</span>
            <span className="min-w-0 flex-1 truncate">{account.data?.account.name ?? 'Mi espacio de Theke'}</span>
            <ThemeToggle />
          </div>
        </div>
        <form className="min-w-[272px] px-3 pb-3" role="search" onSubmit={event => { event.preventDefault(); navigate(`/library${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`); if (window.innerWidth < 768) setIsOpen(false); }}>
          <label className="flex h-9 items-center gap-2 rounded-md bg-surface-variant px-3 text-outline focus-within:outline-2 focus-within:outline-primary">
            <Search size={16} aria-hidden="true" />
            <input value={search} onChange={event => setSearch(event.target.value)} aria-label="Buscar recursos" placeholder="Buscar recursos" className="min-w-0 flex-1 border-0 bg-transparent text-sm text-on-background outline-none placeholder:text-outline" />
          </label>
        </form>
      </aside>
    </>
  );
}
