import type { IncomingMessage } from 'node:http';
import https from 'node:https';
import { URL, URLSearchParams } from 'node:url';

/**
 * Constructs a URL by appending the provided query parameters to the endpoint.
 *
 * @param endpoint - The API endpoint to augment with query parameters.
 * @param params - The query parameters to append to the endpoint.
 * @returns A {@link URL} instance with the provided parameters applied.
 */
export const buildUrl = (endpoint: string, params: Record<string, any>): URL => {
    const url = new URL(endpoint);
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value.toString());
    });

    url.search = searchParams.toString();

    return url;
};

/**
 * Performs an HTTPS GET request and resolves with the parsed JSON body or a raw {@link Uint8Array}.
 *
 * @param url - The URL to request.
 * @returns A promise resolving to the JSON payload or the binary response body.
 */
export const httpsGet = <T extends Uint8Array | Record<string, any>>(url: string | URL): Promise<T> => {
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
                            resolve(json as T);
                        } catch (error: any) {
                            reject(new Error(`Failed to parse JSON: ${error.message}`));
                        }
                    } else {
                        resolve(new Uint8Array(fullData) as T);
                    }
                });
            })
            .on('error', (error) => {
                reject(new Error(`Error making request: ${error.message}`));
            });
    });
};
