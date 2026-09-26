import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { thekeFetch } from '../api/httpClient';
import type {
  AiConsentInput,
  AiPreflightInput,
  AiPreflightResult,
  AiSettingsInput,
  AiStatus,
} from '../api/generated/models';

interface Envelope<T> {
  data: T;
}

export type { RelationSuggestion } from '../api/generated/models';

export function useRelationSuggestion() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (relationId: string) => {
      const response = await thekeFetch<Envelope<import('../api/generated/models').RelationSuggestion>>('/v1/ai/relation-suggestions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${await getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ relationId }),
      });
      return response.data;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['private', 'ai-status'] }),
  });
}

export function useAiStatus() {
  const { getToken, userId } = useAuth();
  return useQuery({
    queryKey: ['private', 'ai-status', userId],
    enabled: Boolean(userId),
    queryFn: async ({ signal }) => {
      const response = await thekeFetch<Envelope<AiStatus>>('/v1/ai/status', {
        headers: { Authorization: `Bearer ${await getToken()}` },
        signal,
      });
      return response.data;
    },
  });
}

export function useAiActions() {
  const { getToken, userId } = useAuth();
  const queryClient = useQueryClient();

  const consentMutation = useMutation({
    mutationFn: async (input: AiConsentInput) => {
      const response = await thekeFetch<Envelope<AiStatus>>('/v1/ai/consent', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['private', 'ai-status', userId], data);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async () => {
      const response = await thekeFetch<Envelope<AiStatus>>('/v1/ai/revoke-consent', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['private', 'ai-status', userId], data);
    },
  });

  const settingsMutation = useMutation({
    mutationFn: async (input: AiSettingsInput) => {
      const response = await thekeFetch<Envelope<AiStatus>>('/v1/ai/settings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['private', 'ai-status', userId], data);
    },
  });

  const preflightMutation = useMutation({
    mutationFn: async (input: AiPreflightInput) => {
      const response = await thekeFetch<Envelope<AiPreflightResult>>('/v1/ai/preflight-check', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      return response.data;
    },
  });

  return {
    consent: consentMutation,
    revoke: revokeMutation,
    settings: settingsMutation,
    preflight: preflightMutation,
  };
}
