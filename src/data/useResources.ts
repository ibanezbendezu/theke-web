import {useAuth} from '@clerk/clerk-react';
import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {thekeFetch} from '../api/httpClient';

export interface ResourceSummary {
    id: string;
    title: string;
    description: string | null;
    type: 'note' | 'file' | 'link';
    mediaType: string | null;
    byteSize: number | null;
    origin: string;
    status: 'ready' | 'archived';
    archivedAt?: string | null;
    updatedAt: string;
    libraryFolderId?: string | null;
    accessibilityText: string | null;
    accessibilityRequired: boolean;
    accessibilityMissing: boolean;
    url?: string | null;
    previewImageUrl?: string | null;
    metadataStatus?: 'pending' | 'ready' | 'failed' | null
}

export type PropertyType = 'text' | 'list' | 'number' | 'checkbox' | 'date' | 'datetime';

export interface PropertyInput {
    key: string;
    type: PropertyType;
    value: string | number | boolean | string[]
}

export interface ResourceDetail extends ResourceSummary {
    content?: string;
    aliases: string[];
    tags: string[];
    properties: Record<string, string | number | boolean | string[]>;
    versionId: string | null
}

export interface ResourceMention {
    id: string;
    sourceResourceId: string;
    sourceVersionId: string;
    targetResourceId: string | null;
    rawTarget: string;
    displayText: string | null;
    anchor: string | null;
    startOffset: number;
    endOffset: number;
    resolution: 'linked' | 'unresolved' | 'ambiguous';
    targetTitle?: string | null;
    sourceTitle?: string
}

export interface ResourceReferences {
    outgoing: ResourceMention[];
    incoming: ResourceMention[]
}

interface Page {
    data: ResourceSummary[];
    meta: { nextCursor: string | null }
}

interface Envelope<T> {
    data: T
}

export interface ResourceFilters {
    query?: string;
    type?: 'note' | 'file' | 'link';
    status?: 'active' | 'archived';
    projectId?: string;
    folderId?: string;
    libraryFolderId?: string;
    tag?: string
}

function useRequest() {
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

export function useResources(filters: ResourceFilters = {}, enabled = true) {
    const {userId} = useAuth();
    const request = useRequest();
    return useInfiniteQuery({
        queryKey: ['private', 'resources', userId, filters],
        enabled: Boolean(userId && enabled),
        initialPageParam: '',
        queryFn: ({pageParam, signal}) => {
            const query = new URLSearchParams();
            if (pageParam) query.set('cursor', pageParam);
            if (filters.query) query.set('q', filters.query);
            if (filters.type) query.set('type', filters.type);
            if (filters.status) query.set('status', filters.status);
            if (filters.projectId) query.set('projectId', filters.projectId);
            if (filters.folderId) query.set('folderId', filters.folderId);
            if (filters.libraryFolderId) query.set('libraryFolderId', filters.libraryFolderId);
            if (filters.tag) query.set('tag', filters.tag);
            const suffix = query.size ? `?${query}` : '';
            return request<Page>(`/v1/resources${suffix}`, {signal});
        },
        getNextPageParam: page => page.meta?.nextCursor ?? undefined,
        placeholderData: previous => previous
    });
}

export function useResource(id?: string) {
    const request = useRequest();
    return useQuery({
        queryKey: ['private', 'resource', id],
        enabled: Boolean(id),
        queryFn: () => request<Envelope<ResourceDetail>>(`/v1/resources/${id}`).then(value => value.data)
    });
}

export function useResourceKnowledge(id?: string) {
    const request = useRequest();
    const client = useQueryClient();
    const references = useQuery({
        queryKey: ['private', 'resource-references', id],
        enabled: Boolean(id),
        queryFn: () => request<Envelope<ResourceReferences>>(`/v1/resources/${id}/references`).then(value => value.data)
    });
    const definitions = useQuery({
        queryKey: ['private', 'property-definitions'],
        queryFn: () => request<Envelope<{
            key: string;
            type: PropertyType
        }[]>>('/v1/resources/property-definitions').then(value => value.data)
    });
    const save = useMutation({
        mutationFn: (input: {
            aliases: string[];
            tags: string[];
            properties: PropertyInput[];
            expectedUpdatedAt: string
        }) => request<Envelope<ResourceDetail>>(`/v1/resources/${id}/metadata`, {
            method: 'PATCH',
            body: JSON.stringify(input)
        }).then(value => value.data), onSuccess: () => {
            void client.invalidateQueries({queryKey: ['private', 'resources']});
            void client.invalidateQueries({queryKey: ['private', 'resource', id]});
            void client.invalidateQueries({queryKey: ['private', 'property-definitions']});
        }
    });
    return {references, definitions, save};
}

export function useResourceAccess(id: string, enabled: boolean) {
    const request = useRequest();
    return useQuery({
        queryKey: ['private', 'resource-access', id, 'inline'],
        enabled,
        staleTime: 240_000,
        queryFn: () => request<Envelope<{
            url: string
        }>>(`/v1/resources/${id}/access?mode=inline`).then(value => value.data)
    });
}

export function useResourceActions() {
    const request = useRequest();
    const client = useQueryClient();
    const refresh = () => {
        void client.invalidateQueries({queryKey: ['private', 'resources']});
        void client.invalidateQueries({queryKey: ['private', 'resource']});
    };
    return {
        access: (id: string, mode: 'inline' | 'download') => request<Envelope<{
            url: string
        }>>(`/v1/resources/${id}/access?mode=${mode}`).then(value => value.data),
        accessibility: useMutation({
            mutationFn: ({id, text}: {
                id: string;
                text: string
            }) => request<Envelope<ResourceDetail>>(`/v1/resources/${id}/accessibility`, {
                method: 'PATCH',
                body: JSON.stringify({text})
            }).then(value => value.data), onSuccess: refresh
        }),
        renameFile: useMutation({
            mutationFn: ({id, title, expectedUpdatedAt}: {
                id: string;
                title: string;
                expectedUpdatedAt: string
            }) => request<Envelope<ResourceDetail>>(`/v1/resources/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({title, expectedUpdatedAt})
            }).then(value => value.data), onSuccess: value => {
                client.setQueryData(['private', 'resource', value.id], value);
                refresh();
            }
        })
    };
}

export function useLinkActions() {
    const request = useRequest();
    const client = useQueryClient();
    const refresh = () => {
        void client.invalidateQueries({queryKey: ['private', 'resources']});
        void client.invalidateQueries({queryKey: ['private', 'resource']});
    };
    const create = useMutation({
        mutationFn: (value: {
            url: string
        }) => request<Envelope<ResourceDetail>>('/v1/links', {
            method: 'POST',
            body: JSON.stringify(value)
        }).then(result => result.data), onSuccess: refresh
    });
    const update = useMutation({
        mutationFn: (value: {
            id: string;
            title: string;
            description: string
        }) => request<Envelope<ResourceDetail>>(`/v1/links/${value.id}`, {
            method: 'PATCH',
            body: JSON.stringify(value)
        }).then(result => result.data), onSuccess: refresh
    });
    const retry = useMutation({
        mutationFn: (value: {
            id: string
        }) => request<Envelope<ResourceDetail>>(`/v1/links/${value.id}/metadata-retries`, {method: 'POST'}).then(result => result.data),
        onSuccess: refresh
    });
    return {create, update, retry};
}
