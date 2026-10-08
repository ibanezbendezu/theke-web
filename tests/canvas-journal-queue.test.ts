import {expect, it, vi} from 'vitest';
import {createCanvasJournalQueue} from '../src/data/canvasJournalQueue';
import type {CanvasDraft} from '../src/data/canvasJournal';

const draft = (operationId: string): CanvasDraft => ({
    key: 'map', operationId, baseRevision: 1,
    document: {schemaVersion: 1, nodes: [], edges: [], viewport: {x: 0, y: 0, zoom: 1}}
});

it('conserva el primer borrador en curso y escribe solo el último de una ráfaga', async () => {
    let finishFirst!: () => void;
    const first = new Promise<void>(resolve => {finishFirst = resolve;});
    const write = vi.fn().mockImplementationOnce(() => first).mockResolvedValue(undefined);
    const remove = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn();
    const journal = createCanvasJournalQueue(write, remove, onError);
    journal.queue(draft('first'));
    await vi.waitFor(() => expect(write).toHaveBeenCalledOnce());
    journal.queue(draft('middle'));
    journal.queue(draft('latest'));
    finishFirst();
    await journal.flush();
    expect(write.mock.calls.map(call => (call[0] as CanvasDraft).operationId)).toEqual(['first', 'latest']);
    expect(onError).not.toHaveBeenCalled();
    await journal.clear('map', 'latest');
    expect(remove).toHaveBeenCalledWith('map', 'latest');
});
