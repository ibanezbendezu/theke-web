import {useAuth} from '@clerk/clerk-react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {thekeFetch} from '../api/httpClient';

export interface UploadRecord {
    id: string;
    resourceId: string;
    name: string;
    size: number;
    mediaType: string;
    status: 'initiated' | 'finalizing' | 'uploaded' | 'scanning' | 'ready' | 'rejected' | 'failed' | 'cancelled';
    failureReason: string | null;
    uploadUrl?: string
}

export interface UploadPolicy {
    maxBatchSize: number;
    maxFileSize: number;
    accountQuota: number;
    allowedMediaTypes: string[]
}

interface Envelope<T> {
    data: T
}

export function useUploads() {
    const {getToken, userId} = useAuth();
    const client = useQueryClient();
    const request = async <T>(path: string, options?: RequestInit) => {
        const token = await getToken();
        const response = await thekeFetch<{ data: Envelope<T> }>(path, {
            ...options,
            headers: {Authorization: `Bearer ${token}`, ...(options?.body ? {'Content-Type': 'application/json'} : {})}
        });
        return response.data.data;
    };
    const uploads = useQuery({
        queryKey: ['private', 'uploads', userId],
        enabled: Boolean(userId),
        queryFn: () => request<UploadRecord[]>('/v1/uploads'),
        refetchInterval: query => query.state.data?.some(item => ['finalizing', 'uploaded', 'scanning'].includes(item.status)) ? 2_000 : false
    });
    const policy = useQuery({
        queryKey: ['private', 'upload-policy', userId],
        enabled: Boolean(userId),
        queryFn: () => request<UploadPolicy>('/v1/uploads/policy')
    });
    const refresh = () => client.invalidateQueries({queryKey: ['private', 'uploads']});
    return {
        uploads,
        policy,
        create: (file: File, idempotencyKey: string) => request<UploadRecord>('/v1/uploads', {
            method: 'POST',
            body: JSON.stringify({
                name: file.name,
                size: file.size,
                mediaType: file.type || 'application/octet-stream',
                idempotencyKey
            })
        }),
        finalize: async (id: string) => {
            const value = await request<UploadRecord>(`/v1/uploads/${id}/finalize`, {method: 'POST'});
            void refresh();
            return value;
        },
        cancel: async (id: string) => {
            const value = await request<UploadRecord>(`/v1/uploads/${id}/cancel`, {method: 'POST'});
            void refresh();
            return value;
        }
    };
}
