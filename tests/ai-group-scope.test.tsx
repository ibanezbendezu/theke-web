import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { CanvasGroupInspector } from '../src/features/canvas/CanvasGroupInspector';

const state = vi.hoisted(() => ({ prepare: vi.fn(), updateNodeData: vi.fn(), moveNodeToGroup: vi.fn(), ungroupNode: vi.fn() }));
vi.mock('../src/data/useAi', () => ({ usePrepareGroupGuidance: () => ({ mutate: state.prepare, isPending: false }) }));
vi.mock('../src/components/ai/AIGuidanceCard', () => ({ AIGuidanceCard: ({ selectedResourceIds }: { selectedResourceIds: string[] }) => <div>Tarjeta: {selectedResourceIds.join(',')}</div> }));
vi.mock('../src/store/useCanvasStore', () => ({ useCanvasStore: (selector: (store: object) => unknown) => selector({ nodes: [{ id: 'group-1', type: 'container', data: { label: 'Grupo' } }], updateNodeData: state.updateNodeData, moveNodeToGroup: state.moveNodeToGroup, ungroupNode: state.ungroupNode }) }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('muestra exclusiones y proveedor pendiente sin mutar el grupo', async () => {
  state.prepare.mockImplementation((_input, options) => options.onSuccess({ resourceIds: ['res-1'], excluded: [{ nodeId: 'folder-1', reason: 'Sin texto.' }], limitations: ['Formato no analizable.'], available: false, reason: 'PROVIDER_PENDING' }));
  render(<CanvasGroupInspector groupId="group-1" diagramId="diagram-1" />);
  fireEvent.click(screen.getByRole('button', { name: 'Revisar alcance guardado' }));
  await waitFor(() => expect(screen.getByText(/Integración de IA pendiente/)).toBeInTheDocument());
  expect(screen.getByText(/folder-1: Sin texto/)).toBeInTheDocument();
  expect(screen.getByText('Tarjeta: res-1')).toBeInTheDocument();
  expect(state.prepare).toHaveBeenCalledWith({ diagramId: 'diagram-1', groupId: 'group-1' }, expect.any(Object));
  expect(state.updateNodeData).not.toHaveBeenCalled();
  expect(state.moveNodeToGroup).not.toHaveBeenCalled();
});