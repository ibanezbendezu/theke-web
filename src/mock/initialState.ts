import {type Node as FlowNode, type Edge} from '@xyflow/react';

export const initialNodes: FlowNode[] = [
    {
        id: '1',
        type: 'default',
        position: {x: 250, y: 100},
        data: {label: '👋 ¡Bienvenido a tu nuevo lienzo!'},
        style: {
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-on-background)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }
    },
    {
        id: 'media-1',
        type: 'media', // Llamamos a nuestro componente personalizado
        position: {x: 100, y: 500},
        data: {
            label: 'Demo de Interfaz.mp4',
            type: 'video',
            url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' // Video de prueba público
        },
    },
    {
        id: 'media-2',
        type: 'media',
        position: {x: 450, y: 500},
        data: {
            label: 'Referencia Diseño.jpg',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=600' // Imagen de prueba
        },
    },
    {
        id: 'text-1',
        type: 'text',
        position: {x: 100, y: 100},
        data: {
            text: 'Arquitectura del Proyecto 🚀\n\nEste es un lienzo de prueba. Puedes hacer clic aquí y editar este texto como si fuera un documento de Notion. Las cajas crecerán automáticamente hacia abajo.',
        },
    },
    {
        id: 'shape-rect',
        type: 'shape',
        position: {x: -400, y: 300},
        // React Flow nos permite definir un ancho/alto inicial
        width: 300,
        height: 60,
        data: {
            shapeType: 'rectangle',
            borderRadius: 30, // Un rectángulo con forma de pastilla (pill)
            color: 'var(--color-surface-variant)'
        },
    },
    {
        id: 'shape-triangle',
        type: 'shape',
        position: {x: -350, y: 400},
        width: 100,
        height: 100,
        data: {
            shapeType: 'polygon',
            sides: 3, // Triángulo
            color: 'var(--color-note-yellow)'
        },
    },
    {
        id: 'shape-line',
        type: 'shape',
        position: {x: -400, y: 550},
        width: 300,
        height: 20, // Altura del contenedor, la línea en sí mide 4px
        data: {
            shapeType: 'line'
        },
    },
    {
        id: 'doc-1',
        type: 'document',
        position: {x: 100, y: 700},
        data: {
            filename: 'Reporte_Matricula_Web_2026',
            extension: 'pdf',
            size: '2.4 MB'
        }
    },
    {
        id: 'audio-1',
        type: 'audio',
        position: {x: 400, y: 700},
        data: {
            title: 'Grabación Sesión Piano Jazz',
            type: 'music',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Audio público de prueba
        }
    },
    {
        id: 'link-1',
        type: 'link',
        position: {x: 100, y: 850},
        data: {
            title: 'Filtros y Scene Switcher Avanzado',
            description: 'Documentación oficial para configurar flujos automatizados de transmisión y ruteo.',
            url: 'https://obsproject.com',
            imageUrl: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=400&auto=format&fit=crop'
        }
    },
];

export const initialEdges: Edge[] = [];