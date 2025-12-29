import type { IndexItem, Page } from '../types';

/**
 * Normalizes line endings to Unix-style (LF).
 *
 * @param text - Text with potentially mixed line endings
 * @returns Text with normalized \n line endings
 */
export const normalizeLineEndings = (text: string): string => {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
};

/**
 * Strips all HTML tags from content, keeping only text.
 * Note: This uses a simple regex suitable for trusted ketabonline HTML.
 * It is not a sanitizer for untrusted user input.
 *
 * @param html - HTML content
 * @returns Plain text content
 */
export const stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
};

/**
 * Detects if a paragraph is a header/section title.
 * Headers typically contain text in parentheses like (قَوْلُهُ بَابُ ...) or (بَابُ ...)
 *
 * @param text - The paragraph text content
 * @returns True if the text appears to be a header
 */
export const isHeaderParagraph = (text: string): boolean => {
    const trimmed = text.trim();
    // Check if text is wrapped in parentheses
    if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) {
        return false;
    }
    // Check for common header markers (with or without diacritics)
    // Using base letters without diacritics for matching
    const normalized = trimmed.normalize('NFD').replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '');
    return /باب|قوله|فصل|كتاب/i.test(normalized);
};

/**
 * Converts ketabonline HTML content to Markdown format.
 *
 * Transformations:
 * - `<p>` tags with header content → `## heading`
 * - Regular `<p>` tags → text with double newline
 * - `<span>` tags → text only (strips the tag)
 * - All other tags → stripped
 *
 * @param html - HTML content from ketabonline
 * @returns Markdown-formatted content
 */
export const htmlToMarkdown = (html: string): string => {
    if (!html) {
        return '';
    }

    let result = html;

    // Extract paragraphs and convert to markdown
    result = result.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, content) => {
        // Strip inner HTML tags from paragraph content
        const text = stripHtmlTags(content).trim();

        if (!text) {
            return '';
        }

        // Check if this is a header paragraph
        if (isHeaderParagraph(text)) {
            return `## ${text}\n\n`;
        }

        return `${text}\n\n`;
    });

    // Strip any remaining HTML tags
    result = stripHtmlTags(result);

    // Normalize line endings and clean up excessive whitespace
    result = normalizeLineEndings(result);
    result = result.replace(/\n{3,}/g, '\n\n').trim();

    return result;
};

/**
 * Extracts plain text content from a Page object.
 *
 * @param page - The page to extract text from
 * @returns Plain text content of the page
 */
export const extractPageText = (page: Page): string => {
    return stripHtmlTags(page.content);
};

/**
 * Converts a Page's HTML content to Markdown.
 *
 * @param page - The page to convert
 * @returns Markdown-formatted content
 */
export const pageToMarkdown = (page: Page): string => {
    return htmlToMarkdown(page.content);
};

/**
 * Converts an array of pages to a single Markdown document.
 *
 * @param pages - Array of pages to convert
 * @param options - Conversion options
 * @returns Combined Markdown content
 */
export const pagesToMarkdown = (
    pages: Page[],
    options: { includePageNumbers?: boolean; separator?: string } = {},
): string => {
    const { includePageNumbers = false, separator = '\n---\n\n' } = options;

    return pages
        .map((page) => {
            const markdown = pageToMarkdown(page);
            if (includePageNumbers && page.part) {
                return `<!-- Page ${page.page}, Part ${page.part.name} -->\n${markdown}`;
            }
            return markdown;
        })
        .join(separator);
};

/**
 * Flattens a hierarchical index structure into a flat array.
 *
 * @param index - Hierarchical index array
 * @returns Flat array of all index entries
 */
export const flattenIndex = (index: IndexItem[]): IndexItem[] => {
    const result: IndexItem[] = [];

    const traverse = (items: IndexItem[]) => {
        for (const item of items) {
            result.push(item);
            if (item.children && item.children.length > 0) {
                traverse(item.children);
            }
        }
    };

    traverse(index);
    return result;
};

/**
 * Finds an index entry by its ID.
 *
 * @param index - Hierarchical or flat index array
 * @param id - The ID to search for
 * @returns The matching index entry, or undefined if not found
 */
export const findIndexEntry = (index: IndexItem[], id: number): IndexItem | undefined => {
    for (const item of index) {
        if (item.id === id) {
            return item;
        }
        if (item.children && item.children.length > 0) {
            const found = findIndexEntry(item.children, id);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
};

/**
 * Builds a breadcrumb path from an index entry back to the root.
 *
 * @param index - Hierarchical index array
 * @param entryId - The ID of the entry to build breadcrumb for
 * @returns Array of index entries from root to the target entry
 */
export const getIndexBreadcrumb = (index: IndexItem[], entryId: number): IndexItem[] => {
    const path: IndexItem[] = [];

    const findPath = (items: IndexItem[], targetId: number): boolean => {
        for (const item of items) {
            if (item.id === targetId) {
                path.push(item);
                return true;
            }
            if (item.children && item.children.length > 0) {
                if (findPath(item.children, targetId)) {
                    path.unshift(item);
                    return true;
                }
            }
        }
        return false;
    };

    findPath(index, entryId);
    return path;
};

/**
 * Gets all pages that belong to a specific index entry.
 *
 * @param pages - Array of all pages
 * @param indexId - The index entry ID to filter by
 * @returns Pages that belong to this index entry
 */
export const getPagesForIndex = (pages: Page[], indexId: number): Page[] => {
    return pages.filter((page) => page.index === indexId);
};

/**
 * Gets a page by its page number.
 *
 * @param pages - Array of all pages
 * @param pageNumber - The page number to find
 * @returns The matching page, or undefined if not found
 */
export const getPageByNumber = (pages: Page[], pageNumber: number): Page | undefined => {
    return pages.find((page) => page.page === pageNumber);
};

/**
 * Gets all pages that belong to a specific part/volume.
 *
 * @param pages - Array of all pages
 * @param partName - The part name to filter by
 * @returns Pages that belong to this part
 */
export const getPagesByPart = (pages: Page[], partName: string): Page[] => {
    return pages.filter((page) => page.part?.name === partName);
};

/**
 * Converts an index structure to Markdown table of contents.
 *
 * @param index - Hierarchical index array
 * @param options - Conversion options
 * @returns Markdown-formatted table of contents
 */
export const indexToMarkdown = (index: IndexItem[], options: { maxDepth?: number } = {}): string => {
    const { maxDepth = Infinity } = options;
    const lines: string[] = [];

    const traverse = (items: IndexItem[], depth: number) => {
        if (depth > maxDepth) {
            return;
        }

        for (const item of items) {
            const pageInfo = item.part_name ? ` (Part ${item.part_name}, p. ${item.page})` : ` (p. ${item.page})`;

            if (depth === 1) {
                lines.push(`## ${item.title}${pageInfo}`);
            } else {
                const indent = '  '.repeat(depth - 1);
                lines.push(`${indent}- ${item.title}${pageInfo}`);
            }

            if (item.children?.length) {
                traverse(item.children, depth + 1);
            }
        }
    };

    traverse(index, 1);
    return lines.join('\n');
};

// ============================================================================
// Footnote Utilities
// ============================================================================

/** The HTML element that separates page body from footnotes */
const FOOTNOTE_SEPARATOR = '<div class="g-page-footer">';

/**
 * Represents a footnote extracted from page content.
 */
export interface Footnote {
    /** The footnote number (e.g., 1, 2, 3) */
    number: number;
    /** The footnote text content */
    text: string;
}

/**
 * Splits page HTML content into body and footer (footnotes) sections.
 *
 * ketabonline uses `<div class="g-page-footer">` to separate the main
 * content from footnotes at the bottom of the page.
 *
 * @param html - The full page HTML content
 * @returns A tuple of [body, footer] HTML strings
 *
 * @example
 * ```typescript
 * const [body, footer] = splitPageFootnotes(page.content);
 * const mainText = htmlToMarkdown(body);
 * const footnotes = extractFootnotes(footer);
 * ```
 */
export const splitPageFootnotes = (html: string): readonly [string, string] => {
    if (!html) {
        return ['', ''] as const;
    }

    const separatorIndex = html.indexOf(FOOTNOTE_SEPARATOR);
    if (separatorIndex === -1) {
        return [html, ''] as const;
    }

    const body = html.slice(0, separatorIndex);
    const footer = html.slice(separatorIndex);

    return [body, footer] as const;
};

/**
 * Removes footnote reference links from HTML content.
 *
 * Strips `<a class="g-footnote-link">` tags while keeping the reference number text.
 * Use this when you want to show the footnote numbers but not as clickable links.
 *
 * @param html - HTML content containing footnote links
 * @returns HTML with footnote links replaced by plain text
 *
 * @example
 * ```typescript
 * // Input: 'Text <a href="#foot-1" class="g-footnote-link">(١)</a> more'
 * // Output: 'Text (١) more'
 * ```
 */
export const stripFootnoteLinks = (html: string): string => {
    if (!html) {
        return '';
    }

    // Remove <a> tags with g-footnote-link class, keeping the text inside
    return html.replace(/<a[^>]*class="g-footnote-link"[^>]*>(.*?)<\/a>/gi, '$1');
};

/**
 * Removes all footnote references from HTML content completely.
 *
 * Removes `<span class="g-parentheses">` containing footnote links entirely,
 * including the reference numbers. Use this for a clean reading experience.
 *
 * @param html - HTML content containing footnote references
 * @returns HTML with footnote references completely removed
 *
 * @example
 * ```typescript
 * // Input: 'Text <span class="g-parentheses"><a href="#foot-1">(١)</a></span> more'
 * // Output: 'Text  more'
 * ```
 */
export const removeFootnoteReferences = (html: string): string => {
    if (!html) {
        return '';
    }

    // Remove spans containing footnote links
    return html.replace(
        /<span[^>]*class="g-parentheses"[^>]*>\s*<a[^>]*class="g-footnote-link"[^>]*>.*?<\/a>\s*<\/span>/gi,
        '',
    );
};

/**
 * Extracts structured footnote data from the footer HTML.
 *
 * Parses the footer section to extract individual footnotes with their
 * numbers and text content.
 *
 * @param footerHtml - The footer section HTML (from splitPageFootnotes)
 * @returns Array of Footnote objects with number and text
 *
 * @example
 * ```typescript
 * const [, footer] = splitPageFootnotes(page.content);
 * const footnotes = extractFootnotes(footer);
 * // [{ number: 1, text: 'Reference to "تاريخ الإسلام" (5/378).' }, ...]
 * ```
 */
export const extractFootnotes = (footerHtml: string): Footnote[] => {
    if (!footerHtml) {
        return [];
    }

    const footnotes: Footnote[] = [];

    // Match footnote target spans and capture the number and following content
    // Pattern: <span id="foot-N" class="g-footnote-target">(N)</span> followed by text
    const footnoteRegex =
        /<span[^>]*id="foot-(\d+)"[^>]*class="g-footnote-target"[^>]*>\([^)]*\)<\/span>\s*([\s\S]*?)(?=<span[^>]*class="g-list"|<\/div>|$)/gi;

    const matches = footerHtml.matchAll(footnoteRegex);
    for (const match of matches) {
        const number = parseInt(match[1]!, 10);
        const rawText = match[2] || '';
        const text = stripHtmlTags(rawText).trim();

        if (text) {
            footnotes.push({ number, text });
        }
    }

    return footnotes;
};

/**
 * Checks if a page has footnotes.
 *
 * @param html - The page HTML content
 * @returns True if the page contains a footnote section
 */
export const hasFootnotes = (html: string): boolean => {
    return html.includes(FOOTNOTE_SEPARATOR);
};

/**
 * Converts page HTML to Markdown, optionally including footnotes as a separate section.
 *
 * @param html - The full page HTML content
 * @param options - Conversion options
 * @returns Markdown-formatted content
 *
 * @example
 * ```typescript
 * const md = pageToMarkdownWithFootnotes(page.content, { includeFootnotes: true });
 * ```
 */
export const pageToMarkdownWithFootnotes = (
    html: string,
    options: { includeFootnotes?: boolean; footnoteSeparator?: string } = {},
): string => {
    const { includeFootnotes = true, footnoteSeparator = '\n\n---\n\n' } = options;

    const [body, footer] = splitPageFootnotes(html);
    const bodyMarkdown = htmlToMarkdown(body);

    if (!includeFootnotes || !footer) {
        return bodyMarkdown;
    }

    const footnotes = extractFootnotes(footer);
    if (footnotes.length === 0) {
        return bodyMarkdown;
    }

    const footnotesMarkdown = footnotes.map((fn) => `[^${fn.number}]: ${fn.text}`).join('\n');

    return `${bodyMarkdown}${footnoteSeparator}${footnotesMarkdown}`;
};
