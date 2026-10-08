import {Background, BackgroundVariant} from '@xyflow/react';
import type {CanvasBackground} from '../../data/useDiagrams';

export function CanvasBackgroundPattern({variant}: {variant: CanvasBackground['variant']}) {
    if (variant === 'plain') return null;
    const isGrid = variant === 'grid';
    return <Background
        variant={isGrid ? BackgroundVariant.Lines : BackgroundVariant.Dots}
        color={isGrid ? 'var(--canvas-grid-color)' : 'var(--canvas-dot-color)'}
        gap={isGrid ? 48 : 24}
        size={isGrid ? undefined : 2}/>;
}
