import { createServerFn } from '@tanstack/react-start';
import { getAuthorInfo, getAuthors, getBookContents, getBooks, getCategories, getCategoryInfo } from 'ketab-online-sdk';

// Type for list requests
type ListParams = {
    query?: string;
    page?: number;
    limit?: number;
};

// Type for books list requests (extends ListParams with filters)
type BooksListParams = ListParams & {
    author_id?: number;
    category_id?: number;
};

// Get categories list with search and pagination
export const fetchCategories = createServerFn({ method: 'GET' })
    .inputValidator((params: ListParams) => params)
    .handler(async ({ data }) => {
        const limit = data.limit || 30;
        const categories = await getCategories({
            limit,
            page: data.page || 1,
            query: data.query,
        });
        return {
            data: categories,
            hasMore: categories.length >= limit,
        };
    });

// Get single category by ID
export const fetchCategoryInfo = createServerFn({ method: 'GET' })
    .inputValidator((id: number) => id)
    .handler(async ({ data: id }) => {
        return getCategoryInfo(id);
    });

// Get books list with search, pagination, and author/category filters
export const fetchBooks = createServerFn({ method: 'GET' })
    .inputValidator((params: BooksListParams) => params)
    .handler(async ({ data }) => {
        const limit = data.limit || 20;
        // Note: The SDK's getBooks accepts RequestOptions which includes limit, page, query
        // For author_id and category_id filtering, we need to pass them as part of options
        const books = await getBooks({
            limit,
            page: data.page || 1,
            query: data.query,
            // These are passed through to the API URL params
            ...(data.author_id && { author_id: data.author_id }),
            ...(data.category_id && { category_id: data.category_id }),
        } as any); // Using 'as any' since SDK types may not include these params yet
        return {
            data: books,
            hasMore: books.length >= limit,
        };
    });

// Get book contents by ID
export const fetchBookContents = createServerFn({ method: 'GET' })
    .inputValidator((id: number) => id)
    .handler(async ({ data: id }) => {
        return getBookContents(id);
    });

// Get author info by ID
export const fetchAuthorInfo = createServerFn({ method: 'GET' })
    .inputValidator((id: number) => id)
    .handler(async ({ data: id }) => {
        return getAuthorInfo(id);
    });

// Get authors list with search and pagination
export const fetchAuthors = createServerFn({ method: 'GET' })
    .inputValidator((params: ListParams) => params)
    .handler(async ({ data }) => {
        const limit = data.limit || 30;
        const authors = await getAuthors({
            limit,
            page: data.page || 1,
            query: data.query,
        });
        return {
            data: authors,
            hasMore: authors.length >= limit,
        };
    });
