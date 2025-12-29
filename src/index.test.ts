import { beforeEach, describe, expect, it, mock } from 'bun:test';

const unzipFromUrlMock = mock();
const httpsGetMock = mock();

mock.module('./utils/io', () => ({
    unzipFromUrl: unzipFromUrlMock,
}));

mock.module('./utils/network', () => ({
    buildUrl: (endpoint: string, params: Record<string, string | number>) => {
        const url = new URL(endpoint);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value.toString()));
        return url;
    },
    httpsGet: httpsGetMock,
}));

const {
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
    const jsonData = { foo: 'bar' };

    beforeEach(() => {
        httpsGetMock.mockReset();
        unzipFromUrlMock.mockReset();

        // Default mock: return 404 response
        httpsGetMock.mockResolvedValue({ code: 404 });

        unzipFromUrlMock.mockResolvedValue([
            { data: new TextEncoder().encode(JSON.stringify(jsonData)), name: 'book.json' },
        ]);
    });

    it('should return author data when response code is 200', async () => {
        httpsGetMock.mockResolvedValue({ code: 200, data: { name: 'Author', nullKey: null } });

        await expect(getAuthorInfo(3)).resolves.toMatchObject({ name: 'Author' });
    });

    it('should throw when author is missing', async () => {
        httpsGetMock.mockResolvedValue({ code: 404 });

        await expect(getAuthorInfo(3)).rejects.toThrow('Author 3 not found');
    });

    it('should return array of authors', async () => {
        httpsGetMock.mockResolvedValue({
            code: 200,
            data: [{ empty: '', name: 'Author One' }, { name: 'Author Two' }],
        });

        const result = await getAuthors({ page: 1 });

        expect(result).toMatchObject([{ name: 'Author One' }, { name: 'Author Two' }]);
    });

    it('should return sanitized book information', async () => {
        httpsGetMock.mockResolvedValue({ code: 200, data: { emptyKey: '', title: 'Book' } });

        await expect(getBookInfo(42)).resolves.toMatchObject({ title: 'Book' });
    });

    it('should return parsed JSON book contents', async () => {
        const contents = { sections: [{ title: 'Section' }] };
        unzipFromUrlMock.mockResolvedValue([
            { data: new TextEncoder().encode(JSON.stringify(contents)), name: 'book.json' },
        ]);

        const result = await getBookContents(7);

        expect(result).toMatchObject(contents);
    });

    it('should throw when no JSON file found in book contents', async () => {
        unzipFromUrlMock.mockResolvedValue([{ data: new Uint8Array(), name: 'other.txt' }]);

        await expect(getBookContents(12)).rejects.toThrow('No JSON file found in downloaded archive');
    });

    it('should return flat book index when isRecursive is false', async () => {
        const indexData = [
            { id: 1, page: 1, parent: 0, title: 'Chapter 1' },
            { id: 2, page: 10, parent: 0, title: 'Chapter 2' },
        ];
        httpsGetMock.mockResolvedValue({ code: 200, data: indexData, status: true });

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
        httpsGetMock.mockResolvedValue({ code: 200, data: indexData, status: true });

        const result = await getBookIndex(67768, { isRecursive: true });

        expect(result).toMatchObject(indexData);
    });

    it('should throw when book index not found', async () => {
        httpsGetMock.mockResolvedValue({ code: 404 });

        await expect(getBookIndex(999)).rejects.toThrow('Book 999 not found');
    });

    it('should unwrap array data for successful book queries', async () => {
        httpsGetMock.mockResolvedValue({
            code: 200,
            data: [
                { empty: '', title: 'One' },
                { nested: { drop: null, keep: 'value' }, title: 'Two' },
            ],
        });

        const result = await getBooks({ page: 2, query: 'history' });

        expect(result).toMatchObject([{ title: 'One' }, { nested: { keep: 'value' }, title: 'Two' }]);
    });

    it('should return array of categories', async () => {
        httpsGetMock.mockResolvedValue({
            code: 200,
            data: [{ empty: '', name: 'Category One' }, { name: 'Category Two' }],
        });

        const result = await getCategories({ limit: 40 });

        expect(result).toMatchObject([{ name: 'Category One' }, { name: 'Category Two' }]);
    });

    it('should return sanitized category information', async () => {
        httpsGetMock.mockResolvedValue({ code: 200, data: { empty: '', name: 'Category' } });

        await expect(getCategoryInfo(9)).resolves.toMatchObject({ name: 'Category' });
    });

    it('should throw when category not found', async () => {
        httpsGetMock.mockResolvedValue({ code: 404 });

        await expect(getCategoryInfo(9)).rejects.toThrow('Category 9 not found');
    });
});
