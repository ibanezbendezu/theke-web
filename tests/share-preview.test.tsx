import {act, cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {useCallback, useState} from 'react';
import {afterEach, expect, it, vi} from 'vitest';
import {SharePreviewDialog} from '../src/features/canvas/SharePreviewDialog';

const state = vi.hoisted(() => ({
    requested: vi.fn(), published: vi.fn(), comments: vi.fn(), updated: vi.fn(), revoked: vi.fn(),
    ready: true, activeShare: null as null | {active: true; url: string; fingerprint: string; revision: number; commentsEnabled: boolean}
}));
vi.mock('../src/features/canvas/CanvasDialog', () => ({
    CanvasDialog: ({children}: {children: React.ReactNode}) => <div role="dialog">{children}</div>
}));
vi.mock('../src/data/useShareManagement', () => ({
    useShareManagement: () => ({
        active: {data: state.activeShare, isPending: false, isError: false},
        comments: {isPending: false, isError: false, mutate: state.comments},
        update: {isPending: false, isError: false, mutate: state.updated},
        revoke: {isPending: false, isError: false, mutate: state.revoked},
        refresh: vi.fn()
    })
}));
vi.mock('../src/data/usePublishShare', () => ({
    usePublishShare: () => {
        const [data, setData] = useState<unknown>();
        return {data, isError: false, isPending: false, reset: () => setData(undefined),
            mutate: (body: unknown) => {
                state.published(body);
                setData({url: `/share/${'a'.repeat(43)}`});
            }};
    }
}));
vi.mock('../src/data/useSharePreview', () => ({
    useSharePreview: () => {
        const [data, setData] = useState<unknown>();
        const mutate = useCallback(() => {
            state.requested();
            setData({fingerprint: 'current-digest', ready: state.ready,
                resources: [{id: 'resource', title: 'Archivo de prueba'}],
                warnings: state.ready ? [] : [{resourceId: 'resource', field: 'accessibilityText', message: 'Falta descripción.'}]});
        }, []);
        return {data, isPending: false, isError: false, mutate};
    }
}));

afterEach(() => {cleanup(); vi.useRealTimers(); vi.clearAllMocks(); state.ready = true; state.activeShare = null;});

it('explica el alcance del enlace y permite crearlo desde la revisión guardada', async () => {
    render(<SharePreviewDialog diagramId="diagram-1" canPreview onClose={vi.fn()}/>);
    await waitFor(() => expect(state.requested).toHaveBeenCalledOnce());
    expect(screen.getByText(/los cambios que guardes/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Crear enlace'}));
    expect(state.published).toHaveBeenCalledWith({fingerprint: 'current-digest', idempotencyKey: expect.any(String)});
    expect(screen.getByRole('textbox', {name: 'Enlace para compartir'}))
        .toHaveValue(`${window.location.origin}/share/${'a'.repeat(43)}`);
});

it('espera el guardado y muestra las advertencias que bloquean el enlace', async () => {
    state.ready = false;
    const {rerender} = render(<SharePreviewDialog diagramId="diagram-1" canPreview={false} onClose={vi.fn()}/>);
    expect(screen.getByRole('button', {name: 'Crear enlace'})).toBeDisabled();
    rerender(<SharePreviewDialog diagramId="diagram-1" canPreview onClose={vi.fn()}/>);
    await waitFor(() => expect(screen.getByText(/Archivo de prueba: Falta descripción/)).toBeInTheDocument());
    expect(screen.getByRole('button', {name: 'Crear enlace'})).toBeDisabled();
});

it('mantiene el enlace, permite reintentar una proyección pendiente y confirmar la revocación', async () => {
    vi.useFakeTimers();
    state.activeShare = {active: true, url: `/share/${'a'.repeat(43)}`, fingerprint: 'previous-digest', revision: 3, commentsEnabled: true};
    render(<SharePreviewDialog diagramId="diagram-1" canPreview onClose={vi.fn()}/>);
    await act(async () => {});
    expect(state.requested).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', {name: 'Reintentar actualización'})).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(15_000));
    vi.useRealTimers();
    expect(screen.getByRole('button', {name: 'Reintentar actualización'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Reintentar actualización'}));
    expect(state.updated).toHaveBeenCalledWith({fingerprint: 'current-digest', expectedPublishedFingerprint: 'previous-digest'});
    fireEvent.click(screen.getByRole('checkbox', {name: 'Permitir comentarios'}));
    expect(state.comments).toHaveBeenCalledWith({enabled: false});
    fireEvent.click(screen.getByRole('button', {name: 'Opciones del enlace'}));
    fireEvent.click(screen.getByRole('button', {name: 'Dejar de compartir'}));
    fireEvent.click(screen.getByRole('button', {name: 'Confirmar'}));
    expect(state.revoked).toHaveBeenCalledWith({expectedPublishedFingerprint: 'previous-digest', confirmation: 'REVOCAR'}, expect.any(Object));
});
