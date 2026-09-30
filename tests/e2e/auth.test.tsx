import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PrivateRoute } from '../../src/features/auth/PrivateRoute';
import { AccessPage } from '../../src/features/auth/AccessPage';
import { RegisterPage } from '../../src/features/auth/RegisterPage';
import { AccountMenu } from '../../src/components/layout/AccountMenu';
import { registerPrivateQueryClient } from '../../src/data/queryClient';

const state = vi.hoisted(() => ({ auth: { isLoaded: true, isSignedIn: false }, signOut: vi.fn(), account: { isPending: false, isError: false, data: { account: { name: 'Espacio de Daniel' }, user: { displayName: 'Daniel', email: null } }, refetch: vi.fn() } }));
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => state.auth, useClerk: () => ({ signOut: state.signOut, openUserProfile: vi.fn() }), useUser: () => ({ user: null }),
  useSignIn: () => ({ isLoaded: true, signIn: {}, setActive: vi.fn() }),
  SignUp: (props: { signInUrl: string }) => <a href={props.signInUrl}>Ya tengo cuenta</a>,
}));
vi.mock('../../src/data/useCurrentAccount', () => ({ useCurrentAccount: () => state.account }));
vi.mock('../../src/data/useAi', () => ({ useAiStatus: () => ({ data: { enabled: false } }), useAiActions: () => ({ settings: { mutate: vi.fn() }, revoke: { mutate: vi.fn() } }) }));

describe('recorrido de autenticación sin credenciales externas', () => {
  it('redirige una ruta privada signed-out a acceso sin montar contenido privado', () => {
    render(<MemoryRouter initialEntries={['/library?filter=pdf']}><Routes><Route path="/library" element={<PrivateRoute><p>Biblioteca privada</p></PrivateRoute>} /><Route path="/access" element={<p>Pantalla de acceso</p>} /></Routes></MemoryRouter>);
    expect(screen.getByText('Pantalla de acceso')).toBeInTheDocument(); expect(screen.queryByText('Biblioteca privada')).not.toBeInTheDocument();
  });
  it('conecta acceso y alta separados conservando returnTo seguro', () => {
    render(<MemoryRouter initialEntries={['/access?returnTo=%2Flibrary']}><AccessPage /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/register?returnTo=%2Flibrary');
    render(<MemoryRouter initialEntries={['/register?returnTo=%2Flibrary']}><RegisterPage /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Ya tengo cuenta' })).toHaveAttribute('href', '/access?returnTo=%2Flibrary');
  });
  it('el click de salida limpia caché antes de delegar el redirect a Clerk', async () => {
    const client = new QueryClient(); client.setQueryData(['private', 'me'], { secret: true }); registerPrivateQueryClient(client);
    render(<MemoryRouter><AccountMenu /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Opciones de Espacio de Daniel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await waitFor(() => expect(state.signOut).toHaveBeenCalledWith({ redirectUrl: '/access' }));
    expect(client.getQueryCache().getAll()).toHaveLength(0);
  });
});
