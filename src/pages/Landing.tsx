import {useAuth} from '@clerk/clerk-react';
import {ArrowUpRight, FileText, Link2, MessageCircle, Network} from 'lucide-react';
import {Link} from 'react-router-dom';
import {CeratiumMark} from '../components/ui/CeratiumMark';
import {ThekeCenterButton} from '../components/ui/ThekeCenterButton';
import {ThemeToggle} from '../components/ui/ThemeToggle';

function MapPreview() {
    return <div className="relative aspect-[1.24] w-full overflow-hidden rounded-2xl bg-surface"
                aria-label="Vista conceptual de un mapa de ideas y fuentes" role="img" style={{
        backgroundImage: 'radial-gradient(var(--border) 0.8px, transparent 0.8px)',
        backgroundSize: '22px 22px'
    }}>
        <CeratiumMark
            className="absolute -right-16 -top-20 h-72 w-72 rotate-[-18deg] text-on-background opacity-[0.035] sm:h-96 sm:w-96"/>
        <svg className="absolute inset-0 h-full w-full text-outline/45" viewBox="0 0 590 475" preserveAspectRatio="none"
             aria-hidden="true">
            <path
                d="M180 131 C236 131 223 222 282 222 M340 220 C399 220 380 127 448 127 M337 251 C386 251 389 352 444 352"
                fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="282" cy="222" r="3" fill="currentColor"/>
            <circle cx="448" cy="127" r="3" fill="currentColor"/>
            <circle cx="444" cy="352" r="3" fill="currentColor"/>
        </svg>
        <div
            className="absolute left-[8%] top-[19%] w-[32%] max-w-44 rounded-lg bg-background px-3 py-3 text-on-background ring-1 ring-border sm:px-4">
            <div className="flex items-center gap-2 text-xs text-outline"><FileText size={14}/> Nota</div>
            <p className="mt-2 text-xs font-medium leading-snug sm:text-sm">Primera observación</p><p
            className="mt-1 text-[10px] text-outline sm:text-xs">Una idea toma forma</p></div>
        <div
            className="absolute left-[39%] top-[39%] w-[29%] max-w-44 rounded-lg bg-background px-3 py-3 text-on-background ring-1 ring-border sm:px-4">
            <div className="flex items-center gap-2 text-xs text-outline"><Network size={14}/> Mapa</div>
            <p className="mt-2 text-xs font-medium leading-snug sm:text-sm">Pregunta central</p></div>
        <div
            className="absolute right-[7%] top-[18%] w-[29%] max-w-40 rounded-lg bg-background px-3 py-3 text-on-background ring-1 ring-border sm:px-4">
            <div className="flex items-center gap-2 text-xs text-outline"><Link2 size={14}/> Fuente</div>
            <p className="mt-2 text-xs font-medium leading-snug sm:text-sm">Lo que la sustenta</p></div>
        <div
            className="absolute bottom-[13%] right-[8%] w-[32%] max-w-44 rounded-lg bg-background px-3 py-3 text-on-background ring-1 ring-border sm:px-4">
            <div className="flex items-center gap-2 text-xs text-outline"><MessageCircle size={14}/> Comentario</div>
            <p className="mt-2 text-xs font-medium leading-snug sm:text-sm">Una nueva mirada</p></div>
        <span
            className="absolute bottom-5 left-5 rounded-md bg-background/85 px-2.5 py-1.5 text-[11px] text-outline backdrop-blur-sm">Así se conectan las ideas</span>
    </div>;
}

export function Landing() {
    const {isSignedIn} = useAuth();
    return <main className="h-dvh overflow-y-auto bg-background text-on-background">
        <div className="flex min-h-full w-full flex-col px-5 py-5 sm:px-8 sm:py-7">
            <header className="flex items-start justify-between gap-4">
                <Link to="/welcome"
                      className="flex items-center gap-2.5 rounded-md text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary"
                      aria-label="Theke, inicio">
                    <CeratiumMark className="h-7 w-7"/>
                    <span>Theke</span>
                </Link>
                <nav className="flex items-center gap-2 text-sm" aria-label="Navegación del sitio"><a
                    href="#como-funciona"
                    className="hidden h-7 items-center rounded-md px-3 text-outline hover:bg-surface-variant hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary sm:inline-flex">Cómo
                    funciona</a><ThemeToggle/><Link to={isSignedIn ? '/' : '/access'}
                                                    className="inline-flex h-7 items-center rounded-md px-3 font-medium hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary">{isSignedIn ? 'Mi espacio' : 'Entrar'}</Link>
                </nav>
            </header>
            <section
                className="grid w-full min-h-[min(780px,calc(100dvh-80px))] items-center gap-12 py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-20"
                aria-labelledby="landing-title">
                <div className="max-w-[740px]"><h1 id="landing-title"
                         className="text-[clamp(2.7rem,5.4vw,6.5rem)] font-semibold leading-[1.07] tracking-[-0.065em]">Haz
                    visible lo que conecta tus ideas.</h1><p
                    className="mt-7 max-w-[36rem] text-base leading-7 text-outline sm:text-lg sm:leading-8">Reúne notas,
                    archivos y enlaces. Ordénalos en mapas que muestran sus relaciones y comparte el recorrido con otras
                    personas.</p>
                    <div className="mt-9 flex flex-wrap items-center gap-3"><Link
                        to={isSignedIn ? '/' : '/register?returnTo=%2F'}
                        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-on-background px-5 text-sm font-medium text-background hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{isSignedIn ? 'Abrir mi espacio' : 'Crear mi espacio'}<ArrowUpRight
                        size={16} aria-hidden="true"/></Link><a href="#como-funciona"
                                                                className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary">Conocer
                        Theke</a></div>
                </div>
                <MapPreview/>
            </section>
            <section id="como-funciona" className="w-full scroll-mt-12 py-20 sm:py-28" aria-labelledby="how-title">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-24"><h2
                    id="how-title"
                    className="max-w-[28rem] text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">Un
                    mapa para pensar. Una biblioteca para volver a encontrar.</h2>
                    <div className="space-y-9 text-sm leading-7 sm:text-base">
                        <div><h3 className="font-semibold">Guarda tus fuentes</h3><p
                            className="mt-1 max-w-[34rem] text-outline">Organiza tus recursos en la biblioteca, con sus
                            propios archivos y carpetas.</p></div>
                        <div><h3 className="font-semibold">Construye cada mapa</h3><p
                            className="mt-1 max-w-[34rem] text-outline">Relaciona fuentes y notas en un espacio visual.
                            Cada mapa tiene su propio recorrido, aunque comparta fuentes con otros.</p></div>
                        <div><h3 className="font-semibold">Comparte lo que encontraste</h3><p
                            className="mt-1 max-w-[34rem] text-outline">Publica una vista navegable y recibe comentarios
                            justo donde surgieron las preguntas.</p></div>
                    </div>
                </div>
            </section>
        </div>
        <ThekeCenterButton/>
    </main>;
}
