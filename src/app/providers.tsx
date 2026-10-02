import type {ReactNode} from 'react';
import {ClerkProvider} from '@clerk/clerk-react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ThemeProvider} from './../providers/ThemeProvider';
import {ToastProvider} from '../components/ui/ToastProvider';

const queryClient = new QueryClient({defaultOptions: {queries: {retry: 1, staleTime: 30_000}}});

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({children}: ProvidersProps) {
    const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    if (!publishableKey) return <div role="alert" className="p-6">Falta configurar VITE_CLERK_PUBLISHABLE_KEY.</div>;
    return (
        <ClerkProvider
            publishableKey={publishableKey}
            afterSignOutUrl="/access"
            appearance={{
                variables: {
                    colorPrimary: 'var(--primary)', colorBackground: 'var(--background)',
                    colorText: 'var(--on-background)', colorTextSecondary: 'var(--outline)',
                    colorInputBackground: 'var(--surface)', colorInputText: 'var(--on-background)',
                    borderRadius: '0.5rem', fontFamily: 'var(--font-sans)',
                },
                elements: {
                    card: 'border-0 shadow-none',
                    formButtonPrimary: 'focus-visible:outline-2 focus-visible:outline-primary',
                    footerActionLink: 'text-primary'
                },
            }}
        >
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="system" storageKey="theke-theme">
                    <ToastProvider>{children}</ToastProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ClerkProvider>
    );
}
