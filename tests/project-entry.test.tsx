import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { ProjectEntry } from '../src/pages/ProjectEntry';

vi.mock('../src/data/useProjects', () => ({ useProject: () => ({ isPending: false, isError: false, data: { id: 'project-one' } }) }));
vi.mock('../src/data/useDiagrams', () => ({ useDiagrams: (_projectId: string, status: string) => ({ isPending: false, isError: false, data: status === 'active' ? [{ id: 'map-one' }] : [] }) }));

function EditorRoute() { const { diagramId } = useParams(); return <p>Editor: {diagramId}</p>; }

afterEach(cleanup);

describe('entrada a un proyecto', () => {
  it('abre directamente su mapa', async () => {
    render(<MemoryRouter initialEntries={['/projects/project-one']}><Routes><Route path="/projects/:projectId" element={<ProjectEntry/>}/><Route path="/projects/:projectId/diagrams/:diagramId" element={<EditorRoute/>}/></Routes></MemoryRouter>);
    expect(await screen.findByText('Editor: map-one')).toBeInTheDocument();
  });
});
