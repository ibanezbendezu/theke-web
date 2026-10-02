export const Placeholder = ({title}: { title: string }) => (
    <div className="flex flex-col h-full p-12">
        <h1 className="text-4xl font-semibold text-on-background mb-4">{title}</h1>
        <p className="text-on-surface-variant">Esta página se construirá en la carpeta src/pages/</p>
    </div>
);