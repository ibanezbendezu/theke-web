import {Handle, Position, type NodeProps, type Node} from '@xyflow/react';
import {NodeResizer} from '@xyflow/react';
import {useCanvasStore} from '../../../store/useCanvasStore';

export type ShapeNodeData = {
    shapeType: 'rectangle' | 'circle' | 'polygon' | 'line';
    sides?: number; // Para el polígono (3 = triángulo, 5 = pentágono...)
    borderRadius?: number; // Para rectángulos y líneas
    color?: string; // Variable CSS, ej: 'var(--color-note-yellow)'
};

export type ShapeNodeType = Node<ShapeNodeData, 'shape'>;

export function ShapeNode({data, selected, width = 100, height = 100}: NodeProps<ShapeNodeType>) {
    const beginGesture = useCanvasStore(state => state.beginGesture);
    const endGesture = useCanvasStore(state => state.endGesture);
    const {shapeType, sides = 3, borderRadius = 8, color = 'var(--color-surface)'} = data;

    // Función matemática para dibujar polígonos de N caras (ej. Triángulo)
    const getPolygonPoints = () => {
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) / 2;
        const points = [];

        for (let i = 0; i < sides; i++) {
            // Empezamos en -PI/2 para que la punta mire hacia arriba
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            points.push(`${x},${y}`);
        }
        return points.join(' ');
    };

    return (
        <>
            {/* Este componente nativo de React Flow añade los controles de redimensión */}
            <NodeResizer
                color="var(--color-primary)"
                isVisible={selected}
                minWidth={20}
                minHeight={shapeType === 'line' ? 4 : 20}
                onResizeStart={beginGesture}
                onResizeEnd={endGesture}
            />

            <div
                className="relative h-full w-full"
                style={{width, height}}
            >
                {/* RENDERIZADO CONDICIONAL DE LA FIGURA */}

                {shapeType === 'rectangle' && (
                    <div
                        className="w-full h-full border-2 border-outline/50 transition-colors group-hover:border-outline"
                        style={{backgroundColor: color, borderRadius: `${borderRadius}px`}}
                    />
                )}

                {shapeType === 'circle' && (
                    <div
                        className="w-full h-full border-2 border-outline/50 transition-colors group-hover:border-outline rounded-full"
                        style={{backgroundColor: color}}
                    />
                )}

                {shapeType === 'line' && (
                    // Una línea es simplemente un rectángulo muy delgado y redimensionable horizontalmente
                    <div className="w-full h-full flex items-center justify-center">
                        <div
                            className="w-full bg-outline transition-colors group-hover:bg-on-background"
                            style={{height: '4px', borderRadius: `${borderRadius}px`}}
                        />
                    </div>
                )}

                {shapeType === 'polygon' && (
                    <svg width="100%" height="100%" className="overflow-visible">
                        <polygon
                            points={getPolygonPoints()}
                            fill={color}
                            stroke="var(--color-outline)"
                            strokeWidth="2"
                            strokeOpacity="0.5"
                            strokeLinejoin="round" // Esto redondea suavemente las puntas del triángulo/polígono
                            className="transition-colors group-hover:stroke-outline"
                        />
                    </svg>
                )}

                {/* Handles centrales para poder conectar líneas a estas formas */}
                <Handle id="left" type="target" position={Position.Left} className="opacity-0 group-hover:opacity-100 w-2 h-2"/>
                <Handle id="right" type="source" position={Position.Right} className="opacity-0 group-hover:opacity-100 w-2 h-2"/>
                <Handle type="target" position={Position.Top} className="opacity-0 group-hover:opacity-100 w-2 h-2"
                        id="top"/>
                <Handle type="source" position={Position.Bottom} className="opacity-0 group-hover:opacity-100 w-2 h-2"
                        id="bottom"/>
            </div>
        </>
    );
}
