import type {
    ApiResponse,
    AuthorInfo,
    BookContents,
    BookIndexEntry,
    BookIndexOptions,
    BookIndexResponse,
    BookInfo,
    CategoryInfo,
    RequestOptions,
} from './types';
import { downloadBookContents } from './utils/book';
import { removeFalsyValues } from './utils/common';
import { apiUrl, buildUrl, httpsGet } from './utils/network';

// Re-export types for consumers
export * from './types';
export type { Footnote } from './utils/content';

// Re-export content utilities
export {
    extractFootnotes,
    extractPageText,
    findIndexEntry,
    flattenIndex,
    getIndexBreadcrumb,
    getPageByNumber,
    getPagesByPart,
    getPagesForIndex,
    hasFootnotes,
    htmlToMarkdown,
    indexToMarkdown,
    isHeaderParagraph,
    normalizeLineEndings,
    pagesToMarkdown,
    pageToMarkdown,
    pageToMarkdownWithFootnotes,
    removeFootnoteReferences,
    splitPageFootnotes,
    stripFootnoteLinks,
    stripHtmlTags,
} from './utils/content';

/**
 * Retrieves information about the author with the given ID.
 *
 * @param {number} id - The ID of the author.
 * @returns {Promise<AuthorInfo>} A promise that resolves with the author information.
 * @throws Will throw an error if the author is not found or an unknown error occurs.
 */
export const getAuthorInfo = async (id: number): Promise<AuthorInfo> => {
    const response: ApiResponse = await httpsGet<ApiResponse>(apiUrl(`authors/${id}`));

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
export const getAuthors = async ({ query, ...options }: RequestOptions = {}): Promise<AuthorInfo[]> => {
    const url = buildUrl(apiUrl('authors'), {
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
    const entries = await downloadBookContents(id);
    const jsonEntry = entries.find((e) => e.name.endsWith('.json'));

    if (!jsonEntry) {
        throw new Error('No JSON file found in downloaded archive');
    }

    const data = JSON.parse(new TextDecoder().decode(jsonEntry.data)) as BookContents;
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
    const url = buildUrl(apiUrl(`books/${id}/index`), {
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
    const response: ApiResponse = await httpsGet<ApiResponse>(apiUrl(`books/${id}`));

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
export const getBooks = async ({ query, ...options }: RequestOptions = {}): Promise<BookInfo[]> => {
    const url = buildUrl(apiUrl('books'), { ...options, ...(query && { q: query }) });
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
export const getCategories = async ({ query, ...options }: RequestOptions = {}): Promise<CategoryInfo[]> => {
    const url = buildUrl(apiUrl('categories'), {
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
    const response: ApiResponse = await httpsGet<ApiResponse>(apiUrl(`categories/${id}`));

    if (response.code === 404) {
        throw new Error(`Category ${id} not found`);
    }

    if (response.code === 200) {
        return removeFalsyValues(response.data) as CategoryInfo;
    }

    throw new Error(`Unknown error: ${JSON.stringify(response)}`);
};
