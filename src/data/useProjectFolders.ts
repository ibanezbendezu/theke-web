import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { thekeFetch } from '../api/httpClient';

export interface ProjectFolder { id: string; name: string; createdAt: string; updatedAt: string }
export function useProjectFolders() {
  const { getToken, userId } = useAuth();
  return useQuery({ queryKey: ['private', 'project-folders', userId], enabled: Boolean(userId), queryFn: async () => { const token = await getToken(); const result = await thekeFetch<{ data: ProjectFolder[] }>('/v1/project-folders', { headers: { Authorization: `Bearer ${token}` } }); return result.data; } });
}
export function useProjectFolderActions() {
  const { getToken } = useAuth(); const client = useQueryClient();
  const request = async (path: string, method: string, body?: object) => { const token = await getToken(); const result = await thekeFetch<{ data: unknown }>(`/v1/project-folders${path}`, { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined }); return result.data; };
  const refresh = () => { void client.invalidateQueries({ queryKey: ['private', 'project-folders'] }); void client.invalidateQueries({ queryKey: ['private', 'projects'] }); };
  return {
    create: useMutation({ mutationFn: (name: string) => request('', 'POST', { name }), onSuccess: refresh }),
    rename: useMutation({ mutationFn: ({ id, name }: { id: string; name: string }) => request(`/${id}`, 'PATCH', { name }), onSuccess: refresh }),
    remove: useMutation({ mutationFn: (id: string) => request(`/${id}`, 'DELETE'), onSuccess: refresh }),
    move: useMutation({ mutationFn: ({ projectIds, folderId }: { projectIds: string[]; folderId: string | null }) => request('/projects', 'PATCH', { projectIds, folderId }), onSuccess: refresh }),
  };
}
