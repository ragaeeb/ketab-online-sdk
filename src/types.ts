type Author = {
    id: number;
    name: string;
};

type Category = {
    id: number;
    name: string;
};

type Meta = {
    name: string;
    value?: string;
};

type Part = {
    author?: string;
    creator?: string;
    form?: number;
    id: number;
    is_encrypted?: number;
    is_optimized?: number;
    javascript?: number;
    name: string;
    page: number;
    page_id: number;
    pages: number;
    pdf_url?: string;
    producer?: string;
    size: number;
    title?: string;
};

type IndexItem = {
    children?: IndexItem[];
    id: number;
    page: number;
    page_id: number;
    parent?: number;
    part_name: string;
    reciters?: any[];
    title: string;
    title_level: number;
};

type FileData = {
    size: number;
    url: string;
};

type Files = {
    data: FileData;
    pdf?: FileData;
};

type PaginationItem = {
    number: number;
    page_id: number;
};

type Hadeeth = {
    hukm_ejmali: string;
    hukm_tafseeli?: string;
    hukm_tafseeli_arabic?: string;
    mouzuh?: string;
    type_atraaf: string;
    type_qft: string;
    type_rowaat: string;
};

type Quran = {
    from_aya_id: number;
    is_range?: number;
    sura_id: number;
    to_aya_id: number;
};

type Page = {
    content: string;
    hadeeth?: Hadeeth; // Can be null or undefined if not present
    id: number;
    index: number;
    page: number;
    part: null | number;
    quran: Quran;
    reciters: any[];
    rowa: any[];
    seal: string;
    shrooh: any[];
};

export interface BookInfo {
    authors?: Author[];
    bibliography?: string;
    categories?: Category[];
    colors?: string[];
    content_issue?: number;
    content_status?: number;
    copies?: any[];
    copies_count?: number;
    country?: string;
    created_at: string;
    data: FileData;
    deleted_at?: string;
    description: string;
    docs_only?: number;
    downloads: number;
    favorites?: number;
    featured?: number;
    files: Files;
    id: number;
    image_url?: string;
    index: IndexItem[];
    index_count: number;
    info?: string;
    is_active: number;
    is_deleted: number;
    is_editable: number;
    is_favorited: number;
    is_free: number;
    is_purchased: number;
    json?: any[];
    lang: string;
    links: any[];
    meta: Meta[];
    notes?: string;
    pages_count: number;
    pagination: PaginationItem[];
    parts: Part[];
    parts_count: number;
    price?: number;
    price_before_discount?: number;
    print?: string;
    print_status?: number;
    published_at?: string;
    publisher?: string;
    readers_choice: number;
    reads: number;
    reviewer?: string;
    ris_url: string;
    services?: any[];
    source: string;
    title: string;
    type: number;
    updated_at: string;
    version: number;
    views: number;
    year?: string;
}

export interface BookContents extends BookInfo {
    image_file: string;
    pages: Page[];
    ris_file: string;
}

type PaginationMeta = {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
};

type PaginationLinks = {
    first: string;
    last: string;
    next?: string;
    prev?: string;
};

export type ApiResponse = {
    code: number;
    data?: any;
    links?: PaginationLinks;
    message?: string;
    meta?: PaginationMeta;
    status: boolean;
};

export enum SortDirection {
    Ascending = 'ASC',
    Descending = 'DESC',
}

export enum QueryScope {
    Titles = 'titles',
}

export type BookRequestOptions = {
    is_active?: number;
    is_deleted?: number;
    limit?: number;
    page?: number;
    query?: string;
    scope?: QueryScope;
    sort_direction?: SortDirection;
    sort_field?: string;
};
