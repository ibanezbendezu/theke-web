import {useReactFlow} from '@xyflow/react';
import {useMemo} from 'react';
import {ZoomIn, ZoomOut, Maximize, Plus, Group, Type, Square, Minus, Undo2, Redo2, Link2} from 'lucide-react';
import {Button} from '../../components/ui/Button';
import {useCanvasStore} from '../../store/useCanvasStore';

export function CanvasToolbar({onAddResource, onCreateRelation}: {
    onAddResource?: () => void;
    onCreateRelation?: () => void
}) {
    // Este hook nos da acceso directo a los controles de la cámara del canvas
    const {zoomIn, zoomOut, fitView} = useReactFlow();
    const nodes = useCanvasStore(state => state.nodes);
    const selectedIds = useMemo(() => nodes.filter(node => node.selected && !node.parentId && node.type !== 'container').map(node => node.id), [nodes]);
    const groupNodes = useCanvasStore(state => state.groupNodes);
    const addAnnotation = useCanvasStore(state => state.addAnnotation);
    const undo = useCanvasStore(state => state.undo);
    const redo = useCanvasStore(state => state.redo);
    const canUndo = useCanvasStore(state => state.past.length > 0);
    const canRedo = useCanvasStore(state => state.future.length > 0);

    return (
        <>
            {(onAddResource || onCreateRelation) && <nav aria-label="Herramientas del lienzo"
                                                         className="absolute left-3 top-1/2 z-30 flex max-h-[calc(100dvh-11rem)] -translate-y-1/2 flex-col gap-2 overflow-y-auto">
                <div role="group" aria-label="Acciones del mapa" className="flex flex-col gap-0.5 rounded-lg bg-surface/90 p-1 backdrop-blur-md">
                {onAddResource && <Button variant="ghost" size="icon" icon={Plus} aria-label="Añadir recurso"
                                          title="Añadir recurso (A)" onClick={onAddResource}
                                          className="h-11 w-11 shrink-0"/>}
                {onCreateRelation && <Button variant="ghost" size="icon" icon={Link2} aria-label="Crear Relación"
                                             title="Crear Relación entre Recursos" onClick={onCreateRelation}
                                             className="h-11 w-11 shrink-0"/>}
                </div>
                {onAddResource && <div role="group" aria-label="Elementos visuales" className="flex flex-col gap-0.5 rounded-lg bg-surface/90 p-1 backdrop-blur-md">
                {selectedIds.length >= 2 &&
                    <Button variant="ghost" size="icon" icon={Group} aria-label="Crear grupo visual"
                            title="Agrupar selección" onClick={() => groupNodes(selectedIds)}
                            className="h-11 w-11 shrink-0"/>}
                <Button variant="ghost" size="icon" icon={Type} aria-label="Añadir texto visual"
                                            title="Añadir anotación de texto" onClick={() => addAnnotation('text')}
                                            className="h-11 w-11 shrink-0"/><Button variant="ghost" size="icon"
                                                                                    icon={Square}
                                                                                    aria-label="Añadir forma visual"
                                                                                    title="Añadir forma"
                                                                                    onClick={() => addAnnotation('shape')}
                                                                                    className="h-11 w-11 shrink-0"/><Button
                    variant="ghost" size="icon" icon={Minus} aria-label="Añadir línea visual"
                    title="Añadir línea decorativa" onClick={() => addAnnotation('line')}
                    className="h-11 w-11 shrink-0"/>
                </div>}
            </nav>}
            <div className="absolute bottom-3 left-3 z-30 flex gap-0.5 rounded-lg bg-surface/90 p-1 backdrop-blur-md">
                <Button variant="ghost" size="icon" icon={Undo2} aria-label="Deshacer" disabled={!canUndo}
                        onClick={undo} className="h-11 w-11"/><Button variant="ghost" size="icon" icon={Redo2}
                                                                      aria-label="Rehacer" disabled={!canRedo}
                                                                      onClick={redo} className="h-11 w-11"/></div>
            <div className="absolute bottom-3 right-3 z-30 flex gap-0.5 rounded-lg bg-surface/90 p-1 backdrop-blur-md">
                <Button
                    variant="ghost"
                    size="icon"
                    icon={ZoomOut}
                    aria-label="Alejar"
                    onClick={() => zoomOut({duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300})}
                    className="h-11 w-11"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    icon={ZoomIn}
                    aria-label="Acercar"
                    onClick={() => zoomIn({duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300})}
                    className="h-11 w-11"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    icon={Maximize}
                    aria-label="Ajustar vista"
                    onClick={() => fitView({
                        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500,
                        padding: 0.2
                    })}
                    className="h-11 w-11"
                />
            </div>
        </>
    );
}
