import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Library } from '../src/pages/Library';

const resourceState = vi.hoisted(() => ({ detail: undefined as Record<string, unknown> | undefined }));

vi.mock('../src/data/useNotes', () => ({
  useNotes: () => ({ data: { pages: [{ data: [], meta: { nextCursor: null } }] }, isPending: false, isError: false, hasNextPage: false }),
  useNote: () => ({ isPending: false }),
  useNoteActions: () => ({ create: { mutateAsync: vi.fn(), isPending: false }, update: { mutateAsync: vi.fn(), isPending: false } }),
}));
vi.mock('../src/data/useUploads', () => ({
  useUploads: () => ({ uploads: {}, policy: { data: { maxBatchSize: 20, maxFileSize: 262144000, allowedMediaTypes: ['text/plain'] } }, create: vi.fn(() => new Promise(() => undefined)), finalize: vi.fn(), cancel: vi.fn() }),
}));
vi.mock('../src/data/useResources', () => ({
  useResources: () => ({ data: { pages: [{ data: [], meta: { nextCursor: null } }] }, isPending: false, isFetching: false, isError: false, hasNextPage: false }),
  useResource: () => ({ data: resourceState.detail, isPending: false, isError: false }),
  useResourceKnowledge: () => ({ references: { data: { outgoing: [], incoming: [] }, isPending: false }, definitions: { data: [], isPending: false }, save: { mutateAsync: vi.fn(), isPending: false } }),
  useResourceAccess: () => ({ data: { url: 'https://example.test/preview' }, isPending: false, isError: false }),
  useResourceActions: () => ({ access: vi.fn().mockResolvedValue({ url: 'https://example.test/file' }), accessibility: { mutateAsync: vi.fn(), isPending: false } }),
  useLinkActions: () => ({ create: { mutateAsync: vi.fn(), isPending: false }, update: { mutateAsync: vi.fn(), isPending: false }, retry: { mutateAsync: vi.fn(), isPending: false } }),
}));
vi.mock('../src/data/useProjects', () => ({ useProjects: () => ({ data: { pages: [{ data: [{ id: 'project-1', name: 'Proyecto uno' }] }] } }) }));
vi.mock('../src/data/useOrganization', () => ({ useOrganization: () => ({ data: { folders: [{ id: 'folder-1', name: 'Carpeta uno', archivedAt: null }], resources: [] }, isPending: false }) }));
vi.mock('../src/data/useImpacts', () => ({ useImpact: () => ({ isPending: false }), useImpactActions: () => ({ execute: { mutateAsync: vi.fn(), isPending: false }, restoreResource: { mutate: vi.fn(), isPending: false } }) }));
afterEach(() => { cleanup(); resourceState.detail = undefined; });
describe('library notes', () => {
  it('explica el estado vacío y conserva la validación local', () => {
    render(<MemoryRouter initialEntries={['/library']}><Library /></MemoryRouter>);
    expect(screen.getByText('Tu Biblioteca está vacía')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Crear recurso' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear nota' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(screen.getByRole('status')).toHaveTextContent('título es obligatorio');
  });
  it('ofrece guardar un enlace HTTP o HTTPS', () => {
    render(<MemoryRouter initialEntries={['/library']}><Library /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Crear recurso' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar enlace web' }));
    expect(screen.getByLabelText('Dirección web')).toHaveAttribute('type', 'url');
    expect(screen.getByRole('button', { name: 'Guardar enlace' })).toBeInTheDocument();
  });
  it('distingue una búsqueda sin coincidencias de una Biblioteca vacía', () => {
    render(<MemoryRouter initialEntries={['/library?q=inexistente']}><Library /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'No hay resultados' })).toBeInTheDocument();
    expect(screen.queryByText('Tu Biblioteca está vacía')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Búsqueda: inexistente/ })).toBeInTheDocument();
  });
  it('muestra cada archivo seleccionado con progreso y cancelación', () => {
    render(<MemoryRouter initialEntries={['/library']}><Library /></MemoryRouter>);
    const file = new File(['contenido'], 'fuente.txt', { type: 'text/plain' });
    fireEvent.change(screen.getByLabelText('Seleccionar archivos'), { target: { files: [file] } });
    expect(screen.getByText('fuente.txt')).toBeInTheDocument();
    expect(screen.getByLabelText('Progreso de fuente.txt')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar fuente.txt' })).toBeInTheDocument();
  });
  it('mantiene metadatos, original y accesibilidad junto a la vista previa', () => {
    resourceState.detail = { id: 'file-1', title: 'imagen.png', description: null, type: 'file', mediaType: 'image/png', byteSize: 1024, origin: 'Carga desde dispositivo', status: 'ready', updatedAt: new Date().toISOString(), accessibilityText: null, accessibilityRequired: true, accessibilityMissing: true };
    render(<MemoryRouter initialEntries={['/library/file-1']}><Library /></MemoryRouter>);
    expect(screen.getByRole('img', { name: 'imagen.png' })).toBeInTheDocument();
    expect(screen.getByText('Requerido')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descargar original' })).toBeInTheDocument();
    expect(screen.getByText(/Carga desde dispositivo/)).toBeInTheDocument();
  });
});
