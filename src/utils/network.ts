import { Buffer } from 'node:buffer';
import { IncomingMessage } from 'node:http';
import https from 'node:https';
import { URL, URLSearchParams } from 'node:url';

export const buildUrl = (endpoint: string, params: Record<string, any>): URL => {
    const url = new URL(endpoint);
    {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            searchParams.append(key, value.toString());
        });

        url.search = searchParams.toString();
    }

    return url;
};

export const httpsGet = (url: string | URL): Promise<Buffer | Record<string, any>> => {
    return new Promise((resolve, reject) => {
        https
            .get(url, (res: IncomingMessage) => {
                const contentType = res.headers['content-type'] || '';
                const dataChunks: Buffer[] = [];

                res.on('data', (chunk: Buffer) => {
                    dataChunks.push(chunk);
                });

                res.on('end', () => {
                    const fullData = Buffer.concat(dataChunks);

                    if (contentType.includes('application/json')) {
                        try {
                            const json = JSON.parse(fullData.toString('utf-8'));
                            resolve(json);
                        } catch (error: any) {
                            reject(new Error(`Failed to parse JSON: ${error.message}`));
                        }
                    } else {
                        resolve(fullData);
                    }
                });
            })
            .on('error', (error) => {
                reject(new Error(`Error making request: ${error.message}`));
            });
    });
};
