import {Button} from '../../components/ui/Button';
import {Select} from '../../components/ui/Select';
import {useCanvasStore} from '../../store/useCanvasStore';
import type {AnnotationData} from './nodes/AnnotationNode';

const numeric = (value: string, min: number, max: number) => {
    const parsed = Number(value);
    return Math.min(max, Math.max(min, Number.isFinite(parsed) ? parsed : min));
};

export function CanvasAnnotationInspector({nodeId}: { nodeId: string }) {
    const node = useCanvasStore(state => state.nodes.find(item => item.id === nodeId));
    const updateNodeData = useCanvasStore(state => state.updateNodeData);
    const updateNodeSize = useCanvasStore(state => state.updateNodeSize);
    const duplicateNode = useCanvasStore(state => state.duplicateNode);
    const removeNodes = useCanvasStore(state => state.removeNodes);
    const updateNodePresentation = useCanvasStore(state => state.updateNodePresentation);
    const undo = useCanvasStore(state => state.undo);
    const redo = useCanvasStore(state => state.redo);
    const canUndo = useCanvasStore(state => state.past.length > 0);
    const canRedo = useCanvasStore(state => state.future.length > 0);
    if (!node) return null;
    const data = node.data as AnnotationData;
    const set = (value: Partial<AnnotationData>) => updateNodeData(nodeId, value);
    return <div className="space-y-4 text-sm"><h2 className="font-semibold">Anotación visual</h2><p
        className="text-xs text-outline">Solo existe en este diagrama; no es un Recurso ni una Relación.</p>
        {data.kind === 'text' && <p className="text-xs text-outline">Edita el texto con doble clic y usa la barra contextual para darle formato.</p>}
        {data.kind === 'shape' && <label className="block">Forma<Select label="Forma" className="mt-1"
            value={data.shape ?? 'rectangle'}
            onValueChange={value => set({shape: value as AnnotationData['shape']})}>
            <option value="rectangle">Rectángulo</option>
            <option value="ellipse">Elipse</option>
        </Select></label>}
        {data.kind !== 'text' && <>
            <div className="flex gap-2"><label className="min-w-0 flex-1">Ancho<input type="number" min={40} max={2000}
                                                                                      className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
                                                                                      value={Math.round(node.width ?? 240)}
                                                                                      onChange={event => updateNodeSize(nodeId, numeric(event.target.value, 40, 2000), node.height ?? 100)}/></label><label
                className="min-w-0 flex-1">Alto<input type="number" min={24} max={2000}
                                                      className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
                                                      value={Math.round(node.height ?? 100)}
                                                      onChange={event => updateNodeSize(nodeId, node.width ?? 240, numeric(event.target.value, 24, 2000))}/></label>
            </div>
            <label className="block">Grosor<input type="number" min={1} max={16}
                                                  className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
                                                  value={data.thickness ?? 2}
                                                  onChange={event => set({thickness: numeric(event.target.value, 1, 16)})}/></label><label
            className="block">Estilo<Select label="Estilo" className="mt-1"
            value={data.dash ?? 'solid'} onValueChange={value => set({dash: value as AnnotationData['dash']})}>
            <option value="solid">Continuo</option>
            <option value="dashed">Discontinuo</option>
        </Select></label></>}
        {data.kind === 'line' && <fieldset className="grid grid-cols-2 gap-2">
            <legend className="font-medium">Extremos de línea (%)</legend>
            {(['x1', 'y1', 'x2', 'y2'] as const).map(axis => <label key={axis}>{axis.toUpperCase()}<input type="number"
                                                                                                          min={0}
                                                                                                          max={100}
                                                                                                          className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
                                                                                                          value={data[axis] ?? ({
                                                                                                              x1: 5,
                                                                                                              y1: 50,
                                                                                                              x2: 95,
                                                                                                              y2: 50
                                                                                                          }[axis])}
                                                                                                          onChange={event => set({[axis]: numeric(event.target.value, 0, 100)})}/></label>)}
        </fieldset>}
        {data.kind !== 'text' && <label className="block">Color<Select label="Color" className="mt-1"
            value={data.color ?? 'default'}
            onValueChange={value => set({color: value as AnnotationData['color']})}>
            <option value="default">Texto del tema</option>
            <option value="primary">Primario</option>
            <option value="muted">Tenue</option>
        </Select></label>}
        <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(node.hidden)}
                                                          onChange={event => updateNodePresentation(nodeId, {hidden: event.target.checked})}/>Ocultar
            en el Canvas</label>
        <div className="flex flex-wrap gap-2"><Button onClick={() => duplicateNode(nodeId)}>Duplicar</Button><Button
            onClick={() => removeNodes([nodeId])}>Eliminar anotación</Button><Button disabled={!canUndo}
                                                                                     onClick={undo}>Deshacer</Button><Button
            disabled={!canRedo} onClick={redo}>Rehacer</Button></div>
    </div>;
}
