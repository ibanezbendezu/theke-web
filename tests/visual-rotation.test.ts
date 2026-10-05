import {describe, expect, it} from 'vitest';
import {normalizeRotation, resizeRotatedFrame, rotateSegment, segmentAngle} from '../src/features/canvas/visualRotation';

describe('rotación de elementos visuales', () => {
    it('mantiene el centro y la longitud de una línea al girarla', () => {
        const rotated = rotateSegment({x: 20, y: 30}, {x: 120, y: 30}, 90);
        expect(rotated.start.x).toBeCloseTo(70);
        expect(rotated.start.y).toBeCloseTo(-20);
        expect(rotated.end.x).toBeCloseTo(70);
        expect(rotated.end.y).toBeCloseTo(80);
        expect(segmentAngle(rotated.start, rotated.end)).toBeCloseTo(90);
    });

    it('normaliza ángulos negativos y superiores a una vuelta', () => {
        expect(normalizeRotation(-15)).toBe(345);
        expect(normalizeRotation(375)).toBe(15);
    });

    it('redimensiona en el eje girado y conserva el borde opuesto', () => {
        const resized = resizeRotatedFrame({position: {x: 100, y: 100}, width: 200, height: 100, rotation: 90},
            {x: 1, y: 0}, {x: 0, y: 20}, 1, {minWidth: 40, minHeight: 40});
        expect(resized.width).toBeCloseTo(220);
        expect(resized.height).toBeCloseTo(100);
        expect(resized.position.x).toBeCloseTo(90);
        expect(resized.position.y).toBeCloseTo(110);
    });
});
