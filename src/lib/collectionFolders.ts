export interface CollectionFolderNode {
    id: string;
    name: string;
    parentFolderId: string | null;
}

export function folderTrail<T extends CollectionFolderNode>(folders: T[], id: string | null | undefined): T[] {
    const byId = new Map(folders.map(folder => [folder.id, folder]));
    const seen = new Set<string>();
    const trail: T[] = [];
    for (let current = id; current && !seen.has(current); current = byId.get(current)?.parentFolderId) {
        seen.add(current);
        const folder = byId.get(current);
        if (!folder) break;
        trail.unshift(folder);
    }
    return trail;
}

export function isFolderDescendant(folders: CollectionFolderNode[], id: string, ancestorId: string): boolean {
    return folderTrail(folders, id).some(folder => folder.id === ancestorId);
}
