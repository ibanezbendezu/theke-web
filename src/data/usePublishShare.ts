import { useAuth } from '@clerk/clerk-react';
import { useMutation } from '@tanstack/react-query';
import type { PublishShareInput, PublishShareResponse } from '../api/generated/models';
import { thekeFetch } from '../api/httpClient';

export function usePublishShare(diagramId: string) {
  const { getToken } = useAuth();
  return useMutation({ mutationFn: async ({ fingerprint, idempotencyKey }: PublishShareInput) => {
    const response = await thekeFetch<{ data: PublishShareResponse }>(`/v1/diagrams/${diagramId}/shares`, {
      method: 'POST', headers: { Authorization: `Bearer ${await getToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint, idempotencyKey }), cache: 'no-store',
    });
    return response.data.data;
  } });
}
