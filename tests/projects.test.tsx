import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Projects } from '../src/pages/Projects';
import { ToastProvider } from '../src/components/ui/ToastProvider';

const state = vi.hoisted(() => ({
  query: { data: { pages: [{ data: [] }] }, isPending: false, isError: false, hasNextPage: false, isFetchingNextPage: false },
  create: { mutateAsync: vi.fn(), isPending: false },
  folders: [] as { id: string; name: string; parentFolderId: string | null }[],
}));
vi.mock('../src/data/useProjects', () => ({
  useProjects: () => state.query,
  useProjectActions: () => ({ create: state.create, rename: { mutateAsync: vi.fn(), isPending: false }, restore: { mutate: vi.fn() } }),
}));
vi.mock('../src/data/useProjectFolders', () => ({
  useProjectFolders: () => ({ data: state.folders }),
  useProjectFolderActions: () => ({ create: { mutateAsync: vi.fn() }, rename: { mutateAsync: vi.fn() }, remove: { mutateAsync: vi.fn() }, move: { mutateAsync: vi.fn() }, moveFolder: { mutateAsync: vi.fn() } }),
}));

const mount = (path: string) => render(<ToastProvider><MemoryRouter initialEntries={[path]}><Projects /></MemoryRouter></ToastProvider>);
afterEach(() => { cleanup(); vi.clearAllMocks(); state.folders = []; });

describe('Proyectos', () => {
  it('muestra el estado vacío y valida el nombre del mapa', () => {
    mount('/projects');
    expect(screen.getByText('Aún no tienes mapas en la raíz')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Crear mapa' })[0]);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('1 y 120');
    expect(input).toHaveValue('   ');
  });

  it('muestra Activos y Archivados solo en la raíz y conserva el menú contextual', () => {
    state.folders = [{ id: 'folder-1', name: 'Fuentes', parentFolderId: null }];
    const view = mount('/projects');
    expect(screen.getByRole('button', { name: 'Archivados' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Opciones de proyectos' })).not.toBeInTheDocument();
    fireEvent.contextMenu(screen.getByRole('region', { name: 'Proyectos' }));
    expect(screen.getByRole('menuitem', { name: 'Crear carpeta' })).toBeInTheDocument();
    view.unmount();
    mount('/projects?folder=folder-1');
    expect(screen.queryByRole('button', { name: 'Archivados' })).not.toBeInTheDocument();
    expect(screen.queryByText('Fuentes')).not.toBeInTheDocument();
  });
});
