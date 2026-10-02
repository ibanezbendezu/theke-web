import {SignUp, useAuth} from '@clerk/clerk-react';
import {Navigate, useSearchParams} from 'react-router-dom';
import {AuthShell} from './AuthShell';
import {authAppearance} from './authAppearance';
import {safeDestination} from './safeDestination';

export function RegisterPage() {
    const {isLoaded, isSignedIn} = useAuth();
    const [params] = useSearchParams();
    const destination = safeDestination(params.get('returnTo'));
    if (isLoaded && isSignedIn) return <Navigate replace to={destination}/>;
    return <AuthShell titleId="register-title" title="Crea tu espacio"
                      description="Regístrate con Google o verifica tu correo con un código de un solo uso."><SignUp
        routing="hash" signInUrl={`/access?returnTo=${encodeURIComponent(destination)}`} forceRedirectUrl={destination}
        appearance={authAppearance}/></AuthShell>;
}
