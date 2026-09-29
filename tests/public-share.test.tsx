import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { PublicShare } from '../src/pages/PublicShare';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);
afterEach(() => { cleanup(); fetchMock.mockReset(); });
const page = () => render(<MemoryRouter initialEntries={['/share/example-token']}><Routes><Route path="/share/:token" element={<PublicShare />} /></Routes></MemoryRouter>);

it('consulta sin credenciales y muestra solo la proyección pública', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa visible', revision: 1, commentsEnabled: true, layout: { nodes: [], edges: [] }, resources: [{ id: 'one', title: 'Nota', type: 'note', content: 'Texto público', description: null, url: null, mediaType: null, accessibilityText: null }], relations: [] } }) });
  page();
  fireEvent.click(await screen.findByRole('button', { name: 'Nota · note' }));
  expect(await screen.findByText('Texto público')).toBeInTheDocument();
  expect(screen.getByText(/permite nuevos comentarios/)).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/v1\/public\/shares\/example-token$/), expect.objectContaining({ cache: 'no-store' }));
  expect(fetchMock.mock.calls[0]?.[1]?.headers).toBeUndefined();
});

it('cierra el detalle superpuesto y devuelve el foco al recurso', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa', revision: 1, commentsEnabled: false, layout: { nodes: [], edges: [] }, resources: [{ id: 'one', title: 'Nota', type: 'note', content: 'Texto público', description: null, url: null, mediaType: null, accessibilityText: null }], relations: [] } }) });
  page();
  const resource = await screen.findByRole('button', { name: 'Nota · note' });
  resource.focus();
  fireEvent.click(resource);
  expect(screen.getByRole('button', { name: 'Cerrar detalle' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar detalle' }));
  await waitFor(() => expect(resource).toHaveFocus());
});

it('da el mismo mensaje neutro para cualquier fallo público', async () => {
  fetchMock.mockRejectedValue(new Error('No disponible'));
  page();
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Enlace no disponible'));
  expect(screen.queryByText('Mapa visible')).not.toBeInTheDocument();
});

it('no permite abrir esquemas peligrosos aunque aparezcan en una proyección', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa', revision: 1, commentsEnabled: false, layout: { nodes: [], edges: [] }, resources: [{ id: 'link', type: 'link', title: 'Enlace', url: 'javascript:alert(1)', content: null, description: null, mediaType: null, accessibilityText: null }], relations: [] } }) });
  page();
  fireEvent.click(await screen.findByRole('button', { name: 'Enlace · link' }));
  expect(await screen.findByRole('heading', { name: 'Enlace' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Abrir enlace' })).not.toBeInTheDocument();
});

it('muestra archivos mediante la API pública sin recibir claves de almacenamiento', async () => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa', revision: 1, commentsEnabled: false, layout: { nodes: [], edges: [] }, resources: [{ id: '11111111-1111-4111-8111-111111111111', type: 'file', title: 'Imagen', url: null, content: null, description: null, mediaType: 'image/png', accessibilityText: 'Descripción de la imagen' }], relations: [] } }) });
  page();
  await screen.findByRole('button', { name: 'Imagen · file' });
  expect(screen.queryByRole('img', { name: 'Descripción de la imagen' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Imagen · file' }));
  const image = await screen.findByRole('img', { name: 'Descripción de la imagen' });
  expect(image.getAttribute('src')).toBe('http://localhost:3000/v1/public/shares/example-token/resources/11111111-1111-4111-8111-111111111111/content');
  fireEvent.error(image);
  expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar la vista previa');
  expect(screen.getByRole('link', { name: 'Descargar archivo' }).getAttribute('href')).toBe('http://localhost:3000/v1/public/shares/example-token/resources/11111111-1111-4111-8111-111111111111/content?download=1');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar vista previa' }));
  expect(screen.getByRole('img').getAttribute('src')).toContain('?retry=1');
  expect(document.body.innerHTML).not.toContain('storageKey');
  vi.unstubAllEnvs();
});

it('ofrece abrir y descargar cuando el formato no admite vista previa', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa', revision: 1, commentsEnabled: false, layout: { nodes: [], edges: [] }, resources: [{ id: 'two', type: 'file', title: 'Archivo', url: null, content: null, description: null, mediaType: 'application/zip', accessibilityText: 'Archivo comprimido' }], relations: [] } }) });
  page();
  fireEvent.click(await screen.findByRole('button', { name: 'Archivo · file' }));
  expect(screen.getByText('Este formato no tiene vista previa en el navegador.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Abrir archivo' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Descargar archivo' })).toBeInTheDocument();
});

it('permite inspeccionar relaciones y navegar a sus extremos desde la vista semántica', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa', revision: 2, commentsEnabled: false,
    layout: { nodes: [], edges: [] },
    resources: [
      { id: 'one', type: 'note', title: 'Origen', content: 'Texto de origen', description: null, url: null, mediaType: null, accessibilityText: null },
      { id: 'two', type: 'note', title: 'Destino', content: 'Texto de destino', description: null, url: null, mediaType: null, accessibilityText: null },
    ], relations: [{ id: 'relation', sourceResourceId: 'one', targetResourceId: 'two', direction: 'directed', typeKey: 'supports', label: 'Sustenta', explanation: 'Explicación pública', evidence: [{ resourceId: 'one', excerpt: 'Cita visible', note: null, pageNumber: 2 }] }] } }) });
  page();
  fireEvent.click(await screen.findByRole('button', { name: /Origen → Destino · Sustenta/ }));
  expect(screen.getByText('Cita visible')).toBeInTheDocument();
  expect(screen.getByText('Explicación pública')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Ir a Destino' }));
  expect(screen.getByText('Texto de destino')).toBeInTheDocument();
});

it('monta el Canvas público con controles de zoom cuando hay posiciones publicadas', async () => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa visual', revision: 1, commentsEnabled: false,
    layout: { nodes: [{ id: 'r0', resourceId: 'one', x: 40, y: 80 }], edges: [] },
    resources: [{ id: 'one', type: 'note', title: 'Tarjeta visible', content: 'Detalle', description: null, url: null, mediaType: null, accessibilityText: null }], relations: [] } }) });
  page();
  expect(await screen.findByRole('heading', { name: 'Mapa visual' })).toBeInTheDocument();
  expect(screen.getByLabelText('Diagrama público')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Acercar' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Ajustar vista' })).toBeInTheDocument();
});
