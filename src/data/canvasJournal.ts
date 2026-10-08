import type {DiagramDocument} from './useDiagrams';

export interface CanvasDraft {
    key: string;
    document: DiagramDocument;
    baseRevision: number;
    operationId: string
}

const databaseName = 'theke-canvas-journal';

function openJournal(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, 1);
        request.onupgradeneeded = () => request.result.createObjectStore('drafts', {keyPath: 'key'});
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function operation<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const database = await openJournal();
    try {
        return await new Promise<T>((resolve, reject) => {
            const transaction = database.transaction('drafts', mode);
            const request = run(transaction.objectStore('drafts'));
            let result: T;
            request.onsuccess = () => {
                result = request.result;
            };
            request.onerror = () => reject(request.error);
            transaction.oncomplete = () => resolve(result);
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });
    } finally {
        database.close();
    }
}

export const readCanvasDraft = (key: string) => operation('readonly', store => store.get(key) as IDBRequest<CanvasDraft | undefined>);
export const writeCanvasDraft = (draft: CanvasDraft) => operation('readwrite', store => store.put(draft));
export const deleteCanvasDraft = (key: string) => operation('readwrite', store => store.delete(key));

export async function deleteCanvasDraftIfMatches(key: string, operationId: string): Promise<void> {
    const database = await openJournal();
    try {
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction('drafts', 'readwrite');
            const store = transaction.objectStore('drafts');
            const request = store.get(key) as IDBRequest<CanvasDraft | undefined>;
            request.onsuccess = () => {
                if (request.result?.operationId === operationId) store.delete(key);
            };
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });
    } finally {
        database.close();
    }
}
