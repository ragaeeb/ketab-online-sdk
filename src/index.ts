import { promises as fs } from 'node:fs';

import { ApiResponse, AuthorInfo, BookContents, BookInfo, BookRequestOptions } from './types';
import { removeFalsyValues } from './utils/common';
import { createTempDir, unzipFromUrl } from './utils/io';
import { buildUrl, httpsGet } from './utils/network';

/**
 * Downloads the book contents for a given book ID and returns the paths to the JSON file and output directory.
 *
 * @param {number} id - The ID of the book to download.
 * @returns {Promise<[string, string]>} A promise that resolves with an array containing the path to the JSON file and the output directory.
 */
const downloadBookContents = async (id: number): Promise<string[]> => {
    const outputDir = await createTempDir('ketabonline.com');
    const [jsonFile] = await unzipFromUrl(`https://s2.ketabonline.com/books/${id}/${id}.data.zip`, outputDir);

    return [jsonFile, outputDir];
};

/**
 * Downloads the book with the given ID and saves it to the specified output file.
 *
 * @param {number} id - The ID of the book to download.
 * @param {string} outputFile - The path where the book should be saved.
 * @returns {Promise<string>} A promise that resolves with the path to the output file.
 */
export const downloadBook = async (id: number, outputFile: string): Promise<string> => {
    const [jsonFile, outputDir] = await downloadBookContents(id);

    await fs.rename(jsonFile, outputFile);
    await fs.rm(outputDir, { recursive: true });

    return outputFile;
};

/**
 * Retrieves information about the author with the given ID.
 *
 * @param {number} id - The ID of the author.
 * @returns {Promise<AuthorInfo>} A promise that resolves with the author information.
 * @throws Will throw an error if the author is not found or an unknown error occurs.
 */
export const getAuthorInfo = async (id: number): Promise<AuthorInfo> => {
    const response: ApiResponse = (await httpsGet(
        `https://backend.ketabonline.com/api/v2/authors/${id}`,
    )) as ApiResponse;

    if (response.code === 404) {
        throw new Error(`Book ${id} not found`);
    }

    if (response.code === 200) {
        return removeFalsyValues((response as any).data) as AuthorInfo;
    }

    throw new Error(`Unknown error: ${JSON.stringify(response)}`);
};

/**
 * Retrieves the contents of a book with the given ID.
 *
 * @param {number} id - The ID of the book.
 * @returns {Promise<BookContents>} A promise that resolves with the book contents.
 */
export const getBookContents = async (id: number): Promise<BookContents> => {
    const [jsonFile, outputDir] = await downloadBookContents(id);

    const data = JSON.parse(await fs.readFile(jsonFile, 'utf-8')) as BookContents;
    await fs.rm(outputDir, { recursive: true });

    return data;
};

/**
 * Retrieves information about a book with the given ID.
 *
 * @param {number} id - The ID of the book.
 * @returns {Promise<BookInfo>} A promise that resolves with the book information.
 * @throws Will throw an error if the book is not found or an unknown error occurs.
 */
export const getBookInfo = async (id: number): Promise<BookInfo> => {
    const response: ApiResponse = (await httpsGet(`https://backend.ketabonline.com/api/v2/books/${id}`)) as ApiResponse;

    if (response.code === 404) {
        throw new Error(`Book ${id} not found`);
    }

    if (response.code === 200) {
        return removeFalsyValues((response as any).data) as BookInfo;
    }

    throw new Error(`Unknown error: ${JSON.stringify(response)}`);
};

export const getBooks = async ({ query, ...options }: BookRequestOptions = {}): Promise<BookInfo[]> => {
    const url = buildUrl(`https://backend.ketabonline.com/api/v2/books`, { ...options, ...(query && { q: query }) });
    const response: ApiResponse = (await httpsGet(url)) as ApiResponse;

    if (response.code === 200) {
        const result = response.data?.map(removeFalsyValues) as BookInfo[];
        return result;
    }

    throw new Error(`Unknown error: ${JSON.stringify(response)}`);
};
