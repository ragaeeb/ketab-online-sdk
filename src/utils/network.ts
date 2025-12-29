/** Base URL for the ketabonline.com backend API */
export const API_BASE_URL = 'https://backend.ketabonline.com/api/v2';

/** Base URL for the ketabonline.com books CDN */
export const BOOKS_CDN_URL = 'https://s2.ketabonline.com/books';

/**
 * Constructs a full API URL for the given resource path.
 *
 * @param path - The resource path (e.g., 'authors', 'books/123').
 * @returns The full API URL.
 */
export const apiUrl = (path: string): string => `${API_BASE_URL}/${path}`;

/**
 * Constructs a URL by appending the provided query parameters to the endpoint.
 *
 * @param endpoint - The API endpoint to augment with query parameters.
 * @param params - The query parameters to append to the endpoint.
 * @returns A {@link URL} instance with the provided parameters applied.
 */
export const buildUrl = (endpoint: string, params: Record<string, any>): URL => {
    const url = new URL(endpoint);
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value.toString());
    });

    url.search = searchParams.toString();

    return url;
};

/**
 * Performs an HTTP GET request and resolves with the parsed JSON body or a raw {@link Uint8Array}.
 * Uses the Fetch API for browser and modern Node.js compatibility.
 *
 * @param url - The URL to request.
 * @returns A promise resolving to the JSON payload or the binary response body.
 */
export const httpsGet = async <T extends Uint8Array | Record<string, any>>(url: string | URL): Promise<T> => {
    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`Error making request: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.toLowerCase().includes('application/json')) {
        return response.json() as Promise<T>;
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer) as T;
};
