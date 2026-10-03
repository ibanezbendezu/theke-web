import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {Projects} from '../src/pages/Projects';
import {ToastProvider} from '../src/components/ui/ToastProvider';

const state = vi.hoisted(() => ({createFolder: vi.fn(), createProject: vi.fn()}));
vi.mock('../src/data/useProjects', () => ({
  useProjects: () => ({data: {pages: [{data: []}]}, isPending: false, isError: false, hasNextPage: false}),
  useProjectActions: () => ({
    create: {mutateAsync: state.createProject, isPending: false},
    rename: {mutateAsync: vi.fn(), isPending: false},
    restore: {mutate: vi.fn()},
  }),
}));
vi.mock('../src/data/useProjectFolders', () => ({
  useProjectFolders: () => ({data: []}),
  useProjectFolderActions: () => ({
    create: {mutateAsync: state.createFolder}, rename: {mutateAsync: vi.fn()},
    remove: {mutateAsync: vi.fn()}, move: {mutateAsync: vi.fn()}, moveFolder: {mutateAsync: vi.fn()},
  }),
}));

const mount = (path = '/projects') => render(<ToastProvider><MemoryRouter initialEntries={[path]}><Projects/></MemoryRouter></ToastProvider>);
afterEach(() => {cleanup(); vi.clearAllMocks();});

describe('organización de mapas', () => {
  it('crea una carpeta desde el menú contextual de la colección', async () => {
    state.createFolder.mockResolvedValue(undefined);
    mount();
    fireEvent.contextMenu(screen.getByRole('region', {name: 'Proyectos'}));
    fireEvent.click(screen.getByRole('menuitem', {name: 'Crear carpeta'}));
    fireEvent.change(screen.getByRole('textbox', {name: 'Nombre'}), {target: {value: 'Fuentes'}});
    fireEvent.click(screen.getByRole('button', {name: 'Guardar'}));
    await waitFor(() => expect(state.createFolder).toHaveBeenCalledWith({name: 'Fuentes', parentFolderId: null}));
  });

  it('crea un mapa dentro de la carpeta seleccionada', async () => {
    state.createProject.mockResolvedValue({id: 'project-1'});
    mount('/projects?folder=folder-1');
    fireEvent.click(screen.getAllByRole('button', {name: 'Crear mapa'})[0]);
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Mapa de ideas'}});
    fireEvent.click(screen.getByRole('button', {name: 'Guardar'}));
    await waitFor(() => expect(state.createProject).toHaveBeenCalledWith({name: 'Mapa de ideas', collectionFolderId: 'folder-1'}));
  });
});
