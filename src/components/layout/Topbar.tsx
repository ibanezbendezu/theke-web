import { Menu, Home, Folder, FileText, LogOut, Sparkles } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import React, { useState } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { useCurrentAccount } from '../../data/useCurrentAccount';
import { clearPrivateCache } from '../../data/queryClient';
import { AISettingsDialog } from '../ai/AISettingsDialog';
import { useAiStatus } from '../../data/useAi';
import { useProject } from '../../data/useProjects';
import { useResource } from '../../data/useResources';

interface TopbarProps {
    isSidebarOpen: boolean;
    setIsOpen: (val: boolean) => void;
}

// Mapeo para traducir las rutas base a español con sus iconos
const routeDictionary: Record<string, { name: string, icon: React.ElementType }> = {
    'library': { name: 'Biblioteca', icon: FileText },
    'projects': { name: 'Proyectos', icon: Folder },
};

export function Topbar({ isSidebarOpen, setIsOpen }: TopbarProps) {
    const location = useLocation();
    const { signOut } = useClerk();
    const account = useCurrentAccount();
    const { data: aiStatus } = useAiStatus();
    const [aiDialogOpen, setAiDialogOpen] = useState(false);

    // Convertimos la URL "/library/conquistadores" en un array: ['library', 'conquistadores']
    const pathnames = location.pathname.split('/').filter((x) => x);
    const project = useProject(pathnames[0] === 'projects' ? pathnames[1] : undefined);
    const resource = useResource(pathnames[0] === 'library' ? pathnames[1] : undefined);

    return (
        <header className="flex h-[46px] w-full flex-shrink-0 items-center justify-between bg-background px-5 text-on-background">

            <div className="flex items-center gap-1 overflow-hidden">
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-1.5 mr-1 rounded-[4px] hover:bg-surface-variant text-outline hover:text-on-background transition-colors"
                        title="Abrir menú"
                        aria-label="Abrir barra lateral"
                    >
                        <Menu size={18} />
                    </button>
                )}

                {/* Contenedor del Breadcrumb */}
                <div className="flex items-center text-[14px]">
                    {/* El nodo raíz siempre fijo */}
                    <Link to="/" className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] hover:bg-surface-variant cursor-pointer transition-colors max-w-[150px]">
                        <Home size={16} className="text-outline flex-shrink-0" />
                        <span className="font-medium truncate">{account.data?.account.name ?? 'Espacio privado'}</span>
                    </Link>

                    {/* Mapeo dinámico del resto de la ruta */}
                    {pathnames.map((value, index) => {
                        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                        const isKnownRoute = routeDictionary[value];

                        // Si es una ruta base conocida, usamos su diccionario. Si es una carpeta dinámica, capitalizamos el nombre.
                        const name = isKnownRoute ? isKnownRoute.name : pathnames[0] === 'projects' && index === 1 ? project.data?.name ?? 'Proyecto' : pathnames[0] === 'library' && index === 1 ? resource.data?.title ?? 'Recurso' : decodeURIComponent(value).charAt(0).toUpperCase() + decodeURIComponent(value).slice(1);
                        const Icon = isKnownRoute ? isKnownRoute.icon : Folder;

                        return (
                            <React.Fragment key={to}>
                                <span className="text-outline/40 mx-0.5 select-none">/</span>
                                <Link to={to} className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] hover:bg-surface-variant cursor-pointer transition-colors max-w-[150px]">
                                    <Icon size={16} className="flex-shrink-0 text-outline" />
                                    <span className="font-medium truncate">{name}</span>
                                </Link>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 text-outline">
                <button
                    onClick={() => setAiDialogOpen(true)}
                    className={`p-1.5 rounded-[4px] hover:bg-surface-variant transition-colors flex items-center gap-1 text-xs font-medium ${
                        aiStatus?.enabled ? 'text-on-background' : 'text-outline hover:text-on-background'
                    }`}
                    title="Configuración y privacidad de IA"
                    aria-label="Configuración de IA"
                >
                    <Sparkles size={16} />
                    <span className="hidden md:inline">IA</span>
                </button>
                <span className="hidden sm:block max-w-48 truncate text-sm text-on-background">
                    {account.data?.user.displayName ?? account.data?.user.email ?? 'Cuenta'}
                </span>
                <button className="p-2 rounded-[4px] hover:bg-surface-variant transition-colors focus-visible:outline-2 focus-visible:outline-primary" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={async () => { clearPrivateCache(); await signOut({ redirectUrl: '/access' }); }}>
                    <LogOut size={18} />
                </button>
            </div>

            <AISettingsDialog isOpen={aiDialogOpen} onClose={() => setAiDialogOpen(false)} />
        </header>
    );
}
