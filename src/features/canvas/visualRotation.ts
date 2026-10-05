export type Point = {x: number; y: number};
export type ResizeSide = -1 | 0 | 1;

export const normalizeRotation = (degrees: number) => ((Math.round(degrees) % 360) + 360) % 360;

export const segmentAngle = (start: Point, end: Point) =>
    Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;

export function rotateSegment(start: Point, end: Point, degrees: number) {
    const center = {x: (start.x + end.x) / 2, y: (start.y + end.y) / 2};
    const radius = Math.hypot(end.x - start.x, end.y - start.y) / 2;
    const radians = degrees * Math.PI / 180;
    const offset = {x: radius * Math.cos(radians), y: radius * Math.sin(radians)};
    return {
        start: {x: center.x - offset.x, y: center.y - offset.y},
        end: {x: center.x + offset.x, y: center.y + offset.y}
    };
}

export function resizeRotatedFrame(frame: {position: Point; width: number; height: number; rotation: number},
                                   sides: {x: ResizeSide; y: ResizeSide}, delta: Point, zoom: number,
                                   options: {minWidth: number; minHeight: number; keepAspectRatio?: boolean; minScale?: number; maxScale?: number}) {
    const radians = frame.rotation * Math.PI / 180;
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    const localX = (delta.x * cosine + delta.y * sine) / zoom;
    const localY = (-delta.x * sine + delta.y * cosine) / zoom;
    let width: number;
    let height: number;
    if (options.keepAspectRatio) {
        const lengthSquared = frame.width ** 2 + frame.height ** 2;
        const projection = (sides.x * localX * frame.width + sides.y * localY * frame.height) / lengthSquared;
        const scale = Math.min(options.maxScale ?? Infinity, Math.max(options.minScale ?? 0,
            Math.max(options.minWidth / frame.width, options.minHeight / frame.height, 1 + projection)));
        width = frame.width * scale;
        height = frame.height * scale;
    } else {
        width = sides.x ? Math.max(options.minWidth, frame.width + sides.x * localX) : frame.width;
        height = sides.y ? Math.max(options.minHeight, frame.height + sides.y * localY) : frame.height;
    }
    const shiftX = sides.x * (width - frame.width) / 2;
    const shiftY = sides.y * (height - frame.height) / 2;
    const centerX = frame.position.x + frame.width / 2 + shiftX * cosine - shiftY * sine;
    const centerY = frame.position.y + frame.height / 2 + shiftX * sine + shiftY * cosine;
    return {position: {x: centerX - width / 2, y: centerY - height / 2}, width, height};
}
