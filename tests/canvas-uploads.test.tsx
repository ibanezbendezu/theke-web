import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CanvasUploadTray } from '../src/features/canvas/CanvasUploadTray';
import { useCanvasUploadBatches } from '../src/features/canvas/useCanvasUploadBatches';
import { useCanvasStore } from '../src/store/useCanvasStore';

const state = vi.hoisted(() => ({ remote: [] as Array<{ id: string; resourceId: string; status: string; failureReason: string | null }>, create: vi.fn(), finalize: vi.fn() }));
vi.mock('../src/data/useUploads', () => ({ useUploads: () => ({ uploads: { data: state.remote }, policy: { data: { maxBatchSize: 20, maxFileSize: 1_000_000, allowedMediaTypes: ['text/plain'] } }, create: state.create, finalize: state.finalize }) }));
vi.mock('../src/data/useOrganization', () => ({ useOrganizationActions: () => ({ addResources: { mutateAsync: vi.fn().mockResolvedValue(undefined) } }) }));
vi.mock('../src/data/uploadTransfer', () => ({ transferUpload: vi.fn().mockResolvedValue(undefined) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); state.remote = []; });

function Harness() { const uploads = useCanvasUploadBatches('project-one'); return <><button onClick={() => uploads.addFiles([new File(['a'], 'one.txt', { type: 'text/plain' }), new File(['b'], 'two.txt', { type: 'text/plain' })], { x: 50, y: 50 })}>Iniciar</button><CanvasUploadTray batches={uploads.batches} retry={uploads.retry} undo={uploads.undo} createGroup={uploads.createGroup} /></>; }

describe('carga desde el canvas', () => {
  it('representa éxitos, permite reintentar fallos y deshace solo los nodos', async () => {
    useCanvasStore.setState({ nodes: [], edges: [] }); let secondAttempt = 0;
    state.create.mockImplementation(async (file: File) => ({ id: file.name === 'one.txt' ? 'upload-one' : `upload-two-${++secondAttempt}`, resourceId: file.name === 'one.txt' ? 'resource-one' : 'resource-two', uploadUrl: 'https://example.invalid/upload' }));
    state.finalize.mockResolvedValue({});
    const view = render(<Harness />); fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    await waitFor(() => expect(state.finalize).toHaveBeenCalledTimes(2));
    state.remote = [{ id: 'upload-one', resourceId: 'resource-one', status: 'ready', failureReason: null }, { id: 'upload-two-1', resourceId: 'resource-two', status: 'failed', failureReason: 'Error de análisis' }]; view.rerender(<Harness />);
    await waitFor(() => expect(useCanvasStore.getState().nodes.filter(node => node.type === 'resource')).toHaveLength(1));
    expect(screen.getByText('Error de análisis')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' })); await waitFor(() => expect(state.finalize).toHaveBeenCalledTimes(3));
    state.remote = [{ id: 'upload-one', resourceId: 'resource-one', status: 'ready', failureReason: null }, { id: 'upload-two-2', resourceId: 'resource-two', status: 'ready', failureReason: null }]; view.rerender(<Harness />);
    await waitFor(() => expect(useCanvasStore.getState().nodes.filter(node => node.type === 'resource')).toHaveLength(2));
    expect(useCanvasStore.getState().edges).toHaveLength(0);
    expect(useCanvasStore.getState().nodes.filter(node => node.type === 'container')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Crear grupo visual' }));
    expect(useCanvasStore.getState().nodes.filter(node => node.type === 'container')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Deshacer incorporación' }));
    expect(useCanvasStore.getState().nodes).toHaveLength(0);
    expect(screen.getByText(/Recursos permanecen en la Biblioteca/)).toBeInTheDocument();
  });
});
