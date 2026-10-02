import {useAuth} from '@clerk/clerk-react';
import type {ReactNode} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {useCurrentAccount} from '../../data/useCurrentAccount';
import {ApiError} from '../../api/httpClient';
import {clearPrivateCache} from '../../data/queryClient';
import {useEffect} from 'react';

function InvalidSession({returnTo, signOut}: {
    returnTo: string;
    signOut: (options?: { redirectUrl?: string }) => Promise<unknown>
}) {
    const accessUrl = `/access?returnTo=${encodeURIComponent(returnTo)}`;
    useEffect(() => {
        clearPrivateCache();
        void signOut({redirectUrl: accessUrl});
    }, [accessUrl, signOut]);
    return <main className="grid min-h-screen place-items-center bg-background" aria-busy="true"><p
        aria-live="polite">La sesión venció. Volviendo al acceso…</p></main>;
}

export function PrivateRoute({children}: { children: ReactNode }) {
    const {isLoaded, isSignedIn, signOut} = useAuth();
    const location = useLocation();
    const account = useCurrentAccount();
    const returnTo = `${location.pathname}${location.search}`;
    if (!isLoaded || (isSignedIn && account.isPending)) return <main
        className="grid min-h-screen place-items-center bg-background" aria-busy="true"><p
        aria-live="polite">Restaurando tu espacio…</p></main>;
    if (!isSignedIn) return <Navigate replace to={`/access?returnTo=${encodeURIComponent(returnTo)}`}/>;
    if (account.error instanceof ApiError && account.error.status === 401) return <InvalidSession returnTo={returnTo}
                                                                                                  signOut={signOut}/>;
    if (account.isError) return <main className="grid min-h-screen place-items-center p-6">
        <div role="alert" className="max-w-md"><h1 className="text-xl font-semibold">No se pudo abrir tu espacio</h1><p
            className="mt-2">Tu trabajo sigue protegido. Revisa la conexión y vuelve a intentarlo.</p>
            <button className="mt-4 rounded bg-primary px-4 py-2 text-on-primary"
                    onClick={() => account.refetch()}>Reintentar
            </button>
        </div>
    </main>;
    return children;
}
