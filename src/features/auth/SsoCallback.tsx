import {AuthenticateWithRedirectCallback} from '@clerk/clerk-react';
import {useSearchParams} from 'react-router-dom';
import {safeDestination} from './safeDestination';
import {InlineLoading} from '../../components/ui/LoadingState';

export function SsoCallback() {
    const [params] = useSearchParams();
    const destination = safeDestination(params.get('returnTo'));
    return <main className="grid h-dvh place-items-center bg-background px-5 text-sm text-outline" aria-busy="true">
        <InlineLoading label="Terminando el acceso…"/>
        <AuthenticateWithRedirectCallback continueSignUpUrl={`/register?returnTo=${encodeURIComponent(destination)}`}/>
        <div id="clerk-captcha"/>
    </main>;
}
