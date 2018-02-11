import * as zlib from 'zlib';

export async function unzipp(data: NodeJS.ReadableStream) {

    let unziped = data.pipe(zlib.createUnzip())
    const result = await new Promise<string>((resolve, reject) => {
        let data = "";
        unziped.on('data', (chunk: string) => data += chunk);
        unziped.on('end', () => resolve(data));
        unziped.on('error', (err: any) => reject(err));
    });
    return JSON.parse(result);
}