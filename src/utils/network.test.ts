import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { EventEmitter } from 'node:events';

const networkHttpsGetMock = mock();

// Mock node:https for network.test.ts only
mock.module('node:https', () => ({
    default: { get: networkHttpsGetMock },
    get: networkHttpsGetMock,
}));

// Import after mocking
const { buildUrl, httpsGet } = await import('./network');

describe('buildUrl', () => {
    it('should add query parameters to the endpoint', () => {
        const url = buildUrl('https://example.com/resource', { page: 2, q: 'search' });
        expect(url.toString()).toBe('https://example.com/resource?page=2&q=search');
    });
});

describe('httpsGet', () => {
    beforeEach(() => {
        networkHttpsGetMock.mockReset();
        networkHttpsGetMock.mockClear();
    });

    it('should parse JSON responses automatically', async () => {
        networkHttpsGetMock.mockImplementation((_url: string | URL, handler: (res: any) => void) => {
            const response = new EventEmitter() as any;
            response.headers = { 'content-type': 'application/json' };

            handler(response);

            process.nextTick(() => {
                response.emit('data', Buffer.from(JSON.stringify({ success: true })));
                response.emit('end');
            });

            const request = new EventEmitter();
            return request;
        });

        const result = await httpsGet('https://example.com');
        expect(result).toEqual({ success: true });
    });

    it('should return Uint8Array for non-JSON responses', async () => {
        networkHttpsGetMock.mockImplementation((_url: string | URL, handler: (res: any) => void) => {
            const response = new EventEmitter() as any;
            response.headers = { 'content-type': 'application/octet-stream' };
            handler(response);

            process.nextTick(() => {
                response.emit('data', Buffer.from('hello'));
                response.emit('end');
            });

            const request = new EventEmitter();
            return request;
        });

        const result = await httpsGet('https://example.com');
        expect(result).toBeInstanceOf(Uint8Array);
        expect(new TextDecoder().decode(result as Uint8Array)).toBe('hello');
    });

    it('should reject when request errors', async () => {
        networkHttpsGetMock.mockImplementation((_url: string | URL, _handler: (res: any) => void) => {
            const request = new EventEmitter();

            process.nextTick(() => {
                request.emit('error', new Error('network failure'));
            });

            return request;
        });

        await expect(httpsGet('https://example.com')).rejects.toThrow('Error making request: network failure');
    });
});
