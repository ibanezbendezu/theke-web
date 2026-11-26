import {act, cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {MemoryRouter, useLocation} from 'react-router-dom';
import {afterEach, expect, it, vi} from 'vitest';
import {CommentNotificationsPanel} from '../src/components/comments/CommentNotificationsPanel';
import {useCommentNotifications, useCommentNotificationStream} from '../src/data/useCommentNotifications';

const auth = vi.hoisted(() => ({userId: 'author-1', getToken: async () => 'author-token'}));
vi.mock('@clerk/clerk-react', () => ({useAuth: () => auth}));

function UnreadCount() {
    const notices = useCommentNotifications();
    useCommentNotificationStream();
    return <output aria-label="Comentarios pendientes">{notices.data?.unreadCount}</output>;
}

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

it('refresca el contador cuando un evento SSE llega partido entre fragmentos', async () => {
    const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
    let unreadCount = 1;
    let pushEvent!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({start(controller) { pushEvent = controller; }});
    const fetchMock = vi.fn(async (url: string) => String(url).endsWith('/events')
        ? {ok: true, body: stream}
        : {ok: true, status: 200, text: async () => JSON.stringify({data: {items: [], unreadCount, page: 1, hasMore: false}})});
    vi.stubGlobal('fetch', fetchMock);
    const view = render(<QueryClientProvider client={client}><UnreadCount/></QueryClientProvider>);
    await screen.findByText('1');

    unreadCount = 2;
    const encoder = new TextEncoder();
    await act(async () => {
        pushEvent.enqueue(encoder.encode('event: comments\r\ndata: {"unreadCount":2}\r\n\r'));
        pushEvent.enqueue(encoder.encode('\n'));
    });
    await screen.findByText('2');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/events'), expect.objectContaining({
        headers: {Authorization: 'Bearer author-token', Accept: 'text/event-stream'}
    }));
    view.unmount();
    pushEvent.close();
    client.clear();
});

it('conserva la reapertura como pendiente y elimina solo tras confirmar', async () => {
    const client = new QueryClient({defaultOptions: {queries: {retry: false}}});
    const date = '2026-11-26T00:00:00Z';
    let notice = {id: 'notice', commentId: 'comment', diagramId: 'diagram', projectId: 'project', diagramName: 'Mapa',
        content: 'Texto del visitante', displayName: 'Ana', anchor: {type: 'diagram'}, anchored: false,
        createdAt: date, resolvedAt: date as string | null, readAt: date as string | null};
    let removed = false;
    const reply = (data: unknown) => ({ok: true, status: 200, text: async () => JSON.stringify({data})});
    const fetchMock = vi.fn(async (url: string, options: RequestInit) => {
        if (url.endsWith('/reopen')) {
            notice = {...notice, resolvedAt: null, readAt: null};
            return reply({id: notice.id, resolvedAt: null, deleted: false});
        }
        if (options.method === 'DELETE') {
            removed = true;
            return reply({id: notice.id, deleted: true});
        }
        return reply({items: removed ? [] : [notice], unreadCount: !removed && !notice.readAt ? 1 : 0, page: 1, hasMore: false});
    });
    vi.stubGlobal('fetch', fetchMock);
    function Panel() {
        const location = useLocation();
        return <><CommentNotificationsPanel diagramId="diagram" selectedId={new URLSearchParams(location.search).get('comment')}/>
            <output aria-label="Ruta">{location.search}{location.hash}</output></>;
    }
    render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/map?comment=comment&mode=inspect#map']}>
        <Panel/>
    </MemoryRouter></QueryClientProvider>);
    fireEvent.click(await screen.findByRole('button', {name: 'Reabrir'}));
    await screen.findByRole('button', {name: 'Resolver'});
    expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/read'))).toBe(false);
    expect(screen.getByRole('heading', {name: /1 pendientes/})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Eliminar'}));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', {name: 'Cancelar'}));
    expect(fetchMock.mock.calls.some(([, options]) => options.method === 'DELETE')).toBe(false);
    fireEvent.click(screen.getByRole('button', {name: 'Eliminar'}));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', {name: 'Eliminar'}));
    await waitFor(() => expect(screen.queryByText('Texto del visitante')).not.toBeInTheDocument());
    expect(screen.getByLabelText('Ruta')).toHaveTextContent('?mode=inspect#map');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/comment-notifications\/notice$/), expect.objectContaining({method: 'DELETE'}));
    client.clear();
});
