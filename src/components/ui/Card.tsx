import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  preview?: ReactNode;
  onClick?: () => void;
}

export function Card({ title, subtitle, icon, preview, onClick }: CardProps) {
  return (
    <button type="button" onClick={onClick} className="group flex w-full min-w-0 flex-col overflow-hidden rounded-lg border-0 bg-surface-variant/70 text-left text-on-background hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary">
      <div className="flex min-h-10 items-center gap-2 px-3 pt-2 text-sm font-medium">
        {icon && <span className="shrink-0 text-outline">{icon}</span>}
        <span className="truncate">{title}</span>
      </div>
      {preview && <div className="mt-1 flex aspect-[1.38] w-full items-center justify-center overflow-hidden rounded-md bg-background/60 text-outline">{preview}</div>}
      {subtitle && <span className="w-full truncate px-3 pb-3 pt-2 text-xs text-outline">{subtitle}</span>}
    </button>
  );
}
