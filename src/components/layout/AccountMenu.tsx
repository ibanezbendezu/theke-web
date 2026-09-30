import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import { ChevronDown, CircleHelp, LogOut, Settings2, UserRound, X } from 'lucide-react';
import { useCurrentAccount } from '../../data/useCurrentAccount';
import { clearPrivateCache } from '../../data/queryClient';
import { AISettingsDialog } from '../ai/AISettingsDialog';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { ThemeToggle } from '../ui/ThemeToggle';

type Panel = 'account' | 'about' | 'ai' | null;

export function AccountMenu() {
  const account = useCurrentAccount();
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstAction = useRef<HTMLButtonElement>(null);
  const spaceName = account.data?.account.name ?? 'Mi espacio de Theke';
  const email = user?.primaryEmailAddress?.emailAddress ?? account.data?.user.email;
  const displayName = user?.fullName || user?.firstName || account.data?.user.displayName || email || 'Mi cuenta';
  const avatar = user?.imageUrl;

  useEffect(() => {
    if (!open) return;
    firstAction.current?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [open]);

  const showPanel = (next: Panel) => { setOpen(false); setPanel(next); };
  const closePanel = () => { setPanel(null); trigger.current?.focus(); };
  const signOutNow = async () => { setOpen(false); clearPrivateCache(); await signOut({ redirectUrl: '/access' }); };
  const action = 'flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm text-on-background hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary';

  return <>
    <div ref={root} className="relative min-w-0 flex-1">
      <button ref={trigger} type="button" aria-label={`Opciones de ${spaceName}`} aria-expanded={open} aria-controls="account-menu" onClick={() => setOpen(value => !value)} className="flex h-10 w-full min-w-0 items-center gap-2.5 rounded-md px-2 text-left hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary">
        <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-md bg-surface-variant text-xs font-semibold" aria-hidden="true">{avatar ? <img src={avatar} alt="" className="h-full w-full object-cover"/> : spaceName.charAt(0).toUpperCase()}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{spaceName}</span>
        <ChevronDown size={15} className={`shrink-0 text-outline transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true"/>
      </button>
      {open && <div id="account-menu" role="dialog" aria-label="Cuenta y preferencias" className="absolute left-0 top-12 z-50 w-[248px] rounded-lg bg-background p-1.5 text-on-background">
        <div className="px-3 pb-2 pt-2"><p className="truncate text-sm font-medium">{displayName}</p>{email && displayName !== email && <p className="truncate text-xs text-outline">{email}</p>}</div>
        <button ref={firstAction} type="button" className={action} onClick={() => showPanel('account')}><UserRound size={16} className="text-outline"/>Mi cuenta</button>
        <button type="button" className={action} onClick={() => showPanel('ai')}><Settings2 size={16} className="text-outline"/>Configuración de IA</button>
        <div className="mx-2 my-1 border-t border-border/50"/>
        <div className="px-3 py-2"><p className="mb-2 text-xs text-outline">Apariencia</p><ThemeToggle/></div>
        <div className="mx-2 my-1 border-t border-border/50"/>
        <button type="button" className={action} onClick={() => showPanel('about')}><CircleHelp size={16} className="text-outline"/>Acerca de Theke</button>
        <button type="button" className={action} onClick={() => void signOutNow()}><LogOut size={16} className="text-outline"/>Cerrar sesión</button>
      </div>}
    </div>
    {panel === 'account' && createPortal(<Dialog titleId="account-title" onClose={closePanel} shadow={false} className="max-w-md"><div className="flex items-center justify-between"><h2 id="account-title" className="text-lg font-semibold">Mi cuenta</h2><Button size="icon" icon={X} aria-label="Cerrar" onClick={closePanel}/></div><div className="mt-5 flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-variant text-sm font-semibold">{avatar ? <img src={avatar} alt="" className="h-full w-full object-cover"/> : displayName.charAt(0).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-medium">{displayName}</p>{email && <p className="truncate text-xs text-outline">{email}</p>}</div></div><dl className="mt-5 text-sm"><dt className="text-xs text-outline">Espacio de trabajo</dt><dd className="mt-1 break-words">{spaceName}</dd></dl><Button className="mt-6" variant="secondary" onClick={() => { closePanel(); openUserProfile(); }}>Administrar cuenta</Button></Dialog>, document.body)}
    {panel === 'about' && createPortal(<Dialog titleId="about-title" onClose={closePanel} shadow={false} className="max-w-md"><div className="flex items-center justify-between"><h2 id="about-title" className="text-lg font-semibold">Acerca de Theke</h2><Button size="icon" icon={X} aria-label="Cerrar" onClick={closePanel}/></div><p className="mt-5 text-sm leading-relaxed text-outline">Theke es un espacio para crear mapas, organizar recursos y explorar sus relaciones. Tus proyectos y tu biblioteca pertenecen a tu espacio privado; cada mapa se comparte solo cuando publicas un enlace.</p></Dialog>, document.body)}
    {panel === 'ai' && createPortal(<AISettingsDialog isOpen onClose={closePanel}/>, document.body)}
  </>;
}
