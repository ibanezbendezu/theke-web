import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ActiveShare, ActiveShareResponse, RefreshShareInput, RefreshShareResponse, RevokeShareInput, ShareCommentsInput, ShareCommentsResponse } from '../api/generated/models';
import { thekeFetch } from '../api/httpClient';

export function useShareManagement(diagramId: string) {
  const { getToken, userId } = useAuth();
  const client = useQueryClient();
  const key = ['private', 'active-share', userId, diagramId];
  const request = async <T>(path: string, method: string, body: object) => {
    const response = await thekeFetch<{ data: { data: T } }>(`/v1/diagrams/${diagramId}/shares/active${path}`, {
      method, headers: { Authorization: `Bearer ${await getToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store',
    });
    return response.data.data;
  };
  const active = useQuery({ queryKey: key, enabled: Boolean(userId), queryFn: async () => {
    const response = await thekeFetch<{ data: ActiveShareResponse }>(`/v1/diagrams/${diagramId}/shares/active`, {
      headers: { Authorization: `Bearer ${await getToken()}` }, cache: 'no-store',
    });
    return response.data.data;
  } });
  const refresh = () => client.invalidateQueries({ queryKey: key });
  const comments = useMutation({ mutationFn: (input: ShareCommentsInput) => request<ShareCommentsResponse['data']>('/comments', 'PATCH', input), onSuccess: refresh });
  const update = useMutation({ mutationFn: (input: RefreshShareInput) => request<RefreshShareResponse['data']>('/projection', 'PUT', input), onSuccess: refresh });
  const revoke = useMutation({ mutationFn: (input: RevokeShareInput) => request<{ active: false }>('/revoke', 'POST', input), onSuccess: () => {
    client.setQueryData<ActiveShare>(key, { active: false });
    void refresh();
  } });
  return { active, comments, update, revoke, refresh };
}
