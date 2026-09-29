import { useEffect, useState } from 'react';

export type CollectionView = 'grid' | 'list';

export function useCollectionView(key: string, defaultView: CollectionView) {
  const [viewMode, setViewMode] = useState<CollectionView>(() => {
    const saved = window.localStorage.getItem(`theke:view:${key}`);
    return saved === 'grid' || saved === 'list' ? saved : defaultView;
  });

  useEffect(() => {
    window.localStorage.setItem(`theke:view:${key}`, viewMode);
  }, [key, viewMode]);

  return [viewMode, setViewMode] as const;
}
