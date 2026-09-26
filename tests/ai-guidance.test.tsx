import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AIGuidanceCard } from '../src/components/ai/AIGuidanceCard';
import { AIConsentDialog } from '../src/components/ai/AIConsentDialog';
import { AISettingsDialog } from '../src/components/ai/AISettingsDialog';

const mockState = vi.hoisted(() => ({
  status: {
    enabled: false,
    consent: {
      required: true,
      currentVersion: '2026-09-25.1',
      acceptedVersion: null as string | null,
      consentedAt: null as string | null,
      isConsented: false,
      provider: 'openai',
      model: 'gpt-5.6-terra',
      policy: {
        provider: 'openai',
        model: 'gpt-5.6-terra',
        store: false,
        reasoningEffort: 'medium',
        retentionDays: 30,
        trainModels: false,
        description: 'Usa OpenAI Responses API con modelo gpt-5.6-terra',
      },
    },
    quota: {
      dailyRuns: { used: 0, limit: 10, remaining: 10 },
      monthlyBudget: { usedUsd: 0, limitUsd: 5, remainingUsd: 5 },
      maxInputTokens: 50000,
      maxOutputTokens: 4000,
    },
  },
  consentMutation: vi.fn(),
  revokeMutation: vi.fn(),
  settingsMutation: vi.fn(),
  preflightMutation: vi.fn(),
}));

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ getToken: vi.fn().mockResolvedValue('test-token'), userId: 'user-1' }),
}));

vi.mock('../src/data/useAi', () => ({
  useAiStatus: () => ({ data: mockState.status, isPending: false }),
  useAiActions: () => ({
    consent: { mutateAsync: mockState.consentMutation, isPending: false },
    revoke: { mutateAsync: mockState.revokeMutation, isPending: false },
    settings: { mutateAsync: mockState.settingsMutation, mutate: mockState.settingsMutation, isPending: false },
    preflight: { mutateAsync: mockState.preflightMutation, mutate: mockState.preflightMutation, isPending: false },
  }),
}));

describe('Gobernanza de IA y Componentes de Consentimiento', () => {
  let queryClient: QueryClient;

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockState.status = {
      enabled: false,
      consent: {
        required: true,
        currentVersion: '2026-09-25.1',
        acceptedVersion: null,
        consentedAt: null,
        isConsented: false,
        provider: 'openai',
        model: 'gpt-5.6-terra',
        policy: {
          provider: 'openai',
          model: 'gpt-5.6-terra',
          store: false,
          reasoningEffort: 'medium',
          retentionDays: 30,
          trainModels: false,
          description: 'Usa OpenAI Responses API con modelo gpt-5.6-terra',
        },
      },
      quota: {
        dailyRuns: { used: 0, limit: 10, remaining: 10 },
        monthlyBudget: { usedUsd: 0, limitUsd: 5, remainingUsd: 5 },
        maxInputTokens: 50000,
        maxOutputTokens: 4000,
      },
    };
    mockState.consentMutation = vi.fn().mockResolvedValue({});
    mockState.revokeMutation = vi.fn().mockResolvedValue({});
    mockState.settingsMutation = vi.fn().mockResolvedValue({});
    mockState.preflightMutation = vi.fn().mockResolvedValue({});
  });

  it('muestra estado de consentimiento requerido y abre el diálogo informado', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AIGuidanceCard selectedResourceIds={['res-1']} />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Consentimiento requerido')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Otorgar consentimiento informado' })).toBeInTheDocument();
    expect(screen.getByText(/Las funciones y decisiones manuales permanecen 100% operativas/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Otorgar consentimiento informado' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Consentimiento informado de Asistencia de IA/)).toBeInTheDocument();
    expect(screen.getByText(/gpt-5.6-terra/)).toBeInTheDocument();
    expect(screen.getByText(/Sin entrenamiento:/)).toBeInTheDocument();
  });

  it('valida casilla de aceptación antes de permitir confirmar consentimiento', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AIConsentDialog isOpen={true} onClose={vi.fn()} />
      </QueryClientProvider>,
    );

    const submitBtn = screen.getByRole('button', { name: 'Aceptar y habilitar IA' });
    expect(submitBtn).toBeDisabled();

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);
    expect(mockState.consentMutation).toHaveBeenCalledWith({
      consentVersion: '2026-09-25.1',
      enabled: true,
    });
  });

  it('muestra alcance de recursos, tokens y cuotas cuando la IA está activa', () => {
    mockState.status = {
      enabled: true,
      consent: {
        required: false,
        currentVersion: '2026-09-25.1',
        acceptedVersion: '2026-09-25.1',
        consentedAt: '2026-09-25T12:00:00Z',
        isConsented: true,
        provider: 'openai',
        model: 'gpt-5.6-terra',
        policy: {
          provider: 'openai',
          model: 'gpt-5.6-terra',
          store: false,
          reasoningEffort: 'medium',
          retentionDays: 30,
          trainModels: false,
          description: 'Usa OpenAI Responses API con modelo gpt-5.6-terra',
        },
      },
      quota: {
        dailyRuns: { used: 3, limit: 10, remaining: 7 },
        monthlyBudget: { usedUsd: 1.25, limitUsd: 5, remainingUsd: 3.75 },
        maxInputTokens: 50000,
        maxOutputTokens: 4000,
      },
    };

    const mockExecute = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <AIGuidanceCard
          selectedResourceIds={['res-1', 'res-2']}
          actionTitle="Sugerencia de relaciones"
          onExecute={mockExecute}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText(/IA Activa/)).toBeInTheDocument();
    expect(screen.getByText(/7 \/ 10 restantes hoy/)).toBeInTheDocument();
    expect(screen.getByText(/\$3\.75 \/ \$5\.00 USD/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Condiciones' })).toBeInTheDocument();
  });

  it('permite revocar consentimiento en el diálogo de configuración', async () => {
    mockState.status = {
      enabled: true,
      consent: {
        required: false,
        currentVersion: '2026-09-25.1',
        acceptedVersion: '2026-09-25.1',
        consentedAt: '2026-09-25T12:00:00Z',
        isConsented: true,
        provider: 'openai',
        model: 'gpt-5.6-terra',
        policy: {
          provider: 'openai',
          model: 'gpt-5.6-terra',
          store: false,
          reasoningEffort: 'medium',
          retentionDays: 30,
          trainModels: false,
          description: 'Usa OpenAI Responses API con modelo gpt-5.6-terra',
        },
      },
      quota: {
        dailyRuns: { used: 0, limit: 10, remaining: 10 },
        monthlyBudget: { usedUsd: 0, limitUsd: 5, remainingUsd: 5 },
        maxInputTokens: 50000,
        maxOutputTokens: 4000,
      },
    };

    render(
      <QueryClientProvider client={queryClient}>
        <AISettingsDialog isOpen={true} onClose={vi.fn()} />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Configuración y Privacidad de IA')).toBeInTheDocument();
    const revokeBtn = screen.getByRole('button', { name: 'Revocar consentimiento' });
    fireEvent.click(revokeBtn);
    expect(mockState.revokeMutation).toHaveBeenCalled();
  });
});
