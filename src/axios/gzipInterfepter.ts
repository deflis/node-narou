import { AxiosResponse } from 'axios';

export async function gzipInterceptor(response: AxiosResponse) {
    if (response.data != null && response.data.pipe != null) {
        response.data = await unzipp(response.data);
        return response;
    } else if (response.data instanceof String) {
        return Promise.reject(response);
    } else {
        return response;
    }
}

export async function unzipp(data: NodeJS.ReadableStream) {
    const zlib = require('zlib');

    let unziped = data.pipe(zlib.createUnzip())
    const result = await new Promise<string>((resolve, reject) => {
        let data = "";
        unziped.on('data', (chunk: string) => data += chunk);
        unziped.on('end', () => resolve(data));
        unziped.on('error', (err: any) => reject(err));
    });
    return JSON.parse(result);
}