import {Handle, Position} from '@xyflow/react';

const positions = [
    {id: 'right', position: Position.Right},
    {id: 'left', position: Position.Left},
    {id: 'top', position: Position.Top},
    {id: 'bottom', position: Position.Bottom}
];

export function ResourceConnectionHandles({editable = false}: {editable?: boolean}) {
    return <>{positions.map(({id, position}) =>
        <Handle key={`source-${id}`} id={id} type="source" position={position}
                isConnectable={editable}
                className={editable
                    ? '!pointer-events-none !opacity-0 transition-opacity duration-150 group-hover/resource:!pointer-events-auto group-hover/resource:!opacity-100 group-focus-within/resource:!pointer-events-auto group-focus-within/resource:!opacity-100 motion-reduce:transition-none'
                    : '!border-0 !bg-primary !opacity-0'}/>)}
        {!editable && positions.map(({id, position}) =>
            <Handle key={`target-${id}`} id={id} type="target" position={position}
                    isConnectable={false} className="!border-0 !bg-primary !opacity-0"/>)}</>;
}
