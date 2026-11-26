import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PublicCommentsPanel } from '../src/pages/PublicCommentsPanel';

const auth = vi.hoisted(() => ({ signedIn: false, getToken: vi.fn(async () => 'verified-clerk-token') }));
vi.mock('@clerk/clerk-react', () => ({ useAuth: () => ({ isLoaded: true, isSignedIn: auth.signedIn, getToken: auth.getToken }) }));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);
afterEach(() => { cleanup(); fetchMock.mockReset(); sessionStorage.clear(); auth.signedIn = false; });
const reply = (data: unknown) => ({ ok: true, status: 200, text: async () => JSON.stringify({ data }) });

it('publica sin pedir nombre y muestra el alias científico asignado', async () => {
  const created = { id: 'comment-1', displayName: 'Lynx lynx', content: 'Mi observación', createdAt: new Date().toISOString(), editable: true, anchor: { type: 'diagram' } };
  fetchMock.mockResolvedValueOnce(reply({ identity: null, csrfToken: null, comments: [] }))
    .mockResolvedValueOnce(reply(created))
    .mockResolvedValueOnce(reply({ identity: { displayName: 'Lynx lynx' }, csrfToken: 'csrf-value', comments: [created] }));
  render(<PublicCommentsPanel token="public-token" enabled open onClose={() => {}} />);
  expect(await screen.findByText('Todavía no hay comentarios.')).toBeInTheDocument();
  expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ credentials: 'include' });
  fireEvent.change(screen.getByRole('textbox', { name: 'Comentario' }), { target: { value: 'Mi observación' } });
  fireEvent.click(screen.getByRole('button', { name: 'Publicar comentario' }));
  await waitFor(() => expect(screen.getByText('Participas como Lynx lynx.')).toBeInTheDocument());
  expect(screen.getByText('Mi observación')).toBeInTheDocument();
  expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({ method: 'POST', credentials: 'include' });
  expect(JSON.parse(fetchMock.mock.calls[1]?.[1]?.body as string)).not.toHaveProperty('displayName');
});

it('permite comentar y editar con sesión verificada sin cookie anónima', async () => {
  auth.signedIn = true;
  const own = { id: 'registered-1', displayName: 'Usuario Theke', content: 'Inicial', createdAt: new Date().toISOString(), editedAt: null, revision: 1, editable: true, anchor: { type: 'diagram' } };
  fetchMock.mockResolvedValueOnce(reply({ identity: { displayName: 'Usuario Theke' }, csrfToken: null, comments: [own] }));
  render(<PublicCommentsPanel token="registered-token" enabled open onClose={() => {}}/>);
  await screen.findByText('Inicial');
  fireEvent.click(screen.getByRole('button', { name: 'Editar comentario' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Comentario' }), { target: { value: 'Corregido' } });
  fetchMock.mockResolvedValueOnce(reply({ ...own, content: 'Corregido', revision: 2 }));
  const save = screen.getByRole('button', { name: 'Guardar cambios' });
  expect(save).toBeEnabled();
  fireEvent.click(save);
  await screen.findByText('Corregido');
  const patch = fetchMock.mock.calls.find(([, options]) => options?.method === 'PATCH');
  expect(patch?.[1]?.headers).toMatchObject({ Authorization: 'Bearer verified-clerk-token' });
  expect(patch?.[1]?.headers).not.toHaveProperty('X-CSRF-Token');
  fireEvent.change(screen.getByRole('textbox', { name: 'Comentario' }), { target: { value: 'Nuevo' } });
  expect(screen.getByRole('button', { name: 'Publicar comentario' })).toBeEnabled();
});

it('publica con anclaje de Recurso y recupera un borrador local tras cerrar', async () => {
  const target = { type: 'resource' as const, resourceId: '11111111-1111-4111-8111-111111111111' };
  fetchMock.mockResolvedValue(reply({ identity: null, csrfToken: null, comments: [] }));
  const onClose = vi.fn(); const onTargetChange = vi.fn();
  const view = render(<PublicCommentsPanel token="context-token" enabled open onClose={onClose} target={target} targetLabel="Fuente" onTargetChange={onTargetChange}/>);
  await screen.findByText('Todavía no hay comentarios.');
  expect(screen.getByText('Sobre: Fuente')).toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox', { name: 'Comentario' }), { target: { value: 'Borrador contextual' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar comentarios' }));
  expect(onClose).toHaveBeenCalledOnce();
  view.unmount();
  const restored = render(<PublicCommentsPanel token="context-token" enabled open onClose={() => {}} onTargetChange={onTargetChange}/>);
  expect(await screen.findByText('Hay un borrador sin publicar.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Recuperar' }));
  expect(screen.getByRole('textbox', { name: 'Comentario' })).toHaveValue('Borrador contextual');
  expect(onTargetChange).toHaveBeenCalledWith(target);
  restored.rerender(<PublicCommentsPanel token="context-token" enabled open onClose={() => {}} target={target} targetLabel="Fuente" onTargetChange={onTargetChange}/>);
  const created = { id: 'comment-2', displayName: 'Ana', content: 'Borrador contextual', createdAt: new Date().toISOString(), editable: true, anchor: { ...target, label: 'Fuente', x: 10, y: 20 } };
  fetchMock.mockResolvedValueOnce(reply(created)).mockResolvedValueOnce(reply({ identity: { displayName: 'Ana' }, csrfToken: 'csrf', comments: [created] }));
  fireEvent.click(screen.getByRole('button', { name: 'Publicar comentario' }));
  await waitFor(() => expect(screen.getByText('Participas como Ana.')).toBeInTheDocument());
  expect(JSON.parse(fetchMock.mock.calls.find(([, options]) => options?.method === 'POST')?.[1]?.body as string).anchor).toEqual(target);
});

it('conserva el texto y el anclaje tras un límite de frecuencia y los reenvía al reintentar', async () => {
  const target = {type: 'relation' as const, relationId: 'relation-1'};
  const payload = {content: 'Una observación sobre el vínculo', anchor: target};
  const created = {id: 'new-1', displayName: 'Lynx lynx', content: payload.content, anchor: target};
  fetchMock.mockResolvedValueOnce(reply({identity: null, csrfToken: null, comments: []}))
    .mockResolvedValueOnce({ok: false, status: 429, statusText: 'Too Many Requests', headers: {get: () => null},
      text: async () => JSON.stringify({error: {code: 'TOO_MANY_REQUESTS', message: 'Límite'}})})
    .mockResolvedValueOnce(reply(created))
    .mockResolvedValueOnce(reply({identity: {displayName: 'Lynx lynx'}, csrfToken: 'csrf', comments: [created]}));
  const onTargetChange = vi.fn();
  render(<PublicCommentsPanel token="retry-map" enabled open onClose={() => {}} target={target} targetLabel="Sustenta" onTargetChange={onTargetChange}/>);
  await screen.findByText('Todavía no hay comentarios.');
  const field = screen.getByRole('textbox', {name: 'Comentario'});
  fireEvent.change(field, {target: {value: payload.content}});
  fireEvent.click(screen.getByRole('button', {name: 'Publicar comentario'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Se alcanzó el límite');
  expect(field).toHaveValue(payload.content);
  expect(screen.getByText('Sobre: Sustenta')).toBeInTheDocument();
  expect(onTargetChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', {name: 'Publicar comentario'}));
  await waitFor(() => expect(onTargetChange).toHaveBeenCalledWith(null));
  const posts = fetchMock.mock.calls.filter(([, options]) => options?.method === 'POST');
  expect(posts.map(([, options]) => JSON.parse(options.body))).toEqual([payload, payload]);
});

it('no recupera un borrador que el visitante dejó vacío', async () => {
  fetchMock.mockResolvedValue(reply({identity: null, csrfToken: null, comments: []}));
  const panel = <PublicCommentsPanel token="clear-map" enabled open onClose={() => {}}/>;
  const view = render(panel);
  await screen.findByText('Todavía no hay comentarios.');
  const field = screen.getByRole('textbox', {name: 'Comentario'});
  fireEvent.change(field, {target: {value: 'Borrador'}});
  fireEvent.change(field, {target: {value: ''}});
  view.unmount();
  render(panel);
  expect(screen.queryByText('Hay un borrador sin publicar.')).not.toBeInTheDocument();
});

it('edita solo un comentario propio sin cambiar el anclaje ni crear otro', async () => {
  const own = { id: 'own-1', displayName: 'Ana', content: 'Texto inicial', createdAt: new Date().toISOString(), editedAt: null, revision: 1, editable: true, anchor: { type: 'resource', resourceId: 'resource-1', label: 'Fuente', x: 10, y: 20 } };
  const other = { ...own, id: 'other-1', displayName: 'Luis', content: 'Comentario ajeno', editable: false };
  fetchMock.mockResolvedValueOnce(reply({ identity: { displayName: 'Ana' }, csrfToken: 'csrf-value', comments: [own, other] }));
  render(<PublicCommentsPanel token="edit-token" enabled open onClose={() => {}}/>);
  await screen.findByText('Texto inicial');
  expect(screen.getAllByRole('button', { name: 'Editar comentario' })).toHaveLength(1);
  fireEvent.change(screen.getByRole('textbox', { name: 'Comentario' }), { target: { value: 'Comentario nuevo sin publicar' } });
  fireEvent.click(screen.getByRole('button', { name: 'Editar comentario' }));
  expect(screen.getByRole('textbox', { name: 'Comentario' })).toHaveValue('Texto inicial');
  expect(screen.getByText('Editando · Fuente')).toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox', { name: 'Comentario' }), { target: { value: 'Texto corregido' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('textbox', { name: 'Comentario' })).toHaveValue('Comentario nuevo sin publicar');
  expect(screen.getByRole('textbox', { name: 'Comentario' })).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Editar comentario' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Comentario' }), { target: { value: 'Texto corregido' } });
  const updated = { ...own, content: 'Texto corregido', revision: 2, editedAt: new Date().toISOString() };
  fetchMock.mockResolvedValueOnce(reply(updated));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await screen.findByText('Texto corregido');
  const patch = fetchMock.mock.calls.find(([, options]) => options?.method === 'PATCH');
  expect(new URL(String(patch?.[0])).pathname).toBe('/v1/public/shares/edit-token/comments/own-1');
  expect(patch?.[1]).toMatchObject({ credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'csrf-value' } });
  expect(JSON.parse(patch?.[1]?.body as string)).toEqual({ content: 'Texto corregido', expectedRevision: 1 });
  expect(screen.getByText(/Editado/)).toBeInTheDocument();
});

it.each([
  ['Conservar mi borrador', 'Mi borrador'],
  ['Usar texto vigente', 'Texto vigente'],
])('muestra el conflicto y aplica la decisión «%s»', async (action, finalContent) => {
  const own = { id: 'own-2', displayName: 'Ana', content: 'Versión inicial', createdAt: new Date().toISOString(), editedAt: null, revision: 1, editable: true, anchor: { type: 'diagram', x: 1, y: 2 } };
  fetchMock.mockResolvedValueOnce(reply({ identity: { displayName: 'Ana' }, csrfToken: 'csrf-value', comments: [own] }));
  render(<PublicCommentsPanel token="conflict-token" enabled open onClose={() => {}}/>);
  await screen.findByText('Versión inicial');
  fireEvent.click(screen.getByRole('button', { name: 'Editar comentario' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Comentario' }), { target: { value: 'Mi borrador' } });
  fetchMock.mockResolvedValueOnce({ ok: false, status: 409, statusText: 'Conflict', headers: { get: () => 'request-1' }, text: async () => JSON.stringify({ error: { code: 'REQUEST_FAILED', message: 'Conflicto', requestId: 'request-1', details: { current: { content: 'Texto vigente', revision: 2, editedAt: null } } } }) });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  const conflictPanel = await screen.findByRole('region', {name: 'Conflicto de edición'});
  expect(within(conflictPanel).getByText('Texto vigente')).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Comentario' })).toHaveValue('Mi borrador');
  fireEvent.click(screen.getByRole('button', { name: action }));
  expect(screen.getByRole('textbox', { name: 'Comentario' })).toHaveValue(finalContent);
  const updated = { ...own, content: finalContent, revision: 3, editedAt: new Date().toISOString() };
  fetchMock.mockResolvedValueOnce(reply(updated));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await screen.findByText('Comentario actualizado.');
  const patches = fetchMock.mock.calls.filter(([, options]) => options?.method === 'PATCH');
  expect(JSON.parse(patches[1]?.[1]?.body as string)).toEqual({content: finalContent, expectedRevision: 2});
});

it('mantiene el borrador y la revisión confirmada durante un guardado y una lectura anterior', async () => {
  const own = {id: 'mine', displayName: 'Ana', content: 'Texto anterior', createdAt: new Date().toISOString(), editedAt: null,
    revision: 1, editable: true, anchor: {type: 'diagram'}};
  const initial = {identity: {displayName: 'Ana'}, csrfToken: 'csrf', comments: [own]};
  let finishRefresh!: (value: ReturnType<typeof reply>) => void;
  let finishSave!: (value: ReturnType<typeof reply>) => void;
  const refresh = new Promise<ReturnType<typeof reply>>(resolve => { finishRefresh = resolve; });
  const save = new Promise<ReturnType<typeof reply>>(resolve => { finishSave = resolve; });
  fetchMock.mockResolvedValueOnce(reply({...initial, nextCursor: 'more'}))
    .mockReturnValueOnce(refresh).mockReturnValueOnce(save);
  render(<PublicCommentsPanel token="pending-edit" enabled open onClose={() => {}}/>);
  await screen.findByText(own.content);
  fireEvent.click(screen.getByRole('button', {name: 'Cargar comentarios anteriores'}));
  const field = screen.getByRole('textbox', {name: 'Comentario'});
  fireEvent.change(field, {target: {value: 'Borrador de otro comentario'}});
  fireEvent.click(screen.getByRole('button', {name: 'Editar comentario'}));
  fireEvent.change(field, {target: {value: 'Texto corregido'}});
  fireEvent.click(screen.getByRole('button', {name: 'Guardar cambios'}));
  expect(screen.getByRole('button', {name: 'Cancelar'})).toBeDisabled();
  fireEvent.keyDown(field, {key: 'Escape'});
  expect(field).toHaveValue('Texto corregido');
  await act(async () => finishSave(reply({...own, content: 'Texto corregido', revision: 2})));
  expect(field).toHaveValue('Borrador de otro comentario');
  await act(async () => finishRefresh(reply(initial)));
  expect(screen.getByText('Texto corregido')).toBeInTheDocument();
  expect(screen.queryByText(own.content)).not.toBeInTheDocument();
});

it('explica la pérdida de identidad al refrescar y conserva la edición para copiar', async () => {
  const own = {id: 'mine', displayName: 'Ana', content: 'Texto anterior', createdAt: new Date().toISOString(),
    editedAt: null, revision: 1, editable: true, anchor: {type: 'diagram'}};
  fetchMock.mockResolvedValueOnce(reply({identity: {displayName: 'Ana'}, csrfToken: 'csrf', comments: [own], nextCursor: 'more'}))
    .mockResolvedValueOnce(reply({identity: null, csrfToken: null, comments: [{...own, editable: false}]}));
  render(<PublicCommentsPanel token="expired-edit" enabled open onClose={() => {}}/>);
  await screen.findByText(own.content);
  fireEvent.click(screen.getByRole('button', {name: 'Editar comentario'}));
  const field = screen.getByRole('textbox', {name: 'Comentario'});
  fireEvent.change(field, {target: {value: 'Texto para conservar'}});
  fireEvent.click(screen.getByRole('button', {name: 'Cargar comentarios anteriores'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Tu identidad de comentario ya no está disponible');
  expect(field).toHaveValue('Texto para conservar');
  expect(screen.getByRole('button', {name: 'Guardar cambios'})).toBeDisabled();
});

it('vincula la cookie vigente a Clerk y publica con la cuenta verificada', async () => {
  auth.signedIn = true;
  const prior = { id: 'prior', displayName: 'Lynx lynx', content: 'Anterior', createdAt: new Date().toISOString(), editedAt: null, revision: 1, editable: false, anchor: { type: 'diagram' } };
  const linked = { ...prior, displayName: 'Investigadora', editable: true };
  const created = { ...linked, id: 'new', content: 'Nuevo comentario' };
  fetchMock.mockResolvedValueOnce(reply({ identity: { displayName: 'Investigadora' }, csrfToken: 'csrf', comments: [prior] }))
    .mockResolvedValueOnce(reply({ claimed: 1 }))
    .mockResolvedValueOnce(reply({ identity: { displayName: 'Investigadora' }, csrfToken: 'csrf', comments: [linked] }))
    .mockResolvedValueOnce(reply(created))
    .mockResolvedValueOnce(reply({ identity: { displayName: 'Investigadora' }, csrfToken: 'csrf', comments: [created, linked] }));
  render(<PublicCommentsPanel token="linked-token" enabled open onClose={() => {}}/>);
  await screen.findByText('Participas como Investigadora.');
  await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/comments/claim'))).toBe(true));
  const claim = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/comments/claim'));
  expect(claim?.[1]).toMatchObject({ method: 'POST', headers: { Authorization: 'Bearer verified-clerk-token', 'X-CSRF-Token': 'csrf' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Comentario' }), { target: { value: 'Nuevo comentario' } });
  fireEvent.click(screen.getByRole('button', { name: 'Publicar comentario' }));
  await screen.findByText('Nuevo comentario');
  const publish = fetchMock.mock.calls.find(([url, options]) => String(url).endsWith('/comments') && options?.method === 'POST');
  expect(publish?.[1]?.headers).toMatchObject({ Authorization: 'Bearer verified-clerk-token' });
});
