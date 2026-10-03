import {useState} from 'react';
import {Button} from './Button';
import {Dialog} from './Dialog';
import {Input} from './Input';

export function NameDialog({title, initialValue = '', onClose, onSave, shadow = true}: {
    title: string;
    initialValue?: string;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
    shadow?: boolean
}) {
    const [name, setName] = useState(initialValue);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        const value = name.trim();
        if (!value || value.length > 120) {
            setError('Usa entre 1 y 120 caracteres.');
            return;
        }
        setBusy(true);
        try {
            await onSave(value);
            onClose();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'No se pudo guardar.');
        } finally {
            setBusy(false);
        }
    };
    return <Dialog titleId="name-dialog-title" onClose={onClose} className="max-w-md" shadow={shadow}><h2
        id="name-dialog-title" className="text-lg font-semibold">{title}</h2>
        <form className="mt-4" onSubmit={save}><Input autoFocus icon={undefined} aria-label="Nombre" value={name}
                                                      maxLength={121}
                                                      onChange={event => setName(event.target.value)}/>{error &&
            <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-2"><Button type="button"
                                                                 onClick={onClose}>Cancelar</Button><Button
                type="submit" variant="secondary" loading={busy}>{busy ? 'Guardando…' : 'Guardar'}</Button></div>
        </form>
    </Dialog>;
}

export function ConfirmDialog({title, description, onClose, onConfirm}: {
    title: string;
    description: string;
    onClose: () => void;
    onConfirm: () => Promise<void>
}) {
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const confirm = async () => {
        setBusy(true);
        try {
            await onConfirm();
            onClose();
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'No se pudo completar.');
        } finally {
            setBusy(false);
        }
    };
    return <Dialog titleId="confirm-dialog-title" onClose={onClose} className="max-w-md"><h2 id="confirm-dialog-title"
                                                                                             className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-outline">{description}</p>{error &&
            <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2"><Button onClick={onClose}>Cancelar</Button><Button
            variant="secondary" loading={busy}
            onClick={() => void confirm()}>{busy ? 'Procesando…' : 'Confirmar'}</Button></div>
    </Dialog>;
}
