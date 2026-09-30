import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PublicCommentsPanel } from '../src/pages/PublicCommentsPanel';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);
afterEach(() => { cleanup(); fetchMock.mockReset(); });
const reply = (data: unknown) => ({ ok: true, status: 200, text: async () => JSON.stringify({ data }) });

it('permite leer sin identidad y crea el nombre solo al confirmar el primer comentario', async () => {
  const created = { id: 'comment-1', displayName: 'Ana', content: 'Mi observación', createdAt: new Date().toISOString(), editable: true, anchor: { type: 'diagram' } };
  fetchMock.mockResolvedValueOnce(reply({ identity: null, csrfToken: null, comments: [] }))
    .mockResolvedValueOnce(reply(created))
    .mockResolvedValueOnce(reply({ identity: { displayName: 'Ana' }, csrfToken: 'csrf-value', comments: [created] }));
  render(<PublicCommentsPanel token="public-token" enabled open onClose={() => {}} />);
  expect(await screen.findByText('Todavía no hay comentarios.')).toBeInTheDocument();
  expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ credentials: 'include' });
  fireEvent.change(screen.getByRole('textbox', { name: 'Comentario sobre el mapa' }), { target: { value: 'Mi observación' } });
  fireEvent.click(screen.getByRole('button', { name: 'Publicar comentario' }));
  expect(screen.getByText('Escribe un nombre de hasta 60 caracteres.')).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Comentario sobre el mapa' })).toHaveValue('Mi observación');
  expect(fetchMock).toHaveBeenCalledTimes(1);
  fireEvent.change(screen.getByRole('textbox', { name: 'Nombre visible' }), { target: { value: 'Ana' } });
  fireEvent.click(screen.getByRole('button', { name: 'Publicar comentario' }));
  await waitFor(() => expect(screen.getByText('Participas como Ana.')).toBeInTheDocument());
  expect(screen.getByText('Mi observación')).toBeInTheDocument();
  expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({ method: 'POST', credentials: 'include' });
});
