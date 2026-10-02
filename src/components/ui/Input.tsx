import React from 'react';
import {cn} from '../../lib/utils';
import {Search} from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ElementType;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({className, icon: Icon = Search, ...props}, ref) => {
        return (
            <div className="relative flex items-center w-full">
                {Icon && <Icon size={16} className="absolute left-2.5 text-outline pointer-events-none"/>}
                <input
                    ref={ref}
                    className={cn(
                        "h-9 w-full rounded-md border-0 bg-surface-variant pl-8 pr-3 text-[14px] text-on-background placeholder:text-outline hover:bg-surface-variant/80",
                        "focus:outline-2 focus:outline-primary focus:outline-offset-2",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);
Input.displayName = 'Input';
