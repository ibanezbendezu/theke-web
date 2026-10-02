import {useAuth} from '@clerk/clerk-react';
import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {thekeFetch} from '../api/httpClient';

export interface Project {
    id: string;
    name: string;
    collectionFolderId?: string | null;
    archivedAt: string | null;
    createdAt: string;
    updatedAt: string
}

interface ProjectPage {
    data: Project[];
    meta: { nextCursor: string | null }
}

interface Envelope<T> {
    data: T
}

export function useProjects(status: 'active' | 'archived', collectionFolderId?: string) {
    const {getToken, userId} = useAuth();
    return useInfiniteQuery({
        queryKey: ['private', 'projects', userId, status, collectionFolderId],
        enabled: Boolean(userId),
        initialPageParam: '',
        queryFn: async ({pageParam, signal}) => {
            const token = await getToken();
            const query = new URLSearchParams({status, limit: '20'});
            if (pageParam) query.set('cursor', pageParam);
            if (collectionFolderId) query.set('collectionFolderId', collectionFolderId);
            const response = await thekeFetch<{
                data: ProjectPage
            }>(`/v1/projects?${query}`, {headers: {Authorization: `Bearer ${token}`}, signal});
            return response.data;
        },
        getNextPageParam: page => page.meta.nextCursor ?? undefined,
    });
}

export function useProject(id?: string) {
    const {getToken, userId} = useAuth();
    return useQuery({
        queryKey: ['private', 'project', userId, id], enabled: Boolean(userId && id),
        queryFn: async ({signal}) => {
            const token = await getToken();
            const response = await thekeFetch<{
                data: Envelope<Project>
            }>(`/v1/projects/${id}`, {headers: {Authorization: `Bearer ${token}`}, signal});
            return response.data.data;
        },
    });
}

export function useProjectActions() {
    const {getToken} = useAuth();
    const client = useQueryClient();
    const request = async (path: string, method: string, body?: object) => {
        const token = await getToken();
        const response = await thekeFetch<{ data: Envelope<Project> }>(path, {
            method,
            headers: {Authorization: `Bearer ${token}`, ...(body ? {'Content-Type': 'application/json'} : {})},
            body: body ? JSON.stringify(body) : undefined
        });
        return response.data.data;
    };
    const refresh = () => {
        void client.invalidateQueries({queryKey: ['private', 'projects']});
        void client.invalidateQueries({queryKey: ['private', 'project']});
    };
    return {
        create: useMutation({
            mutationFn: (value: string | {
                name: string;
                collectionFolderId?: string
            }) => request('/v1/projects', 'POST', typeof value === 'string' ? {name: value} : value), onSuccess: refresh
        }),
        rename: useMutation({
            mutationFn: ({id, name}: {
                id: string;
                name: string
            }) => request(`/v1/projects/${id}`, 'PATCH', {name}), onSuccess: refresh
        }),
        archive: useMutation({
            mutationFn: (id: string) => request(`/v1/projects/${id}/archive`, 'POST'),
            onSuccess: refresh
        }),
        restore: useMutation({
            mutationFn: (id: string) => request(`/v1/projects/${id}/restore`, 'POST'),
            onSuccess: refresh
        }),
    };
}
