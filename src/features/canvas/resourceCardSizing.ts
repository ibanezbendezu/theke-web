export type ResourceDisplayMode = 'mini' | 'normal';

export const resourceCardSize: Record<ResourceDisplayMode, {width: number; height: number}> = {
    mini: {width: 208, height: 72},
    normal: {width: 304, height: 224}
};
