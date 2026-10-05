import type {AnnotationData} from './nodes/AnnotationNode';

export function VisualTextContent({text, listStyle}: {text: string; listStyle?: AnnotationData['listStyle']}) {
    if (listStyle === 'bullet' || listStyle === 'number') {
        const Tag = listStyle === 'bullet' ? 'ul' : 'ol';
        return <Tag className={`m-0 pl-6 ${listStyle === 'bullet' ? 'list-disc' : 'list-decimal'}`}>
            {text.split('\n').map((line, index) => <li key={index}>{line || '\u00a0'}</li>)}
        </Tag>;
    }
    return <>{text}</>;
}
