import fs from 'node:fs/promises';

import type {
    ApiResponse,
    AuthorInfo,
    AuthorRequestOptions,
    BookContents,
    BookIndexEntry,
    BookIndexOptions,
    BookIndexResponse,
    BookInfo,
    BookRequestOptions,
    CategoryInfo,
    CategoryRequestOptions,
} from './types';
import { removeFalsyValues } from './utils/common';
import { createTempDir, unzipFromUrl } from './utils/io';
import { buildUrl, httpsGet } from './utils/network';

/**
 * Downloads the book contents for a given book ID and returns the extracted entries.
 *
 * @param {number} id - The ID of the book to download.
 * @returns {Promise<{ entries: UnzippedEntry[], outputDir: string }>} A promise that resolves with the entries and output directory.
 */
const downloadBookContents = async (id: number) => {
    const outputDir = await createTempDir('ketabonline.com');
    const entries = await unzipFromUrl(`https://s2.ketabonline.com/books/${id}/${id}.data.zip`);

    return { entries, outputDir };
};

/**
 * Downloads the book with the given ID and saves it to the specified output file.
 *
 * @param {number} id - The ID of the book to download.
 * @param {string} outputFile - The path where the book should be saved.
 * @returns {Promise<string>} A promise that resolves with the path to the output file.
 */
export const downloadBook = async (id: number, outputFile: string): Promise<string> => {
    const { entries, outputDir } = await downloadBookContents(id);
    const jsonEntry = entries.find((e) => e.name.endsWith('.json'));

    if (!jsonEntry) {
        await fs.rm(outputDir, { recursive: true });
        throw new Error('No JSON file found in downloaded archive');
    }

    await fs.writeFile(outputFile, jsonEntry.data);
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
    const response: ApiResponse = await httpsGet<ApiResponse>(`https://backend.ketabonline.com/api/v2/authors/${id}`);

    if (response.code === 404) {
        throw new Error(`Author ${id} not found`);
    }

    if (response.code === 200) {
        return removeFalsyValues(response.data) as AuthorInfo;
    }

    throw new Error(`Unknown error: ${JSON.stringify(response)}`);
};

/**
 * Retrieves a list of authors filtered by the provided options.
 *
 * @param options - Optional query and pagination parameters.
 * @returns A promise that resolves with the matching authors.
 */
export const getAuthors = async ({ query, ...options }: AuthorRequestOptions = {}): Promise<AuthorInfo[]> => {
    const url = buildUrl(`https://backend.ketabonline.com/api/v2/authors`, {
        ...options,
        ...(query && { q: query }),
    });
    const response: ApiResponse = await httpsGet<ApiResponse>(url);

    if (response.code === 200) {
        const result = response.data?.map(removeFalsyValues) as AuthorInfo[];
        return result;
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
    const { entries, outputDir } = await downloadBookContents(id);
    const jsonEntry = entries.find((e) => e.name.endsWith('.json'));

    if (!jsonEntry) {
        await fs.rm(outputDir, { recursive: true });
        throw new Error('No JSON file found in downloaded archive');
    }

    const data = JSON.parse(new TextDecoder().decode(jsonEntry.data)) as BookContents;
    await fs.rm(outputDir, { recursive: true });

    return data;
};

/**
 * Retrieves the table of contents index for a specific book.
 *
 * @param {number} id - The ID of the book.
 * @param {BookIndexOptions} options - Optional parameters for the index query.
 * @returns {Promise<BookIndexEntry[]>} A promise that resolves with the book index entries.
 * @throws Will throw an error if the book is not found or an unknown error occurs.
 *
 * @example
 * // Get flat index structure for part 1
 * const index = await getBookIndex(67768);
 *
 * @example
 * // Get hierarchical index structure with children
 * const index = await getBookIndex(67768, { isRecursive: true, part: 1 });
 */
export const getBookIndex = async (
    id: number,
    { isRecursive = false, part = 1 }: BookIndexOptions = {},
): Promise<BookIndexEntry[]> => {
    const url = buildUrl(`https://backend.ketabonline.com/api/v2/books/${id}/index`, {
        is_recursive: isRecursive ? 1 : 0,
        part,
    });

    const response: BookIndexResponse = await httpsGet<BookIndexResponse>(url);

    if (response.code === 404) {
        throw new Error(`Book ${id} not found`);
    }

    if (response.code === 200) {
        return response.data;
    }

    throw new Error(`Unknown error: ${JSON.stringify(response)}`);
};

/**
 * Retrieves information about a book with the given ID.
 *
 * @param {number} id - The ID of the book.
 * @returns {Promise<BookInfo>} A promise that resolves with the book information.
 * @throws Will throw an error if the book is not found or an unknown error occurs.
 */
export const getBookInfo = async (id: number): Promise<BookInfo> => {
    const response: ApiResponse = await httpsGet<ApiResponse>(`https://backend.ketabonline.com/api/v2/books/${id}`);

    if (response.code === 404) {
        throw new Error(`Book ${id} not found`);
    }

    if (response.code === 200) {
        return removeFalsyValues(response.data) as BookInfo;
    }

    throw new Error(`Unknown error: ${JSON.stringify(response)}`);
};

/**
 * Retrieves a list of books filtered by the provided options.
 *
 * @param options - Optional query and pagination parameters.
 * @returns A promise that resolves with the matching books.
 */
export const getBooks = async ({ query, ...options }: BookRequestOptions = {}): Promise<BookInfo[]> => {
    const url = buildUrl(`https://backend.ketabonline.com/api/v2/books`, { ...options, ...(query && { q: query }) });
    const response: ApiResponse = await httpsGet<ApiResponse>(url);

    if (response.code === 200) {
        const result = response.data?.map(removeFalsyValues) as BookInfo[];
        return result;
    }

    throw new Error(`Unknown error: ${JSON.stringify(response)}`);
};

/**
 * Retrieves a list of categories filtered by the provided options.
 *
 * @param options - Optional query and pagination parameters.
 * @returns A promise that resolves with the matching categories.
 */
export const getCategories = async ({ query, ...options }: CategoryRequestOptions = {}): Promise<CategoryInfo[]> => {
    const url = buildUrl(`https://backend.ketabonline.com/api/v2/categories`, {
        ...options,
        ...(query && { q: query }),
    });
    const response: ApiResponse = await httpsGet<ApiResponse>(url);

    if (response.code === 200) {
        const result = response.data?.map(removeFalsyValues) as CategoryInfo[];
        return result;
    }

    throw new Error(`Unknown error: ${JSON.stringify(response)}`);
};

/**
 * Retrieves information about the category with the given ID.
 *
 * @param {number} id - The ID of the category.
 * @returns {Promise<CategoryInfo>} A promise that resolves with the category information.
 * @throws Will throw an error if the category is not found or an unknown error occurs.
 */
export const getCategoryInfo = async (id: number): Promise<CategoryInfo> => {
    const response: ApiResponse = await httpsGet<ApiResponse>(
        `https://backend.ketabonline.com/api/v2/categories/${id}`,
    );

    if (response.code === 404) {
        throw new Error(`Category ${id} not found`);
    }

    if (response.code === 200) {
        return removeFalsyValues(response.data) as CategoryInfo;
    }

    throw new Error(`Unknown error: ${JSON.stringify(response)}`);
};
