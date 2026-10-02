import {useAuth} from '@clerk/clerk-react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {thekeFetch} from '../api/httpClient';

export interface ProjectFolder {
    id: string;
    name: string;
    parentFolderId: string | null;
    createdAt: string;
    updatedAt: string
}

export function useProjectFolders(enabled = true) {
    const {getToken, userId} = useAuth();
    return useQuery({
        queryKey: ['private', 'project-folders', userId],
        enabled: Boolean(userId && enabled),
        queryFn: async () => {
            const token = await getToken();
            const result = await thekeFetch<{
                data: { data: ProjectFolder[] }
            }>('/v1/project-folders', {headers: {Authorization: `Bearer ${token}`}});
            return result.data.data;
        }
    });
}

export function useProjectFolderActions() {
    const {getToken} = useAuth();
    const client = useQueryClient();
    const request = async (path: string, method: string, body?: object) => {
        const token = await getToken();
        const result = await thekeFetch<{ data: { data: unknown } }>(`/v1/project-folders${path}`, {
            method,
            headers: {Authorization: `Bearer ${token}`, ...(body ? {'Content-Type': 'application/json'} : {})},
            body: body ? JSON.stringify(body) : undefined
        });
        return result.data.data;
    };
    const refresh = () => {
        void client.invalidateQueries({queryKey: ['private', 'project-folders']});
        void client.invalidateQueries({queryKey: ['private', 'projects']});
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
            mutationFn: ({projectIds, folderId}: {
                projectIds: string[];
                folderId: string | null
            }) => request('/projects', 'PATCH', {projectIds, folderId}), onSuccess: refresh
        }),
        moveFolder: useMutation({
            mutationFn: ({id, parentFolderId}: {
                id: string;
                parentFolderId: string | null
            }) => request(`/${id}/parent`, 'PATCH', {parentFolderId}), onSuccess: refresh
        }),
    };
}
