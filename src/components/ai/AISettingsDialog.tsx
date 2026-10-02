import {useEffect, useRef, useState} from 'react';
import {useAiActions, useAiStatus} from '../../data/useAi';
import {Button} from '../ui/Button';
import {Badge} from '../ui/Badge';
import {Sparkles, Shield, Trash2, CheckCircle2} from 'lucide-react';
import {AIConsentDialog} from './AIConsentDialog';
import {useToast} from '../ui/useToast';

export function AISettingsDialog({
                                     isOpen,
                                     onClose,
                                 }: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const {data: status} = useAiStatus();
    const {settings, revoke} = useAiActions();
    const [consentModalOpen, setConsentModalOpen] = useState(false);
    const toast = useToast();
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocus = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            previousFocus.current = document.activeElement as HTMLElement | null;
            const timer = setTimeout(() => {
                dialogRef.current?.querySelector<HTMLElement>('button')?.focus();
            }, 50);
            return () => clearTimeout(timer);
        } else {
            previousFocus.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isConsented = status?.consent?.isConsented ?? false;
    const isEnabled = status?.enabled ?? false;
    const policy = status?.consent?.policy;

    const handleToggle = async (enabled: boolean) => {
        try {
            await settings.mutateAsync({enabled});
            toast.success(enabled ? 'Asistencia de IA activada.' : 'Asistencia de IA desactivada.');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al cambiar estado.');
        }
    };

    const handleRevoke = async () => {
        try {
            await revoke.mutateAsync();
            toast.success('Consentimiento revocado e IA desactivada.');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al revocar consentimiento.');
        }
    };

    return (
        <>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-settings-title"
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
            >
                <div
                    ref={dialogRef}
                    className="bg-background text-on-background w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col"
                >
                    <div className="p-4 flex items-center justify-between bg-surface-variant/40">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-primary"/>
                            <h2 id="ai-settings-title" className="text-sm font-semibold">
                                Configuración y Privacidad de IA
                            </h2>
                        </div>
                        <Badge
                            className={isEnabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-surface-variant text-outline'}>
                            {isEnabled ? 'Activa' : 'Desactivada'}
                        </Badge>
                    </div>

                    <div className="p-4 space-y-4 text-xs leading-relaxed">
                        {/* Estado del consentimiento */}
                        <div className="p-3 rounded-md bg-surface-variant/50 space-y-2">
                            <div className="flex items-center justify-between">
                <span className="font-semibold text-on-background flex items-center gap-1.5">
                  <Shield size={14} className="text-primary"/>
                  Consentimiento informado
                </span>
                                {isConsented ? (
                                    <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12}/> Otorgado (v{status?.consent?.acceptedVersion})
                  </span>
                                ) : (
                                    <span className="text-amber-600">Pendiente</span>
                                )}
                            </div>

                            {isConsented && status?.consent?.consentedAt && (
                                <p className="text-[11px] text-outline">
                                    Aceptado el: {new Date(status.consent.consentedAt).toLocaleString()}
                                </p>
                            )}

                            <p className="text-outline text-[11px]">
                                {policy?.description ?? 'Modelo gpt-5.6-terra sin retención permanente ni entrenamiento con datos privados.'}
                            </p>
                        </div>

                        {/* Cuotas y límites */}
                        <div className="p-3 rounded-md bg-surface-variant/50 space-y-1.5">
                            <span className="font-semibold text-on-background block">Límites y consumo actual</span>
                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                                <div>
                                    <span className="text-outline">Ejecuciones diarias:</span>
                                    <p className="font-medium text-on-background">
                                        {status?.quota?.dailyRuns?.remaining ?? 0} restantes
                                        de {status?.quota?.dailyRuns?.limit ?? 10}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-outline">Presupuesto mensual:</span>
                                    <p className="font-medium text-on-background">
                                        ${status?.quota?.monthlyBudget?.remainingUsd?.toFixed(2) ?? '0.00'} /
                                        ${status?.quota?.monthlyBudget?.limitUsd?.toFixed(2) ?? '5.00'} USD
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Controles de activación / revocación */}
                        <div className="space-y-2 pt-2 border-t border-border">
                            {isConsented ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="font-medium text-on-background">Habilitar asistencia de IA</span>
                                        <input
                                            type="checkbox"
                                            checked={isEnabled}
                                            onChange={(e) => handleToggle(e.target.checked)}
                                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                        />
                                    </div>

                                    <div className="pt-2 flex justify-between items-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setConsentModalOpen(true)}
                                        >
                                            Revisar condiciones
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                            icon={Trash2}
                                            onClick={handleRevoke}
                                        >
                                            Revocar consentimiento
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={() => setConsentModalOpen(true)}
                                >
                                    Otorgar consentimiento informado
                                </Button>
                            )}
                        </div>

                    </div>

                    <div className="p-3 border-t border-border flex justify-end bg-surface-variant/20">
                        <Button variant="ghost" onClick={onClose}>
                            Cerrar
                        </Button>
                    </div>
                </div>
            </div>

            <AIConsentDialog
                isOpen={consentModalOpen}
                onClose={() => setConsentModalOpen(false)}
            />
        </>
    );
}
