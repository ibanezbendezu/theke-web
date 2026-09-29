import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { ToastContext, type ToastActions, type ToastKind } from './useToast';

type Toast = { id: string; kind: ToastKind; message: string };
const labels = { success: 'Listo', error: 'Error', info: 'Aviso' };
const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
const colors = { success: 'text-emerald-700 dark:text-emerald-400', error: 'text-red-700 dark:text-red-400', info: 'text-primary' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: string) => setToasts(current => current.filter(toast => toast.id !== id)), []);
  const add = useCallback((kind: ToastKind, message: string) => {
    setToasts(current => [...current.slice(-3), { id: crypto.randomUUID(), kind, message }]);
  }, []);
  const actions = useMemo<ToastActions>(() => ({
    success: message => add('success', message),
    error: message => add('error', message),
    info: message => add('info', message),
  }), [add]);

  return <ToastContext.Provider value={actions}>
    {children}
    <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[200] flex flex-col gap-2 sm:left-auto sm:w-[min(24rem,calc(100vw-2rem))]" aria-label="Notificaciones">
      {toasts.map(toast => <ToastAlert key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />)}
    </div>
  </ToastContext.Provider>;
}

function ToastAlert({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, toast.kind === 'error' ? 10000 : 6000);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.kind]);
  const Icon = icons[toast.kind];
  return <div role={toast.kind === 'error' ? 'alert' : 'status'} className="pointer-events-auto flex items-start gap-3 rounded-lg bg-background/95 px-4 py-3 text-sm text-on-background shadow-xl backdrop-blur-md">
    <Icon size={18} className={`mt-0.5 shrink-0 ${colors[toast.kind]}`} aria-hidden="true" />
    <div className="min-w-0 flex-1"><p className="font-medium">{labels[toast.kind]}</p><p className="mt-0.5 break-words text-outline">{toast.message}</p></div>
    <button type="button" onClick={onDismiss} aria-label="Cerrar notificación" className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-md text-outline hover:bg-surface-variant hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary"><X size={16} /></button>
  </div>;
}
