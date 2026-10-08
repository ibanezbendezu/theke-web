import type {CanvasDraft} from './canvasJournal';

export function createCanvasJournalQueue(
    write: (draft: CanvasDraft) => Promise<unknown>,
    remove: (key: string, operationId?: string) => Promise<unknown>,
    onError: () => void
) {
    let pending: CanvasDraft | null = null;
    let tail: Promise<void> = Promise.resolve();
    let draining = false;
    let failure: unknown;

    const drain = () => {
        if (draining || !pending) return;
        draining = true;
        const current = tail.catch(() => {}).then(async () => {
            while (pending) {
                const draft = pending;
                pending = null;
                try {
                    await write(draft);
                } catch (error) {
                    pending ??= draft;
                    failure = error;
                    throw error;
                }
            }
        });
        tail = current.finally(() => {
            draining = false;
            if (pending && failure === undefined) drain();
        });
        void tail.catch(() => onError());
    };

    const flush = async () => {
        for (;;) {
            if (failure !== undefined) throw failure;
            drain();
            const current = tail;
            await current;
            if (failure !== undefined) throw failure;
            if (!pending && !draining && current === tail) return;
        }
    };

    return {
        queue(draft: CanvasDraft) {
            pending = draft;
            failure = undefined;
            drain();
        },
        flush,
        async clear(key: string, operationId?: string) {
            await flush();
            const current = tail.then(() => remove(key, operationId)).then(() => {});
            tail = current;
            await current;
        },
        get failed() { return failure !== undefined; }
    };
}
