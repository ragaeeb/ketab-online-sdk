import { describe, expect, it } from 'bun:test';
import type { IndexItem, Page } from '../types';
import {
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
} from './content';

describe('content utilities', () => {
    describe('normalizeLineEndings', () => {
        it('should convert CRLF to LF', () => {
            expect(normalizeLineEndings('line1\r\nline2')).toBe('line1\nline2');
        });

        it('should convert CR to LF', () => {
            expect(normalizeLineEndings('line1\rline2')).toBe('line1\nline2');
        });

        it('should leave LF unchanged', () => {
            expect(normalizeLineEndings('line1\nline2')).toBe('line1\nline2');
        });

        it('should handle mixed line endings', () => {
            expect(normalizeLineEndings('a\r\nb\rc\nd')).toBe('a\nb\nc\nd');
        });

        it('should handle empty string', () => {
            expect(normalizeLineEndings('')).toBe('');
        });

        it('should handle string without line endings', () => {
            expect(normalizeLineEndings('no line breaks')).toBe('no line breaks');
        });

        it('should handle multiple consecutive Windows line endings', () => {
            expect(normalizeLineEndings('a\r\n\r\nb')).toBe('a\n\nb');
        });

        it('should handle Arabic text with line endings', () => {
            expect(normalizeLineEndings('بسم الله\r\nالرحمن الرحيم')).toBe('بسم الله\nالرحمن الرحيم');
        });
    });

    describe('stripHtmlTags', () => {
        it('should remove all HTML tags', () => {
            expect(stripHtmlTags('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
        });

        it('should handle empty input', () => {
            expect(stripHtmlTags('')).toBe('');
        });

        it('should handle text without tags', () => {
            expect(stripHtmlTags('plain text')).toBe('plain text');
        });

        it('should remove self-closing tags', () => {
            expect(stripHtmlTags('Line 1<br/>Line 2')).toBe('Line 1Line 2');
        });

        it('should remove tags with attributes', () => {
            expect(stripHtmlTags('<div class="test">Content</div>')).toBe('Content');
        });

        it('should remove nested tags', () => {
            expect(stripHtmlTags('<div><span>Nested</span></div>')).toBe('Nested');
        });

        it('should handle multiple tags', () => {
            expect(stripHtmlTags('<h1>Title</h1><p>Paragraph</p>')).toBe('TitleParagraph');
        });

        it('should handle Arabic text with HTML', () => {
            expect(stripHtmlTags('<p>بسم الله</p>')).toBe('بسم الله');
        });

        it('should remove anchor tags', () => {
            expect(stripHtmlTags('<a href="test">Link</a>')).toBe('Link');
        });

        it('should handle empty spans', () => {
            expect(stripHtmlTags('Content<span id="link-123"></span>More')).toBe('ContentMore');
        });
    });

    describe('isHeaderParagraph', () => {
        it('should detect باب headers', () => {
            expect(isHeaderParagraph('(قَوْلُهُ بَابُ إِذَا صَلَّى خَمْسًا)')).toBe(true);
        });

        it('should detect فصل headers', () => {
            expect(isHeaderParagraph('(فصل في الصلاة)')).toBe(true);
        });

        it('should detect كتاب headers', () => {
            expect(isHeaderParagraph('(كتاب الطهارة)')).toBe(true);
        });

        it('should detect قوله headers without diacritics', () => {
            expect(isHeaderParagraph('(قوله باب الصلاة)')).toBe(true);
        });

        it('should not match regular text', () => {
            expect(isHeaderParagraph('هذا نص عادي')).toBe(false);
        });

        it('should not match text without parentheses', () => {
            expect(isHeaderParagraph('باب الصلاة')).toBe(false);
        });

        it('should not match parentheses without header markers', () => {
            expect(isHeaderParagraph('(نص عادي)')).toBe(false);
        });

        it('should handle empty string', () => {
            expect(isHeaderParagraph('')).toBe(false);
        });
    });

    describe('htmlToMarkdown', () => {
        it('should convert paragraphs to text with newlines', () => {
            const html = '<p class="g-paragraph">First paragraph</p><p class="g-paragraph">Second paragraph</p>';
            expect(htmlToMarkdown(html)).toBe('First paragraph\n\nSecond paragraph');
        });

        it('should convert header paragraphs to markdown headers', () => {
            const html = '<p class="g-paragraph" id="p-1">(قَوْلُهُ بَابُ الصلاة)</p>';
            expect(htmlToMarkdown(html)).toBe('## (قَوْلُهُ بَابُ الصلاة)');
        });

        it('should strip span tags but keep content', () => {
            const html = '<p>Text with <span class="g-holy-word">الله</span> inside</p>';
            expect(htmlToMarkdown(html)).toBe('Text with الله inside');
        });

        it('should handle empty input', () => {
            expect(htmlToMarkdown('')).toBe('');
        });

        it('should handle nested HTML', () => {
            const html = '<p class="g-paragraph">Text with <span class="g-square-brackets">[١٢٢٦]</span> reference</p>';
            expect(htmlToMarkdown(html)).toBe('Text with [١٢٢٦] reference');
        });

        it('should handle text without any HTML tags', () => {
            const input = 'Plain text without any tags';
            expect(htmlToMarkdown(input)).toBe('Plain text without any tags');
        });

        it('should handle multiple paragraphs with mixed content', () => {
            const html = `<p class="g-paragraph" id="p-1">(باب الصلاة)</p><p class="g-paragraph" id="p-2">حَدَّثَنَا أَبُو بَكْرٍ</p>`;
            const result = htmlToMarkdown(html);
            expect(result).toContain('## (باب الصلاة)');
            expect(result).toContain('حَدَّثَنَا أَبُو بَكْرٍ');
        });

        it('should handle self-closing tags', () => {
            const html = '<p>Text<br/>More text</p>';
            expect(htmlToMarkdown(html)).toBe('TextMore text');
        });

        it('should handle complex real-world content', () => {
            const html = `<p class="g-paragraph g-rtl" id="p-1">مُقَدّمَة</p><p class="g-paragraph g-rtl" id="p-2">قَالَ الشَّيْخ الإِمَام <span class="g-holy-word">تَعَالَى</span> فِي عشرَة فُصُول</p>`;
            const result = htmlToMarkdown(html);
            expect(result).toContain('مُقَدّمَة');
            expect(result).toContain('تَعَالَى');
            expect(result).toContain('فُصُول');
        });

        it('should handle Quranic text with brackets', () => {
            const html = '<p>﴿فَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ﴾</p>';
            expect(htmlToMarkdown(html)).toBe('﴿فَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ﴾');
        });

        it('should strip anchor tags but keep text', () => {
            const html = '<p>Visit <a href="https://example.com">example</a> site</p>';
            expect(htmlToMarkdown(html)).toBe('Visit example site');
        });

        it('should handle uppercase HTML tags', () => {
            const html = '<P>Uppercase tags</P>';
            expect(htmlToMarkdown(html)).toBe('Uppercase tags');
        });
    });

    describe('page utilities', () => {
        const mockPages: Page[] = [
            {
                content: '<p>Page one content</p>',
                id: 1,
                index: 100,
                page: 3,
                part: { id: 1, name: '1' },
                quran: { from_aya_id: 0, sura_id: 0, to_aya_id: 0 },
                reciters: [],
                rowa: [],
                seal: 'abc',
                shrooh: [],
            },
            {
                content: '<p>Page two content</p>',
                id: 2,
                index: 100,
                page: 4,
                part: { id: 1, name: '1' },
                quran: { from_aya_id: 0, sura_id: 0, to_aya_id: 0 },
                reciters: [],
                rowa: [],
                seal: 'def',
                shrooh: [],
            },
            {
                content: '<p>Page three content</p>',
                id: 3,
                index: 200,
                page: 5,
                part: { id: 2, name: '2' },
                quran: { from_aya_id: 0, sura_id: 0, to_aya_id: 0 },
                reciters: [],
                rowa: [],
                seal: 'ghi',
                shrooh: [],
            },
        ];

        describe('extractPageText', () => {
            it('should extract plain text from page content', () => {
                expect(extractPageText(mockPages[0]!)).toBe('Page one content');
            });
        });

        describe('pageToMarkdown', () => {
            it('should convert page content to markdown', () => {
                expect(pageToMarkdown(mockPages[0]!)).toBe('Page one content');
            });
        });

        describe('pagesToMarkdown', () => {
            it('should combine multiple pages', () => {
                const result = pagesToMarkdown(mockPages.slice(0, 2));
                expect(result).toContain('Page one content');
                expect(result).toContain('Page two content');
            });

            it('should include page numbers when requested', () => {
                const result = pagesToMarkdown(mockPages.slice(0, 1), { includePageNumbers: true });
                expect(result).toContain('<!-- Page 3, Part 1 -->');
            });
        });

        describe('getPageByNumber', () => {
            it('should find page by page number', () => {
                const page = getPageByNumber(mockPages, 4);
                expect(page?.id).toBe(2);
            });

            it('should return undefined for non-existent page', () => {
                expect(getPageByNumber(mockPages, 999)).toBeUndefined();
            });
        });

        describe('getPagesByPart', () => {
            it('should filter pages by part name', () => {
                const pages = getPagesByPart(mockPages, '1');
                expect(pages).toHaveLength(2);
            });

            it('should return empty array for non-existent part', () => {
                expect(getPagesByPart(mockPages, '99')).toHaveLength(0);
            });
        });

        describe('getPagesForIndex', () => {
            it('should filter pages by index ID', () => {
                const pages = getPagesForIndex(mockPages, 100);
                expect(pages).toHaveLength(2);
            });

            it('should return empty array for non-existent index', () => {
                expect(getPagesForIndex(mockPages, 999)).toHaveLength(0);
            });
        });
    });

    describe('index utilities', () => {
        const mockIndex: IndexItem[] = [
            {
                children: [
                    {
                        children: [],
                        id: 2,
                        page: 5,
                        page_id: 5,
                        part_name: '1',
                        title: 'Section 1.1',
                        title_level: 2,
                    },
                    {
                        id: 3,
                        page: 10,
                        page_id: 10,
                        part_name: '1',
                        title: 'Section 1.2',
                        title_level: 2,
                    },
                ],
                id: 1,
                page: 1,
                page_id: 1,
                part_name: '1',
                title: 'Chapter 1',
                title_level: 1,
            },
            {
                id: 4,
                page: 20,
                page_id: 20,
                part_name: '1',
                title: 'Chapter 2',
                title_level: 1,
            },
        ];

        describe('flattenIndex', () => {
            it('should flatten hierarchical index', () => {
                const flat = flattenIndex(mockIndex);
                expect(flat).toHaveLength(4);
                expect(flat.map((i) => i.id)).toEqual([1, 2, 3, 4]);
            });

            it('should handle empty index', () => {
                expect(flattenIndex([])).toHaveLength(0);
            });
        });

        describe('findIndexEntry', () => {
            it('should find top-level entry', () => {
                const entry = findIndexEntry(mockIndex, 1);
                expect(entry?.title).toBe('Chapter 1');
            });

            it('should find nested entry', () => {
                const entry = findIndexEntry(mockIndex, 2);
                expect(entry?.title).toBe('Section 1.1');
            });

            it('should return undefined for non-existent entry', () => {
                expect(findIndexEntry(mockIndex, 999)).toBeUndefined();
            });
        });

        describe('getIndexBreadcrumb', () => {
            it('should build breadcrumb for nested entry', () => {
                const breadcrumb = getIndexBreadcrumb(mockIndex, 2);
                expect(breadcrumb).toHaveLength(2);
                expect(breadcrumb[0]?.title).toBe('Chapter 1');
                expect(breadcrumb[1]?.title).toBe('Section 1.1');
            });

            it('should return single item for top-level entry', () => {
                const breadcrumb = getIndexBreadcrumb(mockIndex, 1);
                expect(breadcrumb).toHaveLength(1);
            });

            it('should return empty array for non-existent entry', () => {
                expect(getIndexBreadcrumb(mockIndex, 999)).toHaveLength(0);
            });
        });

        describe('indexToMarkdown', () => {
            it('should convert index to markdown TOC', () => {
                const md = indexToMarkdown(mockIndex);
                expect(md).toContain('## Chapter 1');
                expect(md).toContain('- Section 1.1');
                expect(md).toContain('## Chapter 2');
            });

            it('should respect maxDepth option', () => {
                const md = indexToMarkdown(mockIndex, { maxDepth: 1 });
                expect(md).toContain('## Chapter 1');
                expect(md).not.toContain('Section 1.1');
            });
        });
    });

    describe('footnote utilities', () => {
        // Sample HTML with footnotes from ketabonline
        const sampleHtmlWithFootnotes = `<p class="g-paragraph g-rtl" id="p-1">وذكر الذهبي أن الدَّبَري عُمِّر دهرًا؛ فأكثر عنه الطبراني <span class="g-parentheses">  <a href="#foot-1" class="g-footnote-link">(١)</a> </span> .</p><p class="g-paragraph g-rtl" id="p-2">قال الذهبي في  <span class="g-quotes">"ميزان الاعتدال"</span> .</p><p class="g-paragraph g-ltr" id="p-3"><div class="g-page-separator" id="page-separator"></div><div class="g-page-footer"></p><p class="g-paragraph g-rtl" id="p-4"><span class="g-list"> <span id="foot-1" class="g-footnote-target">(١)</span> </span>   <span class="g-quotes">"تاريخ الإسلام"</span>  <span class="g-parentheses"> (٥/ ٣٧٨)</span> .</p>`;

        const sampleHtmlWithoutFootnotes = `<p class="g-paragraph g-rtl" id="p-1">المُصَنَّفُ</p><p class="g-paragraph g-rtl" id="p-2">للإمام الحافظ أبى بكر عبد الرزاق</p>`;

        describe('splitPageFootnotes', () => {
            it('should split HTML at page footer', () => {
                const [body, footer] = splitPageFootnotes(sampleHtmlWithFootnotes);
                expect(body).toContain('الدَّبَري');
                expect(body).not.toContain('g-page-footer');
                expect(footer).toContain('g-page-footer');
                expect(footer).toContain('foot-1');
            });

            it('should return full content as body when no footer', () => {
                const [body, footer] = splitPageFootnotes(sampleHtmlWithoutFootnotes);
                expect(body).toBe(sampleHtmlWithoutFootnotes);
                expect(footer).toBe('');
            });

            it('should handle empty input', () => {
                const [body, footer] = splitPageFootnotes('');
                expect(body).toBe('');
                expect(footer).toBe('');
            });
        });

        describe('hasFootnotes', () => {
            it('should return true when footnotes present', () => {
                expect(hasFootnotes(sampleHtmlWithFootnotes)).toBe(true);
            });

            it('should return false when no footnotes', () => {
                expect(hasFootnotes(sampleHtmlWithoutFootnotes)).toBe(false);
            });
        });

        describe('stripFootnoteLinks', () => {
            it('should remove footnote link tags but keep text', () => {
                const html = 'Text <a href="#foot-1" class="g-footnote-link">(١)</a> more';
                expect(stripFootnoteLinks(html)).toBe('Text (١) more');
            });

            it('should handle multiple footnote links', () => {
                const html =
                    'A <a href="#foot-1" class="g-footnote-link">(١)</a> B <a href="#foot-2" class="g-footnote-link">(٢)</a> C';
                expect(stripFootnoteLinks(html)).toBe('A (١) B (٢) C');
            });

            it('should handle empty input', () => {
                expect(stripFootnoteLinks('')).toBe('');
            });
        });

        describe('removeFootnoteReferences', () => {
            it('should remove footnote reference spans completely', () => {
                const html =
                    'Text <span class="g-parentheses"><a href="#foot-1" class="g-footnote-link">(١)</a></span> more';
                expect(removeFootnoteReferences(html)).toBe('Text  more');
            });

            it('should handle empty input', () => {
                expect(removeFootnoteReferences('')).toBe('');
            });

            it('should preserve non-footnote parentheses spans', () => {
                const html = 'Text <span class="g-parentheses">(regular)</span> more';
                expect(removeFootnoteReferences(html)).toBe(html);
            });
        });

        describe('extractFootnotes', () => {
            it('should extract footnotes from footer HTML', () => {
                const [, footer] = splitPageFootnotes(sampleHtmlWithFootnotes);
                const footnotes = extractFootnotes(footer);
                expect(footnotes.length).toBeGreaterThan(0);
                expect(footnotes[0]?.number).toBe(1);
            });

            it('should return empty array for empty input', () => {
                expect(extractFootnotes('')).toHaveLength(0);
            });

            it('should return empty array when no footnote targets', () => {
                expect(extractFootnotes('<p>Just some text</p>')).toHaveLength(0);
            });
        });

        describe('pageToMarkdownWithFootnotes', () => {
            it('should include footnotes by default', () => {
                const md = pageToMarkdownWithFootnotes(sampleHtmlWithFootnotes);
                expect(md).toContain('الدَّبَري');
                expect(md).toContain('---');
            });

            it('should exclude footnotes when disabled', () => {
                const md = pageToMarkdownWithFootnotes(sampleHtmlWithFootnotes, { includeFootnotes: false });
                expect(md).toContain('الدَّبَري');
                expect(md).not.toContain('[^1]');
            });

            it('should work with content without footnotes', () => {
                const md = pageToMarkdownWithFootnotes(sampleHtmlWithoutFootnotes);
                expect(md).toContain('المُصَنَّفُ');
                expect(md).not.toContain('---');
            });
        });
    });
});
