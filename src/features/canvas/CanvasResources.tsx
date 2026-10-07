import {useEffect, useState} from 'react';
import type {FormEvent} from 'react';
import {FileText, Folder, Link2, Plus} from 'lucide-react';
import {Button} from '../../components/ui/Button';
import {InlineLoading} from '../../components/ui/LoadingState';
import {CollectionItem} from '../../components/ui/CollectionItem';
import {useLibraryFolders} from '../../data/useLibraryFolders';
import {useOrganization} from '../../data/useOrganization';
import {useLinkActions, useResources} from '../../data/useResources';
import {CanvasDialog} from './CanvasDialog';

export function CanvasResourcePanel({projectId, onAdd, onSelect, onSelectFolder}: {
    projectId: string;
    onAdd: () => void;
    onSelect: (id: string) => void;
    onSelectFolder: (id: string) => void
}) {
    const organization = useOrganization(projectId);
    const [folderPickerOpen, setFolderPickerOpen] = useState(false);
    const resources = organization.data?.resources.filter(item => !item.archivedAt) ?? [];
    return <aside className="h-full w-full overflow-auto p-4" aria-label="Recursos">
        <h2 className="pr-10 text-sm font-semibold">Recursos del mapa</h2>
        <div className="mt-3 space-y-2"><Button variant="secondary" className="w-full" onClick={onAdd}>Añadir recurso</Button>
            <Button className="w-full" icon={Folder} onClick={() => setFolderPickerOpen(true)}>Añadir acceso a carpeta</Button></div>
        {organization.isPending && <div className="mt-3"><InlineLoading label="Cargando recursos…"/></div>}
        {organization.isError && <p role="alert" className="mt-3 text-xs">No se pudieron cargar los recursos.</p>}
        {resources.length > 0 ?
            <div className="mt-4 space-y-1">{resources.map(item => <CollectionItem key={item.resourceId} view="list"
                                                                                   title={item.title}
                                                                                   icon={<FileText size={16}/>}
                                                                                   onOpen={() => onSelect(item.resourceId)}
                                                                                   onDragStart={event => {
                                                                                       event.dataTransfer.setData('application/x-theke-resource', item.resourceId);
                                                                                       event.dataTransfer.effectAllowed = 'copy';
                                                                                   }} actions={[{
                label: 'Añadir al mapa',
                onSelect: () => onSelect(item.resourceId)
            }]}/>)}</div> : !organization.isPending &&
            <p className="mt-4 text-xs text-outline">Aún no hay recursos en este mapa.</p>}
        {folderPickerOpen && <CanvasLibraryFolderPicker onClose={() => setFolderPickerOpen(false)} onSelect={id => {
            onSelectFolder(id);
            setFolderPickerOpen(false);
        }}/>}
    </aside>;
}

function CanvasLibraryFolderPicker({onClose, onSelect}: {onClose: () => void; onSelect: (id: string) => void}) {
    const folders = useLibraryFolders();
    const [search, setSearch] = useState('');
    const all = folders.data ?? [];
    const byId = new Map(all.map(folder => [folder.id, folder]));
    const path = (id: string) => {
        const parts: string[] = [];
        const seen = new Set<string>();
        for (let current = byId.get(id); current && !seen.has(current.id); current = current.parentFolderId ? byId.get(current.parentFolderId) : undefined) {
            seen.add(current.id);
            parts.unshift(current.name);
        }
        return parts.join(' / ');
    };
    const visible = all.filter(folder => path(folder.id).toLocaleLowerCase().includes(search.toLocaleLowerCase()));
    return <CanvasDialog titleId="folder-picker-title" onClose={onClose} className="flex max-h-[80vh] max-w-lg flex-col">
        <div className="flex items-center justify-between"><h2 id="folder-picker-title" className="font-semibold">Carpeta de Biblioteca</h2>
            <Button onClick={onClose}>Cerrar</Button></div>
        <p className="mt-2 text-xs text-outline">El mapa tendrá un acceso a la carpeta; sus recursos seguirán en la Biblioteca.</p>
        <label className="mt-4 text-sm">Buscar carpeta<input autoFocus value={search} onChange={event => setSearch(event.target.value)}
            className="mt-1 w-full rounded-md bg-surface-variant px-3 py-2 focus-visible:outline-2 focus-visible:outline-primary"/></label>
        <div className="mt-3 min-h-0 overflow-auto">{folders.isPending && <InlineLoading label="Cargando carpetas…"/>}
            {folders.isError && <p role="alert">No se pudieron cargar las carpetas.</p>}
            {!folders.isPending && !folders.isError && visible.length === 0 &&
                <p className="py-4 text-xs text-outline">{all.length ? 'No hay carpetas con ese nombre.' : 'Crea una carpeta en Biblioteca para añadirla al mapa.'}</p>}
            {visible.map(folder => <button key={folder.id} type="button" onClick={() => onSelect(folder.id)}
                className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary">
                <Folder size={17} className="shrink-0 text-outline" aria-hidden="true"/><span className="min-w-0 truncate">{path(folder.id)}</span>
                <Plus size={15} className="ml-auto shrink-0 text-outline" aria-hidden="true"/>
            </button>)}</div>
    </CanvasDialog>;
}

export function CanvasResourcePicker({projectId, usedIds, onClose, onSelect, onFocus, onCreateNote}: {
    projectId: string;
    usedIds: Set<string>;
    onClose: () => void;
    onSelect: (id: string) => void;
    onFocus: (id: string) => void;
    onCreateNote?: () => void
}) {
    const links = useLinkActions();
    const [scope, setScope] = useState<'project' | 'global'>('project');
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [linkOpen, setLinkOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkError, setLinkError] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setQuery(search.trim()), 300);
        return () => clearTimeout(timer);
    }, [search]);
    const project = useResources({projectId, query}, scope === 'project');
    const global = useResources({query}, scope === 'global');
    const current = scope === 'project' ? project : global;
    const items = current.data?.pages.flatMap(page => page.data) ?? [];
    const createLink = async (event: FormEvent) => {
        event.preventDefault();
        setLinkError('');
        try {
            let url: URL;
            try { url = new URL(linkUrl.trim()); } catch { throw new Error('Ingresa una dirección web válida.'); }
            if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Ingresa una dirección HTTP o HTTPS.');
            const resource = await links.create.mutateAsync({url: url.href});
            onSelect(resource.id);
        } catch (error) {
            setLinkError(error instanceof Error ? error.message : 'No se pudo crear el enlace.');
        }
    };
    return <CanvasDialog titleId="resource-picker-title" onClose={onClose}
                         className="flex max-h-[80vh] max-w-xl flex-col">
        <div className="flex items-center justify-between"><h2 id="resource-picker-title"
                                                               className="font-semibold">Añadir recurso al mapa</h2>
            <Button onClick={onClose}>Cerrar</Button></div>
        {onCreateNote && <button type="button" onClick={onCreateNote} className="mt-4 flex min-h-12 items-center gap-3 rounded-lg bg-surface-variant/70 px-3 text-left text-sm hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary">
            <FileText size={18} aria-hidden="true"/><span className="flex-1">Crear nota de texto</span><Plus size={16} aria-hidden="true"/>
        </button>}
        <button type="button" onClick={() => setLinkOpen(value => !value)}
                className="mt-2 flex min-h-12 w-full items-center gap-3 rounded-lg bg-surface-variant/70 px-3 text-left text-sm hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary">
            <Link2 size={18} aria-hidden="true"/><span className="flex-1">Crear enlace web</span><Plus size={16} aria-hidden="true"/>
        </button>
        {linkOpen && <form onSubmit={event => void createLink(event)} className="mt-2 rounded-lg bg-surface-variant/40 p-3">
            <label className="block text-sm">Dirección web<input type="url" required autoFocus value={linkUrl}
                onChange={event => setLinkUrl(event.target.value)} placeholder="https://ejemplo.org"
                className="mt-1 w-full rounded-md bg-background px-3 py-2 focus-visible:outline-2 focus-visible:outline-primary"/></label>
            {linkError && <p role="alert" className="mt-2 text-xs text-red-500">{linkError}</p>}
            <div className="mt-2 flex justify-end gap-2"><Button type="button" onClick={() => setLinkOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="secondary" loading={links.create.isPending}>Guardar y añadir</Button></div>
        </form>}
        <label className="mt-4 text-sm">Buscar recurso<input autoFocus
                                                             className="mt-1 w-full rounded border border-border bg-background p-2"
                                                             value={search}
                                                             onChange={event => setSearch(event.target.value)}/></label>
        <div className="mt-3 flex gap-2"><Button variant={scope === 'project' ? 'secondary' : 'ghost'}
                                                 onClick={() => setScope('project')}>Proyecto</Button><Button
            variant={scope === 'global' ? 'secondary' : 'ghost'} onClick={() => setScope('global')}>Toda la
            Biblioteca</Button></div>
        <div className="mt-3 min-h-0 overflow-auto" aria-label="Resultados de recursos">{current.isPending &&
            <InlineLoading label="Buscando recursos…"/>}{current.isError && <p role="alert">No se pudieron cargar los
            recursos.</p>}{!current.isPending && !current.isError && items.length === 0 &&
            <p className="py-4 text-sm text-outline">No se encontraron recursos.</p>}{items.map(item => <div
            key={item.id} className="flex items-center gap-2 border-b border-border py-2">
            <div className="min-w-0 flex-1"><p className="truncate text-sm">{item.title}</p><p
                className="text-xs text-outline">{item.type === 'note' ? 'Nota' : item.type === 'link' ? 'Enlace' : 'Archivo'}{usedIds.has(item.id) ? ' · Ya representado' : ''}</p>
            </div>
            {usedIds.has(item.id) ? <><Button onClick={() => onFocus(item.id)}>Ir al uso</Button><Button
                    variant="outline" onClick={() => onSelect(item.id)}>Añadir otra</Button></> :
                <Button variant="primary" onClick={() => onSelect(item.id)}>Añadir</Button>}
        </div>)}{current.hasNextPage &&
            <Button className="mt-3" disabled={current.isFetchingNextPage} onClick={() => void current.fetchNextPage()}>Cargar
                más</Button>}</div>
    </CanvasDialog>;
}
