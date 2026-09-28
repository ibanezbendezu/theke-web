import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { PublicShare } from '../src/pages/PublicShare';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);
afterEach(() => { cleanup(); fetchMock.mockReset(); });
const page = () => render(<MemoryRouter initialEntries={['/share/example-token']}><Routes><Route path="/share/:token" element={<PublicShare />} /></Routes></MemoryRouter>);

it('consulta sin credenciales y muestra solo la proyección pública', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa visible', revision: 1, commentsEnabled: true, resources: [{ id: 'one', title: 'Nota', content: 'Texto público', description: null, url: null, mediaType: null, accessibilityText: null }], relations: [] } }) });
  page();
  expect(await screen.findByText('Texto público')).toBeInTheDocument();
  expect(screen.getByText(/permite nuevos comentarios/)).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/v1\/public\/shares\/example-token$/), expect.objectContaining({ cache: 'no-store' }));
  expect(fetchMock.mock.calls[0]?.[1]?.headers).toBeUndefined();
});

it('da el mismo mensaje neutro para cualquier fallo público', async () => {
  fetchMock.mockRejectedValue(new Error('No disponible'));
  page();
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Enlace no disponible'));
  expect(screen.queryByText('Mapa visible')).not.toBeInTheDocument();
});

it('no permite abrir esquemas peligrosos aunque aparezcan en una proyección', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa', revision: 1, commentsEnabled: false, resources: [{ id: 'link', title: 'Enlace', url: 'javascript:alert(1)', content: null, description: null, mediaType: null, accessibilityText: null }], relations: [] } }) });
  page();
  expect(await screen.findByText('Enlace')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Abrir enlace' })).not.toBeInTheDocument();
});

it('muestra archivos mediante la API pública sin recibir claves de almacenamiento', async () => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa', revision: 1, commentsEnabled: false, resources: [{ id: '11111111-1111-4111-8111-111111111111', type: 'file', title: 'Imagen', url: null, content: null, description: null, mediaType: 'image/png', accessibilityText: 'Descripción de la imagen' }], relations: [] } }) });
  page();
  const image = await screen.findByRole('img', { name: 'Descripción de la imagen' });
  expect(image.getAttribute('src')).toBe('http://localhost:3000/v1/public/shares/example-token/resources/11111111-1111-4111-8111-111111111111/content');
  expect(document.body.innerHTML).not.toContain('storageKey');
  vi.unstubAllEnvs();
});
