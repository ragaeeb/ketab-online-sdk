import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { EventEmitter } from 'node:events';

const getMock = mock();

mock.module('node:https', () => ({
    default: { get: getMock },
    get: getMock,
}));

const { buildUrl, httpsGet } = await import('./network');

describe('buildUrl', () => {
    test('adds query parameters to the endpoint', () => {
        const url = buildUrl('https://example.com/resource', { page: 2, q: 'search' });
        expect(url.toString()).toBe('https://example.com/resource?page=2&q=search');
    });
});

describe('httpsGet', () => {
    beforeEach(() => {
        getMock.mockReset();
    });

    test('parses JSON responses automatically', async () => {
        getMock.mockImplementation((url: string, handler: (res: any) => void) => {
            const response = new EventEmitter() as any;
            response.headers = { 'content-type': 'application/json' };
            handler(response);
            response.emit('data', Buffer.from(JSON.stringify({ success: true })));
            response.emit('end');
            return { on: () => undefined };
        });

        const promise = httpsGet('https://example.com');
        await expect(promise).resolves.toEqual({ success: true });
    });

    test('returns Uint8Array for non-JSON responses', async () => {
        getMock.mockImplementation((url: string, handler: (res: any) => void) => {
            const response = new EventEmitter() as any;
            response.headers = { 'content-type': 'application/octet-stream' };
            handler(response);
            response.emit('data', Buffer.from('hello'));
            response.emit('end');
            return { on: () => undefined };
        });

        const result = await httpsGet('https://example.com');
        expect(result).toBeInstanceOf(Uint8Array);
        expect(new TextDecoder().decode(result as Uint8Array)).toBe('hello');
    });

    test('rejects when request errors', async () => {
        getMock.mockImplementation(() => ({
            on: (event: string, listener: (error: Error) => void) => {
                if (event === 'error') {
                    listener(new Error('network failure'));
                }
                return undefined;
            },
        }));

        await expect(httpsGet('https://example.com')).rejects.toThrow('Error making request: network failure');
    });
});
