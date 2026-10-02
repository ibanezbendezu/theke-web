import type {ApiErrorResponse} from './generated/models/apiErrorResponse';

export class ApiError extends Error {
    readonly payload: ApiErrorResponse;
    readonly status: number;

    constructor(payload: ApiErrorResponse, status: number) {
        super(payload.error.message);
        this.payload = payload;
        this.status = status;
    }
}

function apiBaseUrl(): string {
    const value = import.meta.env.VITE_API_URL?.trim();
    if (!value) throw new Error('Falta configurar VITE_API_URL.');
    return value.replace(/\/+$/, '');
}

function errorPayload(body: unknown, response: Response): ApiErrorResponse {
    const candidate = body as Partial<ApiErrorResponse>;
    const requestId = response.headers.get('x-request-id') ?? 'unknown';
    if (candidate?.error && typeof candidate.error.code === 'string' && typeof candidate.error.message === 'string') {
        return {error: {...candidate.error, requestId: candidate.error.requestId || requestId}};
    }
    return {error: {code: `HTTP_${response.status}`, message: response.statusText || 'La solicitud falló.', requestId}};
}

export async function thekeFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${apiBaseUrl()}/${url.replace(/^\/+/, '')}`, options);
    const text = await response.text();
    let body: unknown;
    try {
        body = text ? JSON.parse(text) : undefined;
    } catch {
        body = undefined;
    }
    if (!response.ok) throw new ApiError(errorPayload(body, response), response.status);
    return {data: body, status: response.status, headers: response.headers} as T;
}
