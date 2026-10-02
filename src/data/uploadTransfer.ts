export function transferUpload(file: File, url: string, onProgress: (value: number) => void, onRequest?: (request: XMLHttpRequest) => void): Promise<void> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        onRequest?.(xhr);
        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.upload.onprogress = event => onProgress(event.lengthComputable ? Math.round(event.loaded / event.total * 100) : 0);
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('La transferencia fue rechazada.'));
        xhr.onerror = () => reject(new Error('Se perdió la conexión durante la transferencia.'));
        xhr.onabort = () => reject(new DOMException('Cancelada', 'AbortError'));
        xhr.send(file);
    });
}
