import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AccountMenu } from '../src/components/layout/AccountMenu';
import { ThemeProvider } from '../src/providers/ThemeProvider';

const mocks = vi.hoisted(() => ({ signOut: vi.fn(), openUserProfile: vi.fn(), clearCache: vi.fn() }));
vi.mock('@clerk/clerk-react', () => ({ useClerk: () => ({ signOut: mocks.signOut, openUserProfile: mocks.openUserProfile }), useUser: () => ({ user: { fullName: 'Ana Clerk', firstName: 'Ana', primaryEmailAddress: { emailAddress: 'ana.clerk@example.com' }, imageUrl: null } }) }));
vi.mock('../src/data/useCurrentAccount', () => ({ useCurrentAccount: () => ({ data: { account: { name: 'Espacio de Ana' }, user: { displayName: 'Ana', email: 'ana@example.com' } } }) }));
vi.mock('../src/data/queryClient', () => ({ clearPrivateCache: mocks.clearCache }));
vi.mock('../src/components/ai/AISettingsDialog', () => ({ AISettingsDialog: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div role="dialog" aria-label="Configuración de IA"/> : null }));
beforeEach(() => vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
afterEach(() => { cleanup(); mocks.signOut.mockReset(); mocks.openUserProfile.mockReset(); mocks.clearCache.mockReset(); localStorage.clear(); });

const page = () => render(<ThemeProvider><AccountMenu/></ThemeProvider>);

it('abre la cuenta desde el nombre del espacio y agrupa sus opciones', () => {
  page();
  fireEvent.click(screen.getByRole('button', { name: 'Opciones de Espacio de Ana' }));
  expect(screen.getByRole('dialog', { name: 'Cuenta y preferencias' })).toBeInTheDocument();
  expect(screen.getByText('ana.clerk@example.com')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Tema del sistema' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Tema oscuro' }));
  expect(screen.getByRole('button', { name: 'Tema oscuro' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Mi cuenta' }));
  expect(screen.getByRole('dialog', { name: 'Mi cuenta' })).toHaveTextContent('Espacio de Ana');
  expect(screen.getByRole('dialog', { name: 'Mi cuenta' })).toHaveTextContent('Ana Clerk');
  fireEvent.click(screen.getByRole('button', { name: 'Administrar cuenta' }));
  expect(mocks.openUserProfile).toHaveBeenCalledOnce();
  expect(screen.getByRole('button', { name: 'Opciones de Espacio de Ana' })).toHaveFocus();
});

it('cierra el menú con Escape y permite abrir Acerca de y cerrar sesión', async () => {
  page();
  const trigger = screen.getByRole('button', { name: 'Opciones de Espacio de Ana' });
  fireEvent.click(trigger);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog', { name: 'Cuenta y preferencias' })).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole('button', { name: 'Acerca de Theke' }));
  expect(screen.getByRole('dialog', { name: 'Acerca de Theke' })).toHaveTextContent('Theke es un espacio');
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(mocks.clearCache).toHaveBeenCalledOnce();
  expect(mocks.signOut).toHaveBeenCalledWith({ redirectUrl: '/access' });
});
