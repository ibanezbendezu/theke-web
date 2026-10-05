import {describe, expect, it} from 'vitest';
import type {DiagramDocument} from '../src/data/useDiagrams';
import type {CreatedRelation} from '../src/data/useRelations';
import {mergeCreatedRelation} from '../src/features/canvas/mergeCreatedRelation';

const document = (edges: DiagramDocument['edges']): DiagramDocument => ({
    schemaVersion: 1,
    nodes: [],
    edges,
    viewport: {x: 42, y: 13, zoom: 0.7},
    background: {variant: 'plain', tone: 'default'}
});

describe('mergeCreatedRelation', () => {
    it('adds only the requested line when the server response still contains older lines', () => {
        const previous = Array.from({length: 4}, (_, index) => ({
            id: `old-${index}`, source: 'a', target: 'b', data: {relationId: `old-relation-${index}`}
        }));
        const created = {id: 'new-edge', source: 'a', target: 'b', data: {relationId: 'new-relation'}};
        const result: CreatedRelation = {
            relationId: 'new-relation', edgeId: 'new-edge', revision: 7,
            document: document([...previous, created]), reused: true
        };

        expect(mergeCreatedRelation(document([]), result)).toEqual(document([created]));
    });

    it('reveals an existing line without creating another one', () => {
        const hidden = {id: 'existing-edge', source: 'a', target: 'b', hidden: true, data: {relationId: 'relation'}};
        const result: CreatedRelation = {
            relationId: 'relation', edgeId: hidden.id, revision: 3,
            document: document([hidden]), reused: true
        };

        expect(mergeCreatedRelation(document([hidden]), result).edges).toEqual([{...hidden, hidden: false}]);
    });

    it('keeps the chosen handles and curve when replacing a connection', () => {
        const old = {id: 'old-edge', source: 'a', target: 'b', data: {relationId: 'old-relation', offset: {x: 20, y: 40}}};
        const created = {id: 'new-edge', source: 'a', target: 'c', data: {relationId: 'new-relation', offset: {x: 60, y: 0}}};
        const result: CreatedRelation = {relationId: 'new-relation', edgeId: 'new-edge', revision: 8,
            document: document([old, created]), reused: false};

        expect(mergeCreatedRelation(document([old]), result, old.id,
            {sourceHandle: 'bottom', targetHandle: 'left', offset: {x: 20, y: 40}}).edges).toEqual([{
            ...created, sourceHandle: 'bottom', targetHandle: 'left', data: {...created.data, offset: {x: 20, y: 40}}
        }]);
    });
});
