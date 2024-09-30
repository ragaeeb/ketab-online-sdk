import fs from 'fs';
import { describe, expect, it } from 'vitest';

import { getBookContents, getBookInfo, getBooks } from '../src/index';

describe('e2e', () => {
    describe('getBookInfo', () => {
        it(
            'should get book information',
            async () => {
                const book = await getBookInfo(41768);

                expect(book).toEqual({
                    authors: [
                        {
                            id: 1869,
                            name: 'حمد الحريقي',
                        },
                    ],
                    bibliography: expect.any(String),
                    categories: [
                        {
                            id: 235,
                            name: 'الرقاق والآداب والأذكار',
                        },
                    ],
                    colors: ['#bf2dd2', '#2d4186'],
                    content_status: 1,
                    created_at: '2019-10-18 22:28:29',
                    description: expect.any(String),
                    downloads: expect.any(Number),
                    files: {
                        data: {
                            size: 10489,
                            url: expect.any(String),
                        },
                    },
                    id: 41768,
                    index: [
                        {
                            id: 4939304,
                            page: 1,
                            page_id: 1,
                            part_name: '1',
                            title: 'رسائل التوبة من التدخين',
                            title_level: 1,
                        },
                    ],
                    index_count: 1,
                    is_active: 1,
                    is_editable: 1,
                    is_free: 1,
                    lang: 'ar',
                    meta: expect.any(Array),
                    pages_count: 8,
                    parts: [
                        {
                            id: 76438,
                            name: '1',
                            page: 1,
                            page_id: 1,
                            pages: 8,
                        },
                    ],
                    parts_count: 1,
                    readers_choice: expect.any(Number),
                    reads: expect.any(Number),
                    ris_url: 'https://s2.ketabonline.com/books/41768/41768.ris',
                    source: 'المكتبة الشاملة الذهبية',
                    title: 'رسائل التوبة من التدخين',
                    updated_at: expect.any(String),
                    views: expect.any(Number),
                });
            },
            { timeout: 5000 },
        );

        it(
            'should handle 404',
            async () => {
                await expect(getBookInfo(10000)).rejects.toThrow('Book 10000 not found');
            },
            { timeout: 5000 },
        );
    });

    describe('getBookContents', () => {
        it('should get the book data', async () => {
            const result = await getBookContents(27018);
            expect(result).toEqual(
                expect.objectContaining({
                    content_status: 1,
                    created_at: '2019-10-16 11:31:39',
                    index: expect.arrayContaining([
                        expect.objectContaining({ id: 4816564, title: 'ترجمة الشيخ مقبل الوادعي' }),
                    ]),
                    source: 'المكتبة الشاملة الذهبية',
                    title: 'ترجمة الشيخ مقبل الوادعي -رحمه الله-',
                }),
            );

            expect(result.pages).toHaveLength(91);
        });
    });

    describe('getBooks', () => {
        it('should get the list of books', async () => {
            const books = await getBooks({ limit: 2, query: 'موسوعة' });
            expect(books).toHaveLength(2);
        });
    });
});
