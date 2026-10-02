import {createContext, useContext} from 'react';

export type ToastKind = 'success' | 'error' | 'info';
export type ToastActions = Record<ToastKind, (message: string) => void>;
export const ToastContext = createContext<ToastActions | null>(null);

export function useToast() {
    const toast = useContext(ToastContext);
    if (!toast) throw new Error('useToast requiere ToastProvider');
    return toast;
}
