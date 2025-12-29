import React, { useState } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
    delay?: number;
    width?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
    content, 
    children, 
    position = 'top', 
    className = '',
    delay = 300,
    width = 'w-48'
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

    const showTooltip = () => {
        const id = setTimeout(() => setIsVisible(true), delay);
        setTimeoutId(id);
    };

    const hideTooltip = () => {
        if (timeoutId) clearTimeout(timeoutId);
        setIsVisible(false);
    };

    const positionStyles = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    const arrowStyles = {
        top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-slate-900 border-x-transparent border-b-transparent',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-slate-900 border-x-transparent border-t-transparent',
        left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-slate-900 border-y-transparent border-r-transparent',
        right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-slate-900 border-y-transparent border-l-transparent'
    };

    return (
        <div 
            className={`relative flex items-center ${className}`}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}
            {isVisible && (
                <div className={`absolute z-50 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-center pointer-events-none backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150 ${width} ${positionStyles[position]}`}>
                    {content}
                    {/* Arrow */}
                    <div className={`absolute w-0 h-0 border-4 ${arrowStyles[position]}`} />
                </div>
            )}
        </div>
    );
};