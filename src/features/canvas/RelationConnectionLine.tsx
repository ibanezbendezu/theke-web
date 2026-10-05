import type {ConnectionLineComponentProps} from '@xyflow/react';

export function RelationConnectionLine({fromX, fromY, toX, toY}: ConnectionLineComponentProps) {
    return <path d={`M ${fromX} ${fromY} L ${toX} ${toY}`}
                 fill="none" stroke="var(--color-outline)"
                 strokeWidth={2} />;
}
