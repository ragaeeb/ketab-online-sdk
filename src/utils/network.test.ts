import { afterEach, describe, expect, it, mock } from 'bun:test';

// Store original fetch
const originalFetch = globalThis.fetch;

describe('buildUrl', () => {
    it('should add query parameters to the endpoint', async () => {
        const { buildUrl } = await import('./network');
        const url = buildUrl('https://example.com/resource', { page: 2, q: 'search' });
        expect(url.toString()).toBe('https://example.com/resource?page=2&q=search');
    });
});

describe('httpsGet', () => {
    afterEach(() => {
        // Restore original fetch after each test
        globalThis.fetch = originalFetch;
    });

    it('should parse JSON responses automatically', async () => {
        const mockFetch = mock(
            async () =>
                new Response(JSON.stringify({ success: true }), {
                    headers: { 'content-type': 'application/json' },
                }),
        );
        globalThis.fetch = mockFetch;

        // Import the function fresh - use a unique query param to bust cache
        const networkModule = await import('./network?json-test');
        const result = await networkModule.httpsGet('https://example.com');

        expect(result).toEqual({ success: true });
    });

    it('should return Uint8Array for non-JSON responses', async () => {
        const binaryData = new TextEncoder().encode('hello');
        const mockFetch = mock(
            async () =>
                new Response(binaryData, {
                    headers: { 'content-type': 'application/octet-stream' },
                }),
        );
        globalThis.fetch = mockFetch;

        const networkModule = await import('./network?binary-test');
        const result = await networkModule.httpsGet('https://example.com');

        expect(result).toBeInstanceOf(Uint8Array);
        expect(new TextDecoder().decode(result as Uint8Array)).toBe('hello');
    });

    it('should throw when response is not ok', async () => {
        const mockFetch = mock(
            async () =>
                new Response(null, {
                    status: 500,
                    statusText: 'Internal Server Error',
                }),
        );
        globalThis.fetch = mockFetch;

        const networkModule = await import('./network?error-test');

        await expect(networkModule.httpsGet('https://example.com')).rejects.toThrow(
            'Error making request: 500 Internal Server Error',
        );
    });

    it('should reject when fetch fails', async () => {
        const mockFetch = mock(async () => {
            throw new Error('network failure');
        });
        globalThis.fetch = mockFetch;

        const networkModule = await import('./network?network-error-test');

        await expect(networkModule.httpsGet('https://example.com')).rejects.toThrow('network failure');
    });
});
