import { QueryClient } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PrivateRoute } from '../src/features/auth/PrivateRoute';
import { AccessPage } from '../src/features/auth/AccessPage';
import { RegisterPage } from '../src/features/auth/RegisterPage';
import { clearPrivateCache, registerPrivateQueryClient } from '../src/data/queryClient';
import { ApiError } from '../src/api/httpClient';

const state = vi.hoisted(() => ({ auth: { isLoaded: false, isSignedIn: false, signOut: vi.fn() }, account: { isPending: false, isError: false, error: null as unknown, data: undefined as unknown, refetch: vi.fn() } }));
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => state.auth,
  useSignIn: () => ({isLoaded: true, signIn: {}, setActive: vi.fn()}),
  SignUp: ({forceRedirectUrl}: {forceRedirectUrl: string}) => <button data-redirect={forceRedirectUrl}>Crear cuenta con Clerk</button>,
}));
vi.mock('../src/data/useCurrentAccount', () => ({ useCurrentAccount: () => state.account }));
afterEach(() => { cleanup(); state.auth = { isLoaded: false, isSignedIn: false, signOut: vi.fn() }; state.account = { isPending: false, isError: false, error: null, data: undefined, refetch: vi.fn() }; });

describe('estados de autenticación', () => {
  it('no muestra datos privados mientras Clerk resuelve la sesión', () => {
    render(<MemoryRouter><PrivateRoute><p>Dato privado</p></PrivateRoute></MemoryRouter>);
    expect(screen.getByText('Restaurando tu espacio…')).toBeInTheDocument(); expect(screen.queryByText('Dato privado')).not.toBeInTheDocument();
  });
  it('muestra recuperación con reintento cuando /v1/me falla', () => {
    state.auth = { isLoaded: true, isSignedIn: true, signOut: vi.fn() }; state.account.isError = true;
    render(<MemoryRouter><PrivateRoute><p>Dato privado</p></PrivateRoute></MemoryRouter>);
    expect(screen.getByRole('alert')).toHaveTextContent('Tu trabajo sigue protegido'); expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
  it('descarta sesión y caché ante un 401 sin ofrecer reintento', async () => {
    const client = new QueryClient(); client.setQueryData(['private', 'me'], { secret: true }); registerPrivateQueryClient(client);
    state.auth = { isLoaded: true, isSignedIn: true, signOut: vi.fn(async () => undefined) };
    state.account = { isPending: false, isError: true, error: new ApiError({ error: { code: 'UNAUTHORIZED', message: 'Vencida', requestId: 'req-401' } }, 401), data: undefined, refetch: vi.fn() };
    render(<MemoryRouter initialEntries={['/library?filter=pdf']}><PrivateRoute><p>Dato privado</p></PrivateRoute></MemoryRouter>);
    await waitFor(() => expect(state.auth.signOut).toHaveBeenCalledWith({ redirectUrl: '/access?returnTo=%2Flibrary%3Ffilter%3Dpdf' }));
    expect(client.getQueryCache().getAll()).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });
  it('monta el espacio privado solo después de restaurar Clerk y /v1/me', () => {
    state.auth = { isLoaded: true, isSignedIn: true, signOut: vi.fn() }; state.account.data = { account: { id: 'a1' } };
    render(<MemoryRouter><PrivateRoute><p>Dato privado</p></PrivateRoute></MemoryRouter>);
    expect(screen.getByText('Dato privado')).toBeInTheDocument();
  });
  it('ofrece OTP o Google sin enumerar cuentas y permite reintentar/cancelar dentro de Clerk', () => {
    state.auth = { isLoaded: true, isSignedIn: false, signOut: vi.fn() };
    render(<MemoryRouter initialEntries={['/access']}><AccessPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'Continuar con Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar con correo' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', {name: 'Correo electrónico'})).toBeInTheDocument();
  });
  it('ofrece un alta Clerk separada y conserva el destino seguro', () => {
    state.auth = { isLoaded: true, isSignedIn: false, signOut: vi.fn() };
    render(<MemoryRouter initialEntries={['/register?returnTo=%2Flibrary']}><RegisterPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Crea tu espacio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear cuenta con Clerk' })).toHaveAttribute('data-redirect', '/library');
  });
  it('limpia toda la caché privada al cerrar sesión', () => {
    const client = new QueryClient(); client.setQueryData(['private', 'me'], { secret: true }); registerPrivateQueryClient(client); clearPrivateCache();
    expect(client.getQueryCache().getAll()).toHaveLength(0);
  });
});
