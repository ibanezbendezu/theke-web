import type { ReactNode } from 'react';
import { Dialog } from '../../components/ui/Dialog';

export function CanvasDialog({ titleId, onClose, children, className = '' }: { titleId: string; onClose: () => void; children: ReactNode; className?: string }) {
  return <Dialog titleId={titleId} onClose={onClose} className={className} shadow={false}>{children}</Dialog>;
}
