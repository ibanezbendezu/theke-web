import { Button } from '../../components/ui/Button';
import type { CanvasUploadBatch } from './useCanvasUploadBatches';

const labels: Record<string, string> = { waiting: 'Preparando', initiated: 'Pendiente', uploading: 'Transfiriendo', finalizing: 'Confirmando', uploaded: 'En cola', scanning: 'Analizando', ready: 'Listo', rejected: 'Rechazado', failed: 'Falló', cancelled: 'Cancelado' };
export function CanvasUploadTray({ batches, retry, undo, createGroup }: { batches: CanvasUploadBatch[]; retry: (batchId: string, entryId: string) => void; undo: (batchId: string) => void; createGroup: (batchId: string) => void }) {
  if (!batches.length) return null;
  return <aside aria-label="Cargas del canvas" className="fixed bottom-4 right-4 z-50 max-h-[45vh] w-80 overflow-auto rounded-lg bg-surface/95 p-3 backdrop-blur-md">
    <h2 className="text-sm font-semibold">Archivos del canvas</h2>
    {batches.map(batch => <section key={batch.id} className="mt-3 border-t border-border pt-2">
      <div className="flex items-center justify-between gap-2"><span className="text-xs text-outline">Lote de {batch.entries.length} archivo(s)</span>{!batch.undone && batch.nodeIds.length > 0 && <Button size="sm" onClick={() => undo(batch.id)}>Deshacer incorporación</Button>}</div>
      {!batch.undone && batch.nodeIds.length >= 2 && !batch.groupId && <Button className="mt-2" size="sm" onClick={() => createGroup(batch.id)}>Crear grupo visual</Button>}
      {batch.groupId && <p className="text-xs text-outline">Grupo visual creado.</p>}
      {batch.undone && <p className="text-xs text-outline">Representaciones retiradas. Los Recursos permanecen en la Biblioteca.</p>}
      {batch.entries.map(entry => <div key={entry.id} className="mt-2 text-xs"><div className="flex items-center gap-1"><span className="min-w-0 flex-1 truncate">{entry.file.name}</span><span>{labels[entry.status] ?? entry.status}</span>{['failed', 'rejected'].includes(entry.status) && <Button size="sm" onClick={() => retry(batch.id, entry.id)}>Reintentar</Button>}</div><progress className="mt-1 w-full" max={100} value={entry.progress} aria-label={`Progreso de ${entry.file.name}`} />{entry.error && <p role="alert" className="text-red-600">{entry.error}</p>}</div>)}
    </section>)}
  </aside>;
}
