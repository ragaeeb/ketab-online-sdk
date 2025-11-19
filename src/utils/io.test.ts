import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test';
import os from 'node:os';
import path from 'node:path';

const mkdtempMock = mock(async (base: string) => `${base}XYZ`);

const getMock = mock();
const unzipSyncMock = mock();

const restoreFs = mock.module('node:fs', () => ({
    default: {
        promises: {
            mkdtemp: mkdtempMock,
        },
    },
    promises: {
        mkdtemp: mkdtempMock,
    },
}));

const restoreHttps = mock.module('node:https', () => ({
    default: { get: getMock },
    get: getMock,
}));

const restoreFflate = mock.module('fflate', () => ({
    unzipSync: unzipSyncMock,
}));

const { createTempDir, unzipFromUrl } = await import('./io');

afterAll(() => {
    restoreFs?.();
    restoreHttps?.();
    restoreFflate?.();
});

describe('createTempDir', () => {
    beforeEach(() => {
        mkdtempMock.mockReset();
        mkdtempMock.mockResolvedValue('/tmp/ketab-test-XYZ');
    });

    test('delegates to fs.mkdtemp with the OS temp directory', async () => {
        const prefix = 'ketab-test-';
        const baseDir = path.join(os.tmpdir(), prefix);

        const result = await createTempDir(prefix);

        expect(mkdtempMock).toHaveBeenCalledWith(baseDir);
        expect(result).toBe('/tmp/ketab-test-XYZ');
    });
});

describe('unzipFromUrl', () => {
    beforeEach(() => {
        getMock.mockReset();
        unzipSyncMock.mockReset();
    });

    test('returns unzipped entries from successful download', async () => {
        const mockData = new Uint8Array([1, 2, 3]);
        unzipSyncMock.mockReturnValue({
            'file1.txt': new Uint8Array([65, 66]),
            'file2.json': new Uint8Array([123, 125]),
        });

        getMock.mockImplementation((_url: string, handler: (res: any) => void) => {
            const response: any = {
                on: (event: string, cb: Function) => {
                    if (event === 'data') {
                        cb(Buffer.from(mockData));
                    }
                    if (event === 'end') {
                        cb();
                    }
                },
            };
            handler(response);
            return { on: () => undefined };
        });

        const result = await unzipFromUrl('https://example.com/archive.zip');

        expect(result).toEqual([
            { data: expect.any(Uint8Array), name: 'file1.txt' },
            { data: expect.any(Uint8Array), name: 'file2.json' },
        ]);
    });

    test('throws error on unzip failure', async () => {
        unzipSyncMock.mockImplementation(() => {
            throw new Error('Invalid archive');
        });

        getMock.mockImplementation((_url: string, handler: (res: any) => void) => {
            const response: any = {
                on: (event: string, cb: Function) => {
                    if (event === 'data') {
                        cb(Buffer.from([1, 2, 3]));
                    }
                    if (event === 'end') {
                        cb();
                    }
                },
            };
            handler(response);
            return { on: () => undefined };
        });

        await expect(unzipFromUrl('https://example.com/bad.zip')).rejects.toThrow(
            'Error processing URL: Invalid archive',
        );
    });
});
