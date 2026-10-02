import {useAuth} from '@clerk/clerk-react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {thekeFetch} from '../api/httpClient';

export interface LibraryFolder {
    id: string;
    name: string;
    parentFolderId: string | null;
    createdAt: string;
    updatedAt: string
}

export function useLibraryFolders(enabled = true) {
    const {getToken, userId} = useAuth();
    return useQuery({
        queryKey: ['private', 'library-folders', userId], enabled: Boolean(userId && enabled), queryFn: async () => {
            const token = await getToken();
            const result = await thekeFetch<{
                data: { data: LibraryFolder[] }
            }>('/v1/library-folders', {headers: {Authorization: `Bearer ${token}`}});
            return result.data.data;
        }
    });
}

export function useLibraryFolderActions() {
    const {getToken} = useAuth();
    const client = useQueryClient();
    const request = async (path: string, method: string, body?: object) => {
        const token = await getToken();
        const result = await thekeFetch<{ data: { data: unknown } }>(`/v1/library-folders${path}`, {
            method,
            headers: {Authorization: `Bearer ${token}`, ...(body ? {'Content-Type': 'application/json'} : {})},
            body: body ? JSON.stringify(body) : undefined
        });
        return result.data.data;
    };
    const refresh = () => {
        void client.invalidateQueries({queryKey: ['private', 'library-folders']});
        void client.invalidateQueries({queryKey: ['private', 'resources']});
    };
    return {
        create: useMutation({
            mutationFn: ({name, parentFolderId}: {
                name: string;
                parentFolderId: string | null
            }) => request('', 'POST', {name, parentFolderId}), onSuccess: refresh
        }),
        rename: useMutation({
            mutationFn: ({id, name}: {
                id: string;
                name: string
            }) => request(`/${id}`, 'PATCH', {name}), onSuccess: refresh
        }),
        remove: useMutation({mutationFn: (id: string) => request(`/${id}`, 'DELETE'), onSuccess: refresh}),
        move: useMutation({
            mutationFn: ({resourceIds, folderId}: {
                resourceIds: string[];
                folderId: string | null
            }) => request('/resources', 'PATCH', {resourceIds, folderId}), onSuccess: refresh
        }),
        moveFolder: useMutation({
            mutationFn: ({id, parentFolderId}: {
                id: string;
                parentFolderId: string | null
            }) => request(`/${id}/parent`, 'PATCH', {parentFolderId}), onSuccess: refresh
        }),
    };
}
