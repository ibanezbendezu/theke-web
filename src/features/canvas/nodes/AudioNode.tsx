import { useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Mic, Music, MoreHorizontal, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../../lib/utils';

export type AudioNodeData = {
    title: string;
    type: 'music' | 'voice';
    url: string;
};

export type AudioNodeType = Node<AudioNodeData, 'audio'>;

// Utilidad para formatear los segundos en "M:SS"
const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function AudioNode({ data, selected }: NodeProps<AudioNodeType>) {
    // 1. Referencia al elemento de audio real (que estará oculto)
    const audioRef = useRef<HTMLAudioElement>(null);

    // 2. Estados para nuestra interfaz personalizada
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1); // 1 = 100%
    const [isMuted, setIsMuted] = useState(false);

    // 3. Funciones de control
    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
        setCurrentTime(newTime);
    };

    const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVol = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.volume = newVol;
            if (newVol > 0 && isMuted) setIsMuted(false);
        }
        setVolume(newVol);
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Sincronizar el estado en caso de que termine el audio
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onEnded = () => setIsPlaying(false);
        audio.addEventListener('ended', onEnded);
        return () => audio.removeEventListener('ended', onEnded);
    }, []);

    return (
        <div className={cn(
            "relative group flex flex-col gap-3 p-3 min-w-[320px] bg-background border rounded-xl transition-all",
            selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-outline/50"
        )}>
            {/* El audio real trabajando tras bambalinas */}
            <audio
                ref={audioRef}
                src={data.url}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                className="hidden"
            />

            {/* Cabecera y Menú */}
            <div className="flex items-center justify-between pr-8">
                <div className="flex items-center gap-2 overflow-hidden">
                    {data.type === 'voice' ? <Mic size={16} className="text-note-red flex-shrink-0" /> : <Music size={16} className="text-primary flex-shrink-0" />}
                    <span className="text-sm font-semibold text-on-background truncate">{data.title}</span>
                </div>
            </div>

            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 bg-background/90 backdrop-blur border border-border rounded-md text-on-surface-variant hover:text-on-background nodrag nopan">
                    <MoreHorizontal size={14} />
                </button>
            </div>

            {/* REPRODUCTOR PERSONALIZADO */}
            <div className="flex flex-col gap-2 bg-surface-variant/50 p-2 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                    {/* Botón Play/Pause */}
                    <button
                        onClick={togglePlay}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors nodrag nopan"
                    >
                        {isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
                    </button>

                    {/* Barra de Progreso y Tiempo */}
                    <div className="flex flex-col flex-1 gap-1">
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary nodrag nopan"
                        />
                        <div className="flex justify-between text-[10px] font-medium text-outline">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Control de Volumen */}
                    <div className="flex items-center gap-1 group/vol relative">
                        <button onClick={toggleMute} className="text-outline hover:text-on-background transition-colors nodrag nopan">
                            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        {/* Slider de volumen que se expande un poco al hacer hover */}
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={isMuted ? 0 : volume}
                            onChange={handleVolume}
                            className="w-12 h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-outline nodrag nopan opacity-50 hover:opacity-100 transition-opacity"
                        />
                    </div>
                </div>
            </div>

            {/* Puntos de conexión */}
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-surface border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-surface border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}