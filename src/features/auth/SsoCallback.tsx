import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router-dom';
import { safeDestination } from './safeDestination';

export function SsoCallback() {
  const [params] = useSearchParams();
  const destination = safeDestination(params.get('returnTo'));
  return <main className="grid h-dvh place-items-center bg-background px-5 text-sm text-outline" aria-busy="true">
    <p>Terminando el acceso…</p>
    <AuthenticateWithRedirectCallback continueSignUpUrl={`/register?returnTo=${encodeURIComponent(destination)}`}/>
    <div id="clerk-captcha"/>
  </main>;
}
