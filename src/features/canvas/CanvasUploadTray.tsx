import {useEffect, useRef, useState} from 'react';
import {Button} from '../../components/ui/Button';
import {FileUp, X} from 'lucide-react';
import type {CanvasUploadBatch} from './useCanvasUploadBatches';

const labels: Record<string, string> = {
    waiting: 'Preparando',
    initiated: 'Pendiente',
    uploading: 'Transfiriendo',
    finalizing: 'Confirmando',
    uploaded: 'En cola',
    scanning: 'Analizando',
    ready: 'Listo',
    rejected: 'Rechazado',
    failed: 'Falló',
    cancelled: 'Cancelado'
};

export function CanvasUploadTray({batches, retry, undo, createGroup}: {
    batches: CanvasUploadBatch[];
    retry: (batchId: string, entryId: string) => void;
    undo: (batchId: string) => void;
    createGroup: (batchId: string) => void
}) {
    const [collapsed, setCollapsed] = useState(false);
    const seenBatches = useRef(new Set<string>());
    useEffect(() => {
        const newBatch = batches.some(batch => !seenBatches.current.has(batch.id));
        batches.forEach(batch => seenBatches.current.add(batch.id));
        if (newBatch) setCollapsed(false);
    }, [batches]);
    if (!batches.length) return null;
    const activeCount = batches.flatMap(batch => batch.entries).filter(entry => !['ready', 'failed', 'rejected', 'cancelled'].includes(entry.status)).length;
    if (collapsed) return <div className="absolute bottom-[4.5rem] right-3 z-30 rounded-lg bg-surface/90 p-1 backdrop-blur-md lg:bottom-3 lg:right-[10rem]">
        <Button variant="ghost" size="icon" icon={FileUp} aria-label="Mostrar progreso de carga"
                title={activeCount ? `Mostrar cargas · ${activeCount} activas` : 'Mostrar cargas'}
                onClick={() => setCollapsed(false)} className="h-11 w-11 shrink-0"/>
    </div>;
    return <aside aria-label="Cargas del canvas"
                  className="absolute bottom-[4.5rem] right-3 z-30 max-h-[45vh] w-[min(20rem,calc(100%-1.5rem))] overflow-auto rounded-lg bg-surface/95 p-3 backdrop-blur-md">
        <header className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">Archivos del canvas</h2>
            <button type="button" onClick={() => setCollapsed(true)} aria-label="Cerrar aviso de carga" title="Cerrar aviso de carga"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-outline hover:bg-surface-variant hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary"><X size={16}/></button>
        </header>
        {batches.map(batch => <section key={batch.id} className="mt-3 border-t border-border pt-2">
            <div className="flex items-center justify-between gap-2"><span
                className="text-xs text-outline">Lote de {batch.entries.length} archivo(s)</span>{!batch.undone && batch.nodeIds.length > 0 &&
                <Button size="sm" onClick={() => undo(batch.id)}>Deshacer incorporación</Button>}</div>
            {!batch.undone && batch.nodeIds.length >= 2 && !batch.groupId &&
                <Button className="mt-2" size="sm" onClick={() => createGroup(batch.id)}>Crear grupo visual</Button>}
            {batch.groupId && <p className="text-xs text-outline">Grupo visual creado.</p>}
            {batch.undone &&
                <p className="text-xs text-outline">Representaciones retiradas. Los Recursos permanecen en la
                    Biblioteca.</p>}
            {batch.entries.map(entry => <div key={entry.id} className="mt-2 text-xs">
                <div className="flex items-center gap-1"><span
                    className="min-w-0 flex-1 truncate">{entry.file.name}</span><span>{labels[entry.status] ?? entry.status}</span>{['failed', 'rejected'].includes(entry.status) &&
                    <Button size="sm" onClick={() => retry(batch.id, entry.id)}>Reintentar</Button>}</div>
                <progress className="theke-progress mt-1 w-full" max={100}
                          value={['uploading', 'ready', 'failed', 'rejected', 'cancelled'].includes(entry.status) ? entry.progress : undefined}
                          aria-label={`Progreso de ${entry.file.name}`}/>
                {entry.error && <p role="alert" className="text-red-600">{entry.error}</p>}</div>)}
        </section>)}
    </aside>;
}
