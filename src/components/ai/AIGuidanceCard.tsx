import { useEffect, useState } from 'react';
import { useAiActions, useAiStatus } from '../../data/useAi';
import type { AiPreflightResult } from '../../api/generated/models';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AIConsentDialog } from './AIConsentDialog';
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileText,
  Link as LinkIcon,
  File,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface AIGuidanceCardProps {
  selectedResourceIds: string[];
  actionTitle?: string;
  onExecute?: () => void;
  executeLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function AIGuidanceCard({
  selectedResourceIds,
  actionTitle = 'Orientación de IA',
  onExecute,
  executeLabel = 'Ejecutar análisis',
  isLoading = false,
  className,
}: AIGuidanceCardProps) {
  const { data: status } = useAiStatus();
  const { preflight, settings } = useAiActions();
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);
  const [assessed, setAssessed] = useState<{ key: string; result: AiPreflightResult } | null>(null);
  const resourceKey = selectedResourceIds.join(',');
  const assessmentKey = `${resourceKey}:${status?.enabled}:${status?.consent?.isConsented}`;
  const assessment = assessed?.key === assessmentKey ? assessed.result : null;
  const runPreflight = preflight.mutate;

  useEffect(() => {
    let active = true;
    if (resourceKey && status?.enabled && status?.consent?.isConsented) {
      runPreflight(
        { resourceIds: resourceKey.split(',') },
        {
          onSuccess: (data) => {
            if (active) setAssessed({ key: assessmentKey, result: data });
          },
        },
      );
    }
    return () => {
      active = false;
    };
  }, [resourceKey, assessmentKey, status?.enabled, status?.consent?.isConsented, runPreflight]);

  const isConsented = status?.consent?.isConsented ?? false;
  const isEnabled = status?.enabled ?? false;
  const providerPending = status?.providerAvailability?.available === false;
  const dailyRemaining = status?.quota?.dailyRuns?.remaining ?? 0;
  const monthlyRemaining = status?.quota?.monthlyBudget?.remainingUsd ?? 0;

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <FileText size={14} className="text-blue-500" />;
      case 'link':
        return <LinkIcon size={14} className="text-emerald-500" />;
      case 'file':
        return <File size={14} className="text-amber-500" />;
      default:
        return <FileText size={14} className="text-outline" />;
    }
  };

  return (
    <>
      <div className={`space-y-4 rounded-lg bg-surface-variant/55 p-4 ${className ?? ''}`}>
        {/* Header con Estado */}
        <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-background leading-tight">
                {actionTitle}
              </h3>
              <p className="text-[11px] text-outline">
                Alcance y límites bajo control humano
              </p>
            </div>
          </div>

          <div>
            {!isConsented ? (
              <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Consentimiento requerido
              </Badge>
            ) : !isEnabled ? (
              <Badge className="bg-surface-variant text-outline">
                IA Desactivada
              </Badge>
            ) : providerPending ? (
              <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20">Integración pendiente</Badge>
            ) : dailyRemaining <= 0 ? (
              <Badge className="bg-red-500/10 text-red-600 border border-red-500/20">
                Límite diario alcanzado
              </Badge>
            ) : monthlyRemaining <= 0 ? (
              <Badge className="bg-red-500/10 text-red-600 border border-red-500/20">
                Presupuesto mensual agotado
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                IA Activa ({status?.consent?.model ?? 'gpt-5.6-terra'})
              </Badge>
            )}
          </div>
        </div>

        {/* Alcance de recursos */}
        {providerPending && <p role="status" className="text-xs text-outline">El proveedor de IA todavía no está disponible. Tu consentimiento se conserva y puedes seguir editando manualmente.</p>}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-on-background">
            <span>Alcance explícito ({selectedResourceIds.length} recursos seleccionados)</span>
            {assessment && (
              <span className="text-[11px] text-outline">
                ~{assessment.totalEstimatedInputTokens.toLocaleString()} / {assessment.maxInputTokens.toLocaleString()} tokens
              </span>
            )}
          </div>

          {selectedResourceIds.length === 0 ? (
            <div className="p-3 bg-surface-variant/20 border border-dashed border-border rounded-md text-xs text-outline text-center">
              Selecciona recursos en el canvas o biblioteca para acotar el análisis.
            </div>
          ) : assessment ? (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {assessment.resources.map((res) => (
                <div
                  key={res.id}
                  className={`p-2 rounded-md border text-xs flex flex-col gap-1 transition-colors ${
                    res.valid
                      ? 'bg-surface border-border/80'
                      : 'bg-red-500/5 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {renderTypeIcon(res.type)}
                      <span className="font-medium truncate text-on-background">
                        {res.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-outline">
                        ~{res.estimatedTokens} tok
                      </span>
                      {res.valid ? (
                        <CheckCircle2 size={13} className="text-emerald-500" />
                      ) : (
                        <AlertTriangle size={13} className="text-red-500" />
                      )}
                    </div>
                  </div>
                  {res.issues.length > 0 && (
                    <div className="text-[10px] text-red-500 pl-5">
                      {res.issues.join('. ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2.5 bg-surface-variant/30 rounded-md text-xs text-outline flex items-center gap-2">
              <Info size={14} className="text-outline shrink-0" />
              <span>
                {selectedResourceIds.length} recurso(s) en espera de evaluación preflight.
              </span>
            </div>
          )}
        </div>

        {/* Motivo de bloqueo o advertencia */}
        {assessment && !assessment.allowed && (
          <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Análisis no disponible en este alcance</p>
              <p className="text-[11px] mt-0.5 opacity-90">{assessment.reason}</p>
            </div>
          </div>
        )}

        {/* Resumen de Cuotas */}
        {isConsented && (
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-surface-variant/20 p-2 rounded-md border border-border/60">
            <div>
              <span className="text-outline block">Ejecuciones diarias:</span>
              <span className="font-medium text-on-background">
                {dailyRemaining} / {status?.quota?.dailyRuns?.limit ?? 10} restantes hoy
              </span>
            </div>
            <div>
              <span className="text-outline block">Presupuesto mensual:</span>
              <span className="font-medium text-on-background">
                ${monthlyRemaining.toFixed(2)} / ${status?.quota?.monthlyBudget?.limitUsd?.toFixed(2) ?? '5.00'} USD
              </span>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="pt-2 border-t border-border flex flex-col gap-2">
          {!isConsented ? (
            <Button
              variant="primary"
              className="w-full"
              icon={ShieldCheck}
              onClick={() => setConsentDialogOpen(true)}
            >
              Otorgar consentimiento informado
            </Button>
          ) : !isEnabled ? (
            <Button
              variant="primary"
              className="w-full"
              icon={Sparkles}
              disabled={settings.isPending}
              onClick={() => settings.mutate({ enabled: true })}
            >
              {settings.isPending ? 'Activando...' : 'Activar Asistencia de IA'}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              {onExecute && (
                <Button
                  variant="primary"
                  className="flex-1"
                  icon={Sparkles}
                  disabled={
                    isLoading ||
                    selectedResourceIds.length === 0 ||
                    !assessment?.allowed ||
                    providerPending ||
                    preflight.isPending
                  }
                  onClick={onExecute}
                >
                  {isLoading
                    ? 'Procesando...'
                    : preflight.isPending
                    ? 'Validando alcance...'
                    : executeLabel}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConsentDialogOpen(true)}
                title="Ver condiciones y política"
              >
                Condiciones
              </Button>
            </div>
          )}

          <p className="text-[11px] text-outline text-center">
            Las funciones y decisiones manuales permanecen 100% operativas en todo momento.
          </p>
        </div>
      </div>

      <AIConsentDialog
        isOpen={consentDialogOpen}
        onClose={() => setConsentDialogOpen(false)}
      />
    </>
  );
}
