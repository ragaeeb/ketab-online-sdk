import { beforeEach, describe, expect, it, mock } from 'bun:test';

const unzipFromUrlMock = mock();
const createTempDirMock = mock();
const writeFileMock = mock();
const rmMock = mock();
const getMock = mock();

// Mock the underlying modules, not the wrapper utilities
mock.module('node:https', () => ({
    default: { get: getMock },
    get: getMock,
}));

mock.module('./utils/io', () => ({
    createTempDir: createTempDirMock,
    unzipFromUrl: unzipFromUrlMock,
}));

mock.module('node:fs/promises', () => ({
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
    getBookIndex,
    getBookInfo,
    getBooks,
    getCategories,
    getCategoryInfo,
} = await import('./index');

describe('index exports', () => {
    const tempDirPath = '/tmp/ketab';
    const jsonData = { foo: 'bar' };

    beforeEach(() => {
        getMock.mockReset();
        unzipFromUrlMock.mockReset();
        createTempDirMock.mockReset();
        writeFileMock.mockReset();
        rmMock.mockReset();

        // Mock https.get to return JSON responses
        getMock.mockImplementation((_url: any, handler: (res: any) => void) => {
            const response: any = {
                headers: { 'content-type': 'application/json' },
                on: (event: string, cb: Function) => {
                    if (event === 'data') {
                        setImmediate(() => cb(Buffer.from(JSON.stringify({ code: 404 }))));
                    }
                    if (event === 'end') {
                        setImmediate(() => cb());
                    }
                },
            };
            handler(response);
            return { on: () => undefined };
        });

        createTempDirMock.mockResolvedValue(tempDirPath);
        unzipFromUrlMock.mockResolvedValue([
            { data: new TextEncoder().encode(JSON.stringify(jsonData)), name: 'book.json' },
        ]);
        writeFileMock.mockResolvedValue(undefined);
        rmMock.mockResolvedValue(undefined);
    });

    it('should write downloaded JSON to destination', async () => {
        const destination = '/books/book.json';

        const result = await downloadBook(12, destination);

        expect(createTempDirMock).toHaveBeenCalled();
        expect(unzipFromUrlMock).toHaveBeenCalledWith('https://s2.ketabonline.com/books/12/12.data.zip');
        expect(writeFileMock).toHaveBeenCalled();
        expect(rmMock).toHaveBeenCalledWith(tempDirPath, { recursive: true });
        expect(result).toBe(destination);
    });

    it('should throw when no JSON file found in download', async () => {
        unzipFromUrlMock.mockResolvedValue([{ data: new Uint8Array(), name: 'other.txt' }]);

        await expect(downloadBook(12, '/books/book.json')).rejects.toThrow('No JSON file found in downloaded archive');
        expect(rmMock).toHaveBeenCalled();
    });

    it('should return author data when response code is 200', async () => {
        getMock.mockImplementation((_url: any, handler: (res: any) => void) => {
            const response: any = {
                headers: { 'content-type': 'application/json' },
                on: (event: string, cb: Function) => {
                    if (event === 'data') {
                        setImmediate(() =>
                            cb(Buffer.from(JSON.stringify({ code: 200, data: { name: 'Author', nullKey: null } }))),
                        );
                    }
                    if (event === 'end') {
                        setImmediate(() => cb());
                    }
                },
            };
            handler(response);
            return { on: () => undefined };
        });

        await expect(getAuthorInfo(3)).resolves.toMatchObject({ name: 'Author' });
    });

    it('should throw when author is missing', async () => {
        getMock.mockImplementation((_url: any, handler: (res: any) => void) => {
            const response: any = {
                headers: { 'content-type': 'application/json' },
                on: (event: string, cb: Function) => {
                    if (event === 'data') {
                        setImmediate(() => cb(Buffer.from(JSON.stringify({ code: 404 }))));
                    }
                    if (event === 'end') {
                        setImmediate(() => cb());
                    }
                },
            };
            handler(response);
            return { on: () => undefined };
        });

        await expect(getAuthorInfo(3)).rejects.toThrow('Author 3 not found');
    });

    it('should return array of authors', async () => {
        getMock.mockImplementation((_url: any, handler: (res: any) => void) => {
            const response: any = {
                headers: { 'content-type': 'application/json' },
                on: (event: string, cb: Function) => {
                    if (event === 'data') {
                        setImmediate(() =>
                            cb(
                                Buffer.from(
                                    JSON.stringify({
                                        code: 200,
                                        data: [{ empty: '', name: 'Author One' }, { name: 'Author Two' }],
                                    }),
                                ),
                            ),
                        );
                    }
                    if (event === 'end') {
                        setImmediate(() => cb());
                    }
                },
            };
            handler(response);
            return { on: () => undefined };
        });

        const result = await getAuthors({ page: 1 });

        expect(result).toMatchObject([{ name: 'Author One' }, { name: 'Author Two' }]);
    });

    it('should return sanitized book information', async () => {
        getMock.mockImplementation((_url: any, handler: (res: any) => void) => {
            const response: any = {
                headers: { 'content-type': 'application/json' },
                on: (event: string, cb: Function) => {
                    if (event === 'data') {
                        setImmediate(() =>
                            cb(Buffer.from(JSON.stringify({ code: 200, data: { emptyKey: '', title: 'Book' } }))),
                        );
                    }
                    if (event === 'end') {
                        setImmediate(() => cb());
                    }
                },
            };
            handler(response);
            return { on: () => undefined };
        });

        await expect(getBookInfo(42)).resolves.toMatchObject({ title: 'Book' });
    });

    it('should return parsed JSON book contents', async () => {
        const contents = { sections: [{ title: 'Section' }] };
        unzipFromUrlMock.mockResolvedValue([
            { data: new TextEncoder().encode(JSON.stringify(contents)), name: 'book.json' },
        ]);

        const result = await getBookContents(7);

        expect(rmMock).toHaveBeenCalledWith(tempDirPath, { recursive: true });
        expect(result).toMatchObject(contents);
    });

    it('should return flat book index when isRecursive is false', async () => {
        const indexData = [
            { id: 1, page: 1, parent: 0, title: 'Chapter 1' },
            { id: 2, page: 10, parent: 0, title: 'Chapter 2' },
        ];
        getMock.mockImplementation((_url: any, handler: (res: any) => void) => {
            const response: any = {
                headers: { 'content-type': 'application/json' },
                on: (event: string, cb: Function) => {
                    if (event === 'data') {
                        setImmediate(() =>
                            cb(Buffer.from(JSON.stringify({ code: 200, data: indexData, status: true }))),
                        );
                    }
                    if (event === 'end') {
                        setImmediate(() => cb());
                    }
                },
            };
            handler(response);
            return { on: () => undefined };
        });

        const result = await getBookIndex(67768);

        expect(result).toMatchObject(indexData);
    });

    it('should return hierarchical book index when isRecursive is true', async () => {
        const indexData = [
            {
                children: [{ id: 2, page: 2, parent: 1, title: 'Section 1.1' }],
                id: 1,
                page: 1,
                parent: 0,
                title: 'Chapter 1',
            },
        ];
        getMock.mockImplementation((_url: any, handler: (res: any) => void) => {
            const response: any = {
                headers: { 'content-type': 'application/json' },
                on: (event: string, cb: Function) => {
                    if (event === 'data') {
                        setImmediate(() =>
                            cb(Buffer.from(JSON.stringify({ code: 200, data: indexData, status: true }))),
                        );
                    }
                    if (event === 'end') {
                        setImmediate(() => cb());
                    }
                },
            };
            handler(response);
            return { on: () => undefined };
        });

        const result = await getBookIndex(67768, { isRecursive: true });

        expect(result).toMatchObject(indexData);
    });

    it('should throw when book index not found', async () => {
        getMock.mockImplementation((_url: any, handler: (res: any) => void) => {
            const response: any = {
                headers: { 'content-type': 'application/json' },
                on: (event: string, cb: Function) => {
                    if (event === 'data') {
                        setImmediate(() => cb(Buffer.from(JSON.stringify({ code: 404 }))));
                    }
                    if (event === 'end') {
                        setImmediate(() => cb());
                    }
                },
            };
            handler(response);
            return { on: () => undefined };
        });

        await expect(getBookIndex(999)).rejects.toThrow('Book 999 not found');
    });

    it('should unwrap array data for successful book queries', async () => {
        getMock.mockImplementation((_url: any, handler: (res: any) => void) => {
            const response: any = {
                headers: { 'content-type': 'application/json' },
                on: (event: string, cb: Function) => {
                    if (event === 'data') {
                        setImmediate(() =>
                            cb(
                                Buffer.from(
                                    JSON.stringify({
                                        code: 200,
                                        data: [
                                            { empty: '', title: 'One' },
                                            { nested: { drop: null, keep: 'value' }, title: 'Two' },
                                        ],
                                    }),
                                ),
                            ),
                        );
                    }
                    if (event === 'end') {
                        setImmediate(() => cb());
                    }
                },
            };
            handler(response);
            return { on: () => undefined };
        });

        const result = await getBooks({ page: 2, query: 'history' });

        expect(result).toMatchObject([{ title: 'One' }, { nested: { keep: 'value' }, title: 'Two' }]);
    });

    it('should return array of categories', async () => {
        getMock.mockImplementation((_url: any, handler: (res: any) => void) => {
            const response: any = {
                headers: { 'content-type': 'application/json' },
                on: (event: string, cb: Function) => {
                    if (event === 'data') {
                        setImmediate(() =>
                            cb(
                                Buffer.from(
                                    JSON.stringify({
                                        code: 200,
                                        data: [{ empty: '', name: 'Category One' }, { name: 'Category Two' }],
                                    }),
                                ),
                            ),
                        );
                    }
                    if (event === 'end') {
                        setImmediate(() => cb());
                    }
                },
            };
            handler(response);
            return { on: () => undefined };
        });

        const result = await getCategories({ limit: 40 });

        expect(result).toMatchObject([{ name: 'Category One' }, { name: 'Category Two' }]);
    });

    it('should return sanitized category information', async () => {
        getMock.mockImplementation((_url: any, handler: (res: any) => void) => {
            const response: any = {
                headers: { 'content-type': 'application/json' },
                on: (event: string, cb: Function) => {
                    if (event === 'data') {
                        setImmediate(() =>
                            cb(Buffer.from(JSON.stringify({ code: 200, data: { empty: '', name: 'Category' } }))),
                        );
                    }
                    if (event === 'end') {
                        setImmediate(() => cb());
                    }
                },
            };
            handler(response);
            return { on: () => undefined };
        });

        await expect(getCategoryInfo(9)).resolves.toMatchObject({ name: 'Category' });
    });

    it('should throw when category not found', async () => {
        getMock.mockImplementation((_url: any, handler: (res: any) => void) => {
            const response: any = {
                headers: { 'content-type': 'application/json' },
                on: (event: string, cb: Function) => {
                    if (event === 'data') {
                        setImmediate(() => cb(Buffer.from(JSON.stringify({ code: 404 }))));
                    }
                    if (event === 'end') {
                        setImmediate(() => cb());
                    }
                },
            };
            handler(response);
            return { on: () => undefined };
        });

        await expect(getCategoryInfo(9)).rejects.toThrow('Category 9 not found');
    });
});
