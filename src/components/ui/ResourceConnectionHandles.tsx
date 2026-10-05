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
                    ? '!h-4 !w-4 !border-2 !border-background !bg-outline !opacity-70 hover:!bg-primary hover:!opacity-100'
                    : '!border-0 !bg-primary !opacity-0'}/>)}
        {!editable && positions.map(({id, position}) =>
            <Handle key={`target-${id}`} id={id} type="target" position={position}
                    isConnectable={false} className="!border-0 !bg-primary !opacity-0"/>)}</>;
}
