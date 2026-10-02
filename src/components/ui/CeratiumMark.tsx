import type {SVGProps} from 'react';

/** Silhouette traced from ceratium-photo.webp, with slightly widened horns for icon sizes. */
export function CeratiumMark(props: SVGProps<SVGSVGElement>) {
    return <svg viewBox="0 0 128 104" fill="none" aria-hidden="true" focusable="false" {...props}>
        <path fill="currentColor"
              d="M2 74c8-4 47-14 74-21 7-2 13-9 20-12 5-2 11-2 16-1 5-6 8-14 6-20-3-12-19-13-38-11-13 1-22 4-28 6-3 1-4-1-2-3 7-5 24-8 44-8 17-1 29 5 31 16 2 9-3 19-9 24 5 7 5 15-1 22 1 6 2 13-4 20-7 8-22 12-32 14-4 1-5-2-1-4 17-6 27-12 30-20 2-5 0-8-5-9-9-2-16-7-24-10C60 63 20 75 3 77c-3 0-4-2-1-3Z"/>
    </svg>;
}
