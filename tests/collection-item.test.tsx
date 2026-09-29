import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Folder } from 'lucide-react';
import { CollectionItem } from '../src/components/ui/CollectionItem';

afterEach(cleanup);

describe('menú de colección', () => {
  it.each(['list', 'grid'] as const)('abre opciones por botón y clic derecho en %s', (view) => {
    const rename = vi.fn();
    const props = { view, title: 'Fuentes', icon: <Folder/>, onOpen: vi.fn(), actions: [{ label: 'Renombrar', onSelect: rename }] };
    const { container } = render(<CollectionItem {...props}/>);
    fireEvent.click(screen.getByRole('button', { name: 'Opciones de Fuentes' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Renombrar' }));
    expect(rename).toHaveBeenCalledTimes(1);
    fireEvent.contextMenu(container.firstElementChild!);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Renombrar' }));
    expect(rename).toHaveBeenCalledTimes(2);
  });
});
