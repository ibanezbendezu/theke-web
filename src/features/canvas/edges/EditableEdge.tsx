import {BaseEdge, EdgeLabelRenderer, type EdgeProps, useReactFlow} from '@xyflow/react';
import {useCanvasStore} from '../../../store/useCanvasStore';
import {GripHorizontal} from 'lucide-react';
import {useRelation} from '../../../data/useRelations';
import {useRef, useState} from 'react';

export function EditableEdge({
                                 id,
                                 sourceX,
                                 sourceY,
                                 targetX,
                                 targetY,
                                 source,
                                 target,
                                 style,
                                 markerEnd,
                                 data,
                                 selected
                             }: EdgeProps) {
    const [hovered, setHovered] = useState(false);
    const suppressClick = useRef(false);
    const updateEdgeData = useCanvasStore(state => state.updateEdgeData);
    const beginGesture = useCanvasStore(state => state.beginGesture);
    const endGesture = useCanvasStore(state => state.endGesture);
    const requestEditRelation = useCanvasStore(state => state.requestEditRelation);
    const relationId = typeof data?.relationId === 'string' ? data.relationId : undefined;
    const relation = useRelation(relationId);
    const relationLabel = relation.data?.label || relation.data?.typeLabel || String(data?.typeLabel ?? data?.typeKey ?? 'Relación');
    const relationDirection = relation.data?.direction ?? data?.direction;
    const relationEvidence = relation.data?.evidenceStatus === 'confirmed' ? 'evidencia citada' : relation.data?.evidenceStatus === 'needs_evidence' ? 'falta evidencia' : 'sin evidencia citada';
    const sourceTitle = relation.data?.source.title ?? source;
    const targetTitle = relation.data?.target.title ?? target;
    const {screenToFlowPosition} = useReactFlow();

    // 1. Centro matemático exacto entre los dos nodos
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    // 2. OFFSET RELATIVO (La magia que resuelve tu problema)
    // Guardamos la "distancia" desde el centro en lugar de un punto fijo.
    // Así la curva viaja solidaria con los nodos cuando los mueves.
    const offset = (data?.offset as { x: number, y: number }) || {x: 0, y: 0};

    // 3. Posición del Punto de Control de la curva
    const cx = midX + offset.x;
    const cy = midY + offset.y;

    // 4. El punto exacto en la curva visible donde se anclará el texto
    const labelX = midX + (offset.x * 0.5);
    const labelY = midY + (offset.y * 0.5);

    // 5. Dibujo de la curva Bézier Cuadrática
    const edgePath = `M ${sourceX} ${sourceY} Q ${cx} ${cy} ${targetX} ${targetY}`;

    const handlePointerDown = (e: React.PointerEvent<HTMLElement>, requireMovement = false) => {
        e.stopPropagation();
        suppressClick.current = false;
        const target = e.currentTarget;
        const origin = {x: e.clientX, y: e.clientY};
        let dragging = !requireMovement;
        if (dragging) beginGesture();
        target.setPointerCapture(e.pointerId);

        const onPointerMove = (moveEvent: PointerEvent) => {
            if (!dragging) {
                if (Math.hypot(moveEvent.clientX - origin.x, moveEvent.clientY - origin.y) < 5) return;
                dragging = true;
                suppressClick.current = true;
                beginGesture();
            }
            const position = screenToFlowPosition({x: moveEvent.clientX, y: moveEvent.clientY});

            // Al arrastrar, calculamos la nueva "distancia" (offset) relativa al centro actual.
            const newOffsetX = (position.x - midX) * 2;
            const newOffsetY = (position.y - midY) * 2;

            updateEdgeData(id, {offset: {x: newOffsetX, y: newOffsetY}});
        };

        const onPointerUp = (upEvent: PointerEvent) => {
            if (target.hasPointerCapture(upEvent.pointerId)) target.releasePointerCapture(upEvent.pointerId);
            target.removeEventListener('pointermove', onPointerMove);
            target.removeEventListener('pointerup', onPointerUp);
            target.removeEventListener('pointercancel', onPointerUp);
            if (dragging) endGesture();
        };

        target.addEventListener('pointermove', onPointerMove);
        target.addEventListener('pointerup', onPointerUp);
        target.addEventListener('pointercancel', onPointerUp);
    };

    return (
        <>
            {/* La línea visible */}
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={selected ? {
                ...style,
                strokeWidth: 3,
                stroke: 'var(--color-primary)'
            } : hovered ? {...style, strokeWidth: 3, stroke: 'var(--color-on-background)'} : {
                ...style,
                strokeWidth: 2,
                stroke: 'var(--color-outline)'
            }}/>

            {/* Hitbox para facilitar el clic/selección de la línea */}
            <path d={edgePath} fill="none" strokeOpacity={0} strokeWidth={25}
                  className="react-flow__edge-interaction cursor-pointer" onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}/>

            {relationId && <>
                <circle cx={labelX} cy={labelY} r={8} fill="var(--color-background)"
                        pointerEvents="none" aria-hidden="true"/>
                <circle cx={labelX} cy={labelY} r={4.5}
                        fill={selected || hovered ? 'var(--color-primary)' : 'var(--color-background)'}
                        stroke={selected || hovered ? 'var(--color-primary)' : 'var(--color-outline)'}
                        strokeWidth={1.5} pointerEvents="none" aria-hidden="true"/>
            </>}

            {(selected || hovered) && <>
                <circle cx={sourceX} cy={sourceY} r={8} fill="var(--color-background)"
                        stroke="var(--color-primary)" strokeWidth={2} pointerEvents="none" aria-hidden="true"/>
                <circle cx={targetX} cy={targetY} r={8} fill="var(--color-background)"
                        stroke="var(--color-primary)" strokeWidth={2} pointerEvents="none" aria-hidden="true"/>
            </>}

            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        // Anclaje perfecto e inamovible usando left y top
                        left: `${labelX}px`,
                        top: `${labelY}px`,
                        transform: `translate(-50%, -50%)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan relative flex items-center justify-center"
                >
                    {relationId ? <button type="button"
                                          className="relative flex h-8 w-8 cursor-grab items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:cursor-grabbing"
                                          aria-label={`Editar Relación ${sourceTitle} ${relationDirection === 'directed' ? 'hacia' : 'con'} ${targetTitle}, ${relationLabel}, ${relationDirection === 'directed' ? 'dirigida' : 'no dirigida'}, ${relationEvidence}. Arrastra el punto para curvar la línea.`}
                                          onPointerDown={event => handlePointerDown(event, true)}
                                          onFocus={() => setHovered(true)}
                                          onBlur={() => setHovered(false)} onMouseEnter={() => setHovered(true)}
                                          onMouseLeave={() => setHovered(false)}
                                          onClick={event => {
                                              if (suppressClick.current) {
                                                  suppressClick.current = false;
                                                  event.preventDefault();
                                                  event.stopPropagation();
                                                  return;
                                              }
                                              requestEditRelation(relationId);
                                          }}>
                        <span aria-hidden="true"
                              className={`pointer-events-none absolute bottom-full left-1/2 mb-1 max-w-52 -translate-x-1/2 truncate whitespace-nowrap rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-medium text-on-background backdrop-blur-sm ${selected || hovered ? 'block' : 'hidden'}`}>
                            {relationLabel}
                        </span>
                    </button> : <input
                        value={(data?.label as string) || ''}
                        onChange={(e) => updateEdgeData(id, {label: e.target.value})}
                        placeholder="Añadir texto..."
                        className={`bg-background text-on-background font-medium text-xs px-2 py-1 outline-none text-center transition-all rounded-md border z-20
                            ${selected ? 'border-primary ring-1 ring-primary' : 'border-transparent hover:border-border'}
                        `}
                        style={{width: Math.max(100, ((data?.label as string)?.length || 0) * 8 + 30)}}
                    />}

                    {!relationId && <div
                        onPointerDown={handlePointerDown}
                        className={`absolute top-full mt-1 cursor-grab rounded-md bg-surface/90 p-1 text-outline transition-opacity hover:text-primary active:cursor-grabbing ${selected ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                    >
                        <GripHorizontal size={14}/>
                    </div>}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
