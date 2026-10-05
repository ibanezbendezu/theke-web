import {describe, expect, it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {VisualTextContent} from '../src/features/canvas/VisualTextContent';
import {visualTextStyle} from '../src/features/canvas/visualTextStyle';

describe('texto visual', () => {
    it('combina formato, apariencia y lista sin alterar el contenido', () => {
        const style = visualTextStyle({kind: 'text', bold: true, italic: true, underline: true, strike: true,
            textCase: 'upper', align: 'justify', listStyle: 'number', fontFamily: 'georgia', fontSize: 32,
            textColor: '#d44c47', letterSpacing: 1.5, lineHeight: 1.8, opacity: 65,
            shadow: 'soft', outlineWidth: 2, backgroundColor: '#ffffff', cornerRadius: 12});
        expect(style).toMatchObject({fontSize: 32, fontWeight: 700, fontStyle: 'italic', textDecoration: 'underline line-through',
            textTransform: 'uppercase', textAlign: 'justify', color: '#d44c47', letterSpacing: '1.5px',
            lineHeight: 1.8, opacity: 0.65, backgroundColor: '#ffffff', borderRadius: 12});
        expect(renderToStaticMarkup(<VisualTextContent text={'Uno\nDos'} listStyle="number"/>)).toContain('<ol');
        expect(renderToStaticMarkup(<VisualTextContent text={'Uno\nDos'} listStyle="number"/>)).toContain('<li>Dos</li>');
    });
});
