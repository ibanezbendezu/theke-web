import type {QueryClient} from '@tanstack/react-query';

let activeClient: QueryClient | null = null;
export const registerPrivateQueryClient = (client: QueryClient) => {
    activeClient = client;
};
export const clearPrivateCache = () => activeClient?.clear();
