import {Outlet, Link} from 'react-router-dom';
import {ChevronLeft} from 'lucide-react';

export function CanvasLayout() {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-surface-variant">

            {/* Botón flotante para salir del Canvas */}
            <div className="absolute top-4 left-4 z-50">
                <Link
                    to="/library"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border border-border shadow-sm text-sm font-medium text-on-background hover:bg-surface transition-colors"
                >
                    <ChevronLeft size={16}/>
                    Volver
                </Link>
            </div>

            {/* Aquí inyectaremos el motor de React Flow */}
            <Outlet/>

        </div>
    );
}