import {useAuth} from '@clerk/clerk-react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {thekeFetch} from '../api/httpClient';

export type ImpactEntityType = 'resource' | 'project' | 'folder' | 'diagram' | 'relation';
export type ImpactAction = 'archive' | 'delete';

export interface Impact {
    entityType: ImpactEntityType;
    entityId: string;
    entityName: string;
    action: ImpactAction;
    state: string;
    affected: { projects: number; folders: number; resources: number; placements: number };
    locations: string[];
    consequences: string[];
    recommendedAction: 'archive' | null;
    deletionAllowed: boolean;
    confirmationPhrase: string;
    impactVersion: string
}

interface Envelope<T> {
    data: T
}

export function useImpact(entityType?: ImpactEntityType, id?: string, action?: ImpactAction) {
    const {getToken, userId} = useAuth();
    return useQuery({
        queryKey: ['private', 'impact', userId, entityType, id, action],
        enabled: Boolean(userId && entityType && id && action),
        queryFn: async ({signal}) => {
            const token = await getToken();
            const response = await thekeFetch<{
                data: Envelope<Impact>
            }>(`/v1/impacts/${entityType}/${id}?action=${action}`, {
                headers: {Authorization: `Bearer ${token}`},
                signal
            });
            return response.data.data;
        }
    });
}

export function useImpactActions() {
    const {getToken} = useAuth();
    const client = useQueryClient();
    const refresh = () => {
        void client.invalidateQueries({queryKey: ['private']});
    };
    const execute = useMutation({
        mutationFn: async (value: {
            entityType: ImpactEntityType;
            id: string;
            action: ImpactAction;
            impactVersion: string;
            confirmation: string;
            idempotencyKey: string
        }) => {
            const token = await getToken();
            const response = await thekeFetch<{
                data: Envelope<Impact>
            }>(`/v1/impacts/${value.entityType}/${value.id}`, {
                method: 'POST',
                headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
                body: JSON.stringify(value)
            });
            return response.data.data;
        }, onSuccess: refresh
    });
    const restoreResource = useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            const response = await thekeFetch<{
                data: Envelope<unknown>
            }>(`/v1/resources/${id}/restore`, {method: 'POST', headers: {Authorization: `Bearer ${token}`}});
            return response.data.data;
        }, onSuccess: refresh
    });
    return {execute, restoreResource};
}
