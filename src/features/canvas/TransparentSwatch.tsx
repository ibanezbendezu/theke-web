export function TransparentSwatch({className = 'h-4 w-4'}: {className?: string}) {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
        <rect x="1" y="1" width="22" height="22" rx="3" fill="#fff" stroke="#b5b5b5" strokeWidth="1.5"/>
        <path d="M3 21 21 3" stroke="#d43c3c" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>;
}
