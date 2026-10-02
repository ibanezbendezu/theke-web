import React from 'react';
import {cn} from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'icon';
    icon?: React.ElementType;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({className, variant = 'ghost', size = 'sm', icon: Icon, children, ...props}, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
                    {
                        'bg-primary text-white hover:bg-primary/90': variant === 'primary',
                        'bg-surface-variant text-on-background hover:bg-border/50': variant === 'secondary',
                        'bg-surface-variant/70 hover:bg-surface-variant text-on-background': variant === 'outline',
                        'bg-transparent hover:bg-surface-variant text-outline hover:text-on-background': variant === 'ghost',
                        'h-9 px-3 text-[14px]': size === 'sm',
                        'h-10 px-3 text-[14px]': size === 'md',
                        'h-9 w-9 p-0': size === 'icon',
                    },
                    className
                )}
                {...props}
            >
                {Icon && <Icon size={16} strokeWidth={2}/>}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';
