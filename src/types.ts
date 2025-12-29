/**
 * Common query parameters for paginated API requests.
 */
export type RequestOptions = {
    /** Filter by active status (0 or 1) */
    is_active?: number;
    /** Filter by deletion status (0 or 1) */
    is_deleted?: number;
    /** Maximum number of results per page */
    limit?: number;
    /** Page number for pagination */
    page?: number;
    /** Search query string */
    query?: string;
    /** Scope of the search */
    scope?: QueryScope;
    /** Sort direction */
    sort_direction?: SortDirection;
    /** Field to sort by */
    sort_field?: string;
};

/**
 * Scope for filtering search results.
 */
export enum QueryScope {
    /** Search only in book titles */
    Titles = 'titles',
}

/**
 * Direction for sorting results.
 */
export enum SortDirection {
    /** Sort in ascending order */
    Ascending = 'ASC',
    /** Sort in descending order */
    Descending = 'DESC',
}

/**
 * Standard API response wrapper.
 */
export type ApiResponse = {
    /** HTTP status code */
    code: number;
    /** Response payload data */
    data?: any;
    /** Pagination navigation links */
    links?: PaginationLinks;
    /** Error message if request failed */
    message?: string;
    /** Pagination metadata */
    meta?: PaginationMeta;
    /** Whether the request succeeded */
    status: boolean;
};

/**
 * Information about a book author.
 */
export interface AuthorInfo {
    /** Number of books by this author */
    books_count: number;
    /** Timestamp of last book update */
    books_updated_at: string;
    /** Author record creation timestamp */
    created_at: string;
    /** Unique identifier for the author */
    id: number;
    /** Whether the author record is active */
    is_active: number;
    /** Whether the author record is deleted */
    is_deleted: number;
    /** Whether the current user follows this author */
    is_followed: boolean;
    /** Language code for the author's works */
    lang: string;
    /** Full name with additional details */
    long_name: string;
    /** Primary author name */
    name: string;
    /** Display order priority */
    order: number;
    /** Biographical summary */
    resume: string;
    /** Timestamp of last author record update */
    updated_at: string;
}

/**
 * Complete book data including pages and metadata.
 */
export interface BookContents extends BookInfo {
    /** URL or path to the book cover image */
    image_file: string;
    /** Array of book pages with content */
    pages: Page[];
    /** URL or path to the RIS citation file */
    ris_file: string;
}

/**
 * Information about a book category.
 */
export interface CategoryInfo {
    /** Unique identifier for the category */
    id: number;
    /** Parent category ID, or 0 for root categories */
    parent: number;
    /** Category name */
    name: string;
    /** URL to the category icon or image */
    image_url: string;
    /** Category record creation timestamp */
    created_at: string;
    /** Timestamp of last category update */
    updated_at: string;
    /** Timestamp of last book update in this category */
    books_updated_at: string;
    /** Whether the category is active */
    is_active: number;
    /** Whether the category is deleted */
    is_deleted: number;
    /** Number of books in this category */
    books_count: number;
    /** Display order priority */
    order: number;
    /** Number of child categories */
    children_count: number;
    /** Language code for the category */
    lang: string;
    /** Array of child categories (if any) */
    children?: CategoryInfo[];
}

/**
 * Metadata and content information about a book.
 */
export interface BookInfo {
    /** List of book authors */
    authors?: Author[];
    /** Bibliographic information */
    bibliography?: string;
    /** Categories this book belongs to */
    categories?: Category[];
    /** Color scheme used in the book interface */
    colors?: string[];
    /** Content quality issue flag */
    content_issue?: number;
    /** Content processing status */
    content_status?: number;
    /** Available physical or digital copies */
    copies?: any[];
    /** Number of available copies */
    copies_count?: number;
    /** Country of publication */
    country?: string;
    /** Book record creation timestamp */
    created_at: string;
    /** Data file information */
    data: FileData;
    /** Soft deletion timestamp, if deleted */
    deleted_at?: string;
    /** Book description or summary */
    description: string;
    /** Whether only documentation is available */
    docs_only?: number;
    /** Number of times the book has been downloaded */
    downloads: number;
    /** Number of users who favorited this book */
    favorites?: number;
    /** Whether the book is featured */
    featured?: number;
    /** Available file formats */
    files: Files;
    /** Unique identifier for the book */
    id: number;
    /** URL to the book cover image */
    image_url?: string;
    /** Table of contents structure */
    index: IndexItem[];
    /** Number of index entries */
    index_count: number;
    /** Additional information about the book */
    info?: string;
    /** Whether the book record is active */
    is_active: number;
    /** Whether the book is deleted */
    is_deleted: number;
    /** Whether the current user can edit this book */
    is_editable: number;
    /** Whether the current user has favorited this book */
    is_favorited: number;
    /** Whether the book is free to access */
    is_free: number;
    /** Whether the current user has purchased this book */
    is_purchased: number;
    /** JSON data payload (if any) */
    json?: any[];
    /** Language code for the book */
    lang: string;
    /** Related external links */
    links: any[];
    /** Additional metadata key-value pairs */
    meta: Meta[];
    /** Editorial or reviewer notes */
    notes?: string;
    /** Total number of pages */
    pages_count: number;
    /** Page numbering scheme */
    pagination: PaginationItem[];
    /** Book parts or volumes */
    parts: Part[];
    /** Number of parts or volumes */
    parts_count: number;
    /** Current price */
    price?: number;
    /** Original price before discount */
    price_before_discount?: number;
    /** Print edition information */
    print?: string;
    /** Print availability status */
    print_status?: number;
    /** Publication date */
    published_at?: string;
    /** Publisher name */
    publisher?: string;
    /** Reader rating or popularity score */
    readers_choice: number;
    /** Number of times the book has been read */
    reads: number;
    /** Name of the reviewer */
    reviewer?: string;
    /** URL to the RIS citation file */
    ris_url: string;
    /** Available services for this book */
    services?: any[];
    /** Original source or edition */
    source: string;
    /** Book title */
    title: string;
    /** Book type identifier */
    type: number;
    /** Timestamp of last book record update */
    updated_at: string;
    /** Book data format version */
    version: number;
    /** Number of times the book has been viewed */
    views: number;
    /** Publication year */
    year?: string;
}

/**
 * Book index entry representing a table of contents item.
 */
export interface BookIndexEntry {
    /** Unique identifier for the book */
    book_id: number;
    /** Child index entries (if is_recursive is enabled) */
    children?: BookIndexEntry[];
    /** Unique identifier for the index entry */
    id: number;
    /** Display order priority */
    order: number;
    /** Page number where this entry appears */
    page: number;
    /** Internal page identifier */
    page_id: number;
    /** Paragraph identifier within the page */
    paragraph_id: number | null;
    /** Parent index entry ID (0 for top-level entries) */
    parent: number;
    /** Name of the part or volume */
    part_name: string;
    /** Audio reciters for this entry (if any) */
    reciters: any[];
    /** Title of the index entry */
    title: string;
    /** Heading level (1 = top level, 2+ = nested) */
    title_level: number;
    /** Ending page number for this section */
    to_page_id: number;
}

/**
 * Response structure for book index queries.
 */
export interface BookIndexResponse {
    /** HTTP status code */
    code: number;
    /** Array of index entries */
    data: BookIndexEntry[];
    /** Whether the request succeeded */
    status: boolean;
}

/**
 * Options for querying book index.
 */
export interface BookIndexOptions {
    /** Whether to return hierarchical structure with children (default: false) */
    isRecursive?: boolean;
    /** Part number to filter by (default: 1) */
    part?: number;
}

/**
 * Basic author reference with ID and name.
 */
export type Author = {
    /** Unique identifier for the author */
    id: number;
    /** Author name */
    name: string;
};

/**
 * Basic category reference with ID and name.
 */
export type Category = {
    /** Unique identifier for the category */
    id: number;
    /** Category name */
    name: string;
};

/**
 * File metadata including size and URL.
 */
type FileData = {
    /** File size in bytes */
    size: number;
    /** URL to download the file */
    url: string;
};

/**
 * Available file formats for a book.
 */
type Files = {
    /** Data file (typically JSON) */
    data: FileData;
    /** PDF file (if available) */
    pdf?: FileData;
};

/**
 * Hadith authenticity and classification information.
 */
type Hadeeth = {
    /** Overall authenticity ruling */
    hukm_ejmali: string;
    /** Detailed authenticity ruling */
    hukm_tafseeli?: string;
    /** Detailed ruling in Arabic */
    hukm_tafseeli_arabic?: string;
    /** Clarification or explanation */
    mouzuh?: string;
    /** Type of Atraf (hadith fragments) */
    type_atraaf: string;
    /** QFT classification type */
    type_qft: string;
    /** Narrator chain classification */
    type_rowaat: string;
};

/**
 * Table of contents entry for a book.
 */
export type IndexItem = {
    /** Child index entries (nested structure) */
    children?: IndexItem[];
    /** Unique identifier for the index entry */
    id: number;
    /** Page number where this entry appears */
    page: number;
    /** Internal page identifier */
    page_id: number;
    /** Parent index entry ID (if nested) */
    parent?: number;
    /** Name of the part or volume */
    part_name: string;
    /** Audio reciters for this entry (if any) */
    reciters?: any[];
    /** Title of the index entry */
    title: string;
    /** Heading level (1 = top level, 2+ = nested) */
    title_level: number;
};

/**
 * Metadata key-value pair.
 */
type Meta = {
    /** Metadata field name */
    name: string;
    /** Metadata field value */
    value?: string;
};

/**
 * Reference to a book part or volume.
 */
type PartReference = {
    /** Unique identifier for the part */
    id: number;
    /** Part name or title */
    name: string;
};

/**
 * Individual page content in a book.
 */
export type Page = {
    /** Page content text */
    content: string;
    /** Hadith metadata (if the page contains hadith) */
    hadeeth?: Hadeeth;
    /** Unique identifier for the page */
    id: number;
    /** Sequential index of the page */
    index: number;
    /** Page number */
    page: number;
    /** Part or volume this page belongs to */
    part: null | PartReference;
    /** Quranic verse references on this page */
    quran: Quran;
    /** Audio reciters for this page (if any) */
    reciters: any[];
    /** Narrator chain information */
    rowa: any[];
    /** Seal or watermark information */
    seal: string;
    /** Commentary or explanations (shrooh) */
    shrooh: any[];
};

/**
 * Page numbering entry.
 */
type PaginationItem = {
    /** Page number */
    number: number;
    /** Internal page identifier */
    page_id: number;
};

/**
 * Navigation links for paginated results.
 */
type PaginationLinks = {
    /** URL to the first page */
    first: string;
    /** URL to the last page */
    last: string;
    /** URL to the next page (if available) */
    next?: string;
    /** URL to the previous page (if available) */
    prev?: string;
};

/**
 * Metadata about paginated results.
 */
type PaginationMeta = {
    /** Current page number */
    current_page: number;
    /** Starting record number */
    from: number;
    /** Last page number */
    last_page: number;
    /** Number of records per page */
    per_page: number;
    /** Ending record number */
    to: number;
    /** Total number of records */
    total: number;
};

/**
 * Detailed information about a book part or volume.
 */
type Part = PartReference & {
    /** Author of this part (if different from book author) */
    author?: string;
    /** Creator or editor of this part */
    creator?: string;
    /** Form or format identifier */
    form?: number;
    /** Whether the part is encrypted */
    is_encrypted?: number;
    /** Whether the PDF is optimized */
    is_optimized?: number;
    /** Whether JavaScript is enabled in the PDF */
    javascript?: number;
    /** Starting page number */
    page: number;
    /** Internal page identifier */
    page_id: number;
    /** Number of pages in this part */
    pages: number;
    /** URL to the PDF file for this part */
    pdf_url?: string;
    /** PDF producer software */
    producer?: string;
    /** File size in bytes */
    size: number;
    /** Part title (if different from name) */
    title?: string;
};

/**
 * Quranic verse reference information.
 */
type Quran = {
    /** Starting verse ID */
    from_aya_id: number;
    /** Whether this is a range of verses */
    is_range?: number;
    /** Surah (chapter) ID */
    sura_id: number;
    /** Ending verse ID */
    to_aya_id: number;
};

/**
 * Logger interface compatible with console and most logging libraries.
 * All methods are optional to allow partial implementations.
 */
export interface Logger {
    /** Log an informational message */
    info?: (message: string, ...args: any[]) => void;
    /** Log a debug message */
    debug?: (message: string, ...args: any[]) => void;
    /** Log a warning message */
    warn?: (message: string, ...args: any[]) => void;
    /** Log an error message */
    error?: (message: string, ...args: any[]) => void;
}
