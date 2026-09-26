import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RelationEditor } from '../src/features/canvas/RelationEditor';

const state = vi.hoisted(() => ({
  infer: vi.fn(), update: vi.fn(),
}));

vi.mock('../src/components/ai/AIGuidanceCard', () => ({
  AIGuidanceCard: ({ onExecute }: { onExecute: () => void }) => <button type="button" onClick={onExecute}>Solicitar sugerencia</button>,
}));
vi.mock('../src/data/useAi', () => ({ useRelationSuggestion: () => ({ mutateAsync: state.infer, isPending: false }) }));
vi.mock('../src/data/useResources', () => ({ useResources: () => ({ data: { pages: [] }, isError: false, hasNextPage: false }) }));
vi.mock('../src/data/useRelations', () => ({
  useRelation: () => ({ data: {
    id: 'relation-1', sourceResourceId: 'resource-1', targetResourceId: 'resource-2',
    source: { title: 'Origen' }, target: { title: 'Destino' }, direction: 'directed', typeKey: 'related_to',
    typeLabel: 'Relacionado', label: 'Etiqueta anterior', explanation: '', provenance: '',
    evidence: [], evidenceStatus: 'none', revision: 1, updatedAt: '2026-09-25T12:00:00Z',
  }, refetch: vi.fn(), isPending: false, isError: false }),
  useUpdateRelation: () => ({ update: state.update, queryKey: ['relation-1'] }),
}));

describe('decisión humana sobre sugerencias de IA', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });
  const suggestion = {
    sourceResourceId: 'resource-1', targetResourceId: 'resource-2',
    direction: 'directed', typeKey: 'related_to', label: 'Etiqueta propuesta',
    explanation: 'Interpretación', uncertainty: 'Podría ser parcial',
    evidence: [{ resourceId: 'resource-1', excerpt: 'Texto citado' }],
    provider: 'openai', model: 'gpt-5.6-terra', createdAt: '2026-09-25T12:00:00Z',
  };
  const show = () => render(<QueryClientProvider client={new QueryClient()}><RelationEditor relationId="relation-1" onClose={vi.fn()} /></QueryClientProvider>);

  it('descartar una sugerencia no altera la relación ni su borrador', async () => {
    state.infer.mockResolvedValue(suggestion);
    show();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar sugerencia' }));
    expect(await screen.findByText('Etiqueta: Etiqueta propuesta')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(screen.getByRole('textbox', { name: 'Etiqueta' })).toHaveValue('Etiqueta anterior');
    expect(state.update).not.toHaveBeenCalled();
  });

  it('aceptar requiere guardar manualmente para persistir y conservar procedencia', async () => {
    state.infer.mockResolvedValue(suggestion);
    state.update.mockResolvedValue({});
    show();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar sugerencia' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Editar y aceptar en borrador' }));
    expect(screen.getByRole('textbox', { name: 'Etiqueta' })).toHaveValue('Etiqueta propuesta');
    expect(state.update).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Relación' }));
    await waitFor(() => expect(state.update).toHaveBeenCalledWith(expect.objectContaining({
      label: 'Etiqueta propuesta',
      provenance: expect.stringContaining('openai/gpt-5.6-terra'),
      evidence: [expect.objectContaining({ resourceId: 'resource-1', excerpt: 'Texto citado' })],
    })));
  });
});