import { describe, expect, it, mock } from 'bun:test';

const unzipFromUrlMock = mock();

mock.module('./io', () => ({
    unzipFromUrl: unzipFromUrlMock,
}));

mock.module('./network', () => ({
    BOOKS_CDN_URL: 'https://s2.ketabonline.com/books',
}));

// Import with cache busting
const { downloadBookContents } = await import(`./book?t=${Date.now()}`);

describe('book utilities', () => {
    it('should download and unzip book contents', async () => {
        const mockEntries = [{ data: new Uint8Array(), name: 'book.json' }];
        unzipFromUrlMock.mockResolvedValue(mockEntries);

        const result = await downloadBookContents(123);

        expect(unzipFromUrlMock).toHaveBeenCalledWith('https://s2.ketabonline.com/books/123/123.data.zip');
        expect(result).toBe(mockEntries);
    });
});
