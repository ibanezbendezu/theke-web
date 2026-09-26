import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { thekeFetch } from '../src/api/httpClient';
import { safeDestination } from '../src/features/auth/safeDestination';

beforeEach(() => vi.stubEnv('VITE_API_URL', 'https://api.test/'));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('acceso privado', () => {
  it('conserva únicamente destinos internos seguros al pedir acceso', () => {
    expect(safeDestination('/canvas/diagram-1?focus=resource')).toBe('/canvas/diagram-1?focus=resource');
    expect(safeDestination('//attacker.test')).toBe('/');
    expect(safeDestination('/\\attacker.test')).toBe('/');
    expect(safeDestination('https://attacker.test')).toBe('/');
  });

  it('restaura identidad desde /v1/me usando solo el token, sin accountId', async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      expect(_url).toBe('https://api.test/v1/me');
      expect(init.headers).toEqual({ Authorization: 'Bearer session-token' });
      expect(init.body).toBeUndefined();
      return new Response(JSON.stringify({ data: { user: { id: 'u1', email: null, displayName: 'Daniel' }, account: { id: 'a1', name: 'Mi espacio' }, membership: { id: 'm1', role: 'owner' } } }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    await expect(thekeFetch('/v1/me', { headers: { Authorization: 'Bearer session-token' } })).resolves.toMatchObject({ data: { data: { account: { id: 'a1' } } }, status: 200 });
  });

  it('preserva el error uniforme y requestId para una recuperación segura', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Sesión vencida', requestId: 'req-401' } }), { status: 401 })));
    await expect(thekeFetch('/v1/me', { headers: { Authorization: 'Bearer expired' } })).rejects.toMatchObject({ status: 401, payload: { error: { code: 'UNAUTHORIZED', message: 'Sesión vencida', requestId: 'req-401' } } });
  });

  it('estructura fallos vacíos o no JSON con status y requestId del header', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('upstream unavailable', { status: 502, statusText: 'Bad Gateway', headers: { 'x-request-id': 'req-502' } })));
    await expect(thekeFetch('/v1/me')).rejects.toMatchObject({ status: 502, payload: { error: { code: 'HTTP_502', message: 'Bad Gateway', requestId: 'req-502' } } });
  });

  it('rechaza una base API ausente antes de enviar la solicitud', async () => {
    vi.stubEnv('VITE_API_URL', '   ');
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    await expect(thekeFetch('/v1/me')).rejects.toThrow('Falta configurar VITE_API_URL');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
