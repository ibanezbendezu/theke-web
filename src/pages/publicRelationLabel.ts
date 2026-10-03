import type {SharePreviewRelation} from '../api/generated/models';

export function publicRelationLabel(relation: Pick<SharePreviewRelation, 'label' | 'typeLabel'>): string {
    return relation.label?.trim() || relation.typeLabel?.trim() || 'Relación';
}
