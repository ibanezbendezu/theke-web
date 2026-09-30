import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { AccessPage } from '../src/features/auth/AccessPage';

const mock = vi.hoisted(() => ({
  create: vi.fn(), prepare: vi.fn(), attempt: vi.fn(), oauth: vi.fn(), active: vi.fn(),
}));
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false }),
  useSignIn: () => ({ isLoaded: true, signIn: { create: mock.create, prepareFirstFactor: mock.prepare, attemptFirstFactor: mock.attempt, authenticateWithRedirect: mock.oauth }, setActive: mock.active }),
}));
afterEach(() => { cleanup(); Object.values(mock).forEach(fn => fn.mockReset()); });
const page = () => render(<MemoryRouter initialEntries={['/access?returnTo=%2Flibrary']}><Routes><Route path="/access" element={<AccessPage/>}/><Route path="/library" element={<p>Biblioteca privada</p>}/></Routes></MemoryRouter>);

it('usa Clerk para enviar y verificar un código y vuelve al destino solicitado', async () => {
  mock.create.mockResolvedValue({ supportedFirstFactors: [{ strategy: 'email_code', emailAddressId: 'email-1' }] });
  mock.prepare.mockResolvedValue({});
  mock.attempt.mockResolvedValue({ status: 'complete', createdSessionId: 'session-1' });
  mock.active.mockResolvedValue(undefined);
  page();
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'ana@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: 'Continuar con correo' }));
  await screen.findByLabelText('Código de verificación');
  expect(mock.create).toHaveBeenCalledWith({ identifier: 'ana@example.com' });
  expect(mock.prepare).toHaveBeenCalledWith({ strategy: 'email_code', emailAddressId: 'email-1' });
  fireEvent.change(screen.getByLabelText('Código de verificación'), { target: { value: '123456' } });
  fireEvent.click(screen.getByRole('button', { name: 'Entrar a Theke' }));
  await waitFor(() => expect(screen.getByText('Biblioteca privada')).toBeInTheDocument());
  expect(mock.attempt).toHaveBeenCalledWith({ strategy: 'email_code', code: '123456' });
  expect(mock.active).toHaveBeenCalledWith({ session: 'session-1' });
});

it('inicia Google con callback de Clerk y retorno seguro', async () => {
  mock.oauth.mockResolvedValue(undefined);
  page();
  fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }));
  await waitFor(() => expect(mock.oauth).toHaveBeenCalledWith({ strategy: 'oauth_google', redirectUrl: '/sso-callback?returnTo=%2Flibrary', redirectUrlComplete: '/library' }));
  expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/register?returnTo=%2Flibrary');
});
