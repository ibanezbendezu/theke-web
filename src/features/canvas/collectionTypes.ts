export type CollectionDisplayMode = 'stack' | 'gallery' | 'list';

export const collectionSize: Record<CollectionDisplayMode, {width: number; height: number}> = {
    stack: {width: 240, height: 132},
    gallery: {width: 336, height: 276},
    list: {width: 320, height: 244}
};

