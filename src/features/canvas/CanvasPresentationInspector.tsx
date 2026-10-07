import {useCanvasStore} from '../../store/useCanvasStore';
import {Select} from '../../components/ui/Select';

export function CanvasPresentationInspector({nodeId}: { nodeId: string }) {
    const node = useCanvasStore(state => state.nodes.find(item => item.id === nodeId));
    const update = useCanvasStore(state => state.updateNodePresentation);
    const setResourceDisplayMode = useCanvasStore(state => state.setResourceDisplayMode);
    if (!node) return null;
    return <section aria-label="Presentación local" className="space-y-2 rounded-md bg-surface-variant/60 p-3 text-sm">
        <h3 className="font-medium">Presentación local</h3><p className="text-xs text-outline">{node.type === 'folder'
            ? 'Solo cambia este acceso en el mapa.' : 'Solo cambia esta representación, no el Recurso canónico.'}</p>
        {node.type === 'resource' ? <label className="block">Tamaño<Select label="Tamaño del recurso" className="mt-1"
            value={node.data.displayMode === 'normal' ? 'normal' : 'mini'}
            onValueChange={value => setResourceDisplayMode(nodeId, value as 'mini' | 'normal')}>
            <option value="normal">Normal</option><option value="mini">Mini</option>
        </Select></label> : node.type === 'folder' ? null : <div className="flex gap-2"><label className="min-w-0 flex-1">Ancho<input type="number" min={160} max={2000}
                                                                                  className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
                                                                                  value={Math.round(node.width ?? 288)}
                                                                                  onChange={event => update(nodeId, {width: Number(event.target.value)})}/></label><label
            className="min-w-0 flex-1">Alto<input type="number" min={80} max={2000}
                                                  className="mt-1 w-full rounded-md border-0 bg-surface-variant p-2 focus-visible:outline-2 focus-visible:outline-primary"
                                                  value={Math.round(node.height ?? 112)}
                                                  onChange={event => update(nodeId, {height: Number(event.target.value)})}/></label>
        </div>}
        <label className="block">Acento<Select label="Acento" className="mt-1"
            value={typeof node.data.accent === 'string' ? node.data.accent : 'default'}
            onValueChange={value => update(nodeId, {accent: value as 'default' | 'primary' | 'muted'})}>
            <option value="default">Predeterminado</option>
            <option value="primary">Primario</option>
            <option value="muted">Tenue</option>
        </Select></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(node.hidden)}
                                                          onChange={event => update(nodeId, {hidden: event.target.checked})}/>Ocultar
            en el Canvas</label>
    </section>;
}

export function CanvasBackgroundInspector() {
    const background = useCanvasStore(state => state.background);
    const setBackground = useCanvasStore(state => state.setBackground);
    return <section aria-label="Fondo del diagrama" className="space-y-3 text-sm"><h2 className="font-semibold">Fondo
        del diagrama</h2><label className="block">Trama<Select label="Trama" className="mt-1"
        value={background.variant}
        onValueChange={value => setBackground({...background, variant: value as typeof background.variant})}>
        <option value="plain">Liso</option>
        <option value="dots">Puntos</option>
        <option value="grid">Cuadrícula</option>
    </Select></label><label className="block">Superficie<Select label="Superficie" className="mt-1"
        value={background.tone}
        onValueChange={value => setBackground({...background, tone: value as typeof background.tone})}>
        <option value="default">Fondo del tema</option>
        <option value="surface">Superficie suave</option>
    </Select></label><p className="text-xs text-outline">Usa los colores del tema; no cambia el resto de la
        aplicación.</p></section>;
}
