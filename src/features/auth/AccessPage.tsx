import {useEffect, useState, type FormEvent} from 'react';
import {useAuth, useSignIn} from '@clerk/clerk-react';
import {ArrowLeft} from 'lucide-react';
import {Link, Navigate, useNavigate, useSearchParams} from 'react-router-dom';
import {AuthShell} from './AuthShell';
import {safeDestination} from './safeDestination';

function GoogleMark() {
    return <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4"
              d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.8 2.7-6.5Z"/>
        <path fill="#34A853"
              d="M9 18c2.4 0 4.5-.8 6-2.3l-2.9-2.2c-.8.6-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18Z"/>
        <path fill="#FBBC05" d="M3.9 10.6a5.4 5.4 0 0 1 0-3.2V5.1H.9a9 9 0 0 0 0 7.8l3-2.3Z"/>
        <path fill="#EA4335"
              d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A8.7 8.7 0 0 0 9 0 9 9 0 0 0 .9 5.1l3 2.3C4.6 5.2 6.6 3.6 9 3.6Z"/>
    </svg>;
}

export function AccessPage() {
    const {isLoaded: authLoaded, isSignedIn} = useAuth();
    const {isLoaded, signIn, setActive} = useSignIn();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const destination = safeDestination(params.get('returnTo'));
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [emailAddressId, setEmailAddressId] = useState('');
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [resendIn, setResendIn] = useState(0);

    useEffect(() => {
        if (!resendIn) return;
        const timer = window.setTimeout(() => setResendIn(value => Math.max(0, value - 1)), 1000);
        return () => window.clearTimeout(timer);
    }, [resendIn]);

    if (authLoaded && isSignedIn) return <Navigate replace to={destination}/>;

    const sendCode = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isLoaded || busy) return;
        setBusy(true);
        setError('');
        try {
            const attempt = await signIn.create({identifier: email.trim()});
            const factor = attempt.supportedFirstFactors?.find(item => item.strategy === 'email_code');
            if (!factor || factor.strategy !== 'email_code') {
                setError('No se pudo usar un código para este correo. Prueba con Google o crea una cuenta.');
                return;
            }
            await signIn.prepareFirstFactor({strategy: 'email_code', emailAddressId: factor.emailAddressId});
            setEmailAddressId(factor.emailAddressId);
            setStep('code');
            setResendIn(30);
        } catch {
            setError('No se pudo enviar el código. Revisa el correo y vuelve a intentarlo.');
        } finally {
            setBusy(false);
        }
    };

    const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isLoaded || busy) return;
        setBusy(true);
        setError('');
        try {
            const attempt = await signIn.attemptFirstFactor({strategy: 'email_code', code: code.trim()});
            if (attempt.status === 'complete' && attempt.createdSessionId) {
                await setActive({session: attempt.createdSessionId});
                navigate(destination, {replace: true});
            } else setError('Esta cuenta requiere otra verificación. Usa el método de acceso configurado en Clerk.');
        } catch {
            setError('El código no es válido o venció. Revísalo y vuelve a intentarlo.');
        } finally {
            setBusy(false);
        }
    };

    const google = async () => {
        if (!isLoaded || busy) return;
        setBusy(true);
        setError('');
        try {
            await signIn.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: `/sso-callback?returnTo=${encodeURIComponent(destination)}`,
                redirectUrlComplete: destination
            });
        } catch {
            setError('No se pudo iniciar el acceso con Google. Vuelve a intentarlo.');
            setBusy(false);
        }
    };

    const input = 'mt-2 h-11 w-full rounded-md border-0 bg-surface-variant/70 px-3 text-sm text-on-background outline-none placeholder:text-outline focus-visible:outline-2 focus-visible:outline-primary';
    const primary = 'mt-4 flex h-11 w-full items-center justify-center rounded-md bg-on-background px-4 text-sm font-medium text-background hover:opacity-85 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50';
    return <AuthShell titleId="access-title" title={step === 'email' ? 'Entra a tu espacio' : 'Revisa tu correo'}
                      description={step === 'email' ? 'Accede a tus mapas y recursos con tu correo o con Google.' : `Enviamos un código de acceso a ${email.trim()}.`}>
        {step === 'email' ? <>
            <button type="button" onClick={() => void google()} disabled={!isLoaded || busy}
                    className="flex h-11 w-full items-center justify-center gap-3 rounded-md bg-surface-variant/70 px-4 text-sm font-medium hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50">
                <GoogleMark/>Continuar con Google
            </button>
            <div className="my-6 flex items-center gap-4 text-xs text-outline"><span className="h-px flex-1 bg-border"/><span>o con correo</span><span
                className="h-px flex-1 bg-border"/></div>
            <form onSubmit={event => void sendCode(event)}><label htmlFor="access-email"
                                                                  className="text-sm font-medium">Correo
                electrónico</label><input id="access-email" className={input} type="email" autoComplete="email"
                                          inputMode="email" required value={email}
                                          onChange={event => setEmail(event.target.value)} placeholder="tu@correo.com"/>
                <button className={primary}
                        disabled={!isLoaded || busy}>{busy ? 'Enviando…' : 'Continuar con correo'}</button>
            </form>
            <p className="mt-7 text-sm text-outline">¿Aún no tienes un espacio? <Link
                className="font-medium text-on-background underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
                to={`/register?returnTo=${encodeURIComponent(destination)}`}>Crear cuenta</Link></p>
        </> : <>
            <button type="button" onClick={() => {
                setStep('email');
                setCode('');
                setError('');
            }}
                    className="mb-6 flex items-center gap-2 rounded-md text-sm text-outline hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary">
                <ArrowLeft size={15}/>Cambiar correo
            </button>
            <form onSubmit={event => void verifyCode(event)}><label htmlFor="access-code"
                                                                    className="text-sm font-medium">Código de
                verificación</label><input id="access-code" className={input} type="text" autoComplete="one-time-code"
                                           inputMode="numeric" required value={code}
                                           onChange={event => setCode(event.target.value)}
                                           placeholder="Código recibido"/>
                <button className={primary}
                        disabled={!isLoaded || busy}>{busy ? 'Verificando…' : 'Entrar a Theke'}</button>
            </form>
            <button type="button" onClick={async () => {
                if (!isLoaded || busy || !emailAddressId || resendIn) return;
                setBusy(true);
                setError('');
                try {
                    await signIn.prepareFirstFactor({strategy: 'email_code', emailAddressId});
                    setResendIn(30);
                } catch {
                    setError('No se pudo enviar otro código. Inténtalo más tarde.');
                } finally {
                    setBusy(false);
                }
            }} disabled={!isLoaded || busy || resendIn > 0}
                    className="mt-5 rounded-md text-sm text-outline hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60">{resendIn ? `Enviar otro código en ${resendIn} s` : 'Enviar otro código'}</button>
        </>}
        {error && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </AuthShell>;
}
