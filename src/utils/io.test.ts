import { beforeEach, describe, expect, it, mock } from 'bun:test';

const httpsGetMock = mock();
const unzipSyncMock = mock();

mock.module('./network', () => ({
    buildUrl: (endpoint: string, params: Record<string, string | number>) => {
        const url = new URL(endpoint);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value.toString()));
        return url;
    },
    httpsGet: httpsGetMock,
}));

mock.module('fflate', () => ({
    unzipSync: unzipSyncMock,
}));

describe('io', () => {
    describe('unzipFromUrl', () => {
        beforeEach(() => {
            httpsGetMock.mockReset();
            unzipSyncMock.mockReset();
        });

        it('should return unzipped entries from successful download', async () => {
            const mockData = new Uint8Array([1, 2, 3]);
            httpsGetMock.mockResolvedValue(mockData);
            unzipSyncMock.mockReturnValue({
                'book.json': new Uint8Array([123, 34, 102, 111, 111, 34, 58, 34, 98, 97, 114, 34, 125]),
            });

            // Import with cache-busting after setting up mocks
            const { unzipFromUrl } = await import(`./io?t=${Date.now()}`);
            const result = await unzipFromUrl('https://example.com/archive.zip');

            expect(result).toEqual([
                {
                    data: new Uint8Array([123, 34, 102, 111, 111, 34, 58, 34, 98, 97, 114, 34, 125]),
                    name: 'book.json',
                },
            ]);
        });

        it('should throw when unzip fails', async () => {
            const mockData = new Uint8Array([1, 2, 3]);
            httpsGetMock.mockResolvedValue(mockData);
            unzipSyncMock.mockImplementation(() => {
                throw new Error('Invalid zip data');
            });

            // Import with a cache-busting query param
            const ioModule = await import('./io?error-test');

            await expect(ioModule.unzipFromUrl('https://example.com/archive.zip')).rejects.toThrow(
                'Error processing URL: Invalid zip data',
            );
        });
    });
});
