import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Library } from '../src/pages/Library';
import { ToastProvider } from '../src/components/ui/ToastProvider';

const state = vi.hoisted(() => ({
  detail: undefined as Record<string, unknown> | undefined,
  folders: [] as { id: string; name: string; parentFolderId: string | null }[],
  renameFile: vi.fn(),
}));
vi.mock('../src/data/useNotes', () => ({ useNoteActions: () => ({ update: { mutateAsync: vi.fn(), isPending: false } }) }));
vi.mock('../src/data/useLibraryFolders', () => ({
  useLibraryFolders: () => ({ data: state.folders }),
  useLibraryFolderActions: () => ({ create: { mutateAsync: vi.fn() }, rename: { mutateAsync: vi.fn() }, remove: { mutateAsync: vi.fn() }, move: { mutateAsync: vi.fn() }, moveFolder: { mutateAsync: vi.fn() } }),
}));
vi.mock('../src/data/useResources', () => ({
  useResources: () => ({ data: { pages: [{ data: [] }] }, isPending: false, isError: false, hasNextPage: false }),
  useResource: () => ({ data: state.detail, isPending: false, isError: false }),
  useResourceKnowledge: () => ({ references: { data: { outgoing: [], incoming: [] }, isPending: false }, definitions: { data: [], isPending: false }, save: { mutateAsync: vi.fn(), isPending: false } }),
  useResourceAccess: () => ({ data: { url: 'https://example.test/preview' }, isPending: false, isError: false }),
  useResourceActions: () => ({ access: vi.fn().mockResolvedValue({ url: 'https://example.test/file' }), accessibility: { mutateAsync: vi.fn(), isPending: false }, renameFile: { mutateAsync: state.renameFile, isPending: false } }),
  useLinkActions: () => ({ update: { mutateAsync: vi.fn(), isPending: false }, retry: { mutateAsync: vi.fn(), isPending: false } }),
}));
vi.mock('../src/data/useImpacts', () => ({ useImpact: () => ({ isPending: false }), useImpactActions: () => ({ execute: { mutateAsync: vi.fn(), isPending: false }, restoreResource: { mutate: vi.fn(), isPending: false } }) }));

const mount = (path: string) => render(<ToastProvider><MemoryRouter initialEntries={[path]}><Library /></MemoryRouter></ToastProvider>);
afterEach(() => { cleanup(); state.detail = undefined; state.folders = []; state.renameFile.mockReset(); });

describe('Biblioteca', () => {
  it('sitúa la búsqueda antes de Activos y Archivados y distingue la búsqueda vacía', () => {
    mount('/library?q=inexistente');
    expect(screen.getByText('No hay resultados.')).toBeInTheDocument();
    const search = screen.getByRole('searchbox', { name: 'Buscar archivos' });
    const archived = screen.getByRole('button', { name: 'Archivados' });
    expect(search.compareDocumentPosition(archived) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('muestra solo los hijos directos y oculta Activos/Archivados dentro de una carpeta', () => {
    state.folders = [
      { id: 'root-folder', name: 'Fuentes', parentFolderId: null },
      { id: 'child-folder', name: 'Documentos', parentFolderId: 'root-folder' },
    ];
    mount('/library?libraryFolderId=root-folder');
    expect(screen.getByText('Documentos')).toBeInTheDocument();
    expect(screen.queryByText('Fuentes')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Archivados' })).not.toBeInTheDocument();
    fireEvent.contextMenu(screen.getByRole('main', { name: 'Biblioteca' }));
    expect(screen.getByRole('menuitem', { name: 'Crear carpeta' })).toBeInTheDocument();
  });

  it('abre el archivo en un diálogo con vista previa y acceso al original', () => {
    state.detail = { id: 'file-1', title: 'imagen.png', description: null, type: 'file', mediaType: 'image/png', byteSize: 1024, origin: 'Carga desde dispositivo', status: 'ready', updatedAt: new Date().toISOString(), accessibilityText: null, accessibilityRequired: true, accessibilityMissing: true };
    mount('/library/file-1');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'imagen.png' })).toBeInTheDocument();
    expect(screen.getByText('Requerido')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descargar' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveClass('overflow-hidden');
    expect(screen.getByRole('region', { name: 'Vista previa' })).toHaveClass('overflow-auto');
    expect(screen.getByRole('complementary', { name: 'Propiedades del archivo' })).toBeInTheDocument();
  });

  it('permite renombrar el archivo desde el visor', async () => {
    state.detail = { id: 'file-1', title: 'imagen.png', description: null, type: 'file', mediaType: 'image/png', byteSize: 1024, origin: 'Carga desde dispositivo', status: 'ready', updatedAt: '2026-09-29T12:00:00.000Z', accessibilityText: null, accessibilityRequired: true, accessibilityMissing: true };
    state.renameFile.mockResolvedValue({ ...state.detail, title: 'nuevo.png' });
    mount('/library/file-1');
    fireEvent.click(screen.getByRole('button', { name: 'Renombrar archivo' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre del archivo' }), { target: { value: 'nuevo.png' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(state.renameFile).toHaveBeenCalledWith({ id: 'file-1', title: 'nuevo.png', expectedUpdatedAt: '2026-09-29T12:00:00.000Z' }));
  });
});
