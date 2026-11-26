import {act, cleanup, render, screen} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {afterEach, expect, it, vi} from 'vitest';
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
