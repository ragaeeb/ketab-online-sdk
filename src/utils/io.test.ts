import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test';
import os from 'node:os';
import { EventEmitter } from 'node:events';
import path from 'node:path';

if (typeof mock.restoreAll === 'function') {
    mock.restoreAll();
}

const mkdtempMock = mock(async (base: string) => `${base}XYZ`);
const mkdirMock = mock(async () => undefined);
const createWriteStreamMock = mock(() => ({}));

const getMock = mock();

const restoreFs = mock.module('node:fs', () => ({
    default: {
        promises: {
            mkdtemp: mkdtempMock,
            mkdir: mkdirMock,
        },
    },
    createWriteStream: createWriteStreamMock,
    promises: {
        mkdtemp: mkdtempMock,
        mkdir: mkdirMock,
    },
}));

const restoreHttps = mock.module('node:https', () => ({
    default: { get: getMock },
    get: getMock,
}));

const restoreUnzipper = mock.module('unzipper', () => ({
    default: { Parse: () => new EventEmitter() },
    Parse: () => new EventEmitter(),
}));

const { createTempDir, unzipFromUrl } = await import('./io?io-test');

afterAll(() => {
    restoreFs?.();
    restoreHttps?.();
    restoreUnzipper?.();
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
    });

    test('throws a descriptive error when the response is not OK', async () => {
        getMock.mockImplementation((url: string, handler: (res: any) => void) => {
            const response = new EventEmitter() as any;
            response.statusCode = 500;
            response.statusMessage = 'Internal Server Error';
            handler(response);
            return {
                on: () => undefined,
            };
        });

        const promise = unzipFromUrl('https://example.com/archive.zip', '/tmp/out');

        await expect(promise).rejects.toThrow('Error processing URL: Failed to download ZIP file: 500 Internal Server Error');
    });
});
