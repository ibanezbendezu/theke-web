import {useEffect, useState} from 'react';
import type {DragEvent} from 'react';
import {FileText, Folder, Plus} from 'lucide-react';
import {Button} from '../../components/ui/Button';
import {CollectionItem} from '../../components/ui/CollectionItem';
import {NameDialog} from '../../components/ui/NameDialog';
import {ImpactDialog} from '../../components/ui/ImpactDialog';
import {useToast} from '../../components/ui/useToast';
import {useOrganization, useOrganizationActions} from '../../data/useOrganization';
import {useResources} from '../../data/useResources';
import {CanvasDialog} from './CanvasDialog';

export function CanvasResourcePanel({projectId, onAdd, onSelect, onSelectFolder}: {
    projectId: string;
    onAdd: () => void;
    onSelect: (id: string) => void;
    onSelectFolder: (id: string) => void
}) {
    const organization = useOrganization(projectId);
    const actions = useOrganizationActions(projectId);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [folderDialog, setFolderDialog] = useState(false);
    const [renamingFolder, setRenamingFolder] = useState<{ id: string; name: string } | null>(null);
    const [archivingFolder, setArchivingFolder] = useState<string | null>(null);
    const toast = useToast();
    const folders = organization.data?.folders.filter(item => !item.archivedAt) ?? [];
    const resources = organization.data?.resources.filter(item => !item.archivedAt && item.folderId === selectedFolder) ?? [];
    const move = async (resourceId: string, folderId: string | null) => {
        try {
            await actions.moveResources.mutateAsync({resourceIds: [resourceId], folderId});
            toast.success('Recurso movido.');
        } catch {
            toast.error('No se pudo mover el recurso.');
        }
    };
    const drop = (event: DragEvent<HTMLElement>, folderId: string | null) => {
        event.preventDefault();
        const resourceId = event.dataTransfer.getData('application/x-theke-resource');
        if (resourceId) void move(resourceId, folderId);
    };
    return <aside className="h-full w-full overflow-auto p-4" aria-label="Recursos">
        <div className="flex items-center justify-between pr-10"><h2 className="text-sm font-semibold">Recursos</h2>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-md hover:bg-surface-variant"
                    aria-label="Crear carpeta" title="Crear carpeta" onClick={() => setFolderDialog(true)}><Plus
                size={16}/></button>
        </div>
        <Button variant="secondary" className="mt-3 w-full" onClick={onAdd}>Añadir recurso</Button>
        {organization.isPending && <p role="status" className="mt-3 text-xs">Cargando recursos…</p>}
        {organization.isError && <p role="alert" className="mt-3 text-xs">No se pudieron cargar los recursos.</p>}
        {selectedFolder && <button type="button" className="mt-3 text-xs text-outline hover:underline"
                                   onClick={() => setSelectedFolder(null)} onDragOver={event => event.preventDefault()}
                                   onDrop={event => drop(event, null)}>← Todos los recursos</button>}
        {folders.length > 0 &&
            <div className="mt-4 space-y-1">{folders.map(folder => <CollectionItem key={folder.id} view="list"
                                                                                   title={folder.name}
                                                                                   icon={<Folder size={16}/>}
                                                                                   onOpen={() => setSelectedFolder(folder.id)}
                                                                                   onDragOver={event => event.preventDefault()}
                                                                                   onDrop={event => drop(event, folder.id)}
                                                                                   actions={[{
                                                                                       label: 'Abrir carpeta',
                                                                                       onSelect: () => setSelectedFolder(folder.id)
                                                                                   }, {
                                                                                       label: 'Representar en mapa',
                                                                                       onSelect: () => onSelectFolder(folder.id)
                                                                                   }, {
                                                                                       label: 'Renombrar',
                                                                                       onSelect: () => setRenamingFolder({
                                                                                           id: folder.id,
                                                                                           name: folder.name
                                                                                       })
                                                                                   }, {
                                                                                       label: 'Archivar',
                                                                                       onSelect: () => setArchivingFolder(folder.id)
                                                                                   }]}/>)}</div>}
        {resources.length > 0 ?
            <div className="mt-4 space-y-1">{resources.map(item => <CollectionItem key={item.resourceId} view="list"
                                                                                   title={item.title}
                                                                                   icon={<FileText size={16}/>}
                                                                                   onOpen={() => onSelect(item.resourceId)}
                                                                                   onDragStart={event => {
                                                                                       event.dataTransfer.setData('application/x-theke-resource', item.resourceId);
                                                                                       event.dataTransfer.effectAllowed = 'copyMove';
                                                                                   }} actions={[{
                label: 'Añadir al mapa',
                onSelect: () => onSelect(item.resourceId)
            }, ...folders.map(folder => ({
                label: `Mover a ${folder.name}`,
                onSelect: () => void move(item.resourceId, folder.id)
            })), ...(item.folderId ? [{
                label: 'Mover a la raíz',
                onSelect: () => void move(item.resourceId, null)
            }] : [])]}/>)}</div> : !organization.isPending &&
            <p className="mt-4 text-xs text-outline">{selectedFolder ? 'Esta carpeta está vacía.' : 'Aún no hay recursos en este mapa.'}</p>}
        {folderDialog && <NameDialog title="Crear carpeta" onClose={() => setFolderDialog(false)}
                                     onSave={name => actions.createFolder.mutateAsync(name).then(() => undefined)}
                                     shadow={false}/>}
        {renamingFolder && <NameDialog title="Renombrar carpeta" initialValue={renamingFolder.name}
                                       onClose={() => setRenamingFolder(null)}
                                       onSave={name => actions.renameFolder.mutateAsync({
                                           id: renamingFolder.id,
                                           name
                                       }).then(() => undefined)} shadow={false}/>}
        {archivingFolder && <ImpactDialog request={{entityType: 'folder', id: archivingFolder, action: 'archive'}}
                                          onClose={() => setArchivingFolder(null)} onDone={() => {
            if (selectedFolder === archivingFolder) setSelectedFolder(null);
            setArchivingFolder(null);
        }} shadow={false}/>}
    </aside>;
}

export function CanvasResourcePicker({projectId, usedIds, onClose, onSelect, onFocus}: {
    projectId: string;
    usedIds: Set<string>;
    onClose: () => void;
    onSelect: (id: string) => void;
    onFocus: (id: string) => void
}) {
    const [scope, setScope] = useState<'project' | 'global'>('project');
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setQuery(search.trim()), 300);
        return () => clearTimeout(timer);
    }, [search]);
    const project = useResources({projectId, query}, scope === 'project');
    const global = useResources({query}, scope === 'global');
    const current = scope === 'project' ? project : global;
    const items = current.data?.pages.flatMap(page => page.data) ?? [];
    return <CanvasDialog titleId="resource-picker-title" onClose={onClose}
                         className="flex max-h-[80vh] max-w-xl flex-col">
        <div className="flex items-center justify-between"><h2 id="resource-picker-title"
                                                               className="font-semibold">Añadir recurso al canvas</h2>
            <Button onClick={onClose}>Cerrar</Button></div>
        <label className="mt-4 text-sm">Buscar recurso<input autoFocus
                                                             className="mt-1 w-full rounded border border-border bg-background p-2"
                                                             value={search}
                                                             onChange={event => setSearch(event.target.value)}/></label>
        <div className="mt-3 flex gap-2"><Button variant={scope === 'project' ? 'secondary' : 'ghost'}
                                                 onClick={() => setScope('project')}>Proyecto</Button><Button
            variant={scope === 'global' ? 'secondary' : 'ghost'} onClick={() => setScope('global')}>Toda la
            Biblioteca</Button></div>
        <div className="mt-3 min-h-0 overflow-auto" aria-label="Resultados de recursos">{current.isPending &&
            <p role="status">Buscando…</p>}{current.isError && <p role="alert">No se pudieron cargar los
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
