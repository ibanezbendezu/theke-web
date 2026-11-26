/// <reference types="node" />

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PublicShare } from '../src/pages/PublicShare';
import { PublicSemanticList } from '../src/pages/PublicDiagramCanvas';
import { PublicCommentsPanel } from '../src/pages/PublicCommentsPanel';

const authState = vi.hoisted(() => ({isLoaded: true}));
vi.mock('@clerk/clerk-react', () => ({ useAuth: () => ({ isLoaded: authState.isLoaded, isSignedIn: false, getToken: async () => null }) }));

const fetchMock = vi.fn();
const commentsFetchMock = vi.fn();
vi.stubGlobal('fetch', (url: string, options: RequestInit) => /\/comments(?:\?|$)/.test(String(url))
  ? commentsFetchMock(url, options) : fetchMock(url, options));
afterEach(() => { cleanup(); fetchMock.mockReset(); commentsFetchMock.mockReset(); authState.isLoaded = true; });
beforeEach(() => commentsFetchMock.mockResolvedValue({ok: true, status: 200, text: async () => JSON.stringify({data: {identity: null, csrfToken: null, comments: []}})}));
const page = () => render(<MemoryRouter initialEntries={['/share/example-token']}><Routes><Route path="/share/:token" element={<PublicShare />} /></Routes></MemoryRouter>);

it('permite comentar Recursos y Relaciones desde la vista semántica con teclado', () => {
  const onCommentTarget = vi.fn();
  render(<PublicSemanticList resources={[{ id: 'resource-1', title: 'Fuente', type: 'note', description: null, content: 'Texto', url: null, accessibilityText: null, mediaType: null }]} relations={[{ id: 'relation-1', sourceResourceId: 'resource-1', targetResourceId: 'resource-1', direction: 'directed', typeKey: 'supports', label: 'Sustenta', explanation: null, evidence: [] }]} selection={null} onSelect={() => {}} commentsEnabled onCommentTarget={onCommentTarget}/>);
  const resourceComment = screen.getByRole('button', { name: 'Comentar Fuente' });
  const relationComment = screen.getByRole('button', { name: 'Comentar relación Sustenta' });
  expect(resourceComment).toHaveClass('h-11', 'w-11');
  expect(relationComment).toHaveClass('h-11', 'w-11');
  fireEvent.click(resourceComment);
  fireEvent.click(relationComment);
  expect(onCommentTarget.mock.calls.map(call => call[0])).toEqual([{ type: 'resource', resourceId: 'resource-1' }, { type: 'relation', relationId: 'relation-1' }]);
});

it('enumera todos los elementos visuales con nombres localizados y conserva la selección de carpeta', () => {
  render(<PublicSemanticList
    resources={[{id: 'image', title: 'Portada', type: 'file', description: null, content: null, url: null, accessibilityText: 'Portada', mediaType: 'IMAGE/PNG'}]}
    relations={[]}
    visualNodes={[
      {id: 'folder', type: 'folder', x: 0, y: 0, folderName: 'Carpeta Uno'},
      {id: 'container', type: 'container', x: 0, y: 0, label: 'Grupo'},
      {id: 'collection', type: 'collection', x: 0, y: 0, label: 'Colección curada'},
      {id: 'annotation', type: 'annotation', x: 0, y: 0, annotationKind: 'desconocida', text: 'Texto alternativo'},
      {id: 'text', type: 'text', x: 0, y: 0, text: 'Texto libre'},
      {id: 'shape', type: 'shape', x: 0, y: 0, shapeType: 'rectangle'},
      {id: 'link', type: 'link', x: 0, y: 0, title: 'Fuente visual'},
      {id: 'media', type: 'media', x: 0, y: 0, mediaType: 'IMAGE', label: 'Portada visual'},
      {id: 'document', type: 'document', x: 0, y: 0, filename: 'Informe.pdf'},
      {id: 'audio', type: 'audio', x: 0, y: 0, title: 'Narración'},
    ]}
    selection={{kind: 'folder', id: 'folder'}} onSelect={() => {}}/>);
  expect(screen.getByRole('button', {name: 'Portada · Imagen'})).toBeInTheDocument();
  expect(screen.getByRole('heading', {name: 'Elementos visuales'}).parentElement).toHaveTextContent('10');
  expect(screen.getByRole('button', {name: 'Carpeta Uno · Carpeta'})).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', {name: 'Carpeta Uno · Carpeta'})).toHaveClass('bg-surface-variant');
  for (const name of ['Grupo · Grupo', 'Colección curada · Colección', 'Texto alternativo · Texto', 'Texto libre · Texto',
    'Forma visual · Forma', 'Fuente visual · Enlace', 'Portada visual · Imagen', 'Informe.pdf · Documento', 'Narración · Audio'])
    expect(screen.getByLabelText(name)).toBeInTheDocument();
});

it('muestra el nombre público del tipo personalizado en lugar de su clave interna', () => {
  render(<PublicSemanticList resources={[]} relations={[{ id: 'relation-1', sourceResourceId: 'one', targetResourceId: 'two', direction: 'directed', typeKey: 'custom:44444444-4444-4444-8444-444444444444', typeLabel: 'Contextualiza smoke', label: null, explanation: null }]} selection={null} onSelect={() => {}} commentsEnabled onCommentTarget={() => {}}/>);
  expect(screen.getByRole('button', { name: 'Recurso no disponible hacia Recurso no disponible · Contextualiza smoke' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Comentar relación Contextualiza smoke' })).toBeInTheDocument();
  expect(screen.queryByText(/custom:44444444/)).not.toBeInTheDocument();
});

it('abre el compositor desde el menú contextual y localiza comentarios sobre el Canvas', async () => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  const comment = { id: 'comment-1', displayName: 'Ana', content: 'Revisar esta fuente', createdAt: new Date().toISOString(), editable: false, anchored: true, anchor: { type: 'resource', resourceId: 'one', label: 'Fuente', x: 40, y: 50 } };
  const second = {...comment, id: 'comment-2', displayName: 'Luis', content: 'Otra observación'};
  commentsFetchMock.mockResolvedValue({ok: true, status: 200, text: async () => JSON.stringify({data: {identity: null, csrfToken: null, comments: [comment, second]}})});
  fetchMock.mockImplementation(async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ data: {
    diagramName: 'Mapa con comentarios', revision: 1, commentsEnabled: true, layout: { nodes: [{ id: 'node-one', type: 'resource', resourceId: 'one', x: 0, y: 0, width: 200, height: 100 }], edges: [] },
    resources: [{ id: 'one', title: 'Fuente', type: 'note', content: 'Texto', description: null, url: null, mediaType: null, accessibilityText: null }], relations: [],
  } }) }));
  page();
  await screen.findByRole('heading', { name: 'Mapa con comentarios' });
  await waitFor(() => expect(screen.getByLabelText('Diagrama público').querySelector('[data-id="comment:comment-1"]')).not.toBeNull());
  const pane = screen.getByLabelText('Diagrama público').querySelector('.react-flow__pane');
  expect(pane).not.toBeNull();
  fireEvent.contextMenu(pane!, { clientX: 90, clientY: 90 });
  expect(await screen.findByRole('menu')).toHaveClass('public-share-surface');
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Comentar aquí' }));
  expect(await screen.findByText('Sobre: Punto del mapa')).toBeInTheDocument();
  await screen.findByText('Revisar esta fuente');
  await waitFor(() => expect(screen.getByLabelText('Diagrama público').querySelector('[data-id="comment:comment-1"]')).not.toBeNull());
  const marker = screen.getByLabelText('Diagrama público').querySelector('[data-id="comment:comment-1"] button');
  expect(marker).not.toBeNull();
  expect(marker).toHaveAttribute('aria-label', 'Abrir comentario 1 de Ana');
  expect(marker?.textContent).toContain('Ana');
  fireEvent.click(screen.getByRole('button', {name: 'Cerrar comentarios'}));
  expect(screen.queryByRole('dialog', {name: 'Comentarios del mapa'})).not.toBeInTheDocument();
  fireEvent.click(marker!);
  expect(screen.getByRole('dialog', {name: 'Comentarios del mapa'})).toBeInTheDocument();
  const otherMarker = screen.getByLabelText('Diagrama público').querySelector('[data-id="comment:comment-2"] button');
  expect(marker).toHaveAttribute('aria-pressed', 'true');
  expect(otherMarker).toHaveAttribute('aria-pressed', 'false');
  expect(otherMarker?.closest<HTMLElement>('.react-flow__node')?.style.transform)
    .not.toBe(marker?.closest<HTMLElement>('.react-flow__node')?.style.transform);
  expect(screen.getByText('Revisar esta fuente').closest('li')).toHaveClass('ring-primary');
  fireEvent.click(screen.getByRole('button', {name: 'Cerrar comentarios'}));
  fireEvent.click(screen.getByRole('button', {name: 'Añadir comentario'}));
  fireEvent.click(screen.getByRole('button', {name: 'Comentar el centro de la vista'}));
  expect(screen.getByRole('dialog', {name: 'Comentarios del mapa'})).toHaveTextContent('Sobre: Punto del mapa');
});

it('carga marcadores públicos aunque Clerk aún no haya resuelto la sesión', async () => {
  authState.isLoaded = false;
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  commentsFetchMock.mockResolvedValue({ok: true, status: 200, text: async () => JSON.stringify({data: {identity: null, csrfToken: null, comments: [{id: 'comment-1', displayName: 'Ana', content: 'Visible', createdAt: new Date().toISOString(), editable: false, anchored: true, anchor: {type: 'point', x: 20, y: 30}}]}})});
  fetchMock.mockResolvedValue({ok: true, status: 200, text: async () => JSON.stringify({data: {diagramName: 'Mapa', revision: 1, commentsEnabled: true, layout: {nodes: [{id: 'visual-1', type: 'annotation', x: 0, y: 0, width: 100, height: 80, annotationKind: 'text', text: 'Visual'}], edges: []}, resources: [], relations: []}})});
  page();
  await waitFor(() => expect(screen.getByLabelText('Diagrama público').querySelector('[data-id="comment:comment-1"]')).not.toBeNull());
  expect(screen.queryByText('Cargando comentarios…')).not.toBeInTheDocument();
});

it('permite cargar comentarios anteriores y mantiene ambas páginas visibles', async () => {
  const comment = (id: string) => ({id, displayName: 'Ana', content: id, createdAt: new Date().toISOString(), editable: false, anchored: false, anchor: {type: 'diagram'}});
  commentsFetchMock.mockImplementation(async (url: string) => ({ok: true, status: 200, text: async () => JSON.stringify({data: {
    identity: null, csrfToken: null, comments: [comment(url.includes('?cursor=') ? 'anterior' : 'reciente')], nextCursor: url.includes('?cursor=') ? null : '11111111-1111-4111-8111-111111111111'
  }})}));
  const onCommentsChange = vi.fn();
  render(<PublicCommentsPanel token="example-token" enabled open onClose={() => {}} onCommentsChange={onCommentsChange}/>);
  expect(await screen.findByText('reciente')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'Cargar comentarios anteriores'}));
  expect(await screen.findByText('anterior')).toBeInTheDocument();
  expect(screen.getByText('reciente')).toBeInTheDocument();
  expect(onCommentsChange).toHaveBeenLastCalledWith(expect.arrayContaining([expect.objectContaining({id: 'reciente'}), expect.objectContaining({id: 'anterior'})]));
});

it('solicita imágenes visuales externas solo tras una acción explícita', async () => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  fetchMock.mockResolvedValue({ok: true, status: 200, text: async () => JSON.stringify({data: {diagramName: 'Mapa', revision: 1, commentsEnabled: false,
    layout: {nodes: [{id: 'media-1', type: 'media', x: 0, y: 0, mediaType: 'image', url: 'https://example.com/image.png', label: 'Imagen visual'}], edges: []}, resources: [], relations: []}})});
  page();
  await screen.findByRole('heading', {name: 'Mapa'});
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Mostrar imagen').closest('button')!);
  expect(document.querySelector('img[src="https://example.com/image.png"]')).not.toBeNull();
});

it('consulta sin credenciales y muestra solo la proyección pública', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa visible', revision: 1, commentsEnabled: true, layout: { nodes: [], edges: [] }, resources: [{ id: 'one', title: 'Nota', type: 'note', content: 'Texto público', description: null, url: null, mediaType: null, accessibilityText: null }], relations: [] } }) });
  page();
  fireEvent.click(await screen.findByRole('button', { name: 'Nota · Nota' }));
  expect(await screen.findByText('Texto público')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Añadir recurso' })).not.toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/v1\/public\/shares\/example-token$/), expect.objectContaining({ cache: 'no-store' }));
  expect(fetchMock.mock.calls[0]?.[1]?.headers).toBeUndefined();
});

it('cierra el detalle superpuesto y devuelve el foco al recurso', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa', revision: 1, commentsEnabled: false, layout: { nodes: [], edges: [] }, resources: [{ id: 'one', title: 'Nota', type: 'note', content: 'Texto público', description: null, url: null, mediaType: null, accessibilityText: null }], relations: [] } }) });
  page();
  const resource = await screen.findByRole('button', { name: 'Nota · Nota' });
  resource.focus();
  fireEvent.click(resource);
  expect(screen.getByRole('button', { name: 'Cerrar visor' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar visor' }));
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
  fireEvent.click(await screen.findByRole('button', { name: 'Enlace · Enlace' }));
  expect(await screen.findByRole('heading', { name: 'Enlace' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Abrir enlace' })).not.toBeInTheDocument();
});

it('abre enlaces HTTP(S) en otra pestaña con un control tonal de al menos 44 px', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa', revision: 1, commentsEnabled: false, layout: { nodes: [], edges: [] }, resources: [{ id: 'link', type: 'link', title: 'Fuente', url: 'https://example.org/consulta', content: null, description: null, mediaType: null, accessibilityText: null }], relations: [] } }) });
  page();
  fireEvent.click(await screen.findByRole('button', { name: 'Fuente · Enlace' }));
  const link = screen.getByRole('link', { name: 'Abrir enlace' });
  expect(link).toHaveAttribute('href', 'https://example.org/consulta');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveClass('min-h-11', 'bg-surface-variant');
});

it('muestra archivos mediante la API pública sin recibir claves de almacenamiento', async () => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa', revision: 1, commentsEnabled: false, layout: { nodes: [], edges: [] }, resources: [{ id: '11111111-1111-4111-8111-111111111111', type: 'file', title: 'Imagen', url: null, content: null, description: null, mediaType: 'image/png', accessibilityText: 'Descripción de la imagen' }], relations: [] } }) });
  page();
  await screen.findByRole('button', { name: 'Imagen · Imagen' });
  expect(screen.queryByRole('img', { name: 'Descripción de la imagen' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Imagen · Imagen' }));
  const image = await screen.findByRole('img', { name: 'Descripción de la imagen' });
  expect(image.getAttribute('src')).toBe('http://localhost:3000/v1/public/shares/example-token/resources/11111111-1111-4111-8111-111111111111/content');
  fireEvent.error(image);
  expect(screen.getByRole('alert')).toHaveTextContent('No se pudo mostrar el contenido');
  expect(screen.getByRole('link', { name: 'Descargar archivo' }).getAttribute('href')).toBe('http://localhost:3000/v1/public/shares/example-token/resources/11111111-1111-4111-8111-111111111111/content?download=1');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar vista previa' }));
  expect(screen.getByRole('img').getAttribute('src')).toContain('?retry=1');
  expect(document.body.innerHTML).not.toContain('storageKey');
  vi.unstubAllEnvs();
});

it('ofrece abrir y descargar cuando el formato no admite vista previa', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa', revision: 1, commentsEnabled: false, layout: { nodes: [], edges: [] }, resources: [{ id: 'two', type: 'file', title: 'Archivo', url: null, content: null, description: null, mediaType: 'application/zip', accessibilityText: 'Archivo comprimido' }], relations: [] } }) });
  page();
  fireEvent.click(await screen.findByRole('button', { name: 'Archivo · Archivo' }));
  expect(screen.getByText('Este formato no tiene vista previa.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Abrir archivo' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Descargar archivo' })).toBeInTheDocument();
});

it.each([
  ['audio/mpeg', 'Audio', 'Audio', 'audio'],
  ['video/mp4', 'Video', 'Vídeo', 'video'],
])('ofrece vista previa diferida y recuperable para %s', async (mediaType, title, semanticType, accessibleName) => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa', revision: 1, commentsEnabled: false, layout: { nodes: [], edges: [] }, resources: [{ id: '11111111-1111-4111-8111-111111111111', type: 'file', title, url: null, content: null, description: null, mediaType, accessibilityText: `Alternativa para ${title}` }], relations: [] } }) });
  page();
  fireEvent.click(await screen.findByRole('button', { name: `${title} · ${semanticType}` }));
  const media = document.querySelector(accessibleName)!;
  expect(media).toHaveAttribute('preload', 'none');
  fireEvent.error(media);
  expect(screen.getByRole('alert')).toHaveTextContent('No se pudo mostrar el contenido');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar vista previa' }));
  expect(document.querySelector(accessibleName)).toHaveAttribute('src', expect.stringContaining('?retry=1'));
});

it.each([
  ['text/plain', 'Archivo'],
])('abre %s en otra pestaña sin incrustarlo', async (mediaType, semanticType) => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa', revision: 1, commentsEnabled: false, layout: { nodes: [], edges: [] }, resources: [{ id: '11111111-1111-4111-8111-111111111111', type: 'file', title: 'Documento', url: null, content: null, description: null, mediaType, accessibilityText: 'Documento accesible' }], relations: [] } }) });
  page();
  fireEvent.click(await screen.findByRole('button', { name: `Documento · ${semanticType}` }));
  expect(screen.getByRole('link', { name: 'Abrir archivo' })).toHaveAttribute('target', '_blank');
  expect(screen.queryByText('Este formato no tiene vista previa en el navegador.')).not.toBeInTheDocument();
});

it('permite inspeccionar relaciones y navegar a sus extremos desde la vista semántica', async () => {
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa', revision: 2, commentsEnabled: false,
    layout: { nodes: [], edges: [] },
    resources: [
      { id: 'one', type: 'note', title: 'Origen', content: 'Texto de origen', description: null, url: null, mediaType: null, accessibilityText: null },
      { id: 'two', type: 'note', title: 'Destino', content: 'Texto de destino', description: null, url: null, mediaType: null, accessibilityText: null },
    ], relations: [{ id: 'relation', sourceResourceId: 'one', targetResourceId: 'two', direction: 'directed', typeKey: 'supports', label: 'Sustenta', explanation: 'Explicación pública', evidence: [{ resourceId: 'one', excerpt: 'Cita visible', note: null, pageNumber: 2 }] }] } }) });
  page();
  fireEvent.click(await screen.findByRole('button', { name: /Origen hacia Destino · Sustenta/ }));
  expect(screen.getByText('Cita visible')).toBeInTheDocument();
  expect(screen.getByText('Explicación pública')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Ir a Destino' }));
  expect(screen.queryByLabelText('Detalles del mapa')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: 'Abrir recurso Destino'}));
  expect(screen.getByText('Texto de destino')).toBeInTheDocument();
});

it('monta el Canvas público con controles de zoom cuando hay posiciones publicadas', async () => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ data: { diagramName: 'Mapa visual', revision: 1, commentsEnabled: false,
    layout: { background: { variant: 'grid', tone: 'surface' }, nodes: [{ id: 'r0', type: 'resource', resourceId: 'one', x: 40, y: 80, width: 320, height: 140, zIndex: -5, caption: 'Lectura' }, { id: 'g0', type: 'container', x: 20, y: 30, width: 400, height: 260, zIndex: 99, label: 'Grupo visible' }, { id: 'a0', type: 'annotation', x: 100, y: 240, width: 220, height: 80, zIndex: 3, annotationKind: 'text', text: 'Texto visual' }], edges: [] },
    resources: [{ id: 'one', type: 'note', title: 'Tarjeta visible', content: 'Detalle', description: null, url: null, mediaType: null, accessibilityText: null }], relations: [] } }) });
  page();
  expect(await screen.findByRole('heading', { name: 'Mapa visual' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Mapa visual' }).parentElement).toHaveClass('public-share-surface');
  expect(screen.getByLabelText('Diagrama público')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Acercar' })).toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: 'Controles del diagrama' })).toHaveClass('public-share-surface');
  expect(screen.getByRole('button', { name: 'Ajustar vista' })).toBeInTheDocument();
  expect(screen.getByLabelText('Diagrama público').querySelector('.react-flow__viewport')).not.toBeNull();
  const diagram = screen.getByLabelText('Diagrama público');
  await waitFor(() => expect(diagram.querySelector<HTMLElement>('[data-id="g0"]')?.style.pointerEvents).toBe('none'));
  expect(diagram.querySelector<HTMLElement>('[data-id="g0"]')?.style.zIndex).toBe('0');
  expect(diagram.querySelector<HTMLElement>('[data-id="r0"]')?.style.zIndex).toBe('1');
  expect(diagram.querySelector<HTMLElement>('[data-id="a0"]')?.style.zIndex).toBe('9');
  expect(screen.getByText('Grupo visible').parentElement).toHaveClass('public-share-surface');
  expect(screen.queryByLabelText('Detalles del mapa')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Mostrar detalles')).not.toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Abrir detalle de Tarjeta visible'));
  expect(await screen.findByRole('heading', {name: 'Tarjeta visible'})).toBeInTheDocument();
  expect(screen.getByRole('button', {name: 'Cerrar visor'})).toHaveClass('h-11', 'w-11');
  fireEvent.click(screen.getByRole('button', {name: 'Cerrar visor'}));
  expect(screen.queryByLabelText('Detalles del mapa')).not.toBeInTheDocument();
  fireEvent.click(diagram.querySelector('[data-id="r0"]')!);
  fireEvent.click(screen.getByRole('button', {name: 'Ver contexto'}));
  expect(screen.getByLabelText('Detalles del mapa')).toHaveTextContent('Lectura');
  fireEvent.click(screen.getByLabelText('Mostrar vista semántica'));
  expect(screen.getByLabelText('Panel de vista semántica')).toHaveClass('public-share-surface');
  expect(screen.queryByRole('textbox', { name: 'Texto de anotación' })).not.toBeInTheDocument();
});

it('mantiene opacas y enfocables las superficies públicas en modos de contraste', () => {
  const publicStyles = readFileSync('src/index.css', 'utf8');
  expect(publicStyles).toContain('@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))');
  expect(publicStyles).toMatch(/@media \(prefers-contrast: more\)[\s\S]*?\.public-share-surface[\s\S]*?background-color: var\(--surface\) !important;[\s\S]*?backdrop-filter: none !important;/);
  expect(publicStyles).toMatch(/@media \(forced-colors: active\)[\s\S]*?\.public-share-surface[\s\S]*?background: Canvas !important;[\s\S]*?outline: 3px solid Highlight !important;/);
});
