import {type Node, type NodeProps} from '@xyflow/react';
import {ResourceCard} from '../ResourceCard';

export type LinkNodeData = {
    url: string;
    title: string;
    description?: string;
    imageUrl?: string;
};

export type LinkNodeType = Node<LinkNodeData, 'link'>;

// Compatibility renderer for links saved before web links became canonical Library resources.
export function LinkNode({id, data, selected, width = 208, height = 72}: NodeProps<LinkNodeType>) {
    const open = () => {
        if (/^https?:\/\//i.test(data.url)) window.open(data.url, '_blank', 'noopener,noreferrer');
    };
    return <div style={{width, height}}>
        <ResourceCard resource={{id, title: data.title, type: 'link', mediaType: null,
            description: data.description, url: data.url, previewImageUrl: data.imageUrl}}
            mode={height >= 160 ? 'normal' : 'mini'} selected={selected} onOpen={open}/>
    </div>;
}
