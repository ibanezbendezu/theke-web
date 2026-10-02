import {useEffect, useRef, useState} from 'react';
import {ApiError} from '../../api/httpClient';
import {type ImpactAction, type ImpactEntityType, useImpact, useImpactActions} from '../../data/useImpacts';
import {Button} from './Button';

export interface ImpactRequest {
    entityType: ImpactEntityType;
    id: string;
    action: ImpactAction
}

export function ImpactDialog({request, onClose, onDone, shadow = true}: {
    request: ImpactRequest;
    onClose: () => void;
    onDone: () => void;
    shadow?: boolean
}) {
    const [action, setAction] = useState(request.action);
    const [confirmation, setConfirmation] = useState('');
    const [message, setMessage] = useState('');
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocus = useRef<HTMLElement | null>(document.activeElement as HTMLElement | null);
    const closeRef = useRef(onClose);
    const idempotencyKey = useRef(crypto.randomUUID());
    const impact = useImpact(request.entityType, request.id, action);
    const actions = useImpactActions();
    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);
    useEffect(() => {
        const dialog = dialogRef.current;
        const restoreFocus = previousFocus.current;
        const focusable = () => [...(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)') ?? [])];
        focusable()[0]?.focus();
        const key = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeRef.current();
            if (event.key === 'Tab') {
                const values = focusable();
                if (!values.length) return;
                const first = values[0]!;
                const last = values.at(-1)!;
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };
        document.addEventListener('keydown', key);
        return () => {
            document.removeEventListener('keydown', key);
            restoreFocus?.focus();
        };
    }, []);
    const choose = (next: ImpactAction) => {
        setAction(next);
        setConfirmation('');
        setMessage('');
        idempotencyKey.current = crypto.randomUUID();
    };
    const confirm = async () => {
        if (!impact.data) return;
        try {
            await actions.execute.mutateAsync({
                entityType: request.entityType,
                id: request.id,
                action,
                impactVersion: impact.data.impactVersion,
                confirmation,
                idempotencyKey: idempotencyKey.current
            });
            onDone();
        } catch (error) {
            if (error instanceof ApiError && error.status === 409) {
                setConfirmation('');
                setMessage('El impacto cambió. Revisa el resumen actualizado y confirma nuevamente.');
                await impact.refetch();
            } else setMessage(error instanceof Error ? error.message : 'No se pudo completar la operación.');
        }
    };
    return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="impact-title"
             aria-describedby="impact-description"
             className={`max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-background p-5 ${shadow ? 'shadow-2xl' : ''}`}>
            <h2 id="impact-title"
                className="text-lg font-semibold">{action === 'delete' ? 'Eliminar' : 'Archivar'} {impact.data?.entityName ?? 'elemento'}</h2>{impact.isPending &&
            <p role="status" className="mt-4">Calculando impacto…</p>}{impact.isError &&
            <div role="alert" className="mt-4"><p>No se pudo calcular el impacto.</p><Button variant="outline"
                                                                                             onClick={() => impact.refetch()}>Reintentar</Button>
            </div>}{impact.data && <><p id="impact-description"
                                        className="mt-3 text-sm">Afecta {impact.data.affected.projects} proyecto(s), {impact.data.affected.folders} carpeta(s), {impact.data.affected.resources} recurso(s)
            y {impact.data.affected.placements} uso(s).</p>{impact.data.locations.length > 0 &&
            <ul className="mt-3 list-disc pl-5 text-sm">{impact.data.locations.map(location => <li
                key={location}>{location}</li>)}</ul>}
            <ul className="mt-3 list-disc pl-5 text-sm">{impact.data.consequences.map(value => <li
                key={value}>{value}</li>)}</ul>
            {action === 'delete' && !impact.data.deletionAllowed &&
                <div className="mt-4 rounded border border-amber-500 p-3"><strong>La eliminación está
                    bloqueada.</strong>{impact.data.recommendedAction === 'archive' &&
                    <Button className="mt-2 block" variant="outline" onClick={() => choose('archive')}>Archivar en su
                        lugar</Button>}</div>} {(action !== 'delete' || impact.data.deletionAllowed) && <label
                className="mt-4 block text-sm font-medium">Escribe <strong>{impact.data.confirmationPhrase}</strong> para
                confirmar<input
                    className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
                    value={confirmation}
                    onChange={event => setConfirmation(event.target.value)}/></label>}</>}{message &&
            <p role="alert" className="mt-3 text-red-600">{message}</p>}
            <div className="mt-5 flex justify-end gap-2"><Button
                onClick={onClose}>Cancelar</Button>{impact.data && (action !== 'delete' || impact.data.deletionAllowed) &&
                <Button variant="primary"
                        disabled={confirmation !== impact.data.confirmationPhrase || actions.execute.isPending}
                        onClick={() => void confirm()}>{actions.execute.isPending ? 'Procesando…' : action === 'delete' ? 'Eliminar' : 'Archivar'}</Button>}
            </div>
        </div>
    </div>;
}
