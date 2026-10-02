import {ChevronRight} from 'lucide-react';
import {Link} from 'react-router-dom';

export const Breadcrumb = ({items}: { items: { label: string, to?: string }[] }) => (
    <div className="flex items-center text-[14px] text-outline mb-6">
        {items.map((item, index) => (
            <div key={index} className="flex items-center">
                {item.to ? (
                    <Link to={item.to}
                          className="hover:text-on-background hover:bg-surface-variant px-1 rounded-[4px] transition-colors">{item.label}</Link>
                ) : (
                    <span className="text-on-background font-medium px-1">{item.label}</span>
                )}
                {index < items.length - 1 && <ChevronRight size={14} className="mx-1 opacity-50"/>}
            </div>
        ))}
    </div>
);