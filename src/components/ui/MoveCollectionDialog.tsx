import { useState } from 'react';
import { Folder } from 'lucide-react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { type CollectionFolderNode, folderTrail, isFolderDescendant } from '../../lib/collectionFolders';

interface Props {
  name: string;
  folders: CollectionFolderNode[];
  currentParentId: string | null;
  movingFolderId?: string;
  onMove: (parentFolderId: string | null) => Promise<unknown>;
  onClose: () => void;
}

export function MoveCollectionDialog({ name, folders, currentParentId, movingFolderId, onMove, onClose }: Props) {
  const [destination, setDestination] = useState<string | null>(currentParentId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const choices = folders
    .filter(folder => !movingFolderId || !isFolderDescendant(folders, folder.id, movingFolderId))
    .map(folder => ({ id: folder.id, label: folderTrail(folders, folder.id).map(item => item.name).join(' / ') }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const save = async () => {
    setBusy(true); setError('');
    try { await onMove(destination); onClose(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo mover.'); }
    finally { setBusy(false); }
  };

  return <Dialog titleId="move-collection-title" onClose={onClose} className="max-w-md">
    <h2 id="move-collection-title" className="text-lg font-semibold">Mover {name}</h2>
    <p className="mt-1 text-sm text-outline">Elige una carpeta de destino.</p>
    <div className="mt-4 max-h-72 space-y-0.5 overflow-y-auto" role="group" aria-label="Carpeta de destino">
      {[{ id: null, label: 'Raíz' }, ...choices].map(choice => <button key={choice.id ?? 'root'} type="button" aria-pressed={destination === choice.id} className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary ${destination === choice.id ? 'bg-surface-variant font-medium' : ''}`} onClick={() => setDestination(choice.id)}><Folder size={16} className="shrink-0 text-outline"/><span className="truncate">{choice.label}</span></button>)}
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
    <div className="mt-5 flex justify-end gap-2"><Button onClick={onClose}>Cancelar</Button><Button variant="primary" disabled={busy || destination === currentParentId} onClick={() => void save()}>{busy ? 'Moviendo…' : 'Mover'}</Button></div>
  </Dialog>;
}
