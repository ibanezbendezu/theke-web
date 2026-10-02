import {useAuth} from '@clerk/clerk-react';
import {useQuery} from '@tanstack/react-query';
import type {DiagramDocument} from './useDiagrams';
import {thekeFetch} from '../api/httpClient';

export interface RelationTypeOption {
    key: string;
    label: string
}

export interface AvailableRelation {
    relationId: string;
    sourceResourceId: string;
    targetResourceId: string;
    sourceNodeId: string;
    targetNodeId: string;
    sourceTitle: string;
    targetTitle: string;
    direction: 'directed' | 'undirected';
    typeKey: string;
    typeLabel: string;
    label: string | null;
    evidenceStatus: 'none' | 'needs_evidence' | 'confirmed'
}

export interface CreatedRelation {
    relationId: string;
    edgeId: string;
    revision: number;
    document: DiagramDocument;
    reused: boolean
}

export interface CreateRelationInput {
    sourceNodeId: string;
    targetNodeId: string;
    direction: 'directed' | 'undirected';
    typeKey: string;
    customTypeName?: string;
    expectedRevision: number;
    idempotencyKey: string;
    reuseExisting?: boolean
}

export interface RelationEvidence {
    id: string;
    resourceId: string;
    resourceVersionId: string | null;
    startOffset: number | null;
    endOffset: number | null;
    pageNumber: number | null;
    title: string;
    excerpt: string | null;
    note: string | null
}

export interface RelationDetail {
    id: string;
    sourceResourceId: string;
    targetResourceId: string;
    source: { id: string; title: string };
    target: { id: string; title: string };
    direction: 'directed' | 'undirected';
    typeKey: string;
    typeLabel: string;
    label: string | null;
    explanation: string | null;
    provenance: string | null;
    evidenceStatus: 'none' | 'needs_evidence' | 'confirmed';
    evidence: RelationEvidence[];
    revision: number;
    archivedAt: string | null;
    deletedAt: string | null;
    createdByUserId: string | null;
    updatedByUserId: string | null;
    createdAt: string;
    updatedAt: string
}

export interface UpdateRelationInput {
    label: string;
    explanation: string;
    provenance: string;
    evidenceStatus: RelationDetail['evidenceStatus'];
    evidence: {
        resourceId: string;
        resourceVersionId?: string;
        startOffset?: number;
        endOffset?: number;
        pageNumber?: number;
        excerpt: string;
        note: string
    }[];
    expectedRevision: number
}

interface Envelope<T> {
    data: T
}

export function useRelationTypes(projectId: string) {
    const {getToken, userId} = useAuth();
    return useQuery({
        queryKey: ['private', 'relation-types', userId, projectId],
        enabled: Boolean(userId && projectId),
        queryFn: async ({signal}) => {
            const response = await thekeFetch<{
                data: Envelope<RelationTypeOption[]>
            }>(`/v1/projects/${projectId}/relation-types`, {
                headers: {Authorization: `Bearer ${await getToken()}`},
                signal
            });
            return response.data.data;
        }
    });
}

export function useAvailableRelations(diagramId: string) {
    const {getToken, userId} = useAuth();
    return useQuery({
        queryKey: ['private', 'available-relations', userId, diagramId],
        enabled: Boolean(userId && diagramId),
        queryFn: async ({signal}) => {
            const response = await thekeFetch<{
                data: Envelope<AvailableRelation[]>
            }>(`/v1/diagrams/${diagramId}/available-relations`, {
                headers: {Authorization: `Bearer ${await getToken()}`},
                signal
            });
            return response.data.data;
        }
    });
}

export function useCreateRelation(diagramId: string) {
    const {getToken} = useAuth();
    return async (input: CreateRelationInput) => {
        const response = await thekeFetch<{
            data: Envelope<CreatedRelation>
        }>(`/v1/diagrams/${diagramId}/relations`, {
            method: 'POST',
            headers: {Authorization: `Bearer ${await getToken()}`, 'Content-Type': 'application/json'},
            body: JSON.stringify(input)
        });
        return response.data.data;
    };
}

export function useRelation(id?: string) {
    const {getToken, userId} = useAuth();
    return useQuery({
        queryKey: ['private', 'relation', userId, id], enabled: Boolean(userId && id), queryFn: async ({signal}) => {
            const response = await thekeFetch<{
                data: Envelope<RelationDetail>
            }>(`/v1/relations/${id}`, {headers: {Authorization: `Bearer ${await getToken()}`}, signal});
            return response.data.data;
        }
    });
}

export function useUpdateRelation(id: string) {
    const {getToken, userId} = useAuth();
    const update = async (input: UpdateRelationInput) => {
        const response = await thekeFetch<{ data: Envelope<RelationDetail> }>(`/v1/relations/${id}`, {
            method: 'PATCH',
            headers: {Authorization: `Bearer ${await getToken()}`, 'Content-Type': 'application/json'},
            body: JSON.stringify(input)
        });
        return response.data.data;
    };
    return {update, queryKey: ['private', 'relation', userId, id] as const};
}
