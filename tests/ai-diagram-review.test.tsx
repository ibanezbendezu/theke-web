import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { DiagramEditor } from '../src/pages/DiagramEditor';

const state = vi.hoisted(() => ({
  prepare: vi.fn(), setInspectorOpen: vi.fn(), focusNode: vi.fn(), readComment: vi.fn(), search: '',
  linked: {id: 'notice-old', commentId: 'old', diagramId: 'diagram-1', projectId: 'project-1', diagramName: 'Mi diagrama',
    displayName: 'Ana', content: 'Comentario fuera de la primera página', anchor: {x: 42, y: 80, type: 'diagram'},
    createdAt: '2026-11-26T00:00:00Z', readAt: null, resolvedAt: null, anchored: true},
}));
vi.mock('react-router-dom', () => ({ useParams: () => ({ diagramId: 'diagram-1', projectId: 'project-1' }), useNavigate: () => vi.fn(), useLocation: () => ({pathname: '/projects/project-1/diagrams/diagram-1', search: state.search}) }));
vi.mock('../src/data/useCommentNotifications', () => ({
  useCommentNotifications: (_page: number, _filter: string, _diagram: string, commentId?: string) =>
    ({data: {items: commentId === state.linked.commentId ? [state.linked] : [], unreadCount: 0}}),
  useCommentNotificationStream: () => undefined,
  useReadCommentNotification: () => ({mutate: state.readComment}),
  useModerateCommentNotification: () => ({isPending: false}),
}));
vi.mock('../src/data/useDiagrams', () => ({ useDiagram: () => ({ data: { id: 'diagram-1', name: 'Mi diagrama', projectId: 'project-1', archivedAt: null, document: { nodes: [] } }, isPending: false, isError: false, isFetchedAfterMount: true, refetch: vi.fn() }) }));
vi.mock('../src/data/useOrganization', () => ({ useOrganizationActions: () => ({ addResources: { mutateAsync: vi.fn() } }) }));
vi.mock('../src/data/useNotes', () => ({ useNoteActions: () => ({ create: { mutateAsync: vi.fn(), isPending: false } }) }));
vi.mock('../src/data/useAi', () => ({ usePrepareDiagramReview: () => ({ mutate: state.prepare, isPending: false }) }));
vi.mock('../src/components/ai/AIGuidanceCard', () => ({ AIGuidanceCard: ({ selectedResourceIds }: { selectedResourceIds: string[] }) => <p>Tarjeta: {selectedResourceIds.join(',')}</p> }));
vi.mock('../src/store/useCanvasStore', () => ({ useCanvasStore: (selector: (store: object) => unknown) => selector({ nodes: [{ id: 'saved-node', selected: true, type: 'resource', data: { resourceId: 'res-1' } }], edges: [], inspectorOpen: false, setInspectorOpen: state.setInspectorOpen }), }));
vi.mock('../src/features/canvas/useCanvasUploadBatches', () => ({ useCanvasUploadBatches: () => ({ batches: [], addFiles: vi.fn() }) }));
vi.mock('../src/pages/DiagramWorkspace', () => ({ DiagramWorkspace: ({commentNotifications, selectedCommentId}: {
  commentNotifications: {commentId: string; anchor: {x: number; y: number}}[]; selectedCommentId?: string
}) => {
  const marker = commentNotifications.find(item => item.commentId === selectedCommentId);
  return <div>Lienzo manual{marker && <output aria-label="Punto recibido por el lienzo">{marker.anchor.x}, {marker.anchor.y}</output>}</div>;
} }));
vi.mock('../src/features/canvas/CanvasResourceBrowser', () => ({ CanvasResourcePanel: () => <p>Panel de recursos</p> }));
vi.mock('../src/features/canvas/CanvasUploadTray', () => ({ CanvasUploadTray: () => null }));
vi.mock('../src/components/ui/ThemeToggle', () => ({ ThemeToggle: () => <button type="button">Tema claro</button> }));
vi.mock('../src/features/canvas/CanvasDialog', () => ({ CanvasDialog: ({ children }: { children: React.ReactNode }) => <div role="dialog">{children}</div> }));

beforeEach(() => { window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() }); });
afterEach(() => { cleanup(); vi.clearAllMocks(); state.search = ''; });

it('prepara revisión sin hallazgos y permite seguir con el lienzo manual', async () => {
  state.prepare.mockImplementation((_input, options) => options.onSuccess({ resourceIds: ['res-1'], excluded: [{ nodeId: 'folder', reason: 'Sin texto accesible.' }], limitations: ['Límite de formato.'], available: false, reason: 'PROVIDER_PENDING' }));
  render(<DiagramEditor />);
  state.setInspectorOpen.mockClear(); // The editor closes its inspector on entry.
  fireEvent.click(screen.getByRole('button', { name: 'Revisar alcance de IA' }));
  fireEvent.click(screen.getByRole('button', { name: 'Preparar alcance guardado' }));
  await waitFor(() => expect(screen.getByText(/Proveedor pendiente: 1 recursos elegibles/)).toBeInTheDocument());
  expect(screen.getByText(/folder: Sin texto accesible/)).toBeInTheDocument();
  expect(screen.getByText('Tarjeta: res-1')).toBeInTheDocument();
  expect(state.prepare).toHaveBeenCalledWith({ diagramId: 'diagram-1' }, expect.any(Object));
  fireEvent.click(screen.getByRole('button', { name: 'Seguir explorando manualmente' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByText('Lienzo manual')).toBeInTheDocument();
  expect(state.setInspectorOpen).not.toHaveBeenCalled();
});

it('un fallo en la preparación no cambia el Diagrama', async () => {
  state.prepare.mockImplementation((_input, options) => options.onError(new Error('failed')));
  render(<DiagramEditor />);
  fireEvent.click(screen.getByRole('button', { name: 'Revisar alcance de IA' }));
  fireEvent.click(screen.getByRole('button', { name: 'Preparar alcance guardado' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo revisar el alcance');
  expect(screen.getByText('Lienzo manual')).toBeInTheDocument();
});

it('muestra el lienzo sin barra superior ni panel izquierdo permanente', () => {
  render(<DiagramEditor />);
  expect(screen.getByText('Lienzo manual')).toBeInTheDocument();
  expect(screen.queryByText('Panel de recursos')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Mostrar recursos' }));
  expect(screen.getByLabelText('Panel de recursos')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar panel' }));
  expect(screen.queryByText('Panel de recursos')).not.toBeInTheDocument();
});

it('muestra el control de tema dentro de las opciones del mapa', () => {
  render(<DiagramEditor />);
  expect(screen.queryByRole('button', { name: 'Tema claro' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Opciones del mapa' }));
  expect(screen.getByRole('button', { name: 'Tema claro' })).toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('button', { name: 'Tema claro' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Opciones del mapa' })).toHaveFocus();
});

it('localiza un comentario fuera de la primera página y marca el aviso como leído', () => {
  const {rerender} = render(<DiagramEditor />);
  state.search = '?comment=old';
  rerender(<DiagramEditor />);
  expect(screen.getByLabelText('Punto recibido por el lienzo')).toHaveTextContent('42, 80');
  const row = screen.getByRole('button', {name: /Comentario fuera de la primera página/});
  expect(row).toHaveAttribute('aria-current', 'true');
  expect(row).toHaveFocus();
  expect(state.readComment).toHaveBeenCalledExactlyOnceWith('notice-old');
  const filter = screen.getByRole('button', {name: 'Pendientes'});
  filter.focus();
  rerender(<DiagramEditor />);
  expect(filter).toHaveFocus();
  expect(state.readComment).toHaveBeenCalledTimes(1);
});
