import {Menu, Home, Folder, FileText, Bell} from 'lucide-react';
import {useLocation, useNavigate, Link} from 'react-router-dom';
import React, {useState} from 'react';
import {useCommentNotifications, useCommentNotificationStream} from '../../data/useCommentNotifications';
import {CommentNotificationsPanel} from '../comments/CommentNotificationsPanel';
import {useCurrentAccount} from '../../data/useCurrentAccount';
import {useProject} from '../../data/useProjects';
import {useResource} from '../../data/useResources';
import {useProjectFolders} from '../../data/useProjectFolders';
import {useLibraryFolders} from '../../data/useLibraryFolders';
import {useProjectFolderActions} from '../../data/useProjectFolders';
import {useLibraryFolderActions} from '../../data/useLibraryFolders';
import {folderTrail} from '../../lib/collectionFolders';
import {useToast} from '../ui/useToast';

interface TopbarProps {
    isSidebarOpen: boolean;
    setIsOpen: (val: boolean) => void;
}

// Mapeo para traducir las rutas base a español con sus iconos
const routeDictionary: Record<string, { name: string, icon: React.ElementType }> = {
    'library': {name: 'Biblioteca', icon: FileText},
    'projects': {name: 'Proyectos', icon: Folder},
};

export function Topbar({isSidebarOpen, setIsOpen}: TopbarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const account = useCurrentAccount();
    const [dropTarget, setDropTarget] = useState<string | null>(null);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notifications = useCommentNotifications();
    useCommentNotificationStream();
    const toast = useToast();

    // Convertimos la URL "/library/conquistadores" en un array: ['library', 'conquistadores']
    const pathnames = location.pathname.split('/').filter((x) => x);
    const project = useProject(pathnames[0] === 'projects' ? pathnames[1] : undefined);
    const resource = useResource(pathnames[0] === 'library' ? pathnames[1] : undefined);
    const projectFolders = useProjectFolders(pathnames[0] === 'projects');
    const libraryFolders = useLibraryFolders(pathnames[0] === 'library');
    const projectFolderActions = useProjectFolderActions();
    const libraryFolderActions = useLibraryFolderActions();
    const params = new URLSearchParams(location.search);
    const projectFolderId = params.get('folder') ?? project.data?.collectionFolderId;
    const libraryFolderId = params.get('libraryFolderId') ?? resource.data?.libraryFolderId;
    const trail = pathnames[0] === 'projects'
        ? folderTrail(projectFolders.data ?? [], projectFolderId)
        : pathnames[0] === 'library'
            ? folderTrail(libraryFolders.data ?? [], libraryFolderId)
            : [];
    const acceptsDrop = (event: React.DragEvent<HTMLElement>) => {
        const types = Array.from(event.dataTransfer.types);
        return pathnames[0] === 'projects'
            ? types.some(type => ['application/x-theke-project', 'application/x-theke-project-folder'].includes(type))
            : pathnames[0] === 'library'
                ? types.some(type => ['application/x-theke-resource', 'application/x-theke-library-folder'].includes(type))
                : false;
    };
    const dropHandlers = (destination: string | null) => ({
        onDragOver: (event: React.DragEvent<HTMLElement>) => {
            if (acceptsDrop(event)) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                setDropTarget(destination ?? 'root');
            }
        },
        onDragLeave: () => setDropTarget(null),
        onDrop: async (event: React.DragEvent<HTMLElement>) => {
            if (!acceptsDrop(event)) return;
            event.preventDefault();
            setDropTarget(null);
            try {
                if (pathnames[0] === 'projects') {
                    const folderId = event.dataTransfer.getData('application/x-theke-project-folder');
                    const projectId = event.dataTransfer.getData('application/x-theke-project');
                    if (folderId) await projectFolderActions.moveFolder.mutateAsync({
                        id: folderId,
                        parentFolderId: destination
                    });
                    else if (projectId) await projectFolderActions.move.mutateAsync({
                        projectIds: [projectId],
                        folderId: destination
                    });
                } else if (pathnames[0] === 'library') {
                    const folderId = event.dataTransfer.getData('application/x-theke-library-folder');
                    const resourceId = event.dataTransfer.getData('application/x-theke-resource');
                    if (folderId) await libraryFolderActions.moveFolder.mutateAsync({
                        id: folderId,
                        parentFolderId: destination
                    });
                    else if (resourceId) await libraryFolderActions.move.mutateAsync({
                        resourceIds: [resourceId],
                        folderId: destination
                    });
                }
            } catch (reason) {
                toast.error(reason instanceof Error ? reason.message : 'No se pudo mover.');
            }
        },
    });

    return (
        <header
            className="flex h-[46px] w-full flex-shrink-0 items-center justify-between bg-background px-5 text-on-background">

            <div className="flex items-center gap-1 overflow-hidden">
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-1.5 mr-1 rounded-[4px] hover:bg-surface-variant text-outline hover:text-on-background transition-colors"
                        title="Abrir menú"
                        aria-label="Abrir barra lateral"
                    >
                        <Menu size={18}/>
                    </button>
                )}

                {/* Contenedor del Breadcrumb */}
                <div className="flex items-center text-[14px]">
                    {/* El nodo raíz siempre fijo */}
                    <Link to="/"
                          className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] hover:bg-surface-variant cursor-pointer transition-colors max-w-[150px]">
                        <Home size={16} className="text-outline flex-shrink-0"/>
                        <span className="font-medium truncate">{account.data?.account.name ?? 'Espacio privado'}</span>
                    </Link>

                    {/* Mapeo dinámico del resto de la ruta */}
                    {pathnames.map((value, index) => {
                        if (pathnames[0] === 'library' && index > 0) return null;
                        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                        const isKnownRoute = routeDictionary[value];

                        // Si es una ruta base conocida, usamos su diccionario. Si es una carpeta dinámica, capitalizamos el nombre.
                        const name = isKnownRoute ? isKnownRoute.name : pathnames[0] === 'projects' && index === 1 ? project.data?.name ?? 'Proyecto' : pathnames[0] === 'library' && index === 1 ? resource.data?.title ?? 'Recurso' : decodeURIComponent(value).charAt(0).toUpperCase() + decodeURIComponent(value).slice(1);
                        const Icon = isKnownRoute ? isKnownRoute.icon : Folder;

                        return (
                            <React.Fragment key={to}>
                                <span className="text-outline/40 mx-0.5 select-none">/</span>
                                <Link to={to} {...(index === 0 ? dropHandlers(null) : {})}
                                      className={`flex items-center gap-1.5 px-2 py-1 rounded-[4px] hover:bg-surface-variant cursor-pointer transition-colors max-w-[150px] ${index === 0 && dropTarget === 'root' ? 'bg-surface-variant' : ''}`}>
                                    <Icon size={16} className="flex-shrink-0 text-outline"/>
                                    <span className="font-medium truncate">{name}</span>
                                </Link>
                                {index === 0 && trail.map(folder => <React.Fragment key={folder.id}>
                                    <span className="text-outline/40 mx-0.5 select-none">/</span>
                                    <Link
                                        to={pathnames[0] === 'projects' ? `/projects?folder=${folder.id}` : `/library?libraryFolderId=${folder.id}`} {...dropHandlers(folder.id)}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-[4px] hover:bg-surface-variant cursor-pointer transition-colors max-w-[150px] ${dropTarget === folder.id ? 'bg-surface-variant' : ''}`}>
                                        <Folder size={16} className="flex-shrink-0 text-outline"/>
                                        <span className="font-medium truncate">{folder.name}</span>
                                    </Link>
                                </React.Fragment>)}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            <div className="relative shrink-0">
                <button type="button" className="relative grid h-8 w-8 place-items-center rounded-md text-outline hover:bg-surface-variant hover:text-on-background"
                        aria-label={`Comentarios${notifications.data?.unreadCount ? `, ${notifications.data.unreadCount} pendientes` : ''}`}
                        aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(value => !value)}>
                    <Bell size={17}/>{Boolean(notifications.data?.unreadCount) && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-primary px-0.5 text-[10px] leading-4 text-on-primary">{Math.min(notifications.data!.unreadCount, 99)}{notifications.data!.unreadCount > 99 ? '+' : ''}</span>}
                </button>
                {notificationsOpen && <section className="absolute right-0 top-10 z-[70] h-[min(32rem,calc(100dvh-4rem))] w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl bg-surface ring-1 ring-border"
                                              aria-label="Avisos de comentarios"><CommentNotificationsPanel onOpen={item => {
                                                  setNotificationsOpen(false);
                                                  navigate(`/projects/${item.projectId}/diagrams/${item.diagramId}?comment=${item.commentId}`);
                                              }}/></section>}
            </div>
        </header>
    );
}
