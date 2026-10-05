import type {CSSProperties} from 'react';
import type {AnnotationData} from './nodes/AnnotationNode';

export const visualFonts = {
    system: {label: 'Interfaz', family: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif'},
    arial: {label: 'Arial', family: 'Arial, Helvetica, sans-serif'},
    verdana: {label: 'Verdana', family: 'Verdana, Geneva, sans-serif'},
    georgia: {label: 'Georgia', family: 'Georgia, Times, serif'},
    times: {label: 'Times New Roman', family: '"Times New Roman", Times, serif'},
    courier: {label: 'Courier New', family: '"Courier New", Courier, monospace'}
} as const;

const solid = (value: string | undefined, fallback: string) => value && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;

export function visualTextStyle(data: AnnotationData): CSSProperties {
    const font = data.fontFamily && data.fontFamily in visualFonts ? visualFonts[data.fontFamily] : visualFonts.system;
    const decorations = [data.underline && 'underline', data.strike && 'line-through'].filter(Boolean).join(' ');
    const shadow = data.shadow === 'soft' ? '0 2px 8px rgb(0 0 0 / 18%)' : data.shadow === 'strong' ? '0 8px 24px rgb(0 0 0 / 28%)' : undefined;
    return {
        fontFamily: font.family,
        fontSize: data.fontSize ?? 16,
        fontWeight: data.bold ? 700 : 400,
        fontStyle: data.italic ? 'italic' : 'normal',
        textDecoration: decorations || undefined,
        textTransform: data.textCase === 'upper' ? 'uppercase' : data.textCase === 'lower' ? 'lowercase' : 'none',
        textAlign: data.align ?? 'left',
        letterSpacing: `${data.letterSpacing ?? 0}px`,
        lineHeight: data.lineHeight ?? 1.4,
        color: solid(data.textColor, data.color === 'primary' ? 'var(--color-primary)' : data.color === 'muted' ? 'var(--color-outline)' : 'var(--color-on-background)'),
        backgroundColor: solid(data.backgroundColor, 'transparent'),
        opacity: (data.opacity ?? 100) / 100,
        border: data.outlineWidth ? `${data.outlineWidth}px solid ${solid(data.outlineColor, 'var(--color-outline)')}` : 'none',
        borderRadius: data.cornerRadius ?? 0,
        boxShadow: shadow,
        overflowWrap: 'anywhere',
        whiteSpace: 'pre-wrap'
    };
}
