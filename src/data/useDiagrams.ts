import {useAuth} from '@clerk/clerk-react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {Edge, Node} from '@xyflow/react';
import {thekeFetch} from '../api/httpClient';
import {useCallback} from 'react';

export interface CanvasBackground {
    variant: 'plain' | 'dots' | 'grid';
    tone: 'default' | 'surface'
}

export interface DiagramDocument {
    schemaVersion: number;
    nodes: Node[];
    edges: Edge[];
    viewport: { x: number; y: number; zoom: number };
    background?: CanvasBackground
}

export interface Diagram {
    id: string;
    projectId: string;
    name: string;
    document: DiagramDocument;
    revision: number;
    archivedAt: string | null;
    createdAt: string;
    updatedAt: string
}

export type DiagramSummary = Omit<Diagram, 'document'>;

interface Envelope<T> {
    data: T
}

async function authHeaders(getToken: () => Promise<string | null>) {
    return {Authorization: `Bearer ${await getToken()}`};
}

export function useDiagrams(projectId?: string, status: 'active' | 'archived' = 'active') {
    const {getToken, userId} = useAuth();
    return useQuery({
        queryKey: ['private', 'diagrams', userId, projectId, status],
        enabled: Boolean(userId && projectId),
        queryFn: async ({signal}) => {
            const response = await thekeFetch<{
                data: Envelope<DiagramSummary[]>
            }>(`/v1/projects/${projectId}/diagrams?status=${status}`, {headers: await authHeaders(getToken), signal});
            return response.data.data;
        }
    });
}

export function useDiagram(id?: string) {
    const {getToken, userId} = useAuth();
    return useQuery({
        queryKey: ['private', 'diagram', userId, id],
        enabled: Boolean(userId && id),
        queryFn: async ({signal}) => {
            const response = await thekeFetch<{
                data: Envelope<Diagram>
            }>(`/v1/diagrams/${id}`, {headers: await authHeaders(getToken), signal});
            return response.data.data;
        }
    });
}

export function useSaveDiagramDocument(id: string) {
    const {getToken} = useAuth();
    return useCallback(async (document: DiagramDocument, expectedRevision: number, idempotencyKey: string) => {
        const response = await thekeFetch<{
            data: Envelope<{ document: DiagramDocument; revision: number; updatedAt: string }>
        }>(`/v1/diagrams/${id}/document`, {
            method: 'PUT',
            headers: {...(await authHeaders(getToken)), 'Content-Type': 'application/json'},
            body: JSON.stringify({document, expectedRevision, idempotencyKey})
        });
        return response.data.data;
    }, [getToken, id]);
}

export function useDiagramActions(projectId: string) {
    const {getToken} = useAuth();
    const client = useQueryClient();
    const refresh = () => void client.invalidateQueries({queryKey: ['private', 'diagrams']});
    const request = async (path: string, method: string, body?: unknown) => {
        const response = await thekeFetch<{ data: Envelope<Diagram> }>(path, {
            method,
            headers: {...(await authHeaders(getToken)), 'Content-Type': 'application/json'},
            body: body === undefined ? undefined : JSON.stringify(body)
        });
        return response.data.data;
    };
    const create = useMutation({
        mutationFn: (name: string) => request(`/v1/projects/${projectId}/diagrams`, 'POST', {name}),
        onSuccess: refresh
    });
    const rename = useMutation({
        mutationFn: ({id, name}: {
            id: string;
            name: string
        }) => request(`/v1/diagrams/${id}`, 'PATCH', {name}), onSuccess: refresh
    });
    const duplicate = useMutation({
        mutationFn: (id: string) => request(`/v1/diagrams/${id}/duplicates`, 'POST', {}),
        onSuccess: refresh
    });
    const restore = useMutation({
        mutationFn: (id: string) => request(`/v1/diagrams/${id}/restore`, 'POST'),
        onSuccess: refresh
    });
    return {create, rename, duplicate, restore};
}
