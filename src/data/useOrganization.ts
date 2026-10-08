import {useAuth} from '@clerk/clerk-react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {thekeFetch} from '../api/httpClient';

export interface ProjectFolder {
    id: string;
    name: string;
    parentFolderId: string | null;
    archivedAt: string | null
}

export interface ProjectResource {
    id: string;
    resourceId: string;
    folderId: string | null;
    title: string;
    description: string | null;
    type: 'note' | 'file' | 'link';
    mediaType: string | null;
    archivedAt: string | null;
    updatedAt: string
}

export interface Organization {
    folders: ProjectFolder[];
    resources: ProjectResource[]
}

interface Envelope<T> {
    data: T
}

export function useOrganization(projectId?: string) {
    const {getToken, userId} = useAuth();
    return useQuery({
        queryKey: ['private', 'organization', userId, projectId],
        enabled: Boolean(userId && projectId),
        queryFn: async () => {
            const token = await getToken();
            const response = await thekeFetch<{
                data: Envelope<Organization>
            }>(`/v1/projects/${projectId}/organization`, {headers: {Authorization: `Bearer ${token}`}});
            return response.data.data;
        }
    });
}

export function useOrganizationActions(projectId: string) {
    const {getToken} = useAuth();
    const client = useQueryClient();
    const request = async (path: string, method: string, body?: object) => {
        const token = await getToken();
        const response = await thekeFetch<{ data: Envelope<unknown> }>(`/v1/projects/${projectId}/${path}`, {
            method,
            headers: {Authorization: `Bearer ${token}`, ...(body ? {'Content-Type': 'application/json'} : {})},
            body: body ? JSON.stringify(body) : undefined
        });
        return response.data.data;
    };
    const refresh = () => client.invalidateQueries({queryKey: ['private', 'organization']});
    return {
        createFolder: useMutation({
            mutationFn: (name: string) => request('folders', 'POST', {name}),
            onSuccess: refresh
        }),
        renameFolder: useMutation({
            mutationFn: ({id, name}: {
                id: string;
                name: string
            }) => request(`folders/${id}`, 'PATCH', {name}), onSuccess: refresh
        }),
        archiveFolder: useMutation({
            mutationFn: (id: string) => request(`folders/${id}/archive`, 'POST'),
            onSuccess: refresh
        }),
        restoreFolder: useMutation({
            mutationFn: (id: string) => request(`folders/${id}/restore`, 'POST'),
            onSuccess: refresh
        }),
        addResources: useMutation({
            mutationFn: (resourceIds: string[]) => request('resources', 'POST', {resourceIds}),
            onSuccess: refresh
        }),
        moveResources: useMutation({
            mutationFn: ({resourceIds, folderId}: {
                resourceIds: string[];
                folderId: string | null
            }) => request('resources', 'PATCH', {resourceIds, folderId}), onSuccess: refresh
        }),
    };
}
