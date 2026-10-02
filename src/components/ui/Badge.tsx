import {cn} from '../../lib/utils';

export const Badge = ({children, className}: { children: React.ReactNode, className?: string }) => (
    <span
        className={cn("inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-surface-variant text-outline text-[12px] font-medium w-fit", className)}>
        {children}
    </span>
);