import { useEffect, useRef, useState } from 'react';
import { useAiActions, useAiStatus } from '../../data/useAi';
import { Button } from '../ui/Button';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

export function AIConsentDialog({
  isOpen,
  onClose,
  onConsented,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConsented?: () => void;
}) {
  const { data: status } = useAiStatus();
  const { consent } = useAiActions();
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement | null;
      const focusTimer = setTimeout(() => {
        setAgreed(false);
        setErrorMsg('');
        dialogRef.current?.querySelector<HTMLElement>('button, input')?.focus();
      }, 50);
      return () => clearTimeout(focusTimer);
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

  const policy = status?.consent?.policy;
  const currentVersion = status?.consent?.currentVersion ?? '2026-09-25.1';

  const handleSubmit = async () => {
    if (!agreed) {
      setErrorMsg('Debes confirmar que has revisado las condiciones de procesamiento.');
      return;
    }
    try {
      await consent.mutateAsync({
        consentVersion: currentVersion,
        enabled: true,
      });
      onConsented?.();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo registrar el consentimiento.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
    >
      <div
        ref={dialogRef}
        className="bg-background text-on-background w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-5 flex items-center gap-3 bg-surface-variant/40">
          <div className="p-2 bg-primary/10 text-primary rounded-md">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 id="ai-consent-title" className="text-base font-semibold leading-tight">
              Consentimiento informado de Asistencia de IA
            </h2>
            <p className="text-xs text-outline mt-0.5">
              Gobernanza de datos, proveedor y límites de cuota (Versión {currentVersion})
            </p>
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-sm leading-relaxed">
          <p className="text-on-background/90">
            Theke integra asistencia de Inteligencia Artificial opcional para apoyar el razonamiento del autor sin delegar el control del conocimiento ni comprometer la privacidad.
          </p>

          <div className="bg-surface-variant/50 rounded-md p-3.5 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Lock size={16} className="text-primary mt-0.5 shrink-0" />
              <div className="text-xs space-y-1">
                <span className="font-semibold block text-on-background">Condiciones del proveedor (OpenAI Responses)</span>
                <ul className="list-disc list-inside space-y-0.5 text-outline">
                  <li>Modelo: <code className="bg-surface px-1 py-0.5 rounded text-on-background">{policy?.model ?? 'gpt-5.6-terra'}</code></li>
                  <li>Sin almacenamiento permanente en el proveedor (<code className="bg-surface px-1 py-0.5 rounded text-on-background">store: false</code>).</li>
                  <li><strong>Sin entrenamiento:</strong> tus recursos y datos nunca se usan para entrenar ni mejorar modelos.</li>
                  <li>Retención máxima de 30 días únicamente para registros técnicos de prevención de abusos por parte del proveedor.</li>
                  <li>Sin acceso web abierto ni rastreo autónomo no autorizado.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-border/60">
              <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <div className="text-xs space-y-1">
                <span className="font-semibold block text-on-background">Límites y control de costes por Cuenta</span>
                <ul className="list-disc list-inside space-y-0.5 text-outline">
                  <li>Máximo 50.000 tokens de entrada por análisis.</li>
                  <li>Máximo 4.000 tokens de salida generados.</li>
                  <li>10 ejecuciones diarias y USD $5.00 mensuales por Cuenta.</li>
                  <li>Las alternativas manuales permanecen <strong>100% operativas</strong> ante cualquier límite o desconexión.</li>
                </ul>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 p-3 bg-surface-variant/40 rounded-md cursor-pointer hover:bg-surface-variant/20 transition-colors">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (e.target.checked) setErrorMsg('');
              }}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-xs text-on-background leading-normal">
              He leído y acepto las condiciones de procesamiento informadas. Entiendo que solo se transmitirán los recursos incluidos en el alcance explícito y que puedo revocar este consentimiento en cualquier momento.
            </span>
          </label>

          {errorMsg && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
              {errorMsg}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between gap-3 bg-surface-variant/20">
          <Button variant="ghost" onClick={onClose}>
            Cancelar (Modo manual)
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!agreed || consent.isPending}
          >
            {consent.isPending ? 'Guardando...' : 'Aceptar y habilitar IA'}
          </Button>
        </div>
      </div>
    </div>
  );
}
