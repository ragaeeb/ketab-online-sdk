import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test';

const httpsGetMock = mock();
const unzipFromUrlMock = mock();
const createTempDirMock = mock();
const writeFileMock = mock();
const rmMock = mock();

const restoreNetwork = mock.module('./utils/network', () => ({
    buildUrl: (endpoint: string, params: Record<string, string | number>) => {
        const url = new URL(endpoint);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value.toString()));
        return url;
    },
    httpsGet: httpsGetMock,
}));

const restoreIo = mock.module('./utils/io', () => ({
    createTempDir: createTempDirMock,
    unzipFromUrl: unzipFromUrlMock,
}));

const restoreFsPromises = mock.module('node:fs/promises', () => ({
    default: {
        rm: rmMock,
        writeFile: writeFileMock,
    },
    rm: rmMock,
    writeFile: writeFileMock,
}));

const {
    downloadBook,
    getAuthorInfo,
    getAuthors,
    getBookContents,
    getBookInfo,
    getBooks,
    getCategories,
    getCategoryInfo,
} = await import('./index');

afterAll(() => {
    restoreNetwork?.();
    restoreIo?.();
    restoreFsPromises?.();
});

describe('index exports', () => {
    const tempDirPath = '/tmp/ketab';
    const jsonData = { foo: 'bar' };

    beforeEach(() => {
        httpsGetMock.mockReset();
        unzipFromUrlMock.mockReset();
        createTempDirMock.mockReset();
        writeFileMock.mockReset();
        rmMock.mockReset();

        createTempDirMock.mockResolvedValue(tempDirPath);
        unzipFromUrlMock.mockResolvedValue([
            { data: new TextEncoder().encode(JSON.stringify(jsonData)), name: 'book.json' },
        ]);
        writeFileMock.mockResolvedValue(undefined);
        rmMock.mockResolvedValue(undefined);
    });

    test('downloadBook writes downloaded JSON to destination', async () => {
        const destination = '/books/book.json';

        const result = await downloadBook(12, destination);

        expect(createTempDirMock).toHaveBeenCalled();
        expect(unzipFromUrlMock).toHaveBeenCalledWith('https://s2.ketabonline.com/books/12/12.data.zip');
        expect(writeFileMock).toHaveBeenCalled();
        expect(rmMock).toHaveBeenCalledWith(tempDirPath, { recursive: true });
        expect(result).toBe(destination);
    });

    test('downloadBook throws when no JSON file found', async () => {
        unzipFromUrlMock.mockResolvedValue([{ data: new Uint8Array(), name: 'other.txt' }]);

        await expect(downloadBook(12, '/books/book.json')).rejects.toThrow('No JSON file found in downloaded archive');
        expect(rmMock).toHaveBeenCalled();
    });

    test('getAuthorInfo returns data when response code is 200', async () => {
        httpsGetMock.mockResolvedValue({ code: 200, data: { name: 'Author', nullKey: null } });

        await expect(getAuthorInfo(3)).resolves.toEqual({ name: 'Author' });
    });

    test('getAuthorInfo throws when author is missing', async () => {
        httpsGetMock.mockResolvedValue({ code: 404 });

        await expect(getAuthorInfo(3)).rejects.toThrow('Author 3 not found');
    });

    test('getAuthors returns array of authors', async () => {
        httpsGetMock.mockResolvedValue({
            code: 200,
            data: [{ empty: '', name: 'Author One' }, { name: 'Author Two' }],
        });

        const result = await getAuthors({ page: 1 });

        expect(result).toEqual([{ name: 'Author One' }, { name: 'Author Two' }]);
    });

    test('getBookInfo returns sanitized book information', async () => {
        httpsGetMock.mockResolvedValue({ code: 200, data: { emptyKey: '', title: 'Book' } });

        await expect(getBookInfo(42)).resolves.toEqual({ title: 'Book' });
    });

    test('getBookContents returns parsed JSON data', async () => {
        const contents = { sections: [{ title: 'Section' }] };
        unzipFromUrlMock.mockResolvedValue([
            { data: new TextEncoder().encode(JSON.stringify(contents)), name: 'book.json' },
        ]);

        const result = await getBookContents(7);

        expect(rmMock).toHaveBeenCalledWith(tempDirPath, { recursive: true });
        expect(result).toEqual(contents);
    });

    test('getBooks unwraps array data for successful responses', async () => {
        httpsGetMock.mockResolvedValue({
            code: 200,
            data: [
                { empty: '', title: 'One' },
                { nested: { drop: null, keep: 'value' }, title: 'Two' },
            ],
        });

        const result = await getBooks({ page: 2, query: 'history' });

        expect(result).toEqual([{ title: 'One' }, { nested: { keep: 'value' }, title: 'Two' }]);
    });

    test('getCategories returns array of categories', async () => {
        httpsGetMock.mockResolvedValue({
            code: 200,
            data: [{ empty: '', name: 'Category One' }, { name: 'Category Two' }],
        });

        const result = await getCategories({ limit: 40 });

        expect(result).toEqual([{ name: 'Category One' }, { name: 'Category Two' }]);
    });

    test('getCategoryInfo returns sanitized category information', async () => {
        httpsGetMock.mockResolvedValue({ code: 200, data: { empty: '', name: 'Category' } });

        await expect(getCategoryInfo(9)).resolves.toEqual({ name: 'Category' });
    });

    test('getCategoryInfo throws when category not found', async () => {
        httpsGetMock.mockResolvedValue({ code: 404 });

        await expect(getCategoryInfo(9)).rejects.toThrow('Category 9 not found');
    });
});
