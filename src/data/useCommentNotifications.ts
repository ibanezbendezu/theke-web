import {useAuth} from '@clerk/clerk-react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect} from 'react';
import {thekeFetch} from '../api/httpClient';
import type {CommentAnchor} from '../pages/publicCommentTypes';

export type CommentNotification = {
    id: string;
    commentId: string;
    diagramId: string;
    projectId: string;
    diagramName: string;
    displayName: string;
    content: string;
    anchor: CommentAnchor;
    createdAt: string;
    readAt: string | null;
    resolvedAt: string | null;
    anchored: boolean;
};

export type CommentNotificationFilter = 'all' | 'pending' | 'resolved' | 'anchored' | 'unanchored';
type Page = {items: CommentNotification[]; page: number; hasMore: boolean; unreadCount: number};

export function useCommentNotifications(page = 1, filter: CommentNotificationFilter = 'all', diagramId?: string, commentId?: string) {
    const {getToken, userId} = useAuth();
    return useQuery({
        queryKey: ['comment-notifications', userId, diagramId ?? 'all', commentId ?? 'all', filter, page],
        enabled: Boolean(userId),
        refetchInterval: 20_000,
        queryFn: async () => {
            const params = new URLSearchParams({page: String(page), filter});
            if (diagramId) params.set('diagramId', diagramId);
            if (commentId) params.set('commentId', commentId);
            const response = await thekeFetch<{data: {data: Page}}>(`/v1/comment-notifications?${params}`, {
                headers: {Authorization: `Bearer ${await getToken()}`}, cache: 'no-store'
            });
            return response.data.data;
        }
    });
}

export function useReadCommentNotification() {
    const {getToken} = useAuth();
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => thekeFetch(`/v1/comment-notifications/${id}/read`, {
            method: 'PATCH', headers: {Authorization: `Bearer ${await getToken()}`}, cache: 'no-store'
        }),
        onSuccess: () => void client.invalidateQueries({queryKey: ['comment-notifications']})
    });
}

export function useCommentNotificationStream() {
    const {getToken, userId} = useAuth();
    const client = useQueryClient();
    useEffect(() => {
        if (!userId) return;
        const controller = new AbortController();
        const connect = async () => {
            while (!controller.signal.aborted) {
                try {
                    const base = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
                    if (!base) return;
                    const response = await fetch(`${base}/v1/comment-notifications/events`, {
                        headers: {Authorization: `Bearer ${await getToken()}`, Accept: 'text/event-stream'},
                        cache: 'no-store', signal: controller.signal
                    });
                    if (!response.ok || !response.body) throw new Error('No se pudo abrir el canal de avisos.');
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let pending = '';
                    while (!controller.signal.aborted) {
                        const {done, value} = await reader.read();
                        if (done) break;
                        pending += decoder.decode(value, {stream: true}).replace(/\r\n/g, '\n');
                        let end = pending.indexOf('\n\n');
                        while (end !== -1) {
                            if (pending.slice(0, end).split('\n').some(line => line.startsWith('data:'))) {
                                void client.invalidateQueries({queryKey: ['comment-notifications']});
                            }
                            pending = pending.slice(end + 2);
                            end = pending.indexOf('\n\n');
                        }
                    }
                } catch {
                    // La consulta paginada también refresca al recuperar foco y por intervalo.
                }
                if (!controller.signal.aborted) await new Promise(resolve => setTimeout(resolve, 5000));
            }
        };
        void connect();
        return () => controller.abort();
    }, [client, getToken, userId]);
}
