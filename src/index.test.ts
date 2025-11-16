import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test';

const httpsGetMock = mock();
const unzipFromUrlMock = mock();
const createTempDirMock = mock();
const renameMock = mock();
const rmMock = mock();
const readFileMock = mock();

const restoreNetwork = mock.module('./utils/network', () => ({
    httpsGet: httpsGetMock,
    buildUrl: (endpoint: string, params: Record<string, string | number>) => {
        const url = new URL(endpoint);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value.toString()));
        return url;
    },
}));

const restoreIo = mock.module('./utils/io', () => ({
    createTempDir: createTempDirMock,
    unzipFromUrl: unzipFromUrlMock,
}));

const restoreFsPromises = mock.module('node:fs/promises', () => ({
    default: {
        rename: renameMock,
        rm: rmMock,
        readFile: readFileMock,
    },
    rename: renameMock,
    rm: rmMock,
    readFile: readFileMock,
}));

const { downloadBook, getAuthorInfo, getBookContents, getBookInfo, getBooks, getCategoryInfo } = await import('./index');

afterAll(() => {
    restoreNetwork?.();
    restoreIo?.();
    restoreFsPromises?.();
});

describe('index exports', () => {
    const tempDirPath = '/tmp/ketab';
    const jsonFilePath = '/tmp/ketab/book.json';

    beforeEach(() => {
        httpsGetMock.mockReset();
        unzipFromUrlMock.mockReset();
        createTempDirMock.mockReset();
        renameMock.mockReset();
        rmMock.mockReset();
        readFileMock.mockReset();

        createTempDirMock.mockResolvedValue(tempDirPath);
        unzipFromUrlMock.mockResolvedValue([jsonFilePath]);
        renameMock.mockResolvedValue(undefined);
        rmMock.mockResolvedValue(undefined);
        readFileMock.mockResolvedValue(JSON.stringify({ foo: 'bar' }));
    });

    test('downloadBook moves downloaded JSON into destination', async () => {
        const destination = '/books/book.json';

        const result = await downloadBook(12, destination);

        expect(createTempDirMock).toHaveBeenCalled();
        expect(unzipFromUrlMock).toHaveBeenCalledWith('https://s2.ketabonline.com/books/12/12.data.zip', tempDirPath);
        expect(renameMock).toHaveBeenCalledWith(jsonFilePath, destination);
        expect(rmMock).toHaveBeenCalledWith(tempDirPath, { recursive: true });
        expect(result).toBe(destination);
    });

    test('getAuthorInfo returns data when response code is 200', async () => {
        httpsGetMock.mockResolvedValue({ code: 200, data: { name: 'Author', nullKey: null } });

        await expect(getAuthorInfo(3)).resolves.toEqual({ name: 'Author' });
    });

    test('getAuthorInfo throws when author is missing', async () => {
        httpsGetMock.mockResolvedValue({ code: 404 });

        await expect(getAuthorInfo(3)).rejects.toThrow('Author 3 not found');
    });

    test('getAuthorInfo throws on unknown responses', async () => {
        httpsGetMock.mockResolvedValue({ code: 500, message: 'Internal Server Error' });

        await expect(getAuthorInfo(3)).rejects.toThrow(
            'Unknown error: {"code":500,"message":"Internal Server Error"}',
        );
    });

    test('getBookInfo returns sanitized book information', async () => {
        httpsGetMock.mockResolvedValue({ code: 200, data: { title: 'Book', emptyKey: '' } });

        await expect(getBookInfo(42)).resolves.toEqual({ title: 'Book' });
    });

    test('getBookInfo throws when book not found', async () => {
        httpsGetMock.mockResolvedValue({ code: 404 });

        await expect(getBookInfo(42)).rejects.toThrow('Book 42 not found');
    });

    test('getBookContents returns parsed JSON data', async () => {
        unzipFromUrlMock.mockResolvedValue([jsonFilePath, tempDirPath]);
        const contents = { sections: [{ title: 'Section' }] };
        readFileMock.mockResolvedValue(JSON.stringify(contents));

        const result = await getBookContents(7);

        expect(readFileMock).toHaveBeenCalledWith(jsonFilePath, 'utf-8');
        expect(rmMock).toHaveBeenCalledWith(tempDirPath, { recursive: true });
        expect(result).toEqual(contents);
    });

    test('getCategoryInfo returns sanitized category information', async () => {
        httpsGetMock.mockResolvedValue({ code: 200, data: { name: 'Category', empty: '' } });

        await expect(getCategoryInfo(9)).resolves.toEqual({ name: 'Category' });
    });

    test('getBooks unwraps array data for successful responses', async () => {
        httpsGetMock.mockResolvedValue({
            code: 200,
            data: [
                { title: 'One', empty: '' },
                { title: 'Two', nested: { keep: 'value', drop: null } },
            ],
        });

        const result = await getBooks({ page: 2, query: 'history' });

        expect(httpsGetMock).toHaveBeenCalled();
        expect(result).toEqual([
            { title: 'One' },
            { title: 'Two', nested: { keep: 'value' } },
        ]);
    });

    test('getBooks throws when response code is not handled', async () => {
        httpsGetMock.mockResolvedValue({ code: 500, message: 'oops' });

        await expect(getBooks()).rejects.toThrow('Unknown error: {"code":500,"message":"oops"}');
    });
});
