import { beforeEach, describe, expect, it, mock } from 'bun:test';

const writeFileMock = mock();
const getBookContentsMock = mock();

mock.module('node:fs/promises', () => ({
    default: {
        writeFile: writeFileMock,
    },
    writeFile: writeFileMock,
}));

mock.module('./index', () => ({
    getBookContents: getBookContentsMock,
}));

const { downloadBook } = await import('./node');

describe('node exports', () => {
    const jsonData = { foo: 'bar' };

    beforeEach(() => {
        writeFileMock.mockReset();
        getBookContentsMock.mockReset();

        getBookContentsMock.mockResolvedValue(jsonData);
        writeFileMock.mockResolvedValue(undefined);
    });

    describe('downloadBook', () => {
        it('should write downloaded JSON to destination', async () => {
            const destination = '/books/book.json';

            const result = await downloadBook(12, destination);

            expect(getBookContentsMock).toHaveBeenCalledWith(12);
            expect(writeFileMock).toHaveBeenCalledWith(destination, JSON.stringify(jsonData));
            expect(result).toBe(destination);
        });

        it('should propagate errors from getBookContents', async () => {
            getBookContentsMock.mockRejectedValue(new Error('Book not found'));

            await expect(downloadBook(999, '/books/book.json')).rejects.toThrow('Book not found');
        });

        it('should propagate errors from writeFile', async () => {
            writeFileMock.mockRejectedValue(new Error('Permission denied'));

            await expect(downloadBook(12, '/books/book.json')).rejects.toThrow('Permission denied');
        });
    });
});
