import { useAuth } from '@clerk/clerk-react';
import { useMutation } from '@tanstack/react-query';
import type { SharePreviewResponse } from '../api/generated/models';
import { thekeFetch } from '../api/httpClient';

export function useSharePreview(diagramId: string) {
  const { getToken } = useAuth();
  return useMutation({ mutationFn: async () => {
    const response = await thekeFetch<{ data: SharePreviewResponse }>(`/v1/diagrams/${diagramId}/share-preview`, {
      headers: { Authorization: `Bearer ${await getToken()}` }, cache: 'no-store',
    });
    return response.data.data;
  } });
}