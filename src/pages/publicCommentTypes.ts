export type CommentTarget =
    | { type: 'diagram'; x: number; y: number }
    | { type: 'resource'; resourceId: string }
    | { type: 'relation'; relationId: string };

export type CommentAnchor =
    | { type: 'diagram'; x?: number; y?: number }
    | { type: 'resource'; resourceId: string; label: string; x?: number; y?: number }
    | { type: 'relation'; relationId: string; label: string; x?: number; y?: number };

export type PublicComment = {
    id: string;
    displayName: string;
    content: string;
    createdAt: string;
    editedAt: string | null;
    revision: number;
    editable: boolean;
    anchored: boolean;
    anchor: CommentAnchor
};

export function anchorLabel(anchor: CommentAnchor | CommentTarget | null): string {
    if (!anchor) return 'Mapa completo';
    if (anchor.type === 'resource') return 'label' in anchor ? anchor.label : 'Recurso';
    if (anchor.type === 'relation') return 'label' in anchor ? anchor.label : 'Relación';
    return typeof anchor.x === 'number' && typeof anchor.y === 'number' ? 'Punto del mapa' : 'Mapa completo';
}
