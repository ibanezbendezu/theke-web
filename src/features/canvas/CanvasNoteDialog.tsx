import {useState, type FormEvent} from 'react';
import {Button} from '../../components/ui/Button';
import type {NoteInput} from '../../data/useNotes';
import {CanvasDialog} from './CanvasDialog';

export function CanvasNoteDialog({initial, onClose, onSave}: {
    initial?: NoteInput;
    onClose: () => void;
    onSave: (value: NoteInput) => Promise<void>;
}) {
    const [title, setTitle] = useState(initial?.title ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [content, setContent] = useState(initial?.content ?? '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!title.trim()) {setError('Escribe un título para la nota.'); return;}
        setBusy(true);
        setError('');
        try {await onSave({title: title.trim(), description: description.trim(), content});}
        catch (cause) {setError(cause instanceof Error ? cause.message : 'No se pudo guardar la nota.');}
        finally {setBusy(false);}
    };
    return <CanvasDialog titleId="canvas-note-title" onClose={onClose} className="flex max-h-[min(84vh,800px)] max-w-2xl flex-col">
        <div className="mb-4 flex items-center justify-between gap-4"><h2 id="canvas-note-title" className="text-base font-semibold">{initial ? 'Editar nota' : 'Crear nota'}</h2>
            <Button type="button" onClick={onClose}>Cerrar</Button></div>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col gap-3">
            <label className="block text-xs font-medium text-outline">Título<input autoFocus maxLength={160} value={title} onChange={event => setTitle(event.target.value)}
                className="mt-1 w-full rounded-md border-0 bg-surface-variant px-3 py-2 text-base text-on-background focus-visible:outline-2 focus-visible:outline-primary"/></label>
            <label className="block text-xs font-medium text-outline">Descripción <span className="font-normal">(opcional)</span><input value={description} onChange={event => setDescription(event.target.value)}
                className="mt-1 w-full rounded-md border-0 bg-surface-variant px-3 py-2 text-sm text-on-background focus-visible:outline-2 focus-visible:outline-primary"/></label>
            <label className="flex min-h-0 flex-1 flex-col text-xs font-medium text-outline">Contenido<textarea value={content} onChange={event => setContent(event.target.value)}
                placeholder="Escribe o pega aquí el contenido de la nota…"
                className="mt-1 min-h-52 w-full flex-1 resize-none overflow-auto rounded-md border-0 bg-surface-variant px-3 py-3 text-sm leading-relaxed text-on-background focus-visible:outline-2 focus-visible:outline-primary"/></label>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2"><Button type="button" onClick={onClose}>Cancelar</Button><Button type="submit" variant="primary" loading={busy}>{initial ? 'Guardar cambios' : 'Crear y añadir al mapa'}</Button></div>
        </form>
    </CanvasDialog>;
}
