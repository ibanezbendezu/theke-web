import {useAuth} from '@clerk/clerk-react';
import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {thekeFetch} from '../api/httpClient';

export interface NoteSummary {
    id: string;
    title: string;
    description: string | null;
    updatedAt: string
}

export interface Note extends NoteSummary {
    currentVersion: { id: string; ordinal: number; content: string };
    contentUnchanged?: boolean
}

interface Page {
    data: NoteSummary[];
    meta: { nextCursor: string | null }
}

interface Envelope<T> {
    data: T
}

export interface NoteInput {
    title: string;
    description: string;
    content: string
}

function useTokenRequest() {
    const {getToken} = useAuth();
    return async <T>(path: string, options?: RequestInit) => {
        const token = await getToken();
        const response = await thekeFetch<{ data: T }>(path, {
            ...options,
            headers: {Authorization: `Bearer ${token}`, ...(options?.body ? {'Content-Type': 'application/json'} : {})}
        });
        return response.data;
    };
}

export function useNotes() {
    const {userId} = useAuth();
    const request = useTokenRequest();
    return useInfiniteQuery({
        queryKey: ['private', 'notes', userId],
        enabled: Boolean(userId),
        initialPageParam: '',
        queryFn: ({pageParam}) => request<Page>(`/v1/notes${pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : ''}`),
        getNextPageParam: page => page.meta.nextCursor ?? undefined
    });
}

export function useNote(id?: string) {
    const request = useTokenRequest();
    return useQuery({
        queryKey: ['private', 'note', id],
        enabled: Boolean(id),
        queryFn: () => request<Envelope<Note>>(`/v1/notes/${id}`).then(value => value.data)
    });
}

export function useNoteActions() {
    const request = useTokenRequest();
    const client = useQueryClient();
    const refresh = () => {
        void client.invalidateQueries({queryKey: ['private', 'notes']});
        void client.invalidateQueries({queryKey: ['private', 'note']});
        void client.invalidateQueries({queryKey: ['private', 'resources']});
        void client.invalidateQueries({queryKey: ['private', 'resource']});
        void client.invalidateQueries({queryKey: ['private', 'resource-references']});
    };
    return {
        create: useMutation({
            mutationFn: (body: NoteInput) => request<Envelope<Note>>('/v1/notes', {
                method: 'POST',
                body: JSON.stringify(body)
            }).then(value => value.data), onSuccess: refresh
        }),
        update: useMutation({
            mutationFn: ({id, body}: {
                id: string;
                body: NoteInput
            }) => request<Envelope<Note>>(`/v1/notes/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(body)
            }).then(value => value.data), onSuccess: refresh
        }),
    };
}
